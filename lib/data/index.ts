import { createClient } from '@supabase/supabase-js';
import {
  CATEGORIES,
  DASHBOARD_STATS,
  MOCK_ORDERS,
  PRODUCTS,
  REVIEWS,
  STANDS,
  VIDEO_DEMOS,
} from './mock-data';
import {
  Category,
  CustomerReview,
  DashboardStats,
  Order,
  Product,
  Stand,
  VideoDemo,
} from './types';

export * from './types';
export * from './mock-data';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabase() {
  if (!supabaseUrl || !serviceKey || supabaseUrl.includes('placeholder')) {
    return null;
  }
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function mapDbProduct(p: any): Product {
  const tradePrice = Array.isArray(p.product_trade_prices)
    ? p.product_trade_prices[0]
    : p.product_trade_prices;
  const stock = Array.isArray(p.stock) ? p.stock[0] : p.stock;
  const images = Array.isArray(p.product_images)
    ? p.product_images
        .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((img: any) => img.path)
    : [];
  const video = Array.isArray(p.product_videos)
    ? p.product_videos[0]?.url
    : p.product_videos?.url;

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    code: p.code || '',
    barcode: p.barcode || undefined,
    categoryId: p.category_id,
    shortLine: p.short_line || p.name,
    description: p.description || '',
    features: p.features || [],
    images: images.length > 0 ? images : ['/images/false-nails.jpg'],
    retailPricePence: p.retail_price_pence,
    wholesalePackPricePence: tradePrice?.wholesale_pack_price_pence || 332,
    offerPricePence: p.offer_price_pence || undefined,
    unitsPerPack: tradePrice?.units_per_pack || 6,
    minPacks: tradePrice?.min_packs || 1,
    stockPacks: typeof stock?.packs_in_stock === 'number' ? stock.packs_in_stock : 0,
    lowStockAt: typeof stock?.low_stock_at === 'number' ? stock.low_stock_at : 10,
    flags: {
      bestSeller: !!p.is_best_seller,
      newArrival: !!p.is_new_arrival,
      specialOffer: !!p.is_special_offer,
    },
    visibleToPublic: p.visible_to_public !== false,
    visibleToTrade: p.visible_to_trade !== false,
    videoUrl: video || undefined,
    seoTitle: p.seo_title || undefined,
    seoDescription: p.seo_description || undefined,
  };
}

export async function getProducts(options?: {
  categoryId?: string;
  flag?: 'bestSeller' | 'newArrival' | 'specialOffer';
  tradeOnly?: boolean;
}): Promise<Product[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          product_trade_prices (*),
          stock (*),
          product_images (*),
          product_videos (*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (options?.tradeOnly) {
        query = query.eq('visible_to_trade', true);
      }

      if (options?.flag === 'bestSeller') {
        query = query.eq('is_best_seller', true);
      } else if (options?.flag === 'newArrival') {
        query = query.eq('is_new_arrival', true);
      } else if (options?.flag === 'specialOffer') {
        query = query.eq('is_special_offer', true);
      }

      const { data: dbProducts, error } = await query;
      if (!error && dbProducts && dbProducts.length > 0) {
        let list = dbProducts.map(mapDbProduct);
        if (options?.categoryId) {
          list = list.filter((p) => p.categoryId === options.categoryId);
        }
        return list;
      }
    } catch (e) {
      console.warn('Could not fetch products from Supabase:', e);
    }
  }

  let list = [...PRODUCTS];

  if (options?.categoryId) {
    list = list.filter((p) => p.categoryId === options.categoryId);
  }

  if (options?.flag) {
    list = list.filter((p) => p.flags[options.flag!]);
  }

  return list;
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          slug
        );
      let query = supabase
        .from('products')
        .select(`
          *,
          product_trade_prices (*),
          stock (*),
          product_images (*),
          product_videos (*)
        `);

      if (isUuid) {
        query = query.or(`id.eq.${slug},slug.eq.${slug}`);
      } else {
        query = query.eq('slug', slug);
      }

      const { data: dbProd, error } = await query.maybeSingle();
      if (!error && dbProd) {
        return mapDbProduct(dbProd);
      }
    } catch (e) {
      console.warn('Could not fetch product from Supabase:', e);
    }
  }

  return PRODUCTS.find((p) => p.slug === slug || p.id === slug);
}

