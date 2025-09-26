
-- Add columns for richer audit logging
ALTER TABLE public.audit_logs
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS details JSONB;

-- Create a backup_schedules table if it doesn't exist for backup automation
CREATE TABLE IF NOT EXISTS public.backup_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  frequency TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  time TEXT NOT NULL,      -- e.g., '02:00'
  backup_type TEXT NOT NULL, -- 'full', 'incremental', 'data_only'
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on backup_schedules
ALTER TABLE public.backup_schedules ENABLE ROW LEVEL SECURITY;

-- Policy: Users access only their own schedules
CREATE POLICY "Users can view/edit their own backup schedules"
  ON public.backup_schedules
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

