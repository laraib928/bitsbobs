import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { TradeLoginStockistView } from '@/components/trade/TradeLoginStockistView';

export const metadata: Metadata = {
  title: 'Trade Login & Become a Stockist | Bits N Bobs',
  description:
    'Stock Bits N Bobs convenience products in your shop. Wholesale prices on packs of 6, display stands, and free delivery on orders of £150+.',
};

export default function TradeAuthPage() {
  const isLookupConfigured = Boolean(
    process.env.GETADDRESS_API_KEY && process.env.GETADDRESS_API_KEY.trim().length > 0
  );

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center p-8 text-muted">
          Loading trade portal...
        </div>
      }
    >
      <TradeLoginStockistView isLookupConfigured={isLookupConfigured} />
    </Suspense>
  );
}
