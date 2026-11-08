import React from 'react';
import type { Metadata } from 'next';
import { getAdminSettings } from '@/lib/data/admin';
import { AdminSettingsClient } from '@/components/admin/AdminSettingsClient';

export const metadata: Metadata = {
  title: 'Settings & Admins | Bits N Bobs Admin',
  description: 'View registered company details, VAT configuration and administrative accounts.',
};

export default async function AdminSettingsPage() {
  const settings = await getAdminSettings();

  return <AdminSettingsClient initialData={settings} />;
}

