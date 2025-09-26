
-- 1. Make sure "orders" table supports pharmacy/wholesale relations, and lab_orders has correct foreign keys, as well as prescriptions.
-- Add profile_id columns if missing and update relationships
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS pharmacy_id uuid,
  ADD COLUMN IF NOT EXISTS wholesaler_id uuid;

-- Indexes for efficient joins
CREATE INDEX IF NOT EXISTS ix_orders_pharmacy_id ON public.orders(pharmacy_id);
CREATE INDEX IF NOT EXISTS ix_orders_wholesaler_id ON public.orders(wholesaler_id);

-- 2. Make sure products table has necessary data for inventory referencing
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS pharmacy_id uuid,
  ADD COLUMN IF NOT EXISTS wholesaler_id uuid;

CREATE INDEX IF NOT EXISTS ix_products_pharmacy_id ON public.products(pharmacy_id);
CREATE INDEX IF NOT EXISTS ix_products_wholesaler_id ON public.products(wholesaler_id);

-- 3. Pharmacies: For pharmacy "finder" and directory, make sure we can filter and list pharmacy profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS latitude numeric,
  ADD COLUMN IF NOT EXISTS longitude numeric,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS region text,
  ADD COLUMN IF NOT EXISTS is_pharmacy boolean DEFAULT false;

-- Set is_pharmacy=true for all profiles where role='retail'
UPDATE public.profiles SET is_pharmacy=true WHERE role='retail';

CREATE INDEX IF NOT EXISTS ix_profiles_is_pharmacy ON public.profiles(is_pharmacy);
CREATE INDEX IF NOT EXISTS ix_profiles_city ON public.profiles(city);

-- 4. Lab Orders: Make sure there is a lab_id and pharmacy_id linkage for B2B/B2C testing
ALTER TABLE public.lab_orders
  ADD COLUMN IF NOT EXISTS pharmacy_id uuid;

-- 5. Appointment "ownership" and indices for labs
CREATE INDEX IF NOT EXISTS ix_lab_orders_lab_id ON public.lab_orders(lab_id);
CREATE INDEX IF NOT EXISTS ix_lab_orders_user_id ON public.lab_orders(user_id);

-- 6. Support prescription-health records for individual dashboard
CREATE INDEX IF NOT EXISTS ix_prescriptions_user_id ON public.prescriptions(user_id);
CREATE INDEX IF NOT EXISTS ix_prescriptions_pharmacy_id ON public.prescriptions(pharmacy_id);

-- 7. Allow lab_tests to be joined by test_code (for matching)
CREATE INDEX IF NOT EXISTS ix_lab_tests_test_code ON public.lab_tests(test_code);

-- 8. RLS: For new fields, just making sure existing policies still allow authenticated users to view their own data
-- (if no new restrictions, just document this step)

-- 9. Add missing created_at indices for reporting/analytics speed
CREATE INDEX IF NOT EXISTS ix_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS ix_lab_orders_created_at ON public.lab_orders(created_at);
CREATE INDEX IF NOT EXISTS ix_prescriptions_created_at ON public.prescriptions(created_at);

-- 10. Add a pharmacy rating column (optional, for future "finder" and analytics!)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS pharmacy_rating numeric;

