-- =====================================================
-- Migration: CRM and Marketing Tables
-- Created: 2025-12-28
-- Description: Creates tables for Banners, Coupons, and Abandoned Carts
-- =====================================================

-- 0. HELPER FUNCTION FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. BANNERS
CREATE TABLE IF NOT EXISTS banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    link_url TEXT,
    is_active BOOLEAN DEFAULT true,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    priority INTEGER DEFAULT 0, -- Higher number = higher priority
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_banners_active ON banners(is_active);
CREATE INDEX idx_banners_priority ON banners(priority DESC);

-- 2. COUPONS / DISCOUNTS
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL, -- e.g. "SUMMER20"
    type TEXT NOT NULL, -- 'percentage', 'fixed_amount'
    value DECIMAL(10,2) NOT NULL, -- e.g. 20 (for 20%) or 10.00 (for €10)
    min_order_amount DECIMAL(10,2),
    max_uses INTEGER,
    uses_count INTEGER DEFAULT 0,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(is_active);

-- 3. ABANDONED CARTS
CREATE TABLE IF NOT EXISTS abandoned_carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    session_id TEXT, -- For guest users
    email TEXT, -- Captured email if available
    items JSONB NOT NULL DEFAULT '[]'::jsonb, -- Snapshot of cart items
    total_amount DECIMAL(10,2),
    recovery_status TEXT DEFAULT 'pending', -- 'pending', 'recovered', 'lost'
    reminder_sent_count INTEGER DEFAULT 0,
    last_reminder_sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_abandoned_created ON abandoned_carts(created_at);
CREATE INDEX idx_abandoned_status ON abandoned_carts(recovery_status);

-- 4. ENABLE RLS
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE abandoned_carts ENABLE ROW LEVEL SECURITY;

-- Banners policies
CREATE POLICY "Public read banners" ON banners FOR SELECT USING (true);
CREATE POLICY "Admin full access banners" ON banners FOR ALL USING (auth.role() = 'service_role');

-- Coupons policies
CREATE POLICY "Public read coupons" ON coupons FOR SELECT USING (true); -- Need to validate code
CREATE POLICY "Admin full access coupons" ON coupons FOR ALL USING (auth.role() = 'service_role');

-- Abandoned carts policies
CREATE POLICY "Service role full access carts" ON abandoned_carts FOR ALL USING (auth.role() = 'service_role');
-- Owners can see their own carts if logged in (optional)
CREATE POLICY "Users view own carts" ON abandoned_carts FOR SELECT 
USING (auth.uid() = user_id);

-- 5. TRIGGER FOR UPDATED_AT
CREATE TRIGGER update_banners_timestamp BEFORE UPDATE ON banners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_coupons_timestamp BEFORE UPDATE ON coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_carts_timestamp BEFORE UPDATE ON abandoned_carts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
