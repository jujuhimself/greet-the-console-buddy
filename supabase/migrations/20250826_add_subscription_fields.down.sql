-- Revert subscription fields from profiles table
ALTER TABLE profiles
DROP COLUMN IF EXISTS subscription_status,
DROP COLUMN IF EXISTS subscription_plan,
DROP COLUMN IF EXISTS subscription_start_date,
DROP COLUMN IF EXISTS subscription_trial_end_date,
DROP COLUMN IF EXISTS subscription_period_end,
DROP COLUMN IF EXISTS subscription_cancel_at_period_end,
DROP COLUMN IF EXISTS subscription_last_payment_date,
DROP COLUMN IF EXISTS subscription_next_billing_date,
DROP COLUMN IF EXISTS max_staff_accounts,
DROP COLUMN IF EXISTS max_branches;

-- Drop the enum types
DROP TYPE IF EXISTS subscription_status_type;
DROP TYPE IF EXISTS subscription_plan_type;
