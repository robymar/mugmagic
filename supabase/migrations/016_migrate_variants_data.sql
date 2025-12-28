-- =====================================================
-- Migration: Migrate Existing Variants from JSONB to Table
-- Created: 2025-12-28
-- Description: Migrates product variants from JSONB field to product_variants table
-- =====================================================

-- This migration will:
-- 1. Extract variants from products.variants JSONB field
-- 2. Create corresponding rows in product_variants table
-- 3. Preserve existing data for rollback capability

-- IMPORTANT: Review this migration before running
-- Adjust the logic based on your actual JSONB structure

DO $$
DECLARE
    product_record RECORD;
    variant_json JSONB;
    variant_count INTEGER := 0;
BEGIN
    -- Iterate through all products that have variants
    FOR product_record IN 
        SELECT id, name, base_price, variants, stock_quantity
        FROM products
        WHERE variants IS NOT NULL 
        AND jsonb_array_length(variants) > 0
    LOOP
        -- Iterate through each variant in the JSONB array
        FOR variant_json IN 
            SELECT * FROM jsonb_array_elements(product_record.variants)
        LOOP
            -- Insert variant into product_variants table
            INSERT INTO product_variants (
                product_id,
                sku_code,
                name,
                price,
                stock_quantity,
                attributes,
                is_available,
                sort_order
            ) VALUES (
                product_record.id,
                -- Generate SKU code from product_id and variant id
                COALESCE(
                    variant_json->>'id',
                    product_record.id || '-' || (variant_json->>'name')
                ),
                -- Variant name
                variant_json->>'name',
                -- Calculate price: base_price + priceModifier
                product_record.base_price + COALESCE((variant_json->>'priceModifier')::decimal, 0),
                -- Use product's stock_quantity or default
                COALESCE(product_record.stock_quantity, 50),
                -- Store all other variant attributes
                jsonb_build_object(
                    'color', variant_json->>'color',
                    'hexCode', variant_json->>'hexCode',
                    'image', variant_json->>'image',
                    'original_variant_id', variant_json->>'id'
                ),
                -- Assume all existing variants are available
                true,
                -- Use array position or 0
                0
            )
            ON CONFLICT (sku_code) DO NOTHING; -- Skip if SKU already exists
            
            variant_count := variant_count + 1;
        END LOOP;
    END LOOP;
    
    -- For products without variants, create a default variant
    INSERT INTO product_variants (
        product_id,
        sku_code,
        name,
        price,
        stock_quantity,
        attributes,
        is_available
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
    WHERE variants IS NULL 
    OR jsonb_array_length(variants) = 0
    ON CONFLICT (sku_code) DO NOTHING;
    
    -- Log migration results
    RAISE NOTICE 'Migration complete. Created % variant records', variant_count;
    
    -- Note: We don't delete the variants JSONB field yet for safety
    -- You can do that manually after verifying the migration:
    -- ALTER TABLE products DROP COLUMN variants;
    
END $$;

-- Verify migration
DO $$
DECLARE
    products_count INTEGER;
    variants_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO products_count FROM products;
    SELECT COUNT(*) INTO variants_count FROM product_variants;
    
    RAISE NOTICE 'Products: %, Variants: %', products_count, variants_count;
    
    IF variants_count < products_count THEN
        RAISE WARNING 'Some products may not have variants. This is normal if no variants were defined.';
    END IF;
END $$;

-- Analyze tables after migration
ANALYZE products;
ANALYZE product_variants;
