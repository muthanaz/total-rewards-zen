-- Step 3: Update RLS policies to scope by organization

-- PROFILES TABLE - drop old and create new org-scoped policy
DROP POLICY IF EXISTS "Employers can view all profiles" ON public.profiles;
CREATE POLICY "Employers can view org profiles" ON public.profiles
  FOR SELECT USING (
    has_role(auth.uid(), 'employer'::user_role) 
    AND organization_id = get_user_organization_id(auth.uid())
  );

-- REQUESTS TABLE
DROP POLICY IF EXISTS "Employers can view all requests" ON public.requests;
CREATE POLICY "Employers can view org requests" ON public.requests
  FOR SELECT USING (
    has_role(auth.uid(), 'employer'::user_role) 
    AND is_same_organization(user_id)
  );

DROP POLICY IF EXISTS "Employers can update requests" ON public.requests;
CREATE POLICY "Employers can update org requests" ON public.requests
  FOR UPDATE USING (
    has_role(auth.uid(), 'employer'::user_role) 
    AND is_same_organization(user_id)
  );

-- EMPLOYEE_SATISFACTION_RATINGS TABLE
DROP POLICY IF EXISTS "Employers can view all ratings" ON public.employee_satisfaction_ratings;
CREATE POLICY "Employers can view org ratings" ON public.employee_satisfaction_ratings
  FOR SELECT USING (
    has_role(auth.uid(), 'employer'::user_role) 
    AND is_same_organization(user_id)
  );

-- BENEFIT_ENTITLEMENTS TABLE
DROP POLICY IF EXISTS "Employers can view all entitlements" ON public.benefit_entitlements;
CREATE POLICY "Employers can view org entitlements" ON public.benefit_entitlements
  FOR SELECT USING (
    has_role(auth.uid(), 'employer'::user_role) 
    AND is_same_organization(user_id)
  );

-- UTILIZATION_EVENTS TABLE
DROP POLICY IF EXISTS "Employers can view all events" ON public.utilization_events;
CREATE POLICY "Employers can view org events" ON public.utilization_events
  FOR SELECT USING (
    has_role(auth.uid(), 'employer'::user_role) 
    AND is_same_organization(user_id)
  );

-- LEAVE_BALANCES TABLE
DROP POLICY IF EXISTS "Employers can view all leave" ON public.leave_balances;
CREATE POLICY "Employers can view org leave" ON public.leave_balances
  FOR SELECT USING (
    has_role(auth.uid(), 'employer'::user_role) 
    AND is_same_organization(user_id)
  );

-- DOCUMENT_AUDIT TABLE
DROP POLICY IF EXISTS "Employers can view all audits" ON public.document_audit;
CREATE POLICY "Employers can view org audits" ON public.document_audit
  FOR SELECT USING (
    has_role(auth.uid(), 'employer'::user_role) 
    AND is_same_organization(user_id)
  );

-- PERK_ACTIVATIONS TABLE
DROP POLICY IF EXISTS "Employers can view all activations" ON public.perk_activations;
CREATE POLICY "Employers can view org activations" ON public.perk_activations
  FOR SELECT USING (
    has_role(auth.uid(), 'employer'::user_role) 
    AND is_same_organization(user_id)
  );