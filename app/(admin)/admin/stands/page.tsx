import React from 'react';
import type { Metadata } from 'next';
import { getStands } from '@/lib/data';
import { AdminStandsListClient } from '@/components/admin/AdminStandsListClient';

export const metadata: Metadata = {
  title: 'Display Stands Builder | Bits N Bobs Admin',
  description: 'Manage freestanding display stand hardware and pre-loaded stock assortments.',
};

export default async function AdminStandsPage() {
  const stands = await getStands();

  return <AdminStandsListClient stands={stands} />;
}

