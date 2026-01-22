-- Create atomic function to create policy with draft version
-- This prevents RLS issues and ensures consistency

CREATE OR REPLACE FUNCTION public.create_policy_with_version(
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
  p_logic_json jsonb DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_policy_id uuid;
  v_version_id uuid;
  v_policy_ref text;
  v_content jsonb;
  v_logic jsonb;
BEGIN
  -- Validate required fields
  IF p_policy_name IS NULL OR trim(p_policy_name) = '' THEN
    RAISE EXCEPTION 'Policy name is required';
  END IF;
  
  IF p_life_area IS NULL OR trim(p_life_area) = '' THEN
    RAISE EXCEPTION 'Life area is required';
  END IF;

  -- Generate unique policy reference
  v_policy_ref := 'POL-' || upper(left(p_policy_name, 3)) || '-' || upper(to_hex(extract(epoch from now())::int));

  -- Default content and logic
  v_content := COALESCE(p_content_json, '{"faqs": [], "details": "", "summary": [], "examples": [], "pitfalls": []}'::jsonb);
  v_logic := COALESCE(p_logic_json, jsonb_build_object(
    'transaction_model', p_transaction_model,
    'eligibility_rules', '{"grades": [], "locations": [], "departments": [], "contract_types": [], "probation_passed": false, "min_tenure_months": 0}'::jsonb,
    'limits_caps', '{"frequency": "annual", "annual_cap": null, "reset_month": 1, "annual_cap_currency": "AED", "per_transaction_cap": null, "pre_approval_threshold": null}'::jsonb,
    'workflow', '{"sla_days": 3, "approver_role": "manager", "escalation_role": null}'::jsonb
  ));

  -- Insert policy
  INSERT INTO public.policies (
    organization_id,
    policy_ref,
    title,
    category,
    version,
    status,
    effective_from,
    effective_to,
    benefit_type,
    transaction_model,
    owner_user_id,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    p_org_id,
    v_policy_ref,
    trim(p_policy_name),
    p_life_area,
    '1.0',
    'draft',
    COALESCE(p_effective_from, CURRENT_DATE),
    p_effective_to,
    p_benefit_type,
    p_transaction_model,
    p_created_by,
    true,
    now(),
    now()
  )
  RETURNING id INTO v_policy_id;

  -- Insert draft version (v1)
  INSERT INTO public.policy_versions (
    policy_id,
    version_number,
    status,
    effective_from,
    effective_to,
    created_by,
    content_json,
    logic_json,
    created_at,
    last_updated_at
  ) VALUES (
    v_policy_id,
    1,
    'draft',
    p_effective_from,
    p_effective_to,
    p_created_by,
    v_content,
    v_logic,
    now(),
    now()
  )
  RETURNING id INTO v_version_id;

  -- Return the created IDs
  RETURN jsonb_build_object(
    'success', true,
    'policy_id', v_policy_id,
    'policy_version_id', v_version_id,
    'policy_ref', v_policy_ref
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Create atomic function to publish a policy version
CREATE OR REPLACE FUNCTION public.publish_policy_version(
  p_policy_id uuid,
  p_version_id uuid,
  p_effective_from date DEFAULT CURRENT_DATE
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_version_record record;
  v_version_number int;
BEGIN
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

  -- Ensure version is draft
  IF v_version_record.status != 'draft' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Only draft versions can be published. Current status: ' || v_version_record.status
    );
  END IF;

  v_version_number := v_version_record.version_number;

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

  -- Update parent policy status
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
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.create_policy_with_version TO authenticated;
GRANT EXECUTE ON FUNCTION public.publish_policy_version TO authenticated;