import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getRetailerOrderById } from '@/lib/data/trade-account';
import { RetailerOrderDetailView } from '@/components/trade/RetailerOrderDetailView';

interface OrderPageProps {
  params: {
    id: string;
  };
  searchParams?: {
    action?: string;
  };
}

export async function generateMetadata({
  params,
}: OrderPageProps): Promise<Metadata> {
  const order = await getRetailerOrderById(params.id);
  return {
    title: order
      ? `Order ${order.orderNumberFormatted} | Bits N Bobs Trade`
      : 'Order Details | Bits N Bobs Trade',
  };
}

export const dynamic = 'force-dynamic';

export default async function RetailerOrderDetailPage({
  params,
  searchParams,
}: OrderPageProps) {
  const order = await getRetailerOrderById(params.id);
  if (!order) {
    notFound();
  }

  const autoReorder = searchParams?.action === 'reorder';

  return (
    <RetailerOrderDetailView order={order} autoReorder={autoReorder} />
  );
}

