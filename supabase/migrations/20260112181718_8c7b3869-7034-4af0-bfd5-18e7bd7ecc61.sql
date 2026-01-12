-- Add branding and settings columns to organizations table
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#0f766e',
ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#115e59',
ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#2dd4bf',
ADD COLUMN IF NOT EXISTS welcome_message TEXT,
ADD COLUMN IF NOT EXISTS footer_text TEXT,
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_organizations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_organizations_updated_at();

-- Allow admins to update organization settings
CREATE POLICY "Admins can update organizations"
ON public.organizations
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));