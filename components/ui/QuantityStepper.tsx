'use client';

import React, { useRef, useCallback, useEffect } from 'react';

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  minPacks?: number;
  max?: number;
  size?: 'normal' | 'compact' | 'large';
  ariaLabel?: string;
  pill?: boolean;
  disabled?: boolean;
}

export function QuantityStepper({
  value,
  onChange,
  min = 0,
  minPacks = 1,
  max = 9999,
  size = 'normal',
  ariaLabel = 'Quantity',
  pill = false,
  disabled = false,
}: QuantityStepperProps) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const valueRef = useRef(value);
  valueRef.current = value;

  const stopRepeat = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopRepeat();
  }, [stopRepeat]);

  const stepDecrement = useCallback(() => {
    if (disabled) return;
    const current = valueRef.current;
    if (current <= min) return;
    if (current <= minPacks) {
      onChange(min);
    } else {
      onChange(Math.max(min, current - 1));
    }
  }, [disabled, min, minPacks, onChange]);

  const stepIncrement = useCallback(() => {
    if (disabled) return;
    const current = valueRef.current;
    if (current >= max) return;
    if (current === 0) {
      onChange(Math.max(1, minPacks));
    } else {
      onChange(Math.min(max, current + 1));
    }
  }, [disabled, max, minPacks, onChange]);

  const startDecrement = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (disabled || value <= min) return;
    stepDecrement();
    stopRepeat();
    timerRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        stepDecrement();
      }, 75);
    }, 350);
  };

  const startIncrement = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (disabled || value >= max) return;
    stepIncrement();
    stopRepeat();
    timerRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        stepIncrement();
      }, 75);
    }, 350);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const raw = e.target.value;
    if (raw === '') {
      onChange(0);
      return;
    }
    const val = parseInt(raw, 10);
    if (!isNaN(val)) {
      onChange(Math.max(min, Math.min(max, val)));
    }
  };

  // Dimensions matching design
  const heightClasses =
    size === 'large'
      ? 'h-[58px]'
      : size === 'compact'
      ? 'h-10'
      : 'h-11';

  const gridClasses =
    size === 'large'
      ? 'grid-cols-[52px_1fr_52px]'
      : size === 'compact'
      ? 'grid-cols-[36px_44px_36px]'
      : 'grid-cols-[44px_1fr_44px]';

  const radiusClasses = pill ? 'rounded-full' : 'rounded-[10px]';

  return (
    <div
      className={`grid ${gridClasses} ${heightClasses} border border-field-border ${radiusClasses} overflow-hidden bg-white items-center select-none ${
        disabled ? 'opacity-50 pointer-events-none bg-slate-50' : ''
      }`}
    >
      <button
        type="button"
        onMouseDown={startDecrement}
        onMouseUp={stopRepeat}
        onMouseLeave={stopRepeat}
        onTouchStart={startDecrement}
        onTouchEnd={stopRepeat}
        onTouchCancel={stopRepeat}
        disabled={disabled || value <= min}
        aria-label={`Decrease ${ariaLabel}`}
        className="w-full h-full border-0 bg-transparent text-[20px] font-bold text-brand-navy hover:bg-surface active:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center transition-colors"
      >
        −
      </button>
      <label className="flex h-full w-full">
        <span className="sr-only">{ariaLabel}</span>
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          disabled={disabled}
          onChange={handleInputChange}
          className="w-full h-full border-0 text-center font-sans font-bold text-[16px] text-ink outline-none bg-transparent p-0 disabled:text-muted"
        />
      </label>
      <button
        type="button"
        onMouseDown={startIncrement}
        onMouseUp={stopRepeat}
        onMouseLeave={stopRepeat}
        onTouchStart={startIncrement}
        onTouchEnd={stopRepeat}
        onTouchCancel={stopRepeat}
        disabled={disabled || value >= max}
        aria-label={`Increase ${ariaLabel}`}
        className="w-full h-full border-0 bg-transparent text-[20px] font-bold text-brand-navy hover:bg-surface active:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center transition-colors"
      >
        +
      </button>
    </div>
  );
}

