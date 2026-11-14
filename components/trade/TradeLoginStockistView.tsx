'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  tradeSignInAction,
  tradeSignUpAction,
  forgotPasswordAction,
} from '@/lib/actions/auth';
import { EyeIcon, EyeOffIcon } from '@/components/ui/Icons';
import { lookupPostcode } from '@/lib/lookupPostcode';

interface TradeLoginStockistViewProps {
  isLookupConfigured?: boolean;
}

export function TradeLoginStockistView({}: TradeLoginStockistViewProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/trade/shop';
  const initialTab = searchParams.get('tab') === 'login' ? 'login' : 'register';
  const resetSuccess = searchParams.get('reset') === 'success';
  const errorParam = searchParams.get('error');

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Forgot password state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  // Registration basic details
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [retailType, setRetailType] = useState('Convenience store');
  const [symbolGroup, setSymbolGroup] = useState('');
  const [sameDelivery, setSameDelivery] = useState(true);
  const [notes, setNotes] = useState('');
  const [repVisit, setRepVisit] = useState(false);

  // Trading address state
  const [tradingPostcode, setTradingPostcode] = useState('');
  const [tradingAddressLine1, setTradingAddressLine1] = useState('');
  const [tradingAddressLine2, setTradingAddressLine2] = useState('');
  const [tradingAddressLine3, setTradingAddressLine3] = useState('');
  const [tradingTown, setTradingTown] = useState('');
  const [isSearchingTrading, setIsSearchingTrading] = useState(false);
  const [tradingLookupError, setTradingLookupError] = useState<string | null>(null);

  // Delivery address state
  const [deliveryPostcode, setDeliveryPostcode] = useState('');
  const [deliveryAddressLine1, setDeliveryAddressLine1] = useState('');
  const [deliveryAddressLine2, setDeliveryAddressLine2] = useState('');
  const [deliveryAddressLine3, setDeliveryAddressLine3] = useState('');
  const [deliveryTown, setDeliveryTown] = useState('');
  const [isSearchingDelivery, setIsSearchingDelivery] = useState(false);
  const [deliveryLookupError, setDeliveryLookupError] = useState<string | null>(null);

  // Password fields
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isRegistering, setIsRegistering] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSubmitted, setRegisterSubmitted] = useState(false);

  useEffect(() => {
    if (searchParams.get('tab') === 'login') {
      setActiveTab('login');
    }
  }, [searchParams]);

  const handleTradingLookup = async () => {
    const pc = tradingPostcode.trim();
    if (!pc) {
      setTradingLookupError('Please enter a UK postcode.');
      return;
    }
    setTradingLookupError(null);
    setIsSearchingTrading(true);
    try {
      const result = await lookupPostcode(pc);
      if (!result) {
        setTradingLookupError('Invalid postcode. Please check and try again.');
      } else {
        setTradingPostcode(result.postcode);
        if (result.city) {
          setTradingTown(result.city);
        }
        if (result.county && !tradingAddressLine3) {
          setTradingAddressLine3(result.county);
        }
      }
    } catch {
      setTradingLookupError('Invalid postcode. Please check and try again.');
    } finally {
      setIsSearchingTrading(false);
    }
  };

  const handleDeliveryLookup = async () => {
    const pc = deliveryPostcode.trim();
    if (!pc) {
      setDeliveryLookupError('Please enter a UK postcode.');
      return;
    }
    setDeliveryLookupError(null);
    setIsSearchingDelivery(true);
    try {
      const result = await lookupPostcode(pc);
      if (!result) {
        setDeliveryLookupError('Invalid postcode. Please check and try again.');
      } else {
        setDeliveryPostcode(result.postcode);
        if (result.city) {
          setDeliveryTown(result.city);
        }
        if (result.county && !deliveryAddressLine3) {
          setDeliveryAddressLine3(result.county);
        }
      }
    } catch {
      setDeliveryLookupError('Invalid postcode. Please check and try again.');
    } finally {
      setIsSearchingDelivery(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const result = await tradeSignInAction(
        { email: loginEmail, password: loginPassword },
        redirectPath
      );

      if (result.error) {
        setLoginError(result.error);
        setIsLoggingIn(false);
      } else if (result.redirectUrl) {
        router.push(result.redirectUrl);
        router.refresh();
      }
    } catch {
      setLoginError('An unexpected connection error occurred. Please try again.');
      setIsLoggingIn(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);

    if (!tradingAddressLine1.trim()) {
      setRegisterError('Please enter Address line 1 for your trading address.');
      return;
    }

    if (!tradingPostcode.trim()) {
      setRegisterError('Please enter a postcode for your trading address.');
      return;
    }

    if (!sameDelivery) {
      if (!deliveryAddressLine1.trim()) {
        setRegisterError('Please enter Address line 1 for your delivery address.');
        return;
      }
      if (!deliveryPostcode.trim()) {
        setRegisterError('Please enter a postcode for your delivery address.');
        return;
      }
    }

    if (registerPassword.length < 6) {
      setRegisterError('Password must be at least 6 characters long.');
      return;
    }

    if (registerPassword !== confirmPassword) {
      setRegisterError('Passwords do not match.');
      return;
    }

    setIsRegistering(true);

    try {
      const result = await tradeSignUpAction({
        businessName,
        contactName,
        telephone,
        email,
        businessType: retailType,
        tradingAddressLine1,
        tradingAddressLine2,
        tradingAddressLine3,
        tradingTown,
        tradingPostcode,
        tradingAddress: [
          tradingAddressLine1,
          tradingAddressLine2,
          tradingAddressLine3,
          tradingTown,
          tradingPostcode,
        ]
          .filter(Boolean)
          .join(', '),
        postcode: tradingPostcode,
        symbolGroup,
        sameDelivery,
        deliveryAddressLine1: sameDelivery ? '' : deliveryAddressLine1,
        deliveryAddressLine2: sameDelivery ? '' : deliveryAddressLine2,
        deliveryAddressLine3: sameDelivery ? '' : deliveryAddressLine3,
        deliveryTown: sameDelivery ? '' : deliveryTown,
        deliveryPostcode: sameDelivery ? '' : deliveryPostcode,
        deliveryAddress: sameDelivery
          ? ''
          : [
              deliveryAddressLine1,
              deliveryAddressLine2,
              deliveryAddressLine3,
              deliveryTown,
              deliveryPostcode,
            ]
              .filter(Boolean)
              .join(', '),
        vatNumber: null,
        companyNumber: null,
        notes,
        password: registerPassword,
        repVisit,
      });

      setIsRegistering(false);

      if (result.error) {
        setRegisterError(result.error);
      } else {
        setRegisterSubmitted(true);
      }
    } catch {
      setRegisterError('Unable to submit your application. Please check your connection.');
      setIsRegistering(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotLoading(true);

    try {
      const result = await forgotPasswordAction({ email: forgotEmail });
      setForgotLoading(false);

      if (result.error) {
        setForgotError(result.error);
      } else {
        setForgotSuccess(true);
      }
    } catch {
      setForgotError('Could not send reset link. Please try again later.');
      setForgotLoading(false);
    }
  };

  return (
    <div className="font-sans text-ink w-full flex flex-col lg:flex-row min-h-screen">
      {/* Left: Brand panel (solid navy #1D1650, stretches full height to footer, 45% width on desktop) */}
      <aside className="w-full lg:w-[45%] flex-none bg-[#1D1650] text-white p-6 sm:p-10 lg:p-12 box-border flex flex-col gap-6 self-stretch">
        {/* 1. Logo */}
        <Link href="/" aria-label="Bits N Bobs home" className="self-start">
          <Image
            src="/images/logo.png"
            alt="Bits 'N' Bobs"
            width={170}
            height={52}
            className="h-10 sm:h-[52px] w-auto block"
            priority
          />
        </Link>

        {/* 2. Heading "For retailers and wholesale" (44px) */}
        <h1 className="m-0 text-[32px] sm:text-[44px] leading-[1.08] font-extrabold font-stretch-112 text-white">
          For retailers and wholesale
        </h1>

        {/* 3. Paragraph 18px pure white, line-height 1.6 */}
        <p className="m-0 text-[18px] leading-[1.6] text-white">
          For convenience stores, corner shops, CTNs, post offices and
          independent retailers. Apply once, we approve your account, then you
          see trade prices.
        </p>

        {/* 4. The 3 tick points: 17px white, line-height 1.6, bigger yellow ticks (28px) */}
        <ul className="m-0 p-0 list-none flex flex-col gap-3.5">
          <li className="flex gap-3.5 items-center text-[17px] text-white leading-[1.6]">
            <span
              aria-hidden="true"
              className="w-[28px] h-[28px] min-w-[28px] rounded-full bg-brand-yellow text-ink flex items-center justify-center font-black text-[15px] flex-none shadow-sm"
            >
              ✓
            </span>
            <span>Trade prices</span>
          </li>
          <li className="flex gap-3.5 items-center text-[17px] text-white leading-[1.6]">
            <span
              aria-hidden="true"
              className="w-[28px] h-[28px] min-w-[28px] rounded-full bg-brand-yellow text-ink flex items-center justify-center font-black text-[15px] flex-none shadow-sm"
            >
              ✓
            </span>
            <span>All products sold in trade packs of 6</span>
          </li>
          <li className="flex gap-3.5 items-center text-[17px] text-white leading-[1.6]">
            <span
              aria-hidden="true"
              className="w-[28px] h-[28px] min-w-[28px] rounded-full bg-brand-yellow text-ink flex items-center justify-center font-black text-[15px] flex-none shadow-sm"
            >
              ✓
            </span>
            <span>Free delivery on orders of £150 or more</span>
          </li>
        </ul>

        {/* 5. Stand photo (full aspect ratio 1217/1292, not cropped, 100% width of panel, rounded) */}
        <figure className="m-0 w-full rounded-[20px] overflow-hidden leading-none shadow-2xl bg-white/5 border border-white/10">
          <Image
            src="/images/stand.jpg"
            alt="A Bits N Bobs display stand full of hanging packs in a shop"
            width={1217}
            height={1292}
            sizes="(max-width: 1024px) 100vw, 560px"
            style={{
              width: '100%',
              height: 'auto',
              aspectRatio: '1217 / 1292',
            }}
            className="block w-full h-auto object-contain rounded-[20px]"
            priority
          />
        </figure>

        {/* 6. The 3 short steps: 17px white, line-height 1.6 */}
        <ol className="m-0 p-0 list-none flex flex-col gap-3">
          <li className="flex items-center gap-3.5 text-[17px] text-white leading-[1.6]">
            <span className="text-[20px] font-extrabold text-brand-yellow font-stretch-112 flex-none w-7">
              01
            </span>
            <span className="font-bold">Become a stockist</span>
          </li>
          <li className="flex items-center gap-3.5 text-[17px] text-white leading-[1.6]">
            <span className="text-[20px] font-extrabold text-brand-yellow font-stretch-112 flex-none w-7">
              02
            </span>
            <span className="font-bold">Order a fully stocked stand</span>
          </li>
          <li className="flex items-center gap-3.5 text-[17px] text-white leading-[1.6]">
            <span className="text-[20px] font-extrabold text-brand-yellow font-stretch-112 flex-none w-7">
              03
            </span>
            <span className="font-bold">Reorder packs of 6</span>
          </li>
        </ol>
      </aside>

      {/* Right: Tabbed Forms (55% width on desktop, centred form with max-width 560px) */}
      <main className="w-full lg:w-[55%] flex-1 p-6 sm:p-10 lg:p-14 box-border flex justify-center items-start bg-white min-w-0">
        <div className="w-full max-w-[560px] flex flex-col gap-7">
          {/* Tab buttons */}
          <div
            role="tablist"
            aria-label="Account"
            className="grid grid-cols-2 bg-surface rounded-xl p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'login'}
              onClick={() => {
                setActiveTab('login');
                setShowForgot(false);
              }}
              className={`h-[46px] border-0 rounded-[10px] font-sans font-bold text-[16px] cursor-pointer transition-all ${
                activeTab === 'login'
                  ? 'bg-white text-navy-deep shadow-sm'
                  : 'bg-transparent text-muted hover:text-ink'
              }`}
            >
              Trade login
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'register'}
              onClick={() => {
                setActiveTab('register');
                setShowForgot(false);
              }}
              className={`h-[46px] border-0 rounded-[10px] font-sans font-bold text-[16px] cursor-pointer transition-all ${
                activeTab === 'register'
                  ? 'bg-white text-navy-deep shadow-sm'
                  : 'bg-transparent text-muted hover:text-ink'
              }`}
            >
              Become a stockist
            </button>
          </div>

          {showForgot ? (
            /* Forgot Password Sub-View */
            <div className="flex flex-col gap-6">
              <div>
                <button
                  type="button"
                  onClick={() => setShowForgot(false)}
                  className="inline-flex items-center gap-1.5 text-[14px] font-bold text-muted hover:text-ink cursor-pointer border-0 bg-transparent p-0 mb-3"
                >
                  ← Back to trade login
                </button>
                <h2 className="m-0 text-[32px] font-extrabold font-stretch-108 text-navy-deep">
                  Reset trade password
                </h2>
                <p className="mt-2 mb-0 text-[16px] text-muted">
                  Enter your registered trade account email and we will send you a password reset link.
                </p>
              </div>

              {forgotError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-danger text-[14px] font-medium">
                  {forgotError}
                </div>
              )}

              {forgotSuccess ? (
                <div className="p-5 rounded-2xl bg-green-50 border border-green-200 text-success flex flex-col gap-2">
                  <span className="font-bold text-[16px]">✓ Reset link sent</span>
                  <p className="m-0 text-[14px] text-text-2">
                    If an account exists for <strong>{forgotEmail}</strong>, we have sent instructions to reset your password.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgot(false);
                      setForgotSuccess(false);
                    }}
                    className="mt-3 text-left font-bold text-brand-navy hover:underline text-[14px] border-0 bg-transparent p-0 cursor-pointer"
                  >
                    Return to trade sign in
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
                  <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                    Email address
                    <input
                      type="email"
                      name="email"
                      required
                      autoComplete="email username"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="shop@retailer.co.uk"
                      className="h-12 border border-field-border rounded-[10px] px-3.5 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="mt-2 h-14 border-0 rounded-xl bg-brand-navy hover:bg-[#231b64] text-white font-sans font-extrabold text-[17px] cursor-pointer shadow-sm transition-colors disabled:opacity-60"
                  >
                    {forgotLoading ? 'Sending email...' : 'Send reset link'}
                  </button>
                </form>
              )}
            </div>
          ) : activeTab === 'login' ? (
            /* Login Tab */
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="m-0 text-[32px] font-extrabold font-stretch-108 text-navy-deep">
                  Trade account login
                </h2>
                <p className="mt-2 mb-0 text-[16px] text-muted">
                  Sign in with your approved retail account to see wholesale
                  prices and reorder in one click.
                </p>
              </div>

              {resetSuccess && (
                <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-success text-[14px] font-bold">
                  ✓ Your password has been updated. You can now sign in below.
                </div>
              )}

              {errorParam === 'suspended' && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-danger text-[14px] font-medium">
                  Your trade account is not active or has been suspended. Please call 0161 839 5050 for assistance.
                </div>
              )}

              {loginError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-danger text-[14px] font-medium">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                  Email address
                  <input
                    type="email"
                    name="email"
                    required
                    autoComplete="username email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="shop@retailer.co.uk"
                    className="h-12 border border-field-border rounded-[10px] px-3.5 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy"
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                  Password
                  <div className="relative flex items-center">
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      name="password"
                      required
                      autoComplete="current-password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full h-12 border border-field-border rounded-[10px] pl-3.5 pr-11 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 p-1.5 text-muted hover:text-navy-deep border-0 bg-transparent cursor-pointer flex items-center justify-center transition-colors"
                    >
                      {showLoginPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                    </button>
                  </div>
                </label>

                <div className="flex justify-between items-center text-[14px]">
                  <label className="flex items-center gap-2 cursor-pointer text-muted">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 accent-brand-navy rounded"
                    />
                    Remember me
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(loginEmail);
                      setShowForgot(true);
                    }}
                    className="font-bold text-brand-navy hover:underline border-0 bg-transparent p-0 cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="mt-2 h-14 border-0 rounded-xl bg-brand-red hover:bg-[#c9000b] text-white font-sans font-extrabold text-[17px] cursor-pointer shadow-sm transition-colors disabled:opacity-60"
                >
                  {isLoggingIn ? 'Signing in...' : 'Sign in to trade shop'}
                </button>
              </form>
            </div>
          ) : registerSubmitted ? (
            /* Registration confirmation */
            <div className="flex flex-col items-center justify-center text-center gap-4 py-8">
              <div className="w-16 h-16 rounded-full bg-success text-white flex items-center justify-center text-2xl font-bold">
                ✓
              </div>
              <h2 className="m-0 text-[30px] font-extrabold text-navy-deep">
                Application received!
              </h2>
              <p className="text-[16px] text-text-2 leading-relaxed max-w-md">
                Thank you, {businessName.trim() || 'retailer'}. Your application has been received. We&apos;ll review it and email you at <strong>{email}</strong> as soon as your trade account is approved. Need it sooner? Call us on{' '}
                <a
                  href="tel:01618395050"
                  className="text-brand-navy hover:underline font-bold whitespace-nowrap"
                >
                  0161 839 5050
                </a>
                .
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full justify-center">
                <Link
                  href="/shop"
                  className="h-12 px-6 rounded-xl bg-brand-navy text-white font-bold text-[15px] flex items-center justify-center no-underline hover:bg-[#231b64] transition-colors shadow-sm"
                >
                  Continue shopping
                </Link>
                <Link
                  href="/"
                  className="h-12 px-6 rounded-xl bg-surface text-ink font-bold text-[15px] flex items-center justify-center no-underline hover:bg-line transition-colors"
                >
                  Back to home page
                </Link>
              </div>
            </div>
          ) : (
            /* Become a Stockist Tab */
            <>
              <div>
                <h2 className="m-0 text-[32px] font-extrabold font-stretch-108 text-navy-deep">
                  Tell us about your shop
                </h2>
                <p className="mt-2 mb-0 text-[16px] text-muted">
                  We check every application and email you as soon as your account
                  is approved.
                </p>
              </div>

              {registerError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-danger text-[14px] font-medium">
                  {registerError}
                </div>
              )}

              <form
                onSubmit={handleRegister}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {/* 1. Store name */}
                <label className="col-span-full flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                  Store name
                  <input
                    type="text"
                    required
                    name="organization"
                    autoComplete="organization"
                    placeholder="Station Road Convenience"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="h-12 border border-field-border rounded-[10px] px-3.5 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy"
                  />
                </label>

                {/* 2. Full name */}
                <label className="col-span-full flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                  Full name
                  <input
                    type="text"
                    required
                    name="name"
                    autoComplete="name"
                    placeholder="First and last name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="h-12 border border-field-border rounded-[10px] px-3.5 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy"
                  />
                </label>

                {/* 3. Address line 1 */}
                <label className="col-span-full flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                  Address line 1
                  <input
                    type="text"
                    required
                    name="address-line1"
                    autoComplete="address-line1"
                    placeholder="Building name, shop number, or street"
                    value={tradingAddressLine1}
                    onChange={(e) => {
                      setTradingAddressLine1(e.target.value);
                      if (tradingLookupError) setTradingLookupError(null);
                    }}
                    className="h-12 border border-field-border rounded-[10px] px-3.5 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy"
                  />
                </label>

                {/* 4. Address line 2 (optional) */}
                <label className="col-span-full flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                  Address line 2 (optional)
                  <input
                    type="text"
                    name="address-line2"
                    autoComplete="address-line2"
                    placeholder="Unit, suite, floor, etc."
                    value={tradingAddressLine2}
                    onChange={(e) => {
                      setTradingAddressLine2(e.target.value);
                      if (tradingLookupError) setTradingLookupError(null);
                    }}
                    className="h-12 border border-field-border rounded-[10px] px-3.5 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy"
                  />
                </label>

                {/* 5. Address line 3 (optional) */}
                <label className="col-span-full flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                  Address line 3 (optional)
                  <input
                    type="text"
                    name="address-line3"
                    autoComplete="address-line3"
                    placeholder="Area, district or estate"
                    value={tradingAddressLine3}
                    onChange={(e) => {
                      setTradingAddressLine3(e.target.value);
                      if (tradingLookupError) setTradingLookupError(null);
                    }}
                    className="h-12 border border-field-border rounded-[10px] px-3.5 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy"
                  />
                </label>

                {/* 6. Town or city */}
                <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                  Town or city
                  <input
                    type="text"
                    required
                    name="address-level2"
                    autoComplete="address-level2"
                    placeholder="e.g. Manchester"
                    value={tradingTown}
                    onChange={(e) => {
                      setTradingTown(e.target.value);
                      if (tradingLookupError) setTradingLookupError(null);
                    }}
                    className="h-12 border border-field-border rounded-[10px] px-3.5 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy"
                  />
                </label>

                {/* 7. Postcode with Find postcode lookup */}
                <div className="col-span-full flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <label htmlFor="trading-postcode">Postcode</label>
                    <span className="text-[12px] font-normal text-muted">
                      Enter your postcode to auto-fill city and county
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      id="trading-postcode"
                      type="text"
                      name="postal-code"
                      autoComplete="postal-code"
                      required
                      placeholder="e.g. M1 1AE"
                      value={tradingPostcode}
                      onChange={(e) => {
                        setTradingPostcode(e.target.value.toUpperCase());
                        setTradingLookupError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleTradingLookup();
                        }
                      }}
                      className="flex-1 h-12 border border-field-border rounded-[10px] px-3.5 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy uppercase placeholder:normal-case"
                    />
                    <button
                      type="button"
                      onClick={handleTradingLookup}
                      disabled={isSearchingTrading || !tradingPostcode.trim()}
                      className="h-12 px-4 rounded-[10px] bg-brand-navy hover:bg-[#231b64] text-white font-sans font-bold text-[14px] cursor-pointer shadow-sm transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                      {isSearchingTrading ? 'Finding...' : 'Find postcode'}
                    </button>
                  </div>
                </div>

                {tradingLookupError && (
                  <div className="col-span-full p-3 rounded-xl bg-amber-50 border border-amber-200 text-[#78350F] text-[13px] flex items-start justify-between gap-2 shadow-xs">
                    <div className="flex items-start gap-2">
                      <span className="text-[15px] leading-tight select-none">ℹ️</span>
                      <span className="leading-snug">{tradingLookupError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTradingLookupError(null)}
                      aria-label="Dismiss notice"
                      className="text-amber-800/60 hover:text-amber-900 text-sm font-bold border-0 bg-transparent cursor-pointer p-0 shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* 8. Email */}
                <label className="col-span-full flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                  Email
                  <input
                    type="email"
                    required
                    name="email"
                    autoComplete="email"
                    placeholder="you@yourshop.co.uk"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 border border-field-border rounded-[10px] px-3.5 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy"
                  />
                </label>

                {/* 9. Phone */}
                <label className="col-span-full flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                  Phone
                  <input
                    type="tel"
                    required
                    name="tel"
                    autoComplete="tel"
                    placeholder="0161 123 4567"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    className="h-12 border border-field-border rounded-[10px] px-3.5 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy"
                  />
                </label>

                {/* 10. Business Type */}
                <label className="col-span-full flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                  Type of retail business
                  <select
                    value={retailType}
                    onChange={(e) => setRetailType(e.target.value)}
                    className="h-12 border border-field-border rounded-[10px] px-3.5 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy"
                  >
                    <option>Convenience store</option>
                    <option>Corner shop</option>
                    <option>CTN (confectioner, tobacconist, newsagent)</option>
                    <option>Post office</option>
                    <option>Late-night shop</option>
                    <option>Other independent retailer</option>
                  </select>
                </label>

                {/* 11. Symbol Group */}
                <label className="col-span-full flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                  Symbol group (optional)
                  <input
                    type="text"
                    placeholder="Nisa, SPAR, Premier, Costcutter, independent..."
                    value={symbolGroup}
                    onChange={(e) => setSymbolGroup(e.target.value)}
                    className="h-12 border border-field-border rounded-[10px] px-3.5 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy"
                  />
                </label>

                {/* 12. Delivery Same as Trading Checkbox */}
                <label className="col-span-full flex gap-2.5 items-center text-[15px] cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={sameDelivery}
                    onChange={(e) => setSameDelivery(e.target.checked)}
                    className="w-5 h-5 accent-brand-navy rounded"
                  />
                  Delivery address is the same as trading address
                </label>

                {/* Delivery Address Section (when sameDelivery is false) */}
                {!sameDelivery && (
                  <div className="col-span-full flex flex-col gap-3.5 pt-2 border-t border-line/60">
                    <span className="text-[15px] font-bold text-navy-deep">
                      Delivery address
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Delivery Address line 1 */}
                      <label className="col-span-full flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                        Address line 1
                        <input
                          type="text"
                          required
                          name="shipping-address-line1"
                          autoComplete="shipping address-line1"
                          placeholder="Building name, unit number, or street"
                          value={deliveryAddressLine1}
                          onChange={(e) => {
                            setDeliveryAddressLine1(e.target.value);
                            if (deliveryLookupError) setDeliveryLookupError(null);
                          }}
                          className="h-12 border border-field-border rounded-[10px] px-3.5 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy"
                        />
                      </label>

                      {/* Delivery Address line 2 (optional) */}
                      <label className="col-span-full flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                        Address line 2 (optional)
                        <input
                          type="text"
                          name="shipping-address-line2"
                          autoComplete="shipping address-line2"
                          placeholder="Unit, suite, floor, etc."
                          value={deliveryAddressLine2}
                          onChange={(e) => {
                            setDeliveryAddressLine2(e.target.value);
                            if (deliveryLookupError) setDeliveryLookupError(null);
                          }}
                          className="h-12 border border-field-border rounded-[10px] px-3.5 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy"
                        />
                      </label>

                      {/* Delivery Address line 3 (optional) */}
                      <label className="col-span-full flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                        Address line 3 (optional)
                        <input
                          type="text"
                          name="shipping-address-line3"
                          autoComplete="shipping address-line3"
                          placeholder="Area, district or estate"
                          value={deliveryAddressLine3}
                          onChange={(e) => {
                            setDeliveryAddressLine3(e.target.value);
                            if (deliveryLookupError) setDeliveryLookupError(null);
                          }}
                          className="h-12 border border-field-border rounded-[10px] px-3.5 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy"
                        />
                      </label>

                      {/* Delivery Town or city */}
                      <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                        Town or city
                        <input
                          type="text"
                          required
                          name="shipping-address-level2"
                          autoComplete="shipping address-level2"
                          placeholder="e.g. Manchester"
                          value={deliveryTown}
                          onChange={(e) => {
                            setDeliveryTown(e.target.value);
                            if (deliveryLookupError) setDeliveryLookupError(null);
                          }}
                          className="h-12 border border-field-border rounded-[10px] px-3.5 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy"
                        />
                      </label>

                      {/* Delivery Postcode with Find postcode lookup */}
                      <div className="col-span-full flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <label htmlFor="delivery-postcode">Postcode</label>
                          <span className="text-[12px] font-normal text-muted">
                            Enter your postcode to auto-fill city and county
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <input
                            id="delivery-postcode"
                            type="text"
                            required
                            name="shipping-postal-code"
                            autoComplete="shipping postal-code"
                            placeholder="e.g. M1 1AE"
                            value={deliveryPostcode}
                            onChange={(e) => {
                              setDeliveryPostcode(e.target.value.toUpperCase());
                              setDeliveryLookupError(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleDeliveryLookup();
                              }
                            }}
                            className="flex-1 h-12 border border-field-border rounded-[10px] px-3.5 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy uppercase placeholder:normal-case"
                          />
                          <button
                            type="button"
                            onClick={handleDeliveryLookup}
                            disabled={isSearchingDelivery || !deliveryPostcode.trim()}
                            className="h-12 px-4 rounded-[10px] bg-brand-navy hover:bg-[#231b64] text-white font-sans font-bold text-[14px] cursor-pointer shadow-sm transition-colors disabled:opacity-50 whitespace-nowrap"
                          >
                            {isSearchingDelivery ? 'Finding...' : 'Find postcode'}
                          </button>
                        </div>
                      </div>

                      {deliveryLookupError && (
                        <div className="col-span-full p-3 rounded-xl bg-amber-50 border border-amber-200 text-[#78350F] text-[13px] flex items-start justify-between gap-2 shadow-xs">
                          <div className="flex items-start gap-2">
                            <span className="text-[15px] leading-tight select-none">ℹ️</span>
                            <span className="leading-snug">{deliveryLookupError}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setDeliveryLookupError(null)}
                            aria-label="Dismiss notice"
                            className="text-amber-800/60 hover:text-amber-900 text-sm font-bold border-0 bg-transparent cursor-pointer p-0 shrink-0"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 10. Anything else we should know */}
                <label className="col-span-full flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                  Anything else we should know?
                  <textarea
                    placeholder="Number of stores, opening hours, products you are interested in"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[88px] border border-field-border rounded-[10px] p-3 font-sans font-normal text-[16px] text-ink bg-white outline-none resize-y focus:border-brand-navy"
                  />
                </label>

                {/* 11. Create Password with Show/Hide Eye Toggle */}
                <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                  Create a password
                  <div className="relative flex items-center">
                    <input
                      type={showRegisterPassword ? 'text' : 'password'}
                      required
                      name="password"
                      autoComplete="new-password"
                      placeholder="At least 6 characters"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="w-full h-12 border border-field-border rounded-[10px] pl-3.5 pr-11 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      aria-label={showRegisterPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 p-1.5 text-muted hover:text-navy-deep border-0 bg-transparent cursor-pointer flex items-center justify-center transition-colors"
                    >
                      {showRegisterPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                    </button>
                  </div>
                </label>

                {/* 12. Confirm Password with Show/Hide Eye Toggle */}
                <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                  Confirm password
                  <div className="relative flex items-center">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      name="confirmPassword"
                      autoComplete="new-password"
                      placeholder="Repeat your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-12 border border-field-border rounded-[10px] pl-3.5 pr-11 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 p-1.5 text-muted hover:text-navy-deep border-0 bg-transparent cursor-pointer flex items-center justify-center transition-colors"
                    >
                      {showConfirmPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                    </button>
                  </div>
                </label>

                {/* 13. Sales Rep Checkbox */}
                <label className="col-span-full flex gap-2.5 items-start text-[15px] leading-snug cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={repVisit}
                    onChange={(e) => setRepVisit(e.target.checked)}
                    className="w-5 h-5 mt-0.5 accent-brand-navy rounded"
                  />
                  I would like a rep to visit about a display stand
                </label>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isRegistering}
                  className="col-span-full h-14 border-0 rounded-xl bg-brand-red hover:bg-[#c9000b] text-white font-sans font-extrabold text-[17px] cursor-pointer shadow-sm transition-colors mt-2 disabled:opacity-60"
                >
                  {isRegistering ? 'Submitting application...' : 'Apply to become a stockist'}
                </button>
              </form>
            </>
          )}

          <div className="border-t border-line pt-5 flex flex-wrap justify-between items-center gap-3 text-[15px]">
            <span className="text-muted">Only buying one or two items?</span>
            <Link href="/shop" className="font-bold text-brand-navy hover:text-brand-red">
              Continue as a guest
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
