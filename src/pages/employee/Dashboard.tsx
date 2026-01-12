import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, TrendingUp, Calendar, Zap, Home, GraduationCap, 
  Heart, Car, Dumbbell, PiggyBank, BookOpen, Plane, ChevronRight, ChevronLeft, Gift
} from 'lucide-react';
import { BENEFIT_TYPE_COLORS, BENEFIT_TYPE_LABELS } from '@/lib/constants';
import { RequestClaimWidget } from '@/components/employee/RequestClaimWidget';
import { SatisfactionSurvey } from '@/components/employee/SatisfactionSurvey';
import { ChartContainer, AnimatedBarChart, AnimatedDonutChart, AnimatedRadarChart } from '@/components/charts';
import { DateRangeFilter, DrillDownModal, BenefitsDrillDownSheet } from '@/components/dashboard';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

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
  { name: 'Housing Allowance', nameKey: 'benefit.housing', icon: Home, value: 120000, utilized: 120000, type: 'cash_allowances', area: 'home_living', route: '/employee/housing', bullets: ['Paid monthly with salary', 'Can be used for rent or mortgage'], bulletsAr: ['يُدفع شهرياً مع الراتب', 'يمكن استخدامه للإيجار أو الرهن العقاري'] },
  { name: 'Education Allowance', nameKey: 'benefit.education', icon: GraduationCap, value: 60000, utilized: 42000, type: 'cash_allowances', area: 'family_parenting', route: '/employee/schooling', bullets: ['Per child up to 18 years', 'Covers tuition fees only'], bulletsAr: ['لكل طفل حتى ١٨ عاماً', 'يغطي الرسوم الدراسية فقط'] },
  { name: 'Health Insurance', nameKey: 'benefit.health', icon: Heart, value: 45000, utilized: 12500, type: 'health_protection', area: 'health', route: '/employee/health', bullets: ['Includes dental and optical', 'Covers spouse and children'], bulletsAr: ['يشمل طب الأسنان والبصريات', 'يغطي الزوج/الزوجة والأطفال'] },
  { name: 'Transport & Mobility', nameKey: 'benefit.transportMobility', icon: Car, value: 39000, utilized: 33000, type: 'cash_allowances', area: 'mobility', route: '/employee/transport', bullets: ['Monthly allowance: AED 2,000', 'Annual flight tickets included', 'Covers fuel, parking & tickets'], bulletsAr: ['بدل شهري: ٢٠٠٠ درهم', 'تذاكر الطيران السنوية مشمولة', 'يغطي الوقود والمواقف والتذاكر'] },
  { name: 'Annual Bonus', nameKey: 'benefit.annualBonus', icon: Gift, value: 70000, utilized: 0, type: 'cash_allowances', area: 'money', route: '/employee/bonus', bullets: ['Performance-based (0-200%)', 'Paid annually in March', 'Target: 2 months base salary'], bulletsAr: ['مبني على الأداء (٠-٢٠٠٪)', 'يُدفع سنوياً في مارس', 'الهدف: راتب شهرين أساسي'] },
  { name: 'Financial Planning', nameKey: 'benefit.financial', icon: PiggyBank, value: 36000, utilized: 18000, type: 'wealth_ownership', area: 'money', route: '/employee/financial', bullets: ['5% employer match', 'Multiple fund options'], bulletsAr: ['مطابقة ٥٪ من صاحب العمل', 'خيارات صناديق متعددة'] },
  { name: 'Wellbeing Program', nameKey: 'benefit.wellbeingProgram', icon: Dumbbell, value: 6000, utilized: 3200, type: 'wellbeing', area: 'health', route: '/employee/wellbeing', bullets: ['Gym membership covered', 'Wellness app subscription'], bulletsAr: ['عضوية النادي الرياضي مغطاة', 'اشتراك تطبيق العافية'] },
  { name: 'Learning & Development', nameKey: 'benefit.learning', icon: BookOpen, value: 12000, utilized: 4500, type: 'growth_career', area: 'career', route: '/employee/learning', bullets: ['Courses and certifications', 'Pre-approval required'], bulletsAr: ['الدورات والشهادات', 'يتطلب موافقة مسبقة'] },
];

