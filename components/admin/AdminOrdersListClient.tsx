'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { LatestOrderAdmin } from '@/lib/data/admin';

interface AdminOrdersListClientProps {
  initialOrders: LatestOrderAdmin[];
}

export function AdminOrdersListClient({ initialOrders }: AdminOrdersListClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');

  const filteredOrders = initialOrders.filter((order) => {
    const matchesSearch =
      search === '' ||
      order.orderNumber.toString().includes(search) ||
      order.customerName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || order.status.toLowerCase().replace(' ', '_') === statusFilter;

    const matchesChannel =
      channelFilter === 'all' || order.channel === channelFilter;

    return matchesSearch && matchesStatus && matchesChannel;
  });

  return (
    <div className="p-5 sm:p-8 pb-16 flex flex-col gap-6 max-w-[1360px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="m-0 text-[30px] sm:text-[34px] font-extrabold font-stretch-110 text-navy-deep">
            Orders
          </h1>
          <p className="mt-1 mb-0 text-[14px] text-muted font-medium">
            Manage trade pack fulfillment and public customer orders
          </p>
        </div>

        <div className="text-[13px] text-muted font-bold">
          {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} found
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-line rounded-[20px] p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="flex-1 basis-[280px] relative">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order # or customer name..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-field-border font-sans text-[14px] text-ink outline-none focus:border-brand-navy"
          />
          <svg
            className="w-4 h-4 text-muted absolute left-3.5 top-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" strokeWidth="2" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" />
          </svg>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 px-3.5 rounded-xl border border-field-border bg-white text-[13px] font-semibold text-ink outline-none"
          >
            <option value="all">All statuses</option>
            <option value="paid">Paid (to pack)</option>
            <option value="packing">Packing</option>
            <option value="dispatched">Dispatched</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="h-11 px-3.5 rounded-xl border border-field-border bg-white text-[13px] font-semibold text-ink outline-none"
          >
            <option value="all">All channels</option>
            <option value="trade">Trade only</option>
            <option value="public">Public (Guest) only</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-line rounded-[20px] shadow-xs overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <span className="text-3xl">📦</span>
            <strong className="text-[17px] text-navy-deep">No orders matching your criteria</strong>
            <p className="m-0 text-[14px] text-muted max-w-sm">
              Try adjusting your search query or reset status and channel filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setChannelFilter('all');
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-surface hover:bg-line text-ink font-bold text-[13px] border-0 cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[14px]">
              <thead>
                <tr className="border-b border-line bg-surface/50 text-left text-muted font-bold text-[13px]">
                  <th scope="col" className="p-4 pl-6">Order</th>
                  <th scope="col" className="p-4">Customer</th>
                  <th scope="col" className="p-4">Channel</th>
                  <th scope="col" className="p-4">Items / Total</th>
                  <th scope="col" className="p-4">Status</th>
                  <th scope="col" className="p-4 text-right pr-6">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F2F6]">
                {filteredOrders.map((ord) => (
                  <tr
                    key={ord.id}
                    onClick={() => router.push(`/admin/orders/${ord.orderNumber}`)}
                    className="hover:bg-surface/60 cursor-pointer transition-colors group"
                  >
                    <td className="p-4 pl-6 font-extrabold text-navy-deep group-hover:text-brand-red">
                      #{ord.orderNumber}
                    </td>
                    <td className="p-4 font-semibold text-ink">
                      {ord.customerName}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {ord.channel === 'trade' ? (
                        <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#E8E6F7] text-[#312682]">
                          Trade
                        </span>
                      ) : (
                        <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FDE6E8] text-[#9E0010]">
                          Public
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <strong className="text-navy-deep font-extrabold">{ord.totalFormatted}</strong>
                        <span className="text-[12px] text-muted">{ord.itemsCountDescription}</span>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span
                        style={{ backgroundColor: ord.statusBg, color: ord.statusFg }}
                        className="text-[12px] font-bold px-2.5 py-1 rounded-md capitalize"
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right text-muted text-[13px] whitespace-nowrap">
                      {ord.relativeTime}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

