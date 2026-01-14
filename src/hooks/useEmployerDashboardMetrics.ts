import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface DashboardMetrics {
  totalEmployees: number;
  annualBudget: number;
  budgetUsed: number;
  budgetRemaining: number;
  utilizationRate: number;
  utilizationTarget: number;
  wasteSpend: number;
  wasteRecoveryPotential: number;
  effectiveSpend: number;
  projectedYearEndSpend: number;
  monthlySpendRate: number;
  monthsElapsed: number;
  monthsRemaining: number;
  satisfactionScore: number | null;
  satisfactionSampleSize: number;
  pendingClaims: number;
  avgProcessingDays: number;
  slaTarget: number;
  fiscalYear: number;
  periodStart: string;
  periodEnd: string;
  lastUpdated: string;
  confidence: {
    budget: 'high' | 'medium' | 'low';
    utilization: 'high' | 'medium' | 'low';
    satisfaction: 'high' | 'medium' | 'low';
    waste: 'high' | 'medium' | 'low';
    retention: 'high' | 'medium' | 'low' | 'not_integrated';
  };
}

export interface BenefitUtilizationStat {
  benefitName: string;
  benefitType: string;
  totalAllocated: number;
  totalUtilized: number;
  utilizationRate: number;
  employeeCount: number;
}

// Fallback metrics for when no real data exists
const FALLBACK_METRICS: DashboardMetrics = {
  totalEmployees: 0,
  annualBudget: 0,
  budgetUsed: 0,
  budgetRemaining: 0,
  utilizationRate: 0,
  utilizationTarget: 75,
  wasteSpend: 0,
  wasteRecoveryPotential: 0,
  effectiveSpend: 0,
  projectedYearEndSpend: 0,
  monthlySpendRate: 0,
  monthsElapsed: new Date().getMonth() + 1,
  monthsRemaining: 12 - (new Date().getMonth() + 1),
  satisfactionScore: null,
  satisfactionSampleSize: 0,
  pendingClaims: 0,
  avgProcessingDays: 0,
  slaTarget: 3,
  fiscalYear: new Date().getFullYear(),
  periodStart: `${new Date().getFullYear()}-01-01`,
  periodEnd: new Date().toISOString().split('T')[0],
  lastUpdated: new Date().toISOString(),
  confidence: {
    budget: 'low',
    utilization: 'low',
    satisfaction: 'low',
    waste: 'low',
    retention: 'not_integrated',
  },
};

export function useEmployerDashboardMetrics(organizationId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['employer-dashboard-metrics', organizationId],
    queryFn: async (): Promise<DashboardMetrics> => {
      if (!organizationId) {
        // Fetch user's organization first
        const { data: profile } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('user_id', user?.id)
          .single();
        
        if (!profile?.organization_id) {
          return FALLBACK_METRICS;
        }
        
        organizationId = profile.organization_id;
      }

      const { data, error } = await supabase
        .rpc('get_employer_dashboard_metrics', {
          p_org_id: organizationId,
        });

      if (error) {
        console.error('Error fetching dashboard metrics:', error);
        return FALLBACK_METRICS;
      }

      return data as unknown as DashboardMetrics;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function useBenefitUtilizationStats(organizationId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['benefit-utilization-stats', organizationId],
    queryFn: async (): Promise<BenefitUtilizationStat[]> => {
      if (!organizationId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('user_id', user?.id)
          .single();
        
        if (!profile?.organization_id) {
          return [];
        }
        
        organizationId = profile.organization_id;
      }

      const { data, error } = await supabase
        .rpc('get_benefit_utilization_stats', {
          p_org_id: organizationId,
        });

      if (error) {
        console.error('Error fetching benefit stats:', error);
        return [];
      }

      return (data || []) as unknown as BenefitUtilizationStat[];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });
}

// Calculate program score from metrics
export function calculateProgramScore(metrics: DashboardMetrics): number {
  // Weights: 40% utilization + 30% satisfaction + 20% cost efficiency + 10% compliance
  const utilizationScore = Math.min(100, (metrics.utilizationRate / metrics.utilizationTarget) * 100);
  const satisfactionScore = metrics.satisfactionScore 
    ? (metrics.satisfactionScore / 5) * 100 
    : 50; // Default to 50% if no data
  const efficiencyScore = metrics.budgetUsed > 0 
    ? (metrics.effectiveSpend / metrics.budgetUsed) * 100 
    : 100;
  const complianceScore = metrics.avgProcessingDays <= metrics.slaTarget ? 100 : 
    Math.max(0, 100 - ((metrics.avgProcessingDays - metrics.slaTarget) * 20));

  return Math.round(
    utilizationScore * 0.4 +
    satisfactionScore * 0.3 +
    efficiencyScore * 0.2 +
    complianceScore * 0.1
  );
}

// Format currency for display
export function formatCurrency(value: number, short = true): string {
  if (short) {
    if (value >= 1_000_000) {
      return `AED ${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
      return `AED ${(value / 1_000).toFixed(0)}K`;
    }
  }
  return `AED ${value.toLocaleString()}`;
}
