-- 1. Add quantity column for specific stock tracking
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0;

-- 2. Backfill existing products with a default stock (e.g., 50) 
-- ideally the merchant should update this manually
UPDATE products 
SET stock_quantity = 50 
WHERE stock_quantity = 0;

-- 3. Create Atomic Decrement Function
-- This function prevents race conditions by locking the row during update
CREATE OR REPLACE FUNCTION decrement_stock(row_id UUID, quantity_to_subtract INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  current_stock INTEGER;
BEGIN
  -- Select current stock with FOR UPDATE to lock the row
  SELECT stock_quantity INTO current_stock
  FROM products
  WHERE id = row_id
  FOR UPDATE;

  -- Check if product exists
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Check if enough stock available
  IF current_stock >= quantity_to_subtract THEN
    -- Update stock
    UPDATE products
    SET 
        stock_quantity = stock_quantity - quantity_to_subtract,
        -- Auto-update boolean flag if stock hits 0
        in_stock = (stock_quantity - quantity_to_subtract > 0)
    WHERE id = row_id;
    
    RETURN TRUE;
  ELSE
    -- Not enough stock
    RETURN FALSE;
  END IF;
END;
$$;
