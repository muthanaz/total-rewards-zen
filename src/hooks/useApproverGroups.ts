/**
 * Hook for managing approver groups
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ApproverGroup {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  members?: ApproverGroupMember[];
}

export interface ApproverGroupMember {
  id: string;
  group_id: string;
  user_id: string;
  is_active: boolean;
  added_at: string;
  profile?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  };
}

export function useApproverGroups() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['approver_groups', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('approver_groups')
        .select('*, approver_group_members(*, profile:profiles(first_name, last_name, email))')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return (data || []) as ApproverGroup[];
    },
    enabled: !!user,
  });

  const createGroup = useMutation({
    mutationFn: async (group: { name: string; description?: string }) => {
      // Get user's organization
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', user?.id)
        .single();
      
      if (!profile?.organization_id) throw new Error('Organization not found');

      const { data, error } = await supabase
        .from('approver_groups')
        .insert({
          name: group.name,
          description: group.description,
          organization_id: profile.organization_id,
          created_by: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approver_groups'] });
      toast.success('Approver group created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create group');
    },
  });

  const updateGroup = useMutation({
    mutationFn: async (group: { id: string; name?: string; description?: string }) => {
      const { id, ...rest } = group;
      const { error } = await supabase
        .from('approver_groups')
        .update({ ...rest, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approver_groups'] });
      toast.success('Group updated');
    },
  });

  const deleteGroup = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('approver_groups')
        .update({ is_active: false })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approver_groups'] });
      toast.success('Group deleted');
    },
  });

  const addMember = useMutation({
    mutationFn: async ({ groupId, userId }: { groupId: string; userId: string }) => {
      const { data, error } = await supabase
        .from('approver_group_members')
        .insert({
          group_id: groupId,
          user_id: userId,
          added_by: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approver_groups'] });
      toast.success('Member added');
    },
  });

  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('approver_group_members')
        .delete()
        .eq('id', memberId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approver_groups'] });
      toast.success('Member removed');
    },
  });

  return {
    groups: query.data || [],
    isLoading: query.isLoading,
    createGroup,
    updateGroup,
    deleteGroup,
    addMember,
    removeMember,
    isCreating: createGroup.isPending,
  };
}
