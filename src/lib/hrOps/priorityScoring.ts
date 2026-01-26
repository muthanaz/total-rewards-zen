/**
 * Priority Scoring System for HR Ops Queue
 * 
 * Computes a priority score based on:
 * - SLA risk (highest weight)
 * - Amount/value tier
 * - Missing documents
 * - Unassigned status
 * 
 * Supports multiple sorting modes:
 * - risk_first: SLA breach risk → high value → missing docs → unassigned
 * - value_first: Amount/value descending
 * - oldest_first: Submission date ascending
 */

export type SortMode = 'risk_first' | 'value_first' | 'oldest_first';

export interface PriorityFactors {
  slaHoursRemaining: number | null;
  isOverdue: boolean;
  isUrgent: boolean; // < 24h
  amount: number | null;
  hasMissingDocs: boolean;
  missingDocsCount: number;
  isUnassigned: boolean;
  submittedAt: string | null;
  status: string | null;
}

export interface PriorityScore {
  score: number;
  tier: 'critical' | 'high' | 'medium' | 'low';
  factors: {
    sla: number;
    value: number;
    docs: number;
    assignment: number;
  };
  summary: string;
}

// Value tiers with thresholds (AED)
const VALUE_TIERS = {
  premium: { min: 10000, score: 40 },
  high: { min: 5000, score: 30 },
  standard: { min: 2000, score: 20 },
  low: { min: 0, score: 10 },
} as const;

// SLA risk scoring
const SLA_SCORES = {
  overdue: 100,      // Breached SLA
  critical: 80,      // < 4 hours remaining
  urgent: 60,        // < 24 hours remaining
  at_risk: 40,       // < 48 hours remaining
  on_track: 10,      // > 48 hours remaining
  no_sla: 5,         // No SLA configured
} as const;

/**
 * Calculate priority score for a single request
 */
export function calculatePriorityScore(factors: PriorityFactors): PriorityScore {
  let slaScore: number = SLA_SCORES.no_sla;
  let valueScore: number = VALUE_TIERS.low.score;
  let docsScore: number = 0;
  let assignmentScore: number = 0;

  // SLA scoring
  if (factors.slaHoursRemaining !== null) {
    if (factors.isOverdue) {
      slaScore = SLA_SCORES.overdue;
    } else if (factors.slaHoursRemaining < 4) {
      slaScore = SLA_SCORES.critical;
    } else if (factors.slaHoursRemaining < 24) {
      slaScore = SLA_SCORES.urgent;
    } else if (factors.slaHoursRemaining < 48) {
      slaScore = SLA_SCORES.at_risk;
    } else {
      slaScore = SLA_SCORES.on_track;
    }
  }

  // Value scoring
  const amount = factors.amount ?? 0;
  if (amount >= VALUE_TIERS.premium.min) {
    valueScore = VALUE_TIERS.premium.score;
  } else if (amount >= VALUE_TIERS.high.min) {
    valueScore = VALUE_TIERS.high.score;
  } else if (amount >= VALUE_TIERS.standard.min) {
    valueScore = VALUE_TIERS.standard.score;
  } else {
    valueScore = VALUE_TIERS.low.score;
  }

  // Missing docs scoring (each missing doc adds to priority)
  if (factors.hasMissingDocs) {
    docsScore = Math.min(30, factors.missingDocsCount * 10); // Cap at 30
  }

  // Unassigned scoring
  if (factors.isUnassigned) {
    assignmentScore = 15;
  }

  // Total score (weighted sum)
  const totalScore = slaScore + valueScore + docsScore + assignmentScore;

  // Determine tier
  let tier: PriorityScore['tier'] = 'low';
  if (totalScore >= 120) {
    tier = 'critical';
  } else if (totalScore >= 80) {
    tier = 'high';
  } else if (totalScore >= 50) {
    tier = 'medium';
  }

  // Generate summary
  const summaryParts: string[] = [];
  if (factors.isOverdue) summaryParts.push('SLA breached');
  else if (factors.isUrgent) summaryParts.push('SLA < 24h');
  if (amount >= VALUE_TIERS.high.min) summaryParts.push('High value');
  if (factors.hasMissingDocs) summaryParts.push(`${factors.missingDocsCount} docs missing`);
  if (factors.isUnassigned) summaryParts.push('Unassigned');

  return {
    score: totalScore,
    tier,
    factors: {
      sla: slaScore,
      value: valueScore,
      docs: docsScore,
      assignment: assignmentScore,
    },
    summary: summaryParts.join(' • ') || 'On track',
  };
}

/**
 * Sort requests by priority based on selected mode
 */
export function sortByPriority<T extends PriorityFactors & { id: string }>(
  items: T[],
  mode: SortMode
): T[] {
  const sorted = [...items];

  switch (mode) {
    case 'risk_first':
      // Compute scores and sort by them
      sorted.sort((a, b) => {
        const scoreA = calculatePriorityScore(a);
        const scoreB = calculatePriorityScore(b);
        // Higher score = higher priority = comes first
        return scoreB.score - scoreA.score;
      });
      break;

    case 'value_first':
      sorted.sort((a, b) => {
        const amountA = a.amount ?? 0;
        const amountB = b.amount ?? 0;
        return amountB - amountA;
      });
      break;

    case 'oldest_first':
      sorted.sort((a, b) => {
        const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
        const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
        return dateA - dateB;
      });
      break;
  }

  return sorted;
}

/**
 * Get next step description based on request state
 */
export function getNextStepLabel(factors: PriorityFactors): string {
  const status = factors.status;
  
  if (status === 'pending_employee' || status === 'info_requested') {
    return 'Awaiting employee docs';
  }
  
  if (status === 'escalated') {
    return 'Escalated - needs senior review';
  }
  
  if (status === 'in_review') {
    if (factors.hasMissingDocs) {
      return 'Request missing documents';
    }
    return 'Ready for decision';
  }
  
  if (status === 'pending' || status === 'submitted') {
    if (factors.isUnassigned) {
      return 'Assign to reviewer';
    }
    if (factors.hasMissingDocs) {
      return 'Request missing documents';
    }
    return 'Begin review';
  }
  
  if (status === 'approved') {
    return 'Pending payment';
  }
  
  return 'Review required';
}

/**
 * Get priority tier badge styling
 */
export function getPriorityTierStyle(tier: PriorityScore['tier']): {
  className: string;
  label: string;
} {
  switch (tier) {
    case 'critical':
      return {
        className: 'bg-destructive/10 text-destructive border-destructive/20',
        label: 'Critical',
      };
    case 'high':
      return {
        className: 'bg-warning/10 text-warning border-warning/20',
        label: 'High',
      };
    case 'medium':
      return {
        className: 'bg-info/10 text-info border-info/20',
        label: 'Medium',
      };
    default:
      return {
        className: 'bg-muted text-muted-foreground',
        label: 'Low',
      };
  }
}

export const SORT_MODE_OPTIONS: { value: SortMode; label: string; description: string }[] = [
  {
    value: 'risk_first',
    label: 'Risk-First',
    description: 'SLA breach risk → High value → Missing docs',
  },
  {
    value: 'value_first',
    label: 'Value-First',
    description: 'Highest amount first',
  },
  {
    value: 'oldest_first',
    label: 'Oldest-First',
    description: 'Longest wait time first',
  },
];
