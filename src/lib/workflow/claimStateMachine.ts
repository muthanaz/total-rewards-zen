/**
 * Claim State Machine
 * 
 * Client-side logic for claim status transitions, validation, and payable calculations.
 * This mirrors the database functions and provides type-safe access from React.
 */

import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

export type RequestStatus = Database['public']['Enums']['request_status'];
export type EnforcementMode = Database['public']['Enums']['policy_enforcement_mode'];

// =============================================================================
// STATE MACHINE TYPES
// =============================================================================

export interface StatusTransition {
  fromStatus: RequestStatus;
  toStatus: RequestStatus;
  requiresRole: string | null;
  requiresReason: boolean;
  minReasonLength: number;
  autoTransition: boolean;
  description: string;
}

export interface TransitionValidationResult {
  valid: boolean;
  error?: string;
  blockingReasons?: string[];
  fix?: string;
  transition?: {
    from: string;
    to: string;
    requiresReason: boolean;
    autoTransition: boolean;
  };
}

export interface PayableAmountResult {
  success: boolean;
  payableAmountAed: number;
  eligibleAmountAed: number;
  remainingEntitlementAed: number | null;
  employeeCopayAed: number;
  formula: string;
  error?: string;
}

export interface SettlementReadinessCheck {
  check: string;
  pass: boolean;
  value?: unknown;
  required?: unknown;
  unverifiedCount?: number;
  method?: string;
}

export interface SettlementReadinessResult {
  ready: boolean;
  checks: SettlementReadinessCheck[];
  requestId: string;
  error?: string;
}

export interface ClaimTransitionResult {
  success: boolean;
  requestId: string;
  fromStatus: string;
  toStatus: string;
  transitionedAt: string;
  error?: string;
  blockingReasons?: string[];
  fix?: string;
}

// =============================================================================
// CANONICAL STATUS TRANSITIONS (client-side mirror of DB)
// =============================================================================

export const VALID_TRANSITIONS: StatusTransition[] = [
  { fromStatus: 'draft', toStatus: 'submitted', requiresRole: null, requiresReason: false, minReasonLength: 0, autoTransition: false, description: 'Employee submits claim' },
  { fromStatus: 'submitted', toStatus: 'in_review', requiresRole: 'hr_ops', requiresReason: false, minReasonLength: 0, autoTransition: true, description: 'Auto-transition when HR picks up' },
  { fromStatus: 'in_review', toStatus: 'info_requested', requiresRole: 'hr_ops', requiresReason: true, minReasonLength: 20, autoTransition: false, description: 'HR requests additional info/docs' },
  { fromStatus: 'info_requested', toStatus: 'pending_employee', requiresRole: null, requiresReason: false, minReasonLength: 0, autoTransition: true, description: 'Claim waiting on employee' },
  { fromStatus: 'pending_employee', toStatus: 'in_review', requiresRole: null, requiresReason: false, minReasonLength: 0, autoTransition: false, description: 'Employee responds with info' },
  { fromStatus: 'in_review', toStatus: 'approved', requiresRole: 'hr_ops', requiresReason: true, minReasonLength: 20, autoTransition: false, description: 'HR approves claim' },
  { fromStatus: 'in_review', toStatus: 'rejected', requiresRole: 'hr_ops', requiresReason: true, minReasonLength: 20, autoTransition: false, description: 'HR rejects claim' },
  { fromStatus: 'approved', toStatus: 'ready_for_payment', requiresRole: null, requiresReason: false, minReasonLength: 0, autoTransition: false, description: 'Settlement readiness checks pass' },
  { fromStatus: 'ready_for_payment', toStatus: 'paid', requiresRole: 'finance', requiresReason: false, minReasonLength: 0, autoTransition: false, description: 'Settlement batch paid' },
  { fromStatus: 'paid', toStatus: 'closed', requiresRole: null, requiresReason: false, minReasonLength: 0, autoTransition: true, description: 'Auto-close after reconciliation' },
  { fromStatus: 'pending', toStatus: 'in_review', requiresRole: 'hr_ops', requiresReason: false, minReasonLength: 0, autoTransition: true, description: 'Legacy: pending to in_review' },
  { fromStatus: 'pending', toStatus: 'submitted', requiresRole: null, requiresReason: false, minReasonLength: 0, autoTransition: true, description: 'Legacy: pending treated as submitted' },
  { fromStatus: 'submitted', toStatus: 'escalated', requiresRole: 'hr_ops', requiresReason: true, minReasonLength: 20, autoTransition: false, description: 'Escalate to manager' },
  { fromStatus: 'in_review', toStatus: 'escalated', requiresRole: 'hr_ops', requiresReason: true, minReasonLength: 20, autoTransition: false, description: 'Escalate to manager' },
  { fromStatus: 'escalated', toStatus: 'approved', requiresRole: 'executive', requiresReason: true, minReasonLength: 20, autoTransition: false, description: 'Manager approves escalated claim' },
  { fromStatus: 'escalated', toStatus: 'rejected', requiresRole: 'executive', requiresReason: true, minReasonLength: 20, autoTransition: false, description: 'Manager rejects escalated claim' },
];

