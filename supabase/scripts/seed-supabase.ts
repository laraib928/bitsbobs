import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!url || !key) {
  console.error('Missing Supabase URL or Service Role Key');
  process.exit(1);
}

const supabase = createClient(url, key);

async function seed() {
  console.log('Seeding Supabase database...');

  // 1. Settings
  const { error: errSettings } = await supabase.from('settings').upsert({
    id: 1,
    free_delivery_threshold_pence: 15000,
    trade_delivery_charge_pence: 499,
    public_delivery_charge_pence: 299,
    vat_rate_bp: 2000,
    contact_phone: '0161 839 5050',
    contact_email: 'sales@bitsnbobs.co',
    social_facebook: 'https://www.facebook.com/bitsnbobsuk',
  });
  if (errSettings) console.error('Settings error:', errSettings);
  else console.log('✓ Settings seeded');

  // 2. Main Categories
  const categories = [
    { id: 'a0000000-0000-0000-0000-000000000001', name: 'Cosmetics', slug: 'cosmetics', image_path: '/images/false-nails.jpg', sort_order: 1, is_active: true, parent_id: null },
    { id: 'a0000000-0000-0000-0000-000000000002', name: 'Household', slug: 'household', image_path: '/images/potato-peeler.jpg', sort_order: 2, is_active: true, parent_id: null },
    { id: 'a0000000-0000-0000-0000-000000000003', name: 'DIY', slug: 'diy', image_path: '/images/paint-brush.jpg', sort_order: 3, is_active: true, parent_id: null },
    { id: 'a0000000-0000-0000-0000-000000000004', name: 'Kitchenware', slug: 'kitchenware', image_path: '/images/bottle-opener.jpg', sort_order: 4, is_active: true, parent_id: null },
    { id: 'a0000000-0000-0000-0000-000000000005', name: 'Hair products', slug: 'hair-products', image_path: '/images/hair-grips-red.jpg', sort_order: 5, is_active: true, parent_id: null },
    { id: 'a0000000-0000-0000-0000-000000000006', name: 'Party', slug: 'party', image_path: '/images/birthday-candles.jpg', sort_order: 6, is_active: true, parent_id: null },
    { id: 'a0000000-0000-0000-0000-000000000007', name: 'First aid', slug: 'first-aid', image_path: '/images/fingernail-clippers.jpg', sort_order: 7, is_active: true, parent_id: null },
    { id: 'a0000000-0000-0000-0000-000000000008', name: 'Hardware', slug: 'hardware', image_path: '/images/paint-brush.jpg', sort_order: 8, is_active: true, parent_id: null },
    { id: 'a0000000-0000-0000-0000-000000000009', name: 'Stationery', slug: 'stationery', image_path: '/images/emery-boards.jpg', sort_order: 9, is_active: true, parent_id: null },
  ];

  // Sub-categories for Cosmetics
  const subCategories = [
    { id: 'a1000000-0000-0000-0000-000000000001', name: 'Nail care', slug: 'nail-care', image_path: '/images/false-nails.jpg', sort_order: 10, is_active: true, parent_id: 'a0000000-0000-0000-0000-000000000001' },
    { id: 'a1000000-0000-0000-0000-000000000002', name: 'Hair care', slug: 'hair-care', image_path: '/images/hair-grips.jpg', sort_order: 11, is_active: true, parent_id: 'a0000000-0000-0000-0000-000000000001' },
    { id: 'a1000000-0000-0000-0000-000000000003', name: 'Combs and brushes', slug: 'combs-and-brushes', image_path: '/images/vent-brush.jpg', sort_order: 12, is_active: true, parent_id: 'a0000000-0000-0000-0000-000000000001' },
  ];

  const allCategories = [...categories, ...subCategories];
  const { error: errCats } = await supabase.from('categories').upsert(allCategories);
  if (errCats) console.error('Categories error:', errCats);
  else console.log(`✓ ${allCategories.length} Categories seeded`);

  // 3. Products
  const products = [
    {
      id: 'b0000000-0000-0000-0000-000000000001',
      name: 'Hair Grips',
      slug: 'hair-grips',
      code: '321',
      category_id: 'a1000000-0000-0000-0000-000000000002', // Hair care
      short_line: 'Strong black grips that stay put',
      description: 'Black hair grips in a handy pack to keep in your bag, bathroom or car.',
      features: ['Firm grip', 'Black finish blends with dark hair', 'Handy hanging pack'],
      retail_price_pence: 99,
      is_best_seller: true,
      is_new_arrival: false,
      is_special_offer: false,
      visible_to_public: true,
      visible_to_trade: true,
      is_active: true,
    },
    {
      id: 'b0000000-0000-0000-0000-000000000002',
      name: 'Nit Combs',
      slug: 'nit-combs',
      code: '307',
      category_id: 'a1000000-0000-0000-0000-000000000003', // Combs and brushes
      short_line: 'Fine teeth for school-term checks',
      description: 'Durable fine-toothed nit comb. Essential for school-term family checks.',
      features: ['Fine teeth precision', 'Ergonomic grip', 'Easy to clean'],
      retail_price_pence: 99,
      is_best_seller: true,
      is_new_arrival: false,
      is_special_offer: false,
      visible_to_public: true,
      visible_to_trade: true,
      is_active: true,
    },
    {
      id: 'b0000000-0000-0000-0000-000000000003',
      name: 'Nail Scissors',
      slug: 'nail-scissors',
      code: '309',
      category_id: 'a1000000-0000-0000-0000-000000000001', // Nail care
      short_line: 'Curved blades for a neat trim',
      description: 'Stainless steel curved nail scissors for precise trimming of fingernails and cuticles.',
      features: ['Curved precision blades', 'Stainless steel construction', 'Comfortable finger loops'],
      retail_price_pence: 99,
      is_best_seller: true,
      is_new_arrival: false,
      is_special_offer: false,
      visible_to_public: true,
      visible_to_trade: true,
      is_active: true,
    },
    {
      id: 'b0000000-0000-0000-0000-000000000004',
      name: 'Birthday Candles',
      slug: 'birthday-candles',
      code: '314',
      category_id: 'a0000000-0000-0000-0000-000000000006', // Party
      short_line: '24 spiral candles for any cake',
      description: 'Bright spiral party candles with holders included. A must-have convenience line.',
      features: ['24 spiral candles', 'Candle holders included', 'Bright assorted party colours'],
      retail_price_pence: 99,
      is_best_seller: true,
      is_new_arrival: false,
      is_special_offer: false,
      visible_to_public: true,
      visible_to_trade: true,
      is_active: true,
    },
    {
      id: 'b0000000-0000-0000-0000-000000000005',
      name: 'False Nails',
      slug: 'false-nails',
      code: '302',
      category_id: 'a1000000-0000-0000-0000-000000000001', // Nail care
      short_line: 'Salon look at home',
      description: 'Ready-to-wear false nails giving an effortless salon look at home.',
      features: ['Natural comfortable fit', 'Easy to apply and file', 'High-gloss finish'],
      retail_price_pence: 99,
      is_best_seller: false,
      is_new_arrival: true,
      is_special_offer: false,
      visible_to_public: true,
      visible_to_trade: true,
      is_active: true,
    },
    {
      id: 'b0000000-0000-0000-0000-000000000006',
      name: 'Large Vent Brush',
      slug: 'large-vent-brush',
      code: '318',
      category_id: 'a1000000-0000-0000-0000-000000000003', // Combs and brushes
      short_line: 'Faster blow-drying',
      description: 'Vented design allows airflow directly through the brush for fast blow-drying and styling.',
      features: ['Vented tunnel for airflow', 'Ball-tipped protective bristles', 'Non-slip handle'],
      retail_price_pence: 99,
      is_best_seller: false,
      is_new_arrival: true,
      is_special_offer: false,
      visible_to_public: true,
      visible_to_trade: true,
      is_active: true,
    },
    {
      id: 'b0000000-0000-0000-0000-000000000007',
      name: 'Nail File Sapphire',
      slug: 'nail-file-sapphire',
      code: '305',
      category_id: 'a1000000-0000-0000-0000-000000000001', // Nail care
      short_line: 'With handy protective case',
      description: 'Dual-surface sapphire nail file with durable protective sheath.',
      features: ['Dual grit coarse and fine sides', 'Integrated cuticle pusher tip'],
      retail_price_pence: 99,
      is_best_seller: false,
      is_new_arrival: true,
      is_special_offer: false,
      visible_to_public: true,
      visible_to_trade: true,
      is_active: true,
    },
    {
      id: 'b0000000-0000-0000-0000-000000000008',
      name: 'Stainless Steel Toenail Clippers',
      slug: 'stainless-steel-toenail-clippers',
      code: '308',
      category_id: 'a1000000-0000-0000-0000-000000000001', // Nail care
      short_line: 'Stainless steel, wide jaw',
      description: 'Heavy-duty wide jaw toenail clippers for tough and thick nails.',
      features: ['Wide straight cutting edge', 'Heavy-duty leverage arm', 'Stainless steel'],
      retail_price_pence: 99,
      is_best_seller: false,
      is_new_arrival: true,
      is_special_offer: false,
      visible_to_public: true,
      visible_to_trade: true,
      is_active: true,
    },
    {
      id: 'b0000000-0000-0000-0000-000000000009',
      name: 'Paint Brush',
      slug: 'paint-brush',
      code: '335',
      category_id: 'a0000000-0000-0000-0000-000000000003', // DIY
      short_line: 'For small jobs and touch-ups',
      description: 'Handy multi-purpose paintbrush suitable for touch-up work and everyday painting jobs.',
      features: ['Synthetic bristles', 'Rust-resistant ferrule'],
      retail_price_pence: 99,
      offer_price_pence: 79,
      is_best_seller: false,
      is_new_arrival: false,
      is_special_offer: true,
      visible_to_public: true,
      visible_to_trade: true,
      is_active: true,
    },
    {
      id: 'b0000000-0000-0000-0000-000000000010',
      name: "Waiter's Friend Opener",
      slug: 'waiters-friend-opener',
      code: '340',
      category_id: 'a0000000-0000-0000-0000-000000000004', // Kitchenware
      short_line: 'Corkscrew and bottle opener',
      description: 'Traditional 3-in-1 corkscrew, crown cap bottle opener and foil cutter.',
      features: ['Heavy-duty corkscrew', 'Crown cap bottle lifter', 'Foil cutter'],
      retail_price_pence: 99,
      offer_price_pence: 79,
      is_best_seller: false,
      is_new_arrival: false,
      is_special_offer: true,
      visible_to_public: true,
      visible_to_trade: true,
      is_active: true,
    },
    {
      id: 'b0000000-0000-0000-0000-000000000011',
      name: 'Nail Glue',
      slug: 'nail-glue',
      code: '304',
      category_id: 'a1000000-0000-0000-0000-000000000001', // Nail care
      short_line: 'Quick-setting, precise nozzle',
      description: 'Fast-acting professional-grade nail adhesive for artificial nails and tip repair.',
      features: ['Bonds in seconds', 'Precision nozzle applicator'],
      retail_price_pence: 99,
      offer_price_pence: 79,
      is_best_seller: false,
      is_new_arrival: false,
      is_special_offer: true,
      visible_to_public: true,
      visible_to_trade: true,
      is_active: true,
    },
    {
      id: 'b0000000-0000-0000-0000-000000000012',
      name: 'Gents Comb',
      slug: 'gents-comb',
      code: '312',
      category_id: 'a1000000-0000-0000-0000-000000000003', // Combs and brushes
      short_line: 'Pocket size, strong teeth',
      description: 'Classic gents pocket styling comb with fine and coarse teeth sections.',
      features: ['Durable smooth teeth', 'Pocket size', 'Antistatic'],
      retail_price_pence: 99,
      offer_price_pence: 79,
      is_best_seller: false,
      is_new_arrival: false,
      is_special_offer: true,
      visible_to_public: true,
      visible_to_trade: true,
      is_active: true,
    },
    {
      id: 'b0000000-0000-0000-0000-000000000013',
      name: 'Nail Emery Boards, pack of 5',
      slug: 'nail-emery-boards-pack-of-5',
      code: '303',
      category_id: 'a1000000-0000-0000-0000-000000000001', // Nail care
      short_line: 'Pack of 5 dual-sided boards',
      description: 'Set of 5 double-sided emery boards for gentle shaping and smoothing.',
      features: ['5 boards per pack', 'Dual grit surface'],
      retail_price_pence: 99,
      is_best_seller: false,
      is_new_arrival: false,
      is_special_offer: false,
      visible_to_public: true,
      visible_to_trade: true,
      is_active: true,
    },
    {
      id: 'b0000000-0000-0000-0000-000000000014',
      name: 'Tweezers',
      slug: 'tweezers',
      code: '306',
      category_id: 'a1000000-0000-0000-0000-000000000001', // Nail care
      short_line: 'Slanted tip for precision',
      description: 'Hand-filed slanted tip stainless steel tweezers for eyebrow shaping and splinter removal.',
      features: ['Precision slanted tips', 'Optimal calibrated tension', 'Stainless steel'],
      retail_price_pence: 99,
      is_best_seller: false,
      is_new_arrival: false,
      is_special_offer: false,
      visible_to_public: true,
      visible_to_trade: true,
      is_active: true,
    },
    {
      id: 'b0000000-0000-0000-0000-000000000015',
      name: 'Stainless Steel Fingernail Clippers',
      slug: 'stainless-steel-fingernail-clippers',
      code: '301',
      category_id: 'a1000000-0000-0000-0000-000000000001', // Nail care
      short_line: 'Clean curved cut',
      description: 'Classic chrome-finished fingernail clippers with fold-out file and cleaner.',
      features: ['Sharp curved cutting jaw', 'Built-in foldout nail file'],
      retail_price_pence: 99,
      is_best_seller: false,
      is_new_arrival: false,
      is_special_offer: false,
      visible_to_public: true,
      visible_to_trade: true,
      is_active: true,
    },
    {
      id: 'b0000000-0000-0000-0000-000000000016',
      name: 'Radial Hair Brush',
      slug: 'radial-hair-brush',
      code: '317',
      category_id: 'a1000000-0000-0000-0000-000000000002', // Hair care
      short_line: 'For volume and styling',
      description: 'Round styling barrel brush for smoothing, curls and adding root volume.',
      features: ['Round barrel for blow styling', 'Flexible nylon bristles'],
      retail_price_pence: 99,
      is_best_seller: false,
      is_new_arrival: false,
      is_special_offer: false,
      visible_to_public: true,
      visible_to_trade: true,
      is_active: true,
    },
    {
      id: 'b0000000-0000-0000-0000-000000000017',
      name: 'Handle Comb',
      slug: 'handle-comb',
      code: '315',
      category_id: 'a1000000-0000-0000-0000-000000000003', // Combs and brushes
      short_line: 'Easy grip daily detangling',
      description: 'Large detangling rake comb with ergonomic handle for wet or dry hair.',
      features: ['Wide spacing teeth', 'Comfort grip handle'],
      retail_price_pence: 99,
      is_best_seller: false,
      is_new_arrival: false,
      is_special_offer: false,
      visible_to_public: true,
      visible_to_trade: true,
      is_active: true,
    },
    {
      id: 'b0000000-0000-0000-0000-000000000018',
      name: 'Potato Peeler',
      slug: 'potato-peeler',
      code: '341',
      category_id: 'a0000000-0000-0000-0000-000000000004', // Kitchenware
      short_line: 'Swivel blade vegetable peeler',
      description: 'Stainless steel swivel blade potato and vegetable peeler with integrated eye remover.',
      features: ['Swivel blade', 'Potato eye remover tip'],
      retail_price_pence: 99,
      is_best_seller: false,
      is_new_arrival: false,
      is_special_offer: false,
      visible_to_public: true,
      visible_to_trade: true,
      is_active: true,
    },
  ];

  const { error: errProds } = await supabase.from('products').upsert(products);
  if (errProds) console.error('Products error:', errProds);
  else console.log(`✓ ${products.length} Products seeded`);

  // 4. Product Trade Prices (wholesale 332p = £3.32, 6 units/pack, min 1)
  const tradePrices = products.map((p) => ({
    product_id: p.id,
    wholesale_pack_price_pence: 332,
    units_per_pack: 6,
    min_packs: 1,
  }));
  const { error: errTradePrices } = await supabase.from('product_trade_prices').upsert(tradePrices);
  if (errTradePrices) console.error('Trade prices error:', errTradePrices);
  else console.log(`✓ ${tradePrices.length} Trade prices seeded`);

  // 5. Product Images
  const images = [
    { product_id: 'b0000000-0000-0000-0000-000000000001', path: '/images/hair-grips.jpg', alt: 'Hair Grips Black', sort_order: 0 },
    { product_id: 'b0000000-0000-0000-0000-000000000002', path: '/images/nit-comb.jpg', alt: 'Nit Combs', sort_order: 0 },
    { product_id: 'b0000000-0000-0000-0000-000000000003', path: '/images/nail-scissors.jpg', alt: 'Nail Scissors', sort_order: 0 },
    { product_id: 'b0000000-0000-0000-0000-000000000004', path: '/images/birthday-candles.jpg', alt: 'Birthday Candles', sort_order: 0 },
    { product_id: 'b0000000-0000-0000-0000-000000000005', path: '/images/false-nails.jpg', alt: 'False Nails', sort_order: 0 },
    { product_id: 'b0000000-0000-0000-0000-000000000006', path: '/images/vent-brush.jpg', alt: 'Large Vent Brush', sort_order: 0 },
    { product_id: 'b0000000-0000-0000-0000-000000000007', path: '/images/sapphire-file.jpg', alt: 'Nail File Sapphire', sort_order: 0 },
    { product_id: 'b0000000-0000-0000-0000-000000000008', path: '/images/toenail-clippers.jpg', alt: 'Stainless Steel Toenail Clippers', sort_order: 0 },
    { product_id: 'b0000000-0000-0000-0000-000000000009', path: '/images/paint-brush.jpg', alt: 'Paint Brush', sort_order: 0 },
    { product_id: 'b0000000-0000-0000-0000-000000000010', path: '/images/bottle-opener.jpg', alt: 'Bottle Opener', sort_order: 0 },
    { product_id: 'b0000000-0000-0000-0000-000000000011', path: '/images/nail-glue.jpg', alt: 'Nail Glue', sort_order: 0 },
    { product_id: 'b0000000-0000-0000-0000-000000000012', path: '/images/gents-comb.jpg', alt: 'Gents Comb', sort_order: 0 },
    { product_id: 'b0000000-0000-0000-0000-000000000013', path: '/images/emery-boards.jpg', alt: 'Emery Boards', sort_order: 0 },
    { product_id: 'b0000000-0000-0000-0000-000000000014', path: '/images/tweezers.jpg', alt: 'Tweezers', sort_order: 0 },
    { product_id: 'b0000000-0000-0000-0000-000000000015', path: '/images/fingernail-clippers.jpg', alt: 'Fingernail Clippers', sort_order: 0 },
    { product_id: 'b0000000-0000-0000-0000-000000000016', path: '/images/radial-brush.jpg', alt: 'Radial Brush', sort_order: 0 },
    { product_id: 'b0000000-0000-0000-0000-000000000017', path: '/images/handle-comb.jpg', alt: 'Handle Comb', sort_order: 0 },
    { product_id: 'b0000000-0000-0000-0000-000000000018', path: '/images/potato-peeler.jpg', alt: 'Potato Peeler', sort_order: 0 },
  ];
  const { error: errImgs } = await supabase.from('product_images').upsert(images);
  if (errImgs) console.error('Images error:', errImgs);
  else console.log(`✓ ${images.length} Images seeded`);

  // 6. Stock (False Nails = 0 packs out of stock demo, Tweezers = 9 low stock demo, rest healthy)
  const stockItems = [
    { product_id: 'b0000000-0000-0000-0000-000000000001', packs_in_stock: 18, low_stock_at: 20 },
    { product_id: 'b0000000-0000-0000-0000-000000000002', packs_in_stock: 24, low_stock_at: 10 },
    { product_id: 'b0000000-0000-0000-0000-000000000003', packs_in_stock: 25, low_stock_at: 10 },
    { product_id: 'b0000000-0000-0000-0000-000000000004', packs_in_stock: 12, low_stock_at: 15 },
    { product_id: 'b0000000-0000-0000-0000-000000000005', packs_in_stock: 0, low_stock_at: 10 }, // Out of stock
    { product_id: 'b0000000-0000-0000-0000-000000000006', packs_in_stock: 20, low_stock_at: 10 },
    { product_id: 'b0000000-0000-0000-0000-000000000007', packs_in_stock: 30, low_stock_at: 10 },
    { product_id: 'b0000000-0000-0000-0000-000000000008', packs_in_stock: 22, low_stock_at: 10 },
    { product_id: 'b0000000-0000-0000-0000-000000000009', packs_in_stock: 35, low_stock_at: 10 },
    { product_id: 'b0000000-0000-0000-0000-000000000010', packs_in_stock: 28, low_stock_at: 10 },
    { product_id: 'b0000000-0000-0000-0000-000000000011', packs_in_stock: 14, low_stock_at: 15 },
    { product_id: 'b0000000-0000-0000-0000-000000000012', packs_in_stock: 40, low_stock_at: 10 },
    { product_id: 'b0000000-0000-0000-0000-000000000013', packs_in_stock: 32, low_stock_at: 10 },
    { product_id: 'b0000000-0000-0000-0000-000000000014', packs_in_stock: 9, low_stock_at: 15 },  // Low stock
    { product_id: 'b0000000-0000-0000-0000-000000000015', packs_in_stock: 26, low_stock_at: 10 },
    { product_id: 'b0000000-0000-0000-0000-000000000016', packs_in_stock: 19, low_stock_at: 10 },
    { product_id: 'b0000000-0000-0000-0000-000000000017', packs_in_stock: 24, low_stock_at: 10 },
    { product_id: 'b0000000-0000-0000-0000-000000000018', packs_in_stock: 30, low_stock_at: 10 },
  ];
  const { error: errStock } = await supabase.from('stock').upsert(stockItems);
  if (errStock) console.error('Stock error:', errStock);
  else console.log(`✓ ${stockItems.length} Stock rows seeded`);

  // 7. Promotions
  const promotions = [
    {
      id: 'f0000000-0000-0000-0000-000000000001',
      title: 'Free Trade Delivery',
      description: 'Free carriage on trade orders over £150 ex VAT',
      audience: 'trade' as const,
      starts_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      ends_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
      is_active: true,
      category_id: 'a0000000-0000-0000-0000-000000000001', // Cosmetics
    },
    {
      id: 'f0000000-0000-0000-0000-000000000002',
      title: 'Special Offers On Selected Lines',
      description: 'Great value on essential convenience lines',
      audience: 'both' as const,
      starts_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      ends_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
      is_active: true,
      category_id: null,
    },
  ];
  const { error: errPromo } = await supabase.from('promotions').upsert(promotions);
  if (errPromo) console.error('Promotions error:', errPromo);
  else console.log(`✓ ${promotions.length} Promotions seeded`);

  // 8. Stands
  const stands = [
    {
      id: 'c0000000-0000-0000-0000-000000000001',
      name: '80 Hook Display Stand',
      slug: '80-hook-display-stand',
      description: 'A freestanding Bits N Bobs stand, delivered full of fast-selling lines.',
      image_path: '/images/stand.jpg',
      stand_unit_price_pence: 12000,
      fixed_price_pence: 55200,
      is_active: true,
    },
  ];
  const { error: errStands } = await supabase.from('stands').upsert(stands);
  if (errStands) console.error('Stands error:', errStands);
  else console.log('✓ Stands seeded');

  // 9. Previous Order for the logged-in trade retailer
  const { data: tradeProfile } = await supabase
    .from('profiles')
    .select('id, email, contact_name, business_name')
    .eq('role', 'trade')
    .limit(1)
    .maybeSingle();

  if (tradeProfile) {
    const orderId = 'e1000000-0000-0000-0000-000000000001';
    const { error: errOrder } = await supabase.from('orders').upsert({
      id: orderId,
      order_number: 10479,
      channel: 'trade',
      user_id: tradeProfile.id,
      email: tradeProfile.email,
      contact_name: tradeProfile.contact_name,
      phone: '0161 839 5050',
      delivery_address: { line1: 'Unit 4, Commerce Park', town: 'Manchester', postcode: 'M1 2WD' },
      billing_address: { line1: 'Unit 4, Commerce Park', town: 'Manchester', postcode: 'M1 2WD' },
      subtotal_pence: 3984, // 12 packs * 332p = £39.84
      delivery_pence: 499,
      vat_pence: 797,
      total_pence: 5280,
      status: 'delivered',
      paid_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    });

    if (errOrder) console.error('Order error:', errOrder);
    else {
      // 12 packs total: 6 packs Hair Grips, 6 packs Nail Scissors
      await supabase.from('order_items').upsert([
        {
          id: 'e1000000-0000-0000-0000-000000000011',
          order_id: orderId,
          product_id: 'b0000000-0000-0000-0000-000000000001', // Hair Grips
          name_snapshot: 'Hair Grips (Pack of 6)',
          quantity: 6,
          unit_price_pence: 332,
          line_total_pence: 1992,
        },
        {
          id: 'e1000000-0000-0000-0000-000000000012',
          order_id: orderId,
          product_id: 'b0000000-0000-0000-0000-000000000003', // Nail Scissors
          name_snapshot: 'Nail Scissors (Pack of 6)',
          quantity: 6,
          unit_price_pence: 332,
          line_total_pence: 1992,
        },
      ]);
      console.log('✓ Demo trade order #10479 seeded for reorder feature');
    }
  }

  console.log('Database seeding finished successfully!');
}

seed();

