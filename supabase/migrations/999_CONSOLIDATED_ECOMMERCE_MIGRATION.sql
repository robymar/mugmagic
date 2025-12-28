-- =====================================================
-- CONSOLIDATED MIGRATION: E-commerce Critical Improvements
-- Created: 2025-12-28
-- Description: Complete migration for SKU separation, stock reservations, and idempotency
-- Execute this entire script in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- PART 1: Product Variants Table (SKU Separation)
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
CREATE INDEX IF NOT EXISTS idx_variants_attributes ON product_variants USING GIN (attributes);

-- 3. CREATE TRIGGER FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_variant_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_variant_timestamp ON product_variants;
CREATE TRIGGER trigger_update_variant_timestamp
BEFORE UPDATE ON product_variants
FOR EACH ROW
EXECUTE FUNCTION update_variant_updated_at();

-- 4. ENABLE RLS
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

-- 5. CREATE FUNCTION TO SYNC VARIANT STOCK WITH PRODUCT
CREATE OR REPLACE FUNCTION sync_product_stock()
RETURNS TRIGGER AS $$
BEGIN
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

DROP TRIGGER IF EXISTS trigger_sync_product_stock ON product_variants;
CREATE TRIGGER trigger_sync_product_stock
AFTER INSERT OR UPDATE OF stock_quantity, is_available ON product_variants
FOR EACH ROW
EXECUTE FUNCTION sync_product_stock();

COMMIT;

-- =====================================================
-- PART 2: Stock Reservations Table
-- =====================================================

BEGIN;

-- 1. CREATE STOCK RESERVATIONS TABLE
CREATE TABLE IF NOT EXISTS stock_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    checkout_id TEXT NOT NULL,
    user_id TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'expired', 'cancelled')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CREATE INDICES
