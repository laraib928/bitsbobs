import React from 'react';
import type { Metadata } from 'next';
import { getAdminDashboardData } from '@/lib/data/admin';
import { AdminDashboardClient } from '@/components/admin/AdminDashboardClient';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Bits N Bobs',
  description: 'Operations, inventory, sales KPIs, trade approvals and fulfillment dashboard.',
};

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams?: { range?: 'today' | '7days' | '30days' | 'custom'; from?: string; to?: string };
}) {
  const range = searchParams?.range || '7days';
  const dashboardData = await getAdminDashboardData(range, searchParams?.from, searchParams?.to);

  return <AdminDashboardClient initialData={dashboardData} />;
}
