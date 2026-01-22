/**
 * Universal Benefit Schema - Strict Validators & Safe Defaults
 * 
 * This module provides:
 * 1. Complete schema definitions for ALL benefit types
 * 2. Strict validation with detailed error messages
 * 3. Safe defaults that prevent rendering crashes
 * 4. Category-agnostic normalization
 * 
 * NOTE: Core types are imported from taxonomy.ts (single source of truth)
 */

import { 
  TransactionModel, 
  EligibilityRules, 
  LimitsCaps, 
  WorkflowRules,
  PolicyRequiredDoc,
} from '@/lib/policyEngine';

// Re-export canonical types from taxonomy
export { 
  type CanonicalLifeArea,
  type LifeArea,
  type BenefitMechanism,
  type BenefitPolicyType,
  type BenefitPillar,
  CANONICAL_LIFE_AREAS,
  BENEFIT_MECHANISMS,
  BENEFIT_PILLARS,
  normalizeToLifeArea,
  isValidLifeArea,
  isValidBenefitMechanism,
  getLifeAreaLabel,
  getLifeAreaFullLabel,
  getLifeAreaIcon,
  getLifeAreaColors,
  getLifeAreaRoute,
  getBenefitPillarLabel,
  getBenefitMechanismLabel,
  LIFE_AREA_METADATA,
  BENEFIT_PILLAR_METADATA,
  BENEFIT_MECHANISM_METADATA,
} from '@/lib/taxonomy';

import { 
  type CanonicalLifeArea as LifeArea,
  type BenefitMechanism as BenefitPolicyType,
  CANONICAL_LIFE_AREAS,
  BENEFIT_MECHANISMS,
  normalizeToLifeArea,
  LIFE_AREA_METADATA,
} from '@/lib/taxonomy';

// =============================================================================
// ADDITIONAL SCHEMA TYPES
// =============================================================================

export interface ReimbursementRules {
  reimbursement_percent: number;
  min_claim_amount: number | null;
  currency: string;
  payment_method: 'payroll' | 'bank_transfer' | 'expense_card';
  processing_days: number;
}

export interface WorkflowStep {
  step_number: number;
  step_name: string;
  step_name_ar?: string;
  description: string;
  description_ar?: string;
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
  what_you_get: string[];
  what_you_get_ar?: string[];
  how_to_use: string[];
  how_to_use_ar?: string[];
  tips: string[];
  tips_ar?: string[];
  common_mistakes: string[];
  common_mistakes_ar?: string[];
}

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
  pitfalls_ar?: string[];
  employee_guidance?: EmployeeGuidance;
  
  // Read-only flag for display-only benefits (equity, etc.)
  is_read_only?: boolean;
}

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

// =============================================================================
// SAFE DEFAULTS
// =============================================================================

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
  approver_role: 'hr',
  sla_days: 3,
  escalation_role: null,
};

export const DEFAULT_REIMBURSEMENT_RULES: ReimbursementRules = {
  reimbursement_percent: 100,
  min_claim_amount: null,
  currency: 'AED',
  payment_method: 'payroll',
  processing_days: 5,
};

export const DEFAULT_EMPLOYEE_GUIDANCE: EmployeeGuidance = {
  what_you_get: [],
  how_to_use: [],
  tips: [],
  common_mistakes: [],
};

export const DEFAULT_UNIVERSAL_POLICY_LOGIC: UniversalPolicyLogic = {
  life_area: 'other',
  benefit_type: 'allowance',
  transaction_model: 'claim_only',
  eligibility_rules: DEFAULT_ELIGIBILITY_RULES,
  limits_caps: DEFAULT_LIMITS_CAPS,
  workflow: DEFAULT_WORKFLOW,
  reimbursement_rules: DEFAULT_REIMBURSEMENT_RULES,
  is_read_only: false,
};

export const DEFAULT_UNIVERSAL_POLICY_CONTENT: UniversalPolicyContent = {
  summary: [],
  details: '',
  examples: [],
  faqs: [],
  pitfalls: [],
};

// =============================================================================
// WORKFLOW TEMPLATES BY TRANSACTION MODEL
// =============================================================================

