import React from 'react';
import type { Metadata } from 'next';
import { getRetailerAccountData } from '@/lib/data/trade-account';
import { RetailerPromotionsView } from '@/components/trade/RetailerPromotionsView';

export const metadata: Metadata = {
  title: 'Trade Promotions | Trade Account | Bits N Bobs',
  description: 'View active trade promotions and multibuy offers.',
};

export const dynamic = 'force-dynamic';

export default async function TradePromotionsPage() {
  const { activePromotions } = await getRetailerAccountData();

  return <RetailerPromotionsView promotions={activePromotions} />;
}

