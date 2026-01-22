/**
 * Enforcement Mode Hook
 *
 * Fetches the effective enforcement mode for policy validation:
 * - Org-level default from org_policy_governance_settings.policy_enforcement_mode
 * - Optional override from policy_versions.logic_json.enforcement_mode
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type EnforcementMode = 'soft' | 'strict';

export interface EnforcementModeResult {
  mode: EnforcementMode;
  source: 'org' | 'policy' | 'default';
  isLoading: boolean;
}

/**
 * Get org-level enforcement mode
 */
export function useOrgEnforcementMode(organizationId: string | null) {
  return useQuery({
    queryKey: ['org_enforcement_mode', organizationId],
    queryFn: async (): Promise<EnforcementMode> => {
      if (!organizationId) return 'soft';

      const { data, error } = await supabase
        .from('org_policy_governance_settings')
        .select('policy_enforcement_mode')
        .eq('organization_id', organizationId)
        .maybeSingle();

      if (error) {
        console.warn('Failed to fetch org enforcement mode:', error);
        return 'soft';
      }

      return (data?.policy_enforcement_mode as EnforcementMode) || 'soft';
    },
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get effective enforcement mode for a specific policy version
 * Checks policy-level override first, then falls back to org default
 */
export function useEffectiveEnforcementMode(
  organizationId: string | null,
  policyVersionLogicJson: Record<string, unknown> | null | undefined
): EnforcementModeResult {
  const { data: orgMode, isLoading } = useOrgEnforcementMode(organizationId);

  // Check for policy-level override
  const policyOverride = policyVersionLogicJson?.enforcement_mode as EnforcementMode | undefined;

  if (policyOverride === 'soft' || policyOverride === 'strict') {
    return { mode: policyOverride, source: 'policy', isLoading };
  }

  if (orgMode) {
    return { mode: orgMode, source: 'org', isLoading };
  }

  return { mode: 'soft', source: 'default', isLoading };
}

/**
 * Hook for current user's org enforcement mode
 */
export function useCurrentOrgEnforcementMode() {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ['profile_org', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  return useOrgEnforcementMode(profile?.organization_id || null);
}
