import { createClient, createAdminClient } from '@/lib/supabase/server';
import { formatMoney } from '@/lib/money';
import type { Database, AccountStatus, PromoAudience } from '@/lib/supabase/database.types';

export interface AdminSidebarData {
  adminName: string;
  adminEmail: string;
  pendingTradeCount: number;
  newOrdersCount: number;
}

export interface KpiData {
  label: string;
  value: string;
  rawValue: number;
  trendPct: number;
  trendDirection: 'up' | 'down' | 'neutral';
  sparkline: number[];
  icon: 'pound' | 'orders' | 'box' | 'users' | 'alert';
}

export interface ChartPoint {
  date: string;
  fullDate: string;
  trade: number;
  public: number;
  total: number;
}

export interface LowStockItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  code: string;
  packsLeft: number;
  lowStockAt: number;
  percentage: number;
  status: 'critical' | 'low' | 'ok';
}

export interface LatestOrderAdmin {
  id: string;
  orderNumber: number;
  customerName: string;
  channel: 'trade' | 'public';
  itemsCountDescription: string;
  totalPence: number;
  totalFormatted: string;
  status: string;
  statusBg: string;
  statusFg: string;
  createdAt: string;
  relativeTime: string;
}

export interface PendingTradeAccount {
  id: string;
  businessName: string;
  contactName: string;
  businessType: string;
  email: string;
  phone: string;
  postcode: string;
  tradingAddress: string;
  deliveryAddress?: string;
  symbolGroup?: string;
  vatNumber?: string;
  companyNumber?: string;
  notes?: string;
  status?: AccountStatus;
  approvedAt?: string;
  approvedBy?: string;
  createdAt: string;
}

export interface TradeAccountsCounts {
  pending: number;
  approved: number;
  rejected: number;
  suspended: number;
  total: number;
}

export interface TradeAccountsData {
  accounts: PendingTradeAccount[];
  counts: TradeAccountsCounts;
}

export interface StandRequestAdmin {
  id: string;
  shopName: string;
  meta: string;
  message?: string;
  status: string;
  createdAt: string;
}

export interface AdminDashboardData {
  adminFirstName: string;
  currentDateFormatted: string;
  kpis: {
    sales: KpiData;
    orders: KpiData;
    packs: KpiData;
    tradeAccounts: KpiData;
    lowStock: KpiData;
  };
  chartPoints: ChartPoint[];
  chartTotalFormatted: string;
  lowStockItems: LowStockItem[];
  latestOrders: LatestOrderAdmin[];
  pendingAccounts: PendingTradeAccount[];
  standRequests: StandRequestAdmin[];
}

function getRelativeTimeString(dateIso: string): string {
  const diffMs = Date.now() - new Date(dateIso).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
}

function formatAddress(addr: unknown): { formatted: string; postcode: string } {
  if (!addr) return { formatted: '', postcode: '' };
  if (typeof addr === 'string') return { formatted: addr, postcode: '' };
  if (typeof addr === 'object') {
    const a = addr as Record<string, unknown>;
    const postcode = typeof a.postcode === 'string' ? a.postcode.trim() : '';
    const parts = [
      a.line1 || a.addressLine1 || a.address,
      a.line2 || a.addressLine2,
      a.town || a.city,
      a.county,
    ]
      .filter((p): p is string => typeof p === 'string' && p.trim().length > 0)
      .map((p) => p.trim());
    return {
      formatted: parts.join(', '),
      postcode,
    };
  }
  return { formatted: '', postcode: '' };
}

/**
 * Fetch sidebar badge counts and active admin info
 */
