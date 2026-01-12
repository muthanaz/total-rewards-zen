-- Step 4: Update handle_new_user to assign default organization
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  requested_role_text text;
  assigned_role public.user_role;
  default_org_id uuid;
BEGIN
  -- Get default organization (first one or create if needed)
  SELECT id INTO default_org_id FROM public.organizations LIMIT 1;
  
  -- Create profile row with organization assignment
  INSERT INTO public.profiles (user_id, email, first_name, last_name, organization_id)
  VALUES (
    NEW.id,
    NEW.email,
    NULLIF(btrim(NEW.raw_user_meta_data ->> 'first_name'), ''),
    NULLIF(btrim(NEW.raw_user_meta_data ->> 'last_name'), ''),
    default_org_id
  );

  -- SECURITY: Force all self-signups to 'employee' role
  requested_role_text := lower(coalesce(NEW.raw_user_meta_data ->> 'role', 'employee'));
  IF requested_role_text = 'employee' THEN
    assigned_role := 'employee'::public.user_role;
  ELSE
    assigned_role := 'employee'::public.user_role;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, assigned_role);

  RETURN NEW;
END;
$$;