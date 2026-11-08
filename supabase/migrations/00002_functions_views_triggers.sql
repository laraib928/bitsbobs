-- ==============================================================================
-- 00002_functions_views_triggers.sql
-- Security Definer Helpers, Triggers, Views & Inventory Functions
-- ==============================================================================

-- 1. Helper Function: is_admin()
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

-- 2. Helper Function: is_approved_trade()
CREATE OR REPLACE FUNCTION public.is_approved_trade()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND (status = 'approved' OR role = 'admin')
  );
$$;

-- 3. Automatic Profile Creation Trigger on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_trading_address JSONB;
  v_delivery_address JSONB;
BEGIN
  v_trading_address := COALESCE(NEW.raw_user_meta_data->'trading_address', '{}'::JSONB);
  v_delivery_address := NEW.raw_user_meta_data->'delivery_address';

  INSERT INTO public.profiles (
    id,
    role,
    status,
    business_name,
    contact_name,
    email,
    phone,
    business_type,
    trading_address,
    delivery_address,
    symbol_group,
    vat_number,
    company_number,
    notes
  ) VALUES (
    NEW.id,
    'trade',
    'pending',
    COALESCE(NEW.raw_user_meta_data->>'business_name', 'Pending Business'),
    COALESCE(NEW.raw_user_meta_data->>'contact_name', 'Contact Name'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'business_type', 'Convenience store'),
    v_trading_address,
    v_delivery_address,
    NEW.raw_user_meta_data->>'symbol_group',
    NEW.raw_user_meta_data->>'vat_number',
    NEW.raw_user_meta_data->>'company_number',
    NEW.raw_user_meta_data->>'notes'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Prevent Non-Admin Role/Status Elevation Trigger
CREATE OR REPLACE FUNCTION public.prevent_profile_role_elevation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If the user modifying the row is NOT an admin
  IF NOT public.is_admin() THEN
    IF (OLD.role IS DISTINCT FROM NEW.role) OR
       (OLD.status IS DISTINCT FROM NEW.status) OR
       (OLD.approved_at IS DISTINCT FROM NEW.approved_at) OR
       (OLD.approved_by IS DISTINCT FROM NEW.approved_by) THEN
      RAISE EXCEPTION 'Permission denied: non-administrators cannot change role or approval status.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_profile_elevation ON public.profiles;
CREATE TRIGGER trg_prevent_profile_elevation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_role_elevation();

-- 5. Public Stock Derived View (Hides exact stock numbers from public)
CREATE OR REPLACE VIEW public.public_stock WITH (security_invoker = false) AS
SELECT
  s.product_id,
  CASE
    WHEN s.packs_in_stock <= 0 THEN 'out_of_stock'
    WHEN s.packs_in_stock <= s.low_stock_at THEN 'low_stock'
    ELSE 'in_stock'
  END AS status
FROM public.stock s
JOIN public.products p ON p.id = s.product_id
WHERE p.is_active = true AND p.visible_to_public = true;

GRANT SELECT ON public.public_stock TO anon, authenticated;

-- 6. Stand Wholesale Prices Calculation View (Security Invoker, only trade/admin can select)
CREATE OR REPLACE VIEW public.stand_wholesale_prices WITH (security_invoker = true) AS
SELECT
  st.id AS stand_id,
  COALESCE(st.stand_unit_price_pence, 0) +
  COALESCE(
    SUM(si.packs * ptp.wholesale_pack_price_pence),
    0
  )::INT AS calculated_wholesale_pence,
  st.fixed_price_pence,
  COALESCE(
    st.fixed_price_pence,
    COALESCE(st.stand_unit_price_pence, 0) + COALESCE(SUM(si.packs * ptp.wholesale_pack_price_pence), 0)::INT
  ) AS effective_wholesale_pence
FROM public.stands st
LEFT JOIN public.stand_items si ON si.stand_id = st.id
LEFT JOIN public.product_trade_prices ptp ON ptp.product_id = si.product_id
GROUP BY st.id, st.stand_unit_price_pence, st.fixed_price_pence;

-- 7. Idempotent Stock Decrementing Function for Stripe Webhook
CREATE OR REPLACE FUNCTION public.decrement_stock_on_paid_order(p_order_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item RECORD;
  v_stand_item RECORD;
BEGIN
  -- Process direct product order items
  FOR v_item IN
    SELECT product_id, quantity, stand_id
    FROM public.order_items
    WHERE order_id = p_order_id
  LOOP
    IF v_item.product_id IS NOT NULL THEN
      UPDATE public.stock
      SET packs_in_stock = GREATEST(0, packs_in_stock - v_item.quantity)
      WHERE product_id = v_item.product_id;
    END IF;

    -- If this line item was a display stand, decrement each product on the stand
    IF v_item.stand_id IS NOT NULL THEN
      FOR v_stand_item IN
        SELECT product_id, (packs * v_item.quantity) AS total_stand_packs
        FROM public.stand_items
        WHERE stand_id = v_item.stand_id
      LOOP
        UPDATE public.stock
        SET packs_in_stock = GREATEST(0, packs_in_stock - v_stand_item.total_stand_packs)
        WHERE product_id = v_stand_item.product_id;
      END LOOP;
    END IF;
  END LOOP;
END;
$$;

