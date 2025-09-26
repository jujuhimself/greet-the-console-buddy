-- Fix storage buckets and policies for prescription uploads
-- This ensures all required buckets exist with proper access policies

-- 1. Create prescriptions bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'prescriptions', 
  'prescriptions', 
  false,  -- Private bucket for security
  52428800,  -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Create product-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images', 
  'product-images', 
  true,  -- Public bucket for product images
  10485760,  -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 3. Create lab-results bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lab-results', 
  'lab-results', 
  true,  -- Public bucket for lab results
  52428800,  -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- 4. Drop existing storage policies to recreate them
DROP POLICY IF EXISTS "Users can upload prescriptions" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own prescriptions" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own prescriptions" ON storage.objects;
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view lab results" ON storage.objects;
DROP POLICY IF EXISTS "Lab staff can upload lab results" ON storage.objects;

-- 5. Create storage policies for prescriptions bucket
CREATE POLICY "Users can upload prescriptions" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'prescriptions' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own prescriptions" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'prescriptions' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own prescriptions" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'prescriptions' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 6. Create storage policies for product-images bucket
CREATE POLICY "Public can view product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' AND 
    auth.role() = 'authenticated'
  );

-- 7. Create storage policies for lab-results bucket
CREATE POLICY "Public can view lab results" ON storage.objects
  FOR SELECT USING (bucket_id = 'lab-results');

CREATE POLICY "Lab staff can upload lab results" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'lab-results' AND 
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('lab', 'admin')
  );

-- 8. Verify buckets exist
SELECT 
  id as bucket_id,
  name,
  public,
  file_size_limit,
  created_at
FROM storage.buckets 
WHERE id IN ('prescriptions', 'product-images', 'lab-results')
ORDER BY id; 