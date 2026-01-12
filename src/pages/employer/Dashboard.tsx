import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Progress } from '@/components/ui/progress';
import { Users, DollarSign, TrendingUp, Smile, Ghost, FileCheck, Target, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

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

const topBenefits = [
  { name: 'Housing Allowance', utilization: 95 },
  { name: 'Health Insurance', utilization: 78 },
  { name: 'Transport', utilization: 72 },
];

const leastUsed = [
  { name: 'Learning & Dev', utilization: 38 },
  { name: 'Wellbeing', utilization: 45 },
  { name: 'Financial Planning', utilization: 52 },
];

const utilizationTrend = [
  { month: 'Jul', utilization: 58 },
  { month: 'Aug', utilization: 59 },
  { month: 'Sep', utilization: 61 },
  { month: 'Oct', utilization: 60 },
  { month: 'Nov', utilization: 63 },
  { month: 'Dec', utilization: 64 },
];

const spendByType = [
  { name: 'Cash', budget: 35, spent: 32 },
  { name: 'Health', budget: 12, spent: 9 },
  { name: 'Time Off', budget: 8, spent: 7 },
  { name: 'Growth', budget: 5, spent: 2 },
  { name: 'Wellbeing', budget: 2, spent: 1 },
];

const zombieCandidates = [
  { benefit: 'Learning & Development', amount: 2800000, employees: 45 },
  { benefit: 'Wellbeing Program', amount: 1200000, employees: 60 },
  { benefit: 'Flight Tickets (Singles)', amount: 950000, employees: 25 },
];

export default function EmployerDashboard() {
  const formatCurrency = (value: number) => `AED ${(value / 1000000).toFixed(1)}M`;
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold">Employer Dashboard</h1>
        <p className="text-muted-foreground">Benefits program performance overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="metric-card">
          <div className="flex items-start justify-between">
            <Users className="w-5 h-5 text-accent" />
            <InfoTooltip formula="Active employees count" dataSource="HR System" />
          </div>
          <p className="stat-value mt-3">{metrics.totalEmployees}</p>
          <p className="stat-label">Total Employees</p>
        </Card>
        
        <Card className="metric-card">
          <div className="flex items-start justify-between">
            <DollarSign className="w-5 h-5 text-accent" />
            <InfoTooltip formula="Sum of all benefit budgets" dataSource="Finance" />
          </div>
          <p className="stat-value mt-3">{formatCurrency(metrics.annualBudget)}</p>
          <p className="stat-label">Annual Budget</p>
        </Card>
        
        <Card className="metric-card">
          <div className="flex items-start justify-between">
            <TrendingUp className="w-5 h-5 text-accent" />
            <InfoTooltip formula="Utilized / Available × 100" dataSource="Benefits Tracker" />
          </div>
          <p className="stat-value mt-3">{metrics.utilizationRate}%</p>
          <p className="stat-label">Utilization Rate</p>
        </Card>
        
        <Card className="metric-card">
          <div className="flex items-start justify-between">
            <Ghost className="w-5 h-5 text-amber-500" />
            <InfoTooltip formula="Budget - Utilized spend" dataSource="Analytics" />
          </div>
          <p className="stat-value mt-3 text-amber-500">{formatCurrency(metrics.zombieSpend)}</p>
          <p className="stat-label">Zombie Spend</p>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="metric-card">
          <div className="flex items-center gap-3">
            <Smile className="w-5 h-5 text-accent" />
            <div>
              <p className="stat-value">{metrics.satisfactionScore}/5</p>
              <p className="stat-label">Satisfaction</p>
            </div>
          </div>
        </Card>
        <Card className="metric-card">
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-accent" />
            <div>
              <p className="stat-value">{metrics.retentionRate}%</p>
              <p className="stat-label">Retention</p>
            </div>
          </div>
        </Card>
        <Card className="metric-card">
          <div className="flex items-center gap-3">
            <FileCheck className="w-5 h-5 text-amber-500" />
            <div>
              <p className="stat-value text-amber-500">{metrics.pendingClaims}</p>
              <p className="stat-label">Pending Claims</p>
            </div>
          </div>
        </Card>
        <Card className="metric-card">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <div>
              <p className="stat-value text-green-500">{metrics.roi}x</p>
              <p className="stat-label">ROI Indicator</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Utilization Trend */}
        <Card className="card-elevated">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display flex items-center gap-2">
              Utilization Trend
              <InfoTooltip formula="Monthly utilization % over time" dataSource="Benefits Tracker" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={utilizationTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[50, 70]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip 
                    formatter={(value: number) => [`${value}%`, 'Utilization']}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Line type="monotone" dataKey="utilization" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Spend by Benefit Type */}
        <Card className="card-elevated">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display flex items-center gap-2">
              Spend by Benefit Type (AED M)
              <InfoTooltip formula="Budget vs actual spend per category" dataSource="Finance" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={spendByType}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [`AED ${value}M`, '']}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Legend />
                  <Bar dataKey="budget" name="Budget" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="spent" name="Spent" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Utilization Breakdown + Zombie Candidates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-base font-display">Top Utilized Benefits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topBenefits.map((b) => (
              <div key={b.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{b.name}</span>
                  <span className="font-medium text-green-600">{b.utilization}%</span>
                </div>
                <Progress value={b.utilization} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-base font-display">Least Utilized Benefits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {leastUsed.map((b) => (
              <div key={b.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{b.name}</span>
                  <span className="font-medium text-amber-600">{b.utilization}%</span>
                </div>
                <Progress value={b.utilization} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="card-elevated border-amber-500/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <Ghost className="w-4 h-4 text-amber-500" />
              Zombie Spend Candidates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {zombieCandidates.map((z) => (
              <div key={z.benefit} className="p-2 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <p className="text-sm font-medium">{z.benefit}</p>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>AED {(z.amount / 1000000).toFixed(1)}M unused</span>
                  <span>{z.employees} employees</span>
                </div>
              </div>
            ))}
            <Link to="/employer/zombie">
              <Button variant="ghost" size="sm" className="w-full mt-2">
                View Details
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
