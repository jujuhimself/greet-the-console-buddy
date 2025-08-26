-- Create enums for subscription status and plan if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status_type') THEN
        CREATE TYPE subscription_status_type AS ENUM ('trial', 'active', 'expired', 'cancelled');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_plan_type') THEN
        CREATE TYPE subscription_plan_type AS ENUM ('basic', 'medium', 'premium');
    END IF;
END $$;

-- Add subscription fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS subscription_status subscription_status_type DEFAULT 'trial',
ADD COLUMN IF NOT EXISTS subscription_plan subscription_plan_type DEFAULT 'basic',
ADD COLUMN IF NOT EXISTS subscription_start_date timestamptz,
ADD COLUMN IF NOT EXISTS subscription_trial_end_date timestamptz,
ADD COLUMN IF NOT EXISTS subscription_period_end timestamptz,
ADD COLUMN IF NOT EXISTS subscription_cancel_at_period_end boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS subscription_last_payment_date timestamptz,
ADD COLUMN IF NOT EXISTS subscription_next_billing_date timestamptz,
ADD COLUMN IF NOT EXISTS max_staff_accounts integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS max_branches integer DEFAULT 0;
