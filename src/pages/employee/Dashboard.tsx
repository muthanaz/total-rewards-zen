import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, TrendingUp, Calendar, Zap, Home, GraduationCap, 
  Heart, Car, Dumbbell, PiggyBank, BookOpen, Plane 
} from 'lucide-react';
import { BENEFIT_TYPE_COLORS, BENEFIT_TYPE_LABELS } from '@/lib/constants';
import { RequestClaimWidget } from '@/components/employee/RequestClaimWidget';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

// Demo data
const metrics = {
  monthlySalary: 35000,
  annualSalary: 420000,
  annualBenefitsValue: 398000,
  benefitsUtilization: 62,
  leaveBalance: 22,
  leaveUsed: 8,
  activatedItems: 7,
};

const benefits = [
  { name: 'Housing Allowance', icon: Home, value: 120000, utilized: 120000, type: 'cash_allowances', area: 'home_living', bullets: ['Paid monthly with salary', 'Can be used for rent or mortgage'] },
  { name: 'Education Allowance', icon: GraduationCap, value: 60000, utilized: 42000, type: 'cash_allowances', area: 'family_parenting', bullets: ['Per child up to 18 years', 'Covers tuition fees only'] },
  { name: 'Health Insurance', icon: Heart, value: 45000, utilized: 12500, type: 'health_protection', area: 'health', bullets: ['Includes dental and optical', 'Covers spouse and children'] },
  { name: 'Transport Allowance', icon: Car, value: 24000, utilized: 18000, type: 'cash_allowances', area: 'mobility', bullets: ['Paid monthly with salary', 'Covers fuel and parking'] },
  { name: 'Annual Flight Tickets', icon: Plane, value: 15000, utilized: 15000, type: 'cash_allowances', area: 'lifestyle', bullets: ['For employee and dependents', 'Economy class tickets'] },
  { name: 'Financial Planning', icon: PiggyBank, value: 36000, utilized: 18000, type: 'wealth_ownership', area: 'money', bullets: ['5% employer match', 'Multiple fund options'] },
  { name: 'Wellbeing Program', icon: Dumbbell, value: 6000, utilized: 3200, type: 'wellbeing', area: 'health', bullets: ['Gym membership covered', 'Wellness app subscription'] },
  { name: 'Learning & Development', icon: BookOpen, value: 12000, utilized: 4500, type: 'growth_career', area: 'career', bullets: ['Courses and certifications', 'Pre-approval required'] },
];

// Chart data
const utilizationByType = [
  { name: 'Cash & Allowances', utilized: 195000, total: 219000, fill: 'hsl(var(--chart-1))' },
  { name: 'Health & Protection', utilized: 12500, total: 45000, fill: 'hsl(var(--chart-2))' },
  { name: 'Wealth & Ownership', utilized: 18000, total: 36000, fill: 'hsl(var(--chart-3))' },
  { name: 'Growth & Career', utilized: 4500, total: 12000, fill: 'hsl(var(--chart-4))' },
  { name: 'Wellbeing', utilized: 3200, total: 6000, fill: 'hsl(var(--chart-5))' },
];

const allowanceVsUsed = [
  { name: 'Utilized', value: 233200, color: 'hsl(var(--primary))' },
  { name: 'Remaining', value: 164800, color: 'hsl(var(--muted))' },
];

