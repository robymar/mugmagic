-- Add user_id to orders table
ALTER TABLE orders 
ADD COLUMN user_id uuid REFERENCES auth.users(id);

-- Update RLS policies to allow users to see their own orders
DROP POLICY IF EXISTS "Public can view their own orders" ON orders;

CREATE POLICY "Users can view their own orders" 
ON orders FOR SELECT 
USING (
  auth.uid() = user_id 
  OR 
  -- Keep allowing access via email/order_number for guest tracking (optional, but good for hybrid)
  -- But usually, authenticated users should see via ID.
  -- For guests, we rely on server-side logic (bypass RLS) for tracking.
  -- So strictly strictly:
  auth.uid() = user_id
);

-- Note: The tracking API usually uses a SERVICE_ROLE key or similar backend logic.
-- If tracking page is client-side direct query, you need policy for that. 
-- Our tracking page uses an API route which uses DB admin client, so RLS doesn't block it.
