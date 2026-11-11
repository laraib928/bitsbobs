'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOutAction } from '@/lib/actions/auth';

const NAV_ITEMS = [
  {
    label: 'Overview',
    href: '/trade/account',
    isActive: (pathname: string) => pathname === '/trade/account',
  },
  {
    label: 'Previous orders',
    href: '/trade/account/orders',
    isActive: (pathname: string) =>
      pathname === '/trade/account/orders' ||
      pathname.startsWith('/trade/account/orders/'),
  },
  {
    label: 'Reorder',
    href: '/trade/account/reorder',
    isActive: (pathname: string) => pathname === '/trade/account/reorder',
  },
  {
    label: 'Display stands',
    href: '/trade/stands',
    isActive: (pathname: string) =>
      pathname === '/trade/stands' || pathname.startsWith('/trade/stands/'),
  },
  {
    label: 'Trade promotions',
    href: '/trade/account/promotions',
    isActive: (pathname: string) => pathname === '/trade/account/promotions',
  },
  {
    label: 'Invoices',
    href: '/trade/account/invoices',
    isActive: (pathname: string) => pathname === '/trade/account/invoices',
  },
  {
    label: 'Account details',
    href: '/trade/account/details',
    isActive: (pathname: string) => pathname === '/trade/account/details',
  },
  {
    label: 'Delivery addresses',
    href: '/trade/account/addresses',
    isActive: (pathname: string) => pathname === '/trade/account/addresses',
  },
];

export function TradeAccountSidebar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Account navigation"
      className="w-full md:w-[260px] flex-none md:sticky md:top-24 self-start z-10"
    >
      {/* On desktop: vertical list inside a rounded card */}
      {/* On mobile (< md): horizontal scrolling tab bar */}
      <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible gap-1.5 p-2 bg-white border border-line rounded-[18px] md:rounded-[20px] shadow-sm no-scrollbar">
        {NAV_ITEMS.map((item) => {
          const active = item.isActive(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-none md:flex items-center h-[42px] md:h-[46px] px-3.5 md:px-4 rounded-xl text-[14px] md:text-[15px] font-semibold no-underline transition-all whitespace-nowrap ${
                active
                  ? 'bg-navy-deep text-white font-bold shadow-sm'
                  : 'text-ink hover:bg-surface hover:text-navy-deep'
              }`}
            >
              {item.label}
            </Link>
          );
        })}

        {/* Log out button */}
        <form action={signOutAction} className="flex-none md:w-full">
          <button
            type="submit"
            className="flex items-center h-[42px] md:h-[46px] px-3.5 md:px-4 rounded-xl text-[14px] md:text-[15px] font-semibold text-danger hover:bg-red-50 border-0 bg-transparent cursor-pointer transition-colors whitespace-nowrap w-full text-left"
          >
            Log out
          </button>
        </form>
      </div>
    </nav>
  );
}

