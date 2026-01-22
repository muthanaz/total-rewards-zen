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

// Dashboard components matching the reference design
import { ProfileCompleteness } from '@/components/employee/ProfileCompleteness';
import { QuickActionsStrip } from '@/components/employee/QuickActionsStrip';
import { CompensationGrid } from '@/components/ui/compensation-summary-card';
import { BenefitCard } from '@/components/employee/BenefitCard';

// Benefit value types
type BenefitValueType = 'guaranteed' | 'employer_cost' | 'performance' | 'budget';

// Icon mapping for benefits
const benefitIcons: Record<string, LucideIcon> = {
  'Housing Allowance': Home,
  'Schooling Allowance': GraduationCap,
  'Health Insurance': Heart,
  'Transport & Mobility': Car,
  'Wellbeing Program': Dumbbell,
  'Learning & Development': BookOpen,
};

// Demo benefits data (used as fallback)
const demoBenefits = [
  { name: 'Housing Allowance', nameKey: 'benefit.housing', icon: Home, value: 120000, utilized: 120000, type: 'cash_allowances', valueType: 'guaranteed' as BenefitValueType, area: 'home_living', route: '/employee/housing', category: 'housing', claimable: true, description: 'Monthly housing allowance paid with salary' },
  { name: 'Schooling Allowance', nameKey: 'benefit.education', icon: GraduationCap, value: 60000, utilized: 42000, type: 'cash_allowances', valueType: 'guaranteed' as BenefitValueType, area: 'family_parenting', route: '/employee/schooling', category: 'education', claimable: true, description: 'School fee coverage for dependents' },
  { name: 'Health Insurance', nameKey: 'benefit.health', icon: Heart, value: 45000, utilized: 12500, type: 'health_protection', valueType: 'employer_cost' as BenefitValueType, area: 'health', route: '/employee/health', category: 'health', claimable: true, description: 'Comprehensive health coverage for family' },
  { name: 'Transport & Mobility', nameKey: 'benefit.transport', icon: Car, value: 39000, utilized: 33000, type: 'cash_allowances', valueType: 'guaranteed' as BenefitValueType, area: 'mobility', route: '/employee/transport', category: 'transport', claimable: true, description: 'Monthly transport and flight tickets' },
  { name: 'Wellbeing Program', nameKey: 'benefit.wellbeing', icon: Dumbbell, value: 6000, utilized: 3200, type: 'wellbeing', valueType: 'budget' as BenefitValueType, area: 'health', route: '/employee/wellbeing', category: 'wellbeing', claimable: true, description: 'Gym membership and wellness apps' },
  { name: 'Learning & Development', nameKey: 'benefit.learning', icon: BookOpen, value: 12000, utilized: 4500, type: 'growth_career', valueType: 'budget' as BenefitValueType, area: 'career', route: '/employee/learning', category: 'learning', claimable: true, description: 'Professional courses and certifications' },
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

  // Use real data or fallback to demo
  const profileData = dashboardData?.profile || {
    firstName: 'Demo',
    lastName: '',
    monthlySalary: 35000,
    profileCompleteness: 22,
    missingFields: ['Phone Number', 'Emirates ID'],
  };

  const totals = dashboardData?.totals || {
    annualSalary: 420000,
    guaranteedBenefits: 219000,
    totalBenefitsValue: 282000,
    totalUtilized: 215200,
    utilizationPercent: 76,
    totalCompensation: 639000,
  };

  const payroll = dashboardData?.payroll || {
    nextPayDate: new Date(new Date().getFullYear(), new Date().getMonth(), 28).toISOString(),
    currency: 'AED',
  };

  const pendingRequests = dashboardData?.pendingRequests || [];
  const pendingCount = pendingRequests.length;
  const urgentCount = pendingRequests.filter(r => r.isUrgent).length;

  // Map real benefits to display format or use demo
  const benefits = useMemo(() => {
    if (dashboardData?.benefits && dashboardData.benefits.length > 0) {
      return dashboardData.benefits.map(b => {
        const IconComponent = benefitIcons[b.name] ?? Gift;
        return {
          name: b.name,
          nameKey: `benefit.${b.name.toLowerCase().replace(/\s+/g, '')}`,
          icon: IconComponent,
          value: b.annualAllowance,
          utilized: b.utilizedAmount,
          type: b.benefitType,
          valueType: b.benefitType === 'cash_allowances' ? 'guaranteed' as BenefitValueType : 'budget' as BenefitValueType,
          area: b.lifeArea,
          route: `/employee/${b.name.toLowerCase().replace(/\s+/g, '-')}`,
          category: b.name.toLowerCase(),
          claimable: true,
          description: b.description || '',
        };
      });
    }
    return demoBenefits;
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
        value: formatCurrencyAED(monthlyBase),
        label: isRTL ? 'الراتب الشهري' : 'MONTHLY SALARY',
        formula: isRTL ? 'الراتب الأساسي الشهري' : 'Monthly base salary',
        dataSource: 'Payroll',
        variant: 'default' as const,
        isSensitive: true,
      },
      {
        icon: DollarSign,
        value: formatCurrencyAED(annualSalary),
        label: isRTL ? 'الراتب السنوي' : 'ANNUAL SALARY',
        formula: isRTL ? 'الراتب الشهري × 12' : 'Monthly Salary × 12',
        dataSource: 'HR System',
        variant: 'default' as const,
        isSensitive: true,
      },
      {
        icon: Gift,
        value: formatCurrencyAED(guaranteedBenefits),
        label: isRTL ? 'المزايا المضمونة' : 'GUARANTEED BENEFITS',
        formula: isRTL ? 'السكن + التعليم + النقل' : 'Housing + Education + Transport',
        dataSource: 'Benefits System',
        variant: 'warning' as const,
        isSensitive: false,
        subtitle: `Up to ${formatCurrencyAED(totals.totalBenefitsValue)} incl. variable`,
      },
      {
        icon: Briefcase,
        value: `${benefitsPercent}%`,
        label: isRTL ? 'نسبة المزايا' : 'BENEFITS % OF PACKAGE',
        formula: isRTL ? 'المزايا ÷ إجمالي التعويضات' : 'Benefits ÷ Total Compensation',
        dataSource: 'Benefits System',
        variant: 'default' as const,
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
    
    return {
      value: formatCurrencyAED(total),
      formula: isRTL ? 'الراتب السنوي + المزايا المضمونة' : 'Annual Salary + Guaranteed Benefits',
      dataSource: 'HR & Benefits Systems',
      subtitle: isRTL 
        ? `المحتمل: ${formatCurrencyAED(total + (totals.totalBenefitsValue - totals.guaranteedBenefits))} شامل المتغير`
        : `Potential: ${formatCurrencyAED(total + (totals.totalBenefitsValue - totals.guaranteedBenefits))} incl. variable`,
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

      {/* 4. Your Benefits Grid */}
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
            {benefits.map((benefit, index) => (
              <BenefitCard
                key={benefit.name}
                name={t(benefit.nameKey)}
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