export const WORKFLOW_TEMPLATES: Record<TransactionModel, WorkflowStep[]> = {
  request_only: [
    { step_number: 1, step_name: 'Submit Request', description: 'Describe what you need and why', required_action: 'submit', actor: 'employee', sla_hours: null },
    { step_number: 2, step_name: 'Manager Review', description: 'Your manager reviews and approves', required_action: 'review', actor: 'manager', sla_hours: 48 },
    { step_number: 3, step_name: 'HR Processing', description: 'HR completes the request', required_action: 'complete', actor: 'hr', sla_hours: 72 },
  ],
  claim_only: [
    { step_number: 1, step_name: 'Incur Expense', description: 'Pay for the eligible expense', required_action: 'submit', actor: 'employee', sla_hours: null },
    { step_number: 2, step_name: 'Submit Claim', description: 'Upload receipts and details', required_action: 'upload_docs', actor: 'employee', sla_hours: null },
    { step_number: 3, step_name: 'HR Review', description: 'HR verifies documentation', required_action: 'review', actor: 'hr', sla_hours: 48 },
    { step_number: 4, step_name: 'Reimbursement', description: 'Receive payment with next payroll', required_action: 'complete', actor: 'finance', sla_hours: 72 },
  ],
  request_and_claim: [
    { step_number: 1, step_name: 'Request Approval', description: 'Get pre-approval for the expense', required_action: 'submit', actor: 'employee', sla_hours: null },
    { step_number: 2, step_name: 'Manager Approval', description: 'Manager reviews and approves', required_action: 'approve', actor: 'manager', sla_hours: 48 },
    { step_number: 3, step_name: 'Incur Expense', description: 'Proceed once approved', required_action: 'submit', actor: 'employee', sla_hours: null },
    { step_number: 4, step_name: 'Submit Claim', description: 'Upload receipts for reimbursement', required_action: 'upload_docs', actor: 'employee', sla_hours: null },
    { step_number: 5, step_name: 'Reimbursement', description: 'Receive payment with next payroll', required_action: 'complete', actor: 'finance', sla_hours: 72 },
  ],
};

// =============================================================================
// STRICT VALIDATORS
// =============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  normalized: UniversalPolicyLogic;
}

const VALID_TRANSACTION_MODELS: TransactionModel[] = [
  'request_only', 'claim_only', 'request_and_claim'
];

function isValidTransactionModel(value: unknown): value is TransactionModel {
  return typeof value === 'string' && VALID_TRANSACTION_MODELS.includes(value as TransactionModel);
}

function normalizeEligibilityRules(rules: unknown): EligibilityRules {
  if (!rules || typeof rules !== 'object') return { ...DEFAULT_ELIGIBILITY_RULES };
  const r = rules as Partial<EligibilityRules>;
  return {
    grades: Array.isArray(r.grades) ? r.grades.filter(g => typeof g === 'string') : [],
    departments: Array.isArray(r.departments) ? r.departments.filter(d => typeof d === 'string') : [],
    locations: Array.isArray(r.locations) ? r.locations.filter(l => typeof l === 'string') : [],
    contract_types: Array.isArray(r.contract_types) ? r.contract_types.filter(c => typeof c === 'string') : [],
    min_tenure_months: typeof r.min_tenure_months === 'number' && r.min_tenure_months >= 0 ? r.min_tenure_months : 0,
    probation_passed: typeof r.probation_passed === 'boolean' ? r.probation_passed : false,
  };
}

function normalizeLimitsCaps(limits: unknown): LimitsCaps {
  if (!limits || typeof limits !== 'object') return { ...DEFAULT_LIMITS_CAPS };
  const l = limits as Partial<LimitsCaps>;
  return {
    annual_cap: typeof l.annual_cap === 'number' && l.annual_cap >= 0 ? l.annual_cap : null,
    annual_cap_currency: typeof l.annual_cap_currency === 'string' ? l.annual_cap_currency : 'AED',
    per_transaction_cap: typeof l.per_transaction_cap === 'number' && l.per_transaction_cap >= 0 ? l.per_transaction_cap : null,
    frequency: l.frequency === 'monthly' || l.frequency === 'annual' ? l.frequency : 'annual',
    reset_month: typeof l.reset_month === 'number' && l.reset_month >= 1 && l.reset_month <= 12 ? l.reset_month : 1,
    pre_approval_threshold: typeof l.pre_approval_threshold === 'number' && l.pre_approval_threshold >= 0 ? l.pre_approval_threshold : null,
  };
}

