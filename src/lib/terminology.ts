/**
 * Terminology Constants
 * 
 * Golden Standard terminology normalization.
 * Use these constants across the platform to ensure consistency.
 */

// ============================================
// TERMINOLOGY MAPPINGS
// ============================================

/**
 * Standard terminology - use these everywhere
 */
export const TERMINOLOGY = {
  // Financial terms
  BUDGET_LEAKAGE: 'Budget Leakage',
  RECOVERY_POTENTIAL: 'Recovery Potential',
  UNUTILIZED_BUDGET: 'Unutilized Budget',
  UNREALIZED_VALUE: 'Unrealized Value',
  
  // Operational terms
  OPERATIONS_HUB: 'Operations Hub',
  
  // Page names
  PAGE_OPTIMIZATION: 'Optimization',
  PAGE_SPEND_FORECAST: 'Spend & Forecast',
  PAGE_DRIVERS_SEGMENTS: 'Drivers & Segments',
  PAGE_EXECUTIVE_OVERVIEW: 'Executive Overview',
  
  // Dashboard sections
  SECTION_BOTTOM_LINE: 'Bottom Line',
  SECTION_DRIVERS: 'Drivers',
  SECTION_DECISIONS: 'Decisions',
  SECTION_RISKS: 'Risks',
  SECTION_BACKLOG: 'Backlog',
  SECTION_SLA_PERFORMANCE: 'SLA Performance',
  SECTION_THROUGHPUT: 'Throughput',
  SECTION_EXCEPTIONS: 'Exceptions',
  SECTION_PAYMENTS_PIPELINE: 'Payments Pipeline',
} as const;

/**
 * Deprecated terms -> Standard terms mapping
 * Use normalizeTerminology() to convert
 */
export const DEPRECATED_TERMS: Record<string, string> = {
  // Zombie Spend -> Budget Leakage
  'Zombie Spend': TERMINOLOGY.BUDGET_LEAKAGE,
  'zombie spend': TERMINOLOGY.BUDGET_LEAKAGE.toLowerCase(),
  'zombieSpend': 'budgetLeakage',
  'zombie_spend': 'budget_leakage',
  'ZombieSpend': 'BudgetLeakage',
  
  // Workbench -> Operations Hub
  'Workbench': TERMINOLOGY.OPERATIONS_HUB,
  'workbench': TERMINOLOGY.OPERATIONS_HUB.toLowerCase(),
  'Work Bench': TERMINOLOGY.OPERATIONS_HUB,
  
  // ROI & Savings -> Optimization
  'ROI & Savings': TERMINOLOGY.PAGE_OPTIMIZATION,
  'ROI and Savings': TERMINOLOGY.PAGE_OPTIMIZATION,
  
  // Investment Analysis -> Spend & Forecast
  'Investment Analysis': TERMINOLOGY.PAGE_SPEND_FORECAST,
  
  // Segments -> Drivers & Segments
  'Segments': TERMINOLOGY.PAGE_DRIVERS_SEGMENTS,
};

/**
 * Normalize a string by replacing deprecated terms with standard terms
 */
export function normalizeTerminology(text: string): string {
  let result = text;
  for (const [deprecated, standard] of Object.entries(DEPRECATED_TERMS)) {
    result = result.replace(new RegExp(deprecated, 'g'), standard);
  }
  return result;
}

/**
 * Check if a string contains deprecated terminology
 */
export function hasDeprecatedTerminology(text: string): boolean {
  return Object.keys(DEPRECATED_TERMS).some(term => text.includes(term));
}

// ============================================
// CURRENCY FORMATTING
// ============================================

/**
 * Standard currency format: "AED 1,250"
 * - Prefix: AED
 * - Comma separators
 * - No decimals unless required
 * - Use tabular-nums CSS class
 */
export const CURRENCY_CONFIG = {
  code: 'AED',
  locale: 'en-AE',
  decimals: 0,
  abbreviateThreshold: 10000,
} as const;

/**
 * Format currency according to Golden Standards
 * Output: "AED 1,250" or "AED 1.25M" for large numbers
 */
export function formatCurrency(
  amount: number | null | undefined, 
  options?: {
    abbreviate?: boolean;
    decimals?: number;
    showSign?: boolean;
  }
): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '—';
  }

  const { abbreviate = false, decimals = 0, showSign = false } = options || {};
  const sign = showSign && amount > 0 ? '+' : '';
  
  if (abbreviate && Math.abs(amount) >= 1000000) {
    const millions = amount / 1000000;
    return `${sign}AED ${millions.toFixed(1)}M`;
  }
  
  if (abbreviate && Math.abs(amount) >= 1000) {
    const thousands = amount / 1000;
    return `${sign}AED ${thousands.toFixed(thousands % 1 === 0 ? 0 : 1)}K`;
  }

  const formatted = new Intl.NumberFormat('en-AE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);

  return `${sign}AED ${formatted}`;
}

// ============================================
// METRIC KEYS (standardized)
// ============================================

export const METRIC_KEYS = {
  // Financial
  TOTAL_BUDGET: 'totalBudget',
  YTD_SPEND: 'ytdSpend',
  BUDGET_LEAKAGE: 'budgetLeakage',
  RECOVERY_POTENTIAL: 'recoveryPotential',
  UNUTILIZED_BUDGET: 'unutilizedBudget',
  
  // Utilization
  UTILIZATION_RATE: 'utilizationRate',
  PARTICIPATION_RATE: 'participationRate',
  
  // Operational
  PENDING_CLAIMS: 'pendingClaims',
  SLA_COMPLIANCE: 'slaCompliance',
  AVG_CYCLE_TIME: 'avgCycleTime',
  REJECTION_RATE: 'rejectionRate',
  
  // Satisfaction
  EMPLOYEE_SATISFACTION: 'employeeSatisfaction',
  ESAT_SCORE: 'esatScore',
} as const;

export default TERMINOLOGY;
