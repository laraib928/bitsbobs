import { createClient, createAdminClient } from '@/lib/supabase/server';
import { calculateTradeProfit, formatMoney } from '@/lib/money';
import { CATEGORIES, PRODUCTS } from './mock-data';
import type { Category, Product } from './types';

export interface TradeProfile {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  role: string;
  status: string;
  initials: string;
}

export interface TradeSubCategory {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export interface TradePromotion {
  id: string;
  title: string;
  description: string;
  targetHref: string;
}

export interface TradeLastOrderLine {
  productId: string;
  name: string;
  image: string;
  sku: string;
  packPricePence: number;
  retailPricePence: number;
  unitsPerPack: number;
  packs: number;
}

export interface TradeLastOrder {
  orderNumber: number;
  totalPacks: number;
  items: TradeLastOrderLine[];
}

export interface TradeShopData {
  profile?: TradeProfile | null;
  categories: Category[];
  currentCategory: Category;
  subcategories: TradeSubCategory[];
  products: Product[];
  activePromotion: TradePromotion | null;
  lastOrder?: TradeLastOrder | null;
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
 * Fetch all data required for the trade shop pages
 */
export async function getTradeShopData(categorySlug = 'all'): Promise<TradeShopData> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isConfigured = supabaseUrl && !supabaseUrl.includes('placeholder');

  // Fallback profile
  let profile: TradeProfile = {
    id: 'demo-trade-id',
    businessName: 'Station Road Convenience',
    contactName: 'Sam Reynolds',
    email: 'sales@bitsnbobs.co',
    role: 'trade',
    status: 'approved',
    initials: 'SR',
  };

  let activePromotion: TradePromotion | null = null;
  let lastOrder: TradeLastOrder | null = null;
  let categories: Category[] = [...CATEGORIES];
  let products: Product[] = [...PRODUCTS];
  let subcategories: TradeSubCategory[] = [];

