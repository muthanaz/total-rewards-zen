-- ============================================================================
-- BNFT PLATFORM: ORGANIZATION CONFIGURATION LAYER & WORKFLOW ENGINE
-- Migration: org_structure_and_workflow_engine
-- ============================================================================

-- ============================================================================
-- PART 1: ORGANIZATION STRUCTURE TABLES
-- ============================================================================

-- 1A: Legal Entities
CREATE TABLE public.org_legal_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  country TEXT DEFAULT 'AE',
  registration_number TEXT,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(organization_id, code)
);

-- 1B: Business Units
CREATE TABLE public.org_business_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  legal_entity_id UUID REFERENCES public.org_legal_entities(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  head_user_id UUID REFERENCES auth.users(id),
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(organization_id, code)
);

-- 1C: Departments (replaces plain-text profiles.department)
CREATE TABLE public.org_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  business_unit_id UUID REFERENCES public.org_business_units(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  parent_department_id UUID REFERENCES public.org_departments(id) ON DELETE SET NULL,
  head_user_id UUID REFERENCES auth.users(id),
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(organization_id, code)
);

-- 1D: Cost Centers
CREATE TABLE public.org_cost_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  business_unit_id UUID REFERENCES public.org_business_units(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  budget_amount NUMERIC,
  budget_currency TEXT DEFAULT 'AED',
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(organization_id, code)
);

-- 1E: Locations (replaces plain-text profiles.work_location)
CREATE TABLE public.org_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  country TEXT DEFAULT 'AE',
  city TEXT,
  address TEXT,
  timezone TEXT DEFAULT 'Asia/Dubai',
  is_remote BOOLEAN NOT NULL DEFAULT false,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(organization_id, code)
);

-- 1F: Grades/Bands (replaces plain-text profiles.grade)
CREATE TABLE public.org_grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  min_salary NUMERIC,
  max_salary NUMERIC,
  currency TEXT DEFAULT 'AED',
  benefit_tier TEXT,
  description TEXT,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(organization_id, code)
);

-- 1G: Employment Types
CREATE TABLE public.org_employment_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  is_full_time BOOLEAN NOT NULL DEFAULT true,
  is_permanent BOOLEAN NOT NULL DEFAULT true,
  probation_months INTEGER DEFAULT 3,
  notice_period_days INTEGER DEFAULT 30,
  benefits_eligible BOOLEAN NOT NULL DEFAULT true,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(organization_id, code)
);

-- 1H: Segment Tags (for flexible segmentation like life-stage, nationality type)
CREATE TABLE public.org_segment_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  tag_type TEXT NOT NULL, -- 'life_stage', 'nationality_type', 'tenure_band', etc.
  tag_value TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, tag_type, tag_value)
);

-- ============================================================================
-- PART 2: WORKFLOW ENGINE TABLES
-- ============================================================================

-- 2A: Workflow Definitions
CREATE TABLE public.workflow_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE, -- NULL = platform default
  workflow_type TEXT NOT NULL, -- 'claim_approval', 'policy_change', 'request_approval'
  scope_type TEXT NOT NULL DEFAULT 'global', -- 'global', 'policy', 'category', 'entity'
  scope_ref_id UUID, -- policy_id, legal_entity_id, etc. when scope is specific
  name TEXT NOT NULL,
  description TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false,
  enforcement_mode TEXT NOT NULL DEFAULT 'soft', -- 'soft' or 'strict'
  owner_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- 2B: Workflow Steps
