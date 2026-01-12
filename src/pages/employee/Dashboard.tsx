import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, TrendingUp, Calendar, Zap, Home, GraduationCap, 
  Heart, Car, Dumbbell, PiggyBank, BookOpen, Plane 
} from 'lucide-react';
import { BENEFIT_TYPE_COLORS, BENEFIT_TYPE_LABELS, LIFE_AREA_LABELS } from '@/lib/constants';

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