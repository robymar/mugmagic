-- Create products table
create table if not exists products (
  id text primary key, -- maintaining text id like 'mug-11oz' for now, or could use uuid
  name text not null,
  slug text unique not null,
  description text,
  long_description text,
  category text,
  base_price decimal(10,2) not null,
  compare_at_price decimal(10,2),
  images jsonb not null default '{}'::jsonb, -- stores { thumbnail: string, gallery: string[] }
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

-- Access policies
alter table products enable row level security;

create policy "Public products are viewable by everyone"
  on products for select
  using (true);

-- Functions
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_products_updated_at
before update on products
for each row
execute function update_updated_at_column();
