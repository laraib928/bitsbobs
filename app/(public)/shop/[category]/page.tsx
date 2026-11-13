import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPublicShopData } from '@/lib/data/trade';
import { TradeShopView } from '@/components/trade/TradeShopView';

interface CategoryPageProps {
  params: {
    category: string;
  };
  searchParams: {
    q?: string;
  };
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const shopData = await getPublicShopData(params.category);
  const category = shopData.currentCategory;
  if (!category || category.slug === 'all') {
    return {
      title: 'Category Not Found | Bits N Bobs',
    };
  }

  return {
    title: `${category.name} | Bits N Bobs`,
    description: `Shop Bits N Bobs ${category.name} range. Handy, pre-packed everyday items delivered to your door. All items priced with VAT included.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const shopData = await getPublicShopData(params.category);

  if (!shopData.currentCategory || shopData.currentCategory.slug === 'all') {
    notFound();
  }

  return (
    <TradeShopView
      initialData={shopData}
      initialQuery={searchParams.q || ''}
      mode="retail"
    />
  );
}
