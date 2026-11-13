'use client';

import React from 'react';
import { WhatsAppIcon } from '@/components/ui/Icons';
import { getWhatsAppUrl } from '@/lib/config';

interface WhatsAppButtonProps {
  isTrade?: boolean;
}

export function WhatsAppButton({ isTrade = false }: WhatsAppButtonProps) {
  const url = getWhatsAppUrl('Hi Bits N Bobs, I have a question');

  return (
    <aside
      aria-label="WhatsApp customer support chat"
      className={`fixed right-4 sm:right-6 z-50 transition-all duration-200 ${
        isTrade ? 'bottom-24 sm:bottom-24' : 'bottom-5 sm:bottom-6'
      }`}
    >
      <div className="relative group flex items-center justify-end">
        {/* "Chat with us" tooltip */}
        <div
          role="tooltip"
          className="pointer-events-none absolute right-full mr-3 px-3 py-1.5 rounded-xl bg-navy-deep text-white text-[13px] font-bold shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 border border-white/10 flex items-center"
        >
          Chat with us
          <span
            aria-hidden="true"
            className="absolute left-full top-1/2 -translate-y-1/2 w-0 h-0 border-y-[5px] border-y-transparent border-l-[6px] border-l-navy-deep"
          />
        </div>

        {/* Round Green WhatsApp Floating Button */}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with us on WhatsApp"
          className="w-14 h-14 min-w-[56px] min-h-[56px] rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center shadow-[0_6px_20px_rgba(37,211,102,0.45)] hover:shadow-[0_8px_25px_rgba(37,211,102,0.6)] hover:scale-105 active:scale-95 transition-all outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40 cursor-pointer"
        >
          <WhatsAppIcon size={32} className="text-white fill-current" />
        </a>
      </div>
    </aside>
  );
}

