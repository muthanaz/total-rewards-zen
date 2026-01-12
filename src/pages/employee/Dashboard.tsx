import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, TrendingUp, Calendar, Zap, Home, GraduationCap, 
  Heart, Car, Dumbbell, PiggyBank, BookOpen, Plane 
} from 'lucide-react';
import { BENEFIT_TYPE_COLORS, BENEFIT_TYPE_LABELS } from '@/lib/constants';
import { RequestClaimWidget } from '@/components/employee/RequestClaimWidget';
import { ChartContainer, AnimatedBarChart, AnimatedDonutChart } from '@/components/charts';

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

// Chart data - transformed for new components
const utilizationByType = [
  { name: 'Cash & Allowances', value: 195000, secondaryValue: 219000 },
  { name: 'Health & Protection', value: 12500, secondaryValue: 45000 },
  { name: 'Wealth & Ownership', value: 18000, secondaryValue: 36000 },
  { name: 'Growth & Career', value: 4500, secondaryValue: 12000 },
  { name: 'Wellbeing', value: 3200, secondaryValue: 6000 },
];

const allowanceVsUsed = [
  { name: 'Utilized', value: 233200, color: 'hsl(174 60% 45%)' },
  { name: 'Available', value: 164800, color: 'hsl(220 14% 90%)' },
];

export default function EmployeeDashboard() {
  const formatCurrency = (value: number) => `AED ${value.toLocaleString()}`;
  const formatCurrencyShort = (value: number) => `${(value / 1000).toFixed(0)}K`;
  const utilizationPercent = Math.round((233200 / 398000) * 100);
  
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">Your total rewards at a glance</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { icon: DollarSign, value: formatCurrency(metrics.monthlySalary), label: 'Monthly Salary', formula: 'Base salary / 12', source: 'HR System' },
          { icon: DollarSign, value: formatCurrency(metrics.annualSalary), label: 'Annual Salary', formula: 'Monthly × 12', source: 'HR System' },
          { icon: TrendingUp, value: formatCurrency(metrics.annualBenefitsValue), label: 'Annual Benefits', formula: 'Sum of all benefit entitlements', source: 'Benefits System' },
          { icon: Zap, value: `${metrics.benefitsUtilization}%`, label: 'Utilization', formula: '(Utilized / Total) × 100', source: 'Tracker' },
          { icon: Calendar, value: `${metrics.leaveBalance} days`, label: 'Leave Balance', formula: 'Total - Used', source: 'Leave System' },
          { icon: Zap, value: `${metrics.activatedItems}`, label: 'Activated Perks', formula: 'Count of activations', source: 'Marketplace' },
        ].map((metric, index) => (
          <Card 
            key={metric.label} 
            className="metric-card group hover:border-accent/30 transition-all duration-300"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className="p-2 rounded-lg bg-accent/10 group-hover:bg-accent/15 transition-colors">
                <metric.icon className="w-4 h-4 text-accent" />
              </div>
              <InfoTooltip formula={metric.formula} dataSource={metric.source} lastUpdated="Jan 2026" />
            </div>
            <p className="text-xl font-bold mt-3 tracking-tight">{metric.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{metric.label}</p>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Utilization by Benefit Type - Takes 3 columns */}
        <div className="lg:col-span-3">
          <ChartContainer 
            title="Utilization by Benefit Type"
            formula="Utilized amount vs total allocation per category"
            dataSource="Benefits System"
          >
            <AnimatedBarChart
              data={utilizationByType}
              layout="vertical"
              showSecondary={true}
              primaryLabel="Utilized"
              secondaryLabel="Total"
              formatValue={formatCurrencyShort}
              height={300}
              gradientId="employeeBar"
            />
          </ChartContainer>
        </div>

        {/* Allowance vs Used Donut - Takes 2 columns */}
        <div className="lg:col-span-2">
          <ChartContainer 
            title="Overall Benefits Usage"
            formula="Total utilized / Total annual benefits"
            dataSource="Benefits System"
          >
            <AnimatedDonutChart
              data={allowanceVsUsed}
              height={200}
              innerRadius={55}
              outerRadius={80}
              formatValue={(v) => `AED ${(v / 1000).toFixed(0)}K`}
              centerContent={
                <div className="text-center">
                  <p className="text-2xl font-bold text-accent">{utilizationPercent}%</p>
                  <p className="text-xs text-muted-foreground">Used</p>
                </div>
              }
            />
          </ChartContainer>
        </div>
      </div>

      {/* Request Widget + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <RequestClaimWidget />
        </div>
        
        {/* Quick Stats */}
        <div className="lg:col-span-2">
          <Card className="h-full border-border/50 bg-gradient-to-b from-card to-card/80">
            <CardHeader className="pb-3 border-b border-border/30">
              <CardTitle className="text-base font-display font-semibold">Benefit Highlights</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-sm font-semibold text-emerald-600">Fully Utilized</p>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Housing Allowance, Annual Flight Tickets</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/20">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <p className="text-sm font-semibold text-amber-600">Room to Use</p>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Health Insurance (28%), Learning & Dev (38%)</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <p className="text-sm font-semibold text-accent">This Month</p>
                </div>
                <p className="text-xs text-muted-foreground mt-2">3 perk activations, 2 claims approved</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Benefits Grid */}
      <div>
        <h2 className="text-lg font-display font-semibold mb-4">Your Benefits</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {benefits.map((benefit, index) => {
            const utilization = Math.round((benefit.utilized / benefit.value) * 100);
            const remaining = benefit.value - benefit.utilized;
            const isFullyUsed = utilization >= 100;
            
            return (
              <Card 
                key={benefit.name} 
                className="benefit-card group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-accent/10 group-hover:bg-accent/15 transition-colors">
                    <benefit.icon className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{benefit.name}</h3>
                    <div className="flex gap-2 mt-1.5">
                      <span className={BENEFIT_TYPE_COLORS[benefit.type]}>
                        {BENEFIT_TYPE_LABELS[benefit.type]}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Utilized</span>
                    <span className="font-semibold">{formatCurrency(benefit.utilized)}</span>
                  </div>
                  <div className="relative">
                    <Progress 
                      value={utilization} 
                      className={`h-2 ${isFullyUsed ? '[&>div]:bg-emerald-500' : '[&>div]:bg-accent'}`}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Remaining: {formatCurrency(remaining)}</span>
                    <span className={isFullyUsed ? 'text-emerald-600 font-medium' : ''}>{utilization}%</span>
                  </div>
                </div>
                
                <ul className="mt-4 space-y-1.5 pt-3 border-t border-border/50">
                  {benefit.bullets.map((bullet, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-accent mt-0.5 text-[10px]">●</span>
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
