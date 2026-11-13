import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { signOutAction } from '@/lib/actions/auth';
import { SITE_CONFIG } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Trade Account Pending Approval | Bits N Bobs',
  description: 'Your trade retailer application is currently under review by our team.',
};

export default async function TradePendingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let businessName = '';
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('business_name, status')
      .eq('id', user.id)
      .single();

    if (profile?.business_name) {
      businessName = profile.business_name;
    }
  }

  return (
    <div className="font-sans text-ink min-h-[calc(100vh-200px)] bg-surface flex flex-col">
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[640px] bg-white border border-line rounded-[24px] p-8 sm:p-12 shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-brand-yellow/30 text-ink font-bold text-lg">
              ⏳
            </span>
            <span className="inline-block text-[13px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-surface text-brand-navy">
              Application Under Review
            </span>
          </div>

          <div>
            <h1 className="m-0 text-[32px] sm:text-[38px] font-extrabold font-stretch-110 text-navy-deep leading-tight">
              {businessName ? `Thanks, ${businessName}` : 'Your application is being reviewed'}
            </h1>
            <p className="mt-3 mb-0 text-[17px] text-text-2 leading-relaxed">
              We check every retail application and verify business details before opening trade access.
              Applications are usually approved within <strong>24 hours</strong> (Monday to Friday).
            </p>
          </div>

          <div className="bg-surface rounded-2xl p-6 flex flex-col gap-3">
            <h2 className="m-0 text-[18px] font-extrabold text-navy-deep">
              What happens once approved?
            </h2>
            <ul className="m-0 p-0 list-none flex flex-col gap-2.5 text-[15px] text-text-2">
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-brand-yellow flex items-center justify-center text-[12px] font-black text-ink">
                  ✓
                </span>
                You will receive a confirmation email activating your trade login
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-brand-yellow flex items-center justify-center text-[12px] font-black text-ink">
                  ✓
                </span>
                Access wholesale pack prices on all hanging lines (packs of 6)
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-brand-yellow flex items-center justify-center text-[12px] font-black text-ink">
                  ✓
                </span>
                Order display stands delivered ready-to-sell
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-brand-yellow flex items-center justify-center text-[12px] font-black text-ink">
                  ✓
                </span>
                Free delivery on all trade orders of £150+
              </li>
            </ul>
          </div>

          <div className="border border-line rounded-xl p-4 text-[14px] text-muted flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>Need immediate assistance with an urgent order?</span>
            <a
              href={SITE_CONFIG.telLink}
              className="font-bold text-brand-navy hover:text-brand-red whitespace-nowrap"
            >
              Call {SITE_CONFIG.phone}
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/shop"
              className="flex-1 sm:flex-none flex items-center justify-center h-12 px-6 rounded-full bg-brand-navy hover:bg-[#231b64] text-white font-bold text-[15px] no-underline transition-colors"
            >
              Continue shopping
            </Link>
            <form action={signOutAction} className="flex-1 sm:flex-none">
              <button
                type="submit"
                className="w-full flex items-center justify-center h-12 px-6 rounded-full bg-surface hover:bg-line text-ink font-bold text-[15px] border-0 cursor-pointer transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
