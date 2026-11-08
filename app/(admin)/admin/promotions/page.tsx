import React from 'react';
import type { Metadata } from 'next';
import { getAdminPromotions } from '@/lib/data/admin';
import { AdminPromotionsClient } from '@/components/admin/AdminPromotionsClient';

export const metadata: Metadata = {
  title: 'Promotions Management | Bits N Bobs Admin',
  description: 'Create and manage retail offers and wholesale promotions.',
};

export default async function AdminPromotionsPage() {
  const promotions = await getAdminPromotions();

  return <AdminPromotionsClient initialPromotions={promotions} />;
}

