/**
 * Executive Dashboard
 * 
 * CEO/CFO-grade landing page answering:
 * "Are we spending wisely? Where is waste? What are the top drivers? What decisions do I make now?"
 * 
 * Layout (top-to-bottom):
 * 1. Page header with toggles + Board Pack Export
 * 2. Executive Summary strip (one-line headline)
 * 3. Executive Highlights strip (confidence + freshness + sources)
 * 4. KPI row (exactly 4 cards)
 * 5. Two-column: "Where the money goes" + At-Risk Segments
 * 6. "Decisions & Actions" section
 */

import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Settings2,
} from 'lucide-react';
import { ChartWrapper, CHART_EXPLANATIONS, AnimatedDonutChart } from '@/components/charts';
import { DataConfidenceBadge, useDataCoverageMetrics } from './DataConfidenceBadge';
import { PageConfidenceGate } from './PageConfidenceGate';
import { 
  useExecutiveMetrics, 
  useSpendAllocation,
  useClaimMetrics,
} from '@/hooks/useEmployerDashboard';
import { useEmployerActions } from '@/hooks/useEmployerActions';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { KPIDrilldownSheet, KPIMetricData } from '@/components/shared';
import { addDays } from 'date-fns';

// New components
import { ExecModeToggle } from './ExecModeToggle';
import { useExecMode } from './ExecModeContext';
import { ExecHighlightsStrip, ConfidenceLevel } from './ExecHighlightsStrip';
import { ExecSummaryStrip } from './ExecSummaryStrip';
import { ExecKPICards } from './ExecKPICards';
import { InvestmentAllocationTable } from './InvestmentAllocationTable';
import { TopDriversList, DriverType } from './TopDriversList';
import { DecisionsActionsCard, ActionStatus } from './DecisionsActionsCard';
import { AtRiskSegmentsCard, AtRiskSegment } from './AtRiskSegmentsCard';
import { BoardPackExportButton } from './BoardPackExportButton';

