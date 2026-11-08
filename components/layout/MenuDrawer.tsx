'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CloseIcon, ChevronDownIcon, ChevronUpIcon } from '@/components/ui/Icons';
import { SITE_CONFIG } from '@/lib/config';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLButtonElement>;
}

export function MenuDrawer({ isOpen, onClose, triggerRef }: MenuDrawerProps) {
  const [cosmeticsOpen, setCosmeticsOpen] = useState(true);
  const drawerRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Esc key & body scroll lock & focus management
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus close button initially
    const timeout = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        triggerRef?.current?.focus();
      }

      // Trap focus
      if (e.key === 'Tab' && drawerRef.current) {
        const focusables = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timeout);
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  const categories = [
    'DIY',
    'First aid',
    'Hardware',
    'Household',
    'Kitchenware',
    'Stationery',
    'Party',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dark overlay behind */}
      <button
        type="button"
        onClick={() => {
          onClose();
          triggerRef?.current?.focus();
        }}
        aria-label="Close menu"
        className="fixed inset-0 w-full h-full bg-[#14112E]/60 backdrop-blur-[2px] border-0 cursor-pointer transition-opacity"
      />

      {/* Nav drawer */}
      <nav
        ref={drawerRef}
        aria-label="Main menu"
        className="fixed top-0 right-0 w-[min(460px,100%)] h-full overflow-y-auto bg-[#1D1650] text-white p-7 sm:p-10 flex flex-col gap-1.5 shadow-[-20px_0_50px_-20px_rgba(0,0,0,0.5)] z-10 transition-transform duration-300 ease-out"
      >
        <div className="flex justify-between items-center mb-[18px]">
          <Link href="/" onClick={onClose} aria-label="Bits N Bobs home">
            <Image
              src="/images/logo.png"
              alt="Bits 'N' Bobs"
              width={160}
              height={38}
              className="h-[38px] w-auto"
            />
          </Link>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => {
              onClose();
              triggerRef?.current?.focus();
            }}
            aria-label="Close menu"
            className="w-12 h-12 rounded-full border border-white/30 bg-transparent text-white flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors"
          >
            <CloseIcon size={22} />
          </button>
        </div>

        {/* Section: Shop */}
        <p className="mt-2 mb-1 text-[13px] font-bold text-[#B9B5E0] uppercase tracking-wider">
          Shop
        </p>

        <Link
          href="/shop"
          onClick={onClose}
          className="flex justify-between items-center py-[14px] border-b border-white/15 text-white hover:text-[#FFEC00] no-underline text-[19px] font-semibold transition-colors"
        >
          All products
        </Link>

        {/* Expandable Cosmetics category */}
        <div className="border-b border-white/15">
          <div className="flex justify-between items-center py-[14px]">
            <Link
              href="/shop/cosmetics"
              onClick={onClose}
              className="text-[#FFEC00] no-underline text-[19px] font-bold"
            >
              Cosmetics
            </Link>
            <button
              type="button"
              onClick={() => setCosmeticsOpen(!cosmeticsOpen)}
              aria-label={cosmeticsOpen ? 'Collapse Cosmetics' : 'Expand Cosmetics'}
              className="p-1 text-[#FFEC00] hover:text-white"
            >
              {cosmeticsOpen ? (
                <ChevronUpIcon size={20} />
              ) : (
                <ChevronDownIcon size={20} />
              )}
            </button>
          </div>
          {cosmeticsOpen && (
            <div className="flex flex-col gap-[2px] pb-[14px] pl-4">
              <Link
                href="/shop/cosmetics?sub=nail-care"
                onClick={onClose}
                className="py-2 text-[#D6D4EE] hover:text-[#FFEC00] no-underline text-[16px] transition-colors"
              >
                Nail care
              </Link>
              <Link
                href="/shop/cosmetics?sub=hair-care"
                onClick={onClose}
                className="py-2 text-[#D6D4EE] hover:text-[#FFEC00] no-underline text-[16px] transition-colors"
              >
                Hair care
              </Link>
              <Link
                href="/shop/cosmetics?sub=combs-and-brushes"
                onClick={onClose}
                className="py-2 text-[#D6D4EE] hover:text-[#FFEC00] no-underline text-[16px] transition-colors"
              >
                Combs and brushes
              </Link>
            </div>
          )}
        </div>

        {/* Other categories */}
        {categories.map((cat) => (
          <Link
            key={cat}
            href={`/shop/${cat.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={onClose}
            className="flex justify-between items-center py-[14px] border-b border-white/15 text-white hover:text-[#FFEC00] no-underline text-[19px] font-semibold transition-colors"
          >
            <span>{cat}</span>
            <ChevronDownIcon size={20} className="text-[#FFEC00]" />
          </Link>
        ))}

        <Link
          href="/shop?tab=fresh"
          onClick={onClose}
          className="py-3 border-b border-white/15 text-white hover:text-[#FFEC00] no-underline text-[17px] transition-colors"
        >
          New arrivals
        </Link>
        <Link
          href="/shop?tab=offers"
          onClick={onClose}
          className="py-3 border-b border-white/15 text-white hover:text-[#FFEC00] no-underline text-[17px] transition-colors"
        >
          Special offers
        </Link>

        {/* Section: For retailers */}
        <p className="mt-[22px] mb-1 text-[13px] font-bold text-[#B9B5E0] uppercase tracking-wider">
          For retailers
        </p>
        <Link
          href="/trade/stands/80-hook-display-stand"
          onClick={onClose}
          className="py-3 border-b border-white/15 text-white hover:text-[#FFEC00] no-underline text-[17px] transition-colors"
        >
          Display stands
        </Link>
        <Link
          href="/trade"
          onClick={onClose}
          className="py-3 border-b border-white/15 text-white hover:text-[#FFEC00] no-underline text-[17px] transition-colors"
        >
          Become a stockist
        </Link>
        <Link
          href="/#why"
          onClick={onClose}
          className="py-3 border-b border-white/15 text-white hover:text-[#FFEC00] no-underline text-[17px] transition-colors"
        >
          About us
        </Link>
        <Link
          href="/#talk"
          onClick={onClose}
          className="py-3 border-b border-white/15 text-white hover:text-[#FFEC00] no-underline text-[17px] transition-colors"
        >
          Contact us
        </Link>

        {/* Bottom CTA */}
        <div className="mt-auto pt-6 flex flex-col gap-2.5">
          <Link
            href="/trade"
            onClick={onClose}
            className="flex items-center justify-center h-[56px] rounded-full bg-[#FFEC00] text-[#14112E] hover:bg-[#ffe100] no-underline font-extrabold text-[17px] transition-colors"
          >
            Trade login
          </Link>
          <a
            href={SITE_CONFIG.telLink}
            className="text-center text-white hover:text-[#FFEC00] no-underline font-bold text-[17px] py-1 transition-colors"
          >
            Call us: {SITE_CONFIG.phone}
          </a>
        </div>
      </nav>
    </div>
  );
}

