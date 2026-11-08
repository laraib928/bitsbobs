import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTradeShopData } from '@/lib/data/trade';
import { TradeShopView } from '@/components/trade/TradeShopView';

interface TradeCategoryPageProps {
  params: {
    category: string;
  };
  searchParams: {
    q?: string;
  };
}

export async function generateMetadata({
  params,
}: TradeCategoryPageProps): Promise<Metadata> {
  const shopData = await getTradeShopData(params.category);
  const category = shopData.currentCategory;
  if (!category) {
    return {
      title: 'Trade Category Not Found',
    };
  }

  return {
    title: `${category.name} (Trade) | Bits N Bobs`,
    description: `Trade packs for ${category.name}. Wholesale pricing and fast reordering.`,
  };
}

export default async function TradeCategoryPage({
  params,
  searchParams,
}: TradeCategoryPageProps) {
  const shopData = await getTradeShopData(params.category);

  if (!shopData.currentCategory) {
    notFound();
  }

  return (
    <TradeShopView
      initialData={shopData}
      initialQuery={searchParams.q || ''}
      mode="trade"
    />
  );
}