export async function getAdminSidebarData(): Promise<AdminSidebarData> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isConfigured = supabaseUrl && !supabaseUrl.includes('placeholder');

  let adminName = 'Administrator';
  let adminEmail = 'admin@bitsnbobs.co';
  let pendingTradeCount = 0;
  let newOrdersCount = 0;

  if (isConfigured) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        adminEmail = user.email || adminEmail;
        const { data: profile } = await supabase
          .from('profiles')
          .select('contact_name, business_name')
          .eq('id', user.id)
          .maybeSingle();

        if (profile?.contact_name) {
          adminName = profile.contact_name;
        } else if (profile?.business_name) {
          adminName = profile.business_name;
        }
      }

      const adminClient = createAdminClient();

      const { count: pendingCount } = await adminClient
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'trade')
        .eq('status', 'pending');

      if (typeof pendingCount === 'number') {
        pendingTradeCount = pendingCount;
      }

      const { count: ordCount } = await adminClient
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .in('status', ['paid', 'packing']);

      if (typeof ordCount === 'number') {
        newOrdersCount = ordCount;
      }
    } catch {
      // Fallback to zero values
    }
  }

  return {
    adminName,
    adminEmail,
    pendingTradeCount,
    newOrdersCount,
  };
}

/**
 * Fetch complete dashboard metrics, sparklines, chart data, and queue tables
 */
