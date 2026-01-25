import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, GraduationCap, Heart, Car, Dumbbell, BookOpen, Gift,
  Wallet, DollarSign, Briefcase, LucideIcon, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SatisfactionSurvey } from '@/components/employee/SatisfactionSurvey';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUIVisibility } from '@/contexts/UIVisibilityContext';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { useEmployeeDashboard } from '@/hooks/useEmployeeDashboard';
import { DemoTip, DEMO_TIPS } from '@/components/demo';
import { DEMO_FALLBACKS } from '@/lib/metrics/computations';

// Dashboard components matching the reference design
import { ProfileCompleteness } from '@/components/employee/ProfileCompleteness';
import { QuickActionsStrip } from '@/components/employee/QuickActionsStrip';
import { CompensationGrid } from '@/components/ui/compensation-summary-card';
import { BenefitCard } from '@/components/employee/BenefitCard';

// Benefit value types
type BenefitValueType = 'guaranteed' | 'employer_cost' | 'performance' | 'budget';

// Benefit configuration: maps internal names to sidebar-consistent display names, icons, and routes
const BENEFIT_CONFIG: Record<string, { displayName: string; icon: LucideIcon; route: string }> = {
  'Housing': { displayName: 'Housing', icon: Home, route: '/employee/housing' },
  'Housing Allowance': { displayName: 'Housing', icon: Home, route: '/employee/housing' },
  'Schooling': { displayName: 'Schooling', icon: GraduationCap, route: '/employee/schooling' },
  'Schooling Allowance': { displayName: 'Schooling', icon: GraduationCap, route: '/employee/schooling' },
  'Health Insurance': { displayName: 'Health Insurance', icon: Heart, route: '/employee/health' },
  'Health': { displayName: 'Health Insurance', icon: Heart, route: '/employee/health' },
  'Transport': { displayName: 'Transport', icon: Car, route: '/employee/transport' },
  'Transport & Mobility': { displayName: 'Transport', icon: Car, route: '/employee/transport' },
  'Wellbeing': { displayName: 'Wellbeing', icon: Dumbbell, route: '/employee/wellbeing' },
  'Wellbeing Program': { displayName: 'Wellbeing', icon: Dumbbell, route: '/employee/wellbeing' },
  'Learning & Development': { displayName: 'Learning & Development', icon: BookOpen, route: '/employee/learning' },
  'Learning': { displayName: 'Learning & Development', icon: BookOpen, route: '/employee/learning' },
  'Long-Term Financials': { displayName: 'Long-Term Financials', icon: Wallet, route: '/employee/long-term-financials' },
};

// Get benefit config with fallback
const getBenefitConfig = (name: string) => {
  return BENEFIT_CONFIG[name] || { 
    displayName: name, 
    icon: Gift, 
    route: `/employee/${name.toLowerCase().replace(/\s+/g, '-')}` 
  };
};

