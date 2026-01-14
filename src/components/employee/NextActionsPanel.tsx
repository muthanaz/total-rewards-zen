import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { 
  ArrowRight, ArrowLeft, FileText, Gift, Clock, AlertCircle, 
  CheckCircle2, CreditCard, Calendar, TrendingUp, Wallet
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Benefit {
  name: string;
  value: number;
  utilized: number;
  route: string;
  category?: string;
}

interface Request {
  id: string;
  status: string;
  type: string;
  subject: string;
  created_at: string;
}

interface NextActionsPanelProps {
  benefits: Benefit[];
  requests?: Request[];
  leaveBalance?: { used: number; total: number };
  className?: string;
}

interface ActionItem {
  id: string;
  type: 'opportunity' | 'pending' | 'action' | 'reminder';
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  cta: string;
  ctaAr: string;
  route: string;
  icon: React.ElementType;
  priority: number;
  value?: string;
}

export function NextActionsPanel({ 
  benefits, 
  requests = [], 
  leaveBalance,
  className 
}: NextActionsPanelProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const isArabic = language === 'ar';
  const navigate = useNavigate();

  const actions = useMemo<ActionItem[]>(() => {
    const items: ActionItem[] = [];
    const now = new Date();
    const currentMonth = now.getMonth();
    const isYearEnd = currentMonth >= 10; // Nov-Dec

    // 1. Pending requests
    const pendingRequests = requests.filter(r => ['pending', 'submitted', 'in_review'].includes(r.status));
    if (pendingRequests.length > 0) {
      items.push({
        id: 'pending-requests',
        type: 'pending',
        title: `${pendingRequests.length} Pending Request${pendingRequests.length > 1 ? 's' : ''}`,
        titleAr: `${pendingRequests.length} طلب${pendingRequests.length > 1 ? 'ات' : ''} قيد الانتظار`,
        description: 'Track the status of your submitted requests',
        descriptionAr: 'تتبع حالة طلباتك المقدمة',
        cta: 'View Requests',
        ctaAr: 'عرض الطلبات',
        route: '/employee/documents',
        icon: Clock,
        priority: 1,
      });
    }

    // 2. Underutilized benefits with significant remaining value
    const underutilized = benefits
      .filter(b => {
        const remaining = b.value - b.utilized;
        const utilization = (b.utilized / b.value) * 100;
        return remaining > 1000 && utilization < 50;
      })
      .sort((a, b) => (b.value - b.utilized) - (a.value - a.utilized))
      .slice(0, 2);

    underutilized.forEach((benefit, i) => {
      const remaining = benefit.value - benefit.utilized;
      items.push({
        id: `underutilized-${benefit.name}`,
        type: 'opportunity',
        title: `${benefit.name} Opportunity`,
        titleAr: `فرصة ${benefit.name}`,
        description: `AED ${remaining.toLocaleString()} remaining to use`,
        descriptionAr: `${remaining.toLocaleString()} درهم متبقي للاستخدام`,
        cta: 'Use Now',
        ctaAr: 'استخدم الآن',
        route: benefit.route,
        icon: Wallet,
        priority: 2 + i,
        value: `AED ${remaining.toLocaleString()}`,
      });
    });

    // 3. Year-end reminder for use-it-or-lose-it benefits
    if (isYearEnd) {
      const expiringBenefits = benefits.filter(b => {
        const remaining = b.value - b.utilized;
        const isUseItOrLoseIt = ['learning', 'wellbeing'].includes(b.category || '');
        return remaining > 0 && isUseItOrLoseIt;
      });

      if (expiringBenefits.length > 0) {
        const totalExpiring = expiringBenefits.reduce((sum, b) => sum + (b.value - b.utilized), 0);
        items.push({
          id: 'year-end-expiring',
          type: 'reminder',
          title: 'Benefits Expiring Soon',
          titleAr: 'مزايا تنتهي قريباً',
          description: `AED ${totalExpiring.toLocaleString()} expires Dec 31`,
          descriptionAr: `${totalExpiring.toLocaleString()} درهم تنتهي في ٣١ ديسمبر`,
          cta: 'Review Benefits',
          ctaAr: 'مراجعة المزايا',
          route: '/employee/benefits',
          icon: AlertCircle,
          priority: 1,
          value: `AED ${totalExpiring.toLocaleString()}`,
        });
      }
    }

    // 4. Low leave balance warning
    if (leaveBalance && leaveBalance.total - leaveBalance.used < 5) {
      items.push({
        id: 'low-leave',
        type: 'reminder',
        title: 'Low Leave Balance',
        titleAr: 'رصيد إجازات منخفض',
        description: `Only ${leaveBalance.total - leaveBalance.used} days remaining`,
        descriptionAr: `${leaveBalance.total - leaveBalance.used} أيام متبقية فقط`,
        cta: 'View Leave',
        ctaAr: 'عرض الإجازات',
        route: '/employee/leave',
        icon: Calendar,
        priority: 3,
      });
    }

    // 5. Quick action: Submit a claim
    if (items.length < 4) {
      items.push({
        id: 'submit-claim',
        type: 'action',
        title: 'Submit a Claim',
        titleAr: 'تقديم مطالبة',
        description: 'Get reimbursed for eligible expenses',
        descriptionAr: 'احصل على تعويض عن النفقات المؤهلة',
        cta: 'Start Claim',
        ctaAr: 'بدء المطالبة',
        route: '/employee/documents',
        icon: CreditCard,
        priority: 10,
      });
    }

    // Sort by priority and take top 6
    return items.sort((a, b) => a.priority - b.priority).slice(0, 6);
  }, [benefits, requests, leaveBalance]);

  const getTypeStyles = (type: ActionItem['type']) => {
    switch (type) {
      case 'opportunity':
        return {
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/20',
          iconBg: 'bg-emerald-500/10',
          iconColor: 'text-emerald-600',
          badge: 'bg-emerald-500/10 text-emerald-600',
        };
      case 'pending':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/20',
          iconBg: 'bg-amber-500/10',
          iconColor: 'text-amber-600',
          badge: 'bg-amber-500/10 text-amber-600',
        };
      case 'reminder':
        return {
          bg: 'bg-rose-500/10',
          border: 'border-rose-500/20',
          iconBg: 'bg-rose-500/10',
          iconColor: 'text-rose-600',
          badge: 'bg-rose-500/10 text-rose-600',
        };
      case 'action':
      default:
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/20',
          iconBg: 'bg-blue-500/10',
          iconColor: 'text-blue-600',
          badge: 'bg-blue-500/10 text-blue-600',
        };
    }
  };

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  if (actions.length === 0) return null;

  return (
    <div className={cn("space-y-4", className)}>
      <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
        <h2 className="text-base font-display font-semibold">
          {isArabic ? 'الإجراءات التالية' : 'Next Actions'}
        </h2>
        <Badge variant="outline" className="text-xs">
          {actions.length} {isArabic ? 'إجراء' : 'items'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {actions.map((action, index) => {
          const styles = getTypeStyles(action.type);
          const Icon = action.icon;

          return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card 
                className={cn(
                  "cursor-pointer hover:shadow-md transition-all duration-200 h-full",
                  styles.border
                )}
                onClick={() => navigate(action.route)}
              >
                <CardContent className="p-4">
                  <div className={cn("flex items-start gap-3", isRTL && "flex-row-reverse")}>
                    <div className={cn("p-2 rounded-lg shrink-0", styles.iconBg)}>
                      <Icon className={cn("w-5 h-5", styles.iconColor)} />
                    </div>
                    <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
                      <h3 className="font-medium text-sm line-clamp-1">
                        {isArabic ? action.titleAr : action.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {isArabic ? action.descriptionAr : action.description}
                      </p>
                      {action.value && (
                        <Badge variant="secondary" className={cn("mt-2 text-xs", styles.badge)}>
                          {action.value}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={cn(
                      "w-full mt-3 text-xs justify-between",
                      isRTL && "flex-row-reverse"
                    )}
                  >
                    {isArabic ? action.ctaAr : action.cta}
                    <ArrowIcon className="w-3.5 h-3.5" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
