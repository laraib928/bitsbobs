import React from 'react';
import type { Metadata } from 'next';
import { getAdminDeliverySettings } from '@/lib/data/admin';
import { AdminDeliveryClient } from '@/components/admin/AdminDeliveryClient';

export const metadata: Metadata = {
  title: 'Delivery & VAT Settings | Bits N Bobs Admin',
  description: 'Manage delivery charges, threshold amounts and VAT rates.',
};

export default async function AdminDeliveryPage() {
  const settings = await getAdminDeliverySettings();

  return <AdminDeliveryClient initialSettings={settings} />;
}

