/**
 * Knowledge Base Tab Content
 * 
 * Embedded version of Knowledge Center for use within the Policies page tabs.
 * Contains metric definitions, FAQs, and glossary.
 */

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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

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
  benchmarks?: {
    low: number | string;
    target: number | string;
    excellent: number | string;
  };
  usedIn?: { page: string; path: string }[];
}

const METRIC_DEFINITIONS: MetricDefinition[] = [
  {
    id: 'utilization-rate',
    name: 'Utilization Rate',
    shortName: 'Utilization',
    icon: Percent,
    category: 'utilization',
    tags: ['core', 'efficiency', 'spend'],
    definition: 'The percentage of entitled benefits value that employees have successfully claimed and used.',
    formula: {
      display: '(Claimed Amount / Entitled Value) × 100',
      components: [
        { name: 'Claimed Amount', source: 'SUM(requests.amount) WHERE status IN (approved, paid)' },
        { name: 'Entitled Value', source: 'SUM(benefit_entitlements.annual_allowance)' },
      ],
    },
    interpretation: {
      good: '≥ 75%: Strong utilization',
      warning: '50-75%: Moderate utilization',
      bad: '< 50%: Low utilization',
    },
    pitfalls: [
      'Confusing "Entitled" with "Budgeted"',
      'Including pending claims inflates the rate',
    ],
    benchmarks: { low: 50, target: 75, excellent: 90 },
    usedIn: [
      { page: 'Spend & Utilization', path: '/employer/spend' },
      { page: 'Executive Dashboard', path: '/employer' },
    ],
  },
  {
    id: 'zombie-spend',
    name: 'Unrealized Budget',
    shortName: 'Leakage',
    icon: TrendingDown,
    category: 'financial',
    tags: ['waste', 'cost', 'recoverable'],
    definition: 'Benefits budget that is allocated but remains unused by employees.',
    formula: {
      display: 'Entitled Value - Claimed Amount',
      components: [
        { name: 'Entitled Value', source: 'SUM(benefit_entitlements.annual_allowance)' },
        { name: 'Claimed Amount', source: 'SUM(requests.amount) WHERE status IN (approved, paid)' },
      ],
    },
    interpretation: {
      good: '< 15%: Healthy utilization',
      warning: '15-30%: Notable waste',
      bad: '> 30%: Significant budget at risk',
    },
    pitfalls: [
      'Assuming all unused budget is waste',
      'Measuring mid-year before annual benefits utilized',
    ],
    usedIn: [
      { page: 'Recoverable Spend', path: '/employer/optimization' },
      { page: 'Executive Dashboard', path: '/employer' },
    ],
  },
  {
    id: 'sla-compliance',
    name: 'SLA Compliance Rate',
    shortName: 'SLA',
    icon: Clock,
    category: 'operational',
    tags: ['operations', 'claims', 'service'],
    definition: 'The percentage of claims processed within the defined Service Level Agreement timeframes.',
    formula: {
      display: '(Claims Within SLA / Total Claims Processed) × 100',
      components: [
        { name: 'Claims Within SLA', source: 'COUNT(requests) WHERE reviewed_at <= sla_due_at' },
        { name: 'Total Claims', source: 'COUNT(requests) WHERE status IN (approved, rejected, paid)' },
      ],
    },
    interpretation: {
      good: '≥ 95%: Excellent execution',
      warning: '85-95%: Some delays',
      bad: '< 85%: Systemic issues',
    },
    pitfalls: [
      'Not accounting for business days',
      'Excluding rejected claims',
    ],
    benchmarks: { low: '< 85%', target: '95%', excellent: '≥ 99%' },
    usedIn: [
      { page: 'Claims & Approvals', path: '/employer/claims' },
    ],
  },
  {
    id: 'employee-satisfaction',
    name: 'Employee Satisfaction Score',
    shortName: 'ESAT',
    icon: Users,
    category: 'satisfaction',
    tags: ['engagement', 'feedback', 'experience'],
    definition: 'Average satisfaction rating from employee surveys regarding their benefits experience.',
    formula: {
      display: 'SUM(satisfaction_ratings.rating) / COUNT(responses)',
      components: [
        { name: 'Rating Sum', source: 'SUM(employee_satisfaction_ratings.rating)' },
        { name: 'Response Count', source: 'COUNT(employee_satisfaction_ratings)' },
      ],
    },
    interpretation: {
      good: '≥ 4.0/5.0: High satisfaction',
      warning: '3.0-4.0: Room for improvement',
      bad: '< 3.0: Significant dissatisfaction',
    },
    pitfalls: [
      'Low response rates',
      'Not segmenting by category',
    ],
    benchmarks: { low: '< 3.0', target: '4.0', excellent: '≥ 4.5' },
    usedIn: [
      { page: 'Executive Dashboard', path: '/employer' },
    ],
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Metrics', icon: Layers },
  { id: 'financial', label: 'Financial', icon: DollarSign },
  { id: 'utilization', label: 'Utilization', icon: Percent },
  { id: 'operational', label: 'Operational', icon: Activity },
  { id: 'satisfaction', label: 'Satisfaction', icon: Users },
];

function MetricCard({ metric, isExpanded, onToggle }: { metric: MetricDefinition; isExpanded: boolean; onToggle: () => void }) {
  const Icon = metric.icon;

  return (
    <Card className={cn("transition-all duration-200", isExpanded && "ring-2 ring-primary/20")}>
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
                  <CardDescription className="mt-1 line-clamp-2">{metric.definition}</CardDescription>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {metric.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              {metric.benchmarks && (
                <div className="text-right shrink-0">
                  <span className="text-muted-foreground text-sm">Target: </span>
                  <span className="font-semibold text-primary">
                    {typeof metric.benchmarks.target === 'number' ? `${metric.benchmarks.target}%` : metric.benchmarks.target}
                  </span>
                </div>
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-6">
            {/* Formula */}
            <div className="p-4 rounded-lg bg-muted/50 border">
              <h4 className="font-medium flex items-center gap-2 mb-3">
                <Calculator className="h-4 w-4 text-primary" />
                Formula
              </h4>
              <div className="p-3 bg-card rounded-lg border font-mono text-sm">
                {metric.formula.display}
              </div>
            </div>

            {/* Interpretation */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="text-xs font-medium text-success">Good</span>
                </div>
                <p className="text-xs">{metric.interpretation.good}</p>
              </div>
              <div className="p-3 rounded-lg bg-warning/5 border border-warning/20">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <span className="text-xs font-medium text-warning">Warning</span>
                </div>
                <p className="text-xs">{metric.interpretation.warning}</p>
              </div>
              <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                <div className="flex items-center gap-2 mb-1">
                  <XCircle className="h-4 w-4 text-destructive" />
                  <span className="text-xs font-medium text-destructive">Bad</span>
                </div>
                <p className="text-xs">{metric.interpretation.bad}</p>
              </div>
            </div>

            {/* Pitfalls */}
            <div>
              <h4 className="font-medium flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-warning" />
                Common Pitfalls
              </h4>
              <ul className="space-y-2">
                {metric.pitfalls.map((pitfall, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-warning">•</span>
                    <span>{pitfall}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Used In */}
            {metric.usedIn && metric.usedIn.length > 0 && (
              <div>
                <h4 className="font-medium flex items-center gap-2 mb-3">
                  <ExternalLink className="h-4 w-4 text-primary" />
                  Used In
                </h4>
                <div className="flex flex-wrap gap-2">
                  {metric.usedIn.map((usage, idx) => (
                    <Button key={idx} variant="outline" size="sm" asChild>
                      <Link to={usage.path}>
                        {usage.page}
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export function KnowledgeBaseTabContent() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedMetrics, setExpandedMetrics] = useState<Set<string>>(new Set());

  const filteredMetrics = useMemo(() => {
    return METRIC_DEFINITIONS.filter(m => {
      const matchesCategory = activeCategory === 'all' || m.category === activeCategory;
      const matchesSearch = !search || 
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.definition.toLowerCase().includes(search.toLowerCase()) ||
        m.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  const toggleMetric = (id: string) => {
    setExpandedMetrics(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Metric Definitions & Glossary</h2>
          <p className="text-sm text-muted-foreground">Understand how metrics are calculated and interpreted</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search metrics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          return (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory(cat.id)}
              className="gap-2"
            >
              <Icon className="h-4 w-4" />
              {cat.label}
            </Button>
          );
        })}
      </div>

      {/* Metrics List */}
      <div className="space-y-4">
        {filteredMetrics.map(metric => (
          <MetricCard
            key={metric.id}
            metric={metric}
            isExpanded={expandedMetrics.has(metric.id)}
            onToggle={() => toggleMetric(metric.id)}
          />
        ))}

        {filteredMetrics.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No metrics found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
