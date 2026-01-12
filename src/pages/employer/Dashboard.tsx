import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Progress } from '@/components/ui/progress';
import { Users, DollarSign, TrendingUp, Smile, Ghost, FileCheck, Target } from 'lucide-react';

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
            <Ghost className="w-5 h-5 text-warning" />
            <InfoTooltip formula="Budget - Utilized spend" dataSource="Analytics" />
          </div>
          <p className="stat-value mt-3 text-warning">{formatCurrency(metrics.zombieSpend)}</p>
          <p className="stat-label">Zombie Spend</p>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="metric-card">
          <div className="flex items-center gap-3">
            <Smile className="w-5 h-5 text-accent" />
            <div>
              <p className="stat-value">{metrics.satisfactionScore}/5</p>
              <p className="stat-label">Satisfaction Score</p>
            </div>
          </div>
        </Card>
        <Card className="metric-card">
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-accent" />
            <div>
              <p className="stat-value">{metrics.retentionRate}%</p>
              <p className="stat-label">Retention Rate</p>
            </div>
          </div>
        </Card>
        <Card className="metric-card">
          <div className="flex items-center gap-3">
            <FileCheck className="w-5 h-5 text-accent" />
            <div>
              <p className="stat-value">{metrics.pendingClaims}</p>
              <p className="stat-label">Pending Claims</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Utilization Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-display">Top Utilized Benefits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topBenefits.map((b) => (
              <div key={b.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{b.name}</span>
                  <span className="font-medium text-success">{b.utilization}%</span>
                </div>
                <Progress value={b.utilization} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-display">Least Utilized Benefits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {leastUsed.map((b) => (
              <div key={b.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{b.name}</span>
                  <span className="font-medium text-warning">{b.utilization}%</span>
                </div>
                <Progress value={b.utilization} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}