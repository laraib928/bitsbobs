import React from 'react';
import type { Metadata } from 'next';
import { getAdminTradeAccounts } from '@/lib/data/admin';
import { AdminTradeAccountsClient } from '@/components/admin/AdminTradeAccountsClient';
import type { Database } from '@/lib/supabase/database.types';

type AccountStatus = Database['public']['Enums']['account_status'];

export const metadata: Metadata = {
  title: 'Trade Accounts Management | Bits N Bobs Admin',
  description: 'Review retailer trade applications and manage stockist approval status.',
};

export const dynamic = 'force-dynamic';

export default async function AdminTradeAccountsPage({
  searchParams,
}: {
  searchParams?: { tab?: AccountStatus; search?: string };
}) {
  const tab = searchParams?.tab || 'pending';
  const { accounts, counts } = await getAdminTradeAccounts(tab, searchParams?.search);

  return (
    <AdminTradeAccountsClient
      initialAccounts={accounts}
      counts={counts}
      currentTab={tab}
      initialSearch={searchParams?.search || ''}
    />
  );
}
