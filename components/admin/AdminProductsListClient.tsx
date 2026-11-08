'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatMoney } from '@/lib/money';
import type { Product } from '@/lib/data/types';

interface AdminProductsListClientProps {
  products: Product[];
}

export function AdminProductsListClient({ products }: AdminProductsListClientProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = Array.from(new Set(products.map((p) => p.categoryId)));

  const filtered = products.filter((p) => {
    const matchesSearch =
      search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase());

    const matchesCat =
      selectedCategory === 'all' || p.categoryId === selectedCategory;

    return matchesSearch && matchesCat;
  });

  return (
    <div className="p-5 sm:p-8 pb-16 flex flex-col gap-6 max-w-[1360px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="m-0 text-[30px] sm:text-[34px] font-extrabold font-stretch-110 text-navy-deep">
            Products & inventory
          </h1>
          <p className="mt-1 mb-0 text-[14px] text-muted font-medium">
            Manage catalogue pricing, pack specifications, stock levels, and flags
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-1.5 h-11 px-4 rounded-xl bg-brand-red hover:bg-[#c9000b] text-white no-underline font-bold text-[14px] shadow-xs transition-colors"
        >
          <span className="text-lg leading-none">+</span>
          <span>Add product</span>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-line rounded-[20px] p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 basis-[280px] relative">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product name or code..."
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

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="h-11 px-3.5 rounded-xl border border-field-border bg-white text-[13px] font-bold text-navy-deep outline-none capitalize"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c.replace('-', ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-line rounded-[20px] shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-muted">
            No products found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[14px]">
              <thead>
                <tr className="border-b border-line bg-surface/50 text-left text-muted font-bold text-[13px]">
                  <th scope="col" className="p-4 pl-6">Product</th>
                  <th scope="col" className="p-4">Code</th>
                  <th scope="col" className="p-4">Retail RRP</th>
                  <th scope="col" className="p-4">Wholesale Pack (6)</th>
                  <th scope="col" className="p-4 text-center">Stock</th>
                  <th scope="col" className="p-4 text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F2F6]">
                {filtered.map((prod) => (
                  <tr key={prod.id} className="hover:bg-surface/50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <Image
                          src={prod.images[0] || '/images/hair-grips.jpg'}
                          alt=""
                          width={40}
                          height={40}
                          className="w-10 h-10 object-contain rounded-lg border border-line p-0.5 bg-white flex-none"
                        />
                        <div className="min-w-0">
                          <strong className="block text-navy-deep font-bold text-[15px]">
                            {prod.name}
                          </strong>
                          <span className="text-[12px] text-muted capitalize">
                            {prod.categoryId.replace('-', ' ')}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-[13px] text-text-2">
                      #{prod.code}
                    </td>
                    <td className="p-4 font-bold text-ink">
                      {formatMoney(prod.retailPricePence)}
                    </td>
                    <td className="p-4 font-bold text-navy-deep">
                      {formatMoney(prod.wholesalePackPricePence)}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`inline-block text-[12px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          prod.stockPacks === 0
                            ? 'bg-red-100 text-brand-red'
                            : prod.stockPacks <= prod.lowStockAt
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {prod.stockPacks} packs
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right whitespace-nowrap">
                      <Link
                        href={`/admin/products/${prod.id}`}
                        className="px-3 py-1.5 rounded-lg border border-line bg-white hover:bg-surface text-ink font-bold text-[12px] no-underline inline-block"
                      >
                        Edit
                      </Link>
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

