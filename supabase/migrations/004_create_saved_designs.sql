-- Create saved_designs table
create table saved_designs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id), -- nullable for anonymous saves if we want
  product_id text, -- ID of the product being customized
  name text,
  canvas_state jsonb not null, -- Stores fabric.js JSON
  preview_url text -- Optional preview image
);

-- RLS Policies
alter table saved_designs enable row level security;

-- Allow authenticad users to see their own
create policy "Users can view own designs"
  on saved_designs for select
  using (auth.uid() = user_id);

create policy "Users can insert own designs"
  on saved_designs for insert
  with check (auth.uid() = user_id);

-- For dev/anon access (optional, if we want guest designs)
create policy "Anon can insert designs"
  on saved_designs for insert
  with check (auth.role() = 'anon');
  
create policy "Anon can view designs" -- careful with this one
  on saved_designs for select
  using (true); 
