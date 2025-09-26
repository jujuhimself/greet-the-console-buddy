
-- Phase 3: Order Management & Payment Integration
-- Create order_items table for detailed order line items
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price NUMERIC(10,2) NOT NULL CHECK (total_price >= 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_status_history table for tracking order status changes
CREATE TABLE public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Phase 4: Prescription & Lab Management
-- Create prescriptions table
CREATE TABLE public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  patient_name TEXT NOT NULL,
  patient_phone TEXT,
  doctor_name TEXT NOT NULL,
  doctor_license TEXT,
  prescription_date DATE NOT NULL DEFAULT CURRENT_DATE,
  diagnosis TEXT,
  instructions TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'dispensed', 'completed', 'cancelled')),
  pharmacy_id UUID,
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  dispensed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  dispensed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create prescription_items table for medications in prescriptions
CREATE TABLE public.prescription_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID REFERENCES public.prescriptions(id) ON DELETE CASCADE NOT NULL,
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL DEFAULT 'tablets',
  special_instructions TEXT,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  dispensed_quantity INTEGER DEFAULT 0 CHECK (dispensed_quantity >= 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lab_tests table
CREATE TABLE public.lab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  test_name TEXT NOT NULL,
  test_code TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  sample_type TEXT NOT NULL,
  preparation_instructions TEXT,
  normal_range TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  turnaround_time_hours INTEGER NOT NULL DEFAULT 24,
  is_active BOOLEAN NOT NULL DEFAULT true,
  lab_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lab_orders table
CREATE TABLE public.lab_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  patient_name TEXT NOT NULL,
  patient_phone TEXT,
  patient_age INTEGER,
  patient_gender TEXT CHECK (patient_gender IN ('male', 'female', 'other')),
  doctor_name TEXT NOT NULL,
  doctor_phone TEXT,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  sample_collection_date DATE,
  sample_collection_time TIME,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sample_collected', 'processing', 'completed', 'cancelled')),
  lab_id UUID,
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'partial')),
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lab_order_items table
CREATE TABLE public.lab_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_order_id UUID REFERENCES public.lab_orders(id) ON DELETE CASCADE NOT NULL,
  lab_test_id UUID REFERENCES public.lab_tests(id) ON DELETE CASCADE NOT NULL,
  test_name TEXT NOT NULL,
  test_price NUMERIC(10,2) NOT NULL CHECK (test_price >= 0),
  result TEXT,
  result_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Phase 5: Business Intelligence & Analytics
-- Create sales_analytics table for daily sales aggregation
CREATE TABLE public.sales_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  total_sales NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_items_sold INTEGER NOT NULL DEFAULT 0,
  average_order_value NUMERIC(10,2) NOT NULL DEFAULT 0,
  top_selling_category TEXT,
  new_customers INTEGER NOT NULL DEFAULT 0,
  prescription_orders INTEGER NOT NULL DEFAULT 0,
  lab_orders INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create product_analytics table for product performance tracking
CREATE TABLE public.product_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  quantity_sold INTEGER NOT NULL DEFAULT 0,
  revenue NUMERIC(10,2) NOT NULL DEFAULT 0,
  profit_margin NUMERIC(5,2) NOT NULL DEFAULT 0,
  stock_turnover_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id, date)
);

-- Create customer_analytics table for customer behavior tracking
CREATE TABLE public.customer_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  first_order_date DATE,
  last_order_date DATE,
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_spent NUMERIC(12,2) NOT NULL DEFAULT 0,
  average_order_value NUMERIC(10,2) NOT NULL DEFAULT 0,
  favorite_category TEXT,
  customer_lifetime_value NUMERIC(12,2) NOT NULL DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, customer_id)
);

-- Enable Row Level Security on all new tables
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for order_items
CREATE POLICY "Users can view their order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

CREATE POLICY "Users can insert their order items" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

-- Create RLS policies for order_status_history
CREATE POLICY "Users can view their order status history" ON public.order_status_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_status_history.order_id AND orders.user_id = auth.uid())
  );

CREATE POLICY "Users can insert order status history" ON public.order_status_history
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_status_history.order_id AND orders.user_id = auth.uid())
  );

-- Create RLS policies for prescriptions
CREATE POLICY "Users can view their prescriptions" ON public.prescriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their prescriptions" ON public.prescriptions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their prescriptions" ON public.prescriptions
  FOR UPDATE USING (user_id = auth.uid());

-- Create RLS policies for prescription_items
CREATE POLICY "Users can view their prescription items" ON public.prescription_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.prescriptions WHERE prescriptions.id = prescription_items.prescription_id AND prescriptions.user_id = auth.uid())
  );

CREATE POLICY "Users can manage their prescription items" ON public.prescription_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.prescriptions WHERE prescriptions.id = prescription_items.prescription_id AND prescriptions.user_id = auth.uid())
  );

-- Create RLS policies for lab_tests
CREATE POLICY "Users can view active lab tests" ON public.lab_tests
  FOR SELECT USING (is_active = true);

CREATE POLICY "Lab owners can manage their tests" ON public.lab_tests
  FOR ALL USING (user_id = auth.uid());

-- Create RLS policies for lab_orders
CREATE POLICY "Users can view their lab orders" ON public.lab_orders
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their lab orders" ON public.lab_orders
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their lab orders" ON public.lab_orders
  FOR UPDATE USING (user_id = auth.uid());

-- Create RLS policies for lab_order_items
CREATE POLICY "Users can view their lab order items" ON public.lab_order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.lab_orders WHERE lab_orders.id = lab_order_items.lab_order_id AND lab_orders.user_id = auth.uid())
  );

CREATE POLICY "Users can manage their lab order items" ON public.lab_order_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.lab_orders WHERE lab_orders.id = lab_order_items.lab_order_id AND lab_orders.user_id = auth.uid())
  );

-- Create RLS policies for analytics tables
CREATE POLICY "Users can view their sales analytics" ON public.sales_analytics
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their sales analytics" ON public.sales_analytics
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view their product analytics" ON public.product_analytics
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their product analytics" ON public.product_analytics
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view their customer analytics" ON public.customer_analytics
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their customer analytics" ON public.customer_analytics
  FOR ALL USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_status_history_order_id ON public.order_status_history(order_id);
CREATE INDEX idx_prescriptions_user_id ON public.prescriptions(user_id);
CREATE INDEX idx_prescriptions_status ON public.prescriptions(status);
CREATE INDEX idx_prescription_items_prescription_id ON public.prescription_items(prescription_id);
CREATE INDEX idx_lab_tests_category ON public.lab_tests(category);
CREATE INDEX idx_lab_tests_active ON public.lab_tests(is_active);
CREATE INDEX idx_lab_orders_user_id ON public.lab_orders(user_id);
CREATE INDEX idx_lab_orders_status ON public.lab_orders(status);
CREATE INDEX idx_lab_order_items_order_id ON public.lab_order_items(lab_order_id);
CREATE INDEX idx_sales_analytics_user_date ON public.sales_analytics(user_id, date);
CREATE INDEX idx_product_analytics_user_product_date ON public.product_analytics(user_id, product_id, date);
CREATE INDEX idx_customer_analytics_user_customer ON public.customer_analytics(user_id, customer_id);

-- Create database functions for analytics
CREATE OR REPLACE FUNCTION public.update_sales_analytics()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
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
$function$;

-- Create trigger to update sales analytics
CREATE TRIGGER trigger_update_sales_analytics
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_sales_analytics();
