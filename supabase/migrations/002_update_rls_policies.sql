-- Allow anonymous delete
create policy "Enable delete for authenticated users only"
  on products for delete
  using (auth.role() = 'authenticated' or auth.role() = 'anon');

-- Allow anonymous update
drop policy "Enable update for authenticated users only" on products;
create policy "Enable update for authenticated users only"
  on products for update
  using (auth.role() = 'authenticated' or auth.role() = 'anon');
