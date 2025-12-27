-- Create storage bucket for stickers
INSERT INTO storage.buckets (id, name, public)
VALUES ('stickers', 'stickers', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to stickers
DROP POLICY IF EXISTS "Public sticker access" ON storage.objects;
CREATE POLICY "Public sticker access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'stickers');

-- Allow authenticated users to upload stickers
DROP POLICY IF EXISTS "Authenticated upload stickers" ON storage.objects;
CREATE POLICY "Authenticated upload stickers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'stickers');

-- Allow admins to update stickers
DROP POLICY IF EXISTS "Admins update stickers" ON storage.objects;
CREATE POLICY "Admins update stickers"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'stickers' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Allow admins to delete stickers
DROP POLICY IF EXISTS "Admins delete stickers" ON storage.objects;
CREATE POLICY "Admins delete stickers"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'stickers' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
