/**
 * Out-of-Pocket Optimizer Page
 * 
 * Benefits-first action experience to help employees reduce real out-of-pocket costs.
 * 
 * Structure:
 * 1. Money Snapshot card at top
 * 2. KPI strip: Reducible Costs (with breakdown), Actions to take, Time estimate
 * 3. Top 5 prioritized actions, rest under "Show all"
 * 
 * CRITICAL RULES:
 * - Never show AED for coverage/access/deferred benefits
 * - All savings show timeframe + confidence + breakdown
 */

import { useState, useMemo } from 'react';
import { 
  TrendingDown, 
  Clock, 
  CheckCircle2, 
  ChevronDown,
  ChevronUp,
  Wallet,
  Zap,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PageLayout } from '@/components/shared/PageLayout';
import { MoneySnapshotCard } from '@/components/employee/MoneySnapshotCard';
import { OptimizerActionCard } from '@/components/employee/OptimizerActionCard';
import { ConfidenceBadge } from '@/components/shared/ConfidenceBadge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { 
  computeOutOfPocketOpportunities,
  getTimeframeLabel,
  getConfidenceLabel,
} from '@/lib/optimizer/computeOutOfPocketOpportunities';
import { DEMO_FALLBACKS } from '@/lib/metrics/computations';

const MAX_VISIBLE_ACTIONS = 5;

export default function OutOfPocketOptimizer() {
  const { direction } = useLanguage();
  const { isDemoMode } = useDemoMode();
  const isRTL = direction === 'rtl';
  const lang = isRTL ? 'ar' : 'en';

  const [showAll, setShowAll] = useState(false);
  const hasLinkedBankCards = false;

  const { actions, summary } = useMemo(() => {
    return computeOutOfPocketOpportunities(hasLinkedBankCards);
  }, [hasLinkedBankCards]);

  const visibleActions = showAll ? actions : actions.slice(0, MAX_VISIBLE_ACTIONS);
  const hiddenCount = actions.length - MAX_VISIBLE_ACTIONS;

  return (
    <PageLayout
      title={isRTL ? 'محسّن التكاليف' : 'Out-of-Pocket Optimizer'}
      description={isRTL ? 'إجراءات لتقليل تكاليفك' : 'Actions to reduce your costs'}
      icon={TrendingDown}
      iconClassName="bg-accent/10 text-accent"
    >
      {isDemoMode && (
        <Badge variant="outline" className="mb-4 text-xs bg-muted/50">Demo</Badge>
      )}

      {/* Money Snapshot at top */}
      <div className="mb-6">
        <MoneySnapshotCard 
          monthlySalary={DEMO_FALLBACKS.employeeMonthlySalary}
          isDemo={isDemoMode}
          isRTL={isRTL}
          compact
        />
      </div>

      {/* KPI Strip */}
      <div className={cn("grid grid-cols-3 gap-4 mb-6", isRTL && "direction-rtl")}>
        {/* Reducible Costs */}
        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
          <CardContent className="p-4">
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-accent" />
              </div>
              <div className={cn("flex-1", isRTL && "text-right")}>
                <p className="text-xs text-muted-foreground">
                  {isRTL ? 'تكاليف قابلة للتخفيض' : 'Reducible costs'}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-bold tabular-nums">
                    {formatCurrencyAED(summary.reducibleCosts)}
                  </p>
                  {/* Breakdown popover */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5">
                        <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72" align={isRTL ? 'start' : 'end'}>
                      <div className={cn("space-y-3", isRTL && "text-right")}>
                        <p className="font-medium text-xs uppercase text-muted-foreground">
                          {isRTL ? 'تفصيل التكاليف' : 'Cost Breakdown'}
                        </p>
                        <div className="space-y-2">
                          {summary.reducibleCostsBreakdown.map((item) => (
                            <div key={item.actionId} className="flex justify-between text-xs">
                              <span className="text-muted-foreground">{item.label}</span>
                              <span className="font-medium tabular-nums">
                                {formatCurrencyAED(item.amount)}
                              </span>
                            </div>
                          ))}
                        </div>
                        <p className="text-[10px] text-muted-foreground pt-2 border-t">
                          {getTimeframeLabel(summary.reducibleCostsTimeframe, lang)} • {getConfidenceLabel(summary.reducibleCostsConfidence, lang)}
                        </p>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <Badge variant="outline" className="text-[10px] px-1 mt-0.5 bg-muted/50">
                  {getTimeframeLabel(summary.reducibleCostsTimeframe, lang)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions Count */}
        <Card>
          <CardContent className="p-4">
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                summary.hasBlockers ? "bg-destructive/10" : "bg-warning/10"
              )}>
                {summary.hasBlockers 
                  ? <AlertTriangle className="w-5 h-5 text-destructive" />
                  : <Zap className="w-5 h-5 text-warning" />
                }
              </div>
              <div className={cn(isRTL && "text-right")}>
                <p className="text-xs text-muted-foreground">
                  {isRTL ? 'إجراءات للتنفيذ' : 'Actions to take'}
                </p>
                <p className="text-lg font-bold tabular-nums">{summary.actionCount}</p>
                {summary.hasBlockers && (
                  <p className="text-[10px] text-destructive">
                    {summary.blockerCount} {isRTL ? 'محظورة' : 'blocked'}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time Estimate */}
        <Card>
          <CardContent className="p-4">
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-info" />
              </div>
              <div className={cn(isRTL && "text-right")}>
                <p className="text-xs text-muted-foreground">
                  {isRTL ? 'الوقت المقدر' : 'Time to complete'}
                </p>
                <p className="text-lg font-bold tabular-nums">
                  ~{summary.estimatedMinutes} {isRTL ? 'دقيقة' : 'min'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action List */}
      <section className="space-y-3">
        <h2 className={cn("text-sm font-medium text-muted-foreground", isRTL && "text-right")}>
          {isRTL ? 'إجراءات ذات أولوية' : 'Prioritized Actions'}
        </h2>

        {actions.length === 0 ? (
          <Card className="border-success/20 bg-success/5">
            <CardContent className="p-6">
              <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-success" />
                </div>
                <div className={cn(isRTL && "text-right")}>
                  <h3 className="font-semibold">
                    {isRTL ? 'ممتاز! لا توجد إجراءات معلقة' : "Great! No pending actions"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? 'أنت تستفيد من مزاياك بشكل جيد' : "You're utilizing your benefits well"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-2">
              {visibleActions.map((action) => (
                <OptimizerActionCard key={action.id} action={action} />
              ))}
            </div>

            {hiddenCount > 0 && (
              <Button
                variant="ghost"
                className={cn("w-full text-muted-foreground", isRTL && "flex-row-reverse")}
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? (
                  <>{isRTL ? 'إخفاء' : 'Show less'} <ChevronUp className="w-4 h-4 ml-1" /></>
                ) : (
                  <>{isRTL ? `المزيد (${hiddenCount})` : `Show all (${hiddenCount} more)`} <ChevronDown className="w-4 h-4 ml-1" /></>
                )}
              </Button>
            )}
          </>
        )}
      </section>

      {/* Trust footer */}
      <p className={cn("text-xs text-muted-foreground mt-6 text-center", isRTL && "text-right")}>
        {isRTL 
          ? 'الحسابات مبنية على بيانات مزاياك والسياسات الحالية' 
          : 'Calculations based on your benefit data and current policies'}
        {isDemoMode && <span className="text-muted-foreground/50"> (Demo)</span>}
      </p>
    </PageLayout>
  );
}
