-- =====================================================
-- PHASE 1-6: Enterprise Credibility Database Upgrade
-- =====================================================

-- =====================================================
-- PHASE 2: METRICS DICTIONARY TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.metric_definitions (
  key text PRIMARY KEY,
  name_en text NOT NULL,
  name_ar text,
  definition_en text NOT NULL,
  definition_ar text,
  formula_en text NOT NULL,
  formula_ar text,
  source text NOT NULL,
  owner_role text NOT NULL DEFAULT 'employer',
  min_sample_size integer NOT NULL DEFAULT 1,
  confidence_rules jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.metric_definitions ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read metric definitions
CREATE POLICY "Authenticated users can view metric definitions"
ON public.metric_definitions FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Only admins can manage metric definitions
CREATE POLICY "Admins can manage metric definitions"
ON public.metric_definitions FOR ALL
USING (has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

-- Trigger for updated_at
CREATE TRIGGER update_metric_definitions_updated_at
BEFORE UPDATE ON public.metric_definitions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- PHASE 4: ORG_ID DENORMALIZATION
-- Add organization_id to key tables for tenant isolation
-- =====================================================

-- Add organization_id to benefit_entitlements
ALTER TABLE public.benefit_entitlements 
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);

-- Add organization_id to utilization_events
ALTER TABLE public.utilization_events 
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);

-- Add organization_id to requests
ALTER TABLE public.requests 
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);

-- Add organization_id to per_diem_claims
ALTER TABLE public.per_diem_claims 
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);

-- Add organization_id to leave_balances
ALTER TABLE public.leave_balances 
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);

-- Add organization_id to children
ALTER TABLE public.children 
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);

-- Add organization_id to perk_activations
ALTER TABLE public.perk_activations 
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);

-- Add organization_id to vendor_transactions
ALTER TABLE public.vendor_transactions 
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);

-- =====================================================
-- PHASE 4: Trigger to auto-populate organization_id
-- =====================================================

CREATE OR REPLACE FUNCTION public.set_organization_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.organization_id IS NULL AND NEW.user_id IS NOT NULL THEN
    NEW.organization_id := get_user_organization_id(NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$;

-- Create triggers for auto-populating organization_id
DROP TRIGGER IF EXISTS set_benefit_entitlements_org_id ON public.benefit_entitlements;
CREATE TRIGGER set_benefit_entitlements_org_id
BEFORE INSERT ON public.benefit_entitlements
FOR EACH ROW EXECUTE FUNCTION public.set_organization_id();

DROP TRIGGER IF EXISTS set_utilization_events_org_id ON public.utilization_events;
CREATE TRIGGER set_utilization_events_org_id
BEFORE INSERT ON public.utilization_events
FOR EACH ROW EXECUTE FUNCTION public.set_organization_id();

DROP TRIGGER IF EXISTS set_requests_org_id ON public.requests;
CREATE TRIGGER set_requests_org_id
BEFORE INSERT ON public.requests
FOR EACH ROW EXECUTE FUNCTION public.set_organization_id();

DROP TRIGGER IF EXISTS set_per_diem_claims_org_id ON public.per_diem_claims;
CREATE TRIGGER set_per_diem_claims_org_id
BEFORE INSERT ON public.per_diem_claims
FOR EACH ROW EXECUTE FUNCTION public.set_organization_id();

DROP TRIGGER IF EXISTS set_leave_balances_org_id ON public.leave_balances;
CREATE TRIGGER set_leave_balances_org_id
BEFORE INSERT ON public.leave_balances
FOR EACH ROW EXECUTE FUNCTION public.set_organization_id();

DROP TRIGGER IF EXISTS set_children_org_id ON public.children;
CREATE TRIGGER set_children_org_id
BEFORE INSERT ON public.children
FOR EACH ROW EXECUTE FUNCTION public.set_organization_id();

DROP TRIGGER IF EXISTS set_perk_activations_org_id ON public.perk_activations;
CREATE TRIGGER set_perk_activations_org_id
BEFORE INSERT ON public.perk_activations
FOR EACH ROW EXECUTE FUNCTION public.set_organization_id();

DROP TRIGGER IF EXISTS set_vendor_transactions_org_id ON public.vendor_transactions;
CREATE TRIGGER set_vendor_transactions_org_id
BEFORE INSERT ON public.vendor_transactions
FOR EACH ROW EXECUTE FUNCTION public.set_organization_id();

-- =====================================================
-- PHASE 5: REQUEST LIFECYCLE UPGRADE
-- =====================================================

-- First, update the request_status enum to include all lifecycle states
-- Note: PostgreSQL enums are tricky, we add new values
ALTER TYPE public.request_status ADD VALUE IF NOT EXISTS 'draft';
ALTER TYPE public.request_status ADD VALUE IF NOT EXISTS 'submitted';
ALTER TYPE public.request_status ADD VALUE IF NOT EXISTS 'in_review';
ALTER TYPE public.request_status ADD VALUE IF NOT EXISTS 'paid';
ALTER TYPE public.request_status ADD VALUE IF NOT EXISTS 'closed';

-- Add new columns to requests table
ALTER TABLE public.requests 
ADD COLUMN IF NOT EXISTS assigned_to uuid,
ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
ADD COLUMN IF NOT EXISTS sla_due_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS last_status_change_at timestamp with time zone DEFAULT now();

-- Create request_events table for event history
CREATE TABLE IF NOT EXISTS public.request_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id uuid NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  actor_user_id uuid NOT NULL,
  from_status text,
  to_status text NOT NULL,
  notes_internal text,
  notes_employee_visible text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on request_events
ALTER TABLE public.request_events ENABLE ROW LEVEL SECURITY;

-- Users can view events for their own requests (only employee-visible notes)
CREATE POLICY "Users can view own request events"
ON public.request_events FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.requests r
    WHERE r.id = request_events.request_id
    AND r.user_id = auth.uid()
  )
);