// =============================================================================
// HR ACTION REASON CODES
// =============================================================================

export const ACTION_REASON_CODES = {
  APPROVE: {
    COMPLETE_DOCUMENTATION: { code: 'complete_documentation', label: 'Complete documentation provided' },
    WITHIN_POLICY: { code: 'within_policy', label: 'Within policy limits' },
    EXCEPTION_APPROVED: { code: 'exception_approved', label: 'Exception approved by manager' },
    OTHER_APPROVE: { code: 'other_approve', label: 'Other (specify)' },
  },
  REJECT: {
    INELIGIBLE: { code: 'ineligible', label: 'Employee not eligible for this benefit' },
    OVER_LIMIT: { code: 'over_limit', label: 'Exceeds policy limit/cap' },
    DUPLICATE: { code: 'duplicate', label: 'Duplicate claim' },
    INVALID_DOCUMENTATION: { code: 'invalid_documentation', label: 'Invalid or fraudulent documentation' },
    POLICY_EXCLUSION: { code: 'policy_exclusion', label: 'Excluded by policy terms' },
    OTHER_REJECT: { code: 'other_reject', label: 'Other (specify)' },
  },
  INFO_REQUEST: {
    MISSING_RECEIPT: { code: 'missing_receipt', label: 'Missing receipt/invoice' },
    MISSING_PRESCRIPTION: { code: 'missing_prescription', label: 'Missing prescription' },
    UNCLEAR_AMOUNT: { code: 'unclear_amount', label: 'Amount unclear or needs clarification' },
    VERIFICATION_NEEDED: { code: 'verification_needed', label: 'Third-party verification needed' },
    OTHER_INFO: { code: 'other_info', label: 'Other (specify)' },
  },
  ESCALATE: {
    OVER_THRESHOLD: { code: 'over_threshold', label: 'Amount exceeds approval threshold' },
    POLICY_EXCEPTION: { code: 'policy_exception', label: 'Requires policy exception approval' },
    SPECIAL_CASE: { code: 'special_case', label: 'Special circumstances' },
  },
} as const;

// =============================================================================
// CLIENT-SIDE VALIDATION
// =============================================================================

/**
 * Check if a transition is valid (client-side check before calling DB)
 */
export function isValidTransition(fromStatus: RequestStatus, toStatus: RequestStatus): StatusTransition | null {
  return VALID_TRANSITIONS.find(t => t.fromStatus === fromStatus && t.toStatus === toStatus) || null;
}

/**
 * Get available transitions from a given status
 */
export function getAvailableTransitions(fromStatus: RequestStatus): StatusTransition[] {
  return VALID_TRANSITIONS.filter(t => t.fromStatus === fromStatus);
}

/**
 * Validate a transition with reason text (client-side)
 */
export function validateTransitionLocally(
  fromStatus: RequestStatus,
  toStatus: RequestStatus,
  actionReasonCode?: string | null,
  actionReasonText?: string | null
): TransitionValidationResult {
  const transition = isValidTransition(fromStatus, toStatus);
  
  if (!transition) {
    return {
      valid: false,
      error: `This claim cannot move from ${fromStatus} to ${toStatus}. Invalid transition.`,
      blockingReasons: ['invalid_transition'],
      fix: 'Check the allowed status transitions for this claim state.',
    };
  }
  
  const errors: string[] = [];
  const blockingReasons: string[] = [];
  
  if (transition.requiresReason) {
    if (!actionReasonCode || actionReasonCode.trim() === '') {
      errors.push('Action reason code is required');
      blockingReasons.push('missing_reason_code');
    }
    
    if (!actionReasonText || actionReasonText.trim().length < transition.minReasonLength) {
      errors.push(`Reason text must be at least ${transition.minReasonLength} characters`);
      blockingReasons.push('reason_too_short');
    }
  }
  
  if (errors.length > 0) {
    return {
      valid: false,
      error: `This claim cannot move to ${toStatus} because: ${errors.join('; ')}`,
      blockingReasons,
      fix: 'Address the listed issues before transitioning.',
    };
  }
  
  return {
    valid: true,
    transition: {
      from: fromStatus,
      to: toStatus,
      requiresReason: transition.requiresReason,
      autoTransition: transition.autoTransition,
    },
  };
}

// =============================================================================
// DATABASE FUNCTION WRAPPERS
// =============================================================================

// Type helper for RPC responses
type RpcJsonResponse = Record<string, unknown> | null;

/**
 * Validate a claim status transition via database function
 */
export async function validateClaimTransition(
  requestId: string,
  fromStatus: string,
  toStatus: string,
  actionReasonCode?: string | null,
  actionReasonText?: string | null
): Promise<TransitionValidationResult> {
  const { data, error } = await supabase.rpc('validate_claim_status_transition', {
    p_request_id: requestId,
    p_from_status: fromStatus,
    p_to_status: toStatus,
    p_action_reason_code: actionReasonCode ?? null,
    p_action_reason_text: actionReasonText ?? null,
  });
  
  if (error) {
    return {
      valid: false,
      error: error.message,
      blockingReasons: ['database_error'],
    };
  }
  
  const result = data as RpcJsonResponse;
  return {
    valid: (result?.valid as boolean) ?? false,
    error: result?.error as string | undefined,
    blockingReasons: result?.blocking_reasons as string[] | undefined,
    fix: result?.fix as string | undefined,
    transition: result?.transition as TransitionValidationResult['transition'],
  };
}

