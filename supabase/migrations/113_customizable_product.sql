-- Add customizable column to products table
-- Default to true for existing products since this was a customizer-first app

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS customizable BOOLEAN DEFAULT true;

-- Update the types for TypeScript generation checking
COMMENT ON COLUMN products.customizable IS 'If true, product goes to editor. If false, adds directly to cart.';