  if (isConfigured) {
    try {
      const supabase = await createClient();
      const adminClient = createAdminClient();

      // 1. Get logged-in user profile
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('id, business_name, contact_name, email, role, status')
          .eq('id', user.id)
          .maybeSingle();

        if (prof) {
          profile = {
            id: prof.id,
            businessName: prof.business_name || 'Trade Customer',
            contactName: prof.contact_name || 'Retailer',
            email: prof.email,
            role: prof.role,
            status: prof.status,
            initials: getInitials(prof.business_name || 'Trade Customer'),
          };
        }
      } else {
        // Look up the first trade profile in database for local development convenience
        const { data: firstTrade } = await adminClient
          .from('profiles')
          .select('id, business_name, contact_name, email, role, status')
          .eq('role', 'trade')
          .limit(1)
          .maybeSingle();

        if (firstTrade) {
          profile = {
            id: firstTrade.id,
            businessName: firstTrade.business_name,
            contactName: firstTrade.contact_name,
            email: firstTrade.email,
            role: firstTrade.role,
            status: firstTrade.status,
            initials: getInitials(firstTrade.business_name),
          };
        }
      }

      // 2. Query categories from DB
      const { data: dbCategories } = await adminClient
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (dbCategories && dbCategories.length > 0) {
        const mainCats = dbCategories.filter((c) => !c.parent_id);
        categories = mainCats.map((c) => {
          const childCats = dbCategories.filter((sub) => sub.parent_id === c.id);
          return {
            id: c.id,
            slug: c.slug,
            name: c.name,
            image: c.image_path,
            subcategories: childCats.map((sub) => sub.name),
            subCategoryIds: childCats.flatMap((sub) => [sub.id, sub.slug]),
          };
        });
      }

      // 3. Query active trade promotion
      const now = new Date().toISOString();
      const { data: promoList } = await adminClient
        .from('promotions')
        .select('*')
        .eq('is_active', true)
        .in('audience', ['trade', 'both'])
        .lte('starts_at', now)
        .gte('ends_at', now)
        .order('created_at', { ascending: false })
        .limit(1);

      if (promoList && promoList.length > 0) {
        const p = promoList[0];
        let targetHref = '/trade/stands';
        if (p.category_id) {
          const matchedCat = dbCategories?.find((c) => c.id === p.category_id);
          if (matchedCat) targetHref = `/trade/shop/${matchedCat.slug}`;
        }
        activePromotion = {
          id: p.id,
          title: p.title,
          description: p.description,
          targetHref,
        };
      }

      // 4. Query products with trade prices, images & stock
      const { data: dbProducts } = await adminClient
        .from('products')
        .select(`
          id,
          name,
          slug,
          code,
          barcode,
          category_id,
          short_line,
          description,
          features,
          retail_price_pence,
          offer_price_pence,
          is_best_seller,
          is_new_arrival,
          is_special_offer,
          visible_to_trade,
          is_active,
          product_trade_prices (
            wholesale_pack_price_pence,
            units_per_pack,
            min_packs
          ),
          product_images (
            path,
            sort_order
          ),
          stock (
            packs_in_stock,
            low_stock_at
          )
        `)
        .eq('is_active', true)
        .eq('visible_to_trade', true);

      if (dbProducts && dbProducts.length > 0) {
        products = dbProducts.map((p) => {
          const tradePrice = (p.product_trade_prices as any)?.[0] || (p.product_trade_prices as any);
          const stock = (p.stock as any)?.[0] || (p.stock as any);
          const imagesList = ((p.product_images as any) || [])
            .sort((a: any, b: any) => a.sort_order - b.sort_order)
            .map((img: any) => img.path);

          const wholesalePackPricePence = tradePrice?.wholesale_pack_price_pence || 332;
          const unitsPerPack = tradePrice?.units_per_pack || 6;
          const minPacks = tradePrice?.min_packs || 1;
          const stockPacks = typeof stock?.packs_in_stock === 'number' ? stock.packs_in_stock : 20;
          const lowStockAt = typeof stock?.low_stock_at === 'number' ? stock.low_stock_at : 10;

          return {
            id: p.id,
            slug: p.slug,
            name: p.name,
            code: p.code,
            barcode: p.barcode || undefined,
            categoryId: p.category_id,
            shortLine: p.short_line,
            description: p.description,
            features: p.features || [],
            images: imagesList.length > 0 ? imagesList : ['/images/false-nails.jpg'],
            retailPricePence: p.retail_price_pence,
            wholesalePackPricePence,
            unitsPerPack,
            minPacks,
            stockPacks,
            lowStockAt,
            flags: {
              bestSeller: p.is_best_seller,
              newArrival: p.is_new_arrival,
              specialOffer: p.is_special_offer,
            },
            offerPricePence: p.offer_price_pence || undefined,
            visibleToPublic: true,
            visibleToTrade: p.visible_to_trade,
          };
        });
      }

      // 5. Query last order for the retailer
      const targetUserId = profile.id !== 'demo-trade-id' ? profile.id : null;
      let orderQuery = adminClient
        .from('orders')
        .select(`
          id,
          order_number,
          created_at,
          order_items (
            product_id,
            quantity,
            unit_price_pence
          )
        `)
        .eq('channel', 'trade')
        .order('created_at', { ascending: false })
        .limit(1);

      if (targetUserId) {
        orderQuery = orderQuery.eq('user_id', targetUserId);
      }

      const { data: ordersList } = await orderQuery;
      if (ordersList && ordersList.length > 0) {
        const ord = ordersList[0];
        const rawItems = (ord.order_items as any) || [];
        const items: TradeLastOrderLine[] = [];
        let totalPacks = 0;

        for (const item of rawItems) {
          const matchedProd = products.find((prod) => prod.id === item.product_id);
          // Only add products that are active and in stock
          if (matchedProd && matchedProd.stockPacks > 0) {
            items.push({
              productId: matchedProd.id,
              name: matchedProd.name,
              image: matchedProd.images[0] || '/images/false-nails.jpg',
              sku: matchedProd.code,
              packPricePence: matchedProd.wholesalePackPricePence,
              retailPricePence: matchedProd.retailPricePence,
              unitsPerPack: matchedProd.unitsPerPack,
              packs: item.quantity,
            });
            totalPacks += item.quantity;
          }
        }

        if (items.length > 0) {
          lastOrder = {
            orderNumber: ord.order_number,
            totalPacks,
            items,
          };
        }
      }
    } catch (err) {
      console.error('Error fetching trade shop data from Supabase:', err);
    }
  }

