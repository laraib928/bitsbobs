-- ==============================================================================
-- 00005_stripe_orders_stock.sql
-- Stripe Orders, Order Items, RLS and Atomic Stock Decrement Function
-- ==============================================================================

-- 1. Orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postcode TEXT NOT NULL,
  billing_same BOOLEAN DEFAULT true,
  subtotal INT NOT NULL,
  delivery_fee INT NOT NULL,
  total INT NOT NULL,
  currency TEXT DEFAULT 'gbp',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled')),
  stripe_payment_intent_id TEXT UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

-- Ensure all columns exist if the table was created previously
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS postcode TEXT,
  ADD COLUMN IF NOT EXISTS billing_same BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS subtotal INT,
  ADD COLUMN IF NOT EXISTS delivery_fee INT,
  ADD COLUMN IF NOT EXISTS total INT,
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'gbp';

-- Add 'pending' and 'failed' to order_status enum if enum is present
DO $$
BEGIN
  ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'pending';
  ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'failed';
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Align column types and constraints: drop default first so type change to TEXT succeeds
DO $$
BEGIN
  ALTER TABLE public.orders ALTER COLUMN status DROP DEFAULT;
  ALTER TABLE public.orders ALTER COLUMN status TYPE TEXT USING status::text;
  ALTER TABLE public.orders ALTER COLUMN status SET DEFAULT 'pending';
  ALTER TABLE public.orders ALTER COLUMN channel DROP NOT NULL;
  ALTER TABLE public.orders ALTER COLUMN contact_name DROP NOT NULL;
  ALTER TABLE public.orders ALTER COLUMN delivery_address DROP NOT NULL;
  ALTER TABLE public.orders ALTER COLUMN billing_address DROP NOT NULL;
  ALTER TABLE public.orders ALTER COLUMN subtotal_pence DROP NOT NULL;
  ALTER TABLE public.orders ALTER COLUMN delivery_pence DROP NOT NULL;
  ALTER TABLE public.orders ALTER COLUMN vat_pence DROP NOT NULL;
  ALTER TABLE public.orders ALTER COLUMN total_pence DROP NOT NULL;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Ensure stripe_payment_intent_id constraint exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_stripe_payment_intent_id_key'
  ) THEN
    ALTER TABLE public.orders ADD CONSTRAINT orders_stripe_payment_intent_id_key UNIQUE (stripe_payment_intent_id);
  END IF;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- 2. Order items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  unit_price INT NOT NULL,
  quantity INT NOT NULL,
  line_total INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist if the table was created previously
ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS product_name TEXT,
  ADD COLUMN IF NOT EXISTS unit_price INT,
  ADD COLUMN IF NOT EXISTS line_total INT;

-- 3. Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Orders SELECT Policy: Logged-in user can select only their own orders; admin can select all
DROP POLICY IF EXISTS "orders_select_policy" ON public.orders;
CREATE POLICY "orders_select_policy" ON public.orders
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR public.is_admin()
  );

-- Order Items SELECT Policy: Logged-in user can select items for their own orders; admin can select all
DROP POLICY IF EXISTS "order_items_select_policy" ON public.order_items;
CREATE POLICY "order_items_select_policy" ON public.order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND (o.user_id = auth.uid() OR public.is_admin())
    )
  );

-- 4. Atomically decrement product stock function
CREATE OR REPLACE FUNCTION public.decrement_stock(order_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item RECORD;
BEGIN
  FOR v_item IN
    SELECT product_id, quantity
    FROM public.order_items
    WHERE order_items.order_id = decrement_stock.order_id
      AND product_id IS NOT NULL
  LOOP
    -- Reduce stock quantity atomically, never dropping below 0
    UPDATE public.stock
    SET packs_in_stock = GREATEST(0, packs_in_stock - v_item.quantity),
        updated_at = NOW()
    WHERE product_id = v_item.product_id;
  END LOOP;
END;
$$;

