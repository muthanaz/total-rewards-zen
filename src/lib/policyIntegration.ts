/**
 * Policy Integration - Cross-Portal Helper
 * 
 * This module provides the main integration point between Policies and Claims.
 * It exposes getActivePolicyForBenefit() which returns the published policy + logic
 * for use in claims validation and UI rendering.
 */

import { supabase } from '@/integrations/supabase/client';
import {
  PolicyLogic,
  PolicyContent,
  PolicyRequiredDoc,
  PolicyValidationResult,
  EmployeeContext,
  DEFAULT_POLICY_LOGIC,
  checkEligibility,
} from '@/lib/policyEngine';

export interface ActivePolicy {
  policyId: string;
  policyRef: string;
  title: string;
  benefitKey: string | null;
  versionId: string;
  versionNumber: number;
  status: string;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  content: PolicyContent;
  logic: PolicyLogic;
  requiredDocs: PolicyRequiredDoc[];
}

/**
 * Get the active (published) policy for a benefit
 * 
 * @param benefitKey - The benefit ID or key to look up
 * @param organizationId - The organization ID
 * @returns The active policy or null if not found
 */
export async function getActivePolicyForBenefit(
  benefitKey: string,
  organizationId: string
): Promise<ActivePolicy | null> {
  try {
    // First, try to find a policy by benefit_key
    let policyQuery = await supabase
      .from('policies')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .or(`benefit_key.eq.${benefitKey},category.ilike.%${benefitKey}%`)
      .limit(1)
      .maybeSingle();

    if (policyQuery.error) throw policyQuery.error;

    const policy = policyQuery.data;
    if (!policy) return null;

    // Get the published version
    const { data: version, error: versionError } = await (supabase
      .from('policy_versions' as any)
      .select('*')
      .eq('policy_id', policy.id)
      .eq('status', 'published')
      .maybeSingle()) as any;

    if (versionError) throw versionError;
    if (!version) return null;

    // Get required docs
    const { data: docs } = await (supabase
      .from('policy_required_docs' as any)
      .select('*')
      .eq('policy_version_id', version.id)) as any;

    return {
      policyId: policy.id,
      policyRef: policy.policy_ref,
      title: policy.title,
      benefitKey: policy.benefit_key,
      versionId: version.id,
      versionNumber: version.version_number,
      status: version.status,
      effectiveFrom: version.effective_from,
      effectiveTo: version.effective_to,
      content: version.content_json || { summary: [], details: '', examples: [], faqs: [], pitfalls: [] },
      logic: version.logic_json || DEFAULT_POLICY_LOGIC,
      requiredDocs: (docs || []) as PolicyRequiredDoc[],
    };
  } catch (error) {
    console.error('Error fetching active policy:', error);
    return null;
  }
}

/**
 * Validate a claim/request against the policy rules
 * 
 * @param policy - The active policy
 * @param employee - Employee context for eligibility check
 * @param amount - The claim/request amount (optional)
 * @returns Validation result with eligibility, required docs, and errors
 */
export function validateClaimAgainstPolicy(
  policy: ActivePolicy,
  employee: EmployeeContext,
  amount?: number
): PolicyValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check eligibility
  const eligibility = checkEligibility(employee, policy.logic.eligibility_rules);
  errors.push(...eligibility.reasons);

  // Determine transaction type
  let transactionType: 'request' | 'claim' | 'both' | null = null;
  switch (policy.logic.transaction_model) {
    case 'request_only':
      transactionType = 'request';
      break;
    case 'claim_only':
      transactionType = 'claim';
      break;
    case 'request_and_claim':
      transactionType = 'both';
      break;
  }

  // Check caps
  const annualCap = policy.logic.limits_caps.annual_cap;
  const perTxCap = policy.logic.limits_caps.per_transaction_cap;

  if (amount && perTxCap && amount > perTxCap) {
    errors.push(`Amount ${amount} exceeds per-transaction cap of ${perTxCap}`);
  }

  // Check pre-approval threshold
  const preApprovalThreshold = policy.logic.limits_caps.pre_approval_threshold;
  const preApprovalRequired = preApprovalThreshold !== null && amount !== undefined && amount > preApprovalThreshold;

  if (preApprovalRequired) {
    warnings.push(`Amount exceeds ${preApprovalThreshold}. Pre-approval is required.`);
  }

  // Get required docs for the transaction type
  const requiredDocs = policy.requiredDocs.filter(d => 
    d.transaction_type === transactionType || d.transaction_type === 'both'
  );

  return {
    isEligible: eligibility.eligible,
    transactionType,
    requiredDocs,
    annualCap,
    remainingAllowance: null, // Would need utilization data
    preApprovalRequired,
    errors,
    warnings,
  };
}

/**
 * Get the transaction type label based on policy
 */
export function getTransactionLabel(policy: ActivePolicy): { 
  singular: string; 
  plural: string;
  verb: string;
} {
  switch (policy.logic.transaction_model) {
    case 'request_only':
      return { singular: 'Request', plural: 'Requests', verb: 'Submit Request' };
    case 'claim_only':
      return { singular: 'Claim', plural: 'Claims', verb: 'Submit Claim' };
    case 'request_and_claim':
      return { singular: 'Request/Claim', plural: 'Requests & Claims', verb: 'Submit' };
    default:
      return { singular: 'Claim', plural: 'Claims', verb: 'Submit Claim' };
  }
}

/**
 * Check if a policy exists and is published for a benefit
 */
export async function hasPolicyForBenefit(
  benefitKey: string,
  organizationId: string
): Promise<boolean> {
  const policy = await getActivePolicyForBenefit(benefitKey, organizationId);
  return policy !== null;
}