export async function getAdminDashboardData(
  range: 'today' | '7days' | '30days' | 'custom' = '7days',
  customFrom?: string,
  customTo?: string
): Promise<AdminDashboardData> {
  const now = new Date();
  const currentDateFormatted = now.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const sidebar = await getAdminSidebarData();
  const adminFirstName = sidebar.adminName.split(' ')[0] || 'Admin';

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isConfigured = supabaseUrl && !supabaseUrl.includes('placeholder');

  let days = 7;
  if (range === 'today') days = 1;
  else if (range === '30days') days = 30;
  else if (range === 'custom' && customFrom && customTo) {
    const diff = Math.ceil(
      (new Date(customTo).getTime() - new Date(customFrom).getTime()) / (1000 * 60 * 60 * 24)
    );
    days = Math.max(1, diff);
  }

  const lowStockItems: LowStockItem[] = [];
  const pendingAccounts: PendingTradeAccount[] = [];
  const standRequests: StandRequestAdmin[] = [];
  const latestOrders: LatestOrderAdmin[] = [];
  const chartPoints: ChartPoint[] = [];
  let totalChartPence = 0;
  let totalOrdersCount = 0;
  let totalPacksSold = 0;

  if (isConfigured) {
    try {
      const adminClient = createAdminClient();

      // 1. Query real low stock items
      const { data: stockData } = await adminClient
        .from('stock')
        .select(`
          product_id,
          packs_in_stock,
          low_stock_at,
          products (
            id,
            name,
            code,
            product_images (path, sort_order)
          )
        `)
        .order('packs_in_stock', { ascending: true })
        .limit(10);

      if (stockData && stockData.length > 0) {
        for (const s of stockData) {
          const prod = s.products as unknown as {
            id: string;
            name: string;
            code: string;
            product_images?: Array<{ path: string; sort_order: number }>;
          } | null;

          if (prod) {
            const sortedImages = prod.product_images?.sort((a, b) => a.sort_order - b.sort_order);
            const imagePath = sortedImages?.[0]?.path || '/images/stand.jpg';
            const percentage = Math.min(100, Math.round((s.packs_in_stock / Math.max(1, s.low_stock_at)) * 100));

            lowStockItems.push({
              id: s.product_id,
              productId: s.product_id,
              name: prod.name,
              image: imagePath,
              code: prod.code,
              packsLeft: s.packs_in_stock,
              lowStockAt: s.low_stock_at,
              percentage,
              status: s.packs_in_stock === 0 ? 'critical' : s.packs_in_stock <= s.low_stock_at ? 'low' : 'ok',
            });
          }
        }
      }

      // 2. Query real pending trade accounts
      let emailMap = new Map<string, string>();
      try {
        const { data: usersData } = await adminClient.auth.admin.listUsers();
        if (usersData?.users) {
          emailMap = new Map(usersData.users.map((u) => [u.id, u.email || '']));
        }
      } catch {}

      const { data: profilesPending } = await adminClient
        .from('profiles')
        .select('*')
        .eq('role', 'trade')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);

      if (profilesPending && profilesPending.length > 0) {
        for (const p of profilesPending) {
          const addr = formatAddress(p.trading_address);
          pendingAccounts.push({
            id: p.id,
            businessName: p.business_name || '',
            contactName: p.contact_name || '',
            businessType: p.business_type || '',
            email: emailMap.get(p.id) || p.email || '',
            phone: p.phone || '',
            postcode: addr.postcode,
            tradingAddress: addr.formatted || addr.postcode,
            symbolGroup: p.symbol_group || undefined,
            vatNumber: p.vat_number || undefined,
            companyNumber: p.company_number || undefined,
            notes: p.notes || undefined,
            status: p.status as AccountStatus,
            createdAt: p.created_at,
          });
        }
      }

      // 3. Query real stand requests
      const { data: dbStandReqs } = await adminClient
        .from('stand_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (dbStandReqs && dbStandReqs.length > 0) {
        const userIds = dbStandReqs
          .map((st) => st.user_id)
          .filter((uid): uid is string => Boolean(uid));
        const profileMap = new Map<string, { business_name?: string; contact_name?: string }>();

        if (userIds.length > 0) {
          const { data: reqProfiles } = await adminClient
            .from('profiles')
            .select('id, business_name, contact_name')
            .in('id', userIds);

          if (reqProfiles) {
            for (const p of reqProfiles) {
              profileMap.set(p.id, p);
            }
          }
        }

        for (const st of dbStandReqs) {
          const p = st.user_id ? profileMap.get(st.user_id) : null;
          const shopName = p?.business_name || p?.contact_name || 'Retailer Request';
          standRequests.push({
            id: st.id,
            shopName,
            meta: `Stand request · ${new Date(st.created_at).toLocaleDateString('en-GB')}`,
            message: st.message || undefined,
            status: st.status || 'New',
            createdAt: st.created_at,
          });
        }
      }

      // 4. Query real recent orders
      const { data: ordersData } = await adminClient
        .from('orders')
        .select(`
          *,
          order_items (quantity)
        `)
        .order('created_at', { ascending: false })
        .limit(8);

      if (ordersData && ordersData.length > 0) {
        for (const o of ordersData) {
          const isTrade = o.channel === 'trade';
          let statusBg = '#E8E6F7';
          let statusFg = '#312682';

          if (o.status === 'dispatched' || o.status === 'delivered') {
            statusBg = '#E6F4EA';
            statusFg = '#137333';
          } else if (o.status === 'cancelled' || o.status === 'refunded') {
            statusBg = '#FCE8E6';
            statusFg = '#C5221F';
          } else if (o.status === 'packing') {
            statusBg = '#FEF7E0';
            statusFg = '#B06000';
          }

          const rawItems = (o as Record<string, unknown>).order_items as
            | Array<{ quantity?: number }>
            | undefined;
          const itemsCount = rawItems?.length || 0;
          const totalUnits = (rawItems || []).reduce(
            (acc: number, it: { quantity?: number }) => acc + (it.quantity || 0),
            0
          );
          const itemsDesc = isTrade
            ? `${totalUnits} ${totalUnits === 1 ? 'pack' : 'packs'} (${itemsCount} ${itemsCount === 1 ? 'item' : 'items'})`
            : `${itemsCount} ${itemsCount === 1 ? 'item' : 'items'}`;

          latestOrders.push({
            id: o.id,
            orderNumber: o.order_number,
            customerName: o.contact_name || o.full_name || (isTrade ? 'Trade Stockist' : 'Guest Customer'),
            channel: isTrade ? 'trade' : 'public',
            itemsCountDescription: itemsDesc,
            totalPence: o.total_pence,
            totalFormatted: formatMoney(o.total_pence),
            status: o.status.replace('_', ' '),
            statusBg,
            statusFg,
            createdAt: o.created_at,
            relativeTime: getRelativeTimeString(o.created_at),
          });
        }
      }

      // 5. Query all orders to build accurate chart points and KPIs
      const { data: allOrders } = await adminClient
        .from('orders')
        .select('created_at, total_pence, channel, status')
        .not('status', 'in', '("cancelled","refunded")');

      // Query order items for total packs sold count
      const { data: allItems } = await adminClient
        .from('order_items')
        .select('quantity');

      if (allItems) {
        totalPacksSold = allItems.reduce((acc, it) => acc + (it.quantity || 0), 0);
      }

      // Build daily chart points
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateLabel = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        const fullDate = d.toLocaleDateString('en-GB');

        const dayStart = new Date(d);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(d);
        dayEnd.setHours(23, 59, 59, 999);

        let dayTradePence = 0;
        let dayPublicPence = 0;

        if (allOrders) {
          for (const o of allOrders) {
            const oTime = new Date(o.created_at).getTime();
            if (oTime >= dayStart.getTime() && oTime <= dayEnd.getTime()) {
              totalOrdersCount++;
              if (o.channel === 'trade') {
                dayTradePence += o.total_pence || 0;
              } else {
                dayPublicPence += o.total_pence || 0;
              }
            }
          }
        }

        const dayTotalPence = dayTradePence + dayPublicPence;
        totalChartPence += dayTotalPence;

        chartPoints.push({
          date: dateLabel,
          fullDate,
          trade: Math.round(dayTradePence / 100),
          public: Math.round(dayPublicPence / 100),
          total: Math.round(dayTotalPence / 100),
        });
      }
    } catch (err) {
      console.warn('Dashboard metrics fetch error:', err);
    }
  }

  // Fallback points if none generated
  if (chartPoints.length === 0) {
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      chartPoints.push({
        date: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        fullDate: d.toLocaleDateString('en-GB'),
        trade: 0,
        public: 0,
        total: 0,
      });
    }
  }

  const totalSalesFormatted = formatMoney(totalChartPence);
  const lowStockCount = lowStockItems.filter((i) => i.status !== 'ok').length;

  return {
    adminFirstName,
    currentDateFormatted,
    kpis: {
      sales: {
        label: `Sales (${range === 'today' ? 'Today' : `Last ${days}d`})`,
        value: totalSalesFormatted,
        rawValue: totalChartPence,
        trendPct: 0,
        trendDirection: 'neutral',
        sparkline: chartPoints.map((p) => p.total),
        icon: 'pound',
      },
      orders: {
        label: `Orders placed`,
        value: totalOrdersCount.toString(),
        rawValue: totalOrdersCount,
        trendPct: 0,
        trendDirection: totalOrdersCount > 0 ? 'up' : 'neutral',
        sparkline: chartPoints.map((p) => (p.total > 0 ? 1 : 0)),
        icon: 'orders',
      },
      packs: {
        label: `Packs sold`,
        value: totalPacksSold.toString(),
        rawValue: totalPacksSold,
        trendPct: 0,
        trendDirection: totalPacksSold > 0 ? 'up' : 'neutral',
        sparkline: chartPoints.map((p) => (p.total > 0 ? 4 : 0)),
        icon: 'box',
      },
      tradeAccounts: {
        label: `Waiting approval`,
        value: pendingAccounts.length.toString(),
        rawValue: pendingAccounts.length,
        trendPct: 0,
        trendDirection: pendingAccounts.length > 0 ? 'up' : 'neutral',
        sparkline: [0, 0, 0, pendingAccounts.length],
        icon: 'users',
      },
      lowStock: {
        label: `Lines low on stock`,
        value: lowStockCount.toString(),
        rawValue: lowStockCount,
        trendPct: 0,
        trendDirection: lowStockCount > 0 ? 'down' : 'neutral',
        sparkline: [0, 0, lowStockCount],
        icon: 'alert',
      },
    },
    chartPoints,
    chartTotalFormatted: totalSalesFormatted,
    lowStockItems,
    latestOrders,
    pendingAccounts,
    standRequests,
  };
}

