import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, GraduationCap, Heart, Car, Dumbbell, BookOpen, Gift,
  LucideIcon,
} from 'lucide-react';
import { SatisfactionSurvey } from '@/components/employee/SatisfactionSurvey';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUIVisibility } from '@/contexts/UIVisibilityContext';
import { cn } from '@/lib/utils';
import { useEmployeeDashboard } from '@/hooks/useEmployeeDashboard';
import { DemoTip, DEMO_TIPS } from '@/components/demo';

// Original older dashboard components
import { ProfileCompleteness } from '@/components/employee/ProfileCompleteness';
import { TodayStrip } from '@/components/employee/TodayStrip';
import { BenefitsSummaryCard } from '@/components/employee/BenefitsSummaryCard';
import { BenefitCard } from '@/components/employee/BenefitCard';
import { RecentActivityFeed } from '@/components/employee/RecentActivityFeed';

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

  if (isLoading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-16 bg-muted rounded-xl" />
        <div className="h-12 bg-muted rounded-xl" />
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
      
      {/* 1. Personalized Greeting + Profile Completeness */}
      <ProfileCompleteness
        firstName={profileData.firstName}
        completenessPercent={profileData.profileCompleteness}
        missingFields={profileData.missingFields}
        isRTL={isRTL}
      />

      {/* 2. Quick Actions Strip */}
      <TodayStrip />

      {/* 3. Benefits Summary Card with Next Actions */}
      <BenefitsSummaryCard variant="full" />

      {/* 4. Two-column layout: Benefits Grid + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Benefits Grid - 2 columns on large screens */}
        {showYourBenefits && (
          <section className="lg:col-span-2">
            <div className={cn("flex items-center justify-between mb-5", isRTL && "flex-row-reverse")}>
              <h2 className="text-lg font-display font-semibold tracking-tight">
                {isRTL ? 'مزاياك' : 'Your Benefits'}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* Recent Activity Feed - sidebar */}
        <aside className="lg:col-span-1">
          <RecentActivityFeed />
        </aside>
      </div>

      {/* 5. Satisfaction Survey (secondary, at bottom) */}
      {showSatisfactionSurvey && (
        <SatisfactionSurvey compact={true} />
      )}
    </div>
  );
}
