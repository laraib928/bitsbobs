'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/data/types';
import { formatMoney } from '@/lib/money';
import { useCartStore } from '@/lib/cart/store';
import { PlayIcon, StarIcon } from '@/components/ui/Icons';
import { SITE_CONFIG } from '@/lib/config';

interface ProductPublicViewProps {
  product: Product;
  categoryName: string;
  categorySlug: string;
  relatedProducts: Product[];
}

export function ProductPublicView({
  product,
  categoryName,
  categorySlug,
  relatedProducts,
}: ProductPublicViewProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const addPublicItem = useCartStore((state) => state.addPublicItem);

  const images =
    product.images && product.images.length > 0
      ? product.images
      : ['/images/hair-grips.jpg'];

  const currentImage = images[selectedImageIndex] || images[0];

  const handleAddToBasket = () => {
    addPublicItem(
      {
        productId: product.id,
        name: product.name,
        image: currentImage,
        pricePence: product.retailPricePence,
      },
      quantity
    );
  };

  const priceFormatted = formatMoney(product.retailPricePence, {
    allowPenceOnly: true,
  });

  return (
    <main className="max-w-[1320px] mx-auto px-8 pt-8 pb-20 flex flex-col gap-16">
      {/* Breadcrumbs */}
      <p className="m-0 text-[14px] text-muted">
        <Link href="/" className="text-brand-navy hover:text-brand-red no-underline">
          Home
        </Link>{' '}
        /{' '}
        <Link
          href={`/shop/${categorySlug}`}
          className="text-brand-navy hover:text-brand-red no-underline"
        >
          {categoryName}
        </Link>{' '}
        / <span className="text-ink">{product.name}</span>
      </p>

      {/* Main product showcase: Gallery + Buy box */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(min(100%,480px),1fr)_1fr] gap-14 items-start">
        {/* Gallery */}
        <div className="flex flex-col gap-3.5">
          <div className="bg-surface rounded-[24px] p-10 flex justify-center items-center">
            <Image
              src={currentImage}
              alt={`Bits N Bobs ${product.name}, photo`}
              width={460}
              height={460}
              priority
              className="w-full max-w-[460px] aspect-square object-contain mix-blend-multiply transition-all duration-300"
            />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {images.map((img, idx) => (
              <button
                key={img}
                type="button"
                onClick={() => setSelectedImageIndex(idx)}
                aria-label={idx === 0 ? 'Front of pack' : 'Alternative pack'}
                className={`rounded-[14px] bg-surface p-2 cursor-pointer transition-colors ${
                  selectedImageIndex === idx
                    ? 'border-2 border-brand-navy'
                    : 'border border-line hover:border-muted'
                }`}
              >
                <Image
                  src={img}
                  alt=""
                  width={90}
                  height={90}
                  className="w-full aspect-square object-contain mix-blend-multiply"
                />
              </button>
            ))}
            {/* In-use placeholder thumb */}
            <div
              className="border border-dashed border-field-border rounded-[14px] bg-surface p-2 flex items-center justify-center text-center text-[12px] text-muted aspect-square select-none"
            >
              {SITE_CONFIG.placeholders.inUsePhoto}
            </div>
            {/* Video thumb */}
            <button
              type="button"
              aria-label="Play product video"
              className="relative border border-line rounded-[14px] bg-navy-deep p-0 cursor-pointer flex items-center justify-center aspect-square group overflow-hidden"
            >
              <span className="w-11 h-11 rounded-full bg-brand-red flex items-center justify-center group-hover:scale-110 transition-transform">
                <PlayIcon size={18} className="text-white ml-0.5" />
              </span>
            </button>
          </div>
        </div>

        {/* Buy Box */}
        <div className="flex flex-col gap-[22px]">
          <div>
            <p className="m-0 mb-2 text-[14px] text-muted">{categoryName}</p>
            <h1 className="m-0 text-[38px] sm:text-[50px] leading-[1.04] font-extrabold font-stretch-112 text-navy-deep">
              {product.name}
            </h1>
            <p className="mt-2.5 mb-0 flex items-center gap-2 text-[15px] text-muted">
              <span aria-hidden="true" className="text-[#F5B700] tracking-[2px]">
                ★★★★★
              </span>
              <span>
                {SITE_CONFIG.placeholders.rating} from{' '}
                {SITE_CONFIG.placeholders.reviewsCount} reviews
              </span>
            </p>
          </div>

          <div className="flex items-baseline gap-3">
            <strong className="text-[44px] font-extrabold text-navy-deep">
              {priceFormatted}
            </strong>
            <span className="text-[15px] text-muted">each, including VAT</span>
          </div>

          <p className="m-0 text-[18px] leading-[1.6] text-text-2">
            {product.description}
          </p>

          <p className="m-0 flex items-center gap-2 text-[16px] font-bold text-success">
            <span aria-hidden="true" className="w-2.5 h-2.5 rounded-full bg-success flex-none" />
            In stock, ready to send
          </p>

          {/* Stepper + Add to Basket */}
          <div className="flex gap-3 flex-wrap">
            <div className="grid grid-cols-[52px_64px_52px] h-[58px] border border-field-border rounded-full overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label="Remove one"
                className="border-0 bg-transparent text-[22px] font-bold text-brand-navy hover:bg-surface cursor-pointer flex items-center justify-center"
              >
                −
              </button>
              <label className="flex">
                <span className="sr-only">Quantity</span>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))
                  }
                  className="w-full border-0 text-center font-sans font-bold text-[18px] text-ink outline-none"
                />
              </label>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                aria-label="Add one"
                className="border-0 bg-transparent text-[22px] font-bold text-brand-navy hover:bg-surface cursor-pointer flex items-center justify-center"
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={handleAddToBasket}
              className="flex-1 basis-[220px] flex items-center justify-center h-[58px] rounded-full bg-brand-red hover:bg-[#c9000b] text-white no-underline font-extrabold text-[18px] border-0 cursor-pointer shadow-sm transition-colors"
            >
              Add to basket
            </button>
          </div>

          {/* 3 bullet pills */}
          <ul className="m-0 p-0 list-none grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[14px] text-text-2">
            <li className="bg-surface rounded-xl p-3 sm:px-3.5">
              No minimum order
            </li>
            <li className="bg-surface rounded-xl p-3 sm:px-3.5">
              Secure card payment
            </li>
            <li className="bg-surface rounded-xl p-3 sm:px-3.5">
              Delivery cost shown at checkout
            </li>
          </ul>

          {/* Trade teaser banner */}
          <div className="border border-line rounded-[16px] p-4 sm:px-5 flex flex-wrap gap-3 items-center justify-between">
            <span className="text-[15px] text-text-2">
              <strong className="text-ink">Run a shop?</strong> Buy packs of 6 at
              trade prices.
            </span>
            <span className="flex gap-3.5 font-bold text-[15px]">
              <Link
                href="/trade"
                className="text-brand-navy hover:text-brand-red no-underline transition-colors"
              >
                Trade login
              </Link>
              <Link
                href="/trade"
                className="text-brand-navy hover:text-brand-red no-underline transition-colors"
              >
                Become a stockist
              </Link>
            </span>
          </div>
        </div>
      </div>

      {/* Features and Benefits + Video */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="flex flex-col gap-4">
          <h2 className="m-0 text-[34px] font-extrabold font-stretch-110 text-navy-deep">
            Features and benefits
          </h2>
          <ul className="m-0 p-0 list-none flex flex-col">
            {product.features.map((feat, idx) => {
              const isLast = idx === product.features.length - 1;
              return (
                <li
                  key={idx}
                  className={`py-3.5 border-t border-line text-[17px] ${
                    isLast ? 'border-b' : ''
                  }`}
                >
                  <strong className="text-ink">{feat}</strong>
                  <span className="block text-muted text-[15px]">
                    {SITE_CONFIG.placeholders.featureDetail}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="m-0 text-[34px] font-extrabold font-stretch-110 text-navy-deep">
            Watch it in use
          </h2>
          <div className="relative aspect-video rounded-[20px] bg-navy-deep overflow-hidden flex items-center justify-center">
            <Image
              src={currentImage}
              alt=""
              width={300}
              height={300}
              className="absolute h-4/5 aspect-square object-contain opacity-25"
            />
            <button
              type="button"
              aria-label="Play product video"
              className="relative w-20 h-20 rounded-full border-0 bg-brand-red hover:bg-[#c9000b] flex items-center justify-center cursor-pointer transition-transform hover:scale-105 shadow-lg"
            >
              <PlayIcon size={30} className="text-white ml-1" />
            </button>
            <span className="absolute left-5 bottom-4 text-white text-[14px]">
              {SITE_CONFIG.placeholders.productDemoVideo}
            </span>
          </div>
        </div>
      </section>

      {/* Customer reviews */}
      <section className="flex flex-col gap-5">
        <div className="flex justify-between items-end flex-wrap gap-3">
          <h2 className="m-0 text-[34px] font-extrabold font-stretch-110 text-navy-deep">
            Customer reviews
          </h2>
          <button
            type="button"
            className="font-bold text-brand-navy hover:text-brand-red bg-transparent border-0 cursor-pointer text-[15px]"
          >
            Write a review
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <figure className="m-0 border border-line rounded-[18px] p-[22px] bg-white">
            <span aria-hidden="true" className="text-[#F5B700] tracking-[2px]">
              ★★★★★
            </span>
            <blockquote className="my-2.5 text-[16px] leading-[1.55] text-text-2">
              &ldquo;{SITE_CONFIG.placeholders.customerReviewText}&rdquo;
            </blockquote>
            <figcaption className="text-[14px] text-muted">
              {SITE_CONFIG.placeholders.customerName}, verified buyer
            </figcaption>
          </figure>
          <figure className="m-0 border border-line rounded-[18px] p-[22px] bg-white">
            <span aria-hidden="true" className="text-[#F5B700] tracking-[2px]">
              ★★★★★
            </span>
            <blockquote className="my-2.5 text-[16px] leading-[1.55] text-text-2">
              &ldquo;{SITE_CONFIG.placeholders.customerReviewText}&rdquo;
            </blockquote>
            <figcaption className="text-[14px] text-muted">
              {SITE_CONFIG.placeholders.customerName}, verified buyer
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Related Products: You might also need */}
      <section className="flex flex-col gap-[22px]">
        <h2 className="m-0 text-[34px] font-extrabold font-stretch-110 text-navy-deep">
          You might also need
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {relatedProducts.map((rel) => (
            <Link
              key={rel.id}
              href={`/products/${rel.slug}`}
              className="rounded-[18px] bg-surface p-3.5 flex flex-col gap-2.5 no-underline text-ink hover:shadow-md transition-shadow"
            >
              <div className="w-full aspect-square bg-white rounded-xl p-2 flex items-center justify-center">
                <Image
                  src={rel.images[0] || '/images/hair-grips.jpg'}
                  alt={rel.name}
                  width={150}
                  height={150}
                  className="w-full h-full object-contain"
                />
              </div>
              <strong className="text-[16px] font-bold line-clamp-1">
                {rel.name}
              </strong>
              <span className="text-[18px] font-extrabold text-navy-deep">
                {formatMoney(rel.retailPricePence, { allowPenceOnly: true })}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

