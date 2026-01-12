import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, TrendingUp, Calendar, Zap, Home, GraduationCap, 
  Heart, Car, Dumbbell, PiggyBank, BookOpen, Plane, ChevronRight
} from 'lucide-react';
import { BENEFIT_TYPE_COLORS, BENEFIT_TYPE_LABELS } from '@/lib/constants';
import { RequestClaimWidget } from '@/components/employee/RequestClaimWidget';
import { ChartContainer, AnimatedBarChart, AnimatedDonutChart, AnimatedRadarChart } from '@/components/charts';
import { DateRangeFilter, DrillDownModal, BenefitsDrillDownSheet } from '@/components/dashboard';

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

// Benefit to page route mapping
const benefitRoutes: Record<string, string> = {
  'Housing Allowance': '/employee/housing',
  'Education Allowance': '/employee/schooling',
  'Health Insurance': '/employee/health',
  'Transport Allowance': '/employee/transport',
  'Annual Flight Tickets': '/employee/documents',
  'Financial Planning': '/employee/financial',
  'Wellbeing Program': '/employee/wellbeing',
  'Learning & Development': '/employee/learning',
};

const benefits = [
  { name: 'Housing Allowance', icon: Home, value: 120000, utilized: 120000, type: 'cash_allowances', area: 'home_living', route: '/employee/housing', bullets: ['Paid monthly with salary', 'Can be used for rent or mortgage'] },
  { name: 'Education Allowance', icon: GraduationCap, value: 60000, utilized: 42000, type: 'cash_allowances', area: 'family_parenting', route: '/employee/schooling', bullets: ['Per child up to 18 years', 'Covers tuition fees only'] },
  { name: 'Health Insurance', icon: Heart, value: 45000, utilized: 12500, type: 'health_protection', area: 'health', route: '/employee/health', bullets: ['Includes dental and optical', 'Covers spouse and children'] },
  { name: 'Transport Allowance', icon: Car, value: 24000, utilized: 18000, type: 'cash_allowances', area: 'mobility', route: '/employee/transport', bullets: ['Paid monthly with salary', 'Covers fuel and parking'] },
  { name: 'Annual Flight Tickets', icon: Plane, value: 15000, utilized: 15000, type: 'cash_allowances', area: 'lifestyle', route: '/employee/transport', bullets: ['For employee and dependents', 'Economy class tickets'] },
  { name: 'Financial Planning', icon: PiggyBank, value: 36000, utilized: 18000, type: 'wealth_ownership', area: 'money', route: '/employee/financial', bullets: ['5% employer match', 'Multiple fund options'] },
  { name: 'Wellbeing Program', icon: Dumbbell, value: 6000, utilized: 3200, type: 'wellbeing', area: 'health', route: '/employee/wellbeing', bullets: ['Gym membership covered', 'Wellness app subscription'] },
  { name: 'Learning & Development', icon: BookOpen, value: 12000, utilized: 4500, type: 'growth_career', area: 'career', route: '/employee/learning', bullets: ['Courses and certifications', 'Pre-approval required'] },
];

// Chart data
const utilizationByType = [
  { name: 'Cash & Allowances', value: 195000, secondaryValue: 219000 },
  { name: 'Health & Protection', value: 12500, secondaryValue: 45000 },
  { name: 'Wealth & Ownership', value: 18000, secondaryValue: 36000 },
  { name: 'Growth & Career', value: 4500, secondaryValue: 12000 },
  { name: 'Wellbeing', value: 3200, secondaryValue: 6000 },
];

const allowanceVsUsed = [
  { name: 'Utilized', value: 233200, color: 'hsl(174 60% 45%)' },
  { name: 'Available', value: 164800, color: 'hsl(220 14% 85%)' },
];

// Radar chart data for benefit comparison
const benefitRadarData = [
  { subject: 'Housing', value: 100, secondaryValue: 85, fullMark: 100 },
  { subject: 'Education', value: 70, secondaryValue: 75, fullMark: 100 },
  { subject: 'Health', value: 28, secondaryValue: 65, fullMark: 100 },
  { subject: 'Transport', value: 75, secondaryValue: 70, fullMark: 100 },
  { subject: 'Wellbeing', value: 53, secondaryValue: 60, fullMark: 100 },
  { subject: 'Learning', value: 38, secondaryValue: 55, fullMark: 100 },
];