function normalizeWorkflow(workflow: unknown): WorkflowRules {
  if (!workflow || typeof workflow !== 'object') return { ...DEFAULT_WORKFLOW };
  const w = workflow as Partial<WorkflowRules>;
  const validRoles = ['manager', 'hr', 'finance', 'admin'];
  return {
    approver_role: validRoles.includes(w.approver_role as string) ? w.approver_role! : 'hr',
    sla_days: typeof w.sla_days === 'number' && w.sla_days >= 1 ? w.sla_days : 3,
    escalation_role: validRoles.includes(w.escalation_role as string) ? w.escalation_role! : null,
  };
}

function normalizeReimbursementRules(rules: unknown): ReimbursementRules {
  if (!rules || typeof rules !== 'object') return { ...DEFAULT_REIMBURSEMENT_RULES };
  const r = rules as Partial<ReimbursementRules>;
  const validPaymentMethods = ['payroll', 'bank_transfer', 'expense_card'];
  return {
    reimbursement_percent: typeof r.reimbursement_percent === 'number' && r.reimbursement_percent >= 0 && r.reimbursement_percent <= 100 ? r.reimbursement_percent : 100,
    min_claim_amount: typeof r.min_claim_amount === 'number' && r.min_claim_amount >= 0 ? r.min_claim_amount : null,
    currency: typeof r.currency === 'string' ? r.currency : 'AED',
    payment_method: validPaymentMethods.includes(r.payment_method as string) ? r.payment_method! : 'payroll',
    processing_days: typeof r.processing_days === 'number' && r.processing_days >= 1 ? r.processing_days : 5,
  };
}

function normalizeWorkflowSteps(steps: unknown, transactionModel: TransactionModel): WorkflowStep[] {
  if (Array.isArray(steps) && steps.length > 0) {
    return steps.map((s, i) => ({
      step_number: typeof s.step_number === 'number' ? s.step_number : i + 1,
      step_name: typeof s.step_name === 'string' ? s.step_name : `Step ${i + 1}`,
      step_name_ar: typeof s.step_name_ar === 'string' ? s.step_name_ar : undefined,
      description: typeof s.description === 'string' ? s.description : '',
      description_ar: typeof s.description_ar === 'string' ? s.description_ar : undefined,
      required_action: ['submit', 'upload_docs', 'review', 'approve', 'complete'].includes(s.required_action) ? s.required_action : 'submit',
      actor: ['employee', 'manager', 'hr', 'finance', 'system'].includes(s.actor) ? s.actor : 'employee',
      sla_hours: typeof s.sla_hours === 'number' && s.sla_hours >= 0 ? s.sla_hours : null,
    }));
  }
  return WORKFLOW_TEMPLATES[transactionModel] || WORKFLOW_TEMPLATES.claim_only;
}

function normalizeRequiredDocs(docs: unknown): PolicyRequiredDoc[] {
  if (!Array.isArray(docs)) return [];
  return docs.filter(d => d && typeof d === 'object').map((d, i) => ({
    id: typeof d.id === 'string' ? d.id : `doc-${i}`,
    transaction_type: ['request', 'claim', 'both'].includes(d.transaction_type) ? d.transaction_type : 'both',
    doc_type: typeof d.doc_type === 'string' ? d.doc_type : 'other',
    doc_name: typeof d.doc_name === 'string' ? d.doc_name : `Document ${i + 1}`,
    is_required: typeof d.is_required === 'boolean' ? d.is_required : true,
    conditions_json: d.conditions_json && typeof d.conditions_json === 'object' ? d.conditions_json : {},
    description: typeof d.description === 'string' ? d.description : undefined,
  }));
}

function normalizeFAQs(faqs: unknown): FAQItem[] {
  if (!Array.isArray(faqs)) return [];
  return faqs.filter(f => f && typeof f === 'object' && typeof f.question === 'string' && typeof f.answer === 'string').map(f => ({
    question: f.question,
    question_ar: typeof f.question_ar === 'string' ? f.question_ar : undefined,
    answer: f.answer,
    answer_ar: typeof f.answer_ar === 'string' ? f.answer_ar : undefined,
  }));
}

function normalizeExamples(examples: unknown): BenefitExample[] {
  if (!Array.isArray(examples)) return [];
  return examples.filter(e => e && typeof e === 'object' && typeof e.scenario === 'string' && typeof e.outcome === 'string').map(e => ({
    scenario: e.scenario,
    scenario_ar: typeof e.scenario_ar === 'string' ? e.scenario_ar : undefined,
    outcome: e.outcome,
    outcome_ar: typeof e.outcome_ar === 'string' ? e.outcome_ar : undefined,
    amount: typeof e.amount === 'number' ? e.amount : undefined,
  }));
}