  // Determine current category
  const currentCategory =
    categorySlug && categorySlug !== 'all'
      ? categories.find((c) => c.slug === categorySlug || c.id === categorySlug) || {
          id: categorySlug,
          slug: categorySlug,
          name: categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1).replace(/-/g, ' '),
          image: '/images/false-nails.jpg',
        }
      : {
          id: 'all',
          slug: 'all',
          name: 'All products',
          image: '/images/false-nails.jpg',
        };

  // Find sub-categories for current category (either from DB parent_id or mock subcategories)
  if (isConfigured && currentCategory.id !== 'all') {
    try {
      const adminClient = createAdminClient();
      const { data: dbSubCats } = await adminClient
        .from('categories')
        .select('id, name, slug')
        .eq('parent_id', currentCategory.id)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (dbSubCats && dbSubCats.length > 0) {
        subcategories = dbSubCats.map((sub) => {
          const count = products.filter((p) => p.categoryId === sub.id).length;
          return {
            id: sub.id,
            name: sub.name,
            slug: sub.slug,
            count,
          };
        });
      }
    } catch {}
  }

  // Fallback subcategories if empty
  if (subcategories.length === 0 && (currentCategory.id === 'cosmetics' || currentCategory.id === 'all')) {
    subcategories = [
      {
        id: 'nail-care',
        name: 'Nail care',
        slug: 'nail-care',
        count: 8,
      },
      {
        id: 'hair-care',
        name: 'Hair care',
        slug: 'hair-care',
        count: 2,
      },
      {
        id: 'combs-and-brushes',
        name: 'Combs and brushes',
        slug: 'combs-and-brushes',
        count: 4,
      },
    ];
  }

  if (!activePromotion) {
    activePromotion = {
      id: 'f0000000-0000-0000-0000-000000000001',
      title: 'Free Display Stand Offer',
      description:
        'Order our fastest-selling retail range of 80 different lines and get a FREE display stand worth over £100.',
      targetHref: '/trade/stands',
    };
  }

  return {
    profile,
    categories,
    currentCategory,
    subcategories,
    products,
    activePromotion,
    lastOrder,
  };
}

/**
 * Fetch catalog data for public retail shop pages
 */
