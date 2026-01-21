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

// Integration management components
export { IntegrationConnectionDrawer } from './IntegrationConnectionDrawer';
export { SyncHistoryDrawer } from './SyncHistoryDrawer';
export type { SyncRecord } from './SyncHistoryDrawer';
export { CSVImportPreview, IMPORT_TEMPLATES } from './CSVImportPreview';
export type { ImportTemplate, CSVPreviewData } from './CSVImportPreview';
export { IntegrationFieldMappingView } from './IntegrationFieldMappingView';
export { IntegrationFieldMapping } from './IntegrationFieldMapping';
export type { FieldMapping } from './IntegrationFieldMapping';
export { IntegrationDataDictionary } from './IntegrationDataDictionary';
export type { DataDictionaryField } from './IntegrationDataDictionary';

// HR Ops Dashboard components
export { TodaysFocusPanel } from './TodaysFocusPanel';
export { WorkloadByOwnerTable } from './WorkloadByOwnerTable';
export { ActionableTasksList } from './ActionableTasksList';
export type { TaskType } from './ActionableTasksList';
export { TodaysPrioritiesStrip } from './TodaysPrioritiesStrip';
export { SuggestedActionsPanel } from './SuggestedActionsPanel';
export { TaskDetailDrawer } from './TaskDetailDrawer';
export type { TaskDetail, TaskDetailType } from './TaskDetailDrawer';

// Claims Review components
export { DecisionRationaleCard } from './DecisionRationaleCard';
export { MissingDocsChecklist } from './MissingDocsChecklist';
export { EmployeeMessagePreview } from './EmployeeMessagePreview';
export { ClaimAuditLog } from './ClaimAuditLog';

// Policy Lifecycle components
export { PolicyLifecycleBadge, PolicyLifecycleFlow } from './PolicyLifecycleBadge';
export type { PolicyLifecycleStatus } from './PolicyLifecycleBadge';

// Policy Engine components
export { PolicyCheckBanner, PolicyCheckInline } from './PolicyCheckBanner';
export { CreatePolicyModal } from './CreatePolicyModal';
export { PolicyLogicEditor } from './PolicyLogicEditor';
export { PolicyEditorSheetV2 } from './PolicyEditorSheetV2';
export { PolicyManagementView } from './PolicyManagementView';

// Claims Bulk Actions & SLA
export { ClaimsBulkActionsBar } from './ClaimsBulkActionsBar';
export { SLARulesModal } from './SLARulesModal';

// Unified Action Modal & Cards
export { UnifiedActionModal } from './UnifiedActionModal';
export type { 
  ActionPrefill, 
  PolicyInsightPrefill, 
  MarketplaceOpportunityPrefill,
  ZombieSpendPrefill,
  SegmentInsightPrefill,
  MetricEvidencePrefill,
} from './UnifiedActionModal';
export { ActionPlanCard } from './ActionPlanCard';

// Claims Ops components
export { ClaimsOpsKPIStrip } from './ClaimsOpsKPIStrip';
export { ClaimsTypeChip } from './ClaimsTypeChip';

// Spend & Utilization components
export { SpendKPIGrid } from './SpendKPIGrid';
export { SpendInsights, generateSpendInsights } from './SpendInsights';
export type { SpendInsight, SpendDataForInsights } from './SpendInsights';
export { SpendRecommendedActions, generateSpendRecommendedActions } from './SpendRecommendedActions';
export type { RecommendedAction } from './SpendRecommendedActions';

// Optimization Opportunities components
export { OptimizationKPIGrid } from './OptimizationKPIGrid';
export { OptimizationInsights, generateOptimizationInsights } from './OptimizationInsights';
export type { OptimizationInsight, OptimizationDataForInsights } from './OptimizationInsights';
export { BenefitsActionPlanSummary, generateSampleActionPlan } from './BenefitsActionPlanSummary';
export type { ActionPlanItem } from './BenefitsActionPlanSummary';
