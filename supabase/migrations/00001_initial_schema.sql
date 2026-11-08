-- ==============================================================================
-- 00001_initial_schema.sql
-- Bits N Bobs E-Commerce Database Schema
-- ==============================================================================

-- 1. Create Enums
CREATE TYPE public.user_role AS ENUM ('trade', 'admin');
CREATE TYPE public.account_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE public.order_channel AS ENUM ('public', 'trade');
CREATE TYPE public.order_status AS ENUM (
  'pending_payment',
  'paid',
  'packing',
  'dispatched',
  'delivered',
  'cancelled',
  'refunded'
);
CREATE TYPE public.promo_audience AS ENUM ('public', 'trade', 'both');

-- 2. Updated_at Trigger Function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Profiles Table (1 row per auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.user_role NOT NULL DEFAULT 'trade',
  status public.account_status NOT NULL DEFAULT 'pending',
  business_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  business_type TEXT NOT NULL,
  trading_address JSONB NOT NULL,
  delivery_address JSONB,
  symbol_group TEXT,
  vat_number TEXT,
  company_number TEXT,
  notes TEXT,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 4. Categories Table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  image_path TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 5. Products Table (Retail prices only)
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  code TEXT NOT NULL,
  barcode TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE RESTRICT,
  short_line TEXT NOT NULL,
  description TEXT NOT NULL,
  features TEXT[] NOT NULL DEFAULT '{}',
  retail_price_pence INT NOT NULL, -- Public RRP incl. VAT
  visible_to_public BOOLEAN NOT NULL DEFAULT true,
  visible_to_trade BOOLEAN NOT NULL DEFAULT true,
  is_best_seller BOOLEAN NOT NULL DEFAULT false,
  is_new_arrival BOOLEAN NOT NULL DEFAULT false,
  is_special_offer BOOLEAN NOT NULL DEFAULT false,
  offer_price_pence INT,
  seo_title TEXT,
  seo_description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true, -- false = discontinued
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 6. Product Trade Prices Table (Separated for security and RLS isolation)
CREATE TABLE public.product_trade_prices (
  product_id UUID PRIMARY KEY REFERENCES public.products(id) ON DELETE CASCADE,
  wholesale_pack_price_pence INT NOT NULL, -- Trade only, ex VAT
  units_per_pack INT NOT NULL DEFAULT 6,
  min_packs INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_product_trade_prices_updated_at
  BEFORE UPDATE ON public.product_trade_prices
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 7. Product Images Table
CREATE TABLE public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  alt TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Product Videos Table (Supports product demos and standalone home page demos)
CREATE TABLE public.product_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  show_on_home BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Stock Table (Internal stock numbers)
CREATE TABLE public.stock (
  product_id UUID PRIMARY KEY REFERENCES public.products(id) ON DELETE CASCADE,
  packs_in_stock INT NOT NULL DEFAULT 0,
  low_stock_at INT NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_stock_updated_at
  BEFORE UPDATE ON public.stock
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 10. Display Stands Table
CREATE TABLE public.stands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  image_path TEXT NOT NULL,
  stand_unit_price_pence INT,
  fixed_price_pence INT, -- If set, overrides calculated wholesale price
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_stands_updated_at
  BEFORE UPDATE ON public.stands
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 11. Stand Items Table
CREATE TABLE public.stand_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stand_id UUID NOT NULL REFERENCES public.stands(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  packs INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Promotions Table
CREATE TABLE public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  audience public.promo_audience NOT NULL DEFAULT 'both',
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 year'),
  is_active BOOLEAN NOT NULL DEFAULT true,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Customer Reviews Table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  body TEXT NOT NULL,
  author_name TEXT NOT NULL,
  town TEXT NOT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Settings Table (Single row configuration)
CREATE TABLE public.settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  free_delivery_threshold_pence INT NOT NULL DEFAULT 15000, -- £150.00
  trade_delivery_charge_pence INT NOT NULL DEFAULT 499,      -- £4.99
  public_delivery_charge_pence INT NOT NULL DEFAULT 299,     -- £2.99
  vat_rate_bp INT NOT NULL DEFAULT 2000,                     -- 2000 bp = 20.00%
  contact_phone TEXT NOT NULL DEFAULT '0161 839 5050',
  contact_email TEXT NOT NULL DEFAULT 'sales@bitsnbobs.co',
  social_facebook TEXT DEFAULT 'https://www.facebook.com/bitsnbobsuk',
  social_instagram TEXT DEFAULT '#social',
  social_tiktok TEXT DEFAULT '#social',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. Orders Table
CREATE SEQUENCE public.order_number_seq START WITH 10483;

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number INT NOT NULL DEFAULT nextval('public.order_number_seq'),
  channel public.order_channel NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  delivery_address JSONB NOT NULL,
  billing_address JSONB NOT NULL,
  subtotal_pence INT NOT NULL,
  delivery_pence INT NOT NULL,
  vat_pence INT NOT NULL,
  total_pence INT NOT NULL,
  status public.order_status NOT NULL DEFAULT 'pending_payment',
  stripe_checkout_session_id TEXT,
  stripe_payment_intent_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 16. Order Items Table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  stand_id UUID REFERENCES public.stands(id) ON DELETE SET NULL,
  name_snapshot TEXT NOT NULL,
  quantity INT NOT NULL,
  unit_price_pence INT NOT NULL,
  line_total_pence INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. Stand Requests Table
CREATE TABLE public.stand_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  shop_name TEXT,
  meta TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'New',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

