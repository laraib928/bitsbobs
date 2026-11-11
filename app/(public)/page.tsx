import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getCategories, getProducts } from '@/lib/data';
import { StockistLogos } from '@/components/ui/StockistLogos';
import { CategoryCard } from '@/components/ui/CategoryCard';
import { FeaturedTabs } from '@/components/ui/FeaturedTabs';

export const revalidate = 3600;

function ProductPyramid({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      style={{ aspectRatio: '49 / 44' }}
      className={`relative select-none animate-float ${className}`}
    >
      {/* Yellow diamond (behind everything, z-index 0) */}
      <div className="absolute left-[22.3%] top-[14.7%] w-[63.5%] aspect-square border-[2.5px] sm:border-[3px] border-[#FFEC00] rotate-45 pointer-events-none z-0" />

      {/* Top row (z-index 1) */}
      {/* Birthday Candles: left 30.6%, top 15.9%, width 22.4% */}
      <div className="absolute left-[30.6%] top-[15.9%] w-[22.4%] aspect-square bg-white rounded-[8px] sm:rounded-[14px] p-[3px] sm:p-[6px] shadow-[0_12px_28px_-10px_rgba(0,0,0,0.55)] sm:shadow-[0_20px_40px_-16px_rgba(0,0,0,0.55)] z-[1] transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-2xl cursor-pointer">
        <Image
          src="/images/birthday-candles.jpg"
          alt=""
          width={140}
          height={140}
          priority
          className="block w-full h-full aspect-square object-contain"
        />
      </div>

      {/* Nail Glue: left 53.7%, top 18.6%, width 22.4% */}
      <div className="absolute left-[53.7%] top-[18.6%] w-[22.4%] aspect-square bg-white rounded-[8px] sm:rounded-[14px] p-[3px] sm:p-[6px] shadow-[0_12px_28px_-10px_rgba(0,0,0,0.55)] sm:shadow-[0_20px_40px_-16px_rgba(0,0,0,0.55)] z-[1] transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-2xl cursor-pointer">
        <Image
          src="/images/nail-glue.jpg"
          alt=""
          width={130}
          height={130}
          priority
          className="block w-full h-full aspect-square object-contain"
        />
      </div>

      {/* Middle row (z-index 2), overlapping the top row */}
      {/* Bottle Opener: left 12.2%, top 41.4%, width 24.5% */}
      <div className="absolute left-[12.2%] top-[41.4%] w-[24.5%] aspect-square bg-white rounded-[8px] sm:rounded-[14px] p-[3px] sm:p-[6px] shadow-[0_12px_28px_-10px_rgba(0,0,0,0.55)] sm:shadow-[0_20px_40px_-16px_rgba(0,0,0,0.55)] z-[2] transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-2xl cursor-pointer">
        <Image
          src="/images/bottle-opener.jpg"
          alt=""
          width={150}
          height={150}
          priority
          className="block w-full h-full aspect-square object-contain"
        />
      </div>

      {/* False Nails: left 37.3%, top 38.2%, width 28%, z-index 3 with yellow 99p tag */}
      <div className="absolute left-[37.3%] top-[38.2%] w-[28%] aspect-square bg-white rounded-[8px] sm:rounded-[14px] p-[3px] sm:p-[6px] shadow-[0_12px_28px_-10px_rgba(0,0,0,0.55)] sm:shadow-[0_20px_40px_-16px_rgba(0,0,0,0.55)] z-[3] transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-2xl cursor-pointer">
        <Image
          src="/images/false-nails.jpg"
          alt=""
          width={160}
          height={160}
          priority
          className="block w-full h-full aspect-square object-contain"
        />
        <span className="absolute -right-[4px] sm:-right-[6px] bottom-[8px] sm:bottom-[14px] bg-[#FFEC00] text-ink text-[10px] sm:text-[15px] font-black px-[5px] sm:px-[10px] py-[2px] sm:py-[4px] rounded-[4px] sm:rounded-[8px] shadow-md leading-none">
          99p
        </span>
      </div>

      {/* Vent Brush: left 63.7%, top 42.3%, width 25.7% */}
      <div className="absolute left-[63.7%] top-[42.3%] w-[25.7%] aspect-square bg-white rounded-[8px] sm:rounded-[14px] p-[3px] sm:p-[6px] shadow-[0_12px_28px_-10px_rgba(0,0,0,0.55)] sm:shadow-[0_20px_40px_-16px_rgba(0,0,0,0.55)] z-[2] transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-2xl cursor-pointer">
        <Image
          src="/images/vent-brush.jpg"
          alt=""
          width={140}
          height={140}
          priority
          className="block w-full h-full aspect-square object-contain"
        />
      </div>

      {/* Bottom row (z-index 4), overlapping the middle row */}
      {/* Paint Brush: left 1%, top 66.6%, width 26.5% */}
      <div className="absolute left-[1%] top-[66.6%] w-[26.5%] aspect-square bg-white rounded-[8px] sm:rounded-[14px] p-[3px] sm:p-[6px] shadow-[0_12px_28px_-10px_rgba(0,0,0,0.55)] sm:shadow-[0_20px_40px_-16px_rgba(0,0,0,0.55)] z-[4] transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-2xl cursor-pointer">
        <Image
          src="/images/paint-brush.jpg"
          alt=""
          width={150}
          height={150}
          priority
          className="block w-full h-full aspect-square object-contain"
        />
      </div>

      {/* Hair Grips: left 24.1%, top 63.6%, width 31%, z-index 6 (front card, biggest) */}
      <div className="absolute left-[24.1%] top-[63.6%] w-[31%] aspect-square bg-white rounded-[8px] sm:rounded-[14px] p-[3px] sm:p-[6px] shadow-[0_14px_32px_-12px_rgba(0,0,0,0.7)] sm:shadow-[0_22px_46px_-18px_rgba(0,0,0,0.7)] z-[6] transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-2xl cursor-pointer">
        <Image
          src="/images/hair-grips.jpg"
          alt=""
          width={180}
          height={180}
          priority
          className="block w-full h-full aspect-square object-contain"
        />
      </div>

      {/* Nail Scissors: left 51%, top 70.5%, width 24.5%, z-index 5 */}
      <div className="absolute left-[51%] top-[70.5%] w-[24.5%] aspect-square bg-white rounded-[8px] sm:rounded-[14px] p-[3px] sm:p-[6px] shadow-[0_12px_28px_-10px_rgba(0,0,0,0.55)] sm:shadow-[0_20px_40px_-16px_rgba(0,0,0,0.55)] z-[5] transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-2xl cursor-pointer">
        <Image
          src="/images/nail-scissors.jpg"
          alt=""
          width={150}
          height={150}
          priority
          className="block w-full h-full aspect-square object-contain"
        />
      </div>

      {/* Nit Comb: left 72.9%, top 69.3%, width 25.1%, z-index 4 */}
      <div className="absolute left-[72.9%] top-[69.3%] w-[25.1%] aspect-square bg-white rounded-[8px] sm:rounded-[14px] p-[3px] sm:p-[6px] shadow-[0_12px_28px_-10px_rgba(0,0,0,0.55)] sm:shadow-[0_20px_40px_-16px_rgba(0,0,0,0.55)] z-[4] transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-2xl cursor-pointer">
        <Image
          src="/images/nit-comb.jpg"
          alt=""
          width={140}
          height={140}
          priority
          className="block w-full h-full aspect-square object-contain"
        />
      </div>
    </div>
  );
}

