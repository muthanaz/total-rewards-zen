import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, Home, GraduationCap, 
  Heart, Car, Dumbbell, PiggyBank, BookOpen, ChevronRight, ChevronLeft, Gift, Wallet, Banknote, AlertCircle, CheckCircle2, Clock
} from 'lucide-react';
import { BENEFIT_TYPE_COLORS } from '@/lib/constants';
import { SatisfactionSurvey } from '@/components/employee/SatisfactionSurvey';
import { BenefitActionButtons } from '@/components/employee/BenefitActionButtons';
import { BenefitsDrillDownSheet, SmartInsights } from '@/components/dashboard';
import { useLanguage } from '@/contexts/LanguageContext';
import { CompensationGrid } from '@/components/ui/compensation-summary-card';
import { BenefitsUtilizationCard } from '@/components/ui/benefits-utilization-card';
import { useUIVisibility } from '@/contexts/UIVisibilityContext';
import { usePrivacy } from '@/components/ui/privacy-toggle';
import { cn } from '@/lib/utils';
import { CompensationBreakdownModal } from '@/components/employee/CompensationBreakdownModal';

// Demo data - core salary info
const salaryData = {
  monthlySalary: 35000,
  annualSalary: 420000,
  leaveBalance: 22,
  leaveUsed: 8,
  activatedItems: 7,
};

// Value types: 
// - guaranteed: Fixed cash paid regardless (Housing, Transport, Education)
// - employer_cost: Non-cash value paid by employer (Health Insurance premium)
// - performance: Variable based on performance (Annual Bonus)
// - budget: Use-it-or-lose-it allocations (Learning, Wellbeing, Financial)
type BenefitValueType = 'guaranteed' | 'employer_cost' | 'performance' | 'budget';

