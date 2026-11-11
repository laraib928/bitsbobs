'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RetailerOrder } from '@/lib/data/trade-account';
import { useCartStore } from '@/lib/cart/store';

interface RetailerOrderDetailViewProps {
  order: RetailerOrder;
  autoReorder?: boolean;
}

export function RetailerOrderDetailView({
  order,
  autoReorder = false,
}: RetailerOrderDetailViewProps) {
  const router = useRouter();
  const setTradePacks = useCartStore((s) => s.setTradePacks);
  const [isReordering, setIsReordering] = useState(false);

  const handleReorder = () => {
    setIsReordering(true);
    for (const item of order.items) {
      if (item.productId) {
        setTradePacks(
          {
            productId: item.productId,
            name: item.name,
            image: '/images/hair-grips.jpg',
            sku: item.productId.slice(0, 4),
            packPricePence: item.unitPricePence,
            retailPricePence: Math.round(item.unitPricePence * 1.5),
            unitsPerPack: 6,
          },
          item.quantity
        );
      }
    }
    router.push('/trade/checkout');
  };

  React.useEffect(() => {
    if (autoReorder) {
      handleReorder();
    }
  }, [autoReorder]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top back navigation */}
      <div>
        <Link
          href="/trade/account/orders"
          className="inline-flex items-center gap-1.5 text-[14px] font-bold text-brand-navy hover:text-brand-red no-underline transition-colors"
        >
          ← Back to previous orders
        </Link>
      </div>

      {/* Header card with order summary */}
      <div className="bg-white border border-line rounded-[20px] p-6 sm:p-7 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="m-0 text-[28px] sm:text-[34px] font-extrabold font-stretch-112 text-navy-deep tracking-[-0.01em]">
              Order {order.orderNumberFormatted}
            </h1>
            <span
              style={{
                backgroundColor: order.statusBg,
                color: order.statusFg,
              }}
              className="text-[13px] font-bold px-3 py-1 rounded-full"
            >
              {order.statusLabel}
            </span>
          </div>
          <p className="mt-1 mb-0 text-[14px] sm:text-[15px] text-muted">
            Placed on {order.dateFormatted} • {order.itemsDescription}
          </p>
        </div>

        {/* Top actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="h-11 px-5 rounded-full border border-line bg-surface hover:bg-white text-ink text-[14px] font-bold cursor-pointer transition-colors flex items-center gap-2"
          >
            <span>🖨️</span>
            <span>Print invoice</span>
          </button>
          <button
            type="button"
            onClick={handleReorder}
            disabled={isReordering}
            className="h-11 px-6 rounded-full bg-brand-red hover:bg-[#c9000b] text-white text-[14px] font-extrabold border-0 cursor-pointer shadow-sm transition-colors"
          >
            {isReordering ? 'Adding to basket...' : 'Reorder items'}
          </button>
        </div>
      </div>

      {/* Order Items Table */}
      <div className="bg-white border border-line rounded-[20px] p-6 sm:p-7 shadow-sm flex flex-col gap-4">
        <h2 className="m-0 text-[20px] font-extrabold text-navy-deep">
          Items in this order
        </h2>

        <div className="overflow-x-auto -mx-6 sm:-mx-7 px-6 sm:px-7">
          <table className="w-full border-collapse text-[15px]">
            <thead>
              <tr className="border-b border-line text-left text-muted font-semibold text-[13px] uppercase tracking-wider">
                <th scope="col" className="p-3 pl-0">
                  Product
                </th>
                <th scope="col" className="p-3 text-center whitespace-nowrap">
                  Packs
                </th>
                <th scope="col" className="p-3 text-right whitespace-nowrap">
                  Price per pack
                </th>
                <th scope="col" className="p-3 text-right whitespace-nowrap">
                  Line total (ex VAT)
                </th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-[#EEEFF4]">
                  <td className="p-3 pl-0 font-bold text-ink">
                    {item.name}
                  </td>
                  <td className="p-3 text-center font-semibold text-text-2">
                    {item.quantity}
                  </td>
                  <td className="p-3 text-right text-text-2 whitespace-nowrap">
                    {item.unitPriceFormatted}
                  </td>
                  <td className="p-3 text-right font-bold text-navy-deep whitespace-nowrap">
                    {item.lineTotalFormatted}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pricing Summary */}
        <div className="pt-4 border-t border-line flex justify-end">
          <div className="w-full sm:w-[320px] flex flex-col gap-2 text-[15px]">
            <div className="flex justify-between text-text-2">
              <span>Subtotal (ex VAT):</span>
              <span className="font-semibold text-ink">{order.subtotalFormatted}</span>
            </div>
            <div className="flex justify-between text-text-2">
              <span>Delivery:</span>
              <span className="font-semibold text-ink">{order.deliveryFormatted}</span>
            </div>
            <div className="flex justify-between text-text-2">
              <span>VAT (20%):</span>
              <span className="font-semibold text-ink">{order.vatFormatted}</span>
            </div>
            <div className="pt-2 border-t border-line flex justify-between text-[18px] font-extrabold text-navy-deep">
              <span>Total:</span>
              <span>{order.totalFormatted}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Addresses and Delivery Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-line rounded-[20px] p-6 shadow-sm flex flex-col gap-2">
          <h3 className="m-0 text-[18px] font-bold text-navy-deep">
            Delivery address
          </h3>
          <p className="m-0 text-[15px] leading-relaxed text-text-2">
            {order.deliveryAddressFormatted || 'Not recorded'}
          </p>
        </div>

        <div className="bg-white border border-line rounded-[20px] p-6 shadow-sm flex flex-col gap-2">
          <h3 className="m-0 text-[18px] font-bold text-navy-deep">
            Billing address
          </h3>
          <p className="m-0 text-[15px] leading-relaxed text-text-2">
            {order.billingAddressFormatted || order.deliveryAddressFormatted || 'Not recorded'}
          </p>
        </div>
      </div>
    </div>
  );
}

