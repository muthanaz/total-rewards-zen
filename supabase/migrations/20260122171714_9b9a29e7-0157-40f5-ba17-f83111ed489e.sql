-- =============================================================================
-- STABILITY & GOVERNANCE LOCK MIGRATION
-- Adds constraints, indexes, and updates RPCs for reliability
-- =============================================================================

-- 1. Ensure UNIQUE constraint on client_request_id for idempotency
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'policy_create_requests_client_request_id_key'
  ) THEN
    ALTER TABLE public.policy_create_requests 
    ADD CONSTRAINT policy_create_requests_client_request_id_key 
    UNIQUE (client_request_id);
  END IF;
END $$;

-- 2. Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_policy_create_requests_client_id 
ON public.policy_create_requests (client_request_id);

-- 3. Update policies.status constraint to ONLY allow draft/published/archived
-- First, migrate any invalid statuses
UPDATE public.policies 
SET status = 'draft' 
WHERE status NOT IN ('draft', 'published', 'archived');

-- Drop existing constraint if it exists
ALTER TABLE public.policies DROP CONSTRAINT IF EXISTS policies_status_check;

-- Add new constraint
ALTER TABLE public.policies 
ADD CONSTRAINT policies_status_check 
CHECK (status IN ('draft', 'published', 'archived'));

-- 4. Update policy_versions.status constraint for lifecycle truth
UPDATE public.policy_versions 
SET status = 'draft' 
WHERE status NOT IN ('draft', 'submitted', 'approved', 'rejected', 'published', 'archived');

ALTER TABLE public.policy_versions DROP CONSTRAINT IF EXISTS policy_versions_status_check;

ALTER TABLE public.policy_versions 
ADD CONSTRAINT policy_versions_status_check 
CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'published', 'archived'));

-- 5. Create or replace archive_or_delete_policy with detailed flags
CREATE OR REPLACE FUNCTION public.archive_or_delete_policy(
  p_policy_id uuid, 
  p_action text, 
  p_reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $func$
DECLARE
  v_policy record;
  v_has_published_version boolean;
  v_has_linked_claims boolean;
  v_user_id uuid := auth.uid();
BEGIN
  -- Validate action
  IF p_action NOT IN ('archive', 'delete') THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Action must be "archive" or "delete"'
    );
  END IF;
  
  -- Get policy
  SELECT * INTO v_policy
  FROM public.policies
  WHERE id = p_policy_id AND is_deleted = false;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Policy not found or already deleted'
    );
  END IF;
  
  -- Check for published versions
  SELECT EXISTS(
    SELECT 1 FROM public.policy_versions 
    WHERE policy_id = p_policy_id AND status = 'published'
  ) INTO v_has_published_version;
  
  -- Check for linked claims/requests
  SELECT EXISTS(
    SELECT 1 FROM public.requests 
    WHERE policy_id = p_policy_id
    LIMIT 1
  ) INTO v_has_linked_claims;
  
  -- If delete requested but has published or linked claims, BLOCK with detailed info
  IF p_action = 'delete' AND (v_has_published_version OR v_has_linked_claims) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', CASE 
        WHEN v_has_published_version AND v_has_linked_claims THEN
          'Cannot delete: policy has published versions and linked claims/requests. Use Archive instead.'
        WHEN v_has_published_version THEN
          'Cannot delete: policy has a published version. Use Archive instead to preserve history.'
        ELSE
          'Cannot delete: policy has linked claims/requests. Use Archive instead to preserve audit trail.'
      END,
      'has_published_version', v_has_published_version,
      'has_linked_claims', v_has_linked_claims,
      'can_archive', true,
      'policy_id', p_policy_id
    );
  END IF;
  
  IF p_action = 'archive' THEN
    -- Archive policy
    UPDATE public.policies
    SET 
      is_archived = true,
      is_active = false,
      status = 'archived',
      updated_at = now()
    WHERE id = p_policy_id;
    
    -- Archive all non-archived versions
    UPDATE public.policy_versions
    SET status = 'archived', last_updated_at = now()
    WHERE policy_id = p_policy_id AND status != 'archived';
    
    RETURN jsonb_build_object(
      'success', true,
      'action', 'archived',
      'policy_id', p_policy_id,
      'has_published_version', v_has_published_version,
      'has_linked_claims', v_has_linked_claims
    );
  ELSE
    -- Soft delete (only reaches here if no published/linked)
    UPDATE public.policies
    SET 
      is_deleted = true,
      is_active = false,
      deleted_at = now(),
      deleted_by = v_user_id,
      deleted_reason = p_reason,
      updated_at = now()
    WHERE id = p_policy_id;
    
    RETURN jsonb_build_object(
      'success', true,
      'action', 'deleted',
      'policy_id', p_policy_id
    );
  END IF;

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', SQLERRM,
      'policy_id', p_policy_id
    );
