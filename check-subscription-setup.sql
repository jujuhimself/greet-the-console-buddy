-- Check enum types
SELECT t.typname, e.enumlabel
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname IN ('subscription_status_type', 'subscription_plan_type')
ORDER BY t.typname, e.enumsortorder;

-- Check profiles table structure for subscription fields
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name LIKE 'subscription%' OR column_name LIKE 'max_%';
