-- Part 1: Fix RLS for policy_versions (allow SECURITY DEFINER functions to work)
-- First add missing columns to policies table for archive/delete
ALTER TABLE public.policies 
  ADD COLUMN IF NOT EXISTS is_archived boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_deleted boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS deleted_reason text;

-- Update policy_versions status enum to include approval states
ALTER TABLE public.policy_versions DROP CONSTRAINT IF EXISTS policy_versions_status_check;
ALTER TABLE public.policy_versions 
  ADD CONSTRAINT policy_versions_status_check 
  CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'published', 'archived'));

-- Add approval-related columns to policy_versions
ALTER TABLE public.policy_versions
  ADD COLUMN IF NOT EXISTS submitted_at timestamptz,
  ADD COLUMN IF NOT EXISTS submitted_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS rejected_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejected_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Create policy_create_requests for idempotency (using organization_id for consistency)
CREATE TABLE IF NOT EXISTS public.policy_create_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_request_id uuid NOT NULL UNIQUE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  created_by uuid NOT NULL REFERENCES auth.users(id),
  policy_id uuid REFERENCES public.policies(id),
  policy_version_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Create org_policy_settings table for approval workflow configuration
CREATE TABLE IF NOT EXISTS public.org_policy_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL UNIQUE REFERENCES public.organizations(id),
  require_policy_approval boolean DEFAULT false,
  approver_role text DEFAULT 'hr_manager' CHECK (approver_role IN ('executive', 'hr_manager', 'admin', 'custom')),
  approval_sla_days integer DEFAULT 3,
  allow_hr_ops_draft boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create policy_approvals table
CREATE TABLE IF NOT EXISTS public.policy_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  policy_id uuid NOT NULL REFERENCES public.policies(id) ON DELETE CASCADE,
  policy_version_id uuid NOT NULL,
  requested_by uuid NOT NULL REFERENCES auth.users(id),
  approver_user_id uuid REFERENCES auth.users(id),
  approver_role text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  comment text,
  note text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.policy_create_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_policy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_approvals ENABLE ROW LEVEL SECURITY;

-- RLS for policy_create_requests
CREATE POLICY "Users can view their own create requests" ON public.policy_create_requests
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can insert create requests" ON public.policy_create_requests
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS for org_policy_settings
CREATE POLICY "Users can view their org settings" ON public.org_policy_settings
  FOR SELECT USING (
    organization_id = get_user_organization_id(auth.uid()) 
    OR has_role(auth.uid(), 'admin'::user_role)
  );

CREATE POLICY "Admins can manage org settings" ON public.org_policy_settings
  FOR ALL USING (has_role(auth.uid(), 'admin'::user_role));

-- RLS for policy_approvals
CREATE POLICY "Users can view org approvals" ON public.policy_approvals
  FOR SELECT USING (
    organization_id = get_user_organization_id(auth.uid()) 
    OR has_role(auth.uid(), 'admin'::user_role)
  );

