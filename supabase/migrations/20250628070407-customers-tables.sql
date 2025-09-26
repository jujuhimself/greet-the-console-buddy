-- Create customers table
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  business_type VARCHAR(100),
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  last_order_date DATE,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customer_communications table
CREATE TABLE IF NOT EXISTS public.customer_communications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('call', 'email', 'sms', 'meeting')),
  subject VARCHAR(255) NOT NULL,
  notes TEXT,
  communication_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_status ON public.customers(status);
CREATE INDEX IF NOT EXISTS idx_customer_communications_user_id ON public.customer_communications(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_communications_customer_id ON public.customer_communications(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_communications_date ON public.customer_communications(communication_date);

-- Enable Row Level Security
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_communications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for customers table
CREATE POLICY "Users can view their own customers" ON public.customers
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own customers" ON public.customers
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customers" ON public.customers
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own customers" ON public.customers
FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for customer_communications table
CREATE POLICY "Users can view their own customer communications" ON public.customer_communications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own customer communications" ON public.customer_communications
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customer communications" ON public.customer_communications
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own customer communications" ON public.customer_communications
FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customers_updated_at 
    BEFORE UPDATE ON public.customers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 