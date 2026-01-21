-- Claims Ops Phase 2: Enhanced SLA Engine + Audit Trail
-- ================================================================

-- 1. Add missing columns to requests table for denormalized data
ALTER TABLE public.requests ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE public.requests ADD COLUMN IF NOT EXISTS department text;
ALTER TABLE public.requests ADD COLUMN IF NOT EXISTS grade text;
ALTER TABLE public.requests ADD COLUMN IF NOT EXISTS source_system text;
ALTER TABLE public.requests ADD COLUMN IF NOT EXISTS decision_at timestamptz;
ALTER TABLE public.requests ADD COLUMN IF NOT EXISTS assigned_owner_name text;

-- 2. Add indexes for Claims Ops queries
CREATE INDEX IF NOT EXISTS idx_requests_sla_due_at ON public.requests (sla_due_at);
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.requests (status);
CREATE INDEX IF NOT EXISTS idx_requests_assigned_to ON public.requests (assigned_to);
CREATE INDEX IF NOT EXISTS idx_requests_organization_status ON public.requests (organization_id, status);
CREATE INDEX IF NOT EXISTS idx_requests_priority ON public.requests (priority);

-- 3. Add actor_role and visibility to request_events for better audit trail
ALTER TABLE public.request_events ADD COLUMN IF NOT EXISTS actor_role text DEFAULT 'hr_ops';
ALTER TABLE public.request_events ADD COLUMN IF NOT EXISTS visibility text DEFAULT 'internal' 
  CHECK (visibility IN ('internal', 'employee_visible'));
ALTER TABLE public.request_events ADD COLUMN IF NOT EXISTS actor_name text;
ALTER TABLE public.request_events ADD COLUMN IF NOT EXISTS bulk_action_id text;

-- 4. Add index for timeline queries
CREATE INDEX IF NOT EXISTS idx_request_events_claim_timeline ON public.request_events (request_id, created_at DESC);

-- 5. Update trigger function to capture more metadata
CREATE OR REPLACE FUNCTION public.log_request_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if status actually changed
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.request_events (
      request_id,
      actor_user_id,
      from_status,
      to_status,
      action,
      actor_role,
      visibility,
      meta
    ) VALUES (
      NEW.id,
      COALESCE(auth.uid(), NEW.reviewed_by),
      OLD.status,
      NEW.status,
      'status_changed',
      'hr_ops',
      'employee_visible',
      jsonb_build_object(
        'previous_status', OLD.status,
        'new_status', NEW.status,
        'reviewer_notes', NEW.reviewer_notes
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate trigger if it exists
DROP TRIGGER IF EXISTS trg_log_request_status_change ON public.requests;
CREATE TRIGGER trg_log_request_status_change
  AFTER UPDATE ON public.requests
  FOR EACH ROW
  EXECUTE FUNCTION public.log_request_status_change();

-- 6. Create SLA rules table for configurable SLA
CREATE TABLE IF NOT EXISTS public.sla_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id),
  category text NOT NULL,
  value_band text NOT NULL CHECK (value_band IN ('low', 'standard', 'high', 'premium')),
  sla_hours integer NOT NULL DEFAULT 72,
  escalation_hours integer DEFAULT 24,
  reminder_hours integer[] DEFAULT '{48, 24, 8}',
  working_hours_only boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id, category, value_band)
);

-- Enable RLS on sla_rules
ALTER TABLE public.sla_rules ENABLE ROW LEVEL SECURITY;

-- SLA rules policies
CREATE POLICY "Employers can view org SLA rules" ON public.sla_rules
  FOR SELECT USING (
    organization_id IS NULL OR 
    organization_id = get_user_organization_id(auth.uid())
  );

CREATE POLICY "Employers can manage org SLA rules" ON public.sla_rules
  FOR ALL USING (
    (has_role(auth.uid(), 'employer'::user_role) OR has_role(auth.uid(), 'admin'::user_role))
    AND (organization_id IS NULL OR organization_id = get_user_organization_id(auth.uid()))
  );

-- 7. Insert default SLA rules
INSERT INTO public.sla_rules (organization_id, category, value_band, sla_hours) VALUES
  (NULL, 'Health Insurance', 'premium', 48),
  (NULL, 'Health Insurance', 'high', 48),
  (NULL, 'Health Insurance', 'standard', 72),
  (NULL, 'Health Insurance', 'low', 120),
  (NULL, 'Transport', 'premium', 48),
  (NULL, 'Transport', 'standard', 72),
  (NULL, 'Transport', 'low', 120),
  (NULL, 'Housing', 'premium', 48),
  (NULL, 'Housing', 'standard', 72),
  (NULL, 'Schooling', 'premium', 48),
  (NULL, 'Schooling', 'standard', 72),
  (NULL, 'Schooling', 'low', 120),
  (NULL, 'Leave', 'standard', 48),
  (NULL, 'Per Diem', 'standard', 24),
  (NULL, 'Learning & Development', 'standard', 72),
  (NULL, 'Other', 'standard', 72)
ON CONFLICT DO NOTHING;