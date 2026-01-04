-- =====================================================
-- MUGMAGIC COMPLETE DATABASE SETUP
-- Copy and paste this entire script into Supabase SQL Editor
-- This will create all tables and functions needed
-- =====================================================

-- =====================================================
-- STEP 1: Create Products Table (Base Table)
-- =====================================================

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id text primary key,
  name text not null,
  slug text unique not null,
  description text,
  long_description text,
  category text,
  base_price decimal(10,2) not null,
  compare_at_price decimal(10,2),
  images jsonb not null default '{}'::jsonb,
  specifications jsonb not null default '{}'::jsonb,
  variants jsonb not null default '[]'::jsonb,
  tags text[] default '{}',
  in_stock boolean default true,
  stock_quantity integer default 50,
  featured boolean default false,
  bestseller boolean default false,
  new boolean default false,
  rating decimal(3,2),
  review_count integer default 0,
  customizable boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Public products are viewable by everyone" ON products;
CREATE POLICY "Public products are viewable by everyone"
  ON products FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Service role can insert" ON products;
CREATE POLICY "Service role can insert"
  ON products FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can update" ON products;
CREATE POLICY "Service role can update"
  ON products FOR UPDATE
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can delete" ON products;
CREATE POLICY "Service role can delete"
  ON products FOR DELETE
  USING (auth.role() = 'service_role');

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  new.updated_at = now();
  return new;
END;
$$ LANGUAGE plpgsql;

-- Trigger for products
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 2: Create Orders Table
-- =====================================================

CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    customer_email TEXT NOT NULL,
    shipping_info JSONB NOT NULL DEFAULT '{}'::jsonb,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'pending',
    payment_intent_id TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price_at_purchase DECIMAL(10,2) NOT NULL,
    variant_id TEXT,
    variant_name TEXT,
    customization_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable insert for everyone" ON orders;
CREATE POLICY "Enable insert for everyone"
  ON orders FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Enable select for service role only" ON orders;
CREATE POLICY "Enable select for service role only"
  ON orders FOR SELECT
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Enable insert for everyone" ON order_items;
CREATE POLICY "Enable insert for everyone"
  ON order_items FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Enable select for service role only" ON order_items;
CREATE POLICY "Enable select for service role only"
  ON order_items FOR SELECT
  USING (auth.role() = 'service_role');

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 3: Create Saved Designs Table
-- =====================================================

CREATE TABLE IF NOT EXISTS saved_designs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    design_data JSONB NOT NULL,
    thumbnail_url TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saved_designs_user_id ON saved_designs(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_designs_product_id ON saved_designs(product_id);
CREATE INDEX IF NOT EXISTS idx_saved_designs_is_public ON saved_designs(is_public) WHERE is_public = true;

ALTER TABLE saved_designs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own designs" ON saved_designs;
CREATE POLICY "Users can view own designs"
  ON saved_designs FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

DROP POLICY IF EXISTS "Users can insert own designs" ON saved_designs;
CREATE POLICY "Users can insert own designs"
  ON saved_designs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own designs" ON saved_designs;
CREATE POLICY "Users can update own designs"
  ON saved_designs FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own designs" ON saved_designs;
CREATE POLICY "Users can delete own designs"
  ON saved_designs FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- STEP 4: Create Categories Table
-- =====================================================

CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    parent_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Service role can manage categories" ON categories;
CREATE POLICY "Service role can manage categories"
  ON categories FOR ALL
  USING (auth.role() = 'service_role');

-- =====================================================
-- STEP 5: Create Stickers Table
-- =====================================================

CREATE TABLE IF NOT EXISTS stickers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    url TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stickers_category ON stickers(category);
CREATE INDEX IF NOT EXISTS idx_stickers_is_active ON stickers(is_active) WHERE is_active = true;

ALTER TABLE stickers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Stickers are viewable by everyone" ON stickers;
CREATE POLICY "Stickers are viewable by everyone"
  ON stickers FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Service role can manage stickers" ON stickers;
CREATE POLICY "Service role can manage stickers"
  ON stickers FOR ALL
  USING (auth.role() = 'service_role');

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

SELECT '✅ Base tables created successfully! Now you need to add products.' as status;