/**
 * Fetch Orders List with search & filters
 */
export async function getAdminOrdersList(filters?: {
  search?: string;
  status?: string;
  channel?: string;
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isConfigured = supabaseUrl && !supabaseUrl.includes('placeholder');

  let list: LatestOrderAdmin[] = [];

  if (isConfigured) {
    try {
      const adminClient = createAdminClient();
      let query = adminClient
        .from('orders')
        .select(`
          *,
          order_items (quantity)
        `)
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status as unknown as Database['public']['Enums']['order_status']);
      }
      if (filters?.channel && filters.channel !== 'all') {
        query = query.eq('channel', filters.channel as unknown as Database['public']['Enums']['order_channel']);
      }

      const { data: dbOrders } = await query;
      if (dbOrders) {
        list = dbOrders.map((o) => {
          const isTrade = o.channel === 'trade';
          let statusBg = '#E8E6F7';
          let statusFg = '#312682';

          if (o.status === 'dispatched' || o.status === 'delivered') {
            statusBg = '#E6F4EA';
            statusFg = '#137333';
          } else if (o.status === 'cancelled' || o.status === 'refunded') {
            statusBg = '#FCE8E6';
            statusFg = '#C5221F';
          } else if (o.status === 'packing') {
            statusBg = '#FEF7E0';
            statusFg = '#B06000';
          }

          const rawItems = (o as Record<string, unknown>).order_items as
            | Array<{ quantity?: number }>
            | undefined;
          const itemsCount = rawItems?.length || 0;
          const totalUnits = (rawItems || []).reduce(
            (acc: number, it: { quantity?: number }) => acc + (it.quantity || 0),
            0
          );
          const itemsDesc = isTrade
            ? `${totalUnits} ${totalUnits === 1 ? 'pack' : 'packs'} (${itemsCount} ${itemsCount === 1 ? 'item' : 'items'})`
            : `${itemsCount} ${itemsCount === 1 ? 'item' : 'items'}`;

          return {
            id: o.id,
            orderNumber: o.order_number,
            customerName: o.contact_name || o.full_name || (isTrade ? 'Trade Stockist' : 'Guest Customer'),
            channel: isTrade ? 'trade' : 'public',
            itemsCountDescription: itemsDesc,
            totalPence: o.total_pence,
            totalFormatted: formatMoney(o.total_pence),
            status: o.status,
            statusBg,
            statusFg,
            createdAt: o.created_at,
            relativeTime: getRelativeTimeString(o.created_at),
          };
        });
      }
    } catch (err) {
      console.warn('Could not fetch orders:', err);
    }
  }

  if (filters?.search) {
    const s = filters.search.toLowerCase();
    list = list.filter(
      (o) =>
        o.orderNumber.toString().includes(s) ||
        o.customerName.toLowerCase().includes(s) ||
        o.status.toLowerCase().includes(s)
    );
  }

  return list;
}

