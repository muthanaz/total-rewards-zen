-- =============================================================================
-- HARDENING PACK MIGRATION: DB Correctness, Constraints & Race-Condition Elimination
-- =============================================================================

-- 1) Ensure policies.status constraint allows ONLY: draft, published, archived
-- (Drop if exists to ensure clean re-creation)
ALTER TABLE public.policies
  DROP CONSTRAINT IF EXISTS policies_status_check;

ALTER TABLE public.policies
  ADD CONSTRAINT policies_status_check
  CHECK (status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text]));

-- 2) Ensure policy_versions.status constraint is complete lifecycle
ALTER TABLE public.policy_versions
  DROP CONSTRAINT IF EXISTS policy_versions_status_check;

ALTER TABLE public.policy_versions
  ADD CONSTRAINT policy_versions_status_check
  CHECK (status = ANY (ARRAY[
    'draft'::text, 
    'submitted'::text, 
    'approved'::text, 
    'rejected'::text, 
    'published'::text, 
    'archived'::text
  ]));

-- 3) Ensure unique constraint on policy_create_requests.client_request_id
-- (Should already exist, but ensure it's there)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'policy_create_requests_client_request_id_key'
  ) THEN
    ALTER TABLE public.policy_create_requests
      ADD CONSTRAINT policy_create_requests_client_request_id_key UNIQUE (client_request_id);
  END IF;
END $$;

-- 4) Create improved create_policy_with_version with advisory lock
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
  p_logic_json jsonb DEFAULT NULL,
  p_client_request_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_policy_id uuid;
  v_version_id uuid;
  v_policy_ref text;
  v_content jsonb;
  v_logic jsonb;
  v_existing_request record;
  v_lock_key bigint;
