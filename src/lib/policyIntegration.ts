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
  EmployeeContext,
  DEFAULT_POLICY_LOGIC,
  checkEligibility,
  TransactionModel,
} from '@/lib/policyEngine';

// ============================================================================
// TRANSACTION TYPE & LABELS CONTRACT
// ============================================================================

export type TransactionType = 'request' | 'claim' | 'settlement';

/**
 * Get the correct label based on policy transaction model
 */
export function getTransactionTypeLabel(
  transactionModel: TransactionModel | null,
  transactionType?: TransactionType
): { singular: string; plural: string; verb: string } {
  // If specific transaction type is given, use it
  if (transactionType) {
    switch (transactionType) {
      case 'request':
        return { singular: 'Request', plural: 'Requests', verb: 'Submit Request' };
      case 'claim':
        return { singular: 'Claim', plural: 'Claims', verb: 'Submit Claim' };
      case 'settlement':
        return { singular: 'Settlement', plural: 'Settlements', verb: 'Submit Settlement' };
    }
  }
  
  // Based on policy model
  switch (transactionModel) {
    case 'request_only':
      return { singular: 'Request', plural: 'Requests', verb: 'Submit Request' };
    case 'claim_only':
      return { singular: 'Claim', plural: 'Claims', verb: 'Submit Claim' };
    case 'request_and_claim':
      return { singular: 'Request', plural: 'Requests & Settlements', verb: 'Submit Request' };
    default:
      return { singular: 'Claim', plural: 'Claims', verb: 'Submit Claim' };
  }
}

/**
 * Determine the expected transaction type for a new submission
 */
export function getExpectedTransactionType(
  transactionModel: TransactionModel | null,
  hasApprovedRequest: boolean = false
): TransactionType {
  switch (transactionModel) {
    case 'request_only':
      return 'request';
    case 'claim_only':
      return 'claim';
    case 'request_and_claim':
      // If there's already an approved request, expect settlement
      return hasApprovedRequest ? 'settlement' : 'request';
    default:
      return 'claim';
  }
}

// ============================================================================
// ACTIVE POLICY CONTRACT
// ============================================================================

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
  settlementRequired: boolean;
  autoCloseOnApproval: boolean;
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

    const logicJson = version.logic_json || DEFAULT_POLICY_LOGIC;

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
      logic: logicJson,
      requiredDocs: (docs || []) as PolicyRequiredDoc[],
      settlementRequired: logicJson.settlement_required || policy.settlement_required || false,
      autoCloseOnApproval: logicJson.auto_close_on_approval || policy.auto_close_on_approval || false,
    };
  } catch (error) {
    console.error('Error fetching active policy:', error);
    return null;
  }
}

// ============================================================================
// VALIDATION RESULT CONTRACT
// ============================================================================

export interface ValidationCheck {
  key: string;
  label: string;
  passed: boolean;
  message: string;
  severity: 'blocker' | 'warning' | 'info';
}

export interface PolicyValidationResult {
  isEligible: boolean;
  transactionType: TransactionType;
  transactionLabel: string;
  requiredDocs: PolicyRequiredDoc[];
  annualCap: number | null;
  perTransactionCap: number | null;
  remainingAllowance: number | null;
  preApprovalRequired: boolean;
  settlementRequired: boolean;
  checks: ValidationCheck[];
  canApprove: boolean;
  blockerCount: number;
  warningCount: number;
}

/**
 * Comprehensive validation of a claim/request against policy rules
 */
