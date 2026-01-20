import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Home, GraduationCap, Heart, Car, Dumbbell, BookOpen, Wallet, ChevronRight,
  TrendingUp, Gift, Clock, Lightbulb, FileText
} from 'lucide-react';
import { cn, formatCurrencyAED, formatPercent } from '@/lib/utils';
import { PageHeader } from '@/components/shared/PageHeader';
import { BenefitCategoryTile } from '@/components/employee/BenefitCategoryTile';
import { useEmployeeDashboard } from '@/hooks/useEmployeeDashboard';
import { useLanguage } from '@/contexts/LanguageContext';

// Demo benefits with recommendations
const demoBenefits = [
  { 
    name: 'Housing Allowance', 
    icon: Home, 
    value: 120000, 
    utilized: 120000, 
    route: '/employee/housing', 
    lastClaim: 'Jan 1, 2026',
    recommendation: 'Fully utilized. Review housing options for next year.'
  },
  { 
    name: 'Schooling Allowance', 
    icon: GraduationCap, 
    value: 60000, 
    utilized: 42000, 
    route: '/employee/schooling',
    lastClaim: 'Sep 15, 2025',
    recommendation: 'Submit term 2 receipts before Feb 28 deadline.'
  },
  { 
    name: 'Health Insurance', 
    icon: Heart, 
    value: 45000, 
    utilized: 12500, 
    route: '/employee/health',
    lastClaim: 'Dec 10, 2025',
    recommendation: 'Explore in-network dental providers for better coverage.'
  },
  { 
    name: 'Transport & Mobility', 
    icon: Car, 
    value: 39000, 
    utilized: 33000, 
    route: '/employee/transport',
    lastClaim: 'Jan 5, 2026',
    recommendation: 'Flight ticket allowance available for annual travel.'
  },
  { 
    name: 'Wellbeing Program', 
    icon: Dumbbell, 
    value: 6000, 
    utilized: 3200, 
    route: '/employee/wellbeing',
    lastClaim: 'Nov 20, 2025',
    recommendation: 'Renew gym membership to use remaining AED 2,800.'
  },
  { 
    name: 'Learning & Development', 
    icon: BookOpen, 
    value: 12000, 
    utilized: 4500, 
    route: '/employee/learning',
    lastClaim: 'Oct 8, 2025',
    recommendation: 'AED 7,500 available for certifications. Browse approved courses.'
  },
  { 
    name: 'Long-Term Financials', 
    icon: Wallet, 
    value: 0, 
    utilized: 0, 
    route: '/employee/long-term-financials',
    lastClaim: null,
    recommendation: 'Review gratuity projection and savings calculator.'
  },
];

export default function BenefitsPage() {
  const navigate = useNavigate();
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const { data: dashboardData } = useEmployeeDashboard();

  // Use real data or demo
  const benefits = useMemo(() => {
    if (dashboardData?.benefits && dashboardData.benefits.length > 0) {
      return dashboardData.benefits.map((b: any) => ({
        name: b.name,
        icon: {
          'Housing Allowance': Home,
          'Schooling Allowance': GraduationCap,
          'Health Insurance': Heart,
          'Transport & Mobility': Car,
          'Wellbeing Program': Dumbbell,
          'Learning & Development': BookOpen,
        }[b.name] || Gift,
        value: b.annualAllowance,
        utilized: b.utilizedAmount,
        route: `/employee/${b.name.toLowerCase().replace(/\s+/g, '-')}`,
        lastClaim: null,
        recommendation: getRecommendation(b.name, b.annualAllowance, b.utilizedAmount),
      }));
    }
    return demoBenefits;
  }, [dashboardData?.benefits]);

  const totalValue = benefits.reduce((sum: number, b: any) => sum + (b.value || 0), 0);
  const totalUtilized = benefits.reduce((sum: number, b: any) => sum + (b.utilized || 0), 0);
  const totalRemaining = totalValue - totalUtilized;
  const overallUtilization = totalValue > 0 ? Math.round((totalUtilized / totalValue) * 100) : 0;

  // Summary stats
  const fullyUtilized = benefits.filter((b: any) => b.value > 0 && (b.utilized / b.value) >= 0.8).length;
  const underUtilized = benefits.filter((b: any) => b.value > 0 && (b.utilized / b.value) < 0.3).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <PageHeader
        title="Benefits Overview"
        description={`${benefits.length} benefit categories • ${formatCurrencyAED(totalValue)} total value`}
        icon={Gift}
        iconClassName="from-accent to-accent/80 shadow-accent/25"
        badge={{
          label: `${formatPercent(overallUtilization, 0)} utilized`,
          icon: TrendingUp,
          variant: overallUtilization >= 70 ? 'success' : overallUtilization >= 40 ? 'default' : 'warning',
        }}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-500/20">
          <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <span className="text-lg font-bold text-emerald-600">{fullyUtilized}</span>
            </div>
            <div className={isRTL ? 'text-right' : ''}>
              <p className="font-semibold text-emerald-700 dark:text-emerald-400">On Track</p>
              <p className="text-xs text-muted-foreground">Benefits at 80%+ utilized</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20">
          <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <span className="text-lg font-bold text-amber-600">{underUtilized}</span>
            </div>
            <div className={isRTL ? 'text-right' : ''}>
              <p className="font-semibold text-amber-700 dark:text-amber-400">Under-utilized</p>
              <p className="text-xs text-muted-foreground">Benefits below 30% used</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
          <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <span className="text-sm font-bold text-accent">{formatCurrencyAED(totalRemaining, { abbreviate: true, showCurrency: false })}</span>
            </div>
            <div className={isRTL ? 'text-right' : ''}>
              <p className="font-semibold text-accent">Available</p>
              <p className="text-xs text-muted-foreground">Remaining to claim</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Insight: Under-utilized benefits */}
      {underUtilized > 0 && (
        <Card className="p-4 border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-transparent">
          <div className={cn('flex items-start gap-3', isRTL && 'flex-row-reverse')}>
            <div className="p-2 rounded-lg bg-amber-500/10 shrink-0">
              <Lightbulb className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">You have {formatCurrencyAED(totalRemaining)} in unused benefits</p>
              <p className="text-xs text-muted-foreground mt-1">
                Review the under-utilized categories below and check if you're eligible to claim. 
                Some benefits may expire at year-end.
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => navigate('/employee/benefits-analysis')}>
              View Analysis
              <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </Card>
      )}

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {benefits.map((benefit: any, index: number) => (
          <BenefitCategoryTile
            key={benefit.name}
            name={benefit.name}
            icon={benefit.icon}
            route={benefit.route}
            entitlement={benefit.value}
            utilized={benefit.utilized}
            lastClaimDate={benefit.lastClaim}
            recommendation={benefit.recommendation}
          />
        ))}
      </div>
    </div>
  );
}

// Helper to generate contextual recommendations
function getRecommendation(name: string, value: number, utilized: number): string {
  const rate = value > 0 ? (utilized / value) * 100 : 0;
  const remaining = value - utilized;

  if (rate >= 100) return 'Fully utilized for this year.';
  if (rate >= 80) return 'Almost fully utilized. Check remaining balance.';
  if (rate >= 50) return `AED ${remaining.toLocaleString()} still available to claim.`;
  if (rate >= 20) return 'Consider reviewing eligible expenses you may have missed.';
  return 'Explore what this benefit covers and how to claim.';
}
