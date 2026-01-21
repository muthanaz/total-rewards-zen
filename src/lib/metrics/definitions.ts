/**
 * Central Metric Definitions
 * 
 * Single source of truth for all metric formulas, descriptions,
 * and contextual information used across dashboards.
 */

import { MetricDefinition } from './types';

export const METRIC_DEFINITIONS: Record<string, MetricDefinition> = {
  // ============= UTILIZATION METRICS =============
  utilizationRate: {
    key: 'utilizationRate',
    name: 'Utilization Rate',
    nameAr: 'معدل الاستخدام',
    description: 'Percentage of allocated benefits budget that has been claimed or consumed.',
    descriptionAr: 'نسبة ميزانية المزايا المخصصة التي تم المطالبة بها أو استهلاكها.',
    formula: '(Utilized Amount ÷ Total Entitlement) × 100',
    formulaAr: '(المبلغ المستخدم ÷ إجمالي الاستحقاق) × 100',
    unit: 'percent',
    category: 'utilization',
    timeWindow: 'Current fiscal year (Jan–Dec)',
    exclusions: ['Pending claims not yet approved', 'Forfeited/expired entitlements'],
    dataSource: 'benefit_entitlements table',
    benchmarkRange: { low: 60, target: 75, high: 90 },
  },

  unusedEntitlement: {
    key: 'unusedEntitlement',
    name: 'Unused Entitlement',
    nameAr: 'الاستحقاق غير المستخدم',
    description: 'Total value of allocated benefits not yet claimed by employees.',
    descriptionAr: 'إجمالي قيمة المزايا المخصصة التي لم يطالب بها الموظفون بعد.',
    formula: 'Total Entitlement − Utilized Amount',
    formulaAr: 'إجمالي الاستحقاق − المبلغ المستخدم',
    unit: 'currency',
    category: 'utilization',
    timeWindow: 'Current fiscal year',
    dataSource: 'benefit_entitlements table',
  },

  zombieSpend: {
    key: 'zombieSpend',
    name: 'Zombie Spend',
    nameAr: 'الإنفاق غير المستغل',
    description: 'Benefits allocated but unlikely to be used based on historical patterns.',
    descriptionAr: 'المزايا المخصصة ولكن من غير المرجح استخدامها بناءً على الأنماط التاريخية.',
    formula: 'Unused Entitlement × (1 − Historical Claim Rate)',
    formulaAr: 'الاستحقاق غير المستخدم × (1 − معدل المطالبات التاريخي)',
    unit: 'currency',
    category: 'financial',
    timeWindow: 'Projected to fiscal year end',
    exclusions: ['New employees (< 90 days)', 'Recently added benefits'],
    dataSource: 'benefit_entitlements + historical claims',
  },

  // ============= OPERATIONAL METRICS =============
  avgProcessingTime: {
    key: 'avgProcessingTime',
    name: 'Avg Processing Time',
    nameAr: 'متوسط وقت المعالجة',
    description: 'Average number of business days from claim submission to final decision.',
    descriptionAr: 'متوسط عدد أيام العمل من تقديم المطالبة إلى القرار النهائي.',
    formula: 'Σ(Review Date − Submit Date) ÷ Claims Processed',
    formulaAr: 'Σ(تاريخ المراجعة − تاريخ التقديم) ÷ المطالبات المعالجة',
    unit: 'days',
    category: 'operational',
    timeWindow: 'Last 30 days',
    exclusions: ['Withdrawn claims', 'Claims pending additional documents'],
    dataSource: 'requests table (submitted_at, reviewed_at)',
    benchmarkRange: { low: 5, target: 3, high: 1 },
  },

  approvalRate: {
    key: 'approvalRate',
    name: 'Approval Rate',
    nameAr: 'معدل الموافقة',
    description: 'Percentage of submitted claims that are approved.',
    descriptionAr: 'نسبة المطالبات المقدمة التي تمت الموافقة عليها.',
    formula: '(Approved Claims ÷ Total Decided Claims) × 100',
    formulaAr: '(المطالبات المعتمدة ÷ إجمالي المطالبات المقررة) × 100',
    unit: 'percent',
    category: 'operational',
    timeWindow: 'Last 30 days',
    exclusions: ['Pending claims', 'Withdrawn claims'],
    dataSource: 'requests table (status)',
    benchmarkRange: { low: 70, target: 85, high: 95 },
  },

  claimsThisMonth: {
    key: 'claimsThisMonth',
    name: 'Claims This Month',
    nameAr: 'مطالبات هذا الشهر',
    description: 'Total number of claims submitted in the current calendar month.',
    descriptionAr: 'إجمالي عدد المطالبات المقدمة في الشهر الحالي.',
    formula: 'COUNT(claims WHERE submitted_at >= month_start)',
    formulaAr: 'عدد(المطالبات حيث تاريخ_التقديم >= بداية_الشهر)',
    unit: 'count',
    category: 'operational',
    timeWindow: 'Current calendar month',
    dataSource: 'requests table',
  },

  slaCompliance: {
    key: 'slaCompliance',
    name: 'SLA Compliance',
    nameAr: 'الامتثال لاتفاقية مستوى الخدمة',
    description: 'Percentage of claims processed within the target SLA timeframe.',
    descriptionAr: 'نسبة المطالبات المعالجة ضمن الإطار الزمني المستهدف.',
    formula: '(Claims Within SLA ÷ Total Claims Processed) × 100',
    formulaAr: '(المطالبات ضمن SLA ÷ إجمالي المطالبات المعالجة) × 100',
    unit: 'percent',
    category: 'operational',
    timeWindow: 'Last 30 days',
    dataSource: 'requests table',
    benchmarkRange: { low: 80, target: 95, high: 99 },
  },

  // ============= FINANCIAL METRICS =============
  costPerEmployee: {
    key: 'costPerEmployee',
    name: 'Cost per Employee',
    nameAr: 'التكلفة لكل موظف',
    description: 'Average annual benefits cost per active employee.',
    descriptionAr: 'متوسط تكلفة المزايا السنوية لكل موظف نشط.',
    formula: 'Total Benefits Investment ÷ Active Employee Count',
    formulaAr: 'إجمالي استثمار المزايا ÷ عدد الموظفين النشطين',
    unit: 'currency',
    category: 'financial',
    timeWindow: 'Current fiscal year',
    exclusions: ['Contractors', 'Part-time employees (pro-rated separately)'],
    dataSource: 'org_budgets + profiles',
    benchmarkRange: { low: 25000, target: 35000, high: 50000 },
  },

  roi: {
    key: 'roi',
    name: 'Benefits ROI',
    nameAr: 'عائد الاستثمار في المزايا',
    description: 'Return on investment calculated from retention savings and productivity gains.',
    descriptionAr: 'عائد الاستثمار المحسوب من وفورات الاحتفاظ ومكاسب الإنتاجية.',
    formula: '(Retention Savings + Productivity Gains) ÷ Total Benefits Cost',
    formulaAr: '(وفورات الاحتفاظ + مكاسب الإنتاجية) ÷ إجمالي تكلفة المزايا',
    unit: 'ratio',
    category: 'financial',
    timeWindow: 'Trailing 12 months',
    exclusions: ['Indirect benefits', 'Intangible value'],
    dataSource: 'Calculated estimate based on industry benchmarks',
    minSampleSize: 50,
    benchmarkRange: { low: 1.5, target: 3.0, high: 5.0 },
  },

  totalInvestment: {
    key: 'totalInvestment',
    name: 'Total Investment',
    nameAr: 'إجمالي الاستثمار',
    description: 'Total annual budget allocated for employee benefits.',
    descriptionAr: 'إجمالي الميزانية السنوية المخصصة لمزايا الموظفين.',
    formula: 'SUM(annual_budget) for current fiscal year',
    formulaAr: 'مجموع(الميزانية_السنوية) للسنة المالية الحالية',
    unit: 'currency',
    category: 'financial',
    timeWindow: 'Current fiscal year',
    dataSource: 'org_budgets table',
  },

  // ============= SATISFACTION & RETENTION =============
  satisfactionScore: {
    key: 'satisfactionScore',
    name: 'Satisfaction Score',
    nameAr: 'درجة الرضا',
    description: 'Average employee satisfaction rating for benefits program (1-5 scale, displayed as percentage).',
    descriptionAr: 'متوسط تقييم رضا الموظفين عن برنامج المزايا.',
    formula: '(Average Rating ÷ 5) × 100',
    formulaAr: '(متوسط التقييم ÷ 5) × 100',
    unit: 'percent',
    category: 'satisfaction',
    timeWindow: 'Last survey period',
    exclusions: ['Employees < 90 days tenure'],
    dataSource: 'employee_satisfaction_ratings table',
    minSampleSize: 30,
    benchmarkRange: { low: 60, target: 80, high: 90 },
  },

  retentionRate: {
    key: 'retentionRate',
    name: 'Retention Rate',
    nameAr: 'معدل الاحتفاظ',
    description: 'Percentage of employees who remained with the organization over a period.',
    descriptionAr: 'نسبة الموظفين الذين بقوا مع المنظمة خلال فترة معينة.',
    formula: '((End Count − New Hires) ÷ Start Count) × 100',
    formulaAr: '((عدد النهاية − التعيينات الجديدة) ÷ عدد البداية) × 100',
    unit: 'percent',
    category: 'retention',
    timeWindow: 'Trailing 12 months',
    dataSource: 'profiles table (employment_date)',
    minSampleSize: 20,
    benchmarkRange: { low: 75, target: 90, high: 98 },
  },

  turnoverRate: {
    key: 'turnoverRate',
    name: 'Turnover Rate',
    nameAr: 'معدل الدوران',
    description: 'Percentage of employees who left the organization over a period.',
    descriptionAr: 'نسبة الموظفين الذين غادروا المنظمة خلال فترة معينة.',
    formula: '(Terminations ÷ Average Headcount) × 100',
    formulaAr: '(الإنهاءات ÷ متوسط عدد الموظفين) × 100',
    unit: 'percent',
    category: 'retention',
    timeWindow: 'Trailing 12 months',
    dataSource: 'profiles table',
    benchmarkRange: { low: 15, target: 8, high: 3 },
  },
};

/**
 * Get metric definition by key
 */
export function getMetricDefinition(key: string): MetricDefinition | undefined {
  return METRIC_DEFINITIONS[key];
}

/**
 * Get all metrics in a category
 */
export function getMetricsByCategory(category: string): MetricDefinition[] {
  return Object.values(METRIC_DEFINITIONS).filter(m => m.category === category);
}

/**
 * Get tooltip content for a metric
 */
export function getMetricTooltipContent(key: string): {
  formula: string;
  timeWindow: string;
  exclusions: string[];
  dataSource: string;
} | null {
  const def = METRIC_DEFINITIONS[key];
  if (!def) return null;
  
  return {
    formula: def.formula,
    timeWindow: def.timeWindow || 'Current period',
    exclusions: def.exclusions || [],
    dataSource: def.dataSource,
  };
}
