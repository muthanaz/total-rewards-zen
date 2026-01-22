-- Prompt 2: Create separate governance settings table (org_policy_settings already used for payroll/settings)

CREATE TABLE IF NOT EXISTS public.org_policy_governance_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL UNIQUE,
  require_policy_approval boolean NOT NULL DEFAULT true,
  approver_role text NOT NULL DEFAULT 'executive',
  approval_sla_days integer NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.org_policy_governance_settings ENABLE ROW LEVEL SECURITY;

-- Basic RLS: admins can manage all; employers can view/manage for their org (HR Ops/Admin in-org enforced by app role table)
CREATE POLICY "Admins manage policy governance settings"
ON public.org_policy_governance_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Employers view their policy governance settings"
ON public.org_policy_governance_settings
FOR SELECT
USING (organization_id = get_user_organization_id(auth.uid()));

-- Keep updates restricted to admins by default; can be expanded later.

-- Timestamp trigger (reuse existing update function if present)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    DROP TRIGGER IF EXISTS update_org_policy_governance_settings_updated_at ON public.org_policy_governance_settings;
    CREATE TRIGGER update_org_policy_governance_settings_updated_at
    BEFORE UPDATE ON public.org_policy_governance_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Update publish_policy_version to use org_policy_governance_settings and default approvals ON
CREATE OR REPLACE FUNCTION public.publish_policy_version(
  p_policy_version_id uuid,
  p_effective_from date DEFAULT CURRENT_DATE
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_version_record record;
  v_policy record;
  v_version_number int;
  v_settings record;
  v_require_approval boolean;
BEGIN
  SELECT * INTO v_version_record
  FROM public.policy_versions
  WHERE id = p_policy_version_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Version not found');
  END IF;

  v_version_number := v_version_record.version_number;

  SELECT * INTO v_policy
  FROM public.policies
  WHERE id = v_version_record.policy_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Policy not found');
  END IF;

  SELECT * INTO v_settings
  FROM public.org_policy_governance_settings
  WHERE organization_id = v_policy.organization_id;

  v_require_approval := COALESCE(v_settings.require_policy_approval, true);

  IF v_require_approval IS TRUE THEN
    IF v_version_record.status = 'draft' THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Approval workflow is enabled. Please submit for approval first.',
        'requires_approval', true
      );
    END IF;

    IF v_version_record.status NOT IN ('approved') THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Version must be approved before publishing. Current status: ' || v_version_record.status,
        'requires_approval', true
      );
    END IF;
  ELSE
    IF v_version_record.status NOT IN ('draft', 'approved') THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Only draft or approved versions can be published. Current status: ' || v_version_record.status
      );
    END IF;
  END IF;

  UPDATE public.policy_versions
  SET
    status = 'archived',
    effective_to = p_effective_from,
    last_updated_at = now()
  WHERE policy_id = v_version_record.policy_id
    AND status = 'published'
    AND id != p_policy_version_id;

  UPDATE public.policy_versions
  SET
    status = 'published',
    effective_from = p_effective_from,
    last_updated_at = now()
  WHERE id = p_policy_version_id;

  UPDATE public.policies
  SET
    status = 'published',
    effective_from = p_effective_from,
    updated_at = now()
  WHERE id = v_version_record.policy_id;

  RETURN jsonb_build_object(
    'success', true,
    'policy_id', v_version_record.policy_id,
    'version_id', p_policy_version_id,
    'version_number', v_version_number,
    'status', 'published'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
