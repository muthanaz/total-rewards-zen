import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

export interface MetricDefinition {
  key: string;
  name_en: string;
  name_ar: string | null;
  definition_en: string;
  definition_ar: string | null;
  formula_en: string;
  formula_ar: string | null;
  source: string;
  owner_role: string;
  min_sample_size: number;
  confidence_rules: Record<string, string>;
  updated_at: string;
}

export interface LocalizedMetric {
  key: string;
  name: string;
  definition: string;
  formula: string;
  source: string;
  ownerRole: string;
  minSampleSize: number;
  confidenceRules: Record<string, string>;
  lastUpdated: string;
}

export function useMetricDefinitions() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  return useQuery({
    queryKey: ['metric-definitions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('metric_definitions')
        .select('*')
        .order('key');
      
      if (error) throw error;
      return data as MetricDefinition[];
    },
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
    select: (data) => 
      data?.map((m): LocalizedMetric => ({
        key: m.key,
        name: isArabic && m.name_ar ? m.name_ar : m.name_en,
        definition: isArabic && m.definition_ar ? m.definition_ar : m.definition_en,
        formula: isArabic && m.formula_ar ? m.formula_ar : m.formula_en,
        source: m.source,
        ownerRole: m.owner_role,
        minSampleSize: m.min_sample_size,
        confidenceRules: (m.confidence_rules as Record<string, string>) || {},
        lastUpdated: m.updated_at,
      })) || [],
  });
}

export function useMetricDefinition(key: string) {
  const { data: definitions, isLoading, error } = useMetricDefinitions();
  
  const metric = definitions?.find((d) => d.key === key);
  
  return {
    metric,
    isLoading,
    error,
    // Convenience getters
    definition: metric?.definition,
    formula: metric?.formula,
    source: metric?.source,
    lastUpdated: metric?.lastUpdated,
    confidence: metric?.confidenceRules,
  };
}