END;
$func$;

-- 6. Ensure publish_policy_version ALWAYS returns structured response
CREATE OR REPLACE FUNCTION public.publish_policy_version(
  p_policy_version_id uuid, 
  p_effective_from date DEFAULT CURRENT_DATE
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $func$
DECLARE
  v_version_record record;
  v_policy record;
  v_version_number int;
  v_settings record;
  v_require_approval boolean;
BEGIN
  -- Fetch version
  SELECT * INTO v_version_record
  FROM public.policy_versions
  WHERE id = p_policy_version_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Version not found',
      'requires_approval', false
    );
  END IF;

  v_version_number := v_version_record.version_number;

  -- Fetch policy
  SELECT * INTO v_policy
  FROM public.policies
  WHERE id = v_version_record.policy_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Policy not found',
      'requires_approval', false
    );
  END IF;

  -- SINGLE SOURCE OF TRUTH: org_policy_governance_settings (default approvals ON)
  SELECT * INTO v_settings
  FROM public.org_policy_governance_settings
  WHERE organization_id = v_policy.organization_id;

  v_require_approval := COALESCE(v_settings.require_policy_approval, true);

  -- Approval workflow check
  IF v_require_approval IS TRUE THEN
    IF v_version_record.status = 'draft' THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Approval workflow is enabled. Submit for approval first.',
        'requires_approval', true,
        'version_id', p_policy_version_id,
        'current_status', v_version_record.status
      );
    END IF;

    IF v_version_record.status NOT IN ('approved') THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Version must be approved before publishing. Current status: ' || v_version_record.status,
        'requires_approval', true,
        'version_id', p_policy_version_id,
        'current_status', v_version_record.status
      );
    END IF;
  ELSE
    -- No approval required, but must be draft or approved
    IF v_version_record.status NOT IN ('draft', 'approved') THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Only draft or approved versions can be published. Current status: ' || v_version_record.status,
        'requires_approval', false,
        'version_id', p_policy_version_id,
        'current_status', v_version_record.status
      );
    END IF;
  END IF;

  -- Archive any currently published version for this policy
  UPDATE public.policy_versions
  SET
    status = 'archived',
    effective_to = p_effective_from,
    last_updated_at = now()
  WHERE policy_id = v_version_record.policy_id
    AND status = 'published'
    AND id != p_policy_version_id;

  -- Publish this version
  UPDATE public.policy_versions
  SET
    status = 'published',
    effective_from = p_effective_from,
    last_updated_at = now()
  WHERE id = p_policy_version_id;

  -- Update parent policy status
  UPDATE public.policies
  SET
    status = 'published',
    effective_from = p_effective_from,
    updated_at = now()
  WHERE id = v_version_record.policy_id;

  RETURN jsonb_build_object(
    'success', true,
    'policy_id', v_version_record.policy_id,
    'version_id', p_policy_version_id,
    'version_number', v_version_number,
    'status', 'published',
    'requires_approval', false
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', SQLERRM,
      'requires_approval', false
    );
END;
$func$;