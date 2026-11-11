'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { RetailerOrder } from '@/lib/data/trade-account';
import { SearchIcon } from '@/components/ui/Icons';

interface RetailerOrdersViewProps {
  orders: RetailerOrder[];
}

export function RetailerOrdersView({ orders }: RetailerOrdersViewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status filter
      if (statusFilter !== 'all') {
        if (order.status.toLowerCase() !== statusFilter.toLowerCase()) {
          return false;
        }
      }

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesNumber =
          order.orderNumberFormatted.toLowerCase().includes(q) ||
          String(order.orderNumber).includes(q);
        const matchesDate = order.dateFormatted.toLowerCase().includes(q);
        const matchesItem = order.items.some((it) =>
          it.name.toLowerCase().includes(q)
        );
        if (!matchesNumber && !matchesDate && !matchesItem) {
          return false;
        }
      }

      return true;
    });
  }, [orders, search, statusFilter]);

  const uniqueStatuses = useMemo(() => {
    const set = new Set<string>();
    orders.forEach((o) => set.add(o.status));
    return Array.from(set);
  }, [orders]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="m-0 text-[30px] sm:text-[36px] font-extrabold font-stretch-112 text-navy-deep tracking-[-0.01em]">
            Previous orders
          </h1>
          <p className="mt-1 mb-0 text-[15px] text-muted">
            View, track and reorder from your complete trade order history.
          </p>
        </div>
        <Link
          href="/trade/shop"
          className="inline-flex items-center justify-center h-11 px-5 rounded-full bg-brand-navy hover:bg-[#251c68] text-white no-underline font-bold text-[14px] transition-colors self-start sm:self-auto"
        >
          + New trade order
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-line rounded-[20px] p-4 flex flex-col sm:flex-row gap-3 shadow-sm">
        {/* Search */}
        <div className="flex-1 relative flex items-center">
          <SearchIcon size={18} className="absolute left-3.5 text-muted pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order number or item..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-field-border bg-surface text-ink text-[14px] outline-none focus:border-brand-navy"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="status-filter" className="text-[13px] font-bold text-muted whitespace-nowrap">
            Status:
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 px-3.5 rounded-xl border border-field-border bg-surface text-ink text-[14px] font-semibold outline-none focus:border-brand-navy cursor-pointer"
          >
            <option value="all">All statuses ({orders.length})</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="pending_payment">Pending payment</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders List / Table */}
      <div className="bg-white border border-line rounded-[20px] p-6 shadow-sm flex flex-col gap-4">
        {filteredOrders.length === 0 ? (
          <div className="py-14 text-center flex flex-col items-center justify-center gap-3">
            <span className="text-4xl">🔍</span>
            <p className="m-0 text-[17px] font-bold text-ink">
              {orders.length === 0
                ? 'No previous trade orders found'
                : 'No orders match your search'}
            </p>
            <p className="m-0 text-[14px] text-muted max-w-sm">
              {orders.length === 0
                ? 'When you place orders in the trade shop, they will automatically appear here with full invoice and tracking history.'
                : 'Try adjusting your search terms or changing the status filter.'}
            </p>
            {orders.length === 0 ? (
              <Link
                href="/trade/shop"
                className="mt-2 inline-flex items-center h-11 px-6 rounded-full bg-brand-navy hover:bg-[#251c68] text-white no-underline font-bold text-[14px] transition-colors"
              >
                Browse trade shop
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('all');
                }}
                className="mt-2 text-brand-navy font-bold text-[14px] hover:underline bg-transparent border-0 cursor-pointer"
              >
                Clear all filters
              </button>
            )}
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
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((ord) => (
                  <tr
                    key={ord.id}
                    className="border-b border-[#EEEFF4] hover:bg-surface/50 transition-colors"
                  >
                    <td className="p-3 pl-0 whitespace-nowrap">
                      <Link
                        href={`/trade/account/orders/${ord.id}`}
                        className="font-extrabold text-navy-deep hover:underline"
                      >
                        {ord.orderNumberFormatted}
                      </Link>
                    </td>
                    <td className="p-3 text-text-2 whitespace-nowrap">
                      {ord.dateFormatted}
                    </td>
                    <td className="p-3 text-text-2 whitespace-nowrap">
                      <span className="font-semibold text-ink">
                        {ord.itemsDescription}
                      </span>
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
                          View detail →
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
      </div>
    </div>
  );
}

