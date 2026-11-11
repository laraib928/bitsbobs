import React from 'react';
import type { Metadata } from 'next';
import { getRetailerAccountData } from '@/lib/data/trade-account';
import { RetailerReorderHandler } from '@/components/trade/RetailerReorderHandler';

export const metadata: Metadata = {
  title: 'Reorder | Trade Account | Bits N Bobs',
  description: 'Reorder items from your previous trade order.',
};

export const dynamic = 'force-dynamic';

export default async function TradeReorderPage() {
  const { lastOrder } = await getRetailerAccountData();

  return <RetailerReorderHandler lastOrder={lastOrder} />;
}

