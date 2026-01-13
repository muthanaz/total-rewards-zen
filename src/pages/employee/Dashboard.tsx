import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, TrendingUp, Calendar, Zap, Home, GraduationCap, 
  Heart, Car, Dumbbell, PiggyBank, BookOpen, ChevronRight, ChevronLeft, Gift,
  Wallet, Target, Sparkles
} from 'lucide-react';
import { BENEFIT_TYPE_COLORS, BENEFIT_TYPE_LABELS } from '@/lib/constants';
import { RequestClaimWidget } from '@/components/employee/RequestClaimWidget';
import { SatisfactionSurvey } from '@/components/employee/SatisfactionSurvey';
import { ChartContainer, AnimatedBarChart, AnimatedRadarChart } from '@/components/charts';
import { DateRangeFilter, DrillDownModal, BenefitsDrillDownSheet } from '@/components/dashboard';
import { useLanguage } from '@/contexts/LanguageContext';
import { SummaryStatsCard } from '@/components/ui/summary-stats-card';
import { cn } from '@/lib/utils';

// Demo data - core salary info
const salaryData = {
  monthlySalary: 35000,
  annualSalary: 420000,
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
  { name: 'Cash', value: 195000, secondaryValue: 219000 },
  { name: 'Health', value: 12500, secondaryValue: 45000 },
  { name: 'Wealth', value: 18000, secondaryValue: 36000 },
  { name: 'Growth', value: 4500, secondaryValue: 12000 },
  { name: 'Wellbeing', value: 3200, secondaryValue: 6000 },
];