export function validateTransactionAgainstPolicy(
  policy: ActivePolicy,
  employee: EmployeeContext,
  transactionType: TransactionType,
  amount?: number,
  utilizationYTD?: number,
  providedDocTypes?: string[]
): PolicyValidationResult {
  const checks: ValidationCheck[] = [];
  
  // 1. ELIGIBILITY CHECK
  const eligibility = checkEligibility(employee, policy.logic.eligibility_rules);
  checks.push({
    key: 'eligibility',
    label: 'Eligibility',
    passed: eligibility.eligible,
    message: eligibility.eligible 
      ? 'Employee meets all eligibility criteria'
      : eligibility.reasons[0] || 'Eligibility criteria not met',
    severity: eligibility.eligible ? 'info' : 'blocker',
  });

  // 2. PER-TRANSACTION CAP CHECK
  const perTxCap = policy.logic.limits_caps.per_transaction_cap;
  if (perTxCap !== null && amount !== undefined) {
    const capOk = amount <= perTxCap;
    checks.push({
      key: 'per_transaction_cap',
      label: 'Transaction Limit',
      passed: capOk,
      message: capOk 
        ? `Amount (${amount}) within per-transaction limit (${perTxCap})`
        : `Amount (${amount}) exceeds per-transaction cap of ${perTxCap}`,
      severity: capOk ? 'info' : 'blocker',
    });
  }

  // 3. ANNUAL CAP CHECK
  const annualCap = policy.logic.limits_caps.annual_cap;
  if (annualCap !== null && amount !== undefined && utilizationYTD !== undefined) {
    const projectedTotal = utilizationYTD + amount;
    const capOk = projectedTotal <= annualCap;
    const remaining = annualCap - utilizationYTD;
    checks.push({
      key: 'annual_cap',
      label: 'Annual Cap',
      passed: capOk,
      message: capOk 
        ? `Within annual cap (Remaining: ${remaining.toLocaleString()} AED)`
        : `Would exceed annual cap by ${(projectedTotal - annualCap).toLocaleString()} AED`,
      severity: capOk ? 'info' : 'blocker',
    });
  }

  // 4. PRE-APPROVAL THRESHOLD CHECK
  const preApprovalThreshold = policy.logic.limits_caps.pre_approval_threshold;
  const preApprovalRequired = preApprovalThreshold !== null && amount !== undefined && amount > preApprovalThreshold;
  if (preApprovalThreshold !== null && amount !== undefined && amount > preApprovalThreshold) {
    const isRequest = transactionType === 'request';
    checks.push({
      key: 'pre_approval',
      label: 'Pre-Approval',
      passed: isRequest,
      message: isRequest
        ? `Pre-approval required for amounts over ${preApprovalThreshold} - this is a request`
        : `Amount over ${preApprovalThreshold} requires pre-approval (submit Request first)`,
      severity: isRequest ? 'info' : 'warning',
    });
  }

  // 5. REQUIRED DOCUMENTS CHECK
  const requiredDocs = policy.requiredDocs.filter(d => 
    d.transaction_type === transactionType || d.transaction_type === 'both'
  );
  const requiredDocTypes = requiredDocs.filter(d => d.is_required).map(d => d.doc_type.toLowerCase());
  const providedLower = (providedDocTypes || []).map(d => d.toLowerCase());
  const missingDocs = requiredDocTypes.filter(dt => !providedLower.includes(dt));
  
  if (requiredDocTypes.length > 0) {
    const docsOk = missingDocs.length === 0;
    checks.push({
      key: 'documents',
      label: 'Documents',
      passed: docsOk,
      message: docsOk 
        ? `All ${requiredDocTypes.length} required documents provided`
        : `Missing ${missingDocs.length} required document(s): ${missingDocs.join(', ')}`,
      severity: docsOk ? 'info' : 'warning',
    });
  }

  // 6. SETTLEMENT FLOW CHECK (for request_and_claim model)
  if (policy.logic.transaction_model === 'request_and_claim' && policy.settlementRequired) {
    checks.push({
      key: 'settlement_flow',
      label: 'Settlement Flow',
      passed: true,
      message: transactionType === 'request' 
        ? 'Settlement will be required after approval'
        : 'Post-expense settlement',
      severity: 'info',
    });
  }

  // Compute summary
  const blockers = checks.filter(c => !c.passed && c.severity === 'blocker');
  const warnings = checks.filter(c => !c.passed && c.severity === 'warning');
  const canApprove = blockers.length === 0;

  // Determine transaction label
  const labels = getTransactionTypeLabel(policy.logic.transaction_model, transactionType);

  return {
    isEligible: eligibility.eligible,
    transactionType,
    transactionLabel: labels.singular,
    requiredDocs,
    annualCap,
    perTransactionCap: perTxCap,
    remainingAllowance: annualCap !== null && utilizationYTD !== undefined 
      ? annualCap - utilizationYTD 
      : null,
    preApprovalRequired,
    settlementRequired: policy.settlementRequired,
    checks,
    canApprove,
    blockerCount: blockers.length,
    warningCount: warnings.length,
  };
}

