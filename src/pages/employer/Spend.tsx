/**
 * Investment Analysis Page (Spend & Utilization)
 * 
 * CEO/CFO-grade layout following leading practices:
 * 1. 4 Core KPIs (Budget vs Spend, Usage Rate, Unused Value, YoY Change)
 * 2. Spend vs Utilization Matrix Chart (visual diagnosis)
 * 3. Action Required link (drive decisions)
 * 
 * Uses unified metrics from executiveMetricsConstants for cross-page consistency.
 * 
 * @module Spend
 */

import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  ArrowRight,
  Layers,
  Building2,
  Users,
  Target,
  Download,
  Calendar,
  Lightbulb,
  TrendingUp,
} from 'lucide-react';
import { BudgetStackChart, BudgetStackCell } from '@/components/charts/BudgetStackChart';
import { formatCurrencyAED, formatPercent, formatInteger, cn } from '@/lib/utils';
import { calculateUtilization } from '@/lib/crossPortalContract';
import { 
  INVESTMENT_METRICS, 
  UTILIZATION_METRICS, 
  FRICTION_METRICS,
  ORG_BASELINE,
  CATEGORY_METRICS,
} from '@/lib/executiveMetricsConstants';
import { 
  EmployerGlobalFiltersBar, 
  DataConfidenceBadge, 
  PageConfidenceGate, 
  useDataCoverageMetrics, 
  ForecastWidget,
  CFOKPIGrid,
  SpendInsights,
  generateSpendInsights,
  SpendUtilizationMatrix,
  RejectionFrictionPanel,
} from '@/components/employer';
import type { CategoryBubble } from '@/components/employer';
import { DrillDownSheet, DrillDownSummaryGrid, PageLayout } from '@/components/shared';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// ============================================================================
// DERIVED DATA FROM CONSTANTS
// ============================================================================

const spendByBenefitType = Object.values(CATEGORY_METRICS).map((cat, idx) => ({
  id: cat.name.toLowerCase().replace(/\s+/g, '-'),
  name: cat.name,
  category: 'Benefits',
  spend: cat.claimed,
  budget: cat.budget,
  entitled: cat.entitled,
  employees: Math.round(ORG_BASELINE.employeeCount * (0.3 + idx * 0.1)),
  rejectionRate: FRICTION_METRICS.rejectionRate + (idx * 2),
  missingDocsRate: FRICTION_METRICS.missingDocsRate + (idx * 3),
}));

const forecastHistoricalData = [
  { month: 'Jan', entitled: INVESTMENT_METRICS.entitledValue, claimed: 450000, unused: INVESTMENT_METRICS.entitledValue - 450000 },
  { month: 'Feb', entitled: INVESTMENT_METRICS.entitledValue, claimed: 480000, unused: INVESTMENT_METRICS.entitledValue - 930000 },
  { month: 'Mar', entitled: INVESTMENT_METRICS.entitledValue, claimed: 520000, unused: INVESTMENT_METRICS.entitledValue - 1450000 },
  { month: 'Apr', entitled: INVESTMENT_METRICS.entitledValue, claimed: 490000, unused: INVESTMENT_METRICS.entitledValue - 1940000 },
  { month: 'May', entitled: INVESTMENT_METRICS.entitledValue, claimed: 510000, unused: INVESTMENT_METRICS.entitledValue - 2450000 },
  { month: 'Jun', entitled: INVESTMENT_METRICS.entitledValue, claimed: 530000, unused: INVESTMENT_METRICS.entitledValue - 2980000 },
  { month: 'Jul', entitled: INVESTMENT_METRICS.entitledValue, claimed: 545000, unused: INVESTMENT_METRICS.entitledValue - 3525000 },
  { month: 'Aug', entitled: INVESTMENT_METRICS.entitledValue, claimed: 520000, unused: INVESTMENT_METRICS.entitledValue - 4045000 },
];

