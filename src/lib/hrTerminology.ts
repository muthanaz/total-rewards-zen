/**
 * HR Terminology Glossary & Microcopy Standards
 * 
 * This module defines standard HR compensation & benefits terminology
 * to ensure enterprise-grade, consistent language across all portals.
 */

// ============================================================================
// STANDARD HR TERMINOLOGY
// ============================================================================

/**
 * Official terminology map - use these instead of casual alternatives
 */
export const HR_TERMINOLOGY = {
  // Financial Terms
  ENTITLEMENT: 'Entitlement',           // Not: "allowance", "budget", "limit"
  UTILIZATION: 'Utilization',            // Not: "usage", "spending", "consumption"
  REIMBURSEMENT: 'Reimbursement',        // Not: "refund", "payback", "getting back"
  DISBURSEMENT: 'Disbursement',          // Not: "payout", "payment"
  ACCRUED: 'Accrued',                    // Not: "earned", "built up"
  FORFEITED: 'Forfeited',                // Not: "lost", "expired"
  
  // Status & Process Terms
  ELIGIBILITY: 'Eligibility',            // Not: "qualification", "being allowed"
  APPROVAL_WORKFLOW: 'Approval Workflow', // Not: "approval process", "getting approved"
  POLICY_VERSION: 'Policy Version',      // Not: "policy update", "new rules"
  REQUIRED_DOCUMENTS: 'Required Documents', // Not: "docs needed", "paperwork"
  SLA: 'SLA',                            // Service Level Agreement
  PROCESSING_TIME: 'Processing Time',    // Not: "how long it takes"
  
  // Coverage Terms
  COVERAGE: 'Coverage',                  // Not: "protection", "what's covered"
  DEPENDENT_COVERAGE: 'Dependent Coverage', // Not: "family coverage"
  IN_NETWORK: 'In-Network',              // Not: "approved provider"
  OUT_OF_NETWORK: 'Out-of-Network',      // Not: "other providers"
  
  // Leave Terms
  LEAVE_ACCRUAL: 'Leave Accrual',        // Not: "leave earned", "days earned"
  LEAVE_BALANCE: 'Leave Balance',        // Not: "days left", "remaining leave"
  CARRYOVER: 'Carryover',                // Not: "rollover", "unused days"
  
  // Calculation Types
  MEASURED: 'Measured',                  // Actual recorded value
  ESTIMATED: 'Estimated',                // Calculated projection
  PROXY: 'Proxy',                        // Derived from related data
} as const;

// ============================================================================
// TRUST DISCLAIMERS
// ============================================================================

/**
 * Standard disclaimers for different data confidence levels
 */
export const TRUST_DISCLAIMERS = {
  MEASURED: {
    label: 'Measured',
    description: 'Based on actual recorded data from integrated systems.',
    className: 'text-success',
  },
  ESTIMATED: {
    label: 'Estimated',
    description: 'Projected value based on historical patterns and policy rules.',
    className: 'text-warning',
  },
  PROXY: {
    label: 'Proxy',
    description: 'Derived from related data sources; actual value may vary.',
    className: 'text-muted-foreground',
  },
  POLICY_CITED: {
    label: 'Per Policy',
    description: 'Value defined by current published policy version.',
    className: 'text-primary',
  },
  BENCHMARK: {
    label: 'Benchmark',
    description: 'Industry or peer group comparison; requires minimum sample size.',
    className: 'text-info',
  },
} as const;

/**
 * Generate a trust disclaimer string
 */
export function getTrustDisclaimer(
  type: keyof typeof TRUST_DISCLAIMERS,
  policyVersion?: string
): string {
  const disclaimer = TRUST_DISCLAIMERS[type];
  if (type === 'POLICY_CITED' && policyVersion) {
    return `${disclaimer.description} (${policyVersion})`;
  }
  return disclaimer.description;
}

// ============================================================================
// MICROCOPY STANDARDS
// ============================================================================

/**
 * Standard microcopy for common UI elements
 */
