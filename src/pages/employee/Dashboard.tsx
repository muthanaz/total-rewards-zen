import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, GraduationCap, Heart, Car, Dumbbell, BookOpen, Gift,
  Wallet, Calendar, DollarSign, Briefcase, LucideIcon,
} from 'lucide-react';
import { SatisfactionSurvey } from '@/components/employee/SatisfactionSurvey';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUIVisibility } from '@/contexts/UIVisibilityContext';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { useEmployeeDashboard } from '@/hooks/useEmployeeDashboard';
import { DemoTip, DEMO_TIPS } from '@/components/demo';

// Original dashboard components
import { ProfileCompleteness } from '@/components/employee/ProfileCompleteness';
import { TodayStrip } from '@/components/employee/TodayStrip';
import { BenefitCard } from '@/components/employee/BenefitCard';
import { CompensationGrid } from '@/components/ui/compensation-summary-card';
import { SmartInsights } from '@/components/dashboard/SmartInsights';

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
  const showSmartInsights = isElementVisible('employee', 'dashboard', 'smart_insights');
  const showSatisfactionSurvey = isElementVisible('employee', 'dashboard', 'satisfaction_survey');

  // Use real data or fallback to demo
  const profileData = dashboardData?.profile || {
    firstName: 'User',
    lastName: '',
    monthlySalary: 35000,
    profileCompleteness: 70,
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
    const totalBenefitsValue = totals.totalBenefitsValue;
    
    return [
      {
        icon: DollarSign,
        value: formatCurrencyAED(annualSalary),
        label: isRTL ? 'الراتب السنوي' : 'Annual Salary',
        formula: isRTL ? 'الراتب الشهري × 12' : 'Monthly Salary × 12',
        dataSource: 'HR System',
        variant: 'primary' as const,
        isSensitive: true,
      },
      {
        icon: Wallet,
        value: formatCurrencyAED(monthlyBase),
        label: isRTL ? 'الراتب الشهري' : 'Monthly Base',
        formula: isRTL ? 'الراتب الأساسي + البدلات' : 'Base Salary + Allowances',
        dataSource: 'Payroll',
        variant: 'default' as const,
        isSensitive: true,
      },
      {
        icon: Briefcase,
        value: formatCurrencyAED(guaranteedBenefits),
        label: isRTL ? 'البدلات النقدية' : 'Cash Allowances',
        formula: isRTL ? 'السكن + التعليم + النقل' : 'Housing + Education + Transport',
        dataSource: 'Benefits System',
        variant: 'success' as const,
        isSensitive: false,
      },
      {
        icon: Gift,
        value: formatCurrencyAED(totalBenefitsValue),
        label: isRTL ? 'إجمالي المزايا' : 'Total Benefits',
        formula: isRTL ? 'جميع المزايا المتاحة' : 'All Available Benefits',
        dataSource: 'Benefits System',
        variant: 'benefits' as const,
        isSensitive: false,
        subtitle: `${totals.utilizationPercent}% ${isRTL ? 'مستخدم' : 'utilized'}`,
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
        ? `مع المزايا المتغيرة: ${formatCurrencyAED(total + (totals.totalBenefitsValue - totals.guaranteedBenefits))}`
        : `With variable benefits: ${formatCurrencyAED(total + (totals.totalBenefitsValue - totals.guaranteedBenefits))}`,
      salaryHidden,
      onTogglePrivacy: () => setSalaryHidden(!salaryHidden),
      salaryPercent,
      benefitsPercent,
    };
  }, [totals, salaryHidden, isRTL]);

  // Transform benefits for SmartInsights
  const insightsBenefits = useMemo(() => {
    return benefits.map(b => ({
      name: b.name,
      value: b.value,
      utilized: b.utilized,
      route: b.route,
      valueType: b.valueType,
    }));
  }, [benefits]);

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
      <TodayStrip />

      {/* 3. Compensation Grid - Total Compensation + 4 Metrics */}
      {showCompensation && (
        <CompensationGrid
          metrics={compensationMetrics}
          totalCompensation={totalCompensation}
          isRTL={isRTL}
        />
      )}

      {/* 4. Benefits Grid */}
      {showYourBenefits && (
        <section>
          <div className={cn("flex items-center justify-between mb-5", isRTL && "flex-row-reverse")}>
            <h2 className="text-lg font-display font-semibold tracking-tight">
              {isRTL ? 'مزاياك' : 'Your Benefits'}
            </h2>
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

      {/* 5. Smart Insights */}
      {showSmartInsights && (
        <SmartInsights benefits={insightsBenefits} />
      )}

      {/* 6. Satisfaction Survey (secondary, at bottom) */}
      {showSatisfactionSurvey && (
        <SatisfactionSurvey compact={true} />
      )}
    </div>
  );
}
