-- ==============================================================================
-- 00003_rls_policies.sql
-- Row Level Security (RLS) Policies for Bits N Bobs E-Commerce
-- ==============================================================================

-- 1. Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_trade_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stand_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stand_requests ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 2. Profiles Policies
-- ==============================================================================
-- Users can read their own profile
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR public.is_admin());

-- Users can update their own contact details (triggers prevent role elevation)
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR public.is_admin())
  WITH CHECK (id = auth.uid() OR public.is_admin());

-- Admin full access (insert/delete)
CREATE POLICY "profiles_admin_all"
  ON public.profiles
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==============================================================================
-- 3. Categories Policies
-- ==============================================================================
-- Public can view active categories
CREATE POLICY "categories_select_public"
  ON public.categories
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true OR public.is_admin());

-- Admin can manage categories
CREATE POLICY "categories_admin_all"
  ON public.categories
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==============================================================================
-- 4. Products Policies
-- ==============================================================================
-- Public can view active, public products
CREATE POLICY "products_select_public"
  ON public.products
  FOR SELECT
  TO anon, authenticated
  USING (
    (is_active = true AND visible_to_public = true)
    OR (is_active = true AND visible_to_trade = true AND public.is_approved_trade())
    OR public.is_admin()
  );

-- Admin can manage products
CREATE POLICY "products_admin_all"
  ON public.products
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==============================================================================
-- 5. Product Trade Prices Policies (Strict RLS Isolation)
-- ==============================================================================
-- Only approved trade customers and admins can view wholesale trade prices
CREATE POLICY "trade_prices_select_approved_trade"
  ON public.product_trade_prices
  FOR SELECT
  TO authenticated
  USING (public.is_approved_trade() OR public.is_admin());

-- Admin can manage trade prices
CREATE POLICY "trade_prices_admin_all"
  ON public.product_trade_prices
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==============================================================================
-- 6. Product Images Policies
-- ==============================================================================
-- Public can view all product images
CREATE POLICY "product_images_select_public"
  ON public.product_images
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admin can manage product images
CREATE POLICY "product_images_admin_all"
  ON public.product_images
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==============================================================================
-- 7. Product Videos Policies
-- ==============================================================================
-- Public can view videos
CREATE POLICY "product_videos_select_public"
  ON public.product_videos
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admin can manage videos
CREATE POLICY "product_videos_admin_all"
  ON public.product_videos
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==============================================================================
-- 8. Stock Policies
-- ==============================================================================
-- Only approved trade customers can view actual pack numbers (public uses public_stock view)
CREATE POLICY "stock_select_approved_trade"
  ON public.stock
  FOR SELECT
  TO authenticated
  USING (public.is_approved_trade() OR public.is_admin());

-- Admin can manage stock
CREATE POLICY "stock_admin_all"
  ON public.stock
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==============================================================================
-- 9. Stands Policies
-- ==============================================================================
-- Public can view active stands
CREATE POLICY "stands_select_public"
  ON public.stands
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true OR public.is_admin());

-- Admin can manage stands
CREATE POLICY "stands_admin_all"
  ON public.stands
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==============================================================================
-- 10. Stand Items Policies
-- ==============================================================================
-- Approved trade and admin can view stand items
CREATE POLICY "stand_items_select_approved_trade"
  ON public.stand_items
  FOR SELECT
  TO authenticated
  USING (public.is_approved_trade() OR public.is_admin());

-- Admin can manage stand items
CREATE POLICY "stand_items_admin_all"
  ON public.stand_items
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==============================================================================
-- 11. Promotions Policies
-- ==============================================================================
-- Public can view active public promotions
CREATE POLICY "promotions_select_public"
  ON public.promotions
  FOR SELECT
  TO anon, authenticated
  USING (
    (is_active = true AND starts_at <= NOW() AND ends_at >= NOW() AND audience IN ('public', 'both'))
    OR (is_active = true AND starts_at <= NOW() AND ends_at >= NOW() AND public.is_approved_trade())
    OR public.is_admin()
  );

-- Admin can manage promotions
CREATE POLICY "promotions_admin_all"
  ON public.promotions
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==============================================================================
-- 12. Reviews Policies
-- ==============================================================================
-- Anyone can view approved reviews
CREATE POLICY "reviews_select_approved"
  ON public.reviews
  FOR SELECT
  TO anon, authenticated
  USING (is_approved = true OR public.is_admin());

-- Anyone can submit a review with is_approved = false
CREATE POLICY "reviews_insert_public"
  ON public.reviews
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (is_approved = false);

-- Admin can manage reviews
CREATE POLICY "reviews_admin_all"
  ON public.reviews
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==============================================================================
-- 13. Settings Policies
-- ==============================================================================
-- Everyone can read site settings
CREATE POLICY "settings_select_all"
  ON public.settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admin can update settings
CREATE POLICY "settings_update_admin"
  ON public.settings
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==============================================================================
-- 14. Orders Policies
-- ==============================================================================
-- Users can view their own orders
CREATE POLICY "orders_select_own"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

-- Users can insert their own orders
CREATE POLICY "orders_insert_authenticated"
  ON public.orders
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- Admin can manage all orders
CREATE POLICY "orders_admin_all"
  ON public.orders
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==============================================================================
-- 15. Order Items Policies
-- ==============================================================================
-- Users can view order items for their own orders
CREATE POLICY "order_items_select_own"
  ON public.order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND (o.user_id = auth.uid() OR public.is_admin())
    )
  );

-- Users can insert order items for their own orders
CREATE POLICY "order_items_insert_authenticated"
  ON public.order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND (o.user_id = auth.uid() OR public.is_admin())
    )
  );

-- Admin can manage order items
CREATE POLICY "order_items_admin_all"
  ON public.order_items
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==============================================================================
-- 16. Stand Requests Policies
-- ==============================================================================
-- Users can view their own requests
CREATE POLICY "stand_requests_select_own"
  ON public.stand_requests
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

-- Anyone can submit a stand request
CREATE POLICY "stand_requests_insert_all"
  ON public.stand_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admin can manage all stand requests
CREATE POLICY "stand_requests_admin_all"
  ON public.stand_requests
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

