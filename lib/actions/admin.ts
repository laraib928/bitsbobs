'use server';

import { revalidatePath } from 'next/cache';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/database.types';

type OrderStatus = Database['public']['Enums']['order_status'];
type AccountStatus = Database['public']['Enums']['account_status'];
type PromoAudience = Database['public']['Enums']['promo_audience'];

/**
 * Verify on the server that the active session belongs to an authorized admin.
 */
export async function verifyAdminUser(): Promise<{
  authorized: boolean;
  adminId?: string;
  error?: string;
}> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isConfigured = supabaseUrl && !supabaseUrl.includes('placeholder');

  if (!isConfigured) {
    // In local dev without remote Supabase configured, allow access
    return { authorized: true, adminId: 'dev-admin-id' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { authorized: false, error: 'Unauthorized: No active session.' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role !== 'admin') {
    return { authorized: false, error: 'Forbidden: Admin role required.' };
  }

  return { authorized: true, adminId: user.id };
}

/**
 * Update Order Status (paid, packing, dispatched, delivered, cancelled, etc.)
 */
export async function updateOrderStatusAction(
  orderId: string,
  newStatus: OrderStatus
): Promise<{ success: boolean; error?: string }> {
  const auth = await verifyAdminUser();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isConfigured = supabaseUrl && !supabaseUrl.includes('placeholder');

    if (isConfigured) {
      const adminClient = createAdminClient();
      const { error } = await adminClient
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) {
        return { success: false, error: error.message };
      }
    }

    revalidatePath('/admin');
    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update order status';
    return { success: false, error: msg };
  }
}

/**
 * Update Trade Account Status (approved, rejected, suspended, pending)
 */
export async function updateTradeAccountStatusAction(
  profileId: string,
  newStatus: AccountStatus,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const auth = await verifyAdminUser();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isConfigured = supabaseUrl && !supabaseUrl.includes('placeholder');

    if (isConfigured) {
      const adminClient = createAdminClient();
      const updateData: Database['public']['Tables']['profiles']['Update'] = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      if (newStatus === 'approved') {
        updateData.approved_at = new Date().toISOString();
        updateData.approved_by = auth.adminId || null;
      }

      if (reason) {
        const { data: existing } = await adminClient
          .from('profiles')
          .select('notes')
          .eq('id', profileId)
          .single();
        const noteStamp = `[${newStatus.toUpperCase()}: ${new Date().toLocaleDateString('en-GB')}] ${reason}`;
        updateData.notes = existing?.notes ? `${existing.notes}\n${noteStamp}` : noteStamp;
      }

      const { error } = await adminClient
        .from('profiles')
        .update(updateData)
        .eq('id', profileId);

      if (error) {
        return { success: false, error: error.message };
      }
    }

    revalidatePath('/admin');
    revalidatePath('/admin/trade-accounts');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update account status';
    return { success: false, error: msg };
  }
}

/**
 * Restock Product - Add packs to stock
 */
export async function restockProductAction(
  productId: string,
  additionalPacks: number
): Promise<{ success: boolean; newPacks?: number; error?: string }> {
  const auth = await verifyAdminUser();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  if (additionalPacks <= 0) {
    return { success: false, error: 'Packs to add must be greater than zero.' };
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isConfigured = supabaseUrl && !supabaseUrl.includes('placeholder');

    let updatedPacks = additionalPacks;

    if (isConfigured) {
      const adminClient = createAdminClient();
      const { data: currentStock } = await adminClient
        .from('stock')
        .select('packs_in_stock')
        .eq('product_id', productId)
        .maybeSingle();

      const newTotal = (currentStock?.packs_in_stock || 0) + additionalPacks;
      updatedPacks = newTotal;

      const { error } = await adminClient.from('stock').upsert({
        product_id: productId,
        packs_in_stock: newTotal,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        return { success: false, error: error.message };
      }
    }

    revalidatePath('/admin');
    revalidatePath('/admin/products');
    revalidatePath(`/admin/products/${productId}`);
    return { success: true, newPacks: updatedPacks };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to restock product';
    return { success: false, error: msg };
  }
}

/**
 * Save Promotion (Create or Edit)
 */
export async function savePromotionAction(promo: {
  id?: string;
  title: string;
  description: string;
  audience: PromoAudience;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
}): Promise<{ success: boolean; error?: string }> {
  const auth = await verifyAdminUser();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isConfigured = supabaseUrl && !supabaseUrl.includes('placeholder');

    if (isConfigured) {
      const adminClient = createAdminClient();
      const payload = {
        title: promo.title,
        description: promo.description,
        audience: promo.audience,
        starts_at: promo.starts_at,
        ends_at: promo.ends_at,
        is_active: promo.is_active,
      };

      if (promo.id) {
        const { error } = await adminClient
          .from('promotions')
          .update(payload)
          .eq('id', promo.id);
        if (error) return { success: false, error: error.message };
      } else {
        const { error } = await adminClient.from('promotions').insert(payload);
        if (error) return { success: false, error: error.message };
      }
    }

    revalidatePath('/admin/promotions');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to save promotion';
    return { success: false, error: msg };
  }
}

