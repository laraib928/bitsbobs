'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from './ToastContext';
import { updateTradeAccountStatusAction } from '@/lib/actions/admin';
import type { PendingTradeAccount, TradeAccountsCounts } from '@/lib/data/admin';
import type { Database } from '@/lib/supabase/database.types';

type AccountStatus = Database['public']['Enums']['account_status'];

interface AdminTradeAccountsClientProps {
  initialAccounts: PendingTradeAccount[];
  counts: TradeAccountsCounts;
  currentTab: AccountStatus;
  initialSearch?: string;
}

export function AdminTradeAccountsClient({
  initialAccounts,
  counts,
  currentTab,
  initialSearch = '',
}: AdminTradeAccountsClientProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<AccountStatus>(currentTab);
  const [search, setSearch] = useState(initialSearch);
  const [accounts, setAccounts] = useState<PendingTradeAccount[]>(initialAccounts);
  const [selectedAccount, setSelectedAccount] = useState<PendingTradeAccount | null>(null);

  // Sync state if initial props change
  useEffect(() => {
    setAccounts(initialAccounts);
    setActiveTab(currentTab);
  }, [initialAccounts, currentTab]);

  // Confirm Modal state for Reject / Suspend
  const [confirmAction, setConfirmAction] = useState<{
    account: PendingTradeAccount;
    action: 'reject' | 'suspend';
  } | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredAccounts = accounts.filter((acc) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase().trim();
    return (
      acc.businessName.toLowerCase().includes(s) ||
      acc.contactName.toLowerCase().includes(s) ||
      acc.email.toLowerCase().includes(s) ||
      acc.postcode.toLowerCase().includes(s)
    );
  });

  const handleTabChange = (tab: AccountStatus) => {
    setActiveTab(tab);
    const params = new URLSearchParams();
    params.set('tab', tab);
    if (search) params.set('search', search);
    router.push(`/admin/trade-accounts?${params.toString()}`);
  };

  const handleApprove = async (account: PendingTradeAccount) => {
    setIsProcessing(true);
    const result = await updateTradeAccountStatusAction(account.id, 'approved');
    setIsProcessing(false);

    if (result.success) {
      showToast('success', `Approved trade account for ${account.businessName}`);
      setAccounts((prev) => prev.filter((a) => a.id !== account.id));
      if (selectedAccount?.id === account.id) {
        setSelectedAccount(null);
      }
      router.refresh();
    } else {
      showToast('error', result.error || 'Failed to approve account');
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    const newStatus: AccountStatus = confirmAction.action === 'reject' ? 'rejected' : 'suspended';

    setIsProcessing(true);
    const result = await updateTradeAccountStatusAction(
      confirmAction.account.id,
      newStatus,
      actionReason.trim() || undefined
    );
    setIsProcessing(false);

    if (result.success) {
      showToast(
        'success',
        `${confirmAction.action === 'reject' ? 'Rejected' : 'Suspended'} ${confirmAction.account.businessName}`
      );
      setAccounts((prev) => prev.filter((a) => a.id !== confirmAction.account.id));
      setConfirmAction(null);
      setActionReason('');
      if (selectedAccount?.id === confirmAction.account.id) {
        setSelectedAccount(null);
      }
      router.refresh();
    } else {
      showToast('error', result.error || 'Action failed');
    }
  };

  const TABS: Array<{ id: AccountStatus; label: string }> = [
    { id: 'pending', label: 'Pending' },
    { id: 'approved', label: 'Approved' },
    { id: 'rejected', label: 'Rejected' },
    { id: 'suspended', label: 'Suspended' },
  ];

  return (
    <div className="p-5 sm:p-8 pb-16 flex flex-col gap-6 max-w-[1360px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="m-0 text-[30px] sm:text-[34px] font-extrabold font-stretch-110 text-navy-deep">
            Trade accounts
          </h1>
          <p className="mt-1 mb-0 text-[14px] text-muted font-medium">
            Review retailer applications, verify store trading addresses and manage trade status
          </p>
        </div>

        <div className="text-[13px] text-muted font-bold">
          {filteredAccounts.length} {filteredAccounts.length === 1 ? 'account' : 'accounts'}
        </div>
      </div>

      {/* Tabs and Search Bar */}
      <div className="bg-white border border-line rounded-[20px] p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex bg-surface rounded-xl p-1 text-[13px] font-bold">
          {TABS.map((t) => {
            const isCurrent = activeTab === t.id;
            const count = counts[t.id];
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleTabChange(t.id)}
                className={`px-3.5 py-1.5 rounded-[9px] border-0 cursor-pointer capitalize transition-all inline-flex items-center gap-2 ${
                  isCurrent
                    ? 'bg-white text-navy-deep shadow-xs font-extrabold'
                    : 'bg-transparent text-muted hover:text-ink font-semibold'
                }`}
              >
                <span>{t.label}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
                    isCurrent
                      ? 'bg-brand-navy/10 text-brand-navy'
                      : 'bg-black/5 text-muted'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="w-full sm:w-80 relative">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search business, contact, email, postcode..."
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-field-border text-[13px] text-ink outline-none focus:border-brand-navy"
          />
          <svg
            className="w-4 h-4 text-muted absolute left-3 top-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" strokeWidth="2" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" />
          </svg>
        </div>
      </div>

      {/* Accounts List Table Card */}
      <div className="bg-white border border-line rounded-[20px] shadow-xs overflow-hidden">
        {filteredAccounts.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            {search.trim() ? (
              <>
                <span className="text-3xl">🔍</span>
                <strong className="text-[17px] text-navy-deep">
                  No accounts match &ldquo;{search}&rdquo;
                </strong>
                <p className="m-0 text-[14px] text-muted max-w-sm">
                  Check the spelling or try searching by business name, contact, email or postcode.
                </p>
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="mt-2 px-4 py-2 rounded-xl bg-surface hover:bg-line text-ink font-bold text-[13px] border-0 cursor-pointer"
                >
                  Clear search
                </button>
              </>
            ) : (
              <>
                <span className="text-3xl">🏪</span>
                <strong className="text-[17px] text-navy-deep">
                  {activeTab === 'pending'
                    ? 'No pending applications'
                    : activeTab === 'approved'
                    ? 'No approved trade accounts'
                    : activeTab === 'rejected'
                    ? 'No rejected applications'
                    : 'No suspended trade accounts'}
                </strong>
                <p className="m-0 text-[14px] text-muted max-w-sm">
                  {activeTab === 'pending'
                    ? 'All retailer applications have been reviewed. New stockist applications will appear here.'
                    : activeTab === 'approved'
                    ? 'There are currently no active approved trade accounts in the system.'
                    : activeTab === 'rejected'
                    ? 'No trade applications have been rejected.'
                    : 'No trade accounts are currently suspended.'}
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[14px]">
              <thead>
                <tr className="border-b border-line bg-surface/50 text-left text-muted font-bold text-[13px]">
                  <th scope="col" className="p-4 pl-6">Business</th>
                  <th scope="col" className="p-4">Contact</th>
                  <th scope="col" className="p-4">Trading address & postcode</th>
                  <th scope="col" className="p-4">Type</th>
                  <th scope="col" className="p-4">Applied date</th>
                  <th scope="col" className="p-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F2F6]">
                {filteredAccounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-surface/50 transition-colors">
                    <td className="p-4 pl-6">
                      <strong className="block text-navy-deep font-bold text-[15px]">
                        {acc.businessName}
                      </strong>
                      <a
                        href={`mailto:${acc.email}`}
                        className="text-[12px] text-muted hover:text-brand-navy hover:underline"
                      >
                        {acc.email}
                      </a>
                    </td>
                    <td className="p-4 text-ink font-semibold">
                      {acc.contactName}
                      <span className="block text-[12px] text-muted">{acc.phone}</span>
                    </td>
                    <td className="p-4 text-text-2">
                      <strong className="block text-ink">{acc.postcode || '—'}</strong>
                      <span className="text-[12px] text-muted truncate max-w-[220px] block">
                        {acc.tradingAddress || '—'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-[12px] font-semibold bg-surface px-2.5 py-1 rounded-md text-navy-deep">
                        {acc.businessType || 'Retailer'}
                      </span>
                    </td>
                    <td className="p-4 text-muted text-[13px] whitespace-nowrap">
                      {new Date(acc.createdAt).toLocaleDateString('en-GB')}
                    </td>
                    <td className="p-4 pr-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedAccount(acc)}
                          className="px-3 py-1.5 rounded-lg border border-line bg-white hover:bg-surface text-ink font-bold text-[12px] cursor-pointer"
                        >
                          View
                        </button>

                        {activeTab === 'pending' && (
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleApprove(acc)}
                            className="px-3 py-1.5 rounded-lg bg-brand-navy hover:bg-[#251c68] text-white font-bold text-[12px] border-0 cursor-pointer disabled:opacity-50"
                          >
                            Approve
                          </button>
                        )}

                        {(activeTab === 'rejected' || activeTab === 'suspended') && (
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleApprove(acc)}
                            className="px-3 py-1.5 rounded-lg bg-brand-navy hover:bg-[#251c68] text-white font-bold text-[12px] border-0 cursor-pointer disabled:opacity-50"
                          >
                            {activeTab === 'suspended' ? 'Reactivate' : 'Approve'}
                          </button>
                        )}

                        {activeTab !== 'rejected' && (
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => setConfirmAction({ account: acc, action: 'reject' })}
                            className="px-2.5 py-1.5 rounded-lg text-danger hover:bg-red-50 font-semibold text-[12px] border-0 bg-transparent cursor-pointer disabled:opacity-50"
                          >
                            Reject
                          </button>
                        )}

                        {activeTab === 'approved' && (
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => setConfirmAction({ account: acc, action: 'suspend' })}
                            className="px-2.5 py-1.5 rounded-lg text-amber-800 hover:bg-amber-50 font-semibold text-[12px] border-0 bg-transparent cursor-pointer disabled:opacity-50"
                          >
                            Suspend
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Full Application Details Drawer/Modal */}
      {selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-[24px] max-w-xl w-full p-6 sm:p-8 shadow-2xl flex flex-col gap-6 border border-line max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start border-b border-line pb-4">
              <div>
                <h3 className="m-0 text-[22px] font-extrabold text-navy-deep">
                  {selectedAccount.businessName}
                </h3>
                <span className="text-[13px] text-muted">
                  Application submitted {new Date(selectedAccount.createdAt).toLocaleString('en-GB')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAccount(null)}
                className="p-1.5 rounded-lg text-muted hover:text-ink border-0 bg-transparent cursor-pointer text-lg"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[14px]">
              <div>
                <span className="text-muted text-[12px] font-bold block uppercase">Contact Person</span>
                <strong className="text-ink">{selectedAccount.contactName}</strong>
              </div>
              <div>
                <span className="text-muted text-[12px] font-bold block uppercase">Business Type</span>
                <strong className="text-ink">{selectedAccount.businessType || 'Retailer'}</strong>
              </div>
              <div>
                <span className="text-muted text-[12px] font-bold block uppercase">Email</span>
                <a href={`mailto:${selectedAccount.email}`} className="text-brand-navy hover:underline">
                  {selectedAccount.email}
                </a>
              </div>
              <div>
                <span className="text-muted text-[12px] font-bold block uppercase">Telephone</span>
                <a href={`tel:${selectedAccount.phone}`} className="text-ink font-semibold">
                  {selectedAccount.phone || '—'}
                </a>
              </div>
              <div className="sm:col-span-2">
                <span className="text-muted text-[12px] font-bold block uppercase">Trading Address</span>
                <p className="m-0 text-text-2 font-medium">
                  {selectedAccount.tradingAddress}
                  {selectedAccount.postcode ? `, ${selectedAccount.postcode}` : ''}
                </p>
              </div>
              {selectedAccount.deliveryAddress && (
                <div className="sm:col-span-2">
                  <span className="text-muted text-[12px] font-bold block uppercase">Delivery Address</span>
                  <p className="m-0 text-text-2 font-medium">{selectedAccount.deliveryAddress}</p>
                </div>
              )}
              {selectedAccount.symbolGroup && (
                <div>
                  <span className="text-muted text-[12px] font-bold block uppercase">Symbol Group</span>
                  <span className="text-ink font-semibold">{selectedAccount.symbolGroup}</span>
                </div>
              )}
              {selectedAccount.vatNumber && (
                <div>
                  <span className="text-muted text-[12px] font-bold block uppercase">VAT Number</span>
                  <span className="text-ink font-semibold">{selectedAccount.vatNumber}</span>
                </div>
              )}
              {selectedAccount.companyNumber && (
                <div>
                  <span className="text-muted text-[12px] font-bold block uppercase">Company Number</span>
                  <span className="text-ink font-semibold">{selectedAccount.companyNumber}</span>
                </div>
              )}
              {selectedAccount.approvedAt && (
                <div className="sm:col-span-2">
                  <span className="text-muted text-[12px] font-bold block uppercase">Approved Date</span>
                  <span className="text-ink font-medium">
                    {new Date(selectedAccount.approvedAt).toLocaleString('en-GB')}
                  </span>
                </div>
              )}
              {selectedAccount.notes && (
                <div className="sm:col-span-2 bg-surface rounded-xl p-4">
                  <span className="text-muted text-[12px] font-bold block uppercase mb-1">
                    Applicant Notes & Special Instructions
                  </span>
                  <p className="m-0 text-[13px] text-text-2 whitespace-pre-line">
                    {selectedAccount.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="border-t border-line pt-4 flex flex-wrap justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedAccount(null)}
                className="px-4 py-2.5 rounded-xl bg-surface hover:bg-line text-ink font-bold text-[13px] border-0 cursor-pointer"
              >
                Close
              </button>

              {activeTab === 'pending' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmAction({ account: selectedAccount, action: 'reject' });
                    }}
                    className="px-4 py-2.5 rounded-xl text-danger hover:bg-red-50 font-bold text-[13px] border border-red-200 cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleApprove(selectedAccount)}
                    className="px-5 py-2.5 rounded-xl bg-brand-navy hover:bg-[#251c68] text-white font-bold text-[13px] border-0 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    Approve account
                  </button>
                </>
              )}

              {activeTab === 'approved' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmAction({ account: selectedAccount, action: 'suspend' });
                    }}
                    className="px-4 py-2.5 rounded-xl text-amber-800 hover:bg-amber-50 font-bold text-[13px] border border-amber-200 cursor-pointer"
                  >
                    Suspend account
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmAction({ account: selectedAccount, action: 'reject' });
                    }}
                    className="px-4 py-2.5 rounded-xl text-danger hover:bg-red-50 font-bold text-[13px] border border-red-200 cursor-pointer"
                  >
                    Revoke & Reject
                  </button>
                </>
              )}

              {(activeTab === 'rejected' || activeTab === 'suspended') && (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleApprove(selectedAccount)}
                  className="px-5 py-2.5 rounded-xl bg-brand-navy hover:bg-[#251c68] text-white font-bold text-[13px] border-0 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {activeTab === 'suspended' ? 'Reactivate account' : 'Reconsider & Approve'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Reject / Suspend */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 border border-line animate-in zoom-in-95 duration-200">
            <h3 className="m-0 text-[20px] font-extrabold text-navy-deep capitalize">
              {confirmAction.action} {confirmAction.account.businessName}?
            </h3>
            <p className="m-0 text-[14px] text-muted">
              {confirmAction.action === 'reject'
                ? 'This will reject the retailer application and revoke trade store access.'
                : 'This will temporarily suspend this trade account from placing orders.'}
            </p>

            <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-ink">
              Reason / internal note (optional)
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="e.g. Could not verify business address on Companies House"
                className="h-20 p-3 rounded-xl border border-field-border text-[13px] text-ink outline-none resize-none"
              />
            </label>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="flex-1 h-11 rounded-xl bg-surface hover:bg-line text-ink font-bold text-[13px] border-0 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmAction}
                className="flex-1 h-11 rounded-xl bg-brand-red hover:bg-[#c9000b] text-white font-bold text-[13px] border-0 cursor-pointer disabled:opacity-60 capitalize"
              >
                {isProcessing ? 'Processing...' : `Confirm ${confirmAction.action}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
