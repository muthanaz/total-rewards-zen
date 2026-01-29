/**
 * Executive Metrics Constants
 * 
 * Single source of truth for consistent demo numbers across:
 * - Executive Dashboard
 * - Investment Analysis (Spend)
 * - ROI & Savings (Budget Leakage)
 * 
 * CEO/CFO-grade consistency: All pages show identical figures for overlapping metrics.
 * 
 * NOW SOURCED FROM: src/lib/demoData/index.ts (30 employees, 20 claims, reconciled)
 */

import { EXECUTIVE_METRICS, CATEGORY_METRICS as DEMO_CATEGORY_METRICS, SEGMENT_METRICS } from './demoData/index';

// ============================================================================
// ORGANIZATION BASELINE (Nexa Holdings Demo Scenario)
// ============================================================================

export const ORG_BASELINE = {
  employeeCount: EXECUTIVE_METRICS.employeeCount,
  fiscalYear: EXECUTIVE_METRICS.fiscalYear,
  currency: 'AED',
} as const;

// ============================================================================
// INVESTMENT & BUDGET METRICS (Derived from coherent demo data)
// ============================================================================

export const INVESTMENT_METRICS = {
  /** Total annual benefits budget allocated */
  allocatedBudget: EXECUTIVE_METRICS.totalBudget,
  
  /** Total entitled value (what employees can claim) */
  entitledValue: EXECUTIVE_METRICS.totalBudget,
  
  /** Total actual spend (claims approved/paid) */
  actualSpend: EXECUTIVE_METRICS.ytdSpend,
  
  /** Target utilization rate (%) */
  targetUtilization: EXECUTIVE_METRICS.targetUtilization,
  
  /** Year-over-year spend change (%) */
  yoyChange: 8.2,
  
  /** Get budget vs spend variance */
  get budgetVariance() {
    return this.actualSpend - this.allocatedBudget;
  },
  
  /** Get budget variance percent */
  get budgetVariancePercent() {
    return ((this.actualSpend - this.allocatedBudget) / this.allocatedBudget) * 100;
  },
  
  /** Get cost per employee */
  get costPerEmployee() {
    return Math.round(this.actualSpend / ORG_BASELINE.employeeCount);
  },
} as const;

// ============================================================================
// UTILIZATION METRICS (Derived from coherent demo data)
// ============================================================================

export const UTILIZATION_METRICS = {
  /** Overall utilization rate (%) - MUST match across all pages */
  utilizationRate: EXECUTIVE_METRICS.utilizationRate,
  
  /** Unrealized value (entitled - claimed) - KEY metric for Recovery page */
  get unrealizedValue() {
    return EXECUTIVE_METRICS.unutilized;
  },
  
  /** Unrealized as % of budget */
  get unrealizedRate() {
    return (this.unrealizedValue / INVESTMENT_METRICS.allocatedBudget) * 100;
  },
  
  /** Estimated recoverable (confidence-weighted) */
  get estimatedRecoverable() {
    return EXECUTIVE_METRICS.recoveryPotential;
  },
} as const;

// ============================================================================
// OPERATIONAL FRICTION METRICS
// ============================================================================

export const FRICTION_METRICS = {
  /** Missing docs rate (%) */
  missingDocsRate: 18,
  
  /** Median approval time (days) */
  medianApprovalDays: 3.2,
  
  /** Overall rejection rate (%) */
  rejectionRate: 11.8,
  
  /** Claims requiring additional info (%) */
  returnedForInfoRate: 8.5,
} as const;

// ============================================================================
// CATEGORY BREAKDOWN (derived from coherent demo data)
// ============================================================================

// Build from DEMO_CATEGORY_METRICS
const buildCategoryMetric = (id: string, rootCause: 'awareness' | 'friction') => {
  const cat = DEMO_CATEGORY_METRICS.find(c => c.id === id);
  return {
    name: cat?.name || id,
    budget: cat?.entitled || 0,
    entitled: cat?.entitled || 0,
    claimed: cat?.paid || 0,
    get unused() { return this.entitled - this.claimed; },
    get utilization() { return this.entitled > 0 ? (this.claimed / this.entitled) * 100 : 0; },
    rootCause,
  };
};

export const CATEGORY_METRICS_EXEC = {
  housing: buildCategoryMetric('housing', 'awareness'),
  schooling: buildCategoryMetric('schooling', 'friction'),
  health: buildCategoryMetric('health', 'awareness'),
  transport: buildCategoryMetric('transport', 'awareness'),
  learning: buildCategoryMetric('learning', 'awareness'),
  wellbeing: buildCategoryMetric('wellbeing', 'friction'),
} as const;

// ============================================================================
// RECOVERY CAUSE BREAKDOWN (for Zombie/Recovery page)
// ============================================================================

export const CAUSE_BREAKDOWN = {
  awareness: {
    label: 'Awareness Gap',
    value: 295_000, // ~36% of unrealized
    percent: 36,
  },
  eligibility: {
    label: 'Eligibility',
    value: 164_000, // ~20%
    percent: 20,
  },
  friction: {
    label: 'Process Friction',
    value: 213_000, // ~26%
    percent: 26,
  },
  policy: {
    label: 'Policy Design',
    value: 148_000, // ~18%
    percent: 18,
  },
} as const;

// ============================================================================
// TOP CAUSE HELPER
// ============================================================================

export function getTopCause(): 'awareness' | 'eligibility' | 'friction' | 'policy' {
  const sorted = Object.entries(CAUSE_BREAKDOWN)
    .sort(([, a], [, b]) => b.value - a.value);
  return sorted[0][0] as 'awareness' | 'eligibility' | 'friction' | 'policy';
}

// ============================================================================
// QUICK WINS (pre-computed for Recovery page)
// ============================================================================

export const QUICK_WINS = [
  {
    id: 'qw-learning',
    title: 'Recover Learning benefits',
    category: 'Learning',
    estimatedRecovery: 52_000, // ~40% of Learning unused
    effort: 'low' as const,
    timeToImpact: '2-4 weeks',
    cause: 'awareness' as const,
  },
  {
    id: 'qw-wellbeing',
    title: 'Recover Wellbeing benefits',
    category: 'Wellbeing',
    estimatedRecovery: 24_000,
    effort: 'medium' as const,
    timeToImpact: '4-6 weeks',
    cause: 'friction' as const,
  },
  {
    id: 'qw-transport',
    title: 'Recover Transport benefits',
    category: 'Transport',
    estimatedRecovery: 32_000,
    effort: 'low' as const,
    timeToImpact: '2-4 weeks',
    cause: 'awareness' as const,
  },
] as const;
