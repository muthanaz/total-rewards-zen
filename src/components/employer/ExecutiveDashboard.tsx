/**
 * Executive Dashboard
 * 
 * CEO/CFO-grade landing page answering:
 * "Are we spending wisely? Where is waste? What are the top drivers? What decisions do I make now?"
 * 
 * Layout (top-to-bottom):
 * 1. Page header with toggles
 * 2. Executive Highlights strip (confidence + freshness + sources)
 * 3. KPI row (exactly 4 cards)
 * 4. "Where the money goes" section (allocation + drivers)
 * 5. "Decisions & Actions" section
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
import { DemoTip, DEMO_TIPS } from '@/components/demo';
import { KPIDrilldownSheet, KPIMetricData } from '@/components/shared';
import { addDays } from 'date-fns';

// New components
import { ExecModeToggle } from './ExecModeToggle';
import { useExecMode } from './ExecModeContext';
import { ExecHighlightsStrip, ConfidenceLevel } from './ExecHighlightsStrip';
import { ExecKPICards } from './ExecKPICards';
import { InvestmentAllocationTable } from './InvestmentAllocationTable';
import { TopDriversList, DriverType } from './TopDriversList';
import { DecisionsActionsCard, ActionStatus } from './DecisionsActionsCard';

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
      slaCompliance: {
        key: 'slaCompliance',
        name: 'SLA Compliance',
        value: claimMetrics?.slaCompliance || 94,
        formattedValue: `${claimMetrics?.slaCompliance || 94}%`,
        unit: 'percent',
        trend: { value: 2.1, higherIsBetter: true, period: 'vs last month' },
        formula: '(Claims processed within SLA / Total claims) × 100',
        dataSource: 'requests table',
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
  const slaCompliance = claimMetrics?.slaCompliance || 94;

  return (
    <PageConfidenceGate metrics={coverageMetrics} threshold={70}>
      <div className="space-y-6">
        {/* Demo Tip */}
        <DemoTip {...DEMO_TIPS.employerDashboard} variant="highlight" />
        
        {/* 1. PAGE HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold tracking-tight">
              Total Rewards Overview
            </h1>
            <p className="text-muted-foreground mt-1">
              Strategic total rewards performance — FY 2024
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Board-ready toggle */}
            <ExecModeToggle />
            
            {/* CFO Detail toggle (via ExecModeToggle) */}
            
            {/* Needs Attention pill */}
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

        {/* 2. EXECUTIVE HIGHLIGHTS STRIP */}
        <ExecHighlightsStrip
          confidence={confidenceLevel}
          lastSync={coverageMetrics.lastSyncTime}
          sourcesCount={3}
        />

        {/* 3. KPI ROW (exactly 4 cards) */}
        <ExecKPICards
          totalInvestment={metrics.totalInvestment}
          utilizationRate={metrics.utilizationRate}
          unrealizedValue={unrealizedValue}
          slaCompliance={slaCompliance}
          onKPIClick={openDrilldown}
        />

        {/* 4. WHERE THE MONEY GOES (2 columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Investment Allocation donut + table */}
          <div className="space-y-4">
            <ChartWrapper 
              title="Investment Allocation" 
              subtitle="Budget distribution by benefit category"
              formula="Category Spend / Total Spend × 100"
              dataSource="Finance"
              explanation={CHART_EXPLANATIONS.spendDistribution}
            >
              <AnimatedDonutChart 
                data={spendChartData} 
                height={200}
              />
            </ChartWrapper>
            
            {/* Allocation Table (hidden in Board mode for density) */}
            {!isBoard && (
              <InvestmentAllocationTable data={allocationTableData} />
            )}
          </div>

          {/* Right: Top 5 Drivers */}
          <TopDriversList drivers={topDrivers} />
        </div>

        {/* 5. DECISIONS & ACTIONS (Next 30 days) */}
        <DecisionsActionsCard actions={upcomingActions} />

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
