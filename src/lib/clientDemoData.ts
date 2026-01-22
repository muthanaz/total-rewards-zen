/**
 * Client Demo Pack - Comprehensive Demo Organizations
 * 
 * Three distinct organization profiles with realistic benefit sets,
 * governance settings, and life-stage employee variation.
 */

// ============================================
// DEMO ORGANIZATIONS (3 profiles)
// ============================================

export type OrgType = 'government' | 'large_private' | 'sme';
export type LifeStage = 'single' | 'married' | 'with_kids' | 'senior';
export type GradeLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface DemoOrg {
  id: string;
  name: string;
  nameAr: string;
  type: OrgType;
  industry: string;
  industryAr: string;
  region: string;
  city: string;
  employeeCount: number;
  currency: string;
  fiscalYearStart: string;
  branding: {
    primaryColor: string;
    logoInitials: string;
  };
  governance: {
    enforcementMode: 'advisory' | 'enforced' | 'strict';
    requiresPolicyApproval: boolean;
    approverRole: string;
    approvalSlaDays: number;
  };
  benefits: DemoBenefit[];
  keyMetrics: OrgMetrics;
}

export interface DemoBenefit {
  id: string;
  name: string;
  nameAr: string;
  category: string;
  annualBudget: number;
  utilizationRate: number;
  gradeEligibility: Record<GradeLevel, { eligible: boolean; limit: number }>;
}

export interface OrgMetrics {
  totalInvestment: number;
  utilizationRate: number;
  claimsSla: number;
  esatScore: number;
  zombieSpend: number;
  inquiryDeflection: number;
  avgProcessingDays: number;
}

export interface DemoEmployee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  grade: GradeLevel;
  department: string;
  position: string;
  lifeStage: LifeStage;
  dependents: number;
  yearsOfService: number;
  monthlySalary: number;
  benefits: EmployeeBenefit[];
}

export interface EmployeeBenefit {
  name: string;
  annualValue: number;
  utilized: number;
  category: string;
  nextAction?: string;
}

// ============================================
// ORGANIZATION 1: GOVERNMENT ENTITY
// ============================================

