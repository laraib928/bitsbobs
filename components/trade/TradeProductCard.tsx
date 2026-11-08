'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/data/types';
import { calculateTradeProfit, formatMoney } from '@/lib/money';
import { useCartStore } from '@/lib/cart/store';
import { QuantityStepper } from '@/components/ui/QuantityStepper';

interface TradeProductCardProps {
  product: Product;
  mode?: 'trade' | 'retail';
}

export function TradeProductCard({
  product,
  mode = 'trade',
}: TradeProductCardProps) {
  // Trade cart state
  const tradeItem = useCartStore((state) =>
    mode === 'trade'
      ? state.tradeItems.find((i) => i.productId === product.id)
      : undefined
  );
  const setTradePacks = useCartStore((state) => state.setTradePacks);

  // Retail cart state
  const publicItem = useCartStore((state) =>
    mode === 'retail'
      ? state.publicItems.find((i) => i.productId === product.id)
      : undefined
  );
  const addPublicItem = useCartStore((state) => state.addPublicItem);
  const updatePublicQuantity = useCartStore(
    (state) => state.updatePublicQuantity
  );
  const removePublicItem = useCartStore((state) => state.removePublicItem);

  const packs = tradeItem ? tradeItem.packs : 0;
  const retailQty = publicItem ? publicItem.quantity : 0;
  const isOutOfStock = product.stockPacks <= 0;

  // Calculate profit dynamically for trade: RRP * units per pack - wholesale pack price
  const profit = calculateTradeProfit(
    product.retailPricePence,
    product.unitsPerPack || 6,
    product.wholesalePackPricePence
  );

  // Retail badge logic
  const displayBadge =
    mode === 'retail'
      ? product.flags.specialOffer
        ? 'Offer'
        : product.flags.bestSeller
        ? 'Best seller'
        : product.flags.newArrival
        ? 'New'
        : undefined
      : undefined;

  const badgeBg = displayBadge === 'Offer' ? '#E30512' : '#1D1650';

  // Stock status text & color
  let stockLabel = 'In stock';
  let stockColor = '#1E7A3E'; // success
  if (isOutOfStock) {
    stockLabel = 'Out of stock';
    stockColor = '#B3000E'; // danger
  } else if (product.stockPacks <= product.lowStockAt) {
    stockLabel = 'Low stock, order soon';
    stockColor = '#A35A00'; // warning
  }

  const handlePacksChange = (newPacks: number) => {
    if (isOutOfStock) return;
    setTradePacks(
      {
        productId: product.id,
        name: product.name,
        image: product.images[0] || '/images/false-nails.jpg',
        sku: product.code,
        packPricePence: product.wholesalePackPricePence,
        retailPricePence: product.retailPricePence,
        unitsPerPack: product.unitsPerPack || 6,
      },
      newPacks
    );
  };

  const handleRetailAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;
    addPublicItem(
      {
        productId: product.id,
        name: product.name,
        image: product.images[0] || '/images/false-nails.jpg',
        pricePence: product.retailPricePence,
      },
      1
    );
  };

  const handleRetailQtyChange = (newQty: number) => {
    if (newQty <= 0) {
      removePublicItem(product.id);
    } else {
      updatePublicQuantity(product.id, newQty);
    }
  };

  return (
    <article
      className={`bg-white border border-line rounded-[14px] p-3 flex flex-col gap-2 transition-shadow hover:shadow-md ${
        isOutOfStock ? 'opacity-65 bg-slate-50/70' : ''
      }`}
    >
      {/* Square image box, max 160px tall */}
      <Link
        href={`/products/${product.slug}`}
        className="block relative rounded-lg overflow-hidden group h-[135px] sm:h-[150px] max-h-[160px] w-full bg-white flex items-center justify-center p-1"
      >
        <Image
          src={product.images[0] || '/images/false-nails.jpg'}
          alt={product.name}
          width={180}
          height={180}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
        />

        {mode === 'trade' ? (
          <span className="absolute top-1 left-1 bg-brand-yellow text-ink text-[11px] font-extrabold px-1.5 py-0.5 rounded-[5px] shadow-xs">
            Profit {profit.profitFormatted}
          </span>
        ) : (
          displayBadge && (
            <span
              style={{ backgroundColor: badgeBg }}
              className="absolute top-1 left-1 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-[5px] shadow-xs"
            >
              {displayBadge}
            </span>
          )
        )}
      </Link>

      {/* Title & SKU */}
      <div className="min-w-0">
        <h2 className="m-0 text-[14px] sm:text-[15px] font-bold leading-tight truncate">
          <Link
            href={`/products/${product.slug}`}
            className="text-ink hover:text-brand-red no-underline transition-colors"
            title={product.name}
          >
            {product.name}
          </Link>
        </h2>
        <p className="mt-1 mb-0 text-[12px] text-muted truncate">
          {mode === 'trade'
            ? `Pack of ${product.unitsPerPack || 6} · Code #${product.code}`
            : product.shortLine || `Code #${product.code}`}
        </p>
      </div>

      {/* Pricing */}
      {mode === 'trade' ? (
        <div className="flex justify-between items-baseline text-[13px] pt-0.5">
          <span>
            <strong className="text-[19px] font-extrabold text-navy-deep">
              {formatMoney(product.wholesalePackPricePence)}
            </strong>
            <span className="text-muted text-[12px]"> /pack</span>
          </span>
          <span className="text-muted text-[12px]">
            RRP {formatMoney(product.retailPricePence, { allowPenceOnly: true })}
          </span>
        </div>
      ) : (
        <div className="flex justify-between items-baseline text-[13px] pt-0.5">
          <span>
            <strong className="text-[19px] sm:text-[20px] font-extrabold text-navy-deep">
              {formatMoney(product.retailPricePence, { allowPenceOnly: true })}
            </strong>
            <span className="text-muted text-[12px] ml-1 font-medium">incl. VAT</span>
          </span>
          {product.code && (
            <span className="text-muted text-[11px] font-medium">#{product.code}</span>
          )}
        </div>
      )}

      {/* Stock status indicator */}
      <p
        style={{ color: stockColor }}
        className="m-0 text-[12px] font-semibold"
      >
        {stockLabel}
      </p>

      {/* Action: Trade Stepper in packs OR Retail Add to basket / Stepper */}
      <div className="mt-auto pt-1">
        {mode === 'trade' ? (
          <QuantityStepper
            value={packs}
            onChange={handlePacksChange}
            min={0}
            minPacks={product.minPacks || 1}
            disabled={isOutOfStock}
            ariaLabel={`Packs of ${product.name}`}
            size="compact"
          />
        ) : isOutOfStock ? (
          <button
            type="button"
            disabled
            className="w-full h-10 rounded-[10px] bg-slate-100 text-muted font-bold text-[13px] border-0 cursor-not-allowed flex items-center justify-center"
          >
            Out of stock
          </button>
        ) : retailQty === 0 ? (
          <button
            type="button"
            onClick={handleRetailAdd}
            className="w-full h-10 rounded-[10px] bg-brand-red hover:bg-[#c9000b] text-white font-bold text-[13px] border-0 cursor-pointer flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            Add to basket
          </button>
        ) : (
          <QuantityStepper
            value={retailQty}
            onChange={handleRetailQtyChange}
            min={0}
            minPacks={1}
            ariaLabel={`Quantity of ${product.name}`}
            size="compact"
          />
        )}
      </div>
    </article>
  );
}