export async function getCategories(): Promise<Category[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data: dbCats, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (!error && dbCats && dbCats.length > 0) {
        const mainCats = dbCats.filter((c) => !c.parent_id);
        return mainCats.map((c) => {
          const children = dbCats.filter((sub) => sub.parent_id === c.id);
          return {
            id: c.id,
            slug: c.slug,
            name: c.name,
            image: c.image_path,
            subcategories: children.map((sub) => sub.name),
            subCategoryIds: children.flatMap((sub) => [sub.id, sub.slug]),
          };
        });
      }
    } catch (e) {
      console.warn('Could not fetch categories from Supabase:', e);
    }
  }

  return CATEGORIES;
}

export async function getCategory(slug: string): Promise<Category | undefined> {
  const allCategories = await getCategories();
  return allCategories.find((c) => c.slug === slug || c.id === slug);
}

export async function getStands(): Promise<Stand[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('stands')
        .select(`
          *,
          stand_items (product_id, packs)
        `)
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((s) => ({
          id: s.id,
          name: s.name,
          slug: s.slug,
          description: s.description || '',
          image: s.image_path || '/images/stand.jpg',
          items: (s.stand_items || []).map((it: any) => ({
            productId: it.product_id,
            packs: it.packs || 1,
          })),
          standUnitPricePence: s.stand_unit_price_pence,
          fixedPricePence: s.fixed_price_pence,
        }));
      }
    } catch (e) {
      console.warn('Could not fetch stands from Supabase:', e);
    }
  }
  return STANDS;
}

export async function getStand(slug: string): Promise<Stand | undefined> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
      let query = supabase
        .from('stands')
        .select(`
          *,
          stand_items (product_id, packs)
        `);

      if (isUuid) {
        query = query.or(`id.eq.${slug},slug.eq.${slug}`);
      } else {
        query = query.eq('slug', slug);
      }

      const { data, error } = await query.maybeSingle();
      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          slug: data.slug,
          description: data.description || '',
          image: data.image_path || '/images/stand.jpg',
          items: (data.stand_items || []).map((it: any) => ({
            productId: it.product_id,
            packs: it.packs || 1,
          })),
          standUnitPricePence: data.stand_unit_price_pence,
          fixedPricePence: data.fixed_price_pence,
        };
      }
    } catch (e) {
      console.warn('Could not fetch stand from Supabase:', e);
    }
  }
  return STANDS.find((s) => s.slug === slug || s.id === slug);
}

export async function getOrders(): Promise<Order[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        return data as unknown as Order[];
      }
    } catch (e) {
      console.warn('Could not fetch orders from Supabase:', e);
    }
  }
  return MOCK_ORDERS;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return DASHBOARD_STATS;
}

export async function getReviews(): Promise<CustomerReview[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((r: any) => ({
          id: r.id,
          author: r.author_name || r.author || 'Verified Buyer',
          rating: r.rating || 5,
          text: r.body || r.text || '',
          kind: r.town || 'Verified Buyer',
        }));
      }
    } catch (e) {
      console.warn('Could not fetch reviews from Supabase:', e);
    }
  }
  return REVIEWS;
}

export async function getVideoDemos(): Promise<VideoDemo[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('product_videos')
        .select(`
          id,
          title,
          url,
          sort_order,
          products (
            slug,
            product_images (path, sort_order)
          )
        `)
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((v: any) => {
          const prod = v.products;
          const sortedImgs = (prod?.product_images || []).sort(
            (a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
          );
          const image = sortedImgs[0]?.path || '/images/false-nails.jpg';
          return {
            id: v.id,
            title: v.title,
            image,
            slug: prod?.slug || 'shop',
          };
        });
      }
    } catch (e) {
      console.warn('Could not fetch video demos from Supabase:', e);
    }
  }
  return VIDEO_DEMOS;
}

