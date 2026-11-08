'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useToast } from './ToastContext';
import { updateOrderStatusAction } from '@/lib/actions/admin';
import { formatMoney } from '@/lib/money';
import type { Database } from '@/lib/supabase/database.types';

type OrderStatus = Database['public']['Enums']['order_status'];

interface AdminOrderDetailClientProps {
  order: any;
}

export function AdminOrderDetailClient({ order }: AdminOrderDetailClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(order.status);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setIsUpdating(true);
    const result = await updateOrderStatusAction(order.id, newStatus);
    setIsUpdating(false);

    if (result.success) {
      setCurrentStatus(newStatus);
      showToast('success', `Order #${order.order_number} status updated to ${newStatus}`);
      router.refresh();
    } else {
      showToast('error', result.error || 'Failed to update order status');
    }
  };

  const deliveryAddress = order.delivery_address || {};
  const billingAddress = order.billing_address || deliveryAddress;

  const statusColors: Record<string, { bg: string; text: string }> = {
    pending_payment: { bg: '#FEF7E0', text: '#B06000' },
    paid: { bg: '#E8E6F7', text: '#312682' },
    packing: { bg: '#FEF7E0', text: '#B06000' },
    dispatched: { bg: '#E6F4EA', text: '#137333' },
    delivered: { bg: '#F1F3F4', text: '#3C4043' },
    cancelled: { bg: '#FCE8E6', text: '#C5221F' },
    refunded: { bg: '#FCE8E6', text: '#C5221F' },
  };

  const currentTheme = statusColors[currentStatus] || { bg: '#E8E6F7', text: '#312682' };

  return (
    <div className="p-5 sm:p-8 pb-16 flex flex-col gap-6 max-w-[1200px] mx-auto">
      {/* Back Link & Header */}
      <div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-muted hover:text-navy-deep no-underline mb-3"
        >
          ← Back to orders
        </Link>

        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="m-0 text-[30px] sm:text-[34px] font-extrabold font-stretch-110 text-navy-deep">
                Order #{order.order_number}
              </h1>
              <span
                style={{ backgroundColor: currentTheme.bg, color: currentTheme.text }}
                className="text-[12px] font-bold px-3 py-1 rounded-full uppercase tracking-wider"
              >
                {currentStatus.replace('_', ' ')}
              </span>
              <span
                className={`text-[12px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                  order.channel === 'trade' ? 'bg-[#E8E6F7] text-[#312682]' : 'bg-[#FDE6E8] text-[#9E0010]'
                }`}
              >
                {order.channel}
              </span>
            </div>
            <p className="mt-1 mb-0 text-[14px] text-muted">
              Placed on {new Date(order.created_at).toLocaleString('en-GB')}
            </p>
          </div>

          {/* Quick Status Changer */}
          <div className="flex items-center gap-2 bg-white border border-line rounded-xl p-1.5 shadow-xs">
            <span className="text-[12px] text-muted font-bold pl-2 pr-1">Change status:</span>
            <select
              value={currentStatus}
              disabled={isUpdating}
              onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
              className="h-9 px-3 rounded-lg border border-field-border font-bold text-[13px] text-navy-deep bg-surface outline-none cursor-pointer"
            >
              <option value="pending_payment">Pending payment</option>
              <option value="paid">Paid (to pack)</option>
              <option value="packing">Packing</option>
              <option value="dispatched">Dispatched</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Customer info + Order Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Items & Totals (2 spans) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Order Items Card */}
          <section className="bg-white border border-line rounded-[20px] p-6 shadow-xs flex flex-col gap-4">
            <h2 className="m-0 text-[18px] font-extrabold text-navy-deep">
              Order items ({order.order_items?.length || 0})
            </h2>

            <div className="divide-y divide-[#F1F2F6]">
              {order.order_items?.map((item: any) => {
                const imagePath =
                  item.products?.product_images?.[0]?.path || '/images/hair-grips.jpg';

                return (
                  <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <Image
                        src={imagePath}
                        alt=""
                        width={48}
                        height={48}
                        className="w-12 h-12 object-contain rounded-lg border border-line p-1 bg-white flex-none"
                      />
                      <div>
                        <strong className="block text-ink font-semibold text-[15px]">
                          {item.name_snapshot}
                        </strong>
                        <span className="text-[13px] text-muted">
                          Qty: <strong>{item.quantity}</strong> × {formatMoney(item.unit_price_pence)}
                        </span>
                      </div>
                    </div>
                    <strong className="text-navy-deep font-extrabold text-[15px]">
                      {formatMoney(item.line_total_pence)}
                    </strong>
                  </div>
                );
              })}
            </div>

            {/* Financial Summary */}
            <div className="border-t border-line pt-4 flex flex-col gap-2 text-[14px]">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span>{formatMoney(order.subtotal_pence)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Delivery carriage</span>
                <span>{order.delivery_pence === 0 ? 'FREE' : formatMoney(order.delivery_pence)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>VAT (20%)</span>
                <span>{formatMoney(order.vat_pence)}</span>
              </div>
              <div className="border-t border-line pt-2 flex justify-between text-[18px] font-extrabold text-navy-deep">
                <span>Total</span>
                <span>{formatMoney(order.total_pence)}</span>
              </div>
            </div>
          </section>

          {/* Payment metadata */}
          <section className="bg-white border border-line rounded-[20px] p-6 shadow-xs flex flex-col gap-3 text-[14px]">
            <h2 className="m-0 text-[17px] font-extrabold text-navy-deep">Payment details</h2>
            <dl className="m-0 grid grid-cols-[140px_1fr] gap-2">
              <dt className="text-muted">Payment Provider</dt>
              <dd className="m-0 text-ink font-semibold">Stripe Checkout</dd>
              {order.stripe_payment_intent_id && (
                <>
                  <dt className="text-muted">Payment Intent</dt>
                  <dd className="m-0 font-mono text-xs text-text-2">{order.stripe_payment_intent_id}</dd>
                </>
              )}
              {order.paid_at && (
                <>
                  <dt className="text-muted">Paid at</dt>
                  <dd className="m-0 text-ink">{new Date(order.paid_at).toLocaleString('en-GB')}</dd>
                </>
              )}
            </dl>
          </section>
        </div>

        {/* Right Column: Customer & Shipping (1 span) */}
        <div className="flex flex-col gap-6">
          {/* Customer Profile Card */}
          <section className="bg-white border border-line rounded-[20px] p-6 shadow-xs flex flex-col gap-3">
            <h2 className="m-0 text-[17px] font-extrabold text-navy-deep">Customer</h2>
            <div className="flex flex-col gap-1 text-[14px]">
              <strong className="text-ink font-bold text-[15px]">{order.contact_name}</strong>
              <a href={`mailto:${order.email}`} className="text-brand-navy hover:underline">
                {order.email}
              </a>
              <span className="text-text-2">{order.phone}</span>
            </div>
          </section>

          {/* Delivery Address */}
          <section className="bg-white border border-line rounded-[20px] p-6 shadow-xs flex flex-col gap-3">
            <h2 className="m-0 text-[17px] font-extrabold text-navy-deep">Delivery address</h2>
            <p className="m-0 text-[14px] text-text-2 leading-relaxed">
              {deliveryAddress.line1 && <span className="block">{deliveryAddress.line1}</span>}
              {deliveryAddress.line2 && <span className="block">{deliveryAddress.line2}</span>}
              {deliveryAddress.town && <span className="block">{deliveryAddress.town}</span>}
              {deliveryAddress.postcode && <strong className="block text-ink">{deliveryAddress.postcode}</strong>}
            </p>
          </section>

          {/* Billing Address */}
          <section className="bg-white border border-line rounded-[20px] p-6 shadow-xs flex flex-col gap-3">
            <h2 className="m-0 text-[17px] font-extrabold text-navy-deep">Billing address</h2>
            <p className="m-0 text-[14px] text-text-2 leading-relaxed">
              {billingAddress.line1 && <span className="block">{billingAddress.line1}</span>}
              {billingAddress.town && <span className="block">{billingAddress.town}</span>}
              {billingAddress.postcode && <strong className="block text-ink">{billingAddress.postcode}</strong>}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