function normalizeEmployeeGuidance(guidance: unknown): EmployeeGuidance | undefined {
  if (!guidance || typeof guidance !== 'object') return undefined;
  const g = guidance as Partial<EmployeeGuidance>;
  
  const hasContent = 
    (Array.isArray(g.what_you_get) && g.what_you_get.length > 0) ||
    (Array.isArray(g.how_to_use) && g.how_to_use.length > 0) ||
    (Array.isArray(g.tips) && g.tips.length > 0) ||
    (Array.isArray(g.common_mistakes) && g.common_mistakes.length > 0);
  
  if (!hasContent) return undefined;
  
  return {
    what_you_get: Array.isArray(g.what_you_get) ? g.what_you_get.filter(s => typeof s === 'string') : [],
    what_you_get_ar: Array.isArray(g.what_you_get_ar) ? g.what_you_get_ar.filter(s => typeof s === 'string') : undefined,
    how_to_use: Array.isArray(g.how_to_use) ? g.how_to_use.filter(s => typeof s === 'string') : [],
    how_to_use_ar: Array.isArray(g.how_to_use_ar) ? g.how_to_use_ar.filter(s => typeof s === 'string') : undefined,
    tips: Array.isArray(g.tips) ? g.tips.filter(s => typeof s === 'string') : [],
    tips_ar: Array.isArray(g.tips_ar) ? g.tips_ar.filter(s => typeof s === 'string') : undefined,
    common_mistakes: Array.isArray(g.common_mistakes) ? g.common_mistakes.filter(s => typeof s === 'string') : [],
    common_mistakes_ar: Array.isArray(g.common_mistakes_ar) ? g.common_mistakes_ar.filter(s => typeof s === 'string') : undefined,
  };
}

/**
 * Strict validator for UniversalPolicyLogic
 * Returns normalized data with safe defaults, never crashes
 */
export function validateAndNormalizePolicyLogic(logic: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const raw = (logic || {}) as Partial<UniversalPolicyLogic>;
  
  // Validate and normalize life_area using taxonomy
  let life_area: LifeArea = 'other';
  if (!raw.life_area) {
    warnings.push('life_area missing, defaulting to "other"');
  } else {
    const normalized = normalizeToLifeArea(raw.life_area as string);
    if (normalized === 'other' && raw.life_area !== 'other') {
      warnings.push(`Unknown life_area "${raw.life_area}", defaulting to "other"`);
    }
    life_area = normalized;
  }
  
  // Validate and normalize benefit_type using taxonomy
  let benefit_type: BenefitPolicyType = 'allowance';
  if (!raw.benefit_type) {
    warnings.push('benefit_type missing, defaulting to "allowance"');
  } else if (!BENEFIT_MECHANISMS.includes(raw.benefit_type as BenefitPolicyType)) {
    warnings.push(`Invalid benefit_type "${raw.benefit_type}", defaulting to "allowance"`);
  } else {
    benefit_type = raw.benefit_type;
  }
  
  // Validate and normalize transaction_model
  let transaction_model: TransactionModel = 'claim_only';
  if (!raw.transaction_model) {
    warnings.push('transaction_model missing, defaulting to "claim_only"');
  } else if (!isValidTransactionModel(raw.transaction_model)) {
    warnings.push(`Invalid transaction_model "${raw.transaction_model}", defaulting to "claim_only"`);
  } else {
    transaction_model = raw.transaction_model;
  }
  
  // Normalize all nested objects with safe defaults
  const eligibility_rules = normalizeEligibilityRules(raw.eligibility_rules);
  const limits_caps = normalizeLimitsCaps(raw.limits_caps);
  const workflow = normalizeWorkflow(raw.workflow);
  const reimbursement_rules = normalizeReimbursementRules(raw.reimbursement_rules);
  const workflow_steps = normalizeWorkflowSteps(raw.workflow_steps, transaction_model);
  const required_docs = normalizeRequiredDocs(raw.required_docs);
  const examples = normalizeExamples(raw.examples);
  const faqs = normalizeFAQs(raw.faqs);
  const pitfalls = Array.isArray(raw.pitfalls) ? raw.pitfalls.filter(p => typeof p === 'string') : [];
  const pitfalls_ar = Array.isArray(raw.pitfalls_ar) ? raw.pitfalls_ar.filter(p => typeof p === 'string') : undefined;
  const employee_guidance = normalizeEmployeeGuidance(raw.employee_guidance);
  const is_read_only = typeof raw.is_read_only === 'boolean' ? raw.is_read_only : false;
  
  const normalized: UniversalPolicyLogic = {
    life_area,
    benefit_type,
    transaction_model,
    eligibility_rules,
    limits_caps,
    workflow,
    reimbursement_rules,
    workflow_steps,
    required_docs,
    examples,
    faqs,
    pitfalls,
    pitfalls_ar,
    employee_guidance,
    is_read_only,
  };
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    normalized,
  };
}

