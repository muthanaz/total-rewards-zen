import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, DollarSign, TrendingUp, TrendingDown, Smile, Ghost, FileCheck, Target, ArrowRight, AlertTriangle, CheckCircle2, Sparkles, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  ChartContainer, 
  AnimatedBarChart, 
  AnimatedLineChart, 
  AnimatedRadarChart,
  StackedAreaChart,
  ProgressBarList 
} from '@/components/charts';
import { EmployerBenefitRecommendations, TrendIndicator } from '@/components/dashboard';
import { useElementVisibility } from '@/contexts/UIVisibilityContext';
import { useEmployerViewMode } from '@/contexts/EmployerViewModeContext';

const metrics = {
  totalEmployees: 156,
  employeeChange: 8,
  annualBudget: 62000000,
  budgetUsed: 39680000,
  utilizationRate: 64,
  utilizationChange: 3.2,
  satisfactionScore: 4.2,
  retentionRate: 92,
  retentionChange: 2.1,
  zombieSpend: 8500000,
  zombieChange: -12,
  pendingClaims: 12,
  avgProcessingDays: 2.3,
  roi: 3.2,
};

const executiveInsights = [
  { type: 'success', icon: CheckCircle2, title: 'Housing at 95% utilization', description: 'Top performing benefit this quarter' },
  { type: 'warning', icon: AlertTriangle, title: 'L&D underutilized at 38%', description: 'AED 2.8M recovery potential' },
  { type: 'info', icon: Sparkles, title: '12 claims pending review', description: 'Average processing: 2.3 days' },
];

const utilizationTrend = [
  { name: 'Jul', value: 58 },
  { name: 'Aug', value: 59 },
  { name: 'Sep', value: 61 },
  { name: 'Oct', value: 60 },
  { name: 'Nov', value: 63 },
  { name: 'Dec', value: 64 },
];

const spendByType = [
  { name: 'Cash', value: 32, secondaryValue: 35 },
  { name: 'Health', value: 9, secondaryValue: 12 },
  { name: 'Time Off', value: 7, secondaryValue: 8 },
  { name: 'Growth', value: 2, secondaryValue: 5 },
  { name: 'Wellbeing', value: 1, secondaryValue: 2 },
];

const topBenefits = [
  { name: 'Housing Allowance', value: 95 },
  { name: 'Health Insurance', value: 78 },
  { name: 'Transport Allowance', value: 72 },
];

const leastUsed = [
  { name: 'Learning & Development', value: 38 },
  { name: 'Wellbeing Program', value: 45 },
  { name: 'Financial Planning', value: 52 },
];

const zombieCandidates = [
  { benefit: 'Learning & Development', amount: 2800000, employees: 45 },
  { benefit: 'Wellbeing Program', amount: 1200000, employees: 60 },
  { benefit: 'Flight Tickets (Singles)', amount: 950000, employees: 25 },
];

const segmentRadarData = [
  { subject: 'Housing', value: 92, secondaryValue: 85, fullMark: 100 },
  { subject: 'Health', value: 65, secondaryValue: 72, fullMark: 100 },
  { subject: 'Transport', value: 70, secondaryValue: 68, fullMark: 100 },
  { subject: 'Learning', value: 38, secondaryValue: 55, fullMark: 100 },
  { subject: 'Wellbeing', value: 48, secondaryValue: 58, fullMark: 100 },
  { subject: 'Finance', value: 52, secondaryValue: 60, fullMark: 100 },
];

const cumulativeSpendData = [
  { name: 'Jul', cash: 4.2, health: 1.1, transport: 0.8, other: 0.4 },
  { name: 'Aug', cash: 8.5, health: 2.3, transport: 1.5, other: 0.9 },
  { name: 'Sep', cash: 12.8, health: 3.5, transport: 2.3, other: 1.3 },
  { name: 'Oct', cash: 17.2, health: 4.8, transport: 3.1, other: 1.8 },
  { name: 'Nov', cash: 21.5, health: 6.0, transport: 3.9, other: 2.2 },
  { name: 'Dec', cash: 26.0, health: 7.2, transport: 4.6, other: 2.7 },
];

const spendStacks = [
  { key: 'cash', label: 'Cash Allowances', color: 'hsl(160 84% 39%)' },
  { key: 'health', label: 'Health & Protection', color: 'hsl(217 91% 60%)' },
  { key: 'transport', label: 'Transport', color: 'hsl(271 81% 56%)' },
  { key: 'other', label: 'Other Benefits', color: 'hsl(38 92% 50%)' },
];

