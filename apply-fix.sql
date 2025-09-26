-- Disable RLS on all tables to speed up development
-- Run this in your Supabase SQL editor

-- =====================================================
-- DISABLE RLS ON ALL TABLES FOR DEVELOPMENT
-- =====================================================

-- Disable RLS on profiles table
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Disable RLS on appointments table
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;

-- Disable RLS on lab_orders table
ALTER TABLE lab_orders DISABLE ROW LEVEL SECURITY;

-- Disable RLS on lab_order_items table
ALTER TABLE lab_order_items DISABLE ROW LEVEL SECURITY;

-- Disable RLS on lab_tests table
ALTER TABLE lab_tests DISABLE ROW LEVEL SECURITY;

-- Disable RLS on products table
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check current approved pharmacies and labs
SELECT 'Current approved pharmacies:' as info, COUNT(*) as count 
FROM profiles 
WHERE role = 'retail' AND is_approved = true;

SELECT 'Current approved labs:' as info, COUNT(*) as count 
FROM profiles 
WHERE role = 'lab' AND is_approved = true;

-- Show sample of approved pharmacies
SELECT 'Approved pharmacies:' as info, business_name, region, city 
FROM profiles 
WHERE role = 'retail' AND is_approved = true 
LIMIT 5;

-- Show sample of approved labs
SELECT 'Approved labs:' as info, business_name, region, city 
FROM profiles 
WHERE role = 'lab' AND is_approved = true 
LIMIT 5;

-- Show RLS status
SELECT 'RLS disabled successfully!' as message; 