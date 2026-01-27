/**
 * Segment Builder Types
 * 
 * Types for the People Intelligence Engine segment builder.
 * Uses OBJECTIVE BEHAVIORAL DATA - no subjective surveys.
 */

export interface SegmentFilters {
  departments: string[];
  nationalities: string[];
  grades: string[];
  salaryRange: [number, number];
  tenure: string | null;
  // Behavior filters
  utilizationRange: [number, number] | null;
  riskLevel: 'at-risk' | 'watch' | 'healthy' | null;
  benefitType: string | null; // For drill-down filtering
}

export interface MockEmployee {
  id: string;
  name: string;
  department: string;
  nationality: string;
  grade: string;
  salary: number;
  tenure: string;
  // Objective Behavioral Metrics
  budgetAllocated: number;
  amountSpent: number;
  hasMadeClaim: boolean; // Adoption indicator
  claimCount: number;
  topBenefits: { name: string; percentage: number }[];
  topNeeds: string[];
}

export interface SavedSegment {
  id: string;
  name: string;
  filters: SegmentFilters;
  isAI: boolean;
  icon: string;
  matchCount: number;
  behavioralGap: BehavioralGapType;
  trend?: 'up' | 'down' | 'stable'; // Trend indicator
}

export type BehavioralGapType = 
  | 'high-engagement-low-cost' 
  | 'concentrated-spend' 
  | 'balanced' 
  | 'low-engagement';

export interface SegmentMetrics {
  matches: number;
  totalSpend: number;
  totalBudget: number;
  // Objective Behavioral Metrics
  budgetUsage: number; // (Total Spent / Total Budget) %
  participationRate: number; // % of eligible who made at least 1 claim
  participatingCount: number;
  // Behavioral Gap Analysis
  behavioralGap: BehavioralGapType;
  behavioralGapInsight: string;
  // Benefit breakdown
  benefitMix: { name: string; percentage: number; amount: number }[];
  topNeeds: { need: string; count: number }[];
}

export const DEPARTMENTS = ['Sales', 'IT', 'HR', 'Finance', 'Operations', 'Engineering', 'Marketing', 'Legal'];

export const NATIONALITIES = [
  'UAE National',
  'Expat - Arab',
  'Expat - Western',
  'Expat - Asian',
  'Expat - African',
  'Other',
];

export const GRADES = ['G1', 'G2', 'G3', 'G4', 'G5', 'C-Suite', 'Intern'];

export const TENURE_OPTIONS = [
  { value: '<1', label: '< 1 Year' },
  { value: '1-3', label: '1-3 Years' },
  { value: '3-5', label: '3-5 Years' },
  { value: '5+', label: '5+ Years' },
];

export const BENEFIT_TYPES = ['Housing', 'Schooling', 'Health', 'Transport', 'Flight', 'L&D', 'Wellbeing', 'Equity'];

export const UTILIZATION_RANGES = [
  { value: '0-25', label: '0-25%', range: [0, 25] as [number, number] },
  { value: '25-50', label: '25-50%', range: [25, 50] as [number, number] },
  { value: '50-75', label: '50-75%', range: [50, 75] as [number, number] },
  { value: '75-100', label: '75-100%', range: [75, 100] as [number, number] },
];

export const RISK_LEVELS = [
  { value: 'at-risk' as const, label: 'At Risk', className: 'bg-destructive/10 text-destructive border-destructive/30' },
  { value: 'watch' as const, label: 'Watch', className: 'bg-warning/10 text-warning border-warning/30' },
  { value: 'healthy' as const, label: 'Healthy', className: 'bg-success/10 text-success border-success/30' },
];

export const SALARY_MIN = 5000;
export const SALARY_MAX = 100000;
