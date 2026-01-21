-- Add benefit_key to policies table for Claims integration
ALTER TABLE public.policies 
  ADD COLUMN IF NOT EXISTS benefit_key text;

-- Create index for benefit_key lookup
CREATE INDEX IF NOT EXISTS idx_policies_benefit_key ON public.policies(benefit_key);
CREATE INDEX IF NOT EXISTS idx_policies_org_benefit ON public.policies(organization_id, benefit_key);

-- Add is_active default constraint update
UPDATE public.policies SET is_active = true WHERE is_active IS NULL;