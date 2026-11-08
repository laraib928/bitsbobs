import React from 'react';
import Image from 'next/image';
import { STOCKIST_LOGOS } from '@/lib/data/mock-data';

export function StockistLogos() {
  return (
    <section className="bg-white border-b border-line">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-8 py-5 sm:py-7 flex flex-col md:flex-row gap-3 md:gap-x-12 md:items-center justify-between overflow-hidden">
        <p className="m-0 text-[13px] sm:text-[15px] text-muted flex-none">
          Found in independent and symbol group stores, including
        </p>
        <div className="w-full md:w-auto overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          <ul className="m-0 p-0 list-none flex items-center gap-7 sm:gap-10 md:gap-14 flex-nowrap py-1">
            {STOCKIST_LOGOS.map((logo) => (
              <li key={logo.name} className="flex-none">
                <Image
                  src={logo.src}
                  alt={logo.name}
                  width={120}
                  height={logo.height}
                  className="block object-contain h-6 sm:h-7 md:h-[32px] w-auto max-w-[85px] sm:max-w-[110px]"
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

