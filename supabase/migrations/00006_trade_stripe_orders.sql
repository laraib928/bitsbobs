-- ==============================================================================
-- 00006_trade_stripe_orders.sql
-- Add order_type to orders and stripe_customer_id to profiles
-- ==============================================================================

-- 1. Add order_type column to public.orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS order_type TEXT DEFAULT 'retail' CHECK (order_type IN ('retail', 'trade'));

-- Backfill existing orders based on channel
UPDATE public.orders
SET order_type = CASE
  WHEN channel = 'trade' THEN 'trade'
  ELSE 'retail'
END
WHERE order_type IS NULL;

-- 2. Add stripe_customer_id to public.profiles for trade users
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- 3. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_order_type ON public.orders(order_type);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id);

