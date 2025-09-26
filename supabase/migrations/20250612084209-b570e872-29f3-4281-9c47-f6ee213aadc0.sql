
-- Create inventory products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  sku TEXT NOT NULL,
  description TEXT,
  stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 0,
  max_stock INTEGER,
  buy_price DECIMAL(10,2) NOT NULL,
  sell_price DECIMAL(10,2) NOT NULL,
  supplier TEXT,
  expiry_date DATE,
  batch_number TEXT,
  last_ordered DATE,
  status TEXT NOT NULL DEFAULT 'in-stock' CHECK (status IN ('in-stock', 'low-stock', 'out-of-stock', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory movements table for tracking stock changes
CREATE TABLE public.inventory_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment')),
  quantity INTEGER NOT NULL,
  reason TEXT,
  reference_number TEXT,
  cost_per_unit DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users
);

-- Create suppliers table
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  payment_terms TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create purchase orders table
CREATE TABLE public.purchase_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  supplier_id UUID REFERENCES public.suppliers(id),
  po_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'ordered', 'received', 'cancelled')),
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create purchase order items table
CREATE TABLE public.purchase_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_cost DECIMAL(10,2) NOT NULL,
  total_cost DECIMAL(10,2) NOT NULL,
  received_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX idx_products_user_id ON public.products(user_id);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_inventory_movements_product_id ON public.inventory_movements(product_id);
CREATE INDEX idx_inventory_movements_user_id ON public.inventory_movements(user_id);
CREATE INDEX idx_suppliers_user_id ON public.suppliers(user_id);
CREATE INDEX idx_purchase_orders_user_id ON public.purchase_orders(user_id);
CREATE INDEX idx_purchase_orders_supplier_id ON public.purchase_orders(supplier_id);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for products
CREATE POLICY "Users can view their own products" ON public.products
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own products" ON public.products
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products" ON public.products
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products" ON public.products
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for inventory movements
CREATE POLICY "Users can view their own inventory movements" ON public.inventory_movements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own inventory movements" ON public.inventory_movements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for suppliers
CREATE POLICY "Users can view their own suppliers" ON public.suppliers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own suppliers" ON public.suppliers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own suppliers" ON public.suppliers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own suppliers" ON public.suppliers
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for purchase orders
CREATE POLICY "Users can view their own purchase orders" ON public.purchase_orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own purchase orders" ON public.purchase_orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own purchase orders" ON public.purchase_orders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own purchase orders" ON public.purchase_orders
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for purchase order items
CREATE POLICY "Users can view purchase order items for their orders" ON public.purchase_order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.purchase_orders 
      WHERE id = purchase_order_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create purchase order items for their orders" ON public.purchase_order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.purchase_orders 
      WHERE id = purchase_order_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update purchase order items for their orders" ON public.purchase_order_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.purchase_orders 
      WHERE id = purchase_order_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete purchase order items for their orders" ON public.purchase_order_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.purchase_orders 
      WHERE id = purchase_order_id AND user_id = auth.uid()
    )
  );

-- Create function to update product status based on stock levels
CREATE OR REPLACE FUNCTION update_product_status()
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

-- Create trigger to automatically update product status
CREATE TRIGGER trigger_update_product_status
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION update_product_status();

-- Create function to track inventory movements
CREATE OR REPLACE FUNCTION track_inventory_movement()
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

-- Create trigger to automatically track inventory movements
CREATE TRIGGER trigger_track_inventory_movement
  AFTER UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION track_inventory_movement();
