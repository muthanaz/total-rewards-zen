import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface EmployerAction {
  id: string;
  organization_id: string;
  title: string;
  description: string | null;
  metric_keys: string[];
  expected_impact: {
    metric?: string;
    target?: string;
    savings?: number;
    improvement?: string;
  } | null;
  owner_user_id: string | null;
  status: 'planned' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  due_date: string | null;
  source_insight: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface CreateActionInput {
  title: string;
  description?: string;
  metric_keys?: string[];
  expected_impact?: { metric?: string; target?: string; savings?: number; improvement?: string };
  owner_user_id?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  due_date?: string;
  source_insight?: string;
}

export interface UpdateActionInput {
  id: string;
  title?: string;
  description?: string;
  status?: 'planned' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  due_date?: string;
  owner_user_id?: string;
}

export function useEmployerActions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['employer-actions', user?.id],
    queryFn: async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', user!.id)
        .single();

      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('employer_actions')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as EmployerAction[];
    },
    enabled: !!user,
  });
}

export function useCreateAction() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateActionInput) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', user!.id)
        .single();

      if (!profile?.organization_id) throw new Error('No organization found');

      const { data, error } = await supabase
        .from('employer_actions')
        .insert([{
          organization_id: profile.organization_id,
          title: input.title,
          description: input.description || null,
          metric_keys: input.metric_keys || [],
          expected_impact: (input.expected_impact || {}) as Json,
          owner_user_id: input.owner_user_id || null,
          priority: input.priority || 'medium',
          due_date: input.due_date || null,
          source_insight: input.source_insight || null,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employer-actions'] });
      toast.success('Action created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create action: ' + error.message);
    },
  });
}

export function useUpdateAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateActionInput) => {
      const updateData: Record<string, unknown> = {};
      
      if (input.title !== undefined) updateData.title = input.title;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.status !== undefined) {
        updateData.status = input.status;
        if (input.status === 'completed') {
          updateData.completed_at = new Date().toISOString();
        }
      }
      if (input.priority !== undefined) updateData.priority = input.priority;
      if (input.due_date !== undefined) updateData.due_date = input.due_date;
      if (input.owner_user_id !== undefined) updateData.owner_user_id = input.owner_user_id;

      const { data, error } = await supabase
        .from('employer_actions')
        .update(updateData)
        .eq('id', input.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employer-actions'] });
      toast.success('Action updated');
    },
    onError: (error) => {
      toast.error('Failed to update action: ' + error.message);
    },
  });
}

export function useDeleteAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('employer_actions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employer-actions'] });
      toast.success('Action deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete action: ' + error.message);
    },
  });
}

export function useActionStats() {
  const { data: actions } = useEmployerActions();

  return {
    total: actions?.length || 0,
    planned: actions?.filter(a => a.status === 'planned').length || 0,
    inProgress: actions?.filter(a => a.status === 'in_progress').length || 0,
    completed: actions?.filter(a => a.status === 'completed').length || 0,
    blocked: actions?.filter(a => a.status === 'blocked').length || 0,
    overdue: actions?.filter(a => 
      a.due_date && new Date(a.due_date) < new Date() && 
      !['completed', 'cancelled'].includes(a.status)
    ).length || 0,
  };
}
