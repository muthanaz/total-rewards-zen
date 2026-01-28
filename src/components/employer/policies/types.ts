/**
 * Policy Editor Types
 * 
 * Types for the comprehensive policy editor.
 */

export type TransactionModel = 'request_only' | 'claim_only' | 'request_and_claim';

export interface EligibilityRules {
  grades: string[];
  departments: string[];
  locations: string[];
  minTenureMonths: number;
  probationPassed: boolean;
  contractTypes: string[];
}

export interface LimitsCaps {
  annualCap: number | null;
  annualCapCurrency: string;
  perTransactionCap: number | null;
  frequency: 'annual' | 'quarterly' | 'monthly' | 'per_event';
  resetMonth: number; // 1-12
  preApprovalThreshold: number | null;
}

export interface RequiredDocument {
  id: string;
  docType: string;
  docName: string;
  isRequired: boolean;
  description?: string;
  transactionType: 'request' | 'claim' | 'both';
}

export interface WorkflowConfig {
  transactionModel: TransactionModel;
  approverGroupId: string | null;
  approverGroupName?: string;
  slaDays: number;
  escalationRole: string | null;
  autoApproveUnderThreshold: boolean;
}

export interface PolicyImpactPreview {
  affectedHeadcount: number;
  eligibleEmployees: number;
  estimatedAnnualSpend: number;
  estimatedSpendRange: { min: number; max: number };
  budgetAllocation: number;
  utilizationProjection: number;
  riskFlags: PolicyRiskFlag[];
}

export interface PolicyRiskFlag {
  id: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  category: 'budget' | 'compliance' | 'operational' | 'coverage';
}

export interface EmployeePreviewData {
  policyTitle: string;
  summary: string[];
  eligibilityStatus: 'eligible' | 'ineligible' | 'pending';
  eligibilityReason?: string;
  annualAllowance: number;
  utilized: number;
  remaining: number;
  requiredDocs: string[];
  exampleScenarios: string[];
  faqs: { question: string; answer: string }[];
}

// Workflow types
export interface WorkflowStep {
  id: string;
  stepOrder: number;
  name: string;
  approverGroupId: string | null;
  approverGroupName?: string;
  slaDays: number;
  escalationAfterDays: number | null;
  escalationRole: string | null;
  pauseOnWaitingFor: ('employee' | 'document' | 'external')[];
  autoApproveConditions?: {
    underAmount?: number;
    forGrades?: string[];
  };
}

export interface WorkflowDefinitionExtended {
  id: string;
  name: string;
  description?: string;
  workflowType: 'claim_approval' | 'policy_change';
  isDefault: boolean;
  isActive: boolean;
  steps: WorkflowStep[];
  createdAt: Date;
  updatedAt: Date;
}

// Approver Group types
export interface ApproverGroupMember {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  addedAt: Date;
}

export interface ApproverGroupExtended {
  id: string;
  name: string;
  description?: string;
  members: ApproverGroupMember[];
  coverageMetrics: {
    activeMembers: number;
    totalCapacity: number;
    avgResponseTime: number; // hours
    currentLoad: number; // pending approvals
  };
  coverageGaps: CoverageGap[];
  conflicts: ApproverConflict[];
}

export interface CoverageGap {
  id: string;
  type: 'no_backup' | 'single_point' | 'timezone' | 'vacation';
  severity: 'high' | 'medium' | 'low';
  description: string;
  affectedPeriod?: { start: Date; end: Date };
  recommendation: string;
}

export interface ApproverConflict {
  id: string;
  type: 'dual_role' | 'reporting_line' | 'self_approval';
  memberId: string;
  memberName: string;
  description: string;
  resolution?: string;
}

// Mock data generators
export const MOCK_GRADES = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7'];
export const MOCK_DEPARTMENTS = ['Engineering', 'Sales', 'Marketing', 'Operations', 'HR', 'Finance', 'Legal'];
export const MOCK_LOCATIONS = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Remote'];
export const MOCK_CONTRACT_TYPES = ['permanent', 'fixed_term', 'contractor', 'part_time'];

export const DOCUMENT_TYPES = [
  { value: 'invoice', label: 'Invoice / Receipt' },
  { value: 'medical_report', label: 'Medical Report' },
  { value: 'prescription', label: 'Prescription' },
  { value: 'certificate', label: 'Certificate' },
  { value: 'contract', label: 'Contract / Agreement' },
  { value: 'proof_of_payment', label: 'Proof of Payment' },
  { value: 'id_document', label: 'ID Document' },
  { value: 'other', label: 'Other' },
];
