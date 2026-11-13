'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/lib/cart/store';
import {
  TradeProductCard,
  TradeProductListRow,
} from '@/components/trade/TradeProductCard';
import { StickyTradeOrderBar } from '@/components/trade/StickyTradeOrderBar';
import { ReorderIcon } from '@/components/ui/Icons';
import { useToast } from '@/components/admin/ToastContext';
import type { TradeShopData, TradeSubCategory } from '@/lib/data/trade';
import type { Category } from '@/lib/data/types';
import { matchesProductSearch } from '@/lib/search';

interface TradeShopViewProps {
  initialData: TradeShopData;
  initialQuery?: string;
  mode?: 'trade' | 'retail';
}

export function getProductSubcategoryId(
  product: { id: string; name?: string; slug?: string; categoryId: string },
  subcategories: { id: string; slug: string }[] = []
): string | null {
  if (subcategories && subcategories.length > 0) {
    const directMatch = subcategories.find(
      (s) => s.id === product.categoryId || s.slug === product.categoryId
    );
    if (directMatch) return directMatch.id;
  }

  // Non-cosmetics categories must never be assigned cosmetics subcategories
  const cat = (product.categoryId || '').toLowerCase();
  if (
    cat === 'diy' ||
    cat === 'kitchenware' ||
    cat === 'party' ||
    cat === 'household' ||
    cat === 'hardware' ||
    cat === 'first-aid' ||
    cat === 'stationery' ||
    cat === 'a0000000-0000-0000-0000-000000000003' || // DIY
    cat === 'a0000000-0000-0000-0000-000000000004' || // Kitchenware
    cat === 'a0000000-0000-0000-0000-000000000006' || // Party
    cat === 'a0000000-0000-0000-0000-000000000002' || // Household
    cat === 'a0000000-0000-0000-0000-000000000007' || // First aid
    cat === 'a0000000-0000-0000-0000-000000000008' || // Hardware
    cat === 'a0000000-0000-0000-0000-000000000009'    // Stationery
  ) {
    return null;
  }

  const name = (product.name || '').toLowerCase();
  const slug = (product.slug || '').toLowerCase();

  // Explicit DIY paintbrush exclusion
  if (name.includes('paint') || slug.includes('paint')) {
    return null;
  }

  // Nail care (8 products):
  // Nail Scissors, False Nails, Nail File Sapphire, Stainless Steel Toenail Clippers,
  // Nail Glue, Nail Emery Boards, Tweezers, Stainless Steel Fingernail Clippers
  if (
    name.includes('nail') ||
    name.includes('emery') ||
    name.includes('clippers') ||
    name.includes('tweezers') ||
    slug.includes('nail') ||
    slug.includes('clippers') ||
    slug.includes('tweezers') ||
    slug.includes('emery')
  ) {
    return 'nail-care';
  }

  // Hair care (2 products):
  // Hair Grips, Radial Hair Brush
  if (
    name.includes('grip') ||
    slug.includes('grip') ||
    name.includes('radial') ||
    slug.includes('radial')
  ) {
    return 'hair-care';
  }

  // Combs and brushes (4 products):
  // Nit Combs, Large Vent Brush, Gents Comb, Handle Comb
  if (
    name.includes('comb') ||
    name.includes('vent') ||
    slug.includes('comb') ||
    slug.includes('vent') ||
    (name.includes('brush') && !name.includes('paint'))
  ) {
    return 'combs-and-brushes';
  }

  return null;
}

function productMatchesSubcategory(
  product: { id: string; name: string; slug?: string; categoryId: string },
  subIdOrSlug: string,
  subcategories: { id: string; slug: string }[] = []
): boolean {
  if (subIdOrSlug === 'all') return true;
  if (product.categoryId === subIdOrSlug) return true;

  const matchedSub = subcategories.find(
    (s) => s.id === subIdOrSlug || s.slug === subIdOrSlug
  );
  if (matchedSub && product.categoryId === matchedSub.slug) return true;

  const assigned = getProductSubcategoryId(product, subcategories);
  if (assigned === subIdOrSlug) return true;
  if (matchedSub && assigned === matchedSub.id) return true;

  return false;
}