const drilldownData = {
  housing: {
    byDepartment: [
      { name: 'Engineering', spend: 960000, entitled: 1080000, employees: 34 },
      { name: 'Sales', spend: 720000, entitled: 810000, employees: 25 },
      { name: 'Operations', spend: 480000, entitled: 540000, employees: 17 },
      { name: 'Marketing', spend: 240000, entitled: 270000, employees: 9 },
    ],
    byGrade: [
      { name: 'Senior', spend: 1200000, entitled: 1350000, employees: 25 },
      { name: 'Mid-Level', spend: 840000, entitled: 945000, employees: 35 },
      { name: 'Junior', spend: 360000, entitled: 405000, employees: 25 },
    ],
    bySegment: [
      { name: 'Expats - Family', spend: 1680000, entitled: 1890000, employees: 50 },
      { name: 'Expats - Single', spend: 480000, entitled: 540000, employees: 25 },
      { name: 'Local Hires', spend: 240000, entitled: 270000, employees: 10 },
    ],
  },
};

// ============================================================================
// DRILLDOWN COMPONENT
// ============================================================================

interface DrilldownSheetProps {
  isOpen: boolean;
  onClose: () => void;
  benefit: typeof spendByBenefitType[0] | null;
}

function BenefitDrilldownSheet({ isOpen, onClose, benefit }: DrilldownSheetProps) {
  const [drillLevel, setDrillLevel] = useState<'department' | 'grade' | 'segment'>('department');

  if (!benefit) return null;

  const data = drilldownData.housing;
  const currentData = drillLevel === 'department' 
    ? data.byDepartment 
    : drillLevel === 'grade' 
      ? data.byGrade 
      : data.bySegment;

  const utilization = calculateUtilization({
    allocated: benefit.entitled,
    utilized: benefit.spend,
  });

  const summaryItems = [
    { label: 'Entitled', value: formatCurrencyAED(benefit.entitled) },
    { label: 'Claimed', value: formatCurrencyAED(benefit.spend) },
    { label: 'Utilization', value: formatPercent(utilization.rate) },
  ];

  const levels = [
    { id: 'department', label: 'Department', icon: Building2 },
    { id: 'grade', label: 'Grade', icon: Target },
    { id: 'segment', label: 'Segment', icon: Users },
  ];

  return (
    <DrillDownSheet
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title={`${benefit.name} Spend Drilldown`}
      subtitle="Analyze spend distribution across organizational dimensions"
      icon={Layers}
      levels={levels}
      activeLevel={drillLevel}
      onLevelChange={(id) => setDrillLevel(id as 'department' | 'grade' | 'segment')}
      summary={<DrillDownSummaryGrid items={summaryItems} columns={3} />}
      size="lg"
      actions={{
        export: { label: 'Export CSV', onClick: () => toast.success('Export started') },
        primary: { label: 'View Recommendations', onClick: () => {} },
      }}
    >
      {/* Budget Stack Visualization */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-muted-foreground mb-3">Budget Allocation Overview</h4>
        <BudgetStackChart
          data={currentData.map(row => ({
            name: row.name,
            allocated: row.entitled,
            utilized: row.spend,
            runRateProjection: row.spend * 1.2, // Projected based on current run-rate
          }))}
          showRunRate={true}
          barHeight={28}
        />
      </div>

      {/* Detailed Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{drillLevel === 'department' ? 'Department' : drillLevel === 'grade' ? 'Grade' : 'Segment'}</TableHead>
            <TableHead className="text-right">Total Spend</TableHead>
            <TableHead className="text-right">Cost/Head</TableHead>
            <TableHead className="text-right">Employees</TableHead>
            <TableHead className="text-right w-[180px]">Budget Stack</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Sort by Total Spend (High to Low) */}
          {[...currentData]
            .sort((a, b) => b.spend - a.spend)
            .map((row) => {
              const costPerHead = row.employees > 0 ? row.spend / row.employees : 0;
              const runRateProjection = row.spend * 1.2; // 20% projected increase
              return (
                <TableRow key={row.name}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrencyAED(row.spend, { abbreviate: true })}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrencyAED(costPerHead, { abbreviate: true })}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatInteger(row.employees)}</TableCell>
                  <TableCell className="text-right">
                    <BudgetStackCell
                      allocated={row.entitled}
                      utilized={row.spend}
                      runRateProjection={runRateProjection}
                      width={100}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </DrillDownSheet>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function Spend() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedBenefit, setSelectedBenefit] = useState<typeof spendByBenefitType[0] | null>(null);
  const coverageMetrics = useDataCoverageMetrics();

  // Calculate totals
  const totals = useMemo(() => spendByBenefitType.reduce(
    (acc, b) => ({
      budget: acc.budget + b.budget,
      entitled: acc.entitled + b.entitled,
      spend: acc.spend + b.spend,
    }),
    { budget: 0, entitled: 0, spend: 0 }
  ), []);

  const overallUtilization = useMemo(() => calculateUtilization({
    allocated: totals.entitled,
    utilized: totals.spend,
  }), [totals]);

  // Find underutilized category
  const topUnderutilized = useMemo(() => {
    const sorted = [...spendByBenefitType].sort((a, b) => {
      const utilA = (a.spend / a.entitled) * 100;
      const utilB = (b.spend / b.entitled) * 100;
      return utilA - utilB;
    });
    const item = sorted[0];
    return {
      name: item.name,
      utilization: (item.spend / item.entitled) * 100,
      unused: item.entitled - item.spend,
    };
  }, []);

  // Generate insights (limited to 3 for executive view)
  const insights = useMemo(() => generateSpendInsights({
    overallUtilization: overallUtilization.rate,
    unusedEntitlement: overallUtilization.remaining,
    topUnderutilizedCategory: topUnderutilized,
    lowUtilizationSegments: [{ name: 'Junior', dimension: 'Grade', utilization: 52 }],
    highRejectionPolicy: { name: 'Learning', rejectionRate: 18 },
    yoySpendChange: 8.2,
  }).slice(0, 3), [overallUtilization, topUnderutilized]);

  // Generate matrix chart data
  const matrixData: CategoryBubble[] = useMemo(() => spendByBenefitType.map(b => ({
    id: b.id,
    name: b.name,
    spend: b.spend,
    entitled: b.entitled,
    utilization: (b.spend / b.entitled) * 100,
    topSegments: [
      { name: 'Engineering', spend: b.spend * 0.4, utilization: 75 },
      { name: 'Sales', spend: b.spend * 0.3, utilization: 68 },
      { name: 'Operations', spend: b.spend * 0.2, utilization: 55 },
    ],
    rejectionReasons: [
      { reason: 'Missing documentation', count: Math.round(b.rejectionRate * 0.4), percentage: b.rejectionRate * 0.4 },
      { reason: 'Exceeded limit', count: Math.round(b.rejectionRate * 0.35), percentage: b.rejectionRate * 0.35 },
      { reason: 'Policy mismatch', count: Math.round(b.rejectionRate * 0.25), percentage: b.rejectionRate * 0.25 },
    ],
    suggestedAction: `Review ${b.name} policy requirements and consider targeted employee communication to improve utilization.`,
  })), []);

  // Calculate friction metrics for panel
  const frictionMetrics = useMemo(() => {
    const avgRejectionRate = spendByBenefitType.reduce((sum, b) => sum + b.rejectionRate, 0) / spendByBenefitType.length;
    const avgMissingDocsRate = spendByBenefitType.reduce((sum, b) => sum + b.missingDocsRate, 0) / spendByBenefitType.length;
    return {
      rejectionRate: avgRejectionRate,
      missingDocsRate: avgMissingDocsRate,
      medianApprovalDays: 2.8,
    };
  }, []);

  return (
    <PageConfidenceGate metrics={coverageMetrics} threshold={70}>
      <PageLayout
        title="Investment Analysis"
        description={`FY ${ORG_BASELINE.fiscalYear} · ${formatInteger(ORG_BASELINE.employeeCount)} employees · AED ${(INVESTMENT_METRICS.costPerEmployee / 1000).toFixed(1)}K per head`}
        icon={DollarSign}
        iconClassName="bg-primary/10 text-primary"
        confidenceBadge={<DataConfidenceBadge metrics={coverageMetrics} />}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              YTD {ORG_BASELINE.fiscalYear}
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        }
        filters={<EmployerGlobalFiltersBar />}
      >
        {/* 1. CFO KPI GRID - 4 Core Metrics First */}
        <CFOKPIGrid
          metrics={{
            allocatedBudget: INVESTMENT_METRICS.allocatedBudget,
            actualSpend: INVESTMENT_METRICS.actualSpend,
            utilizationRate: UTILIZATION_METRICS.utilizationRate,
            targetUtilization: INVESTMENT_METRICS.targetUtilization,
            unusedValue: UTILIZATION_METRICS.unrealizedValue,
            yoyChange: INVESTMENT_METRICS.yoyChange,
          }}
          onKPIClick={(kpiId) => toast.info(`Opening ${kpiId} drilldown...`)}
        />

        {/* 2. SPEND VS UTILIZATION MATRIX + FRICTION PANEL */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <SpendUtilizationMatrix
              data={matrixData}
              isDemo={true}
              onCategoryClick={(category) => {
                // Find matching benefit for drilldown
                const benefit = spendByBenefitType.find(b => b.id === category.id);
                if (benefit) {
                  setSelectedBenefit(benefit);
                }
              }}
            />
          </div>
          <div className="lg:col-span-1">
            <RejectionFrictionPanel
              rejectionRate={frictionMetrics.rejectionRate}
              missingDocsRate={frictionMetrics.missingDocsRate}
              medianApprovalDays={frictionMetrics.medianApprovalDays}
              isDemo={true}
            />
          </div>
        </div>

        {/* 3. ACTION REQUIRED - Link to Optimization */}
        <Card className="border-warning/30 bg-gradient-to-r from-warning/5 via-warning/3 to-transparent">
          <CardContent className="py-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-warning/10">
                  <Lightbulb className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="font-semibold text-base">
                    {formatCurrencyAED(UTILIZATION_METRICS.unrealizedValue, { abbreviate: true })} opportunity to recapture
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    View root causes and recovery actions
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => window.location.href = '/employer/zombie'}
                className="gap-2"
              >
                View Opportunities
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 4. FORECAST WIDGET - Optional secondary info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ForecastWidget
            historicalData={forecastHistoricalData}
            totalEntitled={totals.entitled}
            currentClaimed={totals.spend}
            fiscalYearEnd="December 31"
            onViewDetails={() => toast.info('Opening forecast breakdown...')}
            onCreateAction={() => window.location.href = '/employer/recommendations?create=true&source=forecast'}
          />

          {/* Key Insights - Limited to 3 */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Key Insights
                </CardTitle>
                <Badge variant="outline" className="text-xs">Top 3</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights.map((insight, idx) => (
                <div 
                  key={insight.id || idx} 
                  className={cn(
                    "p-3 rounded-lg border",
                    insight.icon === 'alert' || insight.icon === 'ghost' ? 'border-warning/30 bg-warning/5' :
                    insight.icon === 'trend-down' ? 'border-destructive/30 bg-destructive/5' :
                    'border-border bg-muted/30'
                  )}
                >
                  <p className="text-sm font-medium">{insight.signal}</p>
                  <p className="text-xs text-muted-foreground mt-1">{insight.metric}</p>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="h-auto p-0 mt-2 text-xs"
                    onClick={() => window.location.href = `/employer/recommendations${insight.actionParams ? '?' + new URLSearchParams(insight.actionParams).toString() : ''}`}
                  >
                    {insight.actionLabel} →
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Drilldown Sheet */}
        <BenefitDrilldownSheet
          isOpen={!!selectedBenefit}
          onClose={() => setSelectedBenefit(null)}
          benefit={selectedBenefit}
        />
      </PageLayout>
    </PageConfidenceGate>
  );
}

export default Spend;