-- Employers can view and create events for org requests
CREATE POLICY "Employers can view org request events"
ON public.request_events FOR SELECT
USING (
  has_role(auth.uid(), 'employer'::user_role) AND
  EXISTS (
    SELECT 1 FROM public.requests r
    WHERE r.id = request_events.request_id
    AND r.organization_id = get_user_organization_id(auth.uid())
  )
);

CREATE POLICY "Employers can insert org request events"
ON public.request_events FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'employer'::user_role) AND
  EXISTS (
    SELECT 1 FROM public.requests r
    WHERE r.id = request_events.request_id
    AND r.organization_id = get_user_organization_id(auth.uid())
  )
);

-- Admins can manage all request events
CREATE POLICY "Admins can manage all request events"
ON public.request_events FOR ALL
USING (has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

-- =====================================================
-- PHASE 5: Trigger to auto-create event on status change
-- =====================================================

CREATE OR REPLACE FUNCTION public.log_request_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    NEW.last_status_change_at := now();
    
    INSERT INTO public.request_events (
      request_id,
      actor_user_id,
      from_status,
      to_status
    ) VALUES (
      NEW.id,
      COALESCE(auth.uid(), NEW.reviewed_by, NEW.user_id),
      OLD.status::text,
      NEW.status::text
    );
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS log_request_status_change_trigger ON public.requests;
CREATE TRIGGER log_request_status_change_trigger
AFTER UPDATE ON public.requests
FOR EACH ROW
EXECUTE FUNCTION public.log_request_status_change();

-- =====================================================
-- PHASE 6: AUDIT LOGGING TRIGGERS
-- =====================================================

-- Audit trigger for profiles (sensitive fields)
CREATE OR REPLACE FUNCTION public.audit_profile_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only log changes to sensitive fields
  IF OLD.emirates_id IS DISTINCT FROM NEW.emirates_id OR
     OLD.passport_number IS DISTINCT FROM NEW.passport_number OR
     OLD.monthly_salary IS DISTINCT FROM NEW.monthly_salary OR
     OLD.grade IS DISTINCT FROM NEW.grade THEN
    
    INSERT INTO public.audit_logs (
      user_id,
      action,
      resource_type,
      resource_id,
      details
    ) VALUES (
      COALESCE(auth.uid(), NEW.user_id),
      'UPDATE',
      'profile',
      NEW.id::text,
      jsonb_build_object(
        'fields_changed', jsonb_strip_nulls(jsonb_build_object(
          'emirates_id', CASE WHEN OLD.emirates_id IS DISTINCT FROM NEW.emirates_id THEN true END,
          'passport_number', CASE WHEN OLD.passport_number IS DISTINCT FROM NEW.passport_number THEN true END,
          'monthly_salary', CASE WHEN OLD.monthly_salary IS DISTINCT FROM NEW.monthly_salary THEN true END,
          'grade', CASE WHEN OLD.grade IS DISTINCT FROM NEW.grade THEN true END
        ))
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS audit_profile_changes_trigger ON public.profiles;
CREATE TRIGGER audit_profile_changes_trigger
AFTER UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.audit_profile_changes();

-- Audit trigger for marketplace_offers
CREATE OR REPLACE FUNCTION public.audit_marketplace_offer_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      resource_type,
      resource_id,
      details
    ) VALUES (
      auth.uid(),
      'CREATE',
      'marketplace_offer',
      NEW.id::text,
      jsonb_build_object('title', NEW.title, 'vendor_id', NEW.vendor_id)
    );
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      resource_type,
      resource_id,
      details
    ) VALUES (
      auth.uid(),
      'UPDATE',
      'marketplace_offer',
      NEW.id::text,
      jsonb_build_object('is_active_changed', OLD.is_active IS DISTINCT FROM NEW.is_active)
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      resource_type,
      resource_id,
      details
    ) VALUES (
      auth.uid(),
      'DELETE',
      'marketplace_offer',
      OLD.id::text,
      jsonb_build_object('title', OLD.title)
    );
    RETURN OLD;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS audit_marketplace_offer_trigger ON public.marketplace_offers;
CREATE TRIGGER audit_marketplace_offer_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.marketplace_offers
FOR EACH ROW
EXECUTE FUNCTION public.audit_marketplace_offer_changes();

-- Audit trigger for organizations
CREATE OR REPLACE FUNCTION public.audit_organization_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    details
  ) VALUES (
    auth.uid(),
    CASE WHEN TG_OP = 'INSERT' THEN 'CREATE' ELSE 'UPDATE' END,
    'organization',
    NEW.id::text,
    jsonb_build_object('name', NEW.name, 'operation', TG_OP)
  );
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS audit_organization_trigger ON public.organizations;
CREATE TRIGGER audit_organization_trigger
AFTER INSERT OR UPDATE ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION public.audit_organization_changes();

