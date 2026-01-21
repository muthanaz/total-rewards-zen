/**
 * Organization Settings Hook
 * 
 * Provides access to organization-level settings including
 * SLA configuration, policy management mode, and feature flags.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface OrgSettings {
  // Feature toggles
  sla_enabled: boolean;
  marketplace_enabled: boolean;
  gov_connect_enabled: boolean;
  advanced_insights_enabled: boolean;
  
  // Policy management
  policy_management_mode: 'admin_led' | 'shared' | 'employer_led';
  
  // Workflow settings
  default_workflow_type: 'pre_approval_request' | 'post_spend_reimbursement' | 'hybrid';
  require_document_upload: boolean;
  
  // Branding
  primary_color?: string;
  logo_url?: string;
}

const DEFAULT_SETTINGS: OrgSettings = {
  sla_enabled: true, // Default ON
  marketplace_enabled: true,
  gov_connect_enabled: true,
  advanced_insights_enabled: true,
  policy_management_mode: 'admin_led',
  default_workflow_type: 'pre_approval_request',
  require_document_upload: true,
};

export function useOrgSettings(targetOrgId?: string | null) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['org_settings', user?.id, targetOrgId],
    queryFn: async (): Promise<{ orgId: string | null; settings: OrgSettings }> => {
      if (!user) {
        return { orgId: null, settings: DEFAULT_SETTINGS };
      }
      
      let orgId = targetOrgId;
      
      // If no target org, get user's org
      if (!orgId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        orgId = profile?.organization_id;
      }
      
      if (!orgId) {
        return { orgId: null, settings: DEFAULT_SETTINGS };
      }
      
      // Fetch org with settings
      const { data: org, error } = await supabase
        .from('organizations')
        .select('id, settings, primary_color, logo_url')
        .eq('id', orgId)
        .maybeSingle();
      
      if (error || !org) {
        console.error('Error fetching org settings:', error);
        return { orgId, settings: DEFAULT_SETTINGS };
      }
      
      // Merge DB settings with defaults
      const dbSettings = (org.settings || {}) as Record<string, unknown>;
      
      return {
        orgId: org.id,
        settings: {
          sla_enabled: dbSettings.sla_enabled !== false, // Default true unless explicitly false
          marketplace_enabled: dbSettings.marketplace_enabled !== false,
          gov_connect_enabled: dbSettings.gov_connect_enabled !== false,
          advanced_insights_enabled: dbSettings.advanced_insights_enabled !== false,
          policy_management_mode: (dbSettings.policy_management_mode as OrgSettings['policy_management_mode']) || 'admin_led',
          default_workflow_type: (dbSettings.default_workflow_type as OrgSettings['default_workflow_type']) || 'pre_approval_request',
          require_document_upload: dbSettings.require_document_upload !== false,
          primary_color: org.primary_color || undefined,
          logo_url: org.logo_url || undefined,
        },
      };
    },
    enabled: !!user,
    staleTime: 30000, // Cache for 30 seconds
  });
}

/**
 * Convenience hook to check if SLA is enabled for current org
 */
export function useSlaEnabled(orgId?: string | null): boolean {
  const { data } = useOrgSettings(orgId);
  return data?.settings?.sla_enabled ?? true;
}
