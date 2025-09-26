-- Create prescriptions bucket for prescription uploads
-- Run this in the Supabase SQL Editor

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

-- 2. Create storage policies for prescriptions bucket
DROP POLICY IF EXISTS "Users can upload prescriptions" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own prescriptions" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own prescriptions" ON storage.objects;

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

-- 3. Verify the bucket was created
SELECT 
  id as bucket_id,
  name,
  public,
  file_size_limit,
  created_at
FROM storage.buckets 
WHERE id = 'prescriptions'; 