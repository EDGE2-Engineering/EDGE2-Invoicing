-- -----------------------------------------------------------------------------
-- 0. Cleanup existing objects
-- -----------------------------------------------------------------------------
drop table if exists public.blogs cascade;
drop table if exists public.site_content cascade;
drop table if exists public.products cascade;
drop table if exists public.orders cascade;

-- Cleanup storage policies
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Public Upload" on storage.objects;
drop policy if exists "Public Update Delete" on storage.objects;
drop policy if exists "Public Delete" on storage.objects;

-- Cleanup storage buckets (delete child objects first to avoid FK constraint errors)
delete from storage.objects where bucket_id in ('blog-images', 'product-images', 'site-assets');
delete from storage.buckets where id in ('blog-images', 'product-images', 'site-assets');

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. Table: blogs
-- -----------------------------------------------------------------------------
create table public.blogs (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  author text,
  category text,
  cover_image text,
  published boolean default false,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.blogs enable row level security;

create policy "Public blogs are viewable by everyone"
  on public.blogs for select
  using ( true );

create policy "Allow public insert/update/delete for blogs"
  on public.blogs for all
  using ( true )
  with check ( true );

-- -----------------------------------------------------------------------------
-- 2. Table: site_content
-- -----------------------------------------------------------------------------
create table public.site_content (
  key text primary key,
  value jsonb,
  updated_at timestamptz default now()
);

alter table public.site_content enable row level security;

create policy "Site content is viewable by everyone"
  on public.site_content for select
  using ( true );

create policy "Allow public insert/update for site_content"
  on public.site_content for all
  using ( true )
  with check ( true );

-- -----------------------------------------------------------------------------
-- 3. Table: products
-- -----------------------------------------------------------------------------
create table public.products (
  id text primary key,
  title text not null,
  category text,
  price numeric not null,
  weight text,
  stock integer default 0,
  description text,
  ingredients text,
  benefits text,
  images text[],
  featured boolean default false,
  status text default 'In Stock',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.products enable row level security;

create policy "Products are viewable by everyone"
  on public.products for select
  using ( true );

create policy "Allow public management of products"
  on public.products for all
  using ( true )
  with check ( true );

-- -----------------------------------------------------------------------------
-- 4. Table: orders
-- -----------------------------------------------------------------------------
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  customer_name text not null,
  customer_email text,
  customer_phone text not null,
  customer_address text not null,
  total_amount numeric not null,
  status text default 'Pending',
  items jsonb not null,
  order_date timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.orders enable row level security;

create policy "Allow public to place orders"
  on public.orders for insert
  with check ( true );

create policy "Allow public to view their orders"
  on public.orders for select
  using ( true );

create policy "Allow public to manage orders"
  on public.orders for all
  using ( true )
  with check ( true );

-- -----------------------------------------------------------------------------
-- 5. Storage Buckets & Policies
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values 
  ('blog-images', 'blog-images', true),
  ('product-images', 'product-images', true),
  ('site-assets', 'site-assets', true);

create policy "Public Access"
  on storage.objects for select
  using ( bucket_id in ('blog-images', 'site-assets', 'product-images') );

create policy "Public Upload"
  on storage.objects for insert
  with check ( bucket_id in ('blog-images', 'site-assets', 'product-images') );

create policy "Public Update Delete"
  on storage.objects for update
  using ( bucket_id in ('blog-images', 'site-assets', 'product-images') );

create policy "Public Delete"
  on storage.objects for delete
  using ( bucket_id in ('blog-images', 'site-assets', 'product-images') );

-- -----------------------------------------------------------------------------
-- 6. Insert sample data
-- -----------------------------------------------------------------------------
insert into public.products (
  id, title, category, price, weight, stock, description, ingredients, benefits, images, featured, status
) values 
  ('P1', 'A2 Desi Cow Ghee', 'Ghee', 1500, '500ml', 50, 'Pure A2 chemical-free hand-churned Ghee from free-grazing Hallikar cows.', 'A2 Cow Milk Butter', 'Boosts immunity, improves digestion, good for skin.', array['https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&q=80&w=800'], true, 'In Stock'),
  ('P2', 'Raw Forest Honey', 'Honey', 450, '250g', 100, 'Unprocessed, multi-floral honey collected from deep forest hives.', '100% Raw Honey', 'Natural energy booster, rich in antioxidants.', array['https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=800'], true, 'In Stock'),
  ('P3', 'Cold Pressed Mustard Oil', 'Oils', 320, '1L', 75, 'Traditional wood-pressed mustard oil retaining all natural nutrients.', 'Organic Mustard Seeds', 'Good for heart health, high smoke point.', array['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=800'], false, 'In Stock'),
  ('P4', 'Organic Turmeric Powder', 'Spices', 180, '200g', 200, 'High curcumin content turmeric sourced from organic farms.', 'Dried Turmeric Root', 'Anti-inflammatory, natural healer.', array['https://images.unsplash.com/photo-1615485245474-239404d51388?auto=format&fit=crop&q=80&w=800'], true, 'In Stock'),
  ('P5', 'Himalayan Pink Salt', 'Spices', 120, '500g', 150, 'Pure mineral-rich salt hand-mined from the Himalayas.', 'Natural Pink Salt', 'Contains 84+ minerals, regulates hydration.', array['https://images.unsplash.com/photo-1518110168401-f7629d61c38c?auto=format&fit=crop&q=80&w=800'], false, 'In Stock'),
  ('P6', 'Cold Pressed Coconut Oil', 'Oils', 550, '500ml', 60, 'Virgin coconut oil extracted from fresh coconut milk.', 'Fresh Coconuts', 'Excellent for cooking and hair care.', array['https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&q=80&w=800'], true, 'In Stock'),
  ('P7', 'Wildflower Honey', 'Honey', 380, '250g', 85, 'Delicate honey with floral notes from seasonal wildflowers.', 'Wildflower Nectar', 'Soothes sore throat, natural sweetener.', array['https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&q=80&w=800'], false, 'In Stock'),
  ('P8', 'Organic Cumin Seeds', 'Spices', 220, '100g', 120, 'Aromatic whole cumin seeds sourced from sustainable farms.', 'Whole Cumin Seeds', 'Aids digestion, rich in iron.', array['https://images.unsplash.com/photo-1599143338401-3e45888272bb?auto=format&fit=crop&q=80&w=800'], false, 'In Stock'),
  ('P9', 'A2 Bilona Ghee', 'Ghee', 2800, '1L', 30, 'Premium Bilona method ghee made from curd, not cream.', 'A2 Cow Milk Curd', 'Highest nutritional value, traditional taste.', array['https://images.unsplash.com/photo-1631709497146-a239ef373cf1?auto=format&fit=crop&q=80&w=800'], true, 'In Stock'),
  ('P10', 'Wood Pressed Groundnut Oil', 'Oils', 420, '1L', 45, 'Nutty and aromatic oil extracted using traditional Lakdi Gani.', 'Premium Groundnuts', 'Zero cholesterol, rich in Vitamin E.', array['https://images.unsplash.com/photo-162070612211c-6194448e2959?auto=format&fit=crop&q=80&w=800'], false, 'In Stock');


INSERT INTO public.products (
  id, title, category, price, weight, stock,
  description, ingredients, benefits,
  images, featured, status
) VALUES

-- =====================================================
-- DALS & PULSES
-- =====================================================
('DP01','Organic Tur/Toor Dal','Dals & Pulses',0,NULL,100,'Organic natural product','Tur Dal','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('DP02','Organic Groundnuts','Dals & Pulses',0,NULL,100,'Organic natural product','Groundnuts','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('DP03','Organic Moong Dal','Dals & Pulses',0,NULL,100,'Organic natural product','Moong Dal','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('DP04','Organic Green Gram','Dals & Pulses',0,NULL,100,'Organic natural product','Green Gram','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('DP05','Organic Roasted Channa Dal/Bengal Gram','Dals & Pulses',0,NULL,100,'Organic natural product','Channa','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('DP06','Organic Chana Dal','Dals & Pulses',0,NULL,100,'Organic natural product','Chana Dal','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('DP07','Organic Urad Dal','Dals & Pulses',0,NULL,100,'Organic natural product','Urad Dal','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('DP08','Organic Urad Gota','Dals & Pulses',0,NULL,100,'Organic natural product','Urad Gota','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('DP09','Organic Masoor Dal','Dals & Pulses',0,NULL,100,'Organic natural product','Masoor Dal','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('DP10','Organic Brown Chana','Dals & Pulses',0,NULL,100,'Organic natural product','Brown Chana','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('DP11','Organic Horse Gram','Dals & Pulses',0,NULL,100,'Organic natural product','Horse Gram','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('DP12','Organic Kabul Chana','Dals & Pulses',0,NULL,100,'Organic natural product','Kabul Chana','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('DP13','Organic Moong Chilka','Dals & Pulses',0,NULL,100,'Organic natural product','Moong Chilka','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('DP14','Organic Rajma Chitra','Dals & Pulses',0,NULL,100,'Organic natural product','Rajma','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('DP15','Organic Black Urad Dal With Husk','Dals & Pulses',0,NULL,100,'Organic natural product','Black Urad','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('DP16','Organic Black Urad Whole','Dals & Pulses',0,NULL,100,'Organic natural product','Black Urad','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('DP17','Organic Cow Pea Red / Red Lobiya','Dals & Pulses',0,NULL,100,'Organic natural product','Cow Pea','Healthy and natural',ARRAY[]::text[],false,'In Stock'),

-- =====================================================
-- A2 DAIRY PRODUCTS
-- =====================================================
('A2D01','A2 Paneer High Protein - Low Fat Paneer','A2 Dairy',0,NULL,50,'Fresh A2 dairy product','A2 Milk','Healthy and natural',ARRAY[]::text[],true,'In Stock'),
('A2D02','Desi Nati Eggs (Bengaluru)','A2 Dairy',0,NULL,100,'Farm fresh eggs','Eggs','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('A2D03','A2 Desi Cow Ghee','A2 Dairy',0,NULL,50,'Traditional ghee','A2 Milk','Healthy and natural',ARRAY[]::text[],true,'In Stock'),
('A2D04','A2 Desi Cow Milk','A2 Dairy',0,NULL,50,'Fresh milk','A2 Milk','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('A2D05','A2 Desi Set Curd','A2 Dairy',0,NULL,50,'Set curd','A2 Milk','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('A2D06','A2 Low Fat Curd','A2 Dairy',0,NULL,50,'Low fat curd','A2 Milk','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('A2D07','A2 Desi Butter','A2 Dairy',0,NULL,30,'Desi butter','A2 Milk','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('A2D08','A2 Malai Paneer','A2 Dairy',0,NULL,30,'Malai paneer','A2 Milk','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('A2D09','A2 Kalakand (Milk Peda)','A2 Dairy',0,NULL,30,'Traditional sweet','A2 Milk','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('A2D10','A2 Desi Cow Masala added Ghee','A2 Dairy',0,NULL,30,'Masala ghee','A2 Milk & spices','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('A2D11','Desi Nati Eggs (Hyderabad)','A2 Dairy',0,NULL,100,'Farm fresh eggs','Eggs','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('A2D12','Set Curd for Lunch Box','A2 Dairy',0,NULL,50,'Lunch box curd','Milk','Healthy and natural',ARRAY[]::text[],false,'In Stock'),

-- =====================================================
-- EDIBLES
-- =====================================================
('ED01','Organic Gulkand','Edibles',0,NULL,100,'Organic edible','Rose petals','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('ED02','IMLY POPS – Tangy Nostalgia with an Herbal & Spice Twist','Edibles',0,NULL,100,'Organic edible','Tamarind & spices','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('ED03','Organic Groundnut(Peanut) Chutney Powder','Edibles',0,NULL,100,'Organic edible','Groundnuts','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('ED04','Organic Garlic Pickle','Edibles',0,NULL,100,'Organic edible','Garlic','Healthy and natural',ARRAY[]::text[],false,'In Stock'),

-- =====================================================
-- HOME ESSENTIALS
-- =====================================================
('HE01','Organic Sambrani Dhoop Cups - 12pcs Set','Home Essential',0,NULL,100,'Home essential','Sambrani','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('HE02','Agarbatti - 7 Herbs','Home Essential',0,NULL,100,'Home essential','Herbs','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('HE03','Agarbatti - Champaka','Home Essential',0,NULL,100,'Home essential','Champaka','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('HE04','Agarbatti - Wood Spice','Home Essential',0,NULL,100,'Home essential','Wood spices','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('HE05','Agarbatti- Yaksha Chaitanya','Home Essential',0,NULL,100,'Home essential','Herbs','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('HE06','Agarbatti- Yaksha Sanchara','Home Essential',0,NULL,100,'Home essential','Herbs','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('HE07','Pure Neem-Wood Hair Comb Double Tooth','Home Essential',0,NULL,100,'Home essential','Neem wood','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('HE08','Pure Neem-Wood Hair Comb Narrow Tooth','Home Essential',0,NULL,100,'Home essential','Neem wood','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('HE09','Agarbatti- Yaksha Mahotsava','Home Essential',0,NULL,100,'Home essential','Herbs','Healthy and natural',ARRAY[]::text[],false,'In Stock'),

-- =====================================================
-- MILLETS
-- =====================================================
('MIL01','Organic Foxtail Millet (Navane)','Millets',0,NULL,100,'Organic natural product','Foxtail Millet','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('MIL02','Organic Little Millet (Saame)','Millets',0,NULL,100,'Organic natural product','Little Millet','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('MIL03','Organic Finger Millet (Ragi)','Millets',0,NULL,100,'Organic natural product','Ragi','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('MIL04','Organic Kodo Millet (Harka)','Millets',0,NULL,100,'Organic natural product','Kodo Millet','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('MIL05','Organic Barnyard Millet (Udalu)','Millets',0,NULL,100,'Organic natural product','Barnyard Millet','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('MIL06','Organic Hand Pounded Finger Millet/Ragi Flour','Millets',0,NULL,100,'Organic natural product','Ragi','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('MIL07','Organic Finger Millet Flour (Ragi Flour)','Millets',0,NULL,100,'Organic natural product','Ragi','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('MIL08','Organic Pearl Millet (Sajje)','Millets',0,NULL,100,'Organic natural product','Pearl Millet','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('MIL09','Organic Browntop Millet','Millets',0,NULL,100,'Organic natural product','Browntop Millet','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('MIL10','Organic Proso Millet (Baragu)','Millets',0,NULL,100,'Organic natural product','Proso Millet','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('MIL11','Organic Little Millet Flakes','Millets',0,NULL,100,'Organic natural product','Little Millet','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('MIL12','Organic Little Millet Roasted Upma Rava','Millets',0,NULL,100,'Organic natural product','Little Millet','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('MIL13','Organic Ragi / Finger Millet Flakes','Millets',0,NULL,100,'Organic natural product','Ragi','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('MIL14','Organic Foxtail Millet Roasted Upma Rava','Millets',0,NULL,100,'Organic natural product','Foxtail Millet','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('MIL15','Organic Pearl Millet Flakes','Millets',0,NULL,100,'Organic natural product','Pearl Millet','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('MIL16','Organic Foxtail Millet Flakes','Millets',0,NULL,100,'Organic natural product','Foxtail Millet','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('MIL17','Organic Kodo Millet Roasted Upma Rava','Millets',0,NULL,100,'Organic natural product','Kodo Millet','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('MIL18','Organic Barnyard Millet Roasted Upma Rava','Millets',0,NULL,100,'Organic natural product','Barnyard Millet','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('MIL19','Organic Little Millet Flour','Millets',0,NULL,100,'Organic natural product','Little Millet','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('MIL20','Organic Kodo Millet Flour','Millets',0,NULL,100,'Organic natural product','Kodo Millet','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('MIL21','Organic Kodo Millet Flakes','Millets',0,NULL,100,'Organic natural product','Kodo Millet','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('MIL22','Organic Proso Millet Flour','Millets',0,NULL,100,'Organic natural product','Proso Millet','Healthy and natural',ARRAY[]::text[],false,'In Stock'),

-- =====================================================
-- SNACKS
-- =====================================================
('SN01','Millet Murukku','Snacks',0,NULL,100,'Organic snack','Millet','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('SN02','Kodbale','Snacks',0,NULL,100,'Organic snack','Millet & spices','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('SN03','Millet Kodubale','Snacks',0,NULL,100,'Organic snack','Millet','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('SN04','Nippattu','Snacks',0,NULL,100,'Organic snack','Flour & spices','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('SN05','Millet Thengolu','Snacks',0,NULL,100,'Organic snack','Millet','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('SN06','Bangalore Mixture','Snacks',0,NULL,100,'Organic snack','Lentils & spices','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('SN07','Puffed Rice','Snacks',0,NULL,100,'Organic snack','Rice','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('SN08','Khara Boondi','Snacks',0,NULL,100,'Organic snack','Gram flour','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('SN09','Madras Mixture','Snacks',0,NULL,100,'Organic snack','Lentils & spices','Healthy and natural',ARRAY[]::text[],false,'In Stock'),

-- =====================================================
-- FRUITS & VEGETABLES
-- =====================================================
('FV01','Organic Mango Totapuri Raw','Fruits & Vegetables',0,NULL,200,'Fresh organic produce','Mango','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('FV02','Organic Mango Banganpalli Raw','Fruits & Vegetables',0,NULL,200,'Fresh organic produce','Mango','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('FV03','Organic Mango Alphonso','Fruits & Vegetables',0,NULL,200,'Fresh organic produce','Mango','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('FV04','Organic Mango Mallika Raw','Fruits & Vegetables',0,NULL,200,'Fresh organic produce','Mango','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('FV05','Organic Mango Badami Raw','Fruits & Vegetables',0,NULL,200,'Fresh organic produce','Mango','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('FV06','Organic Lady''s Finger (Bhendi)','Fruits & Vegetables',0,NULL,200,'Fresh organic produce','Bhendi','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('FV07','Organic Tomato Nati','Fruits & Vegetables',0,NULL,200,'Fresh organic produce','Tomato','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('FV08','Organic Palak Leaves','Fruits & Vegetables',0,NULL,200,'Fresh organic produce','Spinach','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('FV09','Organic Carrot Ooty','Fruits & Vegetables',0,NULL,200,'Fresh organic produce','Carrot','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('FV10','Organic Cucumber','Fruits & Vegetables',0,NULL,200,'Fresh organic produce','Cucumber','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('FV11','Organic Onion','Fruits & Vegetables',0,NULL,200,'Fresh organic produce','Onion','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('FV12','Organic Potato','Fruits & Vegetables',0,NULL,200,'Fresh organic produce','Potato','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('FV13','Organic Banana Elakki','Fruits & Vegetables',0,NULL,200,'Fresh organic produce','Banana','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('FV14','Organic Capsicum','Fruits & Vegetables',0,NULL,200,'Fresh organic produce','Capsicum','Healthy and natural',ARRAY[]::text[],false,'In Stock'),

-- =====================================================
-- DRY FRUITS
-- =====================================================
('DF01','Organic Raisins','Dry Fruits',0,NULL,100,'Organic dry fruit','Raisins','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('DF02','Cashew Nuts','Dry Fruits',0,NULL,100,'Dry fruit','Cashews','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('DF03','Organic Walnut','Dry Fruits',0,NULL,100,'Organic dry fruit','Walnut','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('DF04','Organic Dry Dates','Dry Fruits',0,NULL,100,'Organic dry fruit','Dates','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('DF05','Organic Dried Fig','Dry Fruits',0,NULL,100,'Organic dry fruit','Fig','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('DF06','Organic Pista (Salted)','Dry Fruits',0,NULL,100,'Organic dry fruit','Pistachio','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('DF07','Organic Mamra Almonds','Dry Fruits',0,NULL,100,'Organic dry fruit','Almond','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('DF08','Organic Apricot','Dry Fruits',0,NULL,100,'Organic dry fruit','Apricot','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('DF09','Cashews (Roasted & Salted)','Dry Fruits',0,NULL,100,'Dry fruit','Cashews','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('DF10','Almond (Roasted & Salted)','Dry Fruits',0,NULL,100,'Dry fruit','Almond','Healthy and natural',ARRAY[]::text[],false,'In Stock'),

-- =====================================================
-- BEVERAGES
-- =====================================================
('BEV01','Organic Moringa Powder','Beverages',0,NULL,100,'Organic beverage','Moringa','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('BEV02','Organic Millet Badam Milk - Instant Drink','Beverages',0,NULL,100,'Instant drink','Millet & badam','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('BEV03','Organic Special Ragi Malt','Beverages',0,NULL,100,'Healthy drink','Ragi','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('BEV04','Organic Ragi Hurihittu','Beverages',0,NULL,100,'Healthy drink','Ragi','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('BEV05','Organic Ragi Malt','Beverages',0,NULL,100,'Healthy drink','Ragi','Healthy and natural',ARRAY[]::text[],false,'In Stock'),

-- =====================================================
-- SPICES & MASALAS
-- =====================================================
('SP01','Natural Himalayan Pink Salt - Free Flow Powder','Spices & Masalas',0,NULL,100,'Organic spice','Pink Salt','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('SP02','Organic Hing Powder','Spices & Masalas',0,NULL,100,'Organic spice','Hing','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('SP03','Organic Mustard','Spices & Masalas',0,NULL,100,'Organic spice','Mustard','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('SP04','Organic Cumin Seed (Jeera)','Spices & Masalas',0,NULL,100,'Organic spice','Cumin','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('SP05','Organic Turmeric Powder','Spices & Masalas',0,NULL,100,'Organic spice','Turmeric','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('SP06','Organic Chilli Powder','Spices & Masalas',0,NULL,100,'Organic spice','Chilli','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('SP07','Organic Garam Masala','Spices & Masalas',0,NULL,100,'Organic spice','Masala','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('SP08','Organic Black Pepper','Spices & Masalas',0,NULL,100,'Organic spice','Pepper','Healthy and natural',ARRAY[]::text[],false,'In Stock'),

-- =====================================================
-- PERSONAL CARE
-- =====================================================
('PC01','Castor Oil','Personal Care',0,NULL,100,'Personal care','Castor oil','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('PC02','Organic Multani Mitti','Personal Care',0,NULL,100,'Personal care','Multani Mitti','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('PC03','Eucalyptus Oil','Personal Care',0,NULL,100,'Personal care','Eucalyptus','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('PC04','Hibiscus Petal Powder','Personal Care',0,NULL,100,'Personal care','Hibiscus','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('PC05','Rose Petal Powder','Personal Care',0,NULL,100,'Personal care','Rose','Healthy and natural',ARRAY[]::text[],false,'In Stock'),

-- =====================================================
-- SWEETS
-- =====================================================
('SW01','A2 Kalakand (Milk Peda)','Sweets',0,NULL,100,'Traditional sweet','A2 Milk','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('SW02','Organic Gulkand','Sweets',0,NULL,100,'Traditional sweet','Rose petals','Healthy and natural',ARRAY[]::text[],false,'In Stock'),

-- =====================================================
-- BAKERY
-- =====================================================
('BK01','Almond Cookie (100g)','Bakery',0,'100g',100,'Bakery item','Almond','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('BK02','Burger Buns (Pack of 2)','Bakery',0,NULL,100,'Bakery item','Flour','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('BK03','Choco Chip Cookies (100g)','Bakery',0,'100g',100,'Bakery item','Chocolate','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('BK04','Multi Grain Bread (250g)','Bakery',0,'250g',100,'Bakery item','Whole grains','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('BK05','Pav Bread (6 pcs)','Bakery',0,NULL,100,'Bakery item','Flour','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('BK06','Whole Wheat Bread (400g)','Bakery',0,'400g',100,'Bakery item','Whole wheat','Healthy and natural',ARRAY[]::text[],false,'In Stock'),

-- =====================================================
-- READY TO COOK
-- =====================================================
('RTC01','Beetroot Papad','Ready To Cook',0,NULL,100,'Ready to cook','Beetroot','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('RTC02','Garlic Papad','Ready To Cook',0,NULL,100,'Ready to cook','Garlic','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('RTC03','Idly Dosa Batter','Ready To Cook',0,NULL,100,'Ready to cook','Rice & urad','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('RTC04','Kodo Millet Bisi Bele Bath Mix','Ready To Cook',0,NULL,100,'Ready to cook','Kodo millet','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('RTC05','Kodo Millet Noodles','Ready To Cook',0,NULL,100,'Ready to cook','Kodo millet','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('RTC06','Little Millet Idly/Dosa Batter','Ready To Cook',0,NULL,100,'Ready to cook','Little millet','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('RTC07','Millet Banana Choco Chip Pancake Mix','Ready To Cook',0,NULL,100,'Ready to cook','Millet','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('RTC08','Millet Chocolate Pancake Mix','Ready To Cook',0,NULL,100,'Ready to cook','Millet','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('RTC09','Millet Classic Pancake Mix','Ready To Cook',0,NULL,100,'Ready to cook','Millet','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('RTC10','Millet Kesari Bath Mix','Ready To Cook',0,NULL,100,'Ready to cook','Millet','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('RTC11','Millet Payasa Mix','Ready To Cook',0,NULL,100,'Ready to cook','Millet','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('RTC12','Onion Papad','Ready To Cook',0,NULL,100,'Ready to cook','Onion','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('RTC13','Ragi Idly/Dosa Batter','Ready To Cook',0,NULL,100,'Ready to cook','Ragi','Healthy and natural',ARRAY[]::text[],false,'In Stock'),
('RTC14','Wheat Noodles','Ready To Cook',0,NULL,100,'Ready to cook','Wheat','Healthy and natural',ARRAY[]::text[],false,'In Stock');

