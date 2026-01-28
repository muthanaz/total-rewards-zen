-- ============================================================================
-- CLAIM STATE MACHINE + SETTLEMENT READINESS MIGRATION
-- ============================================================================

-- 1. Add 'ready_for_payment' to request_status enum (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'ready_for_payment' AND enumtypid = 'request_status'::regtype) THEN
    ALTER TYPE request_status ADD VALUE 'ready_for_payment' AFTER 'approved';
  END IF;
END$$;

-- 2. Add settlement-readiness and payable amount columns to requests
ALTER TABLE public.requests
ADD COLUMN IF NOT EXISTS eligible_amount_aed NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS employee_copay_aed NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS remaining_entitlement_aed NUMERIC DEFAULT NULL,
ADD COLUMN IF NOT EXISTS payable_amount_aed NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS settlement_method TEXT DEFAULT 'payroll' CHECK (settlement_method IN ('payroll', 'bank_transfer', 'cash')),
ADD COLUMN IF NOT EXISTS bank_routing_json JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS settlement_batch_id UUID DEFAULT NULL,
ADD COLUMN IF NOT EXISTS settlement_ready_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS settlement_readiness_json JSONB DEFAULT NULL;

-- 3. Add HR action reason tracking columns to requests
ALTER TABLE public.requests
ADD COLUMN IF NOT EXISTS action_reason_code TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS action_reason_text TEXT DEFAULT NULL;

-- 4. Add HR action reason tracking columns to request_events for full audit
ALTER TABLE public.request_events
ADD COLUMN IF NOT EXISTS action_reason_code TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS action_reason_text TEXT DEFAULT NULL;

-- 5. Create claim_status_transitions table for valid transitions (data-driven state machine)
CREATE TABLE IF NOT EXISTS public.claim_status_transitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_status TEXT NOT NULL,
  to_status TEXT NOT NULL,
  requires_role TEXT DEFAULT NULL,
  requires_reason BOOLEAN DEFAULT false,
  min_reason_length INTEGER DEFAULT 0,
  auto_transition BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(from_status, to_status)
);

-- Insert canonical transitions
INSERT INTO public.claim_status_transitions (from_status, to_status, requires_role, requires_reason, min_reason_length, auto_transition, description)
VALUES
  ('draft', 'submitted', NULL, false, 0, false, 'Employee submits claim'),
  ('submitted', 'in_review', 'hr_ops', false, 0, true, 'Auto-transition when HR picks up'),
  ('in_review', 'info_requested', 'hr_ops', true, 20, false, 'HR requests additional info/docs'),
  ('info_requested', 'pending_employee', NULL, false, 0, true, 'Claim waiting on employee'),
  ('pending_employee', 'in_review', NULL, false, 0, false, 'Employee responds with info'),
  ('in_review', 'approved', 'hr_ops', true, 20, false, 'HR approves claim'),
  ('in_review', 'rejected', 'hr_ops', true, 20, false, 'HR rejects claim'),
  ('approved', 'ready_for_payment', NULL, false, 0, false, 'Settlement readiness checks pass'),
  ('ready_for_payment', 'paid', 'finance', false, 0, false, 'Settlement batch paid'),
  ('paid', 'closed', NULL, false, 0, true, 'Auto-close after reconciliation'),
  ('pending', 'in_review', 'hr_ops', false, 0, true, 'Legacy: pending to in_review'),
  ('pending', 'submitted', NULL, false, 0, true, 'Legacy: pending treated as submitted'),
  ('submitted', 'escalated', 'hr_ops', true, 20, false, 'Escalate to manager'),
  ('in_review', 'escalated', 'hr_ops', true, 20, false, 'Escalate to manager'),
  ('escalated', 'approved', 'executive', true, 20, false, 'Manager approves escalated claim'),
  ('escalated', 'rejected', 'executive', true, 20, false, 'Manager rejects escalated claim')
ON CONFLICT (from_status, to_status) DO NOTHING;

-- Enable RLS on claim_status_transitions
ALTER TABLE public.claim_status_transitions ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read transitions (reference data)
CREATE POLICY "Anyone can read status transitions"
ON public.claim_status_transitions
FOR SELECT
TO authenticated
USING (true);