CREATE POLICY "Employers can manage approvals" ON public.policy_approvals
  FOR ALL USING (
    (organization_id = get_user_organization_id(auth.uid()) AND has_role(auth.uid(), 'employer'::user_role))
    OR has_role(auth.uid(), 'admin'::user_role)
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_policy_approvals_policy ON public.policy_approvals(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_approvals_status ON public.policy_approvals(status);
CREATE INDEX IF NOT EXISTS idx_policy_approvals_org ON public.policy_approvals(organization_id);
CREATE INDEX IF NOT EXISTS idx_policies_archived ON public.policies(is_archived) WHERE is_archived = true;
CREATE INDEX IF NOT EXISTS idx_policies_deleted ON public.policies(is_deleted) WHERE is_deleted = true;

-- Drop and recreate the create_policy_with_version function with better error handling and idempotency
DROP FUNCTION IF EXISTS public.create_policy_with_version(uuid, uuid, text, text, text, text, date, date, uuid, jsonb, jsonb);
DROP FUNCTION IF EXISTS public.create_policy_with_version(uuid, uuid, text, text, text, text, date, date, uuid, jsonb, jsonb, uuid);

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
SET search_path = public
AS $$
DECLARE
  v_policy_id uuid;
  v_version_id uuid;
  v_policy_ref text;
  v_content jsonb;
  v_logic jsonb;
  v_existing_request record;
BEGIN
  -- Validate required fields
  IF p_policy_name IS NULL OR trim(p_policy_name) = '' THEN
    RAISE EXCEPTION 'Policy name is required';
  END IF;
  
  IF p_life_area IS NULL OR trim(p_life_area) = '' THEN
    RAISE EXCEPTION 'Life area is required';
  END IF;

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
$$;

-- Create submit_policy_for_approval function
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
  v_org_settings record;
  v_approval_id uuid;
  v_user_id uuid := auth.uid();
BEGIN
  -- Get version details
  SELECT * INTO v_version
  FROM public.policy_versions
  WHERE id = p_policy_version_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Version not found');
  END IF;
  
  -- Get policy details
  SELECT * INTO v_policy
  FROM public.policies
  WHERE id = v_version.policy_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Policy not found');
  END IF;
  
  -- Validate version is draft
  IF v_version.status != 'draft' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only draft versions can be submitted for approval. Current status: ' || v_version.status);
  END IF;
  
  -- Get org settings for approval workflow
  SELECT * INTO v_org_settings
  FROM public.org_policy_settings
  WHERE organization_id = v_policy.organization_id;
  
  -- If approvals are disabled, return error suggesting direct publish
  IF v_org_settings IS NOT NULL AND v_org_settings.require_policy_approval IS FALSE THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Approval workflow is disabled for this organization. You can publish directly.',
      'can_publish_directly', true
    );
  END IF;
  
  -- Update version status to submitted
  UPDATE public.policy_versions
  SET 
    status = 'submitted',
    submitted_at = now(),
    submitted_by = v_user_id,
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
    v_version.policy_id,
    p_policy_version_id,
    v_user_id,
    COALESCE(v_org_settings.approver_role, 'hr_manager'),
    'pending',
    p_note
  )
  RETURNING id INTO v_approval_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'approval_id', v_approval_id,
    'version_id', p_policy_version_id,
    'status', 'submitted'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Create approve_policy_version function
CREATE OR REPLACE FUNCTION public.approve_policy_version(
  p_approval_id uuid,
  p_comment text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_approval record;
  v_user_id uuid := auth.uid();
BEGIN
  -- Get approval record
  SELECT * INTO v_approval
  FROM public.policy_approvals
  WHERE id = p_approval_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Approval request not found');
  END IF;
  
  IF v_approval.status != 'pending' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Approval has already been processed. Status: ' || v_approval.status);
  END IF;
  
  -- Update approval record
  UPDATE public.policy_approvals
  SET 
    status = 'approved',
    approver_user_id = v_user_id,
    comment = p_comment,
    updated_at = now()
  WHERE id = p_approval_id;
  
  -- Update version status to approved
  UPDATE public.policy_versions
  SET 
    status = 'approved',
    approved_at = now(),
    approved_by = v_user_id,
    last_updated_at = now()
  WHERE id = v_approval.policy_version_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'approval_id', p_approval_id,
    'version_id', v_approval.policy_version_id,
    'status', 'approved'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Create reject_policy_version function
CREATE OR REPLACE FUNCTION public.reject_policy_version(
  p_approval_id uuid,
  p_reason text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_approval record;
  v_user_id uuid := auth.uid();
BEGIN
  IF p_reason IS NULL OR trim(p_reason) = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Rejection reason is required');
  END IF;
  
  -- Get approval record
  SELECT * INTO v_approval
  FROM public.policy_approvals
  WHERE id = p_approval_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Approval request not found');
  END IF;
  
  IF v_approval.status != 'pending' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Approval has already been processed. Status: ' || v_approval.status);
  END IF;
  
  -- Update approval record
  UPDATE public.policy_approvals
  SET 
    status = 'rejected',
    approver_user_id = v_user_id,
    comment = p_reason,
    updated_at = now()
  WHERE id = p_approval_id;
  
  -- Update version status to rejected
  UPDATE public.policy_versions
  SET 
    status = 'rejected',
    rejected_at = now(),
    rejected_by = v_user_id,
    rejection_reason = p_reason,
    last_updated_at = now()
  WHERE id = v_approval.policy_version_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'approval_id', p_approval_id,
    'version_id', v_approval.policy_version_id,
    'status', 'rejected'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Update publish_policy_version to check approval status when required
DROP FUNCTION IF EXISTS public.publish_policy_version(uuid, uuid, date);

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
  v_policy record;
  v_org_settings record;
BEGIN
  -- Get policy
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
  
  -- Get org settings
  SELECT * INTO v_org_settings
  FROM public.org_policy_settings
  WHERE organization_id = v_policy.organization_id;
  
  -- Check if approvals are required (only if org_settings exists and explicitly set)
  IF v_org_settings IS NOT NULL AND v_org_settings.require_policy_approval IS TRUE THEN
    -- If approvals are enabled and version is still draft, block
    IF v_version_record.status = 'draft' THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Approval workflow is enabled. Please submit for approval first.',
        'requires_approval', true
      );
    END IF;
    
    -- Version must be approved to publish
    IF v_version_record.status NOT IN ('approved') THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Version must be approved before publishing. Current status: ' || v_version_record.status,
        'requires_approval', true
      );
    END IF;
  ELSE
    -- If approvals disabled (or no settings), only drafts and approved can be published
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