/**
 * Toggle Promotion Active Status
 */
export async function togglePromotionActiveAction(
  promoId: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  const auth = await verifyAdminUser();
  if (!auth.authorized) return { success: false, error: auth.error };

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isConfigured = supabaseUrl && !supabaseUrl.includes('placeholder');

    if (isConfigured) {
      const adminClient = createAdminClient();
      const { error } = await adminClient
        .from('promotions')
        .update({ is_active: isActive })
        .eq('id', promoId);
      if (error) return { success: false, error: error.message };
    }

    revalidatePath('/admin/promotions');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to toggle promotion';
    return { success: false, error: msg };
  }
}

/**
 * Save Delivery & VAT Settings
 */
export async function saveDeliverySettingsAction(settings: {
  freeDeliveryThresholdPence: number;
  tradeDeliveryChargePence: number;
  publicDeliveryChargePence: number;
  vatRateBp: number;
}): Promise<{ success: boolean; error?: string }> {
  const auth = await verifyAdminUser();
  if (!auth.authorized) return { success: false, error: auth.error };

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isConfigured = supabaseUrl && !supabaseUrl.includes('placeholder');

    if (isConfigured) {
      const adminClient = createAdminClient();
      const { error } = await adminClient
        .from('settings')
        .update({
          free_delivery_threshold_pence: settings.freeDeliveryThresholdPence,
          trade_delivery_charge_pence: settings.tradeDeliveryChargePence,
          public_delivery_charge_pence: settings.publicDeliveryChargePence,
          vat_rate_bp: settings.vatRateBp,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 1);

      if (error) return { success: false, error: error.message };
    }

    revalidatePath('/admin/delivery');
    revalidatePath('/admin');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to save settings';
    return { success: false, error: msg };
  }
}

/**
 * Moderate Review (Approve / Hide)
 */
export async function moderateReviewAction(
  reviewId: string,
  isApproved: boolean
): Promise<{ success: boolean; error?: string }> {
  const auth = await verifyAdminUser();
  if (!auth.authorized) return { success: false, error: auth.error };

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isConfigured = supabaseUrl && !supabaseUrl.includes('placeholder');

    if (isConfigured) {
      const adminClient = createAdminClient();
      const { error } = await adminClient
        .from('reviews')
        .update({ is_approved: isApproved })
        .eq('id', reviewId);
      if (error) return { success: false, error: error.message };
    }

    revalidatePath('/admin/content');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to moderate review';
    return { success: false, error: msg };
  }
}

/**
 * Save Site Content (Contact Details, Social Links)
 */
export async function saveSiteContentAction(content: {
  contactPhone: string;
  contactEmail: string;
  socialFacebook: string;
  socialInstagram: string;
  socialTiktok: string;
}): Promise<{ success: boolean; error?: string }> {
  const auth = await verifyAdminUser();
  if (!auth.authorized) return { success: false, error: auth.error };

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isConfigured = supabaseUrl && !supabaseUrl.includes('placeholder');

    if (isConfigured) {
      const adminClient = createAdminClient();
      const { error } = await adminClient
        .from('settings')
        .update({
          contact_phone: content.contactPhone,
          contact_email: content.contactEmail,
          social_facebook: content.socialFacebook,
          social_instagram: content.socialInstagram,
          social_tiktok: content.socialTiktok,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 1);

      if (error) return { success: false, error: error.message };
    }

    revalidatePath('/admin/content');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to save content settings';
    return { success: false, error: msg };
  }
}

/**
 * Add or Edit Homepage Video Demo
 */
export async function saveHomepageVideoAction(video: {
  id?: string;
  title: string;
  url: string;
  showOnHome: boolean;
  sortOrder: number;
}): Promise<{ success: boolean; error?: string }> {
  const auth = await verifyAdminUser();
  if (!auth.authorized) return { success: false, error: auth.error };

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isConfigured = supabaseUrl && !supabaseUrl.includes('placeholder');

    if (isConfigured) {
      const adminClient = createAdminClient();
      const payload = {
        title: video.title,
        url: video.url,
        show_on_home: video.showOnHome,
        sort_order: video.sortOrder,
      };

      if (video.id) {
        const { error } = await adminClient
          .from('product_videos')
          .update(payload)
          .eq('id', video.id);
        if (error) return { success: false, error: error.message };
      } else {
        const { error } = await adminClient.from('product_videos').insert(payload);
        if (error) return { success: false, error: error.message };
      }
    }

    revalidatePath('/admin/content');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to save video';
    return { success: false, error: msg };
  }
}
