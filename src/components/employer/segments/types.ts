/**
 * Segment Builder Types
 * 
 * Types for the People Intelligence Engine segment builder.
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
  utilizationRate: number;
  totalSpend: number;
  satisfaction: 'happy' | 'neutral' | 'frustrated';
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
  riskScore: 'high' | 'medium' | 'low';
}

export interface SegmentMetrics {
  matches: number;
  totalSpend: number;
  utilizationRate: number;
  riskScore: 'high' | 'medium' | 'low';
  happyCount: number;
  frustratedCount: number;
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