CREATE TABLE public.workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_definition_id UUID NOT NULL REFERENCES public.workflow_definitions(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  step_type TEXT NOT NULL DEFAULT 'approval', -- 'approval', 'review', 'info_request', 'auto_approve', 'vendor_check'
  name TEXT NOT NULL,
  description TEXT,
  
  -- Assignee configuration
  assignee_type TEXT NOT NULL DEFAULT 'role', -- 'role', 'dynamic', 'specific_user', 'manager'
  assignee_role TEXT, -- 'hr_ops', 'finance', 'executive', 'comp_ben', etc.
  assignee_user_id UUID REFERENCES auth.users(id), -- when assignee_type = 'specific_user'
  
  -- SLA configuration
  sla_hours INTEGER,
  escalation_step_id UUID REFERENCES public.workflow_steps(id),
  escalation_after_hours INTEGER,
  
  -- Conditions for routing (JSONB for flexible conditions)
  conditions_json JSONB DEFAULT '{}', -- e.g., {"amount_min": 5000, "grades": ["A1", "A2"], "categories": ["housing"]}
  
  -- Auto-actions
  auto_action TEXT, -- 'approve', 'reject', 'escalate' for auto_approve step type
  auto_condition_json JSONB, -- conditions for auto-action
  
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2C: Workflow Step Assignments (tracks current assignments per request)
CREATE TABLE public.workflow_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  workflow_step_id UUID NOT NULL REFERENCES public.workflow_steps(id),
  assigned_to_user_id UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  action_taken TEXT, -- 'approved', 'rejected', 'escalated', 'info_requested'
  action_notes TEXT,
  is_current BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- PART 3: EXTENDED RBAC
-- ============================================================================

-- 3A: Extended Employer Roles enum
DO $$ BEGIN
  CREATE TYPE public.employer_role_type AS ENUM (
    'executive',
    'hr_ops',
    'comp_ben',
    'finance',
    'policy_owner',
    'it_admin',
    'viewer'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 3B: Organization Role Assignments (extends employer_permissions)
CREATE TABLE public.org_role_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  employer_role employer_role_type NOT NULL,
  scope_type TEXT DEFAULT 'global', -- 'global', 'department', 'business_unit', 'legal_entity'
  scope_ref_id UUID, -- reference to the scoped entity
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id, employer_role, scope_type, scope_ref_id)
);

-- 3C: Permission Matrix (action-level permissions)
CREATE TABLE public.org_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE, -- NULL = platform default
  employer_role employer_role_type NOT NULL,
  permission_key TEXT NOT NULL, -- 'claims.approve', 'policies.publish', 'workflows.edit', etc.
  is_allowed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, employer_role, permission_key)
);

-- 3D: Add owner fields to policies table
ALTER TABLE public.policies 
ADD COLUMN IF NOT EXISTS owner_role employer_role_type;

-- 3E: Add owner fields to workflow_definitions is already included above

-- ============================================================================
-- PART 4: ORGANIZATION TARGETS & THRESHOLDS
-- ============================================================================

-- 4A: Org Targets
CREATE TABLE public.org_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  metric_key TEXT NOT NULL, -- 'utilization_rate', 'sla_compliance', 'claim_approval_rate', etc.
  target_value NUMERIC NOT NULL,
  target_unit TEXT DEFAULT 'percent', -- 'percent', 'days', 'aed', 'count'
  fiscal_year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(organization_id, metric_key, fiscal_year)
);

-- 4B: Data Coverage Thresholds
CREATE TABLE public.org_data_thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  metric_key TEXT NOT NULL,
  min_sample_size INTEGER NOT NULL DEFAULT 5,
  min_coverage_percent NUMERIC DEFAULT 80,
  confidence_degraded_threshold NUMERIC DEFAULT 50, -- below this shows "low confidence"
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, metric_key)
);

-- ============================================================================
-- PART 5: ADD WORKFLOW TRACKING TO REQUESTS
-- ============================================================================

ALTER TABLE public.requests
ADD COLUMN IF NOT EXISTS current_workflow_step_id UUID REFERENCES public.workflow_steps(id),
ADD COLUMN IF NOT EXISTS workflow_definition_id UUID REFERENCES public.workflow_definitions(id);

-- ============================================================================
-- PART 6: ENABLE RLS ON ALL NEW TABLES
-- ============================================================================

ALTER TABLE public.org_legal_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_business_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_employment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_segment_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_data_thresholds ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 7: RLS POLICIES
-- ============================================================================

