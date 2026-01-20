import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEmployerViewMode } from '@/contexts/EmployerViewModeContext';

export type EmployerPermission = 
  | 'can_manage_policies'
  | 'can_process_claims'
  | 'can_view_exec_analytics'
  | 'can_manage_integrations';

interface EmployerPermissions {
  can_manage_policies: boolean;
  can_process_claims: boolean;
  can_view_exec_analytics: boolean;
  can_manage_integrations: boolean;
}

interface UseEmployerPermissionsReturn {
  permissions: EmployerPermissions;
  loading: boolean;
  hasPermission: (permission: EmployerPermission) => boolean;
  hasAnyPermission: (permissions: EmployerPermission[]) => boolean;
  hasAllPermissions: (permissions: EmployerPermission[]) => boolean;
  refetch: () => Promise<void>;
}

// Default permissions based on view mode
const getDefaultPermissions = (isExecutive: boolean): EmployerPermissions => ({
  can_manage_policies: !isExecutive,
  can_process_claims: !isExecutive,
  can_view_exec_analytics: isExecutive,
  can_manage_integrations: !isExecutive,
});

export function useEmployerPermissions(): UseEmployerPermissionsReturn {
  const { user } = useAuth();
  const { isExecutive } = useEmployerViewMode();
  const [permissions, setPermissions] = useState<EmployerPermissions>(getDefaultPermissions(isExecutive));
  const [loading, setLoading] = useState(true);

  const fetchPermissions = useCallback(async () => {
    if (!user) {
      setPermissions(getDefaultPermissions(isExecutive));
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('employer_permissions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching permissions:', error);
        // Fall back to defaults based on view mode
        setPermissions(getDefaultPermissions(isExecutive));
      } else if (data) {
        setPermissions({
          can_manage_policies: data.can_manage_policies,
          can_process_claims: data.can_process_claims,
          can_view_exec_analytics: data.can_view_exec_analytics,
          can_manage_integrations: data.can_manage_integrations,
        });
      } else {
        // No permissions record - use defaults based on view mode
        setPermissions(getDefaultPermissions(isExecutive));
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setPermissions(getDefaultPermissions(isExecutive));
    } finally {
      setLoading(false);
    }
  }, [user, isExecutive]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const hasPermission = useCallback((permission: EmployerPermission): boolean => {
    return permissions[permission];
  }, [permissions]);

  const hasAnyPermission = useCallback((perms: EmployerPermission[]): boolean => {
    return perms.some(p => permissions[p]);
  }, [permissions]);

  const hasAllPermissions = useCallback((perms: EmployerPermission[]): boolean => {
    return perms.every(p => permissions[p]);
  }, [permissions]);

  return {
    permissions,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    refetch: fetchPermissions,
  };
}
