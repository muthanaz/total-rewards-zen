-- ================================================
-- COMPREHENSIVE SECURITY MIGRATION
-- Protecting sensitive employee PII and implementing privacy controls
-- ================================================

-- 1. CREATE SENSITIVE EMPLOYEE DATA TABLE (Admin-only access for highly sensitive PII)
CREATE TABLE public.sensitive_employee_data (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    passport_number_encrypted TEXT,
    emirates_id_encrypted TEXT,
    monthly_salary_encrypted TEXT,
    blood_type TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on sensitive_employee_data
ALTER TABLE public.sensitive_employee_data ENABLE ROW LEVEL SECURITY;

-- Only the user or admin can access their sensitive data
CREATE POLICY "Users can view own sensitive data" 
ON public.sensitive_employee_data 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own sensitive data" 
ON public.sensitive_employee_data 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sensitive data" 
ON public.sensitive_employee_data 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all sensitive data" 
ON public.sensitive_employee_data 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- 2. CREATE AUDIT LOGS TABLE for tracking sensitive operations
CREATE TABLE public.audit_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs, users can insert their own
CREATE POLICY "Admins can view all audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert audit logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 3. CREATE SESSION TRACKING TABLE for security monitoring
CREATE TABLE public.user_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    session_token_hash TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    device_info JSONB,
    last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_sessions
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view/manage their own sessions
CREATE POLICY "Users can view own sessions" 
ON public.user_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" 
ON public.user_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" 
ON public.user_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" 
ON public.user_sessions 
FOR DELETE 
USING (auth.uid() = user_id);

-- 4. CREATE DATA ACCESS REQUESTS TABLE (for GDPR-style compliance)
CREATE TABLE public.data_access_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    request_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    processed_by UUID,
    processed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on data_access_requests
ALTER TABLE public.data_access_requests ENABLE ROW LEVEL SECURITY;

-- Users can view/create their own requests
CREATE POLICY "Users can view own data requests" 
ON public.data_access_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own data requests" 
ON public.data_access_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admins can view and process all requests
CREATE POLICY "Admins can view all data requests" 
ON public.data_access_requests 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update data requests" 
ON public.data_access_requests 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

-- 5. CREATE AGGREGATED VIEWS FOR EMPLOYER ACCESS (Privacy-preserving)
-- Function to get anonymized benefit utilization stats for employers
CREATE OR REPLACE FUNCTION public.get_org_benefit_stats(org_id UUID)
RETURNS TABLE (
    benefit_name TEXT,
    total_entitlements BIGINT,
    total_utilized NUMERIC,
    avg_utilization_percent NUMERIC
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        b.name as benefit_name,
        COUNT(be.id) as total_entitlements,
        SUM(COALESCE(be.utilized_amount, 0)) as total_utilized,
        ROUND(AVG(CASE WHEN be.annual_allowance > 0 THEN (COALESCE(be.utilized_amount, 0) / be.annual_allowance * 100) ELSE 0 END), 2) as avg_utilization_percent
    FROM benefit_entitlements be
    JOIN benefits b ON b.id = be.benefit_id
    JOIN profiles p ON p.user_id = be.user_id
    WHERE p.organization_id = org_id
    GROUP BY b.name
$$;

-- Function to get anonymized leave stats for employers
CREATE OR REPLACE FUNCTION public.get_org_leave_stats(org_id UUID)
RETURNS TABLE (
    leave_type TEXT,
    total_employees BIGINT,
    avg_used_days NUMERIC,
    avg_remaining_days NUMERIC
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        lb.leave_type,
        COUNT(DISTINCT lb.user_id) as total_employees,
        ROUND(AVG(COALESCE(lb.used_days, 0)), 1) as avg_used_days,
        ROUND(AVG(lb.total_days - COALESCE(lb.used_days, 0)), 1) as avg_remaining_days
    FROM leave_balances lb
    JOIN profiles p ON p.user_id = lb.user_id
    WHERE p.organization_id = org_id
    GROUP BY lb.leave_type
$$;

-- Function to get anonymized satisfaction stats
CREATE OR REPLACE FUNCTION public.get_org_satisfaction_stats(org_id UUID)
RETURNS TABLE (
    category TEXT,
    avg_rating NUMERIC,
    total_responses BIGINT,
    period_month INTEGER,
    period_year INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        esr.category,
        ROUND(AVG(esr.rating), 2) as avg_rating,
        COUNT(esr.id) as total_responses,
        esr.period_month,
        esr.period_year
    FROM employee_satisfaction_ratings esr
    JOIN profiles p ON p.user_id = esr.user_id
    WHERE p.organization_id = org_id
    GROUP BY esr.category, esr.period_month, esr.period_year
    HAVING COUNT(esr.id) >= 5
$$;

-- 6. Create employee directory function with limited columns
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
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        p.user_id,
        p.first_name,
        p.last_name,
        p.email,
        p.department,
        p.position,
        p.work_location
    FROM profiles p
    WHERE p.organization_id = org_id
$$;

-- 7. ADD INDEXES FOR SECURITY TABLES
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_is_active ON public.user_sessions(is_active);
CREATE INDEX idx_user_sessions_expires_at ON public.user_sessions(expires_at);
CREATE INDEX idx_sensitive_employee_data_user_id ON public.sensitive_employee_data(user_id);

-- 8. CREATE FUNCTION TO LOG AUDIT EVENTS
CREATE OR REPLACE FUNCTION public.log_audit_event(
    p_user_id UUID,
    p_action TEXT,
    p_resource_type TEXT,
    p_resource_id TEXT DEFAULT NULL,
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
    audit_id UUID;
BEGIN
    INSERT INTO public.audit_logs (user_id, action, resource_type, resource_id, details, ip_address, user_agent)
    VALUES (p_user_id, p_action, p_resource_type, p_resource_id, p_details, p_ip_address, p_user_agent)
    RETURNING id INTO audit_id;
    
    RETURN audit_id;
END;
$$;

-- 9. CREATE TRIGGER TO AUTO-UPDATE timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_sensitive_employee_data_updated_at
    BEFORE UPDATE ON public.sensitive_employee_data
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 10. ENABLE REALTIME FOR AUDIT LOGS (for admin monitoring)
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;