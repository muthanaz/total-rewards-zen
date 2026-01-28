/**
 * Dashboard Components Index
 * 
 * Exports all dashboard-specific components for Executive and HR Ops views
 */

// Executive Dashboard Components
export { ExecBottomLineKPIs } from './ExecBottomLineKPIs';
export type { BottomLineMetrics } from './ExecBottomLineKPIs';

export { ExecTopDriversPanel } from './ExecTopDriversPanel';
export type { SpendDriver, LeakageDriver } from './ExecTopDriversPanel';

export { ExecDecisionsPanel } from './ExecDecisionsPanel';
export type { RecommendedAction, EffortLevel } from './ExecDecisionsPanel';

export { ExecRisksPanel } from './ExecRisksPanel';
export type { RiskIndicator } from './ExecRisksPanel';

// HR Ops Dashboard Components
export { HROpsQueueHealth } from './HROpsQueueHealth';
export type { QueueHealthMetrics } from './HROpsQueueHealth';

export { HROpsSLAPerformance } from './HROpsSLAPerformance';
export type { SLAMetrics } from './HROpsSLAPerformance';

export { HROpsThroughput } from './HROpsThroughput';
export type { ThroughputMetrics } from './HROpsThroughput';

export { HROpsPaymentsPipeline } from './HROpsPaymentsPipeline';
export type { PaymentsPipelineMetrics } from './HROpsPaymentsPipeline';

// Shared Components
export { GenerateExecBriefButton } from './GenerateExecBriefButton';
export type { ExecBriefData } from './GenerateExecBriefButton';
