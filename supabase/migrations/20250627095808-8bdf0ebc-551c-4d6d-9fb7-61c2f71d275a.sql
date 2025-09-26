
-- Create inventory_movements table for tracking stock changes
CREATE TABLE public.inventory_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  product_id UUID NOT NULL REFERENCES public.products(id),
  movement_type TEXT NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment')),
  quantity INTEGER NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Add Row Level Security
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

-- Create policies for inventory movements
CREATE POLICY "Users can view their own inventory movements" 
  ON public.inventory_movements 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own inventory movements" 
  ON public.inventory_movements 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory movements" 
  ON public.inventory_movements 
  FOR UPDATE 
  USING (auth.uid() = user_id);
