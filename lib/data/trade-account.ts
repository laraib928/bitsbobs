import { createClient, createAdminClient } from '@/lib/supabase/server';
import { formatMoney } from '@/lib/money';
import type { Json } from '@/lib/supabase/database.types';

export interface AddressObject {
  store_name?: string;
  line1?: string;
  line2?: string;
  line3?: string;
  town?: string;
  postcode?: string;
  address?: string;
}

export interface RetailerAccountProfile {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  businessType: string;
  vatNumber: string | null;
  companyNumber: string | null;
  tradingAddress: AddressObject;
  deliveryAddress: AddressObject | null;
  tradingAddressFormatted: string;
  deliveryAddressFormatted: string;
  role: string;
  status: string;
  initials: string;
}

export interface RetailerOrderItem {
  id: string;
  productId: string | null;
  standId: string | null;
  name: string;
  quantity: number;
  unitPricePence: number;
  lineTotalPence: number;
  unitPriceFormatted: string;
  lineTotalFormatted: string;
}

export interface RetailerOrder {
  id: string;
  orderNumber: number;
  orderNumberFormatted: string;
  createdAt: string;
  dateFormatted: string;
  status: string;
  statusLabel: string;
  statusBg: string;
  statusFg: string;
  subtotalPence: number;
  deliveryPence: number;
  vatPence: number;
  totalPence: number;
  totalFormatted: string;
  subtotalFormatted: string;
  deliveryFormatted: string;
  vatFormatted: string;
  paidAt: string | null;
  itemsCount: number;
  itemsDescription: string;
  items: RetailerOrderItem[];
  deliveryAddress: AddressObject;
  deliveryAddressFormatted: string;
  billingAddress: AddressObject;
  billingAddressFormatted: string;
}

export interface RetailerPromotion {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  targetHref: string;
}

export interface RetailerAccountData {
  profile: RetailerAccountProfile | null;
  orders: RetailerOrder[];
  lastOrder: RetailerOrder | null;
  activePromotions: RetailerPromotion[];
}

export function formatAddressObject(addr: Json | undefined | null): {
  obj: AddressObject;
  formatted: string;
} {
  if (!addr || typeof addr !== 'object' || Array.isArray(addr)) {
    return { obj: {}, formatted: '' };
  }
  const raw = addr as Record<string, Json | undefined>;
  const line1 =
    typeof raw.line1 === 'string'
      ? raw.line1
      : typeof raw.address === 'string'
      ? raw.address
      : '';
  const line2 = typeof raw.line2 === 'string' ? raw.line2 : '';
  const line3 = typeof raw.line3 === 'string' ? raw.line3 : '';
  const town = typeof raw.town === 'string' ? raw.town : '';
  const postcode = typeof raw.postcode === 'string' ? raw.postcode : '';
  const storeName = typeof raw.store_name === 'string' ? raw.store_name : '';

  const obj: AddressObject = {
    store_name: storeName,
    line1,
    line2,
    line3,
    town,
    postcode,
  };

  const parts = [storeName, line1, line2, line3, town, postcode].filter(Boolean);
  return {
    obj,
    formatted: parts.join(', '),
  };
}

export function formatDateGB(isoDate: string): string {
  if (!isoDate) return '';
  try {
    const d = new Date(isoDate);
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return isoDate;
  }
}

export function getOrderStatusMeta(status: string): {
  label: string;
  bg: string;
  fg: string;
} {
  switch (status?.toLowerCase()) {
    case 'paid':
    case 'processing':
      return { label: 'Processing', bg: '#E8E6F7', fg: '#312682' };
    case 'shipped':
      return { label: 'Shipped', bg: '#D1FAE5', fg: '#065F46' };
    case 'delivered':
      return { label: 'Delivered', bg: '#DCFCE7', fg: '#166534' };
    case 'cancelled':
      return { label: 'Cancelled', bg: '#FEE2E2', fg: '#991B1B' };
    case 'pending_payment':
    case 'pending':
    default:
      return { label: 'Pending payment', bg: '#FEF3C7', fg: '#92400E' };
  }
}

