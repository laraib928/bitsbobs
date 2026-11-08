'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Product, Category } from '@/lib/data/types';
import { calculateTradeProfit } from '@/lib/money';
import { FormField } from './FormField';
import { useToast } from './ToastContext';
import { saveProductAction } from '@/app/(admin)/admin/products/actions';

interface ProductEditViewProps {
  product?: Product;
  categories?: Category[];
  isNew?: boolean;
}

export function ProductEditView({
  product,
  categories = [],
  isNew = false,
}: ProductEditViewProps) {
  const router = useRouter();
  const { showToast } = useToast();

  // Category options
  const categoryOptions = (
    categories.length > 0
      ? categories
      : [
          { id: 'cosmetics', name: 'Cosmetics', slug: 'cosmetics' },
          { id: 'diy', name: 'DIY', slug: 'diy' },
          { id: 'household', name: 'Household', slug: 'household' },
          { id: 'kitchenware', name: 'Kitchenware', slug: 'kitchenware' },
          { id: 'party', name: 'Party', slug: 'party' },
        ]
  ).map((c) => ({
    value: c.id,
    label: c.name,
  }));

  // Initial values:
  // If isNew, ALL text/photo fields are empty.
  // Sensible defaults: unitsPerPack=6, minPacks=1, minQty=1, visibleToPublic=true, visibleToTrade=true, lowStockAt=10.
  const [name, setName] = useState(product?.name || '');
  const [category, setCategory] = useState(
    product?.categoryId || categoryOptions[0]?.value || 'cosmetics'
  );
  const [code, setCode] = useState(product?.code || '');
  const [barcode, setBarcode] = useState(product?.barcode || '');
  const [description, setDescription] = useState(product?.description || '');
  const [featuresText, setFeaturesText] = useState(
    product?.features?.join('\n') || ''
  );
  const [videoUrl, setVideoUrl] = useState(product?.videoUrl || '');
  const [pageTitle, setPageTitle] = useState(
    product?.seoTitle || (product?.name ? `${product.name} | Bits N Bobs` : '')
  );
  const [webAddress, setWebAddress] = useState(
    product?.slug ? `bitsnbobs.co/products/${product.slug}` : ''
  );
  const [metaDesc, setMetaDesc] = useState(product?.seoDescription || '');
  const [isSlugCustomized, setIsSlugCustomized] = useState(Boolean(product?.slug));

  // Photos
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Public shop settings
  const [visibleToPublic, setVisibleToPublic] = useState(
    product ? product.visibleToPublic : true
  );
  const [rrpString, setRrpString] = useState(
    product && typeof product.retailPricePence === 'number'
      ? (product.retailPricePence / 100).toFixed(2)
      : ''
  );
  const [minQty, setMinQty] = useState(1);

  // Trade shop settings
  const [visibleToTrade, setVisibleToTrade] = useState(
    product ? product.visibleToTrade : true
  );
  const [unitsPerPack, setUnitsPerPack] = useState(product?.unitsPerPack || 6);
  const [minPacks, setMinPacks] = useState(product?.minPacks || 1);
  const [wholesaleString, setWholesaleString] = useState(
    product && typeof product.wholesalePackPricePence === 'number'
      ? (product.wholesalePackPricePence / 100).toFixed(2)
      : ''
  );

  // Stock
  const [stockPacks, setStockPacks] = useState(product?.stockPacks ?? 0);
  const [lowStockAt, setLowStockAt] = useState(product?.lowStockAt ?? 10);

  // Promotion
  const [bestSeller, setBestSeller] = useState(
    product?.flags?.bestSeller ?? false
  );
  const [newArrival, setNewArrival] = useState(
    product?.flags?.newArrival ?? false
  );
  const [specialOffer, setSpecialOffer] = useState(
    product?.flags?.specialOffer ?? false
  );
  const [offerPrice, setOfferPrice] = useState(
    product?.offerPricePence
      ? (product.offerPricePence / 100).toFixed(2)
      : ''
  );

  // Saving & validation state
  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [savedSlug, setSavedSlug] = useState<string | null>(
    product?.slug || null
  );

  // Profit calculation
  const rrpPence = Math.round((parseFloat(rrpString) || 0) * 100);
  const wholesalePence = Math.round((parseFloat(wholesaleString) || 0) * 100);
  const profit =
    wholesalePence > 0 && rrpPence > 0
      ? calculateTradeProfit(rrpPence, unitsPerPack, wholesalePence)
      : null;

  // Auto-generate web address slug and page title from name if not customized
  const handleNameChange = (newName: string) => {
    setName(newName);
    if (!isSlugCustomized) {
      const autoSlug = newName
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setWebAddress(autoSlug ? `bitsnbobs.co/products/${autoSlug}` : '');
      if (!pageTitle || pageTitle === `${name} | Bits N Bobs`) {
        setPageTitle(newName ? `${newName} | Bits N Bobs` : '');
      }
    }
  };

  // Photo upload handling
  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);

    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
    const validMimes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif',
      'image/svg+xml',
    ];

    const validFiles: File[] = [];
    for (const file of files) {
      if (file.size > MAX_SIZE) {
        showToast(
          'error',
          `"${file.name}" exceeds the 5MB file size limit (${(
            file.size /
            (1024 * 1024)
          ).toFixed(1)}MB)`
        );
        continue;
      }
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const isImageExt = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'svg'].includes(ext);
      if (!validMimes.includes(file.type.toLowerCase()) && !isImageExt) {
        showToast(
          'error',
          `"${file.name}" is not an accepted image format (JPG, PNG, WebP).`
        );
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setIsUploading(true);
    let successCount = 0;

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      setUploadProgress(`Uploading ${i + 1} of ${validFiles.length}...`);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/admin/upload-image', {
          method: 'POST',
          body: formData,
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          showToast(
            'error',
            `Upload error for "${file.name}": ${json.error || 'Server error'}`
          );
        } else {
          setImages((prev) => [...prev, json.url]);
          successCount++;
        }
      } catch (err: any) {
        showToast(
          'error',
          `Network error uploading "${file.name}": ${err?.message || 'Upload failed'}`
        );
      }
    }

    setIsUploading(false);
    setUploadProgress(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (successCount > 0) {
      showToast(
        'success',
        successCount === 1
          ? 'Photo uploaded successfully'
          : `${successCount} photos uploaded successfully`
      );
    }
  };

  // Reorder / Drag and Drop for thumbnails
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', String(index));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleThumbnailDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndexStr = e.dataTransfer.getData('text/plain');
    const sourceIndex = parseInt(sourceIndexStr, 10);
    if (isNaN(sourceIndex) || sourceIndex === targetIndex) return;

    setImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  };

  const handleSetMain = (index: number) => {
    setImages((prev) => {
      if (index <= 0 || index >= prev.length) return prev;
      const target = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [target, ...rest];
    });
    showToast('info', 'Main photo updated');
  };

  const handleRemovePhoto = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Save product
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const rrpNum = parseFloat(rrpString);
    const wholesaleNum = parseFloat(wholesaleString);

    // Client-side quick checks
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = 'Product name is required';
    if (!category.trim()) errors.category = 'Category is required';
    if (isNaN(rrpNum) || rrpNum <= 0) {
      errors.rrp = 'Retail selling price (RRP) is required and must be greater than £0.00';
    }
    if (isNaN(wholesaleNum) || wholesaleNum <= 0) {
      errors.wholesalePrice =
        'Wholesale price per pack is required and must be greater than £0.00';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstMsg = Object.values(errors)[0];
      showToast('error', firstMsg);
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        id: product?.id,
        name: name.trim(),
        category: category.trim(),
        code: code.trim(),
        barcode: barcode.trim(),
        description: description.trim(),
        features: featuresText
          .split('\n')
          .map((f) => f.trim())
          .filter(Boolean),
        videoUrl: videoUrl.trim(),
        pageTitle: pageTitle.trim(),
        webAddress: webAddress.trim(),
        metaDesc: metaDesc.trim(),
        visibleToPublic,
        rrp: rrpNum,
        minQty,
        visibleToTrade,
        unitsPerPack,
        minPacks,
        wholesalePrice: wholesaleNum,
        stockPacks,
        lowStockAt,
        bestSeller,
        newArrival,
        specialOffer,
        offerPrice: specialOffer && offerPrice ? parseFloat(offerPrice) : null,
        images,
      };

      const res = await saveProductAction(payload);
      if (!res.success) {
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
        showToast('error', res.error || 'Failed to save product');
        setIsSaving(false);
        return;
      }

      if (res.product?.slug) {
        setSavedSlug(res.product.slug);
      }

      showToast('success', 'Product saved successfully!');

      setTimeout(() => {
        router.push('/admin/products');
        router.refresh();
      }, 700);
    } catch (err: any) {
      console.error('Save error:', err);
      showToast('error', err?.message || 'Failed to save product');
      setIsSaving(false);
    }
  };

  return (
    <main className="p-5 sm:p-8 pb-16 flex flex-col gap-5 max-w-[1320px] mx-auto w-full">
      {/* Header Bar */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <p className="m-0 text-[14px] text-muted">
            <Link
              href="/admin/products"
              className="text-brand-navy hover:underline"
            >
              Products
            </Link>{' '}
            / {isNew ? 'New product' : 'Edit product'}
          </p>
          <h1 className="mt-1 mb-0 text-[30px] sm:text-[32px] font-extrabold font-stretch-108 text-navy-deep">
            {isNew ? 'New product' : name || 'Edit product'}
          </h1>
        </div>

        <div className="flex gap-2.5 flex-wrap items-center">
          {/* Requirement 4: Preview disabled until product is saved */}
          {savedSlug ? (
            <a
              href={`/products/${savedSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 h-11 px-4 rounded-[10px] border border-field-border bg-white text-ink no-underline font-semibold text-[14px] hover:bg-surface transition-colors shadow-xs"
            >
              <span>Preview</span>
              <span className="text-muted text-[13px]">↗</span>
            </a>
          ) : (
            <button
              type="button"
              disabled
              title="Save the product first to enable preview"
              className="inline-flex items-center h-11 px-4 rounded-[10px] border border-line bg-surface text-muted/60 font-semibold text-[14px] cursor-not-allowed select-none opacity-60"
            >
              Preview
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center justify-center min-w-[130px] h-11 px-5 rounded-[10px] border-0 bg-brand-red hover:bg-[#c9000b] disabled:opacity-70 disabled:cursor-not-allowed text-white font-extrabold text-[15px] cursor-pointer shadow-sm transition-colors"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Saving...
              </span>
            ) : (
              'Save product'
            )}
          </button>
        </div>
      </div>

      {/* Info Notice Banner */}
      <p className="m-0 bg-[#E8E6F7] text-brand-navy rounded-xl p-3 px-4 text-[14px] sm:text-[15px] leading-relaxed font-medium">
        One product, two price lists. The public site shows the retail price.
        Approved trade customers see the wholesale price and pack size.
      </p>

      {/* Main 2-column layout */}
      <form onSubmit={handleSave} className="flex flex-wrap gap-5 items-start">
        {/* Left Column */}
        <div className="flex-1 basis-[520px] min-w-0 flex flex-col gap-5">
          {/* Product details */}
          <section className="bg-white border border-line rounded-[16px] p-5 sm:p-[22px] flex flex-col gap-3.5 shadow-xs">
            <h2 className="m-0 text-[18px] font-extrabold text-ink">
              Product details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <FormField
                label="Product name *"
                placeholder="e.g. Hair Grips Black"
                value={name}
                error={fieldErrors.name}
                onChange={(e) => handleNameChange(e.target.value)}
              />

              <FormField
                label="Category *"
                type="select"
                value={category}
                error={fieldErrors.category}
                onChange={(e) => setCategory(e.target.value)}
                options={categoryOptions}
              />

              <FormField
                label="Product code"
                placeholder="e.g. 321"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />

              <FormField
                label="Barcode (EAN)"
                placeholder="e.g. 5012345678901"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
              />

              <FormField
                label="Description"
                type="textarea"
                placeholder="Short description of the product..."
                className="col-span-full"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <FormField
                label="Features and benefits, one per line"
                type="textarea"
                placeholder={'Firm grip\nBlack finish blends with dark hair\nHandy hanging pack'}
                className="col-span-full"
                value={featuresText}
                onChange={(e) => setFeaturesText(e.target.value)}
              />
            </div>
          </section>

          {/* Photos and Video */}
          <section
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragOver(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              handleFiles(e.dataTransfer.files);
            }}
            className={`bg-white border rounded-[16px] p-5 sm:p-[22px] flex flex-col gap-4 shadow-xs transition-colors ${
              isDragOver
                ? 'border-brand-navy bg-indigo-50/20 ring-2 ring-brand-navy/20'
                : 'border-line'
            }`}
          >
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <h2 className="m-0 text-[18px] font-extrabold text-ink">
                  Photos and video
                </h2>
                <p className="m-0 mt-0.5 text-[13px] text-muted">
                  Drag and drop to reorder. The first photo is the main product image.
                </p>
              </div>

              {uploadProgress && (
                <span className="text-[13px] font-bold text-brand-navy animate-pulse">
                  {uploadProgress}
                </span>
              )}
            </div>

            {/* Hidden native multiple file picker */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />

            {/* Photos Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <div
                  key={`${img}-${idx}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleThumbnailDrop(e, idx)}
                  className={`group relative aspect-square rounded-xl p-2 bg-surface flex flex-col items-center justify-center cursor-grab active:cursor-grabbing transition-all select-none ${
                    idx === 0
                      ? 'border-2 border-brand-navy shadow-xs ring-1 ring-brand-navy/10'
                      : 'border border-line hover:border-brand-navy/40'
                  }`}
                  title="Drag to reorder"
                >
                  {/* Main photo badge */}
                  {idx === 0 ? (
                    <span className="absolute top-1.5 left-1.5 z-10 bg-brand-navy text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-xs">
                      Main Photo
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetMain(idx)}
                      className="absolute top-1.5 left-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white hover:bg-brand-navy hover:text-white text-navy-deep border border-line text-[11px] font-bold px-1.5 py-0.5 rounded shadow-xs"
                      title="Set as main photo"
                    >
                      Make main
                    </button>
                  )}

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute top-1.5 right-1.5 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-white/90 hover:bg-brand-red text-text-2 hover:text-white border border-line/60 shadow-xs transition-colors cursor-pointer"
                    title="Remove photo"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>

                  <div className="w-full h-full relative flex items-center justify-center p-1">
                    <Image
                      src={img}
                      alt={`Product photo ${idx + 1}`}
                      width={120}
                      height={120}
                      unoptimized={img.startsWith('http')}
                      className="w-full h-full object-contain pointer-events-none"
                    />
                  </div>
                </div>
              ))}

              {/* Uploading Placeholder Card */}
              {isUploading && (
                <div className="aspect-square rounded-xl border border-dashed border-brand-navy bg-indigo-50/30 flex flex-col items-center justify-center gap-2 p-3 text-center">
                  <svg
                    className="animate-spin h-6 w-6 text-brand-navy"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  <span className="text-[12px] font-bold text-brand-navy">
                    Uploading...
                  </span>
                </div>
              )}

              {/* + Upload Photo Button & Drop Target */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="aspect-square border-2 border-dashed border-field-border hover:border-brand-navy rounded-xl bg-surface hover:bg-indigo-50/20 font-sans font-bold text-brand-navy disabled:opacity-50 cursor-pointer flex flex-col items-center justify-center gap-1.5 text-[13px] text-center p-3 transition-colors shadow-2xs"
              >
                <svg
                  className="w-6 h-6 text-brand-navy/70"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span>+ Upload photo</span>
                <span className="text-[11px] font-normal text-muted">
                  or drag & drop
                </span>
              </button>
            </div>

            <FormField
              label="Product video (optional link to TikTok, Instagram or YouTube)"
              type="url"
              placeholder="https://www.tiktok.com/@bitsnbobs/video/..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
          </section>

          {/* Search engines */}
          <section className="bg-white border border-line rounded-[16px] p-5 sm:p-[22px] flex flex-col gap-3.5 shadow-xs">
            <h2 className="m-0 text-[18px] font-extrabold text-ink">
              Search engines (SEO)
            </h2>
            <FormField
              label="Page title"
              placeholder="e.g. Hair Grips Black | Bits N Bobs"
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
            />
            <FormField
              label="Web address slug"
              placeholder="e.g. bitsnbobs.co/products/hair-grips"
              value={webAddress}
              helperText="Auto-generated from product name if left blank"
              onChange={(e) => {
                setIsSlugCustomized(true);
                setWebAddress(e.target.value);
              }}
            />
            <FormField
              label="Meta description"
              type="textarea"
              placeholder="Short search snippet for Google and search engines..."
              value={metaDesc}
              onChange={(e) => setMetaDesc(e.target.value)}
            />
          </section>
        </div>

        {/* Right Column */}
        <div className="w-full lg:w-[380px] flex-none flex flex-col gap-5">
          {/* Public Shop Box (Red border) */}
          <section className="bg-white border-2 border-brand-red rounded-[16px] p-5 sm:p-[22px] flex flex-col gap-3.5 shadow-xs">
            <h2 className="m-0 text-[18px] font-extrabold text-ink">
              Public shop
            </h2>
            <label className="flex gap-2.5 items-center text-[15px] cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={visibleToPublic}
                onChange={(e) => setVisibleToPublic(e.target.checked)}
                className="w-5 h-5 accent-brand-navy rounded cursor-pointer"
              />
              Show on the public website
            </label>
            <FormField
              label="Retail selling price (RRP), incl. VAT *"
              placeholder="e.g. 0.99"
              value={rrpString}
              error={fieldErrors.rrp}
              onChange={(e) => setRrpString(e.target.value)}
            />
            <FormField
              label="Minimum quantity"
              type="number"
              value={minQty}
              onChange={(e) => setMinQty(parseInt(e.target.value, 10) || 1)}
            />
          </section>

          {/* Trade Shop Box (Navy border) */}
          <section className="bg-white border-2 border-brand-navy rounded-[16px] p-5 sm:p-[22px] flex flex-col gap-3.5 shadow-xs">
            <h2 className="m-0 text-[18px] font-extrabold text-ink">
              Trade shop
            </h2>
            <label className="flex gap-2.5 items-center text-[15px] cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={visibleToTrade}
                onChange={(e) => setVisibleToTrade(e.target.checked)}
                className="w-5 h-5 accent-brand-navy rounded cursor-pointer"
              />
              Show to approved trade customers
            </label>
            <div className="grid grid-cols-2 gap-3.5">
              <FormField
                label="Units per pack"
                type="number"
                value={unitsPerPack}
                onChange={(e) =>
                  setUnitsPerPack(parseInt(e.target.value, 10) || 6)
                }
              />
              <FormField
                label="Minimum packs"
                type="number"
                value={minPacks}
                onChange={(e) =>
                  setMinPacks(parseInt(e.target.value, 10) || 1)
                }
              />
              <FormField
                label="Wholesale price per pack, ex VAT *"
                placeholder="e.g. 3.32"
                className="col-span-full"
                value={wholesaleString}
                error={fieldErrors.wholesalePrice}
                onChange={(e) => setWholesaleString(e.target.value)}
              />
            </div>

            {/* Dynamic Profit Calculation per Rule 6.3 */}
            {profit ? (
              <p className="m-0 bg-[#FFF4C2] text-ink rounded-[10px] p-2.5 px-3 text-[14px] leading-relaxed">
                Retailer profit per pack:{' '}
                <strong>
                  {profit.profitFormatted} ({profit.marginPercent}%)
                </strong>
                , worked out automatically.
              </p>
            ) : (
              <p className="m-0 bg-surface text-muted rounded-[10px] p-2.5 px-3 text-[13px] leading-relaxed">
                Enter retail and wholesale prices to see automatic retailer profit calculation.
              </p>
            )}
          </section>

          {/* Stock */}
          <section className="bg-white border border-line rounded-[16px] p-5 sm:p-[22px] flex flex-col gap-3.5 shadow-xs">
            <h2 className="m-0 text-[18px] font-extrabold text-ink">Stock</h2>
            <div className="grid grid-cols-2 gap-3.5">
              <FormField
                label="Packs in stock"
                type="number"
                value={stockPacks}
                onChange={(e) =>
                  setStockPacks(parseInt(e.target.value, 10) || 0)
                }
              />
              <FormField
                label="Low stock alert at"
                type="number"
                value={lowStockAt}
                onChange={(e) =>
                  setLowStockAt(parseInt(e.target.value, 10) || 0)
                }
              />
            </div>
            {stockPacks <= lowStockAt && (
              <p className="m-0 text-[14px] font-bold text-warning">
                Below the alert level ({lowStockAt} packs). This product shows on the dashboard.
              </p>
            )}
          </section>

          {/* Promotion */}
          <section className="bg-white border border-line rounded-[16px] p-5 sm:p-[22px] flex flex-col gap-3.5 shadow-xs">
            <h2 className="m-0 text-[18px] font-extrabold text-ink">
              Promotion
            </h2>
            <label className="flex gap-2.5 items-center text-[15px] cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={bestSeller}
                onChange={(e) => setBestSeller(e.target.checked)}
                className="w-5 h-5 accent-brand-navy rounded cursor-pointer"
              />
              Best seller
            </label>
            <label className="flex gap-2.5 items-center text-[15px] cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={newArrival}
                onChange={(e) => setNewArrival(e.target.checked)}
                className="w-5 h-5 accent-brand-navy rounded cursor-pointer"
              />
              New arrival
            </label>
            <label className="flex gap-2.5 items-center text-[15px] cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={specialOffer}
                onChange={(e) => setSpecialOffer(e.target.checked)}
                className="w-5 h-5 accent-brand-navy rounded cursor-pointer"
              />
              Special offer
            </label>
            {specialOffer && (
              <FormField
                label="Offer price (optional)"
                placeholder="e.g. 0.79"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
              />
            )}
          </section>
        </div>
      </form>
    </main>
  );
}
