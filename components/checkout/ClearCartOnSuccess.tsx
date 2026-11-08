'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/lib/cart/store';

interface ClearCartOnSuccessProps {
  orderType?: 'retail' | 'trade';
}

export function ClearCartOnSuccess({
  orderType = 'retail',
}: ClearCartOnSuccessProps) {
  const clearPublicCart = useCartStore((state) => state.clearPublicCart);
  const clearTradeCart = useCartStore((state) => state.clearTradeCart);

  useEffect(() => {
    if (orderType === 'trade') {
      clearTradeCart();
    } else {
      clearPublicCart();
    }
  }, [orderType, clearPublicCart, clearTradeCart]);

  return null;
}
