-- Add transaction_type enum for distinguishing request/claim/settlement
DO $$ BEGIN
  CREATE TYPE public.transaction_type AS ENUM ('request', 'claim', 'settlement');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add settlement_required flag and per_diem defaults to policies
ALTER TABLE public.policies
  ADD COLUMN IF NOT EXISTS settlement_required boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS auto_close_on_approval boolean DEFAULT false;

-- Update policy_versions to include settlement_required in logic_json by updating the column comment
COMMENT ON COLUMN public.policy_versions.logic_json IS 'JSON with transaction_model, eligibility_rules, limits_caps, workflow, settlement_required';

-- Add transaction_type and policy linkage to requests table
ALTER TABLE public.requests
  ADD COLUMN IF NOT EXISTS transaction_type public.transaction_type DEFAULT 'claim',
  ADD COLUMN IF NOT EXISTS policy_id uuid REFERENCES public.policies(id),
  ADD COLUMN IF NOT EXISTS policy_version_id uuid,
  ADD COLUMN IF NOT EXISTS parent_request_id uuid REFERENCES public.requests(id),
  ADD COLUMN IF NOT EXISTS employee_context_json jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS approved_amount numeric,
  ADD COLUMN IF NOT EXISTS paid_amount numeric,
  ADD COLUMN IF NOT EXISTS paid_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'AED';

-- Create index for policy lookups
CREATE INDEX IF NOT EXISTS idx_requests_policy_id ON public.requests(policy_id);
CREATE INDEX IF NOT EXISTS idx_requests_parent_request ON public.requests(parent_request_id);

-- Add info_requested to request_status enum if not exists
DO $$ BEGIN
  ALTER TYPE public.request_status ADD VALUE IF NOT EXISTS 'info_requested' AFTER 'in_review';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add cancelled status if not exists
DO $$ BEGIN
  ALTER TYPE public.request_status ADD VALUE IF NOT EXISTS 'cancelled' AFTER 'closed';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;