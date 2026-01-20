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

// Drill Down / Detail Views
export { DrillDownSheet, DrillDownSummaryGrid } from './DrillDownSheet';

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
