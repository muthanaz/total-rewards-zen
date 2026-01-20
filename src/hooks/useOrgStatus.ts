import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface OrgStatus {
  status: 'active' | 'suspended';
  name: string;
  id: string;
}

/**
 * Hook to check the current user's organization status
 * Used for enforcing org suspension across portals
 */
export function useOrgStatus() {
  const { user, role } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['org-status', user?.id],
    queryFn: async (): Promise<OrgStatus | null> => {
      if (!user) return null;

      // First get the user's org ID from profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError || !profile?.organization_id) {
        return null;
      }

      // Then get the org status
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('id, name, status')
        .eq('id', profile.organization_id)
        .maybeSingle();

      if (orgError || !org) {
        return null;
      }

      return {
        id: org.id,
        name: org.name,
        status: (org.status as 'active' | 'suspended') || 'active',
      };
    },
    enabled: !!user && role !== 'admin', // Admins bypass suspension check
    staleTime: 30000, // Cache for 30 seconds
  });

  return {
    orgStatus: data,
    isLoading,
    isSuspended: data?.status === 'suspended',
    error,
  };
}