// Drill-down data
const drillDownDetails: Record<string, any> = {
  'Cash & Allowances': {
    title: 'Cash & Allowances',
    category: 'Cash Benefits',
    totalValue: 219000,
    utilized: 195000,
    trend: 'up' as const,
    trendValue: 8,
    employees: 1,
    description: 'Monthly cash allowances paid with salary',
    breakdown: [
      { name: 'Housing', value: 120000, secondaryValue: 120000 },
      { name: 'Education', value: 42000, secondaryValue: 60000 },
      { name: 'Transport', value: 18000, secondaryValue: 24000 },
      { name: 'Flights', value: 15000, secondaryValue: 15000 },
    ],
  },
  'Health & Protection': {
    title: 'Health & Protection',
    category: 'Insurance',
    totalValue: 45000,
    utilized: 12500,
    trend: 'down' as const,
    trendValue: 5,
    description: 'Medical insurance and health benefits',
    breakdown: [
      { name: 'Medical Claims', value: 8500 },
      { name: 'Dental', value: 2500 },
      { name: 'Optical', value: 1500 },
    ],
  },
};

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState({ from: new Date(), to: new Date() });
  const [drillDownOpen, setDrillDownOpen] = useState(false);
  const [selectedDrillDown, setSelectedDrillDown] = useState<any>(null);
  const [benefitsSheetOpen, setBenefitsSheetOpen] = useState(false);
  const [benefitsSheetCategory, setBenefitsSheetCategory] = useState<'fully-utilized' | 'room-to-use' | null>(null);
  
  const formatCurrency = (value: number) => `AED ${value.toLocaleString()}`;
  const formatCurrencyShort = (value: number) => `${(value / 1000).toFixed(0)}K`;
  const utilizationPercent = Math.round((233200 / 398000) * 100);

  const handleBenefitClick = (benefitName: string) => {
    const benefit = benefits.find(b => b.name === benefitName);
    if (benefit?.route) {
      navigate(benefit.route);
    }
  };

  const handleHighlightClick = (category: 'fully-utilized' | 'room-to-use') => {
    setBenefitsSheetCategory(category);
    setBenefitsSheetOpen(true);
  };

  const handleBarClick = (data: any) => {
    const details = drillDownDetails[data.name];
    if (details) {
      setSelectedDrillDown(details);
      setDrillDownOpen(true);
    }
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    // Demo export functionality
    console.log(`Exporting data as ${format}`);
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Date Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground">Your total rewards at a glance</p>
        </div>
        <DateRangeFilter 
          onRangeChange={setDateRange}
          onExport={handleExport}
          showExport={true}
        />
      </div>

      {/* Metrics Grid - Uniform sizing */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
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
            className="metric-card group hover:border-accent/30 transition-all duration-300 h-full"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="p-2 rounded-lg bg-accent/10 group-hover:bg-accent/15 transition-colors shrink-0">
                <metric.icon className="w-4 h-4 text-accent" />
              </div>
              <InfoTooltip formula={metric.formula} dataSource={metric.source} lastUpdated="Jan 2026" />
            </div>
            <p className="text-lg font-bold mt-3 tracking-tight truncate">{metric.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{metric.label}</p>
          </Card>
        ))}
      </div>

      {/* Benefit Highlights - Moved to top */}
      <Card className="border-border/50 bg-gradient-to-b from-card to-card/80">
        <CardHeader className="pb-3 border-b border-border/30">
          <CardTitle className="text-base font-display font-semibold">Benefit Highlights</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div 
              className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 cursor-pointer hover:border-emerald-500/40 hover:shadow-md transition-all group"
              onClick={() => handleHighlightClick('fully-utilized')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-sm font-semibold text-emerald-600">Fully Utilized</p>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {benefits.filter(b => (b.utilized / b.value) >= 1).length} benefit{benefits.filter(b => (b.utilized / b.value) >= 1).length !== 1 ? 's' : ''} at 100%
              </p>
            </div>
            <div 
              className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/20 cursor-pointer hover:border-amber-500/40 hover:shadow-md transition-all group"
              onClick={() => handleHighlightClick('room-to-use')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <p className="text-sm font-semibold text-amber-600">Room to Use</p>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {benefits.filter(b => (b.utilized / b.value) < 1).length} benefit{benefits.filter(b => (b.utilized / b.value) < 1).length !== 1 ? 's' : ''} with remaining allocation
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <p className="text-sm font-semibold text-accent">This Month</p>
              </div>
              <p className="text-xs text-muted-foreground mt-2">3 perk activations, 2 claims approved</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefits Grid - Moved up, clickable */}
      <div>
        <h2 className="text-lg font-display font-semibold mb-4">Your Benefits</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {benefits.map((benefit, index) => {
            const utilization = Math.round((benefit.utilized / benefit.value) * 100);
            const remaining = benefit.value - benefit.utilized;
            const isFullyUsed = utilization >= 100;
            
            return (
              <Card 
                key={benefit.name} 
                className="benefit-card group cursor-pointer hover:border-accent/40 hover:shadow-md transition-all duration-300 flex flex-col"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => handleBenefitClick(benefit.name)}
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors shrink-0">
                    <benefit.icon className="w-4 h-4 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate group-hover:text-accent transition-colors leading-tight">{benefit.name}</h3>
                    <span className={`${BENEFIT_TYPE_COLORS[benefit.type]} mt-1 inline-block`}>
                      {BENEFIT_TYPE_LABELS[benefit.type]}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
                </div>
                
                <div className="mt-3 space-y-1.5 flex-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Utilized</span>
                    <span className="font-semibold">{formatCurrency(benefit.utilized)}</span>
                  </div>
                  <Progress 
                    value={utilization} 
                    className={`h-1.5 ${isFullyUsed ? '[&>div]:bg-emerald-500' : '[&>div]:bg-accent'}`}
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Rem: {formatCurrency(remaining)}</span>
                    <span className={isFullyUsed ? 'text-emerald-600 font-medium' : ''}>{utilization}%</span>
                  </div>
                </div>
                
                <ul className="mt-3 space-y-1 pt-2 border-t border-border/50">
                  {benefit.bullets.map((bullet, i) => (
                    <li key={i} className="text-[10px] text-muted-foreground flex items-start gap-1.5 leading-tight">
                      <span className="text-accent mt-0.5 text-[8px]">●</span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Charts Section - Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Utilization by Benefit Type - clickable bars */}
        <ChartContainer 
          title="Utilization by Benefit Type"
          formula="Utilized amount vs total allocation per category"
          dataSource="Benefits System"
        >
          <div className="pt-2">
            <AnimatedBarChart
              data={utilizationByType}
              layout="vertical"
              showSecondary={true}
              primaryLabel="Utilized"
              secondaryLabel="Total Allocated"
              formatValue={formatCurrencyShort}
              height={320}
              gradientId="employeeBar"
              showLegend={true}
              onBarClick={handleBarClick}
              interactive={true}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            Click any bar to see detailed breakdown
          </p>
        </ChartContainer>

        {/* Allowance vs Used Donut */}
        <ChartContainer 
          title="Overall Benefits Usage"
          formula="Total utilized / Total annual benefits"
          dataSource="Benefits System"
        >
          <div className="flex items-center justify-center py-4">
            <AnimatedDonutChart
              data={allowanceVsUsed}
              height={260}
              innerRadius={70}
              outerRadius={100}
              formatValue={(v) => `AED ${(v / 1000).toFixed(0)}K`}
              showLegend={true}
              centerContent={
                <div className="text-center">
                  <p className="text-3xl font-bold text-accent">{utilizationPercent}%</p>
                  <p className="text-xs text-muted-foreground">Used</p>
                </div>
              }
            />
          </div>
        </ChartContainer>
      </div>

      {/* Charts Section - Row 2: Radar + Request Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Radar Chart */}
        <ChartContainer 
          title="Benefit Comparison"
          formula="Your utilization vs company average per benefit"
          dataSource="Benefits System"
        >
          <div className="pt-2">
            <AnimatedRadarChart
              data={benefitRadarData}
              height={320}
              showSecondary={true}
              primaryLabel="Your Utilization"
              secondaryLabel="Company Avg"
              showLegend={true}
            />
          </div>
        </ChartContainer>

        {/* Request Widget */}
        <RequestClaimWidget />
      </div>

      {/* Drill-down Modal */}
      <DrillDownModal
        open={drillDownOpen}
        onOpenChange={setDrillDownOpen}
        data={selectedDrillDown}
        formatValue={(v) => `AED ${v.toLocaleString()}`}
      />

      {/* Benefits Drill-down Sheet */}
      <BenefitsDrillDownSheet
        open={benefitsSheetOpen}
        onOpenChange={setBenefitsSheetOpen}
        category={benefitsSheetCategory}
        benefits={benefits}
      />
    </div>
  );
}
