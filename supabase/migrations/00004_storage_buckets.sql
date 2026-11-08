-- ==============================================================================
-- 00004_storage_buckets.sql
-- Storage Buckets & Policies for Bits N Bobs Media
-- ==============================================================================

-- 1. Create Storage Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'product-images',
    'product-images',
    true,
    5242880, -- 5 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml']
  ),
  (
    'product-videos',
    'product-videos',
    true,
    52428800, -- 50 MB
    ARRAY['video/mp4', 'video/webm', 'video/quicktime']
  ),
  (
    'site-content',
    'site-content',
    true,
    10485760, -- 10 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf']
  )
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Storage Policies on storage.objects

-- Allow public read access to all objects in these buckets
DROP POLICY IF EXISTS "Public can view product and site assets" ON storage.objects;
CREATE POLICY "Public can view product and site assets"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id IN ('product-images', 'product-videos', 'site-content'));

-- Allow admins to upload objects
DROP POLICY IF EXISTS "Admins can upload product and site assets" ON storage.objects;
CREATE POLICY "Admins can upload product and site assets"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id IN ('product-images', 'product-videos', 'site-content')
    AND public.is_admin()
  );

-- Allow admins to update objects
DROP POLICY IF EXISTS "Admins can update product and site assets" ON storage.objects;
CREATE POLICY "Admins can update product and site assets"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id IN ('product-images', 'product-videos', 'site-content')
    AND public.is_admin()
  )
  WITH CHECK (
    bucket_id IN ('product-images', 'product-videos', 'site-content')
    AND public.is_admin()
  );

-- Allow admins to delete objects
DROP POLICY IF EXISTS "Admins can delete product and site assets" ON storage.objects;
CREATE POLICY "Admins can delete product and site assets"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id IN ('product-images', 'product-videos', 'site-content')
    AND public.is_admin()
  );