export const DEMO_ORG_GOV: DemoOrg = {
  id: 'demo-gov-001',
  name: 'Abu Dhabi Investment Authority',
  nameAr: 'جهاز أبوظبي للاستثمار',
  type: 'government',
  industry: 'Government Investment',
  industryAr: 'الاستثمار الحكومي',
  region: 'UAE',
  city: 'Abu Dhabi',
  employeeCount: 1247,
  currency: 'AED',
  fiscalYearStart: '2026-01-01',
  branding: {
    primaryColor: '#1E40AF',
    logoInitials: 'ADIA',
  },
  governance: {
    enforcementMode: 'strict',
    requiresPolicyApproval: true,
    approverRole: 'Department Head',
    approvalSlaDays: 5,
  },
  benefits: [
    { id: 'gov-ben-001', name: 'Housing Allowance', nameAr: 'بدل السكن', category: 'housing', annualBudget: 18500000, utilizationRate: 100, gradeEligibility: { A1: { eligible: true, limit: 180000 }, A2: { eligible: true, limit: 150000 }, B1: { eligible: true, limit: 120000 }, B2: { eligible: true, limit: 96000 }, C1: { eligible: true, limit: 72000 }, C2: { eligible: true, limit: 60000 } } },
    { id: 'gov-ben-002', name: 'Schooling Allowance', nameAr: 'بدل التعليم', category: 'education', annualBudget: 12400000, utilizationRate: 92, gradeEligibility: { A1: { eligible: true, limit: 80000 }, A2: { eligible: true, limit: 70000 }, B1: { eligible: true, limit: 60000 }, B2: { eligible: true, limit: 50000 }, C1: { eligible: true, limit: 40000 }, C2: { eligible: true, limit: 35000 } } },
    { id: 'gov-ben-003', name: 'Premium Health Insurance', nameAr: 'التأمين الصحي المتميز', category: 'health', annualBudget: 8900000, utilizationRate: 78, gradeEligibility: { A1: { eligible: true, limit: 75000 }, A2: { eligible: true, limit: 65000 }, B1: { eligible: true, limit: 55000 }, B2: { eligible: true, limit: 45000 }, C1: { eligible: true, limit: 38000 }, C2: { eligible: true, limit: 32000 } } },
    { id: 'gov-ben-004', name: 'Transport & Mobility', nameAr: 'النقل والتنقل', category: 'transport', annualBudget: 4200000, utilizationRate: 85, gradeEligibility: { A1: { eligible: true, limit: 48000 }, A2: { eligible: true, limit: 42000 }, B1: { eligible: true, limit: 36000 }, B2: { eligible: true, limit: 30000 }, C1: { eligible: true, limit: 24000 }, C2: { eligible: true, limit: 18000 } } },
    { id: 'gov-ben-005', name: 'Executive Development', nameAr: 'التطوير التنفيذي', category: 'learning', annualBudget: 3100000, utilizationRate: 45, gradeEligibility: { A1: { eligible: true, limit: 50000 }, A2: { eligible: true, limit: 40000 }, B1: { eligible: true, limit: 25000 }, B2: { eligible: true, limit: 15000 }, C1: { eligible: true, limit: 10000 }, C2: { eligible: true, limit: 8000 } } },
    { id: 'gov-ben-006', name: 'Retirement Savings', nameAr: 'مدخرات التقاعد', category: 'financial', annualBudget: 6200000, utilizationRate: 88, gradeEligibility: { A1: { eligible: true, limit: 60000 }, A2: { eligible: true, limit: 50000 }, B1: { eligible: true, limit: 40000 }, B2: { eligible: true, limit: 35000 }, C1: { eligible: true, limit: 30000 }, C2: { eligible: true, limit: 25000 } } },
  ],
  keyMetrics: {
    totalInvestment: 53300000,
    utilizationRate: 82,
    claimsSla: 96,
    esatScore: 84,
    zombieSpend: 4250000,
    inquiryDeflection: 72,
    avgProcessingDays: 1.8,
  },
};

// ============================================
// ORGANIZATION 2: LARGE PRIVATE ENTERPRISE
// ============================================