// Chart data with translations
const utilizationByTypeEn = [
  { name: 'Cash & Allowances', value: 195000, secondaryValue: 219000 },
  { name: 'Health & Protection', value: 12500, secondaryValue: 45000 },
  { name: 'Wealth & Ownership', value: 18000, secondaryValue: 36000 },
  { name: 'Growth & Career', value: 4500, secondaryValue: 12000 },
  { name: 'Wellbeing', value: 3200, secondaryValue: 6000 },
];

const utilizationByTypeAr = [
  { name: 'البدلات النقدية', value: 195000, secondaryValue: 219000 },
  { name: 'الصحة والحماية', value: 12500, secondaryValue: 45000 },
  { name: 'الثروة والملكية', value: 18000, secondaryValue: 36000 },
  { name: 'النمو والمسار المهني', value: 4500, secondaryValue: 12000 },
  { name: 'الرفاهية', value: 3200, secondaryValue: 6000 },
];

const allowanceVsUsedEn = [
  { name: 'Utilized', value: 233200, color: 'hsl(174 60% 45%)' },
  { name: 'Available', value: 164800, color: 'hsl(220 14% 85%)' },
];

const allowanceVsUsedAr = [
  { name: 'المستخدم', value: 233200, color: 'hsl(174 60% 45%)' },
  { name: 'المتاح', value: 164800, color: 'hsl(220 14% 85%)' },
];

// Radar chart data for benefit comparison
const benefitRadarDataEn = [
  { subject: 'Housing', value: 100, secondaryValue: 85, fullMark: 100 },
  { subject: 'Education', value: 70, secondaryValue: 75, fullMark: 100 },
  { subject: 'Health', value: 28, secondaryValue: 65, fullMark: 100 },
  { subject: 'Transport', value: 75, secondaryValue: 70, fullMark: 100 },
  { subject: 'Wellbeing', value: 53, secondaryValue: 60, fullMark: 100 },
  { subject: 'Learning', value: 38, secondaryValue: 55, fullMark: 100 },
];

