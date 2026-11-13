'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { updatePasswordAction } from '@/lib/actions/auth';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const result = await updatePasswordAction({ password, confirmPassword });
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push('/trade?tab=login&reset=success');
      }, 1500);
    }
  };

  return (
    <div className="font-sans text-ink min-h-[calc(100vh-200px)] bg-surface flex flex-col">
      <main className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[480px] bg-white border border-line rounded-[24px] p-8 sm:p-10 shadow-sm flex flex-col gap-6">
          <div>
            <Link
              href="/trade?tab=login"
              className="inline-flex items-center text-[14px] font-bold text-brand-navy hover:text-brand-red no-underline mb-3"
            >
              ← Back to trade login
            </Link>
            <h1 className="m-0 text-[30px] font-extrabold font-stretch-108 text-navy-deep">
              Create new password
            </h1>
            <p className="mt-2 mb-0 text-[15px] text-muted">
              Enter a secure password for your Bits N Bobs trade account.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-danger text-[14px] font-medium">
              {error}
            </div>
          )}

          {success ? (
            <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-success text-[15px] font-bold text-center">
              ✓ Password updated successfully! Redirecting to login...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                New password
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="h-12 border border-field-border rounded-[10px] px-3.5 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                Confirm new password
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 border border-field-border rounded-[10px] px-3.5 font-sans font-normal text-[16px] text-ink bg-white outline-none focus:border-brand-navy"
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 h-14 border-0 rounded-xl bg-brand-red hover:bg-[#c9000b] text-white font-sans font-extrabold text-[17px] cursor-pointer shadow-sm transition-colors disabled:opacity-60"
              >
                {loading ? 'Updating password...' : 'Update password'}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