export const DEMO_ORG_PRIVATE: DemoOrg = {
  id: 'demo-prv-001',
  name: 'Emirates NBD',
  nameAr: 'الإمارات دبي الوطني',
  type: 'large_private',
  industry: 'Banking & Finance',
  industryAr: 'البنوك والتمويل',
  region: 'UAE',
  city: 'Dubai',
  employeeCount: 4523,
  currency: 'AED',
  fiscalYearStart: '2026-01-01',
  branding: {
    primaryColor: '#00A651',
    logoInitials: 'ENBD',
  },
  governance: {
    enforcementMode: 'enforced',
    requiresPolicyApproval: true,
    approverRole: 'HR Manager',
    approvalSlaDays: 3,
  },
  benefits: [
    { id: 'prv-ben-001', name: 'Housing Allowance', nameAr: 'بدل السكن', category: 'housing', annualBudget: 42000000, utilizationRate: 100, gradeEligibility: { A1: { eligible: true, limit: 144000 }, A2: { eligible: true, limit: 120000 }, B1: { eligible: true, limit: 96000 }, B2: { eligible: true, limit: 72000 }, C1: { eligible: true, limit: 54000 }, C2: { eligible: true, limit: 42000 } } },
    { id: 'prv-ben-002', name: 'Children Education', nameAr: 'تعليم الأطفال', category: 'education', annualBudget: 28500000, utilizationRate: 76, gradeEligibility: { A1: { eligible: true, limit: 65000 }, A2: { eligible: true, limit: 55000 }, B1: { eligible: true, limit: 45000 }, B2: { eligible: true, limit: 35000 }, C1: { eligible: true, limit: 25000 }, C2: { eligible: true, limit: 20000 } } },
    { id: 'prv-ben-003', name: 'Medical Insurance', nameAr: 'التأمين الطبي', category: 'health', annualBudget: 18200000, utilizationRate: 71, gradeEligibility: { A1: { eligible: true, limit: 55000 }, A2: { eligible: true, limit: 48000 }, B1: { eligible: true, limit: 42000 }, B2: { eligible: true, limit: 35000 }, C1: { eligible: true, limit: 28000 }, C2: { eligible: true, limit: 22000 } } },
    { id: 'prv-ben-004', name: 'Transport Allowance', nameAr: 'بدل المواصلات', category: 'transport', annualBudget: 8400000, utilizationRate: 88, gradeEligibility: { A1: { eligible: true, limit: 36000 }, A2: { eligible: true, limit: 30000 }, B1: { eligible: true, limit: 24000 }, B2: { eligible: true, limit: 18000 }, C1: { eligible: true, limit: 14000 }, C2: { eligible: true, limit: 10000 } } },
    { id: 'prv-ben-005', name: 'Learning & Certifications', nameAr: 'التعلم والشهادات', category: 'learning', annualBudget: 6800000, utilizationRate: 42, gradeEligibility: { A1: { eligible: true, limit: 30000 }, A2: { eligible: true, limit: 22000 }, B1: { eligible: true, limit: 15000 }, B2: { eligible: true, limit: 10000 }, C1: { eligible: true, limit: 8000 }, C2: { eligible: true, limit: 5000 } } },
    { id: 'prv-ben-006', name: 'Wellness Program', nameAr: 'برنامج العافية', category: 'wellbeing', annualBudget: 4100000, utilizationRate: 38, gradeEligibility: { A1: { eligible: true, limit: 12000 }, A2: { eligible: true, limit: 10000 }, B1: { eligible: true, limit: 8000 }, B2: { eligible: true, limit: 6000 }, C1: { eligible: true, limit: 5000 }, C2: { eligible: true, limit: 4000 } } },
    { id: 'prv-ben-007', name: 'Staff Loans', nameAr: 'قروض الموظفين', category: 'financial', annualBudget: 15000000, utilizationRate: 65, gradeEligibility: { A1: { eligible: true, limit: 500000 }, A2: { eligible: true, limit: 400000 }, B1: { eligible: true, limit: 300000 }, B2: { eligible: true, limit: 200000 }, C1: { eligible: true, limit: 150000 }, C2: { eligible: true, limit: 100000 } } },
  ],
  keyMetrics: {
    totalInvestment: 123000000,
    utilizationRate: 68,
    claimsSla: 91,
    esatScore: 78,
    zombieSpend: 12800000,
    inquiryDeflection: 64,
    avgProcessingDays: 2.4,
  },
};

// ============================================
// ORGANIZATION 3: SME
// ============================================

