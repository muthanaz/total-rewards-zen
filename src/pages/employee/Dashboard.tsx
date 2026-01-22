import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, GraduationCap, 
  Heart, Car, Dumbbell, BookOpen, Gift,
  LucideIcon,
} from 'lucide-react';
import { SatisfactionSurvey } from '@/components/employee/SatisfactionSurvey';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUIVisibility } from '@/contexts/UIVisibilityContext';
import { cn } from '@/lib/utils';
import { useEmployeeDashboard } from '@/hooks/useEmployeeDashboard';
import { DemoTip, DEMO_TIPS } from '@/components/demo';

// New components
import { EntitlementKPIRow } from '@/components/employee/EntitlementKPIRow';
import { NextActionsModule, generateNextActions } from '@/components/employee/NextActionsModule';
import { BenefitEntitlementCard } from '@/components/employee/BenefitEntitlementCard';
import { ProfileDataBanner } from '@/components/employee/ProfileDataBanner';
import { ProfileCompleteness } from '@/components/employee/ProfileCompleteness';
import { DataProvenance } from '@/lib/dataProvenance';

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

// Demo leave data
const demoLeaveBalances = [
  { leaveType: 'Annual Leave', totalDays: 30, usedDays: 8, remainingDays: 22, year: 2024 },
  { leaveType: 'Sick Leave', totalDays: 15, usedDays: 2, remainingDays: 13, year: 2024 },
];

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { t, language, direction } = useLanguage();
  const { isElementVisible } = useUIVisibility();
  const isRTL = direction === 'rtl';
  
  // Fetch real data
  const { data: dashboardData, isLoading } = useEmployeeDashboard();
  
  // Check visibility for each section
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

  const pendingRequests = dashboardData?.pendingRequests || [];
  const pendingCount = pendingRequests.length;
  const pendingAmount = pendingRequests.reduce((sum, r) => sum + (r.amount || 0), 0);

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
  
  // Calculate entitlement totals
  const entitlementTotals = useMemo(() => {
    const totalEligible = benefits.reduce((sum, b) => sum + b.value, 0);
    const totalUsed = benefits.reduce((sum, b) => sum + b.utilized, 0);
    const totalRemaining = totalEligible - totalUsed;
    
    return {
      totalEligible,
      totalUsed,
      totalRemaining,
    };
  }, [benefits]);

  // Generate next actions
  const nextActions = useMemo(() => {
    return generateNextActions({
      pendingRequests: pendingRequests.map(r => ({
        id: r.id,
        subject: r.subject || 'Request',
        category: r.category || 'General',
        hasMissingDocs: false, // Will be enhanced when request detail is fetched
        missingDocsCount: 0,
        status: r.status || 'pending',
        amount: r.amount,
      })),
      benefits: benefits.map(b => ({
        name: b.name,
        value: b.value,
        utilized: b.utilized,
        route: b.route,
        category: b.category,
      })),
      profileCompleteness: profileData.profileCompleteness,
      missingFields: profileData.missingFields,
    });
  }, [pendingRequests, benefits, profileData]);

  // Data provenance for the entitlement summary
  const entitlementProvenance: DataProvenance = {
    source_type: 'system',
    source_label: 'Benefits System',
    last_updated_at: dashboardData?.lastUpdated || new Date().toISOString(),
    confidence_level: profileData.profileCompleteness >= 80 ? 'high' : 'medium',
    assumptions: profileData.profileCompleteness < 80 
      ? ['Some values may be estimated due to incomplete profile data']
      : undefined,
  };

  if (isLoading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-16 bg-muted rounded-xl" />
        <div className="h-12 bg-muted rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-muted rounded-xl" />)}
        </div>
        <div className="h-48 bg-muted rounded-xl" />
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
      
      {/* 1. Personalized Greeting */}
      <ProfileCompleteness
        firstName={profileData.firstName}
        completenessPercent={profileData.profileCompleteness}
        missingFields={profileData.missingFields}
        isRTL={isRTL}
      />

      {/* 2. Profile Data Banner (if incomplete) */}
      <ProfileDataBanner
        missingFields={profileData.missingFields}
        completenessPercent={profileData.profileCompleteness}
        isRTL={isRTL}
        dismissible
      />

      {/* 3. Entitlement KPI Row - TOP PRIORITY */}
      <EntitlementKPIRow
        totalEligible={entitlementTotals.totalEligible}
        usedYTD={entitlementTotals.totalUsed}
        remaining={entitlementTotals.totalRemaining}
        pendingCount={pendingCount}
        pendingAmount={pendingAmount}
        provenance={entitlementProvenance}
        isRTL={isRTL}
      />

      {/* 4. Next Actions Module - ALWAYS VISIBLE */}
      <NextActionsModule
        actions={nextActions}
        isRTL={isRTL}
      />

      {/* 5. Benefits Grid */}
      {showYourBenefits && (
        <section>
          <div className={cn("flex items-center justify-between mb-5", isRTL && "flex-row-reverse")}>
            <h2 className="text-lg font-display font-semibold tracking-tight">
              {isRTL ? 'مزاياك' : 'Your Benefits'}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.map((benefit, index) => (
              <BenefitEntitlementCard
                key={benefit.name}
                name={t(benefit.nameKey)}
                icon={benefit.icon}
                eligible={benefit.value}
                used={benefit.utilized}
                remaining={benefit.value - benefit.utilized}
                route={benefit.route}
                description={benefit.description}
                canSubmitClaim={benefit.claimable}
                isRTL={isRTL}
                index={index}
              />
            ))}
          </div>
        </section>
      )}

      {/* 6. Satisfaction Survey (secondary, at bottom) */}
      {showSatisfactionSurvey && (
        <SatisfactionSurvey compact={true} />
      )}
    </div>
  );
}
