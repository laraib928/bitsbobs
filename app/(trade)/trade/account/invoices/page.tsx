import React from 'react';
import type { Metadata } from 'next';
import { getRetailerAccountData } from '@/lib/data/trade-account';
import { RetailerInvoicesView } from '@/components/trade/RetailerInvoicesView';

export const metadata: Metadata = {
  title: 'VAT Invoices | Trade Account | Bits N Bobs',
  description: 'Download and print VAT invoices for your completed trade orders.',
};

export const dynamic = 'force-dynamic';

export default async function TradeInvoicesPage() {
  const { orders, profile } = await getRetailerAccountData();

  return <RetailerInvoicesView orders={orders} profile={profile} />;
}

