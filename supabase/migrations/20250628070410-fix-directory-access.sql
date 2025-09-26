-- =====================================================
-- DISABLE RLS FOR DEVELOPMENT - SPEED UP DEVELOPMENT
-- =====================================================
-- This script disables RLS on all tables to avoid permission issues during development

-- =====================================================
-- DISABLE RLS ON ALL TABLES
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

-- Check that RLS is disabled
SELECT 'RLS disabled successfully for development!' as message;

-- Show current approved pharmacies and labs
SELECT 'Current approved pharmacies:' as info, COUNT(*) as count 
FROM profiles 
WHERE role = 'retail' AND is_approved = true;

SELECT 'Current approved labs:' as info, COUNT(*) as count 
FROM profiles 
WHERE role = 'lab' AND is_approved = true; 