'use client';

import React, { useState } from 'react';
import { useToast } from './ToastContext';
import {
  moderateReviewAction,
  saveSiteContentAction,
  saveHomepageVideoAction,
} from '@/lib/actions/admin';

interface ContentData {
  settings: {
    contactPhone: string;
    contactEmail: string;
    socialFacebook: string;
    socialInstagram: string;
    socialTiktok: string;
  };
  reviews: Array<{
    id: string;
    author: string;
    town: string;
    body: string;
    rating: number;
    is_approved: boolean;
  }>;
  videos: Array<{
    id: string;
    title: string;
    url: string;
    showOnHome: boolean;
    sortOrder: number;
  }>;
}

export function AdminContentClient({ initialData }: { initialData: ContentData }) {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'reviews' | 'videos' | 'contact'>('reviews');

  // Reviews state
  const [reviews, setReviews] = useState(initialData.reviews);

  // Contact details & Social links state
  const [contactPhone, setContactPhone] = useState(initialData.settings.contactPhone);
  const [contactEmail, setContactEmail] = useState(initialData.settings.contactEmail);
  const [socialFacebook, setSocialFacebook] = useState(initialData.settings.socialFacebook);
  const [socialInstagram, setSocialInstagram] = useState(initialData.settings.socialInstagram);
  const [socialTiktok, setSocialTiktok] = useState(initialData.settings.socialTiktok);
  const [isSavingContact, setIsSavingContact] = useState(false);

  // Videos state
  const [videos, setVideos] = useState(initialData.videos);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isAddingVideo, setIsAddingVideo] = useState(false);

  // Moderate Review handler
  const handleToggleReview = async (reviewId: string, currentApproved: boolean) => {
    const nextApproved = !currentApproved;
    const result = await moderateReviewAction(reviewId, nextApproved);
    if (result.success) {
      showToast('success', `Review is now ${nextApproved ? 'visible' : 'hidden'}`);
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, is_approved: nextApproved } : r))
      );
    } else {
      showToast('error', result.error || 'Failed to update review status');
    }
  };

  // Save Contact & Social details
  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingContact(true);
    const result = await saveSiteContentAction({
      contactPhone,
      contactEmail,
      socialFacebook,
      socialInstagram,
      socialTiktok,
    });
    setIsSavingContact(false);

    if (result.success) {
      showToast('success', 'Contact details and social links updated successfully');
    } else {
      showToast('error', result.error || 'Failed to update content');
    }
  };

  // Add Homepage Video
  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle || !videoUrl) return;

    setIsAddingVideo(true);
    const result = await saveHomepageVideoAction({
      title: videoTitle,
      url: videoUrl,
      showOnHome: true,
      sortOrder: videos.length,
    });
    setIsAddingVideo(false);

    if (result.success) {
      showToast('success', 'Added demo video to homepage carousel');
      setVideos((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          title: videoTitle,
          url: videoUrl,
          showOnHome: true,
          sortOrder: prev.length,
        },
      ]);
      setVideoTitle('');
      setVideoUrl('');
    } else {
      showToast('error', result.error || 'Failed to save video');
    }
  };

  return (
    <div className="p-5 sm:p-8 pb-16 flex flex-col gap-6 max-w-[1360px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="m-0 text-[30px] sm:text-[34px] font-extrabold font-stretch-110 text-navy-deep">
            Website content
          </h1>
          <p className="mt-1 mb-0 text-[14px] text-muted font-medium">
            Moderate customer testimonials, manage home video demos, and update contact information
          </p>
        </div>

        {/* Section Tabs */}
        <div className="flex bg-white border border-line rounded-xl p-1 text-[13px] font-bold shadow-xs">
          {(['reviews', 'videos', 'contact'] as const).map((tab) => {
            const label = tab === 'reviews' ? 'Reviews' : tab === 'videos' ? 'Video Demos' : 'Contact & Social';
            const isCurrent = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg border-0 cursor-pointer transition-all ${
                  isCurrent ? 'bg-navy-deep text-white shadow-xs' : 'bg-transparent text-muted hover:text-ink'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. Reviews Moderation */}
      {activeTab === 'reviews' && (
        <section className="bg-white border border-line rounded-[20px] p-6 shadow-xs flex flex-col gap-4">
          <div className="flex justify-between items-baseline border-b border-line pb-3">
            <h2 className="m-0 text-[18px] font-extrabold text-navy-deep">
              Customer reviews moderation
            </h2>
            <span className="text-[13px] text-muted font-bold">
              {reviews.length} total reviews
            </span>
          </div>

          <div className="divide-y divide-[#F1F2F6]">
            {reviews.map((r) => (
              <div key={r.id} className="py-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex-1 basis-[320px]">
                  <div className="flex items-center gap-2 mb-1">
                    <strong className="text-ink font-bold text-[15px]">{r.author}</strong>
                    <span className="text-muted text-[13px]">({r.town})</span>
                    <span className="text-amber-500 font-bold text-[13px]">
                      {'★'.repeat(r.rating)}
                    </span>
                  </div>
                  <p className="m-0 text-[14px] text-text-2 leading-relaxed">
                    &quot;{r.body}&quot;
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-[12px] font-bold px-2.5 py-1 rounded-md ${
                      r.is_approved ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {r.is_approved ? 'Visible on site' : 'Hidden'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleReview(r.id, r.is_approved)}
                    className="px-3.5 py-1.5 rounded-lg border border-line bg-surface hover:bg-line text-ink font-bold text-[13px] cursor-pointer"
                  >
                    {r.is_approved ? 'Hide' : 'Approve'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2. Homepage Video Demos */}
      {activeTab === 'videos' && (
        <section className="bg-white border border-line rounded-[20px] p-6 sm:p-8 shadow-xs flex flex-col gap-6">
          <div>
            <h2 className="m-0 text-[18px] font-extrabold text-navy-deep">
              Homepage video demos
            </h2>
            <p className="mt-1 mb-0 text-[13px] text-muted">
              Displayed in the &quot;See them in action&quot; 30-second product demo carousel
            </p>
          </div>

          {/* Add New Video Form */}
          <form onSubmit={handleAddVideo} className="bg-surface rounded-xl p-5 flex flex-wrap items-end gap-3">
            <label className="flex-1 basis-[220px] flex flex-col gap-1 text-[13px] font-semibold text-ink">
              Video Title
              <input
                type="text"
                required
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="e.g. Nit comb in 30 seconds"
                className="h-10 px-3 rounded-lg border border-field-border bg-white text-[13px] outline-none"
              />
            </label>

            <label className="flex-1 basis-[260px] flex flex-col gap-1 text-[13px] font-semibold text-ink">
              Video URL / Embed Link
              <input
                type="text"
                required
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://... or #demo-slug"
                className="h-10 px-3 rounded-lg border border-field-border bg-white text-[13px] outline-none"
              />
            </label>

            <button
              type="submit"
              disabled={isAddingVideo}
              className="h-10 px-5 rounded-lg bg-brand-navy hover:bg-[#251c68] text-white font-bold text-[13px] border-0 cursor-pointer shadow-xs disabled:opacity-60"
            >
              {isAddingVideo ? 'Adding...' : 'Add demo'}
            </button>
          </form>

          {/* Videos List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {videos.map((vid, idx) => (
              <div
                key={vid.id}
                className="border border-line rounded-xl p-4 bg-surface/30 flex flex-col justify-between gap-3"
              >
                <div>
                  <span className="text-[11px] font-bold text-muted uppercase">Slide #{idx + 1}</span>
                  <strong className="block text-navy-deep text-[15px] font-bold mt-0.5">
                    {vid.title}
                  </strong>
                  <span className="text-[12px] text-muted truncate block font-mono mt-1">
                    {vid.url}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[12px]">
                  <span className="font-bold text-emerald-700">✓ On homepage</span>
                  <span className="text-muted">Order: {vid.sortOrder}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Contact & Social Details */}
      {activeTab === 'contact' && (
        <form onSubmit={handleSaveContact} className="bg-white border border-line rounded-[20px] p-6 sm:p-8 shadow-xs flex flex-col gap-6 max-w-2xl">
          <div>
            <h2 className="m-0 text-[18px] font-extrabold text-navy-deep">
              Company contact details & social channels
            </h2>
            <p className="mt-1 mb-0 text-[13px] text-muted">
              Displayed on public and trade headers, contact footers, and invoices
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
              Customer Support Telephone
              <input
                type="tel"
                required
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="h-11 px-3.5 rounded-xl border border-field-border text-[14px] outline-none focus:border-brand-navy"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
              Sales Enquiry Email
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="h-11 px-3.5 rounded-xl border border-field-border text-[14px] outline-none focus:border-brand-navy"
              />
            </label>

            <label className="col-span-full flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
              Facebook URL
              <input
                type="text"
                value={socialFacebook}
                onChange={(e) => setSocialFacebook(e.target.value)}
                className="h-11 px-3.5 rounded-xl border border-field-border text-[14px] outline-none focus:border-brand-navy"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
              Instagram Link / Handle
              <input
                type="text"
                value={socialInstagram}
                onChange={(e) => setSocialInstagram(e.target.value)}
                className="h-11 px-3.5 rounded-xl border border-field-border text-[14px] outline-none focus:border-brand-navy"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-[14px] font-semibold text-ink">
              TikTok Link / Handle
              <input
                type="text"
                value={socialTiktok}
                onChange={(e) => setSocialTiktok(e.target.value)}
                className="h-11 px-3.5 rounded-xl border border-field-border text-[14px] outline-none focus:border-brand-navy"
              />
            </label>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSavingContact}
              className="h-11 px-6 rounded-xl bg-brand-red hover:bg-[#c9000b] text-white font-bold text-[14px] border-0 cursor-pointer shadow-xs disabled:opacity-60"
            >
              {isSavingContact ? 'Saving...' : 'Save contact details'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

