/**
 * Executive Dashboard
 * 
 * Structure: Trust Strip → KPI Row → Drivers → Actions → Narrative (collapsed)
 * 
 * 1. TRUST STRIP: Always-visible confidence + last sync + data sources
 * 2. KPI SCORECARD: At-a-glance metrics (4-6 KPIs with trends + tooltips)
 * 3. DRIVERS: Top spending categories and trends
 * 4. RANKED ACTIONS: Where to act (prioritized opportunities)
 * 5. NARRATIVE: Collapsed insights (max 3 bullets, expand to see)
 */

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  TrendingUp, 
  DollarSign, 
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Lightbulb,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ChartWrapper, CHART_EXPLANATIONS, AnimatedDonutChart, AnimatedLineChart } from '@/components/charts';
import { NarrativeInsights, generateUtilizationInsight, generateSpendInsight, generateZombieInsight, generateSatisfactionInsight } from './NarrativeInsights';
import { DataConfidenceBadge, useDataCoverageMetrics } from './DataConfidenceBadge';
import { PageConfidenceGate } from './PageConfidenceGate';
import { TrendComparison } from './TrendComparison';
import { 
  useExecutiveMetrics, 
  useUtilizationTrends, 
  useESATTrends,
  useSpendAllocation,
  useClaimMetrics,
} from '@/hooks/useEmployerDashboard';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { EmployerGlobalFiltersBar } from './EmployerGlobalFiltersBar';
import { DemoTip, DEMO_TIPS } from '@/components/demo';
import { MetricTooltip, KPIDrilldownSheet, KPIMetricData, TrustStrip } from '@/components/shared';
import { METRIC_DEFINITIONS } from '@/lib/metrics';
import { DEMO_FALLBACKS } from '@/lib/metrics/computations';

// New components
import { ExecKPIScorecard } from './ExecKPIScorecard';
import { TopDriversTable } from './TopDriversTable';
import { OpportunitiesRanking, generateOpportunities } from './OpportunitiesRanking';
import { ExecModeToggle } from './ExecModeToggle';
import { useExecMode } from './ExecModeContext';

