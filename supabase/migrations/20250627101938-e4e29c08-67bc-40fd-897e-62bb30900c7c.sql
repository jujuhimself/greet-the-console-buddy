
-- Create staff_members table for retail pharmacy staff management
CREATE TABLE public.staff_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('pos-only', 'inventory-only', 'manager', 'admin')),
  pharmacy_id UUID NOT NULL,
  created_by UUID NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;

-- Create policies for staff_members
CREATE POLICY "Users can view staff in their pharmacy" 
  ON public.staff_members 
  FOR SELECT 
  USING (pharmacy_id = auth.uid());

CREATE POLICY "Users can create staff in their pharmacy" 
  ON public.staff_members 
  FOR INSERT 
  WITH CHECK (pharmacy_id = auth.uid() AND created_by = auth.uid());

CREATE POLICY "Users can update staff in their pharmacy" 
  ON public.staff_members 
  FOR UPDATE 
  USING (pharmacy_id = auth.uid());

CREATE POLICY "Users can delete staff in their pharmacy" 
  ON public.staff_members 
  FOR DELETE 
  USING (pharmacy_id = auth.uid());

-- Add trigger to update updated_at column
CREATE TRIGGER update_staff_members_updated_at
  BEFORE UPDATE ON public.staff_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
