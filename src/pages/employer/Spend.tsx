/**
 * Spend & Utilization Page
 * 
 * Executive-grade analytics page following the standardized template:
 * 1. Header + Confidence Badge
 * 2. Key Insights (with deep links)
 * 3. KPI Grid (6 metrics)
 * 4. Trend/Breakdown Charts
 * 5. Drilldown Table
 * 6. Recommended Actions
 * 
 * @module Spend
 */

import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BookOpen, 
  ChevronDown, 
  ChevronRight,
  ArrowRight,
  Layers,
  Building2,
  Users,
  Target,
  Download,
  Calendar,
  Lightbulb,
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart as RePieChart, 
  Pie, 
  Cell, 
  Legend,
  ReferenceLine 
} from 'recharts';
import { formatCurrencyAED, formatPercent, formatInteger, cn } from '@/lib/utils';
import { calculateUtilization } from '@/lib/crossPortalContract';
import { 
  EmployerGlobalFiltersBar, 
  DataConfidenceBadge, 
  PageConfidenceGate, 
  useDataCoverageMetrics, 
  ForecastWidget,
  SpendKPIGrid,
  SpendInsights,
  generateSpendInsights,
} from '@/components/employer';
import { UtilizationFunnel, generateFunnelData } from '@/components/employer/UtilizationFunnel';
import { TopDriversTable } from '@/components/employer/TopDriversTable';
import { ExecModeToggle } from '@/components/employer/ExecModeToggle';
import { useExecMode } from '@/components/employer/ExecModeContext';
import { DrillDownSheet, DrillDownSummaryGrid, PageLayout } from '@/components/shared';
import { CategoryWaterfallChart } from '@/components/charts';
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
// METRIC DEFINITIONS
// ============================================================================

const METRIC_DEFINITIONS = {
  allocatedBudget: {
    name: 'Allocated Budget',
    formula: 'SUM(org_budgets.annual_budget) for current fiscal year',
    description: 'The total annual budget set aside for employee benefits.',
    dataSource: 'org_budgets table',
  },
  entitledValue: {
    name: 'Entitled Value',
    formula: 'SUM(benefit_entitlements.annual_allowance) for all active employees',
    description: 'The total value of benefits employees are entitled to claim.',
    dataSource: 'benefit_entitlements table',
  },
  claimedAmount: {
    name: 'Claimed Amount',
    formula: 'SUM(requests.amount) WHERE status IN ("approved", "paid")',
    description: 'Total value of claims that have been approved or paid out.',
    dataSource: 'requests table',
  },
  utilizationRate: {
    name: 'Utilization Rate',
    formula: '(Claimed Amount / Entitled Value) × 100',
    description: 'Percentage of entitled benefits that employees have claimed.',
    dataSource: 'Calculated',
  },
};

// Chart color palette using semantic tokens
const COLORS = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--chart-2))',
  tertiary: 'hsl(var(--chart-3))',
  quaternary: 'hsl(var(--chart-4))',
  quinary: 'hsl(var(--chart-5))',
  muted: 'hsl(var(--muted-foreground))',
};

// ============================================================================
// MOCK DATA (would come from hooks in production)
// ============================================================================

