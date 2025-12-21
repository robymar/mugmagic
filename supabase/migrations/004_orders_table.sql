-- Create orders table
create table if not exists orders (
  id text primary key, -- Use Stripe PaymentIntent ID or custom UUID
  order_number text unique not null,
  customer_email text not null,
  shipping_info jsonb not null default '{}'::jsonb,
  total_amount decimal(10,2) not null,
  payment_status text not null default 'pending', -- pending, paid, failed
  payment_intent_id text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create order items table
create table if not exists order_items (
  id uuid default gen_random_uuid() primary key,
  order_id text references orders(id) on delete cascade,
  product_id text not null, -- references products(id) usually, but kept loose if products deleted
  product_name text not null,
  quantity integer not null,
  price_at_purchase decimal(10,2) not null,
  variant_id text,
  variant_name text,
  customization_data jsonb, -- snapshots, preview URLs
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table orders enable row level security;
alter table order_items enable row level security;

-- Policies for Orders
-- Admin/Service Role can do anything
-- Authenticated users can view their own orders (if we linked auth.uid, which we haven't yet, so we use email matching for now or public insert for checkout)

create policy "Enable insert for everyone"
  on orders for insert
  with check (true);

create policy "Enable select for service role only"
  on orders for select
  using (auth.role() = 'service_role');

-- Policies for Order Items
create policy "Enable insert for everyone"
  on order_items for insert
  with check (true);

create policy "Enable select for service role only"
  on order_items for select
  using (auth.role() = 'service_role');