export function ExecutiveDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [drilldownMetric, setDrilldownMetric] = useState<KPIMetricData | null>(null);
  const [isDrilldownOpen, setIsDrilldownOpen] = useState(false);
  const { isBoard, isCFO } = useExecMode();
  
  // Fetch data
  const { data: metrics, isLoading: metricsLoading } = useExecutiveMetrics();
  const coverageMetrics = useDataCoverageMetrics();
  const { data: spendAllocation } = useSpendAllocation();
  const { data: claimMetrics } = useClaimMetrics();
  const { filteredActions } = useEmployerActions();

  // Calculate confidence level
  const confidenceLevel: ConfidenceLevel = useMemo(() => {
    const avg = (coverageMetrics.employeeCoverage + 
                 coverageMetrics.entitlementCoverage + 
                 coverageMetrics.policyCoverage + 
                 coverageMetrics.claimsCoverage) / 4;
    if (avg >= 85) return 'high';
    if (avg >= 60) return 'medium';
    return 'low';
  }, [coverageMetrics]);

  // Prepare allocation table data
  const allocationTableData = useMemo(() => {
    if (!spendAllocation || !metrics) return [];
    const total = metrics.totalInvestment;
    // Demo utilization values per category
    const utilizationMap: Record<string, number> = {
      'Health': 85,
      'Housing': 78,
      'Education': 72,
      'Transport': 65,
      'Wellbeing': 58,
      'Learning': 50,
      'Other': 45,
    };
    return spendAllocation.map(item => ({
      category: item.name,
      amount: item.amount || item.value * 50000,
      percentOfTotal: total > 0 ? ((item.amount || item.value * 50000) / total) * 100 : 0,
      utilization: utilizationMap[item.name] || 60,
    }));
  }, [spendAllocation, metrics]);

  // Prepare chart data
  const spendChartData = spendAllocation?.map((s, i) => ({
    name: s.name,
    value: s.value,
    color: `hsl(var(--chart-${(i % 6) + 1}))`,
  })) || [];

  // Prepare top drivers
  const topDrivers = useMemo(() => {
    if (!spendAllocation) return [];
    const driverConfigs: Array<{ type: DriverType; delta: number }> = [
      { type: 'spend', delta: 12.5 },
      { type: 'waste', delta: -8.2 },
      { type: 'spend', delta: 5.3 },
      { type: 'segment', delta: -3.1 },
      { type: 'waste', delta: 15.7 },
    ];
    return spendAllocation.slice(0, 5).map((item, idx) => ({
      id: item.name.toLowerCase().replace(/\s+/g, '-'),
      name: item.name,
      value: item.amount || item.value * 50000,
      delta: driverConfigs[idx % driverConfigs.length].delta,
      type: driverConfigs[idx % driverConfigs.length].type,
    }));
  }, [spendAllocation]);

  // Prepare actions for the decisions card
  const upcomingActions = useMemo(() => {
    const thirtyDaysFromNow = addDays(new Date(), 30);
    return filteredActions
      .filter(a => !['completed', 'cancelled'].includes(a.status))
      .filter(a => !a.dueDate || a.dueDate <= thirtyDaysFromNow)
      .slice(0, 3)
      .map(a => ({
        id: a.id,
        title: a.title,
        expectedImpact: a.expectedImpact.costAvoidance || 0,
        owner: a.owner,
        status: a.status as ActionStatus,
      }));
  }, [filteredActions]);

  // At-risk segments data
  const atRiskSegments: AtRiskSegment[] = useMemo(() => [
    {
      id: 'grade-a',
      name: 'Grade A (Executives)',
      dimension: 'grade',
      headcount: 45,
      utilizationRate: 52,
      unusedEntitlement: 890000,
      retentionRisk: 'high',
      topDriver: 'Awareness Gap',
    },
    {
      id: 'dept-tech',
      name: 'Technology',
      dimension: 'department',
      headcount: 120,
      utilizationRate: 58,
      unusedEntitlement: 720000,
      retentionRisk: 'high',
      topDriver: 'Process Friction',
    },
    {
      id: 'tenure-new',
      name: 'New Joiners (<1 year)',
      dimension: 'joiner_cohort',
      headcount: 85,
      utilizationRate: 45,
      unusedEntitlement: 480000,
      retentionRisk: 'medium',
      topDriver: 'Eligibility Confusion',
    },
  ], []);

  // Priority actions count (P0 = critical, P1 = high priority)
  const priorityActionsCount = useMemo(() => 
    filteredActions.filter(a => 
      (a.priority === 'P0' || a.priority === 'P1') && 
      !['completed', 'cancelled'].includes(a.status)
    ).length,
  [filteredActions]);

  // Satisfaction score (from metrics or default)
  const satisfactionScore = metrics?.esatScore || 78;

  // Drilldown handlers
  const openDrilldown = (metricKey: string) => {
    // Create metric data for drilldown
    if (!metrics) return;
    const metricData: Record<string, KPIMetricData> = {
      totalInvestment: {
        key: 'totalInvestment',
        name: 'Total Investment',
        value: metrics.totalInvestment,
        formattedValue: formatCurrencyAED(metrics.totalInvestment),
        unit: 'currency',
        trend: { value: 8, higherIsBetter: true, period: 'vs last year' },
        formula: 'SUM(org_budgets.annual_budget) for current fiscal year',
        dataSource: 'org_budgets table',
      },
      utilizationRate: {
        key: 'utilizationRate',
        name: 'Utilization Rate',
        value: metrics.utilizationRate,
        formattedValue: `${metrics.utilizationRate}%`,
        unit: 'percent',
        trend: { value: 5.3, higherIsBetter: true, period: 'vs last quarter' },
        formula: '(Claimed Amount / Entitled Amount) × 100',
        dataSource: 'benefit_entitlements + requests',
      },
      unrealizedValue: {
        key: 'unrealizedValue',
        name: 'Unrealized Value',
        value: metrics.zombieSpend,
        formattedValue: formatCurrencyAED(metrics.zombieSpend),
        unit: 'currency',
        trend: { value: -12.4, higherIsBetter: false, period: 'vs last quarter' },
        formula: 'Total Entitled - Total Claimed (for cap-based benefits)',
        dataSource: 'benefit_entitlements',
      },
      satisfactionScore: {
        key: 'satisfactionScore',
        name: 'Employee Satisfaction',
        value: satisfactionScore,
        formattedValue: `${satisfactionScore}%`,
        unit: 'percent',
        trend: { value: 3.2, higherIsBetter: true, period: 'vs last month' },
        formula: '(Average Rating ÷ 5) × 100',
        dataSource: 'employee_satisfaction_ratings table',
      },
    };
    const metric = metricData[metricKey];
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

  // Loading state
  if (metricsLoading || !metrics) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 bg-muted rounded-xl" />
        <div className="h-12 bg-muted rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-muted rounded-xl" />)}
        </div>
      </div>
    );
  }

  // Calculate metrics
  const unrealizedValue = metrics.zombieSpend || (metrics.totalInvestment * (1 - metrics.utilizationRate / 100));
  const budgetAllocated = metrics.totalInvestment * 0.95; // Assume 5% variance for demo

  return (
    <PageConfidenceGate metrics={coverageMetrics} threshold={70}>
      <div className="space-y-6">
        {/* 1. PAGE HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold tracking-tight">
              Benefits Investment Summary
            </h1>
            <p className="text-muted-foreground mt-1">
              FY 2024 · 312 employees · AED 78.8K per head
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Export Button */}
            <BoardPackExportButton 
              metrics={{
                totalInvestment: metrics.totalInvestment,
                utilizationRate: metrics.utilizationRate,
                unrealizedValue,
                satisfactionScore,
                budgetVariance: metrics.totalInvestment - budgetAllocated,
              }}
            />
            
            {/* Summary/Detailed toggle */}
            <ExecModeToggle />
          </div>
        </div>

        {/* 2. DATA VERIFICATION (minimal line) */}
        <ExecHighlightsStrip
          confidence={confidenceLevel}
          lastSync={coverageMetrics.lastSyncTime}
          sourcesCount={3}
        />

        {/* 4. KPI ROW (exactly 4 cards) */}
        <ExecKPICards
          totalInvestment={metrics.totalInvestment}
          utilizationRate={metrics.utilizationRate}
          unrealizedValue={unrealizedValue}
          satisfactionScore={satisfactionScore}
          budgetAllocated={budgetAllocated}
          utilizationTarget={metrics.targetUtilization}
          satisfactionBenchmark={metrics.esatBenchmark || 80}
          onKPIClick={openDrilldown}
        />

        {/* 5. ACTIONS REQUIRED (moved up for CEO priority) */}
        <DecisionsActionsCard actions={upcomingActions} />

        {/* 6. WHERE THE MONEY GOES + AT-RISK SEGMENTS (2 columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Investment Allocation donut + table */}
          <div className="space-y-4">
            <ChartWrapper 
              title="Where Money Goes" 
              formula="Category Spend / Total Spend × 100"
              dataSource="Finance"
              explanation={CHART_EXPLANATIONS.spendDistribution}
            >
              <AnimatedDonutChart 
                data={spendChartData} 
                height={200}
                centerContent={
                  <div className="text-center">
                    <p className="text-lg font-bold">{formatCurrencyAED(metrics.totalInvestment, { abbreviate: true })}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                }
              />
            </ChartWrapper>
            
            {/* Allocation Table (hidden in Board mode for density) */}
            {!isBoard && (
              <InvestmentAllocationTable data={allocationTableData} />
            )}
          </div>

          {/* Right: At-Risk Segments (replaces Top Drivers in board mode) */}
          {isBoard ? (
            <AtRiskSegmentsCard segments={atRiskSegments} />
          ) : (
            <div className="space-y-4">
              <TopDriversList drivers={topDrivers} />
              <AtRiskSegmentsCard segments={atRiskSegments} />
            </div>
          )}
        </div>

        {/* KPI Drilldown Sheet */}
        <KPIDrilldownSheet
          open={isDrilldownOpen}
          onOpenChange={(open) => {
            if (!open) closeDrilldown();
          }}
          metric={drilldownMetric}
          relatedLinks={[
            { label: 'View Spend Analysis', href: '/employer/spend' },
            { label: 'View Unrealized Value', href: '/employer/zombie' },
            { label: 'View Segments', href: '/employer/segments' },
          ]}
        />
      </div>
    </PageConfidenceGate>
  );
}
