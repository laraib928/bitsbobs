import React from 'react';
import type { Metadata } from 'next';
import { getRetailerAccountData } from '@/lib/data/trade-account';
import { RetailerAccountOverview } from '@/components/trade/RetailerAccountOverview';

export const metadata: Metadata = {
  title: 'Retailer Account Overview | Bits N Bobs',
  description:
    'Manage your Bits N Bobs trade account, view order history and download invoices.',
};

export const dynamic = 'force-dynamic';

export default async function RetailerAccountPage() {
  const { profile, orders, lastOrder, activePromotions } =
    await getRetailerAccountData();

  return (
    <RetailerAccountOverview
      profile={profile}
      orders={orders}
      lastOrder={lastOrder}
      activePromotions={activePromotions}
    />
  );
}
