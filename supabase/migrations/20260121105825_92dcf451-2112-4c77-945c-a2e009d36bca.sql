-- Recovery Playbook Runs table for tracking launched playbooks
CREATE TABLE public.recovery_playbook_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  playbook_type TEXT NOT NULL,
  category TEXT NOT NULL,
  segment TEXT,
  owner TEXT NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'paused')),
  expected_impact_aed NUMERIC DEFAULT 0,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Recovery Run Tasks table for tracking individual playbook tasks
CREATE TABLE public.recovery_run_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id UUID NOT NULL REFERENCES public.recovery_playbook_runs(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  task_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Recovery Run Outputs table for tracking deliverables
CREATE TABLE public.recovery_run_outputs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id UUID NOT NULL REFERENCES public.recovery_playbook_runs(id) ON DELETE CASCADE,
  output_type TEXT NOT NULL,
  title TEXT NOT NULL,
  link_or_text TEXT,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recovery_playbook_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recovery_run_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recovery_run_outputs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recovery_playbook_runs
CREATE POLICY "Employers can view their org playbook runs"
ON public.recovery_playbook_runs
FOR SELECT
USING (
  organization_id = get_user_organization_id(auth.uid())
  AND (has_role(auth.uid(), 'employer'::user_role) OR has_role(auth.uid(), 'admin'::user_role))
);

CREATE POLICY "Employers can create playbook runs for their org"
ON public.recovery_playbook_runs
FOR INSERT
WITH CHECK (
  organization_id = get_user_organization_id(auth.uid())
  AND (has_role(auth.uid(), 'employer'::user_role) OR has_role(auth.uid(), 'admin'::user_role))
);

CREATE POLICY "Employers can update their org playbook runs"
ON public.recovery_playbook_runs
FOR UPDATE
USING (
  organization_id = get_user_organization_id(auth.uid())
  AND (has_role(auth.uid(), 'employer'::user_role) OR has_role(auth.uid(), 'admin'::user_role))
);

CREATE POLICY "Employers can delete their org playbook runs"
ON public.recovery_playbook_runs
FOR DELETE
USING (
  organization_id = get_user_organization_id(auth.uid())
  AND (has_role(auth.uid(), 'employer'::user_role) OR has_role(auth.uid(), 'admin'::user_role))
);

-- RLS Policies for recovery_run_tasks
CREATE POLICY "Employers can view their org run tasks"
ON public.recovery_run_tasks
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM recovery_playbook_runs r
    WHERE r.id = recovery_run_tasks.run_id
    AND r.organization_id = get_user_organization_id(auth.uid())
    AND (has_role(auth.uid(), 'employer'::user_role) OR has_role(auth.uid(), 'admin'::user_role))
  )
);

CREATE POLICY "Employers can manage their org run tasks"
ON public.recovery_run_tasks
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM recovery_playbook_runs r
    WHERE r.id = recovery_run_tasks.run_id
    AND r.organization_id = get_user_organization_id(auth.uid())
    AND (has_role(auth.uid(), 'employer'::user_role) OR has_role(auth.uid(), 'admin'::user_role))
  )
);

-- RLS Policies for recovery_run_outputs
CREATE POLICY "Employers can view their org run outputs"
ON public.recovery_run_outputs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM recovery_playbook_runs r
    WHERE r.id = recovery_run_outputs.run_id
    AND r.organization_id = get_user_organization_id(auth.uid())
    AND (has_role(auth.uid(), 'employer'::user_role) OR has_role(auth.uid(), 'admin'::user_role))
  )
);

CREATE POLICY "Employers can manage their org run outputs"
ON public.recovery_run_outputs
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM recovery_playbook_runs r
    WHERE r.id = recovery_run_outputs.run_id
    AND r.organization_id = get_user_organization_id(auth.uid())
    AND (has_role(auth.uid(), 'employer'::user_role) OR has_role(auth.uid(), 'admin'::user_role))
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_recovery_playbook_runs_updated_at
BEFORE UPDATE ON public.recovery_playbook_runs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();