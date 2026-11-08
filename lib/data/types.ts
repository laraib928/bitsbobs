export type Product = {
  id: string;
  slug: string;
  name: string;
  code: string;
  barcode?: string;
  categoryId: string;
  shortLine: string;
  description: string;
  features: string[];
  images: string[];
  videoUrl?: string;
  retailPricePence: number; // public RRP incl. VAT (e.g. 99)
  wholesalePackPricePence: number; // trade only, ex VAT (e.g. 332)
  unitsPerPack: number; // default 6
  minPacks: number; // default 1
  stockPacks: number;
  lowStockAt: number;
  flags: {
    bestSeller?: boolean;
    newArrival?: boolean;
    specialOffer?: boolean;
  };
  offerPricePence?: number;
  visibleToPublic: boolean;
  visibleToTrade: boolean;
  seoTitle?: string;
  seoDescription?: string;
};

export type Stand = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  items: { productId: string; packs: number }[];
  standUnitPricePence?: number;
  fixedPricePence?: number;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  image: string;
  subcategories?: string[];
  subCategoryIds?: string[];
};

export type Order = {
  id: string;
  date: string;
  customerName: string;
  customerType: 'Trade' | 'Guest';
  itemsCountDescription: string;
  totalFormatted: string;
  status: string;
  time?: string;
  statusBg?: string;
  statusFg?: string;
};

export type DashboardStats = {
  kpis: { label: string; value: string; note: string; noteColor: string }[];
  bars: { t: string; g: string }[];
  lowStock: {
    name: string;
    left: string;
    sold: string;
    color: string;
    img: string;
  }[];
  latestOrders: Order[];
  accountApprovals: { shop: string; meta: string }[];
  standRequests: {
    shop: string;
    meta: string;
    status: string;
    bg: string;
    fg: string;
  }[];
};

export type CustomerReview = {
  id: string;
  text: string;
  author: string;
  kind: string;
  rating: number;
};

export type VideoDemo = {
  id: string;
  title: string;
  image: string;
  slug: string;
};

