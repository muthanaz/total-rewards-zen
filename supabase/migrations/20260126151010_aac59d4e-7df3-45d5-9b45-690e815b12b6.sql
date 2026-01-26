-- ============================================
-- ACTION APPROVALS WORKFLOW SYSTEM
-- ============================================

-- 1) APPROVER GROUPS TABLE
-- Stores named groups of approvers (e.g., "Finance Leads", "HR Managers")
CREATE TABLE public.approver_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(organization_id, name)
);

-- 2) APPROVER GROUP MEMBERS TABLE
-- Maps users to approver groups
CREATE TABLE public.approver_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.approver_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  added_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  added_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(group_id, user_id)
);

-- 3) ACTION APPROVALS TABLE
-- Tracks approval workflow instances for actions
CREATE TABLE public.action_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id UUID NOT NULL REFERENCES public.employer_actions(id) ON DELETE CASCADE,
  workflow_definition_id UUID REFERENCES public.workflow_definitions(id),
  current_step_order INTEGER DEFAULT 1,
  approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'cancelled')),
  submitted_by UUID,
  submitted_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4) ACTION APPROVAL STEPS TABLE
-- Tracks individual step decisions in the approval workflow
CREATE TABLE public.action_approval_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  approval_id UUID NOT NULL REFERENCES public.action_approvals(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  approver_group_id UUID REFERENCES public.approver_groups(id),
  assigned_approver_user_id UUID,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'skipped')),
  decision_note TEXT,
  decided_at TIMESTAMPTZ,
  decided_by UUID,
  sla_due_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5) ADD MISSING COLUMNS TO employer_actions
-- Add segment_tags for tracking related segments
ALTER TABLE public.employer_actions 
  ADD COLUMN IF NOT EXISTS segment_tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS expected_impact_min_aed NUMERIC,
  ADD COLUMN IF NOT EXISTS expected_impact_max_aed NUMERIC,
  ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS workflow_definition_id UUID REFERENCES public.workflow_definitions(id),
  ADD COLUMN IF NOT EXISTS source_page TEXT;

-- 6) ADD action_approval workflow_type to workflow_definitions
-- This allows reusing the existing workflow_definitions table for action approvals
-- The workflow_type column already exists, so we just need to ensure 'action_approval' is valid

-- 7) Add approver_group_id to workflow_steps for action workflows
ALTER TABLE public.workflow_steps 
  ADD COLUMN IF NOT EXISTS approver_group_id UUID REFERENCES public.approver_groups(id),
  ADD COLUMN IF NOT EXISTS allow_skip BOOLEAN DEFAULT false;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE public.approver_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approver_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_approval_steps ENABLE ROW LEVEL SECURITY;

-- Approver Groups: org members can view, employers with permissions can manage
CREATE POLICY "Approver groups viewable by org members"
  ON public.approver_groups FOR SELECT
  USING (
    organization_id = get_user_organization_id(auth.uid())
    OR has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Approver groups manageable by employers"
  ON public.approver_groups FOR ALL
  USING (
    (organization_id = get_user_organization_id(auth.uid()) 
     AND has_role(auth.uid(), 'employer'))
    OR has_role(auth.uid(), 'admin')
  );

-- Approver Group Members: viewable if you can view the group
CREATE POLICY "Group members viewable by org members"
  ON public.approver_group_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.approver_groups ag 
      WHERE ag.id = approver_group_members.group_id 
      AND (ag.organization_id = get_user_organization_id(auth.uid()) OR has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Group members manageable by employers"
  ON public.approver_group_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.approver_groups ag 
      WHERE ag.id = approver_group_members.group_id 
      AND (
        (ag.organization_id = get_user_organization_id(auth.uid()) AND has_role(auth.uid(), 'employer'))
        OR has_role(auth.uid(), 'admin')
      )
    )
  );

-- Action Approvals: viewable by org members, manageable by submitter or approvers
CREATE POLICY "Action approvals viewable by org members"
  ON public.action_approvals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.employer_actions ea 
      WHERE ea.id = action_approvals.action_id 
      AND (ea.organization_id = get_user_organization_id(auth.uid()) OR has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Action approvals manageable by relevant users"
  ON public.action_approvals FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.employer_actions ea 
      WHERE ea.id = action_approvals.action_id 
      AND (
        (ea.organization_id = get_user_organization_id(auth.uid()) AND has_role(auth.uid(), 'employer'))
        OR has_role(auth.uid(), 'admin')
      )
    )
  );

-- Action Approval Steps: viewable by org members
CREATE POLICY "Approval steps viewable by org members"
  ON public.action_approval_steps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.action_approvals aa 
      JOIN public.employer_actions ea ON ea.id = aa.action_id
      WHERE aa.id = action_approval_steps.approval_id 
      AND (ea.organization_id = get_user_organization_id(auth.uid()) OR has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Approval steps manageable by approvers"
  ON public.action_approval_steps FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.action_approvals aa 
      JOIN public.employer_actions ea ON ea.id = aa.action_id
      WHERE aa.id = action_approval_steps.approval_id 
      AND (
        (ea.organization_id = get_user_organization_id(auth.uid()) AND has_role(auth.uid(), 'employer'))
        OR has_role(auth.uid(), 'admin')
      )
    )
  );

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_approver_groups_org ON public.approver_groups(organization_id);
CREATE INDEX idx_approver_group_members_group ON public.approver_group_members(group_id);
CREATE INDEX idx_approver_group_members_user ON public.approver_group_members(user_id);
CREATE INDEX idx_action_approvals_action ON public.action_approvals(action_id);
CREATE INDEX idx_action_approvals_status ON public.action_approvals(approval_status);
CREATE INDEX idx_action_approval_steps_approval ON public.action_approval_steps(approval_id);
CREATE INDEX idx_action_approval_steps_status ON public.action_approval_steps(status);
CREATE INDEX idx_employer_actions_requires_approval ON public.employer_actions(requires_approval);