-- Org Structure tables: Same org can view and manage
CREATE POLICY "Org members can view org legal entities" ON public.org_legal_entities
  FOR SELECT USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Employers can manage org legal entities" ON public.org_legal_entities
  FOR ALL USING (organization_id = get_user_organization_id(auth.uid()) AND has_role(auth.uid(), 'employer'))
  WITH CHECK (organization_id = get_user_organization_id(auth.uid()) AND has_role(auth.uid(), 'employer'));

CREATE POLICY "Org members can view org business units" ON public.org_business_units
  FOR SELECT USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Employers can manage org business units" ON public.org_business_units
  FOR ALL USING (organization_id = get_user_organization_id(auth.uid()) AND has_role(auth.uid(), 'employer'))
  WITH CHECK (organization_id = get_user_organization_id(auth.uid()) AND has_role(auth.uid(), 'employer'));

CREATE POLICY "Org members can view org departments" ON public.org_departments
  FOR SELECT USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Employers can manage org departments" ON public.org_departments
  FOR ALL USING (organization_id = get_user_organization_id(auth.uid()) AND has_role(auth.uid(), 'employer'))
  WITH CHECK (organization_id = get_user_organization_id(auth.uid()) AND has_role(auth.uid(), 'employer'));

CREATE POLICY "Org members can view org cost centers" ON public.org_cost_centers
  FOR SELECT USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Employers can manage org cost centers" ON public.org_cost_centers
  FOR ALL USING (organization_id = get_user_organization_id(auth.uid()) AND has_role(auth.uid(), 'employer'))
  WITH CHECK (organization_id = get_user_organization_id(auth.uid()) AND has_role(auth.uid(), 'employer'));

CREATE POLICY "Org members can view org locations" ON public.org_locations
  FOR SELECT USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Employers can manage org locations" ON public.org_locations
  FOR ALL USING (organization_id = get_user_organization_id(auth.uid()) AND has_role(auth.uid(), 'employer'))
  WITH CHECK (organization_id = get_user_organization_id(auth.uid()) AND has_role(auth.uid(), 'employer'));

CREATE POLICY "Org members can view org grades" ON public.org_grades
  FOR SELECT USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Employers can manage org grades" ON public.org_grades
  FOR ALL USING (organization_id = get_user_organization_id(auth.uid()) AND has_role(auth.uid(), 'employer'))
  WITH CHECK (organization_id = get_user_organization_id(auth.uid()) AND has_role(auth.uid(), 'employer'));

CREATE POLICY "Org members can view org employment types" ON public.org_employment_types
  FOR SELECT USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Employers can manage org employment types" ON public.org_employment_types
  FOR ALL USING (organization_id = get_user_organization_id(auth.uid()) AND has_role(auth.uid(), 'employer'))
  WITH CHECK (organization_id = get_user_organization_id(auth.uid()) AND has_role(auth.uid(), 'employer'));

CREATE POLICY "Org members can view org segment tags" ON public.org_segment_tags
  FOR SELECT USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Employers can manage org segment tags" ON public.org_segment_tags
  FOR ALL USING (organization_id = get_user_organization_id(auth.uid()) AND has_role(auth.uid(), 'employer'))
  WITH CHECK (organization_id = get_user_organization_id(auth.uid()) AND has_role(auth.uid(), 'employer'));

-- Workflow tables
CREATE POLICY "Org members can view workflow definitions" ON public.workflow_definitions
  FOR SELECT USING (organization_id IS NULL OR organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Employers can manage workflow definitions" ON public.workflow_definitions
  FOR ALL USING ((organization_id = get_user_organization_id(auth.uid()) AND has_role(auth.uid(), 'employer')) OR has_role(auth.uid(), 'admin'))
  WITH CHECK ((organization_id = get_user_organization_id(auth.uid()) AND has_role(auth.uid(), 'employer')) OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Org members can view workflow steps" ON public.workflow_steps
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM workflow_definitions wd 
    WHERE wd.id = workflow_steps.workflow_definition_id 
    AND (wd.organization_id IS NULL OR wd.organization_id = get_user_organization_id(auth.uid()))
  ));