export default function EmployeeDashboard() {
  const formatCurrency = (value: number) => `AED ${value.toLocaleString()}`;
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground">Your total rewards at a glance</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="metric-card">
          <div className="flex items-start justify-between">
            <DollarSign className="w-5 h-5 text-accent" />
            <InfoTooltip formula="Base salary / 12" dataSource="HR System" lastUpdated="Jan 2026" />
          </div>
          <p className="stat-value mt-3">{formatCurrency(metrics.monthlySalary)}</p>
          <p className="stat-label">Monthly Salary</p>
        </Card>
        
        <Card className="metric-card">
          <div className="flex items-start justify-between">
            <DollarSign className="w-5 h-5 text-accent" />
            <InfoTooltip formula="Monthly × 12" dataSource="HR System" lastUpdated="Jan 2026" />
          </div>
          <p className="stat-value mt-3">{formatCurrency(metrics.annualSalary)}</p>
          <p className="stat-label">Annual Salary</p>
        </Card>
        
        <Card className="metric-card">
          <div className="flex items-start justify-between">
            <TrendingUp className="w-5 h-5 text-accent" />
            <InfoTooltip formula="Sum of all benefit entitlements" dataSource="Benefits System" lastUpdated="Jan 2026" />
          </div>
          <p className="stat-value mt-3">{formatCurrency(metrics.annualBenefitsValue)}</p>
          <p className="stat-label">Annual Benefits</p>
        </Card>
        
        <Card className="metric-card">
          <div className="flex items-start justify-between">
            <Zap className="w-5 h-5 text-accent" />
            <InfoTooltip formula="(Utilized Value / Total Value) × 100" dataSource="Utilization Tracker" lastUpdated="Today" />
          </div>
          <p className="stat-value mt-3">{metrics.benefitsUtilization}%</p>
          <p className="stat-label">Utilization</p>
        </Card>
        
        <Card className="metric-card">
          <div className="flex items-start justify-between">
            <Calendar className="w-5 h-5 text-accent" />
            <InfoTooltip formula="Total - Used" dataSource="Leave System" lastUpdated="Today" />
          </div>
          <p className="stat-value mt-3">{metrics.leaveBalance} days</p>
          <p className="stat-label">Leave Balance</p>
        </Card>
        
        <Card className="metric-card">
          <div className="flex items-start justify-between">
            <Zap className="w-5 h-5 text-accent" />
            <InfoTooltip formula="Count of perk activations" dataSource="Marketplace" lastUpdated="Today" />
          </div>
          <p className="stat-value mt-3">{metrics.activatedItems}</p>
          <p className="stat-label">Activated Perks</p>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Utilization by Benefit Type */}
        <Card className="card-elevated lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              Utilization by Benefit Type
              <InfoTooltip formula="Utilized amount / Total allocation per type" dataSource="Benefits System" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={utilizationByType} layout="vertical">
                  <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: number) => [`AED ${value.toLocaleString()}`, '']}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Legend />
                  <Bar dataKey="utilized" name="Utilized" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="total" name="Total" fill="hsl(var(--muted))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Allowance vs Used Donut */}
        <Card className="card-elevated">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              Overall Usage
              <InfoTooltip formula="Total utilized / Total annual benefits" dataSource="Benefits System" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allowanceVsUsed}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {allowanceVsUsed.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`AED ${value.toLocaleString()}`, '']}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span>Utilized: AED 233K</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-muted" />
                <span>Remaining: AED 165K</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Request Widget + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RequestClaimWidget />
        </div>
        
        {/* Quick Stats */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-lg">Benefit Highlights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-sm font-medium text-green-600">Fully Utilized</p>
              <p className="text-xs text-muted-foreground mt-1">Housing Allowance, Flight Tickets</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-sm font-medium text-amber-600">Room to Use</p>
              <p className="text-xs text-muted-foreground mt-1">Health Insurance (28%), L&D (38%)</p>
            </div>
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm font-medium text-primary">This Month</p>
              <p className="text-xs text-muted-foreground mt-1">3 perk activations, 2 claims approved</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Benefits Grid */}
      <div>
        <h2 className="text-lg font-display font-semibold mb-4">Your Benefits</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {benefits.map((benefit) => {
            const utilization = Math.round((benefit.utilized / benefit.value) * 100);
            const remaining = benefit.value - benefit.utilized;
            
            return (
              <Card key={benefit.name} className="benefit-card">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <benefit.icon className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{benefit.name}</h3>
                    <div className="flex gap-2 mt-1">
                      <span className={BENEFIT_TYPE_COLORS[benefit.type]}>
                        {BENEFIT_TYPE_LABELS[benefit.type]}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Utilized</span>
                    <span className="font-medium">{formatCurrency(benefit.utilized)}</span>
                  </div>
                  <Progress value={utilization} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Remaining: {formatCurrency(remaining)}</span>
                    <span>{utilization}%</span>
                  </div>
                </div>
                
                <ul className="mt-3 space-y-1">
                  {benefit.bullets.map((bullet, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <span className="text-accent mt-0.5">•</span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
