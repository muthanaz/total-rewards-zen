-- Prompt 2: Fix approval RPC to use org_policy_governance_settings

CREATE OR REPLACE FUNCTION public.submit_policy_for_approval(
  p_policy_version_id uuid,
  p_note text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_version record;
  v_policy record;
  v_settings record;
  v_require_approval boolean;
  v_approval_id uuid;
BEGIN
  SELECT * INTO v_version
  FROM public.policy_versions
  WHERE id = p_policy_version_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Version not found');
  END IF;

  IF v_version.status <> 'draft' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only draft versions can be submitted. Current status: ' || v_version.status);
  END IF;

  SELECT * INTO v_policy
  FROM public.policies
  WHERE id = v_version.policy_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Policy not found');
  END IF;

  SELECT * INTO v_settings
  FROM public.org_policy_governance_settings
  WHERE organization_id = v_policy.organization_id;

  v_require_approval := COALESCE(v_settings.require_policy_approval, true);

  IF v_require_approval IS NOT TRUE THEN
    -- Approvals disabled: return that it can publish directly
    RETURN jsonb_build_object(
      'success', true,
      'version_id', p_policy_version_id,
      'status', 'draft',
      'can_publish_directly', true
    );
  END IF;

  -- Mark version submitted
  UPDATE public.policy_versions
  SET
    status = 'submitted',
    submitted_at = now(),
    submitted_by = auth.uid(),
    last_updated_at = now()
  WHERE id = p_policy_version_id;

  -- Create approval record
  INSERT INTO public.policy_approvals (
    organization_id,
    policy_id,
    policy_version_id,
    requested_by,
    approver_role,
    status,
    note
  ) VALUES (
    v_policy.organization_id,
    v_policy.id,
    p_policy_version_id,
    auth.uid(),
    COALESCE(v_settings.approver_role, 'executive'),
    'pending',
    p_note
  )
  RETURNING id INTO v_approval_id;

  RETURN jsonb_build_object(
    'success', true,
    'approval_id', v_approval_id,
    'version_id', p_policy_version_id,
    'status', 'submitted',
    'can_publish_directly', false
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
