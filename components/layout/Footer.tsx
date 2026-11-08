import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SITE_CONFIG } from '@/lib/config';
import { FacebookIcon, InstagramIcon, TikTokIcon } from '@/components/ui/Icons';

export function Footer() {
  return (
    <footer className="bg-ink text-[#D6D4EE] mt-auto">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-8 pt-12 sm:pt-16 pb-8 flex flex-col gap-8 sm:gap-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-7 sm:gap-8">
          {/* Brand info: full width on phone, 1 column on md/lg */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            <Link href="/" aria-label="Bits N Bobs home" className="self-start inline-flex items-center min-h-[44px]">
              <Image
                src="/images/logo.png"
                alt="Bits 'N' Bobs"
                width={150}
                height={44}
                className="h-10 sm:h-11 w-auto"
              />
            </Link>
            <p className="m-0 text-[14px] sm:text-[15px] leading-relaxed text-[#D6D4EE]">
              Serving your everyday needs since {SITE_CONFIG.sinceYear}.
            </p>
            <div className="flex gap-2.5">
              <a
                href={SITE_CONFIG.socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-[#2A2170] hover:bg-[#392d99] text-white flex items-center justify-center transition-colors"
              >
                <FacebookIcon size={18} />
              </a>
              <a
                href={SITE_CONFIG.socialLinks.instagram}
                aria-label="Instagram"
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-[#2A2170] hover:bg-[#392d99] text-white flex items-center justify-center transition-colors"
              >
                <InstagramIcon size={18} />
              </a>
              <a
                href={SITE_CONFIG.socialLinks.tiktok}
                aria-label="TikTok"
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-[#2A2170] hover:bg-[#392d99] text-white flex items-center justify-center transition-colors"
              >
                <TikTokIcon size={18} />
              </a>
            </div>
          </div>

          {/* Shop links: 1 col on phone */}
          <div className="col-span-1 flex flex-col gap-2.5 text-[15px]">
            <strong className="text-white font-bold">Shop</strong>
            <Link href="/shop" className="text-[#D6D4EE] hover:text-[#FFEC00] no-underline transition-colors py-1">
              All products
            </Link>
            <Link href="/shop?tab=fresh" className="text-[#D6D4EE] hover:text-[#FFEC00] no-underline transition-colors py-1">
              New arrivals
            </Link>
            <Link href="/shop?tab=offers" className="text-[#D6D4EE] hover:text-[#FFEC00] no-underline transition-colors py-1">
              Special offers
            </Link>
          </div>

          {/* Trade links: 1 col on phone */}
          <div className="col-span-1 flex flex-col gap-2.5 text-[15px]">
            <strong className="text-white font-bold">Trade</strong>
            <Link href="/trade" className="text-[#D6D4EE] hover:text-[#FFEC00] no-underline transition-colors py-1">
              Trade login
            </Link>
            <Link href="/trade" className="text-[#D6D4EE] hover:text-[#FFEC00] no-underline transition-colors py-1">
              Become a stockist
            </Link>
            <Link href="/trade/stands/80-hook-display-stand" className="text-[#D6D4EE] hover:text-[#FFEC00] no-underline transition-colors py-1">
              Display stands
            </Link>
          </div>

          {/* Help links: 1 col on phone */}
          <div className="col-span-1 flex flex-col gap-2.5 text-[15px]">
            <strong className="text-white font-bold">Help</strong>
            <a href="#" className="text-[#D6D4EE] hover:text-[#FFEC00] no-underline transition-colors py-1">
              Delivery
            </a>
            <a href="#" className="text-[#D6D4EE] hover:text-[#FFEC00] no-underline transition-colors py-1">
              Returns
            </a>
            <a href="#" className="text-[#D6D4EE] hover:text-[#FFEC00] no-underline transition-colors py-1">
              Privacy policy
            </a>
            <a href="#" className="text-[#D6D4EE] hover:text-[#FFEC00] no-underline transition-colors py-1">
              Terms
            </a>
          </div>

          {/* Talk to us: 1 col on phone */}
          <div className="col-span-1 flex flex-col gap-2.5 text-[15px]">
            <strong className="text-white font-bold">Talk to us</strong>
            <a
              href={SITE_CONFIG.telLink}
              className="text-[#FFEC00] hover:underline no-underline font-extrabold text-[18px] sm:text-[22px] py-1 inline-flex items-center min-h-[44px]"
            >
              {SITE_CONFIG.phone}
            </a>
            <a
              href={`mailto:${SITE_CONFIG.email}`}
              className="text-[#D6D4EE] hover:text-[#FFEC00] no-underline transition-colors py-1 inline-flex items-center min-h-[44px] break-all"
            >
              {SITE_CONFIG.email}
            </a>
          </div>
        </div>

        {/* Bottom copyright line */}
        <p className="m-0 pt-6 border-t border-[#2E2A52] text-[13px] text-[#A9A6C8]">
          © 2026 Bits &apos;N&apos; Bobs. Company no. {SITE_CONFIG.placeholders.companyNumber}. VAT no. {SITE_CONFIG.placeholders.vatNumber}.
        </p>
      </div>
    </footer>
  );
}

