import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  getCategories,
  getProducts,
  getReviews,
  getVideoDemos,
} from '@/lib/data';
import { StockistLogos } from '@/components/ui/StockistLogos';
import { StandFeature } from '@/components/ui/StandFeature';
import { CategoryCard } from '@/components/ui/CategoryCard';
import { FeaturedTabs } from '@/components/ui/FeaturedTabs';
import { VideoCard } from '@/components/ui/VideoCard';
import { ReviewCard } from '@/components/ui/ReviewCard';
import { InstagramIcon, TikTokIcon } from '@/components/ui/Icons';
import { SITE_CONFIG } from '@/lib/config';

export const revalidate = 3600;

export default async function HomePage() {
  const categories = await getCategories();
  const allProducts = await getProducts();
  const reviews = await getReviews();
  const videos = await getVideoDemos();

  const bestSellers = allProducts.filter((p) => p.flags.bestSeller);
  const newArrivals = allProducts.filter((p) => p.flags.newArrival);
  const specialOffers = allProducts.filter((p) => p.flags.specialOffer);

  // Take the 6 primary categories for the home grid
  const homeCategories = categories.slice(0, 6);

  return (
    <div className="w-full">
      {/* 1. Hero Section */}
      <section className="bg-navy-deep text-white relative overflow-hidden">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-8 py-12 lg:py-[56px] grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-[48px] items-start">
          {/* Left Column */}
          <div className="flex flex-col gap-5 sm:gap-7 relative z-10">
            <p className="m-0 text-[14px] sm:text-[16px] font-semibold text-brand-yellow">
              Handy. Pre-packed. Great value.
            </p>
            <h1 className="m-0 text-[clamp(36px,9.5vw,44px)] sm:text-[60px] lg:text-[clamp(48px,4.6vw,66px)] leading-[1.05] sm:leading-[0.98] lg:leading-[1.02] font-extrabold font-stretch-115 lg:[font-stretch:normal] lg:[font-variation-settings:'wdth'_100] tracking-[-0.02em]">
              All the little<br className="hidden lg:inline" /> things you<br className="hidden lg:inline" /> always run out<br className="hidden lg:inline" /> of.
            </h1>
            <p className="m-0 text-[16px] sm:text-[20px] leading-[1.55] text-soft-on-dark max-w-[31em]">
              Combs, fuses, tape, party candles, kitchen tools and more. Buy one
              or as many as you like, delivered to your door. Run a shop? Stock
              the full range.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link
                href="/shop"
                className="w-full sm:w-auto inline-flex items-center justify-center h-[54px] sm:h-[58px] px-8 rounded-full bg-brand-yellow hover:bg-[#ffe100] text-ink no-underline font-extrabold text-[16px] sm:text-[17px] min-h-[44px] transition-colors text-center"
              >
                Shop now
              </Link>
              <Link
                href="/trade"
                className="w-full sm:w-auto inline-flex items-center justify-center h-[54px] sm:h-[58px] px-[30px] rounded-full border-2 border-white hover:bg-white hover:text-navy-deep text-white no-underline font-bold text-[16px] sm:text-[17px] min-h-[44px] transition-colors text-center"
              >
                Become a stockist
              </Link>
            </div>
            <dl className="m-0 mt-3 grid grid-cols-3 gap-2 sm:gap-4 pt-6 border-t border-white/20">
              <div>
                <dt className="text-[12px] sm:text-[14px] text-soft-on-dark-2 leading-tight">
                  Retail stockists
                </dt>
                <dd className="m-0 mt-1 text-[20px] sm:text-[28px] lg:text-[34px] font-extrabold font-stretch-110">
                  10,000+
                </dd>
              </div>
              <div>
                <dt className="text-[12px] sm:text-[14px] text-soft-on-dark-2 leading-tight">Trusted since</dt>
                <dd className="m-0 mt-1 text-[20px] sm:text-[28px] lg:text-[34px] font-extrabold font-stretch-110">
                  1994
                </dd>
              </div>
              <div>
                <dt className="text-[12px] sm:text-[14px] text-soft-on-dark-2 leading-tight">
                  Products to choose from
                </dt>
                <dd className="m-0 mt-1 text-[20px] sm:text-[28px] lg:text-[34px] font-extrabold font-stretch-110">
                  125
                </dd>
              </div>
            </dl>
          </div>

          {/* Right Column: Hero Product Pyramid matching screenshot */}
          <div
            aria-hidden="true"
            style={{ aspectRatio: '49 / 44' }}
            className="relative select-none hidden min-[480px]:block w-full max-lg:max-w-[560px] max-lg:mx-auto max-lg:mt-6 lg:max-w-[620px] lg:mt-0 lg:ml-auto lg:self-start"
          >
            {/* Yellow diamond (behind everything, z-index 0) */}
            <div className="absolute left-[22.3%] top-[14.7%] w-[63.5%] aspect-square border-[3px] border-[#FFEC00] rotate-45 pointer-events-none z-0" />

            {/* Top row (z-index 1) */}
            {/* Birthday Candles: left 30.6%, top 15.9%, width 22.4% */}
            <div className="absolute left-[30.6%] top-[15.9%] w-[22.4%] aspect-square bg-white rounded-[14px] p-[6px] shadow-[0_20px_40px_-16px_rgba(0,0,0,0.55)] z-[1] transition-transform hover:scale-105">
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
            <div className="absolute left-[53.7%] top-[18.6%] w-[22.4%] aspect-square bg-white rounded-[14px] p-[6px] shadow-[0_20px_40px_-16px_rgba(0,0,0,0.55)] z-[1] transition-transform hover:scale-105">
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
            <div className="absolute left-[12.2%] top-[41.4%] w-[24.5%] aspect-square bg-white rounded-[14px] p-[6px] shadow-[0_20px_40px_-16px_rgba(0,0,0,0.55)] z-[2] transition-transform hover:scale-105">
              <Image
                src="/images/bottle-opener.jpg"
                alt=""
                width={150}
                height={150}
                priority
                className="block w-full h-full aspect-square object-contain"
              />
            </div>

            {/* False Nails: left 37.3%, top 38.2%, width 28%, z-index 3 (sits over neighbours) with yellow 99p tag */}
            <div className="absolute left-[37.3%] top-[38.2%] w-[28%] aspect-square bg-white rounded-[14px] p-[6px] shadow-[0_20px_40px_-16px_rgba(0,0,0,0.55)] z-[3] transition-transform hover:scale-105">
              <Image
                src="/images/false-nails.jpg"
                alt=""
                width={160}
                height={160}
                priority
                className="block w-full h-full aspect-square object-contain"
              />
              <span className="absolute -right-[6px] bottom-[14px] bg-[#FFEC00] text-ink text-[15px] font-black px-[10px] py-[4px] rounded-[8px] shadow-md leading-none">
                99p
              </span>
            </div>

            {/* Vent Brush: left 63.7%, top 42.3%, width 25.7% */}
            <div className="absolute left-[63.7%] top-[42.3%] w-[25.7%] aspect-square bg-white rounded-[14px] p-[6px] shadow-[0_20px_40px_-16px_rgba(0,0,0,0.55)] z-[2] transition-transform hover:scale-105">
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
            <div className="absolute left-[1%] top-[66.6%] w-[26.5%] aspect-square bg-white rounded-[14px] p-[6px] shadow-[0_20px_40px_-16px_rgba(0,0,0,0.55)] z-[4] transition-transform hover:scale-105">
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
            <div className="absolute left-[24.1%] top-[63.6%] w-[31%] aspect-square bg-white rounded-[14px] p-[6px] shadow-[0_22px_46px_-18px_rgba(0,0,0,0.7)] z-[6] transition-transform hover:scale-105">
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
            <div className="absolute left-[51%] top-[70.5%] w-[24.5%] aspect-square bg-white rounded-[14px] p-[6px] shadow-[0_20px_40px_-16px_rgba(0,0,0,0.55)] z-[5] transition-transform hover:scale-105">
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
            <div className="absolute left-[72.9%] top-[69.3%] w-[25.1%] aspect-square bg-white rounded-[14px] p-[6px] shadow-[0_20px_40px_-16px_rgba(0,0,0,0.55)] z-[4] transition-transform hover:scale-105">
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
        </div>
      </section>

      {/* 2. Stockists Section */}
      <StockistLogos />

      {/* 3. Stand Feature Section (For Retailers) */}
      <StandFeature />

      {/* 4. Shop by Category */}
      <section className="bg-surface">
        <div className="max-w-[1320px] mx-auto py-12 sm:py-[88px] px-4 sm:px-8 flex flex-col gap-6 sm:gap-8">
          <div className="flex justify-between items-end gap-3 flex-wrap">
            <h2 className="m-0 text-[32px] sm:text-[40px] lg:text-[44px] font-extrabold font-stretch-112 text-navy-deep tracking-[-0.01em]">
              Shop by category
            </h2>
            <Link
              href="/shop"
              className="text-brand-navy hover:text-brand-red no-underline font-bold text-[15px] sm:text-[16px] min-h-[44px] inline-flex items-center transition-colors"
            >
              View our products
            </Link>
          </div>
          {/* 2 columns on phone, 3 on tablet, 6 on desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {homeCategories.map((c) => (
              <CategoryCard key={c.id} category={c} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Featured Products (Best sellers / New / Offers) */}
      <FeaturedTabs
        bestSellers={bestSellers}
        newArrivals={newArrivals}
        specialOffers={specialOffers}
      />

      {/* 6. Why Bits N Bobs (Yellow band) */}
      <section id="why" className="bg-brand-yellow">
        <div className="max-w-[1320px] mx-auto py-12 sm:py-[72px] px-4 sm:px-8 flex flex-col gap-6 sm:gap-8">
          {/* Headline about 32px on phone/tablet */}
          <h2 className="m-0 text-[28px] sm:text-[32px] lg:text-[46px] leading-tight font-extrabold font-stretch-115 tracking-[-0.02em] text-ink max-w-[18em]">
            Small things, sorted. Why people love Bits N Bobs.
          </h2>
          {/* 1 column on phone, 2 on tablet, 4 on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-[20px] p-5 sm:p-[26px] flex flex-col gap-2 shadow-sm">
              <strong className="text-[18px] sm:text-[20px] text-ink font-bold">125 handy products</strong>
              <span className="text-[14px] sm:text-[16px] leading-[1.5] text-text-2">
                From nail care to fuses, party candles to kitchen tools.
              </span>
            </div>
            <div className="bg-white rounded-[20px] p-5 sm:p-[26px] flex flex-col gap-2 shadow-sm">
              <strong className="text-[18px] sm:text-[20px] text-ink font-bold">Great value</strong>
              <span className="text-[14px] sm:text-[16px] leading-[1.5] text-text-2">
                Everyday essentials at friendly prices, clearly shown on every
                pack.
              </span>
            </div>
            <div className="bg-white rounded-[20px] p-5 sm:p-[26px] flex flex-col gap-2 shadow-sm">
              <strong className="text-[18px] sm:text-[20px] text-ink font-bold">Buy one or many</strong>
              <span className="text-[14px] sm:text-[16px] leading-[1.5] text-text-2">
                No minimum order. Pay securely by card.
              </span>
            </div>
            <div className="bg-white rounded-[20px] p-5 sm:p-[26px] flex flex-col gap-2 shadow-sm">
              <strong className="text-[18px] sm:text-[20px] text-ink font-bold">Trusted since 1994</strong>
              <span className="text-[14px] sm:text-[16px] leading-[1.5] text-text-2">
                Stocked by over 10,000 shops across the UK.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Videos Section ("See them in action") */}
      <section id="social" className="bg-navy-deep text-white">
        <div className="max-w-[1320px] mx-auto py-12 sm:py-[88px] px-4 sm:px-8 flex flex-col gap-6 sm:gap-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-5">
            <div>
              <h2 className="m-0 text-[32px] sm:text-[40px] lg:text-[44px] font-extrabold font-stretch-112 tracking-[-0.01em]">
                See them in action
              </h2>
              <p className="mt-1.5 mb-0 text-[15px] sm:text-[17px] text-soft-on-dark">
                Quick product demos, straight from our TikTok and Instagram.
              </p>
            </div>
            {/* Follow buttons: stack on phone under heading */}
            <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
              <a
                href={SITE_CONFIG.socialLinks.tiktok}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 min-h-[44px] px-[18px] rounded-full bg-white hover:bg-surface text-ink no-underline font-bold transition-colors text-center"
              >
                <TikTokIcon size={18} />
                <span>Follow on TikTok</span>
              </a>
              <a
                href={SITE_CONFIG.socialLinks.instagram}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 min-h-[44px] px-[18px] rounded-full border-2 border-white hover:bg-white hover:text-navy-deep text-white no-underline font-bold transition-colors text-center"
              >
                <InstagramIcon size={18} />
                <span>Instagram</span>
              </a>
            </div>
          </div>

          {/* Videos as horizontal swipe carousel (scroll-snap) on phone, 70% card width */}
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 -mx-4 px-4 pb-4 no-scrollbar sm:grid sm:grid-cols-2 md:grid-cols-4 sm:gap-4 sm:mx-0 sm:px-0 sm:pb-0">
            {videos.map((v) => (
              <div
                key={v.id}
                className="flex-none w-[70vw] max-w-[280px] snap-center sm:w-auto sm:max-w-none"
              >
                <VideoCard video={v} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Customer Reviews */}
      <section className="bg-white">
        <div className="max-w-[1320px] mx-auto py-12 sm:py-[88px] px-4 sm:px-8 flex flex-col gap-6 sm:gap-8">
          <h2 className="m-0 text-[32px] sm:text-[40px] lg:text-[44px] font-extrabold font-stretch-112 text-navy-deep tracking-[-0.01em]">
            What our customers say
          </h2>
          {/* Reviews as horizontal swipe carousel on phone */}
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 -mx-4 px-4 pb-4 no-scrollbar md:grid md:grid-cols-3 md:gap-4 md:mx-0 md:px-0 md:pb-0">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="flex-none w-[82vw] max-w-[340px] snap-center md:w-auto md:max-w-none flex"
              >
                <ReviewCard review={r} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Two Ways to Buy */}
      <section className="bg-surface">
        <div className="max-w-[1320px] mx-auto py-12 sm:py-[88px] px-4 sm:px-8 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: Public */}
          <div className="rounded-[24px] bg-white p-6 sm:p-11 flex flex-col gap-4 sm:gap-5 border border-line shadow-sm">
            <p className="m-0 text-[14px] sm:text-[15px] font-bold text-brand-red">
              Shopping for yourself?
            </p>
            <h3 className="m-0 text-[28px] sm:text-[36px] font-extrabold font-stretch-112 text-navy-deep">
              Shop online
            </h3>
            <ul className="m-0 pl-5 flex flex-col gap-2.5 text-[15px] sm:text-[17px] text-text-2 leading-[1.5]">
              <li>Buy one item or as many as you like</li>
              <li>No account needed</li>
              <li>Secure card payment, delivered to your door</li>
            </ul>
            <Link
              href="/shop"
              className="w-full sm:w-auto sm:self-start inline-flex items-center justify-center min-h-[44px] h-[52px] sm:h-[54px] px-7 rounded-full bg-brand-red hover:bg-[#c9000b] text-white no-underline font-extrabold transition-colors mt-auto text-center"
            >
              Shop now
            </Link>
          </div>

          {/* Card 2: Trade */}
          <div className="rounded-[24px] bg-brand-navy text-white p-6 sm:p-11 flex flex-col gap-4 sm:gap-5 shadow-sm">
            <p className="m-0 text-[14px] sm:text-[15px] font-bold text-brand-yellow">
              Run a shop?
            </p>
            <h3 className="m-0 text-[28px] sm:text-[36px] font-extrabold font-stretch-112">
              Become a stockist
            </h3>
            <ul className="m-0 pl-5 flex flex-col gap-2.5 text-[15px] sm:text-[17px] text-[#E4E2F5] leading-[1.5]">
              <li>Wholesale prices on packs of 6</li>
              <li>Fully stocked display stands</li>
              <li>Free delivery on orders of £150 or more</li>
              <li>Order history, reorders and trade promotions</li>
            </ul>
            <div className="flex flex-col sm:flex-row gap-3 w-full mt-auto pt-2">
              <Link
                href="/trade"
                className="w-full sm:w-auto inline-flex items-center justify-center min-h-[44px] h-[52px] sm:h-[54px] px-[26px] rounded-full bg-brand-yellow hover:bg-[#ffe100] text-ink no-underline font-extrabold transition-colors text-center"
              >
                Become a stockist
              </Link>
              <Link
                href="/trade"
                className="w-full sm:w-auto inline-flex items-center justify-center min-h-[44px] h-[52px] sm:h-[54px] px-[26px] rounded-full border-2 border-white hover:bg-white hover:text-brand-navy text-white no-underline font-bold transition-colors text-center"
              >
                Trade login
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

