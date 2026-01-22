/**
 * Data Provenance Layer
 * 
 * Provides transparency about where displayed numbers come from,
 * when they were last updated, and what assumptions were made.
 * 
 * TRUST LAYER: Defensible data for client presentations.
 */

// ============================================================================
// TYPES
// ============================================================================

export type DataSourceType = 
  | 'policy'       // From published policy rules
  | 'payroll'      // From payroll/HRIS integration
  | 'manual'       // Manually entered by admin/HR
  | 'estimate'     // Calculated/derived estimate
  | 'integration'  // From external integration (e.g., insurance provider)
  | 'system';      // System-calculated based on rules

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface DataProvenance {
  /** Type of data source */
  source_type: DataSourceType;
  /** Optional reference ID or description of the source */
  source_ref?: string;
  /** When the underlying data was last refreshed */
  last_updated_at: string;
  /** Confidence level in the data accuracy */
  confidence_level: ConfidenceLevel;
  /** Any assumptions made in calculating/deriving the value */
  assumptions?: string[];
  /** Human-readable source description */
  source_label?: string;
  /** Whether this is an estimate vs. confirmed value */
  is_estimate?: boolean;
}

export interface ProvenanceMetadata {
  /** The displayed value */
  value: number | string;
  /** Provenance information */
  provenance: DataProvenance;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const SOURCE_TYPE_LABELS: Record<DataSourceType, string> = {
  policy: 'Policy Document',
  payroll: 'Payroll System',
  manual: 'Manual Entry',
  estimate: 'Estimated',
  integration: 'External Integration',
  system: 'System Calculated',
};

export const CONFIDENCE_LABELS: Record<ConfidenceLevel, string> = {
  high: 'High Confidence',
  medium: 'Medium Confidence',
  low: 'Low Confidence',
};

export const CONFIDENCE_COLORS: Record<ConfidenceLevel, {
  bg: string;
  text: string;
  border: string;
}> = {
  high: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/20',
  },
  medium: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/20',
  },
  low: {
    bg: 'bg-red-500/10',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-500/20',
  },
};

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create provenance for policy-derived values
 */
export function createPolicyProvenance(
  policyRef: string,
  lastUpdated?: string | Date,
  assumptions?: string[]
): DataProvenance {
  return {
    source_type: 'policy',
    source_ref: policyRef,
    source_label: `Policy ${policyRef}`,
    last_updated_at: normalizeDate(lastUpdated),
    confidence_level: 'high',
    assumptions,
    is_estimate: false,
  };
}

/**
 * Create provenance for payroll/HRIS data
 */
export function createPayrollProvenance(
  lastSync?: string | Date,
  sourceSystem?: string
): DataProvenance {
  return {
    source_type: 'payroll',
    source_ref: sourceSystem,
    source_label: sourceSystem || 'Payroll System',
    last_updated_at: normalizeDate(lastSync),
    confidence_level: 'high',
    is_estimate: false,
  };
}

/**
 * Create provenance for estimated/derived values
 */
export function createEstimateProvenance(
  assumptions: string[],
  confidence: ConfidenceLevel = 'medium',
  source?: string
): DataProvenance {
  return {
    source_type: 'estimate',
    source_label: source || 'System Estimate',
    last_updated_at: new Date().toISOString(),
    confidence_level: confidence,
    assumptions,
    is_estimate: true,
  };
}

/**
 * Create provenance for manually entered values
 */
export function createManualProvenance(
  enteredBy?: string,
  enteredAt?: string | Date
): DataProvenance {
  return {
    source_type: 'manual',
    source_ref: enteredBy,
    source_label: enteredBy ? `Entered by ${enteredBy}` : 'Manual Entry',
    last_updated_at: normalizeDate(enteredAt),
    confidence_level: 'medium',
    is_estimate: false,
  };
}

/**
 * Create provenance for system-calculated values
 */
export function createSystemProvenance(
  calculationSource?: string,
  lastCalculated?: string | Date
): DataProvenance {
  return {
    source_type: 'system',
    source_label: calculationSource || 'System Calculation',
    last_updated_at: normalizeDate(lastCalculated),
    confidence_level: 'high',
    is_estimate: false,
  };
}

/**
 * Create provenance for integration data
 */
export function createIntegrationProvenance(
  integrationName: string,
  lastSync?: string | Date,
  confidence: ConfidenceLevel = 'high'
): DataProvenance {
  return {
    source_type: 'integration',
    source_ref: integrationName,
    source_label: integrationName,
    last_updated_at: normalizeDate(lastSync),
    confidence_level: confidence,
    is_estimate: false,
  };
}

// ============================================================================
// HELPERS
// ============================================================================

function normalizeDate(date?: string | Date): string {
  if (!date) return new Date().toISOString();
  return typeof date === 'string' ? date : date.toISOString();
}

/**
 * Format provenance for display
 */
export function formatProvenanceTooltip(provenance: DataProvenance): string {
  const parts: string[] = [];
  
  parts.push(`Source: ${provenance.source_label || SOURCE_TYPE_LABELS[provenance.source_type]}`);
  
  if (provenance.last_updated_at) {
    const date = new Date(provenance.last_updated_at);
    parts.push(`Updated: ${date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`);
  }
  
  if (provenance.assumptions && provenance.assumptions.length > 0) {
    parts.push(`Assumptions: ${provenance.assumptions.join('; ')}`);
  }
  
  return parts.join(' • ');
}

/**
 * Check if data is stale (older than specified hours)
 */
export function isDataStale(provenance: DataProvenance, staleHours: number = 24): boolean {
  const lastUpdated = new Date(provenance.last_updated_at);
  const now = new Date();
  const diffHours = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
  return diffHours > staleHours;
}

/**
 * Get freshness label
 */
export function getFreshnessLabel(provenance: DataProvenance): string {
  const lastUpdated = new Date(provenance.last_updated_at);
  const now = new Date();
  const diffHours = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
  
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return 'Today';
  if (diffHours < 48) return 'Yesterday';
  if (diffHours < 168) return `${Math.floor(diffHours / 24)}d ago`;
  return new Date(provenance.last_updated_at).toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'short' 
  });
}
