'use client';

import React, { useState } from 'react';
import { RetailerAccountProfile } from '@/lib/data/trade-account';
import { updateAccountDetailsAction } from '@/lib/actions/trade-account';

interface RetailerAccountDetailsViewProps {
  profile: RetailerAccountProfile | null;
}

export function RetailerAccountDetailsView({
  profile,
}: RetailerAccountDetailsViewProps) {
  const [contactName, setContactName] = useState(profile?.contactName || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword && newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await updateAccountDetailsAction({
        contactName,
        phone,
        email,
        newPassword: newPassword || undefined,
        confirmPassword: confirmPassword || undefined,
      });

      setIsLoading(false);

      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        setNewPassword('');
        setConfirmPassword('');
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
          Account details
        </h1>
        <p className="mt-1 mb-0 text-[15px] text-muted">
          Update your store contact person, telephone number, email and password.
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
            ✓ Account details have been successfully updated.
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-xl">
          {/* Read-only account badges */}
          <div className="p-4 rounded-xl bg-surface border border-line flex flex-wrap gap-4 justify-between items-center text-[14px]">
            <div>
              <span className="text-muted block text-[12px] uppercase font-bold tracking-wider">
                Business
              </span>
              <strong className="text-navy-deep text-[16px]">
                {profile?.businessName || 'Retailer Account'}
              </strong>
            </div>
            <div>
              <span className="text-muted block text-[12px] uppercase font-bold tracking-wider">
                Account Status
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-bold bg-[#DCFCE7] text-[#166534]">
                Approved
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="col-span-full sm:col-span-1 flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
              Contact name
              <input
                type="text"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="h-12 border border-field-border rounded-xl px-3.5 text-[15px] bg-white outline-none focus:border-brand-navy"
              />
            </label>

            <label className="col-span-full sm:col-span-1 flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
              Telephone
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-12 border border-field-border rounded-xl px-3.5 text-[15px] bg-white outline-none focus:border-brand-navy"
              />
            </label>

            <label className="col-span-full flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
              Email address
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 border border-field-border rounded-xl px-3.5 text-[15px] bg-white outline-none focus:border-brand-navy"
              />
            </label>
          </div>

          {/* Password update section */}
          <div className="pt-4 border-t border-line flex flex-col gap-4">
            <div>
              <h2 className="m-0 text-[18px] font-bold text-navy-deep">
                Change password
              </h2>
              <p className="mt-1 mb-0 text-[13px] text-muted">
                Leave blank if you do not want to change your password.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                New password
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="h-12 border border-field-border rounded-xl px-3.5 text-[15px] bg-white outline-none focus:border-brand-navy"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
                Confirm new password
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="h-12 border border-field-border rounded-xl px-3.5 text-[15px] bg-white outline-none focus:border-brand-navy"
                />
              </label>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="h-12 px-8 rounded-full bg-brand-navy hover:bg-[#251c68] text-white font-bold text-[15px] border-0 cursor-pointer shadow-sm transition-colors disabled:opacity-60"
            >
              {isLoading ? 'Saving changes...' : 'Save account details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

