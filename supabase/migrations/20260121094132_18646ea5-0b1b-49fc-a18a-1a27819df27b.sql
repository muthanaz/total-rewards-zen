-- Add missing columns to requests table for proper claims queue functionality
ALTER TABLE public.requests
ADD COLUMN IF NOT EXISTS submitted_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS sla_hours integer DEFAULT 72,
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'AED',
ADD COLUMN IF NOT EXISTS required_docs jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS missing_docs jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS employee_code text,
ADD COLUMN IF NOT EXISTS policy_ref text;

-- Create function to auto-set submitted_at and compute sla_due_at on insert/update
CREATE OR REPLACE FUNCTION public.set_request_sla_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  -- Set submitted_at if not provided (use created_at as fallback)
  IF NEW.submitted_at IS NULL THEN
    NEW.submitted_at := COALESCE(NEW.created_at, now());
  END IF;
  
  -- Compute sla_due_at from submitted_at + sla_hours
  IF NEW.sla_hours IS NOT NULL AND NEW.sla_due_at IS NULL THEN
    NEW.sla_due_at := NEW.submitted_at + (NEW.sla_hours || ' hours')::interval;
  END IF;
  
  -- Update sla_due_at if sla_hours changed
  IF TG_OP = 'UPDATE' AND OLD.sla_hours IS DISTINCT FROM NEW.sla_hours AND NEW.sla_hours IS NOT NULL THEN
    NEW.sla_due_at := NEW.submitted_at + (NEW.sla_hours || ' hours')::interval;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for auto-setting SLA timestamps
DROP TRIGGER IF EXISTS set_request_sla_timestamps_trigger ON public.requests;
CREATE TRIGGER set_request_sla_timestamps_trigger
  BEFORE INSERT OR UPDATE ON public.requests
  FOR EACH ROW
  EXECUTE FUNCTION public.set_request_sla_timestamps();

-- Backfill existing rows: set submitted_at = created_at where null
UPDATE public.requests 
SET submitted_at = created_at 
WHERE submitted_at IS NULL;

-- Backfill sla_due_at for existing rows where missing
UPDATE public.requests 
SET sla_due_at = submitted_at + (COALESCE(sla_hours, 72) || ' hours')::interval
WHERE sla_due_at IS NULL AND submitted_at IS NOT NULL;