export const MICROCOPY = {
  // Empty States
  EMPTY_CLAIMS: 'No claims submitted yet.',
  EMPTY_REQUESTS: 'No requests pending.',
  EMPTY_DOCUMENTS: 'No required documents at this time.',
  
  // Actions
  SUBMIT_CLAIM: 'Submit Claim',
  REQUEST_DOCUMENT: 'Request Document',
  VIEW_POLICY: 'View Policy',
  VIEW_ENTITLEMENTS: 'View Entitlements',
  DOWNLOAD_STATEMENT: 'Download Statement',
  
  // Status Messages
  PROCESSING: 'Processing your request...',
  SUBMITTED_SUCCESS: 'Request submitted successfully.',
  APPROVAL_PENDING: 'Pending approval.',
  APPROVED: 'Approved and scheduled for disbursement.',
  REJECTED: 'Not approved. See reviewer notes below.',
  
  // Tooltips
  TOOLTIP_UTILIZATION: 'Percentage of your annual entitlement that has been utilized.',
  TOOLTIP_REMAINING: 'Remaining entitlement available for the current period.',
  TOOLTIP_SLA: 'Target processing time per Service Level Agreement.',
  TOOLTIP_POLICY_VERSION: 'Currently active policy version effective from this date.',
  
  // Warnings
  WARNING_LOW_COVERAGE: 'Data coverage below threshold. Some metrics may be incomplete.',
  WARNING_STALE_DATA: 'Data last synced more than 24 hours ago.',
  WARNING_INSUFFICIENT_SAMPLE: 'Insufficient sample size for reliable comparison.',
  
  // Confirmation
  CONFIRM_SUBMIT: 'Submit this claim for processing?',
  CONFIRM_CANCEL: 'Cancel this request? This action cannot be undone.',
} as const;

// ============================================================================
// LABEL MAPPINGS (Casual → Professional)
// ============================================================================

/**
 * Map casual labels to professional terminology
 */
export const LABEL_MAPPINGS: Record<string, string> = {
  // Financial
  'allowance': 'entitlement',
  'Allowance': 'Entitlement',
  'budget': 'allocated amount',
  'Budget': 'Allocated Amount',
  'spending': 'utilization',
  'Spending': 'Utilization',
  'used': 'utilized',
  'Used': 'Utilized',
  'left': 'remaining',
  'Left': 'Remaining',
  'balance': 'remaining entitlement',
  'Balance': 'Remaining Entitlement',
  'get back': 'reimbursement',
  'Get Back': 'Reimbursement',
  
  // Process
  'ask for': 'request',
  'Ask for': 'Request',
  'needed docs': 'required documents',
  'Needed Docs': 'Required Documents',
  'how long': 'processing time',
  'How Long': 'Processing Time',
  
  // Status
  'waiting': 'pending approval',
  'Waiting': 'Pending Approval',
  'done': 'completed',
  'Done': 'Completed',
  'rejected': 'not approved',
  'Rejected': 'Not Approved',
};

/**
 * Apply professional terminology to a string
 */
export function applyProfessionalTerminology(text: string): string {
  let result = text;
  for (const [casual, professional] of Object.entries(LABEL_MAPPINGS)) {
    result = result.replace(new RegExp(casual, 'g'), professional);
  }
  return result;
}

// ============================================================================
// METRIC LABELS
// ============================================================================

/**
 * Standard labels for common HR metrics
 */
export const METRIC_LABELS = {
  // Employee Metrics
  TOTAL_COMPENSATION: 'Total Guaranteed Compensation',
  BASE_SALARY: 'Base Salary',
  ANNUAL_ENTITLEMENTS: 'Annual Benefits Entitlement',
  UTILIZATION_RATE: 'Benefits Utilization Rate',
  LEAVE_BALANCE: 'Leave Balance',
  ACCRUED_LEAVE: 'Accrued Leave',
  
  // Employer Metrics
  TOTAL_INVESTMENT: 'Total Benefits Investment',
  COST_PER_EMPLOYEE: 'Benefits Cost per Employee',
  WORKFORCE_UTILIZATION: 'Workforce Utilization Rate',
  SATISFACTION_SCORE: 'Employee Satisfaction Score',
  CLAIMS_VOLUME: 'Claims Volume',
  PROCESSING_TIME: 'Average Processing Time',
  
  // Trend Labels
  YOY_CHANGE: 'Year-over-Year Change',
  MOM_CHANGE: 'Month-over-Month Change',
  VS_BUDGET: 'vs. Budget',
  VS_BENCHMARK: 'vs. Industry Benchmark',
} as const;

// ============================================================================
// POLICY CITATION HELPERS
// ============================================================================

/**
 * Format a policy citation for display
 */
export function formatPolicyCitation(
  benefitName: string,
  version: number,
  effectiveFrom: string
): string {
  const date = new Date(effectiveFrom).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
  return `${benefitName} Policy v${version} (Effective ${date})`;
}

/**
 * Generate policy-based explanation
 */
export function generatePolicyExplanation(
  rule: string,
  policyVersion?: number,
  effectiveFrom?: string
): string {
  if (policyVersion && effectiveFrom) {
    const date = new Date(effectiveFrom).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
    return `${rule} — Per Policy v${policyVersion}, effective ${date}`;
  }
  return `${rule} — Per current policy`;
}
