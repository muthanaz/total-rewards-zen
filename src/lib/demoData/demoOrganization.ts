/**
 * Demo Organization - Single Source of Truth
 * 
 * Nexa Holdings: A realistic UAE company with 30 employees
 * across 4 departments and 3 grades.
 */

export const DEMO_ORG = {
  id: 'demo-org-nexa',
  name: 'Nexa Holdings',
  industry: 'Diversified Conglomerate',
  region: 'UAE',
  city: 'Dubai',
  currency: 'AED',
  fiscalYearStart: 1, // January
} as const;

// ============================================================
// DEPARTMENTS (4 departments)
// ============================================================

export const DEMO_DEPARTMENTS = [
  { id: 'dept-eng', name: 'Engineering', code: 'ENG', headcount: 10 },
  { id: 'dept-sales', name: 'Sales & Marketing', code: 'SM', headcount: 8 },
  { id: 'dept-ops', name: 'Operations', code: 'OPS', headcount: 7 },
  { id: 'dept-corp', name: 'Corporate Services', code: 'CORP', headcount: 5 },
] as const;

// ============================================================
// GRADES (3 grades + Leadership)
// ============================================================

export const DEMO_GRADES = [
  { 
    id: 'L3', 
    name: 'Grade L3 - Associate', 
    salaryRange: [12000, 18000],
    benefitMultiplier: 0.28, // 28% of salary as benefits budget
  },
  { 
    id: 'L4', 
    name: 'Grade L4 - Specialist', 
    salaryRange: [18000, 28000],
    benefitMultiplier: 0.32,
  },
  { 
    id: 'L5', 
    name: 'Grade L5 - Manager', 
    salaryRange: [28000, 45000],
    benefitMultiplier: 0.38,
  },
  { 
    id: 'L6', 
    name: 'Grade L6 - Director', 
    salaryRange: [45000, 70000],
    benefitMultiplier: 0.42,
  },
] as const;

// ============================================================
// BENEFIT CATEGORIES WITH ENTITLEMENT RULES
// ============================================================

export interface BenefitCategoryConfig {
  id: string;
  name: string;
  nameAr: string;
  type: 'allowance' | 'reimbursement' | 'coverage';
  transactionModel: 'claim_only' | 'request_only' | 'request_and_claim';
  eligibleGrades: string[];
  requiresDependents?: boolean;
  annualCapByGrade: Record<string, number>;
}

export const DEMO_BENEFIT_CATEGORIES: BenefitCategoryConfig[] = [
  {
    id: 'housing',
    name: 'Housing',
    nameAr: 'السكن',
    type: 'allowance',
    transactionModel: 'claim_only',
    eligibleGrades: ['L3', 'L4', 'L5', 'L6'],
    annualCapByGrade: {
      'L3': 72000,  // 6,000/month
      'L4': 96000,  // 8,000/month
      'L5': 144000, // 12,000/month
      'L6': 192000, // 16,000/month
    },
  },
  {
    id: 'transport',
    name: 'Transport',
    nameAr: 'النقل',
    type: 'allowance',
    transactionModel: 'claim_only',
    eligibleGrades: ['L3', 'L4', 'L5', 'L6'],
    annualCapByGrade: {
      'L3': 12000, // 1,000/month
      'L4': 18000, // 1,500/month
      'L5': 24000, // 2,000/month
      'L6': 36000, // 3,000/month
    },
  },
  {
    id: 'schooling',
    name: 'Schooling',
    nameAr: 'التعليم',
    type: 'reimbursement',
    transactionModel: 'claim_only',
    eligibleGrades: ['L4', 'L5', 'L6'],
    requiresDependents: true,
    annualCapByGrade: {
      'L4': 40000, // per child
      'L5': 50000,
      'L6': 60000,
    },
  },
  {
    id: 'health',
    name: 'Health',
    nameAr: 'الصحة',
    type: 'coverage',
    transactionModel: 'claim_only',
    eligibleGrades: ['L3', 'L4', 'L5', 'L6'],
    annualCapByGrade: {
      'L3': 15000,
      'L4': 25000,
      'L5': 40000,
      'L6': 60000,
    },
  },
  {
    id: 'wellbeing',
    name: 'Wellbeing',
    nameAr: 'العافية',
    type: 'reimbursement',
    transactionModel: 'claim_only',
    eligibleGrades: ['L3', 'L4', 'L5', 'L6'],
    annualCapByGrade: {
      'L3': 3000,
      'L4': 4000,
      'L5': 5000,
      'L6': 6000,
    },
  },
  {
    id: 'learning',
    name: 'Learning',
    nameAr: 'التعلم',
    type: 'reimbursement',
    transactionModel: 'request_and_claim',
    eligibleGrades: ['L3', 'L4', 'L5', 'L6'],
    annualCapByGrade: {
      'L3': 5000,
      'L4': 8000,
      'L5': 12000,
      'L6': 15000,
    },
  },
];

// Get total annual cap for an employee based on grade
export function getEmployeeTotalEntitlement(grade: string, hasDependents: boolean = false): number {
  let total = 0;
  for (const cat of DEMO_BENEFIT_CATEGORIES) {
    if (!cat.eligibleGrades.includes(grade)) continue;
    if (cat.requiresDependents && !hasDependents) continue;
    total += cat.annualCapByGrade[grade] || 0;
  }
  return total;
}

// Get category cap
export function getCategoryCap(categoryId: string, grade: string): number {
  const cat = DEMO_BENEFIT_CATEGORIES.find(c => c.id === categoryId);
  return cat?.annualCapByGrade[grade] || 0;
}