export default async function HomePage() {
  const categories = await getCategories();
  const allProducts = await getProducts();

  const bestSellers = allProducts.filter((p) => p.flags.bestSeller);
  const newArrivals = allProducts.filter((p) => p.flags.newArrival);
  const specialOffers = allProducts.filter((p) => p.flags.specialOffer);

  // 6 primary categories for the home grid
  const homeCategories = categories.slice(0, 6);

  return (
    <div className="w-full">
      {/* 1. Hero Section */}
      <section className="bg-navy-deep text-white relative overflow-hidden">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-8 py-10 sm:py-12 lg:py-[56px] grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-[48px] items-start">
          {/* Left Column */}
          <div className="flex flex-col gap-5 sm:gap-7 relative z-10">
            <p className="m-0 text-[14px] sm:text-[16px] font-semibold text-brand-yellow">
              Handy. Pre-packed. Great value.
            </p>
            <h1 className="m-0 text-[clamp(34px,9vw,44px)] sm:text-[60px] lg:text-[clamp(48px,4.6vw,66px)] leading-[1.05] sm:leading-[0.98] lg:leading-[1.02] font-extrabold font-stretch-115 lg:[font-stretch:normal] lg:[font-variation-settings:'wdth'_100] tracking-[-0.02em]">
              All the little<br className="hidden lg:inline" /> things you<br className="hidden lg:inline" /> always run out<br className="hidden lg:inline" /> of.
            </h1>

            {/* Mobile Product Pyramid (Option B: centred under headline, max-w 330px, aspect-ratio 49/44) */}
            <div className="md:hidden w-full flex justify-center my-2">
              <ProductPyramid className="w-full max-w-[330px]" />
            </div>

            <p className="m-0 text-[15px] sm:text-[20px] leading-[1.55] text-soft-on-dark max-w-[31em]">
              Combs, fuses, tape, party candles, kitchen tools and more. Buy one
              or as many as you like, delivered to your door. Run a shop? Stock
              the full range.
            </p>

            {/* Buttons: on mobile 2 equal columns, height 52px; on md/desktop flex */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 w-full md:flex md:w-auto">
              <Link
                href="/shop"
                className="w-full md:w-auto inline-flex items-center justify-center h-[52px] md:h-[58px] px-3 sm:px-8 rounded-full bg-brand-yellow hover:bg-[#ffe100] text-ink no-underline font-extrabold text-[15px] sm:text-[17px] min-h-[44px] transition-colors text-center"
              >
                Shop now
              </Link>
              <Link
                href="/trade"
                className="w-full md:w-auto inline-flex items-center justify-center h-[52px] md:h-[58px] px-2 sm:px-[30px] rounded-full border-2 border-white hover:bg-white hover:text-navy-deep text-white no-underline font-bold text-[14px] sm:text-[17px] min-h-[44px] transition-colors text-center whitespace-nowrap"
              >
                Become a stockist
              </Link>
            </div>

            {/* 3 stats in one row */}
            <dl className="m-0 mt-2 sm:mt-3 grid grid-cols-3 gap-2 sm:gap-4 pt-5 sm:pt-6 border-t border-white/20">
              <div>
                <dt className="text-[11px] sm:text-[14px] text-soft-on-dark-2 leading-tight">
                  Retail stockists
                </dt>
                <dd className="m-0 mt-1 text-[20px] sm:text-[28px] lg:text-[34px] font-extrabold font-stretch-110">
                  10,000+
                </dd>
              </div>
              <div>
                <dt className="text-[11px] sm:text-[14px] text-soft-on-dark-2 leading-tight">Trusted since</dt>
                <dd className="m-0 mt-1 text-[20px] sm:text-[28px] lg:text-[34px] font-extrabold font-stretch-110">
                  1994
                </dd>
              </div>
              <div>
                <dt className="text-[11px] sm:text-[14px] text-soft-on-dark-2 leading-tight">
                  Products to choose from
                </dt>
                <dd className="m-0 mt-1 text-[20px] sm:text-[28px] lg:text-[34px] font-extrabold font-stretch-110">
                  125
                </dd>
              </div>
            </dl>
          </div>

          {/* Right Column: Hero Product Pyramid matching desktop (md and up) */}
          <ProductPyramid className="hidden md:block w-full max-lg:max-w-[560px] max-lg:mx-auto max-lg:mt-6 lg:max-w-[620px] lg:mt-0 lg:ml-auto lg:self-start" />
        </div>
      </section>

      {/* 2. Yellow Scrolling Marquee Strip */}
      <div className="w-full bg-[#FFEC00] text-ink py-2.5 sm:py-3.5 border-y border-[#E6D400] overflow-hidden select-none">
        <div className="animate-marquee whitespace-nowrap flex items-center font-extrabold text-[14px] sm:text-[16px] tracking-wide">
          <div className="flex items-center gap-6 sm:gap-8 px-4">
            <span>Everyday essentials from 99p</span>
            <span className="text-black/40">✦</span>
            <span>125 handy products</span>
            <span className="text-black/40">✦</span>
            <span>Stocked in 10,000+ UK shops</span>
            <span className="text-black/40">✦</span>
            <span>Buy one or many online</span>
            <span className="text-black/40">✦</span>
            <span>Trusted since 1994</span>
            <span className="text-black/40">✦</span>
            <span>Direct to your door</span>
            <span className="text-black/40">✦</span>
          </div>
          <div className="flex items-center gap-6 sm:gap-8 px-4" aria-hidden="true">
            <span>Everyday essentials from 99p</span>
            <span className="text-black/40">✦</span>
            <span>125 handy products</span>
            <span className="text-black/40">✦</span>
            <span>Stocked in 10,000+ UK shops</span>
            <span className="text-black/40">✦</span>
            <span>Buy one or many online</span>
            <span className="text-black/40">✦</span>
            <span>Trusted since 1994</span>
            <span className="text-black/40">✦</span>
            <span>Direct to your door</span>
            <span className="text-black/40">✦</span>
          </div>
        </div>
      </div>

      {/* 3. Stockists Section */}
      <StockistLogos />

      {/* 4. "Everyday essentials you can count on" (4 Coloured Benefit Cards) */}
      <section id="why" className="bg-white py-12 sm:py-[72px]">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-8 flex flex-col gap-8 sm:gap-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h2 className="m-0 text-[32px] sm:text-[40px] lg:text-[44px] font-extrabold font-stretch-112 text-navy-deep tracking-[-0.01em] leading-tight">
                Everyday essentials<br className="hidden sm:inline" /> you can count on
              </h2>
            </div>
            <p className="m-0 text-[15px] sm:text-[17px] text-text-2 leading-relaxed max-w-md">
              Everything from birthday candles to party balloons, nail care to kitchen tools. Pre-packed, barcoded, ready to display and sell.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* Card 1: Red */}
            <div className="bg-brand-red text-white rounded-[24px] p-6 sm:p-7 flex flex-col gap-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
              <div className="w-12 h-12 rounded-[14px] bg-white/20 text-white flex items-center justify-center flex-none">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="flex flex-col gap-1.5 mt-auto">
                <h3 className="m-0 text-[20px] font-extrabold font-stretch-108 text-white">
                  Good quality products
                </h3>
                <p className="m-0 text-[14px] leading-relaxed text-white/90">
                  Reliable everyday items, made to last.
                </p>
              </div>
            </div>

            {/* Card 2: Yellow */}
            <div className="bg-brand-yellow text-ink rounded-[24px] p-6 sm:p-7 flex flex-col gap-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
              <div className="w-12 h-12 rounded-[14px] bg-black/10 text-ink flex items-center justify-center flex-none">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div className="flex flex-col gap-1.5 mt-auto">
                <h3 className="m-0 text-[20px] font-extrabold font-stretch-108 text-ink">
                  Convenient and affordable
                </h3>
                <p className="m-0 text-[14px] leading-relaxed text-ink/80">
                  Handy essentials at friendly prices.
                </p>
              </div>
            </div>

            {/* Card 3: Navy */}
            <div className="bg-brand-navy text-white rounded-[24px] p-6 sm:p-7 flex flex-col gap-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
              <div className="w-12 h-12 rounded-[14px] bg-white/20 text-white flex items-center justify-center flex-none">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="flex flex-col gap-1.5 mt-auto">
                <h3 className="m-0 text-[20px] font-extrabold font-stretch-108 text-white">
                  Stocked across the UK
                </h3>
                <p className="m-0 text-[14px] leading-relaxed text-white/85">
                  Found in over 10,000 shops nationwide.
                </p>
              </div>
            </div>

            {/* Card 4: White */}
            <div className="bg-white text-ink rounded-[24px] p-6 sm:p-7 flex flex-col gap-4 border border-line shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
              <div className="w-12 h-12 rounded-[14px] bg-[#FDE6E8] text-brand-red flex items-center justify-center flex-none">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="flex flex-col gap-1.5 mt-auto">
                <h3 className="m-0 text-[20px] font-extrabold font-stretch-108 text-navy-deep">
                  Buy online
                </h3>
                <p className="m-0 text-[14px] leading-relaxed text-text-2">
                  Order one or many, delivered to your door.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Shop by category (with individual light tint colours) */}
      <section className="bg-white py-12 sm:py-16">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-8 flex flex-col gap-6 sm:gap-8">
          <div className="flex justify-between items-center gap-3 flex-wrap">
            <h2 className="m-0 text-[32px] sm:text-[40px] lg:text-[44px] font-extrabold font-stretch-112 text-navy-deep tracking-[-0.01em]">
              Shop by category
            </h2>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center h-10 px-5 rounded-full bg-navy-deep hover:bg-brand-navy text-white no-underline font-bold text-[14px] transition-colors shadow-sm"
            >
              View all products
            </Link>
          </div>

          {/* 6 category cards with light tint colours */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {homeCategories.map((c) => (
              <CategoryCard key={c.id} category={c} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. Featured Products (Lilac background, white cards, red + Add button) */}
      <FeaturedTabs
        bestSellers={bestSellers}
        newArrivals={newArrivals}
        specialOffers={specialOffers}
      />

      {/* 7. Navy "Run a shop? Stock Bits N Bobs." Banner with stand photo on the right */}
      <section className="bg-white py-12 sm:py-16">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-8">
          <div className="rounded-[28px] sm:rounded-[32px] overflow-hidden bg-navy-deep text-white shadow-xl grid grid-cols-1 lg:grid-cols-2 items-stretch">
            {/* Left Column: Text & Buttons */}
            <div className="p-8 sm:p-12 lg:p-14 flex flex-col justify-center gap-5 sm:gap-6">
              <span className="text-[13px] sm:text-[14px] font-bold text-brand-yellow uppercase tracking-wider">
                For shops and retailers
              </span>
              <h2 className="m-0 text-[32px] sm:text-[40px] lg:text-[46px] font-extrabold font-stretch-112 leading-[1.08] tracking-[-0.015em]">
                Run a shop? Stock Bits N Bobs.
              </h2>
              <p className="m-0 text-[15px] sm:text-[18px] leading-[1.6] text-soft-on-dark max-w-[28em]">
                Wholesale prices on packs of 6, display stands and free delivery on trade orders of £150 or more.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/trade"
                  className="inline-flex items-center justify-center h-[52px] px-8 rounded-full bg-brand-yellow hover:bg-[#ffe100] text-ink no-underline font-extrabold text-[15px] sm:text-[16px] transition-colors text-center shadow-sm"
                >
                  Become a stockist
                </Link>
                <Link
                  href="/trade?tab=login"
                  className="inline-flex items-center justify-center h-[52px] px-8 rounded-full border-2 border-white hover:bg-white hover:text-navy-deep text-white no-underline font-bold text-[15px] sm:text-[16px] transition-colors text-center"
                >
                  Trade login
                </Link>
              </div>
            </div>

            {/* Right Column: Display Stand Photo */}
            <div className="relative min-h-[320px] sm:min-h-[400px] lg:min-h-[460px] w-full bg-[#2A2170] overflow-hidden">
              <Image
                src="/images/stand.jpg"
                alt="Bits N Bobs display stand full of hanging packs in a shop aisle"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center"
                priority
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
