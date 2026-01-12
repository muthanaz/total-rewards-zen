-- Harden new-user provisioning: prevent self-assigning privileged roles at sign-up
-- NOTE: This keeps roles in public.user_roles (as required) but forces self-signups to 'employee'.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  requested_role_text text;
  assigned_role public.user_role;
BEGIN
  -- Create profile row (basic normalization)
  INSERT INTO public.profiles (user_id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NULLIF(btrim(NEW.raw_user_meta_data ->> 'first_name'), ''),
    NULLIF(btrim(NEW.raw_user_meta_data ->> 'last_name'), '')
  );

  -- IMPORTANT SECURITY RULE:
  -- Never allow privileged role selection via client-provided signup metadata.
  -- Even if a user submits role=admin/vendor/employer, we force 'employee'.
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