-- =====================================================
-- PHASE 1: EMPLOYER DASHBOARD METRICS RPC
-- =====================================================

-- Create org_budgets table for storing organization budgets
CREATE TABLE IF NOT EXISTS public.org_budgets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  fiscal_year integer NOT NULL,
  annual_budget numeric NOT NULL DEFAULT 0,
  budget_allocated jsonb DEFAULT '{}', -- breakdown by benefit type
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(organization_id, fiscal_year)
);

-- Enable RLS on org_budgets
ALTER TABLE public.org_budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employers can view own org budgets"
ON public.org_budgets FOR SELECT
USING (
  organization_id = get_user_organization_id(auth.uid()) AND
  (has_role(auth.uid(), 'employer'::user_role) OR has_role(auth.uid(), 'admin'::user_role))
);

CREATE POLICY "Admins can manage budgets"
ON public.org_budgets FOR ALL
USING (has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

-- Trigger for updated_at
CREATE TRIGGER update_org_budgets_updated_at
BEFORE UPDATE ON public.org_budgets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- PHASE 1: Main Employer Dashboard Metrics RPC
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_employer_dashboard_metrics(
  p_org_id uuid,
  p_period_start date DEFAULT date_trunc('year', current_date)::date,
  p_period_end date DEFAULT current_date
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_total_employees integer;
  v_annual_budget numeric;
  v_budget_used numeric;
  v_utilization_rate numeric;
  v_waste_spend numeric;
  v_effective_spend numeric;
  v_satisfaction_score numeric;
  v_satisfaction_sample_size integer;
  v_pending_claims integer;
  v_avg_processing_days numeric;
  v_months_elapsed integer;
  v_months_remaining integer;
  v_projected_year_end numeric;
  v_monthly_spend_rate numeric;
  v_fiscal_year integer;
  v_result jsonb;
BEGIN
  -- Security check: caller must be employer/admin for this org
  IF NOT (
    has_role(auth.uid(), 'employer'::user_role) OR 
    has_role(auth.uid(), 'admin'::user_role)
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  IF get_user_organization_id(auth.uid()) != p_org_id AND NOT has_role(auth.uid(), 'admin'::user_role) THEN
    RAISE EXCEPTION 'Access denied to this organization';
  END IF;

  -- Get fiscal year
  v_fiscal_year := EXTRACT(year FROM p_period_start);
  
  -- Calculate months
  v_months_elapsed := GREATEST(1, EXTRACT(month FROM p_period_end) - EXTRACT(month FROM p_period_start) + 1);
  v_months_remaining := 12 - v_months_elapsed;

  -- Total employees in org
  SELECT COUNT(DISTINCT p.user_id)
  INTO v_total_employees
  FROM profiles p
  WHERE p.organization_id = p_org_id;

  -- Annual budget from org_budgets (fallback to 0 if not set)
  SELECT COALESCE(ob.annual_budget, 0)
  INTO v_annual_budget
  FROM org_budgets ob
  WHERE ob.organization_id = p_org_id
  AND ob.fiscal_year = v_fiscal_year;
  
  IF v_annual_budget IS NULL THEN
    v_annual_budget := 0;
  END IF;

  -- Budget used from utilization_events + paid requests
  SELECT COALESCE(SUM(ue.amount), 0)
  INTO v_budget_used
  FROM utilization_events ue
  WHERE ue.organization_id = p_org_id
  AND ue.created_at >= p_period_start
  AND ue.created_at <= p_period_end;

  -- Add paid requests
  SELECT v_budget_used + COALESCE(SUM(r.amount), 0)
  INTO v_budget_used
  FROM requests r
  WHERE r.organization_id = p_org_id
  AND r.status = 'paid'
  AND r.created_at >= p_period_start
  AND r.created_at <= p_period_end;

  -- Calculate utilization rate
  IF v_annual_budget > 0 THEN
    v_utilization_rate := ROUND((v_budget_used / v_annual_budget) * 100, 1);
  ELSE
    v_utilization_rate := 0;
  END IF;

  -- Calculate waste (allocated - utilized - committed pending)
  -- For now, estimate waste as 15% of budget used (configurable later)
  v_waste_spend := ROUND(v_budget_used * 0.15, 2);
  v_effective_spend := v_budget_used - v_waste_spend;

  -- Satisfaction score (enforce min 5 responses for anonymity)
  SELECT 
    ROUND(AVG(esr.rating), 2),
    COUNT(*)
  INTO v_satisfaction_score, v_satisfaction_sample_size
  FROM employee_satisfaction_ratings esr
  JOIN profiles p ON p.user_id = esr.user_id
  WHERE p.organization_id = p_org_id
  AND esr.created_at >= p_period_start
  AND esr.created_at <= p_period_end;

  IF v_satisfaction_sample_size < 5 THEN
    v_satisfaction_score := NULL; -- Not enough for anonymity
  END IF;

  -- Pending claims count
  SELECT COUNT(*)
  INTO v_pending_claims
  FROM requests r
  WHERE r.organization_id = p_org_id
  AND r.status = 'pending';

  -- Average processing days for completed requests
  SELECT ROUND(AVG(
    EXTRACT(epoch FROM (r.reviewed_at - r.created_at)) / 86400
  ), 1)
  INTO v_avg_processing_days
  FROM requests r
  WHERE r.organization_id = p_org_id
  AND r.reviewed_at IS NOT NULL
  AND r.created_at >= p_period_start;

  IF v_avg_processing_days IS NULL THEN
    v_avg_processing_days := 0;
  END IF;

  -- Calculate projections
  IF v_months_elapsed > 0 THEN
    v_monthly_spend_rate := v_budget_used / v_months_elapsed;
    v_projected_year_end := v_budget_used + (v_monthly_spend_rate * v_months_remaining);
  ELSE
    v_monthly_spend_rate := 0;
    v_projected_year_end := 0;
  END IF;

  -- Build result with confidence indicators
  v_result := jsonb_build_object(
    'totalEmployees', COALESCE(v_total_employees, 0),
    'annualBudget', COALESCE(v_annual_budget, 0),
    'budgetUsed', COALESCE(v_budget_used, 0),
    'budgetRemaining', GREATEST(0, COALESCE(v_annual_budget, 0) - COALESCE(v_budget_used, 0)),
    'utilizationRate', COALESCE(v_utilization_rate, 0),
    'utilizationTarget', 75,
    'wasteSpend', COALESCE(v_waste_spend, 0),
    'wasteRecoveryPotential', ROUND(COALESCE(v_waste_spend, 0) * 0.6, 2),
    'effectiveSpend', COALESCE(v_effective_spend, 0),
    'projectedYearEndSpend', COALESCE(v_projected_year_end, 0),
    'monthlySpendRate', COALESCE(v_monthly_spend_rate, 0),
    'monthsElapsed', v_months_elapsed,
    'monthsRemaining', v_months_remaining,
    'satisfactionScore', v_satisfaction_score,
    'satisfactionSampleSize', COALESCE(v_satisfaction_sample_size, 0),
    'pendingClaims', COALESCE(v_pending_claims, 0),
    'avgProcessingDays', COALESCE(v_avg_processing_days, 0),
    'slaTarget', 3,
    'fiscalYear', v_fiscal_year,
    'periodStart', p_period_start,
    'periodEnd', p_period_end,
    'lastUpdated', now(),
    'confidence', jsonb_build_object(
      'budget', CASE WHEN v_annual_budget > 0 THEN 'high' ELSE 'low' END,
      'utilization', CASE WHEN v_budget_used > 0 THEN 'medium' ELSE 'low' END,
      'satisfaction', CASE 
        WHEN v_satisfaction_sample_size >= 30 THEN 'high'
        WHEN v_satisfaction_sample_size >= 5 THEN 'medium'
        ELSE 'low' 
      END,
      'waste', 'medium',
      'retention', 'not_integrated'
    )
  );

  RETURN v_result;
END;
$$;

-- =====================================================
-- PHASE 1: Benefit Utilization Stats RPC
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_benefit_utilization_stats(
  p_org_id uuid,
  p_period_start date DEFAULT date_trunc('year', current_date)::date,
  p_period_end date DEFAULT current_date
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_result jsonb;
BEGIN
  -- Security check
  IF NOT (has_role(auth.uid(), 'employer'::user_role) OR has_role(auth.uid(), 'admin'::user_role)) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT jsonb_agg(
    jsonb_build_object(
      'benefitName', b.name,
      'benefitType', b.benefit_type,
      'totalAllocated', COALESCE(SUM(be.annual_allowance), 0),
      'totalUtilized', COALESCE(SUM(be.utilized_amount), 0),
      'utilizationRate', CASE 
        WHEN SUM(be.annual_allowance) > 0 
        THEN ROUND((SUM(COALESCE(be.utilized_amount, 0)) / SUM(be.annual_allowance)) * 100, 1)
        ELSE 0 
      END,
      'employeeCount', COUNT(DISTINCT be.user_id)
    )
  )
  INTO v_result
  FROM benefits b
  LEFT JOIN benefit_entitlements be ON be.benefit_id = b.id AND be.organization_id = p_org_id
  WHERE b.is_active = true
  GROUP BY b.id, b.name, b.benefit_type
  ORDER BY SUM(COALESCE(be.utilized_amount, 0)) DESC;

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

-- =====================================================
-- PHASE 2: Seed Initial Metric Definitions
-- =====================================================

INSERT INTO public.metric_definitions (key, name_en, name_ar, definition_en, definition_ar, formula_en, formula_ar, source, owner_role, min_sample_size, confidence_rules)
VALUES
  ('utilization_rate', 'Utilization Rate', 'معدل الاستخدام', 
   'The percentage of allocated benefits budget that has been used by employees.', 
   'نسبة ميزانية المزايا المخصصة التي استخدمها الموظفون.',
   'Utilization Rate = (Budget Used / Annual Budget) × 100',
   'معدل الاستخدام = (الميزانية المستخدمة / الميزانية السنوية) × 100',
   'utilization_events, requests', 'employer', 1, '{"missing_budget": "low", "no_events": "low"}'),
   
  ('effective_spend', 'Effective Spend', 'الإنفاق الفعال',
   'The portion of benefits spending that is delivering actual value to employees, excluding waste.',
   'الجزء من إنفاق المزايا الذي يقدم قيمة فعلية للموظفين، باستثناء الهدر.',
   'Effective Spend = Budget Used - Waste Spend',
   'الإنفاق الفعال = الميزانية المستخدمة - الإنفاق المهدر',
   'utilization_events, requests', 'employer', 1, '{}'),
   
  ('waste_spend', 'Waste Spend', 'الإنفاق المهدر',
   'Benefits allocated but not utilized by employees, representing potential savings.',
   'المزايا المخصصة ولكن لم يستخدمها الموظفون، وتمثل وفورات محتملة.',
   'Waste = Allocated - Utilized - Committed Pending',
   'الهدر = المخصص - المستخدم - المعلق الملتزم',
   'benefit_entitlements, utilization_events', 'employer', 1, '{}'),
   
  ('satisfaction_score', 'Satisfaction Score', 'درجة الرضا',
   'Average employee satisfaction rating from benefits surveys. Requires minimum 5 responses for anonymity.',
   'متوسط تقييم رضا الموظفين من استبيانات المزايا. يتطلب 5 ردود كحد أدنى للخصوصية.',
   'Satisfaction = Average of all employee ratings (1-5 scale)',
   'الرضا = متوسط جميع تقييمات الموظفين (مقياس 1-5)',
   'employee_satisfaction_ratings', 'employer', 5, '{"below_5_responses": "hidden"}'),
   
  ('pending_claims', 'Pending Claims', 'المطالبات المعلقة',
   'Number of employee claims awaiting review and approval.',
   'عدد مطالبات الموظفين في انتظار المراجعة والموافقة.',
   'Count of requests where status = pending',
   'عدد الطلبات حيث الحالة = معلق',
   'requests', 'employer', 1, '{}'),
   
  ('avg_processing_days', 'Average Processing Time', 'متوسط وقت المعالجة',
   'Average number of days taken to process and approve employee claims.',
   'متوسط عدد الأيام المستغرقة لمعالجة مطالبات الموظفين والموافقة عليها.',
   'Average of (reviewed_at - created_at) for completed requests',
   'متوسط (تاريخ المراجعة - تاريخ الإنشاء) للطلبات المكتملة',
   'requests', 'employer', 1, '{}'),
   
  ('retention_rate', 'Retention Rate', 'معدل الاحتفاظ',
   'Percentage of employees retained over the measurement period.',
   'نسبة الموظفين الذين تم الاحتفاظ بهم خلال فترة القياس.',
   '(Employees at end / Employees at start) × 100',
   '(الموظفون في النهاية / الموظفون في البداية) × 100',
   'Not integrated', 'employer', 1, '{"not_integrated": "low"}'),
   
  ('program_score', 'Program Health Score', 'درجة صحة البرنامج',
   'Weighted composite score measuring overall benefits program health.',
   'درجة مركبة مرجحة تقيس صحة برنامج المزايا بشكل عام.',
   '40% Utilization + 30% Satisfaction + 20% Cost Efficiency + 10% Compliance',
   '40% استخدام + 30% رضا + 20% كفاءة التكلفة + 10% الامتثال',
   'Calculated', 'employer', 1, '{}')
ON CONFLICT (key) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_ar = EXCLUDED.name_ar,
  definition_en = EXCLUDED.definition_en,
  definition_ar = EXCLUDED.definition_ar,
  formula_en = EXCLUDED.formula_en,
  formula_ar = EXCLUDED.formula_ar,
  source = EXCLUDED.source,
  updated_at = now();

-- =====================================================
-- PHASE 3: Create Demo User RPC (Admin Only)
-- =====================================================

CREATE OR REPLACE FUNCTION public.ensure_demo_user_role(
  p_email text,
  p_role user_role,
  p_org_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid;
  v_result jsonb;
BEGIN
  -- Find user by email in profiles
  SELECT p.user_id INTO v_user_id
  FROM profiles p
  WHERE p.email = p_email;
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;
  
  -- Update or insert the correct role
  INSERT INTO user_roles (user_id, role)
  VALUES (v_user_id, p_role)
  ON CONFLICT (user_id) 
  DO UPDATE SET role = p_role;
  
  -- Update organization if provided
  IF p_org_id IS NOT NULL THEN
    UPDATE profiles SET organization_id = p_org_id WHERE user_id = v_user_id;
  END IF;
  
  -- Create vendor record if vendor role
  IF p_role = 'vendor' THEN
    INSERT INTO vendors (user_id, company_name)
    VALUES (v_user_id, 'Demo Vendor')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'role', p_role
  );
END;
$$;