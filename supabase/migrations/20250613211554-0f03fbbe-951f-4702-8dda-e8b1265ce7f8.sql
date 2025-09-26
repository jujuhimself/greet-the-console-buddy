
-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create system_alerts table
CREATE TABLE public.system_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  category TEXT NOT NULL CHECK (category IN ('system', 'security', 'maintenance', 'update')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  target_roles TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create report_templates table
CREATE TABLE public.report_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  report_type TEXT NOT NULL CHECK (report_type IN ('sales', 'inventory', 'financial', 'custom')),
  query_config JSONB NOT NULL,
  schedule JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create generated_reports table
CREATE TABLE public.generated_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.report_templates(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_format TEXT NOT NULL CHECK (file_format IN ('pdf', 'excel', 'csv')),
  status TEXT NOT NULL CHECK (status IN ('generating', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  parameters JSONB
);

-- Create user_settings table
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  language TEXT NOT NULL DEFAULT 'en',
  timezone TEXT NOT NULL DEFAULT 'UTC',
  currency TEXT NOT NULL DEFAULT 'TZS',
  notifications JSONB NOT NULL DEFAULT '{"email": true, "push": true, "sms": false, "marketing": false}',
  privacy JSONB NOT NULL DEFAULT '{"profile_visibility": "business_only", "data_sharing": false, "analytics_tracking": true}',
  business_settings JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create notifications" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create RLS policies for system_alerts
CREATE POLICY "Everyone can view active system alerts" 
  ON public.system_alerts 
  FOR SELECT 
  USING (is_active = true);

-- Create RLS policies for report_templates
CREATE POLICY "Users can view their own report templates" 
  ON public.report_templates 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create report templates" 
  ON public.report_templates 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own report templates" 
  ON public.report_templates 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own report templates" 
  ON public.report_templates 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for generated_reports
CREATE POLICY "Users can view their own generated reports" 
  ON public.generated_reports 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.report_templates 
    WHERE report_templates.id = generated_reports.template_id 
    AND report_templates.user_id = auth.uid()
  ));

CREATE POLICY "Users can create generated reports" 
  ON public.generated_reports 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.report_templates 
    WHERE report_templates.id = generated_reports.template_id 
    AND report_templates.user_id = auth.uid()
  ));

-- Create RLS policies for user_settings
CREATE POLICY "Users can view their own settings" 
  ON public.user_settings 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings" 
  ON public.user_settings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" 
  ON public.user_settings 
  FOR UPDATE 
  USING (auth.uid() = user_id);
