/**
 * Unified Trust System
 * 
 * Consolidates data confidence, quality badges, and gating rules
 * into a single source of truth for the platform.
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Data Quality indicates HOW the value was obtained
 * - Measured: From verified source system (payroll, HRIS)
 * - Estimated: Derived from calculations or partial data
 * - Partial: Some data missing, shown with caveats
 */
export type DataQuality = 'measured' | 'estimated' | 'partial';

/**
 * Confidence Level indicates trust in accuracy
 * - High: >85% coverage, <7 days stale, verified source
 * - Medium: 60-85% coverage, 7-30 days stale
 * - Low: <60% coverage, >30 days stale, or missing sources
 */
export type ConfidenceLevel = 'high' | 'medium' | 'low';

/**
 * Extended domain types for issues
 */
export type IssueDomain = 'Employees' | 'Entitlements' | 'Policies' | 'Claims' | 'Marketplace';

/**
 * Issue severity levels
 */
export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low';

/**
 * Issue types for categorization
 */
export type IssueType = 
  | 'integration_missing'
  | 'field_mapping_gap'
  | 'sync_failure'
  | 'data_quality_violation'
  | 'low_coverage'
  | 'stale_data';

export interface TrustMetrics {
  quality: DataQuality;
  confidence: ConfidenceLevel;
  coveragePercent: number;
  lastSyncAt: Date | null;
  sampleSize: number;
  staleDays: number;
  reasons: string[];
}

export interface DataConfidenceThreshold {
  metricKey: string;
  minSampleSize: number;
  minCoveragePercent: number;
  maxStaleDays: number;
  degradedThreshold: number; // Below this shows "low confidence"
}