-- 6. Create validate_claim_status_transition function
CREATE OR REPLACE FUNCTION public.validate_claim_status_transition(
  p_request_id UUID,
  p_from_status TEXT,
  p_to_status TEXT,
  p_action_reason_code TEXT DEFAULT NULL,
  p_action_reason_text TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_transition RECORD;
  v_request RECORD;
  v_errors TEXT[] := ARRAY[]::TEXT[];
  v_blocking_reasons TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Get transition rules
  SELECT * INTO v_transition
  FROM public.claim_status_transitions
  WHERE from_status = p_from_status AND to_status = p_to_status;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', format('This claim cannot move from %s to %s. Invalid transition.', p_from_status, p_to_status),
      'blocking_reason', 'invalid_transition',
      'fix', 'Check the allowed status transitions for this claim state.'
    );
  END IF;
  
  -- Check reason requirements
  IF v_transition.requires_reason THEN
    IF p_action_reason_code IS NULL OR trim(p_action_reason_code) = '' THEN
      v_errors := array_append(v_errors, 'Action reason code is required');
      v_blocking_reasons := array_append(v_blocking_reasons, 'missing_reason_code');
    END IF;
    
    IF p_action_reason_text IS NULL OR length(trim(p_action_reason_text)) < v_transition.min_reason_length THEN
      v_errors := array_append(v_errors, format('Reason text must be at least %s characters', v_transition.min_reason_length));
      v_blocking_reasons := array_append(v_blocking_reasons, 'reason_too_short');
    END IF;
  END IF;
  
  -- For approved -> ready_for_payment, check settlement readiness
  IF p_from_status = 'approved' AND p_to_status = 'ready_for_payment' THEN
    SELECT * INTO v_request FROM public.requests WHERE id = p_request_id;
    
    IF v_request.payable_amount_aed IS NULL OR v_request.payable_amount_aed <= 0 THEN
      v_errors := array_append(v_errors, 'Payable amount must be computed and > 0');
      v_blocking_reasons := array_append(v_blocking_reasons, 'no_payable_amount');
    END IF;
    
    -- Check required docs are verified
    IF EXISTS (
      SELECT 1 FROM public.request_documents rd
      WHERE rd.request_id = p_request_id
      AND rd.is_required = true
      AND rd.status != 'verified'
    ) THEN
      v_errors := array_append(v_errors, 'All required documents must be verified');
      v_blocking_reasons := array_append(v_blocking_reasons, 'unverified_docs');
    END IF;
    
    -- Check settlement method
    IF v_request.settlement_method IS NULL THEN
      v_errors := array_append(v_errors, 'Settlement method must be specified');
      v_blocking_reasons := array_append(v_blocking_reasons, 'no_settlement_method');
    END IF;
    
    -- If bank_transfer, check routing info
    IF v_request.settlement_method = 'bank_transfer' AND v_request.bank_routing_json IS NULL THEN
      v_errors := array_append(v_errors, 'Bank routing information required for bank transfers');
      v_blocking_reasons := array_append(v_blocking_reasons, 'no_bank_routing');
    END IF;
  END IF;
  
  IF array_length(v_errors, 1) > 0 THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', format('This claim cannot move to %s because: %s', p_to_status, array_to_string(v_errors, '; ')),
      'blocking_reasons', v_blocking_reasons,
      'fix', 'Address the listed issues before transitioning.'
    );
  END IF;
  
  RETURN jsonb_build_object(
    'valid', true,
    'transition', jsonb_build_object(
      'from', p_from_status,
      'to', p_to_status,
      'requires_reason', v_transition.requires_reason,
      'auto_transition', v_transition.auto_transition
    )
  );
END;
$$;

-- 7. Create compute_payable_amount function
CREATE OR REPLACE FUNCTION public.compute_payable_amount(
  p_request_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request RECORD;
  v_eligible NUMERIC;
  v_remaining NUMERIC;
  v_copay NUMERIC;
  v_payable NUMERIC;
BEGIN
  SELECT * INTO v_request FROM public.requests WHERE id = p_request_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Request not found');
  END IF;
  
  -- Get values (defaults if null)
  v_eligible := COALESCE(v_request.eligible_amount_aed, COALESCE(v_request.approved_amount, v_request.amount, 0));
  v_remaining := v_request.remaining_entitlement_aed; -- May be null if not calculated
  v_copay := COALESCE(v_request.employee_copay_aed, 0);
  
  -- Formula: payable = max(0, min(eligible, remaining) - copay)
  IF v_remaining IS NOT NULL THEN
    v_payable := GREATEST(0, LEAST(v_eligible, v_remaining) - v_copay);
  ELSE
    -- If remaining entitlement not calculated, use eligible - copay
    v_payable := GREATEST(0, v_eligible - v_copay);
  END IF;
  
  -- Update request
  UPDATE public.requests
  SET 
    payable_amount_aed = v_payable,
    eligible_amount_aed = v_eligible
  WHERE id = p_request_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'payable_amount_aed', v_payable,
    'eligible_amount_aed', v_eligible,
    'remaining_entitlement_aed', v_remaining,
    'employee_copay_aed', v_copay,
    'formula', 'max(0, min(eligible, remaining) - copay)'
  );
END;
$$;

