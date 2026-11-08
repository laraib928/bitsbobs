-- ==============================================================================
-- seed.sql
-- Seed Data for Bits N Bobs E-Commerce
-- Deterministic UUIDs and idempotent inserts for development and staging
-- ==============================================================================

-- 1. Site Settings
INSERT INTO public.settings (
  id,
  free_delivery_threshold_pence,
  trade_delivery_charge_pence,
  public_delivery_charge_pence,
  vat_rate_bp,
  contact_phone,
  contact_email,
  social_facebook,
  social_instagram,
  social_tiktok
) VALUES (
  1,
  15000, -- £150.00
  499,   -- £4.99
  299,   -- £2.99
  2000,  -- 20%
  '0161 839 5050',
  'sales@bitsnbobs.co',
  'https://www.facebook.com/bitsnbobsuk',
  '#social',
  '#social'
)
ON CONFLICT (id) DO UPDATE SET
  free_delivery_threshold_pence = EXCLUDED.free_delivery_threshold_pence,
  trade_delivery_charge_pence = EXCLUDED.trade_delivery_charge_pence,
  public_delivery_charge_pence = EXCLUDED.public_delivery_charge_pence,
  vat_rate_bp = EXCLUDED.vat_rate_bp,
  contact_phone = EXCLUDED.contact_phone,
  contact_email = EXCLUDED.contact_email;

