-- Create RPC for safe policy duplication with idempotency
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
BEGIN
  -- Check idempotency if client_request_id provided
  IF p_client_request_id IS NOT NULL THEN
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