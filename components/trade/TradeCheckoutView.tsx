'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import type { Appearance } from '@stripe/stripe-js';
import { useCartStore, useTradeCartTotals } from '@/lib/cart/store';
import { formatMoney } from '@/lib/money';
import { FreeDeliveryBar } from './FreeDeliveryBar';
import { LockIcon } from '@/components/ui/Icons';
import { getTradeDeliveryFee } from '@/lib/delivery';
import { getStripePromise } from '@/lib/stripe-client';

const ukPostcodeRegex = /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i;

const stripeAppearance: Appearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#312682',
    colorDanger: '#E30512',
    colorText: '#100D22',
    fontFamily:
      'var(--font-archivo), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    borderRadius: '10px',
    spacingUnit: '4px',
  },
  rules: {
    '.Input': {
      border: '1px solid #D1D5DB',
      boxShadow: 'none',
      padding: '12px 14px',
      fontSize: '16px',
    },
    '.Input:focus': {
      border: '1px solid #312682',
      boxShadow: '0 0 0 1px #312682',
    },
    '.Label': {
      fontWeight: '600',
      fontSize: '14px',
      color: '#100D22',
      marginBottom: '6px',
    },
  },
};

interface TradeProfileProps {
  id?: string;
  business_name?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  trading_address?: any;
  delivery_address?: any;
}

interface TradeCheckoutViewProps {
  profile?: TradeProfileProps | null;
}

