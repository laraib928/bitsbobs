'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/server';
import {
  productSchema,
  type ProductFormValues,
  type SaveProductResult,
} from './product.schema';

export type { ProductFormValues, SaveProductResult };

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function saveProductAction(
  rawInput: unknown
): Promise<SaveProductResult> {
  // 1. Validate with Zod
  const validation = productSchema.safeParse(rawInput);
  if (!validation.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of validation.error.issues) {
      const field = issue.path.join('.');
      if (!fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    const firstErrorMessage =
      validation.error.issues[0]?.message || 'Please fill in all required fields.';
    return {
      success: false,
      error: firstErrorMessage,
      fieldErrors,
    };
  }

  const data = validation.data;
  const supabase = createAdminClient();

  try {
    // 2. Auto-generate web address slug from name if empty
    let slug = data.webAddress.trim();
    if (slug.includes('/')) {
      slug = slug.split('/').filter(Boolean).pop() || '';
    }
    slug = slugify(slug);
    if (!slug) {
      slug = slugify(data.name);
    }
    if (!slug) {
      slug = `product-${Date.now()}`;
    }

    // 3. Resolve category_id UUID
    let categoryId = data.category.trim();
    const isCategoryUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        categoryId
      );

    if (!isCategoryUuid) {
      // Look up category by slug or name in DB
      const { data: dbCat } = await supabase
        .from('categories')
        .select('id')
        .or(`slug.eq.${categoryId},name.ilike.${categoryId}`)
        .maybeSingle();

      if (dbCat?.id) {
        categoryId = dbCat.id;
      } else {
        // Fallback: look for cosmetics or first active category
        const { data: firstCat } = await supabase
          .from('categories')
          .select('id')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
          .limit(1)
          .maybeSingle();
        categoryId =
          firstCat?.id || 'a0000000-0000-0000-0000-000000000001';
      }
    }

    // 4. Generate or reuse Product ID
    const productId = data.id || crypto.randomUUID();

    // 5. Short line
    const shortLine =
      data.description.split('\n')[0]?.trim().slice(0, 140) ||
      data.name.slice(0, 140);

    // 6. Save to 'products' table
    const retailPricePence = Math.round(data.rrp * 100);
    const offerPricePence =
      data.specialOffer && data.offerPrice && data.offerPrice > 0
        ? Math.round(data.offerPrice * 100)
        : null;

    const { error: productError } = await supabase.from('products').upsert(
      {
        id: productId,
        name: data.name,
        slug,
        code: data.code || String(Math.floor(100 + Math.random() * 900)),
        barcode: data.barcode || null,
        category_id: categoryId,
        short_line: shortLine,
        description: data.description,
        features: data.features.filter((f) => f.trim().length > 0),
        retail_price_pence: retailPricePence,
        offer_price_pence: offerPricePence,
        is_best_seller: data.bestSeller,
        is_new_arrival: data.newArrival,
        is_special_offer: data.specialOffer,
        visible_to_public: data.visibleToPublic,
        visible_to_trade: data.visibleToTrade,
        is_active: true,
        seo_title: data.pageTitle || `${data.name} | Bits N Bobs`,
        seo_description: data.metaDesc || null,
      },
      { onConflict: 'id' }
    );

    if (productError) {
      console.error('Error saving product:', productError);
      return {
        success: false,
        error: `Could not save product: ${productError.message}`,
      };
    }

    // 7. Save to 'product_trade_prices' table
    const wholesalePackPricePence = Math.round(data.wholesalePrice * 100);
    const { error: tradePriceError } = await supabase
      .from('product_trade_prices')
      .upsert(
        {
          product_id: productId,
          wholesale_pack_price_pence: wholesalePackPricePence,
          units_per_pack: data.unitsPerPack || 6,
          min_packs: data.minPacks || 1,
        },
        { onConflict: 'product_id' }
      );

    if (tradePriceError) {
      console.error('Error saving trade price:', tradePriceError);
      return {
        success: false,
        error: `Could not save trade pricing: ${tradePriceError.message}`,
      };
    }

    // 8. Save to 'stock' table
    const { error: stockError } = await supabase.from('stock').upsert(
      {
        product_id: productId,
        packs_in_stock: data.stockPacks || 0,
        low_stock_at: data.lowStockAt ?? 10,
      },
      { onConflict: 'product_id' }
    );

    if (stockError) {
      console.error('Error saving stock:', stockError);
      return {
        success: false,
        error: `Could not save stock levels: ${stockError.message}`,
      };
    }

    // 9. Save to 'product_images' table
    // Delete existing images for this product to prevent duplicates or stale records
    await supabase.from('product_images').delete().eq('product_id', productId);

    if (data.images && data.images.length > 0) {
      const imageRecords = data.images.map((imgPath, idx) => ({
        product_id: productId,
        path: imgPath,
        alt: `${data.name} - Photo ${idx + 1}`,
        sort_order: idx,
      }));

      const { error: imagesError } = await supabase
        .from('product_images')
        .insert(imageRecords);

      if (imagesError) {
        console.error('Error saving product images:', imagesError);
      }
    }

    // 10. Save to 'product_videos' table
    await supabase.from('product_videos').delete().eq('product_id', productId);

    if (data.videoUrl && data.videoUrl.trim()) {
      const { error: videoError } = await supabase
        .from('product_videos')
        .insert({
          product_id: productId,
          url: data.videoUrl.trim(),
          title: `${data.name} Video`,
          sort_order: 0,
          show_on_home: false,
        });

      if (videoError) {
        console.error('Error saving product video:', videoError);
      }
    }

    // 11. Revalidate public and trade shop pages, products, admin list, and home
    try {
      revalidatePath('/shop');
      revalidatePath('/trade/shop');
      revalidatePath('/products');
      revalidatePath(`/products/${slug}`);
      revalidatePath('/admin/products');
      revalidatePath('/admin');
      revalidatePath('/');
    } catch (revalErr) {
      console.warn('Revalidation notice:', revalErr);
    }

    return {
      success: true,
      product: {
        id: productId,
        slug,
        name: data.name,
      },
    };
  } catch (err: any) {
    console.error('Unhandled product save error:', err);
    return {
      success: false,
      error: err?.message || 'Failed to save product due to an unexpected error.',
    };
  }
}