CREATE INDEX IF NOT EXISTS idx_reservations_variant_id ON stock_reservations(variant_id);
CREATE INDEX IF NOT EXISTS idx_reservations_checkout_id ON stock_reservations(checkout_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON stock_reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_expires_at ON stock_reservations(expires_at);
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON stock_reservations(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reservations_status_expires ON stock_reservations(status, expires_at);

-- 3. STOCK RESERVATION FUNCTIONS
CREATE OR REPLACE FUNCTION get_available_stock(p_variant_id UUID)
RETURNS INTEGER AS $$
DECLARE
    physical_stock INTEGER;
    reserved_stock INTEGER;
BEGIN
    SELECT stock_quantity INTO physical_stock
    FROM product_variants
    WHERE id = p_variant_id;
    
    IF physical_stock IS NULL THEN
        RETURN 0;
    END IF;
    
    SELECT COALESCE(SUM(quantity), 0) INTO reserved_stock
    FROM stock_reservations
    WHERE variant_id = p_variant_id
    AND status = 'pending'
    AND expires_at > NOW();
    
    RETURN physical_stock - reserved_stock;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_stock_reservation(
    p_variant_id UUID,
    p_quantity INTEGER,
    p_checkout_id TEXT,
    p_user_id TEXT DEFAULT NULL,
    p_ttl_minutes INTEGER DEFAULT 15
)
RETURNS stock_reservations AS $$
DECLARE
    available_stock INTEGER;
    new_reservation stock_reservations;
BEGIN
    available_stock := get_available_stock(p_variant_id);
    
    IF available_stock < p_quantity THEN
        RAISE EXCEPTION 'Insufficient stock. Available: %, Requested: %', available_stock, p_quantity;
    END IF;
    
    INSERT INTO stock_reservations (
        variant_id, quantity, checkout_id, user_id, status, expires_at
    ) VALUES (
        p_variant_id, p_quantity, p_checkout_id, p_user_id, 'pending',
        NOW() + (p_ttl_minutes || ' minutes')::INTERVAL
    )
    RETURNING * INTO new_reservation;
    
    RETURN new_reservation;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION confirm_stock_reservation(p_checkout_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    reservation RECORD;
BEGIN
    FOR reservation IN
        SELECT variant_id, quantity
        FROM stock_reservations
        WHERE checkout_id = p_checkout_id AND status = 'pending'
    LOOP
        UPDATE product_variants
        SET stock_quantity = stock_quantity - reservation.quantity
        WHERE id = reservation.variant_id;
        
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Variant not found: %', reservation.variant_id;
        END IF;
    END LOOP;
    
    UPDATE stock_reservations
    SET status = 'confirmed', updated_at = NOW()
    WHERE checkout_id = p_checkout_id AND status = 'pending';
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION release_stock_reservation(p_checkout_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE stock_reservations
    SET status = 'cancelled', updated_at = NOW()
    WHERE checkout_id = p_checkout_id AND status = 'pending';
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION cleanup_expired_reservations()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    UPDATE stock_reservations
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'pending' AND expires_at < NOW();
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- 4. ENABLE RLS
ALTER TABLE stock_reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own reservations" ON stock_reservations;
DROP POLICY IF EXISTS "Service role can insert" ON stock_reservations;
DROP POLICY IF EXISTS "Service role can update" ON stock_reservations;

CREATE POLICY "Users can view own reservations"
ON stock_reservations FOR SELECT
USING (auth.uid()::text = user_id OR auth.role() = 'service_role');

CREATE POLICY "Service role can insert"
ON stock_reservations FOR INSERT
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update"
ON stock_reservations FOR UPDATE
USING (auth.role() = 'service_role');

COMMIT;

-- =====================================================
-- PART 3: Idempotency Keys Table
-- =====================================================

BEGIN;

CREATE TABLE IF NOT EXISTS idempotency_keys (
    key TEXT PRIMARY KEY,
    request_path TEXT NOT NULL,
    request_body JSONB,
    response_data JSONB NOT NULL,
    status_code INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_idempotency_expires_at ON idempotency_keys(expires_at);
CREATE INDEX IF NOT EXISTS idx_idempotency_created_at ON idempotency_keys(created_at DESC);

CREATE OR REPLACE FUNCTION cleanup_expired_idempotency_keys()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM idempotency_keys WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION store_idempotent_response(
    p_key TEXT,
    p_request_path TEXT,
    p_request_body JSONB,
    p_response_data JSONB,
    p_status_code INTEGER,
    p_ttl_hours INTEGER DEFAULT 24
)
RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO idempotency_keys (
        key, request_path, request_body, response_data, status_code, expires_at
    ) VALUES (
        p_key, p_request_path, p_request_body, p_response_data, p_status_code,
        NOW() + (p_ttl_hours || ' hours')::INTERVAL
    ) ON CONFLICT (key) DO NOTHING;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_idempotent_response(p_key TEXT)
RETURNS TABLE (
    response_data JSONB,
    status_code INTEGER,
    is_expired BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ik.response_data,
        ik.status_code,
        (ik.expires_at < NOW()) as is_expired
    FROM idempotency_keys ik
    WHERE ik.key = p_key;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE idempotency_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role only" ON idempotency_keys;
CREATE POLICY "Service role only"
ON idempotency_keys FOR ALL
USING (auth.role() = 'service_role');

COMMIT;

-- =====================================================
-- PART 4: Migrate Existing Variants Data
-- =====================================================

DO $$
DECLARE
    product_record RECORD;
    variant_json JSONB;
    variant_count INTEGER := 0;
BEGIN
    -- Migrate products WITH variants from JSONB
    FOR product_record IN 
        SELECT id, name, base_price, variants, stock_quantity
        FROM products
        WHERE variants IS NOT NULL 
        AND jsonb_array_length(variants) > 0
    LOOP
        FOR variant_json IN 
            SELECT * FROM jsonb_array_elements(product_record.variants)
        LOOP
            INSERT INTO product_variants (
                product_id, sku_code, name, price, stock_quantity, attributes, is_available, sort_order
            ) VALUES (
                product_record.id,
                COALESCE(variant_json->>'id', product_record.id || '-' || (variant_json->>'name')),
                variant_json->>'name',
                product_record.base_price + COALESCE((variant_json->>'priceModifier')::decimal, 0),
                COALESCE(product_record.stock_quantity, 50),
                jsonb_build_object(
                    'color', variant_json->>'color',
                    'hexCode', variant_json->>'hexCode',
                    'image', variant_json->>'image'
                ),
                true,
                0
            )
            ON CONFLICT (sku_code) DO NOTHING;
            
            variant_count := variant_count + 1;
        END LOOP;
    END LOOP;
    
    -- Create default variant for products WITHOUT variants
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
    
    RAISE NOTICE 'Migration complete. Created % variant records', variant_count;
END $$;

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
DECLARE
    products_count INTEGER;
    variants_count INTEGER;
    reservations_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO products_count FROM products;
    SELECT COUNT(*) INTO variants_count FROM product_variants;
    SELECT COUNT(*) INTO reservations_count FROM stock_reservations;
    
    RAISE NOTICE '✅ Migration Summary:';
    RAISE NOTICE '   Products: %', products_count;
    RAISE NOTICE '   Variants: %', variants_count;
    RAISE NOTICE '   Reservations: %', reservations_count;
    RAISE NOTICE '   Tables created: product_variants, stock_reservations, idempotency_keys';
    RAISE NOTICE '   Functions created: 9 stored procedures';
END $$;

-- ANALYZE TABLES
ANALYZE product_variants;
ANALYZE stock_reservations;
ANALYZE idempotency_keys;

SELECT '✅ Migration completed successfully!' as status;