/**
 * Execute a claim status transition via database function
 */
export async function executeClaimTransition(
  requestId: string,
  toStatus: string,
  actionReasonCode?: string | null,
  actionReasonText?: string | null
): Promise<ClaimTransitionResult> {
  const { data, error } = await supabase.rpc('execute_claim_transition', {
    p_request_id: requestId,
    p_to_status: toStatus,
    p_action_reason_code: actionReasonCode ?? null,
    p_action_reason_text: actionReasonText ?? null,
  });
  
  if (error) {
    return {
      success: false,
      requestId,
      fromStatus: '',
      toStatus,
      transitionedAt: '',
      error: error.message,
    };
  }
  
  const result = data as RpcJsonResponse;
  return {
    success: (result?.success as boolean) ?? false,
    requestId: (result?.request_id as string) ?? requestId,
    fromStatus: (result?.from_status as string) ?? '',
    toStatus: (result?.to_status as string) ?? toStatus,
    transitionedAt: (result?.transitioned_at as string) ?? '',
    error: result?.error as string | undefined,
    blockingReasons: result?.blocking_reasons as string[] | undefined,
    fix: result?.fix as string | undefined,
  };
}

/**
 * Compute payable amount for a claim
 */
export async function computePayableAmount(requestId: string): Promise<PayableAmountResult> {
  const { data, error } = await supabase.rpc('compute_payable_amount', {
    p_request_id: requestId,
  });
  
  if (error) {
    return {
      success: false,
      payableAmountAed: 0,
      eligibleAmountAed: 0,
      remainingEntitlementAed: null,
      employeeCopayAed: 0,
      formula: '',
      error: error.message,
    };
  }
  
  const result = data as RpcJsonResponse;
  return {
    success: (result?.success as boolean) ?? false,
    payableAmountAed: (result?.payable_amount_aed as number) ?? 0,
    eligibleAmountAed: (result?.eligible_amount_aed as number) ?? 0,
    remainingEntitlementAed: (result?.remaining_entitlement_aed as number | null) ?? null,
    employeeCopayAed: (result?.employee_copay_aed as number) ?? 0,
    formula: (result?.formula as string) ?? 'max(0, min(eligible, remaining) - copay)',
    error: result?.error as string | undefined,
  };
}

/**
 * Check settlement readiness for a claim
 */
export async function checkSettlementReadiness(requestId: string): Promise<SettlementReadinessResult> {
  const { data, error } = await supabase.rpc('check_settlement_readiness', {
    p_request_id: requestId,
  });
  
  if (error) {
    return {
      ready: false,
      checks: [],
      requestId,
      error: error.message,
    };
  }
  
  const result = data as RpcJsonResponse;
  return {
    ready: (result?.ready as boolean) ?? false,
    checks: (result?.checks as SettlementReadinessCheck[]) ?? [],
    requestId: (result?.request_id as string) ?? requestId,
    error: result?.error as string | undefined,
  };
}

// =============================================================================
// PAYABLE AMOUNT CALCULATION (client-side mirror)
// =============================================================================

/**
 * Calculate payable amount client-side (for UI preview)
 * Formula: payable = max(0, min(eligible, remaining) - copay)
 */
export function calculatePayableAmountLocal(
  eligibleAmountAed: number,
  remainingEntitlementAed: number | null,
  employeeCopayAed: number
): number {
  const eligible = eligibleAmountAed ?? 0;
  const copay = employeeCopayAed ?? 0;
  
  if (remainingEntitlementAed !== null) {
    return Math.max(0, Math.min(eligible, remainingEntitlementAed) - copay);
  }
  
  // If remaining entitlement not calculated, use eligible - copay
  return Math.max(0, eligible - copay);
}

// =============================================================================
// POLICY ENFORCEMENT HELPERS
// =============================================================================

/**
 * Check if submission should be blocked in strict mode
 */
export function shouldBlockSubmission(
  enforcementMode: EnforcementMode,
  hasValidationErrors: boolean,
  missingRequiredDocs: number
): { blocked: boolean; reason?: string } {
  if (enforcementMode === 'strict') {
    if (hasValidationErrors) {
      return { blocked: true, reason: 'Validation errors must be resolved before submission' };
    }
    if (missingRequiredDocs > 0) {
      return { blocked: true, reason: `${missingRequiredDocs} required document(s) must be uploaded before submission` };
    }
  }
  
  // Soft mode: allow submission but flag issues
  return { blocked: false };
}

/**
 * Format transition error for user display
 */
export function formatTransitionError(result: TransitionValidationResult | ClaimTransitionResult): string {
  if ('error' in result && result.error) {
    let message = result.error;
    if ('fix' in result && result.fix) {
      message += ` Fix: ${result.fix}`;
    }
    return message;
  }
  return 'An unknown error occurred';
}
