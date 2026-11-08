import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { VideoDemo } from '@/lib/data/types';
import { PlayIcon } from './Icons';
import { SITE_CONFIG } from '@/lib/config';

interface VideoCardProps {
  video: VideoDemo;
}

export function VideoCard({ video }: VideoCardProps) {
  return (
    <Link
      href={`/products/${video.slug}`}
      className="relative block aspect-[9/16] rounded-[20px] overflow-hidden bg-white no-underline text-white group shadow-sm hover:shadow-lg transition-transform duration-200 hover:-translate-y-1"
    >
      <div className="absolute inset-0 p-6 pb-[120px] flex items-center justify-center">
        <Image
          src={video.image}
          alt={video.title}
          width={300}
          height={300}
          sizes="(max-width: 640px) 70vw, (max-width: 1024px) 33vw, 300px"
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Play button overlay */}
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-brand-red text-white flex items-center justify-center shadow-[0_10px_30px_-8px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-200"
      >
        <PlayIcon size={26} className="ml-1" />
      </span>

      {/* Caption at bottom */}
      <span className="absolute left-0 right-0 bottom-0 p-[18px] bg-ink flex flex-col gap-1">
        <strong className="text-[16px] text-white leading-tight font-bold">
          {video.title}
        </strong>
        <span className="text-[13px] text-[#B9B5E0]">
          {SITE_CONFIG.placeholders.productDemoVideo}
        </span>
      </span>
    </Link>
  );
}

