-- Create saved_designs table
create table if not exists saved_designs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  product_id text not null,
  name text not null,
  canvas_state jsonb not null,
  preview_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table saved_designs enable row level security;

-- Policies for saved_designs
create policy "Users can view their own saved designs"
  on saved_designs for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own saved designs"
  on saved_designs for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own saved designs"
  on saved_designs for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own saved designs"
  on saved_designs for delete
  using ( auth.uid() = user_id );

-- Create storage bucket for saved design previews
-- Note: 'saved_designs' bucket must be created in the Supabase dashboard if not exists, 
-- but we can try to insert it into storage.buckets if we have permissions (often requires service role)
-- For now, we define the policies assuming the bucket exists or will be created.

create policy "Saved Designs Images are viewable by owner"
  on storage.objects for select
  using ( bucket_id = 'saved_designs' and auth.uid()::text = (storage.foldername(name))[1] );

create policy "Authenticated users can upload saved design images"
  on storage.objects for insert
  with check ( bucket_id = 'saved_designs' and auth.role() = 'authenticated' );

create policy "Users can update their own saved design images"
  on storage.objects for update
  with check ( bucket_id = 'saved_designs' and auth.uid()::text = (storage.foldername(name))[1] );
