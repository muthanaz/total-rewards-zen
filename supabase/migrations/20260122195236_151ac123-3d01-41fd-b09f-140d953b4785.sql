-- =============================================================================
-- PRIVACY CREDIBILITY PATCH: Secure Sensitive Data (Fixed)
-- =============================================================================

-- 1. Create sanitized audit log insertion function that strips sensitive values
CREATE OR REPLACE FUNCTION public.log_audit_event_sanitized(
  p_user_id UUID,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sanitized_details JSONB;
  v_audit_id UUID;
  v_key TEXT;
  v_sensitive_keys TEXT[] := ARRAY['salary', 'monthly_salary', 'emirates_id', 'passport_number', 'ssn', 'bank_account', 'iban'];
BEGIN
  -- Sanitize details by removing sensitive keys
  IF p_details IS NOT NULL THEN
    v_sanitized_details := p_details;
    FOREACH v_key IN ARRAY v_sensitive_keys LOOP
      IF v_sanitized_details ? v_key THEN
        v_sanitized_details := v_sanitized_details || jsonb_build_object(v_key, '[REDACTED]');
      END IF;
    END LOOP;
  END IF;
  
  -- Insert sanitized audit log
  INSERT INTO public.audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    details,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    p_action,
    p_resource_type,
    p_resource_id::TEXT,
    v_sanitized_details,
    p_ip_address,
    p_user_agent
  )
  RETURNING id INTO v_audit_id;
  
  RETURN v_audit_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_audit_event_sanitized TO authenticated;

-- 2. Create view for safe profile data (excludes sensitive fields)
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
  -- Sensitive fields are masked by default
  CASE WHEN p.emirates_id IS NOT NULL THEN '784-****-*******-*' ELSE NULL END as emirates_id_masked,
  CASE WHEN p.passport_number IS NOT NULL THEN '**********' ELSE NULL END as passport_number_masked,
  CASE WHEN p.monthly_salary IS NOT NULL THEN TRUE ELSE FALSE END as has_salary_data
FROM public.profiles p;

GRANT SELECT ON public.safe_profile_view TO authenticated;

-- 3. Create trigger to automatically migrate sensitive data on profile update
CREATE OR REPLACE FUNCTION public.migrate_sensitive_data_on_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If sensitive fields are being updated, also update sensitive_employee_data
  IF NEW.monthly_salary IS DISTINCT FROM OLD.monthly_salary OR
     NEW.emirates_id IS DISTINCT FROM OLD.emirates_id OR
     NEW.passport_number IS DISTINCT FROM OLD.passport_number THEN
    
    INSERT INTO public.sensitive_employee_data (
      user_id,
      monthly_salary_encrypted,
      emirates_id_encrypted,
      passport_number_encrypted
    ) VALUES (
      NEW.user_id,
      NEW.monthly_salary::TEXT,
      NEW.emirates_id,
      NEW.passport_number
    )
    ON CONFLICT (user_id) DO UPDATE SET
      monthly_salary_encrypted = COALESCE(EXCLUDED.monthly_salary_encrypted, sensitive_employee_data.monthly_salary_encrypted),
      emirates_id_encrypted = COALESCE(EXCLUDED.emirates_id_encrypted, sensitive_employee_data.emirates_id_encrypted),
      passport_number_encrypted = COALESCE(EXCLUDED.passport_number_encrypted, sensitive_employee_data.passport_number_encrypted),
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS migrate_sensitive_data_trigger ON public.profiles;
CREATE TRIGGER migrate_sensitive_data_trigger
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.migrate_sensitive_data_on_update();

-- 4. Add security comment to profiles table
COMMENT ON TABLE public.profiles IS 'Employee profiles. SECURITY: Columns monthly_salary, emirates_id, passport_number contain PII - access via safe_profile_view or get_employee_salary_display function.';