const benefits = [
  { name: 'Housing Allowance', nameKey: 'benefit.housing', icon: Home, value: 120000, utilized: 120000, type: 'cash_allowances', valueType: 'guaranteed' as BenefitValueType, area: 'home_living', route: '/employee/housing', category: 'housing', claimable: true, bullets: ['Paid monthly with salary', 'Can be used for rent or mortgage'], bulletsAr: ['يُدفع شهرياً مع الراتب', 'يمكن استخدامه للإيجار أو الرهن العقاري'] },
  { name: 'Schooling Allowance', nameKey: 'benefit.education', icon: GraduationCap, value: 60000, utilized: 42000, type: 'cash_allowances', valueType: 'guaranteed' as BenefitValueType, area: 'family_parenting', route: '/employee/schooling', category: 'education', claimable: true, bullets: ['Per child up to 18 years', 'Covers tuition fees only'], bulletsAr: ['لكل طفل حتى ١٨ عاماً', 'يغطي الرسوم الدراسية فقط'] },
  { name: 'Health Insurance', nameKey: 'benefit.health', icon: Heart, value: 45000, utilized: 12500, type: 'health_protection', valueType: 'employer_cost' as BenefitValueType, area: 'health', route: '/employee/health', category: 'health', claimable: true, bullets: ['Includes dental and optical', 'Covers spouse and children'], bulletsAr: ['يشمل طب الأسنان والبصريات', 'يغطي الزوج/الزوجة والأطفال'] },
  { name: 'Transport & Mobility', nameKey: 'benefit.transport', icon: Car, value: 39000, utilized: 33000, type: 'cash_allowances', valueType: 'guaranteed' as BenefitValueType, area: 'mobility', route: '/employee/transport', category: 'transport', claimable: true, bullets: ['Monthly allowance: AED 2,000', 'Annual flight tickets included', 'Covers fuel, parking & tickets'], bulletsAr: ['بدل شهري: ٢٠٠٠ درهم', 'تذاكر الطيران السنوية مشمولة', 'يغطي الوقود والمواقف والتذاكر'] },
  { name: 'Long-Term Financials', nameKey: 'benefit.financials', icon: PiggyBank, value: 0, utilized: 0, type: 'wealth_ownership', valueType: 'budget' as BenefitValueType, area: 'money', route: '/employee/long-term-financials', category: 'financial', claimable: false, bullets: ['Bonus, gratuity & savings', 'Equity vesting schedule'], bulletsAr: ['المكافآت والتقاعد والادخار', 'جدول استحقاق الأسهم'] },
  { name: 'Wellbeing Program', nameKey: 'benefit.wellbeing', icon: Dumbbell, value: 6000, utilized: 3200, type: 'wellbeing', valueType: 'budget' as BenefitValueType, area: 'health', route: '/employee/wellbeing', category: 'wellbeing', claimable: true, bullets: ['Gym membership covered', 'Wellness app subscription'], bulletsAr: ['عضوية النادي الرياضي مغطاة', 'اشتراك تطبيق العافية'] },
  { name: 'Learning & Development', nameKey: 'benefit.learning', icon: BookOpen, value: 12000, utilized: 4500, type: 'growth_career', valueType: 'budget' as BenefitValueType, area: 'career', route: '/employee/learning', category: 'learning', claimable: true, bullets: ['Courses and certifications', 'Pre-approval required'], bulletsAr: ['الدورات والشهادات', 'يتطلب موافقة مسبقة'] },
];

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { t, language, direction } = useLanguage();
  const { isElementVisible } = useUIVisibility();
  const { salaryHidden, toggleSalaryVisibility } = usePrivacy();
  const isRTL = direction === 'rtl';
  const [benefitsSheetOpen, setBenefitsSheetOpen] = useState(false);
  const [benefitsSheetCategory, setBenefitsSheetCategory] = useState<'fully-utilized' | 'room-to-use' | null>(null);
  const [compensationModalOpen, setCompensationModalOpen] = useState(false);
  
  // Check visibility for each section
  const showCompensationSummary = isElementVisible('employee', 'dashboard', 'compensation_summary');
  const showYourBenefits = isElementVisible('employee', 'dashboard', 'your_benefits');
  const showSatisfactionSurvey = isElementVisible('employee', 'dashboard', 'satisfaction_survey');
  
  // Calculate derived metrics from actual benefit data
  const calculatedMetrics = useMemo(() => {
    // Guaranteed benefits = Fixed cash allowances paid regardless
    const guaranteedBenefitValue = benefits
      .filter(b => b.valueType === 'guaranteed')
      .reduce((sum, b) => sum + b.value, 0);
    
    // Potential/variable benefits = Employer cost, performance, and budget-based
    const potentialBenefitValue = benefits
      .filter(b => b.valueType !== 'guaranteed')
      .reduce((sum, b) => sum + b.value, 0);
    
    const totalBenefitValue = benefits.reduce((sum, b) => sum + b.value, 0);
    const totalUtilized = benefits.reduce((sum, b) => sum + b.utilized, 0);
    const totalRemaining = totalBenefitValue - totalUtilized;
    const utilizationPercent = Math.round((totalUtilized / totalBenefitValue) * 100);
    const fullyUtilizedCount = benefits.filter(b => (b.utilized / b.value) >= 1).length;
    const underutilizedCount = benefits.filter(b => (b.utilized / b.value) < 0.5).length;
    const avgUtilizationPerBenefit = Math.round(totalUtilized / benefits.length);
    
    // Total guaranteed compensation = salary + guaranteed benefits only
    const guaranteedCompensation = salaryData.annualSalary + guaranteedBenefitValue;
    // Potential total = salary + all benefits
    const potentialCompensation = salaryData.annualSalary + totalBenefitValue;
    
    // For display, show guaranteed values as the primary metrics
    const guaranteedBenefitsAsPercentOfComp = Math.round((guaranteedBenefitValue / guaranteedCompensation) * 100);
    const salaryAsPercentOfGuaranteed = Math.round((salaryData.annualSalary / guaranteedCompensation) * 100);
    
    // Trend data (demo - comparing to last month)
    const lastMonthUtilized = totalUtilized * 0.92; // Demo: 8% growth
    const lastMonthUtilizationPercent = 52; // Demo value
    
    return {
      guaranteedBenefitValue,
      potentialBenefitValue,
      totalBenefitValue,
      totalUtilized,
      totalRemaining,
      utilizationPercent,
      fullyUtilizedCount,
      underutilizedCount,
      guaranteedCompensation,
      potentialCompensation,
      guaranteedBenefitsAsPercentOfComp,
      salaryAsPercentOfGuaranteed,
      avgUtilizationPerBenefit,
      lastMonthUtilized,
      lastMonthUtilizationPercent
    };
  }, []);

  const formatCurrency = (value: number) => `${isRTL ? '' : 'AED '}${value.toLocaleString(isRTL ? 'ar-AE' : 'en-AE')}${isRTL ? ' درهم' : ''}`;
  const formatCurrencyHidden = (value: number) => salaryHidden ? '•••,•••' : formatCurrency(value);
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

  // Helper to get utilization status badge
  const getUtilizationBadge = (utilization: number) => {
    if (utilization >= 100) {
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 border-0 text-[9px] px-1.5 py-0 gap-0.5">
          <CheckCircle2 className="w-2.5 h-2.5" />
          {isRTL ? 'مكتمل' : 'Complete'}
        </Badge>
      );
    }
    if (utilization < 30) {
      return (
        <Badge className="bg-amber-500/10 text-amber-600 border-0 text-[9px] px-1.5 py-0 gap-0.5">
          <AlertCircle className="w-2.5 h-2.5" />
          {isRTL ? 'فرصة' : 'Opportunity'}
        </Badge>
      );
    }
    if (utilization < 70) {
      return (
        <Badge className="bg-blue-500/10 text-blue-600 border-0 text-[9px] px-1.5 py-0 gap-0.5">
          <Clock className="w-2.5 h-2.5" />
          {isRTL ? 'قيد الاستخدام' : 'In Progress'}
        </Badge>
      );
    }
    return null;
  };

  // 4 Key Metrics with info tooltips - Now showing guaranteed values prominently
  const hiddenValue = `${isRTL ? '' : 'AED '}•••,•••${isRTL ? ' درهم' : ''}`;
  const keyMetrics = [
    { 
      icon: Banknote, 
      value: salaryHidden ? hiddenValue : formatCurrency(salaryData.monthlySalary), 
      label: isRTL ? 'الراتب الشهري' : 'Monthly Salary',
      formula: isRTL ? 'الراتب الأساسي الشهري قبل الخصومات' : 'Base monthly salary before deductions',
      dataSource: isRTL ? 'نظام الموارد البشرية' : 'HR Payroll System',
      variant: 'primary' as const,
      isSensitive: true,
    },
    { 
      icon: DollarSign, 
      value: salaryHidden ? hiddenValue : formatCurrency(salaryData.annualSalary), 
      label: isRTL ? 'الراتب السنوي' : 'Annual Salary',
      formula: isRTL ? 'الراتب الشهري × ١٢ شهر' : 'Monthly Salary × 12 months',
      dataSource: isRTL ? 'نظام الموارد البشرية' : 'HR Payroll System',
      variant: 'primary' as const,
      isSensitive: true,
    },
    { 
      icon: Gift, 
      value: salaryHidden ? hiddenValue : formatCurrency(calculatedMetrics.guaranteedBenefitValue), 
      label: isRTL ? 'المزايا المضمونة' : 'Guaranteed Benefits',
      formula: isRTL 
        ? `البدلات النقدية المضمونة (السكن + التعليم + النقل) = ${formatCurrency(calculatedMetrics.guaranteedBenefitValue)}. لا تشمل: المكافآت والميزانيات المتغيرة`
        : `Fixed cash allowances (Housing + Education + Transport) = ${formatCurrency(calculatedMetrics.guaranteedBenefitValue)}. Excludes: bonuses and variable budgets`,
      dataSource: isRTL ? 'نظام المزايا - مضمون' : 'Benefits System - Guaranteed',
      variant: 'benefits' as const,
      isSensitive: true,
      subtitle: salaryHidden ? undefined : (isRTL 
        ? `حتى ${formatCurrencyShort(calculatedMetrics.totalBenefitValue)} شاملة المتغيرة`
        : `Up to ${formatCurrencyShort(calculatedMetrics.totalBenefitValue)} incl. variable`),
    },
    { 
      icon: Wallet, 
      value: salaryHidden ? '••%' : `${calculatedMetrics.guaranteedBenefitsAsPercentOfComp}%`, 
      label: isRTL ? 'المزايا من التعويضات' : 'Benefits % of Package',
      formula: isRTL 
        ? `(المزايا المضمونة ÷ إجمالي التعويضات المضمونة) × ١٠٠ = (${formatCurrency(calculatedMetrics.guaranteedBenefitValue)} ÷ ${formatCurrency(calculatedMetrics.guaranteedCompensation)}) × 100`
        : `(Guaranteed Benefits ÷ Guaranteed Compensation) × 100 = (${formatCurrency(calculatedMetrics.guaranteedBenefitValue)} ÷ ${formatCurrency(calculatedMetrics.guaranteedCompensation)}) × 100`,
      dataSource: isRTL ? 'محسوب - مضمون فقط' : 'Calculated - Guaranteed only',
      variant: 'benefits' as const,
      isSensitive: true,
    },
  ];

  const totalCompensationData = {
    value: salaryHidden ? `${isRTL ? '' : 'AED '}•••,•••${isRTL ? ' درهم' : ''}` : formatCurrency(calculatedMetrics.guaranteedCompensation),
    formula: isRTL 
      ? `الراتب السنوي (${formatCurrency(salaryData.annualSalary)}) + المزايا المضمونة (${formatCurrency(calculatedMetrics.guaranteedBenefitValue)}) = ${formatCurrency(calculatedMetrics.guaranteedCompensation)}`
      : `Annual Salary (${formatCurrency(salaryData.annualSalary)}) + Guaranteed Benefits (${formatCurrency(calculatedMetrics.guaranteedBenefitValue)}) = ${formatCurrency(calculatedMetrics.guaranteedCompensation)}`,
    dataSource: isRTL ? 'الراتب السنوي + المزايا المضمونة' : 'Annual Salary + Guaranteed Benefits',
    subtitle: salaryHidden ? undefined : (isRTL 
      ? `الإجمالي المحتمل: ${formatCurrency(calculatedMetrics.potentialCompensation)} شاملة المتغيرة`
      : `Potential total: ${formatCurrency(calculatedMetrics.potentialCompensation)} incl. variable`),
    salaryHidden,
    onTogglePrivacy: toggleSalaryVisibility,
    salaryPercent: calculatedMetrics.salaryAsPercentOfGuaranteed,
    benefitsPercent: calculatedMetrics.guaranteedBenefitsAsPercentOfComp,
    onCardClick: () => setCompensationModalOpen(true),
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
      {/* Header - Simplified without Date Filter */}
      <div className={cn(
        "flex flex-col md:flex-row md:items-center justify-between gap-4",
        isRTL && "md:flex-row-reverse"
      )}>
        <div className={cn("space-y-1", isRTL && "text-right")}>
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">{t('employee.dashboard.title')}</h1>
          <p className="text-muted-foreground">{t('employee.dashboard.subtitle')}</p>
        </div>
      </div>

      {/* Compensation Summary Grid */}
      {showCompensationSummary && (
        <div>
          <h2 className={cn("text-base font-display font-semibold mb-3", isRTL && "text-right")}>
            {isRTL ? 'ملخص التعويضات' : 'Compensation Summary'}
          </h2>
          <CompensationGrid 
            metrics={keyMetrics}
            totalCompensation={totalCompensationData}
            isRTL={isRTL}
          />
        </div>
      )}

      {/* Benefits Grid - Your Benefits */}
      {showYourBenefits && (
        <div>
          <div className={cn("flex items-center justify-between mb-4", isRTL && "flex-row-reverse")}>
            <h2 className="text-base font-display font-semibold">{t('employee.dashboard.yourBenefits')}</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn("text-accent hover:text-accent/80 h-7 text-xs gap-1", isRTL && "flex-row-reverse")}
              onClick={() => navigate('/employee/benefits')}
            >
              {t('common.seeAll')}
              <ChevronIcon className="w-3 h-3" />
            </Button>
          </div>
          
          {/* Modern grid layout - 4 columns on desktop, 2 on mobile */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {benefits.map((benefit, index) => {
              const utilization = benefit.value > 0 ? Math.round((benefit.utilized / benefit.value) * 100) : 0;
              const remaining = benefit.value - benefit.utilized;
              const isFullyUsed = utilization >= 100;
              const hasValue = benefit.value > 0;
              
              return (
                <Card 
                  key={benefit.name} 
                  className="group cursor-pointer border bg-card hover:bg-accent/5 hover:border-accent/30 transition-all duration-200 overflow-hidden"
                  style={{ animationDelay: `${index * 40}ms` }}
                  onClick={() => handleBenefitClick(benefit.name)}
                >
                  <div className="p-4">
                    {/* Header row with icon and name */}
                    <div className={cn("flex items-center gap-3 mb-3", isRTL && "flex-row-reverse")}>
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors shrink-0">
                        <benefit.icon className="w-5 h-5 text-accent" />
                      </div>
                      <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
                        <h3 className="font-semibold text-sm leading-tight group-hover:text-accent transition-colors line-clamp-1">
                          {t(benefit.nameKey)}
                        </h3>
                        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                          {benefit.bullets[0]}
                        </p>
                      </div>
                    </div>
                    
                    {/* Value display */}
                    {hasValue ? (
                      <div className="space-y-2">
                        <div className={cn("flex items-baseline justify-between", isRTL && "flex-row-reverse")}>
                          <span className="text-lg font-bold text-foreground">
                            {formatCurrencyShort(benefit.value)}
                          </span>
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              "text-[10px] px-1.5 py-0 h-5",
                              isFullyUsed 
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                                : utilization < 30 
                                  ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                  : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                            )}
                          >
                            {utilization}% {isRTL ? 'مستخدم' : 'used'}
                          </Badge>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="relative">
                          <Progress 
                            value={utilization} 
                            className={cn(
                              "h-1.5 bg-muted/50",
                              isFullyUsed 
                                ? "[&>div]:bg-emerald-500" 
                                : "[&>div]:bg-accent"
                            )}
                          />
                        </div>
                        
                        {/* Remaining amount */}
                        <p className={cn("text-xs text-muted-foreground", isRTL && "text-right")}>
                          {remaining > 0 
                            ? `${formatCurrency(remaining)} ${isRTL ? 'متبقي' : 'remaining'}`
                            : isRTL ? 'تم الاستخدام بالكامل' : 'Fully utilized'
                          }
                        </p>
                      </div>
                    ) : (
                      <div className={cn("text-center py-2", isRTL && "text-right")}>
                        <span className="text-sm text-muted-foreground">
                          {isRTL ? 'عرض التفاصيل' : 'View Details'}
                        </span>
                        <ChevronIcon className="w-4 h-4 inline-block text-muted-foreground ml-1" />
                      </div>
                    )}
                  </div>
                  
                  {/* Bottom action area - only for claimable benefits */}
                  {benefit.claimable && hasValue && (
                    <div className="px-4 py-2 border-t bg-muted/30">
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

      {/* Benefits Utilization Section */}
      {showCompensationSummary && (
        <div>
          <h2 className={cn("text-base font-display font-semibold mb-3", isRTL && "text-right")}>
            {isRTL ? 'استخدام المزايا' : 'Benefits Utilization'}
          </h2>
          <BenefitsUtilizationCard
            utilization={utilizationData}
            isRTL={isRTL}
            salaryHidden={salaryHidden}
          />
        </div>
      )}

      {/* Smart Insights - AI-powered recommendations replacing Benefit Highlights */}
      {showCompensationSummary && (
        <SmartInsights 
          benefits={benefits.map(b => ({
            name: b.name,
            value: b.value,
            utilized: b.utilized,
            route: b.route,
            valueType: b.valueType,
          }))}
        />
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

      {/* Compensation Breakdown Modal */}
      <CompensationBreakdownModal
        open={compensationModalOpen}
        onOpenChange={setCompensationModalOpen}
        isRTL={isRTL}
        salaryData={salaryData}
        benefits={benefits.map(b => ({
          name: b.name,
          value: b.value,
          utilized: b.utilized,
          valueType: b.valueType,
        }))}
      />
    </div>
  );
}