const benefitRadarDataAr = [
  { subject: 'السكن', value: 100, secondaryValue: 85, fullMark: 100 },
  { subject: 'التعليم', value: 70, secondaryValue: 75, fullMark: 100 },
  { subject: 'الصحة', value: 28, secondaryValue: 65, fullMark: 100 },
  { subject: 'النقل', value: 75, secondaryValue: 70, fullMark: 100 },
  { subject: 'الرفاهية', value: 53, secondaryValue: 60, fullMark: 100 },
  { subject: 'التعلم', value: 38, secondaryValue: 55, fullMark: 100 },
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
  const { t, language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const [dateRange, setDateRange] = useState({ from: new Date(), to: new Date() });
  const [drillDownOpen, setDrillDownOpen] = useState(false);
  const [selectedDrillDown, setSelectedDrillDown] = useState<any>(null);
  const [benefitsSheetOpen, setBenefitsSheetOpen] = useState(false);
  const [benefitsSheetCategory, setBenefitsSheetCategory] = useState<'fully-utilized' | 'room-to-use' | null>(null);
  
  const formatCurrency = (value: number) => `${isRTL ? '' : 'AED '}${value.toLocaleString(isRTL ? 'ar-AE' : 'en-AE')}${isRTL ? ' درهم' : ''}`;
  const formatCurrencyShort = (value: number) => `${(value / 1000).toFixed(0)}${isRTL ? 'ألف' : 'K'}`;
  const utilizationPercent = Math.round((233200 / 398000) * 100);

  // Get localized data
  const utilizationByType = isRTL ? utilizationByTypeAr : utilizationByTypeEn;
  const allowanceVsUsed = isRTL ? allowanceVsUsedAr : allowanceVsUsedEn;
  const benefitRadarData = isRTL ? benefitRadarDataAr : benefitRadarDataEn;

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

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

  const metricsData = [
    { icon: DollarSign, value: formatCurrency(metrics.monthlySalary), label: t('employee.dashboard.monthlySalary'), formula: isRTL ? 'الراتب الأساسي / ١٢' : 'Base salary / 12', source: isRTL ? 'نظام الموارد البشرية' : 'HR System' },
    { icon: DollarSign, value: formatCurrency(metrics.annualSalary), label: t('employee.dashboard.annualSalary'), formula: isRTL ? 'الشهري × ١٢' : 'Monthly × 12', source: isRTL ? 'نظام الموارد البشرية' : 'HR System' },
    { icon: TrendingUp, value: formatCurrency(metrics.annualBenefitsValue), label: t('employee.dashboard.annualBenefits'), formula: isRTL ? 'مجموع جميع المزايا' : 'Sum of all benefit entitlements', source: isRTL ? 'نظام المزايا' : 'Benefits System' },
    { icon: Zap, value: `${metrics.benefitsUtilization}${isRTL ? '٪' : '%'}`, label: t('employee.dashboard.utilization'), formula: isRTL ? '(المستخدم / الإجمالي) × ١٠٠' : '(Utilized / Total) × 100', source: isRTL ? 'المتتبع' : 'Tracker' },
    { icon: Calendar, value: `${metrics.leaveBalance} ${t('common.days')}`, label: t('employee.dashboard.leaveBalance'), formula: isRTL ? 'الإجمالي - المستخدم' : 'Total - Used', source: isRTL ? 'نظام الإجازات' : 'Leave System' },
    { icon: Zap, value: `${metrics.activatedItems}`, label: t('employee.dashboard.activatedPerks'), formula: isRTL ? 'عدد التفعيلات' : 'Count of activations', source: isRTL ? 'السوق' : 'Marketplace' },
  ];
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Date Filter */}
      <div className={cn(
        "flex flex-col md:flex-row md:items-center justify-between gap-4",
        isRTL && "md:flex-row-reverse"
      )}>
        <div className={cn("space-y-1", isRTL && "text-right")}>
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">{t('employee.dashboard.title')}</h1>
          <p className="text-muted-foreground">{t('employee.dashboard.subtitle')}</p>
        </div>
        <DateRangeFilter 
          onRangeChange={setDateRange}
          onExport={handleExport}
          showExport={true}
        />
      </div>

      {/* Metrics Grid - Uniform sizing */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {metricsData.map((metric, index) => (
          <Card 
            key={metric.label} 
            className="metric-card group hover:border-accent/30 transition-all duration-300 h-full"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className={cn(
              "flex items-start justify-between gap-2",
              isRTL && "flex-row-reverse"
            )}>
              <div className="p-2 rounded-lg bg-accent/10 group-hover:bg-accent/15 transition-colors shrink-0">
                <metric.icon className="w-4 h-4 text-accent" />
              </div>
              <InfoTooltip formula={metric.formula} dataSource={metric.source} lastUpdated={isRTL ? 'يناير ٢٠٢٦' : 'Jan 2026'} />
            </div>
            <p className={cn("text-lg font-bold mt-3 tracking-tight truncate", isRTL && "text-right")}>{metric.value}</p>
            <p className={cn("text-xs text-muted-foreground mt-1", isRTL && "text-right")}>{metric.label}</p>
          </Card>
        ))}
      </div>

      {/* Benefit Highlights - Moved to top */}
      <Card className="border-border/50 bg-gradient-to-b from-card to-card/80">
        <CardHeader className={cn("pb-3 border-b border-border/30", isRTL && "text-right")}>
          <CardTitle className="text-base font-display font-semibold">{t('employee.dashboard.benefitHighlights')}</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div 
              className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 cursor-pointer hover:border-emerald-500/40 hover:shadow-md transition-all group"
              onClick={() => handleHighlightClick('fully-utilized')}
            >
              <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-sm font-semibold text-emerald-600">{t('employee.dashboard.fullyUtilized')}</p>
                </div>
                <ChevronIcon className={cn(
                  "w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-all",
                  !isRTL && "group-hover:translate-x-0.5",
                  isRTL && "group-hover:-translate-x-0.5"
                )} />
              </div>
              <p className={cn("text-xs text-muted-foreground mt-2", isRTL && "text-right")}>
                {benefits.filter(b => (b.utilized / b.value) >= 1).length} {t('employee.dashboard.benefitsAt100')}
              </p>
            </div>
            <div 
              className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/20 cursor-pointer hover:border-amber-500/40 hover:shadow-md transition-all group"
              onClick={() => handleHighlightClick('room-to-use')}
            >
              <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <p className="text-sm font-semibold text-amber-600">{t('employee.dashboard.roomToUse')}</p>
                </div>
                <ChevronIcon className={cn(
                  "w-4 h-4 text-amber-500 opacity-0 group-hover:opacity-100 transition-all",
                  !isRTL && "group-hover:translate-x-0.5",
                  isRTL && "group-hover:-translate-x-0.5"
                )} />
              </div>
              <p className={cn("text-xs text-muted-foreground mt-2", isRTL && "text-right")}>
                {benefits.filter(b => (b.utilized / b.value) < 1).length} {t('employee.dashboard.benefitsWithRemaining')}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20">
              <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <div className="w-2 h-2 rounded-full bg-accent" />
                <p className="text-sm font-semibold text-accent">{t('employee.dashboard.thisMonth')}</p>
              </div>
              <p className={cn("text-xs text-muted-foreground mt-2", isRTL && "text-right")}>
                {isRTL ? '٣ تفعيلات امتيازات، ٢ مطالبات تمت الموافقة عليها' : '3 perk activations, 2 claims approved'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefits Grid - Moved up, clickable */}
      <div>
        <div className={cn("flex items-center justify-between mb-4", isRTL && "flex-row-reverse")}>
          <h2 className="text-lg font-display font-semibold">{t('employee.dashboard.yourBenefits')}</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn("text-accent hover:text-accent/80", isRTL && "flex-row-reverse")}
            onClick={() => navigate('/employee/benefits')}
          >
            {t('common.seeAll')}
            <ChevronIcon className={cn("w-4 h-4", isRTL ? "mr-1" : "ml-1")} />
          </Button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {benefits.map((benefit, index) => {
            const utilization = Math.round((benefit.utilized / benefit.value) * 100);
            const remaining = benefit.value - benefit.utilized;
            const isFullyUsed = utilization >= 100;
            const bulletList = isRTL ? benefit.bulletsAr : benefit.bullets;
            
            return (
              <Card 
                key={benefit.name} 
                className="benefit-card group cursor-pointer hover:border-accent/40 hover:shadow-md transition-all duration-300 flex flex-col"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => handleBenefitClick(benefit.name)}
              >
                <div className={cn("flex items-start gap-2.5", isRTL && "flex-row-reverse")}>
                  <div className="p-2 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors shrink-0">
                    <benefit.icon className="w-4 h-4 text-accent" />
                  </div>
                  <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
                    <h3 className="font-medium text-sm truncate group-hover:text-accent transition-colors leading-tight">
                      {t(benefit.nameKey)}
                    </h3>
                    <span className={`${BENEFIT_TYPE_COLORS[benefit.type]} mt-1 inline-block`}>
                      {t(`benefit.${benefit.type}`)}
                    </span>
                  </div>
                  <ChevronIcon className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
                </div>
                
                <div className="mt-3 space-y-1.5 flex-1">
                  <div className={cn("flex justify-between text-xs", isRTL && "flex-row-reverse")}>
                    <span className="text-muted-foreground">{t('common.utilized')}</span>
                    <span className="font-semibold">{formatCurrency(benefit.utilized)}</span>
                  </div>
                  <Progress 
                    value={utilization} 
                    className={`h-1.5 ${isFullyUsed ? '[&>div]:bg-emerald-500' : '[&>div]:bg-accent'}`}
                  />
                  <div className={cn("flex justify-between text-[10px] text-muted-foreground", isRTL && "flex-row-reverse")}>
                    <span>{t('employee.dashboard.remaining')}: {formatCurrency(remaining)}</span>
                    <span className={isFullyUsed ? 'text-emerald-600 font-medium' : ''}>{utilization}{isRTL ? '٪' : '%'}</span>
                  </div>
                </div>
                
                <ul className={cn("mt-3 space-y-1 pt-2 border-t border-border/50", isRTL && "text-right")}>
                  {bulletList.map((bullet, i) => (
                    <li key={i} className={cn(
                      "text-[10px] text-muted-foreground flex items-start gap-1.5 leading-tight",
                      isRTL && "flex-row-reverse"
                    )}>
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
          title={t('employee.dashboard.utilizationByType')}
          formula={isRTL ? 'المبلغ المستخدم مقابل الإجمالي المخصص لكل فئة' : 'Utilized amount vs total allocation per category'}
          dataSource={isRTL ? 'نظام المزايا' : 'Benefits System'}
        >
          <AnimatedBarChart
            data={utilizationByType}
            layout="horizontal"
            showSecondary={true}
            primaryLabel={isRTL ? 'المستخدم' : 'Utilized'}
            secondaryLabel={isRTL ? 'الإجمالي المخصص' : 'Total Allocated'}
            formatValue={formatCurrencyShort}
            height={280}
            gradientId="employeeBar"
            showLegend={true}
            onBarClick={handleBarClick}
            interactive={true}
          />
          <p className={cn("text-xs text-muted-foreground text-center mt-2", isRTL && "text-right")}>
            {t('employee.dashboard.clickBarDetails')}
          </p>
        </ChartContainer>

        {/* Allowance vs Used Donut */}
        <ChartContainer 
          title={t('employee.dashboard.overallUsage')}
          formula={isRTL ? 'إجمالي المستخدم / إجمالي المزايا السنوية' : 'Total utilized / Total annual benefits'}
          dataSource={isRTL ? 'نظام المزايا' : 'Benefits System'}
        >
          <div className="flex items-center justify-center py-4">
            <AnimatedDonutChart
              data={allowanceVsUsed}
              height={260}
              innerRadius={70}
              outerRadius={100}
              formatValue={(v) => `${isRTL ? '' : 'AED '}${(v / 1000).toFixed(0)}${isRTL ? ' ألف درهم' : 'K'}`}
              showLegend={true}
              centerContent={
                <div className="text-center">
                  <p className="text-3xl font-bold text-accent">{utilizationPercent}{isRTL ? '٪' : '%'}</p>
                  <p className="text-xs text-muted-foreground">{t('employee.dashboard.used')}</p>
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
          title={t('employee.dashboard.benefitComparison')}
          formula={isRTL ? 'استخدامك مقابل متوسط الشركة لكل مزايا' : 'Your utilization vs company average per benefit'}
          dataSource={isRTL ? 'نظام المزايا' : 'Benefits System'}
        >
          <div className="pt-2">
            <AnimatedRadarChart
              data={benefitRadarData}
              height={320}
              showSecondary={true}
              primaryLabel={t('employee.dashboard.yourUtilization')}
              secondaryLabel={t('employee.dashboard.companyAvg')}
              showLegend={true}
            />
          </div>
        </ChartContainer>

        {/* Request Widget */}
        <div className="space-y-4">
          <RequestClaimWidget />
          <SatisfactionSurvey compact={true} />
        </div>
      </div>

      {/* Full Satisfaction Survey */}
      <SatisfactionSurvey />

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
