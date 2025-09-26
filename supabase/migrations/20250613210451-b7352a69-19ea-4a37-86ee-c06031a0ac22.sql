
-- Create audit_logs table
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create backup_jobs table
CREATE TABLE public.backup_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  backup_type TEXT NOT NULL CHECK (backup_type IN ('full', 'incremental', 'data_only')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  file_path TEXT,
  file_size BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- Create backup_schedules table
CREATE TABLE public.backup_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  time TEXT NOT NULL,
  backup_type TEXT NOT NULL CHECK (backup_type IN ('full', 'incremental', 'data_only')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_schedules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for audit_logs
CREATE POLICY "Users can view their own audit logs" 
  ON public.audit_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create audit logs" 
  ON public.audit_logs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for backup_jobs
CREATE POLICY "Users can view their own backup jobs" 
  ON public.backup_jobs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create backup jobs" 
  ON public.backup_jobs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own backup jobs" 
  ON public.backup_jobs 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create RLS policies for backup_schedules
CREATE POLICY "Users can view their own backup schedules" 
  ON public.backup_schedules 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create backup schedules" 
  ON public.backup_schedules 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own backup schedules" 
  ON public.backup_schedules 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own backup schedules" 
  ON public.backup_schedules 
  FOR DELETE 
  USING (auth.uid() = user_id);
