import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Category } from '@/lib/data/types';
import { ArrowRightIcon } from './Icons';

interface CategoryCardProps {
  category: Category;
  baseHref?: string;
  tintBg?: string;
  tintBorder?: string;
}

const TINT_MAP: Record<string, { bg: string; border: string }> = {
  cosmetics: { bg: 'bg-[#FDF2F4]', border: 'border-[#F9D2D9]' },
  household: { bg: 'bg-[#EFF6FF]', border: 'border-[#BFDBFE]' },
  diy: { bg: 'bg-[#FEFCE8]', border: 'border-[#FEF08A]' },
  kitchenware: { bg: 'bg-[#F0FDF4]', border: 'border-[#BBF7D0]' },
  'hair-products': { bg: 'bg-[#F5F3FF]', border: 'border-[#DDD6FE]' },
  party: { bg: 'bg-[#FDF4FF]', border: 'border-[#F5D0FE]' },
};

const DEFAULT_TINTS = [
  { bg: 'bg-[#FDF2F4]', border: 'border-[#F9D2D9]' },
  { bg: 'bg-[#EFF6FF]', border: 'border-[#BFDBFE]' },
  { bg: 'bg-[#FEFCE8]', border: 'border-[#FEF08A]' },
  { bg: 'bg-[#F0FDF4]', border: 'border-[#BBF7D0]' },
  { bg: 'bg-[#F5F3FF]', border: 'border-[#DDD6FE]' },
  { bg: 'bg-[#FDF4FF]', border: 'border-[#F5D0FE]' },
];

export function CategoryCard({
  category,
  baseHref = '/shop',
  tintBg,
  tintBorder,
}: CategoryCardProps) {
  const mapped = TINT_MAP[category.slug];
  const bgClass = tintBg || mapped?.bg || 'bg-white';
  const borderClass = tintBorder || mapped?.border || 'border-line';

  return (
    <Link
      href={`${baseHref}/${category.slug}`}
      className={`${bgClass} rounded-[20px] p-3.5 sm:p-5 flex flex-col items-center text-center gap-2.5 sm:gap-3 no-underline text-ink border ${borderClass} group hover:shadow-md hover:-translate-y-1 transition-all duration-200`}
    >
      <div className="w-full aspect-square relative bg-white rounded-2xl overflow-hidden flex items-center justify-center p-2.5 shadow-sm">
        <Image
          src={category.image}
          alt={category.name}
          width={220}
          height={220}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 220px)"
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="flex flex-col items-center gap-0.5">
        <strong className="font-extrabold text-[15px] sm:text-[17px] text-ink group-hover:text-brand-red transition-colors">
          {category.name}
        </strong>
        <span className="text-[12px] sm:text-[13px] font-semibold text-muted group-hover:underline">
          Shop now →
        </span>
      </div>
    </Link>
  );
}

