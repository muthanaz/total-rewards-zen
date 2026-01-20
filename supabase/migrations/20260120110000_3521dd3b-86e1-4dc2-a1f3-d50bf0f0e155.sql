-- Create employer permissions table
CREATE TABLE public.employer_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  can_manage_policies BOOLEAN NOT NULL DEFAULT false,
  can_process_claims BOOLEAN NOT NULL DEFAULT false,
  can_view_exec_analytics BOOLEAN NOT NULL DEFAULT false,
  can_manage_integrations BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, organization_id)
);

-- Enable RLS
ALTER TABLE public.employer_permissions ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check permissions
CREATE OR REPLACE FUNCTION public.has_employer_permission(_user_id UUID, _permission TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE _permission
    WHEN 'can_manage_policies' THEN COALESCE((SELECT can_manage_policies FROM employer_permissions WHERE user_id = _user_id LIMIT 1), false)
    WHEN 'can_process_claims' THEN COALESCE((SELECT can_process_claims FROM employer_permissions WHERE user_id = _user_id LIMIT 1), false)
    WHEN 'can_view_exec_analytics' THEN COALESCE((SELECT can_view_exec_analytics FROM employer_permissions WHERE user_id = _user_id LIMIT 1), false)
    WHEN 'can_manage_integrations' THEN COALESCE((SELECT can_manage_integrations FROM employer_permissions WHERE user_id = _user_id LIMIT 1), false)
    ELSE false
  END
$$;

-- RLS Policies
CREATE POLICY "Users can view their own permissions"
ON public.employer_permissions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all permissions"
ON public.employer_permissions
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_employer_permissions_updated_at
BEFORE UPDATE ON public.employer_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-create permissions based on view mode
CREATE OR REPLACE FUNCTION public.ensure_employer_permissions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user has employer role and doesn't have permissions yet
  IF EXISTS (SELECT 1 FROM user_roles WHERE user_id = NEW.user_id AND role = 'employer') THEN
    INSERT INTO employer_permissions (user_id, organization_id, can_manage_policies, can_process_claims, can_view_exec_analytics, can_manage_integrations)
    VALUES (
      NEW.user_id,
      NEW.organization_id,
      CASE WHEN NEW.employer_view_mode = 'operational' THEN true ELSE false END,
      CASE WHEN NEW.employer_view_mode = 'operational' THEN true ELSE false END,
      CASE WHEN NEW.employer_view_mode = 'executive' THEN true ELSE false END,
      CASE WHEN NEW.employer_view_mode = 'operational' THEN true ELSE false END
    )
    ON CONFLICT (user_id, organization_id) DO UPDATE SET
      can_manage_policies = CASE WHEN NEW.employer_view_mode = 'operational' THEN true ELSE employer_permissions.can_manage_policies END,
      can_process_claims = CASE WHEN NEW.employer_view_mode = 'operational' THEN true ELSE employer_permissions.can_process_claims END,
      can_view_exec_analytics = CASE WHEN NEW.employer_view_mode = 'executive' THEN true ELSE employer_permissions.can_view_exec_analytics END,
      can_manage_integrations = CASE WHEN NEW.employer_view_mode = 'operational' THEN true ELSE employer_permissions.can_manage_integrations END,
      updated_at = now();
  END IF;
  RETURN NEW;
END;
$$;