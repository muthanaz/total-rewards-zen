/**
 * Proration Engine
 * 
 * Calculates prorated limits for mid-year joiners based on:
 * - Employment date
 * - Policy reset month
 * - Proration method (monthly)
 */

// =============================================================================
// TYPES
// =============================================================================

export interface ProrationConfig {
  /** Enable proration for new joiners */
  prorate_by_tenure: boolean;
  /** Proration calculation method */
  proration_method: 'monthly' | 'daily' | 'quarterly';
  /** Minimum months before benefit becomes available (optional) */
  min_tenure_for_benefit?: number;
}

export interface ProrationResult {
  /** Original annual cap */
  original_cap: number;
  /** Prorated cap */
  prorated_cap: number;
  /** Proration factor (0.0 - 1.0) */
  proration_factor: number;
  /** Human-readable explanation */
  reason: string;
  /** Months remaining in the period */
  months_remaining: number;
  /** Whether proration was applied */
  was_prorated: boolean;
}

export interface ProrationContext {
  /** Employee's employment start date */
  employment_date: Date;
  /** Policy's fiscal year reset month (1-12) */
  reset_month: number;
  /** Reference date for calculation (default: now) */
  as_of_date?: Date;
}

// =============================================================================
// CALCULATION FUNCTIONS
// =============================================================================

/**
 * Get the start of the current benefit period based on reset month
 */
export function getBenefitPeriodStart(
  resetMonth: number,
  asOfDate: Date = new Date()
): Date {
  const currentYear = asOfDate.getFullYear();
  const currentMonth = asOfDate.getMonth() + 1; // 1-indexed
  
  // If we're before the reset month, period started last year
  if (currentMonth < resetMonth) {
    return new Date(currentYear - 1, resetMonth - 1, 1);
  }
  
  // Otherwise, period started this year
  return new Date(currentYear, resetMonth - 1, 1);
}

/**
 * Get the end of the current benefit period
 */
export function getBenefitPeriodEnd(
  resetMonth: number,
  asOfDate: Date = new Date()
): Date {
  const periodStart = getBenefitPeriodStart(resetMonth, asOfDate);
  return new Date(
    periodStart.getFullYear() + 1,
    periodStart.getMonth(),
    0 // Last day of previous month = day before next period
  );
}

/**
 * Calculate months remaining in the benefit period
 */
export function getMonthsRemainingInPeriod(
  resetMonth: number,
  asOfDate: Date = new Date()
): number {
  const periodEnd = getBenefitPeriodEnd(resetMonth, asOfDate);
  const endMonth = periodEnd.getMonth() + 1;
  const endYear = periodEnd.getFullYear();
  
  const currentMonth = asOfDate.getMonth() + 1;
  const currentYear = asOfDate.getFullYear();
  
  // Calculate months difference
  const monthsDiff = (endYear - currentYear) * 12 + (endMonth - currentMonth) + 1;
  
  return Math.max(0, Math.min(12, monthsDiff));
}

/**
 * Calculate proration factor for monthly method
 */
function calculateMonthlyProration(
  employmentDate: Date,
  resetMonth: number,
  asOfDate: Date
): { factor: number; monthsRemaining: number; reason: string } {
  const periodStart = getBenefitPeriodStart(resetMonth, asOfDate);
  
  // Determine the effective start date for this employee in this period
  const effectiveStart = employmentDate > periodStart ? employmentDate : periodStart;
  
  // Calculate months from effective start to period end
  const monthsRemaining = getMonthsRemainingInPeriod(resetMonth, effectiveStart);
  
  // Proration factor = months remaining / 12
  const factor = monthsRemaining / 12;
  
  // Build reason
  const periodStartStr = periodStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const employmentStr = employmentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  
  let reason: string;
  if (employmentDate > periodStart) {
    reason = `Joined ${employmentStr}, ${monthsRemaining} of 12 months remaining in period starting ${periodStartStr}`;
  } else {
    reason = `Employed before period start ${periodStartStr}, full entitlement`;
  }
  
  return { factor, monthsRemaining, reason };
}

