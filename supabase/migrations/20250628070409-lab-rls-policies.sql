-- =====================================================
-- FIXED LAB/INDIVIDUAL/ADMIN RLS POLICIES - PERMISSIVE
-- =====================================================
-- This script creates permissive RLS policies that allow login and basic functionality

-- =====================================================
-- 1. PROFILES TABLE POLICIES - PERMISSIVE
-- =====================================================

-- Drop all existing policies on profiles first
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Lab staff can search individual profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can insert their own profile (when they register)
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy 2: Users can update their own profile
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy 3: Users can view their own profile (PERMISSIVE)
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy 4: Lab staff can search for existing patients (PERMISSIVE)
CREATE POLICY "Lab staff can search individual profiles" ON profiles
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'lab' OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Policy 5: Admin can view all profiles
CREATE POLICY "Admin can view all profiles" ON profiles
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- =====================================================
-- 2. APPOINTMENTS TABLE POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own appointments" ON appointments;
DROP POLICY IF EXISTS "Lab staff can manage appointments" ON appointments;
DROP POLICY IF EXISTS "Admin can view all appointments" ON appointments;

-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own appointments
CREATE POLICY "Users can view their own appointments" ON appointments
  FOR SELECT USING (user_id = auth.uid());

-- Policy 2: Lab staff can create and manage appointments
CREATE POLICY "Lab staff can manage appointments" ON appointments
  FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'lab' OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Policy 3: Admin can view all appointments
CREATE POLICY "Admin can view all appointments" ON appointments
  FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- =====================================================
-- 3. LAB_ORDERS TABLE POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own lab orders" ON lab_orders;
DROP POLICY IF EXISTS "Lab staff can manage lab orders" ON lab_orders;
DROP POLICY IF EXISTS "Admin can view all lab orders" ON lab_orders;

-- Enable RLS
ALTER TABLE lab_orders ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own lab orders
CREATE POLICY "Users can view their own lab orders" ON lab_orders
  FOR SELECT USING (user_id = auth.uid());

-- Policy 2: Lab staff can create and manage lab orders
CREATE POLICY "Lab staff can manage lab orders" ON lab_orders
  FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'lab' OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Policy 3: Admin can view all lab orders
CREATE POLICY "Admin can view all lab orders" ON lab_orders
  FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- =====================================================
-- 4. LAB_ORDER_ITEMS TABLE POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own lab order items" ON lab_order_items;
DROP POLICY IF EXISTS "Lab staff can manage lab order items" ON lab_order_items;
DROP POLICY IF EXISTS "Admin can view all lab order items" ON lab_order_items;

-- Enable RLS
ALTER TABLE lab_order_items ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own lab order items
CREATE POLICY "Users can view their own lab order items" ON lab_order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lab_orders 
      WHERE lab_orders.id = lab_order_items.lab_order_id 
      AND lab_orders.user_id = auth.uid()
    )
  );

-- Policy 2: Lab staff can create and manage lab order items
CREATE POLICY "Lab staff can manage lab order items" ON lab_order_items
  FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'lab' OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Policy 3: Admin can view all lab order items
CREATE POLICY "Admin can view all lab order items" ON lab_order_items
  FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- =====================================================
-- 5. STORAGE POLICIES FOR LAB RESULTS
-- =====================================================

-- Create lab-results bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('lab-results', 'lab-results', true)
ON CONFLICT (id) DO NOTHING;

-- Policy 1: Users can upload lab result files
CREATE POLICY "Users can upload lab results" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'lab-results' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy 2: Users can view their own lab result files
CREATE POLICY "Users can view their lab results" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'lab-results' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy 3: Lab staff can view all lab result files
CREATE POLICY "Lab staff can view all lab results" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'lab-results' AND
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('lab', 'admin')
  );

-- Policy 4: Lab staff can upload lab result files
CREATE POLICY "Lab staff can upload lab results" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'lab-results' AND
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('lab', 'admin')
  );

-- =====================================================
-- 6. FALLBACK POLICY FOR LOGIN (TEMPORARY)
-- =====================================================
-- This ensures users can always access their profile for login

-- Allow authenticated users to select their own profile (fallback)
CREATE POLICY "Fallback profile access" ON profiles
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    (auth.uid() = id OR 
     (SELECT role FROM profiles WHERE id = auth.uid()) IN ('lab', 'admin'))
  ); 