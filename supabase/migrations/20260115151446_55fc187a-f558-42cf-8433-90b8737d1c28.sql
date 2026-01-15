-- Add benefit_policy_versions table for policy versioning
CREATE TABLE public.benefit_policy_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  benefit_id UUID REFERENCES public.benefits(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  effective_from DATE NOT NULL,
  effective_until DATE,
  policy_text TEXT,
  attachment_url TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.benefit_policy_versions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Employers can view their org policy versions"
  ON public.benefit_policy_versions FOR SELECT
  USING (organization_id = (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Employers can manage their org policy versions"
  ON public.benefit_policy_versions FOR ALL
  USING (organization_id = (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()))
  WITH CHECK (organization_id = (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()));

-- Add request_attachments table for document management
CREATE TABLE public.request_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES public.requests(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_by UUID NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_required BOOLEAN DEFAULT false,
  document_type TEXT
);

-- Enable RLS
ALTER TABLE public.request_attachments ENABLE ROW LEVEL SECURITY;

-- Create policies for request attachments
CREATE POLICY "Users can view attachments for their requests"
  ON public.request_attachments FOR SELECT
  USING (
    uploaded_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.requests r 
      WHERE r.id = request_id AND r.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.requests r 
      WHERE r.id = request_id AND r.organization_id = (
        SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can upload attachments to their requests"
  ON public.request_attachments FOR INSERT
  WITH CHECK (uploaded_by = auth.uid());

-- Add benefit_required_documents table
CREATE TABLE public.benefit_required_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  benefit_id UUID REFERENCES public.benefits(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  document_name_ar TEXT,
  description TEXT,
  description_ar TEXT,
  is_required BOOLEAN DEFAULT true,
  required_for TEXT DEFAULT 'claim', -- 'claim', 'request', 'enrollment'
  conditions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.benefit_required_documents ENABLE ROW LEVEL SECURITY;

-- Public read for benefit documents
CREATE POLICY "Anyone can view benefit required documents"
  ON public.benefit_required_documents FOR SELECT
  USING (true);

-- Add org_policy_settings table for organization-specific policy configuration
CREATE TABLE public.org_policy_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL UNIQUE,
  fiscal_year_start_month INTEGER DEFAULT 1,
  gratuity_calculation_rules JSONB DEFAULT '{}',
  leave_accrual_rules JSONB DEFAULT '{}',
  payroll_cycle TEXT DEFAULT 'monthly',
  currency TEXT DEFAULT 'AED',
  timezone TEXT DEFAULT 'Asia/Dubai',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.org_policy_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Employers can view their org policy settings"
  ON public.org_policy_settings FOR SELECT
  USING (organization_id = (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Employers can manage their org policy settings"
  ON public.org_policy_settings FOR ALL
  USING (organization_id = (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()))
  WITH CHECK (organization_id = (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()));

-- Add integration_runs table for tracking integration status
CREATE TABLE public.integration_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  connector_type TEXT NOT NULL, -- 'hris', 'payroll', 'claims', 'survey'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'running', 'success', 'failed'
  last_sync_at TIMESTAMP WITH TIME ZONE,
  records_synced INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  coverage_percent NUMERIC(5,2) DEFAULT 0,
  error_summary TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.integration_runs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Employers can view their org integration runs"
  ON public.integration_runs FOR SELECT
  USING (organization_id = (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admin can manage integration runs"
  ON public.integration_runs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Add triggers for updated_at
CREATE TRIGGER update_benefit_policy_versions_updated_at
  BEFORE UPDATE ON public.benefit_policy_versions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_org_policy_settings_updated_at
  BEFORE UPDATE ON public.org_policy_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_integration_runs_updated_at
  BEFORE UPDATE ON public.integration_runs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();