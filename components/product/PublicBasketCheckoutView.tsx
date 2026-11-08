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
import { useCartStore, usePublicCartTotals } from '@/lib/cart/store';
import { formatMoney } from '@/lib/money';
import { LockIcon } from '@/components/ui/Icons';
import { getDeliveryFee } from '@/lib/delivery';
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

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();

  const { items, totalItems, subtotalPence } = usePublicCartTotals();
  const updatePublicQuantity = useCartStore((state) => state.updatePublicQuantity);
  const removePublicItem = useCartStore((state) => state.removePublicItem);

  // Form inputs
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postcode, setPostcode] = useState('');
  const [billingSame, setBillingSame] = useState(true);

  // UI state
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const deliveryFee = getDeliveryFee(subtotalPence);
  const totalPence = subtotalPence + deliveryFee;
  const subtotalFormatted = formatMoney(subtotalPence, { allowPenceOnly: true });

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      setErrorMessage('Your basket is empty. Please add items before checking out.');
      return;
    }

    // 1. Validate customer details
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (fullName.trim().length < 2) {
      setErrorMessage('Please enter your full name (at least 2 characters).');
      return;
    }
    if (address.trim().length < 5) {
      setErrorMessage('Please enter your street address.');
      return;
    }
    if (city.trim().length < 2) {
      setErrorMessage('Please enter your town or city.');
      return;
    }
    if (!ukPostcodeRegex.test(postcode.trim())) {
      setErrorMessage(
        'Please enter a valid UK postcode (e.g. SW1A 1AA or M1 1AE).'
      );
      return;
    }

    if (!stripe || !elements) {
      setErrorMessage('Payment service is still initialising. Please wait a moment.');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    try {
      // 2. Trigger Stripe Form Validation
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setErrorMessage(
          submitError.message || 'Please check your payment card details.'
        );
        setIsProcessing(false);
        return;
      }

      // 3. Create Order & PaymentIntent on the server
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          fullName: fullName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
          postcode: postcode.trim().toUpperCase(),
          billingSame,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
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
        // Stripe handled error (e.g. Card declined, insufficient funds)
        setErrorMessage(
          confirmError.message ||
            'Payment could not be confirmed. Please check your details and try again.'
        );
        setIsProcessing(false);
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMessage(
        err.message || 'An unexpected error occurred while placing your order.'
      );
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-surface w-full min-h-[calc(100vh-140px)]">
      <main className="max-w-[1320px] mx-auto px-4 sm:px-8 py-6 sm:py-9 pb-28 sm:pb-20 flex flex-col gap-4 sm:gap-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2 sm:gap-3">
          <h1 className="m-0 text-[30px] min-[400px]:text-[32px] sm:text-[38px] lg:text-[44px] font-extrabold font-stretch-112 text-navy-deep leading-tight">
            Your basket
          </h1>
          <span className="flex items-center gap-1.5 sm:gap-2 text-[14px] sm:text-[15px] text-text-2 font-semibold">
            <LockIcon size={18} className="text-success flex-none" />
            Secure checkout
          </span>
        </div>

        <form
          onSubmit={handlePay}
          className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4 sm:gap-6 items-start"
        >
          {/* Basket Items (order-1 on mobile, col 1 row 1 on desktop) */}
          <section className="order-1 lg:col-start-1 lg:row-start-1 bg-white border border-line rounded-[16px] sm:rounded-[20px] p-4 sm:p-6 shadow-sm">
            {items.length === 0 ? (
              <div className="py-8 text-center text-muted">
                <p className="text-lg">Your basket is empty.</p>
                <Link
                  href="/shop"
                  className="inline-block mt-2 font-bold text-brand-navy hover:underline"
                >
                  Browse products
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.productId}
                  className="flex flex-col sm:grid sm:grid-cols-[72px_minmax(0,1fr)_auto_auto] gap-3 sm:gap-4 py-3.5 border-b border-[#EEEFF4] last:border-b-0"
                >
                  {/* Line 1 on mobile: Image + Name + Remove */}
                  <div className="flex items-center gap-3 min-w-0 sm:contents">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={72}
                      height={72}
                      className="w-[56px] h-[56px] sm:w-[72px] sm:h-[72px] flex-none object-contain border border-[#EEEFF4] rounded-xl p-1 bg-white"
                    />
                    <div className="min-w-0 flex-1">
                      <strong className="block text-[15px] sm:text-[17px] text-ink font-bold truncate sm:whitespace-normal">
                        {item.name}
                      </strong>
                      <button
                        type="button"
                        onClick={() => removePublicItem(item.productId)}
                        disabled={isProcessing}
                        className="text-[13px] sm:text-[14px] text-muted hover:text-danger border-0 bg-transparent p-0 cursor-pointer text-left transition-colors disabled:opacity-50 min-h-[32px] sm:min-h-0 flex items-center"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Line 2 on mobile: Stepper + Line Total */}
                  <div className="flex items-center justify-between sm:contents pt-1 sm:pt-0">
                    {/* Stepper */}
                    <div className="grid grid-cols-[40px_44px_40px] h-11 border border-field-border rounded-full overflow-hidden bg-white">
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() =>
                          updatePublicQuantity(
                            item.productId,
                            item.quantity - 1
                          )
                        }
                        aria-label="Remove one"
                        className="border-0 bg-transparent text-[18px] font-bold text-brand-navy hover:bg-surface cursor-pointer flex items-center justify-center disabled:opacity-50"
                      >
                        −
                      </button>
                      <label className="flex">
                        <span className="sr-only">Quantity</span>
                        <input
                          type="number"
                          min="1"
                          disabled={isProcessing}
                          value={item.quantity}
                          onChange={(e) =>
                            updatePublicQuantity(
                              item.productId,
                              parseInt(e.target.value, 10) || 1
                            )
                          }
                          className="w-full border-0 text-center font-sans font-bold text-ink outline-none disabled:bg-gray-50"
                        />
                      </label>
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() =>
                          updatePublicQuantity(
                            item.productId,
                            item.quantity + 1
                          )
                        }
                        aria-label="Add one"
                        className="border-0 bg-transparent text-[18px] font-bold text-brand-navy hover:bg-surface cursor-pointer flex items-center justify-center disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>
                    {/* Total for line */}
                    <strong className="sm:min-w-[56px] text-right text-[16px] sm:text-[17px] text-navy-deep font-extrabold">
                      {formatMoney(item.pricePence * item.quantity, {
                        allowPenceOnly: true,
                      })}
                    </strong>
                  </div>
                </div>
              ))
              )}
            </section>

            {/* Delivery Details (order-3 on mobile, row 2 col 1 on desktop) */}
            <section className="order-3 lg:col-start-1 lg:row-start-2 bg-white border border-line rounded-[16px] sm:rounded-[20px] p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5 shadow-sm">
              <h2 className="col-span-full m-0 text-[20px] sm:text-[22px] font-extrabold text-ink">
                Delivery details
              </h2>
              <label className="col-span-full flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                Email for your order confirmation
                <input
                  type="email"
                  autoComplete="email"
                  required
                  disabled={isProcessing}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full h-12 min-h-[44px] border border-field-border rounded-[10px] px-3.5 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy disabled:bg-gray-50"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                Full name
                <input
                  type="text"
                  autoComplete="name"
                  required
                  disabled={isProcessing}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-12 min-h-[44px] border border-field-border rounded-[10px] px-3.5 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy disabled:bg-gray-50"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                Phone
                <input
                  type="tel"
                  autoComplete="tel"
                  disabled={isProcessing}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Optional"
                  className="w-full h-12 min-h-[44px] border border-field-border rounded-[10px] px-3.5 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy disabled:bg-gray-50"
                />
              </label>
              <label className="col-span-full flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                Address
                <input
                  type="text"
                  autoComplete="street-address"
                  required
                  disabled={isProcessing}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House number and street"
                  className="w-full h-12 min-h-[44px] border border-field-border rounded-[10px] px-3.5 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy disabled:bg-gray-50"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                Town or city
                <input
                  type="text"
                  autoComplete="address-level2"
                  required
                  disabled={isProcessing}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full h-12 min-h-[44px] border border-field-border rounded-[10px] px-3.5 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy disabled:bg-gray-50"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                Postcode
                <input
                  type="text"
                  autoComplete="postal-code"
                  required
                  disabled={isProcessing}
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  placeholder="e.g. SW1A 1AA"
                  className="w-full h-12 min-h-[44px] border border-field-border rounded-[10px] px-3.5 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy disabled:bg-gray-50"
                />
              </label>
              <label className="col-span-full flex gap-2.5 items-center text-[14px] sm:text-[15px] cursor-pointer pt-1">
                <input
                  type="checkbox"
                  disabled={isProcessing}
                  checked={billingSame}
                  onChange={(e) => setBillingSame(e.target.checked)}
                  className="w-5 h-5 accent-brand-navy rounded"
                />
                Billing address is the same
              </label>
            </section>

            {/* Stripe Payment Element Section (order-4 on mobile, row 3 col 1 on desktop) */}
            <section className="order-4 lg:col-start-1 lg:row-start-3 bg-white border border-line rounded-[16px] sm:rounded-[20px] p-4 sm:p-6 flex flex-col gap-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="m-0 text-[20px] sm:text-[22px] font-extrabold text-ink">
                  Payment
                </h2>
                <span className="text-[12px] sm:text-[13px] text-muted flex items-center gap-1.5 font-medium">
                  <LockIcon size={14} className="text-success" />
                  Encrypted &amp; secure
                </span>
              </div>

              <div className="w-full min-h-[160px]">
                <PaymentElement
                  options={{
                    layout: 'tabs',
                    defaultValues: {
                      billingDetails: {
                        address: {
                          country: 'GB',
                        },
                      },
                    },
                  }}
                />
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

          {/* Right: Order Summary Sidebar (order-2 on mobile, right column on desktop) */}
          <aside className="order-2 lg:col-start-2 lg:row-start-1 lg:row-span-3 w-full self-start bg-white border border-line rounded-[16px] sm:rounded-[20px] p-4 sm:p-6 flex flex-col gap-3.5 shadow-sm">
            <h2 className="m-0 text-[20px] sm:text-[22px] font-extrabold text-ink">
              Order summary
            </h2>
            <dl className="m-0 grid grid-cols-[1fr_auto] gap-3 text-[15px] sm:text-[16px]">
              <dt className="text-muted">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </dt>
              <dd className="m-0 text-right font-medium text-ink">
                {subtotalFormatted}
              </dd>
              <dt className="text-muted">Delivery</dt>
              <dd className="m-0 text-right font-medium text-ink">
                {subtotalPence === 0 ? (
                  '—'
                ) : deliveryFee === 0 ? (
                  <span className="text-success font-bold">FREE</span>
                ) : (
                  formatMoney(deliveryFee, { allowPenceOnly: true })
                )}
              </dd>
              <dt className="font-extrabold text-ink pt-3 border-t border-line text-[17px]">
                Total (incl. VAT)
              </dt>
              <dd className="m-0 pt-3 border-t border-line text-right font-extrabold text-[20px] text-navy-deep">
                {formatMoney(totalPence, { allowPenceOnly: true })}
              </dd>
            </dl>

            {/* Error Message Banner */}
            {errorMessage && (
              <div
                role="alert"
                className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-brand-red text-sm font-semibold flex items-start gap-2.5 leading-snug"
              >
                <span className="font-bold flex-none text-base leading-none">⚠</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Button inside summary card: hidden on phones <640px, visible on tablets & desktop >=640px */}
            <button
              type="submit"
              disabled={
                items.length === 0 || isProcessing || !stripe || !elements
              }
              className="mt-2 hidden sm:flex items-center justify-center gap-2 h-[58px] rounded-full bg-brand-red hover:bg-[#c9000b] disabled:opacity-50 disabled:cursor-not-allowed text-white no-underline font-extrabold text-[18px] border-0 cursor-pointer shadow-md transition-colors w-full"
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
                'Pay securely'
              )}
            </button>

            <p className="m-0 text-[14px] text-muted text-center leading-relaxed">
              No account needed. We email your order confirmation straight away.
            </p>

            <div className="border-t border-line pt-3.5 text-[14px] text-text-2 text-center">
              Buying for a shop?{' '}
              <Link
                href="/trade"
                className="font-bold text-brand-navy hover:underline"
              >
                Trade login
              </Link>{' '}
              or{' '}
              <Link
                href="/trade"
                className="font-bold text-brand-navy hover:underline"
              >
                become a stockist
              </Link>
              .
            </div>
          </aside>

          {/* Sticky mobile checkout bar (phones <640px only) */}
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-line px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] sm:hidden flex items-center justify-between gap-3">
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] text-muted leading-tight font-medium">Total (incl. VAT)</span>
              <span className="text-[19px] font-extrabold text-navy-deep leading-tight truncate">
                {formatMoney(totalPence, { allowPenceOnly: true })}
              </span>
            </div>
            <button
              type="submit"
              disabled={
                items.length === 0 || isProcessing || !stripe || !elements
              }
              className="flex-1 max-w-[200px] flex items-center justify-center gap-2 h-12 min-h-[44px] rounded-full bg-brand-red hover:bg-[#c9000b] disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-[15px] border-0 cursor-pointer shadow-md transition-colors"
            >
              {isProcessing ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                  <span>Processing…</span>
                </>
              ) : (
                'Pay securely'
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export function PublicBasketCheckoutView() {
  const stripePromise = useMemo(() => getStripePromise(), []);
  const { subtotalPence } = usePublicCartTotals();
  const deliveryFee = getDeliveryFee(subtotalPence);
  const totalPence = subtotalPence + deliveryFee;

  const elementsOptions = useMemo(
    () => ({
      mode: 'payment' as const,
      amount: Math.max(50, totalPence),
      currency: 'gbp',
      appearance: stripeAppearance,
    }),
    [totalPence]
  );

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      <CheckoutForm />
    </Elements>
  );
}
