/**
 * Data Trust Types
 * 
 * Strict type definitions for deterministic confidence rules.
 */

export type ConfidenceBand = 'high' | 'medium' | 'low';

export interface DataSource {
  id: string;
  name: string;
  nameAr?: string;
  connected: boolean;
  lastSync?: Date;
  nextSync?: Date;
  coverage: number; // 0-100
  status: 'healthy' | 'degraded' | 'disconnected';
}

export interface DataQualityViolation {
  id: string;
  rule: string;
  severity: 'critical' | 'warning' | 'info';
  count: number;
  impactedMetric?: string;
}

export interface DataTrustState {
  // Coverage
  sourcesConnected: number;
  sourcesExpected: number;
  missingSources: string[];
  
  // Freshness
  lastSyncAt?: Date;
  nextSyncAt?: Date;
  dataAgeHours: number;
  
  // Quality
  criticalViolations: number;
  warningViolations: number;
  violations: DataQualityViolation[];
  
  // Computed
  coveragePercent: number;
  confidenceBand: ConfidenceBand;
  confidenceReason: string;
  
  // Limitations
  limitations: string[];
}

export interface DataTrustPanelProps {
  /** Page-specific trust state (if not provided, uses global hook) */
  state?: DataTrustState;
  /** Page name for context-specific limitations */
  pageName?: string;
  /** Whether to show the panel expanded by default (auto-expands if Low confidence) */
  defaultExpanded?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Deterministic confidence rules (PROMPT 03 spec):
 * 
 * HIGH: coverage >= 90% AND freshness <= 24h AND no critical violations
 * MEDIUM: coverage >= 70% AND freshness <= 7d AND critical violations <= threshold
 * LOW: otherwise
 */
export const CONFIDENCE_THRESHOLDS = {
  HIGH: {
    minCoverage: 90,
    maxFreshnessHours: 24,
    maxCriticalViolations: 0,
  },
  MEDIUM: {
    minCoverage: 70,
    maxFreshnessHours: 168, // 7 days
    maxCriticalViolations: 3,
  },
} as const;

/**
 * Get confidence band from state using deterministic rules
 */
export function computeConfidenceBand(
  coveragePercent: number,
  dataAgeHours: number,
  criticalViolations: number
): { band: ConfidenceBand; reason: string } {
  const { HIGH, MEDIUM } = CONFIDENCE_THRESHOLDS;
  
  // Check HIGH first
  if (
    coveragePercent >= HIGH.minCoverage &&
    dataAgeHours <= HIGH.maxFreshnessHours &&
    criticalViolations <= HIGH.maxCriticalViolations
  ) {
    return {
      band: 'high',
      reason: 'Complete data from all connected sources, synced within 24h',
    };
  }
  
  // Check MEDIUM
  if (
    coveragePercent >= MEDIUM.minCoverage &&
    dataAgeHours <= MEDIUM.maxFreshnessHours &&
    criticalViolations <= MEDIUM.maxCriticalViolations
  ) {
    // Provide specific reason
    const reasons: string[] = [];
    if (coveragePercent < HIGH.minCoverage) {
      reasons.push(`${100 - Math.round(coveragePercent)}% data missing`);
    }
    if (dataAgeHours > HIGH.maxFreshnessHours) {
      reasons.push(`data is ${Math.round(dataAgeHours / 24)}d old`);
    }
    if (criticalViolations > 0) {
      reasons.push(`${criticalViolations} critical issue${criticalViolations > 1 ? 's' : ''}`);
    }
    
    return {
      band: 'medium',
      reason: reasons.length > 0 
        ? `Some limitations: ${reasons.join(', ')}` 
        : 'Minor data gaps present',
    };
  }
  
  // LOW
  const reasons: string[] = [];
  if (coveragePercent < MEDIUM.minCoverage) {
    reasons.push(`only ${Math.round(coveragePercent)}% data coverage`);
  }
  if (dataAgeHours > MEDIUM.maxFreshnessHours) {
    reasons.push(`data is ${Math.round(dataAgeHours / 24)}d stale`);
  }
  if (criticalViolations > MEDIUM.maxCriticalViolations) {
    reasons.push(`${criticalViolations} critical violations`);
  }
  
  return {
    band: 'low',
    reason: reasons.length > 0 
      ? `Significant issues: ${reasons.join(', ')}` 
      : 'Insufficient data for reliable analysis',
  };
}

/**
 * Page-specific limitation templates
 */
export const PAGE_LIMITATIONS: Record<string, string[]> = {
  dashboard: [
    'YTD spend projections may vary ±10% with incomplete payroll data',
    'Leakage estimates require policy coverage above 80%',
  ],
  spend: [
    'Forecast accuracy depends on 12-month claims history',
    'Segment breakdowns require employee grade mapping',
  ],
  segments: [
    'AI watchlist requires minimum 50 employees per segment',
    'Behavioral insights need 6+ months of claims data',
  ],
  optimization: [
    'Recovery estimates assume current policy rules remain unchanged',
    'Quick wins require entitlement data for all active employees',
  ],
  benchmarks: [
    'Peer comparisons require industry classification',
    'Percentile positions based on available survey data only',
  ],
  integrations: [
    'Sync status reflects last known connection state',
    'Field mapping coverage affects downstream analytics',
  ],
  'data-quality': [
    'Rule violations may have cascading impact on multiple KPIs',
    'Auto-fix success depends on data source availability',
  ],
  reports: [
    'Report accuracy reflects data quality at generation time',
    'Historical reports use point-in-time snapshots',
  ],
};