-- ============================================
-- HELPER FUNCTION: Submit action for approval
-- ============================================

CREATE OR REPLACE FUNCTION public.submit_action_for_approval(
  p_action_id UUID,
  p_workflow_definition_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_action RECORD;
  v_approval_id UUID;
  v_step RECORD;
  v_step_order INTEGER := 0;
BEGIN
  -- Validate action exists and belongs to caller's org
  SELECT * INTO v_action FROM employer_actions 
  WHERE id = p_action_id 
  AND (organization_id = get_user_organization_id(auth.uid()) OR has_role(auth.uid(), 'admin'));
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Action not found or access denied');
  END IF;
  
  -- Update action status and workflow
  UPDATE employer_actions 
  SET 
    status = 'pending_approval',
    requires_approval = true,
    workflow_definition_id = p_workflow_definition_id,
    updated_at = now()
  WHERE id = p_action_id;
  
  -- Create approval record
  INSERT INTO action_approvals (action_id, workflow_definition_id, submitted_by, approval_status)
  VALUES (p_action_id, p_workflow_definition_id, auth.uid(), 'pending')
  RETURNING id INTO v_approval_id;
  
  -- Create approval steps from workflow definition
  FOR v_step IN 
    SELECT * FROM workflow_steps 
    WHERE workflow_definition_id = p_workflow_definition_id 
    AND is_active = true
    ORDER BY step_order
  LOOP
    v_step_order := v_step_order + 1;
    INSERT INTO action_approval_steps (
      approval_id, 
      step_order, 
      approver_group_id,
      sla_due_at
    )
    VALUES (
      v_approval_id, 
      v_step_order, 
      v_step.approver_group_id,
      CASE WHEN v_step.sla_hours IS NOT NULL 
        THEN now() + (v_step.sla_hours || ' hours')::interval 
        ELSE NULL 
      END
    );
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'approval_id', v_approval_id,
    'action_id', p_action_id,
    'steps_created', v_step_order
  );
END;
$$;

-- ============================================
-- HELPER FUNCTION: Approve/Reject step
-- ============================================

CREATE OR REPLACE FUNCTION public.decide_approval_step(
  p_step_id UUID,
  p_decision TEXT, -- 'approved' | 'rejected'
  p_note TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_step RECORD;
  v_approval RECORD;
  v_action RECORD;
  v_next_step RECORD;
  v_all_approved BOOLEAN;
BEGIN
  -- Validate decision
  IF p_decision NOT IN ('approved', 'rejected') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid decision. Must be approved or rejected.');
  END IF;
  
  -- Get step and validate access
  SELECT aas.*, aa.action_id, aa.id as approval_id 
  INTO v_step 
  FROM action_approval_steps aas
  JOIN action_approvals aa ON aa.id = aas.approval_id
  WHERE aas.id = p_step_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Step not found');
  END IF;
  
  IF v_step.status != 'pending' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Step already decided');
  END IF;
  
  -- Get action for org validation
  SELECT * INTO v_action FROM employer_actions WHERE id = v_step.action_id;
  
  IF v_action.organization_id != get_user_organization_id(auth.uid()) AND NOT has_role(auth.uid(), 'admin') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Access denied');
  END IF;
  
  -- Update step
  UPDATE action_approval_steps
  SET 
    status = p_decision,
    decision_note = p_note,
    decided_at = now(),
    decided_by = auth.uid(),
    updated_at = now()
  WHERE id = p_step_id;
  
  IF p_decision = 'rejected' THEN
    -- Rejection: update approval and action status
    UPDATE action_approvals SET approval_status = 'rejected', decided_at = now(), updated_at = now()
    WHERE id = v_step.approval_id;
    
    UPDATE employer_actions SET status = 'backlog', updated_at = now() WHERE id = v_step.action_id;
    
    RETURN jsonb_build_object('success', true, 'final_status', 'rejected');
  ELSE
    -- Check if all steps approved
    SELECT NOT EXISTS (
      SELECT 1 FROM action_approval_steps 
      WHERE approval_id = v_step.approval_id 
      AND status = 'pending'
    ) INTO v_all_approved;
    
    IF v_all_approved THEN
      -- All approved: update approval and action
      UPDATE action_approvals SET approval_status = 'approved', decided_at = now(), updated_at = now()
      WHERE id = v_step.approval_id;
      
      UPDATE employer_actions SET status = 'backlog', updated_at = now() WHERE id = v_step.action_id;
      
      RETURN jsonb_build_object('success', true, 'final_status', 'approved');
    ELSE
      -- Move to next step
      UPDATE action_approvals SET current_step_order = v_step.step_order + 1, updated_at = now()
      WHERE id = v_step.approval_id;
      
      RETURN jsonb_build_object('success', true, 'final_status', 'pending_next_step', 'next_step', v_step.step_order + 1);
    END IF;
  END IF;
END;
$$;