function productMatchesCategory(
  product: { id: string; categoryId: string; name?: string; slug?: string },
  catIdOrSlug: string,
  categories: Category[] = [],
  subcategories: TradeSubCategory[] = []
): boolean {
  if (catIdOrSlug === 'all') return true;
  const cat = categories.find((c) => c.id === catIdOrSlug || c.slug === catIdOrSlug);
  const targetId = cat ? cat.id : catIdOrSlug;
  const targetSlug = cat ? cat.slug : catIdOrSlug;

  // 1. Direct match with category ID or slug
  if (product.categoryId === targetId || product.categoryId === targetSlug) {
    return true;
  }

  // 2. Match with any subcategory ID or slug attached to the category
  if (cat?.subCategoryIds && cat.subCategoryIds.length > 0) {
    if (cat.subCategoryIds.includes(product.categoryId)) {
      return true;
    }
  }

  // 3. If target category is Cosmetics
  const isCosmetics =
    targetId === 'cosmetics' ||
    targetSlug === 'cosmetics' ||
    (cat?.name && cat.name.toLowerCase() === 'cosmetics');

  if (isCosmetics) {
    // Check if product's categoryId is a cosmetics subcategory ID or slug
    const cosmeticsSubSlugs = ['nail-care', 'hair-care', 'combs-and-brushes'];
    if (cosmeticsSubSlugs.includes(product.categoryId)) return true;

    for (const sub of subcategories) {
      if (product.categoryId === sub.id || product.categoryId === sub.slug) {
        return true;
      }
    }

    // Check if the product itself is classified into nail care, hair care, or combs & brushes
    const subId = getProductSubcategoryId(product, subcategories);
    if (subId) return true;
  }

  // 4. Any other category's subcategories by name/slug
  if (cat?.subcategories && cat.subcategories.length > 0) {
    for (const subName of cat.subcategories) {
      const subSlug = subName.toLowerCase().replace(/\s+/g, '-');
      if (product.categoryId === subSlug) return true;
    }
  }

  return false;
}

function matchesAvailability(
  product: { stockPacks: number; flags?: { newArrival?: boolean } },
  inStockOnly: boolean,
  newOnly: boolean
): boolean {
  if (inStockOnly && product.stockPacks <= 0) return false;
  if (newOnly && !product.flags?.newArrival) return false;
  return true;
}

interface FilterControlsProps {
  mode: 'trade' | 'retail';
  initialData: TradeShopData;
  subcategoriesList: TradeSubCategory[];
  allCount: number;
  categoryCounts: Record<string, number>;
  subcategoryCounts: Record<string, number>;
  currentCatCount: number;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  inStockOnly: boolean;
  setInStockOnly: (val: boolean) => void;
  newOnly: boolean;
  setNewOnly: (val: boolean) => void;
  namePrefix?: string;
}

