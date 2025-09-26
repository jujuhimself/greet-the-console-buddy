
-- Add visibility flags to products table if they don't exist
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS is_retail_product boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_wholesale_product boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_public_product boolean DEFAULT false;

-- Update existing products to have proper visibility flags
-- For wholesale users' products, make them visible to retailers
UPDATE public.products 
SET is_wholesale_product = true 
WHERE user_id IN (
  SELECT id FROM public.profiles WHERE role = 'wholesale'
);

-- For retail users' products, make them visible to individuals
UPDATE public.products 
SET is_retail_product = true, is_public_product = true 
WHERE user_id IN (
  SELECT id FROM public.profiles WHERE role = 'retail'
);

-- Add RLS policies for product visibility
DROP POLICY IF EXISTS "Users can view products based on role" ON public.products;

CREATE POLICY "Users can view products based on role" ON public.products
FOR SELECT USING (
  CASE 
    -- Wholesale users can see all products
    WHEN EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'wholesale') THEN true
    -- Retail users can see wholesale products and their own products
    WHEN EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'retail') THEN 
      (is_wholesale_product = true OR user_id = auth.uid())
    -- Individual users can see retail/public products
    WHEN EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'individual') THEN 
      (is_retail_product = true OR is_public_product = true)
    -- Default: no access
    ELSE false
  END
);

-- Ensure users can manage their own products
DROP POLICY IF EXISTS "Users can manage their own products" ON public.products;

CREATE POLICY "Users can manage their own products" ON public.products
FOR ALL USING (auth.uid() = user_id);

-- Enable RLS on products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_visibility ON public.products(is_retail_product, is_wholesale_product, is_public_product);
CREATE INDEX IF NOT EXISTS idx_products_user_role ON public.products(user_id);
