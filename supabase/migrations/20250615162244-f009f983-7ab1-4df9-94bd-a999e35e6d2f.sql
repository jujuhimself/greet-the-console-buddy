
-- Create product categories table
CREATE TABLE IF NOT EXISTS public.product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  parent_category_id uuid REFERENCES public.product_categories(id),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Insert sample product categories
INSERT INTO public.product_categories (name, description) VALUES
('Medicines', 'Prescription and over-the-counter medications'),
('Medical Supplies', 'Medical equipment and supplies'),
('Personal Care', 'Personal hygiene and care products'),
('Vitamins & Supplements', 'Nutritional supplements and vitamins'),
('First Aid', 'First aid and emergency medical supplies'),
('Baby Care', 'Baby and infant care products'),
('Diabetes Care', 'Products for diabetes management'),
('Pain Relief', 'Pain management medications'),
('Cold & Flu', 'Cold and flu medications'),
('Antibiotics', 'Antibiotic medications')
ON CONFLICT (name) DO NOTHING;

-- Update products table to use proper categories for existing products
UPDATE public.products SET category = 'Medicines' WHERE category IS NULL OR category = '';

-- Enable RLS on product_categories
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- Create policy for product categories (everyone can read)
CREATE POLICY "Everyone can view product categories" 
  ON public.product_categories 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Create policy for admins to manage categories
CREATE POLICY "Admins can manage product categories" 
  ON public.product_categories 
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Update products table RLS policies
DROP POLICY IF EXISTS "Users can view products" ON public.products;
DROP POLICY IF EXISTS "Users can manage their products" ON public.products;

-- Create comprehensive product policies
CREATE POLICY "Users can view all active products" 
  ON public.products 
  FOR SELECT 
  TO authenticated
  USING (status != 'deleted');

CREATE POLICY "Users can manage their own products" 
  ON public.products 
  FOR ALL 
  TO authenticated
  USING (user_id = auth.uid());

-- Improve the existing order_items table structure if it exists
-- Add missing columns to existing order_items table if they don't exist
DO $$ 
BEGIN
  -- Check if product_name column exists, if not add it
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'product_name') THEN
    ALTER TABLE public.order_items ADD COLUMN product_name text;
  END IF;
  
  -- Update existing order_items to have product names from products table where possible
  UPDATE public.order_items 
  SET product_name = p.name 
  FROM public.products p 
  WHERE public.order_items.product_id = p.id 
  AND public.order_items.product_name IS NULL;
  
  -- Set product_name to NOT NULL after updating existing records
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'product_name' AND is_nullable = 'YES') THEN
    -- Set a default value for any remaining NULL product_name entries
    UPDATE public.order_items SET product_name = 'Unknown Product' WHERE product_name IS NULL;
    ALTER TABLE public.order_items ALTER COLUMN product_name SET NOT NULL;
  END IF;
END $$;
