import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { getStands } from '@/lib/data';
import { formatMoney } from '@/lib/money';

export const metadata: Metadata = {
  title: 'Retail Display Stands | Bits N Bobs Trade',
  description:
    'Order fully stocked Bits N Bobs display stands for your shop. Pre-priced and barcoded for fast sales.',
};

export const dynamic = 'force-dynamic';

export default async function TradeStandsPage() {
  const stands = await getStands();

  return (
    <div className="bg-surface min-h-[calc(100vh-140px)] py-8 sm:py-12">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-8 flex flex-col gap-8">
        <div>
          <span className="text-[13px] font-bold uppercase tracking-wider text-brand-red">
            Trade display solutions
          </span>
          <h1 className="mt-1 mb-0 text-[32px] sm:text-[44px] font-extrabold font-stretch-112 text-navy-deep tracking-[-0.01em]">
            Display stands for retailers
          </h1>
          <p className="mt-2 mb-0 text-[16px] sm:text-[18px] text-text-2 max-w-2xl leading-relaxed">
            Turn a spare metre of floor or wall into a steady stream of small sales. Every pack comes pre-priced and bar-coded with generous retail margins.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stands.map((stand) => (
            <div
              key={stand.id}
              className="bg-white rounded-[24px] border border-line overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="bg-[#2A2170] p-6 flex justify-center items-center aspect-[4/3] overflow-hidden">
                <Image
                  src={stand.image || '/images/stand.jpg'}
                  alt={stand.name}
                  width={600}
                  height={450}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="p-6 sm:p-7 flex flex-col flex-1 gap-4">
                <div>
                  <h2 className="m-0 text-[22px] font-extrabold text-navy-deep">
                    {stand.name}
                  </h2>
                  <p className="mt-2 mb-0 text-[14px] text-text-2 line-clamp-3 leading-relaxed">
                    {stand.description ||
                      'Fully stocked display stand with our fastest selling convenience lines.'}
                  </p>
                </div>

                <div className="mt-auto pt-4 border-t border-line flex items-center justify-between gap-3">
                  <div>
                    <span className="block text-[12px] uppercase font-bold text-muted">
                      Product lines
                    </span>
                    <strong className="text-[16px] text-ink font-bold">
                      {stand.items.length || 80} hooks
                    </strong>
                  </div>

                  {stand.fixedPricePence ? (
                    <div className="text-right">
                      <span className="block text-[12px] uppercase font-bold text-muted">
                        Trade price
                      </span>
                      <strong className="text-[18px] text-navy-deep font-extrabold">
                        {formatMoney(stand.fixedPricePence)}
                      </strong>
                    </div>
                  ) : null}
                </div>

                <Link
                  href={`/trade/stands/${stand.slug}`}
                  className="w-full inline-flex items-center justify-center h-12 rounded-full bg-brand-navy hover:bg-[#251c68] text-white no-underline font-bold text-[15px] transition-colors mt-2"
                >
                  View stand & products →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

