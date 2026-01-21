/**
 * Policy Engine - Type Definitions and Cross-Portal Integration
 * 
 * This module provides:
 * 1. Type definitions for the policy engine
 * 2. Cross-portal helper: getPolicyForBenefit
 * 3. Validation utilities for claims/requests
 */

// ============== Type Definitions ==============

export type TransactionModel = 'request_only' | 'claim_only' | 'request_and_claim';
export type PolicyVersionStatus = 'draft' | 'published' | 'archived';
export type BenefitPolicyType = 'allowance' | 'reimbursement' | 'program' | 'leave' | 'insurance' | 'other';
export type ApproverRole = 'manager' | 'hr' | 'finance' | 'admin';
export type DocumentTransactionType = 'request' | 'claim' | 'both';

export interface EligibilityRules {
  grades: string[];
  departments: string[];
  locations: string[];
  contract_types: string[]; // permanent, temporary, consultant
  min_tenure_months: number;
  probation_passed: boolean;
}

export interface LimitsCaps {
  annual_cap: number | null;
  annual_cap_currency: string;
  per_transaction_cap: number | null;
  frequency: 'monthly' | 'annual';
  reset_month: number; // 1-12
  pre_approval_threshold: number | null;
}

export interface WorkflowRules {
  approver_role: ApproverRole;
  sla_days: number;
  escalation_role: ApproverRole | null;
}

export interface PolicyLogic {
  transaction_model: TransactionModel;
  eligibility_rules: EligibilityRules;
  limits_caps: LimitsCaps;
  workflow: WorkflowRules;
}

export interface PolicyContent {
  summary: string[];
  details: string;
  examples: string[];
  faqs: Array<{ question: string; answer: string }>;
  pitfalls: string[];
}

export interface PolicyRequiredDoc {
  id?: string;
  transaction_type: DocumentTransactionType;
  doc_type: string;
  doc_name: string;
  is_required: boolean;
  conditions_json: {
    amount_threshold?: number;
    category?: string;
    location?: string;
  };
  description?: string;
}

export interface PolicyVersion {
  id: string;
  policy_id: string;
  version_number: number;
  status: PolicyVersionStatus;
  effective_from: string | null;
  effective_to: string | null;
  last_updated_at: string;
  created_at: string;
  created_by: string | null;
  content_json: PolicyContent;
  logic_json: PolicyLogic;
  attachment_url: string | null;
  required_docs?: PolicyRequiredDoc[];
}

