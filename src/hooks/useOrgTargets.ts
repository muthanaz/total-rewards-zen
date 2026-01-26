/**
 * Hook for managing organization targets and data thresholds
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useOrgTargets() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const targetsQuery = useQuery({
    queryKey: ['org_targets', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('org_targets')
        .select('*')
        .order('metric_key');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const thresholdsQuery = useQuery({
    queryKey: ['org_data_thresholds', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('org_data_thresholds')
        .select('*')
        .order('metric_key');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const updateTarget = useMutation({
    mutationFn: async (target: { metric_key: string; target_value: number }) => {
      const { data, error } = await supabase
        .from('org_targets')
        .upsert({
          metric_key: target.metric_key,
          target_value: target.target_value,
          fiscal_year: new Date().getFullYear(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'organization_id,metric_key,fiscal_year' })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org_targets'] });
      toast.success('Target updated');
    },
  });

  const updateThreshold = useMutation({
    mutationFn: async (threshold: { metric_key: string; min_sample_size: number; min_coverage_percent: number }) => {
      const { data, error } = await supabase
        .from('org_data_thresholds')
        .upsert(threshold, { onConflict: 'organization_id,metric_key' })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org_data_thresholds'] });
      toast.success('Threshold updated');
    },
  });

  return {
    targets: targetsQuery.data,
    thresholds: thresholdsQuery.data,
    isLoading: targetsQuery.isLoading || thresholdsQuery.isLoading,
    updateTarget,
    updateThreshold,
    isSaving: updateTarget.isPending || updateThreshold.isPending,
  };
}
