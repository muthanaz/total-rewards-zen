/**
 * Employee Benefits Summary Card
 * 
 * A concise "My Benefits Summary" with clear next best actions.
 * Designed for the demo pack to show value proposition at a glance.
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Wallet, 
  TrendingUp, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  Clock,
  ArrowRight,
  Gift,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { DEMO_EMPLOYEE, getDemoEmployeeUtilization } from '@/lib/demoScenario';

interface NextAction {
  id: string;
  title: string;
  titleAr?: string;
  subtitle: string;
  subtitleAr?: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  route: string;
  icon?: React.ElementType;
}

interface BenefitsSummaryCardProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export function BenefitsSummaryCard({ className, variant = 'full' }: BenefitsSummaryCardProps) {
  const navigate = useNavigate();
  const { language, direction } = useLanguage();
  const { isDemoMode } = useDemoMode();
  const isRTL = direction === 'rtl';
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  // Get demo data when in demo mode
  const utilization = useMemo(() => {
    if (isDemoMode) {
      return getDemoEmployeeUtilization();
    }
    // Fallback for non-demo mode
    return { total: 282000, utilized: 215300, remaining: 66700, percent: 76 };
  }, [isDemoMode]);

  const employee = isDemoMode ? DEMO_EMPLOYEE : null;

  // Calculate status based on utilization
  const utilizationStatus = useMemo(() => {
    if (utilization.percent >= 80) return { label: 'On Track', labelAr: 'على المسار', color: 'success' as const };
    if (utilization.percent >= 50) return { label: 'Room to Use', labelAr: 'مساحة للاستخدام', color: 'warning' as const };
    return { label: 'Low Usage', labelAr: 'استخدام منخفض', color: 'destructive' as const };
  }, [utilization.percent]);

  // Next best actions from demo data
  const nextActions: NextAction[] = useMemo(() => {
    if (!isDemoMode || !employee) {
      return [
        { id: '1', title: 'Submit Q2 School Fees', subtitle: 'AED 18,500 eligible', category: 'Schooling', priority: 'high', route: '/employee/schooling', icon: Gift },
        { id: '2', title: 'Book Annual Checkup', subtitle: 'Covered 100%', category: 'Health', priority: 'medium', route: '/employee/health', icon: CheckCircle2 },
        { id: '3', title: 'Claim Gym Membership', subtitle: 'AED 2,800 remaining', category: 'Wellbeing', priority: 'low', route: '/employee/wellbeing', icon: Sparkles },
      ];
    }
    
    // Generate actions from employee's pending requests and unused benefits
    const actions: NextAction[] = [];
    
    if (employee.pendingRequests?.length > 0) {
      employee.pendingRequests.forEach((req, idx) => {
        actions.push({
          id: `pending-${idx}`,
          title: `Track: ${req.subject}`,
          titleAr: `تتبع: ${req.subject}`,
          subtitle: `Status: ${req.status}`,
          subtitleAr: `الحالة: ${req.status}`,
          category: req.category,
          priority: 'high',
          route: '/employee/requests',
          icon: Clock,
        });
      });
    }
    
    // Find underutilized benefits
    employee.benefits
      .filter(b => b.utilized < b.annualValue * 0.5)
      .slice(0, 2)
      .forEach((b, idx) => {
        const remaining = b.annualValue - b.utilized;
        actions.push({
          id: `unused-${idx}`,
          title: `Use ${b.name}`,
          subtitle: `${formatCurrencyAED(remaining)} remaining`,
          category: b.category,
          priority: remaining > 5000 ? 'high' : 'medium',
          route: `/employee/${b.category}`,
          icon: AlertCircle,
        });
      });

    return actions.slice(0, 3);
  }, [isDemoMode, employee]);

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const priorityColors = {
    high: 'bg-destructive/10 text-destructive border-destructive/20',
    medium: 'bg-warning/10 text-warning border-warning/20',
    low: 'bg-success/10 text-success border-success/20',
  };

  if (variant === 'compact') {
    return (
      <Card className={cn("border border-border/60 bg-card/80 backdrop-blur-sm", className)}>
        <CardContent className="p-4">
          <div className={cn("flex items-center justify-between gap-4", isRTL && "flex-row-reverse")}>
            {/* Value Summary */}
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('My Benefits', 'مزاياي')}</p>
                <p className="text-lg font-semibold">{formatCurrencyAED(utilization.total)}</p>
              </div>
            </div>
            
            {/* Utilization Gauge */}
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <div className="w-24">
                <Progress value={utilization.percent} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">{utilization.percent}% {t('used', 'مستخدم')}</p>
              </div>
              <Badge variant="outline" className={cn("text-xs", priorityColors[utilizationStatus.color === 'success' ? 'low' : utilizationStatus.color === 'warning' ? 'medium' : 'high'])}>
                {t(utilizationStatus.label, utilizationStatus.labelAr)}
              </Badge>
            </div>
            
            <Button variant="ghost" size="sm" onClick={() => navigate('/employee/benefits')}>
              <ChevronIcon className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border border-border/60 bg-gradient-to-br from-card via-card to-primary/5 overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
          <CardTitle className={cn("flex items-center gap-2 text-lg", isRTL && "flex-row-reverse")}>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            {t('My Benefits Summary', 'ملخص مزاياي')}
          </CardTitle>
          <Badge variant="outline" className={cn("text-xs", priorityColors[utilizationStatus.color === 'success' ? 'low' : utilizationStatus.color === 'warning' ? 'medium' : 'high'])}>
            {t(utilizationStatus.label, utilizationStatus.labelAr)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-5">
        {/* Value At a Glance */}
        <div className={cn("grid grid-cols-3 gap-4 p-4 rounded-xl bg-muted/30 border border-border/40", isRTL && "text-right")}>
          <div>
            <p className="text-xs text-muted-foreground mb-1">{t('Total Value', 'القيمة الإجمالية')}</p>
            <p className="text-xl font-bold text-foreground">{formatCurrencyAED(utilization.total, { abbreviate: true })}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">{t('Used', 'المستخدم')}</p>
            <p className="text-xl font-bold text-primary">{formatCurrencyAED(utilization.utilized, { abbreviate: true })}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">{t('Remaining', 'المتبقي')}</p>
            <p className="text-xl font-bold text-success">{formatCurrencyAED(utilization.remaining, { abbreviate: true })}</p>
          </div>
        </div>
        
        {/* Utilization Bar */}
        <div>
          <div className={cn("flex items-center justify-between mb-2 text-sm", isRTL && "flex-row-reverse")}>
            <span className="text-muted-foreground">{t('Utilization', 'الاستخدام')}</span>
            <span className="font-medium">{utilization.percent}%</span>
          </div>
          <Progress value={utilization.percent} className="h-3 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-primary/70" />
        </div>
        
        {/* Next Best Actions */}
        <div>
          <h4 className={cn("text-sm font-medium mb-3 flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <TrendingUp className="w-4 h-4 text-accent" />
            {t('Recommended Actions', 'الإجراءات الموصى بها')}
          </h4>
          <div className="space-y-2">
            {nextActions.map((action) => {
              const ActionIcon = action.icon || ChevronIcon;
              return (
                <button
                  key={action.id}
                  onClick={() => navigate(action.route)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg border border-border/40 bg-background/50",
                    "hover:border-accent/50 hover:bg-accent/5 transition-all duration-200 group",
                    isRTL && "flex-row-reverse text-right"
                  )}
                >
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", priorityColors[action.priority])}>
                    <ActionIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{language === 'ar' && action.titleAr ? action.titleAr : action.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{language === 'ar' && action.subtitleAr ? action.subtitleAr : action.subtitle}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">{action.category}</Badge>
                  <ArrowRight className={cn("w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors shrink-0", isRTL && "rotate-180")} />
                </button>
              );
            })}
          </div>
        </div>
        
        {/* View All CTA */}
        <Button 
          variant="outline" 
          className="w-full group"
          onClick={() => navigate('/employee/benefits')}
        >
          {t('View All Benefits', 'عرض جميع المزايا')}
          <ChevronIcon className="w-4 h-4 ms-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  );
}

export default BenefitsSummaryCard;
