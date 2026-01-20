import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, Home, GraduationCap, 
  Heart, Car, Dumbbell, BookOpen, ChevronRight, ChevronLeft, Gift, Wallet, Banknote, Clock
} from 'lucide-react';
import { SatisfactionSurvey } from '@/components/employee/SatisfactionSurvey';
import { BenefitsDrillDownSheet, SmartInsights } from '@/components/dashboard';
import { useLanguage } from '@/contexts/LanguageContext';
import { CompensationGrid } from '@/components/ui/compensation-summary-card';
import { BenefitsUtilizationCard } from '@/components/ui/benefits-utilization-card';
import { useUIVisibility } from '@/contexts/UIVisibilityContext';
import { usePrivacy } from '@/components/ui/privacy-toggle';
import { cn } from '@/lib/utils';
import { CompensationBreakdownModal } from '@/components/employee/CompensationBreakdownModal';
import { QuickActionsStrip } from '@/components/employee/QuickActionsStrip';
import { ProfileCompleteness } from '@/components/employee/ProfileCompleteness';
import { useEmployeeDashboard } from '@/hooks/useEmployeeDashboard';
import { DataQualityBadge } from '@/components/employer/DataQualityBadge';
import { DemoTip, DEMO_TIPS } from '@/components/demo';

// Benefit value types
type BenefitValueType = 'guaranteed' | 'employer_cost' | 'performance' | 'budget';

// Icon mapping for benefits
const benefitIcons: { [key: string]: React.ElementType } = {
  'Housing Allowance': Home,
  'Schooling Allowance': GraduationCap,
  'Health Insurance': Heart,
  'Transport & Mobility': Car,
  'Wellbeing Program': Dumbbell,
  'Learning & Development': BookOpen,
};

// Demo benefits data (used as fallback)
const demoBenefits = [
  { name: 'Housing Allowance', nameKey: 'benefit.housing', icon: Home, value: 120000, utilized: 120000, type: 'cash_allowances', valueType: 'guaranteed' as BenefitValueType, area: 'home_living', route: '/employee/housing', category: 'housing', claimable: true, description: 'Monthly housing allowance paid with salary', bullets: ['Paid monthly with salary', 'Can be used for rent or mortgage'], bulletsAr: ['يُدفع شهرياً مع الراتب', 'يمكن استخدامه للإيجار أو الرهن العقاري'] },
  { name: 'Schooling Allowance', nameKey: 'benefit.education', icon: GraduationCap, value: 60000, utilized: 42000, type: 'cash_allowances', valueType: 'guaranteed' as BenefitValueType, area: 'family_parenting', route: '/employee/schooling', category: 'education', claimable: true, description: 'School fee coverage for dependents', bullets: ['Per child up to 18 years', 'Covers tuition fees only'], bulletsAr: ['لكل طفل حتى ١٨ عاماً', 'يغطي الرسوم الدراسية فقط'] },
  { name: 'Health Insurance', nameKey: 'benefit.health', icon: Heart, value: 45000, utilized: 12500, type: 'health_protection', valueType: 'employer_cost' as BenefitValueType, area: 'health', route: '/employee/health', category: 'health', claimable: true, description: 'Comprehensive health coverage for family', bullets: ['Includes dental and optical', 'Covers spouse and children'], bulletsAr: ['يشمل طب الأسنان والبصريات', 'يغطي الزوج/الزوجة والأطفال'] },
  { name: 'Transport & Mobility', nameKey: 'benefit.transport', icon: Car, value: 39000, utilized: 33000, type: 'cash_allowances', valueType: 'guaranteed' as BenefitValueType, area: 'mobility', route: '/employee/transport', category: 'transport', claimable: true, description: 'Monthly transport and flight tickets', bullets: ['Monthly allowance: AED 2,000', 'Annual flight tickets included'], bulletsAr: ['بدل شهري: ٢٠٠٠ درهم', 'تذاكر الطيران السنوية مشمولة'] },
  { name: 'Wellbeing Program', nameKey: 'benefit.wellbeing', icon: Dumbbell, value: 6000, utilized: 3200, type: 'wellbeing', valueType: 'budget' as BenefitValueType, area: 'health', route: '/employee/wellbeing', category: 'wellbeing', claimable: true, description: 'Gym membership and wellness apps', bullets: ['Gym membership covered', 'Wellness app subscription'], bulletsAr: ['عضوية النادي الرياضي مغطاة', 'اشتراك تطبيق العافية'] },
  { name: 'Learning & Development', nameKey: 'benefit.learning', icon: BookOpen, value: 12000, utilized: 4500, type: 'growth_career', valueType: 'budget' as BenefitValueType, area: 'career', route: '/employee/learning', category: 'learning', claimable: true, description: 'Professional courses and certifications', bullets: ['Courses and certifications', 'Pre-approval required'], bulletsAr: ['الدورات والشهادات', 'يتطلب موافقة مسبقة'] },
];

