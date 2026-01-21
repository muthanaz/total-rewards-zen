-- Create policy_templates table for Admin-driven policy onboarding
CREATE TABLE public.policy_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- life area / benefit category
  benefit_type TEXT DEFAULT 'allowance',
  transaction_model TEXT DEFAULT 'claim_only',
  default_eligibility_rules JSONB DEFAULT '{}',
  default_limits JSONB DEFAULT '{}',
  default_required_docs JSONB DEFAULT '[]',
  default_workflow JSONB DEFAULT '{}',
  default_sla_days INTEGER DEFAULT NULL,
  default_content JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.policy_templates ENABLE ROW LEVEL SECURITY;

-- Admin can manage templates
CREATE POLICY "Admins can manage policy templates"
ON public.policy_templates
FOR ALL
USING (has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

-- All authenticated users can view active templates
CREATE POLICY "Authenticated users can view templates"
ON public.policy_templates
FOR SELECT
USING (auth.uid() IS NOT NULL AND is_active = TRUE);

-- Add index for querying
CREATE INDEX idx_policy_templates_category ON public.policy_templates(category);
CREATE INDEX idx_policy_templates_active ON public.policy_templates(is_active);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_policy_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_policy_templates_updated_at
BEFORE UPDATE ON public.policy_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_policy_templates_updated_at();