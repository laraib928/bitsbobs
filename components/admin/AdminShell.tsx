'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { AdminSidebar } from './AdminSidebar';
import { ToastProvider } from './ToastContext';
import type { AdminSidebarData } from '@/lib/data/admin';

interface AdminShellProps {
  sidebarData: AdminSidebarData;
  children: React.ReactNode;
}

export function AdminShell({ sidebarData, children }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close mobile drawer on Esc key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden bg-surface font-sans text-ink">
        {/* Desktop Fixed Sidebar: strictly fixed width that cannot shrink */}
        <div className="hidden lg:block w-[260px] min-w-[260px] shrink-0 h-screen sticky top-0">
          <AdminSidebar sidebarData={sidebarData} />
        </div>

        {/* Mobile Off-canvas Drawer & Overlay */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop overlay */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer content */}
            <div className="relative z-10 w-[260px] min-w-[260px] max-w-[85vw] h-full shadow-2xl animate-in slide-in-from-left duration-250">
              <AdminSidebar
                sidebarData={sidebarData}
                onCloseMobile={() => setMobileOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 flex flex-col overflow-y-auto">
          {/* Mobile Slim Top Bar */}
          <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#1D1650] text-white shrink-0 shadow-md">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="p-2 -ml-1 rounded-lg text-white/90 hover:text-white hover:bg-white/10 border-0 bg-transparent cursor-pointer flex items-center justify-center"
                aria-label="Open admin navigation menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <Link href="/admin" className="flex items-center">
                <Image
                  src="/images/logo.png"
                  alt="Bits 'N' Bobs"
                  width={120}
                  height={32}
                  className="h-7 w-auto"
                />
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[12px] bg-brand-yellow text-ink font-bold px-2 py-0.5 rounded-full">
                Admin
              </span>
            </div>
          </header>

          {/* Scrollable Children Page */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
