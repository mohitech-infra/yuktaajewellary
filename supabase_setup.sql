-- YUKTAA DESIGNER JEWELLERY - SUPABASE DATABASE SETUP SCHEMA
-- Paste this script into your Supabase Dashboard -> SQL Editor and click "Run".

-- 1. CREATE PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id text PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  "categoryTag" text,
  price integer NOT NULL,
  color text,
  occasions text[] DEFAULT '{}'::text[],
  description text,
  materials text,
  includes text,
  rating numeric DEFAULT 5,
  img text,
  images text[] DEFAULT '{}'::text[],
  "bookedDates" text[] DEFAULT '{}'::text[],
  created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Set Public Policies for Products
CREATE POLICY "Allow public read access" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.products FOR DELETE USING (true);


-- 2. CREATE OCCASIONS TABLE
CREATE TABLE IF NOT EXISTS public.occasions (
  key text PRIMARY KEY,
  title text NOT NULL,
  "desc" text NOT NULL,
  bg text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.occasions ENABLE ROW LEVEL SECURITY;

-- Set Public Policies for Occasions
CREATE POLICY "Allow public read access" ON public.occasions FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.occasions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.occasions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.occasions FOR DELETE USING (true);


-- 3. CREATE BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  date text NOT NULL,
  "eventType" text NOT NULL,
  "productId" text REFERENCES public.products(id) ON DELETE SET NULL,
  "productName" text,
  "depositAmount" integer,
  "paymentMethod" text,
  timestamp timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Set Public Policies for Bookings
CREATE POLICY "Allow public read access" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.bookings FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.bookings FOR DELETE USING (true);


-- 4. SEED OCCASIONS DATA
INSERT INTO public.occasions (key, title, "desc", bg) VALUES
('bridal', 'Bridal Collection', 'Majestic heritage chokers, uncut Polki sets, and royal Harams meticulously crafted for your wedding day.', '/assets/jewel_27.jpeg'),
('haldi', 'Haldi Specials', 'Vibrant yellow enamels, floral motifs, and lightweight designs to match the joy of your Haldi ceremony.', '/assets/jewel_23.jpeg'),
('mehendi', 'Mehendi Collections', 'Playful mint greens, doublets, and delicate floral necklaces styled for an evening of music and henna.', '/assets/jewel_15.jpeg'),
('sangeet', 'Sangeet Glamour', 'Dazzling Chandbalis, statement chokers, and sparkling sets designed to shine under the celebratory lights.', '/assets/jewel_8.jpeg'),
('reception', 'Reception Elegance', 'Elegant diamonds, premium pearls, and contemporary layered styles for a sleek, modern reception look.', '/assets/jewel_11.jpeg'),
('party', 'Festive & Party Looks', 'Delicate necklaces and boutique statement pieces perfect for cocktail events and festive gatherings.', '/assets/jewel_18.jpeg')
ON CONFLICT (key) DO UPDATE SET 
  title = EXCLUDED.title,
  "desc" = EXCLUDED."desc",
  bg = EXCLUDED.bg;


-- 5. SEED INITIAL PRODUCTS CATALOG
INSERT INTO public.products (id, name, category, "categoryTag", price, color, occasions, description, materials, includes, rating, img, images) VALUES
('advika-kundan-choker', 'Advika Kundan Choker Set', 'Choker Set', 'Bridal · Choker Set', 1800, 'ruby', ARRAY['bridal', 'sangeet', 'mehendi'], 'A premium gold-plated choker set with delicate pink seed beads and a stunning green emerald centerpiece. Elegant Jadau Kundan work adorns the central motif, accompanied by matching floral earrings.', 'Jadau Kundan, Pink Seed Beads, Faux Emerald, Gold Polish', 'Choker Necklace, Matching Earrings', 5, '/assets/jewel_0.jpeg', ARRAY['/assets/jewel_0.jpeg', '/assets/jewel_1.jpeg', '/assets/jewel_2.jpeg', '/assets/jewel_3.jpeg']),
('meera-ruby-emerald-choker', 'Meera Ruby & Emerald Choker Set', 'Choker Set', 'Bridal · Choker Set', 2000, 'ruby', ARRAY['bridal', 'reception', 'party'], 'A regal choker featuring alternating ruby-pink doublet lines and sparkling uncut Kundan stones, finished with a square emerald centerpiece and matching square studs.', 'Ruby Doublet, Kundan, Emerald Stone, Gold Polish', 'Choker Necklace, Pair of Matching Studs', 5, '/assets/jewel_4.jpeg', ARRAY['/assets/jewel_4.jpeg', '/assets/jewel_5.jpeg', '/assets/jewel_6.jpeg', '/assets/jewel_7.jpeg']),
('tanvi-emerald-choker', 'Tanvi Emerald Choker Set', 'Choker Set', 'Festive · Choker Set', 1600, 'emerald', ARRAY['mehendi', 'sangeet', 'party'], 'A modern three-row emerald beaded choker with a circular Kundan central pendant and matching rectangular earrings.', 'Emerald Beads, Kundan, Brass, Gold Polish', 'Choker Necklace, Pair of Matching Earrings', 5, '/assets/jewel_8.jpeg', ARRAY['/assets/jewel_8.jpeg', '/assets/jewel_9.jpeg', '/assets/jewel_10.jpeg']),
('ananya-kundan-long-haram', 'Ananya Kundan Long Haram Set', 'Necklace Set', 'Bridal · Long Haram', 2800, 'gold', ARRAY['bridal', 'reception'], 'A majestic long-layered Haram set adorned with traditional gold beads and premium pearls, centering a grand Jadau Kundan pendant.', 'Jadau Kundan, Shell Pearls, Gold Plated Beads', 'Long Haram Necklace, Pair of Matching Earrings', 5, '/assets/jewel_11.jpeg', ARRAY['/assets/jewel_11.jpeg', '/assets/jewel_12.jpeg', '/assets/jewel_13.jpeg', '/assets/jewel_14.jpeg']),
('navya-multicolor-choker', 'Navya Multicolor Choker Set', 'Choker Set', 'Mehendi · Choker Set', 1700, 'mint', ARRAY['mehendi', 'sangeet', 'party'], 'An exquisite choker necklace with colorful beads (mint green, pink, and gold) combined with detailed floral Kundan work and matching drop earrings.', 'Multicolor Glass Beads, Kundan, Gold Plating', 'Choker Necklace, Pair of Matching Earrings', 5, '/assets/jewel_15.jpeg', ARRAY['/assets/jewel_15.jpeg', '/assets/jewel_16.jpeg', '/assets/jewel_17.jpeg']),
('isha-sleek-gold-collar', 'Isha Sleek Gold Collar', 'Necklace Set', 'Festive · Collar Choker', 1200, 'gold', ARRAY['haldi', 'party', 'mehendi'], 'A sleek, contemporary collar choker necklace made of structured gold links, accented with ruby, emerald, and white stone settings. Perfect for lightweight festive styling.', 'Cubic Zirconia, Ruby & Emerald Stones, Gold Alloy', 'Collar Necklace', 5, '/assets/jewel_18.jpeg', ARRAY['/assets/jewel_18.jpeg', '/assets/jewel_19.jpeg']),
('prisha-circular-kundan-set', 'Prisha Circular Kundan Set', 'Necklace Set', 'Sangeet · Necklace Set', 1500, 'ruby', ARRAY['sangeet', 'party', 'mehendi'], 'A gorgeous necklace showcasing circular gold-plated floral motifs encrusted with white stones and pink drops, accompanied by matching crescent earrings.', 'Uncut Diamonds (Faux), Pink Resin Beads, Brass Base', 'Necklace, Pair of Matching Earrings', 5, '/assets/jewel_20.jpeg', ARRAY['/assets/jewel_20.jpeg', '/assets/jewel_21.jpeg', '/assets/jewel_22.jpeg']),
('diya-floral-pearl-necklace', 'Diya Floral Pearl Necklace Set', 'Necklace Set', 'Haldi · Floral Art', 1400, 'pearl', ARRAY['haldi', 'mehendi', 'party'], 'A delicate, nature-inspired floral necklace featuring tiny pearls, enamel flowers, and gold leaf designs. Comes with matching flower studs and a floral bracelet.', 'Seed Pearls, Hand-Painted Enamel, Brass, Gold Polish', 'Necklace, Pair of Studs, Matching Bracelet', 5, '/assets/jewel_23.jpeg', ARRAY['/assets/jewel_23.jpeg', '/assets/jewel_24.jpeg', '/assets/jewel_25.jpeg', '/assets/jewel_26.jpeg']),
('siya-pastel-heritage-set', 'Siya Pastel Heritage Kundan Set', 'Choker Set', 'Bridal · Heritage Polki', 3500, 'mint', ARRAY['bridal', 'reception'], 'A grand, heritage bridal choker set. Lavishly decorated with high-grade Kundan stones and multi-layered strings of pastel mint-green and baby-pink beads. Includes majestic chandelier earrings.', 'Premium Jadau Kundan, Pastel Beads, Gold Foil Base', 'Heavy Choker, Pair of Chandelier Earrings', 5, '/assets/jewel_27.jpeg', ARRAY['/assets/jewel_27.jpeg', '/assets/jewel_28.jpeg', '/assets/jewel_29.jpeg', '/assets/jewel_30.jpeg', '/assets/jewel_31.jpeg', '/assets/jewel_32.jpeg']),
('radhika-royal-bajuband', 'Radhika Royal Bajuband / Armlet', 'Maang Tikka', 'Bridal · Bajuband', 900, 'gold', ARRAY['bridal', 'haldi', 'mehendi'], 'A traditional royal armlet (Bajuband) that can also be styled as a grand pendant or Maang Tikka. Features antique gold plating with ruby and emerald stone inserts.', 'Kundan, Red & Green Glass Cabochons, Antique Gold Finish', 'Bajuband with Adjustable Thread', 5, '/assets/jewel_33.jpeg', ARRAY['/assets/jewel_33.jpeg', '/assets/jewel_34.jpeg']),
('kavya-floral-kada-watch', 'Kavya Floral Kada Watch', 'Bangles', 'Sangeet · Bangle Watch', 1100, 'gold', ARRAY['sangeet', 'party', 'reception'], 'A designer gold-plated bracelet styled as a luxury wrist watch, featuring a floral Kundan watch face and a linked stone-studded strap.', 'Cubic Zirconia, Kundan, Gold Polish', 'Single Kada Watch', 5, '/assets/jewel_35.jpeg', ARRAY['/assets/jewel_35.jpeg', '/assets/jewel_36.jpeg', '/assets/jewel_37.jpeg', '/assets/jewel_38.jpeg']),
('meera-blue-stone-bracelet', 'Meera Sapphire Blue Bracelet', 'Bangles', 'Festive · Bracelet', 800, 'pearl', ARRAY['party', 'reception'], 'A sleek and elegant bracelet featuring square-cut sapphire blue doublet stones set in high-polish gold casing.', 'Sapphire Doublet, Brass, Gold Polish', 'Single Bracelet', 5, '/assets/jewel_39.jpeg', ARRAY['/assets/jewel_39.jpeg', '/assets/jewel_40.jpeg']),
('kundan-green-enamel-kada', 'Kundan Green Enamel Kada', 'Bangles', 'Mehendi · Kada Pair', 1300, 'emerald', ARRAY['bridal', 'mehendi', 'sangeet'], 'A pair of traditional broad kadas featuring intricate green Meenakari enamel on the edges and Kundan stone clusters on the outer band.', 'Meenakari, Kundan, Brass', 'Pair of Kadas', 5, '/assets/jewel_41.jpeg', ARRAY['/assets/jewel_41.jpeg', '/assets/jewel_42.jpeg', '/assets/jewel_43.jpeg', '/assets/jewel_44.jpeg']),
('aditi-ruby-green-kadas', 'Aditi Ruby & Emerald Kadas', 'Bangles', 'Bridal · Kada Pair', 1200, 'ruby', ARRAY['bridal', 'party', 'sangeet'], 'Broad, traditional openable bangles featuring alternating ruby and emerald stone settings bordered by micro-pearl lines.', 'Ruby & Emerald doublet, Micro Pearls, Brass', 'Pair of Kadas', 5, '/assets/jewel_45.jpeg', ARRAY['/assets/jewel_45.jpeg', '/assets/jewel_46.jpeg', '/assets/jewel_47.jpeg']),
('ria-layered-gold-bracelet', 'Ria Layered Gold Bead Bracelet', 'Bangles', 'Haldi · Bracelet', 700, 'gold', ARRAY['haldi', 'mehendi', 'party'], 'Multi-row gold bead bracelets finished with a delicate chain and adjustable clasp, ideal for piling and layering.', 'Gold-Plated Alloy Beads', 'Single Layered Bracelet', 5, '/assets/jewel_48.jpeg', ARRAY['/assets/jewel_48.jpeg', '/assets/jewel_49.jpeg', '/assets/jewel_50.jpeg', '/assets/jewel_51.jpeg', '/assets/jewel_52.jpeg', '/assets/jewel_53.jpeg']),
('ananya-pearl-dangle-earrings', 'Ananya Pearl Dangle Earrings', 'Earrings', 'Festive · Earrings', 400, 'pearl', ARRAY['party', 'sangeet', 'mehendi'], 'Delicate and elegant long dangling earrings featuring shell pearls suspended from fine gold plated chains. Perfect for lightweight festive styling.', 'Shell Pearls, Gold Alloy Base', 'Pair of Dangling Earrings', 5, '/assets/jewel_54.jpeg', ARRAY['/assets/jewel_54.jpeg']),
('rhea-stone-bangle-cuffs', 'Rhea White Stone Bangle Cuffs', 'Bangles', 'Reception · Cuff Pair', 1400, 'pearl', ARRAY['reception', 'party', 'sangeet'], 'A pair of openable bangle cuffs encrusted with shimmering white Kundan stones and colored doublet borders.', 'Kundan, White CZ, Gold Polish', 'Pair of Bangle Cuffs', 5, '/assets/jewel_55.jpeg', ARRAY['/assets/jewel_55.jpeg', '/assets/jewel_56.jpeg', '/assets/jewel_57.jpeg']),
('vaishali-emerald-beaded-rings', 'Vaishali Emerald Beaded Rings', 'Rings', 'Mehendi · Ring', 500, 'emerald', ARRAY['party', 'mehendi', 'sangeet'], 'An elegant cocktail ring featuring a high-luster central pearl surrounded by emerald green beads and Kundan loops.', 'Onyx Beads, Faux Pearl, Gold Polish', 'Single Adjustable Ring', 5, '/assets/jewel_58.jpeg', ARRAY['/assets/jewel_58.jpeg', '/assets/jewel_59.jpeg']),
('pink-enamel-cocktail-ring', 'Pink Enamel Cocktail Ring', 'Rings', 'Mehendi · Ring', 450, 'ruby', ARRAY['mehendi', 'party', 'sangeet'], 'A bold statement ring showcasing bright pink enamel detailing and a rectangular pink crystal center stone.', 'Enamel Work, Pink Doublet, Brass', 'Single Adjustable Ring', 5, '/assets/jewel_60.jpeg', ARRAY['/assets/jewel_60.jpeg', '/assets/jewel_61.jpeg']),
('designer-cocktail-ring-set', 'Designer Cocktail Ring Set', 'Rings', 'Bridal · Ring Set', 600, 'mint', ARRAY['bridal', 'sangeet', 'party', 'reception'], 'A curated collection of heavy cocktail rings including a turquoise enamel ring, an antique silver kundan ring, and a floral brass ring.', 'Turquoise doublets, Kundan, Sterling Silver Polish', 'Set of 3 Cocktail Rings', 5, '/assets/jewel_62.jpeg', ARRAY['/assets/jewel_62.jpeg', '/assets/jewel_63.jpeg', '/assets/jewel_64.jpeg', '/assets/jewel_65.jpeg', '/assets/jewel_70.jpeg']),
('avantika-layered-emerald-haram', 'Avantika Layered Emerald Haram', 'Necklace Set', 'Bridal · Long Haram', 2600, 'emerald', ARRAY['bridal', 'reception', 'sangeet'], 'A multi-layered premium emerald beads Haram set featuring a grand gold-plated Kundan side-pendant (mogappu). Fits perfectly for royal groom or bridal wear.', 'Onyx Emerald Beads, Kundan, Gold Plating', 'Multi-layered Haram Necklace', 5, '/assets/jewel_72.jpeg', ARRAY['/assets/jewel_72.jpeg'])
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  "categoryTag" = EXCLUDED."categoryTag",
  price = EXCLUDED.price,
  color = EXCLUDED.color,
  occasions = EXCLUDED.occasions,
  description = EXCLUDED.description,
  materials = EXCLUDED.materials,
  includes = EXCLUDED.includes,
  img = EXCLUDED.img,
  images = EXCLUDED.images;

-- ALTER TABLE FOR MULTIPLE PHOTOS SUPPORT (RUN IF DATABASE WAS ALREADY CREATED)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}'::text[];

