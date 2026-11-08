'use client';

import React from 'react';
import { useTradeCartTotals } from '@/lib/cart/store';
import { formatMoney } from '@/lib/money';
import { SITE_CONFIG } from '@/lib/config';

interface FreeDeliveryBarProps {
  variant?: 'yellow' | 'navy';
}

export function FreeDeliveryBar({ variant = 'yellow' }: FreeDeliveryBarProps) {
  const {
    qualifiesForFreeDelivery,
    remainingForFreeDeliveryPence,
    freeDeliveryProgressPercent,
    totalExVatPence,
  } = useTradeCartTotals();

  const thresholdFormatted = formatMoney(
    SITE_CONFIG.tradeFreeDeliveryThresholdPence
  );
  const totalFormatted = formatMoney(totalExVatPence);
  const remainingFormatted = formatMoney(remainingForFreeDeliveryPence);

  if (variant === 'navy') {
    return (
      <div className="flex-1 basis-full flex flex-col gap-2">
        <span className="text-[15px]">
          {qualifiesForFreeDelivery ? (
            <span className="text-[#FFEC00] font-bold">
              You qualify for FREE DELIVERY
            </span>
          ) : (
            <>
              Add another{' '}
              <strong className="text-[#FFEC00]">{remainingFormatted}</strong> to
              your order to qualify for <strong>FREE DELIVERY</strong>
            </>
          )}
        </span>
        <span
          role="progressbar"
          aria-label="Progress to free delivery"
          aria-valuemin={0}
          aria-valuemax={150}
          aria-valuenow={Math.round(totalExVatPence / 100)}
          className="block h-2.5 rounded-[5px] bg-[#3A3180] overflow-hidden"
        >
          <span
            style={{ width: `${freeDeliveryProgressPercent}%` }}
            className="block h-full bg-[#FFEC00] transition-all duration-300"
          />
        </span>
      </div>
    );
  }

  // Yellow banner style (e.g. on /trade/checkout)
  return (
    <div className="bg-brand-yellow rounded-[16px] sm:rounded-[18px] p-4 sm:p-6 flex flex-col gap-2.5">
      <p className="m-0 text-[16px] sm:text-[19px] text-ink leading-snug break-words">
        {qualifiesForFreeDelivery ? (
          <strong>You qualify for FREE DELIVERY</strong>
        ) : (
          <>
            Add another <strong>{remainingFormatted}</strong> to your order to
            qualify for <strong>FREE DELIVERY</strong>.
          </>
        )}
      </p>
      <span
        role="progressbar"
        aria-label="Progress to free delivery"
        aria-valuemin={0}
        aria-valuemax={150}
        aria-valuenow={Math.round(totalExVatPence / 100)}
        className="block h-3 rounded-[6px] bg-ink/15 overflow-hidden"
      >
        <span
          style={{ width: `${freeDeliveryProgressPercent}%` }}
          className="block h-full bg-navy-deep transition-all duration-300"
        />
      </span>
      <div className="flex flex-col min-[420px]:flex-row justify-between text-[12px] sm:text-[13px] text-text-2 gap-1">
        <span>{totalFormatted} in basket</span>
        <span>Free delivery at {thresholdFormatted}</span>
      </div>
    </div>
  );
}

