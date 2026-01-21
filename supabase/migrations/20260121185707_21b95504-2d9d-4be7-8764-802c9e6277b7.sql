-- Policy Engine Schema Enhancement
-- Create policy_versions table for proper versioning with structured content and logic

-- First, add new columns to policies table for better categorization
ALTER TABLE public.policies 
  ADD COLUMN IF NOT EXISTS benefit_type text,
  ADD COLUMN IF NOT EXISTS transaction_model text DEFAULT 'claim_only',
  ADD COLUMN IF NOT EXISTS owner_user_id uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Create policy_versions table for structured versioning
CREATE TABLE IF NOT EXISTS public.policy_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id uuid NOT NULL REFERENCES public.policies(id) ON DELETE CASCADE,
  version_number integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  effective_from date,
  effective_to date,
  last_updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  
  -- Structured content (what employees see)
  content_json jsonb DEFAULT '{
    "summary": [],
    "details": "",
    "examples": [],
    "faqs": [],
    "pitfalls": []
  }'::jsonb,
  
  -- Structured logic (business rules)
  logic_json jsonb DEFAULT '{
    "transaction_model": "claim_only",
    "eligibility_rules": {
      "grades": [],
      "departments": [],
      "locations": [],
      "contract_types": [],
      "min_tenure_months": 0,
      "probation_passed": false
    },
    "limits_caps": {
      "annual_cap": null,
      "annual_cap_currency": "AED",
      "per_transaction_cap": null,
      "frequency": "annual",
      "reset_month": 1,
      "pre_approval_threshold": null
    },
    "workflow": {
      "approver_role": "manager",
      "sla_days": 3,
      "escalation_role": null
    }
  }'::jsonb,
  
  -- Attachment
  attachment_url text,
  
  UNIQUE(policy_id, version_number)
);

-- Create policy_required_docs table for structured document requirements
CREATE TABLE IF NOT EXISTS public.policy_required_docs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_version_id uuid NOT NULL REFERENCES public.policy_versions(id) ON DELETE CASCADE,
  transaction_type text NOT NULL DEFAULT 'claim' CHECK (transaction_type IN ('request', 'claim', 'both')),
  doc_type text NOT NULL,
  doc_name text NOT NULL,
  is_required boolean DEFAULT true,
  conditions_json jsonb DEFAULT '{}'::jsonb,
  description text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.policy_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_required_docs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for policy_versions
CREATE POLICY "Users can view policy versions for their org" ON public.policy_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.policies p
      JOIN public.profiles pr ON pr.organization_id = p.organization_id
      WHERE p.id = policy_versions.policy_id AND pr.user_id = auth.uid()
    )
  );

CREATE POLICY "Employers can manage policy versions for their org" ON public.policy_versions
  FOR ALL USING (
    has_employer_permission(auth.uid(), 'can_manage_policies') AND
    EXISTS (
      SELECT 1 FROM public.policies p
      JOIN public.profiles pr ON pr.organization_id = p.organization_id
      WHERE p.id = policy_versions.policy_id AND pr.user_id = auth.uid()
    )
  );

-- RLS Policies for policy_required_docs
CREATE POLICY "Users can view required docs for their org policies" ON public.policy_required_docs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.policy_versions pv
      JOIN public.policies p ON p.id = pv.policy_id
      JOIN public.profiles pr ON pr.organization_id = p.organization_id
      WHERE pv.id = policy_required_docs.policy_version_id AND pr.user_id = auth.uid()
    )
  );

CREATE POLICY "Employers can manage required docs for their org policies" ON public.policy_required_docs
  FOR ALL USING (
    has_employer_permission(auth.uid(), 'can_manage_policies') AND
    EXISTS (
      SELECT 1 FROM public.policy_versions pv
      JOIN public.policies p ON p.id = pv.policy_id
      JOIN public.profiles pr ON pr.organization_id = p.organization_id
      WHERE pv.id = policy_required_docs.policy_version_id AND pr.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_policy_versions_policy_id ON public.policy_versions(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_versions_status ON public.policy_versions(status);
CREATE INDEX IF NOT EXISTS idx_policy_required_docs_version_id ON public.policy_required_docs(policy_version_id);

-- Add trigger for updated_at
CREATE TRIGGER update_policy_versions_updated_at
  BEFORE UPDATE ON public.policy_versions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();