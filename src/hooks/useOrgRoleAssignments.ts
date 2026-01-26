/**
 * Hook for managing organization role assignments
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useOrgRoleAssignments() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['org_role_assignments', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('org_role_assignments')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const assignRole = useMutation({
    mutationFn: async (assignment: { user_id: string; employer_role: string; scope_type?: string }) => {
      const { data, error } = await supabase
        .from('org_role_assignments')
        .insert({ ...assignment, assigned_by: user?.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org_role_assignments'] });
      toast.success('Role assigned');
    },
  });

  const revokeRole = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('org_role_assignments')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org_role_assignments'] });
      toast.success('Role revoked');
    },
  });

  return {
    assignments: query.data,
    isLoading: query.isLoading,
    assignRole,
    revokeRole,
    isAssigning: assignRole.isPending,
  };
}