export function ExecutiveDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [drilldownMetric, setDrilldownMetric] = useState<KPIMetricData | null>(null);
  const [isDrilldownOpen, setIsDrilldownOpen] = useState(false);
  const [narrativeOpen, setNarrativeOpen] = useState(false);
  const { isBoard, isCFO } = useExecMode();
  
  // Fetch data
  const { data: metrics, isLoading: metricsLoading } = useExecutiveMetrics();
  const { data: utilizationTrends } = useUtilizationTrends();
  const { data: esatTrends } = useESATTrends();
  const coverageMetrics = useDataCoverageMetrics();
  const { data: spendAllocation } = useSpendAllocation();
  const { data: claimMetrics } = useClaimMetrics();

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
      utilization: {
        key: 'utilization',
        name: 'Utilization Rate',
        value: metrics.utilizationRate,
        formattedValue: `${metrics.utilizationRate}%`,
        unit: 'percent',
        trend: { value: metrics.utilizationRate - 62, higherIsBetter: true, period: 'vs last quarter' },
        icon: TrendingUp,
        formula: METRIC_DEFINITIONS.utilizationRate?.formula || '(Claimed / Entitled) × 100',
        dataSource: 'benefit_entitlements + requests',
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

  // Generate top drivers
  const topDrivers = useMemo(() => {
    if (!spendAllocation) return [];
    const trendValues = [5.2, -2.1, 8.3, -1.5, 3.7];
    return spendAllocation.slice(0, 5).map((item, idx) => ({
      id: item.name.toLowerCase().replace(/\s+/g, '-'),
      name: item.name,
      value: item.amount || item.value * 50000, // Fallback calculation
      change: trendValues[idx % trendValues.length],
      changeLabel: 'vs last period',
    }));
  }, [spendAllocation]);

  // Generate opportunities
  const opportunities = useMemo(() => {
    if (!metrics) return [];
    return generateOpportunities({
      zombieSpend: metrics.zombieSpend,
      topUnderutilizedCategory: { name: 'Learning', unused: 130000 },
      lowUtilizationSegments: [{ name: 'Junior Staff', utilization: 52 }],
      highRejectionPolicy: { name: 'Learning', rejectionRate: 18 },
      pendingClaimsValue: 85000,
    });
  }, [metrics]);

  // Loading state
  if (metricsLoading || !metrics) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 bg-muted rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-40 bg-muted rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <PageConfidenceGate metrics={coverageMetrics} threshold={70}>
      <div className="space-y-6">
        {/* Demo Tip */}
        <DemoTip {...DEMO_TIPS.employerDashboard} variant="highlight" />
        
        {/* Hero Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold tracking-tight">
              Total Rewards Overview
            </h1>
            <p className="text-muted-foreground mt-1">Strategic C&B performance • FY 2024</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <ExecModeToggle />
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
                {metrics.utilizationRate >= metrics.targetUtilization ? 'On Track' : 'Needs Attention'}
              </span>
            </Badge>
          </div>
        </div>

        {/* 0. TRUST STRIP - Always Visible */}
        <Card className="border-dashed bg-muted/30">
          <CardContent className="py-3 px-4">
            <TrustStrip
              confidence={
                ((coverageMetrics.employeeCoverage + coverageMetrics.entitlementCoverage + coverageMetrics.policyCoverage + coverageMetrics.claimsCoverage) / 4) >= 85 
                  ? 'high' 
                  : ((coverageMetrics.employeeCoverage + coverageMetrics.entitlementCoverage) / 2) >= 60 
                    ? 'medium' 
                    : 'low'
              }
              lastSync={coverageMetrics.lastSyncTime}
              dataSources={['Oracle HCM', 'Benefits Platform', 'Claims System']}
            />
          </CardContent>
        </Card>

        {/* Global Filters */}
        <EmployerGlobalFiltersBar />

        {/* 1. KPI SCORECARD (Primary signal) */}
        <ExecKPIScorecard 
          metrics={metrics} 
          claimMetrics={claimMetrics}
          onKPIClick={openDrilldown}
          compact={isBoard}
        />

        {/* 2. ALLOCATION VIEW (Drivers) - CFO mode shows more */}
        <div className={cn(
          'grid gap-4',
          isCFO ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 lg:grid-cols-2'
        )}>
          {/* Spend by Life Area */}
          <ChartWrapper 
            title="Investment Allocation" 
            subtitle="Budget distribution by benefit category"
            formula="Category Spend / Total Spend × 100"
            dataSource="Finance"
            explanation={CHART_EXPLANATIONS.spendDistribution}
          >
            <AnimatedDonutChart 
              data={spendChartData} 
              height={220}
            />
          </ChartWrapper>

          {/* Top 5 Drivers */}
          <TopDriversTable 
            drivers={topDrivers}
            onDriverClick={(driver) => openDrilldown(driver.id)}
          />

          {/* Utilization Trend - CFO mode only */}
          {isCFO && (
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
                  <span className="text-3xl font-bold tabular-nums">{metrics.utilizationRate}%</span>
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
          )}
        </div>

        {/* CFO mode: ESAT Trend */}
        {isCFO && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                  <span className="text-3xl font-bold tabular-nums">{metrics.esatScore}%</span>
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

            {/* Value Recovery Opportunity */}
            <Card className="border-warning/20 bg-gradient-to-r from-card to-warning/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-warning/10">
                    <AlertTriangle className="w-6 h-6 text-warning" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-lg">Unrealized Value Opportunity</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      {formatCurrencyAED(metrics.zombieSpend)} in allocated benefits remain underutilized
                    </p>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Recovery Potential</p>
                        <p className="text-lg font-bold text-warning tabular-nums">{formatCurrencyAED(metrics.recoveryPotential)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Affected Categories</p>
                        <p className="text-lg font-bold tabular-nums">4 categories</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Est. Timeline</p>
                        <p className="text-lg font-bold">90 days</p>
                      </div>
                    </div>
                    <Link to="/employer/zombie" className="mt-4 inline-block">
                      <Button size="sm">
                        View Analysis
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 3. WHERE TO ACT (Opportunities) */}
        <OpportunitiesRanking opportunities={opportunities} />

        {/* 4. NARRATIVE INSIGHTS (Last - max 3 bullets) */}
        <NarrativeInsights
          insights={[
            generateUtilizationInsight(
              metrics.utilizationRate,
              utilizationTrends?.[utilizationTrends.length - 2]?.current || 62,
              metrics.targetUtilization
            ),
            generateZombieInsight(
              metrics.zombieSpend,
              metrics.recoveryPotential,
              'Housing Allowance'
            ),
            generateSatisfactionInsight(
              metrics.esatScore,
              esatTrends?.[esatTrends.length - 2]?.current || 79,
              metrics.esatBenchmark
            ),
          ].slice(0, 3)}
          coverageMetrics={coverageMetrics}
          title="Key Insights"
          subtitle="AI-generated analysis • cite metric reference and confidence"
          onCreateRecommendation={(insight) => {
            window.location.href = `/employer/recommendations?create=true&source=${insight.id}`;
          }}
        />

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
