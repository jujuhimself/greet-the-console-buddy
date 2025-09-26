
-- Create credit_requests table
CREATE TABLE public.credit_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  requested_amount NUMERIC NOT NULL,
  business_type TEXT NOT NULL,
  monthly_revenue NUMERIC NOT NULL,
  years_in_business INTEGER NOT NULL,
  credit_purpose TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'under_review')),
  documents TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_by UUID REFERENCES auth.users(id),
  review_notes TEXT
);

-- Create credit_accounts table
CREATE TABLE public.credit_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credit_limit NUMERIC NOT NULL DEFAULT 0,
  current_balance NUMERIC NOT NULL DEFAULT 0,
  available_credit NUMERIC NOT NULL DEFAULT 0,
  interest_rate NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.credit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_accounts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for credit_requests
CREATE POLICY "Users can view their own credit requests" 
  ON public.credit_requests 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own credit requests" 
  ON public.credit_requests 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credit requests" 
  ON public.credit_requests 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create RLS policies for credit_accounts
CREATE POLICY "Users can view their own credit accounts" 
  ON public.credit_accounts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own credit accounts" 
  ON public.credit_accounts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credit accounts" 
  ON public.credit_accounts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create trigger to automatically update available_credit when credit_limit or current_balance changes
CREATE OR REPLACE FUNCTION update_available_credit()
RETURNS TRIGGER AS $$
BEGIN
  NEW.available_credit := NEW.credit_limit - NEW.current_balance;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_credit_account_available_credit
  BEFORE UPDATE ON public.credit_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_available_credit();

-- Create trigger to update updated_at timestamp on credit_requests
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_credit_requests_updated_at
  BEFORE UPDATE ON public.credit_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
