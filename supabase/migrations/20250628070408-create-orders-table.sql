-- Create orders table for tracking all platform orders and revenue
-- First, create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  order_number TEXT UNIQUE NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partial', 'failed', 'refunded')),
  payment_method TEXT,
  shipping_address JSONB,
  billing_address JSONB,
  items JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add order_type column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'order_type') THEN
    ALTER TABLE public.orders ADD COLUMN order_type TEXT NOT NULL DEFAULT 'retail' CHECK (order_type IN ('retail', 'wholesale', 'prescription', 'lab'));
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (only if they don't exist)
DO $$ 
BEGIN
  -- Policy for users to view their own orders
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Users can view their own orders') THEN
    CREATE POLICY "Users can view their own orders" ON public.orders
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  -- Policy for users to insert their own orders
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Users can insert their own orders') THEN
    CREATE POLICY "Users can insert their own orders" ON public.orders
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Policy for users to update their own orders
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Users can update their own orders') THEN
    CREATE POLICY "Users can update their own orders" ON public.orders
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;

  -- Policy for admins to view all orders
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Admins can view all orders') THEN
    CREATE POLICY "Admins can view all orders" ON public.orders
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM auth.users 
          WHERE auth.users.id = auth.uid() 
          AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
      );
  END IF;
END $$;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at (only if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_orders_updated_at') THEN
    CREATE TRIGGER update_orders_updated_at 
      BEFORE UPDATE ON public.orders 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Create function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  order_num TEXT;
BEGIN
  -- Generate a unique order number with timestamp and random suffix
  order_num := 'ORD-' || to_char(now(), 'YYYYMMDD') || '-' || 
               lpad(floor(random() * 10000)::text, 4, '0');
  
  -- Ensure uniqueness by checking if it exists
  WHILE EXISTS (SELECT 1 FROM public.orders WHERE order_number = order_num) LOOP
    order_num := 'ORD-' || to_char(now(), 'YYYYMMDD') || '-' || 
                 lpad(floor(random() * 10000)::text, 4, '0');
  END LOOP;
  
  RETURN order_num;
END;
$$ LANGUAGE plpgsql; 