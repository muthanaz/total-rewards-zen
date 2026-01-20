import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface FeatureFlags {
  marketplaceEnabled: boolean;
  // Add more feature flags here as needed
}

interface OrganizationSettings {
  marketplace_enabled?: boolean;
  // Add more settings as needed
}

const DEFAULT_FLAGS: FeatureFlags = {
  marketplaceEnabled: false, // Default OFF
};

/**
 * Hook to retrieve org-level feature flags from the organization settings
 * Falls back to defaults if no org or settings found
 */
export function useFeatureFlags(): {
  flags: FeatureFlags;
  loading: boolean;
  isAdmin: boolean;
  toggleFlag: (flag: keyof FeatureFlags, value: boolean) => Promise<void>;
} {
  const { user, role } = useAuth();
  const [orgSettings, setOrgSettings] = useState<OrganizationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState<string | null>(null);

  const isAdmin = role === 'admin' || role === 'employer';

  useEffect(() => {
    const fetchOrgSettings = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // First get the user's organization
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profileError || !profile?.organization_id) {
          setLoading(false);
          return;
        }

        setOrgId(profile.organization_id);

        // Then get the org settings
        const { data: org, error: orgError } = await supabase
          .from('organizations')
          .select('settings')
          .eq('id', profile.organization_id)
          .maybeSingle();

        if (orgError) {
          console.error('Error fetching org settings:', orgError);
          setLoading(false);
          return;
        }

        if (org?.settings && typeof org.settings === 'object') {
          setOrgSettings(org.settings as OrganizationSettings);
        }
      } catch (error) {
        console.error('Error in fetchOrgSettings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrgSettings();
  }, [user]);

  const flags = useMemo<FeatureFlags>(() => ({
    marketplaceEnabled: orgSettings?.marketplace_enabled ?? DEFAULT_FLAGS.marketplaceEnabled,
  }), [orgSettings]);

  const toggleFlag = async (flag: keyof FeatureFlags, value: boolean) => {
    if (!orgId || !isAdmin) return;

    const settingsKey = flag === 'marketplaceEnabled' ? 'marketplace_enabled' : flag;
    
    const newSettings = {
      ...orgSettings,
      [settingsKey]: value,
    };

    const { error } = await supabase
      .from('organizations')
      .update({ settings: newSettings })
      .eq('id', orgId);

    if (!error) {
      setOrgSettings(newSettings);
    } else {
      console.error('Error updating feature flag:', error);
    }
  };

  return { flags, loading, isAdmin, toggleFlag };
}
