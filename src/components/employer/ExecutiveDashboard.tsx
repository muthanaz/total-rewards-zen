import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Target, 
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Zap,
  Heart,
  UserMinus,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ChartWrapper, CHART_EXPLANATIONS, AnimatedDonutChart, AnimatedLineChart } from '@/components/charts';
import { NarrativeInsights, generateUtilizationInsight, generateSpendInsight, generateZombieInsight, generateSatisfactionInsight, NarrativeInsight } from './NarrativeInsights';
import { DataQualityBadge, DataConfidenceIndicator } from './DataQualityBadge';
import { DataConfidenceBadge, useDataCoverageMetrics } from './DataConfidenceBadge';
import { PageConfidenceGate } from './PageConfidenceGate';
import { PeriodSelector, PeriodType, formatPeriodLabel } from './PeriodSelector';
import { TrendComparison, TrendIndicatorCompact } from './TrendComparison';
import { 
  useExecutiveMetrics, 
  useUtilizationTrends, 
  useESATTrends,
  useStrategicPriorities,
  useSpendAllocation,
} from '@/hooks/useEmployerDashboard';
import { cn, formatCurrencyAED, formatPercent } from '@/lib/utils';
import { EmployerGlobalFiltersBar } from './EmployerGlobalFiltersBar';
import { DemoTip, DEMO_TIPS } from '@/components/demo';
import { MetricTooltip, ConfidenceBadge, MetricDefinitionsDrawer, KPIDrilldownSheet, KPIMetricData } from '@/components/shared';
import { computeCostPerEmployee, computeUtilizationRate, computeROI, METRIC_DEFINITIONS } from '@/lib/metrics';

const priorityColors = {
  critical: {
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    borderColor: 'border-destructive/20',
  },
  high: {
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/20',
  },
  medium: {
    color: 'text-info',
    bgColor: 'bg-info/10',
    borderColor: 'border-info/20',
  },
  monitor: {
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/20',
  },
};

