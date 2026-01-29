/**
 * Data Trust Components
 * 
 * Explainable data confidence for executive and HR ops pages.
 */

export { DataTrustPanel, EstimateReliabilityBadge } from './DataTrustPanel';
export { useDataTrust, formatDataTrust } from './useDataTrust';
export type { 
  DataTrustState, 
  DataTrustPanelProps, 
  ConfidenceBand,
  DataSource,
  DataQualityViolation,
} from './types';
export { 
  computeConfidenceBand, 
  CONFIDENCE_THRESHOLDS,
  PAGE_LIMITATIONS,
} from './types';
