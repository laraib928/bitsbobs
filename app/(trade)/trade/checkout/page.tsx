import React from 'react';
import type { Metadata } from 'next';
import { TradeCheckoutView } from '@/components/trade/TradeCheckoutView';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Trade Checkout | Bits N Bobs',
  description: 'Secure wholesale checkout for approved retail stockists.',
};

export default async function TradeCheckoutPage() {
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
      .maybeSingle();
    profile = data;
  }

  return <TradeCheckoutView profile={profile} />;
}
