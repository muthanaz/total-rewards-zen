/**
 * Hook for managing workflow definitions
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useWorkflowDefinitions(workflowType: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['workflow_definitions', workflowType, user?.id],
    queryFn: async () => {
      // First get user's organization
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', user?.id)
        .maybeSingle();

      const orgId = profile?.organization_id;

      const { data, error } = await supabase
        .from('workflow_definitions')
        .select('*, workflow_steps(*, approver_group:approver_groups(id, name))')
        .eq('workflow_type', workflowType)
        .or(orgId ? `organization_id.eq.${orgId},organization_id.is.null` : 'organization_id.is.null')
        .eq('is_active', true)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const createWorkflow = useMutation({
    mutationFn: async (workflow: { name: string; description?: string; is_default?: boolean }) => {
      const { data, error } = await supabase
        .from('workflow_definitions')
        .insert({
          name: workflow.name,
          description: workflow.description,
          workflow_type: workflowType,
          is_default: workflow.is_default || false,
          created_by: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow_definitions', workflowType] });
      toast.success('Workflow created');
    },
  });

  const updateWorkflow = useMutation({
    mutationFn: async (workflow: { id: string } & Record<string, any>) => {
      const { id, ...rest } = workflow;
      const { error } = await supabase
        .from('workflow_definitions')
        .update({ ...rest, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow_definitions', workflowType] });
      toast.success('Workflow updated');
    },
  });

  const deleteWorkflow = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('workflow_definitions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow_definitions', workflowType] });
      toast.success('Workflow deleted');
    },
  });

  const setDefaultWorkflow = useMutation({
    mutationFn: async (id: string) => {
      // First, unset any existing default
      await supabase
        .from('workflow_definitions')
        .update({ is_default: false })
        .eq('workflow_type', workflowType);
      
      // Set new default
      const { error } = await supabase
        .from('workflow_definitions')
        .update({ is_default: true })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow_definitions', workflowType] });
      toast.success('Default workflow updated');
    },
  });

  return {
    workflows: query.data,
    isLoading: query.isLoading,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    setDefaultWorkflow,
    isCreating: createWorkflow.isPending,
  };
}
