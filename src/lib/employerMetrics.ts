// ========================================
// Centralized Employer Metrics Constants
// Single source of truth for all employer financial data
// ========================================

// Base organizational data
export const EMPLOYEE_COUNT = 156;
export const ANNUAL_BUDGET = 62_000_000; // AED 62M total budget for FY 2024

// Time-based calculations
export const MONTHS_ELAPSED = 8;
export const MONTHS_REMAINING = 4;

// Spending data - All mathematically consistent
export const YTD_SPEND = 39_680_000; // AED 39.68M spent so far (64% of budget)
export const MONTHLY_SPEND_RATE = YTD_SPEND / MONTHS_ELAPSED; // ~4.96M per month
export const PROJECTED_YEAR_END_SPEND = YTD_SPEND + (MONTHLY_SPEND_RATE * MONTHS_REMAINING); // ~59.5M

// Derived utilization metrics
export const UTILIZATION_RATE = Math.round((YTD_SPEND / ANNUAL_BUDGET) * 100); // 64%
export const BUDGET_REMAINING = ANNUAL_BUDGET - YTD_SPEND; // ~22.3M

// Waste analysis (underutilized benefits that employees aren't using)
export const WASTE_IDENTIFIED = 5_200_000; // AED 5.2M (13% of YTD spend)
export const WASTE_RECOVERABLE = Math.round(WASTE_IDENTIFIED * 0.6); // 60% recoverable = AED 3.12M
export const EFFECTIVE_SPEND = YTD_SPEND - WASTE_IDENTIFIED; // AED 34.48M actually delivering value

// Satisfaction and program health
export const SATISFACTION_SCORE = 4.2; // Out of 5
export const RETENTION_RATE = 92; // %

// Program health score (weighted: 40% utilization + 30% satisfaction + 20% cost efficiency + 10% compliance)
export const PROGRAM_SCORE = 72;

// Pending claims/actions
export const PENDING_CLAIMS = 12;
export const AVG_PROCESSING_DAYS = 2.3;
export const SLA_TARGET = 3;

// Department breakdown (must sum to EMPLOYEE_COUNT = 156)
export const DEPARTMENTS = [
  { name: 'Engineering', headcount: 52, utilization: 82, totalSpend: 13_260_000 },
  { name: 'Sales', headcount: 35, utilization: 78, totalSpend: 8_925_000 },
  { name: 'Operations', headcount: 28, utilization: 72, totalSpend: 7_140_000 },
  { name: 'Marketing', headcount: 22, utilization: 75, totalSpend: 5_610_000 },
  { name: 'HR & Admin', headcount: 19, utilization: 76, totalSpend: 4_745_000 },
] as const;

// Benefit type spend breakdown (must sum to YTD_SPEND = 39.68M)
export const SPEND_BY_BENEFIT_TYPE = [
  { name: 'Housing', spend: 15_400_000, budget: 17_850_000, utilization: 86.3 },
  { name: 'Schooling', spend: 7_700_000, budget: 9_560_000, utilization: 80.5 },
  { name: 'Health', spend: 5_100_000, budget: 5_750_000, utilization: 88.7 },
  { name: 'Transport', spend: 4_850_000, budget: 6_060_000, utilization: 80.0 },
  { name: 'Learning', spend: 2_480_000, budget: 6_300_000, utilization: 39.4 },
  { name: 'Wellbeing', spend: 4_150_000, budget: 9_200_000, utilization: 45.1 },
] as const;

// Monthly spend trend data
export const MONTHLY_SPEND_TREND = [
  { month: 'Jan', spend: 4_650_000, budget: 5_166_667 },
  { month: 'Feb', spend: 4_750_000, budget: 5_166_667 },
  { month: 'Mar', spend: 4_960_000, budget: 5_166_667 },
  { month: 'Apr', spend: 5_010_000, budget: 5_166_667 },
  { month: 'May', spend: 4_880_000, budget: 5_166_667 },
  { month: 'Jun', spend: 5_020_000, budget: 5_166_667 },
  { month: 'Jul', spend: 5_130_000, budget: 5_166_667 },
  { month: 'Aug', spend: 5_280_000, budget: 5_166_667 },
] as const;

// Benefit category waste breakdown (must sum to WASTE_IDENTIFIED = 5.2M)
export const WASTE_BY_CATEGORY = [
  { 
    benefit: 'Learning & Development', 
    allocated: 6_300_000, 
    utilized: 2_480_000, 
    zombie: 1_950_000,
    utilizationRate: 39,
    affectedEmployees: 72,
    reason: 'Low awareness of available courses and complex enrollment process',
    recommendation: 'Launch internal L&D campaign with featured courses and simplified enrollment'
  },
  { 
    benefit: 'Wellbeing Program', 
    allocated: 9_200_000, 
    utilized: 4_150_000, 
    zombie: 1_170_000,
    utilizationRate: 45,
    affectedEmployees: 85,
    reason: 'Complex redemption process and limited partner locations',
    recommendation: 'Simplify app-based wellness rewards and expand gym network'
  },
  { 
    benefit: 'Annual Flight Tickets', 
    allocated: 4_200_000, 
    utilized: 2_940_000, 
    zombie: 910_000,
    utilizationRate: 70,
    affectedEmployees: 28,
    reason: 'Unused by single employees without dependents',
    recommendation: 'Allow conversion to travel vouchers or additional leave days'
  },
  { 
    benefit: 'Gym Membership', 
    allocated: 2_600_000, 
    utilized: 1_560_000, 
    zombie: 650_000,
    utilizationRate: 60,
    affectedEmployees: 48,
    reason: 'Limited partner gym locations near employee residences',
    recommendation: 'Expand gym network or offer home fitness alternatives'
  },
  { 
    benefit: 'Financial Planning', 
    allocated: 3_900_000, 
    utilized: 2_028_000, 
    zombie: 520_000,
    utilizationRate: 52,
    affectedEmployees: 65,
    reason: 'Employees unaware of available financial advisory services',
    recommendation: 'Quarterly financial wellness webinars and 1-on-1 advisor sessions'
  },
] as const;

// Risk indicators for waste analysis
export const WASTE_RISK_INDICATORS = [
  { label: 'High Risk', value: 2, description: '<50% utilization', color: 'text-red-500', bgColor: 'bg-red-500/10' },
  { label: 'Medium Risk', value: 3, description: '50-70% utilization', color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
  { label: 'Healthy', value: 7, description: '>70% utilization', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
] as const;

// Spend distribution percentages
export const SPEND_DISTRIBUTION = [
  { name: 'Cash Allowances', value: 45, color: 'hsl(160 84% 39%)' },
  { name: 'Health & Protection', value: 20, color: 'hsl(217 91% 60%)' },
  { name: 'Time Off', value: 15, color: 'hsl(271 81% 56%)' },
  { name: 'Growth & Career', value: 10, color: 'hsl(38 92% 50%)' },
  { name: 'Wellbeing', value: 10, color: 'hsl(330 81% 60%)' },
] as const;

// Helper functions
export function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `AED ${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `AED ${(value / 1_000).toFixed(0)}K`;
  }
  return `AED ${value.toLocaleString()}`;
}

export function formatCurrencyFull(value: number): string {
  return `AED ${value.toLocaleString()}`;
}
