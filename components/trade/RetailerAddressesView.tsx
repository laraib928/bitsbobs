'use client';

import React, { useState } from 'react';
import { RetailerAccountProfile } from '@/lib/data/trade-account';
import { updateAccountAddressesAction } from '@/lib/actions/trade-account';

interface RetailerAddressesViewProps {
  profile: RetailerAccountProfile | null;
}

export function RetailerAddressesView({ profile }: RetailerAddressesViewProps) {
  const trading = profile?.tradingAddress || {};
  const delivery = profile?.deliveryAddress || {};

  const [tradingAddress, setTradingAddress] = useState(
    trading.line1 || trading.address || ''
  );
  const [tradingAddressLine2, setTradingAddressLine2] = useState(
    trading.line2 || ''
  );
  const [tradingTown, setTradingTown] = useState(trading.town || '');
  const [tradingPostcode, setTradingPostcode] = useState(
    trading.postcode || ''
  );

  const [sameDelivery, setSameDelivery] = useState(!profile?.deliveryAddress);

  const [deliveryAddress, setDeliveryAddress] = useState(
    delivery.line1 || delivery.address || ''
  );
  const [deliveryAddressLine2, setDeliveryAddressLine2] = useState(
    delivery.line2 || ''
  );
  const [deliveryTown, setDeliveryTown] = useState(delivery.town || '');
  const [deliveryPostcode, setDeliveryPostcode] = useState(
    delivery.postcode || ''
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      const res = await updateAccountAddressesAction({
        tradingAddress,
        tradingAddressLine2,
        tradingTown,
        tradingPostcode,
        sameDelivery,
        deliveryAddress: sameDelivery ? undefined : deliveryAddress,
        deliveryAddressLine2: sameDelivery ? undefined : deliveryAddressLine2,
        deliveryTown: sameDelivery ? undefined : deliveryTown,
        deliveryPostcode: sameDelivery ? undefined : deliveryPostcode,
      });

      setIsLoading(false);

      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="m-0 text-[30px] sm:text-[36px] font-extrabold font-stretch-112 text-navy-deep tracking-[-0.01em]">
          Addresses
        </h1>
        <p className="mt-1 mb-0 text-[15px] text-muted">
          Manage your trading address and delivery destination for wholesale deliveries.
        </p>
      </div>

      <div className="bg-white border border-line rounded-[20px] p-6 sm:p-8 shadow-sm">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-danger text-[14px] font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-success text-[14px] font-bold">
            ✓ Store addresses have been successfully updated.
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-xl">
          {/* Trading Address */}
          <div className="flex flex-col gap-4">
            <h2 className="m-0 text-[18px] font-bold text-navy-deep">
              Trading address
            </h2>

            <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
              Street address / line 1
              <input
                type="text"
                required
                value={tradingAddress}
                onChange={(e) => setTradingAddress(e.target.value)}
                placeholder="Shop name, building or street number"
                className="h-12 border border-field-border rounded-xl px-3.5 text-[15px] bg-white outline-none focus:border-brand-navy"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
              Address line 2 (optional)
              <input
                type="text"
                value={tradingAddressLine2}
                onChange={(e) => setTradingAddressLine2(e.target.value)}
                placeholder="Suite, unit, locality"
                className="h-12 border border-field-border rounded-xl px-3.5 text-[15px] bg-white outline-none focus:border-brand-navy"
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                Town / City
                <input
                  type="text"
                  value={tradingTown}
                  onChange={(e) => setTradingTown(e.target.value)}
                  placeholder="Manchester"
                  className="h-12 border border-field-border rounded-xl px-3.5 text-[15px] bg-white outline-none focus:border-brand-navy"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                Postcode
                <input
                  type="text"
                  required
                  value={tradingPostcode}
                  onChange={(e) => setTradingPostcode(e.target.value)}
                  placeholder="M8 8EP"
                  className="h-12 border border-field-border rounded-xl px-3.5 text-[15px] bg-white outline-none focus:border-brand-navy"
                />
              </label>
            </div>
          </div>

          {/* Delivery Address Option */}
          <div className="pt-4 border-t border-line flex flex-col gap-4">
            <h2 className="m-0 text-[18px] font-bold text-navy-deep">
              Delivery address
            </h2>

            <label className="flex gap-2.5 items-center text-[15px] font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={sameDelivery}
                onChange={(e) => setSameDelivery(e.target.checked)}
                className="w-5 h-5 accent-brand-navy rounded cursor-pointer"
              />
              <span>Delivery address is the same as trading address</span>
            </label>

            {!sameDelivery && (
              <div className="flex flex-col gap-4 mt-2 p-5 rounded-2xl bg-surface border border-line">
                <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                  Delivery street address / line 1
                  <input
                    type="text"
                    required={!sameDelivery}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Warehouse, back entrance, or street address"
                    className="h-12 border border-field-border rounded-xl px-3.5 text-[15px] bg-white outline-none focus:border-brand-navy"
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                  Delivery address line 2 (optional)
                  <input
                    type="text"
                    value={deliveryAddressLine2}
                    onChange={(e) => setDeliveryAddressLine2(e.target.value)}
                    placeholder="Unit or loading bay"
                    className="h-12 border border-field-border rounded-xl px-3.5 text-[15px] bg-white outline-none focus:border-brand-navy"
                  />
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                    Town / City
                    <input
                      type="text"
                      value={deliveryTown}
                      onChange={(e) => setDeliveryTown(e.target.value)}
                      placeholder="Town"
                      className="h-12 border border-field-border rounded-xl px-3.5 text-[15px] bg-white outline-none focus:border-brand-navy"
                    />
                  </label>

                  <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                    Delivery Postcode
                    <input
                      type="text"
                      required={!sameDelivery}
                      value={deliveryPostcode}
                      onChange={(e) => setDeliveryPostcode(e.target.value)}
                      placeholder="Postcode"
                      className="h-12 border border-field-border rounded-xl px-3.5 text-[15px] bg-white outline-none focus:border-brand-navy"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="h-12 px-8 rounded-full bg-brand-navy hover:bg-[#251c68] text-white font-bold text-[15px] border-0 cursor-pointer shadow-sm transition-colors disabled:opacity-60"
            >
              {isLoading ? 'Saving addresses...' : 'Save addresses'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