-- 2. Categories
INSERT INTO public.categories (id, name, slug, parent_id, image_path, sort_order, is_active)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Cosmetics', 'cosmetics', NULL, '/images/false-nails.jpg', 1, true),
  ('a0000000-0000-0000-0000-000000000002', 'Household', 'household', NULL, '/images/potato-peeler.jpg', 2, true),
  ('a0000000-0000-0000-0000-000000000003', 'DIY', 'diy', NULL, '/images/paint-brush.jpg', 3, true),
  ('a0000000-0000-0000-0000-000000000004', 'Kitchenware', 'kitchenware', NULL, '/images/bottle-opener.jpg', 4, true),
  ('a0000000-0000-0000-0000-000000000005', 'Hair products', 'hair-products', NULL, '/images/hair-grips-red.jpg', 5, true),
  ('a0000000-0000-0000-0000-000000000006', 'Party', 'party', NULL, '/images/birthday-candles.jpg', 6, true),
  ('a0000000-0000-0000-0000-000000000007', 'First aid', 'first-aid', NULL, '/images/fingernail-clippers.jpg', 7, true),
  ('a0000000-0000-0000-0000-000000000008', 'Hardware', 'hardware', NULL, '/images/paint-brush.jpg', 8, true),
  ('a0000000-0000-0000-0000-000000000009', 'Stationery', 'stationery', NULL, '/images/emery-boards.jpg', 9, true),
  ('a1000000-0000-0000-0000-000000000001', 'Nail care', 'nail-care', 'a0000000-0000-0000-0000-000000000001', '/images/false-nails.jpg', 10, true),
  ('a1000000-0000-0000-0000-000000000002', 'Hair care', 'hair-care', 'a0000000-0000-0000-0000-000000000001', '/images/hair-grips.jpg', 11, true),
  ('a1000000-0000-0000-0000-000000000003', 'Combs and brushes', 'combs-and-brushes', 'a0000000-0000-0000-0000-000000000001', '/images/vent-brush.jpg', 12, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  parent_id = EXCLUDED.parent_id,
  image_path = EXCLUDED.image_path,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

-- 3. Products
INSERT INTO public.products (
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
  visible_to_trade,
  is_active
) VALUES
  (
    'b0000000-0000-0000-0000-000000000001',
    'Hair Grips',
    'hair-grips',
    '321',
    '[EAN barcode]',
    'a1000000-0000-0000-0000-000000000002',
    'Strong black grips that stay put',
    'Black hair grips in a handy pack to keep in your bag, bathroom or car. [Stand description and dimensions from client]',
    ARRAY['Firm grip', 'Black finish blends with dark hair', 'Handy hanging pack', 'Pack contents: [Number of grips per pack]'],
    99,
    NULL,
    true,
    false,
    false,
    true,
    true,
    true
  ),
  (
    'b0000000-0000-0000-0000-000000000002',
    'Nit Combs',
    'nit-combs',
    '307',
    '[EAN barcode]',
    'a1000000-0000-0000-0000-000000000003',
    'Fine teeth for school-term checks',
    'Durable fine-toothed nit comb. Essential for school-term family checks. [Stand description and dimensions from client]',
    ARRAY['Fine teeth precision', 'Ergonomic grip', 'Easy to clean and sterilise', 'Hanging blister pack'],
    99,
    NULL,
    true,
    false,
    false,
    true,
    true,
    true
  ),
  (
    'b0000000-0000-0000-0000-000000000003',
    'Nail Scissors',
    'nail-scissors',
    '309',
    '[EAN barcode]',
    'a1000000-0000-0000-0000-000000000001',
    'Curved blades for a neat trim',
    'Stainless steel curved nail scissors for precise trimming of fingernails and cuticles.',
    ARRAY['Curved precision blades', 'Stainless steel construction', 'Comfortable finger loops', 'Pre-priced hanging pack'],
    99,
    NULL,
    true,
    false,
    false,
    true,
    true,
    true
  ),
  (
    'b0000000-0000-0000-0000-000000000004',
    'Birthday Candles',
    'birthday-candles',
    '314',
    '[EAN barcode]',
    'a0000000-0000-0000-0000-000000000006',
    '24 spiral candles for any cake',
    'Bright spiral party candles with holders included. A must-have convenience line.',
    ARRAY['24 spiral candles', 'Candle holders included', 'Bright assorted party colours', 'Safe burn'],
    99,
    NULL,
    true,
    false,
    false,
    true,
    true,
    true
  ),
  (
    'b0000000-0000-0000-0000-000000000005',
    'False Nails',
    'false-nails',
    '302',
    '[EAN barcode]',
    'a1000000-0000-0000-0000-000000000001',
    'Salon look at home',
    'Ready-to-wear false nails giving an effortless salon look at home.',
    ARRAY['Natural comfortable fit', 'Easy to apply and file', 'Assorted nail sizes included', 'High-gloss finish'],
    99,
    NULL,
    false,
    true,
    false,
    true,
    true,
    true
  ),
  (
    'b0000000-0000-0000-0000-000000000006',
    'Large Vent Brush',
    'large-vent-brush',
    '318',
    '[EAN barcode]',
    'a1000000-0000-0000-0000-000000000003',
    'Faster blow-drying',
    'Vented design allows airflow directly through the brush for fast blow-drying and styling.',
    ARRAY['Vented tunnel for airflow', 'Ball-tipped protective bristles', 'Non-slip handle', 'Antistatic'],
    99,
    NULL,
    false,
    true,
    false,
    true,
    true,
    true
  ),
  (
    'b0000000-0000-0000-0000-000000000007',
    'Nail File Sapphire',
    'nail-file-sapphire',
    '305',
    '[EAN barcode]',
    'a1000000-0000-0000-0000-000000000001',
    'With handy protective case',
    'Dual-surface sapphire nail file with durable protective sheath.',
    ARRAY['Dual grit coarse and fine sides', 'Integrated cuticle pusher tip', 'Protective sleeve included', 'Washable and long lasting'],
    99,
    NULL,
    false,
    true,
    false,
    true,
    true,
    true
  ),
  (
    'b0000000-0000-0000-0000-000000000008',
    'Stainless Steel Toenail Clippers',
    'stainless-steel-toenail-clippers',
    '308',
    '[EAN barcode]',
    'a1000000-0000-0000-0000-000000000001',
    'Stainless steel, wide jaw',
    'Heavy-duty wide jaw toenail clippers for tough and thick nails.',
    ARRAY['Wide straight cutting edge', 'Heavy-duty leverage arm', 'Stainless steel', 'Hanging card pack'],
    99,
    NULL,
    false,
    true,
    false,
    true,
    true,
    true
  ),
  (
    'b0000000-0000-0000-0000-000000000009',
    'Paint Brush',
    'paint-brush',
    '335',
    '[EAN barcode]',
    'a0000000-0000-0000-0000-000000000003',
    'For small jobs and touch-ups',
    'Handy multi-purpose paintbrush suitable for touch-up work and everyday painting jobs.',
    ARRAY['Synthetic bristles for smooth finish', 'Rust-resistant ferrule', 'Comfortable wooden handle', 'Easy cleanup'],
    99,
    79,
    false,
    false,
    true,
    true,
    true,
    true
  ),
  (
    'b0000000-0000-0000-0000-000000000010',
    'Waiter''s Friend Opener',
    'waiters-friend-opener',
    '340',
    '[EAN barcode]',
    'a0000000-0000-0000-0000-000000000004',
    'Corkscrew and bottle opener',
    'Traditional 3-in-1 corkscrew, crown cap bottle opener and foil cutter.',
    ARRAY['Heavy-duty corkscrew spiral', 'Crown cap bottle lifter', 'Serrated foil cutter', 'Fold-away pocket design'],
    99,
    79,
    false,
    false,
    true,
    true,
    true,
    true
  ),
  (
    'b0000000-0000-0000-0000-000000000011',
    'Nail Glue',
    'nail-glue',
    '304',
    '[EAN barcode]',
    'a1000000-0000-0000-0000-000000000001',
    'Quick-setting, precise nozzle',
    'Fast-acting professional-grade nail adhesive for artificial nails and tip repair.',
    ARRAY['Bonds in seconds', 'Precision nozzle applicator', 'Water resistant hold', 'Compact safety cap bottle'],
    99,
    79,
    false,
    false,
    true,
    true,
    true,
    true
  ),
  (
    'b0000000-0000-0000-0000-000000000012',
    'Gents Comb',
    'gents-comb',
    '312',
    '[EAN barcode]',
    'a1000000-0000-0000-0000-000000000003',
    'Pocket size, strong teeth',
    'Classic gents pocket styling comb with fine and coarse teeth sections.',
    ARRAY['Durable smooth rounded teeth', 'Pocket size 12cm length', 'Antistatic material', 'Handy everyday comb'],
    99,
    79,
    false,
    false,
    true,
    true,
    true,
    true
  ),
  (
    'b0000000-0000-0000-0000-000000000013',
    'Nail Emery Boards, pack of 5',
    'nail-emery-boards-pack-of-5',
    '303',
    '[EAN barcode]',
    'a1000000-0000-0000-0000-000000000001',
    'Pack of 5 dual-sided boards',
    'Set of 5 double-sided emery boards for gentle shaping and smoothing.',
    ARRAY['5 boards per hanging card', 'Dual grit surface', 'Flexible wooden core', 'Essential daily nail care'],
    99,
    NULL,
    false,
    false,
    false,
    true,
    true,
    true
  ),
  (
    'b0000000-0000-0000-0000-000000000014',
    'Tweezers',
    'tweezers',
    '306',
    '[EAN barcode]',
    'a1000000-0000-0000-0000-000000000001',
    'Slanted tip for precision',
    'Hand-filed slanted tip stainless steel tweezers for eyebrow shaping and splinter removal.',
    ARRAY['Precision slanted tips', 'Optimal calibrated tension', 'Stainless steel', 'Protective tip guard included'],
    99,
    NULL,
    false,
    false,
    false,
    true,
    true,
    true
  ),
  (
    'b0000000-0000-0000-0000-000000000015',
    'Stainless Steel Fingernail Clippers',
    'stainless-steel-fingernail-clippers',
    '301',
    '[EAN barcode]',
    'a1000000-0000-0000-0000-000000000001',
    'Clean curved cut',
    'Classic chrome-finished fingernail clippers with fold-out file and cleaner.',
    ARRAY['Sharp curved cutting jaw', 'Built-in foldout nail file', 'Keyring loop attachment', 'Carded for peg display'],
    99,
    NULL,
    false,
    false,
    false,
    true,
    true,
    true
  ),
  (
    'b0000000-0000-0000-0000-000000000016',
    'Radial Hair Brush',
    'radial-hair-brush',
    '317',
    '[EAN barcode]',
    'a1000000-0000-0000-0000-000000000002',
    'For volume and styling',
    'Round styling barrel brush for smoothing, curls and adding root volume.',
    ARRAY['Round barrel for blow styling', 'Flexible nylon bristles', 'Ergonomic grip handle', 'Heat resistant'],
    99,
    NULL,
    false,
    false,
    false,
    true,
    true,
    true
  ),
  (
    'b0000000-0000-0000-0000-000000000017',
    'Handle Comb',
    'handle-comb',
    '315',
    '[EAN barcode]',
    'a1000000-0000-0000-0000-000000000003',
    'Easy grip daily detangling',
    'Large detangling rake comb with ergonomic handle for wet or dry hair.',
    ARRAY['Wide spacing teeth for detangling', 'Comfort grip handle', 'Gentle on scalp', 'Hanging slot on pack'],
    99,
    NULL,
    false,
    false,
    false,
    true,
    true,
    true
  ),
  (
    'b0000000-0000-0000-0000-000000000018',
    'Potato Peeler',
    'potato-peeler',
    '341',
    '[EAN barcode]',
    'a0000000-0000-0000-0000-000000000004',
    'Swivel blade vegetable peeler',
    'Stainless steel swivel blade potato and vegetable peeler with integrated eye remover.',
    ARRAY['Swivel stainless steel blade', 'Potato eye remover tip', 'Comfortable lightweight handle', 'Dishwasher safe'],
    99,
    NULL,
    false,
    false,
    false,
    true,
    true,
    true
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  code = EXCLUDED.code,
  category_id = EXCLUDED.category_id,
  short_line = EXCLUDED.short_line,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  retail_price_pence = EXCLUDED.retail_price_pence,
  offer_price_pence = EXCLUDED.offer_price_pence,
  is_best_seller = EXCLUDED.is_best_seller,
  is_new_arrival = EXCLUDED.is_new_arrival,
  is_special_offer = EXCLUDED.is_special_offer,
  visible_to_public = EXCLUDED.visible_to_public,
  visible_to_trade = EXCLUDED.visible_to_trade,
  is_active = EXCLUDED.is_active;

-- 4. Product Trade Prices (Wholesale: 6 units/pack, £3.32 ex VAT)
INSERT INTO public.product_trade_prices (product_id, wholesale_pack_price_pence, units_per_pack, min_packs)
SELECT
  p.id,
  332, -- £3.32
  6,
  1
FROM public.products p
ON CONFLICT (product_id) DO UPDATE SET
  wholesale_pack_price_pence = EXCLUDED.wholesale_pack_price_pence,
  units_per_pack = EXCLUDED.units_per_pack,
  min_packs = EXCLUDED.min_packs;

-- 5. Product Images
INSERT INTO public.product_images (product_id, path, alt, sort_order)
VALUES
  ('b0000000-0000-0000-0000-000000000001', '/images/hair-grips.jpg', 'Hair Grips Black', 0),
  ('b0000000-0000-0000-0000-000000000001', '/images/hair-grips-red.jpg', 'Hair Grips Red Card', 1),
  ('b0000000-0000-0000-0000-000000000002', '/images/nit-comb.jpg', 'Nit Combs', 0),
  ('b0000000-0000-0000-0000-000000000003', '/images/nail-scissors.jpg', 'Nail Scissors', 0),
  ('b0000000-0000-0000-0000-000000000004', '/images/birthday-candles.jpg', 'Birthday Candles', 0),
  ('b0000000-0000-0000-0000-000000000005', '/images/false-nails.jpg', 'False Nails', 0),
  ('b0000000-0000-0000-0000-000000000006', '/images/vent-brush.jpg', 'Large Vent Brush', 0),
  ('b0000000-0000-0000-0000-000000000007', '/images/sapphire-file.jpg', 'Nail File Sapphire', 0),
  ('b0000000-0000-0000-0000-000000000008', '/images/toenail-clippers.jpg', 'Stainless Steel Toenail Clippers', 0),
  ('b0000000-0000-0000-0000-000000000009', '/images/paint-brush.jpg', 'Paint Brush', 0),
  ('b0000000-0000-0000-0000-000000000010', '/images/bottle-opener.jpg', 'Waiter''s Friend Opener', 0),
  ('b0000000-0000-0000-0000-000000000011', '/images/nail-glue.jpg', 'Nail Glue', 0),
  ('b0000000-0000-0000-0000-000000000012', '/images/gents-comb.jpg', 'Gents Comb', 0),
  ('b0000000-0000-0000-0000-000000000013', '/images/emery-boards.jpg', 'Nail Emery Boards', 0),
  ('b0000000-0000-0000-0000-000000000014', '/images/tweezers.jpg', 'Tweezers', 0),
  ('b0000000-0000-0000-0000-000000000015', '/images/fingernail-clippers.jpg', 'Stainless Steel Fingernail Clippers', 0),
  ('b0000000-0000-0000-0000-000000000016', '/images/radial-brush.jpg', 'Radial Hair Brush', 0),
  ('b0000000-0000-0000-0000-000000000017', '/images/handle-comb.jpg', 'Handle Comb', 0),
  ('b0000000-0000-0000-0000-000000000018', '/images/potato-peeler.jpg', 'Potato Peeler', 0)
ON CONFLICT DO NOTHING;

-- 6. Stock Quantities
INSERT INTO public.stock (product_id, packs_in_stock, low_stock_at)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 18, 20),
  ('b0000000-0000-0000-0000-000000000002', 24, 10),
  ('b0000000-0000-0000-0000-000000000003', 25, 10),
  ('b0000000-0000-0000-0000-000000000004', 12, 15),
  ('b0000000-0000-0000-0000-000000000005', 0, 10),  -- Out of stock demo
  ('b0000000-0000-0000-0000-000000000006', 20, 10),
  ('b0000000-0000-0000-0000-000000000007', 30, 10),
  ('b0000000-0000-0000-0000-000000000008', 22, 10),
  ('b0000000-0000-0000-0000-000000000009', 35, 10),
  ('b0000000-0000-0000-0000-000000000010', 28, 10),
  ('b0000000-0000-0000-0000-000000000011', 14, 15),
  ('b0000000-0000-0000-0000-000000000012', 40, 10),
  ('b0000000-0000-0000-0000-000000000013', 32, 10),
  ('b0000000-0000-0000-0000-000000000014', 9, 15),   -- Low stock demo
  ('b0000000-0000-0000-0000-000000000015', 26, 10),
  ('b0000000-0000-0000-0000-000000000016', 19, 10),
  ('b0000000-0000-0000-0000-000000000017', 24, 10),
  ('b0000000-0000-0000-0000-000000000018', 30, 10)
ON CONFLICT (product_id) DO UPDATE SET
  packs_in_stock = EXCLUDED.packs_in_stock,
  low_stock_at = EXCLUDED.low_stock_at;

-- 7. Display Stands
INSERT INTO public.stands (
  id,
  name,
  slug,
  description,
  image_path,
  stand_unit_price_pence,
  fixed_price_pence,
  is_active
) VALUES (
  'c0000000-0000-0000-0000-000000000001',
  '80 Hook Display Stand',
  '80-hook-display-stand',
  'A freestanding Bits N Bobs stand, delivered full of fast-selling lines. Every pack is pre-priced and bar-coded, ready to sell from day one. [Stand description and dimensions from client]',
  '/images/stand.jpg',
  12000, -- £120.00 stand hardware
  55200, -- £552.00 fixed package price
  true
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  image_path = EXCLUDED.image_path,
  stand_unit_price_pence = EXCLUDED.stand_unit_price_pence,
  fixed_price_pence = EXCLUDED.fixed_price_pence;

-- 8. Stand Items (Products pre-loaded onto the stand)
INSERT INTO public.stand_items (stand_id, product_id, packs)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 4), -- Hair Grips
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 4), -- Nit Combs
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 3), -- Nail Scissors
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004', 3), -- Birthday Candles
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000009', 2), -- Paint Brush
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000010', 2), -- Bottle Opener
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000011', 2), -- Nail Glue
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000014', 2), -- Tweezers
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000005', 2), -- False Nails
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000018', 2)  -- Potato Peeler
ON CONFLICT DO NOTHING;

