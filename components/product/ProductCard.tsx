'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/data/types';
import { formatMoney } from '@/lib/money';
import { useCartStore } from '@/lib/cart/store';

interface ProductCardProps {
  product: Product;
  badge?: string;
  badgeBg?: string;
  badgeFg?: string;
  buttonLabel?: string;
  cardBg?: string;
}

export function ProductCard({
  product,
  badge,
  badgeBg,
  badgeFg = '#FFFFFF',
  buttonLabel = 'Add to basket',
  cardBg = 'bg-surface',
}: ProductCardProps) {
  const addPublicItem = useCartStore((state) => state.addPublicItem);

  const displayBadge =
    badge ||
    (product.flags.specialOffer
      ? 'Offer'
      : product.flags.bestSeller
      ? 'Best seller'
      : product.flags.newArrival
      ? 'New'
      : undefined);

  const finalBadgeBg =
    badgeBg || (displayBadge === 'Offer' ? '#E30512' : '#312682');

  const priceFormatted = formatMoney(product.retailPricePence, {
    allowPenceOnly: true,
  });

  const handleAddToBasket = (e: React.MouseEvent) => {
    e.preventDefault();
    addPublicItem({
      productId: product.id,
      name: product.name,
      image: product.images[0] || '/images/hair-grips.jpg',
      pricePence: product.retailPricePence,
    });
  };

  return (
    <article className={`relative rounded-[16px] sm:rounded-[20px] ${cardBg} p-3 sm:p-4 flex flex-col gap-2.5 sm:gap-3 group transition-transform duration-200 hover:-translate-y-1 shadow-sm`}>
      {/* Badge */}
      {displayBadge && (
        <span
          style={{ backgroundColor: finalBadgeBg, color: badgeFg }}
          className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10 text-[11px] sm:text-[12px] font-extrabold px-2 sm:px-2.5 py-1 rounded-full shadow-sm"
        >
          {displayBadge}
        </span>
      )}

      {/* Product Image */}
      <Link
        href={`/products/${product.slug}`}
        className="block bg-white rounded-[12px] sm:rounded-[14px] p-2 sm:p-3 overflow-hidden border border-line/40"
      >
        <Image
          src={product.images[0] || '/images/hair-grips.jpg'}
          alt={product.name}
          width={300}
          height={300}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
          className="block w-full aspect-square object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      {/* Info */}
      <div className="px-1 flex-1 flex flex-col justify-start">
        <h3 className="m-0 text-[14px] sm:text-[17px] font-extrabold leading-snug line-clamp-2">
          <Link
            href={`/products/${product.slug}`}
            className="text-ink hover:text-brand-red no-underline transition-colors"
          >
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 mb-0 text-[12px] sm:text-[14px] text-muted line-clamp-2">
          {product.shortLine}
        </p>
      </div>

      {/* Price & Add to basket */}
      <div className="flex justify-between items-center gap-2 px-1 pb-1 mt-auto">
        <strong className="text-[18px] sm:text-[22px] font-extrabold text-navy-deep">
          {priceFormatted}
        </strong>
        <button
          type="button"
          onClick={handleAddToBasket}
          className="inline-flex items-center justify-center h-9 sm:h-10 px-3.5 sm:px-5 rounded-full bg-brand-red hover:bg-[#c9000b] text-white font-extrabold text-[13px] sm:text-[14px] border-0 cursor-pointer transition-colors shadow-sm text-center"
        >
          {buttonLabel}
        </button>
      </div>
    </article>
  );
}

