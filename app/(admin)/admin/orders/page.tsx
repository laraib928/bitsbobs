import React from 'react';
import type { Metadata } from 'next';
import { getAdminOrdersList } from '@/lib/data/admin';
import { AdminOrdersListClient } from '@/components/admin/AdminOrdersListClient';

export const metadata: Metadata = {
  title: 'Orders Management | Bits N Bobs Admin',
  description: 'Manage and fulfill trade and retail customer orders.',
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams?: { search?: string; status?: string; channel?: string };
}) {
  const orders = await getAdminOrdersList({
    search: searchParams?.search,
    status: searchParams?.status,
    channel: searchParams?.channel,
  });

  return <AdminOrdersListClient initialOrders={orders} />;
}

