import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured.');
    return new Response('Webhook secret not configured', { status: 500 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Stripe webhook signature verification failed: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const paymentIntentId = paymentIntent.id;
        const metadataOrderId = paymentIntent.metadata?.order_id;

        // Find the order by stripe_payment_intent_id or metadata order_id
        let orderQuery = supabaseAdmin
          .from('orders')
          .select('id, status')
          .eq('stripe_payment_intent_id', paymentIntentId)
          .maybeSingle();

        let { data: order, error: orderFetchErr } = await orderQuery;

        if (!order && metadataOrderId) {
          const { data: orderById } = await supabaseAdmin
            .from('orders')
            .select('id, status')
            .eq('id', metadataOrderId)
            .maybeSingle();
          order = orderById;
        }

        if (!order) {
          console.warn(
            `Order not found for PaymentIntent ${paymentIntentId} (metadata order_id: ${metadataOrderId})`
          );
          // Return 200 so Stripe doesn't hammer retries for unassociated tests
          return NextResponse.json({ received: true });
        }

        // IDEMPOTENCY CHECK: if already paid, do not decrement stock twice
        if (order.status === 'paid') {
          console.log(
            `Order ${order.id} is already marked as paid. Skipping duplicate processing.`
          );
          return NextResponse.json({ received: true });
        }

        // Mark order as paid
        const { error: updateErr } = await supabaseAdmin
          .from('orders')
          .update({
            status: 'paid',
            paid_at: new Date().toISOString(),
            stripe_payment_intent_id: paymentIntentId,
          })
          .eq('id', order.id);

        if (updateErr) {
          console.error(`Failed to update order status for ${order.id}:`, updateErr);
        }

        // Call RPC decrement_stock to atomically reduce stock
        const { error: rpcErr } = await supabaseAdmin.rpc('decrement_stock', {
          order_id: order.id,
        });

        if (rpcErr) {
          console.error(
            `Error executing decrement_stock for order ${order.id}:`,
            rpcErr
          );
        } else {
          console.log(`Stock successfully decremented for order ${order.id}`);
        }

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const paymentIntentId = paymentIntent.id;
        const metadataOrderId = paymentIntent.metadata?.order_id;
        const failureMessage =
          paymentIntent.last_payment_error?.message || 'Payment intent failed';

        console.warn(
          `PaymentIntent ${paymentIntentId} failed: ${failureMessage}`
        );

        if (metadataOrderId) {
          const { error: failErr } = await supabaseAdmin
            .from('orders')
            .update({ status: 'failed' })
            .eq('id', metadataOrderId);
          if (failErr && (failErr.code === '22P02' || failErr.message?.includes('order_status'))) {
            await supabaseAdmin
              .from('orders')
              .update({ status: 'cancelled' })
              .eq('id', metadataOrderId);
          }
        } else {
          const { error: failErr } = await supabaseAdmin
            .from('orders')
            .update({ status: 'failed' })
            .eq('stripe_payment_intent_id', paymentIntentId);
          if (failErr && (failErr.code === '22P02' || failErr.message?.includes('order_status'))) {
            await supabaseAdmin
              .from('orders')
              .update({ status: 'cancelled' })
              .eq('stripe_payment_intent_id', paymentIntentId);
          }
        }

        break;
      }

      default:
        // Ignore unhandled events
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Error handling webhook event:', err);
    return NextResponse.json(
      { error: 'Webhook handler encountered an error' },
      { status: 500 }
    );
  }
}

