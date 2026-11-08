'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatMoney } from '@/lib/money';
import type { Stand } from '@/lib/data/types';

interface AdminStandsListClientProps {
  stands: Stand[];
}

export function AdminStandsListClient({ stands }: AdminStandsListClientProps) {
  return (
    <div className="p-5 sm:p-8 pb-16 flex flex-col gap-6 max-w-[1360px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="m-0 text-[30px] sm:text-[34px] font-extrabold font-stretch-110 text-navy-deep">
            Display stands builder
          </h1>
          <p className="mt-1 mb-0 text-[14px] text-muted font-medium">
            Configure freestanding retail pegboard stands and pre-loaded stock packages
          </p>
        </div>

        <Link
          href="/admin/stands/new"
          className="inline-flex items-center gap-1.5 h-11 px-4 rounded-xl bg-brand-red hover:bg-[#c9000b] text-white no-underline font-bold text-[14px] shadow-xs transition-colors"
        >
          <span className="text-lg leading-none">+</span>
          <span>Add stand package</span>
        </Link>
      </div>

      {/* Grid of Stands */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stands.map((st) => (
          <div
            key={st.id}
            className="bg-white border border-line rounded-[20px] p-6 shadow-xs flex flex-col justify-between gap-5"
          >
            <div>
              <div className="w-full h-52 relative rounded-xl overflow-hidden bg-surface mb-4">
                <Image
                  src={st.image}
                  alt={st.name}
                  fill
                  className="object-contain p-2"
                />
              </div>

              <div className="flex justify-between items-start gap-2 mb-2">
                <h2 className="m-0 text-[19px] font-extrabold text-navy-deep">
                  {st.name}
                </h2>
                <span className="text-[12px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                  Active
                </span>
              </div>

              <p className="m-0 text-[13px] text-muted line-clamp-2 leading-relaxed">
                {st.description}
              </p>

              <div className="mt-4 pt-3 border-t border-line flex justify-between items-center text-[14px]">
                <span className="text-muted">Total items:</span>
                <strong className="text-ink font-bold">{st.items.length} lines pre-loaded</strong>
              </div>

              <div className="mt-1 flex justify-between items-center text-[14px]">
                <span className="text-muted">Package price:</span>
                <strong className="text-navy-deep font-extrabold text-[16px]">
                  {formatMoney(st.fixedPricePence || 55200)} ex VAT
                </strong>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <Link
                href={`/admin/stands/${st.id}`}
                className="flex-1 h-10 rounded-xl bg-brand-navy hover:bg-[#251c68] text-white font-bold text-[13px] flex items-center justify-center no-underline transition-colors shadow-xs"
              >
                Edit Stand Package
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