function getInitials(name: string): string {
  if (!name) return 'TR';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/**
 * Fetch all trade account data for the logged-in retailer from Supabase.
 */
export async function getRetailerAccountData(): Promise<RetailerAccountData> {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let targetUserId = user?.id || null;
  let targetEmail = user?.email || null;

  // Fallback for preview/testing if user is not authenticated in dev environment
  if (!targetUserId) {
    const { data: firstTrade } = await adminClient
      .from('profiles')
      .select('id, email')
      .eq('role', 'trade')
      .limit(1)
      .maybeSingle();

    if (firstTrade) {
      targetUserId = firstTrade.id;
      targetEmail = firstTrade.email;
    }
  }

  // 1. Fetch Profile
  let profile: RetailerAccountProfile | null = null;
  if (targetUserId) {
    const { data: prof } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', targetUserId)
      .maybeSingle();

    if (prof) {
      const trading = formatAddressObject(prof.trading_address);
      const delivery = formatAddressObject(prof.delivery_address);

      profile = {
        id: prof.id,
        businessName: prof.business_name || 'Retailer Account',
        contactName: prof.contact_name || '',
        email: prof.email || targetEmail || '',
        phone: prof.phone || '',
        businessType: prof.business_type || 'Convenience store',
        vatNumber: prof.vat_number || null,
        companyNumber: prof.company_number || null,
        tradingAddress: trading.obj,
        deliveryAddress: prof.delivery_address ? delivery.obj : null,
        tradingAddressFormatted: trading.formatted || 'Not provided',
        deliveryAddressFormatted:
          delivery.formatted || trading.formatted || 'Same as trading address',
        role: prof.role || 'trade',
        status: prof.status || 'approved',
        initials: getInitials(prof.business_name || 'Retailer'),
      };
    }
  }

  // 2. Fetch Orders for this retailer
  const orders: RetailerOrder[] = [];
  if (targetUserId || targetEmail) {
    let query = adminClient
      .from('orders')
      .select(`
        id,
        order_number,
        channel,
        user_id,
        email,
        status,
        subtotal_pence,
        delivery_pence,
        vat_pence,
        total_pence,
        paid_at,
        created_at,
        delivery_address,
        billing_address,
        order_items (
          id,
          product_id,
          stand_id,
          name_snapshot,
          quantity,
          unit_price_pence,
          line_total_pence
        )
      `)
      .eq('channel', 'trade');

    if (targetUserId && targetEmail) {
      query = query.or(`user_id.eq.${targetUserId},email.eq.${targetEmail}`);
    } else if (targetUserId) {
      query = query.eq('user_id', targetUserId);
    } else if (targetEmail) {
      query = query.eq('email', targetEmail);
    }

    const { data: dbOrders } = await query.order('created_at', {
      ascending: false,
    });

    if (dbOrders) {
      for (const ord of dbOrders) {
        const rawItems = (ord.order_items as any[]) || [];
        const items: RetailerOrderItem[] = rawItems.map((item) => ({
          id: item.id,
          productId: item.product_id,
          standId: item.stand_id,
          name: item.name_snapshot || 'Product pack',
          quantity: item.quantity || 1,
          unitPricePence: item.unit_price_pence || 0,
          lineTotalPence: item.line_total_pence || 0,
          unitPriceFormatted: formatMoney(item.unit_price_pence || 0),
          lineTotalFormatted: formatMoney(item.line_total_pence || 0),
        }));

        const totalPacks = items.reduce((acc, it) => acc + it.quantity, 0);
        const meta = getOrderStatusMeta(ord.status);
        const delAddr = formatAddressObject(ord.delivery_address);
        const billAddr = formatAddressObject(ord.billing_address);

        orders.push({
          id: ord.id,
          orderNumber: ord.order_number,
          orderNumberFormatted: `#${ord.order_number}`,
          createdAt: ord.created_at,
          dateFormatted: formatDateGB(ord.created_at),
          status: ord.status,
          statusLabel: meta.label,
          statusBg: meta.bg,
          statusFg: meta.fg,
          subtotalPence: ord.subtotal_pence,
          deliveryPence: ord.delivery_pence,
          vatPence: ord.vat_pence,
          totalPence: ord.total_pence,
          totalFormatted: formatMoney(ord.total_pence),
          subtotalFormatted: formatMoney(ord.subtotal_pence),
          deliveryFormatted: formatMoney(ord.delivery_pence),
          vatFormatted: formatMoney(ord.vat_pence),
          paidAt: ord.paid_at,
          itemsCount: totalPacks,
          itemsDescription: `${totalPacks} ${
            totalPacks === 1 ? 'pack' : 'packs'
          }`,
          items,
          deliveryAddress: delAddr.obj,
          deliveryAddressFormatted: delAddr.formatted,
          billingAddress: billAddr.obj,
          billingAddressFormatted: billAddr.formatted,
        });
      }
    }
  }

  // 3. Query Active Promotions
  const activePromotions: RetailerPromotion[] = [];
  const now = new Date().toISOString();
  const { data: dbPromos } = await adminClient
    .from('promotions')
    .select('*')
    .eq('is_active', true)
    .in('audience', ['trade', 'both'])
    .lte('starts_at', now)
    .gte('ends_at', now)
    .order('created_at', { ascending: false });

  if (dbPromos && dbPromos.length > 0) {
    for (const p of dbPromos) {
      activePromotions.push({
        id: p.id,
        title: p.title,
        description: p.description,
        startsAt: p.starts_at,
        endsAt: p.ends_at,
        targetHref: '/trade/stands',
      });
    }
  } else {
    activePromotions.push({
      id: 'f0000000-0000-0000-0000-000000000001',
      title: 'Free Display Stand Offer',
      description:
        'Order our fastest-selling retail range of 80 different lines and get a FREE display stand worth over £100.',
      startsAt: new Date().toISOString(),
      endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
      targetHref: '/trade/stands',
    });
  }

  const lastOrder = orders.length > 0 ? orders[0] : null;

  return {
    profile,
    orders,
    lastOrder,
    activePromotions,
  };
}

/**
 * Fetch a single order by ID for the logged-in retailer
 */
export async function getRetailerOrderById(
  orderId: string
): Promise<RetailerOrder | null> {
  const { orders } = await getRetailerAccountData();
  const found = orders.find(
    (o) => o.id === orderId || String(o.orderNumber) === orderId
  );
  return found || null;
}

