import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Search,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  AlertTriangle,
  Clock,
  Users,
  Percent,
  Calculator,
  Database,
  CheckCircle2,
  XCircle,
  Info,
  Tag,
  Filter,
  Zap,
  Shield,
  PieChart,
  Activity,
  Layers,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface MetricDefinition {
  id: string;
  name: string;
  shortName: string;
  icon: any;
  category: 'financial' | 'utilization' | 'operational' | 'satisfaction';
  tags: string[];
  definition: string;
  formula: {
    display: string;
    components: { name: string; source: string }[];
  };
  interpretation: {
    good: string;
    warning: string;
    bad: string;
  };
  pitfalls: string[];
  dataQuality: {
    required: string[];
    improvements: string[];
  };
  relatedMetrics: string[];
  benchmarks?: {
    low: number | string;
    target: number | string;
    excellent: number | string;
  };
  usedIn?: { page: string; path: string }[];
  dataOwner?: string;
  lastUpdated?: string;
}

// ============================================================================
// DATA - METRIC DEFINITIONS
// ============================================================================

const METRIC_DEFINITIONS: MetricDefinition[] = [
  {
    id: 'utilization-rate',
    name: 'Utilization Rate',
    shortName: 'Utilization',
    icon: Percent,
    category: 'utilization',
    tags: ['core', 'efficiency', 'spend'],
    definition: 'The percentage of entitled benefits value that employees have successfully claimed and used. This is the primary measure of how well your benefits investment is being leveraged.',
    formula: {
      display: '(Claimed Amount / Entitled Value) × 100',
      components: [
        { name: 'Claimed Amount', source: 'SUM(requests.amount) WHERE status IN (approved, paid)' },
        { name: 'Entitled Value', source: 'SUM(benefit_entitlements.annual_allowance)' },
      ],
    },
    interpretation: {
      good: '≥ 75%: Strong utilization indicates employees understand and value their benefits',
      warning: '50-75%: Moderate utilization suggests awareness or accessibility gaps',
      bad: '< 50%: Low utilization signals significant friction or irrelevant offerings',
    },
    pitfalls: [
      'Confusing "Entitled" with "Budgeted" - entitled value comes from individual allocations, not org budget',
      'Including pending claims inflates the rate before approval',
      'Ignoring time-based benefits (leave) that don\'t have monetary values',
      'Not segmenting by benefit type hides underperforming categories',
    ],
    dataQuality: {
      required: ['Complete benefit_entitlements records', 'Accurate request status tracking', 'Consistent amount values'],
      improvements: [
        'Ensure all employees have entitlement records created at onboarding',
        'Verify status transitions are logged in request_events',
        'Audit claims with zero amounts or missing values',
      ],
    },
    relatedMetrics: ['zombie-spend', 'claims-volume', 'cost-per-employee'],
    benchmarks: { low: 50, target: 75, excellent: 90 },
    usedIn: [
      { page: 'Spend & Utilization', path: '/employer/spend' },
      { page: 'Executive Dashboard', path: '/employer' },
    ],
    dataOwner: 'HR Operations',
    lastUpdated: 'Jan 15, 2024',
  },
  {
    id: 'zombie-spend',
    name: 'Unrealized Budget',
    shortName: 'Leakage',
    icon: TrendingDown,
    category: 'financial',
    tags: ['waste', 'cost', 'optimization'],
    definition: 'Benefits budget that is allocated but remains unused by employees. This represents potential waste or an opportunity for reallocation to higher-value programs.',
    formula: {
      display: 'Entitled Value - Claimed Amount',
      components: [
        { name: 'Entitled Value', source: 'SUM(benefit_entitlements.annual_allowance)' },
        { name: 'Claimed Amount', source: 'SUM(requests.amount) WHERE status IN (approved, paid)' },
      ],
    },
    interpretation: {
      good: '< 15% of entitled: Healthy utilization with minimal waste',
      warning: '15-30%: Notable waste requiring investigation',
      bad: '> 30%: Significant budget at risk - immediate action needed',
    },
    pitfalls: [
      'Assuming all unused budget is "waste" - some benefits have natural lower utilization',
      'Not distinguishing between benefit types (insurance premiums vs. reimbursements)',
      'Measuring mid-year before annual benefits have been fully utilized',
      'Ignoring rollover provisions that affect year-end calculations',
    ],
    dataQuality: {
      required: ['Complete entitlement records', 'Accurate claim amounts', 'Proper status classification'],
      improvements: [
        'Track zombie spend by benefit type to identify specific problem areas',
        'Compare against prior year same-period to account for seasonality',
        'Link to friction analysis to understand root causes',
      ],
    },
    relatedMetrics: ['utilization-rate', 'cost-per-employee', 'budget-variance'],
    usedIn: [
      { page: 'Optimization', path: '/employer/optimization' },
      { page: 'Executive Dashboard', path: '/employer' },
    ],
    dataOwner: 'Finance',
    lastUpdated: 'Jan 12, 2024',
  },
  {
    id: 'cost-per-employee',
    name: 'Cost Per Employee',
    shortName: 'CPE',
    icon: DollarSign,
    category: 'financial',
    tags: ['cost', 'benchmark', 'budget'],
    definition: 'The average total benefits spend per employee, used for budgeting, forecasting, and benchmarking against industry standards.',
    formula: {
      display: 'Total Benefits Spend / Active Employee Count',
      components: [
        { name: 'Total Benefits Spend', source: 'SUM(requests.amount) WHERE status = paid' },
        { name: 'Active Employee Count', source: 'COUNT(DISTINCT profiles.user_id) WHERE active = true' },
      ],
    },
    interpretation: {
      good: 'Within 10% of budget and competitive with industry benchmarks',
      warning: 'Significant variance from plan or lagging industry peers',
      bad: 'Major over/underspend indicating planning or execution issues',
    },
    pitfalls: [
      'Including one-time costs (severance, relocation) skews recurring averages',
      'Not adjusting for headcount changes during the period',
      'Comparing across industries without adjusting for regional cost differences',
      'Mixing employer-paid and employee-paid contributions',
    ],
    dataQuality: {
      required: ['Accurate headcount data', 'Complete payment records', 'Proper date range filtering'],
      improvements: [
        'Segment by grade level for more meaningful comparisons',
        'Track monthly to identify trends and seasonality',
        'Separate by benefit category for targeted optimization',
      ],
    },
    relatedMetrics: ['utilization-rate', 'budget-variance', 'total-investment'],
    benchmarks: { low: 'AED 35,000', target: 'AED 48,000', excellent: 'AED 60,000' },
    usedIn: [
      { page: 'Spend & Utilization', path: '/employer/spend' },
      { page: 'Employee Segments', path: '/employer/segments' },
    ],
    dataOwner: 'Finance',
    lastUpdated: 'Jan 10, 2024',
  },
  {
    id: 'sla-compliance',
    name: 'SLA Compliance Rate',
    shortName: 'SLA',
    icon: Clock,
    category: 'operational',
    tags: ['operations', 'claims', 'service'],
    definition: 'The percentage of claims processed within the defined Service Level Agreement timeframes. Measures operational efficiency and employee experience quality.',
    formula: {
      display: '(Claims Processed Within SLA / Total Claims Processed) × 100',
      components: [
        { name: 'Claims Within SLA', source: 'COUNT(requests) WHERE reviewed_at <= sla_due_at' },
        { name: 'Total Claims', source: 'COUNT(requests) WHERE status IN (approved, rejected, paid)' },
      ],
    },
    interpretation: {
      good: '≥ 95%: Excellent operational execution',
      warning: '85-95%: Some processing delays requiring attention',
      bad: '< 85%: Systemic operational issues impacting employee experience',
    },
    pitfalls: [
      'Not accounting for business days vs. calendar days',
      'Excluding rejected claims from the calculation',
      'Measuring from wrong timestamp (submission vs. completeness)',
      'Not segmenting by claim type (different SLAs may apply)',
    ],
    dataQuality: {
      required: ['sla_due_at populated on all claims', 'Accurate reviewed_at timestamps', 'Proper status transitions'],
      improvements: [
        'Implement automated SLA assignment based on claim type',
        'Add escalation alerts for claims approaching SLA breach',
        'Track by processor to identify training needs',
      ],
    },
    relatedMetrics: ['avg-processing-time', 'claims-volume', 'rejection-rate'],
    benchmarks: { low: '< 85%', target: '95%', excellent: '≥ 99%' },
    usedIn: [
      { page: 'Claims & Approvals', path: '/employer/claims' },
      { page: 'HR Ops Dashboard', path: '/employer' },
    ],
    dataOwner: 'HR Operations',
    lastUpdated: 'Jan 18, 2024',
  },
  {
    id: 'avg-processing-time',
    name: 'Average Processing Time',
    shortName: 'Avg Time',
    icon: Activity,
    category: 'operational',
    tags: ['operations', 'efficiency', 'claims'],
    definition: 'The mean time (in business days) from claim submission to final decision. Lower times indicate better operational efficiency and employee satisfaction.',
    formula: {
      display: 'SUM(reviewed_at - created_at) / COUNT(processed_claims)',
      components: [
        { name: 'Processing Duration', source: 'reviewed_at - created_at (in business days)' },
        { name: 'Processed Claims', source: 'COUNT(requests) WHERE status IN (approved, rejected)' },
      ],
    },
    interpretation: {
      good: '≤ 2 days: Fast, responsive claims handling',
      warning: '3-5 days: Acceptable but room for improvement',
      bad: '> 5 days: Slow processing impacting employee experience',
    },
    pitfalls: [
      'Including claims that required additional documentation (inflates average)',
      'Not excluding weekends and holidays from the calculation',
      'Measuring only to first touch instead of final decision',
      'Not segmenting high-value claims that require extra review',
    ],
    dataQuality: {
      required: ['Accurate timestamps on status changes', 'Proper claim completion tracking'],
      improvements: [
        'Track time spent in each status for bottleneck analysis',
        'Separate first-touch time from total resolution time',
        'Monitor by claim category to set realistic expectations',
      ],
    },
    relatedMetrics: ['sla-compliance', 'claims-volume', 'rejection-rate'],
    benchmarks: { low: '> 5 days', target: '2-3 days', excellent: '< 2 days' },
    usedIn: [
      { page: 'Claims & Approvals', path: '/employer/claims' },
      { page: 'HR Ops Dashboard', path: '/employer' },
    ],
    dataOwner: 'HR Operations',
    lastUpdated: 'Jan 18, 2024',
  },
  {
    id: 'rejection-rate',
    name: 'Claim Rejection Rate',
    shortName: 'Rejection',
    icon: XCircle,
    category: 'operational',
    tags: ['operations', 'quality', 'friction'],
    definition: 'The percentage of submitted claims that are rejected. High rejection rates indicate policy confusion, documentation issues, or eligibility misunderstandings.',
    formula: {
      display: '(Rejected Claims / Total Submitted Claims) × 100',
      components: [
        { name: 'Rejected Claims', source: 'COUNT(requests) WHERE status = rejected' },
        { name: 'Total Submitted', source: 'COUNT(requests) WHERE status != draft' },
      ],
    },
    interpretation: {
      good: '< 5%: Clear policies and good employee understanding',
      warning: '5-15%: Some friction or confusion in the claims process',
      bad: '> 15%: Significant issues with policy clarity or eligibility',
    },
    pitfalls: [
      'Not distinguishing between rejection reasons (eligibility vs. documentation)',
      'Including draft claims that were never submitted',
      'Not tracking resubmission success rates',
      'Ignoring patterns by benefit type or employee segment',
    ],
    dataQuality: {
      required: ['Rejection reason codes', 'Proper status tracking', 'Complete request history'],
      improvements: [
        'Implement rejection reason categorization',
        'Track resubmission rates to measure improvement',
        'Link rejections to policy sections for targeted updates',
      ],
    },
    relatedMetrics: ['missing-docs-rate', 'policy-clarity-score', 'utilization-rate'],
    benchmarks: { low: '> 15%', target: '5-8%', excellent: '< 3%' },
    usedIn: [
      { page: 'Claims & Approvals', path: '/employer/claims' },
      { page: 'Policy Insights', path: '/employer/policy-insights' },
    ],
    dataOwner: 'HR Operations',
    lastUpdated: 'Jan 16, 2024',
  },
  {
    id: 'missing-docs-rate',
    name: 'Missing Documents Rate',
    shortName: 'Missing Docs',
    icon: AlertTriangle,
    category: 'operational',
    tags: ['friction', 'documentation', 'process'],
    definition: 'The percentage of claims submitted without required documentation. High rates indicate unclear requirements or cumbersome documentation processes.',
    formula: {
      display: '(Claims with Missing Docs / Total Claims) × 100',
      components: [
        { name: 'Claims Missing Docs', source: 'COUNT(requests) WHERE missing_docs_flag = true' },
        { name: 'Total Claims', source: 'COUNT(requests) WHERE status != draft' },
      ],
    },
    interpretation: {
      good: '< 10%: Clear documentation requirements',
      warning: '10-25%: Moderate friction in documentation process',
      bad: '> 25%: Major barrier to successful claims submission',
    },
    pitfalls: [
      'Not distinguishing between missing vs. incorrect documents',
      'Ignoring which specific documents are most often missing',
      'Not tracking if requirements are communicated at submission time',
      'Failing to measure impact on processing time',
    ],
    dataQuality: {
      required: ['Document checklist per benefit type', 'Tracking of document status', 'Required documents defined'],
      improvements: [
        'Implement real-time document validation at submission',
        'Track specific missing documents by type',
        'Add document requirement reminders in claim flow',
      ],
    },
    relatedMetrics: ['rejection-rate', 'avg-processing-time', 'policy-clarity-score'],
    usedIn: [
      { page: 'Claims & Approvals', path: '/employer/claims' },
      { page: 'Policy Insights', path: '/employer/policy-insights' },
    ],
    dataOwner: 'HR Operations',
    lastUpdated: 'Jan 14, 2024',
  },
  {
    id: 'employee-satisfaction',
    name: 'Employee Satisfaction Score',
    shortName: 'ESAT',
    icon: Users,
    category: 'satisfaction',
    tags: ['engagement', 'feedback', 'experience'],
    definition: 'Average satisfaction rating from employee surveys regarding their benefits experience. A leading indicator of engagement and retention.',
    formula: {
      display: 'SUM(satisfaction_ratings.rating) / COUNT(responses)',
      components: [
        { name: 'Rating Sum', source: 'SUM(employee_satisfaction_ratings.rating)' },
        { name: 'Response Count', source: 'COUNT(employee_satisfaction_ratings)' },
      ],
    },
    interpretation: {
      good: '≥ 4.0/5.0: High satisfaction with benefits program',
      warning: '3.0-4.0: Room for improvement in employee experience',
      bad: '< 3.0: Significant dissatisfaction requiring action',
    },
    pitfalls: [
      'Low response rates making the score unrepresentative',
      'Not segmenting by category (claims experience vs. benefits value)',
      'Survey fatigue leading to declining participation over time',
      'Not linking to specific touchpoints for actionable insights',
    ],
    dataQuality: {
      required: ['Regular survey cadence', 'Category breakdown', 'Sufficient response rates (>30%)'],
      improvements: [
        'Implement post-interaction surveys for timely feedback',
        'Track satisfaction by benefit type and process step',
        'Add qualitative feedback analysis for themes',
      ],
    },
    relatedMetrics: ['utilization-rate', 'sla-compliance', 'rejection-rate'],
    benchmarks: { low: '< 3.0', target: '4.0', excellent: '≥ 4.5' },
    usedIn: [
      { page: 'Executive Dashboard', path: '/employer' },
      { page: 'Recommendations', path: '/employer/recommendations' },
    ],
    dataOwner: 'HR Operations',
    lastUpdated: 'Jan 8, 2024',
  },
  {
    id: 'budget-variance',
    name: 'Budget Variance',
    shortName: 'Variance',
    icon: BarChart3,
    category: 'financial',
    tags: ['budget', 'planning', 'forecast'],
    definition: 'The difference between planned budget and actual spend, expressed as a percentage. Measures forecasting accuracy and spend control.',
    formula: {
      display: '((Actual Spend - Budgeted Amount) / Budgeted Amount) × 100',
      components: [
        { name: 'Actual Spend', source: 'SUM(requests.amount) WHERE status = paid' },
        { name: 'Budgeted Amount', source: 'org_budgets.annual_budget' },
      ],
    },
    interpretation: {
      good: '±5%: Excellent budget planning and execution',
      warning: '±5-15%: Moderate variance requiring review',
      bad: '>±15%: Significant planning or execution issues',
    },
    pitfalls: [
      'Comparing YTD spend to annual budget without prorating',
      'Not accounting for planned mid-year changes',
      'Ignoring committed but unpaid claims',
      'Mixing different fiscal years or currencies',
    ],
    dataQuality: {
      required: ['Approved annual budget', 'Accurate spend tracking', 'Consistent fiscal year definitions'],
      improvements: [
        'Track variance monthly to catch trends early',
        'Segment by benefit category for targeted analysis',
        'Compare variance to prior year patterns',
      ],
    },
    relatedMetrics: ['cost-per-employee', 'zombie-spend', 'utilization-rate'],
    usedIn: [
      { page: 'Spend & Utilization', path: '/employer/spend' },
    ],
    dataOwner: 'Finance',
    lastUpdated: 'Jan 5, 2024',
  },
  {
    id: 'claims-volume',
    name: 'Claims Volume',
    shortName: 'Volume',
    icon: Layers,
    category: 'operational',
    tags: ['operations', 'capacity', 'workload'],
    definition: 'The total number of claims submitted over a period. Used for capacity planning and identifying seasonality patterns.',
    formula: {
      display: 'COUNT(requests) for selected period',
      components: [
        { name: 'Claims Count', source: 'COUNT(requests) WHERE created_at BETWEEN start AND end' },
      ],
    },
    interpretation: {
      good: 'Aligned with historical patterns and staffing capacity',
      warning: 'Unexpected spikes requiring temporary resource adjustment',
      bad: 'Chronic under/over capacity indicating structural issues',
    },
    pitfalls: [
      'Not accounting for seasonal patterns (Q1 schooling, year-end rush)',
      'Mixing claim types with different complexity levels',
      'Ignoring draft claims that indicate intent but not completion',
      'Not correlating with processing capacity',
    ],
    dataQuality: {
      required: ['Complete request records', 'Accurate timestamps', 'Proper categorization'],
      improvements: [
        'Track by claim type for capacity planning',
        'Build seasonal forecasting models',
        'Monitor draft-to-submission conversion rates',
      ],
    },
    relatedMetrics: ['avg-processing-time', 'sla-compliance', 'rejection-rate'],
    usedIn: [
      { page: 'Claims & Approvals', path: '/employer/claims' },
      { page: 'HR Ops Dashboard', path: '/employer' },
    ],
    dataOwner: 'HR Operations',
    lastUpdated: 'Jan 18, 2024',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Metrics', icon: Layers },
  { id: 'financial', label: 'Financial', icon: DollarSign },
  { id: 'utilization', label: 'Utilization', icon: Percent },
  { id: 'operational', label: 'Operational', icon: Activity },
  { id: 'satisfaction', label: 'Satisfaction', icon: Users },
];

const ALL_TAGS = [...new Set(METRIC_DEFINITIONS.flatMap(m => m.tags))].sort();

// ============================================================================
// COMPONENTS
// ============================================================================

interface MetricCardProps {
  metric: MetricDefinition;
  isExpanded: boolean;
  onToggle: () => void;
}

function MetricCard({ metric, isExpanded, onToggle }: MetricCardProps) {
  const Icon = metric.icon;

  return (
    <Card className={cn(
      "card-elevated transition-all duration-200",
      isExpanded && "ring-2 ring-primary/20"
    )}>
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={cn(
                  "p-3 rounded-xl shrink-0",
                  metric.category === 'financial' && "bg-emerald-500/10",
                  metric.category === 'utilization' && "bg-blue-500/10",
                  metric.category === 'operational' && "bg-amber-500/10",
                  metric.category === 'satisfaction' && "bg-violet-500/10",
                )}>
                  <Icon className={cn(
                    "h-5 w-5",
                    metric.category === 'financial' && "text-emerald-600",
                    metric.category === 'utilization' && "text-blue-600",
                    metric.category === 'operational' && "text-amber-600",
                    metric.category === 'satisfaction' && "text-violet-600",
                  )} />
                </div>
                <div>
                  <CardTitle className="text-lg">{metric.name}</CardTitle>
                  <CardDescription className="mt-1 line-clamp-2">
                    {metric.definition}
                  </CardDescription>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {metric.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                {metric.benchmarks && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Target: </span>
                    <span className="font-semibold text-primary">
                      {typeof metric.benchmarks.target === 'number' 
                        ? `${metric.benchmarks.target}%` 
                        : metric.benchmarks.target}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-6">
            {/* Formula Section */}
            <div className="p-4 rounded-lg bg-muted/50 border">
              <h4 className="font-medium flex items-center gap-2 mb-3">
                <Calculator className="h-4 w-4 text-primary" />
                How bnft calculates this
              </h4>
              <div className="p-3 bg-card rounded-lg border font-mono text-sm mb-3">
                {metric.formula.display}
              </div>
              <div className="space-y-2">
                {metric.formula.components.map((comp, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <Badge variant="outline" className="shrink-0 font-mono text-xs">
                      {comp.name}
                    </Badge>
                    <span className="text-muted-foreground text-xs font-mono">
                      {comp.source}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Interpretation */}
            <div>
              <h4 className="font-medium flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-primary" />
                How to interpret
              </h4>
              <div className="space-y-2">
                <div className="flex items-start gap-3 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span className="text-sm">{metric.interpretation.good}</span>
                </div>
                <div className="flex items-start gap-3 p-2 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <span className="text-sm">{metric.interpretation.warning}</span>
                </div>
                <div className="flex items-start gap-3 p-2 rounded-lg bg-red-500/5 border border-red-500/20">
                  <XCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                  <span className="text-sm">{metric.interpretation.bad}</span>
                </div>
              </div>
            </div>

            {/* Pitfalls */}
            <div>
              <h4 className="font-medium flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Common Pitfalls
              </h4>
              <ul className="space-y-2">
                {metric.pitfalls.map((pitfall, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-amber-500 mt-1">•</span>
                    <span className="text-muted-foreground">{pitfall}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Data Quality */}
            <div className="p-4 rounded-lg border-2 border-dashed">
              <h4 className="font-medium flex items-center gap-2 mb-3">
                <Database className="h-4 w-4 text-blue-500" />
                Improving Data Quality
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Required Data</p>
                  <ul className="space-y-1">
                    {metric.dataQuality.required.map((req, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Improvement Actions</p>
                  <ul className="space-y-1">
                    {metric.dataQuality.improvements.map((imp, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <ArrowRight className="h-3 w-3 text-blue-500 mt-1 shrink-0" />
                        <span className="text-muted-foreground">{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Used In / Ownership */}
            {(metric.usedIn || metric.dataOwner) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                {metric.usedIn && metric.usedIn.length > 0 && (
                  <div>
                    <h4 className="font-medium flex items-center gap-2 mb-2 text-sm">
                      <ExternalLink className="h-4 w-4 text-primary" />
                      Used In
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {metric.usedIn.map((usage, idx) => (
                        <Link key={idx} to={usage.path}>
                          <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
                            {usage.page}
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  {metric.dataOwner && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Owner:</span>
                      <Badge variant="secondary">{metric.dataOwner}</Badge>
                    </div>
                  )}
                  {metric.lastUpdated && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Last updated: {metric.lastUpdated}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Related Metrics */}
            {metric.relatedMetrics.length > 0 && (
              <div>
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-violet-500" />
                  Related Metrics
                </h4>
                <div className="flex flex-wrap gap-2">
                  {metric.relatedMetrics.map(related => {
                    const relatedMetric = METRIC_DEFINITIONS.find(m => m.id === related);
                    return (
                      <Badge 
                        key={related} 
                        variant="outline" 
                        className="cursor-pointer hover:bg-muted"
                      >
                        {relatedMetric?.shortName || related}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function KnowledgeCenterPage() {
  const { direction } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);

  const filteredMetrics = useMemo(() => {
    return METRIC_DEFINITIONS.filter(metric => {
      // Category filter
      if (selectedCategory !== 'all' && metric.category !== selectedCategory) {
        return false;
      }

      // Tag filter
      if (selectedTags.length > 0 && !selectedTags.some(tag => metric.tags.includes(tag))) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          metric.name.toLowerCase().includes(query) ||
          metric.definition.toLowerCase().includes(query) ||
          metric.tags.some(tag => tag.toLowerCase().includes(query)) ||
          metric.formula.display.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [selectedCategory, selectedTags, searchQuery]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className={cn("space-y-6", direction === 'rtl' && "rtl")}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-primary" />
            Metric Glossary
          </h1>
          <p className="text-muted-foreground">
            The trust anchor for all analytics — understand how every metric is calculated
          </p>
        </div>
        <Badge variant="outline" className="text-sm self-start lg:self-auto">
          <Shield className="h-3 w-3 mr-1" />
          {METRIC_DEFINITIONS.length} Defined Metrics
        </Badge>
      </div>

      {/* Search & Filters */}
      <Card className="card-elevated">
        <CardContent className="pt-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search metrics, formulas, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
                className="gap-2"
              >
                <cat.icon className="h-4 w-4" />
                {cat.label}
              </Button>
            ))}
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
            {ALL_TAGS.map(tag => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
            {selectedTags.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedTags([])}
                className="text-xs h-6"
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredMetrics.length} of {METRIC_DEFINITIONS.length} metrics
        </p>
        {(searchQuery || selectedCategory !== 'all' || selectedTags.length > 0) && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedTags([]);
            }}
          >
            Reset filters
          </Button>
        )}
      </div>

      {/* Metric Cards */}
      <div className="space-y-4">
        {filteredMetrics.map(metric => (
          <MetricCard
            key={metric.id}
            metric={metric}
            isExpanded={expandedMetric === metric.id}
            onToggle={() => setExpandedMetric(
              expandedMetric === metric.id ? null : metric.id
            )}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredMetrics.length === 0 && (
        <Card className="card-elevated">
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold mb-2">No metrics found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filters
            </p>
            <Button 
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedTags([]);
              }}
            >
              Reset all filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Trust Anchor Footer */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">Data Integrity Commitment</h4>
              <p className="text-sm text-muted-foreground">
                All metrics use shared calculation helpers from <code className="text-xs bg-muted px-1 rounded">crossPortalContract.ts</code> to ensure 
                Employee and Employer portals always display consistent values.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