export default function EmployerDashboard() {
  const formatCurrency = (value: number) => `AED ${(value / 1000000).toFixed(1)}M`;
  const budgetUtilization = (metrics.budgetUsed / metrics.annualBudget) * 100;
  const { isExecutive, isOperational } = useEmployerViewMode();
  
  // UI Visibility hooks
  const { isVisible: showKpiCards } = useElementVisibility('employer', 'dashboard', 'kpi_cards');
  const { isVisible: showSecondaryKpi } = useElementVisibility('employer', 'dashboard', 'secondary_kpi');
  const { isVisible: showExecutiveInsights } = useElementVisibility('employer', 'dashboard', 'executive_insights');
  const { isVisible: showUtilizationTrend } = useElementVisibility('employer', 'dashboard', 'utilization_trend');
  const { isVisible: showSpendByType } = useElementVisibility('employer', 'dashboard', 'spend_by_type');
  const { isVisible: showSegmentComparison } = useElementVisibility('employer', 'dashboard', 'segment_comparison');
  const { isVisible: showCumulativeSpend } = useElementVisibility('employer', 'dashboard', 'cumulative_spend');
  const { isVisible: showTopBenefits } = useElementVisibility('employer', 'dashboard', 'top_benefits');
  const { isVisible: showZombieSpend } = useElementVisibility('employer', 'dashboard', 'zombie_spend');
  const { isVisible: showRecommendations } = useElementVisibility('employer', 'dashboard', 'recommendations');
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl lg:text-3xl font-display font-bold tracking-tight">
            {isExecutive ? 'Executive Dashboard' : 'HR Operations Dashboard'}
          </h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {isExecutive ? 'Strategic overview • December 2024' : 'Operational tasks • December 2024'}
          </p>
        </div>
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-3 py-1 w-fit">
          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
          Program Health: Good
        </Badge>
      </div>

      {/* Operational Quick Actions (Only in HR mode) */}
      {isOperational && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Link to="/employer/claims">
            <Card className="hover:shadow-md transition-all cursor-pointer border-amber-500/20 bg-gradient-to-br from-card to-amber-500/5">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10">
                  <FileCheck className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600">{metrics.pendingClaims}</p>
                  <p className="text-xs text-muted-foreground">Pending Claims</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/employer/segments">
            <Card className="hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{metrics.totalEmployees}</p>
                  <p className="text-xs text-muted-foreground">Employees</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/employer/integrations">
            <Card className="hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10">
                  <Target className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-600">92%</p>
                  <p className="text-xs text-muted-foreground">Data Coverage</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/employer/zombie">
            <Card className="hover:shadow-md transition-all cursor-pointer border-amber-500/20">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10">
                  <Ghost className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600">{formatCurrency(metrics.zombieSpend)}</p>
                  <p className="text-xs text-muted-foreground">Zombie Spend</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      )}

      {/* Executive KPI Cards - Primary Row */}
      {showKpiCards && (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Employees */}
        <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-accent/5 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-accent/10">
                <Users className="w-5 h-5 text-accent" />
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-0 text-[10px] font-semibold">
                <TrendingUp className="w-3 h-3 mr-1" />
                +{metrics.employeeChange} YTD
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold tracking-tight">{metrics.totalEmployees}</p>
              <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/50">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Active headcount</span>
                <span className="font-medium text-accent">100%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Annual Budget */}
        <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-blue-500/5 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue-500/10">
                <DollarSign className="w-5 h-5 text-blue-500" />
              </div>
              <InfoTooltip formula="Sum of all benefit budgets for FY2024" dataSource="Finance System" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold tracking-tight">{formatCurrency(metrics.annualBudget)}</p>
              <p className="text-sm font-medium text-muted-foreground">Annual Budget</p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/50 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Spent to date</span>
                <span className="font-medium">{formatCurrency(metrics.budgetUsed)}</span>
              </div>
              <Progress value={budgetUtilization} className="h-1.5" />
            </div>
          </CardContent>
        </Card>

        {/* Utilization Rate */}
        <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-emerald-500/5 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-emerald-500/10">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-0 text-[10px] font-semibold">
                <TrendingUp className="w-3 h-3 mr-1" />
                +{metrics.utilizationChange}%
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold tracking-tight text-emerald-600">{metrics.utilizationRate}%</p>
              <p className="text-sm font-medium text-muted-foreground">Utilization Rate</p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/50">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Target: 75%</span>
                <span className="font-medium text-amber-600">11% below</span>
              </div>
              <Progress value={metrics.utilizationRate} className="h-1.5 mt-2" />
            </div>
          </CardContent>
        </Card>

        {/* Zombie Spend */}
        <Card className="relative overflow-hidden border-amber-500/20 bg-gradient-to-br from-card to-amber-500/5 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-amber-500/10">
                <Ghost className="w-5 h-5 text-amber-500" />
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-0 text-[10px] font-semibold">
                <TrendingDown className="w-3 h-3 mr-1" />
                {metrics.zombieChange}% vs Q3
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold tracking-tight text-amber-600">{formatCurrency(metrics.zombieSpend)}</p>
              <p className="text-sm font-medium text-muted-foreground">Zombie Spend</p>
            </div>
            <div className="mt-4 pt-3 border-t border-amber-500/20">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Recovery potential</span>
                <span className="font-medium text-amber-600">AED 5.1M</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      )}

      {/* Secondary KPI Cards */}
      {showSecondaryKpi && (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Satisfaction */}
        <Card className="border-border/50 hover:shadow-md transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-violet-500/10 shrink-0">
                <Smile className="w-5 h-5 text-violet-500" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold tracking-tight">{metrics.satisfactionScore}<span className="text-base text-muted-foreground font-normal">/5</span></p>
                  <InfoTooltip 
                    formula="Average of all employee ratings across 4 categories: Overall Satisfaction, Benefits Package, HR Communication, and Support Quality. Each category rated 1-5 stars."
                    dataSource="Monthly Employee Satisfaction Survey"
                  />
                </div>
                <p className="text-xs text-muted-foreground truncate">Employee Satisfaction</p>
              </div>
            </div>
            <div className="mt-3 flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <div 
                  key={star} 
                  className={`h-1.5 flex-1 rounded-full ${star <= Math.round(metrics.satisfactionScore) ? 'bg-violet-500' : 'bg-muted'}`} 
                />
              ))}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Based on {metrics.totalEmployees * 0.72 | 0} responses ({((metrics.totalEmployees * 0.72 / metrics.totalEmployees) * 100).toFixed(0)}% participation)
            </div>
          </CardContent>
        </Card>

        {/* Retention */}
        <Card className="border-border/50 hover:shadow-md transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 shrink-0">
                <Target className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold tracking-tight text-emerald-600">{metrics.retentionRate}%</p>
                  <span className="text-xs text-emerald-600 font-medium">+{metrics.retentionChange}%</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">Retention Rate</p>
              </div>
            </div>
            <div className="mt-3">
              <Progress value={metrics.retentionRate} className="h-1.5 [&>div]:bg-emerald-500" />
            </div>
          </CardContent>
        </Card>

        {/* Pending Claims */}
        <Card className="border-border/50 hover:shadow-md transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-amber-500/10 shrink-0">
                <FileCheck className="w-5 h-5 text-amber-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-2xl font-bold tracking-tight text-amber-600">{metrics.pendingClaims}</p>
                <p className="text-xs text-muted-foreground truncate">Pending Claims</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Avg processing</span>
              <span className="font-medium">{metrics.avgProcessingDays} days</span>
            </div>
          </CardContent>
        </Card>

        {/* ROI */}
        <Card className="border-border/50 hover:shadow-md transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-blue-500/10 shrink-0">
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-2xl font-bold tracking-tight text-blue-600">{metrics.roi}x</p>
                <p className="text-xs text-muted-foreground truncate">ROI Indicator</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Benchmark</span>
              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-0">Above avg</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
      )}

      {/* Executive Summary Card */}
      {showExecutiveInsights && (
      <Card className="border-accent/20 overflow-hidden bg-gradient-to-r from-card via-card to-accent/5">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-accent" />
            <h2 className="font-display font-semibold text-lg">Key Insights This Month</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {executiveInsights.map((insight, index) => (
              <div 
                key={index}
                className={`p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
                  insight.type === 'success' ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40' :
                  insight.type === 'warning' ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40' :
                  'bg-blue-500/5 border-blue-500/20 hover:border-blue-500/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  <insight.icon className={`w-5 h-5 mt-0.5 shrink-0 ${
                    insight.type === 'success' ? 'text-emerald-500' :
                    insight.type === 'warning' ? 'text-amber-500' :
                    'text-blue-500'
                  }`} />
                  <div>
                    <p className="font-semibold text-sm">{insight.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      )}

      {/* Charts Row 1 */}
      {(showUtilizationTrend || showSpendByType) && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {showUtilizationTrend && (
        <ChartContainer title="Utilization Trend" formula="Monthly utilization % over time" dataSource="Benefits Tracker">
          <AnimatedLineChart data={utilizationTrend} showArea={true} primaryLabel="Utilization" formatValue={(v) => `${v}%`} height={240} yDomain={[50, 70]} showLegend={true} />
        </ChartContainer>
        )}
        {showSpendByType && (
        <ChartContainer title="Spend by Benefit Type" formula="Budget vs actual spend per category" dataSource="Finance">
          <AnimatedBarChart data={spendByType} layout="horizontal" showSecondary={true} primaryLabel="Spent (AED M)" secondaryLabel="Budget (AED M)" formatValue={(v) => `AED ${v}M`} height={240} showLegend={true} />
        </ChartContainer>
        )}
      </div>
      )}

      {/* Charts Row 2 */}
      {(showSegmentComparison || showCumulativeSpend) && (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {showSegmentComparison && (
        <div className="lg:col-span-5">
          <ChartContainer title="Segment Comparison" formula="Tech vs Non-Tech utilization" dataSource="Analytics">
            <AnimatedRadarChart data={segmentRadarData} height={280} showSecondary={true} primaryLabel="Tech Teams" secondaryLabel="Non-Tech" showLegend={true} />
          </ChartContainer>
        </div>
        )}
        {showCumulativeSpend && (
        <div className={showSegmentComparison ? "lg:col-span-7" : "lg:col-span-12"}>
          <ChartContainer title="Cumulative Spend Tracking" formula="Year-to-date spend by category" dataSource="Finance">
            <StackedAreaChart data={cumulativeSpendData} stacks={spendStacks} height={280} formatValue={(v) => `${v}M`} />
          </ChartContainer>
        </div>
        )}
          <ChartContainer title="Cumulative Spend Tracking" formula="Year-to-date spend by category" dataSource="Finance">
            <StackedAreaChart data={cumulativeSpendData} stacks={spendStacks} height={280} formatValue={(v) => `${v}M`} />
          </ChartContainer>
      </div>
      )}

      {/* Bottom Section */}
      {(showTopBenefits || showZombieSpend) && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {showTopBenefits && (
        <>
        <ChartContainer title="Top Utilized Benefits">
          <ProgressBarList items={topBenefits.map(b => ({ ...b, color: 'success' as const }))} size="md" />
        </ChartContainer>
        <ChartContainer title="Least Utilized Benefits">
          <ProgressBarList items={leastUsed.map(b => ({ ...b, color: 'warning' as const }))} size="md" />
        </ChartContainer>
        </>
        )}
        {showZombieSpend && (
        <Card className="border-amber-500/20 bg-gradient-to-b from-card to-amber-500/5">
          <CardHeader className="pb-3 border-b border-amber-500/10">
            <CardTitle className="text-base font-display font-semibold flex items-center gap-2">
              <Ghost className="w-4 h-4 text-amber-500" />
              Zombie Spend Candidates
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {zombieCandidates.map((z) => (
              <div key={z.benefit} className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 hover:border-amber-500/30 transition-colors cursor-pointer">
                <p className="text-sm font-semibold truncate">{z.benefit}</p>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span className="font-medium text-amber-600">AED {(z.amount / 1000000).toFixed(1)}M unused</span>
                  <span>{z.employees} employees</span>
                </div>
              </div>
            ))}
            <Link to="/employer/zombie">
              <Button variant="ghost" size="sm" className="w-full text-amber-600 hover:text-amber-700 hover:bg-amber-500/10">
                View Full Analysis <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
        )}
      </div>
      )}

      {/* Benefit Recommendations for Employers */}
      {showRecommendations && (
      <EmployerBenefitRecommendations employeeCount={metrics.totalEmployees} />
      )}
    </div>
  );
}
