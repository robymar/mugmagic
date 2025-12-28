-- =====================================================
-- Migration: Product Variants Table (SKU Separation)
-- Created: 2025-12-28
-- Description: Migrates product variants from JSONB to relational table for better performance and stock management
-- =====================================================

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
CREATE INDEX idx_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_variants_sku_code ON product_variants(sku_code);
CREATE INDEX idx_variants_is_available ON product_variants(is_available) WHERE is_available = true;
CREATE INDEX idx_variants_attributes ON product_variants USING GIN (attributes);

-- 3. CREATE TRIGGER FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_variant_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_variant_timestamp
BEFORE UPDATE ON product_variants
FOR EACH ROW
EXECUTE FUNCTION update_variant_updated_at();

-- 4. ENABLE RLS
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Public read access for variants
CREATE POLICY "Enable read access for all users"
ON product_variants FOR SELECT
USING (true);

-- Only service role can modify variants
CREATE POLICY "Enable insert for service role only"
ON product_variants FOR INSERT
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Enable update for service role only"
ON product_variants FOR UPDATE
USING (auth.role() = 'service_role');

CREATE POLICY "Enable delete for service role only"
ON product_variants FOR DELETE
USING (auth.role() = 'service_role');

-- 5. CREATE FUNCTION TO SYNC VARIANT STOCK WITH PRODUCT
CREATE OR REPLACE FUNCTION sync_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Update product's in_stock based on any variant having stock
    UPDATE products
    SET in_stock = EXISTS (
        SELECT 1 FROM product_variants
        WHERE product_id = NEW.product_id
        AND stock_quantity > 0
        AND is_available = true
    )
    WHERE id = NEW.product_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_product_stock
AFTER INSERT OR UPDATE OF stock_quantity, is_available ON product_variants
FOR EACH ROW
EXECUTE FUNCTION sync_product_stock();

-- 6. ANALYZE TABLE
ANALYZE product_variants;