const utilizationByTypeAr = [
  { name: 'النقدية', value: 195000, secondaryValue: 219000 },
  { name: 'الصحة', value: 12500, secondaryValue: 45000 },
  { name: 'الثروة', value: 18000, secondaryValue: 36000 },
  { name: 'النمو', value: 4500, secondaryValue: 12000 },
  { name: 'الرفاهية', value: 3200, secondaryValue: 6000 },
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
  
  // Calculate derived metrics from actual benefit data
  const calculatedMetrics = useMemo(() => {
    const totalBenefitValue = benefits.reduce((sum, b) => sum + b.value, 0);
    const totalUtilized = benefits.reduce((sum, b) => sum + b.utilized, 0);
    const totalRemaining = totalBenefitValue - totalUtilized;
    const utilizationPercent = Math.round((totalUtilized / totalBenefitValue) * 100);
    const fullyUtilizedCount = benefits.filter(b => (b.utilized / b.value) >= 1).length;
    const underutilizedCount = benefits.filter(b => (b.utilized / b.value) < 0.5).length;
    const avgUtilizationPerBenefit = Math.round(totalUtilized / benefits.length);
    
    // Total compensation = salary + benefits
    const totalCompensation = salaryData.annualSalary + totalBenefitValue;
    const benefitsAsPercentOfComp = Math.round((totalBenefitValue / totalCompensation) * 100);
    
    // Trend data (demo - comparing to last month)
    const lastMonthUtilized = totalUtilized * 0.92; // Demo: 8% growth
    const lastMonthUtilizationPercent = 52; // Demo value
    
    return {
      totalBenefitValue,
      totalUtilized,
      totalRemaining,
      utilizationPercent,
      fullyUtilizedCount,
      underutilizedCount,
      totalCompensation,
      benefitsAsPercentOfComp,
      avgUtilizationPerBenefit,
      lastMonthUtilized,
      lastMonthUtilizationPercent
    };
  }, []);

  const formatCurrency = (value: number) => `${isRTL ? '' : 'AED '}${value.toLocaleString(isRTL ? 'ar-AE' : 'en-AE')}${isRTL ? ' درهم' : ''}`;
  const formatCurrencyShort = (value: number) => `${(value / 1000).toFixed(0)}${isRTL ? 'ألف' : 'K'}`;

  // Get localized data
  const utilizationByType = isRTL ? utilizationByTypeAr : utilizationByTypeEn;
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

// All 8 metrics in specified order - clean aligned design
  const allMetrics = [
    { 
      icon: DollarSign, 
      value: formatCurrency(salaryData.monthlySalary), 
      label: isRTL ? 'الراتب الشهري' : 'Monthly Salary',
      formula: isRTL ? 'الراتب الأساسي / ١٢' : 'Base salary / 12',
      dataSource: isRTL ? 'نظام الموارد البشرية' : 'HR System',
      variant: 'primary' as const,
      secondaryValue: `${formatCurrency(salaryData.annualSalary)}/yr`,
    },
    { 
      icon: Gift, 
      value: formatCurrency(calculatedMetrics.totalBenefitValue), 
      label: isRTL ? 'قيمة المزايا السنوية' : 'Annual Benefits',
      formula: isRTL ? 'مجموع جميع قيم المزايا' : 'Sum of all benefit values',
      dataSource: isRTL ? 'نظام المزايا' : 'Benefits System',
      variant: 'info' as const,
      secondaryValue: `${benefits.length} ${isRTL ? 'مزايا' : 'benefits'}`,
    },
    { 
      icon: Wallet, 
      value: formatCurrency(calculatedMetrics.totalCompensation), 
      label: isRTL ? 'إجمالي التعويضات' : 'Total Compensation',
      formula: isRTL ? 'الراتب السنوي + قيمة المزايا' : 'Annual Salary + Benefits Value',
      dataSource: isRTL ? 'نظام الموارد البشرية' : 'HR System',
      variant: 'primary' as const,
      secondaryValue: isRTL ? 'راتب + مزايا' : 'Salary + Benefits',
    },
    { 
      icon: TrendingUp, 
      value: formatCurrency(calculatedMetrics.totalUtilized), 
      label: isRTL ? 'المزايا المستخدمة' : 'Benefits Used',
      formula: isRTL ? 'مجموع جميع المزايا المستخدمة' : 'Sum of all utilized benefits',
      dataSource: isRTL ? 'نظام المزايا' : 'Benefits System',
      variant: 'utilized' as const,
      secondaryValue: `${calculatedMetrics.utilizationPercent}% ${isRTL ? 'مستخدم' : 'utilized'}`,
    },
    { 
      icon: Sparkles, 
      value: formatCurrency(calculatedMetrics.totalRemaining), 
      label: isRTL ? 'المتاح للاستخدام' : 'Available to Use',
      formula: isRTL ? 'إجمالي المزايا - المستخدم' : 'Total Benefits - Utilized',
      dataSource: isRTL ? 'نظام المزايا' : 'Benefits System',
      variant: 'remaining' as const,
      secondaryValue: `${100 - calculatedMetrics.utilizationPercent}% ${isRTL ? 'متبقي' : 'remaining'}`,
    },
    { 
      icon: Target, 
      value: `${calculatedMetrics.benefitsAsPercentOfComp}%`, 
      label: isRTL ? 'المزايا من التعويضات' : 'Benefits % of Comp',
      formula: isRTL ? 'المزايا / إجمالي التعويضات' : 'Benefits Value / Total Compensation',
      dataSource: isRTL ? 'نظام الموارد البشرية' : 'HR System',
      variant: 'utilization' as const,
      secondaryValue: null,
    },
    { 
      icon: Calendar, 
      value: `${salaryData.leaveBalance} ${isRTL ? 'يوم' : 'days'}`, 
      label: isRTL ? 'رصيد الإجازات' : 'Leave Balance',
      formula: isRTL ? 'الإجمالي - المستخدم' : 'Total - Used',
      dataSource: isRTL ? 'نظام الإجازات' : 'Leave System',
      variant: 'remaining' as const,
      secondaryValue: `${salaryData.leaveUsed} ${isRTL ? 'مستخدم' : 'used'}`,
    },
    { 
      icon: Zap, 
      value: `${salaryData.activatedItems}`, 
      label: isRTL ? 'الامتيازات المفعّلة' : 'Activated Perks',
      formula: isRTL ? 'عدد التفعيلات' : 'Count of activations',
      dataSource: isRTL ? 'السوق' : 'Marketplace',
      variant: 'info' as const,
      secondaryValue: isRTL ? 'هذا الشهر' : 'This month',
    },
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

      {/* All 8 Metrics Grid - Compact Design */}
      <div className="grid grid-cols-4 lg:grid-cols-8 gap-2">
        {allMetrics.map((stat, index) => (
          <SummaryStatsCard
            key={stat.label}
            icon={stat.icon}
            value={stat.value}
            label={stat.label}
            formula={stat.formula}
            dataSource={stat.dataSource}
            variant={stat.variant}
            index={index}
            secondaryValue={stat.secondaryValue}
            compact
          />
        ))}
      </div>

      {/* Benefits Grid - Your Benefits */}
      <div>
        <div className={cn("flex items-center justify-between mb-3", isRTL && "flex-row-reverse")}>
          <h2 className="text-base font-display font-semibold">{t('employee.dashboard.yourBenefits')}</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn("text-accent hover:text-accent/80 h-7 text-xs", isRTL && "flex-row-reverse")}
            onClick={() => navigate('/employee/benefits')}
          >
            {t('common.seeAll')}
            <ChevronIcon className={cn("w-3 h-3", isRTL ? "mr-1" : "ml-1")} />
          </Button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {benefits.map((benefit, index) => {
            const utilization = Math.round((benefit.utilized / benefit.value) * 100);
            const remaining = benefit.value - benefit.utilized;
            const isFullyUsed = utilization >= 100;
            
            return (
              <Card 
                key={benefit.name} 
                className="benefit-card group cursor-pointer hover:border-accent/40 hover:shadow-sm transition-all duration-200 flex flex-col p-2.5"
                style={{ animationDelay: `${index * 30}ms` }}
                onClick={() => handleBenefitClick(benefit.name)}
              >
                <div className={cn("flex items-start gap-2", isRTL && "flex-row-reverse")}>
                  <div className="p-1.5 rounded-md bg-accent/10 group-hover:bg-accent/20 transition-colors shrink-0">
                    <benefit.icon className="w-3 h-3 text-accent" />
                  </div>
                  <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
                    <h3 className="font-medium text-xs truncate group-hover:text-accent transition-colors leading-tight">
                      {t(benefit.nameKey)}
                    </h3>
                    <span className={`${BENEFIT_TYPE_COLORS[benefit.type]} text-[9px]`}>
                      {t(`benefit.${benefit.type}`)}
                    </span>
                  </div>
                  <ChevronIcon className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
                
                <div className="mt-2 space-y-1 flex-1">
                  <div className={cn("flex justify-between text-[10px]", isRTL && "flex-row-reverse")}>
                    <span className="text-muted-foreground">{formatCurrency(benefit.utilized)}</span>
                    <span className={isFullyUsed ? 'text-emerald-600 font-semibold' : 'font-medium'}>{utilization}%</span>
                  </div>
                  <Progress 
                    value={utilization} 
                    className={`h-1 ${isFullyUsed ? '[&>div]:bg-emerald-500' : '[&>div]:bg-accent'}`}
                  />
                  <p className={cn("text-[9px] text-muted-foreground", isRTL && "text-right")}>
                    {t('employee.dashboard.remaining')}: {formatCurrency(remaining)}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Benefit Highlights Section */}
      <div>
        <h2 className={cn("text-base font-display font-semibold mb-3", isRTL && "text-right")}>
          {isRTL ? 'ملخص المزايا' : 'Benefit Highlights'}
        </h2>
        <div className="grid grid-cols-3 gap-2">
          <div 
            className="p-3 rounded-lg bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 cursor-pointer hover:border-emerald-500/40 hover:shadow-sm transition-all group"
            onClick={() => handleHighlightClick('fully-utilized')}
          >
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <div className={cn("flex items-center gap-1.5", isRTL && "flex-row-reverse")}>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-xs font-semibold text-emerald-600">{t('employee.dashboard.fullyUtilized')}</p>
              </div>
              <ChevronIcon className={cn(
                "w-3 h-3 text-emerald-500 opacity-0 group-hover:opacity-100 transition-all",
                !isRTL && "group-hover:translate-x-0.5",
                isRTL && "group-hover:-translate-x-0.5"
              )} />
            </div>
            <p className={cn("text-[10px] text-muted-foreground mt-1", isRTL && "text-right")}>
              {benefits.filter(b => (b.utilized / b.value) >= 1).length} {t('employee.dashboard.benefitsAt100')}
            </p>
          </div>
          <div 
            className="p-3 rounded-lg bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/20 cursor-pointer hover:border-amber-500/40 hover:shadow-sm transition-all group"
            onClick={() => handleHighlightClick('room-to-use')}
          >
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <div className={cn("flex items-center gap-1.5", isRTL && "flex-row-reverse")}>
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <p className="text-xs font-semibold text-amber-600">{t('employee.dashboard.roomToUse')}</p>
              </div>
              <ChevronIcon className={cn(
                "w-3 h-3 text-amber-500 opacity-0 group-hover:opacity-100 transition-all",
                !isRTL && "group-hover:translate-x-0.5",
                isRTL && "group-hover:-translate-x-0.5"
              )} />
            </div>
            <p className={cn("text-[10px] text-muted-foreground mt-1", isRTL && "text-right")}>
              {benefits.filter(b => (b.utilized / b.value) < 1).length} {t('employee.dashboard.benefitsWithRemaining')}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20">
            <div className={cn("flex items-center gap-1.5", isRTL && "flex-row-reverse")}>
              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
              <p className="text-xs font-semibold text-accent">{t('employee.dashboard.thisMonth')}</p>
            </div>
            <p className={cn("text-[10px] text-muted-foreground mt-1", isRTL && "text-right")}>
              {isRTL ? '٣ تفعيلات، ٢ مطالبات' : '3 activations, 2 claims'}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Section - More compact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
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
            height={220}
            gradientId="employeeBar"
            showLegend={true}
            onBarClick={handleBarClick}
            interactive={true}
          />
          <p className={cn("text-[10px] text-muted-foreground text-center mt-1", isRTL && "text-right")}>
            {t('employee.dashboard.clickBarDetails')}
          </p>
        </ChartContainer>

        {/* Radar Chart */}
        <ChartContainer 
          title={t('employee.dashboard.benefitComparison')}
          formula={isRTL ? 'استخدامك مقابل متوسط الشركة لكل مزايا' : 'Your utilization vs company average per benefit'}
          dataSource={isRTL ? 'نظام المزايا' : 'Benefits System'}
        >
          <AnimatedRadarChart
            data={benefitRadarData}
            height={220}
            showSecondary={true}
            primaryLabel={t('employee.dashboard.yourUtilization')}
            secondaryLabel={t('employee.dashboard.companyAvg')}
            showLegend={true}
          />
        </ChartContainer>
      </div>


      {/* Request Widget Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RequestClaimWidget />
        <SatisfactionSurvey compact={true} />
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
