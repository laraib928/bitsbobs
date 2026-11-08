import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getStand } from '@/lib/data';
import { StandBuilderView } from '@/components/admin/StandBuilderView';

interface StandEditPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: StandEditPageProps): Promise<Metadata> {
  const stand = await getStand(params.id);
  return {
    title: stand
      ? `Edit ${stand.name} | Admin | Bits N Bobs`
      : 'Edit Stand Package | Admin',
  };
}

export default async function StandEditPage({ params }: StandEditPageProps) {
  const stand = await getStand(params.id);
  if (!stand) {
    notFound();
  }

  return <StandBuilderView stand={stand} />;
}

