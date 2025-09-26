-- Check current state of the database
-- This will help us understand what's working and what needs fixing

-- 1. Check all labs
SELECT 
  'LABS:' as info,
  COUNT(*) as total_labs,
  SUM(CASE WHEN is_approved = true THEN 1 ELSE 0 END) as approved_labs,
  SUM(CASE WHEN is_approved = false THEN 1 ELSE 0 END) as unapproved_labs
FROM profiles 
WHERE role = 'lab';

-- 2. Check all pharmacies
SELECT 
  'PHARMACIES:' as info,
  COUNT(*) as total_pharmacies,
  SUM(CASE WHEN is_approved = true THEN 1 ELSE 0 END) as approved_pharmacies,
  SUM(CASE WHEN is_approved = false THEN 1 ELSE 0 END) as unapproved_pharmacies
FROM profiles 
WHERE role = 'retail';

-- 3. Show existing labs with details
SELECT 
  'EXISTING LABS:' as info,
  id,
  name,
  business_name,
  email,
  region,
  city,
  is_approved,
  created_at
FROM profiles 
WHERE role = 'lab'
ORDER BY created_at;

-- 4. Show existing pharmacies with details
SELECT 
  'EXISTING PHARMACIES:' as info,
  id,
  name,
  business_name,
  email,
  region,
  city,
  is_approved,
  created_at
FROM profiles 
WHERE role = 'retail'
ORDER BY created_at;

-- 5. Check if there are any appointments
SELECT 
  'APPOINTMENTS:' as info,
  COUNT(*) as total_appointments
FROM appointments;

-- 6. Check if there are any lab orders
SELECT 
  'LAB ORDERS:' as info,
  COUNT(*) as total_lab_orders
FROM lab_orders; 