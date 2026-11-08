'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface CustomerItem {
  email: string;
  contactName: string;
  ordersCount: number;
  totalSpentFormatted: string;
  totalSpentPence: number;
  lastOrderFormatted: string;
  lastOrderIso: string;
}

interface AdminCustomersClientProps {
  initialCustomers: CustomerItem[];
}

export function AdminCustomersClient({ initialCustomers }: AdminCustomersClientProps) {
  const [search, setSearch] = useState('');

  const filtered = initialCustomers.filter(
    (c) =>
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.contactName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-5 sm:p-8 pb-16 flex flex-col gap-6 max-w-[1360px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="m-0 text-[30px] sm:text-[34px] font-extrabold font-stretch-110 text-navy-deep">
            Public customers
          </h1>
          <p className="mt-1 mb-0 text-[14px] text-muted font-medium">
            Aggregated retail and guest customer purchase history
          </p>
        </div>

        <div className="text-[13px] text-muted font-bold">
          {filtered.length} customers
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white border border-line rounded-[20px] p-4 shadow-xs flex items-center justify-between gap-4">
        <div className="w-full sm:w-80 relative">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer email or name..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-field-border text-[14px] text-ink outline-none focus:border-brand-navy"
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
      </div>

      {/* Table Card */}
      <div className="bg-white border border-line rounded-[20px] shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-muted">
            No public customers found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[14px]">
              <thead>
                <tr className="border-b border-line bg-surface/50 text-left text-muted font-bold text-[13px]">
                  <th scope="col" className="p-4 pl-6">Customer</th>
                  <th scope="col" className="p-4">Email</th>
                  <th scope="col" className="p-4 text-center">Orders</th>
                  <th scope="col" className="p-4">Total spent</th>
                  <th scope="col" className="p-4 text-right pr-6">Last order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F2F6]">
                {filtered.map((cust) => (
                  <tr key={cust.email} className="hover:bg-surface/50 transition-colors">
                    <td className="p-4 pl-6 font-bold text-navy-deep">
                      {cust.contactName}
                    </td>
                    <td className="p-4 text-text-2">
                      <a href={`mailto:${cust.email}`} className="text-brand-navy hover:underline">
                        {cust.email}
                      </a>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-block bg-surface px-2.5 py-0.5 rounded-full font-bold text-navy-deep text-[13px]">
                        {cust.ordersCount}
                      </span>
                    </td>
                    <td className="p-4 font-extrabold text-navy-deep">
                      {cust.totalSpentFormatted}
                    </td>
                    <td className="p-4 pr-6 text-right text-muted whitespace-nowrap">
                      {cust.lastOrderFormatted}
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

