-- 1) Add enforcement_mode enum type
DO $$ BEGIN
  CREATE TYPE public.policy_enforcement_mode AS ENUM ('soft', 'strict');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2) Add policy_enforcement_mode to org_policy_governance_settings table (the single source of truth)
ALTER TABLE public.org_policy_governance_settings
  ADD COLUMN IF NOT EXISTS policy_enforcement_mode public.policy_enforcement_mode DEFAULT 'soft';

-- 3) Add compliance tracking columns to requests table
ALTER TABLE public.requests
  ADD COLUMN IF NOT EXISTS compliance_status text DEFAULT 'pending_check',
  ADD COLUMN IF NOT EXISTS compliance_reasons_json jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS checklist_snapshot_json jsonb DEFAULT NULL;

-- Add check constraint for compliance_status
DO $$ BEGIN
  ALTER TABLE public.requests
    ADD CONSTRAINT requests_compliance_status_check
    CHECK (compliance_status IN ('compliant', 'non_compliant', 'pending_check', 'exempt'));
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 4) Update request_documents to support full checklist snapshot
ALTER TABLE public.request_documents
  ADD COLUMN IF NOT EXISTS source_doc_id uuid NULL,
  ADD COLUMN IF NOT EXISTS derivation_reason text NULL,
  ADD COLUMN IF NOT EXISTS verified_by uuid NULL,
  ADD COLUMN IF NOT EXISTS verified_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS rejection_reason text NULL;

-- 5) Create index on compliance_status for employer filtering
CREATE INDEX IF NOT EXISTS requests_compliance_status_idx
  ON public.requests(compliance_status);

-- 6) Create index on request_documents for verified_by lookup
CREATE INDEX IF NOT EXISTS request_documents_verified_by_idx
  ON public.request_documents(verified_by);

-- 7) Documentation comments
COMMENT ON COLUMN public.org_policy_governance_settings.policy_enforcement_mode IS 'soft = allow submit with warnings, strict = block submit on policy violations';
COMMENT ON COLUMN public.requests.compliance_status IS 'compliant | non_compliant | pending_check | exempt';
COMMENT ON COLUMN public.requests.compliance_reasons_json IS 'Array of {type, code, message, details} for non-compliant submissions';
COMMENT ON COLUMN public.requests.checklist_snapshot_json IS 'Frozen snapshot of required docs at submission time';