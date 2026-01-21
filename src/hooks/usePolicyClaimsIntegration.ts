/**
 * Hook for Policy-Claims Integration
 * Provides real-time eligibility, limits, required docs and workflow for claims review
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { 
  EligibilityRules, 
  LimitsCaps, 
  WorkflowRules, 
  PolicyLogic,
  EmployeeContext,
} from '@/lib/policyEngine';
import { 
  checkEligibility, 
  DEFAULT_ELIGIBILITY_RULES,
  DEFAULT_LIMITS_CAPS,
  DEFAULT_WORKFLOW,
} from '@/lib/policyEngine';

export interface PolicyRequiredDocForClaims {
  id: string;
  doc_type: string;
  doc_name: string;
  description: string | null;
  is_required: boolean;
  transaction_type: 'request' | 'claim' | 'both';
  conditions_json: Record<string, unknown> | null;
}

export interface PolicyForClaims {
  policyId: string;
  policyRef: string;
  policyTitle: string;
  transactionModel: string;
  eligibilityRules: EligibilityRules;
  limits: LimitsCaps;
  workflow: WorkflowRules;
  requiredDocs: PolicyRequiredDocForClaims[];
  slaEnabled: boolean;
  slaDays: number;
}

export interface ClaimsEligibilityResult {
  eligible: boolean;
  reasons: string[];
  policyRef: string;
}

export interface ClaimsLimitsResult {
  annualCap: number | null;
  perTransactionMax: number | null;
  utilizationBefore: number;
  remainingBefore: number;
  claimAmount: number;
  projectedUtilization: number;
  remainingAfter: number;
  isOverLimit: boolean;
  overLimitAmount: number;
  currency: string;
}

export interface ClaimsWorkflowResult {
  currentApprover: string;
  escalationPath: string | null;
  slaDays: number | null;
  autoApproveEnabled: boolean;
  autoApproveThreshold: number | null;
}

// Fetch policy for a specific benefit category and organization
export function usePolicyForClaims(
  benefitCategory: string | null,
  organizationId: string | null
) {
  return useQuery({
    queryKey: ['policy_for_claims', benefitCategory, organizationId],
    queryFn: async (): Promise<PolicyForClaims | null> => {
      if (!benefitCategory || !organizationId) return null;

      // Find the policy by category (life_area) and organization
      const { data: policy, error: policyError } = await supabase
        .from('policies')
        .select('id, policy_ref, title, transaction_model, status')
        .eq('organization_id', organizationId)
        .eq('category', benefitCategory)
        .eq('is_active', true)
        .eq('status', 'published')
        .maybeSingle();

      if (policyError || !policy) {
        // Try to find by benefit_key matching the category
        const { data: fallbackPolicy } = await supabase
          .from('policies')
          .select('id, policy_ref, title, transaction_model, status')
          .eq('organization_id', organizationId)
          .eq('is_active', true)
          .eq('status', 'published')
          .ilike('title', `%${benefitCategory}%`)
          .maybeSingle();

        if (!fallbackPolicy) return null;
        
        // Use fallback policy
        return fetchPolicyDetails(fallbackPolicy);
      }

      return fetchPolicyDetails(policy);
    },
    enabled: !!benefitCategory && !!organizationId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

async function fetchPolicyDetails(policy: {
  id: string;
  policy_ref: string;
  title: string;
  transaction_model: string | null;
}): Promise<PolicyForClaims> {
  // Fetch published version
  const { data: version } = await supabase
    .from('policy_versions')
    .select('id, logic_json')
    .eq('policy_id', policy.id)
    .eq('status', 'published')
    .order('version_number', { ascending: false })
    .limit(1)
    .maybeSingle();

  // Fetch required docs
  const requiredDocs: PolicyRequiredDocForClaims[] = [];
  if (version?.id) {
    const { data: docs } = await supabase
      .from('policy_required_docs')
      .select('*')
      .eq('policy_version_id', version.id);
    
    if (docs) {
      requiredDocs.push(...(docs as PolicyRequiredDocForClaims[]));
    }
  }

  // Parse logic_json safely
  const logicRaw = version?.logic_json as Record<string, unknown> | null;

  const eligibility = ((logicRaw?.eligibility_rules || logicRaw?.eligibility) ?? DEFAULT_ELIGIBILITY_RULES) as EligibilityRules;
  const limits = ((logicRaw?.limits_caps || logicRaw?.limits) ?? DEFAULT_LIMITS_CAPS) as LimitsCaps;
  const workflow = (logicRaw?.workflow ?? DEFAULT_WORKFLOW) as WorkflowRules;

  return {
    policyId: policy.id,
    policyRef: policy.policy_ref,
    policyTitle: policy.title,
    transactionModel: policy.transaction_model || 'claim_only',
    eligibilityRules: eligibility,
    limits: limits,
    workflow: workflow,
    requiredDocs,
    slaEnabled: !!workflow.sla_days && workflow.sla_days > 0,
    slaDays: workflow.sla_days || 5,
  };
}

// Hook to compute eligibility for a specific employee against a policy
export function useClaimEligibility(
  policy: PolicyForClaims | null | undefined,
  employeeContext: EmployeeContext | null
) {
  return useMemo((): ClaimsEligibilityResult | null => {
    if (!policy || !employeeContext) return null;

    const result = checkEligibility(employeeContext, policy.eligibilityRules);

    return {
      eligible: result.eligible,
      reasons: result.reasons,
      policyRef: policy.policyRef,
    };
  }, [policy, employeeContext]);
}

// Hook to compute limits for a claim
export function useClaimLimits(
  policy: PolicyForClaims | null | undefined,
  claimAmount: number,
  currentUtilization: number
): ClaimsLimitsResult | null {
  return useMemo(() => {
    if (!policy) return null;

    const { limits } = policy;
    const annualCap = limits.annual_cap;
    const perTransactionMax = limits.per_transaction_cap;

    const utilizationBefore = currentUtilization;
    const remainingBefore = annualCap ? Math.max(0, annualCap - utilizationBefore) : Infinity;
    
    const projectedUtilization = utilizationBefore + claimAmount;
    const remainingAfterRaw = annualCap ? annualCap - projectedUtilization : Infinity;
    const remainingAfter = Math.max(0, remainingAfterRaw);
    
    let isOverLimit = false;
    let overLimitAmount = 0;

    // Check annual cap
    if (annualCap && projectedUtilization > annualCap) {
      isOverLimit = true;
      overLimitAmount = projectedUtilization - annualCap;
    }

    // Check per-transaction max
    if (perTransactionMax && claimAmount > perTransactionMax) {
      isOverLimit = true;
      overLimitAmount = Math.max(overLimitAmount, claimAmount - perTransactionMax);
    }

    return {
      annualCap,
      perTransactionMax,
      utilizationBefore,
      remainingBefore: remainingBefore === Infinity ? -1 : remainingBefore, // -1 means unlimited
      claimAmount,
      projectedUtilization,
      remainingAfter: remainingAfter === Infinity ? -1 : remainingAfter,
      isOverLimit,
      overLimitAmount,
      currency: limits.annual_cap_currency || 'AED',
    };
  }, [policy, claimAmount, currentUtilization]);
}

// Hook to get workflow info for a claim
export function useClaimWorkflow(
  policy: PolicyForClaims | null | undefined
): ClaimsWorkflowResult | null {
  return useMemo(() => {
    if (!policy) return null;

    const { workflow, slaEnabled, slaDays } = policy;
    const preApprovalThreshold = policy.limits.pre_approval_threshold;

    return {
      currentApprover: getApproverLabel(workflow.approver_role),
      escalationPath: workflow.escalation_role ? getApproverLabel(workflow.escalation_role) : null,
      slaDays: slaEnabled ? slaDays : null,
      autoApproveEnabled: !!preApprovalThreshold && preApprovalThreshold > 0,
      autoApproveThreshold: preApprovalThreshold || null,
    };
  }, [policy]);
}

function getApproverLabel(role: string): string {
  const labels: Record<string, string> = {
    manager: 'Line Manager',
    hr: 'HR Operations',
    hr_ops: 'HR Operations',
    hr_manager: 'HR Manager',
    department_head: 'Department Head',
    finance: 'Finance Team',
    admin: 'Administrator',
  };
  return labels[role] || role;
}

// Hook to get required docs filtered by transaction type
export function useClaimRequiredDocs(
  policy: PolicyForClaims | null | undefined,
  transactionType: 'request' | 'claim'
): PolicyRequiredDocForClaims[] {
  return useMemo(() => {
    if (!policy) return [];
    return policy.requiredDocs.filter(
      doc => doc.transaction_type === transactionType || 
             doc.transaction_type === 'both' || 
             doc.transaction_type === 'claim'
    );
  }, [policy, transactionType]);
}
