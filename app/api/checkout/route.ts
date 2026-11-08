import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createClient as createServerUserClient } from '@/lib/supabase/server';
import { getDeliveryFee, getTradeDeliveryFee } from '@/lib/delivery';

const ukPostcodeRegex = /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i;

const checkoutItemSchema = z
  .object({
    productId: z.string().optional(),
    standId: z.string().optional(),
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  })
  .refine((item) => Boolean(item.productId || item.standId), {
    message: 'Every item must have a productId or standId',
  });

const checkoutSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'Town or city must be at least 2 characters'),
  postcode: z.string().regex(ukPostcodeRegex, 'Please enter a valid UK postcode'),
  billingSame: z.boolean().default(true),
  items: z.array(checkoutItemSchema).min(1, 'Cart cannot be empty'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => i.message).join(', ');
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const {
      email,
      fullName,
      phone,
      address,
      city,
      postcode,
      billingSame,
      items,
    } = parsed.data;

    // Detect trade session strictly from server-side cookies
    let userId: string | null = null;
    let isTrade = false;
    let userProfile: any = null;

    try {
      const userClient = await createServerUserClient();
      const { data: authData } = await userClient.auth.getUser();
      if (authData?.user?.id) {
        userId = authData.user.id;
        const { data: prof } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (prof && prof.role === 'trade') {
          isTrade = true;
          userProfile = prof;
        }
      }
    } catch (authErr) {
      console.warn('Could not verify server auth session:', authErr);
      userId = null;
      isTrade = false;
    }

    // Legacy mock ID resolution
    const legacyIdMap: Record<string, string> = {
      'p-hair-grips': 'b0000000-0000-0000-0000-000000000001',
      'p-birthday-candles': 'b0000000-0000-0000-0000-000000000004',
      'p-nit-comb': 'b0000000-0000-0000-0000-000000000002',
      'p-nail-scissors': 'b0000000-0000-0000-0000-000000000003',
    };

    const resolvedItems = items.map((i) => ({
      ...i,
      productId: i.productId ? legacyIdMap[i.productId] || i.productId : undefined,
    }));

    const productItems = resolvedItems.filter((i) => Boolean(i.productId));
    const standItems = resolvedItems.filter((i) => Boolean(i.standId));

    const productIds = Array.from(
      new Set(productItems.map((i) => i.productId!))
    );
    const standIds = Array.from(new Set(standItems.map((i) => i.standId!)));

    let subtotal = 0;
    let vatPence = 0;
    let deliveryFee = 0;
    let total = 0;

    const orderItemsToInsert: Array<{
      productId?: string | null;
      standId?: string | null;
      productName: string;
      unitPrice: number;
      quantity: number;
      lineTotal: number;
    }> = [];

    // =========================================================================
    // 1. PROCESS PRODUCTS (TRADE OR RETAIL)
    // =========================================================================
    if (productIds.length > 0) {
      const { data: products, error: prodError } = await supabaseAdmin
        .from('products')
        .select(`
          id,
          name,
          retail_price_pence,
          is_active,
          product_trade_prices (
            wholesale_pack_price_pence,
            units_per_pack,
            min_packs
          )
        `)
        .in('id', productIds);

      if (prodError || !products) {
        console.error('Error fetching products:', prodError);
        return NextResponse.json(
          { error: 'Unable to retrieve cart products. Please try again.' },
          { status: 500 }
        );
      }

      const productMap = new Map(products.map((p) => [p.id, p]));

      // Verify products exist and are active
      for (const item of productItems) {
        const p = productMap.get(item.productId!);
        if (!p) {
          return NextResponse.json(
            { error: `One or more products in your basket could not be found.` },
            { status: 400 }
          );
        }
        if (p.is_active === false) {
          return NextResponse.json(
            { error: `Product "${p.name}" is no longer available.` },
            { status: 400 }
          );
        }
      }

      // Check stock
      const { data: stockRows, error: stockError } = await supabaseAdmin
        .from('stock')
        .select('product_id, packs_in_stock')
        .in('product_id', productIds);

      if (stockError) {
        console.error('Error checking stock levels:', stockError);
        return NextResponse.json(
          { error: 'Unable to verify product stock. Please try again.' },
          { status: 500 }
        );
      }

      const stockMap = new Map(
        stockRows?.map((s) => [s.product_id, s.packs_in_stock ?? 0]) ?? []
      );

      for (const item of productItems) {
        const p = productMap.get(item.productId!)!;
        const availablePacks = stockMap.get(item.productId!) ?? 0;

        // Trade vs Retail MOQ & Stock checking
        if (isTrade) {
          const tradePrices = (p.product_trade_prices as any)?.[0] || (p.product_trade_prices as any);
          const minPacks = tradePrices?.min_packs || 1;
          if (item.quantity < minPacks) {
            return NextResponse.json(
              {
                error: `Minimum order for "${p.name}" is ${minPacks} ${
                  minPacks === 1 ? 'pack' : 'packs'
                }.`,
              },
              { status: 400 }
            );
          }

          if (availablePacks < item.quantity) {
            return NextResponse.json(
              { error: `Product "${p.name}" is out of stock (only ${availablePacks} packs available).` },
              { status: 400 }
            );
          }

          const unitPrice = tradePrices?.wholesale_pack_price_pence || 332;
          const lineTotal = unitPrice * item.quantity;
          subtotal += lineTotal;
          orderItemsToInsert.push({
            productId: p.id,
            productName: p.name,
            unitPrice,
            quantity: item.quantity,
            lineTotal,
          });
        } else {
          // Retail rules
          if (availablePacks < item.quantity) {
            return NextResponse.json(
              { error: `Product "${p.name}" is out of stock` },
              { status: 400 }
            );
          }

          const unitPrice = p.retail_price_pence;
          const lineTotal = unitPrice * item.quantity;
          subtotal += lineTotal;
          orderItemsToInsert.push({
            productId: p.id,
            productName: p.name,
            unitPrice,
            quantity: item.quantity,
            lineTotal,
          });
        }
      }
    }

    // =========================================================================
    // 2. PROCESS DISPLAY STANDS (TRADE ONLY)
    // =========================================================================
    if (standIds.length > 0) {
      if (!isTrade) {
        return NextResponse.json(
          { error: 'Display stands are only available for trade accounts.' },
          { status: 400 }
        );
      }

      const { data: stands, error: standError } = await supabaseAdmin
        .from('stands')
        .select('id, name, fixed_price_pence, is_active')
        .in('id', standIds);

      if (standError || !stands) {
        console.error('Error fetching stands:', standError);
        return NextResponse.json(
          { error: 'Unable to retrieve display stands. Please try again.' },
          { status: 500 }
        );
      }

      const standMap = new Map(stands.map((s) => [s.id, s]));

      for (const item of standItems) {
        const stand = standMap.get(item.standId!);
        if (!stand || stand.is_active === false) {
          return NextResponse.json(
            { error: 'One or more display stands are unavailable.' },
            { status: 400 }
          );
        }

        const unitPrice = stand.fixed_price_pence || 0;
        const lineTotal = unitPrice * item.quantity;
        subtotal += lineTotal;
        orderItemsToInsert.push({
          standId: stand.id,
          productName: stand.name,
          unitPrice,
          quantity: item.quantity,
          lineTotal,
        });
      }
    }

    // =========================================================================
    // 3. FINANCIAL CALCULATIONS (DELIVERY, VAT, TOTAL)
    // =========================================================================
    if (isTrade) {
      // Trade pricing logic:
      // Subtotal is ex VAT. Delivery is free over £150 ex VAT, otherwise £4.99.
      // VAT is 20% on the subtotal.
      deliveryFee = getTradeDeliveryFee(subtotal);
      vatPence = Math.round(subtotal * 0.2);
      total = subtotal + deliveryFee + vatPence;
    } else {
      // Retail pricing logic:
      // Prices are VAT inclusive. Delivery is free over £50, otherwise flat £3.99.
      deliveryFee = getDeliveryFee(subtotal);
      vatPence = Math.round(subtotal * 0.2);
      total = subtotal + deliveryFee;
    }

    // =========================================================================
    // 4. STRIPE CUSTOMER MANAGEMENT (TRADE USERS)
    // =========================================================================
    let stripeCustomerId: string | undefined = undefined;

    if (isTrade && userProfile) {
      if (userProfile.stripe_customer_id) {
        stripeCustomerId = userProfile.stripe_customer_id;
      } else {
        try {
          const customer = await stripe.customers.create({
            email: email.trim(),
            name: fullName.trim(),
            phone: phone ? phone.trim() : undefined,
            metadata: {
              user_id: userProfile.id,
              business_name: userProfile.business_name || '',
            },
          });
          stripeCustomerId = customer.id;

          await supabaseAdmin
            .from('profiles')
            .update({ stripe_customer_id: customer.id })
            .eq('id', userProfile.id);
        } catch (custErr) {
          console.warn('Could not create Stripe customer:', custErr);
        }
      }
    }

    // =========================================================================
    // 5. INSERT PENDING ORDER INTO SUPABASE
    // =========================================================================
    const orderInsertPayload: any = {
      email,
      full_name: fullName,
      phone: phone || '',
      address,
      city,
      postcode: postcode.toUpperCase(),
      billing_same: billingSame,
      subtotal,
      delivery_fee: deliveryFee,
      total,
      currency: 'gbp',
      status: 'pending_payment',
      user_id: userId,
      order_type: isTrade ? 'trade' : 'retail',
      channel: isTrade ? 'trade' : 'public',
      contact_name: fullName,
      delivery_address: {
        line1: address,
        town: city,
        postcode: postcode.toUpperCase(),
      },
      billing_address: {
        line1: address,
        town: city,
        postcode: postcode.toUpperCase(),
      },
      subtotal_pence: subtotal,
      delivery_pence: deliveryFee,
      vat_pence: vatPence,
      total_pence: total,
    };

    // Attempt insert with schema adaptation (handles pending vs pending_payment and missing order_type column)
    let workingPayload = { ...orderInsertPayload };
    let { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert(workingPayload)
      .select('id, order_number')
      .single();

    // If order_type column doesn't exist yet in Supabase (PGRST204)
    if (
      orderError &&
      (orderError.code === 'PGRST204' || orderError.message?.includes('order_type'))
    ) {
      delete workingPayload.order_type;
      const retryWithoutOrderType = await supabaseAdmin
        .from('orders')
        .insert(workingPayload)
        .select('id, order_number')
        .single();
      order = retryWithoutOrderType.data;
      orderError = retryWithoutOrderType.error;
    }

    // If enum order_status fails (e.g. requires 'pending' vs 'pending_payment')
    if (
      orderError &&
      (orderError.code === '22P02' || orderError.message?.includes('order_status'))
    ) {
      workingPayload.status =
        workingPayload.status === 'pending_payment' ? 'pending' : 'pending_payment';
      const retryWithAltStatus = await supabaseAdmin
        .from('orders')
        .insert(workingPayload)
        .select('id, order_number')
        .single();
      order = retryWithAltStatus.data;
      orderError = retryWithAltStatus.error;
    }

    if (orderError || !order) {
      console.error('Failed to create order:', orderError);
      return NextResponse.json(
        {
          error:
            process.env.NODE_ENV === 'development'
              ? `Failed to create order: ${orderError?.message || 'Unknown database error'}`
              : 'Failed to create your order. Please try again.',
        },
        { status: 500 }
      );
    }

    // =========================================================================
    // 6. INSERT ORDER ITEMS
    // =========================================================================
    const itemsPayload = orderItemsToInsert.map((item) => ({
      order_id: order.id,
      product_id: item.productId || null,
      stand_id: item.standId || null,
      product_name: item.productName,
      name_snapshot: item.productName,
      unit_price: item.unitPrice,
      unit_price_pence: item.unitPrice,
      quantity: item.quantity,
      line_total: item.lineTotal,
      line_total_pence: item.lineTotal,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(itemsPayload);

    if (itemsError) {
      console.error('Failed to create order items:', itemsError);
      return NextResponse.json(
        { error: 'Failed to record order items. Please contact support.' },
        { status: 500 }
      );
    }

    // =========================================================================
    // 7. CREATE STRIPE PAYMENT INTENT
    // =========================================================================
    const orderNumberStr = order.order_number
      ? `#${order.order_number}`
      : `#${order.id.slice(0, 8)}`;

    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: total,
      currency: 'gbp',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        order_id: order.id,
        order_type: isTrade ? 'trade' : 'retail',
      },
      description: isTrade
        ? `Bits N Bobs trade order ${orderNumberStr}`
        : `Bits N Bobs order ${orderNumberStr}`,
    };

    if (stripeCustomerId) {
      paymentIntentParams.customer = stripeCustomerId;
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

    if (!paymentIntent.client_secret) {
      throw new Error('Failed to generate payment intent client secret');
    }

    // Update order with payment intent ID
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ stripe_payment_intent_id: paymentIntent.id })
      .eq('id', order.id);

    if (updateError) {
      console.warn('Could not store stripe_payment_intent_id immediately:', updateError);
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
      subtotal,
      vatPence,
      deliveryFee,
      total,
      orderType: isTrade ? 'trade' : 'retail',
    });
  } catch (err: any) {
    console.error('Checkout API error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error during checkout' },
      { status: 500 }
    );
  }
}
