/**
 * Hook for managing organization structure entities
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type EntityType = 'legal_entities' | 'business_units' | 'departments' | 'cost_centers' | 'locations' | 'grades' | 'employment_types' | 'segment_tags';

const TABLE_MAP: Record<EntityType, string> = {
  legal_entities: 'org_legal_entities',
  business_units: 'org_business_units',
  departments: 'org_departments',
  cost_centers: 'org_cost_centers',
  locations: 'org_locations',
  grades: 'org_grades',
  employment_types: 'org_employment_types',
  segment_tags: 'org_segment_tags',
};

export function useOrgStructure(entityType: EntityType) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const tableName = TABLE_MAP[entityType];

  const query = useQuery({
    queryKey: ['org_structure', entityType, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(tableName as any)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const createEntity = useMutation({
    mutationFn: async (entity: Record<string, any>) => {
      const { data, error } = await supabase
        .from(tableName as any)
        .insert({ ...entity, created_by: user?.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org_structure', entityType] });
      toast.success('Created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateEntity = useMutation({
    mutationFn: async (entity: { id: string } & Record<string, any>) => {
      const { id, ...rest } = entity;
      const { error } = await supabase
        .from(tableName as any)
        .update({ ...rest, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org_structure', entityType] });
      toast.success('Updated successfully');
    },
  });

  const deleteEntity = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(tableName as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org_structure', entityType] });
      toast.success('Deleted successfully');
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    createEntity,
    updateEntity,
    deleteEntity,
    isCreating: createEntity.isPending,
  };
}
