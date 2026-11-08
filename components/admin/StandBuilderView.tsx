'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Stand } from '@/lib/data/types';
import { formatMoney } from '@/lib/money';
import { FormField } from './FormField';
import { SearchIcon } from '@/components/ui/Icons';
import { SITE_CONFIG } from '@/lib/config';

interface StandBuilderRow {
  productId: string;
  name: string;
  img: string;
  packs: number;
  packPricePence: number;
}

interface StandBuilderViewProps {
  stand?: Stand;
  isNew?: boolean;
}

export function StandBuilderView({
  stand,
  isNew = false,
}: StandBuilderViewProps) {
  const router = useRouter();

  const [name, setName] = useState(isNew ? '' : stand?.name || '');
  const [description, setDescription] = useState(isNew ? '' : stand?.description || '');
  const [standHardwarePrice, setStandHardwarePrice] = useState(
    isNew
      ? '0.00'
      : stand?.standUnitPricePence
      ? (stand.standUnitPricePence / 100).toFixed(2)
      : '120.00'
  );
  const [pricingMode, setPricingMode] = useState<'calculated' | 'fixed'>(
    isNew ? 'calculated' : 'fixed'
  );
  const [fixedPrice, setFixedPrice] = useState(
    isNew
      ? '0.00'
      : stand?.fixedPricePence
      ? (stand.fixedPricePence / 100).toFixed(2)
      : '0.00'
  );
  const [searchProduct, setSearchProduct] = useState('');
  const [saved, setSaved] = useState(false);

  const [rows, setRows] = useState<StandBuilderRow[]>(
    isNew
      ? []
      : (stand?.items && stand.items.length > 0
          ? stand.items.map((it) => ({
              productId: it.productId,
              name: it.productId,
              img: '/images/stand.jpg',
              packs: it.packs,
              packPricePence: 332,
            }))
          : [])
  );

  const updateRowPacks = (index: number, packs: number) => {
    const updated = [...rows];
    updated[index].packs = Math.max(1, packs);
    setRows(updated);
  };

  const removeRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  // Calculations
  const linesCount = rows.length;
  const totalPacks = rows.reduce((acc, r) => acc + r.packs, 0);
  const totalUnits = totalPacks * 6;
  const productsWholesalePence = rows.reduce(
    (acc, r) => acc + r.packs * r.packPricePence,
    0
  );
  const hardwarePence = Math.round((parseFloat(standHardwarePrice) || 0) * 100);

  const calculatedTotalPence = productsWholesalePence + hardwarePence;
  const fixedTotalPence = Math.round((parseFloat(fixedPrice) || 552) * 100);

  const finalWholesalePriceFormatted =
    pricingMode === 'fixed'
      ? formatMoney(fixedTotalPence)
      : formatMoney(calculatedTotalPence);

  const handleSave = (publish: boolean) => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      router.push(publish ? '/trade/stands/80-hook-display-stand' : '/admin');
    }, 1000);
  };

  return (
    <main className="p-7 sm:p-8 pb-16 flex flex-col gap-5 max-w-[1320px]">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-3.5">
        <div>
          <p className="m-0 text-[14px] text-muted">
            <Link href="/admin" className="text-brand-navy hover:underline">
              Display stands
            </Link>{' '}
            / {isNew ? 'New stand package' : 'Edit stand package'}
          </p>
          <h1 className="mt-1 mb-0 text-[32px] font-extrabold font-stretch-108 text-navy-deep">
            {isNew ? 'Build a stand package' : name}
          </h1>
        </div>
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={() => handleSave(false)}
            className="h-11 px-4 rounded-[10px] border border-field-border bg-white text-ink font-semibold text-[14px] hover:bg-surface cursor-pointer transition-colors"
          >
            Save as draft
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            className="h-11 px-5 rounded-[10px] border-0 bg-brand-red hover:bg-[#c9000b] text-white font-extrabold text-[15px] cursor-pointer shadow-sm transition-colors"
          >
            Publish to trade shop
          </button>
        </div>
      </div>

      {saved && (
        <div className="bg-success text-white p-4 rounded-xl font-bold">
          ✓ Stand package saved!
        </div>
      )}

      {/* 2-Column Content */}
      <div className="flex flex-wrap gap-5 items-start">
        {/* Left Column */}
        <div className="flex-1 basis-[520px] min-w-0 flex flex-col gap-5">
          {/* Stand details */}
          <section className="bg-white border border-line rounded-[16px] p-[22px] flex flex-col gap-3.5 shadow-sm">
            <h2 className="m-0 text-[18px] font-extrabold text-ink">
              Stand details
            </h2>
            <div className="grid grid-cols-[140px_minmax(0,1fr)] gap-4 items-start">
              <div className="w-[140px] rounded-xl overflow-hidden border border-line bg-surface">
                <Image
                  src={stand?.image || '/images/stand.jpg'}
                  alt="Stand photo"
                  width={140}
                  height={148}
                  style={{ aspectRatio: '1217 / 1292' }}
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="flex flex-col gap-3.5">
                <FormField
                  label="Stand name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <FormField
                  label="Description"
                  type="textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <button
                  type="button"
                  className="self-start h-10 px-3.5 rounded-[10px] border border-field-border bg-white text-ink font-semibold text-[13px] hover:bg-surface cursor-pointer"
                >
                  Change photo
                </button>
              </div>
            </div>
          </section>

          {/* Products on this stand */}
          <section className="bg-white border border-line rounded-[16px] p-[22px] flex flex-col gap-3.5 shadow-sm">
            <div className="flex justify-between items-center flex-wrap gap-2.5">
              <h2 className="m-0 text-[18px] font-extrabold text-ink">
                Products on this stand
              </h2>
              <div className="flex items-center gap-2 border border-field-border rounded-[10px] px-3 h-11 min-w-[260px] bg-white">
                <SearchIcon size={18} className="text-muted" />
                <label htmlFor="add-product-search" className="sr-only">
                  Add a product
                </label>
                <input
                  id="add-product-search"
                  type="search"
                  placeholder="Add a product to the stand"
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                  className="flex-1 border-0 font-sans text-[15px] outline-none min-w-0"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[15px]">
                <thead>
                  <tr className="border-b border-line text-left text-muted font-semibold">
                    <th scope="col" className="p-2.5 pl-0 whitespace-nowrap">
                      Product
                    </th>
                    <th scope="col" className="p-2.5 whitespace-nowrap">
                      Packs of 6
                    </th>
                    <th scope="col" className="p-2.5 whitespace-nowrap">
                      Units
                    </th>
                    <th scope="col" className="p-2.5 whitespace-nowrap">
                      Wholesale value
                    </th>
                    <th scope="col" className="p-2.5 whitespace-nowrap text-right">
                      <span className="sr-only">Remove</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr key={row.productId} className="border-b border-[#EEEFF4]">
                      <td className="p-2.5 pl-0">
                        <span className="flex items-center gap-3">
                          <Image
                            src={row.img}
                            alt=""
                            width={40}
                            height={40}
                            className="w-10 h-10 object-contain border border-[#EEEFF4] rounded-lg p-0.5 bg-white"
                          />
                          <strong className="text-ink font-semibold">
                            {row.name}
                          </strong>
                        </span>
                      </td>
                      <td className="p-2.5">
                        <label className="flex">
                          <span className="sr-only">Packs</span>
                          <input
                            type="number"
                            min="1"
                            value={row.packs}
                            onChange={(e) =>
                              updateRowPacks(
                                idx,
                                parseInt(e.target.value, 10) || 1
                              )
                            }
                            className="w-[70px] h-[38px] border border-field-border rounded-lg text-center font-sans font-bold text-ink outline-none"
                          />
                        </label>
                      </td>
                      <td className="p-2.5 text-text-2">{row.packs * 6}</td>
                      <td className="p-2.5 font-bold text-navy-deep">
                        {formatMoney(row.packs * row.packPricePence)}
                      </td>
                      <td className="p-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => removeRow(idx)}
                          aria-label="Remove product"
                          className="w-9 h-9 rounded-lg border border-line bg-white text-danger font-bold text-[18px] hover:bg-red-50 cursor-pointer"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right Column: Stand Price */}
        <aside className="w-full lg:w-[380px] flex-none bg-white border border-line rounded-[16px] p-[22px] flex flex-col gap-3.5 shadow-sm">
          <h2 className="m-0 text-[18px] font-extrabold text-ink">
            Stand price
          </h2>

          <dl className="m-0 grid grid-cols-[1fr_auto] gap-3 text-[15px]">
            <dt className="text-muted">Product lines</dt>
            <dd className="m-0 text-right font-bold text-ink">{linesCount}</dd>

            <dt className="text-muted">Packs</dt>
            <dd className="m-0 text-right font-bold text-ink">{totalPacks}</dd>

            <dt className="text-muted">Retail units</dt>
            <dd className="m-0 text-right font-bold text-ink">{totalUnits}</dd>

            <dt className="text-muted">Products at wholesale</dt>
            <dd className="m-0 text-right font-bold text-ink">
              {formatMoney(productsWholesalePence)}
            </dd>
          </dl>

          <FormField
            label="Stand unit price, ex VAT"
            value={standHardwarePrice}
            onChange={(e) => setStandHardwarePrice(e.target.value)}
            placeholder="[Stand hardware price]"
          />

          <fieldset className="border-0 m-0 p-0 flex flex-col gap-2 text-[15px] pt-1">
            <legend className="text-[14px] font-semibold text-ink mb-2">
              Total wholesale price
            </legend>
            <label className="flex gap-2.5 items-center cursor-pointer">
              <input
                type="radio"
                name="pricing"
                checked={pricingMode === 'calculated'}
                onChange={() => setPricingMode('calculated')}
                className="w-5 h-5 accent-brand-navy"
              />
              Work it out from the products and stand
            </label>
            <label className="flex gap-2.5 items-center cursor-pointer">
              <input
                type="radio"
                name="pricing"
                checked={pricingMode === 'fixed'}
                onChange={() => setPricingMode('fixed')}
                className="w-5 h-5 accent-brand-navy"
              />
              Set a fixed package price
            </label>
          </fieldset>

          {pricingMode === 'fixed' && (
            <FormField
              label="Fixed package price, ex VAT"
              value={fixedPrice}
              onChange={(e) => setFixedPrice(e.target.value)}
            />
          )}

          <div className="bg-navy-deep text-white rounded-xl p-4 flex justify-between items-baseline mt-1">
            <span className="text-[14px] text-soft-on-dark">
              Shown to retailers
            </span>
            <strong className="text-[22px] font-extrabold text-white">
              {finalWholesalePriceFormatted} ex VAT
            </strong>
          </div>
        </aside>
      </div>
    </main>
  );
}

