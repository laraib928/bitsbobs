import React from 'react';
import type { Metadata } from 'next';
import { getRetailerAccountData } from '@/lib/data/trade-account';
import { RetailerAddressesView } from '@/components/trade/RetailerAddressesView';

export const metadata: Metadata = {
  title: 'Delivery Addresses | Trade Account | Bits N Bobs',
  description: 'Manage your store trading address and delivery destination.',
};

export const dynamic = 'force-dynamic';

export default async function TradeAddressesPage() {
  const { profile } = await getRetailerAccountData();

  return <RetailerAddressesView profile={profile} />;
}

