/**
 * SSOT Metrics Dictionary
 * 
 * Canonical definitions for all platform metrics.
 * Every metric displayed in the UI MUST have an entry here.
 * 
 * Fields:
 * - key: Unique identifier
 * - label: Display label (English)
 * - labelAr: Display label (Arabic)
 * - definition: Plain-language explanation
 * - formula: Calculation formula (placeholder if TBD)
 * - scope: What data is included/excluded
 * - provenance: Data source(s)
 * - status: 'defined' | 'estimated' | 'undefined'
 * - assumptionId: Link to assumptions log (e.g., "A002")
 * - notes: Additional context
 */

export type MetricStatus = 'defined' | 'estimated' | 'undefined';

export interface SSOTMetricDefinition {
  key: string;
  label: string;
  labelAr?: string;
  definition: string;
  formula: string;
  scope: string;
  provenance: string;
  status: MetricStatus;
  assumptionId?: string;
  notes?: string;
  unit: 'currency' | 'percent' | 'count' | 'days' | 'ratio';
  higherIsBetter?: boolean;
}

/**
 * Master Metrics Dictionary
 * 
 * All metrics used across Employer + Employee portals
 */
export const SSOT_METRICS: Record<string, SSOTMetricDefinition> = {
  // ============= FINANCIAL METRICS =============
  
  budget_leakage: {
    key: 'budget_leakage',
    label: 'Budget Leakage',
    labelAr: 'تسرب الميزانية',
    definition: 'Unutilized entitled benefits that could have been claimed but were not. Represents value allocated but not realized by employees.',
    formula: 'SUM(annual_allowance - utilized_amount) WHERE value_type IN (cash, reimbursement, budget)',
    scope: 'Cap-based benefits only. Excludes coverage benefits (insurance), deferred benefits (equity, gratuity), and access benefits.',
    provenance: 'benefit_entitlements table',
    status: 'defined',
    unit: 'currency',
    higherIsBetter: false,
    notes: 'Previously called "Zombie Spend". Renamed per terminology standards.',
  },

  recovery_potential: {
    key: 'recovery_potential',
    label: 'Recovery Potential',
    labelAr: 'إمكانية الاسترداد',
    definition: 'Estimated value that can be recovered through optimization interventions. Based on historical recovery rates and current leakage patterns.',
    formula: 'Budget Leakage × Recovery Rate Factor (typically 0.6-0.8)',
    scope: 'Applicable to benefits with actionable optimization levers (awareness, friction reduction, policy adjustment).',
    provenance: 'Calculated from benefit_entitlements + historical intervention data',
    status: 'estimated',
    assumptionId: 'A001',
    unit: 'currency',
    higherIsBetter: true,
    notes: 'Recovery rate factor varies by benefit type and organization maturity.',
  },

  ytd_spend: {
    key: 'ytd_spend',
    label: 'YTD Total Spend',
    labelAr: 'إجمالي الإنفاق حتى تاريخه',
    definition: 'Total benefits expenditure year-to-date including approved claims and disbursed allowances.',
    formula: 'SUM(approved_claims) + SUM(disbursed_allowances) WHERE fiscal_year = current_year',
    scope: 'All benefit types. Includes claims in approved, paid, and closed status.',
    provenance: 'requests + utilization_events tables',
    status: 'defined',
    unit: 'currency',
    higherIsBetter: undefined, // Context-dependent
  },

  projected_year_end: {
    key: 'projected_year_end',
    label: 'Projected Year-End',
    labelAr: 'المتوقع نهاية السنة',
    definition: 'Forecasted total spend by fiscal year end based on current run rate and seasonality adjustments.',
    formula: '(YTD Spend / Months Elapsed) × 12 × Seasonality Factor',
    scope: 'Projection covers remaining fiscal year. Subject to revision as more data becomes available.',
    provenance: 'Calculated from requests + historical patterns',
    status: 'estimated',
    assumptionId: 'A003',
    unit: 'currency',
    higherIsBetter: undefined,
    notes: 'Confidence increases as more months of actual data are available.',
  },

  budget_variance: {
    key: 'budget_variance',
    label: 'Budget Variance',
    labelAr: 'تباين الميزانية',
    definition: 'Difference between actual spend and allocated budget. Positive = over budget, negative = under budget.',
    formula: 'YTD Spend - Allocated Budget',
    scope: 'Compares actuals against approved annual budget.',
    provenance: 'org_budgets + requests tables',
    status: 'defined',
    unit: 'currency',
    higherIsBetter: false,
  },

  // ============= BEHAVIORAL METRICS =============

  adoption_rate: {
    key: 'adoption_rate',
    label: 'Adoption Rate',
    labelAr: 'معدل التبني',
    definition: 'Benefit utilization percentage. Measures what portion of entitled value has been claimed.',
    formula: '(Utilized Amount ÷ Total Entitlement) × 100',
    scope: 'Cap-based benefits (cash, reimbursement, budget). Excludes coverage and deferred benefits.',
    provenance: 'benefit_entitlements table',
    status: 'defined',
    unit: 'percent',
    higherIsBetter: true,
  },

  participation_rate: {
    key: 'participation_rate',
    label: 'Participation Rate',
    labelAr: 'معدل المشاركة',
    definition: 'Percentage of eligible employees who have made at least one claim. Measures breadth of engagement.',
    formula: 'PENDING: Numerator/denominator to be confirmed',
    scope: 'UNDEFINED - Awaiting definition of "eligible" and minimum claim threshold.',
    provenance: 'requests + benefit_entitlements tables',
    status: 'undefined',
    assumptionId: 'A002',
    unit: 'percent',
    higherIsBetter: true,
    notes: 'Definition pending. Currently estimated from available data. See assumptions log.',
  },

  budget_usage: {
    key: 'budget_usage',
    label: 'Budget Usage',
    labelAr: 'استخدام الميزانية',
    definition: 'Percentage of allocated budget that has been spent. Measures financial consumption.',
    formula: '(Total Spent ÷ Total Budget) × 100',
    scope: 'All approved and paid claims against annual budget allocation.',
    provenance: 'org_budgets + requests tables',
    status: 'defined',
    unit: 'percent',
    higherIsBetter: undefined, // Context-dependent
  },

  // ============= DATA QUALITY METRICS =============

  data_readiness_score: {
    key: 'data_readiness_score',
    label: 'Data Readiness Score',
    labelAr: 'درجة جاهزية البيانات',
    definition: '0-100 data quality measure. Composite score across completeness, accuracy, timeliness, and consistency dimensions.',
    formula: '(Completeness × 0.3) + (Accuracy × 0.3) + (Timeliness × 0.2) + (Consistency × 0.2)',
    scope: 'All connected data sources. Weighted by data criticality.',
    provenance: 'integration_runs + data validation rules',
    status: 'defined',
    unit: 'percent',
    higherIsBetter: true,
  },

  // ============= OPERATIONAL METRICS =============

  sla_compliance: {
    key: 'sla_compliance',
    label: 'SLA Compliance',
    labelAr: 'الامتثال لاتفاقية الخدمة',
    definition: 'Percentage of claims processed within the target SLA timeframe.',
    formula: '(Claims Within SLA ÷ Total Claims Processed) × 100',
    scope: 'Last 30 days. Excludes claims paused for employee action.',
    provenance: 'requests table (sla_due_at, reviewed_at)',
    status: 'defined',
    unit: 'percent',
    higherIsBetter: true,
  },

  avg_processing_time: {
    key: 'avg_processing_time',
    label: 'Avg Processing Time',
    labelAr: 'متوسط وقت المعالجة',
    definition: 'Average number of business days from claim submission to final decision.',
    formula: 'AVG(reviewed_at - submitted_at) in business days',
    scope: 'Last 30 days. Excludes withdrawn claims and time waiting on employee.',
    provenance: 'requests table',
    status: 'defined',
    unit: 'days',
    higherIsBetter: false,
  },

  approval_rate: {
    key: 'approval_rate',
    label: 'Approval Rate',
    labelAr: 'معدل الموافقة',
    definition: 'Percentage of submitted claims that are approved.',
    formula: '(Approved Claims ÷ Total Decided Claims) × 100',
    scope: 'Last 30 days. Excludes pending and withdrawn claims.',
    provenance: 'requests table',
    status: 'defined',
    unit: 'percent',
    higherIsBetter: true,
  },
};

/**
 * Get a metric definition by key
 */
export function getSSOTMetric(key: string): SSOTMetricDefinition | undefined {
  return SSOT_METRICS[key];
}

/**
 * Check if a metric is fully defined
 */
export function isMetricDefined(key: string): boolean {
  const metric = SSOT_METRICS[key];
  return metric?.status === 'defined';
}

/**
 * Check if a metric requires an "Estimated" badge
 */
export function isMetricEstimated(key: string): boolean {
  const metric = SSOT_METRICS[key];
  return metric?.status === 'estimated' || metric?.status === 'undefined';
}

/**
 * Get all metrics in a specific status
 */
export function getMetricsByStatus(status: MetricStatus): SSOTMetricDefinition[] {
  return Object.values(SSOT_METRICS).filter(m => m.status === status);
}

/**
 * Get assumption text for a metric
 */
export function getMetricAssumptionText(key: string): string | null {
  const metric = SSOT_METRICS[key];
  if (!metric) return null;
  
  if (metric.status === 'undefined') {
    return `Definition pending (${metric.assumptionId || 'TBD'})`;
  }
  
  if (metric.status === 'estimated') {
    return `Estimated value (${metric.assumptionId || 'see notes'})`;
  }
  
  return null;
}
