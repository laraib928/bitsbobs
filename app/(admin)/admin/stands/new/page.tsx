import React from 'react';
import type { Metadata } from 'next';
import { StandBuilderView } from '@/components/admin/StandBuilderView';

export const metadata: Metadata = {
  title: 'Build New Stand Package | Admin | Bits N Bobs',
  description: 'Assemble a pre-stocked display stand package with lines, packs and wholesale pricing.',
};

export default function NewStandPage() {
  return <StandBuilderView isNew={true} />;
}