export function ExecutiveDashboard() {
  const [period, setPeriod] = useState<PeriodType>('YTD');
  const [searchParams, setSearchParams] = useSearchParams();
  const [drilldownMetric, setDrilldownMetric] = useState<KPIMetricData | null>(null);
  const [isDrilldownOpen, setIsDrilldownOpen] = useState(false);
  
  // Fetch real data
  const { data: metrics, isLoading: metricsLoading } = useExecutiveMetrics();
  const { data: utilizationTrends } = useUtilizationTrends();
  const { data: esatTrends } = useESATTrends();
  const { data: priorities } = useStrategicPriorities(metrics);
  const coverageMetrics = useDataCoverageMetrics();
  const { data: spendAllocation } = useSpendAllocation();

  // KPI definitions for drilldown
  const kpiMetrics = useMemo<Record<string, KPIMetricData>>(() => {
    if (!metrics) return {};
    return {
      totalInvestment: {
        key: 'totalInvestment',
        name: 'Total Investment',
        value: metrics.totalInvestment,
        formattedValue: formatCurrencyAED(metrics.totalInvestment),
        unit: 'currency',
        trend: { value: 8, higherIsBetter: true, period: 'vs last year' },
        icon: DollarSign,
        formula: 'SUM(org_budgets.annual_budget) for current fiscal year',
        dataSource: 'org_budgets table',
      },
      costPerEmployee: {
        key: 'costPerEmployee',
        name: 'Cost per Employee',
        value: metrics.costPerEmployee,
        formattedValue: formatCurrencyAED(metrics.costPerEmployee),
        unit: 'currency',
        trend: { value: -3.2, higherIsBetter: false, period: 'vs industry' },
        icon: Users,
        formula: METRIC_DEFINITIONS.costPerEmployee.formula,
        dataSource: METRIC_DEFINITIONS.costPerEmployee.dataSource,
      },
      roi: {
        key: 'roi',
        name: 'Benefits ROI',
        value: metrics.roi,
        formattedValue: `${metrics.roi}x`,
        unit: 'number',
        trend: { value: 14.3, higherIsBetter: true, period: 'vs last year' },
        icon: TrendingUp,
        formula: METRIC_DEFINITIONS.roi?.formula || 'Benefits Value / Total Investment',
        dataSource: 'Calculated from utilization and satisfaction data',
      },
      esatScore: {
        key: 'esatScore',
        name: 'Employee Satisfaction',
        value: metrics.esatScore,
        formattedValue: `${metrics.esatScore}%`,
        unit: 'percent',
        trend: { value: metrics.esatTrend, higherIsBetter: true, period: 'MoM' },
        icon: Heart,
        formula: METRIC_DEFINITIONS.satisfactionScore?.formula || 'Weighted average of satisfaction ratings',
        dataSource: 'employee_satisfaction_ratings table',
      },
      retentionRate: {
        key: 'retentionRate',
        name: 'Retention Rate',
        value: metrics.retentionRate,
        formattedValue: `${metrics.retentionRate}%`,
        unit: 'percent',
        trend: { value: metrics.retentionRate - metrics.retentionBenchmark, higherIsBetter: true, period: 'vs market' },
        icon: Target,
        formula: METRIC_DEFINITIONS.retentionRate?.formula || '(Retained Employees / Start Period Employees) × 100',
        dataSource: 'profiles table (employment_date)',
      },
    };
  }, [metrics]);

  // Handle deep linking for drilldowns
  useEffect(() => {
    const drilldownKey = searchParams.get('drilldown');
    if (drilldownKey && kpiMetrics[drilldownKey] && !isDrilldownOpen) {
      setDrilldownMetric(kpiMetrics[drilldownKey]);
      setIsDrilldownOpen(true);
    }
  }, [searchParams, kpiMetrics, isDrilldownOpen]);

  const openDrilldown = (metricKey: string) => {
    const metric = kpiMetrics[metricKey];
    if (metric) {
      setDrilldownMetric(metric);
      setIsDrilldownOpen(true);
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.set('drilldown', metricKey);
        return next;
      });
    }
  };

  const closeDrilldown = () => {
    setIsDrilldownOpen(false);
    setDrilldownMetric(null);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.delete('drilldown');
      return next;
    });
  };

  // Use centralized formatting utilities
  const formatCurrency = (value: number) => formatCurrencyAED(value);
  const formatK = (value: number) => formatCurrencyAED(value);

  // Prepare chart data
  const utilizationChartData = utilizationTrends?.map(t => ({
    name: t.period,
    value: t.current,
    target: t.target,
  })) || [];

  const esatChartData = esatTrends?.map(t => ({
    name: t.period,
    value: t.current,
  })) || [];

  const spendChartData = spendAllocation?.map((s, i) => ({
    name: s.name,
    value: s.value,
    color: `hsl(var(--chart-${(i % 6) + 1}))`,
  })) || [];

  if (metricsLoading || !metrics) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 bg-muted rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-muted rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <PageConfidenceGate metrics={coverageMetrics} threshold={70}>
    <div className="space-y-6">
      {/* Demo Tip */}
      <DemoTip {...DEMO_TIPS.employerDashboard} variant="highlight" />
      
      {/* Hero Header with Health Badge */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold tracking-tight">
            Total Rewards Overview
          </h1>
          <p className="text-muted-foreground mt-1">Strategic C&B performance • FY 2024</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <DataConfidenceBadge metrics={coverageMetrics} />
          <Badge variant="outline" className={cn(
            "gap-1.5 px-3 py-1.5",
            metrics.utilizationRate >= metrics.targetUtilization 
              ? "bg-success/10 text-success border-success/30" 
              : "bg-warning/10 text-warning border-warning/30"
          )}>
            {metrics.utilizationRate >= metrics.targetUtilization ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            <span className="font-medium">
              {metrics.utilizationRate >= metrics.targetUtilization ? 'Program On Track' : 'Needs Attention'}
            </span>
          </Badge>
        </div>
      </div>

      {/* Global Filters */}
      <EmployerGlobalFiltersBar />

      {/* Narrative Insights - Decision Support */}
      <NarrativeInsights
        insights={[
          generateUtilizationInsight(
            metrics.utilizationRate,
            utilizationTrends?.[utilizationTrends.length - 2]?.current || 62,
            metrics.targetUtilization
          ),
          generateSatisfactionInsight(
            metrics.esatScore,
            esatTrends?.[esatTrends.length - 2]?.current || 79,
            metrics.esatBenchmark
          ),
          generateZombieInsight(
            metrics.zombieSpend,
            metrics.recoveryPotential,
            'Housing Allowance'
          ),
          generateSpendInsight(
            metrics.budgetUtilized,
            (metrics.budgetUtilized / metrics.totalInvestment) * 100,
            'Health & Insurance'
          ),
        ]}
        coverageMetrics={coverageMetrics}
        title="Key Insights"
        subtitle="AI-generated analysis based on your current data"
        onCreateRecommendation={(insight) => {
          // Navigate to recommendations with pre-filled data
          window.location.href = `/employer/recommendations?create=true&source=${insight.id}`;
        }}
      />

      {/* Strategic KPIs - C-Suite Focus with Enhanced Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Investment */}
        <Card 
          className="border-border/50 bg-gradient-to-br from-card to-primary/5 cursor-pointer hover:shadow-md hover:border-accent/30 transition-all"
          onClick={() => openDrilldown('totalInvestment')}
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <DataConfidenceIndicator confidence={metrics.dataConfidence} />
            </div>
            <p className="text-2xl lg:text-3xl font-bold tracking-tight">{formatCurrency(metrics.totalInvestment)}</p>
            <p className="text-sm text-muted-foreground mt-1">Total Investment</p>
            <div className="mt-3 pt-3 border-t border-border/50">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">YTD Spend</span>
                <span className="font-medium">{formatCurrency(metrics.budgetUtilized)}</span>
              </div>
              <Progress value={metrics.utilizationRate} className="h-1.5 mt-2" />
            </div>
          </CardContent>
        </Card>

        {/* Cost per Employee with Dual Benchmark */}
        <Card 
          className="border-border/50 bg-gradient-to-br from-card to-chart-2/5 cursor-pointer hover:shadow-md hover:border-accent/30 transition-all"
          onClick={() => openDrilldown('costPerEmployee')}
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-chart-2/10">
                <Users className="w-5 h-5 text-chart-2" />
              </div>
              <MetricTooltip metricKey="costPerEmployee" />
            </div>
            <p className="text-2xl lg:text-3xl font-bold tracking-tight">{formatK(metrics.costPerEmployee)}</p>
            <p className="text-sm text-muted-foreground mt-1">Cost per Employee</p>
            <div className="mt-3 pt-3 border-t border-border/50 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Industry</span>
                <span className={cn(
                  "font-medium",
                  metrics.costPerEmployee <= metrics.industryBenchmark ? "text-success" : "text-warning"
                )}>{formatK(metrics.industryBenchmark)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Peer Group</span>
                <span className="font-medium">{formatK(metrics.peerBenchmark)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ROI */}
        <Card 
          className="border-border/50 bg-gradient-to-br from-card to-success/5 cursor-pointer hover:shadow-md hover:border-accent/30 transition-all"
          onClick={() => openDrilldown('roi')}
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-success/10">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <TrendIndicatorCompact change={14.3} higherIsBetter={true} />
            </div>
            <p className="text-2xl lg:text-3xl font-bold tracking-tight text-success">{metrics.roi}x</p>
            <p className="text-sm text-muted-foreground mt-1">Benefits ROI</p>
            <div className="mt-3 pt-3 border-t border-border/50">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Benchmark</span>
                <span className="font-medium">{metrics.roiBenchmark}x</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ESAT Score */}
        <Card 
          className="border-border/50 bg-gradient-to-br from-card to-chart-5/5 cursor-pointer hover:shadow-md hover:border-accent/30 transition-all"
          onClick={() => openDrilldown('esatScore')}
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-chart-5/10">
                <Heart className="w-5 h-5 text-chart-5" />
              </div>
              <TrendIndicatorCompact change={metrics.esatTrend} higherIsBetter={true} label="MoM" />
            </div>
            <p className="text-2xl lg:text-3xl font-bold tracking-tight text-chart-5">{metrics.esatScore}%</p>
            <p className="text-sm text-muted-foreground mt-1">Employee Satisfaction</p>
            <div className="mt-3 pt-3 border-t border-border/50">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Market Benchmark</span>
                <span className={cn(
                  "font-medium",
                  metrics.esatScore >= metrics.esatBenchmark ? "text-success" : "text-warning"
                )}>{metrics.esatBenchmark}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Retention with Turnover */}
        <Card 
          className="border-border/50 bg-gradient-to-br from-card to-chart-3/5 cursor-pointer hover:shadow-md hover:border-accent/30 transition-all"
          onClick={() => openDrilldown('retentionRate')}
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-chart-3/10">
                <Target className="w-5 h-5 text-chart-3" />
              </div>
              <Badge variant="outline" className="bg-success/10 text-success border-0 text-[10px]">
                +{metrics.retentionRate - metrics.retentionBenchmark}% vs Market
              </Badge>
            </div>
            <p className="text-2xl lg:text-3xl font-bold tracking-tight text-chart-3">{metrics.retentionRate}%</p>
            <p className="text-sm text-muted-foreground mt-1">Retention Rate</p>
            <div className="mt-3 pt-3 border-t border-border/50 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Turnover Rate</span>
                <span className={cn(
                  "font-medium",
                  metrics.turnoverRate <= metrics.turnoverBenchmark ? "text-success" : "text-warning"
                )}>{metrics.turnoverRate}%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Market Avg</span>
                <span className="font-medium">{metrics.turnoverBenchmark}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strategic Priorities - Action-Oriented */}
      {priorities && priorities.length > 0 && (
        <Card className="border-primary/20 bg-gradient-to-r from-card via-card to-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg font-display">Strategic Priorities</CardTitle>
              </div>
              <span className="text-xs text-muted-foreground">{formatPeriodLabel(period)}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {priorities.map((priority) => {
                const colors = priorityColors[priority.priority];
                return (
                  <Link key={priority.id} to={priority.path}>
                    <div className={cn(
                      "p-4 rounded-xl border transition-all cursor-pointer hover:scale-[1.02]",
                      colors.borderColor,
                      colors.bgColor
                    )}>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className={cn(
                          "border-0 text-xs font-semibold capitalize",
                          colors.color,
                          colors.bgColor
                        )}>
                          {priority.priority}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">{priority.owner}</span>
                      </div>
                      <h3 className="font-semibold mb-1">{priority.title}</h3>
                      <p className={cn("text-lg font-bold", colors.color)}>{priority.metric}</p>
                      <p className="text-xs text-muted-foreground mt-1">{priority.impact}</p>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
                        <div className="flex items-center gap-1 text-xs text-success">
                          <Sparkles className="w-3 h-3" />
                          <span>{priority.expectedImpact}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-medium text-primary">
                          {priority.action}
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Visual Analytics Row - Enhanced with Dual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Utilization Trend */}
        <ChartWrapper 
          title="Utilization Trend" 
          subtitle="Quarterly benefit utilization rate"
          formula="(Claimed Amount / Entitled Amount) × 100"
          dataSource="Benefits Platform"
          explanation={CHART_EXPLANATIONS.utilizationTrend}
          timeRange="Last 6 months"
          confidenceMetrics={coverageMetrics}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold">{metrics.utilizationRate}%</span>
              <TrendComparison 
                current={metrics.utilizationRate} 
                previous={utilizationTrends?.[utilizationTrends.length - 2]?.current || 62}
                higherIsBetter={true}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Target: {metrics.targetUtilization}%
            </div>
          </div>
          <AnimatedLineChart 
            data={utilizationChartData} 
            showArea={true} 
            primaryLabel="Utilization" 
            formatValue={(v) => `${v}%`} 
            height={160}
            yDomain={[50, 80]}
          />
        </ChartWrapper>

        {/* ESAT Trend */}
        <ChartWrapper 
          title="Employee Satisfaction Trend" 
          subtitle="Monthly ESAT score"
          formula="(Sum of ratings / Total responses) × 20"
          dataSource="Survey Data"
          explanation={CHART_EXPLANATIONS.satisfactionScore}
          timeRange="Last 6 months"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold">{metrics.esatScore}%</span>
              <TrendComparison 
                current={metrics.esatScore} 
                previous={esatTrends?.[esatTrends.length - 2]?.current || 79}
                higherIsBetter={true}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Benchmark: {metrics.esatBenchmark}%
            </div>
          </div>
          <AnimatedLineChart 
            data={esatChartData} 
            showArea={true} 
            primaryLabel="ESAT" 
            formatValue={(v) => `${v}%`} 
            height={160}
            yDomain={[60, 100]}
          />
        </ChartWrapper>

        {/* Spend Allocation */}
        <ChartWrapper 
          title="Investment Allocation" 
          subtitle="Budget distribution by category"
          formula="Category Spend / Total Spend × 100"
          dataSource="Finance"
          explanation={CHART_EXPLANATIONS.spendDistribution}
        >
          <AnimatedDonutChart 
            data={spendChartData} 
            height={220}
          />
        </ChartWrapper>
      </div>

      {/* Value Recovery Opportunity */}
      <Card className="border-warning/20 bg-gradient-to-r from-card to-warning/5">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-warning/10">
                <AlertTriangle className="w-6 h-6 text-warning" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg">Unrealized Value Opportunity</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  {formatCurrency(metrics.zombieSpend)} in allocated benefits remain underutilized
                </p>
                <div className="flex items-center gap-6 mt-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Recovery Potential</p>
                    <p className="text-xl font-bold text-warning">{formatCurrency(metrics.recoveryPotential)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Affected Categories</p>
                    <p className="text-xl font-bold">4 categories</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Est. Timeline</p>
                    <p className="text-xl font-bold">90 days</p>
                  </div>
                </div>
              </div>
            </div>
            <Link to="/employer/zombie">
              <Button className="shrink-0">
                View Analysis
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      {/* KPI Drilldown Sheet */}
      <KPIDrilldownSheet
        open={isDrilldownOpen}
        onOpenChange={(open) => {
          if (!open) closeDrilldown();
        }}
        metric={drilldownMetric}
        relatedLinks={[
          { label: 'View Spend Analysis', href: '/employer/spend' },
          { label: 'View Recommendations', href: '/employer/recommendations' },
          { label: 'View Segments', href: '/employer/segments' },
        ]}
      />
    </div>
    </PageConfidenceGate>
  );
}
