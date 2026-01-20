/**
 * Claim Entitlements Hook - Cross-Portal Consistency
 * 
 * This hook provides entitlement validation for claims review.
 * Used by the Employer ClaimReviewSheet to check:
 * - Annual allowance
 * - Utilized amount
 * - Remaining balance
 * - Grade-based eligibility
 * - Max per transaction limits
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { calculateUtilization } from '@/lib/crossPortalContract';
import { Database } from '@/integrations/supabase/types';

type EntitlementRow = Database['public']['Tables']['benefit_entitlements']['Row'];
type GradeEligibilityRow = Database['public']['Tables']['benefit_grade_eligibility']['Row'];
type BenefitRow = Database['public']['Tables']['benefits']['Row'];
type RequestRow = Database['public']['Tables']['requests']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export interface ClaimEntitlementCheck {
  hasEntitlement: boolean;
  annualAllowance: number;
  utilizedAmount: number;
  remainingAmount: number;
  utilizationRate: number;
  utilizationStatus: 'unused' | 'low' | 'moderate' | 'high' | 'full' | 'over';
  maxPerTransaction: number | null;
  coveragePercent: number | null;
  requiresDocumentation: boolean;
  waitingPeriodDays: number | null;
  notes: string | null;
  employeeGrade: string | null;
  benefit: BenefitRow | null;
  gradeEligibility: GradeEligibilityRow | null;
  entitlement: EntitlementRow | null;
}

export interface ClaimValidation {
  isValid: boolean;
  warnings: ClaimWarning[];
  blockers: ClaimBlocker[];
}

export interface ClaimWarning {
  type: 'exceeds_remaining' | 'high_utilization' | 'near_limit' | 'no_entitlement';
  message: string;
  details?: string;
}

export interface ClaimBlocker {
  type: 'not_eligible' | 'waiting_period' | 'exceeds_max_transaction';
  message: string;
  details?: string;
}

/**
 * Fetch entitlement data for a specific claim
 * Used by ClaimReviewSheet to validate employee eligibility
 */
export function useClaimEntitlementCheck(
  userId: string | null,
  benefitId: string | null,
  organizationId: string | null
) {
  return useQuery({
    queryKey: ['claim_entitlement_check', userId, benefitId, organizationId],
    queryFn: async (): Promise<ClaimEntitlementCheck> => {
      if (!userId || !benefitId || !organizationId) {
        return createEmptyCheck();
      }

      // Get employee profile for grade
      const { data: profile } = await supabase
        .from('profiles')
        .select('grade')
        .eq('user_id', userId)
        .single();

      // Get benefit details
      const { data: benefit } = await supabase
        .from('benefits')
        .select('*')
        .eq('id', benefitId)
        .single();

      // Get employee's entitlement for this benefit
      const { data: entitlement } = await supabase
        .from('benefit_entitlements')
        .select('*')
        .eq('user_id', userId)
        .eq('benefit_id', benefitId)
        .maybeSingle();

      // Get grade eligibility rules
      const { data: gradeEligibility } = await supabase
        .from('benefit_grade_eligibility')
        .select('*')
        .eq('benefit_id', benefitId)
        .eq('grade', profile?.grade || '')
        .maybeSingle();

      // Calculate utilization
      const annualAllowance = entitlement?.annual_allowance || gradeEligibility?.annual_allowance || 0;
      const utilizedAmount = entitlement?.utilized_amount || 0;
      const utilization = calculateUtilization({
        allocated: annualAllowance,
        utilized: utilizedAmount,
      });

      return {
        hasEntitlement: !!entitlement || !!gradeEligibility?.is_eligible,
        annualAllowance,
        utilizedAmount,
        remainingAmount: utilization.remaining,
        utilizationRate: utilization.rate,
        utilizationStatus: utilization.status,
        maxPerTransaction: gradeEligibility?.max_claim_per_transaction || null,
        coveragePercent: gradeEligibility?.coverage_percent || null,
        requiresDocumentation: gradeEligibility?.requires_documentation || false,
        waitingPeriodDays: gradeEligibility?.waiting_period_days || null,
        notes: gradeEligibility?.notes || null,
        employeeGrade: profile?.grade || null,
        benefit: benefit || null,
        gradeEligibility: gradeEligibility || null,
        entitlement: entitlement || null,
      };
    },
    enabled: !!userId && !!benefitId && !!organizationId,
  });
}

/**
 * Validate a specific claim amount against entitlements
 */
export function useClaimValidation(
  entitlementCheck: ClaimEntitlementCheck | null | undefined,
  claimAmount: number | null
) {
  const warnings: ClaimWarning[] = [];
  const blockers: ClaimBlocker[] = [];

  if (!entitlementCheck) {
    return { isValid: true, warnings: [], blockers: [] };
  }

  // Check if employee has entitlement
  if (!entitlementCheck.hasEntitlement) {
    warnings.push({
      type: 'no_entitlement',
      message: 'No entitlement record found',
      details: 'Employee may not have an active entitlement for this benefit. Consider creating one or verifying eligibility.',
    });
  }

  // Check if claim exceeds remaining allowance
  if (claimAmount && entitlementCheck.remainingAmount > 0 && claimAmount > entitlementCheck.remainingAmount) {
    warnings.push({
      type: 'exceeds_remaining',
      message: 'Claim exceeds remaining allowance',
      details: `Requested: AED ${claimAmount.toLocaleString()}, Available: AED ${entitlementCheck.remainingAmount.toLocaleString()}. Top-up may be needed.`,
    });
  }

  // Check max per transaction
  if (claimAmount && entitlementCheck.maxPerTransaction && claimAmount > entitlementCheck.maxPerTransaction) {
    blockers.push({
      type: 'exceeds_max_transaction',
      message: 'Exceeds maximum per transaction',
      details: `Maximum allowed per claim: AED ${entitlementCheck.maxPerTransaction.toLocaleString()}`,
    });
  }

  // High utilization warning
  if (entitlementCheck.utilizationRate >= 80 && entitlementCheck.utilizationRate < 100) {
    warnings.push({
      type: 'high_utilization',
      message: `${entitlementCheck.utilizationRate}% of annual allowance utilized`,
      details: `Only AED ${entitlementCheck.remainingAmount.toLocaleString()} remaining for the year.`,
    });
  }

  return {
    isValid: blockers.length === 0,
    warnings,
    blockers,
  };
}

/**
 * Get all entitlements for an employee (for comprehensive view)
 */
export function useEmployeeEntitlements(userId: string | null) {
  return useQuery({
    queryKey: ['employee_entitlements', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('benefit_entitlements')
        .select('*, benefits(*)')
        .eq('user_id', userId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
}

/**
 * Lookup benefit by category (for matching claims to benefits)
 */
export function useBenefitByCategory(category: string | null) {
  return useQuery({
    queryKey: ['benefit_by_category', category],
    queryFn: async () => {
      if (!category) return null;

      // Try exact match first
      const { data } = await supabase
        .from('benefits')
        .select('*')
        .ilike('name', `%${category}%`)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      return data;
    },
    enabled: !!category,
  });
}

function createEmptyCheck(): ClaimEntitlementCheck {
  return {
    hasEntitlement: false,
    annualAllowance: 0,
    utilizedAmount: 0,
    remainingAmount: 0,
    utilizationRate: 0,
    utilizationStatus: 'unused',
    maxPerTransaction: null,
    coveragePercent: null,
    requiresDocumentation: false,
    waitingPeriodDays: null,
    notes: null,
    employeeGrade: null,
    benefit: null,
    gradeEligibility: null,
    entitlement: null,
  };
}