CREATE POLICY "Employers can manage workflow steps" ON public.workflow_steps
  FOR ALL USING (EXISTS (
    SELECT 1 FROM workflow_definitions wd 
    WHERE wd.id = workflow_steps.workflow_definition_id 
    AND ((wd.organization_id = get_user_organization_id(auth.uid()) AND has_role(auth.uid(), 'employer')) OR has_role(auth.uid(), 'admin'))
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM workflow_definitions wd 
    WHERE wd.id = workflow_steps.workflow_definition_id 
    AND ((wd.organization_id = get_user_organization_id(auth.uid()) AND has_role(auth.uid(), 'employer')) OR has_role(auth.uid(), 'admin'))
  ));

CREATE POLICY "Users can view their request workflow assignments" ON public.workflow_assignments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM requests r WHERE r.id = workflow_assignments.request_id AND r.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM requests r JOIN profiles p ON p.user_id = r.user_id WHERE r.id = workflow_assignments.request_id AND p.organization_id = get_user_organization_id(auth.uid()) AND has_role(auth.uid(), 'employer'))
  );

CREATE POLICY "Employers can manage workflow assignments" ON public.workflow_assignments
  FOR ALL USING (EXISTS (
    SELECT 1 FROM requests r JOIN profiles p ON p.user_id = r.user_id 
    WHERE r.id = workflow_assignments.request_id 
    AND p.organization_id = get_user_organization_id(auth.uid()) 
    AND has_role(auth.uid(), 'employer')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM requests r JOIN profiles p ON p.user_id = r.user_id 
    WHERE r.id = workflow_assignments.request_id 
    AND p.organization_id = get_user_organization_id(auth.uid()) 
    AND has_role(auth.uid(), 'employer')
  ));

-- Role assignments and permissions
CREATE POLICY "Users can view own role assignments" ON public.org_role_assignments
  FOR SELECT USING (user_id = auth.uid() OR (organization_id = get_user_organization_id(auth.uid()) AND has_role(auth.uid(), 'employer')));

CREATE POLICY "Employers can manage org role assignments" ON public.org_role_assignments
  FOR ALL USING (organization_id = get_user_organization_id(auth.uid()) AND has_role(auth.uid(), 'employer'))
  WITH CHECK (organization_id = get_user_organization_id(auth.uid()) AND has_role(auth.uid(), 'employer'));