/**
 * Fetch Order Detail by ID
 */
export async function getAdminOrderDetail(id: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isConfigured = supabaseUrl && !supabaseUrl.includes('placeholder');

  if (isConfigured) {
    try {
      const adminClient = createAdminClient();
      const isNum = !isNaN(Number(id));
      let query = adminClient
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_id,
            stand_id,
            name_snapshot,
            quantity,
            unit_price_pence,
            line_total_pence,
            products (id, slug, product_images(path))
          )
        `);

      if (isNum) {
        query = query.or(`id.eq.${id},order_number.eq.${Number(id)}`);
      } else {
        query = query.eq('id', id);
      }

      const { data: order } = await query.maybeSingle();
      if (order) return order;
    } catch (err) {
      console.warn('Could not fetch order detail:', err);
    }
  }

  return null;
}

/**
 * Fetch Trade Accounts list and total counts by status
 */
export async function getAdminTradeAccounts(
  tab: AccountStatus = 'pending',
  search?: string
): Promise<TradeAccountsData> {
  const counts: TradeAccountsCounts = {
    pending: 0,
    approved: 0,
    rejected: 0,
    suspended: 0,
    total: 0,
  };

  let accounts: PendingTradeAccount[] = [];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isConfigured = supabaseUrl && !supabaseUrl.includes('placeholder');

  if (isConfigured) {
    try {
      const adminClient = createAdminClient();

      // List auth users to join email
      let emailMap = new Map<string, string>();
      try {
        const { data: usersData } = await adminClient.auth.admin.listUsers();
        if (usersData?.users) {
          emailMap = new Map(usersData.users.map((u) => [u.id, u.email || '']));
        }
      } catch (err) {
        console.warn('Could not list auth users:', err);
      }

      // Query all trade profiles to compute exact counts
      const { data: allProfiles } = await adminClient
        .from('profiles')
        .select('id, status')
        .eq('role', 'trade');

      if (allProfiles) {
        counts.total = allProfiles.length;
        for (const p of allProfiles) {
          const s = p.status as keyof Omit<TradeAccountsCounts, 'total'>;
          if (s in counts) {
            counts[s]++;
          }
        }
      }

      // Query profiles for the active tab
      const { data: profiles } = await adminClient
        .from('profiles')
        .select('*')
        .eq('role', 'trade')
        .eq('status', tab)
        .order('created_at', { ascending: false });

      if (profiles) {
        accounts = profiles.map((p) => {
          const addr = formatAddress(p.trading_address);
          const delAddr = p.delivery_address ? formatAddress(p.delivery_address) : null;
          const email = emailMap.get(p.id) || p.email || '';
          return {
            id: p.id,
            businessName: p.business_name || '',
            contactName: p.contact_name || '',
            businessType: p.business_type || '',
            email,
            phone: p.phone || '',
            postcode: addr.postcode,
            tradingAddress: addr.formatted || addr.postcode,
            deliveryAddress: delAddr?.formatted
              ? `${delAddr.formatted}${delAddr.postcode ? `, ${delAddr.postcode}` : ''}`
              : undefined,
            symbolGroup: p.symbol_group || undefined,
            vatNumber: p.vat_number || undefined,
            companyNumber: p.company_number || undefined,
            notes: p.notes || undefined,
            status: p.status as AccountStatus,
            createdAt: p.created_at,
            approvedAt: p.approved_at || undefined,
            approvedBy: p.approved_by || undefined,
          };
        });
      }
    } catch (err) {
      console.warn('Could not fetch trade accounts:', err);
    }
  }

  if (search && search.trim()) {
    const s = search.toLowerCase().trim();
    accounts = accounts.filter(
      (a) =>
        a.businessName.toLowerCase().includes(s) ||
        a.contactName.toLowerCase().includes(s) ||
        a.email.toLowerCase().includes(s) ||
        a.postcode.toLowerCase().includes(s)
    );
  }

  return { accounts, counts };
}

/**
 * Fetch Public (Guest) Customers aggregated from real orders
 */
export async function getAdminCustomers(search?: string) {
  let list: Array<{
    email: string;
    contactName: string;
    ordersCount: number;
    totalSpentFormatted: string;
    totalSpentPence: number;
    lastOrderFormatted: string;
    lastOrderIso: string;
  }> = [];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isConfigured = supabaseUrl && !supabaseUrl.includes('placeholder');

  if (isConfigured) {
    try {
      const adminClient = createAdminClient();
      const { data: publicOrders } = await adminClient
        .from('orders')
        .select('email, contact_name, full_name, total_pence, created_at, status')
        .eq('channel', 'public')
        .order('created_at', { ascending: false });

      if (publicOrders && publicOrders.length > 0) {
        const customerMap = new Map<
          string,
          {
            email: string;
            contactName: string;
            ordersCount: number;
            totalSpentPence: number;
            lastOrderIso: string;
          }
        >();

        for (const o of publicOrders) {
          const email = (o.email || '').toLowerCase().trim();
          if (!email) continue;

          const existing = customerMap.get(email);
          const name = o.contact_name || o.full_name || 'Guest Customer';
          const orderTotal =
            o.status !== 'cancelled' && o.status !== 'refunded' ? o.total_pence || 0 : 0;

          if (existing) {
            existing.ordersCount++;
            existing.totalSpentPence += orderTotal;
            if (new Date(o.created_at).getTime() > new Date(existing.lastOrderIso).getTime()) {
              existing.lastOrderIso = o.created_at;
              if (name && name !== 'Guest Customer') existing.contactName = name;
            }
          } else {
            customerMap.set(email, {
              email: o.email,
              contactName: name,
              ordersCount: 1,
              totalSpentPence: orderTotal,
              lastOrderIso: o.created_at,
            });
          }
        }

        list = Array.from(customerMap.values()).map((c) => ({
          email: c.email,
          contactName: c.contactName,
          ordersCount: c.ordersCount,
          totalSpentPence: c.totalSpentPence,
          totalSpentFormatted: formatMoney(c.totalSpentPence),
          lastOrderIso: c.lastOrderIso,
          lastOrderFormatted: new Date(c.lastOrderIso).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }),
        }));
      }
    } catch (err) {
      console.warn('Could not fetch public customers:', err);
    }
  }

  if (search) {
    const s = search.toLowerCase();
    list = list.filter(
      (c) => c.email.toLowerCase().includes(s) || c.contactName.toLowerCase().includes(s)
    );
  }

  return list;
}

/**
 * Fetch Promotions List from Supabase
 */
export async function getAdminPromotions() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isConfigured = supabaseUrl && !supabaseUrl.includes('placeholder');

  let list: Array<{
    id: string;
    title: string;
    description: string;
    audience: PromoAudience;
    starts_at: string;
    ends_at: string;
    is_active: boolean;
  }> = [];

  if (isConfigured) {
    try {
      const adminClient = createAdminClient();
      const { data } = await adminClient
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        list = data.map((d) => ({
          id: d.id,
          title: d.title,
          description: d.description,
          audience: d.audience,
          starts_at: d.starts_at,
          ends_at: d.ends_at,
          is_active: d.is_active,
        }));
      }
    } catch (err) {
      console.warn('Could not fetch promotions:', err);
    }
  }

  return list;
}

/**
 * Fetch Delivery & VAT Settings
 */
export async function getAdminDeliverySettings() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isConfigured = supabaseUrl && !supabaseUrl.includes('placeholder');

  let settings = {
    freeDeliveryThresholdPence: 15000, // £150.00
    tradeDeliveryChargePence: 499,     // £4.99
    publicDeliveryChargePence: 299,    // £2.99
    vatRateBp: 2000,                   // 20.00%
    contactPhone: '0161 839 5050',
    contactEmail: 'sales@bitsnbobs.co',
    socialFacebook: 'https://www.facebook.com/bitsnbobsuk/',
    socialInstagram: '',
    socialTiktok: 'https://www.tiktok.com/@bitsnbobsmcr',
  };

  if (isConfigured) {
    try {
      const adminClient = createAdminClient();
      const { data } = await adminClient
        .from('settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (data) {
        settings = {
          freeDeliveryThresholdPence: data.free_delivery_threshold_pence,
          tradeDeliveryChargePence: data.trade_delivery_charge_pence,
          publicDeliveryChargePence: data.public_delivery_charge_pence,
          vatRateBp: data.vat_rate_bp,
          contactPhone: data.contact_phone,
          contactEmail: data.contact_email,
          socialFacebook: data.social_facebook || 'https://www.facebook.com/bitsnbobsuk/',
          socialInstagram: '',
          socialTiktok: data.social_tiktok || 'https://www.tiktok.com/@bitsnbobsmcr',
        };
      }
    } catch {
      // Use defaults
    }
  }

  return settings;
}

/**
 * Fetch Site Content (Reviews, Videos, Social, Contact)
 */
export async function getAdminSiteContent() {
  const settings = await getAdminDeliverySettings();

  let reviews: Array<{
    id: string;
    author: string;
    town: string;
    body: string;
    rating: number;
    is_approved: boolean;
  }> = [];

  let videos: Array<{
    id: string;
    title: string;
    url: string;
    showOnHome: boolean;
    sortOrder: number;
  }> = [];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isConfigured = supabaseUrl && !supabaseUrl.includes('placeholder');

  if (isConfigured) {
    try {
      const adminClient = createAdminClient();

      const { data: dbReviews } = await adminClient
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbReviews) {
        reviews = dbReviews.map((r) => ({
          id: r.id,
          author: r.author_name,
          town: r.town || '',
          body: r.body,
          rating: r.rating,
          is_approved: r.is_approved,
        }));
      }

      const { data: dbVideos } = await adminClient
        .from('product_videos')
        .select('*')
        .order('sort_order', { ascending: true });

      if (dbVideos) {
        videos = dbVideos.map((v) => ({
          id: v.id,
          title: v.title,
          url: v.url,
          showOnHome: v.show_on_home,
          sortOrder: v.sort_order,
        }));
      }
    } catch (err) {
      console.warn('Could not fetch site content from DB:', err);
    }
  }

  return {
    settings,
    reviews,
    videos,
  };
}

/**
 * Fetch Reports & CSV Export Data
 */
export async function getAdminReportsData(period: 'day' | 'week' | 'month' = 'week') {
  const dash = await getAdminDashboardData(
    period === 'day' ? 'today' : period === 'week' ? '7days' : '30days'
  );

  let totalRevenuePence = 0;
  let tradeRevenuePence = 0;
  let publicRevenuePence = 0;
  const productAggMap = new Map<
    string,
    {
      name: string;
      code: string;
      packsSold: number;
      revenuePence: number;
    }
  >();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isConfigured = supabaseUrl && !supabaseUrl.includes('placeholder');

  if (isConfigured) {
    try {
      const adminClient = createAdminClient();

      // Orders for revenue
      const { data: orders } = await adminClient
        .from('orders')
        .select('channel, total_pence, status')
        .not('status', 'in', '("cancelled","refunded")');

      if (orders) {
        for (const o of orders) {
          const pence = o.total_pence || 0;
          totalRevenuePence += pence;
          if (o.channel === 'trade') {
            tradeRevenuePence += pence;
          } else {
            publicRevenuePence += pence;
          }
        }
      }

      // Order items for top products
      const { data: items } = await adminClient
        .from('order_items')
        .select(`
          quantity,
          line_total_pence,
          name_snapshot,
          product_name,
          product_id,
          products (name, code)
        `);

      if (items) {
        for (const it of items) {
          const itObj = it as Record<string, unknown>;
          const prodObj = itObj.products as { name?: string; code?: string } | null;
          const name =
            prodObj?.name ||
            (itObj.name_snapshot as string) ||
            (itObj.product_name as string) ||
            'Item';
          const code = prodObj?.code || '—';
          const qty = (itObj.quantity as number) || 0;
          const rev = (itObj.line_total_pence as number) || 0;

          const key = (it.product_id as string) || name;
          const existing = productAggMap.get(key);
          if (existing) {
            existing.packsSold += qty;
            existing.revenuePence += rev;
          } else {
            productAggMap.set(key, {
              name,
              code,
              packsSold: qty,
              revenuePence: rev,
            });
          }
        }
      }
    } catch (err) {
      console.warn('Could not fetch report metrics:', err);
    }
  }

  const topProducts = Array.from(productAggMap.values())
    .sort((a, b) => b.revenuePence - a.revenuePence)
    .slice(0, 10)
    .map((p, idx) => ({
      rank: idx + 1,
      name: p.name,
      code: p.code,
      packsSold: p.packsSold,
      revenuePence: p.revenuePence,
    }));

  return {
    period,
    totalRevenueFormatted: formatMoney(totalRevenuePence),
    tradeRevenueFormatted: formatMoney(tradeRevenuePence),
    publicRevenueFormatted: formatMoney(publicRevenuePence),
    topProducts,
    chartPoints: dash.chartPoints,
  };
}

/**
 * Fetch Settings & Admin Users List
 */
export async function getAdminSettings() {
  const delivery = await getAdminDeliverySettings();

  let adminUsers: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    joined: string;
  }> = [];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isConfigured = supabaseUrl && !supabaseUrl.includes('placeholder');

  if (isConfigured) {
    try {
      const adminClient = createAdminClient();

      let emailMap = new Map<string, string>();
      try {
        const { data: usersData } = await adminClient.auth.admin.listUsers();
        if (usersData?.users) {
          emailMap = new Map(usersData.users.map((u) => [u.id, u.email || '']));
        }
      } catch {}

      const { data: adminProfiles } = await adminClient
        .from('profiles')
        .select('*')
        .eq('role', 'admin')
        .order('created_at', { ascending: true });

      if (adminProfiles) {
        adminUsers = adminProfiles.map((p) => ({
          id: p.id,
          name: p.contact_name || p.business_name || 'Administrator',
          email: emailMap.get(p.id) || p.email || '',
          role: 'Administrator',
          joined: new Date(p.created_at).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }),
        }));
      }
    } catch (err) {
      console.warn('Could not fetch admin settings profiles:', err);
    }
  }

  return {
    business: {
      name: "Bits 'N' Bobs Ltd",
      companyNumber: '02891104',
      vatNumber: 'GB 605 8291 04',
      registeredAddress: 'Unit 4, Cheetham Hill Road, Manchester, M8 8EP',
      contactPhone: delivery.contactPhone,
      contactEmail: delivery.contactEmail,
    },
    adminUsers,
  };
}
