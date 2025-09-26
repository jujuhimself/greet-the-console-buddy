-- Fix labs: Ensure all labs are approved and visible
UPDATE profiles 
SET is_approved = true 
WHERE role = 'lab' AND is_approved = false;

-- Add more labs if needed
INSERT INTO profiles (id, email, business_name, role, region, city, is_approved, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'lab6@example.com', 'Tanga Medical Laboratory', 'lab', 'Tanga', 'Tanga', true, now(), now()),
  (gen_random_uuid(), 'lab7@example.com', 'Morogoro Diagnostic Center', 'lab', 'Morogoro', 'Morogoro', true, now(), now()),
  (gen_random_uuid(), 'lab8@example.com', 'Iringa Clinical Lab', 'lab', 'Iringa', 'Iringa', true, now(), now())
ON CONFLICT (email) DO NOTHING;

-- Verify the fix
SELECT 
  'Labs after fix:' as info,
  COUNT(*) as total_labs,
  SUM(CASE WHEN is_approved = true THEN 1 ELSE 0 END) as approved_labs
FROM profiles 
WHERE role = 'lab'; 