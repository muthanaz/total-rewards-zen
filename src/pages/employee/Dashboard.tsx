import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, Home, GraduationCap, 
  Heart, Car, Dumbbell, PiggyBank, BookOpen, ChevronRight, ChevronLeft, Gift, Wallet, Banknote
} from 'lucide-react';
import { BENEFIT_TYPE_COLORS } from '@/lib/constants';
import { SatisfactionSurvey } from '@/components/employee/SatisfactionSurvey';
import { BenefitActionButtons } from '@/components/employee/BenefitActionButtons';
import { DateRangeFilter, BenefitsDrillDownSheet } from '@/components/dashboard';
import { useLanguage } from '@/contexts/LanguageContext';
import { CompensationGrid } from '@/components/ui/compensation-summary-card';
import { useUIVisibility } from '@/contexts/UIVisibilityContext';
import { cn } from '@/lib/utils';

// Demo data - core salary info
const salaryData = {
  monthlySalary: 35000,
  annualSalary: 420000,
  leaveBalance: 22,
  leaveUsed: 8,
  activatedItems: 7,
};

const benefits = [
  { name: 'Housing Allowance', nameKey: 'benefit.housing', icon: Home, value: 120000, utilized: 120000, type: 'cash_allowances', area: 'home_living', route: '/employee/housing', category: 'Housing', claimable: true, bullets: ['Paid monthly with salary', 'Can be used for rent or mortgage'], bulletsAr: ['يُدفع شهرياً مع الراتب', 'يمكن استخدامه للإيجار أو الرهن العقاري'] },
  { name: 'Education Allowance', nameKey: 'benefit.education', icon: GraduationCap, value: 60000, utilized: 42000, type: 'cash_allowances', area: 'family_parenting', route: '/employee/schooling', category: 'Schooling', claimable: true, bullets: ['Per child up to 18 years', 'Covers tuition fees only'], bulletsAr: ['لكل طفل حتى ١٨ عاماً', 'يغطي الرسوم الدراسية فقط'] },
  { name: 'Health Insurance', nameKey: 'benefit.health', icon: Heart, value: 45000, utilized: 12500, type: 'health_protection', area: 'health', route: '/employee/health', category: 'Health Insurance', claimable: true, bullets: ['Includes dental and optical', 'Covers spouse and children'], bulletsAr: ['يشمل طب الأسنان والبصريات', 'يغطي الزوج/الزوجة والأطفال'] },
  { name: 'Transport & Mobility', nameKey: 'benefit.transportMobility', icon: Car, value: 39000, utilized: 33000, type: 'cash_allowances', area: 'mobility', route: '/employee/transport', category: 'Transport', claimable: true, bullets: ['Monthly allowance: AED 2,000', 'Annual flight tickets included', 'Covers fuel, parking & tickets'], bulletsAr: ['بدل شهري: ٢٠٠٠ درهم', 'تذاكر الطيران السنوية مشمولة', 'يغطي الوقود والمواقف والتذاكر'] },
  { name: 'Annual Bonus', nameKey: 'benefit.annualBonus', icon: Gift, value: 70000, utilized: 0, type: 'cash_allowances', area: 'money', route: '/employee/bonus', category: 'Bonus', claimable: false, bullets: ['Performance-based (0-200%)', 'Paid annually in March', 'Target: 2 months base salary'], bulletsAr: ['مبني على الأداء (٠-٢٠٠٪)', 'يُدفع سنوياً في مارس', 'الهدف: راتب شهرين أساسي'] },
  { name: 'Financial Planning', nameKey: 'benefit.financial', icon: PiggyBank, value: 36000, utilized: 18000, type: 'wealth_ownership', area: 'money', route: '/employee/financial', category: 'Financial', claimable: false, bullets: ['5% employer match', 'Multiple fund options'], bulletsAr: ['مطابقة ٥٪ من صاحب العمل', 'خيارات صناديق متعددة'] },
  { name: 'Wellbeing Program', nameKey: 'benefit.wellbeingProgram', icon: Dumbbell, value: 6000, utilized: 3200, type: 'wellbeing', area: 'health', route: '/employee/wellbeing', category: 'Wellbeing', claimable: true, bullets: ['Gym membership covered', 'Wellness app subscription'], bulletsAr: ['عضوية النادي الرياضي مغطاة', 'اشتراك تطبيق العافية'] },
  { name: 'Learning & Development', nameKey: 'benefit.learning', icon: BookOpen, value: 12000, utilized: 4500, type: 'growth_career', area: 'career', route: '/employee/learning', category: 'Learning & Development', claimable: true, bullets: ['Courses and certifications', 'Pre-approval required'], bulletsAr: ['الدورات والشهادات', 'يتطلب موافقة مسبقة'] },
];

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { t, language, direction } = useLanguage();
  const { isElementVisible } = useUIVisibility();
  const isRTL = direction === 'rtl';
  const [dateRange, setDateRange] = useState({ from: new Date(), to: new Date() });
  const [benefitsSheetOpen, setBenefitsSheetOpen] = useState(false);
  const [benefitsSheetCategory, setBenefitsSheetCategory] = useState<'fully-utilized' | 'room-to-use' | null>(null);
  
  // Check visibility for each section
  const showCompensationSummary = isElementVisible('employee', 'dashboard', 'compensation_summary');
  const showYourBenefits = isElementVisible('employee', 'dashboard', 'your_benefits');
  const showBenefitHighlights = isElementVisible('employee', 'dashboard', 'benefit_highlights');
  const showRequestWidget = isElementVisible('employee', 'dashboard', 'request_widget');
  const showSatisfactionSurvey = isElementVisible('employee', 'dashboard', 'satisfaction_survey');
  
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

  const handleExport = (format: 'csv' | 'pdf') => {
    // Demo export functionality
    console.log(`Exporting data as ${format}`);
  };

  // 4 Key Metrics with info tooltips
  const keyMetrics = [
    { 
      icon: Banknote, 
      value: formatCurrency(salaryData.monthlySalary), 
      label: isRTL ? 'الراتب الشهري' : 'Monthly Salary',
      formula: isRTL ? 'الراتب الأساسي الشهري قبل الخصومات' : 'Base monthly salary before deductions',
      dataSource: isRTL ? 'نظام الموارد البشرية' : 'HR Payroll System',
      variant: 'primary' as const,
    },
    { 
      icon: DollarSign, 
      value: formatCurrency(salaryData.annualSalary), 
      label: isRTL ? 'الراتب السنوي' : 'Annual Salary',
      formula: isRTL ? 'الراتب الشهري × ١٢ شهر' : 'Monthly Salary × 12 months',
      dataSource: isRTL ? 'نظام الموارد البشرية' : 'HR Payroll System',
      variant: 'primary' as const,
    },
    { 
      icon: Gift, 
      value: formatCurrency(calculatedMetrics.totalBenefitValue), 
      label: isRTL ? 'قيمة المزايا السنوية' : 'Annual Benefits Value',
      formula: isRTL ? 'مجموع جميع المزايا والبدلات السنوية' : 'Sum of all annual benefits & allowances',
      dataSource: isRTL ? 'نظام المزايا' : 'Benefits System',
      variant: 'warning' as const,
    },
    { 
      icon: Wallet, 
      value: `${calculatedMetrics.benefitsAsPercentOfComp}%`, 
      label: isRTL ? 'المزايا من التعويضات' : 'Benefits % of Package',
      formula: isRTL ? '(قيمة المزايا ÷ إجمالي التعويضات) × ١٠٠' : '(Benefits Value ÷ Total Compensation) × 100',
      dataSource: isRTL ? 'محسوب' : 'Calculated',
      variant: 'default' as const,
    },
  ];

  const totalCompensationData = {
    value: formatCurrency(calculatedMetrics.totalCompensation),
    formula: isRTL 
      ? `${formatCurrency(salaryData.annualSalary)} + ${formatCurrency(calculatedMetrics.totalBenefitValue)} = ${formatCurrency(calculatedMetrics.totalCompensation)}`
      : `${formatCurrency(salaryData.annualSalary)} + ${formatCurrency(calculatedMetrics.totalBenefitValue)} = ${formatCurrency(calculatedMetrics.totalCompensation)}`,
    dataSource: isRTL ? 'الراتب السنوي + قيمة المزايا' : 'Annual Salary + Benefits Value',
  };

  const utilizationData = {
    used: formatCurrency(calculatedMetrics.totalUtilized),
    usedPercent: calculatedMetrics.utilizationPercent,
    remaining: formatCurrency(calculatedMetrics.totalRemaining),
    remainingPercent: 100 - calculatedMetrics.utilizationPercent,
    formula: isRTL ? 'إجمالي المزايا المستخدمة من القيمة السنوية' : 'Total benefits claimed from annual value',
    dataSource: isRTL ? 'نظام المطالبات' : 'Claims System',
  };
  
  return (
    <div className="space-y-5 animate-fade-in">
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

      {/* Compensation Summary Grid */}
      {showCompensationSummary && (
        <CompensationGrid 
          metrics={keyMetrics}
          totalCompensation={totalCompensationData}
          utilization={utilizationData}
          isRTL={isRTL}
        />
      )}

      {/* Benefits Grid - Your Benefits */}
      {showYourBenefits && (
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
                  
                  {/* Action Buttons - only show for claimable benefits */}
                  {benefit.claimable && (
                    <div className="mt-2 pt-1.5 border-t border-border/30">
                      <BenefitActionButtons
                        benefitName={benefit.name}
                        benefitCategory={benefit.category}
                        isRTL={isRTL}
                        compact={true}
                      />
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Benefit Highlights Section */}
      {showBenefitHighlights && (
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
      )}

      {/* Satisfaction Survey Section */}
      {showSatisfactionSurvey && (
        <SatisfactionSurvey compact={true} />
      )}

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
