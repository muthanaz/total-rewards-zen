import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, Home, GraduationCap, 
  Heart, Car, Dumbbell, PiggyBank, BookOpen, ChevronRight, ChevronLeft, Gift, Wallet, Banknote, AlertCircle, CheckCircle2, Clock, Award
} from 'lucide-react';
import { BENEFIT_CATEGORIES, BENEFIT_GROUPS, BenefitGroupKey } from '@/lib/benefitCategories';
import { getRAGIndicator, getProgressColorClass } from '@/lib/colorUtils';
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
  { name: 'Housing Allowance', nameKey: 'benefit.housing', icon: Home, value: 120000, utilized: 120000, type: 'cash_allowances', valueType: 'guaranteed' as BenefitValueType, area: 'home_living', route: '/employee/housing', category: 'housing', group: 'allowances' as BenefitGroupKey, claimable: true, bullets: ['Paid monthly with salary', 'Can be used for rent or mortgage'], bulletsAr: ['يُدفع شهرياً مع الراتب', 'يمكن استخدامه للإيجار أو الرهن العقاري'] },
  { name: 'Education Allowance', nameKey: 'benefit.education', icon: GraduationCap, value: 60000, utilized: 42000, type: 'cash_allowances', valueType: 'guaranteed' as BenefitValueType, area: 'family_parenting', route: '/employee/schooling', category: 'education', group: 'allowances' as BenefitGroupKey, claimable: true, bullets: ['Per child up to 18 years', 'Covers tuition fees only'], bulletsAr: ['لكل طفل حتى ١٨ عاماً', 'يغطي الرسوم الدراسية فقط'] },
  { name: 'Transport & Mobility', nameKey: 'benefit.transport', icon: Car, value: 39000, utilized: 33000, type: 'cash_allowances', valueType: 'guaranteed' as BenefitValueType, area: 'mobility', route: '/employee/transport', category: 'transport', group: 'allowances' as BenefitGroupKey, claimable: true, bullets: ['Monthly allowance: AED 2,000', 'Annual flight tickets included', 'Covers fuel, parking & tickets'], bulletsAr: ['بدل شهري: ٢٠٠٠ درهم', 'تذاكر الطيران السنوية مشمولة', 'يغطي الوقود والمواقف والتذاكر'] },
  { name: 'Health Insurance', nameKey: 'benefit.health', icon: Heart, value: 45000, utilized: 12500, type: 'health_protection', valueType: 'employer_cost' as BenefitValueType, area: 'health', route: '/employee/health', category: 'health', group: 'health_protection' as BenefitGroupKey, claimable: true, bullets: ['Includes dental and optical', 'Covers spouse and children'], bulletsAr: ['يشمل طب الأسنان والبصريات', 'يغطي الزوج/الزوجة والأطفال'] },
  { name: 'Wellbeing Program', nameKey: 'benefit.wellbeing', icon: Dumbbell, value: 6000, utilized: 3200, type: 'wellbeing', valueType: 'budget' as BenefitValueType, area: 'health', route: '/employee/wellbeing', category: 'wellbeing', group: 'health_protection' as BenefitGroupKey, claimable: true, bullets: ['Gym membership covered', 'Wellness app subscription'], bulletsAr: ['عضوية النادي الرياضي مغطاة', 'اشتراك تطبيق العافية'] },
  { name: 'Financial Planning', nameKey: 'benefit.financial', icon: PiggyBank, value: 36000, utilized: 18000, type: 'wealth_ownership', valueType: 'budget' as BenefitValueType, area: 'money', route: '/employee/financial', category: 'financial', group: 'financial_rewards' as BenefitGroupKey, claimable: false, bullets: ['5% employer match', 'Multiple fund options'], bulletsAr: ['مطابقة ٥٪ من صاحب العمل', 'خيارات صناديق متعددة'] },
  { name: 'Annual Bonus', nameKey: 'benefit.bonus', icon: Award, value: 70000, utilized: 0, type: 'cash_allowances', valueType: 'performance' as BenefitValueType, area: 'money', route: '/employee/bonus', category: 'rewards', group: 'financial_rewards' as BenefitGroupKey, claimable: false, bullets: ['Performance-based (0-200%)', 'Paid annually in March', 'Target: 2 months base salary'], bulletsAr: ['مبني على الأداء (٠-٢٠٠٪)', 'يُدفع سنوياً في مارس', 'الهدف: راتب شهرين أساسي'] },
  { name: 'Learning & Development', nameKey: 'benefit.learning', icon: BookOpen, value: 12000, utilized: 4500, type: 'growth_career', valueType: 'budget' as BenefitValueType, area: 'career', route: '/employee/learning', category: 'learning', group: 'financial_rewards' as BenefitGroupKey, claimable: true, bullets: ['Courses and certifications', 'Pre-approval required'], bulletsAr: ['الدورات والشهادات', 'يتطلب موافقة مسبقة'] },
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

  // Helper to get RAG badge for utilization
  const getRAGBadge = (utilization: number) => {
    const rag = getRAGIndicator(utilization);
    const Icon = rag.icon === 'check' ? CheckCircle2 : rag.icon === 'clock' ? Clock : AlertCircle;
    return (
      <Badge 
        variant="outline" 
        className={cn(
          "gap-0.5 text-[9px] px-1.5 py-0 h-4 shrink-0",
          rag.bgClass, 
          rag.textClass, 
          rag.borderClass
        )}
      >
        <Icon className="w-2.5 h-2.5" />
        {utilization}%
      </Badge>
    );
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

      {/* Benefits Grid - Your Benefits with RAG indicators */}
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {benefits.map((benefit, index) => {
              const utilization = Math.round((benefit.utilized / benefit.value) * 100);
              const remaining = benefit.value - benefit.utilized;
              const group = BENEFIT_GROUPS[benefit.group];
              const rag = getRAGIndicator(utilization);
              
              return (
                <Card 
                  key={benefit.name} 
                  className="group cursor-pointer hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden"
                  style={{ animationDelay: `${index * 30}ms` }}
                  onClick={() => handleBenefitClick(benefit.name)}
                >
                  {/* Group color bar at top */}
                  <div className={cn("h-1", group.bgClass)} />
                  
                  <div className="p-3 flex flex-col flex-1">
                    <div className={cn("flex items-start gap-2", isRTL && "flex-row-reverse")}>
                      <div className={cn("p-1.5 rounded-lg shrink-0", group.bgLightClass)}>
                        <benefit.icon className={cn("w-4 h-4", group.textClass)} />
                      </div>
                      <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
                        <h3 className="font-medium text-xs truncate group-hover:text-accent transition-colors leading-tight">
                          {t(benefit.nameKey)}
                        </h3>
                        {/* Group badge */}
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-[9px] px-1.5 py-0 h-4 mt-1",
                            group.bgLightClass, 
                            group.textClass, 
                            group.borderClass
                          )}
                        >
                          {isRTL ? BENEFIT_GROUPS[benefit.group].labelAr : BENEFIT_GROUPS[benefit.group].label}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mt-3 space-y-2 flex-1">
                      {/* Value and RAG */}
                      <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                        <span className="text-sm font-semibold">{formatCurrency(benefit.value)}</span>
                        {getRAGBadge(utilization)}
                      </div>
                      
                      {/* Progress bar with RAG color */}
                      <Progress 
                        value={utilization} 
                        className={cn("h-1.5", getProgressColorClass(utilization))}
                      />
                      
                      {/* Remaining */}
                      <p className={cn("text-[10px] text-muted-foreground", isRTL && "text-right")}>
                        {t('employee.dashboard.remaining')}: {formatCurrency(remaining)}
                      </p>
                    </div>
                    
                    {/* Action Buttons - only show for claimable benefits */}
                    {benefit.claimable && (
                      <div className="mt-2 pt-2 border-t border-border/30">
                        <BenefitActionButtons
                          benefitName={benefit.name}
                          benefitCategory={benefit.category}
                          isRTL={isRTL}
                          compact={true}
                        />
                      </div>
                    )}
                  </div>
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
