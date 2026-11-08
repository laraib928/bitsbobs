import React from 'react';
import Link from 'next/link';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { formatMoney } from '@/lib/money';
import { ClearCartOnSuccess } from '@/components/checkout/ClearCartOnSuccess';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: {
    payment_intent?: string;
    payment_intent_client_secret?: string;
    redirect_status?: string;
  };
}

export default async function OrderSuccessPage({ searchParams }: PageProps) {
  const paymentIntentId = searchParams.payment_intent;

  if (!paymentIntentId) {
    return (
      <main className="max-w-[800px] mx-auto px-6 py-16 text-center">
        <h1 className="text-3xl font-extrabold text-navy-deep">Order Information</h1>
        <p className="mt-4 text-text-2">
          No payment information was provided. If you believe this is an error, please check your basket.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center h-12 px-6 rounded-full bg-brand-red text-white font-bold hover:bg-[#c9000b] transition-colors"
        >
          Return to Shop
        </Link>
      </main>
    );
  }

  let paymentIntent: any = null;
  try {
    paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (err) {
    console.error('Error retrieving PaymentIntent:', err);
  }

  const intentStatus = paymentIntent?.status || searchParams.redirect_status;

  // Retrieve Order from Supabase
  let { data: order } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .maybeSingle();

  if (!order && paymentIntent?.metadata?.order_id) {
    const { data: fallbackOrder } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', paymentIntent.metadata.order_id)
      .maybeSingle();
    order = fallbackOrder;
  }

  const isTrade =
    order?.order_type === 'trade' ||
    order?.channel === 'trade' ||
    paymentIntent?.metadata?.order_type === 'trade';

  let orderItems: any[] = [];
  if (order?.id) {
    // If payment succeeded, ensure order status is marked paid (backup to webhook)
    if (intentStatus === 'succeeded' && order.status !== 'paid') {
      await supabaseAdmin
        .from('orders')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          stripe_payment_intent_id: paymentIntentId,
        })
        .eq('id', order.id);

      await supabaseAdmin.rpc('decrement_stock', { order_id: order.id });
      order.status = 'paid';
    }

    const { data: items } = await supabaseAdmin
      .from('order_items')
      .select('*')
      .eq('order_id', order.id);
    orderItems = items || [];
  }

  // 1. PAYMENT FAILED STATE
  if (
    intentStatus === 'requires_payment_method' ||
    intentStatus === 'canceled' ||
    order?.status === 'failed'
  ) {
    const errorMsg =
      paymentIntent?.last_payment_error?.message ||
      'Your payment could not be processed. Please check your card details and try again.';

    return (
      <main className="max-w-[700px] mx-auto px-6 py-16 text-center flex flex-col items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-brand-red/10 text-brand-red flex items-center justify-center text-3xl font-extrabold">
          ✕
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-deep m-0">
          Payment failed
        </h1>
        <p className="text-text-2 text-lg max-w-md m-0">
          {errorMsg}
        </p>
        <div className="flex gap-4 mt-2">
          <Link
            href={isTrade ? '/trade/checkout' : '/checkout'}
            className="inline-flex items-center h-12 px-8 rounded-full bg-brand-red text-white font-extrabold hover:bg-[#c9000b] transition-colors"
          >
            Try again
          </Link>
          <Link
            href={isTrade ? '/trade/shop' : '/shop'}
            className="inline-flex items-center h-12 px-6 rounded-full border border-line text-navy-deep font-bold hover:bg-surface transition-colors"
          >
            Return to {isTrade ? 'trade shop' : 'shop'}
          </Link>
        </div>
      </main>
    );
  }

  // 2. PAYMENT PROCESSING STATE
  if (intentStatus === 'processing') {
    return (
      <main className="max-w-[700px] mx-auto px-6 py-16 text-center flex flex-col items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-3xl font-extrabold">
          ⏳
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-deep m-0">
          Payment processing...
        </h1>
        <p className="text-text-2 text-lg max-w-md m-0">
          We have received your payment instruction and are waiting for confirmation from your bank.
          We will email your confirmation as soon as it clears.
        </p>
        <Link
          href={isTrade ? '/trade/account' : '/'}
          className="mt-4 inline-flex items-center h-12 px-8 rounded-full bg-brand-navy text-white font-extrabold hover:bg-navy-deep transition-colors"
        >
          {isTrade ? 'Go to Retailer Account' : 'Return to home page'}
        </Link>
      </main>
    );
  }

  // 3. PAYMENT SUCCEEDED STATE
  const orderNumber =
    order?.order_number != null
      ? `#${order.order_number}`
      : order?.id
      ? `#${order.id.slice(0, 8)}`
      : `#${paymentIntentId.slice(-8)}`;

  const recipientName = order?.full_name || order?.contact_name || (isTrade ? 'Retailer' : 'Customer');
  const subtotalPence = order?.subtotal ?? order?.subtotal_pence ?? paymentIntent?.amount ?? 0;
  const deliveryFeePence = order?.delivery_fee ?? order?.delivery_pence ?? 0;
  const totalPaidPence = order?.total ?? order?.total_pence ?? paymentIntent?.amount ?? 0;

  return (
    <div className="bg-surface w-full min-h-[calc(100vh-140px)]">
      {/* Clear basket state in browser (trade or retail) */}
      <ClearCartOnSuccess orderType={isTrade ? 'trade' : 'retail'} />

      <main className="max-w-[800px] mx-auto px-6 py-12 flex flex-col items-center text-center gap-6">
        <div className="w-20 h-20 rounded-full bg-success text-white flex items-center justify-center text-3xl font-black shadow-sm">
          ✓
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold uppercase tracking-wider text-success">
            {isTrade ? 'Trade Order Confirmed' : 'Order Confirmed'}
          </span>
          <h1 className="text-[36px] sm:text-[44px] font-extrabold text-navy-deep m-0">
            Payment successful!
          </h1>
          <p className="text-[17px] text-text-2 max-w-lg mx-auto m-0 leading-relaxed">
            Thank you, <strong>{recipientName}</strong>. Your {isTrade ? 'trade order' : 'order'} has been placed successfully.
            {order?.email ? ` We sent a confirmation receipt to ${order.email}.` : ''}
          </p>
        </div>

        <div className="w-full bg-white border border-line rounded-[20px] p-6 sm:p-8 text-left shadow-sm flex flex-col gap-6">
          <div className="flex flex-wrap justify-between items-baseline border-b border-line pb-4 gap-2">
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-muted m-0">
                {isTrade ? 'Trade Order number' : 'Order number'}
              </p>
              <p className="text-2xl font-black text-navy-deep m-0">{orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider font-bold text-muted m-0">Status</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700">
                Paid
              </span>
            </div>
          </div>

          {/* Purchased Items */}
          <div>
            <h2 className="text-base font-bold text-ink mb-3 m-0">
              {isTrade ? 'Packs & Items ordered' : 'Items ordered'}
            </h2>
            {orderItems.length > 0 ? (
              <div className="divide-y divide-line border-t border-b border-line">
                {orderItems.map((item: any) => {
                  const name = item.product_name || item.name_snapshot || 'Item';
                  const unitPrice = item.unit_price ?? item.unit_price_pence ?? 0;
                  const lineTotal =
                    item.line_total ??
                    item.line_total_pence ??
                    unitPrice * item.quantity;

                  return (
                    <div
                      key={item.id}
                      className="py-3 flex justify-between items-center text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-navy-deep">
                          {item.quantity}×
                        </span>
                        <span className="font-medium text-ink">{name}</span>
                        {isTrade && item.product_id && (
                          <span className="text-xs text-muted font-normal">
                            (packs)
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-ink">
                        {formatMoney(lineTotal, { allowPenceOnly: true })}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted m-0 py-2">
                Order details confirmed with reference {orderNumber}.
              </p>
            )}
          </div>

          {/* Delivery Address */}
          {(order?.address || order?.delivery_address) && (
            <div className="border-t border-line pt-4">
              <h2 className="text-base font-bold text-ink mb-2 m-0">Delivery address</h2>
              <p className="text-sm text-text-2 m-0 leading-relaxed">
                {order?.full_name || order?.contact_name}
                <br />
                {order?.address || (order?.delivery_address as any)?.line1}
                {order?.city || (order?.delivery_address as any)?.town
                  ? `, ${order?.city || (order?.delivery_address as any)?.town}`
                  : ''}
                {order?.postcode || (order?.delivery_address as any)?.postcode
                  ? `, ${order?.postcode || (order?.delivery_address as any)?.postcode}`
                  : ''}
              </p>
            </div>
          )}

          {/* Financial Breakdown */}
          <div className="border-t border-line pt-4 flex flex-col gap-2 text-sm">
            <div className="flex justify-between text-muted">
              <span>{isTrade ? 'Subtotal (ex VAT)' : 'Subtotal'}</span>
              <span className="font-medium text-ink">
                {formatMoney(subtotalPence, { allowPenceOnly: true })}
              </span>
            </div>
            {isTrade && order?.vat_pence ? (
              <div className="flex justify-between text-muted">
                <span>VAT (20%)</span>
                <span className="font-medium text-ink">
                  {formatMoney(order.vat_pence, { allowPenceOnly: true })}
                </span>
              </div>
            ) : null}
            <div className="flex justify-between text-muted">
              <span>Delivery</span>
              <span className="font-medium text-ink">
                {deliveryFeePence === 0 ? (
                  <strong className="text-success font-bold">FREE</strong>
                ) : (
                  formatMoney(deliveryFeePence, { allowPenceOnly: true })
                )}
              </span>
            </div>
            <div className="flex justify-between items-center text-base font-extrabold text-navy-deep pt-2 border-t border-line">
              <span>Total paid</span>
              <span className="text-xl font-black text-navy-deep">
                {formatMoney(totalPaidPence, { allowPenceOnly: true })}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Trade vs Retail */}
        {isTrade ? (
          <div className="flex flex-wrap gap-4 justify-center mt-2">
            <Link
              href="/trade/account"
              className="inline-flex items-center justify-center h-[54px] px-8 rounded-full bg-brand-navy text-white font-extrabold text-[16px] no-underline hover:bg-navy-deep transition-colors shadow-md"
            >
              View in Retailer Account →
            </Link>
            <Link
              href="/trade/shop"
              className="inline-flex items-center justify-center h-[54px] px-8 rounded-full bg-brand-red text-white font-extrabold text-[16px] no-underline hover:bg-[#c9000b] transition-colors shadow-md"
            >
              Back to Trade Shop
            </Link>
          </div>
        ) : (
          <Link
            href="/shop"
            className="mt-2 inline-flex items-center justify-center h-[54px] px-8 rounded-full bg-brand-red text-white font-extrabold text-[16px] no-underline hover:bg-[#c9000b] transition-colors shadow-md"
          >
            Continue shopping
          </Link>
        )}
      </main>
    </div>
  );
}
