import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getStand, getProduct } from '@/lib/data';
import { DisplayStandView } from '@/components/trade/DisplayStandView';

interface StandPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({
  params,
}: StandPageProps): Promise<Metadata> {
  const stand = await getStand(params.slug);
  if (!stand) {
    return {
      title: 'Display Stand Not Found',
    };
  }

  return {
    title: `${stand.name} (Trade) | Bits N Bobs`,
    description: stand.description,
  };
}

export default async function StandPage({ params }: StandPageProps) {
  const stand = await getStand(params.slug);
  if (!stand) {
    notFound();
  }

  // Resolve stand product items
  const itemsList = await Promise.all(
    stand.items.map(async (item) => {
      const prod = await getProduct(item.productId);
      return {
        name: prod ? prod.name : 'Product line',
        img: prod?.images[0] || '/images/hair-grips.jpg',
        packs: item.packs,
        units: item.packs * (prod?.unitsPerPack || 6),
      };
    })
  );

  return <DisplayStandView stand={stand} itemsList={itemsList} />;
}