-- 6. CREATE LEADS TABLE (For Shagun Wallet Sign-ups)
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  source text DEFAULT 'Shagun Envelope',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Set Public Policies for Leads
CREATE POLICY "Allow public insert" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read access" ON public.leads FOR SELECT USING (true);
CREATE POLICY "Allow public update" ON public.leads FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.leads FOR DELETE USING (true);


-- 7. CREATE ADMIN_SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.admin_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Set Public Policies for admin_settings using DO blocks to prevent duplicate policy errors if re-run
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read access' AND tablename = 'admin_settings') THEN
        CREATE POLICY "Allow public read access" ON public.admin_settings FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public insert' AND tablename = 'admin_settings') THEN
        CREATE POLICY "Allow public insert" ON public.admin_settings FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public update' AND tablename = 'admin_settings') THEN
        CREATE POLICY "Allow public update" ON public.admin_settings FOR UPDATE USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public delete' AND tablename = 'admin_settings') THEN
        CREATE POLICY "Allow public delete" ON public.admin_settings FOR DELETE USING (true);
    END IF;
END
$$;

-- Seed default password if not exists
INSERT INTO public.admin_settings (key, value) 
VALUES ('admin_password', '1234')
ON CONFLICT (key) DO NOTHING;

-- Seed default settings keys if not exist
INSERT INTO public.admin_settings (key, value)
VALUES 
('welcome_voucher_code', 'YUKTAA2000'),
('welcome_voucher_amount', '2000'),
('welcome_voucher_min_bill', '6000'),
('wallet_redeem_limit_pct', '50'),
('wallet_terms', '["The welcome discount voucher code is valid for first-time clients only.","This offer is restricted to one claim per device/browser session.","Voucher code is valid for 1 year from the date of activation.","Discount is applicable on jewellery rental bookings only and cannot be exchanged for cash.","Applicable at our Goregaon West boutique styling session.","Wallet balance can be redeemed for up to 50% of the bill amount.","The welcome offer of ₹2,000 is applicable on a minimum bill of ₹6,000."]')
ON CONFLICT (key) DO NOTHING;


-- 8. ADD BUY_PRICE COLUMN TO PRODUCTS (run if products table already created)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS buy_price integer DEFAULT NULL;


-- 9. CREATE ORDERS TABLE (for buy orders placed by customers)
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  buy_price integer NOT NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  delivery_address text NOT NULL,
  city text NOT NULL,
  pincode text NOT NULL,
  notes text DEFAULT '',
  order_status text DEFAULT 'Pending',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Set Public Policies for Orders
CREATE POLICY "Allow public insert on orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read on orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow public update on orders" ON public.orders FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on orders" ON public.orders FOR DELETE USING (true);