export interface IssueImpact {
  issueIds: string[];
  currentScore: number;
  projectedScore: number;
  unlockedInsights: string[];
  canCompute: boolean;
  computeReason?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const QUALITY_CONFIG: Record<DataQuality, {
  label: string;
  labelAr: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  measured: {
    label: 'Measured',
    labelAr: 'مُقاس',
    description: 'From verified source system',
    color: 'text-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/20',
  },
  estimated: {
    label: 'Estimated',
    labelAr: 'مُقدّر',
    description: 'Derived from calculations or partial data',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/20',
  },
  partial: {
    label: 'Partial',
    labelAr: 'جزئي',
    description: 'Some data missing, shown with caveats',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
  },
};

export const CONFIDENCE_CONFIG: Record<ConfidenceLevel, {
  label: string;
  labelAr: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: 'shield-check' | 'shield-alert' | 'shield-x';
}> = {
  high: {
    label: 'High',
    labelAr: 'عالي',
    description: '>85% coverage, verified source',
    color: 'text-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/20',
    icon: 'shield-check',
  },
  medium: {
    label: 'Medium',
    labelAr: 'متوسط',
    description: '60-85% coverage',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/20',
    icon: 'shield-alert',
  },
  low: {
    label: 'Low',
    labelAr: 'منخفض',
    description: '<60% coverage or stale data',
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    borderColor: 'border-destructive/20',
    icon: 'shield-x',
  },
};

export const SEVERITY_CONFIG: Record<IssueSeverity, {
  label: string;
  color: string;
  bgColor: string;
  priority: number;
}> = {
  critical: {
    label: 'Critical',
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    priority: 0,
  },
  high: {
    label: 'High',
    color: 'text-orange-600',
    bgColor: 'bg-orange-500/10',
    priority: 1,
  },
  medium: {
    label: 'Medium',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    priority: 2,
  },
  low: {
    label: 'Low',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    priority: 3,
  },
};

export const ISSUE_TYPE_CONFIG: Record<IssueType, {
  label: string;
  description: string;
  fixAction: string;
  fixRoute: string;
}> = {
  integration_missing: {
    label: 'Integration Missing',
    description: 'Data source not connected',
    fixAction: 'Connect Integration',
    fixRoute: '/employer/integrations',
  },
  field_mapping_gap: {
    label: 'Field Mapping Gap',
    description: 'Required fields not mapped from source',
    fixAction: 'Configure Mapping',
    fixRoute: '/employer/integrations',
  },
  sync_failure: {
    label: 'Sync Failure',
    description: 'Data synchronization failed',
    fixAction: 'Retry Sync',
    fixRoute: '/employer/data-quality/sync',
  },
  data_quality_violation: {
    label: 'Data Quality Violation',
    description: 'Data failed validation rules',
    fixAction: 'Fix Data Quality',
    fixRoute: '/employer/data-quality/rules',
  },
  low_coverage: {
    label: 'Low Coverage',
    description: 'Insufficient data for reliable insights',
    fixAction: 'Improve Coverage',
    fixRoute: '/employer/integrations',
  },
  stale_data: {
    label: 'Stale Data',
    description: 'Data is outdated',
    fixAction: 'Run Sync',
    fixRoute: '/employer/data-quality/sync',
  },
};

// Default thresholds (can be overridden per org)
export const DEFAULT_THRESHOLDS: DataConfidenceThreshold[] = [
  { metricKey: 'utilization', minSampleSize: 10, minCoveragePercent: 80, maxStaleDays: 7, degradedThreshold: 60 },
  { metricKey: 'claims_analytics', minSampleSize: 20, minCoveragePercent: 85, maxStaleDays: 3, degradedThreshold: 70 },
  { metricKey: 'satisfaction', minSampleSize: 30, minCoveragePercent: 50, maxStaleDays: 30, degradedThreshold: 30 },
  { metricKey: 'financial', minSampleSize: 5, minCoveragePercent: 95, maxStaleDays: 1, degradedThreshold: 80 },
  { metricKey: 'retention', minSampleSize: 50, minCoveragePercent: 90, maxStaleDays: 30, degradedThreshold: 75 },
];

// ============================================================================
// COMPUTATION FUNCTIONS
// ============================================================================

/**
 * Compute trust metrics based on input data
 */
export function computeTrustMetrics(params: {
  coveragePercent: number;
  sampleSize: number;
  lastSyncAt: Date | null;
  hasVerifiedSource: boolean;
  threshold?: DataConfidenceThreshold;
}): TrustMetrics {
  const { coveragePercent, sampleSize, lastSyncAt, hasVerifiedSource, threshold } = params;
  
  const minSampleSize = threshold?.minSampleSize ?? 10;
  const minCoverage = threshold?.minCoveragePercent ?? 80;
  const maxStaleDays = threshold?.maxStaleDays ?? 7;
  const degradedThreshold = threshold?.degradedThreshold ?? 60;
  
  // Calculate stale days
  const staleDays = lastSyncAt 
    ? Math.floor((Date.now() - lastSyncAt.getTime()) / (1000 * 60 * 60 * 24))
    : 999;
  
  const reasons: string[] = [];
  
  // Determine quality
  let quality: DataQuality = 'measured';
  if (!hasVerifiedSource) {
    quality = 'estimated';
    reasons.push('No verified source system');
  } else if (coveragePercent < minCoverage) {
    quality = 'partial';
    reasons.push(`Coverage ${coveragePercent}% below ${minCoverage}% threshold`);
  }
  
  // Determine confidence
  let confidence: ConfidenceLevel = 'high';
  
  if (sampleSize < minSampleSize) {
    confidence = 'low';
    reasons.push(`Sample size ${sampleSize} below minimum ${minSampleSize}`);
  } else if (staleDays > maxStaleDays) {
    confidence = staleDays > maxStaleDays * 2 ? 'low' : 'medium';
    reasons.push(`Data is ${staleDays} days old (max ${maxStaleDays} days)`);
  } else if (coveragePercent < degradedThreshold) {
    confidence = 'low';
    reasons.push(`Coverage ${coveragePercent}% below degraded threshold ${degradedThreshold}%`);
  } else if (coveragePercent < minCoverage) {
    confidence = 'medium';
    reasons.push(`Coverage ${coveragePercent}% below target ${minCoverage}%`);
  }
  
  return {
    quality,
    confidence,
    coveragePercent,
    lastSyncAt,
    sampleSize,
    staleDays,
    reasons,
  };
}

/**
 * Calculate projected impact if specific issues are resolved
 */
export function computeIssueImpact(params: {
  currentScore: number;
  issues: Array<{ id: string; scoreImpact: number; impactedInsights: string[] }>;
  targetIssueIds: string[];
}): IssueImpact {
  const { currentScore, issues, targetIssueIds } = params;
  
  const targetIssues = issues.filter(i => targetIssueIds.includes(i.id));
  
  if (targetIssues.length === 0) {
    return {
      issueIds: [],
      currentScore,
      projectedScore: currentScore,
      unlockedInsights: [],
      canCompute: false,
      computeReason: 'No issues selected',
    };
  }
  
  // Calculate score improvement
  const scoreImprovement = targetIssues.reduce((sum, i) => sum + Math.abs(i.scoreImpact), 0);
  const projectedScore = Math.min(100, currentScore + scoreImprovement);
  
  // Collect unique unlocked insights
  const unlockedInsights = [...new Set(targetIssues.flatMap(i => i.impactedInsights))];
  
  return {
    issueIds: targetIssueIds,
    currentScore,
    projectedScore,
    unlockedInsights,
    canCompute: true,
  };
}

/**
 * Determine if a metric should be hidden based on confidence
 */
export function shouldHideMetric(
  trustMetrics: TrustMetrics,
  mode: 'strict' | 'lenient' = 'lenient'
): boolean {
  if (mode === 'strict') {
    return trustMetrics.confidence === 'low' || trustMetrics.quality === 'partial';
  }
  // Lenient mode only hides when both quality and confidence are problematic
  return trustMetrics.confidence === 'low' && trustMetrics.quality !== 'measured';
}

/**
 * Get display label for metric based on trust
 */
export function getTrustLabel(trustMetrics: TrustMetrics): string {
  if (trustMetrics.quality === 'estimated') {
    return 'Directional';
  }
  if (trustMetrics.quality === 'partial') {
    return 'Incomplete';
  }
  if (trustMetrics.confidence === 'low') {
    return 'Limited Data';
  }
  if (trustMetrics.confidence === 'medium') {
    return 'Good';
  }
  return 'Verified';
}
