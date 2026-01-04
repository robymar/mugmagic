-- =====================================================
-- CREATE PRODUCT VARIANTS TABLE
-- This allows products to have multiple variants (colors, sizes, etc.)
-- Execute this in Supabase SQL Editor
-- =====================================================

BEGIN;

-- 1. CREATE PRODUCT VARIANTS TABLE
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_available BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CREATE INDICES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_sku_code ON product_variants(sku_code);
CREATE INDEX IF NOT EXISTS idx_variants_is_available ON product_variants(is_available) WHERE is_available = true;

-- 3. ENABLE RLS
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON product_variants;
DROP POLICY IF EXISTS "Enable insert for service role only" ON product_variants;
DROP POLICY IF EXISTS "Enable update for service role only" ON product_variants;
DROP POLICY IF EXISTS "Enable delete for service role only" ON product_variants;

-- Create policies
CREATE POLICY "Enable read access for all users"
ON product_variants FOR SELECT
USING (true);

CREATE POLICY "Enable insert for service role only"
ON product_variants FOR INSERT
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Enable update for service role only"
ON product_variants FOR UPDATE
USING (auth.role() = 'service_role');

CREATE POLICY "Enable delete for service role only"
ON product_variants FOR DELETE
USING (auth.role() = 'service_role');

COMMIT;

-- =====================================================
-- MIGRATE EXISTING PRODUCTS TO VARIANTS
-- This creates default variants from existing products
-- =====================================================

-- For products WITH variants in JSONB
INSERT INTO product_variants (
    product_id, sku_code, name, price, stock_quantity, attributes, is_available, sort_order
)
SELECT 
    p.id,
    p.id || '-' || (v->>'id'),
    v->>'name',
    p.base_price + COALESCE((v->>'priceModifier')::decimal, 0),
    p.stock_quantity,
    jsonb_build_object(
        'color', v->>'color',
        'hexCode', v->>'hexCode',
        'image', v->>'image'
    ),
    true,
    0
FROM products p,
jsonb_array_elements(p.variants) v
WHERE p.variants IS NOT NULL 
AND jsonb_array_length(p.variants) > 0
ON CONFLICT (sku_code) DO NOTHING;

-- For products WITHOUT variants (create a default variant)
INSERT INTO product_variants (
    product_id, sku_code, name, price, stock_quantity, attributes, is_available
)
SELECT 
    id,
    id || '-default',
    'Standard',
    base_price,
    COALESCE(stock_quantity, 50),
    '{}'::jsonb,
    in_stock
FROM products
WHERE variants IS NULL OR jsonb_array_length(variants) = 0
ON CONFLICT (sku_code) DO NOTHING;

-- Show results
SELECT 
    'Product Variants Created: ' || COUNT(*)::text as status
FROM product_variants;
