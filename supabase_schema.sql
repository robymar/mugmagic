-- Create products table
create table if not exists products (
  id text primary key,
  name text not null,
  slug text unique not null,
  description text,
  long_description text,
  category text,
  base_price decimal(10,2) not null,
  compare_at_price decimal(10,2),
  images jsonb not null default '{}'::jsonb,
  specifications jsonb not null default '{}'::jsonb,
  variants jsonb not null default '[]'::jsonb,
  tags text[] default '{}',
  in_stock boolean default true,
  featured boolean default false,
  bestseller boolean default false,
  new boolean default false,
  rating decimal(3,2),
  review_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table products enable row level security;

-- Policies
create policy "Public products are viewable by everyone"
  on products for select
  using (true);

-- Insert policy (for seeding/admin)
create policy "Enable insert for authenticated users only"
  on products for insert
  with check (auth.role() = 'authenticated' or auth.role() = 'anon'); 
  -- NOTE: For production, remove 'anon' permissions after seeding

-- Update policy
create policy "Enable update for authenticated users only"
  on products for update
  using (auth.role() = 'authenticated');