CREATE POLICY "Users can view org permissions" ON public.org_permissions
  FOR SELECT USING (organization_id IS NULL OR organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Admins can manage permissions" ON public.org_permissions
  FOR ALL USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Targets and thresholds
CREATE POLICY "Org members can view org targets" ON public.org_targets
  FOR SELECT USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Employers can manage org targets" ON public.org_targets
  FOR ALL USING (organization_id = get_user_organization_id(auth.uid()) AND has_role(auth.uid(), 'employer'))
  WITH CHECK (organization_id = get_user_organization_id(auth.uid()) AND has_role(auth.uid(), 'employer'));

CREATE POLICY "Org members can view org data thresholds" ON public.org_data_thresholds
  FOR SELECT USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Employers can manage org data thresholds" ON public.org_data_thresholds
  FOR ALL USING (organization_id = get_user_organization_id(auth.uid()) AND has_role(auth.uid(), 'employer'))
  WITH CHECK (organization_id = get_user_organization_id(auth.uid()) AND has_role(auth.uid(), 'employer'));

-- ============================================================================
-- PART 8: INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_org_legal_entities_org ON public.org_legal_entities(organization_id);
CREATE INDEX idx_org_business_units_org ON public.org_business_units(organization_id);
CREATE INDEX idx_org_departments_org ON public.org_departments(organization_id);
CREATE INDEX idx_org_cost_centers_org ON public.org_cost_centers(organization_id);
CREATE INDEX idx_org_locations_org ON public.org_locations(organization_id);
CREATE INDEX idx_org_grades_org ON public.org_grades(organization_id);
CREATE INDEX idx_org_employment_types_org ON public.org_employment_types(organization_id);
CREATE INDEX idx_org_segment_tags_org ON public.org_segment_tags(organization_id);
CREATE INDEX idx_workflow_definitions_org ON public.workflow_definitions(organization_id);
CREATE INDEX idx_workflow_steps_definition ON public.workflow_steps(workflow_definition_id);
CREATE INDEX idx_workflow_assignments_request ON public.workflow_assignments(request_id);
CREATE INDEX idx_org_role_assignments_org ON public.org_role_assignments(organization_id);
CREATE INDEX idx_org_role_assignments_user ON public.org_role_assignments(user_id);
CREATE INDEX idx_org_permissions_org ON public.org_permissions(organization_id);
CREATE INDEX idx_org_targets_org ON public.org_targets(organization_id);
CREATE INDEX idx_org_data_thresholds_org ON public.org_data_thresholds(organization_id);

-- ============================================================================
-- PART 9: INSERT DEFAULT PERMISSIONS MATRIX
-- ============================================================================

INSERT INTO public.org_permissions (organization_id, employer_role, permission_key, is_allowed) VALUES
-- Executive role
(NULL, 'executive', 'dashboard.view', true),
(NULL, 'executive', 'analytics.view', true),
(NULL, 'executive', 'claims.view', true),
(NULL, 'executive', 'claims.approve', true),
(NULL, 'executive', 'policies.view', true),
(NULL, 'executive', 'policies.approve', true),
(NULL, 'executive', 'policies.publish', true),
(NULL, 'executive', 'workflows.view', true),
(NULL, 'executive', 'org_structure.view', true),
-- HR Ops role
(NULL, 'hr_ops', 'dashboard.view', true),
(NULL, 'hr_ops', 'claims.view', true),
(NULL, 'hr_ops', 'claims.process', true),
(NULL, 'hr_ops', 'claims.approve', true),
(NULL, 'hr_ops', 'claims.reject', true),
(NULL, 'hr_ops', 'claims.request_info', true),
(NULL, 'hr_ops', 'policies.view', true),
(NULL, 'hr_ops', 'policies.edit', true),
(NULL, 'hr_ops', 'workflows.view', true),
(NULL, 'hr_ops', 'workflows.edit', true),
(NULL, 'hr_ops', 'org_structure.view', true),
(NULL, 'hr_ops', 'org_structure.edit', true),
-- Comp & Ben role
(NULL, 'comp_ben', 'dashboard.view', true),
(NULL, 'comp_ben', 'analytics.view', true),
(NULL, 'comp_ben', 'policies.view', true),
(NULL, 'comp_ben', 'policies.edit', true),
(NULL, 'comp_ben', 'policies.create', true),
(NULL, 'comp_ben', 'org_structure.view', true),
(NULL, 'comp_ben', 'org_structure.edit', true),
-- Finance role
(NULL, 'finance', 'dashboard.view', true),
(NULL, 'finance', 'claims.view', true),
(NULL, 'finance', 'claims.mark_paid', true),
(NULL, 'finance', 'analytics.view', true),
-- Policy Owner role
(NULL, 'policy_owner', 'policies.view', true),
(NULL, 'policy_owner', 'policies.edit', true),
(NULL, 'policy_owner', 'policies.submit', true),
-- IT Admin role
(NULL, 'it_admin', 'integrations.view', true),
(NULL, 'it_admin', 'integrations.manage', true),
(NULL, 'it_admin', 'org_structure.view', true),
-- Viewer role
(NULL, 'viewer', 'dashboard.view', true),
(NULL, 'viewer', 'analytics.view', true)
ON CONFLICT (organization_id, employer_role, permission_key) DO NOTHING;

-- ============================================================================
-- PART 10: FUNCTION TO CHECK EXTENDED PERMISSIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.has_org_permission(_user_id UUID, _permission_key TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM org_role_assignments ra
    JOIN org_permissions p ON p.employer_role = ra.employer_role
    WHERE ra.user_id = _user_id
      AND ra.is_active = true
      AND (ra.expires_at IS NULL OR ra.expires_at > now())
      AND p.permission_key = _permission_key
      AND p.is_allowed = true
      AND (p.organization_id IS NULL OR p.organization_id = ra.organization_id)
  )
  OR has_role(_user_id, 'admin')
$$;