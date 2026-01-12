import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Users, DollarSign, TrendingUp, Smile, Ghost, FileCheck, Target, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChartContainer, AnimatedBarChart, AnimatedLineChart, ProgressBarList } from '@/components/charts';

const metrics = {
  totalEmployees: 156,
  annualBudget: 62000000,
  utilizationRate: 64,
  satisfactionScore: 4.2,
  retentionRate: 92,
  zombieSpend: 8500000,
  pendingClaims: 12,
  roi: 3.2,
};

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

export default function EmployerDashboard() {
  const formatCurrency = (value: number) => `AED ${(value / 1000000).toFixed(1)}M`;
  
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-1">
        <h1 className="text-2xl font-display font-bold tracking-tight">Employer Dashboard</h1>
        <p className="text-muted-foreground">Benefits program performance overview</p>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Users, value: metrics.totalEmployees.toString(), label: 'Total Employees', formula: 'Active employees count', source: 'HR System', color: 'accent' },
          { icon: DollarSign, value: formatCurrency(metrics.annualBudget), label: 'Annual Budget', formula: 'Sum of all benefit budgets', source: 'Finance', color: 'accent' },
          { icon: TrendingUp, value: `${metrics.utilizationRate}%`, label: 'Utilization Rate', formula: 'Utilized / Available × 100', source: 'Benefits Tracker', color: 'accent' },
          { icon: Ghost, value: formatCurrency(metrics.zombieSpend), label: 'Zombie Spend', formula: 'Budget - Utilized spend', source: 'Analytics', color: 'warning' },
        ].map((metric, index) => (
          <Card 
            key={metric.label} 
            className="metric-card group hover:border-accent/30 transition-all duration-300"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className={`p-2 rounded-lg ${metric.color === 'warning' ? 'bg-amber-500/10' : 'bg-accent/10'} group-hover:scale-105 transition-transform`}>
                <metric.icon className={`w-4 h-4 ${metric.color === 'warning' ? 'text-amber-500' : 'text-accent'}`} />
              </div>
              <InfoTooltip formula={metric.formula} dataSource={metric.source} />
            </div>
            <p className={`text-xl font-bold mt-3 tracking-tight ${metric.color === 'warning' ? 'text-amber-500' : ''}`}>
              {metric.value}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{metric.label}</p>
          </Card>
        ))}
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Smile, value: `${metrics.satisfactionScore}/5`, label: 'Satisfaction', color: 'accent' },
          { icon: Target, value: `${metrics.retentionRate}%`, label: 'Retention', color: 'accent' },
          { icon: FileCheck, value: metrics.pendingClaims.toString(), label: 'Pending Claims', color: 'warning' },
          { icon: TrendingUp, value: `${metrics.roi}x`, label: 'ROI Indicator', color: 'success' },
        ].map((metric, index) => (
          <Card 
            key={metric.label} 
            className="metric-card"
            style={{ animationDelay: `${(index + 4) * 50}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer 
          title="Utilization Trend"
          formula="Monthly utilization % over time"
          dataSource="Benefits Tracker"
        >
          <AnimatedLineChart
            data={utilizationTrend}
            showArea={true}
            primaryLabel="Utilization"
            formatValue={(v) => `${v}%`}
            height={280}
            yDomain={[50, 70]}
          />
        </ChartContainer>

        <ChartContainer 
          title="Spend by Benefit Type"
          formula="Budget vs actual spend per category"
          dataSource="Finance"
        >
          <AnimatedBarChart
            data={spendByType}
            layout="horizontal"
            showSecondary={true}
            primaryLabel="Spent"
            secondaryLabel="Budget"
            formatValue={(v) => `AED ${v}M`}
            height={280}
            gradientId="employerBar"
          />
        </ChartContainer>
      </div>

      {/* Utilization Breakdown + Zombie Candidates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartContainer title="Top Utilized Benefits">
          <ProgressBarList 
            items={topBenefits.map(b => ({ ...b, color: 'success' as const }))}
            size="md"
          />
        </ChartContainer>

        <ChartContainer title="Least Utilized Benefits">
          <ProgressBarList 
            items={leastUsed.map(b => ({ ...b, color: 'warning' as const }))}
            size="md"
          />
        </ChartContainer>

        <Card className="overflow-hidden border-amber-500/20 bg-gradient-to-b from-card to-amber-500/5">
          <CardHeader className="pb-3 border-b border-amber-500/10">
            <CardTitle className="text-base font-display font-semibold flex items-center gap-2">
              <Ghost className="w-4 h-4 text-amber-500" />
              Zombie Spend Candidates
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {zombieCandidates.map((z, index) => (
              <div 
                key={z.benefit} 
                className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 hover:border-amber-500/30 transition-colors cursor-pointer group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <p className="text-sm font-semibold group-hover:text-amber-600 transition-colors">{z.benefit}</p>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span className="font-medium text-amber-600">AED {(z.amount / 1000000).toFixed(1)}M unused</span>
                  <span>{z.employees} employees</span>
                </div>
              </div>
            ))}
            <Link to="/employer/zombie">
              <Button variant="ghost" size="sm" className="w-full mt-2 text-amber-600 hover:text-amber-700 hover:bg-amber-500/10">
                View Full Analysis
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
