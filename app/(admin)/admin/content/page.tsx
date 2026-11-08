import React from 'react';
import type { Metadata } from 'next';
import { getAdminSiteContent } from '@/lib/data/admin';
import { AdminContentClient } from '@/components/admin/AdminContentClient';

export const metadata: Metadata = {
  title: 'Website Content & Reviews | Bits N Bobs Admin',
  description: 'Moderate customer reviews, update video demos and social channels.',
};

export default async function AdminContentPage() {
  const content = await getAdminSiteContent();

  return <AdminContentClient initialData={content} />;
}

