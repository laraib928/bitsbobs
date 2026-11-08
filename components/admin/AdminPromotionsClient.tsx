'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from './ToastContext';
import { savePromotionAction, togglePromotionActiveAction } from '@/lib/actions/admin';
import type { Database } from '@/lib/supabase/database.types';

type PromoAudience = Database['public']['Enums']['promo_audience'];

interface PromoItem {
  id: string;
  title: string;
  description: string;
  audience: PromoAudience;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
}

interface AdminPromotionsClientProps {
  initialPromotions: PromoItem[];
}

export function AdminPromotionsClient({ initialPromotions }: AdminPromotionsClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [promotions, setPromotions] = useState<PromoItem[]>(initialPromotions);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoItem | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [audience, setAudience] = useState<PromoAudience>('both');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString().slice(0, 10)
  );
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const openNewModal = () => {
    setEditingPromo(null);
    setTitle('');
    setDescription('');
    setAudience('both');
    setStartDate(new Date().toISOString().slice(0, 10));
    setEndDate(new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString().slice(0, 10));
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (promo: PromoItem) => {
    setEditingPromo(promo);
    setTitle(promo.title);
    setDescription(promo.description);
    setAudience(promo.audience);
    setStartDate(promo.starts_at.slice(0, 10));
    setEndDate(promo.ends_at.slice(0, 10));
    setIsActive(promo.is_active);
    setModalOpen(true);
  };

  const handleToggleActive = async (promo: PromoItem) => {
    const nextState = !promo.is_active;
    const result = await togglePromotionActiveAction(promo.id, nextState);
    if (result.success) {
      showToast('success', `${promo.title} is now ${nextState ? 'active' : 'inactive'}`);
      setPromotions((prev) =>
        prev.map((p) => (p.id === promo.id ? { ...p, is_active: nextState } : p))
      );
    } else {
      showToast('error', result.error || 'Failed to toggle status');
    }
  };

  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      id: editingPromo?.id,
      title,
      description,
      audience,
      starts_at: new Date(startDate).toISOString(),
      ends_at: new Date(endDate).toISOString(),
      is_active: isActive,
    };

    const result = await savePromotionAction(payload);
    setIsSaving(false);

    if (result.success) {
      showToast('success', `Promotion ${editingPromo ? 'updated' : 'created'} successfully`);
      setModalOpen(false);
      router.refresh();
    } else {
      showToast('error', result.error || 'Failed to save promotion');
    }
  };

  return (
    <div className="p-5 sm:p-8 pb-16 flex flex-col gap-6 max-w-[1360px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="m-0 text-[30px] sm:text-[34px] font-extrabold font-stretch-110 text-navy-deep">
            Promotions & banners
          </h1>
          <p className="mt-1 mb-0 text-[14px] text-muted font-medium">
            Manage discount campaigns, free carriage thresholds, and trade special offers
          </p>
        </div>

        <button
          type="button"
          onClick={openNewModal}
          className="inline-flex items-center gap-1.5 h-11 px-4 rounded-xl bg-brand-red hover:bg-[#c9000b] text-white font-bold text-[14px] border-0 cursor-pointer shadow-xs transition-colors"
        >
          <span className="text-lg leading-none">+</span>
          <span>Create promotion</span>
        </button>
      </div>

      {/* Promotions Table Card */}
      <div className="bg-white border border-line rounded-[20px] shadow-xs overflow-hidden">
        {promotions.length === 0 ? (
          <div className="p-12 text-center text-muted">
            No promotions active yet. Click &quot;Create promotion&quot; to add one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[14px]">
              <thead>
                <tr className="border-b border-line bg-surface/50 text-left text-muted font-bold text-[13px]">
                  <th scope="col" className="p-4 pl-6">Campaign</th>
                  <th scope="col" className="p-4">Audience</th>
                  <th scope="col" className="p-4">Active Period</th>
                  <th scope="col" className="p-4 text-center">Status</th>
                  <th scope="col" className="p-4 text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F2F6]">
                {promotions.map((p) => (
                  <tr key={p.id} className="hover:bg-surface/50 transition-colors">
                    <td className="p-4 pl-6 max-w-md">
                      <strong className="block text-navy-deep font-bold text-[15px]">
                        {p.title}
                      </strong>
                      <span className="text-[13px] text-muted line-clamp-1">{p.description}</span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          p.audience === 'trade'
                            ? 'bg-[#E8E6F7] text-[#312682]'
                            : p.audience === 'public'
                            ? 'bg-[#FDE6E8] text-[#9E0010]'
                            : 'bg-emerald-50 text-emerald-800'
                        }`}
                      >
                        {p.audience}
                      </span>
                    </td>
                    <td className="p-4 text-[13px] text-text-2 whitespace-nowrap">
                      {new Date(p.starts_at).toLocaleDateString('en-GB')} –{' '}
                      {new Date(p.ends_at).toLocaleDateString('en-GB')}
                    </td>
                    <td className="p-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(p)}
                        className={`px-3 py-1 rounded-full text-[12px] font-bold border-0 cursor-pointer transition-colors ${
                          p.is_active
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                      >
                        {p.is_active ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="p-4 pr-6 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openEditModal(p)}
                        className="px-3 py-1.5 rounded-lg border border-line bg-white hover:bg-surface text-ink font-bold text-[12px] cursor-pointer"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-6 sm:p-8 shadow-2xl flex flex-col gap-5 border border-line animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start border-b border-line pb-3">
              <h3 className="m-0 text-[20px] font-extrabold text-navy-deep">
                {editingPromo ? 'Edit Promotion' : 'New Promotion Campaign'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-muted hover:text-ink border-0 bg-transparent cursor-pointer text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePromo} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-ink">
                Title / Headline
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Free delivery on orders over £150"
                  className="h-11 px-3.5 rounded-xl border border-field-border text-[14px] text-ink outline-none focus:border-brand-navy"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-ink">
                Offer Details
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain the promotion terms"
                  className="h-20 p-3 rounded-xl border border-field-border text-[14px] text-ink outline-none resize-none focus:border-brand-navy"
                />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-ink">
                  Target Audience
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value as PromoAudience)}
                    className="h-11 px-3 rounded-xl border border-field-border text-[13px] font-bold text-navy-deep bg-white outline-none"
                  >
                    <option value="both">Both (All)</option>
                    <option value="trade">Trade only</option>
                    <option value="public">Public only</option>
                  </select>
                </label>

                <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-ink">
                  Start Date
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-11 px-3 rounded-xl border border-field-border text-[13px] text-ink outline-none"
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-ink">
                  End Date
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-11 px-3 rounded-xl border border-field-border text-[13px] text-ink outline-none"
                  />
                </label>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 accent-brand-navy rounded"
                />
                <span className="text-[14px] font-semibold text-ink">
                  Promotion is active immediately
                </span>
              </label>

              <div className="border-t border-line pt-4 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 h-11 rounded-xl bg-surface hover:bg-line text-ink font-bold text-[13px] border-0 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 h-11 rounded-xl bg-brand-red hover:bg-[#c9000b] text-white font-bold text-[13px] border-0 cursor-pointer shadow-xs disabled:opacity-60"
                >
                  {isSaving ? 'Saving...' : 'Save promotion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

