import React from 'react';
import type { Metadata } from 'next';
import { getTradeShopData } from '@/lib/data/trade';
import { TradeShopView } from '@/components/trade/TradeShopView';

export const metadata: Metadata = {
  title: 'All Products | Trade Shop | Bits N Bobs',
  description:
    'Signed-in retailer trade shop. Wholesale prices on packs of 6, instant margin calculation and free delivery over £150.',
};

interface TradeShopPageProps {
  searchParams: {
    q?: string;
  };
}

export default async function TradeShopPage({
  searchParams,
}: TradeShopPageProps) {
  const shopData = await getTradeShopData('all');

  return (
    <TradeShopView
      initialData={shopData}
      initialQuery={searchParams.q || ''}
      mode="trade"
    />
  );
}

