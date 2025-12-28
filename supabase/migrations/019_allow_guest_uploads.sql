-- Allow public (anon) uploads to stickers bucket
-- This is required for guest users to upload their own images in the editor

DROP POLICY IF EXISTS "Public upload stickers" ON storage.objects;

CREATE POLICY "Public upload stickers"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'stickers');

-- Ensure they can read their own uploads (already covered by "Public sticker access")
