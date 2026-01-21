import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle, Clock, ArrowRight, Wallet, CalendarClock, 
  TrendingUp, Lightbulb, ChevronRight,
  CheckCircle2, Heart, GraduationCap, Car, BookOpen, Dumbbell,
  FileText, UserCheck, Zap, Receipt, ShieldCheck,
  Home, Plane, Users
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { formatCurrencyAED } from '@/lib/utils';

// ============================================================================
// BENEFIT TYPE DEFINITIONS
// ============================================================================

type BenefitClaimType = 'automatic' | 'claim_based' | 'request_based';

interface BenefitItem {
  id: string;
  name: string;
  nameAr: string;
  icon: React.ElementType;
  route: string;
  claimType: BenefitClaimType;
  // Financial data
  entitlement: number;
  claimed: number;
  pending: number;
  exclusions: number; // Amount not claimable due to policy restrictions
  // Metadata
  frequency: 'annual' | 'monthly' | 'one-time';
  deadline?: string; // ISO date string
  requiresDocs: boolean;
  requiresApproval: boolean;
  tip?: string;
  tipAr?: string;
  ctaLabel?: string;
  ctaLabelAr?: string;
}

// ============================================================================
// BENEFIT DATA - Would come from useEmployeeDashboard hook in production
// ============================================================================

const allBenefits: BenefitItem[] = [
  // Automatic Allowances (paid with salary, no action needed)
  {
    id: 'housing',
    name: 'Housing Allowance',
    nameAr: 'بدل السكن',
    icon: Home,
    route: '/employee/housing',
    claimType: 'automatic',
    entitlement: 120000,
    claimed: 80000, // 8 months paid
    pending: 0,
    exclusions: 0,
    frequency: 'monthly',
    requiresDocs: false,
    requiresApproval: false,
    tip: 'Paid automatically with your monthly salary',
    tipAr: 'يُدفع تلقائياً مع راتبك الشهري',
  },
  {
    id: 'transport',
    name: 'Transport Allowance',
    nameAr: 'بدل النقل',
    icon: Car,
    route: '/employee/transport',
    claimType: 'automatic',
    entitlement: 24000,
    claimed: 16000, // 8 months paid
    pending: 0,
    exclusions: 0,
    frequency: 'monthly',
    requiresDocs: false,
    requiresApproval: false,
    tip: 'Paid automatically with your monthly salary',
    tipAr: 'يُدفع تلقائياً مع راتبك الشهري',
  },
  
  // Claim-Based Benefits (requires receipts/documentation)
  {
    id: 'schooling',
    name: 'Schooling Allowance',
    nameAr: 'بدل التعليم المدرسي',
    icon: GraduationCap,
    route: '/employee/schooling',
    claimType: 'claim_based',
    entitlement: 60000, // 2 children x 30000
    claimed: 35000,
    pending: 8000,
    exclusions: 0,
    frequency: 'annual',
    deadline: '2026-06-30',
    requiresDocs: true,
    requiresApproval: false,
    tip: 'Submit tuition receipts to claim remaining allowance',
    tipAr: 'قدم إيصالات الرسوم للمطالبة بالبدل المتبقي',
    ctaLabel: 'Submit Receipt',
    ctaLabelAr: 'تقديم إيصال',
  },
  {
    id: 'learning',
    name: 'Learning & Development',
    nameAr: 'التعلم والتطوير',
    icon: BookOpen,
    route: '/employee/learning',
    claimType: 'claim_based',
    entitlement: 12000,
    claimed: 4500,
    pending: 0,
    exclusions: 0,
    frequency: 'annual',
    deadline: '2026-12-31',
    requiresDocs: true,
    requiresApproval: false,
    tip: 'Enroll in a certification course',
    tipAr: 'سجل في دورة شهادة',
    ctaLabel: 'Browse Courses',
    ctaLabelAr: 'تصفح الدورات',
  },
  {
    id: 'wellbeing',
    name: 'Wellbeing Program',
    nameAr: 'برنامج الرفاهية',
    icon: Dumbbell,
    route: '/employee/wellbeing',
    claimType: 'claim_based',
    entitlement: 6000,
    claimed: 3200,
    pending: 0,
    exclusions: 0,
    frequency: 'annual',
    deadline: '2026-12-31',
    requiresDocs: true,
    requiresApproval: false,
    tip: 'Renew gym membership or wellness subscription',
    tipAr: 'جدد اشتراك النادي أو الرفاهية',
    ctaLabel: 'Claim Expense',
    ctaLabelAr: 'المطالبة بمصروف',
  },
  
  // Request/Approval-Based Benefits (needs HR approval)
  {
    id: 'annual-flight',
    name: 'Annual Flight Tickets',
    nameAr: 'تذاكر الطيران السنوية',
    icon: Plane,
    route: '/employee/requests',
    claimType: 'request_based',
    entitlement: 8000, // Family tickets
    claimed: 0,
    pending: 0,
    exclusions: 0,
    frequency: 'annual',
    deadline: '2026-12-31',
    requiresDocs: true,
    requiresApproval: true,
    tip: 'Book your annual home country trip',
    tipAr: 'احجز رحلتك السنوية إلى بلدك',
    ctaLabel: 'Request Tickets',
    ctaLabelAr: 'طلب تذاكر',
  },
  {
    id: 'relocation',
    name: 'Relocation Support',
    nameAr: 'دعم النقل',
    icon: Users,
    route: '/employee/requests',
    claimType: 'request_based',
    entitlement: 15000,
    claimed: 15000, // Already used
    pending: 0,
    exclusions: 0,
    frequency: 'one-time',
    requiresDocs: true,
    requiresApproval: true,
    tip: 'One-time benefit - already utilized',
    tipAr: 'ميزة لمرة واحدة - تم استخدامها',
  },
];