export const DEMO_ORG_SME: DemoOrg = {
  id: 'demo-sme-001',
  name: 'Careem Technologies',
  nameAr: 'كريم للتقنية',
  type: 'sme',
  industry: 'Technology / Mobility',
  industryAr: 'التقنية / التنقل',
  region: 'UAE',
  city: 'Dubai',
  employeeCount: 312,
  currency: 'AED',
  fiscalYearStart: '2026-01-01',
  branding: {
    primaryColor: '#00C853',
    logoInitials: 'CM',
  },
  governance: {
    enforcementMode: 'advisory',
    requiresPolicyApproval: false,
    approverRole: 'Line Manager',
    approvalSlaDays: 2,
  },
  benefits: [
    { id: 'sme-ben-001', name: 'Housing Support', nameAr: 'دعم السكن', category: 'housing', annualBudget: 3600000, utilizationRate: 100, gradeEligibility: { A1: { eligible: true, limit: 120000 }, A2: { eligible: true, limit: 96000 }, B1: { eligible: true, limit: 72000 }, B2: { eligible: true, limit: 54000 }, C1: { eligible: true, limit: 42000 }, C2: { eligible: true, limit: 36000 } } },
    { id: 'sme-ben-002', name: 'Health Insurance', nameAr: 'التأمين الصحي', category: 'health', annualBudget: 2100000, utilizationRate: 74, gradeEligibility: { A1: { eligible: true, limit: 45000 }, A2: { eligible: true, limit: 38000 }, B1: { eligible: true, limit: 32000 }, B2: { eligible: true, limit: 26000 }, C1: { eligible: true, limit: 22000 }, C2: { eligible: true, limit: 18000 } } },
    { id: 'sme-ben-003', name: 'Flexible Learning', nameAr: 'التعلم المرن', category: 'learning', annualBudget: 1400000, utilizationRate: 58, gradeEligibility: { A1: { eligible: true, limit: 25000 }, A2: { eligible: true, limit: 18000 }, B1: { eligible: true, limit: 12000 }, B2: { eligible: true, limit: 8000 }, C1: { eligible: true, limit: 6000 }, C2: { eligible: true, limit: 4000 } } },
    { id: 'sme-ben-004', name: 'Wellness & Perks', nameAr: 'العافية والامتيازات', category: 'wellbeing', annualBudget: 890000, utilizationRate: 52, gradeEligibility: { A1: { eligible: true, limit: 8000 }, A2: { eligible: true, limit: 6000 }, B1: { eligible: true, limit: 5000 }, B2: { eligible: true, limit: 4000 }, C1: { eligible: true, limit: 3000 }, C2: { eligible: true, limit: 2500 } } },
    { id: 'sme-ben-005', name: 'ESOP', nameAr: 'خيارات الأسهم', category: 'financial', annualBudget: 2800000, utilizationRate: 92, gradeEligibility: { A1: { eligible: true, limit: 100000 }, A2: { eligible: true, limit: 60000 }, B1: { eligible: true, limit: 30000 }, B2: { eligible: true, limit: 15000 }, C1: { eligible: false, limit: 0 }, C2: { eligible: false, limit: 0 } } },
  ],
  keyMetrics: {
    totalInvestment: 10790000,
    utilizationRate: 72,
    claimsSla: 94,
    esatScore: 82,
    zombieSpend: 1420000,
    inquiryDeflection: 58,
    avgProcessingDays: 1.5,
  },
};

// ============================================
// DEMO EMPLOYEES WITH LIFE-STAGE VARIATION
// ============================================

