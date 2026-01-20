import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  PieChart, 
  BarChart3, 
  BookOpen, 
  ChevronDown, 
  ChevronRight,
  ArrowRight,
  Info,
  Layers,
  Building2,
  Users,
  Target
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
import { formatCurrencyAED, formatPercent, formatInteger } from '@/lib/utils';
import { calculateUtilization, calculateAggregateUtilization } from '@/lib/crossPortalContract';
import { EmployerGlobalFiltersBar, DataConfidenceBadge, PageConfidenceGate, useDataCoverageMetrics } from '@/components/employer';
import { DrillDownSheet, DrillDownSummaryGrid } from '@/components/shared';
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
// METRIC DEFINITIONS - SINGLE SOURCE OF TRUTH
// ============================================================================

const METRIC_DEFINITIONS = {
  allocatedBudget: {
    name: 'Allocated Budget',
    formula: 'SUM(org_budgets.annual_budget) for current fiscal year',
    description: 'The total annual budget set aside for employee benefits, as defined in org_budgets table.',
    dataSource: 'org_budgets table',
    notes: 'Set by Finance/HR at the start of each fiscal year. Does not change unless formally amended.',
  },
  entitledValue: {
    name: 'Entitled Value',
    formula: 'SUM(benefit_entitlements.annual_allowance) for all active employees',
    description: 'The total value of benefits employees are entitled to claim based on their grade and eligibility.',
    dataSource: 'benefit_entitlements table',
    notes: 'May differ from budget if entitlements exceed or fall short of planned allocations.',
  },
  claimedAmount: {
    name: 'Claimed Amount',
    formula: 'SUM(requests.amount) WHERE request_type = "claim" AND status IN ("approved", "paid")',
    description: 'Total value of claims that have been approved or paid out.',
    dataSource: 'requests table (filtered)',
    notes: 'Only includes claims with terminal approval status. Pending claims are excluded.',
  },
  paidAmount: {
    name: 'Paid Amount',
    formula: 'SUM(requests.amount) WHERE paid_at IS NOT NULL',
    description: 'Total value of claims where payment has been processed and confirmed.',
    dataSource: 'requests table (paid_at field)',
    notes: 'If paid_at is not tracked, this metric shows "Approved claims" instead.',
  },
  utilizationRate: {
    name: 'Utilization Rate',
    formula: '(Claimed Amount / Entitled Value) × 100',
    description: 'Percentage of entitled benefits that employees have successfully claimed.',
    dataSource: 'Calculated from benefit_entitlements and requests',
    notes: 'Uses shared calculateUtilization() helper for consistency across Employee and Employer portals.',
  },
};

// Vibrant color palette
const COLORS = {
  primary: 'hsl(160 84% 39%)',
  secondary: 'hsl(217 91% 60%)',
  tertiary: 'hsl(271 81% 56%)',
  quaternary: 'hsl(38 92% 50%)',
  quinary: 'hsl(330 81% 60%)',
  muted: 'hsl(220 14% 70%)',
};