/**
 * Calculate proration factor for quarterly method
 */
function calculateQuarterlyProration(
  employmentDate: Date,
  resetMonth: number,
  asOfDate: Date
): { factor: number; monthsRemaining: number; reason: string } {
  const { factor: monthlyFactor, monthsRemaining } = calculateMonthlyProration(
    employmentDate,
    resetMonth,
    asOfDate
  );
  
  // Round to nearest quarter (0.25, 0.5, 0.75, 1.0)
  const quarterlyFactor = Math.ceil(monthlyFactor * 4) / 4;
  const quartersRemaining = Math.ceil(monthsRemaining / 3);
  
  return {
    factor: Math.min(1, quarterlyFactor),
    monthsRemaining,
    reason: `${quartersRemaining} quarter(s) remaining, prorated to ${Math.round(quarterlyFactor * 100)}%`,
  };
}

/**
 * Main proration calculation function
 */
export function calculateProration(
  annualCap: number,
  config: ProrationConfig,
  context: ProrationContext
): ProrationResult {
  const asOfDate = context.as_of_date || new Date();
  
  // If proration is disabled, return full amount
  if (!config.prorate_by_tenure) {
    return {
      original_cap: annualCap,
      prorated_cap: annualCap,
      proration_factor: 1.0,
      reason: 'Proration disabled - full annual cap applies',
      months_remaining: 12,
      was_prorated: false,
    };
  }
  
  // Check minimum tenure requirement
  const tenureMonths = Math.floor(
    (asOfDate.getTime() - context.employment_date.getTime()) / (1000 * 60 * 60 * 24 * 30)
  );
  
  if (config.min_tenure_for_benefit && tenureMonths < config.min_tenure_for_benefit) {
    return {
      original_cap: annualCap,
      prorated_cap: 0,
      proration_factor: 0,
      reason: `Minimum tenure of ${config.min_tenure_for_benefit} months not met (current: ${tenureMonths})`,
      months_remaining: 0,
      was_prorated: true,
    };
  }
  
  // Calculate based on method
  let calculation: { factor: number; monthsRemaining: number; reason: string };
  
  switch (config.proration_method) {
    case 'quarterly':
      calculation = calculateQuarterlyProration(
        context.employment_date,
        context.reset_month,
        asOfDate
      );
      break;
    case 'daily':
      // Daily uses same logic as monthly but could be more precise
      calculation = calculateMonthlyProration(
        context.employment_date,
        context.reset_month,
        asOfDate
      );
      break;
    case 'monthly':
    default:
      calculation = calculateMonthlyProration(
        context.employment_date,
        context.reset_month,
        asOfDate
      );
  }
  
  const proratedCap = Math.round(annualCap * calculation.factor);
  
  return {
    original_cap: annualCap,
    prorated_cap: proratedCap,
    proration_factor: calculation.factor,
    reason: calculation.reason,
    months_remaining: calculation.monthsRemaining,
    was_prorated: calculation.factor < 1,
  };
}

/**
 * Format proration for display
 */
export function formatProrationDisplay(result: ProrationResult, currency: string = 'AED'): string {
  if (!result.was_prorated) {
    return `${result.original_cap.toLocaleString()} ${currency} (full year)`;
  }
  
  const percentage = Math.round(result.proration_factor * 100);
  return `${result.prorated_cap.toLocaleString()} ${currency} (${percentage}% of ${result.original_cap.toLocaleString()})`;
}

// =============================================================================
// DEFAULT CONFIG
// =============================================================================

export const DEFAULT_PRORATION_CONFIG: ProrationConfig = {
  prorate_by_tenure: false,
  proration_method: 'monthly',
  min_tenure_for_benefit: 0,
};
