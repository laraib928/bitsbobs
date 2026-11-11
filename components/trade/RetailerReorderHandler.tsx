'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RetailerOrder } from '@/lib/data/trade-account';
import { useCartStore } from '@/lib/cart/store';

interface RetailerReorderHandlerProps {
  lastOrder: RetailerOrder | null;
}

export function RetailerReorderHandler({
  lastOrder,
}: RetailerReorderHandlerProps) {
  const router = useRouter();
  const setTradePacks = useCartStore((s) => s.setTradePacks);
  const [statusText, setStatusText] = useState('Adding items to basket...');

  useEffect(() => {
    if (!lastOrder || !lastOrder.items || lastOrder.items.length === 0) {
      return;
    }

    setStatusText(`Reordering ${lastOrder.items.length} product lines...`);

    // Add items from the last order into the trade cart
    for (const item of lastOrder.items) {
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

    // Redirect to basket / trade checkout
    const timer = setTimeout(() => {
      router.push('/trade/checkout');
    }, 400);

    return () => clearTimeout(timer);
  }, [lastOrder, router, setTradePacks]);

  if (!lastOrder) {
    return (
      <div className="bg-white border border-line rounded-[20px] p-8 sm:p-12 shadow-sm text-center flex flex-col items-center justify-center gap-4">
        <span className="text-4xl">📦</span>
        <h1 className="m-0 text-[26px] sm:text-[32px] font-extrabold font-stretch-112 text-navy-deep">
          No previous orders to reorder
        </h1>
        <p className="m-0 text-[15px] sm:text-[16px] text-muted max-w-md">
          You haven&apos;t placed any trade orders yet. Explore our wholesale catalog to choose products for your store.
        </p>
        <Link
          href="/trade/shop"
          className="mt-2 inline-flex items-center h-12 px-7 rounded-full bg-brand-navy hover:bg-[#251c68] text-white no-underline font-bold text-[15px] transition-colors"
        >
          Explore trade shop
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white border border-line rounded-[20px] p-8 sm:p-12 shadow-sm text-center flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 rounded-full border-4 border-brand-navy border-t-transparent animate-spin" />
      <h2 className="m-0 text-[22px] font-bold text-navy-deep">
        {statusText}
      </h2>
      <p className="m-0 text-[14px] text-muted">
        Opening your trade basket now...
      </p>
    </div>
  );
}

