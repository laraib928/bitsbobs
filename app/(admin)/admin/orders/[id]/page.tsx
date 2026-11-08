import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAdminOrderDetail } from '@/lib/data/admin';
import { AdminOrderDetailClient } from '@/components/admin/AdminOrderDetailClient';

export const metadata: Metadata = {
  title: 'Order Details | Bits N Bobs Admin',
  description: 'View order details, packing items, addresses and status management.',
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const order = await getAdminOrderDetail(params.id);

  if (!order) {
    notFound();
  }

  return <AdminOrderDetailClient order={order} />;
}

