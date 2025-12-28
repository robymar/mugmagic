-- =====================================================
-- Migration: Idempotency Keys Table
-- Created: 2025-12-28
-- Description: Creates table for tracking idempotent requests to prevent duplicate payments
-- =====================================================

-- 1. CREATE IDEMPOTENCY KEYS TABLE
CREATE TABLE IF NOT EXISTS idempotency_keys (
    key TEXT PRIMARY KEY,
    request_path TEXT NOT NULL,
    request_body JSONB,
    response_data JSONB NOT NULL,
    status_code INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 2. CREATE INDICES
CREATE INDEX idx_idempotency_expires_at ON idempotency_keys(expires_at);
CREATE INDEX idx_idempotency_created_at ON idempotency_keys(created_at DESC);

-- 3. CREATE FUNCTION TO CLEANUP EXPIRED KEYS
CREATE OR REPLACE FUNCTION cleanup_expired_idempotency_keys()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM idempotency_keys
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 4. CREATE FUNCTION TO STORE IDEMPOTENT RESPONSE
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
        key,
        request_path,
        request_body,
        response_data,
        status_code,
        expires_at
    ) VALUES (
        p_key,
        p_request_path,
        p_request_body,
        p_response_data,
        p_status_code,
        NOW() + (p_ttl_hours || ' hours')::INTERVAL
    )
    ON CONFLICT (key) DO NOTHING;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 5. CREATE FUNCTION TO GET CACHED RESPONSE
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

-- 6. ENABLE RLS
ALTER TABLE idempotency_keys ENABLE ROW LEVEL SECURITY;

-- Only service role can access idempotency keys
CREATE POLICY "Service role only"
ON idempotency_keys FOR ALL
USING (auth.role() = 'service_role');

-- 7. ANALYZE TABLE
ANALYZE idempotency_keys;

-- Note: This table should be cleaned up periodically
-- Recommended: Run cleanup_expired_idempotency_keys() daily via cron
