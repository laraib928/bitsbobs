import React from 'react';
import type { Metadata } from 'next';
import { PublicBasketCheckoutView } from '@/components/product/PublicBasketCheckoutView';

export const metadata: Metadata = {
  title: 'Secure Checkout | Bits N Bobs',
  description: 'Complete your Bits N Bobs purchase securely.',
};

export default function CheckoutPage() {
  return <PublicBasketCheckoutView />;
}

