/**
 * Investment Analysis Page (Spend & Utilization)
 * 
 * CEO/CFO-grade layout following leading practices:
 * 1. 4 Core KPIs (Budget vs Spend, Usage Rate, Unused Value, YoY Change)
 * 2. Spend vs Utilization Matrix Chart (visual diagnosis)
 * 3. Action Required link (drive decisions)
 * 
 * Removed for executive clarity:
 * - Definitions Card (analyst-level detail)
 * - Breakdown Tabs (clutter reduction)
 * - Waterfall Chart (matrix is more actionable)
 * 
 * @module Spend
 */

import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Progress } from '@/components/ui/progress';
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
import { formatCurrencyAED, formatPercent, formatInteger, cn } from '@/lib/utils';
import { calculateUtilization } from '@/lib/crossPortalContract';
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
// MOCK DATA (would come from hooks in production)
// ============================================================================

const spendByBenefitType = [
  { id: 'housing', name: 'Housing', category: 'Cash Allowances', spend: 2400000, budget: 2800000, entitled: 2700000, employees: 85, faqViews: 25, claimVelocity: 8, awarenessScore: 85, rejectionRate: 5, missingDocsRate: 8 },
  { id: 'schooling', name: 'Schooling', category: 'Cash Allowances', spend: 1200000, budget: 1500000, entitled: 1400000, employees: 45, faqViews: 35, claimVelocity: 4, awarenessScore: 70, rejectionRate: 12, missingDocsRate: 18 },
  { id: 'health', name: 'Health', category: 'Insurance', spend: 800000, budget: 900000, entitled: 850000, employees: 130, faqViews: 40, claimVelocity: 6, awarenessScore: 75, rejectionRate: 8, missingDocsRate: 12 },
  { id: 'transport', name: 'Transport', category: 'Cash Allowances', spend: 400000, budget: 500000, entitled: 480000, employees: 90, faqViews: 20, claimVelocity: 5, awarenessScore: 60, rejectionRate: 6, missingDocsRate: 10 },
  { id: 'learning', name: 'Learning', category: 'Reimbursement', spend: 150000, budget: 300000, entitled: 280000, employees: 60, faqViews: 95, claimVelocity: 2, awarenessScore: 35, rejectionRate: 22, missingDocsRate: 28 },
  { id: 'wellbeing', name: 'Wellbeing', category: 'Reimbursement', spend: 80000, budget: 150000, entitled: 140000, employees: 50, faqViews: 78, claimVelocity: 1.5, awarenessScore: 30, rejectionRate: 18, missingDocsRate: 25 },
];

const forecastHistoricalData = [
  { month: 'Jan', entitled: 6150000, claimed: 450000, unused: 5700000 },
  { month: 'Feb', entitled: 6150000, claimed: 480000, unused: 5270000 },
  { month: 'Mar', entitled: 6150000, claimed: 520000, unused: 4750000 },
  { month: 'Apr', entitled: 6150000, claimed: 490000, unused: 4260000 },
  { month: 'May', entitled: 6150000, claimed: 510000, unused: 3750000 },
  { month: 'Jun', entitled: 6150000, claimed: 530000, unused: 3220000 },
  { month: 'Jul', entitled: 6150000, claimed: 545000, unused: 2675000 },
  { month: 'Aug', entitled: 6150000, claimed: 520000, unused: 2155000 },
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{drillLevel === 'department' ? 'Department' : drillLevel === 'grade' ? 'Grade' : 'Segment'}</TableHead>
            <TableHead className="text-right">Entitled</TableHead>
            <TableHead className="text-right">Claimed</TableHead>
            <TableHead className="text-right">Employees</TableHead>
            <TableHead className="text-right">Utilization</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentData.map((row) => {
            const rowUtil = calculateUtilization({ allocated: row.entitled, utilized: row.spend });
            return (
              <TableRow key={row.name}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell className="text-right">{formatCurrencyAED(row.entitled, { abbreviate: false })}</TableCell>
                <TableCell className="text-right">{formatCurrencyAED(row.spend, { abbreviate: false })}</TableCell>
                <TableCell className="text-right">{formatInteger(row.employees)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Progress value={rowUtil.rate} className="w-16 h-2" />
                    <span className={rowUtil.rate >= 80 ? 'text-success' : rowUtil.rate >= 60 ? 'text-warning' : 'text-destructive'}>
                      {formatPercent(rowUtil.rate)}
                    </span>
                  </div>
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
        description={`FY 2024 · ${formatInteger(130)} employees · AED ${(totals.spend / 130 / 1000).toFixed(1)}K per head`}
        icon={DollarSign}
        iconClassName="bg-primary/10 text-primary"
        confidenceBadge={<DataConfidenceBadge metrics={coverageMetrics} />}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              YTD 2024
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
            allocatedBudget: totals.budget,
            actualSpend: totals.spend,
            utilizationRate: overallUtilization.rate,
            targetUtilization: 75,
            unusedValue: overallUtilization.remaining,
            yoyChange: 8.2,
          }}
          onKPIClick={(kpiId) => toast.info(`Opening ${kpiId} drilldown...`)}
        />

        {/* 2. SPEND VS UTILIZATION MATRIX + FRICTION PANEL */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <SpendUtilizationMatrix
              data={matrixData}
              isDemo={true}
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
                    {formatCurrencyAED(overallUtilization.remaining, { abbreviate: true })} opportunity to recapture
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
