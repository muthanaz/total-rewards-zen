import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Badge } from '@/components/ui/badge';
import { Users, DollarSign, TrendingUp, TrendingDown, Smile, Ghost, FileCheck, Target, ArrowRight, AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react';
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

const metrics = {
  totalEmployees: 156,
  annualBudget: 62000000,
  utilizationRate: 64,
  utilizationChange: 3.2,
  satisfactionScore: 4.2,
  retentionRate: 92,
  zombieSpend: 8500000,
  zombieChange: -12,
  pendingClaims: 12,
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
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Executive Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl lg:text-3xl font-display font-bold tracking-tight">Executive Dashboard</h1>
          <p className="text-muted-foreground">Benefits program performance • December 2024</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            <TrendingUp className="w-3 h-3 mr-1" />
            Program Health: Good
          </Badge>
        </div>
      </div>

      {/* Executive Summary Card */}
      <Card className="executive-card border-accent/20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-primary/5 pointer-events-none" />
        <CardContent className="p-6 relative">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-accent" />
            <h2 className="font-display font-semibold text-lg">Key Insights This Month</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {executiveInsights.map((insight, index) => (
              <div 
                key={index}
                className={`p-4 rounded-xl border ${
                  insight.type === 'success' ? 'bg-emerald-500/5 border-emerald-500/20' :
                  insight.type === 'warning' ? 'bg-amber-500/5 border-amber-500/20' :
                  'bg-blue-500/5 border-blue-500/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <insight.icon className={`w-5 h-5 mt-0.5 ${
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

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="metric-card group hover:border-accent/30 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-accent/10 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5 text-accent" />
            </div>
            <InfoTooltip formula="Active employees count" dataSource="HR System" />
          </div>
          <p className="text-2xl font-bold mt-4 tracking-tight">{metrics.totalEmployees}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Employees</p>
        </Card>

        <Card className="metric-card group hover:border-accent/30 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-accent/10 group-hover:scale-105 transition-transform">
              <DollarSign className="w-5 h-5 text-accent" />
            </div>
            <InfoTooltip formula="Sum of all benefit budgets" dataSource="Finance" />
          </div>
          <p className="text-2xl font-bold mt-4 tracking-tight">{formatCurrency(metrics.annualBudget)}</p>
          <p className="text-xs text-muted-foreground mt-1">Annual Budget</p>
        </Card>

        <Card className="metric-card group hover:border-accent/30 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-600">
              <TrendingUp className="w-3 h-3" />
              +{metrics.utilizationChange}%
            </div>
          </div>
          <p className="text-2xl font-bold mt-4 tracking-tight">{metrics.utilizationRate}%</p>
          <p className="text-xs text-muted-foreground mt-1">Utilization Rate</p>
        </Card>

        <Card className="metric-card group hover:border-amber-500/30 transition-all duration-300 border-amber-500/20">
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-amber-500/10 group-hover:scale-105 transition-transform">
              <Ghost className="w-5 h-5 text-amber-500" />
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-600">
              <TrendingDown className="w-3 h-3" />
              {metrics.zombieChange}%
            </div>
          </div>
          <p className="text-2xl font-bold mt-4 tracking-tight text-amber-600">{formatCurrency(metrics.zombieSpend)}</p>
          <p className="text-xs text-muted-foreground mt-1">Zombie Spend</p>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Smile, value: `${metrics.satisfactionScore}/5`, label: 'Satisfaction', color: 'accent' },
          { icon: Target, value: `${metrics.retentionRate}%`, label: 'Retention', color: 'accent' },
          { icon: FileCheck, value: metrics.pendingClaims.toString(), label: 'Pending Claims', color: 'warning' },
          { icon: TrendingUp, value: `${metrics.roi}x`, label: 'ROI Indicator', color: 'success' },
        ].map((metric, index) => (
          <Card key={metric.label} className="metric-card">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg shrink-0 ${
                metric.color === 'warning' ? 'bg-amber-500/10' : 
                metric.color === 'success' ? 'bg-emerald-500/10' : 'bg-accent/10'
              }`}>
                <metric.icon className={`w-4 h-4 ${
                  metric.color === 'warning' ? 'text-amber-500' : 
                  metric.color === 'success' ? 'text-emerald-500' : 'text-accent'
                }`} />
              </div>
              <div>
                <p className={`text-lg font-bold ${
                  metric.color === 'warning' ? 'text-amber-500' : 
                  metric.color === 'success' ? 'text-emerald-500' : ''
                }`}>{metric.value}</p>
                <p className="text-xs text-muted-foreground">{metric.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartContainer title="Utilization Trend" formula="Monthly utilization % over time" dataSource="Benefits Tracker">
          <AnimatedLineChart data={utilizationTrend} showArea={true} primaryLabel="Utilization" formatValue={(v) => `${v}%`} height={240} yDomain={[50, 70]} showLegend={true} />
        </ChartContainer>
        <ChartContainer title="Spend by Benefit Type" formula="Budget vs actual spend per category" dataSource="Finance">
          <AnimatedBarChart data={spendByType} layout="horizontal" showSecondary={true} primaryLabel="Spent (AED M)" secondaryLabel="Budget (AED M)" formatValue={(v) => `AED ${v}M`} height={240} showLegend={true} />
        </ChartContainer>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5">
          <ChartContainer title="Segment Comparison" formula="Tech vs Non-Tech utilization" dataSource="Analytics">
            <AnimatedRadarChart data={segmentRadarData} height={280} showSecondary={true} primaryLabel="Tech Teams" secondaryLabel="Non-Tech" showLegend={true} />
          </ChartContainer>
        </div>
        <div className="lg:col-span-7">
          <ChartContainer title="Cumulative Spend Tracking" formula="Year-to-date spend by category" dataSource="Finance">
            <StackedAreaChart data={cumulativeSpendData} stacks={spendStacks} height={280} formatValue={(v) => `${v}M`} />
          </ChartContainer>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartContainer title="Top Utilized Benefits">
          <ProgressBarList items={topBenefits.map(b => ({ ...b, color: 'success' as const }))} size="md" />
        </ChartContainer>
        <ChartContainer title="Least Utilized Benefits">
          <ProgressBarList items={leastUsed.map(b => ({ ...b, color: 'warning' as const }))} size="md" />
        </ChartContainer>
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
      </div>
    </div>
  );
}
