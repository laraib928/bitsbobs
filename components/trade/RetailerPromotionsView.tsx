'use client';

import React from 'react';
import Link from 'next/link';
import { RetailerPromotion } from '@/lib/data/trade-account';

interface RetailerPromotionsViewProps {
  promotions: RetailerPromotion[];
}

export function RetailerPromotionsView({
  promotions,
}: RetailerPromotionsViewProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="m-0 text-[30px] sm:text-[36px] font-extrabold font-stretch-112 text-navy-deep tracking-[-0.01em]">
          Trade promotions & offers
        </h1>
        <p className="mt-1 mb-0 text-[15px] text-muted">
          Exclusive discounts and multibuy offers available to approved retail stockists.
        </p>
      </div>

      {promotions.length === 0 ? (
        <div className="bg-white border border-line rounded-[20px] p-8 sm:p-12 shadow-sm text-center flex flex-col items-center justify-center gap-3">
          <span className="text-4xl">🏷️</span>
          <h2 className="m-0 text-[22px] font-bold text-navy-deep">
            No active promotions right now
          </h2>
          <p className="m-0 text-[15px] text-muted max-w-md">
            Check back soon for upcoming trade discounts, seasonal pack offers and new line introductory pricing.
          </p>
          <Link
            href="/trade/shop"
            className="mt-3 inline-flex items-center h-11 px-6 rounded-full bg-brand-navy hover:bg-[#251c68] text-white no-underline font-bold text-[14px] transition-colors"
          >
            Browse trade shop
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {promotions.map((promo) => (
            <div
              key={promo.id}
              className="bg-white border border-line rounded-[20px] p-6 shadow-sm flex flex-col gap-3.5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-bold bg-[#FDE6E8] text-brand-red">
                  Active Offer
                </span>
                <span className="text-[13px] text-muted font-medium">
                  Exclusive to trade
                </span>
              </div>
              <div>
                <h2 className="m-0 text-[20px] font-bold text-navy-deep">
                  {promo.title}
                </h2>
                <p className="mt-1.5 mb-0 text-[15px] text-text-2 leading-relaxed">
                  {promo.description}
                </p>
              </div>
              <Link
                href={promo.targetHref || '/trade/shop'}
                className="self-start mt-auto inline-flex items-center h-10 px-5 rounded-full bg-brand-navy hover:bg-[#251c68] text-white no-underline font-bold text-[13px] transition-colors"
              >
                Shop this promotion →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

