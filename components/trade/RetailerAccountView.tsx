'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Order } from '@/lib/data/types';
import { signOutAction } from '@/lib/actions/auth';
import { SITE_CONFIG } from '@/lib/config';
import type { Json } from '@/lib/supabase/database.types';

interface RetailerProfileData {
  business_name?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  business_type?: string;
  vat_number?: string | null;
  company_number?: string | null;
  trading_address?: Json;
  delivery_address?: Json;
}

interface RetailerAccountViewProps {
  orders: Order[];
  profile?: RetailerProfileData | null;
}

function formatAddressJson(addrJson: Json | undefined): string {
  if (!addrJson || typeof addrJson !== 'object' || Array.isArray(addrJson)) {
    return '';
  }
  const obj = addrJson as Record<string, Json | undefined>;
  const line1 = typeof obj.line1 === 'string' ? obj.line1 : typeof obj.address === 'string' ? obj.address : '';
  const postcode = typeof obj.postcode === 'string' ? obj.postcode : '';
  return [line1, postcode].filter(Boolean).join(', ');
}

export function RetailerAccountView({ orders, profile }: RetailerAccountViewProps) {
  const shopName = profile?.business_name || SITE_CONFIG.placeholders.shopName;
  const contactName = profile?.contact_name || SITE_CONFIG.placeholders.customerName;
  const email = profile?.email || 'shop@retailer.co.uk';
  const businessType = profile?.business_type || 'Convenience store';
  const vatNumber = profile?.vat_number || SITE_CONFIG.placeholders.vatNumber;

  const tradingFormatted = formatAddressJson(profile?.trading_address);
  const tradingAddressFormatted = tradingFormatted || '[Trading address, postcode]';

  const deliveryFormatted = formatAddressJson(profile?.delivery_address);
  const deliveryAddressFormatted = deliveryFormatted || tradingAddressFormatted;

  return (
    <div className="bg-surface w-full min-h-screen">
      {/* Account top bar */}
      <header className="bg-white border-b border-line">
        <div className="max-w-[1320px] mx-auto px-8 py-4 flex flex-wrap gap-4 items-center justify-between">
          <Link href="/trade/shop" aria-label="Bits N Bobs home">
            <Image
              src="/images/logo.png"
              alt="Bits 'N' Bobs"
              width={160}
              height={48}
              className="h-12 w-auto block"
            />
          </Link>
          <div className="flex gap-2.5 flex-wrap">
            <Link
              href="/trade/shop"
              className="flex items-center h-[50px] px-5 rounded-full bg-brand-navy hover:bg-[#251c68] text-white no-underline font-bold transition-colors"
            >
              Trade shop
            </Link>
            <Link
              href="/trade/checkout"
              className="flex items-center h-[50px] px-5 rounded-full bg-brand-red hover:bg-[#c9000b] text-white no-underline font-bold transition-colors"
            >
              Basket, 35 packs
            </Link>
          </div>
        </div>
      </header>

      {/* Main Account Area */}
      <div className="max-w-[1320px] mx-auto px-8 py-9 pb-20 flex flex-wrap gap-6 items-start">
        {/* Left Sidebar Nav */}
        <nav
          aria-label="Account"
          className="w-full md:w-[260px] flex-none bg-white border border-line rounded-[20px] p-3 flex flex-col gap-0.5 shadow-sm text-[16px]"
        >
          <Link
            href="/trade/account"
            className="flex items-center h-[46px] px-4 rounded-xl bg-navy-deep text-white font-bold no-underline"
          >
            Overview
          </Link>
          <a
            href="#orders"
            className="flex items-center h-[46px] px-4 rounded-xl text-ink hover:bg-surface no-underline transition-colors"
          >
            Previous orders
          </a>
          <Link
            href="/trade/shop"
            className="flex items-center h-[46px] px-4 rounded-xl text-ink hover:bg-surface no-underline transition-colors"
          >
            Reorder
          </Link>
          <Link
            href="/trade/stands/80-hook-display-stand"
            className="flex items-center h-[46px] px-4 rounded-xl text-ink hover:bg-surface no-underline transition-colors"
          >
            Display stands
          </Link>
          <a
            href="#promo"
            className="flex items-center h-[46px] px-4 rounded-xl text-ink hover:bg-surface no-underline transition-colors"
          >
            Trade promotions
          </a>
          <a
            href="#invoices"
            className="flex items-center h-[46px] px-4 rounded-xl text-ink hover:bg-surface no-underline transition-colors"
          >
            Invoices
          </a>
          <a
            href="#details"
            className="flex items-center h-[46px] px-4 rounded-xl text-ink hover:bg-surface no-underline transition-colors"
          >
            Account details
          </a>
          <a
            href="#addresses"
            className="flex items-center h-[46px] px-4 rounded-xl text-ink hover:bg-surface no-underline transition-colors"
          >
            Delivery addresses
          </a>
          <form action={signOutAction} className="w-full">
            <button
              type="submit"
              className="w-full flex items-center h-[46px] px-4 rounded-xl text-danger hover:bg-red-50 border-0 bg-transparent text-left font-semibold cursor-pointer transition-colors"
            >
              Log out
            </button>
          </form>
        </nav>

        {/* Right Main Column */}
        <main className="flex-1 min-w-0 flex flex-col gap-5">
          <div>
            <p className="m-0 text-[15px] text-muted">Trade account, approved</p>
            <h1 className="mt-1 mb-0 text-[36px] sm:text-[42px] font-extrabold font-stretch-112 text-navy-deep">
              Hello, {shopName}
            </h1>
          </div>

          {/* 3 Action KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Card 1: Trade promotion */}
            <section
              id="promo"
              className="bg-brand-red text-white rounded-[20px] p-6 flex flex-col gap-2.5 shadow-sm"
            >
              <h2 className="m-0 text-[20px] font-extrabold">Trade promotion</h2>
              <p className="m-0 text-[16px] leading-[1.5]">
                [Current trade offer, set in admin]
              </p>
              <Link
                href="/trade/shop?tab=offers"
                className="self-start mt-auto inline-flex items-center h-11 px-[18px] rounded-full bg-white hover:bg-surface text-brand-red no-underline font-extrabold transition-colors shadow-sm"
              >
                Shop the offer
              </Link>
            </section>

            {/* Card 2: Reorder */}
            <section className="bg-navy-deep text-white rounded-[20px] p-6 flex flex-col gap-2.5 shadow-sm">
              <h2 className="m-0 text-[20px] font-extrabold">Reorder in one click</h2>
              <p className="m-0 text-[16px] leading-[1.5] text-soft-on-dark">
                Your last order: 12 packs, £39.84
              </p>
              <Link
                href="/trade/checkout"
                className="self-start mt-auto inline-flex items-center h-11 px-[18px] rounded-full bg-brand-yellow hover:bg-[#ffe100] text-ink no-underline font-extrabold transition-colors shadow-sm"
              >
                Reorder
              </Link>
            </section>

            {/* Card 3: Display stands */}
            <section className="bg-white border border-line rounded-[20px] p-6 flex flex-col gap-2.5 shadow-sm">
              <h2 className="m-0 text-[20px] font-extrabold text-ink">
                Display stands
              </h2>
              <p className="m-0 text-[16px] leading-[1.5] text-text-2">
                Order a fully stocked stand for your shop.
              </p>
              <Link
                href="/trade/stands/80-hook-display-stand"
                className="self-start mt-auto inline-flex items-center h-11 px-[18px] rounded-full border-2 border-brand-navy hover:bg-brand-navy hover:text-white text-brand-navy no-underline font-extrabold transition-colors"
              >
                View stands
              </Link>
            </section>
          </div>

          {/* Previous Orders Table */}
          <section
            id="orders"
            className="bg-white border border-line rounded-[20px] p-6 flex flex-col gap-3 shadow-sm"
          >
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h2 className="m-0 text-[22px] font-extrabold text-ink">
                Previous orders
              </h2>
              <span className="bg-[#FFF4C2] text-[#6B4E00] text-[12px] font-bold px-2 py-1 rounded-[6px]">
                Sample orders
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[15px]">
                <thead>
                  <tr className="border-b border-line text-left text-muted font-semibold">
                    <th scope="col" className="p-3 pl-0 whitespace-nowrap">
                      Order
                    </th>
                    <th scope="col" className="p-3 whitespace-nowrap">
                      Date
                    </th>
                    <th scope="col" className="p-3 whitespace-nowrap">
                      Items
                    </th>
                    <th scope="col" className="p-3 whitespace-nowrap">
                      Total
                    </th>
                    <th scope="col" className="p-3 whitespace-nowrap">
                      Status
                    </th>
                    <th scope="col" className="p-3 whitespace-nowrap text-right">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((ord) => (
                    <tr key={ord.id} className="border-b border-[#EEEFF4]">
                      <td className="p-3 pl-0 font-bold text-ink">{ord.id}</td>
                      <td className="p-3 text-text-2 whitespace-nowrap">
                        {ord.date}
                      </td>
                      <td className="p-3 text-text-2">{ord.itemsCountDescription}</td>
                      <td className="p-3 font-bold text-navy-deep">
                        {ord.totalFormatted}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span
                          style={{
                            backgroundColor: ord.statusBg || '#E8E6F7',
                            color: ord.statusFg || '#312682',
                          }}
                          className="text-[12px] font-bold px-2.5 py-1 rounded-[6px]"
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          className="font-bold text-brand-navy hover:text-brand-red mr-3.5 bg-transparent border-0 cursor-pointer"
                        >
                          Invoice
                        </button>
                        <Link
                          href="/trade/checkout"
                          className="font-bold text-brand-navy hover:text-brand-red no-underline"
                        >
                          Reorder
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Bottom Info Cards: Business Details & Addresses */}
          <div
            id="details"
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {/* Business details */}
            <section className="bg-white border border-line rounded-[20px] p-6 flex flex-col gap-3 shadow-sm">
              <div className="flex justify-between items-center">
                <h2 className="m-0 text-[20px] font-extrabold text-ink">
                  Business details
                </h2>
                <button
                  type="button"
                  className="font-bold text-[14px] text-brand-navy hover:text-brand-red bg-transparent border-0 cursor-pointer"
                >
                  Edit
                </button>
              </div>
              <dl className="m-0 grid grid-cols-[140px_1fr] gap-2.5 text-[15px]">
                <dt className="text-muted">Business</dt>
                <dd className="m-0 text-ink font-semibold">
                  {shopName}
                </dd>
                <dt className="text-muted">Type</dt>
                <dd className="m-0 text-text-2">{businessType}</dd>
                <dt className="text-muted">Contact</dt>
                <dd className="m-0 text-text-2">
                  {contactName}
                </dd>
                <dt className="text-muted">Email</dt>
                <dd className="m-0 text-text-2">{email}</dd>
                <dt className="text-muted">VAT number</dt>
                <dd className="m-0 text-text-2">
                  {vatNumber}
                </dd>
              </dl>
            </section>

            {/* Addresses */}
            <section
              id="addresses"
              className="bg-white border border-line rounded-[20px] p-6 flex flex-col gap-3 shadow-sm"
            >
              <div className="flex justify-between items-center">
                <h2 className="m-0 text-[20px] font-extrabold text-ink">
                  Addresses
                </h2>
                <button
                  type="button"
                  className="font-bold text-[14px] text-brand-navy hover:text-brand-red bg-transparent border-0 cursor-pointer"
                >
                  Edit
                </button>
              </div>
              <p className="m-0 text-[15px] leading-[1.6]">
                <strong className="block text-ink">Trading address</strong>
                <span className="text-text-2">
                  {tradingAddressFormatted}
                </span>
              </p>
              <p className="m-0 text-[15px] leading-[1.6]">
                <strong className="block text-ink">Delivery address</strong>
                <span className="text-text-2">
                  {deliveryAddressFormatted}
                </span>
              </p>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

