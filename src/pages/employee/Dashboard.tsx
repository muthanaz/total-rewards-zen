import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, Home, GraduationCap, 
  Heart, Car, Dumbbell, PiggyBank, BookOpen, ChevronRight, ChevronLeft, Gift, Wallet, Banknote, AlertCircle, CheckCircle2, Clock, Landmark, TrendingUp
} from 'lucide-react';
import { BENEFIT_TYPE_COLORS } from '@/lib/constants';
import { SatisfactionSurvey } from '@/components/employee/SatisfactionSurvey';
import { BenefitActionButtons } from '@/components/employee/BenefitActionButtons';
import { BenefitsDrillDownSheet, SmartInsights } from '@/components/dashboard';
import { TotalRewardsValueCard, ActionCenter, RecognitionStream, PersonalizedPerksWidget, QuickActionsGrid } from '@/components/dashboard';
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
  { name: 'Education Allowance', nameKey: 'benefit.education', icon: GraduationCap, value: 60000, utilized: 42000, type: 'cash_allowances', valueType: 'guaranteed' as BenefitValueType, area: 'family_parenting', route: '/employee/schooling', category: 'education', claimable: true, bullets: ['Per child up to 18 years', 'Covers tuition fees only'], bulletsAr: ['لكل طفل حتى ١٨ عاماً', 'يغطي الرسوم الدراسية فقط'] },
  { name: 'Health Insurance', nameKey: 'benefit.health', icon: Heart, value: 45000, utilized: 12500, type: 'health_protection', valueType: 'employer_cost' as BenefitValueType, area: 'health', route: '/employee/health', category: 'health', claimable: true, bullets: ['Includes dental and optical', 'Covers spouse and children'], bulletsAr: ['يشمل طب الأسنان والبصريات', 'يغطي الزوج/الزوجة والأطفال'] },
  { name: 'Transport & Mobility', nameKey: 'benefit.transport', icon: Car, value: 39000, utilized: 33000, type: 'cash_allowances', valueType: 'guaranteed' as BenefitValueType, area: 'mobility', route: '/employee/transport', category: 'transport', claimable: true, bullets: ['Monthly allowance: AED 2,000', 'Annual flight tickets included', 'Covers fuel, parking & tickets'], bulletsAr: ['بدل شهري: ٢٠٠٠ درهم', 'تذاكر الطيران السنوية مشمولة', 'يغطي الوقود والمواقف والتذاكر'] },
  { name: 'Annual Bonus', nameKey: 'benefit.bonus', icon: Gift, value: 70000, utilized: 0, type: 'cash_allowances', valueType: 'performance' as BenefitValueType, area: 'money', route: '/employee/bonus', category: 'rewards', claimable: false, bullets: ['Performance-based (0-200%)', 'Paid annually in March', 'Target: 2 months base salary'], bulletsAr: ['مبني على الأداء (٠-٢٠٠٪)', 'يُدفع سنوياً في مارس', 'الهدف: راتب شهرين أساسي'] },
  { name: 'Financial Planning', nameKey: 'benefit.financial', icon: PiggyBank, value: 36000, utilized: 18000, type: 'wealth_ownership', valueType: 'budget' as BenefitValueType, area: 'money', route: '/employee/financial', category: 'financial', claimable: false, bullets: ['5% employer match', 'Multiple fund options'], bulletsAr: ['مطابقة ٥٪ من صاحب العمل', 'خيارات صناديق متعددة'] },
  { name: 'Wellbeing Program', nameKey: 'benefit.wellbeing', icon: Dumbbell, value: 6000, utilized: 3200, type: 'wellbeing', valueType: 'budget' as BenefitValueType, area: 'health', route: '/employee/wellbeing', category: 'wellbeing', claimable: true, bullets: ['Gym membership covered', 'Wellness app subscription'], bulletsAr: ['عضوية النادي الرياضي مغطاة', 'اشتراك تطبيق العافية'] },
  { name: 'Learning & Development', nameKey: 'benefit.learning', icon: BookOpen, value: 12000, utilized: 4500, type: 'growth_career', valueType: 'budget' as BenefitValueType, area: 'career', route: '/employee/learning', category: 'learning', claimable: true, bullets: ['Courses and certifications', 'Pre-approval required'], bulletsAr: ['الدورات والشهادات', 'يتطلب موافقة مسبقة'] },
  { name: 'End of Service Gratuity', nameKey: 'benefit.gratuity', icon: Landmark, value: 102083, utilized: 102083, type: 'cash_allowances', valueType: 'guaranteed' as BenefitValueType, area: 'money', route: '/employee/gratuity', category: 'gratuity', claimable: false, bullets: ['UAE Labor Law entitlement', 'Paid on end of service'], bulletsAr: ['استحقاق قانون العمل الإماراتي', 'يُدفع عند نهاية الخدمة'] },
  { name: 'Equity & Options', nameKey: 'benefit.equity', icon: TrendingUp, value: 85000, utilized: 42500, type: 'wealth_ownership', valueType: 'performance' as BenefitValueType, area: 'money', route: '/employee/equity', category: 'equity', claimable: false, bullets: ['Stock options vest over 4 years', 'RSUs granted annually'], bulletsAr: ['خيارات الأسهم تستحق على مدى ٤ سنوات', 'وحدات الأسهم المقيدة تُمنح سنوياً'] },
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
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className={cn(
        "flex flex-col md:flex-row md:items-center justify-between gap-4",
        isRTL && "md:flex-row-reverse"
      )}>
        <div className={cn("space-y-1", isRTL && "text-right")}>
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
            {isRTL ? 'مركز المكافآت الشاملة' : 'My Total Rewards Hub'}
          </h1>
          <p className="text-muted-foreground">
            {isRTL ? 'عرض وإدارة حزمة المكافآت الكاملة الخاصة بك' : 'View and manage your complete rewards package'}
          </p>
        </div>
      </div>

      {/* Total Rewards Value Card - Hero Section */}
      <TotalRewardsValueCard 
        totalValue={calculatedMetrics.potentialCompensation}
        salaryValue={salaryData.annualSalary}
        benefitsValue={calculatedMetrics.guaranteedBenefitValue}
        variableValue={calculatedMetrics.potentialBenefitValue}
      />

      {/* Quick Actions Grid */}
      <QuickActionsGrid />

      {/* Two-Column Layout: Action Center + Recognition */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActionCenter />
        <RecognitionStream />
      </div>

      {/* Personalized Perks Widget */}
      <PersonalizedPerksWidget />

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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {benefits.map((benefit, index) => {
              const utilization = Math.round((benefit.utilized / benefit.value) * 100);
              const remaining = benefit.value - benefit.utilized;
              const isFullyUsed = utilization >= 100;
              
              return (
                <Card 
                  key={benefit.name} 
                  className={cn(
                    "p-3 hover:shadow-md transition-all cursor-pointer border-border/50 group relative overflow-hidden",
                    isFullyUsed && "bg-emerald-500/5 border-emerald-500/20"
                  )}
                  onClick={() => handleBenefitClick(benefit.name)}
                >
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-muted/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className={cn("relative flex flex-col gap-2", isRTL && "items-end")}>
                    {/* Header with icon and status */}
                    <div className={cn("flex items-start justify-between w-full", isRTL && "flex-row-reverse")}>
                      <div className={cn(
                        "p-1.5 rounded-lg transition-colors",
                        `bg-${BENEFIT_TYPE_COLORS[benefit.type as keyof typeof BENEFIT_TYPE_COLORS]}/10`
                      )}>
                        <benefit.icon className={cn(
                          "w-4 h-4",
                          `text-${BENEFIT_TYPE_COLORS[benefit.type as keyof typeof BENEFIT_TYPE_COLORS]}`
                        )} />
                      </div>
                      {getUtilizationBadge(utilization)}
                    </div>
                    
                    {/* Benefit name */}
                    <h3 className={cn(
                      "text-xs font-medium text-foreground leading-tight line-clamp-2",
                      isRTL && "text-right"
                    )}>
                      {benefit.name}
                    </h3>
                    
                    {/* Value display */}
                    <div className={cn("w-full", isRTL && "text-right")}>
                      <div className="text-sm font-bold text-foreground">
                        {formatCurrencyHidden(benefit.value)}
                      </div>
                      <div className={cn(
                        "text-[10px]",
                        isFullyUsed ? "text-emerald-600" : "text-muted-foreground"
                      )}>
                        {isFullyUsed 
                          ? (isRTL ? 'مستخدم بالكامل' : 'Fully utilized')
                          : (isRTL ? `${formatCurrencyShort(remaining)} متبقي` : `${formatCurrencyShort(remaining)} remaining`)
                        }
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <Progress 
                      value={utilization} 
                      className={cn(
                        "h-1 w-full",
                        isFullyUsed ? "[&>div]:bg-emerald-500" : ""
                      )}
                    />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Smart Insights */}
      <SmartInsights benefits={benefits} />

      {/* Satisfaction Survey */}
      {showSatisfactionSurvey && <SatisfactionSurvey />}

      {/* Benefits Drill Down Sheet */}
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
        salaryData={salaryData}
        benefits={benefits}
      />
    </div>
  );
}
