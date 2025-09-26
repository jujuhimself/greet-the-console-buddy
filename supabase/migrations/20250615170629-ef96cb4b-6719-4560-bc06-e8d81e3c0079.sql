
-- First, let's check and create missing tables and policies

-- Create suppliers table (if not exists)
CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  payment_terms TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create purchase orders table (if not exists)
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  supplier_id UUID REFERENCES public.suppliers(id),
  po_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  total_amount NUMERIC NOT NULL DEFAULT 0,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create purchase order items table (if not exists)
CREATE TABLE IF NOT EXISTS public.purchase_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_cost NUMERIC NOT NULL,
  total_cost NUMERIC NOT NULL,
  received_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory movements table (if not exists)
CREATE TABLE IF NOT EXISTS public.inventory_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id),
  movement_type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  reason TEXT,
  reference_number TEXT,
  cost_per_unit NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Create enhanced sales analytics table (if not exists)
CREATE TABLE IF NOT EXISTS public.sales_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  total_sales NUMERIC NOT NULL DEFAULT 0,
  total_orders INTEGER NOT NULL DEFAULT 0,
  average_order_value NUMERIC NOT NULL DEFAULT 0,
  total_items_sold INTEGER NOT NULL DEFAULT 0,
  new_customers INTEGER NOT NULL DEFAULT 0,
  top_selling_category TEXT,
  prescription_orders INTEGER NOT NULL DEFAULT 0,
  lab_orders INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS on new tables (only if not already enabled)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'suppliers' AND relrowsecurity = true) THEN
    ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'purchase_orders' AND relrowsecurity = true) THEN
    ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'purchase_order_items' AND relrowsecurity = true) THEN
    ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'inventory_movements' AND relrowsecurity = true) THEN
    ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'sales_analytics' AND relrowsecurity = true) THEN
    ALTER TABLE public.sales_analytics ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create RLS policies (only if they don't exist)
DO $$ 
BEGIN
  -- Suppliers policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'suppliers' AND policyname = 'Users can view their own suppliers v2') THEN
    CREATE POLICY "Users can view their own suppliers v2" 
      ON public.suppliers 
      FOR SELECT 
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'suppliers' AND policyname = 'Users can create their own suppliers v2') THEN
    CREATE POLICY "Users can create their own suppliers v2" 
      ON public.suppliers 
      FOR INSERT 
      WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'suppliers' AND policyname = 'Users can update their own suppliers v2') THEN
    CREATE POLICY "Users can update their own suppliers v2" 
      ON public.suppliers 
      FOR UPDATE 
      USING (auth.uid() = user_id);
  END IF;

  -- Purchase orders policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'purchase_orders' AND policyname = 'Users can view their own purchase orders v2') THEN
    CREATE POLICY "Users can view their own purchase orders v2" 
      ON public.purchase_orders 
      FOR SELECT 
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'purchase_orders' AND policyname = 'Users can create their own purchase orders v2') THEN
    CREATE POLICY "Users can create their own purchase orders v2" 
      ON public.purchase_orders 
      FOR INSERT 
      WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'purchase_orders' AND policyname = 'Users can update their own purchase orders v2') THEN
    CREATE POLICY "Users can update their own purchase orders v2" 
      ON public.purchase_orders 
      FOR UPDATE 
      USING (auth.uid() = user_id);
  END IF;

  -- Purchase order items policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'purchase_order_items' AND policyname = 'Users can view purchase order items v2') THEN
    CREATE POLICY "Users can view purchase order items v2" 
      ON public.purchase_order_items 
      FOR SELECT 
      USING (EXISTS (
        SELECT 1 FROM public.purchase_orders 
        WHERE purchase_orders.id = purchase_order_items.purchase_order_id 
        AND purchase_orders.user_id = auth.uid()
      ));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'purchase_order_items' AND policyname = 'Users can create purchase order items v2') THEN
    CREATE POLICY "Users can create purchase order items v2" 
      ON public.purchase_order_items 
      FOR INSERT 
      WITH CHECK (EXISTS (
        SELECT 1 FROM public.purchase_orders 
        WHERE purchase_orders.id = purchase_order_items.purchase_order_id 
        AND purchase_orders.user_id = auth.uid()
      ));
  END IF;

  -- Inventory movements policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'inventory_movements' AND policyname = 'Users can view their own inventory movements v2') THEN
    CREATE POLICY "Users can view their own inventory movements v2" 
      ON public.inventory_movements 
      FOR SELECT 
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'inventory_movements' AND policyname = 'Users can create their own inventory movements v2') THEN
    CREATE POLICY "Users can create their own inventory movements v2" 
      ON public.inventory_movements 
      FOR INSERT 
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Sales analytics policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sales_analytics' AND policyname = 'Users can view their own sales analytics v2') THEN
    CREATE POLICY "Users can view their own sales analytics v2" 
      ON public.sales_analytics 
      FOR SELECT 
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sales_analytics' AND policyname = 'Users can manage their own sales analytics v2') THEN
    CREATE POLICY "Users can manage their own sales analytics v2" 
      ON public.sales_analytics 
      FOR ALL 
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create triggers for automatic stock status updates (replace if exists)
CREATE OR REPLACE FUNCTION public.update_product_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update status based on stock levels
  IF NEW.stock <= 0 THEN
    NEW.status := 'out-of-stock';
  ELSIF NEW.stock <= NEW.min_stock THEN
    NEW.status := 'low-stock';
  ELSE
    NEW.status := 'in-stock';
  END IF;
  
  -- Check if product is expired
  IF NEW.expiry_date IS NOT NULL AND NEW.expiry_date <= CURRENT_DATE THEN
    NEW.status := 'expired';
  END IF;
  
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_product_status_trigger ON public.products;
CREATE TRIGGER update_product_status_trigger
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_product_status();

-- Create trigger for tracking inventory movements
CREATE OR REPLACE FUNCTION public.track_inventory_movement()
RETURNS TRIGGER AS $$
BEGIN
  -- Only track stock changes
  IF OLD.stock != NEW.stock THEN
    INSERT INTO public.inventory_movements (
      user_id,
      product_id,
      movement_type,
      quantity,
      reason,
      created_by
    ) VALUES (
      NEW.user_id,
      NEW.id,
      CASE 
        WHEN NEW.stock > OLD.stock THEN 'in'
        ELSE 'out'
      END,
      ABS(NEW.stock - OLD.stock),
      'Stock update',
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS track_inventory_movement_trigger ON public.products;
CREATE TRIGGER track_inventory_movement_trigger
  AFTER UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.track_inventory_movement();

-- Create function for sales analytics updates
CREATE OR REPLACE FUNCTION public.update_sales_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update daily sales analytics when orders are created or updated
  INSERT INTO public.sales_analytics (user_id, date, total_sales, total_orders, average_order_value)
  VALUES (
    NEW.user_id,
    NEW.created_at::date,
    NEW.total_amount,
    1,
    NEW.total_amount
  )
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    total_sales = sales_analytics.total_sales + NEW.total_amount,
    total_orders = sales_analytics.total_orders + 1,
    average_order_value = (sales_analytics.total_sales + NEW.total_amount) / (sales_analytics.total_orders + 1),
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_sales_analytics_trigger ON public.orders;
CREATE TRIGGER update_sales_analytics_trigger
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_sales_analytics();
