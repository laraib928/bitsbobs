import React from 'react';
import type { Metadata } from 'next';
import { getAdminCustomers } from '@/lib/data/admin';
import { AdminCustomersClient } from '@/components/admin/AdminCustomersClient';

export const metadata: Metadata = {
  title: 'Public Customers | Bits N Bobs Admin',
  description: 'View customer contact details and transaction history.',
};

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams?: { search?: string };
}) {
  const customers = await getAdminCustomers(searchParams?.search);

  return <AdminCustomersClient initialCustomers={customers} />;
}

