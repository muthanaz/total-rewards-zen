-- Add status to organizations for suspension enforcement
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active' 
CHECK (status IN ('active', 'suspended'));

-- Add status enum to vendors (replace boolean is_active)
ALTER TABLE public.vendors 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending'
CHECK (status IN ('pending', 'active', 'suspended', 'rejected'));

-- Add proper status and validity to marketplace_offers
ALTER TABLE public.marketplace_offers 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending'
CHECK (status IN ('pending', 'active', 'suspended', 'rejected'));

ALTER TABLE public.marketplace_offers 
ADD COLUMN IF NOT EXISTS valid_from date DEFAULT CURRENT_DATE;

ALTER TABLE public.marketplace_offers 
ADD COLUMN IF NOT EXISTS valid_to date;

ALTER TABLE public.marketplace_offers 
ADD COLUMN IF NOT EXISTS sponsored boolean DEFAULT false;

ALTER TABLE public.marketplace_offers 
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT true;

-- Add actor_role and outcome to audit_logs for better filtering
ALTER TABLE public.audit_logs 
ADD COLUMN IF NOT EXISTS actor_role text;

ALTER TABLE public.audit_logs 
ADD COLUMN IF NOT EXISTS outcome text DEFAULT 'success';

-- Create index for audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON public.audit_logs(resource_type);

-- Update RLS for admins to manage vendors
DROP POLICY IF EXISTS "Admins can manage vendors" ON public.vendors;
CREATE POLICY "Admins can manage vendors" ON public.vendors
FOR ALL USING (has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

-- Employees can only see active vendors
DROP POLICY IF EXISTS "Employees can view active vendors" ON public.vendors;
CREATE POLICY "Employees can view active vendors" ON public.vendors
FOR SELECT USING (
  status = 'active' OR 
  user_id = auth.uid() OR
  has_role(auth.uid(), 'admin'::user_role) OR
  has_role(auth.uid(), 'employer'::user_role)
);

-- Update marketplace_offers RLS for status filtering
DROP POLICY IF EXISTS "Employees see active offers" ON public.marketplace_offers;
CREATE POLICY "Employees see active offers" ON public.marketplace_offers
FOR SELECT USING (
  (status = 'active' AND (valid_to IS NULL OR valid_to >= CURRENT_DATE) AND (valid_from IS NULL OR valid_from <= CURRENT_DATE))
  OR has_role(auth.uid(), 'admin'::user_role)
  OR has_role(auth.uid(), 'vendor'::user_role)
);

-- Admins can manage all offers
DROP POLICY IF EXISTS "Admins can manage all offers" ON public.marketplace_offers;
CREATE POLICY "Admins can manage all offers" ON public.marketplace_offers
FOR ALL USING (has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (has_role(auth.uid(), 'admin'::user_role));