// Mock data - would come from hooks in production
const spendByBenefitType = [
  { id: 'housing', name: 'Housing', spend: 2400000, budget: 2800000, entitled: 2700000, employees: 85 },
  { id: 'schooling', name: 'Schooling', spend: 1200000, budget: 1500000, entitled: 1400000, employees: 45 },
  { id: 'health', name: 'Health', spend: 800000, budget: 900000, entitled: 850000, employees: 130 },
  { id: 'transport', name: 'Transport', spend: 400000, budget: 500000, entitled: 480000, employees: 90 },
  { id: 'learning', name: 'Learning', spend: 150000, budget: 300000, entitled: 280000, employees: 60 },
  { id: 'wellbeing', name: 'Wellbeing', spend: 80000, budget: 150000, entitled: 140000, employees: 50 },
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
  { name: 'Cash Allowances', value: 45, color: COLORS.primary },
  { name: 'Health & Protection', value: 20, color: COLORS.secondary },
  { name: 'Time Off', value: 15, color: COLORS.tertiary },
  { name: 'Growth & Career', value: 10, color: COLORS.quaternary },
  { name: 'Wellbeing', value: 10, color: COLORS.quinary },
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

function DefinitionItem({ 
  def, 
  showDetails = false 
}: { 
  def: typeof METRIC_DEFINITIONS.allocatedBudget; 
  showDetails?: boolean;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className="font-medium text-foreground">{def.name}</span>
        <InfoTooltip>
          <div className="space-y-2 max-w-sm">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Formula</p>
              <p className="text-sm font-mono text-xs">{def.formula}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Data Source</p>
              <p className="text-sm">{def.dataSource}</p>
            </div>
            {def.notes && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">Notes</p>
                <p className="text-sm text-muted-foreground">{def.notes}</p>
              </div>
            )}
          </div>
        </InfoTooltip>
      </div>
      <p className="text-sm text-muted-foreground">{def.description}</p>
      {showDetails && (
        <p className="text-xs text-muted-foreground/70 font-mono">{def.formula}</p>
      )}
    </div>
  );
}

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
                <Badge variant="outline" className="text-xs">Important</Badge>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <DefinitionItem def={METRIC_DEFINITIONS.allocatedBudget} />
              <DefinitionItem def={METRIC_DEFINITIONS.entitledValue} />
              <DefinitionItem def={METRIC_DEFINITIONS.claimedAmount} />
              <DefinitionItem def={METRIC_DEFINITIONS.paidAmount} />
              <div className="md:col-span-2">
                <DefinitionItem def={METRIC_DEFINITIONS.utilizationRate} showDetails />
                <div className="mt-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-xs text-primary font-medium">
                    ℹ️ This formula is shared across Employee and Employer portals to ensure consistent utilization metrics.
                  </p>
                </div>
              </div>
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

  const data = drilldownData.housing; // Would be dynamic based on benefit.id
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
    { 
      label: 'Entitled', 
      value: formatCurrencyAED(benefit.entitled),
      tooltip: <InfoTooltip formula={METRIC_DEFINITIONS.entitledValue.formula} dataSource={METRIC_DEFINITIONS.entitledValue.dataSource} />
    },
    { 
      label: 'Claimed', 
      value: formatCurrencyAED(benefit.spend),
      tooltip: <InfoTooltip formula={METRIC_DEFINITIONS.claimedAmount.formula} dataSource={METRIC_DEFINITIONS.claimedAmount.dataSource} />
    },
    { 
      label: 'Utilization', 
      value: formatPercent(utilization.rate),
      tooltip: <InfoTooltip formula={METRIC_DEFINITIONS.utilizationRate.formula} dataSource={METRIC_DEFINITIONS.utilizationRate.dataSource} />
    },
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
        export: {
          label: 'Export CSV',
          onClick: () => toast.success('Export started'),
        },
        primary: {
          label: 'View Recommendations',
          onClick: () => {},
        },
      }}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              {drillLevel === 'department' ? 'Department' : drillLevel === 'grade' ? 'Grade' : 'Segment'}
            </TableHead>
            <TableHead className="text-right">
              Entitled
              <InfoTooltip formula="Sum of annual_allowance for this group" dataSource="benefit_entitlements" />
            </TableHead>
            <TableHead className="text-right">
              Claimed
              <InfoTooltip formula="Sum of approved/paid claims for this group" dataSource="requests" />
            </TableHead>
            <TableHead className="text-right">Employees</TableHead>
            <TableHead className="text-right">
              Utilization
              <InfoTooltip formula={METRIC_DEFINITIONS.utilizationRate.formula} dataSource="Calculated" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentData.map((row) => {
            const rowUtil = calculateUtilization({
              allocated: row.entitled,
              utilized: row.spend,
            });
            return (
              <TableRow key={row.name}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell className="text-right">{formatCurrencyAED(row.entitled, { abbreviate: false })}</TableCell>
                <TableCell className="text-right">{formatCurrencyAED(row.spend, { abbreviate: false })}</TableCell>
                <TableCell className="text-right">{formatInteger(row.employees)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Progress value={rowUtil.rate} className="w-16 h-2" />
                    <span className={
                      rowUtil.rate >= 80 ? 'text-success' : 
                      rowUtil.rate >= 60 ? 'text-warning' : 'text-destructive'
                    }>
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
        <div 
          className="w-3 h-3 rounded-full" 
          style={{ backgroundColor: entry.color }}
        />
        <span className="text-xs text-muted-foreground font-medium">{entry.value}</span>
      </div>
    ))}
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SpendPage() {
  const [selectedBenefit, setSelectedBenefit] = useState<typeof spendByBenefitType[0] | null>(null);
  const [trendCompare, setTrendCompare] = useState<'mom' | 'qoq'>('mom');
  const coverageMetrics = useDataCoverageMetrics();

  // Calculate totals using shared helper
  const totals = spendByBenefitType.reduce(
    (acc, b) => ({
      budget: acc.budget + b.budget,
      entitled: acc.entitled + b.entitled,
      spend: acc.spend + b.spend,
    }),
    { budget: 0, entitled: 0, spend: 0 }
  );

  const overallUtilization = calculateUtilization({
    allocated: totals.entitled,
    utilized: totals.spend,
  });

  // Combine monthly data for comparison chart
  const comparisonData = monthlyTrendCurrent.map((curr, idx) => ({
    month: curr.month,
    current: curr.spend,
    previous: monthlyTrendPrevious[idx].spend,
    budget: curr.budget,
    change: ((curr.spend - monthlyTrendPrevious[idx].spend) / monthlyTrendPrevious[idx].spend) * 100,
  }));

  return (
    <PageConfidenceGate metrics={coverageMetrics} threshold={70}>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Spend & Utilization</h1>
          <p className="text-muted-foreground">Track benefits spend with clear definitions and drilldowns</p>
        </div>
        <DataConfidenceBadge metrics={coverageMetrics} />
      </div>

      {/* Global Filters */}
      <EmployerGlobalFiltersBar />

      {/* Definitions Card */}
      <DefinitionsCard />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  Allocated Budget
                  <InfoTooltip 
                    formula={METRIC_DEFINITIONS.allocatedBudget.formula} 
                    dataSource={METRIC_DEFINITIONS.allocatedBudget.dataSource} 
                  />
                </p>
                <p className="text-2xl font-bold">{formatCurrencyAED(totals.budget)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  Entitled Value
                  <InfoTooltip 
                    formula={METRIC_DEFINITIONS.entitledValue.formula} 
                    dataSource={METRIC_DEFINITIONS.entitledValue.dataSource} 
                  />
                </p>
                <p className="text-2xl font-bold">{formatCurrencyAED(totals.entitled)}</p>
              </div>
              <Target className="h-8 w-8 text-secondary/20" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {totals.entitled > totals.budget ? (
                <span className="text-amber-600">Over-entitled by {formatCurrencyAED(totals.entitled - totals.budget)}</span>
              ) : (
                <span className="text-emerald-600">Within budget</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  Claimed Amount
                  <InfoTooltip 
                    formula={METRIC_DEFINITIONS.claimedAmount.formula} 
                    dataSource={METRIC_DEFINITIONS.claimedAmount.dataSource} 
                  />
                </p>
                <p className="text-2xl font-bold">{formatCurrencyAED(totals.spend)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-accent/20" />
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600">
              <TrendingUp className="h-3 w-3" />
              <span>8.2% vs last year</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  Utilization Rate
                  <InfoTooltip 
                    formula={METRIC_DEFINITIONS.utilizationRate.formula} 
                    dataSource={METRIC_DEFINITIONS.utilizationRate.dataSource} 
                  />
                </p>
                <p className="text-2xl font-bold">{formatPercent(overallUtilization.rate)}</p>
              </div>
              <PieChart className="h-8 w-8 text-chart-2/20" />
            </div>
            <Progress value={overallUtilization.rate} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  Unused Entitlement
                  <InfoTooltip 
                    formula="Entitled Value - Claimed Amount" 
                    dataSource="Calculated" 
                  />
                </p>
                <p className="text-2xl font-bold text-amber-600">{formatCurrencyAED(overallUtilization.remaining)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-amber-500/20" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Potential zombie spend</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="benefit-type" className="space-y-4">
        <TabsList>
          <TabsTrigger value="benefit-type">By Benefit Type</TabsTrigger>
          <TabsTrigger value="department">By Department</TabsTrigger>
          <TabsTrigger value="trend">Trend Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="benefit-type" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  Spend by Benefit Type
                  <InfoTooltip 
                    formula="Claimed amount vs entitled value per benefit category" 
                    dataSource="benefit_entitlements + requests" 
                  />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={spendByBenefitType} layout="vertical" margin={{ left: 10, right: 20 }}>
                      <defs>
                        <linearGradient id="spendGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor={COLORS.primary} stopOpacity={1} />
                          <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0.7} />
                        </linearGradient>
                        <linearGradient id="entitledGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor={COLORS.muted} stopOpacity={0.6} />
                          <stop offset="100%" stopColor={COLORS.muted} stopOpacity={0.3} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.5} />
                      <XAxis 
                        type="number" 
                        tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                      />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        width={80}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 500 }}
                      />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          formatCurrencyAED(value, { abbreviate: false }), 
                          name === 'spend' ? 'Claimed' : 'Entitled'
                        ]}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '10px',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                          padding: '12px 16px'
                        }}
                        labelStyle={{ fontWeight: 600, marginBottom: 6, color: 'hsl(var(--foreground))' }}
                        cursor={{ fill: 'hsl(var(--accent)/0.05)' }}
                      />
                      <Legend content={<CustomLegend />} />
                      <Bar dataKey="spend" fill="url(#spendGradient)" radius={[0, 4, 4, 0]} name="Claimed" />
                      <Bar dataKey="entitled" fill="url(#entitledGradient)" radius={[0, 4, 4, 0]} name="Entitled" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  Spend Distribution
                  <InfoTooltip 
                    formula="Percentage of total claimed amount by category" 
                    dataSource="requests (aggregated)" 
                  />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <defs>
                        {spendDistribution.map((entry, index) => (
                          <linearGradient key={index} id={`pieGradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                            <stop offset="100%" stopColor={entry.color} stopOpacity={0.7} />
                          </linearGradient>
                        ))}
                      </defs>
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
                          <Cell 
                            key={`cell-${index}`} 
                            fill={`url(#pieGradient-${index})`}
                            stroke="hsl(var(--background))"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Legend 
                        content={<CustomLegend />}
                        payload={spendDistribution.map((item) => ({
                          value: item.name,
                          color: item.color,
                          type: 'circle'
                        }))}
                      />
                      <Tooltip 
                        formatter={(value: number) => [`${value}%`, 'Share']}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '10px',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                          padding: '12px 16px'
                        }}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Benefit Type Table with Drilldown */}
          <Card className="card-elevated">
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
                    <TableHead className="text-right">
                      Budget
                      <InfoTooltip formula={METRIC_DEFINITIONS.allocatedBudget.formula} dataSource="org_budgets" />
                    </TableHead>
                    <TableHead className="text-right">
                      Entitled
                      <InfoTooltip formula={METRIC_DEFINITIONS.entitledValue.formula} dataSource="benefit_entitlements" />
                    </TableHead>
                    <TableHead className="text-right">
                      Claimed
                      <InfoTooltip formula={METRIC_DEFINITIONS.claimedAmount.formula} dataSource="requests" />
                    </TableHead>
                    <TableHead className="text-right">Employees</TableHead>
                    <TableHead className="text-right">
                      Utilization
                      <InfoTooltip formula={METRIC_DEFINITIONS.utilizationRate.formula} dataSource="Calculated" />
                    </TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {spendByBenefitType.map((item) => {
                    const util = calculateUtilization({
                      allocated: item.entitled,
                      utilized: item.spend,
                    });
                    return (
                      <TableRow 
                        key={item.name} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedBenefit(item)}
                      >
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-right">{formatCurrencyAED(item.budget, { abbreviate: false })}</TableCell>
                        <TableCell className="text-right">{formatCurrencyAED(item.entitled, { abbreviate: false })}</TableCell>
                        <TableCell className="text-right">{formatCurrencyAED(item.spend, { abbreviate: false })}</TableCell>
                        <TableCell className="text-right">{formatInteger(item.employees)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Progress value={util.rate} className="w-20 h-2" />
                            <span className={
                              util.rate >= 80 ? 'text-emerald-600' : 
                              util.rate >= 60 ? 'text-amber-600' : 'text-red-500'
                            }>
                              {formatPercent(util.rate)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
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
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                Department Spend Analysis
                <InfoTooltip 
                  formula="Aggregated claims and entitlements grouped by employee department" 
                  dataSource="profiles + benefit_entitlements + requests" 
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-right">
                      Headcount
                      <InfoTooltip formula="COUNT(DISTINCT user_id)" dataSource="profiles" />
                    </TableHead>
                    <TableHead className="text-right">
                      Entitled
                      <InfoTooltip formula={METRIC_DEFINITIONS.entitledValue.formula} dataSource="benefit_entitlements" />
                    </TableHead>
                    <TableHead className="text-right">
                      Claimed
                      <InfoTooltip formula={METRIC_DEFINITIONS.claimedAmount.formula} dataSource="requests" />
                    </TableHead>
                    <TableHead className="text-right">
                      Avg/Employee
                      <InfoTooltip formula="Claimed Amount / Headcount" dataSource="Calculated" />
                    </TableHead>
                    <TableHead className="text-right">
                      Utilization
                      <InfoTooltip formula={METRIC_DEFINITIONS.utilizationRate.formula} dataSource="Calculated" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departmentSpend.map((dept) => {
                    const util = calculateUtilization({
                      allocated: dept.entitled,
                      utilized: dept.totalSpend,
                    });
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
                            <span className={
                              util.rate >= 80 ? 'text-emerald-600' : 
                              util.rate >= 60 ? 'text-amber-600' : 'text-red-500'
                            }>
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
          {/* Period Selector */}
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
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  Monthly Spend Trend (Current vs Previous Year)
                  <InfoTooltip 
                    formula="Monthly aggregated claims compared to same period last year" 
                    dataSource="requests (grouped by month)" 
                  />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={comparisonData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                      <defs>
                        <linearGradient id="currentGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} vertical={false} />
                      <XAxis 
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                      />
                      <YAxis 
                        tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                      />
                      <Tooltip 
                        content={({ active, payload, label }) => {
                          if (!active || !payload?.length) return null;
                          const data = payload[0].payload;
                          return (
                            <div className="bg-card border border-border rounded-lg shadow-lg p-4 space-y-2">
                              <p className="font-semibold">{label}</p>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between gap-4">
                                  <span className="text-muted-foreground">Current Year:</span>
                                  <span className="font-medium">{formatCurrencyAED(data.current)}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-muted-foreground">Previous Year:</span>
                                  <span className="font-medium">{formatCurrencyAED(data.previous)}</span>
                                </div>
                                <div className="flex justify-between gap-4 pt-1 border-t">
                                  <span className="text-muted-foreground">Change:</span>
                                  <span className={data.change >= 0 ? 'text-emerald-600' : 'text-red-500'}>
                                    {data.change >= 0 ? '+' : ''}{data.change.toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        }}
                      />
                      <ReferenceLine 
                        y={500000} 
                        stroke="hsl(var(--muted-foreground))" 
                        strokeDasharray="6 4" 
                        label={{ value: 'Budget', fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} 
                      />
                      <Legend content={<CustomLegend />} />
                      <Line 
                        type="monotone" 
                        dataKey="current" 
                        stroke={COLORS.primary} 
                        strokeWidth={3} 
                        dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, strokeWidth: 2 }}
                        name="Current Year"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="previous" 
                        stroke={COLORS.muted} 
                        strokeWidth={2} 
                        strokeDasharray="6 4"
                        dot={{ fill: COLORS.muted, strokeWidth: 1, r: 3 }}
                        name="Previous Year"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  Quarterly Spend Comparison
                  <InfoTooltip 
                    formula="Quarterly aggregated claims compared to same quarter last year" 
                    dataSource="requests (grouped by quarter)" 
                  />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={quarterlyData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} vertical={false} />
                      <XAxis 
                        dataKey="quarter"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                      />
                      <YAxis 
                        tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                      />
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
                                  <span className="text-muted-foreground">Current Year:</span>
                                  <span className="font-medium">{formatCurrencyAED(data.current)}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-muted-foreground">Previous Year:</span>
                                  <span className="font-medium">{formatCurrencyAED(data.previous)}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-muted-foreground">Budget:</span>
                                  <span className="font-medium">{formatCurrencyAED(data.budget)}</span>
                                </div>
                                <div className="flex justify-between gap-4 pt-1 border-t">
                                  <span className="text-muted-foreground">YoY Change:</span>
                                  <span className={change >= 0 ? 'text-emerald-600' : 'text-red-500'}>
                                    {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        }}
                      />
                      <Legend content={<CustomLegend />} />
                      <Bar dataKey="current" fill={COLORS.primary} radius={[4, 4, 0, 0]} name="Current Year" />
                      <Bar dataKey="previous" fill={COLORS.muted} radius={[4, 4, 0, 0]} name="Previous Year" />
                      <ReferenceLine 
                        y={1500000} 
                        stroke="hsl(var(--destructive))" 
                        strokeDasharray="6 4" 
                        label={{ value: 'Quarterly Budget', fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="card-elevated">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  YTD Spend
                  <InfoTooltip formula="SUM(claims) from Jan 1 to today" dataSource="requests" />
                </p>
                <p className="text-2xl font-bold">{formatCurrencyAED(6030000)}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>+8.5% vs LY</span>
                </div>
              </CardContent>
            </Card>
            <Card className="card-elevated">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  Avg Monthly Spend
                  <InfoTooltip formula="YTD Spend / Months Elapsed" dataSource="Calculated" />
                </p>
                <p className="text-2xl font-bold">{formatCurrencyAED(502500)}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>+5.2% vs LY avg</span>
                </div>
              </CardContent>
            </Card>
            <Card className="card-elevated">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  Peak Month
                  <InfoTooltip formula="Month with highest claims total" dataSource="requests" />
                </p>
                <p className="text-2xl font-bold">Jul</p>
                <p className="text-xs text-muted-foreground mt-2">{formatCurrencyAED(545000)}</p>
              </CardContent>
            </Card>
            <Card className="card-elevated">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  Budget Variance
                  <InfoTooltip formula="(Actual - Budget) / Budget × 100" dataSource="Calculated" />
                </p>
                <p className="text-2xl font-bold text-emerald-600">-1.8%</p>
                <p className="text-xs text-muted-foreground mt-2">Under budget</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Drilldown Sheet */}
      <BenefitDrilldownSheet 
        isOpen={!!selectedBenefit} 
        onClose={() => setSelectedBenefit(null)} 
        benefit={selectedBenefit} 
      />
    </div>
    </PageConfidenceGate>
  );
}
