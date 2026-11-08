import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProduct, getCategories } from '@/lib/data';
import { ProductEditView } from '@/components/admin/ProductEditView';

interface ProductEditPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: ProductEditPageProps): Promise<Metadata> {
  const product = await getProduct(params.id);
  return {
    title: product
      ? `Edit ${product.name} | Admin | Bits N Bobs`
      : 'Edit Product | Admin',
  };
}

export default async function ProductEditPage({
  params,
}: ProductEditPageProps) {
  const [product, categories] = await Promise.all([
    getProduct(params.id),
    getCategories(),
  ]);

  if (!product) {
    notFound();
  }

  return <ProductEditView product={product} categories={categories} />;
}