-- Create archive_or_delete_policy function
CREATE OR REPLACE FUNCTION public.archive_or_delete_policy(
  p_policy_id uuid,
  p_action text,
  p_reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_policy record;
  v_has_published_version boolean;
  v_has_linked_claims boolean;
  v_user_id uuid := auth.uid();
BEGIN
  IF p_action NOT IN ('archive', 'delete') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Action must be "archive" or "delete"');
  END IF;
  
  -- Get policy
  SELECT * INTO v_policy
  FROM public.policies
  WHERE id = p_policy_id AND is_deleted = false;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Policy not found');
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
  ) INTO v_has_linked_claims;
  
  -- If delete requested but has published or linked claims, force archive
  IF p_action = 'delete' AND (v_has_published_version OR v_has_linked_claims) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Cannot delete policy with published versions or linked claims. Use archive instead.',
      'has_published_version', v_has_published_version,
      'has_linked_claims', v_has_linked_claims,
      'can_archive', true
    );
  END IF;
  
  IF p_action = 'archive' THEN
    UPDATE public.policies
    SET 
      is_archived = true,
      is_active = false,
      status = 'archived',
      updated_at = now()
    WHERE id = p_policy_id;
    
    -- Archive all versions
    UPDATE public.policy_versions
    SET status = 'archived', last_updated_at = now()
    WHERE policy_id = p_policy_id AND status != 'archived';
    
    RETURN jsonb_build_object(
      'success', true,
      'action', 'archived',
      'policy_id', p_policy_id
    );
  ELSE
    -- Soft delete
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
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Create revert_to_draft function for rejected policies
CREATE OR REPLACE FUNCTION public.revert_policy_to_draft(
  p_policy_version_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_version record;
BEGIN
  SELECT * INTO v_version
  FROM public.policy_versions
  WHERE id = p_policy_version_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Version not found');
  END IF;
  
  IF v_version.status != 'rejected' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only rejected versions can be reverted to draft');
  END IF;
  
  UPDATE public.policy_versions
  SET 
    status = 'draft',
    rejected_at = NULL,
    rejected_by = NULL,
    rejection_reason = NULL,
    submitted_at = NULL,
    submitted_by = NULL,
    last_updated_at = now()
  WHERE id = p_policy_version_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'version_id', p_policy_version_id,
    'status', 'draft'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.create_policy_with_version TO authenticated;
GRANT EXECUTE ON FUNCTION public.publish_policy_version TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_policy_for_approval TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_policy_version TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_policy_version TO authenticated;
GRANT EXECUTE ON FUNCTION public.archive_or_delete_policy TO authenticated;
GRANT EXECUTE ON FUNCTION public.revert_policy_to_draft TO authenticated;