/**
 * Compact fast-ordering row for List View
 */
export function TradeProductListRow({
  product,
  mode = 'trade',
}: TradeProductCardProps) {
  const tradeItem = useCartStore((state) =>
    mode === 'trade'
      ? state.tradeItems.find((i) => i.productId === product.id)
      : undefined
  );
  const setTradePacks = useCartStore((state) => state.setTradePacks);

  const publicItem = useCartStore((state) =>
    mode === 'retail'
      ? state.publicItems.find((i) => i.productId === product.id)
      : undefined
  );
  const addPublicItem = useCartStore((state) => state.addPublicItem);
  const updatePublicQuantity = useCartStore(
    (state) => state.updatePublicQuantity
  );
  const removePublicItem = useCartStore((state) => state.removePublicItem);

  const packs = tradeItem ? tradeItem.packs : 0;
  const retailQty = publicItem ? publicItem.quantity : 0;
  const isOutOfStock = product.stockPacks <= 0;

  const profit = calculateTradeProfit(
    product.retailPricePence,
    product.unitsPerPack || 6,
    product.wholesalePackPricePence
  );

  let stockLabel = 'In stock';
  let stockColor = '#1E7A3E';
  if (isOutOfStock) {
    stockLabel = 'Out of stock';
    stockColor = '#B3000E';
  } else if (product.stockPacks <= product.lowStockAt) {
    stockLabel = 'Low stock';
    stockColor = '#A35A00';
  }

  const handlePacksChange = (newPacks: number) => {
    if (isOutOfStock) return;
    setTradePacks(
      {
        productId: product.id,
        name: product.name,
        image: product.images[0] || '/images/false-nails.jpg',
        sku: product.code,
        packPricePence: product.wholesalePackPricePence,
        retailPricePence: product.retailPricePence,
        unitsPerPack: product.unitsPerPack || 6,
      },
      newPacks
    );
  };

  const handleRetailAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;
    addPublicItem(
      {
        productId: product.id,
        name: product.name,
        image: product.images[0] || '/images/false-nails.jpg',
        pricePence: product.retailPricePence,
      },
      1
    );
  };

  const handleRetailQtyChange = (newQty: number) => {
    if (newQty <= 0) {
      removePublicItem(product.id);
    } else {
      updatePublicQuantity(product.id, newQty);
    }
  };

  return (
    <article
      className={`bg-white border border-line rounded-[12px] p-2.5 sm:px-4 flex items-center justify-between gap-3 sm:gap-6 hover:border-brand-navy/30 transition-colors ${
        isOutOfStock ? 'opacity-60 bg-slate-50/70' : ''
      }`}
    >
      {/* 48px square thumbnail */}
      <Link
        href={`/products/${product.slug}`}
        className="w-12 h-12 rounded-[8px] border border-line bg-white p-0.5 flex-none flex items-center justify-center overflow-hidden"
      >
        <Image
          src={product.images[0] || '/images/false-nails.jpg'}
          alt=""
          width={48}
          height={48}
          className="w-full h-full object-contain"
        />
      </Link>

      {/* Product Title, Code & Stock */}
      <div className="min-w-0 flex-1">
        <h3 className="m-0 text-[14px] font-bold text-ink truncate leading-tight">
          <Link
            href={`/products/${product.slug}`}
            className="text-ink hover:text-brand-red no-underline transition-colors"
          >
            {product.name}
          </Link>
        </h3>
        <div className="flex flex-wrap items-center gap-2 mt-1 text-[12px]">
          <span className="text-muted">Code #{product.code}</span>
          {mode === 'trade' && (
            <>
              <span className="text-muted">·</span>
              <span className="text-muted">
                Pack of {product.unitsPerPack || 6}
              </span>
            </>
          )}
          <span className="text-muted">·</span>
          <span style={{ color: stockColor }} className="font-semibold">
            {stockLabel}
          </span>
        </div>
      </div>

      {/* Financials: Wholesale, RRP, Profit (Trade) vs Retail Price (Retail) */}
      {mode === 'trade' ? (
        <div className="hidden md:flex flex-col items-end text-right flex-none min-w-[120px]">
          <span className="text-[15px] font-extrabold text-navy-deep leading-tight">
            {formatMoney(product.wholesalePackPricePence)}
            <span className="text-[12px] text-muted font-normal"> /pk</span>
          </span>
          <div className="flex items-center gap-1.5 mt-0.5 text-[11px]">
            <span className="text-muted">
              RRP {formatMoney(product.retailPricePence)}
            </span>
            <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-bold">
              +{profit.profitFormatted}
            </span>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-col items-end text-right flex-none min-w-[110px]">
          <span className="text-[16px] font-extrabold text-navy-deep leading-tight">
            {formatMoney(product.retailPricePence, { allowPenceOnly: true })}
          </span>
          <span className="text-[11px] text-muted font-medium mt-0.5">
            incl. VAT
          </span>
        </div>
      )}

      {/* Stepper / Action Button */}
      <div className="w-[105px] sm:w-[120px] flex-none">
        {mode === 'trade' ? (
          <QuantityStepper
            value={packs}
            onChange={handlePacksChange}
            min={0}
            minPacks={product.minPacks || 1}
            disabled={isOutOfStock}
            ariaLabel={`Packs of ${product.name}`}
            size="compact"
          />
        ) : isOutOfStock ? (
          <button
            type="button"
            disabled
            className="w-full h-10 rounded-[10px] bg-slate-100 text-muted font-bold text-[12px] border-0 cursor-not-allowed flex items-center justify-center"
          >
            Out of stock
          </button>
        ) : retailQty === 0 ? (
          <button
            type="button"
            onClick={handleRetailAdd}
            className="w-full h-10 rounded-[10px] bg-brand-red hover:bg-[#c9000b] text-white font-bold text-[12px] border-0 cursor-pointer flex items-center justify-center transition-colors shadow-xs"
          >
            Add to basket
          </button>
        ) : (
          <QuantityStepper
            value={retailQty}
            onChange={handleRetailQtyChange}
            min={0}
            minPacks={1}
            ariaLabel={`Quantity of ${product.name}`}
            size="compact"
          />
        )}
      </div>
    </article>
  );
}
