import React from 'react';
import type { Metadata } from 'next';
import { getPublicShopData } from '@/lib/data/trade';
import { TradeShopView } from '@/components/trade/TradeShopView';

export const metadata: Metadata = {
  title: 'All Products | Bits N Bobs',
  description:
    'Browse the full Bits N Bobs convenience catalogue: cosmetics, household, hair care, party, kitchenware, and DIY essentials. All items priced with VAT included.',
};

interface ProductsPageProps {
  searchParams: {
    q?: string;
    category?: string;
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const shopData = await getPublicShopData(searchParams.category || 'all');

  return (
    <TradeShopView
      initialData={shopData}
      initialQuery={searchParams.q || ''}
      mode="retail"
    />
  );
}

