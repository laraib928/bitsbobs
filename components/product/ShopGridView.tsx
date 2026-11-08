'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Category, Product } from '@/lib/data/types';
import { ProductCard } from '@/components/product/ProductCard';

interface ShopGridViewProps {
  products: Product[];
  categories: Category[];
  currentCategory?: Category;
  initialQuery?: string;
}

export function ShopGridView({
  products,
  categories,
  currentCategory,
  initialQuery = '',
}: ShopGridViewProps) {
  const [selectedSubcat, setSelectedSubcat] = useState<string>('all');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<'best' | 'newest' | 'price-asc'>('best');
  const [search, setSearch] = useState<string>(initialQuery);

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (currentCategory) {
      list = list.filter((p) => p.categoryId === currentCategory.id);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortLine.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q)
      );
    }

    if (onlyInStock) {
      list = list.filter((p) => p.stockPacks > 0);
    }

    if (sortBy === 'newest') {
      list.sort((a, b) => (b.flags.newArrival ? 1 : 0) - (a.flags.newArrival ? 1 : 0));
    } else if (sortBy === 'price-asc') {
      list.sort((a, b) => a.retailPricePence - b.retailPricePence);
    } else {
      // Best selling default
      list.sort((a, b) => (b.flags.bestSeller ? 1 : 0) - (a.flags.bestSeller ? 1 : 0));
    }

    return list;
  }, [products, currentCategory, search, onlyInStock, sortBy]);

  const title = currentCategory ? currentCategory.name : 'All Products';

  return (
    <main className="max-w-[1320px] mx-auto px-8 py-9 pb-20 flex flex-col gap-6">
      {/* Header Bar */}
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div>
          <p className="m-0 mb-1.5 text-[14px] text-muted">
            <Link href="/" className="text-brand-navy hover:text-brand-red no-underline">
              Home
            </Link>{' '}
            / {title}
          </p>
          <h1 className="m-0 text-[38px] sm:text-[44px] font-extrabold font-stretch-110 text-navy-deep">
            {title}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2.5 items-center">
          <label htmlFor="sort-public" className="text-[14px] text-muted">
            Sort
          </label>
          <select
            id="sort-public"
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as 'best' | 'newest' | 'price-asc')
            }
            className="h-11 rounded-[10px] border border-line px-3 font-sans text-[14px] bg-white text-ink outline-none"
          >
            <option value="best">Best selling</option>
            <option value="newest">Newest arrivals</option>
            <option value="price-asc">Price (low to high)</option>
          </select>
        </div>
      </div>

      {/* Main Content Layout: Filters Sidebar + Grid */}
      <div className="flex flex-wrap gap-6 items-start">
        {/* Filters Sidebar */}
        <aside className="w-full md:w-[260px] flex-none bg-white border border-line rounded-[14px] p-5 flex flex-col gap-5 text-[15px]">
          {/* Categories */}
          <fieldset className="border-0 m-0 p-0 flex flex-col gap-2.5">
            <legend className="font-bold text-ink mb-2.5">Categories</legend>
            <Link
              href="/shop"
              className={`py-1 text-[14px] no-underline transition-colors ${
                !currentCategory
                  ? 'font-bold text-brand-navy'
                  : 'text-text-2 hover:text-brand-red'
              }`}
            >
              All Products
            </Link>
            {categories.map((cat) => {
              const isCurrent = currentCategory?.id === cat.id;
              return (
                <Link
                  key={cat.id}
                  href={`/shop/${cat.slug}`}
                  className={`py-1 text-[14px] no-underline transition-colors ${
                    isCurrent
                      ? 'font-bold text-brand-navy'
                      : 'text-text-2 hover:text-brand-red'
                  }`}
                >
                  {cat.name}
                </Link>
              );
            })}
          </fieldset>

          {/* Subcategories if category has them */}
          {currentCategory?.subcategories && (
            <fieldset className="border-0 m-0 p-0 flex flex-col gap-2.5 pt-3 border-t border-line">
              <legend className="font-bold text-ink mb-2.5">Type</legend>
              <label className="flex gap-2.5 items-center cursor-pointer text-[14px]">
                <input
                  type="radio"
                  name="subcat"
                  checked={selectedSubcat === 'all'}
                  onChange={() => setSelectedSubcat('all')}
                  className="w-4 h-4 accent-brand-navy"
                />
                All {currentCategory.name}
              </label>
              {currentCategory.subcategories.map((sub) => (
                <label
                  key={sub}
                  className="flex gap-2.5 items-center cursor-pointer text-[14px]"
                >
                  <input
                    type="radio"
                    name="subcat"
                    checked={selectedSubcat === sub}
                    onChange={() => setSelectedSubcat(sub)}
                    className="w-4 h-4 accent-brand-navy"
                  />
                  {sub}
                </label>
              ))}
            </fieldset>
          )}

          {/* Availability */}
          <fieldset className="border-0 m-0 p-0 flex flex-col gap-2.5 pt-3 border-t border-line">
            <legend className="font-bold text-ink mb-2.5">Availability</legend>
            <label className="flex gap-2.5 items-center cursor-pointer text-[14px]">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="w-4 h-4 accent-brand-navy rounded"
              />
              In stock only
            </label>
          </fieldset>

          {/* Helper chip */}
          <div className="bg-surface rounded-[10px] p-3.5 text-[14px] leading-relaxed text-text-2">
            Showing retail products. All items priced with VAT included.
          </div>
        </aside>

        {/* Products Grid */}
        <section
          aria-label="Products"
          className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {filteredProducts.length === 0 ? (
            <div className="col-span-full py-16 text-center text-muted">
              <p className="text-[18px]">No products found matching your criteria.</p>
              <Link
                href="/shop"
                className="mt-3 inline-block font-bold text-brand-navy hover:underline"
              >
                Clear all filters
              </Link>
            </div>
          ) : (
            filteredProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))
          )}
        </section>
      </div>
    </main>
  );
}