export const DEMO_EMPLOYEES: Record<OrgType, DemoEmployee[]> = {
  government: [
    { id: 'gov-emp-001', firstName: 'Khalid', lastName: 'Al-Nahyan', email: 'k.alnahyan@adia.ae', grade: 'A1', department: 'Investment Strategy', position: 'Managing Director', lifeStage: 'senior', dependents: 4, yearsOfService: 18, monthlySalary: 85000, benefits: [{ name: 'Housing Allowance', annualValue: 180000, utilized: 180000, category: 'housing' }, { name: 'Schooling', annualValue: 80000, utilized: 64000, category: 'education', nextAction: 'Submit Q2 fees' }, { name: 'Health Insurance', annualValue: 75000, utilized: 28000, category: 'health' }] },
    { id: 'gov-emp-002', firstName: 'Fatima', lastName: 'Al-Qasimi', email: 'f.alqasimi@adia.ae', grade: 'B1', department: 'Finance', position: 'Senior Analyst', lifeStage: 'with_kids', dependents: 2, yearsOfService: 6, monthlySalary: 42000, benefits: [{ name: 'Housing Allowance', annualValue: 120000, utilized: 120000, category: 'housing' }, { name: 'Schooling', annualValue: 60000, utilized: 45000, category: 'education' }, { name: 'Health Insurance', annualValue: 55000, utilized: 22000, category: 'health', nextAction: 'Annual checkup due' }] },
    { id: 'gov-emp-003', firstName: 'Omar', lastName: 'Hassan', email: 'o.hassan@adia.ae', grade: 'C1', department: 'IT', position: 'Software Engineer', lifeStage: 'married', dependents: 1, yearsOfService: 3, monthlySalary: 28000, benefits: [{ name: 'Housing Allowance', annualValue: 72000, utilized: 72000, category: 'housing' }, { name: 'Health Insurance', annualValue: 38000, utilized: 8500, category: 'health' }, { name: 'Learning', annualValue: 10000, utilized: 0, category: 'learning', nextAction: 'Claim AWS certification' }] },
    { id: 'gov-emp-004', firstName: 'Sara', lastName: 'Al-Mulla', email: 's.almulla@adia.ae', grade: 'C2', department: 'Operations', position: 'Coordinator', lifeStage: 'single', dependents: 0, yearsOfService: 1, monthlySalary: 18000, benefits: [{ name: 'Housing Allowance', annualValue: 60000, utilized: 60000, category: 'housing' }, { name: 'Health Insurance', annualValue: 32000, utilized: 4200, category: 'health' }, { name: 'Wellness', annualValue: 5000, utilized: 0, category: 'wellbeing', nextAction: 'Join gym program' }] },
  ],
  large_private: [
    { id: 'prv-emp-001', firstName: 'Ahmed', lastName: 'Al-Rashid', email: 'a.alrashid@emiratesnbd.com', grade: 'A2', department: 'Retail Banking', position: 'Executive VP', lifeStage: 'with_kids', dependents: 3, yearsOfService: 12, monthlySalary: 65000, benefits: [{ name: 'Housing Allowance', annualValue: 120000, utilized: 120000, category: 'housing' }, { name: 'Education', annualValue: 55000, utilized: 48000, category: 'education' }, { name: 'Health', annualValue: 48000, utilized: 18000, category: 'health', nextAction: 'Submit dental claim' }] },
    { id: 'prv-emp-002', firstName: 'Layla', lastName: 'Ibrahim', email: 'l.ibrahim@emiratesnbd.com', grade: 'B2', department: 'Digital Banking', position: 'Product Manager', lifeStage: 'married', dependents: 1, yearsOfService: 4, monthlySalary: 32000, benefits: [{ name: 'Housing Allowance', annualValue: 72000, utilized: 72000, category: 'housing' }, { name: 'Health', annualValue: 35000, utilized: 12000, category: 'health' }, { name: 'Learning', annualValue: 10000, utilized: 4500, category: 'learning' }] },
    { id: 'prv-emp-003', firstName: 'Mohammed', lastName: 'Yusuf', email: 'm.yusuf@emiratesnbd.com', grade: 'C1', department: 'Customer Service', position: 'Team Lead', lifeStage: 'with_kids', dependents: 2, yearsOfService: 7, monthlySalary: 22000, benefits: [{ name: 'Housing Allowance', annualValue: 54000, utilized: 54000, category: 'housing' }, { name: 'Education', annualValue: 25000, utilized: 22000, category: 'education' }, { name: 'Health', annualValue: 28000, utilized: 9000, category: 'health' }] },
    { id: 'prv-emp-004', firstName: 'Noor', lastName: 'Ahmed', email: 'n.ahmed@emiratesnbd.com', grade: 'C2', department: 'Branch Operations', position: 'Teller', lifeStage: 'single', dependents: 0, yearsOfService: 2, monthlySalary: 12000, benefits: [{ name: 'Housing Allowance', annualValue: 42000, utilized: 42000, category: 'housing' }, { name: 'Health', annualValue: 22000, utilized: 3500, category: 'health' }, { name: 'Wellness', annualValue: 4000, utilized: 1200, category: 'wellbeing', nextAction: 'Renew gym membership' }] },
  ],
  sme: [
    { id: 'sme-emp-001', firstName: 'Tariq', lastName: 'Khan', email: 't.khan@careem.com', grade: 'A2', department: 'Engineering', position: 'VP Engineering', lifeStage: 'with_kids', dependents: 2, yearsOfService: 5, monthlySalary: 55000, benefits: [{ name: 'Housing Support', annualValue: 96000, utilized: 96000, category: 'housing' }, { name: 'Health', annualValue: 38000, utilized: 14000, category: 'health' }, { name: 'ESOP', annualValue: 60000, utilized: 60000, category: 'financial' }] },
    { id: 'sme-emp-002', firstName: 'Alia', lastName: 'Mahmoud', email: 'a.mahmoud@careem.com', grade: 'B1', department: 'Product', position: 'Senior PM', lifeStage: 'married', dependents: 0, yearsOfService: 3, monthlySalary: 38000, benefits: [{ name: 'Housing Support', annualValue: 72000, utilized: 72000, category: 'housing' }, { name: 'Health', annualValue: 32000, utilized: 8000, category: 'health' }, { name: 'Learning', annualValue: 12000, utilized: 8500, category: 'learning' }] },
    { id: 'sme-emp-003', firstName: 'Yusuf', lastName: 'Ali', email: 'y.ali@careem.com', grade: 'B2', department: 'Operations', position: 'Ops Manager', lifeStage: 'single', dependents: 0, yearsOfService: 2, monthlySalary: 28000, benefits: [{ name: 'Housing Support', annualValue: 54000, utilized: 54000, category: 'housing' }, { name: 'Health', annualValue: 26000, utilized: 5200, category: 'health' }, { name: 'Wellness', annualValue: 4000, utilized: 2800, category: 'wellbeing' }] },
    { id: 'sme-emp-004', firstName: 'Huda', lastName: 'Salem', email: 'h.salem@careem.com', grade: 'C1', department: 'Support', position: 'Support Lead', lifeStage: 'single', dependents: 0, yearsOfService: 1, monthlySalary: 18000, benefits: [{ name: 'Housing Support', annualValue: 42000, utilized: 42000, category: 'housing' }, { name: 'Health', annualValue: 22000, utilized: 4000, category: 'health' }, { name: 'Learning', annualValue: 6000, utilized: 0, category: 'learning', nextAction: 'Enroll in leadership course' }] },
  ],
};

