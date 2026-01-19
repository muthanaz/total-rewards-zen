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
  PieChart,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { ChartContainer, AnimatedDonutChart, AnimatedLineChart } from '@/components/charts';

const executiveMetrics = {
  totalCompensation: 62000000,
  budgetUtilized: 39680000,
  utilizationRate: 64,
  targetUtilization: 75,
  employeeCount: 156,
  costPerEmployee: 397436,
  industryBenchmark: 380000,
  roi: 3.2,
  roiBenchmark: 2.8,
  retentionRate: 92,
  retentionBenchmark: 88,
  zombieSpend: 8500000,
  recoveryPotential: 5100000,
};

const strategicPriorities = [
  {
    priority: 'Critical',
    title: 'Utilization Gap',
    metric: '11% below target',
    impact: 'AED 6.8M at risk',
    action: 'Review underutilized benefits',
    path: '/employer/zombie',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
  },
  {
    priority: 'High',
    title: 'L&D Investment',
    metric: '38% utilization',
    impact: 'Talent development gap',
    action: 'Launch awareness campaign',
    path: '/employer/recommendations',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
  },
  {
    priority: 'Monitor',
    title: 'Cost Efficiency',
    metric: 'AED 17K above benchmark',
    impact: 'Competitive positioning',
    action: 'Benchmark analysis',
    path: '/employer/spend',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
];

const utilizationTrend = [
  { name: 'Q1', value: 58 },
  { name: 'Q2', value: 61 },
  { name: 'Q3', value: 62 },
  { name: 'Q4', value: 64 },
];

const spendAllocation = [
  { name: 'Cash Allowances', value: 45, color: 'hsl(160 84% 39%)' },
  { name: 'Health & Insurance', value: 25, color: 'hsl(217 91% 60%)' },
  { name: 'Time & Leave', value: 15, color: 'hsl(271 81% 56%)' },
  { name: 'Growth & L&D', value: 10, color: 'hsl(38 92% 50%)' },
  { name: 'Wellbeing', value: 5, color: 'hsl(330 81% 60%)' },
];

export function ExecutiveDashboard() {
  const formatCurrency = (value: number) => `AED ${(value / 1000000).toFixed(1)}M`;
  const formatK = (value: number) => `AED ${(value / 1000).toFixed(0)}K`;

  return (
    <div className="space-y-6">
      {/* Executive Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold tracking-tight">
            Total Rewards Overview
          </h1>
          <p className="text-muted-foreground">Strategic C&B performance • FY 2024</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={executiveMetrics.utilizationRate >= executiveMetrics.targetUtilization 
            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
            : "bg-amber-500/10 text-amber-600 border-amber-500/20"
          }>
            {executiveMetrics.utilizationRate >= executiveMetrics.targetUtilization ? (
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
            )}
            Program Health: {executiveMetrics.utilizationRate >= executiveMetrics.targetUtilization ? 'On Track' : 'Needs Attention'}
          </Badge>
        </div>
      </div>

      {/* Strategic KPIs - C-Suite Focus */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Investment */}
        <Card className="border-border/50 bg-gradient-to-br from-card to-primary/5">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <InfoTooltip formula="Total annual benefits budget" dataSource="Finance" />
            </div>
            <p className="text-2xl lg:text-3xl font-bold tracking-tight">{formatCurrency(executiveMetrics.totalCompensation)}</p>
            <p className="text-sm text-muted-foreground mt-1">Total Investment</p>
            <div className="mt-3 pt-3 border-t border-border/50">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">YTD Spend</span>
                <span className="font-medium">{formatCurrency(executiveMetrics.budgetUtilized)}</span>
              </div>
              <Progress value={64} className="h-1.5 mt-2" />
            </div>
          </CardContent>
        </Card>

        {/* Cost per Employee */}
        <Card className="border-border/50 bg-gradient-to-br from-card to-blue-500/5">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <Badge variant="outline" className={executiveMetrics.costPerEmployee <= executiveMetrics.industryBenchmark 
                ? "bg-emerald-500/10 text-emerald-600 border-0 text-[10px]" 
                : "bg-amber-500/10 text-amber-600 border-0 text-[10px]"
              }>
                {executiveMetrics.costPerEmployee <= executiveMetrics.industryBenchmark ? 'Below' : 'Above'} Benchmark
              </Badge>
            </div>
            <p className="text-2xl lg:text-3xl font-bold tracking-tight">{formatK(executiveMetrics.costPerEmployee)}</p>
            <p className="text-sm text-muted-foreground mt-1">Cost per Employee</p>
            <div className="mt-3 pt-3 border-t border-border/50">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Industry Avg</span>
                <span className="font-medium">{formatK(executiveMetrics.industryBenchmark)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ROI */}
        <Card className="border-border/50 bg-gradient-to-br from-card to-emerald-500/5">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-0 text-[10px]">
                <TrendingUp className="w-3 h-3 mr-1" />
                Above Benchmark
              </Badge>
            </div>
            <p className="text-2xl lg:text-3xl font-bold tracking-tight text-emerald-600">{executiveMetrics.roi}x</p>
            <p className="text-sm text-muted-foreground mt-1">Benefits ROI</p>
            <div className="mt-3 pt-3 border-t border-border/50">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Benchmark</span>
                <span className="font-medium">{executiveMetrics.roiBenchmark}x</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Retention Impact */}
        <Card className="border-border/50 bg-gradient-to-br from-card to-violet-500/5">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-violet-500/10">
                <Target className="w-5 h-5 text-violet-500" />
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-0 text-[10px]">
                +{executiveMetrics.retentionRate - executiveMetrics.retentionBenchmark}% vs Market
              </Badge>
            </div>
            <p className="text-2xl lg:text-3xl font-bold tracking-tight text-violet-600">{executiveMetrics.retentionRate}%</p>
            <p className="text-sm text-muted-foreground mt-1">Retention Rate</p>
            <div className="mt-3 pt-3 border-t border-border/50">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Market Avg</span>
                <span className="font-medium">{executiveMetrics.retentionBenchmark}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strategic Priorities - Action-Oriented */}
      <Card className="border-primary/20 bg-gradient-to-r from-card via-card to-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg font-display">Strategic Priorities</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {strategicPriorities.map((priority, index) => (
              <Link key={index} to={priority.path}>
                <div className={`p-4 rounded-xl border ${priority.borderColor} ${priority.bgColor} hover:scale-[1.02] transition-all cursor-pointer`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className={`${priority.color} border-0 ${priority.bgColor} text-xs font-semibold`}>
                      {priority.priority}
                    </Badge>
                  </div>
                  <h3 className="font-semibold mb-1">{priority.title}</h3>
                  <p className={`text-lg font-bold ${priority.color}`}>{priority.metric}</p>
                  <p className="text-xs text-muted-foreground mt-1">{priority.impact}</p>
                  <div className="flex items-center gap-1 mt-3 text-xs font-medium text-primary">
                    {priority.action}
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Utilization Trend */}
        <ChartContainer title="Utilization Trend" formula="Quarterly benefit utilization %" dataSource="Analytics">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold">{executiveMetrics.utilizationRate}%</span>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-0 text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                +6% YoY
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Target: {executiveMetrics.targetUtilization}%
            </div>
          </div>
          <AnimatedLineChart 
            data={utilizationTrend} 
            showArea={true} 
            primaryLabel="Utilization" 
            formatValue={(v) => `${v}%`} 
            height={180}
            yDomain={[50, 70]}
          />
        </ChartContainer>

        {/* Spend Allocation */}
        <ChartContainer title="Investment Allocation" formula="% of total benefits budget by category" dataSource="Finance">
          <AnimatedDonutChart 
            data={spendAllocation} 
            height={240}
          />
        </ChartContainer>
      </div>

      {/* Value Recovery Opportunity */}
      <Card className="border-amber-500/20 bg-gradient-to-r from-card to-amber-500/5">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-amber-500/10">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg">Unrealized Value Opportunity</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  {formatCurrency(executiveMetrics.zombieSpend)} in allocated benefits remain underutilized
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Recovery Potential</p>
                    <p className="text-xl font-bold text-amber-600">{formatCurrency(executiveMetrics.recoveryPotential)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Affected Benefits</p>
                    <p className="text-xl font-bold">4 categories</p>
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
    </div>
  );
}