-- 9. Customer & Retailer Reviews
INSERT INTO public.reviews (id, product_id, rating, body, author_name, town, is_approved)
VALUES
  ('d0000000-0000-0000-0000-000000000001', NULL, 5, '[Customer review text]', '[Customer name]', '[town]', true),
  ('d0000000-0000-0000-0000-000000000002', NULL, 5, '[Customer review text]', '[Customer name]', '[town]', true),
  ('d0000000-0000-0000-0000-000000000003', NULL, 5, '[Retailer testimonial text]', '[Shop name]', '[town]', true)
ON CONFLICT (id) DO UPDATE SET
  rating = EXCLUDED.rating,
  body = EXCLUDED.body,
  author_name = EXCLUDED.author_name,
  town = EXCLUDED.town,
  is_approved = EXCLUDED.is_approved;

-- 10. Home Demo Videos
INSERT INTO public.product_videos (id, product_id, url, title, sort_order, show_on_home)
VALUES
  ('e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000005', '#demo-false-nails', 'How to apply false nails', 0, true),
  ('e0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', '#demo-nit-comb', 'Nit comb in 30 seconds', 1, true),
  ('e0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000004', '#demo-candles', 'Party candle hacks', 2, true),
  ('e0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000011', '#demo-nail-glue', 'Fixing it with nail glue', 3, true)
ON CONFLICT (id) DO UPDATE SET
  url = EXCLUDED.url,
  title = EXCLUDED.title,
  sort_order = EXCLUDED.sort_order,
  show_on_home = EXCLUDED.show_on_home;

-- 11. Promotions
INSERT INTO public.promotions (id, title, description, audience, starts_at, ends_at, is_active)
VALUES
  ('f0000000-0000-0000-0000-000000000001', 'Free Trade Delivery', 'Free carriage on trade orders over £150 ex VAT', 'trade', NOW(), NOW() + INTERVAL '10 years', true),
  ('f0000000-0000-0000-0000-000000000002', 'Special Offers On Selected Lines', 'Great value on essential convenience lines', 'both', NOW(), NOW() + INTERVAL '10 years', true)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  audience = EXCLUDED.audience,
  starts_at = EXCLUDED.starts_at,
  ends_at = EXCLUDED.ends_at,
  is_active = EXCLUDED.is_active;

