/**
 * Shared Utilization Hook - Cross-Portal Consistency
 * 
 * This hook provides a unified interface for calculating and displaying
 * utilization data that is IDENTICAL across Employee and Employer portals.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  calculateUtilization, 
  calculateAggregateUtilization,
  UtilizationResult 
} from '@/lib/crossPortalContract';
import { Database } from '@/integrations/supabase/types';

type BenefitEntitlementRow = Database['public']['Tables']['benefit_entitlements']['Row'];
type BenefitRow = Database['public']['Tables']['benefits']['Row'];

export interface EntitlementWithUtilization extends BenefitEntitlementRow {
  benefit?: BenefitRow | null;
  utilization: UtilizationResult;
}

export interface BenefitUtilizationSummary {
  benefitId: string;
  benefitName: string;
  benefitType: string;
  totalAllocated: number;
  totalUtilized: number;
  employeeCount: number;
  utilization: UtilizationResult;
}

export interface OverallUtilizationSummary {
  totalAllocated: number;
  totalUtilized: number;
  totalRemaining: number;
  overallUtilization: UtilizationResult;
  byBenefit: BenefitUtilizationSummary[];
  byLifeArea: Record<string, UtilizationResult>;
}

/**
 * Get entitlements for a single user with utilization calculated
 * Used by Employee portal
 */
export function useUserEntitlements(userId?: string) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;
  
  return useQuery({
    queryKey: ['user_entitlements', targetUserId],
    queryFn: async (): Promise<EntitlementWithUtilization[]> => {
      if (!targetUserId) return [];
      
      const { data, error } = await supabase
        .from('benefit_entitlements')
        .select('*, benefits(*)')
        .eq('user_id', targetUserId);
      
      if (error) throw error;
      
      return (data || []).map(entitlement => ({
        ...entitlement,
        benefit: entitlement.benefits as BenefitRow | null,
        utilization: calculateUtilization({
          allocated: entitlement.annual_allowance || 0,
          utilized: entitlement.utilized_amount || 0,
        }),
      }));
    },
    enabled: !!targetUserId,
  });
}

/**
 * Get aggregated utilization for an organization
 * Used by Employer portal - requires explicit organizationId
 */
export function useOrganizationUtilization(organizationId: string | null) {
  return useQuery({
    queryKey: ['organization_utilization', organizationId],
    queryFn: async (): Promise<OverallUtilizationSummary> => {
      if (!organizationId) {
        return {
          totalAllocated: 0,
          totalUtilized: 0,
          totalRemaining: 0,
          overallUtilization: calculateUtilization({ allocated: 0, utilized: 0 }),
          byBenefit: [],
          byLifeArea: {},
        };
      }
      
      // Fetch all entitlements with benefits
      const { data: entitlements, error } = await supabase
        .from('benefit_entitlements')
        .select('*, benefits(*)')
        .eq('organization_id', organizationId);
      
      if (error) throw error;
      
      const data = entitlements || [];
      
      // Calculate totals
      const totalAllocated = data.reduce((sum, e) => sum + (e.annual_allowance || 0), 0);
      const totalUtilized = data.reduce((sum, e) => sum + (e.utilized_amount || 0), 0);
      const totalRemaining = Math.max(0, totalAllocated - totalUtilized);
      
      // Group by benefit
      const benefitMap = new Map<string, { 
        benefit: BenefitRow; 
        allocated: number; 
        utilized: number;
        employeeCount: number;
      }>();
      
      data.forEach(e => {
        const benefit = e.benefits as BenefitRow | null;
        if (!benefit) return;
        
        const existing = benefitMap.get(benefit.id) || { 
          benefit, 
          allocated: 0, 
          utilized: 0,
          employeeCount: 0,
        };
        
        existing.allocated += e.annual_allowance || 0;
        existing.utilized += e.utilized_amount || 0;
        existing.employeeCount += 1;
        
        benefitMap.set(benefit.id, existing);
      });
      
      const byBenefit: BenefitUtilizationSummary[] = Array.from(benefitMap.entries()).map(
        ([id, data]) => ({
          benefitId: id,
          benefitName: data.benefit.name,
          benefitType: data.benefit.benefit_type,
          totalAllocated: data.allocated,
          totalUtilized: data.utilized,
          employeeCount: data.employeeCount,
          utilization: calculateUtilization({
            allocated: data.allocated,
            utilized: data.utilized,
          }),
        })
      );
      
      // Group by life area
      const lifeAreaMap = new Map<string, { allocated: number; utilized: number }>();
      
      data.forEach(e => {
        const benefit = e.benefits as BenefitRow | null;
        if (!benefit) return;
        
        const lifeArea = benefit.life_area;
        const existing = lifeAreaMap.get(lifeArea) || { allocated: 0, utilized: 0 };
        existing.allocated += e.annual_allowance || 0;
        existing.utilized += e.utilized_amount || 0;
        lifeAreaMap.set(lifeArea, existing);
      });
      
      const byLifeArea: Record<string, UtilizationResult> = {};
      lifeAreaMap.forEach((data, area) => {
        byLifeArea[area] = calculateUtilization(data);
      });
      
      return {
        totalAllocated,
        totalUtilized,
        totalRemaining,
        overallUtilization: calculateUtilization({ allocated: totalAllocated, utilized: totalUtilized }),
        byBenefit,
        byLifeArea,
      };
    },
    enabled: !!targetOrgId,
  });
}

/**
 * Get my overall utilization summary
 * Used by Employee dashboard
 */
export function useMyUtilizationSummary() {
  const { data: entitlements, ...rest } = useUserEntitlements();
  
  const summary = entitlements ? {
    totalAllocated: entitlements.reduce((sum, e) => sum + (e.annual_allowance || 0), 0),
    totalUtilized: entitlements.reduce((sum, e) => sum + (e.utilized_amount || 0), 0),
    overallUtilization: calculateAggregateUtilization(
      entitlements.map(e => ({
        allocated: e.annual_allowance || 0,
        utilized: e.utilized_amount || 0,
      }))
    ),
    entitlementCount: entitlements.length,
  } : null;
  
  return { data: summary, entitlements, ...rest };
}

/**
 * Compare utilization between two time periods
 * Used for trend calculations in both portals
 */
export function calculateUtilizationTrend(
  current: UtilizationResult,
  previous: UtilizationResult
): {
  rateChange: number;
  direction: 'up' | 'down' | 'stable';
  isImproving: boolean;
} {
  const rateChange = current.rate - previous.rate;
  const direction = rateChange > 0 ? 'up' : rateChange < 0 ? 'down' : 'stable';
  // Improving = rate is going up (more utilization)
  const isImproving = rateChange > 0;
  
  return {
    rateChange,
    direction,
    isImproving,
  };
}