// ============================================
// ALL DEMO ORGS COLLECTION
// ============================================

export const DEMO_ORGS = [DEMO_ORG_GOV, DEMO_ORG_PRIVATE, DEMO_ORG_SME];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getDemoOrg(type: OrgType): DemoOrg {
  switch (type) {
    case 'government': return DEMO_ORG_GOV;
    case 'large_private': return DEMO_ORG_PRIVATE;
    case 'sme': return DEMO_ORG_SME;
  }
}

export function getDemoEmployees(type: OrgType): DemoEmployee[] {
  return DEMO_EMPLOYEES[type];
}

export function getLifeStageLabel(stage: LifeStage, isAr = false): string {
  const labels: Record<LifeStage, { en: string; ar: string }> = {
    single: { en: 'Single', ar: 'أعزب' },
    married: { en: 'Married', ar: 'متزوج' },
    with_kids: { en: 'With Children', ar: 'لديه أطفال' },
    senior: { en: 'Senior Executive', ar: 'تنفيذي أول' },
  };
  return isAr ? labels[stage].ar : labels[stage].en;
}

export function getOrgTypeLabel(type: OrgType, isAr = false): string {
  const labels: Record<OrgType, { en: string; ar: string }> = {
    government: { en: 'Government Entity', ar: 'جهة حكومية' },
    large_private: { en: 'Large Enterprise', ar: 'مؤسسة كبيرة' },
    sme: { en: 'SME / Startup', ar: 'شركة صغيرة ومتوسطة' },
  };
  return isAr ? labels[type].ar : labels[type].en;
}

export function calculateTotalCompensation(employee: DemoEmployee): number {
  const annualSalary = employee.monthlySalary * 12;
  const totalBenefits = employee.benefits.reduce((sum, b) => sum + b.annualValue, 0);
  return annualSalary + totalBenefits;
}

export function calculateUtilization(employee: DemoEmployee): { used: number; total: number; percent: number } {
  const total = employee.benefits.reduce((sum, b) => sum + b.annualValue, 0);
  const used = employee.benefits.reduce((sum, b) => sum + b.utilized, 0);
  const percent = total > 0 ? Math.round((used / total) * 100) : 0;
  return { used, total, percent };
}

export function getNextBestActions(employee: DemoEmployee): { benefit: string; action: string }[] {
  return employee.benefits
    .filter(b => b.nextAction)
    .map(b => ({ benefit: b.name, action: b.nextAction! }));
}
