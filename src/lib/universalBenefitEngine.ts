/**
 * Universal Benefits Engine
 * 
 * Category-agnostic schema and validation for ALL benefit types.
 * This module extends policyEngine.ts with universal structure support.
 */

import { LucideIcon } from 'lucide-react';
import { 
  TransactionModel, 
  BenefitPolicyType, 
  EligibilityRules, 
  LimitsCaps, 
  WorkflowRules,
  PolicyRequiredDoc,
  DEFAULT_ELIGIBILITY_RULES,
  DEFAULT_LIMITS_CAPS,
  DEFAULT_WORKFLOW,
} from '@/lib/policyEngine';

// ============================================================================
// UNIVERSAL BENEFIT SCHEMA
// ============================================================================

export type LifeArea = 
  | 'housing'
  | 'education' 
  | 'health'
  | 'transport'
  | 'wellbeing'
  | 'financial'
  | 'learning'
  | 'leave'
  | 'perks'
  | 'other';

export interface ReimbursementRules {
  /** What percentage of expense is reimbursed */
  reimbursement_percent: number;
  /** Minimum claim amount */
  min_claim_amount: number | null;
  /** Currency for claims */
  currency: string;
  /** Payment method (payroll, bank transfer, etc.) */
  payment_method: 'payroll' | 'bank_transfer' | 'expense_card';
  /** Days to process after approval */
  processing_days: number;
}

export interface WorkflowStep {
  step_number: number;
  step_name: string;
  description: string;
  required_action: 'submit' | 'upload_docs' | 'review' | 'approve' | 'complete';
  actor: 'employee' | 'manager' | 'hr' | 'finance' | 'system';
  sla_hours: number | null;
}

export interface FAQItem {
  question: string;
  question_ar?: string;
  answer: string;
  answer_ar?: string;
}

export interface BenefitExample {
  scenario: string;
  scenario_ar?: string;
  outcome: string;
  outcome_ar?: string;
  amount?: number;
}

export interface EmployeeGuidance {
  how_to_use: string[];
  how_to_use_ar?: string[];
  tips: string[];
  tips_ar?: string[];
  common_mistakes: string[];
  common_mistakes_ar?: string[];
}

/**
 * Universal Policy Logic JSON structure
 * Supports ALL benefit types consistently
 */
export interface UniversalPolicyLogic {
  // Core classification
  life_area: LifeArea;
  benefit_type: BenefitPolicyType;
  transaction_model: TransactionModel;
  
  // Rules engine
  eligibility_rules: EligibilityRules;
  limits_caps: LimitsCaps;
  reimbursement_rules?: ReimbursementRules;
  
  // Workflow configuration
  workflow: WorkflowRules;
  workflow_steps?: WorkflowStep[];
  
  // Required documentation
  required_docs?: PolicyRequiredDoc[];
  
  // Content for employee understanding
  examples?: BenefitExample[];
  faqs?: FAQItem[];
  pitfalls?: string[];
  employee_guidance?: EmployeeGuidance;
}

/**
 * Universal Policy Content JSON structure
 */
