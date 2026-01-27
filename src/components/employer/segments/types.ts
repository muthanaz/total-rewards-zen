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

export const SALARY_MIN = 5000;
export const SALARY_MAX = 100000;
