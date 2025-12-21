create table if not exists wishlist (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  product_id text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, product_id)
);

alter table wishlist enable row level security;

create policy "Users can view their own wishlist"
  on wishlist for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own wishlist items"
  on wishlist for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete their own wishlist items"
  on wishlist for delete
  using ( auth.uid() = user_id );
