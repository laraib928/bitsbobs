import React from 'react';
import type { Metadata } from 'next';
import { getRetailerAccountData } from '@/lib/data/trade-account';
import { RetailerOrdersView } from '@/components/trade/RetailerOrdersView';

export const metadata: Metadata = {
  title: 'Previous Orders | Trade Account | Bits N Bobs',
  description: 'View your previous trade orders, statuses and invoices.',
};

export const dynamic = 'force-dynamic';

export default async function TradeOrdersPage() {
  const { orders } = await getRetailerAccountData();

  return <RetailerOrdersView orders={orders} />;
}

