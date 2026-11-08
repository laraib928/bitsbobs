import React from 'react';
import type { Metadata } from 'next';
import { PublicBasketCheckoutView } from '@/components/product/PublicBasketCheckoutView';

export const metadata: Metadata = {
  title: 'Your Basket | Bits N Bobs',
  description: 'Review your items and checkout securely.',
};

export default function BasketPage() {
  return <PublicBasketCheckoutView />;
}

