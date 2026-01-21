/**
 * Hook for managing policy templates
 * Admin-driven onboarding for policies
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminAuditLog } from '@/hooks/useAdminAuditLog';
import { toast } from 'sonner';
import type { EligibilityRules, LimitsCaps, WorkflowRules, PolicyContent } from '@/lib/policyEngine';

export interface PolicyTemplate {
  id: string;
  name: string;
  description: string | null;
  category: string;
  benefit_type: string | null;
  transaction_model: string | null;
  default_eligibility_rules: Partial<EligibilityRules> | null;
  default_limits: Partial<LimitsCaps> | null;
  default_required_docs: Array<{
    doc_type: string;
    doc_name: string;
    is_required: boolean;
    transaction_type: 'request' | 'claim';
  }> | null;
  default_workflow: Partial<WorkflowRules> | null;
  default_sla_days: number | null;
  default_content: Partial<PolicyContent> | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTemplateInput {
  name: string;
  description?: string;
  category: string;
  benefit_type?: string;
  transaction_model?: string;
  default_eligibility_rules?: Partial<EligibilityRules>;
  default_limits?: Partial<LimitsCaps>;
  default_required_docs?: PolicyTemplate['default_required_docs'];
  default_workflow?: Partial<WorkflowRules>;
  default_sla_days?: number;
  default_content?: Partial<PolicyContent>;
}

// Fetch all active templates
export function usePolicyTemplates() {
  return useQuery({
    queryKey: ['policy_templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('policy_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return (data || []) as PolicyTemplate[];
    },
  });
}

// Fetch all templates (including inactive) for admin
export function useAllPolicyTemplates() {
  return useQuery({
    queryKey: ['policy_templates_all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('policy_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as PolicyTemplate[];
    },
  });
}

// Fetch templates by category
export function usePolicyTemplatesByCategory(category: string | null) {
  return useQuery({
    queryKey: ['policy_templates', category],
    queryFn: async () => {
      if (!category) return [];
      const { data, error } = await supabase
        .from('policy_templates')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return (data || []) as PolicyTemplate[];
    },
    enabled: !!category,
  });
}

// Create template
export function useCreatePolicyTemplate() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { createAuditLog } = useAdminAuditLog();

  return useMutation({
    mutationFn: async (input: CreateTemplateInput) => {
      const { data, error } = await supabase
        .from('policy_templates')
        .insert({
          ...input,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as PolicyTemplate;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['policy_templates'] });
      queryClient.invalidateQueries({ queryKey: ['policy_templates_all'] });
      createAuditLog({
        action: 'SETTINGS_UPDATE',
        entityType: 'policy',
        entityId: data.id,
        metadata: { name: data.name, category: data.category, action: 'template_create' },
      });
      toast.success('Template created');
    },
    onError: () => {
      toast.error('Failed to create template');
    },
  });
}

// Update template
export function useUpdatePolicyTemplate() {
  const queryClient = useQueryClient();
  const { createAuditLog } = useAdminAuditLog();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PolicyTemplate> & { id: string }) => {
      const { data, error } = await supabase
        .from('policy_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as PolicyTemplate;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['policy_templates'] });
      queryClient.invalidateQueries({ queryKey: ['policy_templates_all'] });
      createAuditLog({
        action: 'SETTINGS_UPDATE',
        entityType: 'policy',
        entityId: data.id,
        metadata: { name: data.name, action: 'template_update' },
      });
      toast.success('Template updated');
    },
    onError: () => {
      toast.error('Failed to update template');
    },
  });
}

// Delete template (soft delete)
export function useDeletePolicyTemplate() {
  const queryClient = useQueryClient();
  const { createAuditLog } = useAdminAuditLog();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('policy_templates')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['policy_templates'] });
      queryClient.invalidateQueries({ queryKey: ['policy_templates_all'] });
      createAuditLog({
        action: 'SETTINGS_UPDATE',
        entityType: 'policy',
        entityId: id,
        metadata: { action: 'template_archive' },
      });
      toast.success('Template archived');
    },
    onError: () => {
      toast.error('Failed to archive template');
    },
  });
}