const demoBenefits = [
  { name: 'Housing', value: 120000, utilized: 120000, type: 'cash_allowances', valueType: 'guaranteed' as BenefitValueType, area: 'home_living', category: 'housing', claimable: true, description: 'Monthly housing allowance paid with salary' },
  { name: 'Schooling', value: 60000, utilized: 42000, type: 'cash_allowances', valueType: 'guaranteed' as BenefitValueType, area: 'family_parenting', category: 'education', claimable: true, description: 'School fee coverage for dependents' },
  { name: 'Health Insurance', value: 45000, utilized: 12500, type: 'health_protection', valueType: 'employer_cost' as BenefitValueType, area: 'health', category: 'health', claimable: true, description: 'Comprehensive health coverage for family' },
  { name: 'Transport', value: 39000, utilized: 33000, type: 'cash_allowances', valueType: 'guaranteed' as BenefitValueType, area: 'mobility', category: 'transport', claimable: true, description: 'Monthly transport and flight tickets' },
  { name: 'Wellbeing', value: 6000, utilized: 3200, type: 'wellbeing', valueType: 'budget' as BenefitValueType, area: 'health', category: 'wellbeing', claimable: true, description: 'Gym membership and wellness apps' },
  { name: 'Learning & Development', value: 12000, utilized: 4500, type: 'growth_career', valueType: 'budget' as BenefitValueType, area: 'career', category: 'learning', claimable: true, description: 'Professional courses and certifications' },
];

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { t, language, direction } = useLanguage();
  const { isElementVisible } = useUIVisibility();
  const isRTL = direction === 'rtl';
  
  // Privacy toggle state
  const [salaryHidden, setSalaryHidden] = useState(false);
  
  // Fetch real data
  const { data: dashboardData, isLoading } = useEmployeeDashboard();
  
  // Check visibility for each section
  const showCompensation = isElementVisible('employee', 'dashboard', 'compensation_summary');
  const showYourBenefits = isElementVisible('employee', 'dashboard', 'your_benefits');
  const showSatisfactionSurvey = isElementVisible('employee', 'dashboard', 'satisfaction_survey');

  // CRITICAL: Always use realistic values from centralized fallbacks - never show 0 for salary
  // Use real data if available with meaningful values, otherwise fallback to demo
  const hasValidSalary = dashboardData?.profile?.monthlySalary && dashboardData.profile.monthlySalary > 0;
  const hasValidBenefits = dashboardData?.totals?.guaranteedBenefits && dashboardData.totals.guaranteedBenefits > 0;
  
  const profileData = {
    firstName: dashboardData?.profile?.firstName || 'Demo',
    lastName: dashboardData?.profile?.lastName || '',
    monthlySalary: hasValidSalary ? dashboardData.profile.monthlySalary : DEMO_FALLBACKS.employeeMonthlySalary,
    profileCompleteness: dashboardData?.profile?.profileCompleteness ?? 22,
    missingFields: dashboardData?.profile?.missingFields || ['Phone Number', 'Emirates ID'],
  };

  const totals = {
    annualSalary: hasValidSalary ? dashboardData.totals.annualSalary : DEMO_FALLBACKS.employeeAnnualSalary,
    guaranteedBenefits: hasValidBenefits ? dashboardData.totals.guaranteedBenefits : DEMO_FALLBACKS.employeeGuaranteedBenefits,
    totalBenefitsValue: dashboardData?.totals?.totalBenefitsValue || DEMO_FALLBACKS.employeeTotalBenefits,
    totalUtilized: dashboardData?.totals?.totalUtilized || DEMO_FALLBACKS.employeeUtilized,
    utilizationPercent: dashboardData?.totals?.utilizationPercent || 76,
    totalCompensation: (hasValidSalary ? dashboardData.totals.annualSalary : DEMO_FALLBACKS.employeeAnnualSalary) + 
                       (hasValidBenefits ? dashboardData.totals.guaranteedBenefits : DEMO_FALLBACKS.employeeGuaranteedBenefits),
  };

  const payroll = dashboardData?.payroll || {
    nextPayDate: new Date(new Date().getFullYear(), new Date().getMonth(), 28).toISOString(),
    currency: 'AED',
  };

  const pendingRequests = dashboardData?.pendingRequests || [];
  const pendingCount = pendingRequests.length;
  const urgentCount = pendingRequests.filter(r => r.isUrgent).length;

  // Map real benefits to display format or use demo - ensures routes match sidebar
  const benefits = useMemo(() => {
    if (dashboardData?.benefits && dashboardData.benefits.length > 0) {
      return dashboardData.benefits.map(b => {
        const config = getBenefitConfig(b.name);
        return {
          name: config.displayName,
          icon: config.icon,
          value: b.annualAllowance,
          utilized: b.utilizedAmount,
          type: b.benefitType,
          valueType: b.benefitType === 'cash_allowances' ? 'guaranteed' as BenefitValueType : 'budget' as BenefitValueType,
          area: b.lifeArea,
          route: config.route,
          category: b.name.toLowerCase(),
          claimable: true,
          description: b.description || '',
        };
      });
    }
    // Use demo benefits with config lookup
    return demoBenefits.map(b => {
      const config = getBenefitConfig(b.name);
      return {
        ...b,
        name: config.displayName,
        icon: config.icon,
        route: config.route,
      };
    });
  }, [dashboardData?.benefits]);

  // Build compensation metrics for the grid
  const compensationMetrics = useMemo(() => {
    const annualSalary = totals.annualSalary;
    const monthlyBase = profileData.monthlySalary;
    const guaranteedBenefits = totals.guaranteedBenefits;
    const benefitsPercent = totals.totalCompensation > 0 
      ? Math.round((guaranteedBenefits / totals.totalCompensation) * 100)
      : 34;
    
    return [
      {
        icon: Wallet,
        value: formatCurrencyAED(monthlyBase, { abbreviate: false }),
        label: isRTL ? 'الراتب الشهري' : 'MONTHLY SALARY',
        formula: isRTL ? 'الراتب الأساسي الشهري' : 'Monthly base salary',
        dataSource: 'Payroll',
        variant: 'primary' as const,
        isSensitive: true,
      },
      {
        icon: DollarSign,
        value: formatCurrencyAED(annualSalary, { abbreviate: false }),
        label: isRTL ? 'الراتب السنوي' : 'ANNUAL SALARY',
        formula: isRTL ? 'الراتب الشهري × 12' : 'Monthly Salary × 12',
        dataSource: 'HR System',
        variant: 'primary' as const,
        isSensitive: true,
      },
      {
        icon: Gift,
        value: formatCurrencyAED(guaranteedBenefits, { abbreviate: false }),
        label: isRTL ? 'المزايا المضمونة' : 'GUARANTEED BENEFITS',
        formula: isRTL ? 'السكن + التعليم + النقل' : 'Housing + Education + Transport',
        dataSource: 'Benefits System',
        variant: 'benefits' as const,
        isSensitive: false,
        subtitle: isRTL 
          ? `حتى ${formatCurrencyAED(totals.totalBenefitsValue, { abbreviate: false })} شامل المتغير`
          : `Up to ${formatCurrencyAED(totals.totalBenefitsValue, { abbreviate: false })} incl. variable`,
      },
      {
        icon: Briefcase,
        value: `${benefitsPercent}%`,
        label: isRTL ? 'نسبة المزايا' : 'BENEFITS % OF PACKAGE',
        formula: isRTL ? 'المزايا ÷ إجمالي التعويضات' : 'Benefits ÷ Total Compensation',
        dataSource: 'Benefits System',
        variant: 'benefits' as const, // Match guaranteed benefits color
        isSensitive: false,
      },
    ];
  }, [totals, profileData.monthlySalary, isRTL]);

  // Total compensation for the main card
  const totalCompensation = useMemo(() => {
    const total = totals.totalCompensation;
    const salaryPercent = totals.annualSalary > 0 
      ? Math.round((totals.annualSalary / total) * 100)
      : 66;
    const benefitsPercent = 100 - salaryPercent;
    const potentialTotal = total + (totals.totalBenefitsValue - totals.guaranteedBenefits);
    
    return {
      value: formatCurrencyAED(total, { abbreviate: false }),
      formula: isRTL ? 'الراتب السنوي + المزايا المضمونة' : 'Annual Salary + Guaranteed Benefits',
      dataSource: 'HR & Benefits Systems',
      subtitle: isRTL 
        ? `المحتمل: ${formatCurrencyAED(potentialTotal, { abbreviate: false })} شامل المتغير`
        : `Potential: ${formatCurrencyAED(potentialTotal, { abbreviate: false })} incl. variable`,
      salaryHidden,
      onTogglePrivacy: () => setSalaryHidden(!salaryHidden),
      salaryPercent,
      benefitsPercent,
    };
  }, [totals, salaryHidden, isRTL]);

  if (isLoading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-16 bg-muted rounded-xl" />
        <div className="h-12 bg-muted rounded-xl" />
        <div className="h-32 bg-muted rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-muted rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-muted rounded-xl" />)}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Demo Tip */}
      <DemoTip {...DEMO_TIPS.employeeBenefits} variant="highlight" />
      
      {/* 1. Personalized Greeting + Profile Completeness */}
      <ProfileCompleteness
        firstName={profileData.firstName}
        completenessPercent={profileData.profileCompleteness}
        missingFields={profileData.missingFields}
        isRTL={isRTL}
      />

      {/* 2. Quick Actions Strip */}
      <QuickActionsStrip
        pendingCount={pendingCount}
        urgentCount={urgentCount}
        nextPayDate={payroll.nextPayDate}
        isRTL={isRTL}
      />

      {/* 3. Compensation Summary */}
      {showCompensation && (
        <section>
          <div className={cn("flex items-center justify-between mb-4", isRTL && "flex-row-reverse")}>
            <h2 className="text-base font-semibold tracking-tight">
              {isRTL ? 'ملخص التعويضات' : 'Compensation Summary'}
            </h2>
          </div>
          <CompensationGrid
            metrics={compensationMetrics}
            totalCompensation={totalCompensation}
            isRTL={isRTL}
          />
        </section>
      )}

      {/* 4. Your Benefits Grid - Max 6 items */}
      {showYourBenefits && (
        <section>
          <div className={cn("flex items-center justify-between mb-4", isRTL && "flex-row-reverse")}>
            <h2 className="text-base font-semibold tracking-tight">
              {isRTL ? 'مزاياك' : 'Your Benefits'}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-accent hover:text-accent/80 gap-1 text-sm"
              onClick={() => navigate('/employee/benefits')}
            >
              {isRTL ? 'عرض الكل' : 'See All'}
              <ChevronRight className={cn("w-4 h-4", isRTL && "rotate-180")} />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.slice(0, 6).map((benefit, index) => (
              <BenefitCard
                key={benefit.name}
                name={benefit.name}
                icon={benefit.icon}
                value={benefit.value}
                utilized={benefit.utilized}
                description={benefit.description}
                route={benefit.route}
                onClick={() => navigate(benefit.route)}
                index={index}
                isRTL={isRTL}
              />
            ))}
          </div>
        </section>
      )}

      {/* 5. Satisfaction Survey (at bottom) */}
      {showSatisfactionSurvey && (
        <SatisfactionSurvey compact={true} />
      )}
    </div>
  );
}
