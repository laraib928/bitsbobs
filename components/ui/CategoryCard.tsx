import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Category } from '@/lib/data/types';
import { ArrowRightIcon } from './Icons';

interface CategoryCardProps {
  category: Category;
  baseHref?: string;
}

export function CategoryCard({ category, baseHref = '/shop' }: CategoryCardProps) {
  return (
    <Link
      href={`${baseHref}/${category.slug}`}
      className="bg-white rounded-[16px] sm:rounded-[20px] p-3 sm:p-[18px] pb-3.5 sm:pb-5 flex flex-col gap-2.5 sm:gap-3.5 no-underline text-ink border border-line group hover:border-brand-navy hover:shadow-md transition-all duration-200"
    >
      <div className="w-full aspect-square relative bg-surface/50 rounded-xl overflow-hidden flex items-center justify-center p-2">
        <Image
          src={category.image}
          alt={category.name}
          width={220}
          height={220}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 220px)"
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <span className="flex justify-between items-center font-extrabold text-[14px] sm:text-[18px] gap-1.5">
        <span className="truncate">{category.name}</span>
        <span
          aria-hidden="true"
          className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-brand-navy text-white flex items-center justify-center group-hover:bg-brand-red transition-colors flex-none"
        >
          <ArrowRightIcon size={14} className="sm:w-4 sm:h-4" />
        </span>
      </span>
    </Link>
  );
}