export interface Policy {
  id: string;
  organization_id: string | null;
  policy_ref: string;
  title: string;
  category: string;
  version: string;
  status: string;
  effective_from: string;
  effective_to: string | null;
  summary: string | null;
  benefit_type: BenefitPolicyType | null;
  transaction_model: TransactionModel | null;
  owner_user_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PolicyWithVersions extends Policy {
  currentVersion: PolicyVersion | null;
  allVersions: PolicyVersion[];
  requiredDocs: PolicyRequiredDoc[];
}

// ============== Employee Context ==============

export interface EmployeeContext {
  user_id: string;
  grade: string | null;
  department: string | null;
  location: string | null;
  contract_type: string | null;
  tenure_months: number;
  probation_passed: boolean;
}

// ============== Validation Result ==============

export interface PolicyValidationResult {
  isEligible: boolean;
  transactionType: 'request' | 'claim' | 'both' | null;
  requiredDocs: PolicyRequiredDoc[];
  annualCap: number | null;
  remainingAllowance: number | null;
  preApprovalRequired: boolean;
  errors: string[];
  warnings: string[];
}

// ============== Default Values ==============

export const DEFAULT_ELIGIBILITY_RULES: EligibilityRules = {
  grades: [],
  departments: [],
  locations: [],
  contract_types: [],
  min_tenure_months: 0,
  probation_passed: false,
};

export const DEFAULT_LIMITS_CAPS: LimitsCaps = {
  annual_cap: null,
  annual_cap_currency: 'AED',
  per_transaction_cap: null,
  frequency: 'annual',
  reset_month: 1,
  pre_approval_threshold: null,
};

export const DEFAULT_WORKFLOW: WorkflowRules = {
  approver_role: 'manager',
  sla_days: 3,
  escalation_role: null,
};

export const DEFAULT_POLICY_LOGIC: PolicyLogic = {
  transaction_model: 'claim_only',
  eligibility_rules: DEFAULT_ELIGIBILITY_RULES,
  limits_caps: DEFAULT_LIMITS_CAPS,
  workflow: DEFAULT_WORKFLOW,
};

export const DEFAULT_POLICY_CONTENT: PolicyContent = {
  summary: [],
  details: '',
  examples: [],
  faqs: [],
  pitfalls: [],
};

// ============== Validation Functions ==============

/**
 * Check if an employee is eligible for a policy based on rules
 */
export function checkEligibility(
  employee: EmployeeContext,
  rules: EligibilityRules
): { eligible: boolean; reasons: string[] } {
  const reasons: string[] = [];

  // Grade check
  if (rules.grades.length > 0 && employee.grade) {
    if (!rules.grades.includes(employee.grade)) {
      reasons.push(`Grade ${employee.grade} is not eligible. Eligible grades: ${rules.grades.join(', ')}`);
    }
  }

  // Department check
  if (rules.departments.length > 0 && employee.department) {
    if (!rules.departments.includes(employee.department)) {
      reasons.push(`Department ${employee.department} is not eligible`);
    }
  }

  // Location check
  if (rules.locations.length > 0 && employee.location) {
    if (!rules.locations.includes(employee.location)) {
      reasons.push(`Location ${employee.location} is not eligible`);
    }
  }

  // Contract type check
  if (rules.contract_types.length > 0 && employee.contract_type) {
    if (!rules.contract_types.includes(employee.contract_type)) {
      reasons.push(`Contract type ${employee.contract_type} is not eligible`);
    }
  }

  // Tenure check
  if (rules.min_tenure_months > 0) {
    if (employee.tenure_months < rules.min_tenure_months) {
      reasons.push(`Minimum tenure of ${rules.min_tenure_months} months required. Current: ${employee.tenure_months}`);
    }
  }

  // Probation check
  if (rules.probation_passed && !employee.probation_passed) {
    reasons.push('Must have completed probation period');
  }

  return {
    eligible: reasons.length === 0,
    reasons,
  };
}

/**
 * Get the transaction type label
 */
export function getTransactionModelLabel(model: TransactionModel): string {
  switch (model) {
    case 'request_only':
      return 'Request Only';
    case 'claim_only':
      return 'Claim Only';
    case 'request_and_claim':
      return 'Request + Claim';
    default:
      return 'Unknown';
  }
}

/**
 * Get benefit type label
 */
export function getBenefitTypeLabel(type: BenefitPolicyType): string {
  switch (type) {
    case 'allowance':
      return 'Allowance';
    case 'reimbursement':
      return 'Reimbursement';
    case 'program':
      return 'Program';
    case 'leave':
      return 'Leave';
    case 'insurance':
      return 'Insurance';
    case 'other':
      return 'Other';
    default:
      return 'Unknown';
  }
}

// ============== Option Lists ==============

export const BENEFIT_TYPE_OPTIONS: Array<{ value: BenefitPolicyType; label: string }> = [
  { value: 'allowance', label: 'Allowance' },
  { value: 'reimbursement', label: 'Reimbursement' },
  { value: 'program', label: 'Program' },
  { value: 'leave', label: 'Leave' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'other', label: 'Other' },
];

export const TRANSACTION_MODEL_OPTIONS: Array<{ value: TransactionModel; label: string; description: string }> = [
  { value: 'request_only', label: 'Request Only', description: 'Employee submits request for approval before incurring expense' },
  { value: 'claim_only', label: 'Claim Only', description: 'Employee submits claim after incurring expense' },
  { value: 'request_and_claim', label: 'Request + Claim', description: 'Request for pre-approval, then claim for reimbursement' },
];

export const APPROVER_ROLE_OPTIONS: Array<{ value: ApproverRole; label: string }> = [
  { value: 'manager', label: 'Line Manager' },
  { value: 'hr', label: 'HR' },
  { value: 'finance', label: 'Finance' },
  { value: 'admin', label: 'Administrator' },
];

export const CONTRACT_TYPE_OPTIONS = [
  { value: 'permanent', label: 'Permanent' },
  { value: 'temporary', label: 'Temporary/Fixed-term' },
  { value: 'consultant', label: 'Consultant/Contractor' },
];

export const COMMON_DOC_TYPES = [
  { value: 'invoice', label: 'Invoice/Receipt' },
  { value: 'prescription', label: 'Medical Prescription' },
  { value: 'approval_memo', label: 'Approval Memo' },
  { value: 'contract', label: 'Contract/Agreement' },
  { value: 'id_copy', label: 'ID Copy' },
  { value: 'bank_statement', label: 'Bank Statement' },
  { value: 'certificate', label: 'Certificate' },
  { value: 'proof_of_payment', label: 'Proof of Payment' },
  { value: 'medical_report', label: 'Medical Report' },
  { value: 'enrollment_form', label: 'Enrollment Form' },
  { value: 'other', label: 'Other' },
];