export async function getPublicShopData(categorySlug?: string): Promise<TradeShopData> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isConfigured = supabaseUrl && !supabaseUrl.includes('placeholder');

  let activePromotion: TradePromotion | null = null;
  let categories: Category[] = [...CATEGORIES];
  let products: Product[] = [...PRODUCTS];
  let subcategories: TradeSubCategory[] = [];

  if (isConfigured) {
    try {
      const adminClient = createAdminClient();

      // 1. Query categories
      const { data: dbCategories } = await adminClient
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (dbCategories && dbCategories.length > 0) {
        const mainCats = dbCategories.filter((c) => !c.parent_id);
        categories = mainCats.map((c) => {
          const childCats = dbCategories.filter((sub) => sub.parent_id === c.id);
          return {
            id: c.id,
            slug: c.slug,
            name: c.name,
            image: c.image_path,
            subcategories: childCats.map((sub) => sub.name),
            subCategoryIds: childCats.flatMap((sub) => [sub.id, sub.slug]),
          };
        });
      }

      // 2. Query active public promotion
      const now = new Date().toISOString();
      const { data: promoList } = await adminClient
        .from('promotions')
        .select('*')
        .eq('is_active', true)
        .in('audience', ['public', 'both'])
        .lte('starts_at', now)
        .gte('ends_at', now)
        .order('created_at', { ascending: false })
        .limit(1);

      if (promoList && promoList.length > 0) {
        const p = promoList[0];
        let targetHref = '/products';
        if (p.category_id) {
          const matchedCat = dbCategories?.find((c) => c.id === p.category_id);
          if (matchedCat) targetHref = `/shop/${matchedCat.slug}`;
        }
        activePromotion = {
          id: p.id,
          title: p.title,
          description: p.description,
          targetHref,
        };
      }

      // 3. Query public products with images and stock
      const { data: dbProducts } = await adminClient
        .from('products')
        .select(`
          id,
          name,
          slug,
          code,
          barcode,
          category_id,
          short_line,
          description,
          features,
          retail_price_pence,
          offer_price_pence,
          is_best_seller,
          is_new_arrival,
          is_special_offer,
          visible_to_public,
          is_active,
          product_trade_prices (
            wholesale_pack_price_pence,
            units_per_pack,
            min_packs
          ),
          product_images (
            path,
            sort_order
          ),
          stock (
            packs_in_stock,
            low_stock_at
          )
        `)
        .eq('is_active', true)
        .eq('visible_to_public', true);

      if (dbProducts && dbProducts.length > 0) {
        products = dbProducts.map((p) => {
          const tradePrice = (p.product_trade_prices as any)?.[0] || (p.product_trade_prices as any);
          const stock = (p.stock as any)?.[0] || (p.stock as any);
          const imagesList = ((p.product_images as any) || [])
            .sort((a: any, b: any) => a.sort_order - b.sort_order)
            .map((img: any) => img.path);

          const wholesalePackPricePence = tradePrice?.wholesale_pack_price_pence || 332;
          const unitsPerPack = tradePrice?.units_per_pack || 6;
          const minPacks = tradePrice?.min_packs || 1;
          const stockPacks = typeof stock?.packs_in_stock === 'number' ? stock.packs_in_stock : 20;
          const lowStockAt = typeof stock?.low_stock_at === 'number' ? stock.low_stock_at : 10;

          return {
            id: p.id,
            slug: p.slug,
            name: p.name,
            code: p.code,
            barcode: p.barcode || undefined,
            categoryId: p.category_id,
            shortLine: p.short_line,
            description: p.description,
            features: p.features || [],
            images: imagesList.length > 0 ? imagesList : ['/images/false-nails.jpg'],
            retailPricePence: p.retail_price_pence,
            wholesalePackPricePence,
            unitsPerPack,
            minPacks,
            stockPacks,
            lowStockAt,
            flags: {
              bestSeller: p.is_best_seller,
              newArrival: p.is_new_arrival,
              specialOffer: p.is_special_offer,
            },
            offerPricePence: p.offer_price_pence || undefined,
            visibleToPublic: true,
            visibleToTrade: false,
          };
        });
      }
    } catch (err) {
      console.error('Error fetching public shop data from Supabase:', err);
    }
  }

  // Determine currentCategory
  const currentCategory =
    categorySlug && categorySlug !== 'all'
      ? categories.find((c) => c.slug === categorySlug || c.id === categorySlug) || {
          id: categorySlug,
          slug: categorySlug,
          name: categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1).replace(/-/g, ' '),
          image: '/images/false-nails.jpg',
        }
      : {
          id: 'all',
          slug: 'all',
          name: 'All Products',
          image: '/images/false-nails.jpg',
        };

  // Find sub-categories for current category
  if (isConfigured && currentCategory.id !== 'all') {
    try {
      const adminClient = createAdminClient();
      const { data: dbSubCats } = await adminClient
        .from('categories')
        .select('id, name, slug')
        .eq('parent_id', currentCategory.id)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (dbSubCats && dbSubCats.length > 0) {
        subcategories = dbSubCats.map((sub) => {
          const count = products.filter((p) => p.categoryId === sub.id).length;
          return {
            id: sub.id,
            name: sub.name,
            slug: sub.slug,
            count,
          };
        });
      }
    } catch {}
  }

  // Fallback subcategories if empty
  if (subcategories.length === 0 && (currentCategory.id === 'cosmetics' || currentCategory.id === 'all')) {
    subcategories = [
      {
        id: 'nail-care',
        name: 'Nail care',
        slug: 'nail-care',
        count: 8,
      },
      {
        id: 'hair-care',
        name: 'Hair care',
        slug: 'hair-care',
        count: 2,
      },
      {
        id: 'combs-and-brushes',
        name: 'Combs and brushes',
        slug: 'combs-and-brushes',
        count: 4,
      },
    ];
  }

  return {
    profile: null,
    categories,
    currentCategory,
    subcategories,
    products,
    activePromotion,
    lastOrder: null,
  };
}

