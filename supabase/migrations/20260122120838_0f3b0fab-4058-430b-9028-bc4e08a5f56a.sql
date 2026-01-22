-- Fix policies.status constraint + backfill legacy 'active' rows, and unify approvals config source-of-truth.

BEGIN;

-- 1) Backfill legacy statuses BEFORE tightening constraint
-- Map:
--  - active -> published if any published version exists
--  - active -> draft otherwise
UPDATE public.policies p
SET status = CASE
  WHEN EXISTS (
    SELECT 1
    FROM public.policy_versions pv
    WHERE pv.policy_id = p.id
      AND pv.status = 'published'
  ) THEN 'published'
  ELSE 'draft'
END,
updated_at = now()
WHERE p.status = 'active';

-- If any other unexpected statuses exist, normalize to draft (defensive)
UPDATE public.policies
SET status = 'draft', updated_at = now()
WHERE status NOT IN ('draft', 'published', 'archived');

-- 2) Replace the CHECK constraint to allow published
ALTER TABLE public.policies
  DROP CONSTRAINT IF EXISTS policies_status_check;

ALTER TABLE public.policies
  ADD CONSTRAINT policies_status_check
  CHECK (status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text]));

-- Align default with new lifecycle (active is deprecated)
ALTER TABLE public.policies
  ALTER COLUMN status SET DEFAULT 'draft';

-- 3) Approvals config: enforce org_policy_governance_settings as the ONLY truth
-- There is an older publish_policy_version(policy_id, version_id, ...) signature in the DB that still referenced org_policy_settings.
-- Replace it so both publish entrypoints behave identically and read governance settings only.
CREATE OR REPLACE FUNCTION public.publish_policy_version(
  p_policy_id uuid,
  p_version_id uuid,
  p_effective_from date DEFAULT CURRENT_DATE
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_version_record record;
  v_policy record;
  v_settings record;
  v_require_approval boolean;
  v_version_number int;
BEGIN
  -- Load policy
  SELECT * INTO v_policy
  FROM public.policies
  WHERE id = p_policy_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Policy not found');
  END IF;

  -- Validate version exists and belongs to policy
  SELECT * INTO v_version_record
  FROM public.policy_versions
  WHERE id = p_version_id AND policy_id = p_policy_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Version not found or does not belong to this policy'
    );
  END IF;

  v_version_number := v_version_record.version_number;

  -- SINGLE SOURCE OF TRUTH: org_policy_governance_settings (default approvals ON)
  SELECT * INTO v_settings
  FROM public.org_policy_governance_settings
  WHERE organization_id = v_policy.organization_id;

  v_require_approval := COALESCE(v_settings.require_policy_approval, true);

  IF v_require_approval IS TRUE THEN
    IF v_version_record.status = 'draft' THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Approval workflow is enabled. Please submit for approval first.',
        'requires_approval', true
      );
    END IF;

    IF v_version_record.status NOT IN ('approved') THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Version must be approved before publishing. Current status: ' || v_version_record.status,
        'requires_approval', true
      );
    END IF;
  ELSE
    IF v_version_record.status NOT IN ('draft', 'approved') THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Only draft or approved versions can be published. Current status: ' || v_version_record.status
      );
    END IF;
  END IF;

  -- Archive any currently published version for this policy
  UPDATE public.policy_versions
  SET
    status = 'archived',
    effective_to = p_effective_from,
    last_updated_at = now()
  WHERE policy_id = p_policy_id
    AND status = 'published'
    AND id != p_version_id;

  -- Publish this version
  UPDATE public.policy_versions
  SET
    status = 'published',
    effective_from = p_effective_from,
    last_updated_at = now()
  WHERE id = p_version_id;

  -- Update parent policy status (now allowed by constraint)
  UPDATE public.policies
  SET
    status = 'published',
    effective_from = p_effective_from,
    updated_at = now()
  WHERE id = p_policy_id;

  RETURN jsonb_build_object(
    'success', true,
    'policy_id', p_policy_id,
    'version_id', p_version_id,
    'version_number', v_version_number,
    'status', 'published'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$function$;

COMMIT;