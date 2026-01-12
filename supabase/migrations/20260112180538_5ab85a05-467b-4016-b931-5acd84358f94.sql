-- Step 2: Create organizations table and helper functions

-- Create organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Add FK constraint to profiles
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_organization_id_fkey 
FOREIGN KEY (organization_id) REFERENCES public.organizations(id);

-- Create SECURITY DEFINER function to get user's organization (prevents recursion)
CREATE OR REPLACE FUNCTION public.get_user_organization_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

-- Create helper function to check same organization
CREATE OR REPLACE FUNCTION public.is_same_organization(_target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p1
    JOIN public.profiles p2 ON p1.organization_id = p2.organization_id
    WHERE p1.user_id = auth.uid() 
    AND p2.user_id = _target_user_id
    AND p1.organization_id IS NOT NULL
  )
$$;

-- Organizations are visible to members of that org
CREATE POLICY "Users can view their organization" ON public.organizations
  FOR SELECT USING (
    id = get_user_organization_id(auth.uid())
  );

-- Admins can manage organizations
CREATE POLICY "Admins can manage organizations" ON public.organizations
  FOR ALL USING (has_role(auth.uid(), 'admin'::user_role));