-- 8. Create check_settlement_readiness function
CREATE OR REPLACE FUNCTION public.check_settlement_readiness(
  p_request_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request RECORD;
  v_checks JSONB := '[]'::JSONB;
  v_all_pass BOOLEAN := true;
  v_unverified_docs INTEGER;
BEGIN
  SELECT * INTO v_request FROM public.requests WHERE id = p_request_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ready', false, 'error', 'Request not found');
  END IF;
  
  -- Check 1: Status must be approved
  IF v_request.status = 'approved' THEN
    v_checks := v_checks || jsonb_build_object('check', 'status_approved', 'pass', true, 'value', v_request.status);
  ELSE
    v_checks := v_checks || jsonb_build_object('check', 'status_approved', 'pass', false, 'value', v_request.status, 'required', 'approved');
    v_all_pass := false;
  END IF;
  
  -- Check 2: All required docs verified
  SELECT COUNT(*) INTO v_unverified_docs
  FROM public.request_documents
  WHERE request_id = p_request_id
  AND is_required = true
  AND status != 'verified';
  
  IF v_unverified_docs = 0 THEN
    v_checks := v_checks || jsonb_build_object('check', 'docs_verified', 'pass', true, 'unverified_count', 0);
  ELSE
    v_checks := v_checks || jsonb_build_object('check', 'docs_verified', 'pass', false, 'unverified_count', v_unverified_docs);
    v_all_pass := false;
  END IF;
  
  -- Check 3: Payable amount > 0
  IF COALESCE(v_request.payable_amount_aed, 0) > 0 THEN
    v_checks := v_checks || jsonb_build_object('check', 'payable_positive', 'pass', true, 'value', v_request.payable_amount_aed);
  ELSE
    v_checks := v_checks || jsonb_build_object('check', 'payable_positive', 'pass', false, 'value', COALESCE(v_request.payable_amount_aed, 0));
    v_all_pass := false;
  END IF;
  
  -- Check 4: Settlement method exists
  IF v_request.settlement_method IS NOT NULL THEN
    v_checks := v_checks || jsonb_build_object('check', 'settlement_method', 'pass', true, 'value', v_request.settlement_method);
  ELSE
    v_checks := v_checks || jsonb_build_object('check', 'settlement_method', 'pass', false, 'value', null);
    v_all_pass := false;
  END IF;
  
  -- Check 5: If bank_transfer, bank routing required
  IF v_request.settlement_method = 'bank_transfer' THEN
    IF v_request.bank_routing_json IS NOT NULL THEN
      v_checks := v_checks || jsonb_build_object('check', 'bank_routing', 'pass', true, 'method', 'bank_transfer');
    ELSE
      v_checks := v_checks || jsonb_build_object('check', 'bank_routing', 'pass', false, 'method', 'bank_transfer', 'required', true);
      v_all_pass := false;
    END IF;
  END IF;
  
  -- Update request with readiness info
  UPDATE public.requests
  SET settlement_readiness_json = jsonb_build_object(
    'ready', v_all_pass,
    'checked_at', now(),
    'checks', v_checks
  )
  WHERE id = p_request_id;
  
  RETURN jsonb_build_object(
    'ready', v_all_pass,
    'checks', v_checks,
    'request_id', p_request_id
  );
END;
$$;

-- 9. Create execute_claim_transition function (the main orchestrator)
CREATE OR REPLACE FUNCTION public.execute_claim_transition(
  p_request_id UUID,
  p_to_status TEXT,
  p_action_reason_code TEXT DEFAULT NULL,
  p_action_reason_text TEXT DEFAULT NULL,
  p_actor_user_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request RECORD;
  v_from_status TEXT;
  v_validation JSONB;
  v_actor_id UUID;
BEGIN
  v_actor_id := COALESCE(p_actor_user_id, auth.uid());
  
  -- Get current request
  SELECT * INTO v_request FROM public.requests WHERE id = p_request_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Request not found');
  END IF;
  
  v_from_status := COALESCE(v_request.status, 'draft');
  
  -- Validate transition
  v_validation := validate_claim_status_transition(
    p_request_id,
    v_from_status,
    p_to_status,
    p_action_reason_code,
    p_action_reason_text
  );
  
  IF NOT (v_validation->>'valid')::BOOLEAN THEN
    RETURN v_validation;
  END IF;
  
  -- Execute transition
  UPDATE public.requests
  SET 
    status = p_to_status::request_status,
    last_status_change_at = now(),
    action_reason_code = p_action_reason_code,
    action_reason_text = p_action_reason_text,
    reviewed_at = CASE WHEN p_to_status IN ('approved', 'rejected') THEN now() ELSE reviewed_at END,
    reviewed_by = CASE WHEN p_to_status IN ('approved', 'rejected') THEN v_actor_id ELSE reviewed_by END,
    settlement_ready_at = CASE WHEN p_to_status = 'ready_for_payment' THEN now() ELSE settlement_ready_at END,
    paid_at = CASE WHEN p_to_status = 'paid' THEN now() ELSE paid_at END
  WHERE id = p_request_id;
  
  -- Insert audit event
  INSERT INTO public.request_events (
    request_id,
    actor_user_id,
    from_status,
    to_status,
    action,
    action_reason_code,
    action_reason_text,
    visibility,
    meta
  ) VALUES (
    p_request_id,
    v_actor_id,
    v_from_status,
    p_to_status,
    'status_changed',
    p_action_reason_code,
    p_action_reason_text,
    CASE 
      WHEN p_to_status IN ('approved', 'rejected', 'paid') THEN 'employee_visible'
      ELSE 'internal'
    END,
    jsonb_build_object(
      'transition_validated', true,
      'executed_at', now()
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'request_id', p_request_id,
    'from_status', v_from_status,
    'to_status', p_to_status,
    'transitioned_at', now()
  );
END;
$$;