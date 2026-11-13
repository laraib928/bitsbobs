'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  BasketIcon,
  LockIcon,
  MenuIcon,
  SearchIcon,
} from '@/components/ui/Icons';
import { MenuDrawer } from './MenuDrawer';
import { usePublicCartTotals, useTradeCartTotals } from '@/lib/cart/store';
import { formatMoney } from '@/lib/money';
import { SITE_CONFIG } from '@/lib/config';
import { signOutAction } from '@/lib/actions/auth';
import type { TradeProfile } from '@/lib/data/trade';

interface HeaderProps {
  variant?: 'public' | 'trade';
  tradeProfile?: TradeProfile | null;
}

export function Header({ variant = 'public', tradeProfile }: HeaderProps) {
  const isTrade = variant === 'trade';
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const accountDropdownRef = useRef<HTMLDivElement>(null);

  // Close account dropdown on click outside or Esc
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        accountDropdownRef.current &&
        !accountDropdownRef.current.contains(e.target as Node)
      ) {
        setIsAccountOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsAccountOpen(false);
      }
    };

    if (isAccountOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAccountOpen]);

  const { totalItems: publicItemCount } = usePublicCartTotals();
  const { totalPacks, totalExVatPence } = useTradeCartTotals();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (isTrade) {
      router.push(`/trade/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const businessName = tradeProfile?.businessName || SITE_CONFIG.placeholders.shopName;
  const contactName = tradeProfile?.contactName || 'Trade account';
  const initials = tradeProfile?.initials || 'TR';

  return (
    <>
      <header className="bg-white border-b border-line sticky top-0 z-40">
        {/* Mobile Header (below 768px / md): Option B layout */}
        <div className="md:hidden px-3 sm:px-4 py-2.5 flex flex-col gap-2">
          {/* Row 1: Logo centred on its own row */}
          <div className="flex justify-center items-center py-1">
            <Link
              href="/"
              aria-label="Bits N Bobs home"
              className="inline-block"
            >
              <Image
                src="/images/logo.png"
                alt="Bits 'N' Bobs"
                width={160}
                height={48}
                priority
                className="h-10 w-auto block"
              />
            </Link>
          </div>

          {/* Row 2: 4 equal buttons across full width */}
          <div className="grid grid-cols-4 gap-2 w-full">
            {/* 1. Search (light grey, opens search) */}
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen((prev) => !prev)}
              aria-label={isMobileSearchOpen ? 'Close search' : 'Open search'}
              aria-expanded={isMobileSearchOpen}
              className="h-[58px] rounded-[14px] bg-[#F1F2F6] hover:bg-[#E5E7EB] text-ink flex flex-col items-center justify-center gap-1 border-0 cursor-pointer transition-colors active:scale-95"
            >
              <SearchIcon size={20} className="text-ink" />
              <span className="text-[12px] font-bold leading-tight text-ink">Search</span>
            </button>

            {/* 2. Trade login (navy #312682) */}
            {isTrade ? (
              <Link
                href="/trade/account"
                aria-label="Trade account"
                className="h-[58px] rounded-[14px] bg-[#312682] hover:bg-[#251c68] text-white no-underline flex flex-col items-center justify-center gap-1 transition-colors active:scale-95"
              >
                <span className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-[11px]">
                  {initials}
                </span>
                <span className="text-[12px] font-bold leading-tight text-white">Account</span>
              </Link>
            ) : (
              <Link
                href="/trade"
                aria-label="Trade login"
                className="h-[58px] rounded-[14px] bg-[#312682] hover:bg-[#251c68] text-white no-underline flex flex-col items-center justify-center gap-1 transition-colors active:scale-95"
              >
                <LockIcon size={18} className="text-white" />
                <span className="text-[12px] font-bold leading-tight text-white">Trade login</span>
              </Link>
            )}

            {/* 3. Basket (light grey, red count badge) */}
            <Link
              href={isTrade ? '/trade/checkout' : '/basket'}
              aria-label={
                isTrade
                  ? `Basket, ${totalPacks} packs`
                  : `Basket, ${publicItemCount} items`
              }
              className="relative h-[58px] rounded-[14px] bg-[#F1F2F6] hover:bg-[#E5E7EB] text-ink no-underline flex flex-col items-center justify-center gap-1 transition-colors active:scale-95"
            >
              <BasketIcon size={20} className="text-ink" />
              {(isTrade ? totalPacks : publicItemCount) > 0 && (
                <span className="absolute top-1.5 right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-[#E30512] text-white text-[11px] font-extrabold flex items-center justify-center leading-none">
                  {isTrade ? totalPacks : publicItemCount}
                </span>
              )}
              <span className="text-[12px] font-bold leading-tight text-ink">Basket</span>
            </Link>

            {/* 4. Menu (red #E30512) */}
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={isMenuOpen}
              className="h-[58px] rounded-[14px] bg-[#E30512] hover:bg-[#c9000b] text-white flex flex-col items-center justify-center gap-1 border-0 cursor-pointer transition-colors active:scale-95"
            >
              <MenuIcon size={20} className="text-white" />
              <span className="text-[12px] font-bold leading-tight text-white">Menu</span>
            </button>
          </div>

          {/* Expandable Mobile Search input */}
          {isMobileSearchOpen && (
            <div className="w-full pt-1">
              <form
                onSubmit={handleSearch}
                className={`w-full flex items-center gap-2.5 bg-[#F1F2F6] border border-line ${
                  isTrade ? 'rounded-[10px] h-11 px-3.5' : 'rounded-full h-11 px-4'
                }`}
              >
                <SearchIcon size={20} className="text-muted flex-none" />
                <label
                  htmlFor={isTrade ? 'mobile-trade-search' : 'mobile-public-search'}
                  className="sr-only"
                >
                  Search products
                </label>
                <input
                  id={isTrade ? 'mobile-trade-search' : 'mobile-public-search'}
                  type="search"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    isTrade
                      ? 'Search over 300 products or type a product code'
                      : 'Search over 300 products…'
                  }
                  className="flex-1 border-0 bg-transparent font-sans text-[15px] text-ink outline-none min-w-0"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    className="text-muted hover:text-ink text-sm p-1 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </form>
            </div>
          )}
        </div>

        {/* Desktop / Tablet Header (768px / md and up): Unchanged */}
        <div className="hidden md:flex max-w-[1320px] mx-auto px-4 sm:px-8 py-3 sm:py-4 gap-x-4 md:gap-x-5 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            aria-label="Bits N Bobs home"
            className="block flex-none"
          >
            <Image
              src="/images/logo.png"
              alt="Bits 'N' Bobs"
              width={160}
              height={48}
              priority
              className="h-10 sm:h-12 w-auto block"
            />
          </Link>

          {/* Desktop Search Form */}
          <form
            onSubmit={handleSearch}
            className={`flex flex-1 basis-[320px] items-center gap-2.5 bg-surface border border-line ${
              isTrade ? 'rounded-[10px] h-12 px-3.5' : 'rounded-full h-[50px] px-[18px]'
            }`}
          >
            <SearchIcon size={20} className="text-muted flex-none" />
            <label htmlFor={isTrade ? 'trade-search' : 'public-search'} className="sr-only">
              Search products
            </label>
            <input
              id={isTrade ? 'trade-search' : 'public-search'}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isTrade
                  ? 'Search over 300 products or type a product code'
                  : 'Search over 300 products…'
              }
              className="flex-1 border-0 bg-transparent font-sans text-[15px] text-ink outline-none min-w-0"
            />
          </form>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {isTrade ? (
              <>
                {/* Shop name chip with dropdown */}
                <div className="relative" ref={accountDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsAccountOpen((prev) => !prev)}
                    aria-expanded={isAccountOpen}
                    aria-haspopup="true"
                    className="flex items-center gap-2 px-3 sm:px-4 h-11 min-h-[44px] md:h-[50px] rounded-full border border-line text-ink text-[14px] bg-white hover:bg-surface transition-colors cursor-pointer"
                  >
                    <span className="w-8 h-8 rounded-full bg-brand-navy text-white flex items-center justify-center font-bold text-[13px] flex-none">
                      {initials}
                    </span>
                    <div className="hidden sm:block text-left max-w-[170px]">
                      <strong className="block text-[14px] leading-tight text-ink truncate">
                        {businessName}
                      </strong>
                      <span className="text-[12px] text-muted leading-tight truncate block">
                        {contactName}
                      </span>
                    </div>
                    <svg
                      className={`w-4 h-4 text-muted transition-transform duration-200 hidden sm:block ${
                        isAccountOpen ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Account Dropdown */}
                  {isAccountOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-line p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-2 border-b border-line mb-1 sm:hidden">
                        <strong className="block text-[13px] text-navy-deep truncate">
                          {businessName}
                        </strong>
                        <span className="text-[11px] text-muted truncate block">
                          {contactName}
                        </span>
                      </div>
                      <Link
                        href="/trade/account"
                        onClick={() => setIsAccountOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-[14px] font-semibold text-ink hover:bg-surface rounded-xl no-underline transition-colors"
                      >
                        <span className="text-base">👤</span>
                        <span>My account</span>
                      </Link>
                      <Link
                        href="/trade/account#orders"
                        onClick={() => setIsAccountOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-[14px] font-semibold text-ink hover:bg-surface rounded-xl no-underline transition-colors"
                      >
                        <span className="text-base">📦</span>
                        <span>Previous orders</span>
                      </Link>
                      <div className="border-t border-line my-1" />
                      <form action={signOutAction} className="w-full">
                        <button
                          type="submit"
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-[14px] font-semibold text-brand-red hover:bg-[#FDE6E8] rounded-xl border-0 bg-transparent cursor-pointer transition-colors text-left"
                        >
                          <span className="text-base">🚪</span>
                          <span>Logout</span>
                        </button>
                      </form>
                    </div>
                  )}
                </div>

                {/* Trade Basket Button */}
                <Link
                  href="/trade/checkout"
                  className="flex items-center gap-2 px-3 sm:px-[18px] h-11 min-h-[44px] md:h-[50px] rounded-full bg-brand-red hover:bg-[#c9000b] text-white no-underline font-bold text-[14px] sm:text-[15px] transition-colors"
                >
                  <BasketIcon size={20} />
                  <span className="hidden xs:inline sm:inline">
                    {totalPacks > 0
                      ? `${totalPacks} ${totalPacks === 1 ? 'pack' : 'packs'}, ${formatMoney(totalExVatPence)}`
                      : 'Basket'}
                  </span>
                </Link>

                {/* Navy Menu Button */}
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(true)}
                  aria-label="Open menu"
                  aria-expanded={isMenuOpen}
                  className="flex items-center gap-2 h-11 min-h-[44px] px-3.5 sm:px-[18px] pl-3 sm:pl-4 md:h-[50px] rounded-full bg-navy-deep hover:bg-[#2A2170] text-white font-sans font-bold text-[14px] sm:text-[15px] cursor-pointer transition-colors"
                >
                  <MenuIcon size={20} className="md:w-[22px] md:h-[22px]" />
                  <span>Menu</span>
                </button>
              </>
            ) : (
              <>
                {/* Trade Login Button: Icon only below 768px (md), with label on desktop */}
                <Link
                  href="/trade"
                  aria-label="Trade login"
                  title="Trade login"
                  className="flex items-center justify-center md:gap-2 w-11 h-11 min-w-[44px] min-h-[44px] md:w-auto md:h-[50px] md:px-[18px] rounded-full bg-brand-navy hover:bg-[#251c68] text-white no-underline font-bold text-[15px] transition-colors"
                >
                  <LockIcon size={18} />
                  <span>Trade login</span>
                </Link>

                {/* Public Basket Button */}
                <Link
                  href="/basket"
                  aria-label={`Basket, ${publicItemCount} items`}
                  className="relative flex items-center justify-center w-11 h-11 min-w-[44px] min-h-[44px] md:w-[50px] md:h-[50px] rounded-full border border-line text-ink hover:bg-surface transition-colors"
                >
                  <BasketIcon size={20} className="md:w-[22px] md:h-[22px]" />
                  {publicItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-brand-red text-white text-[12px] font-extrabold flex items-center justify-center">
                      {publicItemCount}
                    </span>
                  )}
                </Link>

                {/* Red Menu Button */}
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(true)}
                  aria-label="Open menu"
                  aria-expanded={isMenuOpen}
                  className="flex items-center gap-2 h-11 min-h-[44px] px-3.5 sm:px-4 md:h-[50px] md:px-[18px] pl-3 md:pl-4 rounded-full border-0 bg-brand-red hover:bg-[#c9000b] text-white font-sans font-bold text-[14px] md:text-[15px] cursor-pointer transition-colors"
                >
                  <MenuIcon size={20} className="md:w-[22px] md:h-[22px]" />
                  <span>Menu</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Menu Drawer */}
      <MenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        triggerRef={menuButtonRef}
      />
    </>
  );
}

