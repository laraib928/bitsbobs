'use client';

import React from 'react';
import Link from 'next/link';
import {
  RetailerAccountProfile,
  RetailerOrder,
  RetailerPromotion,
} from '@/lib/data/trade-account';

interface RetailerAccountOverviewProps {
  profile: RetailerAccountProfile | null;
  orders: RetailerOrder[];
  lastOrder: RetailerOrder | null;
  activePromotions: RetailerPromotion[];
}

export function RetailerAccountOverview({
  profile,
  orders,
  lastOrder,
  activePromotions,
}: RetailerAccountOverviewProps) {
  const shopName = profile?.businessName || 'Retailer';
  const contactName = profile?.contactName || 'Not provided';
  const email = profile?.email || 'Not provided';
  const businessType = profile?.businessType || 'Independent retailer';
  const vatNumber = profile?.vatNumber || 'Not provided';

  const tradingAddress = profile?.tradingAddressFormatted || 'Not provided';
  const deliveryAddress = profile?.deliveryAddressFormatted || 'Same as trading address';

  const recentOrders = orders.slice(0, 5);
  const activePromo = activePromotions.length > 0 ? activePromotions[0] : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome header */}
      <div>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-bold bg-[#E8E6F7] text-brand-navy">
          Trade account, approved
        </span>
        <h1 className="mt-1.5 mb-0 text-[32px] sm:text-[40px] font-extrabold font-stretch-112 text-navy-deep tracking-[-0.01em]">
          Hello, {shopName}
        </h1>
      </div>

      {/* Action KPI Cards (Dynamic: hidden if not applicable) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Trade promotion card (Only shown if active promotion exists) */}
        {activePromo && (
          <section className="bg-brand-red text-white rounded-[20px] p-6 flex flex-col gap-3 shadow-sm">
            <h2 className="m-0 text-[20px] font-extrabold">Trade promotion</h2>
            <p className="m-0 text-[15px] leading-[1.5] text-white/95 font-medium">
              {activePromo.description || activePromo.title}
            </p>
            <Link
              href="/trade/stands"
              className="self-start mt-auto inline-flex items-center h-10 px-5 rounded-full bg-white hover:bg-surface text-brand-red no-underline font-extrabold text-[14px] transition-colors shadow-sm"
            >
              View the range
            </Link>
          </section>
        )}

        {/* 2. Reorder card (Only shown if there is a real last order) */}
        {lastOrder && (
          <section className="bg-navy-deep text-white rounded-[20px] p-6 flex flex-col gap-2.5 shadow-sm">
            <h2 className="m-0 text-[20px] font-extrabold">Reorder in one click</h2>
            <p className="m-0 text-[15px] leading-[1.5] text-soft-on-dark">
              Your last order ({lastOrder.orderNumberFormatted}): {lastOrder.itemsCount} {lastOrder.itemsCount === 1 ? 'pack' : 'packs'}, {lastOrder.totalFormatted}
            </p>
            <Link
              href="/trade/account/reorder"
              className="self-start mt-auto inline-flex items-center h-10 px-5 rounded-full bg-brand-yellow hover:bg-[#ffe100] text-ink no-underline font-extrabold text-[14px] transition-colors shadow-sm"
            >
              Reorder
            </Link>
          </section>
        )}

        {/* 3. Display stands card */}
        <section className="bg-white border border-line rounded-[20px] p-6 flex flex-col gap-2.5 shadow-sm">
          <h2 className="m-0 text-[20px] font-extrabold text-ink">
            Display stands
          </h2>
          <p className="m-0 text-[15px] leading-[1.5] text-text-2">
            Order a fully stocked stand for your shop floor or counter.
          </p>
          <Link
            href="/trade/stands"
            className="self-start mt-auto inline-flex items-center h-10 px-4 rounded-full border-2 border-brand-navy hover:bg-brand-navy hover:text-white text-brand-navy no-underline font-extrabold text-[14px] transition-colors"
          >
            View stands
          </Link>
        </section>
      </div>

      {/* Previous Orders Section */}
      <section className="bg-white border border-line rounded-[20px] p-6 flex flex-col gap-4 shadow-sm">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h2 className="m-0 text-[22px] font-extrabold text-ink">
            Previous orders
          </h2>
          {orders.length > 5 && (
            <Link
              href="/trade/account/orders"
              className="text-[14px] font-bold text-brand-navy hover:text-brand-red no-underline"
            >
              View all ({orders.length}) →
            </Link>
          )}
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-10 text-center flex flex-col items-center justify-center gap-3">
            <span className="text-3xl">📦</span>
            <p className="m-0 text-[16px] font-semibold text-ink">
              No previous orders yet
            </p>
            <p className="m-0 text-[14px] text-muted max-w-sm">
              When you place orders in the trade shop, your order details, tracking and invoices will appear here.
            </p>
            <Link
              href="/trade/shop"
              className="mt-2 inline-flex items-center h-11 px-5 rounded-full bg-brand-navy hover:bg-[#251c68] text-white no-underline font-bold text-[14px] transition-colors"
            >
              Start shopping trade products
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full border-collapse text-[15px]">
              <thead>
                <tr className="border-b border-line text-left text-muted font-semibold text-[13px] uppercase tracking-wider">
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
                    Total (inc VAT)
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
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="border-b border-[#EEEFF4] hover:bg-surface/50 transition-colors">
                    <td className="p-3 pl-0 font-bold text-ink">
                      <Link
                        href={`/trade/account/orders/${ord.id}`}
                        className="hover:underline text-navy-deep font-bold"
                      >
                        {ord.orderNumberFormatted}
                      </Link>
                    </td>
                    <td className="p-3 text-text-2 whitespace-nowrap">
                      {ord.dateFormatted}
                    </td>
                    <td className="p-3 text-text-2 whitespace-nowrap">
                      {ord.itemsDescription}
                    </td>
                    <td className="p-3 font-bold text-navy-deep whitespace-nowrap">
                      {ord.totalFormatted}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span
                        style={{
                          backgroundColor: ord.statusBg,
                          color: ord.statusFg,
                        }}
                        className="text-[12px] font-bold px-2.5 py-1 rounded-[6px]"
                      >
                        {ord.statusLabel}
                      </span>
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-3">
                        <Link
                          href={`/trade/account/orders/${ord.id}`}
                          className="font-bold text-[14px] text-brand-navy hover:text-brand-red no-underline"
                        >
                          View
                        </Link>
                        <Link
                          href="/trade/account/invoices"
                          className="font-bold text-[14px] text-brand-navy hover:text-brand-red no-underline"
                        >
                          Invoice
                        </Link>
                        <Link
                          href={`/trade/account/orders/${ord.id}?action=reorder`}
                          className="font-bold text-[14px] text-brand-red hover:underline no-underline"
                        >
                          Reorder
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Business Details & Addresses Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Business details */}
        <section className="bg-white border border-line rounded-[20px] p-6 flex flex-col gap-3 shadow-sm">
          <div className="flex justify-between items-center">
            <h2 className="m-0 text-[20px] font-extrabold text-ink">
              Business details
            </h2>
            <Link
              href="/trade/account/details"
              className="font-bold text-[14px] text-brand-navy hover:text-brand-red no-underline"
            >
              Edit
            </Link>
          </div>
          <dl className="m-0 grid grid-cols-[130px_1fr] gap-2.5 text-[15px]">
            <dt className="text-muted">Business</dt>
            <dd className="m-0 text-ink font-semibold">{shopName}</dd>
            <dt className="text-muted">Type</dt>
            <dd className="m-0 text-text-2">{businessType}</dd>
            <dt className="text-muted">Contact</dt>
            <dd className="m-0 text-text-2">{contactName}</dd>
            <dt className="text-muted">Email</dt>
            <dd className="m-0 text-text-2">{email}</dd>
            <dt className="text-muted">VAT number</dt>
            <dd className="m-0 text-text-2">{vatNumber}</dd>
          </dl>
        </section>

        {/* Addresses */}
        <section className="bg-white border border-line rounded-[20px] p-6 flex flex-col gap-3 shadow-sm">
          <div className="flex justify-between items-center">
            <h2 className="m-0 text-[20px] font-extrabold text-ink">
              Addresses
            </h2>
            <Link
              href="/trade/account/addresses"
              className="font-bold text-[14px] text-brand-navy hover:text-brand-red no-underline"
            >
              Edit
            </Link>
          </div>
          <div className="flex flex-col gap-3.5">
            <div>
              <strong className="block text-ink text-[14px] uppercase tracking-wider text-muted font-bold mb-1">
                Trading address
              </strong>
              <p className="m-0 text-[15px] leading-[1.5] text-ink font-medium">
                {tradingAddress}
              </p>
            </div>
            <div>
              <strong className="block text-ink text-[14px] uppercase tracking-wider text-muted font-bold mb-1">
                Delivery address
              </strong>
              <p className="m-0 text-[15px] leading-[1.5] text-ink font-medium">
                {deliveryAddress}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

