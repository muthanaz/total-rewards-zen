/**
 * Employer Executive Summary Card
 * 
 * A concise "What Value Do I Get?" view for employers showing:
 * - Utilization overview
 * - Top unused spend areas
 * - Inquiry deflection proxy
 * - Processing time proxy
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  ChevronRight, 
  ChevronLeft,
  Zap,
  Clock,
  MessageSquare,
  PiggyBank,
  AlertTriangle,
  CheckCircle,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Currency } from '@/components/ui/Currency';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { DEMO_EXEC_METRICS, DEMO_ZOMBIE_OPPORTUNITIES } from '@/lib/demoScenario';

interface ExecutiveSummaryCardProps {
  className?: string;
  variant?: 'compact' | 'full' | 'hero';
}

export function ExecutiveSummaryCard({ className, variant = 'full' }: ExecutiveSummaryCardProps) {
  const navigate = useNavigate();
  const { language, direction } = useLanguage();
  const { isDemoMode } = useDemoMode();
  const isRTL = direction === 'rtl';
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  // Get demo data when in demo mode
  const metrics = useMemo(() => {
    if (isDemoMode) {
      return DEMO_EXEC_METRICS;
    }
    // Fallback for non-demo mode
    return {
      totalInvestment: 24600000,
      utilizationRate: 68,
      targetUtilization: 80,
      zombieSpend: 2952000,
      claimsSlaCompliance: 87,
      claimsSlaTarget: 95,
      pendingClaims: 47,
      esatScore: 76,
      esatBenchmark: 72,
    };
  }, [isDemoMode]);

  const zombieOpportunities = isDemoMode ? DEMO_ZOMBIE_OPPORTUNITIES : [];

  // Calculate derived metrics
  const utilizationGap = metrics.targetUtilization - metrics.utilizationRate;
  const slaGap = metrics.claimsSlaTarget - metrics.claimsSlaCompliance;
  const inquiryDeflection = 72; // Proxy: % of questions answered by self-service
  const avgProcessingDays = 2.3; // Proxy: avg days to process claims

  // Status indicators
  const utilizationStatus = metrics.utilizationRate >= 75 ? 'good' : metrics.utilizationRate >= 60 ? 'warning' : 'critical';
  const slaStatus = metrics.claimsSlaCompliance >= 95 ? 'good' : metrics.claimsSlaCompliance >= 85 ? 'warning' : 'critical';

  const statusColors = {
    good: 'text-success',
    warning: 'text-warning',
    critical: 'text-destructive',
  };

  if (variant === 'compact') {
    return (
      <Card className={cn("border border-border/60 bg-card/80 backdrop-blur-sm", className)}>
        <CardContent className="p-4">
          <div className={cn("flex items-center gap-4 flex-wrap", isRTL && "flex-row-reverse")}>
            {/* Investment */}
            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <PiggyBank className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">{t('Investment', 'الاستثمار')}</span>
              <span className="font-semibold"><Currency amount={metrics.totalInvestment} /></span>
            </div>
            
            {/* Utilization */}
            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Target className={cn("w-4 h-4", statusColors[utilizationStatus])} />
              <span className="text-sm text-muted-foreground">{t('Utilization', 'الاستخدام')}</span>
              <span className={cn("font-semibold", statusColors[utilizationStatus])}>{metrics.utilizationRate}%</span>
            </div>
            
            {/* SLA */}
            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Clock className={cn("w-4 h-4", statusColors[slaStatus])} />
              <span className="text-sm text-muted-foreground">{t('Claims SLA', 'معايير المطالبات')}</span>
              <span className={cn("font-semibold", statusColors[slaStatus])}>{metrics.claimsSlaCompliance}%</span>
            </div>
            
            <Button variant="ghost" size="sm" className="ms-auto" onClick={() => navigate('/employer/dashboard')}>
              <ChevronIcon className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'hero') {
    return (
      <Card className={cn("border-0 bg-gradient-to-br from-primary/10 via-card to-accent/5 shadow-lg", className)}>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Investment */}
            <div className={cn("text-center p-4 rounded-xl bg-background/50 border border-border/40", isRTL && "text-right")}>
              <PiggyBank className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground mb-1">{t('Total Investment', 'إجمالي الاستثمار')}</p>
              <div className="text-2xl font-bold"><Currency amount={metrics.totalInvestment} /></div>
            </div>
            
            {/* Utilization */}
            <div className={cn("text-center p-4 rounded-xl bg-background/50 border border-border/40", isRTL && "text-right")}>
              <Target className={cn("w-8 h-8 mx-auto mb-2", statusColors[utilizationStatus])} />
              <p className="text-xs text-muted-foreground mb-1">{t('Utilization Rate', 'معدل الاستخدام')}</p>
              <p className={cn("text-2xl font-bold", statusColors[utilizationStatus])}>{metrics.utilizationRate}%</p>
              <p className="text-xs text-muted-foreground">{t(`${utilizationGap}% below target`, `${utilizationGap}% أقل من الهدف`)}</p>
            </div>
            
            {/* Zombie Spend */}
            <div className={cn("text-center p-4 rounded-xl bg-background/50 border border-border/40", isRTL && "text-right")}>
              <AlertTriangle className="w-8 h-8 text-warning mx-auto mb-2" />
              <p className="text-xs text-muted-foreground mb-1">{t('Unused Spend', 'الإنفاق غير المستخدم')}</p>
              <div className="text-2xl font-bold text-warning"><Currency amount={metrics.zombieSpend} /></div>
              <p className="text-xs text-muted-foreground">{t('Recovery opportunity', 'فرصة استرداد')}</p>
            </div>
            
            {/* Claims SLA */}
            <div className={cn("text-center p-4 rounded-xl bg-background/50 border border-border/40", isRTL && "text-right")}>
              <Clock className={cn("w-8 h-8 mx-auto mb-2", statusColors[slaStatus])} />
              <p className="text-xs text-muted-foreground mb-1">{t('Claims SLA', 'معايير المطالبات')}</p>
              <p className={cn("text-2xl font-bold", statusColors[slaStatus])}>{metrics.claimsSlaCompliance}%</p>
              <p className="text-xs text-muted-foreground">{metrics.pendingClaims} {t('pending', 'معلق')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border border-border/60 bg-gradient-to-br from-card via-card to-accent/5 overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
          <CardTitle className={cn("flex items-center gap-2 text-lg", isRTL && "flex-row-reverse")}>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-primary" />
            </div>
            {t('Executive Summary', 'الملخص التنفيذي')}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {t('Last 90 Days', 'آخر 90 يوم')}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-5">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Total Investment */}
          <div className={cn("p-3 rounded-xl bg-muted/30 border border-border/40", isRTL && "text-right")}>
            <div className={cn("flex items-center gap-2 mb-1", isRTL && "flex-row-reverse")}>
              <PiggyBank className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">{t('Investment', 'الاستثمار')}</span>
            </div>
            <div className="text-xl font-bold"><Currency amount={metrics.totalInvestment} /></div>
          </div>
          
          {/* Utilization */}
          <div className={cn("p-3 rounded-xl bg-muted/30 border border-border/40", isRTL && "text-right")}>
            <div className={cn("flex items-center gap-2 mb-1", isRTL && "flex-row-reverse")}>
              <Target className={cn("w-4 h-4", statusColors[utilizationStatus])} />
              <span className="text-xs text-muted-foreground">{t('Utilization', 'الاستخدام')}</span>
            </div>
            <div className={cn("flex items-baseline gap-2", isRTL && "flex-row-reverse")}>
              <p className={cn("text-xl font-bold", statusColors[utilizationStatus])}>{metrics.utilizationRate}%</p>
              <span className="text-xs text-muted-foreground">/ {metrics.targetUtilization}%</span>
            </div>
          </div>
          
          {/* SLA Compliance */}
          <div className={cn("p-3 rounded-xl bg-muted/30 border border-border/40", isRTL && "text-right")}>
            <div className={cn("flex items-center gap-2 mb-1", isRTL && "flex-row-reverse")}>
              <Clock className={cn("w-4 h-4", statusColors[slaStatus])} />
              <span className="text-xs text-muted-foreground">{t('Claims SLA', 'معايير المطالبات')}</span>
            </div>
            <div className={cn("flex items-baseline gap-2", isRTL && "flex-row-reverse")}>
              <p className={cn("text-xl font-bold", statusColors[slaStatus])}>{metrics.claimsSlaCompliance}%</p>
              <Badge variant={slaStatus === 'good' ? 'default' : 'destructive'} className="text-[10px] h-4">
                {slaStatus === 'good' ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
              </Badge>
            </div>
          </div>
          
          {/* Processing Time */}
          <div className={cn("p-3 rounded-xl bg-muted/30 border border-border/40", isRTL && "text-right")}>
            <div className={cn("flex items-center gap-2 mb-1", isRTL && "flex-row-reverse")}>
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-xs text-muted-foreground">{t('Avg Processing', 'متوسط المعالجة')}</span>
            </div>
            <p className="text-xl font-bold">{avgProcessingDays} {t('days', 'أيام')}</p>
          </div>
        </div>
        
        {/* Top Unused Spend Areas */}
        <div>
          <h4 className={cn("text-sm font-medium mb-3 flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <AlertTriangle className="w-4 h-4 text-warning" />
            {t('Top Unused Spend Areas', 'أعلى مناطق الإنفاق غير المستخدمة')}
          </h4>
          <div className="space-y-2">
            {zombieOpportunities.slice(0, 3).map((opp) => (
              <div 
                key={opp.id}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg border border-border/40 bg-background/50",
                  isRTL && "flex-row-reverse"
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {language === 'ar' ? opp.categoryAr : opp.category}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {opp.utilizationRate}% {t('utilized', 'مستخدم')}
                  </p>
                </div>
                <div className={cn("text-right", isRTL && "text-left")}>
                  <div className="text-sm font-semibold text-warning"><Currency amount={opp.impact} /></div>
                  <p className="text-[10px] text-muted-foreground">{t('unused', 'غير مستخدم')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Inquiry Deflection */}
        <div className={cn("flex items-center gap-4 p-3 rounded-xl bg-success/5 border border-success/20", isRTL && "flex-row-reverse")}>
          <MessageSquare className="w-8 h-8 text-success shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">{t('Self-Service Adoption', 'اعتماد الخدمة الذاتية')}</p>
            <p className="text-xs text-muted-foreground">
              {inquiryDeflection}% {t('of inquiries resolved without HR', 'من الاستفسارات تم حلها بدون الموارد البشرية')}
            </p>
          </div>
          <div className="text-right">
            <div className={cn("flex items-center gap-1 text-success", isRTL && "flex-row-reverse")}>
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-semibold">+8%</span>
            </div>
          </div>
        </div>
        
        {/* CTAs */}
        <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => navigate('/employer/zombie')}
          >
            {t('View Opportunities', 'عرض الفرص')}
          </Button>
          <Button 
            className="flex-1"
            onClick={() => navigate('/employer/dashboard')}
          >
            {t('Full Dashboard', 'لوحة القيادة الكاملة')}
            <ChevronIcon className="w-4 h-4 ms-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default ExecutiveSummaryCard;