BEGIN
  -- Validate required fields
  IF p_policy_name IS NULL OR trim(p_policy_name) = '' THEN
    RAISE EXCEPTION 'Policy name is required';
  END IF;
  
  IF p_life_area IS NULL OR trim(p_life_area) = '' THEN
    RAISE EXCEPTION 'Life area is required';
  END IF;

  -- Advisory lock to prevent concurrent double-creates
  IF p_client_request_id IS NOT NULL THEN
    -- Generate stable lock key from client_request_id
    v_lock_key := ('x' || substr(p_client_request_id::text, 1, 16))::bit(64)::bigint;
    PERFORM pg_advisory_xact_lock(v_lock_key);
    
    -- Check idempotency after acquiring lock
    SELECT * INTO v_existing_request
    FROM public.policy_create_requests
    WHERE client_request_id = p_client_request_id;
    
    IF FOUND THEN
      -- Return existing policy info
      RETURN jsonb_build_object(
        'success', true,
        'policy_id', v_existing_request.policy_id,
        'policy_version_id', v_existing_request.policy_version_id,
        'policy_ref', (SELECT policy_ref FROM policies WHERE id = v_existing_request.policy_id),
        'already_exists', true
      );
    END IF;
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

  -- Record idempotency key if provided
  IF p_client_request_id IS NOT NULL THEN
    INSERT INTO public.policy_create_requests (
      client_request_id,
      organization_id,
      created_by,
      policy_id,
      policy_version_id
    ) VALUES (
      p_client_request_id,
      p_org_id,
      p_created_by,
      v_policy_id,
      v_version_id
    );
  END IF;

  -- Return the created IDs
  RETURN jsonb_build_object(
    'success', true,
    'policy_id', v_policy_id,
    'policy_version_id', v_version_id,
    'policy_ref', v_policy_ref,
    'already_exists', false
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$function$;

-- 5) Create improved duplicate_policy_version with advisory lock
CREATE OR REPLACE FUNCTION public.duplicate_policy_version(
  p_source_policy_id uuid,
  p_source_version_id uuid DEFAULT NULL,
  p_new_title text DEFAULT NULL,
  p_client_request_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_source_policy record;
  v_source_version record;
  v_new_policy_id uuid;
  v_new_version_id uuid;
  v_policy_ref text;
  v_title text;
  v_existing_request record;
  v_lock_key bigint;
BEGIN
  -- Advisory lock to prevent concurrent double-creates
  IF p_client_request_id IS NOT NULL THEN
    v_lock_key := ('x' || substr(p_client_request_id::text, 1, 16))::bit(64)::bigint;
    PERFORM pg_advisory_xact_lock(v_lock_key);
    
    -- Check idempotency after acquiring lock
    SELECT * INTO v_existing_request
    FROM public.policy_create_requests
    WHERE client_request_id = p_client_request_id;
    
    IF FOUND THEN
      -- Return existing policy info
      RETURN jsonb_build_object(
        'success', true,
        'policy_id', v_existing_request.policy_id,
        'policy_version_id', v_existing_request.policy_version_id,
        'policy_ref', (SELECT policy_ref FROM policies WHERE id = v_existing_request.policy_id),
        'already_exists', true
      );
    END IF;
  END IF;

  -- Fetch source policy
  SELECT * INTO v_source_policy
  FROM public.policies
  WHERE id = p_source_policy_id AND is_deleted = false;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Source policy not found');
  END IF;

  -- Determine which version to copy
  IF p_source_version_id IS NOT NULL THEN
    SELECT * INTO v_source_version
    FROM public.policy_versions
    WHERE id = p_source_version_id AND policy_id = p_source_policy_id;
  ELSE
    -- Get the latest published or draft version
    SELECT * INTO v_source_version
    FROM public.policy_versions
    WHERE policy_id = p_source_policy_id
    ORDER BY 
      CASE status 
        WHEN 'published' THEN 1 
        WHEN 'approved' THEN 2
        WHEN 'draft' THEN 3
        ELSE 4 
      END,
      version_number DESC
    LIMIT 1;
  END IF;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Source version not found');
  END IF;

  -- Generate new title and ref
  v_title := COALESCE(p_new_title, v_source_policy.title || ' (Copy)');
  v_policy_ref := 'POL-' || upper(left(v_title, 3)) || '-' || upper(to_hex(extract(epoch from now())::int));

  -- Create new policy
  INSERT INTO public.policies (
    organization_id,
    policy_ref,
    title,
    category,
    version,
    status,
    effective_from,
    benefit_type,
    transaction_model,
    benefit_key,
    owner_user_id,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    v_source_policy.organization_id,
    v_policy_ref,
    v_title,
    v_source_policy.category,
    '1.0',
    'draft',
    CURRENT_DATE,
    v_source_policy.benefit_type,
    v_source_policy.transaction_model,
    v_source_policy.benefit_key,
    auth.uid(),
    true,
    now(),
    now()
  )
  RETURNING id INTO v_new_policy_id;

  -- Create new draft version with copied content
  INSERT INTO public.policy_versions (
    policy_id,
    version_number,
    status,
    effective_from,
    created_by,
    content_json,
    logic_json,
    created_at,
    last_updated_at
  ) VALUES (
    v_new_policy_id,
    1,
    'draft',
    CURRENT_DATE,
    auth.uid(),
    COALESCE(v_source_version.content_json, '{}'::jsonb),
    COALESCE(v_source_version.logic_json, '{}'::jsonb),
    now(),
    now()
  )
  RETURNING id INTO v_new_version_id;

  -- Copy required docs from source version
  INSERT INTO public.policy_required_docs (
    policy_version_id,
    transaction_type,
    doc_type,
    doc_name,
    is_required,
    conditions_json,
    description
  )
  SELECT
    v_new_version_id,
    transaction_type,
    doc_type,
    doc_name,
    is_required,
    conditions_json,
    description
  FROM public.policy_required_docs
  WHERE policy_version_id = v_source_version.id;

  -- Record idempotency key if provided
  IF p_client_request_id IS NOT NULL THEN
    INSERT INTO public.policy_create_requests (
      client_request_id,
      organization_id,
      created_by,
      policy_id,
      policy_version_id
    ) VALUES (
      p_client_request_id,
      v_source_policy.organization_id,
      auth.uid(),
      v_new_policy_id,
      v_new_version_id
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'policy_id', v_new_policy_id,
    'policy_version_id', v_new_version_id,
    'policy_ref', v_policy_ref,
    'title', v_title,
    'already_exists', false
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$function$;

-- 6) Ensure create_policy_with_draft_version delegates correctly
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
SET search_path TO 'public'
AS $function$
BEGIN
  -- Delegate to the atomic+idempotent function with advisory lock
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
$function$;

-- 7) Ensure publish_policy_version reads ONLY from org_policy_governance_settings
-- (Two overloaded versions: one with policy_id+version_id, one with just version_id)

-- Version with just version_id (primary)
CREATE OR REPLACE FUNCTION public.publish_policy_version(
  p_policy_version_id uuid,
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
  v_version_number int;
  v_settings record;
  v_require_approval boolean;
BEGIN
  SELECT * INTO v_version_record
  FROM public.policy_versions
  WHERE id = p_policy_version_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Version not found');
  END IF;

  v_version_number := v_version_record.version_number;

  SELECT * INTO v_policy
  FROM public.policies
  WHERE id = v_version_record.policy_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Policy not found');
  END IF;

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
$function$;

-- 8) Ensure submit_policy_for_approval reads ONLY from org_policy_governance_settings
CREATE OR REPLACE FUNCTION public.submit_policy_for_approval(
  p_policy_version_id uuid,
  p_note text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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

  -- SINGLE SOURCE OF TRUTH: org_policy_governance_settings
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
$function$;