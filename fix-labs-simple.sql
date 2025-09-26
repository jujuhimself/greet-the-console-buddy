-- Fix labs: Ensure all labs are approved and add more labs
-- This script doesn't use ON CONFLICT since there's no unique constraint on email

-- 1. First, approve all existing labs
UPDATE profiles 
SET is_approved = true 
WHERE role = 'lab' AND is_approved = false;

-- 2. Add more labs (without ON CONFLICT)
INSERT INTO profiles (id, email, business_name, role, region, city, is_approved, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'lab6@example.com', 'Tanga Medical Laboratory', 'lab', 'Tanga', 'Tanga', true, now(), now()),
  (gen_random_uuid(), 'lab7@example.com', 'Morogoro Diagnostic Center', 'lab', 'Morogoro', 'Morogoro', true, now(), now()),
  (gen_random_uuid(), 'lab8@example.com', 'Iringa Clinical Lab', 'lab', 'Iringa', 'Iringa', true, now(), now()),
  (gen_random_uuid(), 'lab9@example.com', 'Mtwara Health Lab', 'lab', 'Mtwara', 'Mtwara', true, now(), now()),
  (gen_random_uuid(), 'lab10@example.com', 'Songea Medical Center', 'lab', 'Ruvuma', 'Songea', true, now(), now());

-- 3. Verify the results
SELECT 
  'Labs after fix:' as info,
  COUNT(*) as total_labs,
  SUM(CASE WHEN is_approved = true THEN 1 ELSE 0 END) as approved_labs
FROM profiles 
WHERE role = 'lab';

-- 4. Show all labs
SELECT 
  business_name,
  region,
  city,
  is_approved,
  created_at
FROM profiles 
WHERE role = 'lab'
ORDER BY created_at; 