const spendByBenefitType = [
  { id: 'housing', name: 'Housing', category: 'Cash Allowances', spend: 2400000, budget: 2800000, entitled: 2700000, employees: 85, faqViews: 25, claimVelocity: 8, awarenessScore: 85 },
  { id: 'schooling', name: 'Schooling', category: 'Cash Allowances', spend: 1200000, budget: 1500000, entitled: 1400000, employees: 45, faqViews: 35, claimVelocity: 4, awarenessScore: 70 },
  { id: 'health', name: 'Health', category: 'Insurance', spend: 800000, budget: 900000, entitled: 850000, employees: 130, faqViews: 40, claimVelocity: 6, awarenessScore: 75 },
  { id: 'transport', name: 'Transport', category: 'Cash Allowances', spend: 400000, budget: 500000, entitled: 480000, employees: 90, faqViews: 20, claimVelocity: 5, awarenessScore: 60 },
  { id: 'learning', name: 'Learning', category: 'Reimbursement', spend: 150000, budget: 300000, entitled: 280000, employees: 60, faqViews: 95, claimVelocity: 2, awarenessScore: 35 },
  { id: 'wellbeing', name: 'Wellbeing', category: 'Reimbursement', spend: 80000, budget: 150000, entitled: 140000, employees: 50, faqViews: 78, claimVelocity: 1.5, awarenessScore: 30 },
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

const monthlyTrendCurrent = [
  { month: 'Jan', spend: 450000, budget: 500000 },
  { month: 'Feb', spend: 480000, budget: 500000 },
  { month: 'Mar', spend: 520000, budget: 500000 },
  { month: 'Apr', spend: 490000, budget: 500000 },
  { month: 'May', spend: 510000, budget: 500000 },
  { month: 'Jun', spend: 530000, budget: 500000 },
  { month: 'Jul', spend: 545000, budget: 500000 },
  { month: 'Aug', spend: 520000, budget: 500000 },
  { month: 'Sep', spend: 495000, budget: 500000 },
  { month: 'Oct', spend: 510000, budget: 500000 },
  { month: 'Nov', spend: 525000, budget: 500000 },
  { month: 'Dec', spend: 455000, budget: 500000 },
];

const monthlyTrendPrevious = [
  { month: 'Jan', spend: 420000 },
  { month: 'Feb', spend: 440000 },
  { month: 'Mar', spend: 470000 },
  { month: 'Apr', spend: 455000 },
  { month: 'May', spend: 480000 },
  { month: 'Jun', spend: 495000 },
  { month: 'Jul', spend: 510000 },
  { month: 'Aug', spend: 490000 },
  { month: 'Sep', spend: 475000 },
  { month: 'Oct', spend: 485000 },
  { month: 'Nov', spend: 500000 },
  { month: 'Dec', spend: 430000 },
];

const quarterlyData = [
  { quarter: 'Q1', current: 1450000, previous: 1330000, budget: 1500000 },
  { quarter: 'Q2', current: 1530000, previous: 1430000, budget: 1500000 },
  { quarter: 'Q3', current: 1560000, previous: 1475000, budget: 1500000 },
  { quarter: 'Q4', current: 1490000, previous: 1415000, budget: 1500000 },
];

const spendDistribution = [
  { name: 'Cash Allowances', value: 45, color: 'hsl(var(--primary))' },
  { name: 'Health & Protection', value: 20, color: 'hsl(var(--chart-2))' },
  { name: 'Time Off', value: 15, color: 'hsl(var(--chart-3))' },
  { name: 'Growth & Career', value: 10, color: 'hsl(var(--chart-4))' },
  { name: 'Wellbeing', value: 10, color: 'hsl(var(--chart-5))' },
];

const departmentSpend = [
  { department: 'Engineering', headcount: 45, totalSpend: 1800000, entitled: 2100000, avgPerEmployee: 40000 },
  { department: 'Sales', headcount: 30, totalSpend: 1200000, entitled: 1400000, avgPerEmployee: 40000 },
  { department: 'Marketing', headcount: 20, totalSpend: 750000, entitled: 900000, avgPerEmployee: 37500 },
  { department: 'Operations', headcount: 25, totalSpend: 900000, entitled: 1100000, avgPerEmployee: 36000 },
  { department: 'HR', headcount: 10, totalSpend: 380000, entitled: 450000, avgPerEmployee: 38000 },
];

// ============================================================================
// COMPONENTS
// ============================================================================

function DefinitionsCard() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="border-dashed border-2 bg-muted/30">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Metric Definitions</CardTitle>
                <Badge variant="outline" className="text-xs">Glossary</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Understanding spend metrics</span>
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.values(METRIC_DEFINITIONS).map((def) => (
                <div key={def.name} className="space-y-1">
                  <p className="font-medium text-sm">{def.name}</p>
                  <p className="text-xs text-muted-foreground">{def.description}</p>
                  <p className="text-xs font-mono text-muted-foreground/70">{def.formula}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

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

const CustomLegend = ({ payload }: any) => (
  <div className="flex flex-wrap justify-center gap-4 mt-4">
    {payload?.map((entry: any, index: number) => (
      <div key={index} className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
        <span className="text-xs text-muted-foreground">{entry.value}</span>
      </div>
    ))}
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function Spend() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedBenefit, setSelectedBenefit] = useState<typeof spendByBenefitType[0] | null>(null);
  const [trendCompare, setTrendCompare] = useState<'mom' | 'qoq'>('mom');
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

  // Generate insights with deep links
  const insights = useMemo(() => generateSpendInsights({
    overallUtilization: overallUtilization.rate,
    unusedEntitlement: overallUtilization.remaining,
    topUnderutilizedCategory: topUnderutilized,
    lowUtilizationSegments: [{ name: 'Junior', dimension: 'Grade', utilization: 52 }],
    highRejectionPolicy: { name: 'Learning', rejectionRate: 18 },
    yoySpendChange: 8.2,
  }), [overallUtilization, topUnderutilized]);


  // Combine monthly data for comparison
  const comparisonData = monthlyTrendCurrent.map((curr, idx) => ({
    month: curr.month,
    current: curr.spend,
    previous: monthlyTrendPrevious[idx].spend,
    budget: curr.budget,
    change: ((curr.spend - monthlyTrendPrevious[idx].spend) / monthlyTrendPrevious[idx].spend) * 100,
  }));

  return (
    <PageConfidenceGate metrics={coverageMetrics} threshold={70}>
      <PageLayout
        title="Spend & Utilization"
        description="Allocated vs utilized vs unclaimed, by benefit category and employee segment"
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
        {/* 1. Key Insights with Deep Links */}
        <SpendInsights insights={insights} isDemo={true} />

        {/* 2. KPI Grid */}
        <SpendKPIGrid
          metrics={{
            allocatedBudget: totals.budget,
            entitledValue: totals.entitled,
            claimedAmount: totals.spend,
            utilizationRate: overallUtilization.rate,
            unusedEntitlement: overallUtilization.remaining,
            avgCostPerEmployee: Math.round(totals.spend / 130),
            employeeCount: 130,
            yoyChange: 8.2,
          }}
          isDemo={true}
          onKPIClick={(kpiId) => toast.info(`Opening ${kpiId} drilldown...`)}
        />

        {/* 3. Metric Definitions (collapsible) */}
        <DefinitionsCard />

        {/* 4. Waterfall + Forecast */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                Spend Waterfall by Category
                <InfoTooltip formula="Allocated → Entitled → Claimed → Unused" dataSource="org_budgets + benefit_entitlements + requests" />
              </CardTitle>
              <CardDescription>Click any category to drill down</CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryWaterfallChart
                data={spendByBenefitType.map(b => ({
                  name: b.name,
                  allocated: b.budget,
                  entitled: b.entitled,
                  claimed: b.spend,
                  unused: b.entitled - b.spend,
                }))}
                height={300}
                onCategoryClick={(category) => {
                  const benefit = spendByBenefitType.find(b => b.name === category);
                  if (benefit) setSelectedBenefit(benefit);
                }}
              />
            </CardContent>
          </Card>

          <ForecastWidget
            historicalData={forecastHistoricalData}
            totalEntitled={totals.entitled}
            currentClaimed={totals.spend}
            fiscalYearEnd="December 31"
            onViewDetails={() => toast.info('Opening forecast breakdown...')}
            onCreateAction={() => window.location.href = '/employer/recommendations?create=true&source=forecast'}
          />
        </div>

        {/* 5. Link to Optimization - NOT duplicating action cards */}
        <Card className="border-warning/20 bg-gradient-to-r from-warning/5 to-transparent">
          <CardContent className="py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <Lightbulb className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="font-medium text-sm">
                    {formatCurrencyAED(overallUtilization.remaining, { abbreviate: true })} in unrealized value identified
                  </p>
                  <p className="text-xs text-muted-foreground">
                    View root causes and recovery playbooks in Optimization
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/employer/zombie'}
                className="gap-1"
              >
                View Opportunities
                <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 6. Tabs: Breakdown Views */}
        <Tabs defaultValue="benefit-type" className="space-y-4">
          <TabsList>
            <TabsTrigger value="benefit-type">By Benefit Type</TabsTrigger>
            <TabsTrigger value="department">By Department</TabsTrigger>
            <TabsTrigger value="trend">Trend Comparison</TabsTrigger>
          </TabsList>

          <TabsContent value="benefit-type" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Benefit Type Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    Spend by Benefit Type
                    <InfoTooltip formula="Claimed amount vs entitled value per category" dataSource="benefit_entitlements + requests" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={spendByBenefitType} layout="vertical" margin={{ left: 10, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.5} />
                        <XAxis type="number" tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                        <YAxis type="category" dataKey="name" width={80} axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 500 }} />
                        <Tooltip
                          formatter={(value: number, name: string) => [formatCurrencyAED(value, { abbreviate: false }), name === 'spend' ? 'Claimed' : 'Entitled']}
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '10px', padding: '12px 16px' }}
                        />
                        <Legend content={<CustomLegend />} />
                        <Bar dataKey="spend" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Claimed" />
                        <Bar dataKey="entitled" fill="hsl(var(--muted))" radius={[0, 4, 4, 0]} name="Entitled" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Spend Distribution Pie */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    Spend Distribution
                    <InfoTooltip formula="Percentage of total claimed amount by category" dataSource="requests (aggregated)" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={spendDistribution}
                          cx="50%"
                          cy="45%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={3}
                          dataKey="value"
                          label={({ value }) => `${value}%`}
                          labelLine={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
                        >
                          {spendDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="hsl(var(--background))" strokeWidth={2} />
                          ))}
                        </Pie>
                        <Legend content={<CustomLegend />} payload={spendDistribution.map((item) => ({ value: item.name, color: item.color, type: 'circle' as const }))} />
                        <Tooltip formatter={(value: number) => [`${value}%`, 'Share']} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '10px', padding: '12px 16px' }} />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Drilldown Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  Detailed Breakdown
                  <Badge variant="outline" className="text-xs">Click row to drilldown</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Benefit Type</TableHead>
                      <TableHead className="text-right">Budget</TableHead>
                      <TableHead className="text-right">Entitled</TableHead>
                      <TableHead className="text-right">Claimed</TableHead>
                      <TableHead className="text-right">Employees</TableHead>
                      <TableHead className="text-right">Utilization</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {spendByBenefitType.map((item) => {
                      const util = calculateUtilization({ allocated: item.entitled, utilized: item.spend });
                      return (
                        <TableRow key={item.name} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedBenefit(item)}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="text-right">{formatCurrencyAED(item.budget, { abbreviate: false })}</TableCell>
                          <TableCell className="text-right">{formatCurrencyAED(item.entitled, { abbreviate: false })}</TableCell>
                          <TableCell className="text-right">{formatCurrencyAED(item.spend, { abbreviate: false })}</TableCell>
                          <TableCell className="text-right">{formatInteger(item.employees)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Progress value={util.rate} className="w-20 h-2" />
                              <span className={util.rate >= 80 ? 'text-success' : util.rate >= 60 ? 'text-warning' : 'text-destructive'}>
                                {formatPercent(util.rate)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm"><ArrowRight className="h-4 w-4" /></Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="department" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  Department Spend Analysis
                  <InfoTooltip formula="Aggregated claims grouped by employee department" dataSource="profiles + benefit_entitlements + requests" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Department</TableHead>
                      <TableHead className="text-right">Headcount</TableHead>
                      <TableHead className="text-right">Entitled</TableHead>
                      <TableHead className="text-right">Claimed</TableHead>
                      <TableHead className="text-right">Avg/Employee</TableHead>
                      <TableHead className="text-right">Utilization</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departmentSpend.map((dept) => {
                      const util = calculateUtilization({ allocated: dept.entitled, utilized: dept.totalSpend });
                      return (
                        <TableRow key={dept.department}>
                          <TableCell className="font-medium">{dept.department}</TableCell>
                          <TableCell className="text-right">{formatInteger(dept.headcount)}</TableCell>
                          <TableCell className="text-right">{formatCurrencyAED(dept.entitled, { abbreviate: false })}</TableCell>
                          <TableCell className="text-right">{formatCurrencyAED(dept.totalSpend, { abbreviate: false })}</TableCell>
                          <TableCell className="text-right">{formatCurrencyAED(dept.avgPerEmployee, { abbreviate: false })}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Progress value={util.rate} className="w-20 h-2" />
                              <span className={util.rate >= 80 ? 'text-success' : util.rate >= 60 ? 'text-warning' : 'text-destructive'}>
                                {formatPercent(util.rate)}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trend" className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Compare:</span>
              <Select value={trendCompare} onValueChange={(v: 'mom' | 'qoq') => setTrendCompare(v)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mom">Month over Month (MoM)</SelectItem>
                  <SelectItem value="qoq">Quarter over Quarter (QoQ)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {trendCompare === 'mom' ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    Monthly Spend Trend (Current vs Previous Year)
                    <InfoTooltip formula="Monthly aggregated claims compared to same period last year" dataSource="requests (grouped by month)" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={comparisonData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} vertical={false} />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                        <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (!active || !payload?.length) return null;
                            const data = payload[0].payload;
                            return (
                              <div className="bg-card border border-border rounded-lg shadow-lg p-4 space-y-2">
                                <p className="font-semibold">{label}</p>
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between gap-4">
                                    <span className="text-muted-foreground">Current:</span>
                                    <span className="font-medium">{formatCurrencyAED(data.current)}</span>
                                  </div>
                                  <div className="flex justify-between gap-4">
                                    <span className="text-muted-foreground">Previous:</span>
                                    <span className="font-medium">{formatCurrencyAED(data.previous)}</span>
                                  </div>
                                  <div className="flex justify-between gap-4 pt-1 border-t">
                                    <span className="text-muted-foreground">Change:</span>
                                    <span className={data.change >= 0 ? 'text-success' : 'text-destructive'}>
                                      {data.change >= 0 ? '+' : ''}{data.change.toFixed(1)}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          }}
                        />
                        <ReferenceLine y={500000} stroke="hsl(var(--muted-foreground))" strokeDasharray="6 4" label={{ value: 'Budget', fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                        <Legend content={<CustomLegend />} />
                        <Line type="monotone" dataKey="current" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }} name="Current Year" />
                        <Line type="monotone" dataKey="previous" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="6 4" dot={{ fill: 'hsl(var(--muted-foreground))', strokeWidth: 1, r: 3 }} name="Previous Year" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    Quarterly Spend Comparison
                    <InfoTooltip formula="Quarterly aggregated claims compared to same quarter last year" dataSource="requests (grouped by quarter)" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={quarterlyData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} vertical={false} />
                        <XAxis dataKey="quarter" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                        <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (!active || !payload?.length) return null;
                            const data = payload[0].payload;
                            const change = ((data.current - data.previous) / data.previous) * 100;
                            return (
                              <div className="bg-card border border-border rounded-lg shadow-lg p-4 space-y-2">
                                <p className="font-semibold">{label}</p>
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between gap-4">
                                    <span className="text-muted-foreground">Current:</span>
                                    <span className="font-medium">{formatCurrencyAED(data.current)}</span>
                                  </div>
                                  <div className="flex justify-between gap-4">
                                    <span className="text-muted-foreground">Previous:</span>
                                    <span className="font-medium">{formatCurrencyAED(data.previous)}</span>
                                  </div>
                                  <div className="flex justify-between gap-4 pt-1 border-t">
                                    <span className="text-muted-foreground">YoY Change:</span>
                                    <span className={change >= 0 ? 'text-success' : 'text-destructive'}>
                                      {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          }}
                        />
                        <Legend content={<CustomLegend />} />
                        <Bar dataKey="current" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Current Year" />
                        <Bar dataKey="previous" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} name="Previous Year" />
                        <ReferenceLine y={1500000} stroke="hsl(var(--destructive))" strokeDasharray="6 4" label={{ value: 'Quarterly Budget', fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* 7. Link to Action Plan - NOT duplicating action cards */}
        <Card className="border-accent/20 bg-gradient-to-r from-accent/5 to-transparent">
          <CardContent className="py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Target className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium text-sm">
                    Ready to take action on these insights?
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Track recommendations and measure impact in the Action Plan
                  </p>
                </div>
              </div>
              <Button 
                size="sm"
                onClick={() => window.location.href = '/employer/recommendations'}
                className="gap-1"
              >
                View Action Plan
                <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          </CardContent>
        </Card>

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