/**
 * Validate and normalize policy content
 */
export function validateAndNormalizePolicyContent(content: unknown): UniversalPolicyContent {
  if (!content || typeof content !== 'object') {
    return { ...DEFAULT_UNIVERSAL_POLICY_CONTENT };
  }
  
  const raw = content as Partial<UniversalPolicyContent>;
  
  return {
    summary: Array.isArray(raw.summary) ? raw.summary.filter(s => typeof s === 'string') : [],
    summary_ar: Array.isArray(raw.summary_ar) ? raw.summary_ar.filter(s => typeof s === 'string') : undefined,
    details: typeof raw.details === 'string' ? raw.details : '',
    details_ar: typeof raw.details_ar === 'string' ? raw.details_ar : undefined,
    examples: normalizeExamples(raw.examples),
    faqs: normalizeFAQs(raw.faqs),
    pitfalls: Array.isArray(raw.pitfalls) ? raw.pitfalls.filter(p => typeof p === 'string') : [],
    pitfalls_ar: Array.isArray(raw.pitfalls_ar) ? raw.pitfalls_ar.filter(p => typeof p === 'string') : undefined,
    employee_guidance: normalizeEmployeeGuidance(raw.employee_guidance),
  };
}

// =============================================================================
// DISPLAY HELPERS (using taxonomy)
// =============================================================================

/**
 * @deprecated Use getLifeAreaLabel from taxonomy.ts
 * Kept for backward compatibility
 */
export const LIFE_AREA_LABELS: Record<LifeArea, { en: string; ar: string }> = Object.fromEntries(
  CANONICAL_LIFE_AREAS.map(area => [
    area, 
    { en: LIFE_AREA_METADATA[area].label, ar: LIFE_AREA_METADATA[area].labelAr }
  ])
) as Record<LifeArea, { en: string; ar: string }>;

export const TRANSACTION_MODEL_LABELS: Record<TransactionModel, { en: string; ar: string; description: string; action: string }> = {
  request_only: { 
    en: 'Pre-Approval Required', 
    ar: 'يتطلب موافقة مسبقة',
    description: 'Submit a request before incurring the expense',
    action: 'Submit Request',
  },
  claim_only: { 
    en: 'Direct Claim', 
    ar: 'مطالبة مباشرة',
    description: 'Pay first, then submit for reimbursement',
    action: 'Submit Claim',
  },
  request_and_claim: { 
    en: 'Request + Claim', 
    ar: 'طلب + مطالبة',
    description: 'Get pre-approval, then submit claim after expense',
    action: 'Start Request',
  },
};

export function getTransactionModelLabel(model: TransactionModel, language: 'en' | 'ar' = 'en'): string {
  return TRANSACTION_MODEL_LABELS[model]?.[language] || TRANSACTION_MODEL_LABELS.claim_only[language];
}

export function getTransactionModelAction(model: TransactionModel): string {
  return TRANSACTION_MODEL_LABELS[model]?.action || 'Submit';
}

export function getMonthName(month: number): string {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return months[(month - 1) % 12];
}

// =============================================================================
// CATEGORY MAPPING (using taxonomy)
// =============================================================================

import { STRING_TO_LIFE_AREA } from '@/lib/taxonomy';

/**
 * @deprecated Use normalizeToLifeArea from taxonomy.ts
 * Kept for backward compatibility
 */
export const CATEGORY_TO_LIFE_AREA: Record<string, LifeArea> = STRING_TO_LIFE_AREA;

/**
 * @deprecated Use normalizeToLifeArea from taxonomy.ts
 */
export function categoryToLifeArea(category: string): LifeArea {
  return normalizeToLifeArea(category);
}
