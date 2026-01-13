-- Create table to store UI element visibility settings per organization
CREATE TABLE public.ui_visibility_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'employee', 'employer', 'vendor')),
  page_key text NOT NULL,
  element_key text NOT NULL,
  is_visible boolean NOT NULL DEFAULT true,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid,
  UNIQUE (organization_id, role, page_key, element_key)
);

-- Enable RLS
ALTER TABLE public.ui_visibility_settings ENABLE ROW LEVEL SECURITY;

-- Admins can manage all visibility settings
CREATE POLICY "Admins can manage visibility settings"
ON public.ui_visibility_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

-- Users can view visibility settings for their organization
CREATE POLICY "Users can view org visibility settings"
ON public.ui_visibility_settings
FOR SELECT
USING (organization_id = get_user_organization_id(auth.uid()));

-- Create index for faster lookups
CREATE INDEX idx_ui_visibility_org_role ON public.ui_visibility_settings(organization_id, role);

-- Trigger to update updated_at
CREATE TRIGGER update_ui_visibility_updated_at
BEFORE UPDATE ON public.ui_visibility_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();