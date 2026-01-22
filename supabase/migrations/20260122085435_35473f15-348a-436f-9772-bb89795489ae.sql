-- Create/Publish Policy v2 RPCs (atomic + idempotent + publish by version id)

-- 1) Wrapper function with requested name: create_policy_with_draft_version
-- Calls existing create_policy_with_version implementation.
CREATE OR REPLACE FUNCTION public.create_policy_with_draft_version(
  p_org_id uuid,
  p_created_by uuid,
  p_policy_name text,
  p_life_area text,
  p_benefit_type text DEFAULT 'allowance',
  p_transaction_model text DEFAULT 'claim_only',
  p_effective_from date DEFAULT NULL,
  p_effective_to date DEFAULT NULL,
  p_template_id uuid DEFAULT NULL,
  p_content_json jsonb DEFAULT NULL,
  p_logic_json jsonb DEFAULT NULL,
  p_client_request_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delegate to the existing atomic+idempotent function
  RETURN public.create_policy_with_version(
    p_org_id,
    p_created_by,
    p_policy_name,
    p_life_area,
    p_benefit_type,
    p_transaction_model,
    p_effective_from,
    p_effective_to,
    p_template_id,
    p_content_json,
    p_logic_json,
    p_client_request_id
  );
END;
$$;

-- 2) Update publish_policy_version to accept only policy_version_id (as requested)
-- NOTE: We replace the signature; current frontend call sites will be updated accordingly.
CREATE OR REPLACE FUNCTION public.publish_policy_version(
  p_policy_version_id uuid,
  p_effective_from date DEFAULT CURRENT_DATE
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_version_record record;
  v_policy record;
  v_version_number int;
  v_org_settings record;
BEGIN
  -- Validate version exists
  SELECT * INTO v_version_record
  FROM public.policy_versions
  WHERE id = p_policy_version_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Version not found');
  END IF;

  v_version_number := v_version_record.version_number;

  -- Load parent policy
  SELECT * INTO v_policy
  FROM public.policies
  WHERE id = v_version_record.policy_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Policy not found');
  END IF;

  -- Org settings (approval optional)
  SELECT * INTO v_org_settings
  FROM public.org_policy_settings
  WHERE organization_id = v_policy.organization_id;

  IF v_org_settings IS NOT NULL AND v_org_settings.require_policy_approval IS TRUE THEN
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
    'status', 'published'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Permissions hardening: keep execution limited to authenticated users.
-- (RLS is still in effect for direct table access; these are SECURITY DEFINER entrypoints.)
GRANT EXECUTE ON FUNCTION public.create_policy_with_draft_version(
  uuid, uuid, text, text, text, text, date, date, uuid, jsonb, jsonb, uuid
) TO authenticated;

GRANT EXECUTE ON FUNCTION public.publish_policy_version(uuid, date) TO authenticated;
