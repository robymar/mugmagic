-- =====================================================
-- Migration: Stock Reservations Table
-- Created: 2025-12-28
-- Description: Creates system for temporary stock reservations during checkout
-- =====================================================

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
CREATE INDEX idx_reservations_variant_id ON stock_reservations(variant_id);
CREATE INDEX idx_reservations_checkout_id ON stock_reservations(checkout_id);
CREATE INDEX idx_reservations_status ON stock_reservations(status);
CREATE INDEX idx_reservations_expires_at ON stock_reservations(expires_at);
CREATE INDEX idx_reservations_user_id ON stock_reservations(user_id) WHERE user_id IS NOT NULL;

-- Compound index for cleanup queries
CREATE INDEX idx_reservations_status_expires ON stock_reservations(status, expires_at);

-- 3. CREATE FUNCTION TO GET AVAILABLE STOCK (Including Reservations)
CREATE OR REPLACE FUNCTION get_available_stock(p_variant_id UUID)
RETURNS INTEGER AS $$
DECLARE
    physical_stock INTEGER;
    reserved_stock INTEGER;
BEGIN
    -- Get physical stock
    SELECT stock_quantity INTO physical_stock
    FROM product_variants
    WHERE id = p_variant_id;
    
    IF physical_stock IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Get reserved stock (pending reservations only)
    SELECT COALESCE(SUM(quantity), 0) INTO reserved_stock
    FROM stock_reservations
    WHERE variant_id = p_variant_id
    AND status = 'pending'
    AND expires_at > NOW();
    
    -- Return available = physical - reserved
    RETURN physical_stock - reserved_stock;
END;
$$ LANGUAGE plpgsql;

-- 4. CREATE FUNCTION TO CREATE RESERVATION
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
    -- Check available stock
    available_stock := get_available_stock(p_variant_id);
    
    IF available_stock < p_quantity THEN
        RAISE EXCEPTION 'Insufficient stock. Available: %, Requested: %', available_stock, p_quantity;
    END IF;
    
    -- Create reservation
    INSERT INTO stock_reservations (
        variant_id,
        quantity,
        checkout_id,
        user_id,
        status,
        expires_at
    ) VALUES (
        p_variant_id,
        p_quantity,
        p_checkout_id,
        p_user_id,
        'pending',
        NOW() + (p_ttl_minutes || ' minutes')::INTERVAL
    )
    RETURNING * INTO new_reservation;
    
    RETURN new_reservation;
END;
$$ LANGUAGE plpgsql;

-- 5. CREATE FUNCTION TO CONFIRM RESERVATION
CREATE OR REPLACE FUNCTION confirm_stock_reservation(p_checkout_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    reservation RECORD;
BEGIN
    -- Update all pending reservations for this checkout
    FOR reservation IN
        SELECT variant_id, quantity
        FROM stock_reservations
        WHERE checkout_id = p_checkout_id
        AND status = 'pending'
    LOOP
        -- Decrement actual stock
        UPDATE product_variants
        SET stock_quantity = stock_quantity - reservation.quantity
        WHERE id = reservation.variant_id;
        
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Variant not found: %', reservation.variant_id;
        END IF;
    END LOOP;
    
    -- Mark reservations as confirmed
    UPDATE stock_reservations
    SET status = 'confirmed',
        updated_at = NOW()
    WHERE checkout_id = p_checkout_id
    AND status = 'pending';
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 6. CREATE FUNCTION TO RELEASE RESERVATION
CREATE OR REPLACE FUNCTION release_stock_reservation(p_checkout_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE stock_reservations
    SET status = 'cancelled',
        updated_at = NOW()
    WHERE checkout_id = p_checkout_id
    AND status = 'pending';
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 7. CREATE FUNCTION TO CLEANUP EXPIRED RESERVATIONS
CREATE OR REPLACE FUNCTION cleanup_expired_reservations()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    UPDATE stock_reservations
    SET status = 'expired',
        updated_at = NOW()
    WHERE status = 'pending'
    AND expires_at < NOW();
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- 8. ENABLE RLS
ALTER TABLE stock_reservations ENABLE ROW LEVEL SECURITY;

-- Users can see their own reservations
CREATE POLICY "Users can view own reservations"
ON stock_reservations FOR SELECT
USING (auth.uid()::text = user_id OR auth.role() = 'service_role');

-- Only service role can modify
CREATE POLICY "Service role can insert"
ON stock_reservations FOR INSERT
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update"
ON stock_reservations FOR UPDATE
USING (auth.role() = 'service_role');

-- 9. ANALYZE TABLE
ANALYZE stock_reservations;
