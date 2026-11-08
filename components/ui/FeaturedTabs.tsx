'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/data/types';
import { ProductCard } from '@/components/product/ProductCard';

interface FeaturedTabsProps {
  bestSellers: Product[];
  newArrivals: Product[];
  specialOffers: Product[];
}

export function FeaturedTabs({
  bestSellers,
  newArrivals,
  specialOffers,
}: FeaturedTabsProps) {
  const [activeTab, setActiveTab] = useState<'best' | 'fresh' | 'offers'>('best');

  const tabs = [
    { id: 'best' as const, label: 'Best sellers' },
    { id: 'fresh' as const, label: 'New arrivals' },
    { id: 'offers' as const, label: 'Special offers' },
  ];

  const currentProducts =
    activeTab === 'best'
      ? bestSellers
      : activeTab === 'fresh'
      ? newArrivals
      : specialOffers;

  return (
    <section className="bg-white">
      <div className="max-w-[1320px] mx-auto py-12 sm:py-[88px] px-4 sm:px-8 flex flex-col gap-6 sm:gap-7">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <h2 className="m-0 text-[32px] sm:text-[40px] lg:text-[44px] font-extrabold font-stretch-112 text-navy-deep tracking-[-0.01em]">
            Featured products
          </h2>
          {/* Scrollable tabs container if they overflow */}
          <div className="w-full sm:w-auto overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            <div
              role="tablist"
              aria-label="Featured products"
              className="flex gap-1.5 bg-surface rounded-full p-[5px] w-max sm:w-auto"
            >
              {tabs.map((tab) => {
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setActiveTab(tab.id)}
                    className={`h-11 min-h-[44px] px-4 sm:px-5 rounded-full border-0 font-sans font-bold text-[14px] sm:text-[15px] cursor-pointer transition-colors flex-none whitespace-nowrap ${
                      isSelected
                        ? 'bg-brand-navy text-white shadow-sm'
                        : 'bg-transparent text-ink hover:text-brand-navy'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Products Grid: 2 columns on phone */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {currentProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        <Link
          href="/shop"
          className="w-full sm:w-auto sm:self-center inline-flex items-center justify-center h-[52px] sm:h-[54px] px-[30px] rounded-full border-2 border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white no-underline font-extrabold min-h-[44px] transition-colors mt-2 text-center"
        >
          View our products
        </Link>
      </div>
    </section>
  );
}

