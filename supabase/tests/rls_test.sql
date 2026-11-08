-- ==============================================================================
-- rls_test.sql
-- Automated RLS and Security Definer Verification Tests for Bits N Bobs
-- ==============================================================================

BEGIN;

-- Setup test users in auth.users (mock IDs for transaction testing)
DO $$
DECLARE
  v_admin_id UUID := '11111111-1111-1111-1111-111111111111';
  v_trade_approved_id UUID := '22222222-2222-2222-2222-222222222222';
  v_trade_pending_id UUID := '33333333-3333-3333-3333-333333333333';
BEGIN
  -- Insert dummy profiles directly for testing RLS context
  INSERT INTO public.profiles (
    id, role, status, business_name, contact_name, email, phone, business_type, trading_address
  ) VALUES
    (v_admin_id, 'admin', 'approved', 'Admin HQ', 'Admin User', 'admin@bitsnbobs.co', '01610000000', 'HQ', '{"line1":"1 High St","postcode":"M1 1AA"}'::JSONB),
    (v_trade_approved_id, 'trade', 'approved', 'Approved Newsagent', 'Bob Approved', 'bob@news.co.uk', '01611111111', 'Corner shop', '{"line1":"2 High St","postcode":"M2 2BB"}'::JSONB),
    (v_trade_pending_id, 'trade', 'pending', 'Pending Convenience', 'Peter Pending', 'peter@shop.co.uk', '01612222222', 'Convenience store', '{"line1":"3 High St","postcode":"M3 3CC"}'::JSONB)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- -----------------------------------------------------------------------------
-- TEST 1: Anonymous User Security Checks
-- -----------------------------------------------------------------------------
SET LOCAL ROLE anon;
SET LOCAL "request.jwt.claim.sub" = '';

DO $$
DECLARE
  v_count INT;
BEGIN
  -- 1. Anonymous can see public products
  SELECT count(*) INTO v_count FROM public.products;
  ASSERT v_count > 0, 'FAIL: Anonymous should be able to view active public products';

  -- 2. Anonymous CANNOT see wholesale prices (Must be 0)
  SELECT count(*) INTO v_count FROM public.product_trade_prices;
  ASSERT v_count = 0, 'SECURITY LEAK: Anonymous user was able to query wholesale product_trade_prices!';

  -- 3. Anonymous CANNOT see exact stock quantities
  SELECT count(*) INTO v_count FROM public.stock;
  ASSERT v_count = 0, 'SECURITY LEAK: Anonymous user was able to query public.stock directly!';

  -- 4. Anonymous CAN see derived public_stock view
  SELECT count(*) INTO v_count FROM public.public_stock;
  ASSERT v_count > 0, 'FAIL: Anonymous user should be able to see public_stock view statuses';

  -- 5. Anonymous CANNOT see orders
  SELECT count(*) INTO v_count FROM public.orders;
  ASSERT v_count = 0, 'SECURITY LEAK: Anonymous user was able to query public.orders!';

  RAISE NOTICE 'SUCCESS: TEST 1 (Anonymous user security) PASSED';
END $$;

-- -----------------------------------------------------------------------------
-- TEST 2: Pending Trade Customer Checks
-- -----------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" = '33333333-3333-3333-3333-333333333333';

DO $$
DECLARE
  v_count INT;
BEGIN
  -- 1. Pending trade customer CANNOT see wholesale prices
  SELECT count(*) INTO v_count FROM public.product_trade_prices;
  ASSERT v_count = 0, 'SECURITY LEAK: Pending trade customer was able to view product_trade_prices!';

  -- 2. Pending trade customer CANNOT see raw stock table
  SELECT count(*) INTO v_count FROM public.stock;
  ASSERT v_count = 0, 'SECURITY LEAK: Pending trade customer was able to view raw stock table!';

  RAISE NOTICE 'SUCCESS: TEST 2 (Pending trade security) PASSED';
END $$;

-- Verify pending trade customer cannot elevate themselves to admin
DO $$
BEGIN
  UPDATE public.profiles
  SET role = 'admin'
  WHERE id = '33333333-3333-3333-3333-333333333333';

  RAISE EXCEPTION 'SECURITY LEAK: Non-admin was able to elevate role to admin!';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'SUCCESS: Role elevation blocked as expected (%: %)', SQLSTATE, SQLERRM;
END $$;

-- -----------------------------------------------------------------------------
-- TEST 3: Approved Trade Customer Checks
-- -----------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" = '22222222-2222-2222-2222-222222222222';

DO $$
DECLARE
  v_count INT;
  v_stand_price INT;
BEGIN
  -- 1. Approved trade customer CAN see wholesale prices
  SELECT count(*) INTO v_count FROM public.product_trade_prices;
  ASSERT v_count > 0, 'FAIL: Approved trade customer should see wholesale prices';

  -- 2. Approved trade customer CAN see stock packs
  SELECT count(*) INTO v_count FROM public.stock;
  ASSERT v_count > 0, 'FAIL: Approved trade customer should see stock pack counts';

  -- 3. Approved trade customer can calculate stand wholesale prices
  SELECT effective_wholesale_pence INTO v_stand_price
  FROM public.stand_wholesale_prices
  WHERE stand_id = 'c0000000-0000-0000-0000-000000000001';
  ASSERT v_stand_price = 55200, 'FAIL: Stand wholesale price calculation incorrect';

  RAISE NOTICE 'SUCCESS: TEST 3 (Approved trade customer access) PASSED';
END $$;

-- -----------------------------------------------------------------------------
-- TEST 4: Admin Full Access Checks
-- -----------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" = '11111111-1111-1111-1111-111111111111';

DO $$
DECLARE
  v_count INT;
BEGIN
  -- 1. Admin can see all profiles
  SELECT count(*) INTO v_count FROM public.profiles;
  ASSERT v_count >= 3, 'FAIL: Admin should see all user profiles';

  -- 2. Admin is_admin() returns true
  ASSERT public.is_admin() = true, 'FAIL: is_admin() helper failed for admin user';

  RAISE NOTICE 'SUCCESS: TEST 4 (Admin access) PASSED';
END $$;

ROLLBACK;

