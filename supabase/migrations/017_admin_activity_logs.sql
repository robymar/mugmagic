-- =====================================================
-- Migration: Admin Activity Logs
-- Created: 2025-12-28
-- Description: Creates table for tracking admin and system activities
-- =====================================================

-- 1. CREATE ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_type TEXT NOT NULL, -- 'order_created', 'product_updated', 'stock_low', 'user_registered', 'login'
    entity_type TEXT NOT NULL, -- 'order', 'product', 'user', 'system'
    entity_id TEXT, -- ID of the affected entity
    details JSONB DEFAULT '{}'::jsonb, -- Flexible details (e.g. "Stock changed from 5 to 2")
    user_id UUID, -- Who performed the action (nullable for system events)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CREATE INDICES
CREATE INDEX idx_activity_created_at ON admin_activity_logs(created_at DESC);
CREATE INDEX idx_activity_action_type ON admin_activity_logs(action_type);
CREATE INDEX idx_activity_entity ON admin_activity_logs(entity_type, entity_id);

-- 3. ENABLE RLS
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Allow read for admin (service role for now, or authenticated admin)
CREATE POLICY "Enable read for admins"
ON admin_activity_logs FOR SELECT
USING (auth.role() = 'service_role'); -- Expand this later for admin users

-- Allow insert for system/service role
CREATE POLICY "Enable insert for service role"
ON admin_activity_logs FOR INSERT
With CHECK (auth.role() = 'service_role');

-- 4. AUTO-LOGGING TRIGGERS (Optional but recommended for consistency)

-- Trigger for New Orders
CREATE OR REPLACE FUNCTION log_new_order()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO admin_activity_logs (action_type, entity_type, entity_id, details)
    VALUES (
        'order', 
        'order', 
        NEW.id, 
        jsonb_build_object(
            'order_number', NEW.order_number, 
            'total', NEW.total_amount,
            'customer', NEW.customer_email
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_new_order
AFTER INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION log_new_order();

-- Trigger for Critical Stock (checking product_variants)
CREATE OR REPLACE FUNCTION log_low_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Log only if stock drops below 5 and was previously above or equal 5
    IF NEW.stock_quantity < 5 AND (OLD.stock_quantity >= 5 OR OLD.stock_quantity IS NULL) THEN
        INSERT INTO admin_activity_logs (action_type, entity_type, entity_id, details)
        VALUES (
            'alert', 
            'product_variant', 
            NEW.id, 
            jsonb_build_object(
                'sku', NEW.sku_code,
                'name', NEW.name,
                'stock', NEW.stock_quantity,
                'message', 'Low stock warning'
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_low_stock
AFTER UPDATE ON product_variants
FOR EACH ROW
EXECUTE FUNCTION log_low_stock();
