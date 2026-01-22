// Shared Layout Components
// These components enforce consistent patterns across all portals

// Page Structure
export { PageHeader } from './PageHeader';
export { PageLayout, PageSection } from './PageLayout';
export { FilterBar } from './FilterBar';

// Section Components
export { SectionCard, CompactSectionCard } from './SectionCard';

// Metric Components
export { MetricCard, MetricGrid, InlineStat } from './MetricCard';
export { MetricTooltip } from './MetricTooltip';
export { ConfidenceBadge, ConfidenceDot } from './ConfidenceBadge';
export { MetricDefinitionsDrawer } from './MetricDefinitionsDrawer';

// Drill Down / Detail Views
export { DrillDownSheet, DrillDownSummaryGrid } from './DrillDownSheet';
export { KPIDrilldownSheet, useKPIDrilldown } from './KPIDrilldownSheet';
export type { KPIMetricData } from './KPIDrilldownSheet';

// Data Quality & Confidence
export { ConfidenceGate } from './ConfidenceGate';
export { PermissionGate } from './PermissionGate';

// Bank Cards (shared between portals)
export { BankCardsSection } from './BankCardsSection';

// Cross-Portal Entity Links
export { 
  EmployeeChip, 
  BenefitChip, 
  RequestChip, 
  PolicyChip, 
  SegmentChip, 
  RecommendationChip,
  EntityLink,
  getEntityPath,
} from './EntityChip';
export type { 
  EmployeeChipProps, 
  BenefitChipProps, 
  RequestChipProps, 
  PolicyChipProps,
  SegmentChipProps,
  RecommendationChipProps,
  EntityType,
} from './EntityChip';

// Entity-Aware Breadcrumbs
export { EntityBreadcrumbs, useEntityContext } from './EntityBreadcrumbs';

// Request Timeline (shared across portals)
export { RequestTimeline, CompactTimeline } from './RequestTimeline';
export type { TimelineEvent } from './RequestTimeline';

// Policy Applicability (employee view)
export { PolicyApplicabilityCard } from './PolicyApplicabilityCard';

// Phase 2 Gate
export { Phase2Gate, MarketplacePhase2Gate, VendorPortalGate } from './Phase2Gate';

// Enum Display Chips (human-readable labels with tooltips)
export { 
  LifeAreaChip, 
  BenefitTypeChip, 
  formatEnumLabel,
  getLifeAreaLabel,
  getBenefitTypeLabel,
} from './EnumChip';

// Metric Evidence Drawer (comprehensive metric explainer)
export { 
  MetricEvidenceDrawer, 
  MetricEvidenceTrigger, 
  createMetricEvidenceData,
} from './MetricEvidenceDrawer';
export type { MetricEvidenceData } from './MetricEvidenceDrawer';

// Trust Layer Components
export { DataProvenanceTooltip, ProvenanceInline } from './DataProvenanceTooltip';
export { 
  EstimateDisclaimer, 
  UtilizationDisclaimer, 
  EntitlementDisclaimer,
  ForecastDisclaimer,
  BenchmarkDisclaimer,
} from './EstimateDisclaimer';
export { 
  TrustedValue, 
  TrustedCurrency, 
  TrustedPercent, 
  TrustedInteger,
  TrustedMetricCard,
} from './TrustedValue';

// Global Error Boundary
export { GlobalErrorBoundary } from './GlobalErrorBoundary';

// Zero States (portal-specific empty states with CTAs)
export { 
  ZeroState, 
  EmployeeZeroState, 
  EmployerZeroState, 
  AdminZeroState, 
  VendorZeroState,
} from './ZeroState';
