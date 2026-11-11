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

export function TradeLoginStockistView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/trade/shop';
  const initialTab = searchParams.get('tab') === 'login' ? 'login' : 'register';
  const resetSuccess = searchParams.get('reset') === 'success';
  const errorParam = searchParams.get('error');

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Forgot password state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  // Registration fields
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [retailType, setRetailType] = useState('Convenience store');
  const [tradingAddress, setTradingAddress] = useState('');
  const [postcode, setPostcode] = useState('');
  const [symbolGroup, setSymbolGroup] = useState('');
  const [sameDelivery, setSameDelivery] = useState(true);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [companyNumber, setCompanyNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [repVisit, setRepVisit] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSubmitted, setRegisterSubmitted] = useState(false);

  useEffect(() => {
    if (searchParams.get('tab') === 'login') {
      setActiveTab('login');
    }
  }, [searchParams]);

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
        tradingAddress,
        postcode,
        symbolGroup,
        sameDelivery,
        deliveryAddress: sameDelivery ? '' : deliveryAddress,
        vatNumber,
        companyNumber,
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
    <div className="font-sans text-ink w-full flex flex-wrap min-h-screen">
      {/* Left: Brand panel with pegboard pattern */}
      <aside className="peg-pattern flex-1 basis-[480px] text-white p-8 sm:p-12 box-border flex flex-col gap-10">
        <Link href="/" aria-label="Bits N Bobs home" className="self-start">
          <Image
            src="/images/logo.png"
            alt="Bits 'N' Bobs"
            width={170}
            height={52}
            className="h-[52px] w-auto block"
          />
        </Link>
        <div className="flex flex-col gap-4 max-w-[30em]">
          <h1 className="m-0 text-[40px] sm:text-[50px] leading-[1.04] font-extrabold font-stretch-112">
            Stock Bits N Bobs in your shop
          </h1>
          <p className="m-0 text-[18px] leading-[1.6] text-soft-on-dark">
            For convenience stores, corner shops, CTNs, post offices and
            independent retailers. Apply once, we approve your account, then you
            see wholesale prices.
          </p>
        </div>
        <ul className="m-0 p-0 list-none flex flex-col gap-3.5 text-[17px]">
          <li className="flex gap-3 items-center">
            <span
              aria-hidden="true"
              className="w-[26px] h-[26px] rounded-full bg-brand-yellow text-ink flex items-center justify-center font-black text-[14px]"
            >
              ✓
            </span>
            Wholesale prices on packs of 6
          </li>
          <li className="flex gap-3 items-center">
            <span
              aria-hidden="true"
              className="w-[26px] h-[26px] rounded-full bg-brand-yellow text-ink flex items-center justify-center font-black text-[14px]"
            >
              ✓
            </span>
            Fully stocked display stands
          </li>
          <li className="flex gap-3 items-center">
            <span
              aria-hidden="true"
              className="w-[26px] h-[26px] rounded-full bg-brand-yellow text-ink flex items-center justify-center font-black text-[14px]"
            >
              ✓
            </span>
            Free delivery on orders of £150 or more
          </li>
        </ul>
        <figure className="m-0 mt-auto rounded-2xl overflow-hidden leading-none shadow-2xl">
          <Image
            src="/images/stand.jpg"
            alt="A Bits N Bobs display stand full of hanging packs"
            width={1217}
            height={1292}
            style={{
              width: '100%',
              height: 'auto',
              aspectRatio: '1217 / 1292',
            }}
            className="block object-contain"
          />
        </figure>
      </aside>

      {/* Right: Tabbed Forms */}
      <main className="flex-1 basis-[520px] p-8 sm:p-14 box-border flex justify-center bg-white">
        <div className="w-full max-w-[520px] flex flex-col gap-7">
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
                      required
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
                    required
                    autoComplete="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="shop@retailer.co.uk"
                    className="h-12 border border-field-border rounded-[10px] px-3.5 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                  Password
                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="h-12 border border-field-border rounded-[10px] px-3.5 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy"
                  />
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
              <p className="text-[16px] text-text-2 leading-relaxed max-w-sm">
                Thank you for applying to become a stockist. We check every
                application and will email you at <strong>{email}</strong> as soon
                as your trade account is activated (typically within 24 hours).
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full justify-center">
                <Link
                  href="/shop"
                  className="h-12 px-6 rounded-xl bg-brand-navy text-white font-bold text-[15px] flex items-center justify-center no-underline hover:bg-[#231b64] transition-colors"
                >
                  Browse public shop
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setRegisterSubmitted(false);
                    setActiveTab('login');
                  }}
                  className="h-12 px-6 rounded-xl bg-surface text-ink font-bold text-[15px] border-0 cursor-pointer hover:bg-line transition-colors"
                >
                  Return to login
                </button>
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
                <label className="col-span-full flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                  Business name
                  <input
                    type="text"
                    required
                    placeholder="Station Road Convenience"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="h-12 border border-field-border rounded-[10px] px-3.5 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                  Contact name
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="h-12 border border-field-border rounded-[10px] px-3.5 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                  Telephone
                  <input
                    type="tel"
                    required
                    autoComplete="tel"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    className="h-12 border border-field-border rounded-[10px] px-3.5 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy"
                  />
                </label>
                <label className="col-span-full flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                  Email
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@yourshop.co.uk"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 border border-field-border rounded-[10px] px-3.5 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy"
                  />
                </label>
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
                <label className="col-span-full flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                  Trading address
                  <input
                    type="text"
                    required
                    autoComplete="street-address"
                    value={tradingAddress}
                    onChange={(e) => setTradingAddress(e.target.value)}
                    className="h-12 border border-field-border rounded-[10px] px-3.5 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                  Postcode
                  <input
                    type="text"
                    required
                    autoComplete="postal-code"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    className="h-12 border border-field-border rounded-[10px] px-3.5 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                  Symbol group (optional)
                  <input
                    type="text"
                    placeholder="Nisa, SPAR, independent"
                    value={symbolGroup}
                    onChange={(e) => setSymbolGroup(e.target.value)}
                    className="h-12 border border-field-border rounded-[10px] px-3.5 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy"
                  />
                </label>
                <label className="col-span-full flex gap-2.5 items-center text-[15px] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sameDelivery}
                    onChange={(e) => setSameDelivery(e.target.checked)}
                    className="w-5 h-5 accent-brand-navy rounded"
                  />
                  Delivery address is the same as trading address
                </label>
                {!sameDelivery && (
                  <label className="col-span-full flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                    Delivery address (if different)
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="h-12 border border-field-border rounded-[10px] px-3.5 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy"
                    />
                  </label>
                )}
                <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                  VAT number (if applicable)
                  <input
                    type="text"
                    value={vatNumber}
                    onChange={(e) => setVatNumber(e.target.value)}
                    className="h-12 border border-field-border rounded-[10px] px-3.5 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                  Company number (optional)
                  <input
                    type="text"
                    value={companyNumber}
                    onChange={(e) => setCompanyNumber(e.target.value)}
                    className="h-12 border border-field-border rounded-[10px] px-3.5 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy"
                  />
                </label>
                <label className="col-span-full flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                  Anything else we should know?
                  <textarea
                    placeholder="Number of stores, opening hours, products you are interested in"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[88px] border border-field-border rounded-[10px] p-3 font-sans font-normal text-[16px] text-ink bg-white outline-none resize-y focus:border-brand-navy"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                  Create a password
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="h-12 border border-field-border rounded-[10px] px-3.5 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                  Confirm password
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 border border-field-border rounded-[10px] px-3.5 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy"
                  />
                </label>
                <label className="col-span-full flex gap-2.5 items-start text-[15px] leading-snug cursor-pointer">
                  <input
                    type="checkbox"
                    checked={repVisit}
                    onChange={(e) => setRepVisit(e.target.checked)}
                    className="w-5 h-5 mt-0.5 accent-brand-navy rounded"
                  />
                  I would like a rep to visit about a display stand
                </label>
                <button
                  type="submit"
                  disabled={isRegistering}
                  className="col-span-full h-14 border-0 rounded-xl bg-brand-red hover:bg-[#c9000b] text-white font-sans font-extrabold text-[17px] cursor-pointer shadow-sm transition-colors mt-2 disabled:opacity-60"
                >
                  {isRegistering ? 'Submitting application...' : 'Apply to become a stockist'}
                </button>
              </form>

              {/* Stand Section under the form */}
              <div className="mt-8 pt-8 border-t border-line flex flex-col gap-6">
                <div className="rounded-[24px] overflow-hidden bg-navy-deep text-white shadow-md">
                  <figure className="m-0 w-full bg-[#2A2170] leading-none overflow-hidden">
                    <Image
                      src="/images/stand.jpg"
                      alt="Bits N Bobs display stand full of hanging packs in a shop aisle"
                      width={1217}
                      height={1292}
                      sizes="(max-width: 768px) 100vw, 520px"
                      style={{
                        width: '100%',
                        height: 'auto',
                        aspectRatio: '1217 / 1292',
                      }}
                      className="block w-full h-auto object-contain"
                    />
                  </figure>
                  <div className="p-6 sm:p-8 flex flex-col gap-5">
                    <div>
                      <p className="m-0 mb-1.5 text-[13px] font-bold text-brand-yellow uppercase tracking-wider">
                        Retail display stand
                      </p>
                      <h3 className="m-0 text-[24px] sm:text-[28px] font-extrabold font-stretch-110">
                        Make the most of your space
                      </h3>
                      <p className="mt-2 mb-0 text-[14px] sm:text-[15px] leading-[1.6] text-[#D6D4EE]">
                        A spare metre of wall becomes a steady stream of small sales. Order a fully stocked display stand, every pack pre-priced and bar-coded, and our rep comes back regularly to keep every hook full.
                      </p>
                    </div>

                    <ol className="m-0 p-0 list-none flex flex-col">
                      <li className="grid grid-cols-[40px_1fr] gap-3.5 py-3 border-t border-white/15">
                        <span className="text-[24px] sm:text-[26px] font-extrabold text-brand-yellow font-stretch-112">
                          01
                        </span>
                        <span>
                          <strong className="block text-[15px] sm:text-[16px] text-white">
                            Become a stockist
                          </strong>
                          <span className="text-[#D6D4EE] text-[13px] sm:text-[14px]">
                            Apply online. We approve your trade account.
                          </span>
                        </span>
                      </li>
                      <li className="grid grid-cols-[40px_1fr] gap-3.5 py-3 border-t border-white/15">
                        <span className="text-[24px] sm:text-[26px] font-extrabold text-brand-yellow font-stretch-112">
                          02
                        </span>
                        <span>
                          <strong className="block text-[15px] sm:text-[16px] text-white">
                            Order a fully stocked stand
                          </strong>
                          <span className="text-[#D6D4EE] text-[13px] sm:text-[14px]">
                            See every product and quantity on the stand before you buy.
                          </span>
                        </span>
                      </li>
                      <li className="grid grid-cols-[40px_1fr] gap-3.5 py-3 border-t border-b border-white/15">
                        <span className="text-[24px] sm:text-[26px] font-extrabold text-brand-yellow font-stretch-112">
                          03
                        </span>
                        <span>
                          <strong className="block text-[15px] sm:text-[16px] text-white">
                            Reorder packs of 6
                          </strong>
                          <span className="text-[#D6D4EE] text-[13px] sm:text-[14px]">
                            Free delivery on trade orders of £150 or more.
                          </span>
                        </span>
                      </li>
                    </ol>

                    <div className="p-3.5 rounded-xl bg-white/10 flex items-center gap-2.5 text-[14px] font-semibold text-brand-yellow">
                      <span className="text-base">🚚</span>
                      <span>Free delivery on trade orders of £150 or more</span>
                    </div>
                  </div>
                </div>
              </div>
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
