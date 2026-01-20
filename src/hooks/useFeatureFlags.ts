import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface FeatureFlags {
  marketplaceEnabled: boolean;
  govConnectEnabled: boolean;
  advancedInsightsEnabled: boolean;
  // Add more feature flags here as needed
}

interface OrganizationSettings {
  marketplace_enabled?: boolean;
  gov_connect_enabled?: boolean;
  advanced_insights_enabled?: boolean;
  // Add more settings as needed
}

const DEFAULT_FLAGS: FeatureFlags = {
  marketplaceEnabled: true, // Default ON
  govConnectEnabled: true,
  advancedInsightsEnabled: true,
};

// Map frontend flag names to DB setting keys
const FLAG_KEY_MAP: Record<keyof FeatureFlags, string> = {
  marketplaceEnabled: 'marketplace_enabled',
  govConnectEnabled: 'gov_connect_enabled',
  advancedInsightsEnabled: 'advanced_insights_enabled',
};

/**
 * Hook to retrieve and manage org-level feature flags from organization settings
 * Persists to database and provides real-time updates
 */
export function useFeatureFlags(targetOrgId?: string): {
  flags: FeatureFlags;
  loading: boolean;
  isAdmin: boolean;
  toggleFlag: (flag: keyof FeatureFlags, value: boolean) => Promise<boolean>;
  refetch: () => void;
} {
  const { user, role } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = role === 'admin' || role === 'employer';

  // Fetch org ID and settings
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['org-feature-flags', user?.id, targetOrgId],
    queryFn: async () => {
      if (!user) return null;

      let orgId = targetOrgId;

      // If no target org specified, get user's own org
      if (!orgId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('user_id', user.id)
          .maybeSingle();

        orgId = profile?.organization_id;
      }

      if (!orgId) return null;

      // Get org settings
      const { data: org, error } = await supabase
        .from('organizations')
        .select('id, settings')
        .eq('id', orgId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching org settings:', error);
        return null;
      }

      return {
        orgId: org?.id,
        settings: (org?.settings as OrganizationSettings) || {},
      };
    },
    enabled: !!user,
    staleTime: 10000, // Cache for 10 seconds
  });

  // Parse flags from settings
  const flags = useMemo<FeatureFlags>(() => {
    if (!data?.settings) return DEFAULT_FLAGS;

    return {
      marketplaceEnabled: data.settings.marketplace_enabled ?? DEFAULT_FLAGS.marketplaceEnabled,
      govConnectEnabled: data.settings.gov_connect_enabled ?? DEFAULT_FLAGS.govConnectEnabled,
      advancedInsightsEnabled: data.settings.advanced_insights_enabled ?? DEFAULT_FLAGS.advancedInsightsEnabled,
    };
  }, [data?.settings]);

  // Mutation to update flags
  const updateMutation = useMutation({
    mutationFn: async ({ flag, value }: { flag: keyof FeatureFlags; value: boolean }) => {
      if (!data?.orgId) throw new Error('No organization found');

      const settingsKey = FLAG_KEY_MAP[flag];
      const newSettings = {
        ...data.settings,
        [settingsKey]: value,
      };

      const { error } = await supabase
        .from('organizations')
        .update({ settings: newSettings })
        .eq('id', data.orgId);

      if (error) throw error;

      return { flag, value, orgId: data.orgId };
    },
    onSuccess: () => {
      // Invalidate the query to refetch
      queryClient.invalidateQueries({ queryKey: ['org-feature-flags'] });
    },
  });

  const toggleFlag = useCallback(async (flag: keyof FeatureFlags, value: boolean): Promise<boolean> => {
    if (!isAdmin || !data?.orgId) return false;

    try {
      await updateMutation.mutateAsync({ flag, value });
      return true;
    } catch (error) {
      console.error('Error updating feature flag:', error);
      return false;
    }
  }, [isAdmin, data?.orgId, updateMutation]);

  return { 
    flags, 
    loading: isLoading, 
    isAdmin, 
    toggleFlag,
    refetch,
  };
}
