
-- 1. Inventory Forecasting Table
CREATE TABLE IF NOT EXISTS public.inventory_forecasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL,
  forecast_date date NOT NULL,
  forecasted_demand integer NOT NULL,
  actual integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for inventory_forecasts
ALTER TABLE public.inventory_forecasts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their own forecasts"
  ON public.inventory_forecasts
  FOR ALL
  USING (user_id = auth.uid());

-- 2. Point-of-Sale (POS) tables: pos_sales and pos_sale_items
CREATE TABLE IF NOT EXISTS public.pos_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  sale_date timestamp with time zone NOT NULL DEFAULT now(),
  total_amount numeric NOT NULL,
  payment_method text NOT NULL,
  customer_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pos_sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pos_sale_id uuid NOT NULL REFERENCES public.pos_sales(id) ON DELETE CASCADE,
  product_id uuid NOT NULL,
  quantity integer NOT NULL,
  unit_price numeric NOT NULL,
  total_price numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for pos_sales and pos_sale_items
ALTER TABLE public.pos_sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their own POS sales"
  ON public.pos_sales
  FOR ALL
  USING (user_id = auth.uid());

ALTER TABLE public.pos_sale_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their own POS sale items"
  ON public.pos_sale_items
  FOR ALL
  USING (
    pos_sale_id IN (
      SELECT id FROM public.pos_sales WHERE user_id = auth.uid()
    )
  );

-- 3. Inventory Adjustment Log table (if not already present)
CREATE TABLE IF NOT EXISTS public.inventory_adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL,
  adjustment_type text NOT NULL, -- e.g., 'correction', 'shrinkage', 'spoiled', 'found'
  quantity integer NOT NULL,
  reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.inventory_adjustments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their own inventory adjustments"
  ON public.inventory_adjustments
  FOR ALL
  USING (user_id = auth.uid());

-- 4. Credit/CRM tables for Wholesale customers
CREATE TABLE IF NOT EXISTS public.wholesale_credit_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wholesaler_user_id uuid NOT NULL,
  retailer_id uuid NOT NULL,
  credit_limit numeric NOT NULL DEFAULT 0,
  current_balance numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active', -- 'active', 'suspended', 'closed'
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.wholesale_credit_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Wholesalers can access their customers' credit"
  ON public.wholesale_credit_accounts
  FOR ALL
  USING (wholesaler_user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.wholesale_credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  credit_account_id uuid NOT NULL REFERENCES public.wholesale_credit_accounts(id) ON DELETE CASCADE,
  transaction_type text NOT NULL, -- 'charge', 'payment', etc.
  amount numeric NOT NULL,
  transaction_date timestamp with time zone NOT NULL DEFAULT now(),
  reference text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.wholesale_credit_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Wholesalers can access their own credit transactions"
  ON public.wholesale_credit_transactions
  FOR ALL
  USING (
    credit_account_id IN (
      SELECT id FROM public.wholesale_credit_accounts WHERE wholesaler_user_id = auth.uid()
    )
  );

-- 5. Audit Report Table/Log (expanding audit_logs)
-- Assuming audit_logs already exist with required columns - no changes here
-- Optionally ensure SELECT for own actions only if not public