function FilterControls({
  mode,
  initialData,
  subcategoriesList,
  allCount,
  categoryCounts,
  subcategoryCounts,
  currentCatCount,
  selectedCategory,
  setSelectedCategory,
  selectedType,
  setSelectedType,
  inStockOnly,
  setInStockOnly,
  newOnly,
  setNewOnly,
  namePrefix = '',
}: FilterControlsProps) {
  const basePath = mode === 'trade' ? '/trade/shop' : '/shop';

  return (
    <>
      {/* Categories Filter (shared for public & trade shop) */}
      <fieldset className="border-0 m-0 p-0 flex flex-col gap-2">
        <legend className="font-extrabold text-navy-deep mb-2 text-[15px]">
          Categories
        </legend>
        <Link
          href={basePath}
          onClick={() => {
            setSelectedCategory('all');
            setSelectedType('all');
          }}
          className="flex gap-2.5 items-center cursor-pointer hover:text-brand-navy min-h-[36px] no-underline text-ink"
        >
          <input
            type="radio"
            name={`${namePrefix}category_filter`}
            checked={selectedCategory === 'all'}
            onChange={() => {
              setSelectedCategory('all');
              setSelectedType('all');
            }}
            className="w-4 h-4 accent-brand-navy cursor-pointer flex-none"
          />
          <span className="font-medium text-[14px]">
            {mode === 'trade' ? 'All products' : 'All Products'} ({allCount})
          </span>
        </Link>

        {initialData.categories.map((cat) => {
          const count = categoryCounts[cat.id] ?? categoryCounts[cat.slug] ?? 0;
          // Hide every category that has 0 products
          if (count <= 0) return null;
          const catHref = `${basePath}/${cat.slug}`;
          return (
            <Link
              key={cat.id}
              href={catHref}
              onClick={() => {
                setSelectedCategory(cat.slug);
                setSelectedType('all');
              }}
              className="flex gap-2.5 items-center cursor-pointer hover:text-brand-navy min-h-[36px] no-underline text-ink"
            >
              <input
                type="radio"
                name={`${namePrefix}category_filter`}
                checked={
                  selectedCategory === cat.slug || selectedCategory === cat.id
                }
                onChange={() => {
                  setSelectedCategory(cat.slug);
                  setSelectedType('all');
                }}
                className="w-4 h-4 accent-brand-navy cursor-pointer flex-none"
              />
              <span className="font-medium text-[14px]">
                {cat.name}{' '}
                <span className="text-muted text-[12px]">({count})</span>
              </span>
            </Link>
          );
        })}
      </fieldset>

      {/* Subcategories if available for active category (both trade & retail) */}
      {subcategoriesList.length > 0 &&
        selectedCategory !== 'all' && (
          (() => {
            const visibleSubs = subcategoriesList.filter(
              (sub) => (subcategoryCounts[sub.id] ?? 0) > 0
            );
            if (visibleSubs.length === 0) return null;
            return (
              <>
                <hr className="border-0 border-t border-line m-0" />
                <fieldset className="border-0 m-0 p-0 flex flex-col gap-2">
                  <legend className="font-extrabold text-navy-deep mb-2 text-[15px]">
                    Type
                  </legend>
                  <label className="flex gap-2.5 items-center cursor-pointer hover:text-brand-navy min-h-[36px]">
                    <input
                      type="radio"
                      name={`${namePrefix}sub_type`}
                      checked={selectedType === 'all'}
                      onChange={() => setSelectedType('all')}
                      className="w-4 h-4 accent-brand-navy cursor-pointer flex-none"
                    />
                    <span className="font-medium text-[14px]">
                      All types{' '}
                      <span className="text-muted text-[12px]">({currentCatCount})</span>
                    </span>
                  </label>
                  {visibleSubs.map((sub) => {
                    const count = subcategoryCounts[sub.id] ?? 0;
                    return (
                      <label
                        key={sub.id}
                        className="flex gap-2.5 items-center cursor-pointer hover:text-brand-navy min-h-[36px]"
                      >
                        <input
                          type="radio"
                          name={`${namePrefix}sub_type`}
                          checked={
                            selectedType === sub.id || selectedType === sub.slug
                          }
                          onChange={() => setSelectedType(sub.id)}
                          className="w-4 h-4 accent-brand-navy cursor-pointer flex-none"
                        />
                        <span className="font-medium text-[14px]">
                          {sub.name}{' '}
                          <span className="text-muted text-[12px]">
                            ({count})
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </fieldset>
              </>
            );
          })()
        )}

      <hr className="border-0 border-t border-line m-0" />

      {/* Availability Filters */}
      <fieldset className="border-0 m-0 p-0 flex flex-col gap-2">
        <legend className="font-extrabold text-navy-deep mb-2 text-[15px]">
          Availability
        </legend>
        <label className="flex gap-2.5 items-center cursor-pointer hover:text-brand-navy min-h-[36px]">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="w-4 h-4 accent-brand-navy rounded cursor-pointer flex-none"
          />
          <span className="font-medium text-[14px]">In stock only</span>
        </label>
        <label className="flex gap-2.5 items-center cursor-pointer hover:text-brand-navy min-h-[36px]">
          <input
            type="checkbox"
            checked={newOnly}
            onChange={(e) => setNewOnly(e.target.checked)}
            className="w-4 h-4 accent-brand-navy rounded cursor-pointer flex-none"
          />
          <span className="font-medium text-[14px]">New this month</span>
        </label>
      </fieldset>

      <hr className="border-0 border-t border-line m-0" />

      {/* Notice Chip */}
      <div className="bg-surface rounded-xl p-3 text-[13px] leading-relaxed text-text-2 border border-line/60">
        {mode === 'trade' ? (
          <>
            Showing <strong>trade packs</strong>. Every price is for a pack of 6 ex VAT.
          </>
        ) : (
          'Showing retail products. All items priced with VAT included.'
        )}
      </div>
    </>
  );
}

export function TradeShopView({
  initialData,
  initialQuery = '',
  mode = 'trade',
}: TradeShopViewProps) {
  const { showToast } = useToast();
  const setTradePacks = useCartStore((state) => state.setTradePacks);

  // Filter & Search state
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialData.currentCategory?.slug || 'all'
  );
  const [selectedType, setSelectedType] = useState<string>('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [newOnly, setNewOnly] = useState(false);
  const [sortBy, setSortBy] = useState<
    'best' | 'profit' | 'newest' | 'alpha' | 'price-asc' | 'price-desc'
  >('best');
  const [search, setSearch] = useState(initialQuery);

  // View mode: Grid vs List (persisted in localStorage)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Pagination state (24 per page)
  const [visibleCount, setVisibleCount] = useState(24);

  // Back to top button visibility
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Mobile filter drawer open/closed state
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Active filter count for mobile badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (mode === 'retail') {
      if (selectedCategory !== 'all') count++;
      if (selectedType !== 'all') count++;
    } else {
      if (selectedType !== 'all') count++;
    }
    if (inStockOnly) count++;
    if (newOnly) count++;
    return count;
  }, [mode, selectedCategory, selectedType, inStockOnly, newOnly]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedType('all');
    setInStockOnly(false);
    setNewOnly(false);
    setSearch('');
  };

  // Prevent body scrolling when mobile filter drawer is open
  useEffect(() => {
    if (isMobileFiltersOpen) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [isMobileFiltersOpen]);

  const storageKey =
    mode === 'trade' ? 'bnb_trade_view_mode' : 'bnb_retail_view_mode';

  // Load saved view mode from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === 'grid' || saved === 'list') {
        setViewMode(saved);
      }
    } catch {}
  }, [storageKey]);

  const handleToggleViewMode = (newMode: 'grid' | 'list') => {
    setViewMode(newMode);
    try {
      localStorage.setItem(storageKey, newMode);
    } catch {}
  };

  // Track scroll position for Back to top button (after 2 screens)
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 700);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // "Reorder last order" handler (trade only)
  const handleReorderLastOrder = () => {
    if (!initialData.lastOrder || initialData.lastOrder.items.length === 0) return;

    for (const item of initialData.lastOrder.items) {
      const matched = initialData.products.find((p) => p.id === item.productId);
      setTradePacks(
        {
          productId: item.productId,
          slug: matched?.slug,
          name: item.name,
          image: item.image,
          sku: item.sku,
          packPricePence: item.packPricePence,
          retailPricePence: item.retailPricePence,
          unitsPerPack: item.unitsPerPack,
        },
        item.packs
      );
    }

    showToast(
      'success',
      `${initialData.lastOrder.totalPacks} packs added from order #${initialData.lastOrder.orderNumber}`
    );
  };

  // Active Category identification
  const activeCategory =
    mode === 'retail'
      ? selectedCategory !== 'all'
        ? initialData.categories.find(
            (c) => c.slug === selectedCategory || c.id === selectedCategory
          )
        : initialData.currentCategory?.slug !== 'all'
        ? initialData.currentCategory
        : null
      : initialData.currentCategory;

  const title =
    mode === 'trade'
      ? initialData.currentCategory.name
      : activeCategory
      ? activeCategory.name
      : 'All Products';

  // Subcategories list (fallback to standard subcategories if empty)
  const defaultSubcategories: TradeSubCategory[] = useMemo(
    () => [
      { id: 'nail-care', name: 'Nail care', slug: 'nail-care', count: 8 },
      { id: 'hair-care', name: 'Hair care', slug: 'hair-care', count: 2 },
      { id: 'combs-and-brushes', name: 'Combs and brushes', slug: 'combs-and-brushes', count: 4 },
    ],
    []
  );

  const subcategoriesList: TradeSubCategory[] = useMemo(() => {
    if (initialData.subcategories && initialData.subcategories.length > 0) {
      return initialData.subcategories;
    }
    return defaultSubcategories;
  }, [initialData.subcategories, defaultSubcategories]);

  // Base Trade products (active, visible to trade, within currentCategory or its subcategories)
  const baseTradeProducts = useMemo(() => {
    return initialData.products.filter((p) => {
      if (p.visibleToTrade === false) return false;
      return productMatchesCategory(
        p,
        initialData.currentCategory?.slug || initialData.currentCategory?.id || 'cosmetics',
        initialData.categories,
        subcategoriesList
      );
    });
  }, [initialData.products, initialData.currentCategory, initialData.categories, subcategoriesList]);

  // Available Trade products (after Availability filters: inStockOnly, newOnly)
  const availableTradeProducts = useMemo(() => {
    return baseTradeProducts.filter((p) =>
      matchesAvailability(p, inStockOnly, newOnly)
    );
  }, [baseTradeProducts, inStockOnly, newOnly]);

  const tradeAllCount = availableTradeProducts.length;

  // Subcategory counts for trade mode (dynamic based on availability filters)
  const tradeSubcategoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const sub of subcategoriesList) {
      counts[sub.id] = availableTradeProducts.filter((p) =>
        productMatchesSubcategory(p, sub.id, subcategoriesList)
      ).length;
    }
    return counts;
  }, [availableTradeProducts, subcategoriesList]);

  // Base Retail products (active, visible to public)
  const baseRetailProducts = useMemo(() => {
    return initialData.products.filter((p) => p.visibleToPublic !== false);
  }, [initialData.products]);

  // Available Retail products (after Availability filters: inStockOnly, newOnly)
  const availableRetailProducts = useMemo(() => {
    return baseRetailProducts.filter((p) =>
      matchesAvailability(p, inStockOnly, newOnly)
    );
  }, [baseRetailProducts, inStockOnly, newOnly]);

  const retailAllCount = availableRetailProducts.length;

  // Retail category counts (dynamic based on availability filters)
  const retailCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of initialData.categories) {
      const c = availableRetailProducts.filter((p) =>
        productMatchesCategory(p, cat.slug || cat.id, initialData.categories, subcategoriesList)
      ).length;
      counts[cat.id] = c;
      counts[cat.slug] = c;
    }
    return counts;
  }, [availableRetailProducts, initialData.categories, subcategoriesList]);

  // Retail products in currently selected category (dynamic based on availability filters)
  const retailCurrentCatProducts = useMemo(() => {
    if (selectedCategory === 'all') return availableRetailProducts;
    return availableRetailProducts.filter((p) =>
      productMatchesCategory(p, selectedCategory, initialData.categories, subcategoriesList)
    );
  }, [availableRetailProducts, selectedCategory, initialData.categories, subcategoriesList]);

  const retailCurrentCatCount = retailCurrentCatProducts.length;

  // Retail subcategory counts under active category (dynamic based on availability filters)
  const retailSubcategoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const sub of subcategoriesList) {
      counts[sub.id] = retailCurrentCatProducts.filter((p) =>
        productMatchesSubcategory(p, sub.id, subcategoriesList)
      ).length;
    }
    return counts;
  }, [retailCurrentCatProducts, subcategoriesList]);

  // Filter & sort logic for the grid/list
  const filteredProducts = useMemo(() => {
    let list =
      mode === 'trade'
        ? [...availableTradeProducts]
        : [...availableRetailProducts];

    // In retail mode, filter by selectedCategory
    if (mode === 'retail' && selectedCategory !== 'all') {
      list = list.filter((p) =>
        productMatchesCategory(p, selectedCategory, initialData.categories, subcategoriesList)
      );
    }

    // Filter by selected subcategory
    if (selectedType !== 'all') {
      list = list.filter((p) =>
        productMatchesSubcategory(p, selectedType, subcategoriesList)
      );
    }

    // Search query with synonyms support
    if (search.trim()) {
      list = list.filter((p) => matchesProductSearch(p, search));
    }

    // Sorting
    if (sortBy === 'profit' && mode === 'trade') {
      list.sort((a, b) => {
        const profitA =
          a.retailPricePence * a.unitsPerPack - a.wholesalePackPricePence;
        const profitB =
          b.retailPricePence * b.unitsPerPack - b.wholesalePackPricePence;
        return profitB - profitA;
      });
    } else if (sortBy === 'price-asc') {
      list.sort((a, b) => a.retailPricePence - b.retailPricePence);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.retailPricePence - a.retailPricePence);
    } else if (sortBy === 'newest') {
      list.sort(
        (a, b) => (b.flags.newArrival ? 1 : 0) - (a.flags.newArrival ? 1 : 0)
      );
    } else if (sortBy === 'alpha') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Best selling
      list.sort(
        (a, b) => (b.flags.bestSeller ? 1 : 0) - (a.flags.bestSeller ? 1 : 0)
      );
    }

    return list;
  }, [
    mode,
    availableTradeProducts,
    availableRetailProducts,
    selectedCategory,
    selectedType,
    search,
    sortBy,
    initialData.categories,
    subcategoriesList,
  ]);

  const allCount = mode === 'trade' ? tradeAllCount : retailAllCount;
  const categoryCounts = retailCategoryCounts;
  const subcategoryCounts =
    mode === 'trade' ? tradeSubcategoryCounts : retailSubcategoryCounts;
  const currentCatCount =
    mode === 'trade' ? tradeAllCount : retailCurrentCatCount;

  // Auto-reset selectedCategory if it has 0 products
  useEffect(() => {
    if (selectedCategory !== 'all') {
      const count =
        categoryCounts[selectedCategory] ??
        categoryCounts[
          initialData.categories.find(
            (c) => c.slug === selectedCategory || c.id === selectedCategory
          )?.id || ''
        ] ??
        0;
      if (count === 0 && allCount > 0) {
        setSelectedCategory('all');
      }
    }
  }, [selectedCategory, categoryCounts, allCount, initialData.categories]);

  // Auto-reset selectedType if it has 0 products
  useEffect(() => {
    if (selectedType !== 'all') {
      const count = subcategoryCounts[selectedType] ?? 0;
      if (count === 0 && allCount > 0) {
        setSelectedType('all');
      }
    }
  }, [selectedType, subcategoryCounts, allCount]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  return (
    <main className="max-w-[1320px] mx-auto px-4 sm:px-8 py-7 pb-28 sm:pb-24 flex flex-col gap-6">
      {/* 1. Header bar */}
      <div className="flex flex-wrap justify-between items-end gap-4 border-b border-line pb-4">
        <div>
          <p className="m-0 mb-1.5 text-[13px] text-muted">
            <Link
              href="/"
              className="text-brand-navy hover:text-brand-red no-underline"
            >
              Home
            </Link>{' '}
            / {title}
          </p>
          <h1 className="m-0 text-[32px] sm:text-[40px] font-extrabold font-stretch-110 text-navy-deep leading-tight">
            {title}
          </h1>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-2.5 items-center">
          {/* Mobile Filters button */}
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(true)}
            className="md:hidden inline-flex items-center gap-2 h-10 px-3.5 rounded-[10px] border border-line bg-white hover:bg-surface text-ink font-bold text-[13px] shadow-xs cursor-pointer transition-colors"
            aria-label="Open product filters"
          >
            <svg
              className="w-4 h-4 text-brand-navy"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-brand-navy text-white text-[11px] font-extrabold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Reorder last order button - only shown in trade mode when retailer has a previous order */}
          {mode === 'trade' &&
            initialData.lastOrder &&
            initialData.lastOrder.items.length > 0 && (
              <button
                type="button"
                onClick={handleReorderLastOrder}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-[10px] bg-navy-deep hover:bg-[#2A2170] text-white font-bold text-[13px] border-0 cursor-pointer transition-colors shadow-xs"
              >
                <ReorderIcon size={16} />
                <span>Reorder last order</span>
              </button>
            )}

          {/* Grid / List Toggle */}
          <div className="flex items-center bg-white border border-line rounded-[10px] p-0.5">
            <button
              type="button"
              onClick={() => handleToggleViewMode('grid')}
              aria-label="Grid view"
              className={`p-1.5 rounded-[8px] border-0 cursor-pointer transition-colors ${
                viewMode === 'grid'
                  ? 'bg-brand-navy text-white shadow-xs'
                  : 'bg-transparent text-muted hover:text-ink'
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <rect width="7" height="7" x="3" y="3" rx="1" strokeWidth="2" />
                <rect width="7" height="7" x="14" y="3" rx="1" strokeWidth="2" />
                <rect width="7" height="7" x="14" y="14" rx="1" strokeWidth="2" />
                <rect width="7" height="7" x="3" y="14" rx="1" strokeWidth="2" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => handleToggleViewMode('list')}
              aria-label="List view"
              className={`p-1.5 rounded-[8px] border-0 cursor-pointer transition-colors ${
                viewMode === 'list'
                  ? 'bg-brand-navy text-white shadow-xs'
                  : 'bg-transparent text-muted hover:text-ink'
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-1.5">
            <label
              htmlFor={`sort-${mode}`}
              className="text-[13px] text-muted font-semibold"
            >
              Sort
            </label>
            <select
              id={`sort-${mode}`}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-10 rounded-[10px] border border-line px-3 font-sans text-[13px] font-bold bg-white text-ink outline-none cursor-pointer"
            >
              <option value="best">Best selling</option>
              {mode === 'trade' ? (
                <option value="profit">Highest profit</option>
              ) : (
                <>
                  <option value="price-asc">Price (low to high)</option>
                  <option value="price-desc">Price (high to low)</option>
                </>
              )}
              <option value="newest">Newest</option>
              <option value="alpha">Name A–Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Promotion & Display Stands Banner Row */}
      {mode === 'trade' ? (
        <div
          className={`grid gap-4 ${
            initialData.activePromotion
              ? 'grid-cols-1 md:grid-cols-2'
              : 'grid-cols-1'
          }`}
        >
          {/* Trade promotion banner - hidden if no active promotion */}
          {initialData.activePromotion && (
            <div className="bg-brand-red text-white rounded-[16px] p-5 sm:px-6 flex flex-wrap gap-4 items-center justify-between shadow-sm">
              <div className="min-w-0 flex-1">
                <p className="m-0 text-[15px] sm:text-[16px] font-bold text-white leading-snug">
                  {initialData.activePromotion.description || initialData.activePromotion.title}
                </p>
              </div>
              <Link
                href="/trade/stands"
                className="inline-flex items-center h-10 px-5 rounded-full bg-white hover:bg-surface text-brand-red no-underline font-extrabold text-[13px] sm:text-[14px] transition-colors shadow-xs flex-none"
              >
                View the range
              </Link>
            </div>
          )}

          {/* Display stands banner (trade only) */}
          <Link
            href="/trade/stands/80-hook-display-stand"
            className="bg-white border border-line rounded-[16px] p-4 sm:px-5 flex gap-4 items-center no-underline text-ink hover:border-brand-navy transition-colors shadow-xs group"
          >
            <Image
              src="/images/stand.jpg"
              alt=""
              width={64}
              height={64}
              className="w-14 h-14 object-cover rounded-[10px] flex-none border border-line"
            />
            <div className="flex-1 min-w-0">
              <strong className="block text-[16px] font-extrabold text-navy-deep group-hover:text-brand-red transition-colors">
                Display stands
              </strong>
              <p className="mt-0.5 mb-0 text-[13px] text-muted truncate">
                Order a fully stocked stand in one click
              </p>
            </div>
            <span className="font-extrabold text-brand-navy text-[13px] flex items-center gap-1">
              View stands →
            </span>
          </Link>
        </div>
      ) : initialData.activePromotion ? (
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-brand-red text-white rounded-[16px] p-5 sm:px-6 flex flex-wrap gap-3 items-center justify-between shadow-sm">
            <div className="min-w-0 flex-1">
              <strong className="block text-[17px] font-extrabold leading-snug">
                {initialData.activePromotion.title}
              </strong>
              <p className="mt-1 mb-0 text-[14px] text-white/90 leading-tight">
                {initialData.activePromotion.description}
              </p>
            </div>
            <Link
              href={initialData.activePromotion.targetHref}
              className="inline-flex items-center h-10 px-4 rounded-full bg-white hover:bg-surface text-brand-red no-underline font-extrabold text-[13px] transition-colors shadow-xs flex-none"
            >
              View offer →
            </Link>
          </div>
        </div>
      ) : null}

      {/* 3. Two columns: Sticky Filter Panel + Product Area */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Left Sticky Filter Panel (desktop only: sticky below the header) */}
        <aside className="hidden md:flex w-[240px] lg:w-[260px] flex-none bg-white border border-line rounded-[16px] p-5 flex-col gap-5 text-[14px] md:sticky md:top-[84px] self-start max-h-[calc(100vh-96px)] overflow-y-auto no-scrollbar shadow-xs z-30">
          <FilterControls
            mode={mode}
            initialData={initialData}
            subcategoriesList={subcategoriesList}
            allCount={allCount}
            categoryCounts={categoryCounts}
            subcategoryCounts={subcategoryCounts}
            currentCatCount={currentCatCount}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            inStockOnly={inStockOnly}
            setInStockOnly={setInStockOnly}
            newOnly={newOnly}
            setNewOnly={setNewOnly}
            namePrefix="desktop_"
          />
        </aside>

        {/* Product Area: Grid or List View */}
        <section
          aria-label="Products"
          className="flex-1 min-w-0 flex flex-col gap-6"
        >
          {filteredProducts.length === 0 ? (
            <div className="bg-white border border-line rounded-[16px] p-12 text-center text-muted">
              <p className="text-[16px] font-bold text-ink">
                No products match your filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedType('all');
                  setInStockOnly(false);
                  setNewOnly(false);
                  setSearch('');
                }}
                className="mt-3 px-4 py-2 rounded-xl bg-brand-navy text-white text-[13px] font-bold border-0 cursor-pointer hover:bg-navy-deep transition-colors"
              >
                Reset all filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* Shorter, Denser Product Grid: 4 cols at 1280px+, 3 at 1024px, 2 on tablet, 2 on phone */
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {visibleProducts.map((p) => (
                <TradeProductCard key={p.id} product={p} mode={mode} />
              ))}
            </div>
          ) : (
            /* Compact Fast-Ordering List View */
            <div className="flex flex-col gap-2.5">
              {visibleProducts.map((p) => (
                <TradeProductListRow key={p.id} product={p} mode={mode} />
              ))}
            </div>
          )}

          {/* Pagination: Showing count & Load more button */}
          {filteredProducts.length > 0 && (
            <div className="flex flex-col items-center justify-center gap-3 pt-4 pb-6">
              <p className="m-0 text-[13px] text-muted font-medium">
                Showing{' '}
                <strong className="text-navy-deep font-bold">
                  {visibleProducts.length}
                </strong>{' '}
                of{' '}
                <strong className="text-navy-deep font-bold">
                  {filteredProducts.length}
                </strong>{' '}
                products
              </p>

              {visibleProducts.length < filteredProducts.length && (
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 24)}
                  className="px-6 py-2.5 rounded-xl border border-brand-navy bg-white hover:bg-brand-navy hover:text-white text-brand-navy font-bold text-[14px] cursor-pointer transition-colors shadow-xs"
                >
                  Load more products
                </button>
              )}
            </div>
          )}
        </section>
      </div>

      {/* 4. Fixed Sticky Order Bar (only for trade mode) */}
      {mode === 'trade' && <StickyTradeOrderBar />}

      {/* 5. Back to Top Button (appearing after scrolling 2 viewports) */}
      {showBackToTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Back to top"
          className="fixed right-5 sm:right-8 bottom-[88px] z-30 w-11 h-11 rounded-full bg-white hover:bg-surface text-navy-deep border border-line shadow-lg cursor-pointer flex items-center justify-center transition-transform hover:-translate-y-1 animate-in fade-in duration-200"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M5 15l7-7 7 7"
            />
          </svg>
        </button>
      )}

      {/* 6. Mobile Filter Drawer (phones & tablets < md) */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileFiltersOpen(false)}
            aria-hidden="true"
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Slide-over panel */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filter products"
            className="relative w-[min(380px,88vw)] h-full bg-white z-10 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
          >
            {/* Drawer Header */}
            <div className="px-5 py-4 border-b border-line flex items-center justify-between flex-none bg-white">
              <div className="flex items-center gap-2">
                <h2 className="m-0 text-[18px] font-extrabold text-navy-deep">
                  Filters
                </h2>
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-brand-navy text-white text-[11px] font-extrabold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(false)}
                aria-label="Close filters"
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border border-line bg-surface text-ink hover:bg-line/60 flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Drawer Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5 text-[14px]">
              <FilterControls
                mode={mode}
                initialData={initialData}
                subcategoriesList={subcategoriesList}
                allCount={allCount}
                categoryCounts={categoryCounts}
                subcategoryCounts={subcategoryCounts}
                currentCatCount={currentCatCount}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedType={selectedType}
                setSelectedType={setSelectedType}
                inStockOnly={inStockOnly}
                setInStockOnly={setInStockOnly}
                newOnly={newOnly}
                setNewOnly={setNewOnly}
                namePrefix="mobile_"
              />
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-line flex gap-3 flex-none bg-white">
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="h-12 px-4 rounded-xl border border-line bg-surface text-ink font-bold text-[14px] cursor-pointer hover:bg-line/40 transition-colors"
                >
                  Reset
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(false)}
                className="flex-1 h-12 rounded-xl bg-brand-navy hover:bg-navy-deep text-white font-extrabold text-[15px] border-0 cursor-pointer transition-colors shadow-sm"
              >
                Show {filteredProducts.length}{' '}
                {filteredProducts.length === 1 ? 'product' : 'products'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
