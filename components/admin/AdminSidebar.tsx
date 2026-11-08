'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { signOutAction } from '@/lib/actions/auth';
import type { AdminSidebarData } from '@/lib/data/admin';

interface AdminSidebarProps {
  sidebarData: AdminSidebarData;
  onCloseMobile?: () => void;
}

export function AdminSidebar({ sidebarData, onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Dashboard',
      href: '/admin',
      icon: (
        <svg className="w-5 h-5 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="7" height="9" x="3" y="3" rx="1" />
          <rect width="7" height="5" x="14" y="3" rx="1" />
          <rect width="7" height="9" x="14" y="12" rx="1" />
          <rect width="7" height="5" x="3" y="16" rx="1" />
        </svg>
      ),
    },
    {
      label: 'Orders',
      href: '/admin/orders',
      badge: sidebarData.newOrdersCount > 0 ? `${sidebarData.newOrdersCount} new` : undefined,
      badgeColor: 'bg-brand-red text-white',
      icon: (
        <svg className="w-5 h-5 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
    },
    {
      label: 'Products and stock',
      href: '/admin/products',
      icon: (
        <svg className="w-5 h-5 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m7.5 4.27 9 5.15" />
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
          <path d="m3.3 7 8.7 5 8.7-5" />
          <path d="M12 22V12" />
        </svg>
      ),
    },
    {
      label: 'Display stands',
      href: '/admin/stands',
      icon: (
        <svg className="w-5 h-5 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
          <path d="m22 12.5-8.58 3.91a2 2 0 0 1-1.66 0L2 12.5" />
          <path d="m22 17.5-8.58 3.91a2 2 0 0 1-1.66 0L2 17.5" />
        </svg>
      ),
    },
    {
      label: 'Trade accounts',
      href: '/admin/trade-accounts',
      badge: sidebarData.pendingTradeCount > 0 ? `${sidebarData.pendingTradeCount}` : undefined,
      badgeColor: 'bg-brand-red text-white',
      icon: (
        <svg className="w-5 h-5 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
          <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
          <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
          <path d="M10 6h4" />
          <path d="M10 10h4" />
          <path d="M10 14h4" />
          <path d="M10 18h4" />
        </svg>
      ),
    },
    {
      label: 'Public customers',
      href: '/admin/customers',
      icon: (
        <svg className="w-5 h-5 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      label: 'Promotions',
      href: '/admin/promotions',
      icon: (
        <svg className="w-5 h-5 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
          <path d="M7 7h.01" />
        </svg>
      ),
    },
    {
      label: 'Delivery & VAT',
      href: '/admin/delivery',
      icon: (
        <svg className="w-5 h-5 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
          <path d="M15 18H9" />
          <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14v10Z" />
          <circle cx="17" cy="18" r="2" />
          <circle cx="7" cy="18" r="2" />
        </svg>
      ),
    },
    {
      label: 'Website content',
      href: '/admin/content',
      icon: (
        <svg className="w-5 h-5 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </svg>
      ),
    },
    {
      label: 'Reports',
      href: '/admin/reports',
      icon: (
        <svg className="w-5 h-5 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18" />
          <path d="m19 9-5 5-4-4-3 3" />
        </svg>
      ),
    },
    {
      label: 'Settings',
      href: '/admin/settings',
      icon: (
        <svg className="w-5 h-5 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
    },
  ];

  return (
    <aside
      aria-label="Admin Navigation"
      className="w-[260px] min-w-[260px] shrink-0 h-screen sticky top-0 bg-[#1D1650] p-4 flex flex-col justify-between overflow-y-auto no-scrollbar z-40 select-none shadow-xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      {/* Top Branding */}
      <div>
        <div className="flex items-center justify-between px-2 pt-1 pb-5">
          <Link
            href="/admin"
            onClick={onCloseMobile}
            aria-label="Bits N Bobs Admin"
            className="block"
          >
            <Image
              src="/images/logo.png"
              alt="Bits 'N' Bobs"
              width={140}
              height={38}
              priority
              className="h-9 w-auto brightness-110"
            />
          </Link>
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 border-0 bg-transparent cursor-pointer"
              aria-label="Close admin menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav className="flex flex-col gap-1 text-[14px]">
          {navItems.map((item) => {
            // Exact match for /admin, startsWith for all other routes
            const isCurrent =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onCloseMobile}
                className={`relative flex items-center gap-3 h-11 px-3.5 rounded-[10px] no-underline font-medium transition-colors ${
                  isCurrent
                    ? 'text-[#14112E] font-extrabold'
                    : 'text-[#D6D4EE] hover:bg-[#2A2170] hover:text-white'
                }`}
              >
                {/* Active Sliding Background via Framer Motion layoutId */}
                {isCurrent && (
                  <motion.div
                    layoutId="active-admin-nav"
                    className="absolute inset-0 bg-[#FFEC00] rounded-[10px] z-0"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}

                <span className="relative z-10 flex-none">{item.icon}</span>
                <span className="relative z-10 whitespace-nowrap">{item.label}</span>

                {item.badge && (
                  <span
                    className={`relative z-10 ml-auto flex-none text-[11px] font-black px-2 py-0.5 rounded-full ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Pinned Footer */}
      <div className="pt-4 mt-6 border-t border-white/10 flex flex-col gap-3 px-2 text-[13px]">
        {/* Admin identity */}
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-success flex-none" />
          <div className="min-w-0">
            <strong className="block text-white font-bold truncate leading-tight">
              {sidebarData.adminName}
            </strong>
            <span className="block text-[#B9B5E0] text-[11px] truncate leading-tight">
              {sidebarData.adminEmail}
            </span>
          </div>
        </div>

        {/* Live Storefront link */}
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-[#D6D4EE] hover:text-[#FFEC00] no-underline text-[12px] font-semibold transition-colors"
        >
          <span>View live storefront</span>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </Link>

        {/* Sign out */}
        <form action={signOutAction} className="w-full">
          <button
            type="submit"
            className="w-full text-left font-semibold text-[#FDE6E8] hover:text-white hover:bg-white/5 py-1.5 px-2 rounded-md transition-colors cursor-pointer border-0 bg-transparent text-[12px]"
          >
            Log out
          </button>
        </form>
      </div>
    </aside>
  );
}
