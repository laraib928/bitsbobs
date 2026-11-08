import React from 'react';
import type { Metadata } from 'next';
import { getCategories } from '@/lib/data';
import { ProductEditView } from '@/components/admin/ProductEditView';

export const metadata: Metadata = {
  title: 'Add New Product | Admin | Bits N Bobs',
  description: 'Add a new product with retail and wholesale pricing.',
};

export default async function NewProductPage() {
  const categories = await getCategories();
  return <ProductEditView isNew={true} categories={categories} />;
}