// Demo leave data
const demoLeaveBalances = [
  { leaveType: 'Annual Leave', totalDays: 30, usedDays: 8, remainingDays: 22, year: 2024 },
  { leaveType: 'Sick Leave', totalDays: 15, usedDays: 2, remainingDays: 13, year: 2024 },
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
  
  // Fetch real data
  const { data: dashboardData, isLoading } = useEmployeeDashboard();
  
  // Check visibility for each section
  const showCompensationSummary = isElementVisible('employee', 'dashboard', 'compensation_summary');
  const showYourBenefits = isElementVisible('employee', 'dashboard', 'your_benefits');
  const showSatisfactionSurvey = isElementVisible('employee', 'dashboard', 'satisfaction_survey');

  // Use real data or fallback to demo
  const profileData = dashboardData?.profile || {
    firstName: 'User',
    lastName: '',
    monthlySalary: 35000,
    profileCompleteness: 70,
    missingFields: ['Phone Number', 'Emirates ID'],
  };

  const leaveBalances = dashboardData?.leaveBalances?.length 
    ? dashboardData.leaveBalances 
    : demoLeaveBalances;

  const pendingRequests = dashboardData?.pendingRequests || [];
  const pendingCount = pendingRequests.length;
  const urgentCount = pendingRequests.filter(r => r.isUrgent).length;

  const payrollData = dashboardData?.payroll || {
    nextPayDate: new Date(new Date().getFullYear(), new Date().getMonth(), 28).toISOString(),
    lastPayDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 28).toISOString(),
    currency: 'AED',
  };

  // Map real benefits to display format or use demo
  const benefits = useMemo(() => {
    if (dashboardData?.benefits && dashboardData.benefits.length > 0) {
      return dashboardData.benefits.map(b => ({
        name: b.name,
        nameKey: `benefit.${b.name.toLowerCase().replace(/\s+/g, '')}`,
        icon: benefitIcons[b.name] || Gift,
        value: b.annualAllowance,
        utilized: b.utilizedAmount,
        type: b.benefitType,
        valueType: b.benefitType === 'cash_allowances' ? 'guaranteed' as BenefitValueType : 'budget' as BenefitValueType,
        area: b.lifeArea,
        route: `/employee/${b.name.toLowerCase().replace(/\s+/g, '-')}`,
        category: b.name.toLowerCase(),
        claimable: true,
        description: b.description || '',
        bullets: [],
        bulletsAr: [],
      }));
    }
    return demoBenefits;
  }, [dashboardData?.benefits]);
  
  // Calculate derived metrics from actual benefit data
  const calculatedMetrics = useMemo(() => {
    const salaryData = {
      monthlySalary: profileData.monthlySalary || 35000,
      annualSalary: (profileData.monthlySalary || 35000) * 12,
    };

    const guaranteedBenefitValue = benefits
      .filter(b => b.valueType === 'guaranteed')
      .reduce((sum, b) => sum + b.value, 0);
    
    const potentialBenefitValue = benefits
      .filter(b => b.valueType !== 'guaranteed')
      .reduce((sum, b) => sum + b.value, 0);
    
    const totalBenefitValue = benefits.reduce((sum, b) => sum + b.value, 0);
    const totalUtilized = benefits.reduce((sum, b) => sum + b.utilized, 0);
    const totalRemaining = totalBenefitValue - totalUtilized;
    const utilizationPercent = Math.round((totalUtilized / totalBenefitValue) * 100);
    
    const guaranteedCompensation = salaryData.annualSalary + guaranteedBenefitValue;
    const potentialCompensation = salaryData.annualSalary + totalBenefitValue;
    const guaranteedBenefitsAsPercentOfComp = Math.round((guaranteedBenefitValue / guaranteedCompensation) * 100);
    const salaryAsPercentOfGuaranteed = Math.round((salaryData.annualSalary / guaranteedCompensation) * 100);
    
    return {
      ...salaryData,
      guaranteedBenefitValue,
      potentialBenefitValue,
      totalBenefitValue,
      totalUtilized,
      totalRemaining,
      utilizationPercent,
      guaranteedCompensation,
      potentialCompensation,
      guaranteedBenefitsAsPercentOfComp,
      salaryAsPercentOfGuaranteed,
    };
  }, [benefits, profileData.monthlySalary]);

  const formatCurrency = (value: number) => `${isRTL ? '' : 'AED '}${value.toLocaleString(isRTL ? 'ar-AE' : 'en-AE')}${isRTL ? ' درهم' : ''}`;
  const formatCurrencyHidden = () => salaryHidden ? '•••,•••' : '';
  const formatCurrencyShort = (value: number) => `${(value / 1000).toFixed(0)}${isRTL ? 'ألف' : 'K'}`;

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  const handleBenefitClick = (benefitName: string) => {
    const benefit = benefits.find(b => b.name === benefitName);
    if (benefit?.route) {
      navigate(benefit.route);
    }
  };

  // Helper to get utilization status badge
  const getStatusStyle = (utilization: number) => {
    if (utilization >= 100) return { badge: 'bg-success/10 text-success border-success/20', progress: '[&>div]:bg-success' };
    if (utilization >= 50) return { badge: 'bg-info/10 text-info border-info/20', progress: '[&>div]:bg-info' };
    if (utilization >= 20) return { badge: 'bg-warning/10 text-warning border-warning/20', progress: '[&>div]:bg-warning' };
    return { badge: 'bg-muted text-muted-foreground border-border', progress: '[&>div]:bg-muted-foreground/50' };
  };

  const hiddenValue = `${isRTL ? '' : 'AED '}•••,•••${isRTL ? ' درهم' : ''}`;
  
  const keyMetrics = [
    { 
      icon: Banknote, 
      value: salaryHidden ? hiddenValue : formatCurrency(calculatedMetrics.monthlySalary), 
      label: isRTL ? 'الراتب الشهري' : 'Monthly Salary',
      formula: isRTL ? 'الراتب الأساسي الشهري قبل الخصومات' : 'Base monthly salary before deductions',
      dataSource: isRTL ? 'نظام الموارد البشرية' : 'HR Payroll System',
      variant: 'primary' as const,
      isSensitive: true,
    },
    { 
      icon: DollarSign, 
      value: salaryHidden ? hiddenValue : formatCurrency(calculatedMetrics.annualSalary), 
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
        ? `البدلات النقدية المضمونة = ${formatCurrency(calculatedMetrics.guaranteedBenefitValue)}`
        : `Fixed cash allowances = ${formatCurrency(calculatedMetrics.guaranteedBenefitValue)}`,
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
        ? `(المزايا المضمونة ÷ إجمالي التعويضات المضمونة) × ١٠٠`
        : `(Guaranteed Benefits ÷ Guaranteed Compensation) × 100`,
      dataSource: isRTL ? 'محسوب - مضمون فقط' : 'Calculated - Guaranteed only',
      variant: 'benefits' as const,
      isSensitive: true,
    },
  ];

  const totalCompensationData = {
    value: salaryHidden ? hiddenValue : formatCurrency(calculatedMetrics.guaranteedCompensation),
    formula: isRTL 
      ? `الراتب السنوي + المزايا المضمونة`
      : `Annual Salary + Guaranteed Benefits`,
    dataSource: isRTL ? 'الراتب السنوي + المزايا المضمونة' : 'Annual Salary + Guaranteed Benefits',
    subtitle: salaryHidden ? undefined : (isRTL 
      ? `الإجمالي المحتمل: ${formatCurrency(calculatedMetrics.potentialCompensation)} شاملة المتغيرة`
      : `Potential: ${formatCurrency(calculatedMetrics.potentialCompensation)} incl. variable`),
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

  if (isLoading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-16 bg-muted rounded-xl" />
        <div className="h-12 bg-muted rounded-xl" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-muted rounded-xl" />)}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Demo Tip for Employee Benefits */}
      <DemoTip {...DEMO_TIPS.employeeBenefits} variant="highlight" />
      
      {/* Personalized Header with Profile Completeness */}
      <ProfileCompleteness
        firstName={profileData.firstName}
        completenessPercent={profileData.profileCompleteness}
        missingFields={profileData.missingFields}
        isRTL={isRTL}
      />

      {/* Quick Actions Strip with Next Payroll */}
      <QuickActionsStrip
        pendingCount={pendingCount}
        urgentCount={urgentCount}
        nextPayDate={payrollData.nextPayDate}
        isRTL={isRTL}
      />

      {/* Compensation Summary Grid */}
      {showCompensationSummary && (
        <section>
          <div className={cn("flex items-center justify-between mb-4", isRTL && "flex-row-reverse")}>
            <h2 className="text-lg font-display font-semibold tracking-tight">
              {isRTL ? 'ملخص التعويضات' : 'Compensation Summary'}
            </h2>
            <DataQualityBadge 
              confidence="high" 
              lastUpdated={dashboardData?.lastUpdated} 
              showDetails={false}
            />
          </div>
          <CompensationGrid 
            metrics={keyMetrics}
            totalCompensation={totalCompensationData}
            isRTL={isRTL}
          />
        </section>
      )}

      {/* Benefits Grid - Your Benefits */}
      {showYourBenefits && (
        <section>
          <div className={cn("flex items-center justify-between mb-5", isRTL && "flex-row-reverse")}>
            <h2 className="text-lg font-display font-semibold tracking-tight">{t('employee.dashboard.yourBenefits')}</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn("text-accent hover:text-accent/80 h-9 text-sm gap-1.5 font-medium", isRTL && "flex-row-reverse")}
              onClick={() => navigate('/employee/benefits')}
            >
              {t('common.seeAll')}
              <ChevronIcon className="w-4 h-4" />
            </Button>
          </div>
          
          {/* 2 rows x 3 columns grid - increased gap */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {benefits.map((benefit, index) => {
              const utilization = benefit.value > 0 ? Math.round((benefit.utilized / benefit.value) * 100) : 0;
              const remaining = benefit.value - benefit.utilized;
              const status = getStatusStyle(utilization);
              
              return (
                <Card 
                  key={benefit.name} 
                  className="group cursor-pointer bg-card border border-border/40 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 overflow-hidden"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => handleBenefitClick(benefit.name)}
                >
                  <div className="p-6">
                    {/* Header: Icon + Name */}
                    <div className={cn("flex items-start gap-4", isRTL && "flex-row-reverse")}>
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent/15 to-accent/5 flex items-center justify-center group-hover:from-accent/20 group-hover:to-accent/8 transition-all duration-300 shrink-0">
                        <benefit.icon className="w-5 h-5 text-accent" />
                      </div>
                      <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
                        <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse justify-end")}>
                          <h3 className="font-semibold text-[15px] text-foreground group-hover:text-accent transition-colors leading-tight">
                            {t(benefit.nameKey)}
                          </h3>
                          <ChevronIcon className={cn(
                            "w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all shrink-0"
                          )} />
                        </div>
                        <p className="text-[13px] text-muted-foreground mt-1.5 line-clamp-1">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Stats section - more breathing room */}
                    <div className="mt-6 space-y-4">
                      <div className={cn("flex items-end justify-between gap-3", isRTL && "flex-row-reverse")}>
                        <div className={cn(isRTL && "text-right")}>
                          <p className="text-xl font-bold text-foreground tracking-tight">
                            {formatCurrency(benefit.value)}
                          </p>
                          <p className="text-[13px] text-muted-foreground mt-1">
                            {isRTL ? 'القيمة السنوية' : 'Annual Value'}
                          </p>
                        </div>
                        <Badge 
                          variant="outline"
                          className={cn("text-[13px] px-3 py-1.5 font-medium border", status.badge)}
                        >
                          {utilization}%
                        </Badge>
                      </div>
                      
                      <Progress 
                        value={utilization} 
                        className={cn("h-1.5 bg-muted/30 rounded-full", status.progress)}
                      />
                      
                      <div className={cn("flex items-center justify-between text-[13px]", isRTL && "flex-row-reverse")}>
                        <span className="text-muted-foreground">
                          {formatCurrency(benefit.utilized)} {isRTL ? 'مستخدم' : 'used'}
                        </span>
                        <span className={cn("font-medium", remaining > 0 ? "text-accent" : "text-success")}>
                          {remaining > 0 
                            ? `${formatCurrency(remaining)} ${isRTL ? 'متبقي' : 'remaining'}`
                            : isRTL ? 'مكتمل' : 'Complete'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
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

      {/* Smart Insights */}
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
        benefits={demoBenefits}
      />

      {/* Compensation Breakdown Modal */}
      <CompensationBreakdownModal
        open={compensationModalOpen}
        onOpenChange={setCompensationModalOpen}
        isRTL={isRTL}
        salaryData={{ monthlySalary: calculatedMetrics.monthlySalary, annualSalary: calculatedMetrics.annualSalary }}
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
