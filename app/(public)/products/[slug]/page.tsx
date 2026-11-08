import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProduct, getProducts, getCategories } from '@/lib/data';
import { ProductPublicView } from '@/components/product/ProductPublicView';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: `${product.name} | Bits N Bobs`,
    description: product.description,
    openGraph: {
      title: `${product.name} - 99p | Bits N Bobs`,
      description: product.shortLine,
      images: [
        {
          url: product.images[0] || '/images/hair-grips.jpg',
          width: 600,
          height: 600,
          alt: product.name,
        },
      ],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const product = await getProduct(params.slug);
  if (!product) {
    notFound();
  }

  const allCategories = await getCategories();
  const category = allCategories.find((c) => c.id === product.categoryId);
  const categoryName = category ? category.name : 'Products';
  const categorySlug = category ? category.slug : 'all';

  const allProducts = await getProducts();
  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 5);

  // Structured Data (JSON-LD) for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images.map((img) => `https://bitsnbobs.co${img}`),
    description: product.description,
    sku: product.code,
    offers: {
      '@type': 'Offer',
      url: `https://bitsnbobs.co/products/${product.slug}`,
      priceCurrency: 'GBP',
      price: (product.retailPricePence / 100).toFixed(2),
      availability:
        product.stockPacks > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: "Bits 'N' Bobs",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductPublicView
        product={product}
        categoryName={categoryName}
        categorySlug={categorySlug}
        relatedProducts={relatedProducts}
      />
    </>
  );
}