function TradeCheckoutForm({ profile }: TradeCheckoutViewProps) {
  const stripe = useStripe();
  const elements = useElements();

  const {
    tradeItems,
    tradeStands,
    totalPacks,
    totalUnits,
    totalExVatPence,
    vatPence,
    qualifiesForFreeDelivery,
  } = useTradeCartTotals();

  const updateTradePacks = useCartStore((state) => state.updateTradePacks);
  const updateTradeStandQuantity = useCartStore(
    (state) => state.updateTradeStandQuantity
  );

  const deliveryFeePence = getTradeDeliveryFee(totalExVatPence);
  const grandTotalWithDeliveryPence = totalExVatPence + vatPence + deliveryFeePence;

  // Pre-fill editable customer & delivery info from profile
  const defaultAddr = profile?.delivery_address || profile?.trading_address || {};
  const [storeName, setStoreName] = useState(
    profile?.business_name || defaultAddr.store_name || ''
  );
  const [fullName, setFullName] = useState(
    profile?.contact_name || ''
  );
  const [addressLine1, setAddressLine1] = useState(
    defaultAddr.line1 || defaultAddr.address || ''
  );
  const [addressLine2, setAddressLine2] = useState(defaultAddr.line2 || '');
  const [addressLine3, setAddressLine3] = useState(defaultAddr.line3 || '');
  const [city, setCity] = useState(defaultAddr.town || defaultAddr.city || '');
  const [postcode, setPostcode] = useState(defaultAddr.postcode || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [billingSame, setBillingSame] = useState(true);

  // Postcode lookup state
  const [isSearchingPostcode, setIsSearchingPostcode] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [addressResults, setAddressResults] = useState<
    Array<{
      id: string;
      line1: string;
      line2: string;
      line3?: string;
      town: string;
      postcode: string;
      formatted: string;
    }>
  >([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'account'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const subtotalFormatted = formatMoney(totalExVatPence);
  const vatFormatted = formatMoney(vatPence);
  const deliveryFormatted =
    qualifiesForFreeDelivery || deliveryFeePence === 0
      ? 'FREE'
      : formatMoney(deliveryFeePence);
  const grandTotalFormatted = formatMoney(grandTotalWithDeliveryPence);

  const handlePostcodeLookup = async () => {
    const pc = postcode.trim();
    if (!pc) {
      setLookupError('Please enter a postcode');
      return;
    }
    setLookupError(null);
    setIsSearchingPostcode(true);
    try {
      const res = await fetch(`/api/address-lookup?postcode=${encodeURIComponent(pc)}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        setLookupError(data.error || 'No addresses found for this postcode.');
        setAddressResults([]);
      } else {
        const addresses = data.addresses || [];
        setAddressResults(addresses);
        if (addresses.length === 0) {
          setLookupError('No addresses found for this postcode. Please enter manually.');
        } else if (data.postcode) {
          setPostcode(data.postcode);
        }
      }
    } catch {
      setLookupError('Unable to look up postcode. Please enter your address manually.');
    } finally {
      setIsSearchingPostcode(false);
    }
  };

  const handleSelectAddress = (id: string) => {
    setSelectedAddressId(id);
    const found = addressResults.find((a) => a.id === id);
    if (found) {
      setAddressLine1(found.line1 || '');
      setAddressLine2(found.line2 || '');
      setAddressLine3(found.line3 || '');
      setCity(found.town || '');
      if (found.postcode) {
        setPostcode(found.postcode);
      }
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (tradeItems.length === 0 && tradeStands.length === 0) {
      setErrorMessage('Your trade basket is empty.');
      return;
    }

    if (storeName.trim().length < 2) {
      setErrorMessage('Please enter your store name.');
      return;
    }
    if (fullName.trim().length < 2) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (addressLine1.trim().length < 3) {
      setErrorMessage('Please enter Address line 1.');
      return;
    }
    if (city.trim().length < 2) {
      setErrorMessage('Please enter your town or city.');
      return;
    }
    if (!ukPostcodeRegex.test(postcode.trim())) {
      setErrorMessage('Please enter a valid UK postcode (e.g. SW1A 1AA or M1 1AE).');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (paymentMethod === 'account') {
      setErrorMessage(
        'Pay on account is not currently enabled for your account. Please select card payment.'
      );
      return;
    }

    if (!stripe || !elements) {
      setErrorMessage('Payment service is initialising. Please wait a moment.');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    try {
      // 1. Submit elements validation
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setErrorMessage(submitError.message || 'Please check your payment details.');
        setIsProcessing(false);
        return;
      }

      // 2. Prepare items for server
      const itemsPayload = [
        ...tradeItems.map((item) => ({
          productId: item.productId,
          quantity: item.packs,
        })),
        ...tradeStands.map((stand) => ({
          standId: stand.standId,
          quantity: stand.quantity,
        })),
      ];

      // 3. Request PaymentIntent creation on server
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName: storeName.trim(),
          fullName: fullName.trim(),
          addressLine1: addressLine1.trim(),
          addressLine2: addressLine2.trim(),
          addressLine3: addressLine3.trim(),
          address: addressLine1.trim(),
          city: city.trim(),
          postcode: postcode.trim().toUpperCase(),
          email: email.trim(),
          phone: phone.trim(),
          billingSame,
          items: itemsPayload,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create payment intent.');
      }

      // 4. Confirm Payment with Stripe
      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        clientSecret: data.clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/order/success`,
          receipt_email: email.trim(),
        },
      });

      if (confirmError) {
        setErrorMessage(
          confirmError.message ||
            'Payment could not be completed. Please check your card details and try again.'
        );
        setIsProcessing(false);
      }
    } catch (err: any) {
      console.error('Trade payment error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred during checkout.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-surface w-full min-h-[calc(100vh-140px)]">
      <main className="max-w-[1320px] mx-auto px-4 sm:px-8 py-6 sm:py-9 pb-28 sm:pb-20 flex flex-col gap-4 sm:gap-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <h1 className="m-0 text-[30px] min-[400px]:text-[32px] sm:text-[38px] lg:text-[44px] font-extrabold font-stretch-112 text-navy-deep leading-tight">
              Your trade order
            </h1>
            <Link
              href="/trade/shop"
              className="inline-flex items-center text-[13px] sm:text-[14px] font-bold text-brand-navy hover:text-brand-red no-underline transition-colors"
            >
              ← Continue shopping
            </Link>
          </div>
          <span className="flex items-center gap-1.5 sm:gap-2 text-[14px] sm:text-[15px] text-text-2 font-semibold">
            <LockIcon size={18} className="text-success flex-none" />
            Secure trade checkout
          </span>
        </div>

        {/* Free delivery bar banner */}
        <FreeDeliveryBar variant="yellow" />

        <form
          onSubmit={handlePlaceOrder}
          className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4 sm:gap-6 items-start"
        >
          {/* 1. Basket Section (order-1 on mobile, col 1 row 1 on desktop) */}
          <section className="order-1 lg:col-start-1 lg:row-start-1 bg-white border border-line rounded-[16px] sm:rounded-[20px] p-4 sm:p-6 flex flex-col gap-1 shadow-sm">
            <div className="flex items-center justify-between pb-3.5 mb-2 border-b border-[#EEEFF4]">
              <h2 className="m-0 text-[20px] sm:text-[22px] font-extrabold text-ink">
                1. Basket items
              </h2>
              <Link
                href="/trade/shop"
                className="inline-flex items-center gap-1.5 text-[14px] font-bold text-brand-navy hover:text-brand-red no-underline transition-colors"
              >
                ← Continue shopping
              </Link>
            </div>

            {tradeItems.length === 0 && tradeStands.length === 0 ? (
                <div className="py-10 text-center text-muted flex flex-col items-center gap-3">
                  <p className="text-lg m-0 text-ink font-bold">Your trade basket is empty.</p>
                  <p className="text-[15px] m-0 text-muted">Looks like you haven&apos;t added any products or display stands yet.</p>
                  <Link
                    href="/trade/shop"
                    className="mt-2 inline-flex items-center h-12 px-6 rounded-xl bg-brand-navy hover:bg-[#231b64] text-white font-bold text-[15px] no-underline transition-colors shadow-sm"
                  >
                    Continue shopping
                  </Link>
                </div>
              ) : (
                <>
                  {/* Stand items in basket */}
                  {tradeStands.map((stand) => (
                    <div
                      key={stand.standId}
                      className="flex flex-col sm:grid sm:grid-cols-[60px_minmax(0,1fr)_auto_auto] gap-3 sm:gap-4 py-3 border-t border-[#EEEFF4]"
                    >
                      {/* Line 1 on mobile: Image + Name */}
                      <div className="flex items-center gap-3 min-w-0 sm:contents">
                        <Link href="/trade/stands" className="flex-none block group">
                          <Image
                            src={stand.image}
                            alt=""
                            width={60}
                            height={60}
                            className="w-[50px] h-[50px] sm:w-[60px] sm:h-[60px] flex-none object-cover border border-[#EEEFF4] rounded-[10px] group-hover:border-brand-navy transition-colors"
                          />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <Link
                            href="/trade/stands"
                            className="block text-[15px] sm:text-[16px] text-ink font-bold truncate sm:whitespace-normal no-underline hover:text-brand-navy hover:underline transition-colors"
                          >
                            {stand.name}
                          </Link>
                          <span className="text-[12px] sm:text-[13px] text-muted">
                            {stand.linesCount} lines, {stand.packsCount} packs
                          </span>
                        </div>
                      </div>

                      {/* Line 2 on mobile: Stepper + Line total */}
                      <div className="flex items-center justify-between sm:contents pt-1 sm:pt-0">
                        <div className="grid grid-cols-[36px_44px_36px] h-10 border border-field-border rounded-full overflow-hidden bg-white">
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() =>
                              updateTradeStandQuantity(
                                stand.standId,
                                stand.quantity - 1
                              )
                            }
                            aria-label="Remove one stand"
                            className="border-0 bg-transparent text-brand-navy font-bold text-[18px] cursor-pointer hover:bg-surface flex items-center justify-center disabled:opacity-50"
                          >
                            −
                          </button>
                          <label className="flex">
                            <span className="sr-only">Stands</span>
                            <input
                              type="number"
                              min="0"
                              disabled={isProcessing}
                              value={stand.quantity}
                              onChange={(e) =>
                                updateTradeStandQuantity(
                                  stand.standId,
                                  parseInt(e.target.value, 10) || 0
                                )
                              }
                              className="w-full border-0 text-center font-sans font-bold text-[15px] text-ink outline-none disabled:bg-gray-50"
                            />
                          </label>
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() =>
                              updateTradeStandQuantity(
                                stand.standId,
                                stand.quantity + 1
                              )
                            }
                            aria-label="Add one stand"
                            className="border-0 bg-transparent text-brand-navy font-bold text-[18px] cursor-pointer hover:bg-surface flex items-center justify-center disabled:opacity-50"
                          >
                            +
                          </button>
                        </div>
                        <strong className="sm:min-w-[70px] text-right text-navy-deep font-extrabold text-[16px]">
                          {formatMoney(stand.fixedPricePence * stand.quantity)}
                        </strong>
                      </div>
                    </div>
                  ))}

                  {/* Product Pack items in basket */}
                  {tradeItems.map((item) => {
                    const productHref = item.slug ? `/products/${item.slug}` : `/products/${item.productId}`;
                    return (
                      <div
                        key={item.productId}
                        className="flex flex-col sm:grid sm:grid-cols-[60px_minmax(0,1fr)_auto_auto] gap-3 sm:gap-4 py-3 border-t border-[#EEEFF4]"
                      >
                        {/* Line 1 on mobile: Image + Name */}
                        <div className="flex items-center gap-3 min-w-0 sm:contents">
                          <Link href={productHref} className="flex-none block group">
                            <Image
                              src={item.image}
                              alt=""
                              width={60}
                              height={60}
                              className="w-[50px] h-[50px] sm:w-[60px] sm:h-[60px] flex-none object-contain border border-[#EEEFF4] rounded-[10px] bg-white p-1 group-hover:border-brand-navy transition-colors"
                            />
                          </Link>
                          <div className="min-w-0 flex-1">
                            <Link
                              href={productHref}
                              className="block text-[15px] sm:text-[16px] text-ink font-bold truncate sm:whitespace-normal no-underline hover:text-brand-navy hover:underline transition-colors"
                            >
                              {item.name}
                            </Link>
                            <span className="text-[12px] sm:text-[13px] text-muted">
                              {formatMoney(item.packPricePence)} per pack of{' '}
                              {item.unitsPerPack}
                            </span>
                          </div>
                        </div>

                        {/* Line 2 on mobile: Stepper + Line total */}
                        <div className="flex items-center justify-between sm:contents pt-1 sm:pt-0">
                          <div className="grid grid-cols-[36px_44px_36px] h-10 border border-field-border rounded-full overflow-hidden bg-white">
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() =>
                                updateTradePacks(item.productId, item.packs - 1)
                              }
                              aria-label="Remove one pack"
                              className="border-0 bg-transparent text-brand-navy font-bold text-[18px] cursor-pointer hover:bg-surface flex items-center justify-center disabled:opacity-50"
                            >
                              −
                            </button>
                            <label className="flex">
                              <span className="sr-only">Packs</span>
                              <input
                                type="number"
                                min="0"
                                disabled={isProcessing}
                                value={item.packs}
                                onChange={(e) =>
                                  updateTradePacks(
                                    item.productId,
                                    parseInt(e.target.value, 10) || 0
                                  )
                                }
                                className="w-full border-0 text-center font-sans font-bold text-[15px] text-ink outline-none disabled:bg-gray-50"
                              />
                            </label>
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() =>
                                updateTradePacks(item.productId, item.packs + 1)
                              }
                              aria-label="Add one pack"
                              className="border-0 bg-transparent text-brand-navy font-bold text-[18px] cursor-pointer hover:bg-surface flex items-center justify-center disabled:opacity-50"
                            >
                              +
                            </button>
                          </div>
                          <strong className="sm:min-w-[70px] text-right text-navy-deep font-extrabold text-[16px]">
                            {formatMoney(item.packPricePence * item.packs)}
                          </strong>
                        </div>
                      </div>
                    );
                  })}

                  <div className="pt-4 border-t border-[#EEEFF4] flex items-center justify-between">
                    <Link
                      href="/trade/shop"
                      className="inline-flex items-center gap-2 text-[14px] font-bold text-brand-navy hover:text-brand-red no-underline transition-colors"
                    >
                      ← Continue shopping
                    </Link>
                  </div>
                </>
              )}
            </section>

          {/* 3. Delivery Details Section (order-3 on mobile, row 2 col 1 on desktop) */}
          <section className="order-3 lg:col-start-1 lg:row-start-2 bg-white border border-line rounded-[16px] sm:rounded-[20px] p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5 shadow-sm">
            <h2 className="col-span-full m-0 text-[20px] sm:text-[22px] font-extrabold text-ink">
              2. Delivery details
            </h2>

            {/* 1. Store name (trade: required, pre-filled from trade account) */}
            <label className="col-span-full flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
              Store name
              <input
                type="text"
                name="organization"
                autoComplete="organization"
                required
                disabled={isProcessing}
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Station Road Convenience"
                className="w-full h-12 min-h-[44px] border border-field-border rounded-[10px] px-3.5 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy disabled:bg-gray-50"
              />
            </label>

            {/* 2. Full name */}
            <label className="col-span-full flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
              Full name
              <input
                type="text"
                name="name"
                autoComplete="name"
                required
                disabled={isProcessing}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="First and last name"
                className="w-full h-12 min-h-[44px] border border-field-border rounded-[10px] px-3.5 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy disabled:bg-gray-50"
              />
            </label>

            {/* 3. Address line 1 */}
            <label className="col-span-full flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
              Address line 1
              <input
                type="text"
                name="address-line1"
                autoComplete="address-line1"
                required
                disabled={isProcessing}
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                placeholder="Shop number and street"
                className="w-full h-12 min-h-[44px] border border-field-border rounded-[10px] px-3.5 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy disabled:bg-gray-50"
              />
            </label>

            {/* 4. Address line 2 (optional) */}
            <label className="col-span-full flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
              Address line 2 (optional)
              <input
                type="text"
                name="address-line2"
                autoComplete="address-line2"
                disabled={isProcessing}
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                placeholder="Unit, suite, floor, etc."
                className="w-full h-12 min-h-[44px] border border-field-border rounded-[10px] px-3.5 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy disabled:bg-gray-50"
              />
            </label>

            {/* 5. Address line 3 (optional) */}
            <label className="col-span-full flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
              Address line 3 (optional)
              <input
                type="text"
                name="address-line3"
                autoComplete="address-line3"
                disabled={isProcessing}
                value={addressLine3}
                onChange={(e) => setAddressLine3(e.target.value)}
                placeholder="Area, district or estate"
                className="w-full h-12 min-h-[44px] border border-field-border rounded-[10px] px-3.5 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy disabled:bg-gray-50"
              />
            </label>

            {/* 6. Town or city */}
            <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
              Town or city
              <input
                type="text"
                name="address-level2"
                autoComplete="address-level2"
                required
                disabled={isProcessing}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Manchester"
                className="w-full h-12 min-h-[44px] border border-field-border rounded-[10px] px-3.5 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy disabled:bg-gray-50"
              />
            </label>

            {/* 7. Postcode with Find address lookup */}
            <div className="flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
              <label htmlFor="trade-postcode">Postcode</label>
              <div className="flex gap-2">
                <input
                  id="trade-postcode"
                  type="text"
                  name="postal-code"
                  autoComplete="postal-code"
                  required
                  disabled={isProcessing}
                  value={postcode}
                  onChange={(e) => {
                    setPostcode(e.target.value.toUpperCase());
                    setLookupError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handlePostcodeLookup();
                    }
                  }}
                  placeholder="e.g. M1 1AE"
                  className="flex-1 h-12 min-h-[44px] border border-field-border rounded-[10px] px-3.5 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy uppercase placeholder:normal-case disabled:bg-gray-50"
                />
                <button
                  type="button"
                  onClick={handlePostcodeLookup}
                  disabled={isProcessing || isSearchingPostcode || !postcode.trim()}
                  className="h-12 px-4 rounded-[10px] bg-brand-navy hover:bg-[#231b64] text-white font-sans font-bold text-[14px] cursor-pointer shadow-sm transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {isSearchingPostcode ? 'Finding...' : 'Find address'}
                </button>
              </div>
            </div>

            {lookupError && (
              <div className="col-span-full p-2.5 rounded-lg bg-red-50 border border-red-200 text-danger text-[13px] font-medium">
                {lookupError}
              </div>
            )}

            {addressResults.length > 0 && (
              <div className="col-span-full flex flex-col gap-1.5">
                <label htmlFor="trade-address-select" className="text-[13px] font-semibold text-text-2">
                  Select your address ({addressResults.length} found)
                </label>
                <select
                  id="trade-address-select"
                  value={selectedAddressId}
                  onChange={(e) => handleSelectAddress(e.target.value)}
                  className="h-12 border border-field-border rounded-[10px] px-3.5 font-sans font-normal text-[15px] text-ink bg-white outline-none focus:border-brand-navy"
                >
                  <option value="">-- Choose your address to fill fields --</option>
                  {addressResults.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.formatted}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 8. Email */}
            <label className="col-span-full flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
              Email
              <input
                type="email"
                name="email"
                autoComplete="email"
                required
                disabled={isProcessing}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="orders@retailer.co.uk"
                className="w-full h-12 min-h-[44px] border border-field-border rounded-[10px] px-3.5 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy disabled:bg-gray-50"
              />
            </label>

            {/* 9. Phone */}
            <label className="col-span-full flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
              Phone
              <input
                type="tel"
                name="tel"
                autoComplete="tel"
                disabled={isProcessing}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 0161 123 4567"
                className="w-full h-12 min-h-[44px] border border-field-border rounded-[10px] px-3.5 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy disabled:bg-gray-50"
              />
            </label>

            {/* Billing address same checkbox */}
            <label className="col-span-full flex gap-2.5 items-center text-[14px] sm:text-[15px] cursor-pointer pt-1">
              <input
                type="checkbox"
                disabled={isProcessing}
                checked={billingSame}
                onChange={(e) => setBillingSame(e.target.checked)}
                className="w-5 h-5 accent-brand-navy rounded"
              />
              Billing address is the same as delivery
            </label>
          </section>

          {/* 4. Payment Section (order-4 on mobile, row 3 col 1 on desktop) */}
          <section className="order-4 lg:col-start-1 lg:row-start-3 bg-white border border-line rounded-[16px] sm:rounded-[20px] p-4 sm:p-6 flex flex-col gap-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="m-0 text-[20px] sm:text-[22px] font-extrabold text-ink">
                3. Payment
              </h2>
              <span className="text-[12px] sm:text-[13px] text-muted flex items-center gap-1.5 font-medium">
                <LockIcon size={14} className="text-success" />
                Encrypted &amp; secure
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <label
                className={`flex gap-3 items-center rounded-[14px] p-3.5 sm:p-4 text-[15px] sm:text-[16px] font-bold cursor-pointer transition-all ${
                  paymentMethod === 'card'
                    ? 'border-2 border-brand-navy bg-white shadow-xs'
                    : 'border border-line bg-surface/50'
                }`}
              >
                <input
                  type="radio"
                  name="trade-pay"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="w-5 h-5 accent-brand-navy flex-none"
                />
                <span>Credit or debit card</span>
              </label>

              {paymentMethod === 'card' && (
                <div className="w-full min-h-[160px] pt-2">
                  <PaymentElement options={{ layout: 'tabs' }} />
                </div>
              )}

              <label
                className={`flex gap-3 items-center rounded-[14px] p-3.5 sm:p-4 text-[15px] sm:text-[16px] cursor-pointer transition-all opacity-60 ${
                  paymentMethod === 'account'
                    ? 'border-2 border-brand-navy bg-white font-bold'
                    : 'border border-line text-muted'
                }`}
              >
                <input
                  type="radio"
                  name="trade-pay"
                  disabled
                  checked={paymentMethod === 'account'}
                  onChange={() => setPaymentMethod('account')}
                  className="w-5 h-5 accent-brand-navy flex-none"
                />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between flex-1 gap-0.5 sm:gap-2">
                  <span>Pay on account</span>
                  <span className="text-[12px] sm:text-[13px] text-muted font-normal">
                    [Coming soon for credit-approved retailers]
                  </span>
                </div>
              </label>
            </div>

            {/* Error Message Alert Banner in Payment on Mobile */}
            {errorMessage && (
              <div
                role="alert"
                className="sm:hidden p-3 bg-red-50 border border-red-200 rounded-xl text-brand-red text-xs font-semibold flex items-start gap-2 leading-snug"
              >
                <span className="font-bold flex-none text-sm leading-none">⚠</span>
                <span>{errorMessage}</span>
              </div>
            )}
          </section>

          {/* Right Column: Order Summary (order-2 on mobile, right column on desktop) */}
          <aside className="order-2 lg:col-start-2 lg:row-start-1 lg:row-span-3 w-full self-start bg-white border border-line rounded-[16px] sm:rounded-[20px] p-4 sm:p-6 flex flex-col gap-3.5 shadow-sm">
            <h2 className="m-0 text-[20px] sm:text-[22px] font-extrabold text-ink">
              Order summary
            </h2>

            <dl className="m-0 grid grid-cols-[1fr_auto] gap-3 text-[15px] sm:text-[16px]">
              <dt className="text-muted">
                {totalPacks} packs ({totalUnits} units)
              </dt>
              <dd className="m-0 text-right font-medium text-ink">
                {subtotalFormatted}
              </dd>

              <dt className="text-muted">Delivery</dt>
              <dd className="m-0 text-right font-medium text-ink">
                {qualifiesForFreeDelivery || deliveryFeePence === 0 ? (
                  <span className="text-success font-bold">FREE</span>
                ) : (
                  deliveryFormatted
                )}
              </dd>

              <dt className="text-muted">VAT (20%)</dt>
              <dd className="m-0 text-right font-medium text-ink">
                {vatFormatted}
              </dd>

              <dt className="font-extrabold text-ink pt-3 border-t border-line text-[17px]">
                Total (inc. VAT)
              </dt>
              <dd className="m-0 pt-3 border-t border-line text-right font-extrabold text-[22px] text-navy-deep">
                {grandTotalFormatted}
              </dd>
            </dl>

            <p className="m-0 text-[13px] text-muted leading-relaxed">
              Wholesale pricing applied. Free delivery on orders over £150 ex VAT.
            </p>

            {/* Error Message Alert Banner */}
            {errorMessage && (
              <div
                role="alert"
                className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-brand-red text-sm font-semibold flex items-start gap-2.5 leading-snug"
              >
                <span className="font-bold flex-none text-base leading-none">⚠</span>
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={
                (tradeItems.length === 0 && tradeStands.length === 0) ||
                isProcessing ||
                !stripe ||
                !elements
              }
              className="mt-2 flex items-center justify-center gap-2 h-[58px] rounded-full bg-brand-red hover:bg-[#c9000b] disabled:opacity-50 disabled:cursor-not-allowed text-white no-underline font-extrabold text-[18px] border-0 cursor-pointer shadow-md transition-colors"
            >
              {isProcessing ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                  Processing…
                </>
              ) : (
                'Place trade order'
              )}
            </button>

            <Link
              href="/trade/shop"
              className="text-center font-bold text-[15px] text-brand-navy hover:text-brand-red no-underline transition-colors mt-1"
            >
              Keep shopping
            </Link>
          </aside>
        </form>
      </main>
    </div>
  );
}

export function TradeCheckoutView({ profile }: TradeCheckoutViewProps) {
  const stripePromise = useMemo(() => getStripePromise(), []);
  const { totalExVatPence, vatPence } = useTradeCartTotals();
  const deliveryFeePence = getTradeDeliveryFee(totalExVatPence);
  const grandTotalWithDeliveryPence = totalExVatPence + vatPence + deliveryFeePence;

  const elementsOptions = useMemo(
    () => ({
      mode: 'payment' as const,
      amount: Math.max(50, grandTotalWithDeliveryPence),
      currency: 'gbp',
      appearance: stripeAppearance,
    }),
    [grandTotalWithDeliveryPence]
  );

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      <TradeCheckoutForm profile={profile} />
    </Elements>
  );
}
