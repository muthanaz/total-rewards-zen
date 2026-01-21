
-- =====================================================
-- Claims & Approvals Console - Schema Updates
-- =====================================================

-- 1. Add missing columns to requests table if they don't exist
DO $$ 
BEGIN
  -- Add value_band column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'requests' AND column_name = 'value_band') THEN
    ALTER TABLE public.requests ADD COLUMN value_band text DEFAULT 'Standard';
  END IF;
  
  -- Add assigned_to_user_id column (in addition to assigned_to)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'requests' AND column_name = 'assigned_to_user_id') THEN
    ALTER TABLE public.requests ADD COLUMN assigned_to_user_id uuid REFERENCES auth.users(id);
  END IF;
  
  -- Add escalation fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'requests' AND column_name = 'escalated_at') THEN
    ALTER TABLE public.requests ADD COLUMN escalated_at timestamptz;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'requests' AND column_name = 'escalation_reason') THEN
    ALTER TABLE public.requests ADD COLUMN escalation_reason text;
  END IF;
END $$;

-- Add check constraint for priority (allow low, medium, standard, high, urgent)
ALTER TABLE public.requests DROP CONSTRAINT IF EXISTS requests_priority_check;
ALTER TABLE public.requests ADD CONSTRAINT requests_priority_check 
  CHECK (priority IS NULL OR priority IN ('low', 'medium', 'standard', 'high', 'urgent'));

-- Add check constraint for value_band
ALTER TABLE public.requests DROP CONSTRAINT IF EXISTS requests_value_band_check;
ALTER TABLE public.requests ADD CONSTRAINT requests_value_band_check 
  CHECK (value_band IS NULL OR value_band IN ('Low', 'Standard', 'Premium'));

-- 2. Create claim_docs table
CREATE TABLE IF NOT EXISTS public.claim_docs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id uuid NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  doc_type text NOT NULL,
  doc_name text NOT NULL,
  file_url text,
  status text NOT NULL DEFAULT 'missing' CHECK (status IN ('provided', 'missing', 'rejected', 'pending')),
  uploaded_at timestamptz,
  uploaded_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewer_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Create claim_notes table
CREATE TABLE IF NOT EXISTS public.claim_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id uuid NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  note text NOT NULL,
  is_internal boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Add action column to request_events if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'request_events' AND column_name = 'action') THEN
    ALTER TABLE public.request_events ADD COLUMN action text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'request_events' AND column_name = 'meta') THEN
    ALTER TABLE public.request_events ADD COLUMN meta jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE public.claim_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_notes ENABLE ROW LEVEL SECURITY;

-- RLS policies for claim_docs
DROP POLICY IF EXISTS "Users can view their own claim docs" ON public.claim_docs;
CREATE POLICY "Users can view their own claim docs"
  ON public.claim_docs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.requests r 
      WHERE r.id = claim_docs.request_id AND r.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Employers can view org claim docs" ON public.claim_docs;
CREATE POLICY "Employers can view org claim docs"
  ON public.claim_docs FOR SELECT
  USING (
    has_role(auth.uid(), 'employer'::user_role) AND
    EXISTS (
      SELECT 1 FROM public.requests r 
      JOIN public.profiles p ON p.user_id = r.user_id
      WHERE r.id = claim_docs.request_id 
      AND p.organization_id = get_user_organization_id(auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert their own claim docs" ON public.claim_docs;
CREATE POLICY "Users can insert their own claim docs"
  ON public.claim_docs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.requests r 
      WHERE r.id = request_id AND r.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Employers can update org claim docs" ON public.claim_docs;
CREATE POLICY "Employers can update org claim docs"
  ON public.claim_docs FOR UPDATE
  USING (
    has_role(auth.uid(), 'employer'::user_role) AND
    EXISTS (
      SELECT 1 FROM public.requests r 
      JOIN public.profiles p ON p.user_id = r.user_id
      WHERE r.id = claim_docs.request_id 
      AND p.organization_id = get_user_organization_id(auth.uid())
    )
  );

-- RLS policies for claim_notes
DROP POLICY IF EXISTS "Employers can view org claim notes" ON public.claim_notes;
CREATE POLICY "Employers can view org claim notes"
  ON public.claim_notes FOR SELECT
  USING (
    has_role(auth.uid(), 'employer'::user_role) AND
    EXISTS (
      SELECT 1 FROM public.requests r 
      JOIN public.profiles p ON p.user_id = r.user_id
      WHERE r.id = claim_notes.request_id 
      AND p.organization_id = get_user_organization_id(auth.uid())
    )
  );

DROP POLICY IF EXISTS "Employees can view non-internal notes on their requests" ON public.claim_notes;
CREATE POLICY "Employees can view non-internal notes on their requests"
  ON public.claim_notes FOR SELECT
  USING (
    is_internal = false AND
    EXISTS (
      SELECT 1 FROM public.requests r 
      WHERE r.id = claim_notes.request_id AND r.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Employers can insert claim notes" ON public.claim_notes;
CREATE POLICY "Employers can insert claim notes"
  ON public.claim_notes FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'employer'::user_role) AND
    EXISTS (
      SELECT 1 FROM public.requests r 
      JOIN public.profiles p ON p.user_id = r.user_id
      WHERE r.id = request_id 
      AND p.organization_id = get_user_organization_id(auth.uid())
    ) AND
    created_by = auth.uid()
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_claim_docs_request_id ON public.claim_docs(request_id);
CREATE INDEX IF NOT EXISTS idx_claim_notes_request_id ON public.claim_notes(request_id);
CREATE INDEX IF NOT EXISTS idx_requests_sla_due_at ON public.requests(sla_due_at);
CREATE INDEX IF NOT EXISTS idx_requests_org_status ON public.requests(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_requests_submitted_at ON public.requests(submitted_at);

-- Update trigger for request_events to include action
CREATE OR REPLACE FUNCTION public.log_request_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    NEW.last_status_change_at := now();
    
    INSERT INTO public.request_events (
      request_id,
      actor_user_id,
      from_status,
      to_status,
      action,
      meta
    ) VALUES (
      NEW.id,
      COALESCE(auth.uid(), NEW.reviewed_by, NEW.user_id),
      OLD.status::text,
      NEW.status::text,
      CASE 
        WHEN NEW.status = 'approved' THEN 'approve'
        WHEN NEW.status = 'rejected' THEN 'reject'
        WHEN NEW.status = 'in_review' THEN 'review'
        ELSE 'status_change'
      END,
      jsonb_build_object('reviewer_notes', NEW.reviewer_notes)
    );
  END IF;
  
  RETURN NEW;
END;
$function$;