// Health coverage - show plan info, not amounts (since claims vary)
const healthCoverage = {
  plan: 'Premium Family Plan',
  coverage: ['Employee', 'Spouse', 'Children (2)'],
  network: 'Enhanced Network',
  features: [
    { name: 'Outpatient', limit: 'Unlimited', coinsurance: '0% at network' },
    { name: 'Inpatient', limit: 'Unlimited', coinsurance: '0% at network' },
    { name: 'Dental', limit: 'AED 5,000/year', coinsurance: '20% coinsurance', remaining: 3500 },
    { name: 'Optical', limit: 'AED 2,000/year', coinsurance: '20% coinsurance', remaining: 1500 },
    { name: 'Maternity', limit: 'AED 15,000', coinsurance: 'Subject to waiting period' },
  ],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function computeClaimable(benefit: BenefitItem): number {
  // remaining = entitlement - claimed - pending - exclusions
  return Math.max(0, benefit.entitlement - benefit.claimed - benefit.pending - benefit.exclusions);
}

function getDaysUntilDeadline(deadline?: string): number | null {
  if (!deadline) return null;
  const deadlineDate = new Date(deadline);
  const today = new Date();
  return Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

interface NextAction {
  id: string;
  benefit: BenefitItem;
  claimable: number;
  daysUntilDeadline: number | null;
  priority: number;
  actionLabel: string;
  actionLabelAr: string;
  reason: string;
  reasonAr: string;
}

function computeNextBestActions(benefits: BenefitItem[]): NextAction[] {
  const actions: NextAction[] = [];

  benefits.forEach((benefit) => {
    const claimable = computeClaimable(benefit);
    const daysUntilDeadline = getDaysUntilDeadline(benefit.deadline);

    // Only consider benefits with claimable amounts and that require action
    if (claimable > 0 && benefit.claimType !== 'automatic') {
      let priority = 0;

      // Higher priority for larger amounts
      priority += claimable / 1000;

      // Higher priority for approaching deadlines
      if (daysUntilDeadline !== null && daysUntilDeadline < 90) {
        priority += (90 - daysUntilDeadline) * 2;
      }

      // Higher priority for pending items (need follow-up)
      if (benefit.pending > 0) {
        priority += 50;
      }

      let reason = '';
      let reasonAr = '';

      if (daysUntilDeadline !== null && daysUntilDeadline < 60) {
        reason = `Deadline in ${daysUntilDeadline} days`;
        reasonAr = `الموعد النهائي خلال ${daysUntilDeadline} يوم`;
      } else if (claimable > 5000) {
        reason = 'High value remaining';
        reasonAr = 'قيمة عالية متبقية';
      } else {
        reason = 'Available to claim';
        reasonAr = 'متاح للمطالبة';
      }

      actions.push({
        id: benefit.id,
        benefit,
        claimable,
        daysUntilDeadline,
        priority,
        actionLabel: benefit.ctaLabel || 'Claim Now',
        actionLabelAr: benefit.ctaLabelAr || 'طالب الآن',
        reason,
        reasonAr,
      });
    }
  });

  // Sort by priority (highest first) and take top 3
  return actions.sort((a, b) => b.priority - a.priority).slice(0, 3);
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function BenefitsAnalysis() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const navigate = useNavigate();

  const calculatedMetrics = useMemo(() => {
    // Compute claimable amounts correctly
    const claimableBenefits = allBenefits
      .filter((b) => b.claimType !== 'automatic')
      .map((b) => ({
        ...b,
        claimable: computeClaimable(b),
      }));

    const totalClaimable = claimableBenefits.reduce((sum, b) => sum + b.claimable, 0);

    // Separate by claim type
    const automaticBenefits = allBenefits.filter((b) => b.claimType === 'automatic');
    const claimBasedBenefits = allBenefits.filter((b) => b.claimType === 'claim_based');
    const requestBasedBenefits = allBenefits.filter((b) => b.claimType === 'request_based');

    // Days until year end
    const yearEnd = new Date('2026-12-31');
    const today = new Date();
    const daysRemaining = Math.ceil((yearEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // Next best actions
    const nextActions = computeNextBestActions(allBenefits);

    return {
      totalClaimable,
      daysRemaining,
      automaticBenefits,
      claimBasedBenefits,
      requestBasedBenefits,
      nextActions,
    };
  }, []);

  const formatCurrency = (value: number) =>
    `${isRTL ? '' : 'AED '}${value.toLocaleString(isRTL ? 'ar-AE' : 'en-AE')}${isRTL ? ' درهم' : ''}`;

  // Component for rendering benefit cards
  const BenefitCard = ({ benefit, index }: { benefit: BenefitItem; index: number }) => {
    const claimable = computeClaimable(benefit);
    const utilizationPercent = benefit.entitlement > 0 
      ? Math.round(((benefit.claimed + benefit.pending) / benefit.entitlement) * 100) 
      : 0;
    const daysUntilDeadline = getDaysUntilDeadline(benefit.deadline);
    const isUrgent = daysUntilDeadline !== null && daysUntilDeadline < 60;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 + index * 0.05 }}
        className={cn(
          'p-4 rounded-xl border transition-all cursor-pointer group',
          isUrgent 
            ? 'border-amber-500/50 bg-amber-500/5 hover:border-amber-500' 
            : 'border-border/50 hover:border-accent/30',
          claimable === 0 && 'opacity-60'
        )}
        onClick={() => navigate(benefit.route)}
      >
        <div className={cn('flex items-start justify-between gap-4', isRTL && 'flex-row-reverse')}>
          <div className={cn('flex items-start gap-3', isRTL && 'flex-row-reverse')}>
            <div className={cn(
              'p-2 rounded-lg shrink-0',
              claimable > 0 ? 'bg-accent/10' : 'bg-muted'
            )}>
              <benefit.icon className={cn('w-5 h-5', claimable > 0 ? 'text-accent' : 'text-muted-foreground')} />
            </div>
            <div className={cn('space-y-1', isRTL && 'text-right')}>
              <h3 className="font-semibold">{isRTL ? benefit.nameAr : benefit.name}</h3>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>Entitlement: {formatCurrency(benefit.entitlement)}</span>
                <span>•</span>
                <span>Claimed: {formatCurrency(benefit.claimed)}</span>
                {benefit.pending > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-amber-600">Pending: {formatCurrency(benefit.pending)}</span>
                  </>
                )}
              </div>
              {claimable > 0 ? (
                <p className="text-sm font-medium text-accent">
                  {formatCurrency(claimable)} {isRTL ? 'متاح للمطالبة' : 'available to claim'}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {isRTL ? 'تم استخدامه بالكامل' : 'Fully utilized'}
                </p>
              )}
            </div>
          </div>
          <div className={cn('flex flex-col items-end gap-2', isRTL && 'items-start')}>
            {daysUntilDeadline !== null && claimable > 0 && (
              <Badge variant={isUrgent ? 'destructive' : 'secondary'} className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {daysUntilDeadline}d left
              </Badge>
            )}
            <ChevronRight className={cn(
              'w-5 h-5 text-muted-foreground group-hover:text-accent transition-all group-hover:translate-x-1 shrink-0',
              isRTL && 'rotate-180 group-hover:-translate-x-1'
            )} />
          </div>
        </div>
        <Progress value={utilizationPercent} className="h-1.5 mt-3" />
        <div className={cn('flex items-center justify-between mt-2', isRTL && 'flex-row-reverse')}>
          {benefit.tip && (
            <div className={cn('flex items-center gap-1.5 text-xs text-muted-foreground', isRTL && 'flex-row-reverse')}>
              <Lightbulb className="w-3 h-3 text-amber-500" />
              <span>{isRTL ? benefit.tipAr : benefit.tip}</span>
            </div>
          )}
          {claimable > 0 && benefit.ctaLabel && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs text-accent hover:text-accent"
              onClick={(e) => {
                e.stopPropagation();
                navigate(benefit.route);
              }}
            >
              {isRTL ? benefit.ctaLabelAr : benefit.ctaLabel}
              <ArrowRight className={cn('w-3 h-3 ml-1', isRTL && 'rotate-180 mr-1 ml-0')} />
            </Button>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className={cn('space-y-1', isRTL && 'text-right')}>
        <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
          {isRTL ? 'الرؤى والتحسين' : 'Insights & Optimization'}
        </h1>
        <p className="text-muted-foreground">
          {isRTL ? 'فهم مزاياك واتخذ إجراءً' : 'Understand your benefits and take action'}
        </p>
      </div>

      {/* Hero: Claimable Benefits Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="overflow-hidden border-accent/30 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent">
          <CardContent className="p-6">
            <div className={cn('flex flex-col md:flex-row md:items-center md:justify-between gap-4', isRTL && 'md:flex-row-reverse')}>
              <div className={cn('space-y-2', isRTL && 'text-right')}>
                <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                  <div className="p-2 rounded-full bg-accent/20">
                    <Wallet className="w-5 h-5 text-accent" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    {isRTL ? 'مزايا قابلة للمطالبة' : 'Claimable Benefits Available'}
                  </span>
                </div>
                <p className="text-4xl md:text-5xl font-bold text-foreground">
                  {formatCurrencyAED(calculatedMetrics.totalClaimable)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isRTL
                    ? 'قيمة الميزانية المتبقية = المستحق - المُطالب به - المعلق - الاستثناءات'
                    : 'Remaining budget value = Entitlement - Claimed - Pending - Exclusions'}
                </p>
              </div>

              <div className={cn('flex flex-col items-start md:items-end gap-3', isRTL && 'md:items-start')}>
                <div className={cn('flex items-center gap-2 px-3 py-2 rounded-full bg-amber-500/10 border border-amber-500/20', isRTL && 'flex-row-reverse')}>
                  <CalendarClock className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                    {isRTL
                      ? `${calculatedMetrics.daysRemaining} يوم متبقي هذا العام`
                      : `${calculatedMetrics.daysRemaining} days left this year`}
                  </span>
                </div>
                <Button 
                  size="sm" 
                  className="gap-2"
                  onClick={() => navigate('/employee/requests')}
                >
                  <Receipt className="w-4 h-4" />
                  {isRTL ? 'تقديم مطالبة' : 'Submit a Claim'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Next Best Actions Panel */}
      {calculatedMetrics.nextActions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
            <CardHeader className="pb-3">
              <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                <div className="p-1.5 rounded-lg bg-primary/15">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">
                    {isRTL ? 'أفضل الإجراءات التالية' : 'Next Best Actions'}
                  </CardTitle>
                  <CardDescription>
                    {isRTL ? 'أولويات بناءً على القيمة والمواعيد النهائية' : 'Prioritized by value and deadlines'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {calculatedMetrics.nextActions.map((action, index) => (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className={cn(
                      'p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md',
                      index === 0 
                        ? 'border-primary/50 bg-primary/5' 
                        : 'border-border/50 hover:border-primary/30'
                    )}
                    onClick={() => navigate(action.benefit.route)}
                  >
                    <div className={cn('flex items-start gap-3', isRTL && 'flex-row-reverse')}>
                      <div className={cn(
                        'p-2 rounded-lg shrink-0',
                        index === 0 ? 'bg-primary/15' : 'bg-muted'
                      )}>
                        <action.benefit.icon className={cn(
                          'w-5 h-5',
                          index === 0 ? 'text-primary' : 'text-muted-foreground'
                        )} />
                      </div>
                      <div className={cn('flex-1 min-w-0', isRTL && 'text-right')}>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            #{index + 1}
                          </Badge>
                          {action.daysUntilDeadline !== null && action.daysUntilDeadline < 60 && (
                            <Badge variant="destructive" className="text-xs">
                              {action.daysUntilDeadline}d
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-medium text-sm truncate">
                          {isRTL ? action.benefit.nameAr : action.benefit.name}
                        </h4>
                        <p className="text-lg font-bold text-accent mt-0.5">
                          {formatCurrencyAED(action.claimable)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {isRTL ? action.reasonAr : action.reason}
                        </p>
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 mt-2 text-xs text-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(action.benefit.route);
                          }}
                        >
                          {isRTL ? action.actionLabelAr : action.actionLabel}
                          <ChevronRight className={cn('w-3 h-3 ml-1', isRTL && 'rotate-180 mr-1 ml-0')} />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Claim-Based Benefits (requires receipts/docs) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
              <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                <div className="p-1.5 rounded-lg bg-accent/15">
                  <Receipt className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">
                    {isRTL ? 'مزايا قائمة على المطالبات' : 'Claim-Based Benefits'}
                  </CardTitle>
                  <CardDescription>
                    {isRTL ? 'تتطلب إيصالات أو مستندات للمطالبة' : 'Requires receipts or documentation to claim'}
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="gap-1">
                <FileText className="w-3 h-3" />
                {isRTL ? 'إيصالات مطلوبة' : 'Receipts Required'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {calculatedMetrics.claimBasedBenefits.map((benefit, index) => (
              <BenefitCard key={benefit.id} benefit={benefit} index={index} />
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Request/Approval-Based Benefits (needs HR approval) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
              <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                <div className="p-1.5 rounded-lg bg-blue-500/15">
                  <UserCheck className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">
                    {isRTL ? 'مزايا تتطلب موافقة' : 'Request-Based Benefits'}
                  </CardTitle>
                  <CardDescription>
                    {isRTL ? 'تتطلب موافقة من الموارد البشرية' : 'Requires HR approval before processing'}
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="gap-1 border-blue-500/30 text-blue-600">
                <ShieldCheck className="w-3 h-3" />
                {isRTL ? 'موافقة مطلوبة' : 'Approval Required'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {calculatedMetrics.requestBasedBenefits.map((benefit, index) => (
              <BenefitCard key={benefit.id} benefit={benefit} index={index} />
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Automatic Allowances */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card className="border-emerald-500/30 bg-gradient-to-r from-emerald-500/5 to-transparent">
          <CardHeader className="pb-3">
            <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
              <div className="p-1.5 rounded-lg bg-emerald-500/15">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-emerald-700 dark:text-emerald-400">
                  {isRTL ? 'بدلات تلقائية' : 'Automatic Allowances'}
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'تُدفع تلقائياً مع راتبك - لا حاجة لأي إجراء' : 'Paid automatically with salary - no action needed'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {calculatedMetrics.automaticBenefits.map((benefit, index) => (
                <motion.div
                  key={benefit.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25 + index * 0.05 }}
                  className={cn(
                    'flex items-center gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 cursor-pointer hover:bg-emerald-500/15 transition-colors',
                    isRTL && 'flex-row-reverse'
                  )}
                  onClick={() => navigate(benefit.route)}
                >
                  <div className="p-2 rounded-lg bg-emerald-500/15">
                    <benefit.icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className={cn('flex-1', isRTL && 'text-right')}>
                    <p className="font-medium text-sm">{isRTL ? benefit.nameAr : benefit.name}</p>
                    <p className="text-xs text-emerald-600">
                      {formatCurrencyAED(benefit.entitlement)}/year • Monthly with salary
                    </p>
                    <Progress 
                      value={Math.round((benefit.claimed / benefit.entitlement) * 100)} 
                      className="h-1 mt-2" 
                    />
                  </div>
                  <Badge variant="secondary" className="text-emerald-600 bg-emerald-500/10 shrink-0">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {Math.round((benefit.claimed / benefit.entitlement) * 100)}% paid
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Health Coverage Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        <Card
          className="cursor-pointer hover:border-accent/30 transition-all group"
          onClick={() => navigate('/employee/health')}
        >
          <CardHeader className="pb-3">
            <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
              <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                <div className="p-1.5 rounded-lg bg-rose-500/15">
                  <Heart className="w-4 h-4 text-rose-500" />
                </div>
                <CardTitle className="text-base font-semibold">
                  {isRTL ? 'تغطية التأمين الصحي' : 'Health Insurance Coverage'}
                </CardTitle>
              </div>
              <ChevronRight className={cn(
                'w-5 h-5 text-muted-foreground group-hover:text-accent transition-all group-hover:translate-x-1',
                isRTL && 'rotate-180 group-hover:-translate-x-1'
              )} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className={cn('flex items-center justify-between flex-wrap gap-2', isRTL && 'flex-row-reverse')}>
                <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                  <Badge variant="secondary">{healthCoverage.plan}</Badge>
                  <Badge variant="outline">{healthCoverage.network}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {isRTL ? 'يغطي:' : 'Covers:'} {healthCoverage.coverage.join(', ')}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                {healthCoverage.features.map((feature) => (
                  <div key={feature.name} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <p className="font-medium text-sm">{feature.name}</p>
                    <p className="text-xs text-accent font-medium">{feature.limit}</p>
                    <p className="text-xs text-muted-foreground">{feature.coinsurance}</p>
                    {feature.remaining !== undefined && (
                      <p className="text-xs text-emerald-600 mt-1 font-medium">
                        {formatCurrencyAED(feature.remaining)} remaining
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                <AlertCircle className="w-3 h-3 inline mr-1" />
                {isRTL
                  ? 'استخدام التأمين الصحي يختلف حسب الحالة الفردية ولا يمكن التنبؤ به مسبقاً'
                  : 'Health insurance usage varies by individual circumstances and cannot be predicted in advance'}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Smart Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-blue-500/5 via-transparent to-violet-500/5 border-blue-500/20">
          <CardContent className="p-5">
            <div className={cn('flex items-start gap-4', isRTL && 'flex-row-reverse')}>
              <div className="p-2 rounded-full bg-blue-500/15 shrink-0">
                <Lightbulb className="w-5 h-5 text-blue-600" />
              </div>
              <div className={cn('space-y-2', isRTL && 'text-right')}>
                <h4 className="font-semibold">
                  {isRTL ? 'نصائح لتعظيم مزاياك' : 'Tips to Maximize Your Benefits'}
                </h4>
                <ul className={cn('text-sm text-muted-foreground space-y-1', isRTL ? 'pr-4' : 'pl-4')}>
                  <li>• {isRTL ? 'قدم إيصالات التعليم قبل نهاية العام الدراسي' : 'Submit education receipts before school year ends'}</li>
                  <li>• {isRTL ? 'استخدم ميزانية التعلم للحصول على شهادات مهنية' : 'Use learning budget for professional certifications'}</li>
                  <li>• {isRTL ? 'طالب باشتراكات الصالة الرياضية والعافية ربع سنويًا' : 'Claim gym and wellness subscriptions quarterly'}</li>
                  <li>• {isRTL ? 'احجز موعد فحص الأسنان والعيون السنوي' : 'Schedule annual dental and optical checkups'}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
