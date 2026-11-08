import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function StandFeature() {
  return (
    <section id="stands" className="bg-white">
      <div className="max-w-[1320px] mx-auto py-12 sm:py-24 px-4 sm:px-8 flex flex-col gap-8 sm:gap-10">
        {/* Header intro */}
        <div className="grid grid-cols-1 md:grid-cols-[minmax(min(100%,460px),1fr)_1fr] gap-6 sm:gap-10 items-end">
          <div>
            <p className="m-0 mb-2 text-[14px] sm:text-[16px] font-bold text-brand-red">
              For shops and retailers
            </p>
            <h2 className="m-0 text-[34px] sm:text-[44px] lg:text-[56px] leading-tight font-extrabold font-stretch-115 tracking-[-0.015em] text-navy-deep">
              The Bits N Bobs stand
            </h2>
          </div>
          <p className="m-0 text-[16px] sm:text-[19px] leading-[1.6] text-text-2">
            A spare metre of wall becomes a steady stream of small sales. Order
            a fully stocked display stand, every pack pre-priced and bar-coded,
            and our rep comes back regularly to keep every hook full.
          </p>
        </div>

        {/* 2-column feature card: stack photo above navy panel on tablet/mobile (< lg) */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(min(100%,560px),1fr)_1fr] gap-0 rounded-[24px] overflow-hidden bg-navy-deep">
          {/* Stand photo: Rule 9: aspect-ratio 1217 / 1292, never crop */}
          <figure className="m-0 w-full self-start bg-[#2A2170] leading-none overflow-hidden">
            <Image
              src="/images/stand.jpg"
              alt="A Bits N Bobs display stand full of hanging packs in a shop aisle"
              width={1217}
              height={1292}
              sizes="(max-width: 1024px) 100vw, 560px"
              style={{
                width: '100%',
                height: 'auto',
                aspectRatio: '1217 / 1292',
              }}
              className="block w-full h-auto object-contain"
            />
          </figure>

          {/* Details & Steps */}
          <div className="p-6 sm:p-8 lg:p-11 text-white flex flex-col gap-5 sm:gap-[26px]">
            <div className="flex justify-between items-baseline gap-2 sm:gap-4 flex-wrap">
              <h3 className="m-0 text-[24px] sm:text-[30px] font-extrabold font-stretch-110">
                80 Hook Display Stand
              </h3>
              <p className="m-0 text-[14px] sm:text-[15px] text-[#B9B5E0]">
                Trade price shown after{' '}
                <Link
                  href="/trade"
                  className="text-brand-yellow hover:underline font-bold"
                >
                  trade login
                </Link>
              </p>
            </div>

            <ol className="m-0 p-0 list-none flex flex-col">
              <li className="grid grid-cols-[44px_1fr] sm:grid-cols-[52px_1fr] gap-3 sm:gap-4 py-3 sm:py-[18px] border-t border-white/15">
                <span className="text-[26px] sm:text-[30px] font-extrabold text-brand-yellow font-stretch-112">
                  01
                </span>
                <span>
                  <strong className="block text-[16px] sm:text-[18px]">
                    Become a stockist
                  </strong>
                  <span className="text-[#D6D4EE] text-[14px] sm:text-[15px]">
                    Apply online. We approve your trade account.
                  </span>
                </span>
              </li>
              <li className="grid grid-cols-[44px_1fr] sm:grid-cols-[52px_1fr] gap-3 sm:gap-4 py-3 sm:py-[18px] border-t border-white/15">
                <span className="text-[26px] sm:text-[30px] font-extrabold text-brand-yellow font-stretch-112">
                  02
                </span>
                <span>
                  <strong className="block text-[16px] sm:text-[18px]">
                    Order a fully stocked stand
                  </strong>
                  <span className="text-[#D6D4EE] text-[14px] sm:text-[15px]">
                    See every product and quantity on the stand before you buy.
                  </span>
                </span>
              </li>
              <li className="grid grid-cols-[44px_1fr] sm:grid-cols-[52px_1fr] gap-3 sm:gap-4 py-3 sm:py-[18px] border-t border-b border-white/15">
                <span className="text-[26px] sm:text-[30px] font-extrabold text-brand-yellow font-stretch-112">
                  03
                </span>
                <span>
                  <strong className="block text-[16px] sm:text-[18px]">
                    Reorder packs of 6
                  </strong>
                  <span className="text-[#D6D4EE] text-[14px] sm:text-[15px]">
                    Free delivery on trade orders of £150 or more.
                  </span>
                </span>
              </li>
            </ol>

            <div className="flex flex-col sm:flex-row gap-3 w-full mt-auto pt-4">
              <Link
                href="/trade"
                className="w-full sm:w-auto inline-flex items-center justify-center h-[52px] sm:h-[54px] px-[26px] rounded-full bg-brand-red hover:bg-[#c9000b] text-white no-underline font-extrabold text-[15px] sm:text-[16px] min-h-[44px] transition-colors text-center"
              >
                Become a stockist
              </Link>
              <Link
                href="/trade"
                className="w-full sm:w-auto inline-flex items-center justify-center h-[52px] sm:h-[54px] px-[26px] rounded-full border-2 border-white hover:bg-white hover:text-navy-deep text-white no-underline font-bold text-[15px] sm:text-[16px] min-h-[44px] transition-colors text-center"
              >
                Trade login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