export interface UniversalPolicyContent {
  summary: string[];
  summary_ar?: string[];
  details: string;
  details_ar?: string;
  examples: BenefitExample[];
  faqs: FAQItem[];
  pitfalls: string[];
  pitfalls_ar?: string[];
  employee_guidance?: EmployeeGuidance;
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const DEFAULT_REIMBURSEMENT_RULES: ReimbursementRules = {
  reimbursement_percent: 100,
  min_claim_amount: null,
  currency: 'AED',
  payment_method: 'payroll',
  processing_days: 5,
};

export const DEFAULT_WORKFLOW_STEPS: WorkflowStep[] = [
  {
    step_number: 1,
    step_name: 'Submit',
    description: 'Employee submits request or claim',
    required_action: 'submit',
    actor: 'employee',
    sla_hours: null,
  },
  {
    step_number: 2,
    step_name: 'Upload Documents',
    description: 'Attach required supporting documents',
    required_action: 'upload_docs',
    actor: 'employee',
    sla_hours: 48,
  },
  {
    step_number: 3,
    step_name: 'HR Review',
    description: 'HR reviews submission for policy compliance',
    required_action: 'review',
    actor: 'hr',
    sla_hours: 72,
  },
  {
    step_number: 4,
    step_name: 'Approval',
    description: 'Final approval by designated approver',
    required_action: 'approve',
    actor: 'manager',
    sla_hours: 48,
  },
];

export const DEFAULT_UNIVERSAL_POLICY_LOGIC: UniversalPolicyLogic = {
  life_area: 'other',
  benefit_type: 'allowance',
  transaction_model: 'claim_only',
  eligibility_rules: DEFAULT_ELIGIBILITY_RULES,
  limits_caps: DEFAULT_LIMITS_CAPS,
  workflow: DEFAULT_WORKFLOW,
};

export const DEFAULT_UNIVERSAL_POLICY_CONTENT: UniversalPolicyContent = {
  summary: [],
  details: '',
  examples: [],
  faqs: [],
  pitfalls: [],
};

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate that policy logic has all required fields for universal rendering
 */
export function validateUniversalPolicyLogic(logic: unknown): {
  valid: boolean;
  errors: string[];
  normalized: UniversalPolicyLogic;
} {
  const errors: string[] = [];
  const raw = (logic || {}) as Partial<UniversalPolicyLogic>;
  
  // Normalize with defaults
  const normalized: UniversalPolicyLogic = {
    life_area: isValidLifeArea(raw.life_area) ? raw.life_area : 'other',
    benefit_type: isValidBenefitType(raw.benefit_type) ? raw.benefit_type : 'allowance',
    transaction_model: isValidTransactionModel(raw.transaction_model) ? raw.transaction_model : 'claim_only',
    eligibility_rules: normalizeEligibilityRules(raw.eligibility_rules),
    limits_caps: normalizeLimitsCaps(raw.limits_caps),
    workflow: normalizeWorkflow(raw.workflow),
    reimbursement_rules: raw.reimbursement_rules || DEFAULT_REIMBURSEMENT_RULES,
    workflow_steps: raw.workflow_steps || DEFAULT_WORKFLOW_STEPS,
    examples: raw.examples || [],
    faqs: raw.faqs || [],
    pitfalls: raw.pitfalls || [],
    employee_guidance: raw.employee_guidance,
  };
  
  // Validate required fields
  if (!normalized.life_area) {
    errors.push('life_area is required');
  }
  if (!normalized.benefit_type) {
    errors.push('benefit_type is required');
  }
  if (!normalized.transaction_model) {
    errors.push('transaction_model is required');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    normalized,
  };
}

function isValidLifeArea(value: unknown): value is LifeArea {
  const valid: LifeArea[] = ['housing', 'education', 'health', 'transport', 'wellbeing', 'financial', 'learning', 'leave', 'perks', 'other'];
  return typeof value === 'string' && valid.includes(value as LifeArea);
}

function isValidBenefitType(value: unknown): value is BenefitPolicyType {
  const valid: BenefitPolicyType[] = ['allowance', 'reimbursement', 'program', 'leave', 'insurance', 'other'];
  return typeof value === 'string' && valid.includes(value as BenefitPolicyType);
}

function isValidTransactionModel(value: unknown): value is TransactionModel {
  const valid: TransactionModel[] = ['request_only', 'claim_only', 'request_and_claim'];
  return typeof value === 'string' && valid.includes(value as TransactionModel);
}

function normalizeEligibilityRules(rules: unknown): EligibilityRules {
  if (!rules || typeof rules !== 'object') return DEFAULT_ELIGIBILITY_RULES;
  const r = rules as Partial<EligibilityRules>;
  return {
    grades: Array.isArray(r.grades) ? r.grades : [],
    departments: Array.isArray(r.departments) ? r.departments : [],
    locations: Array.isArray(r.locations) ? r.locations : [],
    contract_types: Array.isArray(r.contract_types) ? r.contract_types : [],
    min_tenure_months: typeof r.min_tenure_months === 'number' ? r.min_tenure_months : 0,
    probation_passed: typeof r.probation_passed === 'boolean' ? r.probation_passed : false,
  };
}

function normalizeLimitsCaps(limits: unknown): LimitsCaps {
  if (!limits || typeof limits !== 'object') return DEFAULT_LIMITS_CAPS;
  const l = limits as Partial<LimitsCaps>;
  return {
    annual_cap: typeof l.annual_cap === 'number' ? l.annual_cap : null,
    annual_cap_currency: typeof l.annual_cap_currency === 'string' ? l.annual_cap_currency : 'AED',
    per_transaction_cap: typeof l.per_transaction_cap === 'number' ? l.per_transaction_cap : null,
    frequency: l.frequency === 'monthly' || l.frequency === 'annual' ? l.frequency : 'annual',
    reset_month: typeof l.reset_month === 'number' ? l.reset_month : 1,
    pre_approval_threshold: typeof l.pre_approval_threshold === 'number' ? l.pre_approval_threshold : null,
  };
}

function normalizeWorkflow(workflow: unknown): WorkflowRules {
  if (!workflow || typeof workflow !== 'object') return DEFAULT_WORKFLOW;
  const w = workflow as Partial<WorkflowRules>;
  return {
    approver_role: w.approver_role || 'manager',
    sla_days: typeof w.sla_days === 'number' ? w.sla_days : 3,
    escalation_role: w.escalation_role || null,
  };
}

// ============================================================================
// DISPLAY HELPERS
// ============================================================================

/**
 * Get human-readable label for life area
 */
export function getLifeAreaLabel(area: LifeArea): string {
  const labels: Record<LifeArea, string> = {
    housing: 'Housing',
    education: 'Education',
    health: 'Health & Wellness',
    transport: 'Transport & Mobility',
    wellbeing: 'Wellbeing',
    financial: 'Financial',
    learning: 'Learning & Development',
    leave: 'Leave & Time Off',
    perks: 'Perks & Discounts',
    other: 'Other Benefits',
  };
  return labels[area] || 'Other';
}

/**
 * Get transaction model display info
 */
export function getTransactionModelInfo(model: TransactionModel): {
  label: string;
  description: string;
  employeeAction: string;
} {
  switch (model) {
    case 'request_only':
      return {
        label: 'Pre-Approval Required',
        description: 'Submit a request before incurring the expense',
        employeeAction: 'Request approval first, then proceed',
      };
    case 'claim_only':
      return {
        label: 'Direct Claim',
        description: 'Pay first, then submit for reimbursement',
        employeeAction: 'Pay and submit claim with receipts',
      };
    case 'request_and_claim':
      return {
        label: 'Request + Claim',
        description: 'Get pre-approval, then submit claim after expense',
        employeeAction: 'Request approval, pay, then claim',
      };
    default:
      return {
        label: 'Standard Process',
        description: 'Follow standard benefit process',
        employeeAction: 'Contact HR for guidance',
      };
  }
}

/**
 * Generate workflow steps display from policy
 */
export function generateWorkflowDisplay(
  transactionModel: TransactionModel,
  customSteps?: WorkflowStep[]
): { step: number; title: string; description: string }[] {
  if (customSteps && customSteps.length > 0) {
    return customSteps.map(s => ({
      step: s.step_number,
      title: s.step_name,
      description: s.description,
    }));
  }
  
  // Default steps based on transaction model
  switch (transactionModel) {
    case 'request_only':
      return [
        { step: 1, title: 'Submit Request', description: 'Describe what you need and why' },
        { step: 2, title: 'Manager Review', description: 'Your manager reviews and approves' },
        { step: 3, title: 'HR Processing', description: 'HR completes the request' },
      ];
    case 'claim_only':
      return [
        { step: 1, title: 'Incur Expense', description: 'Pay for the eligible expense' },
        { step: 2, title: 'Submit Claim', description: 'Upload receipts and details' },
        { step: 3, title: 'Reimbursement', description: 'Receive payment with next payroll' },
      ];
    case 'request_and_claim':
      return [
        { step: 1, title: 'Request Approval', description: 'Get pre-approval for the expense' },
        { step: 2, title: 'Incur Expense', description: 'Proceed once approved' },
        { step: 3, title: 'Submit Claim', description: 'Upload receipts for reimbursement' },
        { step: 4, title: 'Reimbursement', description: 'Receive payment with next payroll' },
      ];
    default:
      return [];
  }
}

// ============================================================================
// CATEGORY MAPPING
// ============================================================================

/**
 * Map UI category strings to life areas
 */
export const CATEGORY_TO_LIFE_AREA: Record<string, LifeArea> = {
  'Housing': 'housing',
  'Housing Allowance': 'housing',
  'Education': 'education',
  'Education Allowance': 'education',
  'Schooling': 'education',
  'Health': 'health',
  'Health Insurance': 'health',
  'Medical': 'health',
  'Transport': 'transport',
  'Transport & Mobility': 'transport',
  'Wellbeing': 'wellbeing',
  'Wellbeing Program': 'wellbeing',
  'Financial': 'financial',
  'Financial Planning': 'financial',
  'Learning': 'learning',
  'Learning & Development': 'learning',
  'Leave': 'leave',
  'Leave Management': 'leave',
  'Per Diem': 'transport',
  'Perks': 'perks',
  'Marketplace': 'perks',
  'Other': 'other',
};

export function categoryToLifeArea(category: string): LifeArea {
  return CATEGORY_TO_LIFE_AREA[category] || 'other';
}
