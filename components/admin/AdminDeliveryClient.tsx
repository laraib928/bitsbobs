'use client';

import React, { useState } from 'react';
import { useToast } from './ToastContext';
import { saveDeliverySettingsAction } from '@/lib/actions/admin';

interface DeliverySettingsProps {
  initialSettings: {
    freeDeliveryThresholdPence: number;
    tradeDeliveryChargePence: number;
    publicDeliveryChargePence: number;
    vatRateBp: number;
  };
}

export function AdminDeliveryClient({ initialSettings }: DeliverySettingsProps) {
  const { showToast } = useToast();

  const [thresholdPounds, setThresholdPounds] = useState(
    (initialSettings.freeDeliveryThresholdPence / 100).toFixed(2)
  );
  const [tradeChargePounds, setTradeChargePounds] = useState(
    (initialSettings.tradeDeliveryChargePence / 100).toFixed(2)
  );
  const [publicChargePounds, setPublicChargePounds] = useState(
    (initialSettings.publicDeliveryChargePence / 100).toFixed(2)
  );
  const [vatRatePercent, setVatRatePercent] = useState(
    (initialSettings.vatRateBp / 100).toFixed(1)
  );

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      freeDeliveryThresholdPence: Math.round(parseFloat(thresholdPounds) * 100),
      tradeDeliveryChargePence: Math.round(parseFloat(tradeChargePounds) * 100),
      publicDeliveryChargePence: Math.round(parseFloat(publicChargePounds) * 100),
      vatRateBp: Math.round(parseFloat(vatRatePercent) * 100),
    };

    const result = await saveDeliverySettingsAction(payload);
    setIsSaving(false);

    if (result.success) {
      showToast('success', 'Delivery thresholds and VAT rates updated successfully');
    } else {
      showToast('error', result.error || 'Failed to save delivery settings');
    }
  };

  return (
    <div className="p-5 sm:p-8 pb-16 flex flex-col gap-6 max-w-[900px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="m-0 text-[30px] sm:text-[34px] font-extrabold font-stretch-110 text-navy-deep">
          Delivery charges & VAT
        </h1>
        <p className="mt-1 mb-0 text-[14px] text-muted font-medium">
          Configure automated carriage thresholds and tax calculations applied at checkout
        </p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* Trade Delivery Card */}
        <section className="bg-white border border-line rounded-[20px] p-6 sm:p-8 shadow-xs flex flex-col gap-5">
          <div className="flex items-center gap-3 border-b border-line pb-4">
            <span className="w-10 h-10 rounded-xl bg-[#E8E6F7] text-[#312682] flex items-center justify-center font-bold text-lg">
              🚚
            </span>
            <div>
              <h2 className="m-0 text-[18px] font-extrabold text-navy-deep">
                Trade Delivery Rules
              </h2>
              <span className="text-[13px] text-muted">Applied to approved retailer orders</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
              Free delivery threshold (£ ex VAT)
              <span className="text-[12px] text-muted font-normal">
                Orders equal or exceeding this qualify for free courier carriage
              </span>
              <div className="relative mt-1">
                <span className="absolute left-3.5 top-3 text-muted font-bold">£</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={thresholdPounds}
                  onChange={(e) => setThresholdPounds(e.target.value)}
                  className="w-full h-11 pl-8 pr-3 rounded-xl border border-field-border font-sans font-bold text-ink outline-none focus:border-brand-navy"
                />
              </div>
            </label>

            <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
              Trade carriage fee (under threshold)
              <span className="text-[12px] text-muted font-normal">
                Standard charge if order total is below threshold
              </span>
              <div className="relative mt-1">
                <span className="absolute left-3.5 top-3 text-muted font-bold">£</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={tradeChargePounds}
                  onChange={(e) => setTradeChargePounds(e.target.value)}
                  className="w-full h-11 pl-8 pr-3 rounded-xl border border-field-border font-sans font-bold text-ink outline-none focus:border-brand-navy"
                />
              </div>
            </label>
          </div>
        </section>

        {/* Public Delivery Card */}
        <section className="bg-white border border-line rounded-[20px] p-6 sm:p-8 shadow-xs flex flex-col gap-5">
          <div className="flex items-center gap-3 border-b border-line pb-4">
            <span className="w-10 h-10 rounded-xl bg-[#FDE6E8] text-[#9E0010] flex items-center justify-center font-bold text-lg">
              📦
            </span>
            <div>
              <h2 className="m-0 text-[18px] font-extrabold text-navy-deep">
                Public / Guest Delivery Rules
              </h2>
              <span className="text-[13px] text-muted">Applied to retail shoppers checkout</span>
            </div>
          </div>

          <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-ink max-w-sm">
            Standard delivery charge (£ incl. VAT)
            <div className="relative mt-1">
              <span className="absolute left-3.5 top-3 text-muted font-bold">£</span>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={publicChargePounds}
                onChange={(e) => setPublicChargePounds(e.target.value)}
                className="w-full h-11 pl-8 pr-3 rounded-xl border border-field-border font-sans font-bold text-ink outline-none focus:border-brand-navy"
              />
            </div>
          </label>
        </section>

        {/* VAT Rate Card */}
        <section className="bg-white border border-line rounded-[20px] p-6 sm:p-8 shadow-xs flex flex-col gap-5">
          <div className="flex items-center gap-3 border-b border-line pb-4">
            <span className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold text-lg">
              %
            </span>
            <div>
              <h2 className="m-0 text-[18px] font-extrabold text-navy-deep">
                Value Added Tax (VAT)
              </h2>
              <span className="text-[13px] text-muted">Standard rate applied to UK orders</span>
            </div>
          </div>

          <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-ink max-w-sm">
            Standard UK VAT rate (%)
            <div className="relative mt-1">
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                required
                value={vatRatePercent}
                onChange={(e) => setVatRatePercent(e.target.value)}
                className="w-full h-11 pl-4 pr-8 rounded-xl border border-field-border font-sans font-bold text-ink outline-none focus:border-brand-navy"
              />
              <span className="absolute right-3.5 top-3 text-muted font-bold">%</span>
            </div>
          </label>
        </section>

        {/* Submit Bar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="h-12 px-8 rounded-xl bg-brand-red hover:bg-[#c9000b] text-white font-extrabold text-[15px] border-0 cursor-pointer shadow-sm transition-colors disabled:opacity-60"
          >
            {isSaving ? 'Saving changes...' : 'Save delivery settings'}
          </button>
        </div>
      </form>
    </div>
  );
}

