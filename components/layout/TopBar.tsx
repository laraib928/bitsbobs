import React from 'react';
import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/config';
import { FacebookIcon, InstagramIcon, TikTokIcon } from '@/components/ui/Icons';

interface TopBarProps {
  variant?: 'public' | 'trade';
}

export function TopBar({ variant = 'public' }: TopBarProps) {
  const isTrade = variant === 'trade';

  return (
    <div className={`${isTrade ? 'bg-[#1D1650]' : 'bg-[#14112E]'} text-white text-[14px]`}>
      <div className="max-w-[1320px] mx-auto px-4 sm:px-8 py-2 sm:py-[10px] flex flex-wrap gap-x-8 gap-y-2 justify-between items-center">
        {/* On mobile / below md, hide long text and show only phone and social icons */}
        <span className="hidden md:inline">
          {isTrade
            ? 'Trade area: wholesale prices shown. Free delivery on orders of £150 or more.'
            : 'Serving your everyday needs since 1994. No minimum order online.'}
        </span>
        <div className="flex gap-4 sm:gap-5 items-center justify-between w-full md:w-auto">
          <a
            href={SITE_CONFIG.telLink}
            className="text-[#FFEC00] hover:underline no-underline font-bold inline-flex items-center min-h-[44px] py-1 text-[13px] sm:text-[14px]"
          >
            {isTrade ? `Sales: ${SITE_CONFIG.phone}` : SITE_CONFIG.phone}
          </a>
          {!isTrade && (
            <div className="flex gap-2 sm:gap-3 items-center">
              <a
                href={SITE_CONFIG.socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Bits N Bobs on Facebook"
                className="text-white hover:text-[#FFEC00] flex items-center justify-center w-11 h-11 min-w-[44px] min-h-[44px] transition-colors"
              >
                <FacebookIcon size={18} />
              </a>
              <a
                href={SITE_CONFIG.socialLinks.instagram}
                aria-label="Bits N Bobs on Instagram"
                className="text-white hover:text-[#FFEC00] flex items-center justify-center w-11 h-11 min-w-[44px] min-h-[44px] transition-colors"
              >
                <InstagramIcon size={18} />
              </a>
              <a
                href={SITE_CONFIG.socialLinks.tiktok}
                aria-label="Bits N Bobs on TikTok"
                className="text-white hover:text-[#FFEC00] flex items-center justify-center w-11 h-11 min-w-[44px] min-h-[44px] transition-colors"
              >
                <TikTokIcon size={18} />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

