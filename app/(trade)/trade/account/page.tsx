import React from 'react';
import type { Metadata } from 'next';
import { RETAILER_ORDERS } from '@/lib/data/mock-data';
import { RetailerAccountView } from '@/components/trade/RetailerAccountView';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Retailer Account | Bits N Bobs',
  description: 'Manage your Bits N Bobs trade account, view order history and download invoices.',
};

export default async function RetailerAccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  return <RetailerAccountView orders={RETAILER_ORDERS} profile={profile} />;
}
