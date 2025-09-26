-- Check all labs in the database
SELECT 
  id,
  email,
  business_name,
  role,
  region,
  city,
  is_approved,
  created_at
FROM profiles 
WHERE role = 'lab'
ORDER BY created_at;

-- Check if there are any labs that aren't approved
SELECT 
  COUNT(*) as total_labs,
  SUM(CASE WHEN is_approved = true THEN 1 ELSE 0 END) as approved_labs,
  SUM(CASE WHEN is_approved = false THEN 1 ELSE 0 END) as unapproved_labs
FROM profiles 
WHERE role = 'lab';

-- Check lab tests
SELECT 
  id,
  test_name,
  test_code,
  category,
  price,
  is_active
FROM lab_tests 
WHERE is_active = true
ORDER BY test_name;

-- Check products
SELECT 
  id,
  name,
  category,
  price,
  stock_quantity,
  is_active
FROM products 
WHERE is_active = true
ORDER BY name; 