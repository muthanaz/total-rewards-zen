/**
 * Executive Metrics Constants
 * 
 * Single source of truth for consistent demo numbers across:
 * - Executive Dashboard
 * - Investment Analysis (Spend)
 * - Recovery Opportunities (Zombie)
 * 
 * CEO/CFO-grade consistency: All pages show identical figures for overlapping metrics.
 */

// ============================================================================
// ORGANIZATION BASELINE (Nexa Holdings Demo Scenario)
// ============================================================================

export const ORG_BASELINE = {
  employeeCount: 312,
  fiscalYear: 2024,
  currency: 'AED',
} as const;

// ============================================================================
// INVESTMENT & BUDGET METRICS
// ============================================================================

export const INVESTMENT_METRICS = {
  /** Total annual benefits budget allocated */
  allocatedBudget: 6_150_000,
  
  /** Total entitled value (what employees can claim) */
  entitledValue: 5_850_000,
  
  /** Total actual spend (claims approved/paid) */
  actualSpend: 5_030_000,
  
  /** Target utilization rate (%) */
  targetUtilization: 75,
  
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
// UTILIZATION METRICS
// ============================================================================

export const UTILIZATION_METRICS = {
  /** Overall utilization rate (%) - MUST match across all pages */
  utilizationRate: 72,
  
  /** Unrealized value (entitled - claimed) - KEY metric for Recovery page */
  get unrealizedValue() {
    return INVESTMENT_METRICS.entitledValue - INVESTMENT_METRICS.actualSpend;
  },
  
  /** Unrealized as % of budget */
  get unrealizedRate() {
    return (this.unrealizedValue / INVESTMENT_METRICS.allocatedBudget) * 100;
  },
  
  /** Estimated recoverable (confidence-weighted) */
  get estimatedRecoverable() {
    // Assume ~65% is recoverable based on cause analysis
    return Math.round(this.unrealizedValue * 0.65);
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
// CATEGORY BREAKDOWN (for consistent drill-downs)
// ============================================================================

export const CATEGORY_METRICS = {
  housing: {
    name: 'Housing',
    budget: 2_800_000,
    entitled: 2_700_000,
    claimed: 2_400_000,
    get unused() { return this.entitled - this.claimed; },
    get utilization() { return (this.claimed / this.entitled) * 100; },
    rootCause: 'awareness' as const,
  },
  schooling: {
    name: 'Schooling',
    budget: 1_500_000,
    entitled: 1_400_000,
    claimed: 1_200_000,
    get unused() { return this.entitled - this.claimed; },
    get utilization() { return (this.claimed / this.entitled) * 100; },
    rootCause: 'friction' as const,
  },
  health: {
    name: 'Health',
    budget: 900_000,
    entitled: 850_000,
    claimed: 800_000,
    get unused() { return this.entitled - this.claimed; },
    get utilization() { return (this.claimed / this.entitled) * 100; },
    rootCause: 'awareness' as const,
  },
  transport: {
    name: 'Transport',
    budget: 500_000,
    entitled: 480_000,
    claimed: 400_000,
    get unused() { return this.entitled - this.claimed; },
    get utilization() { return (this.claimed / this.entitled) * 100; },
    rootCause: 'awareness' as const,
  },
  learning: {
    name: 'Learning',
    budget: 300_000,
    entitled: 280_000,
    claimed: 150_000,
    get unused() { return this.entitled - this.claimed; },
    get utilization() { return (this.claimed / this.entitled) * 100; },
    rootCause: 'awareness' as const,
  },
  wellbeing: {
    name: 'Wellbeing',
    budget: 150_000,
    entitled: 140_000,
    claimed: 80_000,
    get unused() { return this.entitled - this.claimed; },
    get utilization() { return (this.claimed / this.entitled) * 100; },
    rootCause: 'friction' as const,
  },
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
