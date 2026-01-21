export { ExecutiveDashboard } from './ExecutiveDashboard';
export { ActionDetailDrawer } from './ActionDetailDrawer';
export { ActionCreateModal } from './ActionCreateModal';
export { ActionKanbanView } from './ActionKanbanView';
export { ActionTableView } from './ActionTableView';
export { ActionFilters } from './ActionFilters';
export { HROpsDashboard } from './HROpsDashboard';
export { DataQualityBadge, DataConfidenceIndicator } from './DataQualityBadge';
export { DataConfidenceBadge, useDataCoverageMetrics } from './DataConfidenceBadge';
export { SegmentMetricDefinitions } from './SegmentMetricDefinitions';
export { SegmentOpportunities } from './SegmentOpportunities';
export type { DataCoverageMetrics } from './DataConfidenceBadge';
export { PageConfidenceGate } from './PageConfidenceGate';
export { ConfidenceDetailsDrawer } from './ConfidenceDetailsDrawer';
export { PeriodSelector } from './PeriodSelector';
export { TrendComparison, TrendIndicatorCompact } from './TrendComparison';
export { EmployerGlobalFiltersBar, FilterSummaryPill } from './EmployerGlobalFiltersBar';
export { MarketplaceDisabledState } from './MarketplaceDisabledState';
export { ClaimsExecView } from './ClaimsExecView';
export { PoliciesOpsView } from './PoliciesOpsView';
export { IntegrationsExecView } from './IntegrationsExecView';
export { IssuesCenter } from './IssuesCenter';
export { IssueResolveModal } from './IssueResolveModal';
export { IntegrationConnectWizard } from './IntegrationConnectWizard';
export { OpsOnlyGuard } from './OpsOnlyGuard';
export { 
  OperationalLeversCard, 
  spendOperationalLevers, 
  zombieOperationalLevers, 
  segmentsOperationalLevers, 
  recommendationsOperationalLevers 
} from './OperationalLeversCard';
export { 
  NarrativeInsights, 
  generateUtilizationInsight,
  generateSpendInsight,
  generateZombieInsight,
  generateSatisfactionInsight,
} from './NarrativeInsights';
export type { NarrativeInsight } from './NarrativeInsights';

// Zombie Spend and Forecast components
export { ZombieSpendCandidates, detectZombieCandidates } from './ZombieSpendCandidates';
export { ForecastWidget } from './ForecastWidget';
export { ZombieCategoryDrawer } from './ZombieCategoryDrawer';
export { LaunchPlaybookModal } from './LaunchPlaybookModal';
export { ZombieMetricDefinitions } from './ZombieMetricDefinitions';

// Segment components
export { SegmentDimensionCard } from './SegmentDimensionCard';
export { SegmentDrilldownTable } from './SegmentDrilldownTable';
export { SegmentInsightsDrawer } from './SegmentInsightsDrawer';
export { SegmentCharts } from './SegmentCharts';
export { RiskFlagsModal } from './RiskFlagsModal';
export { SegmentComparePanel } from './SegmentComparePanel';

// Policy Insights components
export { PolicyHotspotDrawer } from './PolicyHotspotDrawer';
export type { ConfusingArea } from './PolicyHotspotDrawer';
export { PolicyQuestionRow } from './PolicyQuestionRow';
export type { PolicyQuestion } from './PolicyQuestionRow';
export { PolicyFixCard } from './PolicyFixCard';
export type { PolicyFix } from './PolicyFixCard';

// Marketplace Analytics components
export { MarketplaceOfferDrawer } from './MarketplaceOfferDrawer';
export type { MarketplaceOffer } from './MarketplaceOfferDrawer';
export { MarketplaceCategoryDrawer } from './MarketplaceCategoryDrawer';
export type { CategoryData } from './MarketplaceCategoryDrawer';
export { MarketplaceSegmentDrawer } from './MarketplaceSegmentDrawer';
export type { SegmentData } from './MarketplaceSegmentDrawer';
export { MarketplaceOpportunityInsights } from './MarketplaceOpportunityInsights';
export { MarketplaceVendorPerformance } from './MarketplaceVendorPerformance';
