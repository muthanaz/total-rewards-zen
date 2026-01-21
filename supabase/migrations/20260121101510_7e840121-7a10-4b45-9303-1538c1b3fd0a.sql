-- Create policies table
CREATE TABLE IF NOT EXISTS public.policies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES public.organizations(id),
  policy_ref text NOT NULL,
  title text NOT NULL,
  category text NOT NULL,
  version text NOT NULL DEFAULT 'v1',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived')),
  effective_from date NOT NULL DEFAULT CURRENT_DATE,
  effective_to date,
  summary text,
  eligibility_rules jsonb DEFAULT '{}'::jsonb,
  coverage_rules jsonb DEFAULT '{}'::jsonb,
  required_docs jsonb DEFAULT '[]'::jsonb,
  sla_rules jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id, policy_ref)
);

-- Create policy_articles table for Knowledge Center
CREATE TABLE IF NOT EXISTS public.policy_articles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES public.organizations(id),
  policy_id uuid REFERENCES public.policies(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  tags text[] DEFAULT '{}',
  is_faq boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add policy_id to requests table
ALTER TABLE public.requests 
ADD COLUMN IF NOT EXISTS policy_id uuid REFERENCES public.policies(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_policies_org_category ON public.policies(organization_id, category);
CREATE INDEX IF NOT EXISTS idx_policies_org_status ON public.policies(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_policies_policy_ref ON public.policies(policy_ref);
CREATE INDEX IF NOT EXISTS idx_policy_articles_policy ON public.policy_articles(policy_id);
CREATE INDEX IF NOT EXISTS idx_requests_policy_id ON public.requests(policy_id);

-- Enable RLS
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_articles ENABLE ROW LEVEL SECURITY;

-- Policies RLS
CREATE POLICY "Authenticated users can view org policies" ON public.policies
  FOR SELECT USING (
    organization_id = get_user_organization_id(auth.uid()) 
    OR has_role(auth.uid(), 'admin'::user_role)
  );

CREATE POLICY "Employers can manage org policies" ON public.policies
  FOR ALL USING (
    (organization_id = get_user_organization_id(auth.uid()) AND has_role(auth.uid(), 'employer'::user_role))
    OR has_role(auth.uid(), 'admin'::user_role)
  ) WITH CHECK (
    (organization_id = get_user_organization_id(auth.uid()) AND has_role(auth.uid(), 'employer'::user_role))
    OR has_role(auth.uid(), 'admin'::user_role)
  );

-- Policy articles RLS
CREATE POLICY "Authenticated users can view org policy articles" ON public.policy_articles
  FOR SELECT USING (
    organization_id = get_user_organization_id(auth.uid()) 
    OR has_role(auth.uid(), 'admin'::user_role)
  );

CREATE POLICY "Employers can manage org policy articles" ON public.policy_articles
  FOR ALL USING (
    (organization_id = get_user_organization_id(auth.uid()) AND has_role(auth.uid(), 'employer'::user_role))
    OR has_role(auth.uid(), 'admin'::user_role)
  ) WITH CHECK (
    (organization_id = get_user_organization_id(auth.uid()) AND has_role(auth.uid(), 'employer'::user_role))
    OR has_role(auth.uid(), 'admin'::user_role)
  );

-- Updated_at trigger for policies
CREATE TRIGGER update_policies_updated_at
  BEFORE UPDATE ON public.policies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_policy_articles_updated_at
  BEFORE UPDATE ON public.policy_articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();