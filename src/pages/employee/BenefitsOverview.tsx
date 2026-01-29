/**
 * Benefits Overview Page
 * 
 * The cleanest page in the employee portal.
 * Three sections only:
 * - Section A: Benefit grid (cards) with Annual/Used/Remaining + single CTA
 * - Section B: "My next action" panel - single highest-priority task
 * - Section C: Recent activity (last 3 claims)
 * 
 * No charts. No generic insights. No duplicate summaries.
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, GraduationCap, Heart, Car, Dumbbell, BookOpen, Wallet, Gift,
  LucideIcon,
} from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { PageHeader } from '@/components/shared/PageHeader';
import { BenefitGridCard, BenefitTransactionModel } from '@/components/employee/benefits/BenefitGridCard';
import { NextActionPanel, getHighestPriorityAction } from '@/components/employee/benefits/NextActionPanel';
import { RecentClaimsPanel, RecentClaimItem } from '@/components/employee/benefits/RecentClaimsPanel';
import { useEmployeeDashboard } from '@/hooks/useEmployeeDashboard';
import { useLanguage } from '@/contexts/LanguageContext';

// ============================================================================
// BENEFIT CONFIGURATION
// ============================================================================

interface BenefitConfig {
  displayName: string;
  displayNameAr: string;
  icon: LucideIcon;
  route: string;
  transactionModel: BenefitTransactionModel;
}

const BENEFIT_CONFIG: Record<string, BenefitConfig> = {
  'Housing': { 
    displayName: 'Housing', 
    displayNameAr: 'السكن',
    icon: Home, 
    route: '/employee/housing',
    transactionModel: 'claim_only',
  },
  'Housing Allowance': { 
    displayName: 'Housing', 
    displayNameAr: 'السكن',
    icon: Home, 
    route: '/employee/housing',
    transactionModel: 'claim_only',
  },
  'Schooling': { 
    displayName: 'Schooling', 
    displayNameAr: 'التعليم',
    icon: GraduationCap, 
    route: '/employee/schooling',
    transactionModel: 'claim_only',
  },
  'Schooling Allowance': { 
    displayName: 'Schooling', 
    displayNameAr: 'التعليم',
    icon: GraduationCap, 
    route: '/employee/schooling',
    transactionModel: 'claim_only',
  },
  'Health Insurance': { 
    displayName: 'Health Insurance', 
    displayNameAr: 'التأمين الصحي',
    icon: Heart, 
    route: '/employee/health',
    transactionModel: 'claim_only',
  },
  'Health': { 
    displayName: 'Health Insurance', 
    displayNameAr: 'التأمين الصحي',
    icon: Heart, 
    route: '/employee/health',
    transactionModel: 'claim_only',
  },
  'Transport': { 
    displayName: 'Transport', 
    displayNameAr: 'النقل',
    icon: Car, 
    route: '/employee/transport',
    transactionModel: 'claim_only',
  },
  'Transport & Mobility': { 
    displayName: 'Transport', 
    displayNameAr: 'النقل',
    icon: Car, 
    route: '/employee/transport',
    transactionModel: 'claim_only',
  },
  'Wellbeing': { 
    displayName: 'Wellbeing', 
    displayNameAr: 'الرفاهية',
    icon: Dumbbell, 
    route: '/employee/wellbeing',
    transactionModel: 'request_and_claim',
  },
  'Wellbeing Program': { 
    displayName: 'Wellbeing', 
    displayNameAr: 'الرفاهية',
    icon: Dumbbell, 
    route: '/employee/wellbeing',
    transactionModel: 'request_and_claim',
  },
  'Learning & Development': { 
    displayName: 'Learning & Development', 
    displayNameAr: 'التعلم والتطوير',
    icon: BookOpen, 
    route: '/employee/learning',
    transactionModel: 'request_and_claim',
  },
  'Learning': { 
    displayName: 'Learning & Development', 
    displayNameAr: 'التعلم والتطوير',
    icon: BookOpen, 
    route: '/employee/learning',
    transactionModel: 'request_and_claim',
  },
  'Long-Term Financials': { 
    displayName: 'Long-Term Financials', 
    displayNameAr: 'المالية طويلة الأجل',
    icon: Wallet, 
    route: '/employee/long-term-financials',
    transactionModel: 'informational', // Informational only - no claims
  },
};

const getBenefitConfig = (name: string): BenefitConfig => {
  return BENEFIT_CONFIG[name] || { 
    displayName: name, 
    displayNameAr: name,
    icon: Gift, 
    route: `/employee/${name.toLowerCase().replace(/\s+/g, '-')}`,
    transactionModel: 'claim_only' as BenefitTransactionModel,
  };
};

// ============================================================================
// DEMO DATA
// ============================================================================

const demoBenefits = [
  { name: 'Housing', value: 120000, utilized: 120000 },
  { name: 'Schooling', value: 60000, utilized: 42000 },
  { name: 'Health Insurance', value: 45000, utilized: 12500 },
  { name: 'Transport', value: 39000, utilized: 33000 },
  { name: 'Wellbeing', value: 6000, utilized: 3200 },
  { name: 'Learning & Development', value: 12000, utilized: 4500 },
  { name: 'Long-Term Financials', value: 0, utilized: 0 },
];

const demoRecentClaims: RecentClaimItem[] = [
  { 
    id: '1', 
    category: 'Transport', 
    amount: 420, 
    status: 'paid', 
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() 
  },
  { 
    id: '2', 
    category: 'Health Insurance', 
    amount: 850, 
    status: 'approved', 
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() 
  },
  { 
    id: '3', 
    category: 'Schooling', 
    amount: 15000, 
    status: 'in_review', 
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() 
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

export default function BenefitsOverviewPage() {
  const navigate = useNavigate();
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const { data: dashboardData, isLoading } = useEmployeeDashboard();

  // Map benefits data
  const benefits = useMemo(() => {
    if (dashboardData?.benefits && dashboardData.benefits.length > 0) {
      return dashboardData.benefits.map((b: any) => {
        const config = getBenefitConfig(b.name);
        return {
          name: config.displayName,
          nameAr: config.displayNameAr,
          icon: config.icon,
          value: b.annualAllowance || 0,
          utilized: b.utilizedAmount || 0,
          route: config.route,
          transactionModel: config.transactionModel,
        };
      });
    }
    return demoBenefits.map(b => {
      const config = getBenefitConfig(b.name);
      return {
        name: config.displayName,
        nameAr: config.displayNameAr,
        icon: config.icon,
        value: b.value,
        utilized: b.utilized,
        route: config.route,
        transactionModel: config.transactionModel,
      };
    });
  }, [dashboardData?.benefits]);

  // Map recent claims - use demo data since hook doesn't expose recentClaims
  const recentClaims = useMemo((): RecentClaimItem[] => {
    // Dashboard hook doesn't expose recent claims, use demo for now
    return demoRecentClaims;
  }, []);

  // Get pending requests for next action
  const pendingRequests = useMemo(() => {
    if (dashboardData?.pendingRequests) {
      return dashboardData.pendingRequests.map((r: any) => ({
        id: r.id,
        subject: r.subject || r.title || 'Request',
        category: r.category || r.benefit_name || 'Benefit',
        hasMissingDocs: r.hasMissingDocs || false,
        status: r.status,
      }));
    }
    return [];
  }, [dashboardData?.pendingRequests]);

  // Calculate next action
  const nextAction = useMemo(() => {
    return getHighestPriorityAction({
      pendingRequests,
      benefits: benefits.map(b => ({
        name: b.name,
        value: b.value,
        utilized: b.utilized,
        route: b.route,
      })),
    });
  }, [pendingRequests, benefits]);

  // Calculate totals for header
  const totalValue = benefits.reduce((sum, b) => sum + b.value, 0);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 bg-muted rounded-xl" />
        <div className="h-20 bg-muted rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-48 bg-muted rounded-xl" />)}
        </div>
        <div className="h-32 bg-muted rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header - Simple, clean */}
      <PageHeader
        title={isRTL ? 'نظرة عامة على المزايا' : 'Benefits Overview'}
        description={`${benefits.length} ${isRTL ? 'فئات' : 'categories'} • ${formatCurrencyAED(totalValue)} ${isRTL ? 'القيمة الإجمالية' : 'total value'}`}
        icon={Gift}
        iconClassName="from-accent to-accent/80 shadow-accent/25"
      />

      {/* Section B: My Next Action - Single highest priority task */}
      <section>
        <h2 className={cn(
          "text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3",
          isRTL && "text-right"
        )}>
          {isRTL ? 'الخطوة التالية' : 'My Next Action'}
        </h2>
        <NextActionPanel action={nextAction} isRTL={isRTL} />
      </section>

      {/* Section A: Benefits Grid */}
      <section>
        <h2 className={cn(
          "text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3",
          isRTL && "text-right"
        )}>
          {isRTL ? 'مزاياك' : 'Your Benefits'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {benefits.map((benefit, index) => (
            <BenefitGridCard
              key={benefit.name + index}
              name={benefit.name}
              nameAr={benefit.nameAr}
              icon={benefit.icon}
              annualValue={benefit.value}
              utilized={benefit.utilized}
              transactionModel={benefit.transactionModel}
              route={benefit.route}
              onClick={() => navigate(benefit.route)}
              isRTL={isRTL}
            />
          ))}
        </div>
      </section>

      {/* Section C: Recent Activity - Last 3 claims */}
      <section>
        <RecentClaimsPanel claims={recentClaims} isRTL={isRTL} />
      </section>
    </div>
  );
}

// Helper to map status strings
function mapClaimStatus(status: string): RecentClaimItem['status'] {
  const statusMap: Record<string, RecentClaimItem['status']> = {
    submitted: 'submitted',
    in_review: 'in_review',
    pending: 'submitted',
    info_requested: 'in_review',
    approved: 'approved',
    rejected: 'rejected',
    paid: 'paid',
    ready_for_payment: 'approved',
  };
  return statusMap[status] || 'submitted';
}
