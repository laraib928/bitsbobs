import React from 'react';
import type { Metadata } from 'next';
import { getAdminReportsData } from '@/lib/data/admin';
import { AdminReportsClient } from '@/components/admin/AdminReportsClient';

export const metadata: Metadata = {
  title: 'Reports & Analytics | Bits N Bobs Admin',
  description: 'Sales turnover breakdown, customer segmentation and exportable reports.',
};

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams?: { period?: 'day' | 'week' | 'month' };
}) {
  const period = searchParams?.period || 'week';
  const reports = await getAdminReportsData(period);

  return <AdminReportsClient initialData={reports} />;
}

