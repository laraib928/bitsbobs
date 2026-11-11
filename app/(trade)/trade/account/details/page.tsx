import React from 'react';
import type { Metadata } from 'next';
import { getRetailerAccountData } from '@/lib/data/trade-account';
import { RetailerAccountDetailsView } from '@/components/trade/RetailerAccountDetailsView';

export const metadata: Metadata = {
  title: 'Account Details | Trade Account | Bits N Bobs',
  description: 'Manage your contact details, phone, email and password.',
};

export const dynamic = 'force-dynamic';

export default async function TradeAccountDetailsPage() {
  const { profile } = await getRetailerAccountData();

  return <RetailerAccountDetailsView profile={profile} />;
}

