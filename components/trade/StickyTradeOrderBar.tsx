'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useTradeCartTotals } from '@/lib/cart/store';
import { formatMoney } from '@/lib/money';

export function StickyTradeOrderBar() {
  const { totalPacks, totalExVatPence, totalProfitPence } = useTradeCartTotals();

  const thresholdPence = 15000; // £150.00
  const qualifies = totalExVatPence >= thresholdPence;
  const diffPence = Math.max(0, thresholdPence - totalExVatPence);
  const progressPct = Math.min(100, Math.round((totalExVatPence / thresholdPence) * 100));

  return (
    <AnimatePresence>
      {totalPacks > 0 && (
        <motion.aside
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          aria-label="Order summary bar"
          className="fixed bottom-0 left-0 right-0 z-40 px-3 sm:px-6 pointer-events-none"
        >
          <div className="max-w-[1320px] mx-auto pointer-events-auto bg-navy-deep text-white rounded-t-[18px] sm:rounded-t-[22px] shadow-[0_-8px_30px_rgba(20,15,69,0.35)] border-t border-x border-white/10 overflow-hidden">
            {/* Top edge: thin free-delivery progress bar */}
            <div className="w-full h-1 sm:h-1.5 bg-[#120D38] overflow-hidden">
              <motion.div
                initial={false}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className={`h-full ${
                  qualifies
                    ? 'bg-emerald-400'
                    : 'bg-gradient-to-r from-amber-400 to-[#FFEC00]'
                }`}
              />
            </div>

            {/* Desktop single row layout / Mobile 2-row layout */}
            <div className="px-4 sm:px-6 py-2.5 sm:py-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4">
              {/* Left numbers and free delivery message */}
              <div className="flex flex-wrap items-center justify-between sm:justify-start gap-3 sm:gap-6">
                {/* Packs count */}
                <div>
                  <span className="block text-[10px] sm:text-[11px] text-[#C9C6EA] font-semibold uppercase tracking-wider">
                    In order
                  </span>
                  <strong className="text-[17px] sm:text-[20px] font-black text-white">
                    {totalPacks} {totalPacks === 1 ? 'pack' : 'packs'}
                  </strong>
                </div>

                <div className="w-px h-7 bg-white/10 hidden sm:block" />

                {/* Total ex VAT */}
                <div>
                  <span className="block text-[10px] sm:text-[11px] text-[#C9C6EA] font-semibold uppercase tracking-wider">
                    Total (ex VAT)
                  </span>
                  <strong className="text-[17px] sm:text-[20px] font-black text-white">
                    {formatMoney(totalExVatPence)}
                  </strong>
                </div>

                <div className="w-px h-7 bg-white/10 hidden sm:block" />

                {/* Profit */}
                <div>
                  <span className="block text-[10px] sm:text-[11px] text-[#C9C6EA] font-semibold uppercase tracking-wider">
                    Your profit
                  </span>
                  <strong className="text-[17px] sm:text-[20px] font-black text-brand-yellow">
                    {formatMoney(totalProfitPence)}
                  </strong>
                </div>

                <div className="w-px h-7 bg-white/10 hidden lg:block" />

                {/* Free delivery badge */}
                <div className="w-full sm:w-auto mt-1 sm:mt-0 flex items-center">
                  {qualifies ? (
                    <span className="text-[12px] sm:text-[13px] font-extrabold text-emerald-400 flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
                      <span>✓</span> You qualify for FREE delivery
                    </span>
                  ) : (
                    <span className="text-[12px] sm:text-[13px] font-bold text-[#FFEC00] flex items-center gap-1.5 bg-[#FFEC00]/10 border border-[#FFEC00]/30 px-2.5 py-0.5 rounded-full">
                      <span>🚚</span> Add {formatMoney(diffPence)} for FREE delivery
                    </span>
                  )}
                </div>
              </div>

              {/* Red Review and check out button */}
              <Link
                href="/trade/checkout"
                className="w-full sm:w-auto inline-flex items-center justify-center h-11 sm:h-12 px-5 sm:px-6 rounded-xl bg-brand-red hover:bg-[#c9000b] active:scale-[0.98] text-white no-underline font-extrabold text-[14px] sm:text-[15px] shadow-md transition-all flex-none text-center"
              >
                Review and check out →
              </Link>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

