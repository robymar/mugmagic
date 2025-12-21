-- Enable storage by updating policies
-- Note: You must first create the bucket named 'products' in the dashboard!

-- 1. Allow public read access to 'products' bucket
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'products' );

-- 2. Allow authenticated (and anon for dev) uploads to 'products' bucket
create policy "Allow Uploads"
  on storage.objects for insert
  with check ( bucket_id = 'products' );

-- 3. Allow updates/deletes if needed
create policy "Allow Updates and Deletes"
  on storage.objects for update
  with check ( bucket_id = 'products' );

create policy "Allow Deletes"
  on storage.objects for delete
  using ( bucket_id = 'products' );
