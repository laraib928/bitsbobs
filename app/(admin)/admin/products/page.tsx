import React from 'react';
import type { Metadata } from 'next';
import { getProducts } from '@/lib/data';
import { AdminProductsListClient } from '@/components/admin/AdminProductsListClient';

export const metadata: Metadata = {
  title: 'Products & Inventory | Bits N Bobs Admin',
  description: 'Manage convenience product catalogue and warehouse inventory.',
};

export default async function AdminProductsPage() {
  const products = await getProducts();

  return <AdminProductsListClient products={products} />;
}

