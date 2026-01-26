/**
 * Hook for managing action approvals
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ActionApproval {
  id: string;
  action_id: string;
  workflow_definition_id: string | null;
  current_step_order: number;
  approval_status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  submitted_by: string | null;
  submitted_at: string;
  decided_at: string | null;
  action?: {
    id: string;
    title: string;
    action_type: string | null;
    priority: string | null;
    expected_impact_min_aed: number | null;
    expected_impact_max_aed: number | null;
    owner_user_id: string | null;
  };
  steps?: ActionApprovalStep[];
}

export interface ActionApprovalStep {
  id: string;
  approval_id: string;
  step_order: number;
  approver_group_id: string | null;
  assigned_approver_user_id: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  decision_note: string | null;
  decided_at: string | null;
  sla_due_at: string | null;
  approver_group?: {
    name: string;
  };
}

export function useActionApprovals() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['action_approvals', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('action_approvals')
        .select(`
          *,
          action:employer_actions(id, title, action_type, priority, expected_impact_min_aed, expected_impact_max_aed, owner_user_id),
          steps:action_approval_steps(*, approver_group:approver_groups(name))
        `)
        .order('submitted_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as ActionApproval[];
    },
    enabled: !!user,
  });

  const pendingApprovals = query.data?.filter(a => a.approval_status === 'pending') || [];
  const overdueApprovals = pendingApprovals.filter(a => {
    const currentStep = a.steps?.find(s => s.step_order === a.current_step_order);
    if (!currentStep?.sla_due_at) return false;
    return new Date(currentStep.sla_due_at) < new Date();
  });

  const submitForApproval = useMutation({
    mutationFn: async ({ actionId, workflowDefinitionId }: { actionId: string; workflowDefinitionId: string }) => {
      const { data, error } = await supabase
        .rpc('submit_action_for_approval', {
          p_action_id: actionId,
          p_workflow_definition_id: workflowDefinitionId,
        });
      
      if (error) throw error;
      const result = data as { success: boolean; error?: string; approval_id?: string; action_id?: string; steps_created?: number };
      if (!result?.success) throw new Error(result?.error || 'Failed to submit');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['action_approvals'] });
      queryClient.invalidateQueries({ queryKey: ['employer_actions'] });
      toast.success('Submitted for approval');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit');
    },
  });

  const decideStep = useMutation({
    mutationFn: async ({ stepId, decision, note }: { stepId: string; decision: 'approved' | 'rejected'; note?: string }) => {
      const { data, error } = await supabase
        .rpc('decide_approval_step', {
          p_step_id: stepId,
          p_decision: decision,
          p_note: note || null,
        });
      
      if (error) throw error;
      const result = data as { success: boolean; error?: string; final_status?: string; next_step?: number };
      if (!result?.success) throw new Error(result?.error || 'Failed to decide');
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['action_approvals'] });
      queryClient.invalidateQueries({ queryKey: ['employer_actions'] });
      if (data.final_status === 'approved') {
        toast.success('Action approved');
      } else if (data.final_status === 'rejected') {
        toast.success('Action rejected');
      } else {
        toast.success('Step approved, moved to next approver');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to decide');
    },
  });

  // Calculate metrics
  const metrics = {
    pending: pendingApprovals.length,
    overdue: overdueApprovals.length,
    avgApprovalTime: query.data?.filter(a => a.decided_at)
      .reduce((acc, a) => {
        const submitted = new Date(a.submitted_at).getTime();
        const decided = new Date(a.decided_at!).getTime();
        return acc + (decided - submitted) / (1000 * 60 * 60 * 24);
      }, 0) / (query.data?.filter(a => a.decided_at).length || 1) || 0,
  };

  return {
    approvals: query.data || [],
    pendingApprovals,
    overdueApprovals,
    metrics,
    isLoading: query.isLoading,
    submitForApproval,
    decideStep,
  };
}
