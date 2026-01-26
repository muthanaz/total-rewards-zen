/**
 * Out-of-Pocket Optimizer Page
 * 
 * Benefits-first action experience to help employees reduce real out-of-pocket costs.
 * 
 * Structure:
 * 1. Header with subheader explaining the purpose
 * 2. KPI strip (3 max): Potential savings, Actions to take, Time estimate
 * 3. Prioritized action list with "More opportunities" collapse
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingDown, 
  Clock, 
  CheckCircle2, 
  ChevronDown,
  ChevronUp,
  Wallet,
  Zap,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageLayout } from '@/components/shared/PageLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { cn } from '@/lib/utils';
import { OptimizerActionCard } from '@/components/employee/OptimizerActionCard';
import { 
  computeOutOfPocketOpportunities,
  type OptimizerAction,
  type OptimizerSummary,
} from '@/lib/optimizer/computeOutOfPocketOpportunities';

// ============================================================================
// COMPONENT
// ============================================================================

export default function OutOfPocketOptimizer() {
  const navigate = useNavigate();
  const { language, direction } = useLanguage();
  const { isDemoMode } = useDemoMode();
  const isRTL = direction === 'rtl';

  const [showMore, setShowMore] = useState(false);
  
  // For demo, assume no linked bank cards (to show that action)
  const hasLinkedBankCards = false;

  // Compute opportunities
  const { actions, summary } = useMemo(() => {
    return computeOutOfPocketOpportunities(hasLinkedBankCards);
  }, [hasLinkedBankCards]);

  // Split into primary (first 8) and secondary (rest)
  const primaryActions = actions.slice(0, 8);
  const secondaryActions = actions.slice(8);

  return (
    <PageLayout
      title={isRTL ? 'محسّن التكاليف' : 'Out-of-Pocket Optimizer'}
      description={
        isRTL 
          ? 'إجراءات يمكن أن تقلل تكاليفك هذا الشهر' 
          : 'Actions that can reduce your costs this month'
      }
      icon={TrendingDown}
      iconClassName="bg-accent/10 text-accent"
    >
      {/* Demo badge */}
      {isDemoMode && (
        <Badge variant="outline" className="mb-4 text-xs bg-muted/50">
          Demo
        </Badge>
      )}

      {/* KPI Strip */}
      <div className={cn(
        "grid grid-cols-3 gap-4 mb-6",
        isRTL && "direction-rtl"
      )}>
        {/* Potential Savings */}
        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
          <CardContent className="p-4">
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-accent" />
              </div>
              <div className={cn(isRTL && "text-right")}>
                <p className="text-xs text-muted-foreground">
                  {isRTL ? 'الوفورات المحتملة' : 'Potential savings'}
                </p>
                <p className="text-lg font-bold tabular-nums">
                  AED {summary.potentialSavings.toLocaleString('en-US')}
                </p>
                <Badge 
                  variant="outline" 
                  className="text-[10px] px-1 mt-0.5 bg-muted/50"
                >
                  {summary.savingsConfidence === 'estimated' 
                    ? (isRTL ? 'تقدير' : 'Est.') 
                    : (isRTL ? 'مؤكد' : 'Confirmed')}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions Count */}
        <Card>
          <CardContent className="p-4">
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-warning" />
              </div>
              <div className={cn(isRTL && "text-right")}>
                <p className="text-xs text-muted-foreground">
                  {isRTL ? 'إجراءات للتنفيذ' : 'Actions to take'}
                </p>
                <p className="text-lg font-bold tabular-nums">
                  {summary.actionCount}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {isRTL ? 'مهام معلقة' : 'pending tasks'}
                </p>
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
                <p className="text-[10px] text-muted-foreground">
                  {isRTL ? 'لجميع الإجراءات' : 'for all actions'}
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

        {/* Empty state */}
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
                    {isRTL 
                      ? 'أنت تستفيد من مزاياك بشكل جيد' 
                      : "You're utilizing your benefits well"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Primary actions */}
            <div className="space-y-2">
              {primaryActions.map((action) => (
                <OptimizerActionCard key={action.id} action={action} />
              ))}
            </div>

            {/* Secondary actions (collapsed) */}
            {secondaryActions.length > 0 && (
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full text-muted-foreground hover:text-foreground",
                    isRTL && "flex-row-reverse"
                  )}
                  onClick={() => setShowMore(!showMore)}
                >
                  {showMore ? (
                    <>
                      {isRTL ? 'إخفاء' : 'Show less'}
                      <ChevronUp className="w-4 h-4 ml-1" />
                    </>
                  ) : (
                    <>
                      {isRTL 
                        ? `المزيد من الفرص (${secondaryActions.length})` 
                        : `More opportunities (${secondaryActions.length})`}
                      <ChevronDown className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>

                {showMore && (
                  <div className="space-y-2">
                    {secondaryActions.map((action) => (
                      <OptimizerActionCard key={action.id} action={action} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </section>

      {/* Trust line */}
      <p className={cn(
        "text-xs text-muted-foreground mt-6 text-center",
        isRTL && "text-right"
      )}>
        {isRTL 
          ? 'الحسابات مبنية على بيانات مزاياك والسياسات الحالية' 
          : 'Calculations based on your benefit data and current policies'}
        {isDemoMode && (
          <span className="text-muted-foreground/50"> (Demo)</span>
        )}
      </p>
    </PageLayout>
  );
}
