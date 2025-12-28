-- =====================================================
-- Migration: Fix Stock Field & Add Performance Indices
-- Created: 2025-12-28
-- Description: Standardizes stock field and adds critical indices for performance
-- =====================================================

-- 1. ENSURE STOCK_QUANTITY COLUMN EXISTS ON PRODUCTS
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0;

-- Backfill any products that might not have stock_quantity set
UPDATE products 
SET stock_quantity = 50 
WHERE stock_quantity = 0 OR stock_quantity IS NULL;

-- 2. ADD PERFORMANCE INDICES FOR PRODUCTS TABLE
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_products_bestseller ON products(bestseller) WHERE bestseller = true;
CREATE INDEX IF NOT EXISTS idx_products_new ON products(new) WHERE new = true;
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- 3. ADD PERFORMANCE INDICES FOR OTHER TABLES
-- Only create index if both table AND column exist

-- Orders table indices
DO $$
BEGIN
    -- order_number index
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'order_number') THEN
        CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
        RAISE NOTICE 'Created index on orders.order_number';
    END IF;
    
    -- customer_email index
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'customer_email') THEN
        CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
        RAISE NOTICE 'Created index on orders.customer_email';
    END IF;
    
    -- payment_status index
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'payment_status') THEN
        CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
        RAISE NOTICE 'Created index on orders.payment_status';
    END IF;
    
    -- user_id index
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'user_id') THEN
        CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
        RAISE NOTICE 'Created index on orders.user_id';
    END IF;
    
    -- Composite index for status + created_at
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'payment_status')
       AND EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'created_at') THEN
        CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(payment_status, created_at DESC);
        RAISE NOTICE 'Created composite index on orders(payment_status, created_at)';
    END IF;
END $$;

-- Stickers table indices
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'stickers' AND column_name = 'category') THEN
        CREATE INDEX IF NOT EXISTS idx_stickers_category ON stickers(category);
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'stickers' AND column_name = 'active') THEN
        CREATE INDEX IF NOT EXISTS idx_stickers_active ON stickers(active) WHERE active = true;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'stickers' AND column_name = 'display_order') THEN
        CREATE INDEX IF NOT EXISTS idx_stickers_display_order ON stickers(display_order);
    END IF;
END $$;

-- Avatars table indices
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'avatars' AND column_name = 'category') THEN
        CREATE INDEX IF NOT EXISTS idx_avatars_category ON avatars(category);
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'avatars' AND column_name = 'active') THEN
        CREATE INDEX IF NOT EXISTS idx_avatars_active ON avatars(active) WHERE active = true;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'avatars' AND column_name = 'display_order') THEN
        CREATE INDEX IF NOT EXISTS idx_avatars_display_order ON avatars(display_order);
    END IF;
END $$;

-- Categories table indices
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'categories' AND column_name = 'slug') THEN
        CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'categories' AND column_name = 'parent_id') THEN
        CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'categories' AND column_name = 'display_order') THEN
        CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);
    END IF;
END $$;

-- Saved designs table indices
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'saved_designs' AND column_name = 'user_id') THEN
        CREATE INDEX IF NOT EXISTS idx_saved_designs_user_id ON saved_designs(user_id);
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'saved_designs' AND column_name = 'product_id') THEN
        CREATE INDEX IF NOT EXISTS idx_saved_designs_product_id ON saved_designs(product_id);
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'saved_designs' AND column_name = 'created_at') THEN
        CREATE INDEX IF NOT EXISTS idx_saved_designs_created_at ON saved_designs(created_at DESC);
    END IF;
END $$;

-- 4. ANALYZE TABLES
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'products') THEN
        ANALYZE products;
        RAISE NOTICE 'Analyzed products table';
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'orders') THEN
        ANALYZE orders;
        RAISE NOTICE 'Analyzed orders table';
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'order_items') THEN
        ANALYZE order_items;
        RAISE NOTICE 'Analyzed order_items table';
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'stickers') THEN
        ANALYZE stickers;
        RAISE NOTICE 'Analyzed stickers table';
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'avatars') THEN
        ANALYZE avatars;
        RAISE NOTICE 'Analyzed avatars table';
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'categories') THEN
        ANALYZE categories;
        RAISE NOTICE 'Analyzed categories table';
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'saved_designs') THEN
        ANALYZE saved_designs;
        RAISE NOTICE 'Analyzed saved_designs table';
    END IF;
END $$;

-- Migration complete
SELECT 'Migration completed successfully!' as status;