/**
 * Legacy compatibility wrapper
 */
export function validateClaimAgainstPolicy(
  policy: ActivePolicy,
  employee: EmployeeContext,
  amount?: number
): {
  isEligible: boolean;
  transactionType: 'request' | 'claim' | 'both' | null;
  requiredDocs: PolicyRequiredDoc[];
  annualCap: number | null;
  remainingAllowance: number | null;
  preApprovalRequired: boolean;
  errors: string[];
  warnings: string[];
} {
  const transactionType = getExpectedTransactionType(policy.logic.transaction_model);
  const result = validateTransactionAgainstPolicy(policy, employee, transactionType, amount);
  
  return {
    isEligible: result.isEligible,
    transactionType: transactionType === 'settlement' ? 'claim' : transactionType,
    requiredDocs: result.requiredDocs,
    annualCap: result.annualCap,
    remainingAllowance: result.remainingAllowance,
    preApprovalRequired: result.preApprovalRequired,
    errors: result.checks.filter(c => c.severity === 'blocker' && !c.passed).map(c => c.message),
    warnings: result.checks.filter(c => c.severity === 'warning' && !c.passed).map(c => c.message),
  };
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

/**
 * Get transaction label for display in UI - consistent everywhere
 */
export function getDisplayLabel(
  transactionModel: TransactionModel | null | undefined,
  transactionType: TransactionType | null | undefined
): string {
  if (transactionType) {
    switch (transactionType) {
      case 'request': return 'Request';
      case 'claim': return 'Claim';
      case 'settlement': return 'Settlement';
    }
  }
  
  switch (transactionModel) {
    case 'request_only': return 'Request';
    case 'claim_only': return 'Claim';
    case 'request_and_claim': return 'Request';
    default: return 'Claim';
  }
}

/**
 * Get all labels needed for UI consistency
 */
export function getUILabels(transactionModel: TransactionModel | null): {
  itemLabel: string;
  itemLabelPlural: string;
  actionVerb: string;
  approvalLabel: string;
  rejectLabel: string;
} {
  switch (transactionModel) {
    case 'request_only':
      return {
        itemLabel: 'Request',
        itemLabelPlural: 'Requests',
        actionVerb: 'Submit Request',
        approvalLabel: 'Approve Request',
        rejectLabel: 'Deny Request',
      };
    case 'claim_only':
      return {
        itemLabel: 'Claim',
        itemLabelPlural: 'Claims',
        actionVerb: 'Submit Claim',
        approvalLabel: 'Approve Claim',
        rejectLabel: 'Reject Claim',
      };
    case 'request_and_claim':
      return {
        itemLabel: 'Request',
        itemLabelPlural: 'Requests',
        actionVerb: 'Submit Request',
        approvalLabel: 'Approve Request',
        rejectLabel: 'Deny Request',
      };
    default:
      return {
        itemLabel: 'Claim',
        itemLabelPlural: 'Claims',
        actionVerb: 'Submit Claim',
        approvalLabel: 'Approve',
        rejectLabel: 'Reject',
      };
  }
}
