'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Stand } from '@/lib/data/types';
import { useCartStore } from '@/lib/cart/store';
import { formatMoney } from '@/lib/money';
import { CheckIcon } from '@/components/ui/Icons';
import { SITE_CONFIG } from '@/lib/config';

interface DisplayStandViewProps {
  stand: Stand;
  itemsList: { name: string; img: string; packs: number; units: number }[];
}

export function DisplayStandView({ stand, itemsList }: DisplayStandViewProps) {
  const [standQuantity, setStandQuantity] = useState(1);
  const addTradeStand = useCartStore((state) => state.addTradeStand);

  const pricePence = stand.fixedPricePence || 55200; // £552.00
  const totalWholesaleFormatted = formatMoney(pricePence);

  const totalLines = itemsList.length;
  const totalPacks = itemsList.reduce((acc, i) => acc + i.packs, 0);
  const totalUnits = itemsList.reduce((acc, i) => acc + i.units, 0);

  const handleAddStand = () => {
    addTradeStand(
      {
        standId: stand.id,
        name: stand.name,
        image: stand.image,
        fixedPricePence: pricePence,
        linesCount: totalLines,
        packsCount: totalPacks,
        unitsCount: totalUnits,
      },
      standQuantity
    );
  };

  return (
    <main className="max-w-[1320px] mx-auto px-8 py-8 pb-20 flex flex-col gap-10">
      {/* Breadcrumb */}
      <p className="m-0 text-[14px] text-muted">
        <Link href="/trade/shop" className="text-brand-navy hover:text-brand-red no-underline">
          Trade shop
        </Link>{' '}
        / Display stands / {stand.name}
      </p>

      {/* Main Grid: Stand Photo + Order Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(min(100%,480px),1fr)_1fr] gap-10 items-start">
        {/* Stand Photo: Rule 9 never crop */}
        <figure className="m-0 rounded-[24px] overflow-hidden leading-none bg-white shadow-sm border border-line">
          <Image
            src={stand.image}
            alt={`The complete ${stand.name}, fully stocked`}
            width={1217}
            height={1292}
            priority
            style={{
              width: '100%',
              height: 'auto',
              aspectRatio: '1217 / 1292',
            }}
            className="block object-contain"
          />
        </figure>

        {/* Details & Pricing */}
        <div className="flex flex-col gap-[22px]">
          <div>
            <p className="m-0 mb-2 text-[15px] font-bold text-brand-red">
              Fully stocked display stand
            </p>
            <h1 className="m-0 text-[38px] sm:text-[50px] leading-[1.04] font-extrabold font-stretch-112 text-navy-deep">
              {stand.name}
            </h1>
            <p className="mt-3.5 mb-0 text-[18px] leading-[1.6] text-text-2">
              {stand.description}
            </p>
          </div>

          <div className="bg-white border border-line rounded-[20px] p-6 flex flex-col gap-[18px] shadow-sm">
            <dl className="m-0 grid grid-cols-3 gap-3">
              <div className="bg-surface rounded-xl p-3.5">
                <dt className="text-[13px] text-muted">Product lines</dt>
                <dd className="m-0 mt-1 text-[24px] font-extrabold text-navy-deep">
                  {totalLines}
                </dd>
              </div>
              <div className="bg-surface rounded-xl p-3.5">
                <dt className="text-[13px] text-muted">Packs of 6</dt>
                <dd className="m-0 mt-1 text-[24px] font-extrabold text-navy-deep">
                  {totalPacks}
                </dd>
              </div>
              <div className="bg-surface rounded-xl p-3.5">
                <dt className="text-[13px] text-muted">Retail units</dt>
                <dd className="m-0 mt-1 text-[24px] font-extrabold text-navy-deep">
                  {totalUnits}
                </dd>
              </div>
            </dl>

            <div className="flex justify-between items-baseline flex-wrap gap-2 pt-1.5 border-t border-line">
              <span className="text-[16px] text-muted">
                Total wholesale price
              </span>
              <span>
                <strong className="text-[36px] sm:text-[40px] font-extrabold text-navy-deep">
                  {totalWholesaleFormatted}
                </strong>
                <span className="text-[15px] text-muted font-normal"> ex VAT</span>
              </span>
            </div>

            <p className="m-0 flex gap-2 items-center text-[15px] font-bold text-success">
              <CheckIcon size={18} />
              Qualifies for free delivery
            </p>

            <div className="flex gap-3 flex-wrap">
              <div className="grid grid-cols-[52px_60px_52px] h-[58px] border border-field-border rounded-full overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => setStandQuantity(Math.max(1, standQuantity - 1))}
                  aria-label="Remove one stand"
                  className="border-0 bg-transparent text-[22px] font-bold text-brand-navy hover:bg-surface cursor-pointer flex items-center justify-center"
                >
                  −
                </button>
                <label className="flex">
                  <span className="sr-only">Stands</span>
                  <input
                    type="number"
                    min="1"
                    value={standQuantity}
                    onChange={(e) =>
                      setStandQuantity(
                        Math.max(1, parseInt(e.target.value, 10) || 1)
                      )
                    }
                    className="w-full border-0 text-center font-sans font-bold text-[18px] text-ink outline-none"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setStandQuantity(standQuantity + 1)}
                  aria-label="Add one stand"
                  className="border-0 bg-transparent text-[22px] font-bold text-brand-navy hover:bg-surface cursor-pointer flex items-center justify-center"
                >
                  +
                </button>
              </div>

              <Link
                href="/trade/checkout"
                onClick={handleAddStand}
                className="flex-1 basis-[220px] flex items-center justify-center h-[58px] rounded-full bg-brand-red hover:bg-[#c9000b] text-white no-underline font-extrabold text-[18px] shadow-sm transition-colors"
              >
                Add stand to basket
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stand Contents Table */}
      <section className="bg-white border border-line rounded-[24px] p-7 flex flex-col gap-4 shadow-sm">
        <div className="flex justify-between items-end flex-wrap gap-3">
          <h2 className="m-0 text-[32px] font-extrabold font-stretch-110 text-navy-deep">
            What comes on this stand
          </h2>
          <span className="bg-[#FFF4C2] text-[#6B4E00] text-[13px] font-bold px-2.5 py-1 rounded-[6px]">
            Sample contents, final list set in admin
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[15px]">
            <thead>
              <tr className="border-b border-line text-left text-muted font-semibold">
                <th scope="col" className="p-3 pl-0 whitespace-nowrap">
                  Product
                </th>
                <th scope="col" className="p-3 whitespace-nowrap">
                  Packs of 6
                </th>
                <th scope="col" className="p-3 whitespace-nowrap">
                  Retail units
                </th>
                <th scope="col" className="p-3 whitespace-nowrap">
                  RRP each
                </th>
              </tr>
            </thead>
            <tbody>
              {itemsList.map((item, idx) => (
                <tr key={idx} className="border-b border-[#EEEFF4]">
                  <td className="p-3 pl-0">
                    <span className="flex items-center gap-3">
                      <Image
                        src={item.img}
                        alt=""
                        width={44}
                        height={44}
                        className="w-11 h-11 object-contain border border-[#EEEFF4] rounded-lg p-0.5 bg-white"
                      />
                      <strong className="text-ink font-semibold">
                        {item.name}
                      </strong>
                    </span>
                  </td>
                  <td className="p-3 font-bold text-navy-deep">{item.packs}</td>
                  <td className="p-3 text-text-2">{item.units}</td>
                  <td className="p-3 text-ink font-bold">99p</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

