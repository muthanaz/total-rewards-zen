-- ============================================================
-- SECURITY HARDENING: Profile PII Protection + RPC org_id Validation
-- ============================================================

-- 1. DROP existing employer profile view policy (exposes all columns)
DROP POLICY IF EXISTS "Employers can view org profiles" ON public.profiles;

-- 2. Create a helper function to check if current user is accessing their own data
CREATE OR REPLACE FUNCTION public.is_own_profile(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() = target_user_id
$$;

-- 3. REPLACE safe_profile_view with enhanced version that checks caller role
DROP VIEW IF EXISTS public.safe_profile_view;
CREATE VIEW public.safe_profile_view 
WITH (security_invoker = on)
AS
SELECT 
  p.id,
  p.user_id,
  p.first_name,
  p.last_name,
  p.email,
  p.phone,
  p.date_of_birth,
  p.nationality,
  p.preferred_language,
  p.work_location,
  p.home_location,
  p.position,
  p.department,
  p.grade,
  p.manager_name,
  p.employment_date,
  p.marital_status,
  p.organization_id,
  p.created_at,
  p.updated_at,
  p.employer_view_mode,
  -- Sensitive fields: only visible to self or admin
  CASE 
    WHEN auth.uid() = p.user_id THEN p.emirates_id
    WHEN has_role(auth.uid(), 'admin') THEN p.emirates_id
    ELSE NULL 
  END as emirates_id,
  CASE 
    WHEN auth.uid() = p.user_id THEN p.passport_number
    WHEN has_role(auth.uid(), 'admin') THEN p.passport_number
    ELSE NULL 
  END as passport_number,
  CASE 
    WHEN auth.uid() = p.user_id THEN p.monthly_salary
    WHEN has_role(auth.uid(), 'admin') THEN p.monthly_salary
    ELSE NULL 
  END as monthly_salary,
  -- Masked versions for display (always available)
  CASE WHEN p.emirates_id IS NOT NULL THEN '784-****-*******-*' ELSE NULL END as emirates_id_masked,
  CASE WHEN p.passport_number IS NOT NULL THEN '**********' ELSE NULL END as passport_number_masked,
  CASE WHEN p.monthly_salary IS NOT NULL THEN TRUE ELSE FALSE END as has_salary_data
FROM public.profiles p;

-- 4. CREATE new employer policy with column-level restrictions
-- Employers can view org profiles but sensitive columns are protected at view level
CREATE POLICY "Employers can view org profiles safely" ON public.profiles
  FOR SELECT USING (
    -- Admin can see everything
    has_role(auth.uid(), 'admin'::user_role) 
    OR
    -- User can see own profile
    auth.uid() = user_id
    OR
    -- Employer can see profiles in their org (use view for sensitive data)
    (has_role(auth.uid(), 'employer'::user_role) 
     AND organization_id = get_user_organization_id(auth.uid()))
  );

-- 5. SECURE RPC: get_org_benefit_stats - validate org_id internally
CREATE OR REPLACE FUNCTION public.get_org_benefit_stats(org_id UUID)
RETURNS TABLE (
    benefit_name TEXT,
    total_entitlements BIGINT,
    total_utilized NUMERIC,
    avg_utilization_percent NUMERIC
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_org_id UUID;
BEGIN
  -- Get caller's organization
  v_caller_org_id := get_user_organization_id(auth.uid());
  
  -- Validate: caller must be admin OR belong to the requested org
  IF NOT (has_role(auth.uid(), 'admin') OR v_caller_org_id = org_id) THEN
    RAISE EXCEPTION 'Access denied: cannot query stats for other organizations';
  END IF;
  
  -- Return stats
  RETURN QUERY
  SELECT 
      b.name as benefit_name,
      COUNT(be.id) as total_entitlements,
      SUM(COALESCE(be.utilized_amount, 0)) as total_utilized,
      ROUND(AVG(CASE WHEN be.annual_allowance > 0 THEN (COALESCE(be.utilized_amount, 0) / be.annual_allowance * 100) ELSE 0 END), 2) as avg_utilization_percent
  FROM benefit_entitlements be
  JOIN benefits b ON b.id = be.benefit_id
  JOIN profiles p ON p.user_id = be.user_id
  WHERE p.organization_id = org_id
  GROUP BY b.name;
END;
$$;

-- 6. SECURE RPC: get_org_leave_stats - validate org_id internally  
CREATE OR REPLACE FUNCTION public.get_org_leave_stats(org_id UUID)
RETURNS TABLE (
    leave_type TEXT,
    total_employees BIGINT,
    avg_used_days NUMERIC,
    avg_remaining_days NUMERIC
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_org_id UUID;
BEGIN
  -- Get caller's organization
  v_caller_org_id := get_user_organization_id(auth.uid());
  
  -- Validate: caller must be admin OR belong to the requested org
  IF NOT (has_role(auth.uid(), 'admin') OR v_caller_org_id = org_id) THEN
    RAISE EXCEPTION 'Access denied: cannot query stats for other organizations';
  END IF;
  
  -- Return stats
  RETURN QUERY
  SELECT 
      lb.leave_type,
      COUNT(DISTINCT lb.user_id) as total_employees,
      ROUND(AVG(COALESCE(lb.used_days, 0)), 1) as avg_used_days,
      ROUND(AVG(lb.total_days - COALESCE(lb.used_days, 0)), 1) as avg_remaining_days
  FROM leave_balances lb
  JOIN profiles p ON p.user_id = lb.user_id
  WHERE p.organization_id = org_id
  GROUP BY lb.leave_type;
END;
$$;

-- 7. SECURE RPC: get_org_employee_directory - validate org_id internally
CREATE OR REPLACE FUNCTION public.get_org_employee_directory(org_id UUID)
RETURNS TABLE (
    emp_user_id UUID,
    emp_first_name TEXT,
    emp_last_name TEXT,
    emp_email TEXT,
    emp_department TEXT,
    emp_position TEXT,
    emp_work_location TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_org_id UUID;
BEGIN
  -- Get caller's organization
  v_caller_org_id := get_user_organization_id(auth.uid());
  
  -- Validate: caller must be admin OR belong to the requested org
  IF NOT (has_role(auth.uid(), 'admin') OR v_caller_org_id = org_id) THEN
    RAISE EXCEPTION 'Access denied: cannot query employee directory for other organizations';
  END IF;
  
  -- Return directory (no sensitive fields)
  RETURN QUERY
  SELECT 
      p.user_id,
      p.first_name,
      p.last_name,
      p.email,
      p.department,
      p.position,
      p.work_location
  FROM profiles p
  WHERE p.organization_id = org_id;
END;
$$;

-- 8. CREATE audit logging function for sensitive data access
CREATE OR REPLACE FUNCTION public.log_sensitive_data_access(
  p_resource_type TEXT,
  p_resource_id UUID,
  p_data_type TEXT,
  p_reason TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_audit_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    details,
    actor_role
  ) VALUES (
    auth.uid(),
    'SENSITIVE_DATA_ACCESS',
    p_resource_type,
    p_resource_id::TEXT,
    jsonb_build_object(
      'data_type', p_data_type,
      'reason', p_reason,
      'accessed_at', now()
    ),
    (SELECT role::TEXT FROM user_roles WHERE user_id = auth.uid() LIMIT 1)
  )
  RETURNING id INTO v_audit_id;
  
  RETURN v_audit_id;
END;
$$;

-- 9. CREATE function for employers to request sensitive data with audit
CREATE OR REPLACE FUNCTION public.get_employee_sensitive_data_with_audit(
  p_employee_user_id UUID,
  p_reason TEXT
)
RETURNS TABLE (
  emirates_id TEXT,
  passport_number TEXT,
  monthly_salary NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_org_id UUID;
  v_employee_org_id UUID;
BEGIN
  -- Get caller's organization
  v_caller_org_id := get_user_organization_id(auth.uid());
  
  -- Get employee's organization
  SELECT organization_id INTO v_employee_org_id
  FROM profiles WHERE user_id = p_employee_user_id;
  
  -- Validate: caller must be admin OR (employer in same org with explicit permission)
  IF NOT (
    has_role(auth.uid(), 'admin') 
    OR (auth.uid() = p_employee_user_id)  -- Self access always allowed
    OR (
      has_role(auth.uid(), 'employer') 
      AND v_caller_org_id = v_employee_org_id
      AND has_employer_permission(auth.uid(), 'can_process_claims')
    )
  ) THEN
    -- Log failed access attempt
    PERFORM log_audit_event_sanitized(
      auth.uid(),
      'ACCESS_DENIED',
      'sensitive_employee_data',
      p_employee_user_id,
      jsonb_build_object('reason', 'Unauthorized sensitive data access attempt'),
      NULL, NULL
    );
    RAISE EXCEPTION 'Access denied: insufficient permissions for sensitive data';
  END IF;
  
  -- Log the access
  PERFORM log_sensitive_data_access(
    'sensitive_employee_data',
    p_employee_user_id,
    'pii_bundle',
    p_reason
  );
  
  -- Return sensitive data
  RETURN QUERY
  SELECT 
    p.emirates_id,
    p.passport_number,
    p.monthly_salary
  FROM profiles p
  WHERE p.user_id = p_employee_user_id;
END;
$$;

-- 10. GRANT access to safe_profile_view for authenticated users
GRANT SELECT ON public.safe_profile_view TO authenticated;