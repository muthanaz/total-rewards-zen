/**
 * My Actions Page
 * 
 * Unified prioritized action list for employees.
 * Merges out-of-pocket optimizer actions with task actions.
 * 
 * Structure:
 * 1. Money Snapshot card at top
 * 2. KPI strip: Reducible Costs, Actions to take, Time estimate
 * 3. Unified prioritized action list with filters
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, Clock, FileText, AlertTriangle, User, Gift,
  ChevronRight, HelpCircle, Zap, Calendar, Home, Heart,
  GraduationCap, Car, Dumbbell, BookOpen, LucideIcon,
  Wallet, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PageLayout } from '@/components/shared/PageLayout';
import { MoneySnapshotCard } from '@/components/employee/MoneySnapshotCard';
import { ConfidenceBadge } from '@/components/shared/ConfidenceBadge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { 
  computeOutOfPocketOpportunities,
  getTimeframeLabel,
  getConfidenceLabel,
  getPriorityStyle,
  getStatusStyle,
  type OptimizerAction,
  type ActionPriority,
} from '@/lib/optimizer/computeOutOfPocketOpportunities';
import { DEMO_FALLBACKS } from '@/lib/metrics/computations';

// ============================================================================
// TYPES
// ============================================================================

type ActionFilter = 'all' | 'blockers' | 'claims' | 'offers' | 'profile' | 'in_review';

// ============================================================================
// FILTER TABS
// ============================================================================

const filterTabs: { id: ActionFilter; label: string; labelAr: string }[] = [
  { id: 'all', label: 'All', labelAr: 'الكل' },
  { id: 'blockers', label: 'Blocked', labelAr: 'محظور' },
  { id: 'claims', label: 'Claims', labelAr: 'المطالبات' },
  { id: 'offers', label: 'Offers', labelAr: 'العروض' },
  { id: 'profile', label: 'Setup', labelAr: 'الإعداد' },
];

const MAX_VISIBLE_ACTIONS = 5;

// ============================================================================
// COMPONENT
// ============================================================================

export default function MyActions() {
  const navigate = useNavigate();
  const { language, direction } = useLanguage();
  const { isDemoMode } = useDemoMode();
  const isRTL = direction === 'rtl';
  const lang = isRTL ? 'ar' : 'en';
  
  const [activeFilter, setActiveFilter] = useState<ActionFilter>('all');
  const [showAll, setShowAll] = useState(false);
  const hasLinkedBankCards = false;

  // Get optimizer actions and summary
  const { actions: optimizerActions, summary } = useMemo(() => {
    return computeOutOfPocketOpportunities(hasLinkedBankCards);
  }, [hasLinkedBankCards]);

  // Filter actions
  const filteredActions = useMemo(() => {
    if (activeFilter === 'all') return optimizerActions;
    
    return optimizerActions.filter(action => {
      switch (activeFilter) {
        case 'blockers':
          return action.status === 'blocked' || action.priority === 'critical';
        case 'claims':
          return action.actionType === 'submit_claim' || action.actionType === 'upload_docs';
        case 'offers':
          return action.actionType === 'redeem_offer';
        case 'profile':
          return action.actionType === 'link_card' || action.category === 'Setup';
        case 'in_review':
          return action.status === 'in_progress';
        default:
          return true;
      }
    });
  }, [optimizerActions, activeFilter]);

  const visibleActions = showAll ? filteredActions : filteredActions.slice(0, MAX_VISIBLE_ACTIONS);
  const hiddenCount = filteredActions.length - MAX_VISIBLE_ACTIONS;

  // Get filter counts
  const getFilterCount = (filter: ActionFilter): number => {
    if (filter === 'all') return optimizerActions.length;
    return optimizerActions.filter(action => {
      switch (filter) {
        case 'blockers':
          return action.status === 'blocked' || action.priority === 'critical';
        case 'claims':
          return action.actionType === 'submit_claim' || action.actionType === 'upload_docs';
        case 'offers':
          return action.actionType === 'redeem_offer';
        case 'profile':
          return action.actionType === 'link_card' || action.category === 'Setup';
        case 'in_review':
          return action.status === 'in_progress';
        default:
          return true;
      }
    }).length;
  };

  return (
    <PageLayout
      title={isRTL ? 'إجراءاتي' : 'My Actions'}
      description={isRTL ? 'إجراءات ذات أولوية لتقليل تكاليفك' : 'Prioritized actions to reduce your costs'}
      icon={Zap}
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

      {/* Filter Tabs */}
      <div className={cn(
        "flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide",
        isRTL && "flex-row-reverse"
      )}>
        {filterTabs.map((tab) => {
          const count = getFilterCount(tab.id);
          
          return (
            <Button
              key={tab.id}
              variant={activeFilter === tab.id ? 'default' : 'outline'}
              size="sm"
              className={cn(
                "shrink-0 h-8 text-xs gap-1.5",
                activeFilter === tab.id && "bg-accent text-accent-foreground"
              )}
              onClick={() => {
                setActiveFilter(tab.id);
                setShowAll(false);
              }}
            >
              {isRTL ? tab.labelAr : tab.label}
              {count > 0 && (
                <Badge variant="secondary" className="h-4 px-1.5 text-[10px] bg-background/20">
                  {count}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>

      {/* Action List */}
      <section className="space-y-2">
        {filteredActions.length === 0 ? (
          <Card className="border-success/20 bg-success/5">
            <CardContent className="p-6">
              <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-success" />
                </div>
                <div className={cn(isRTL && "text-right")}>
                  <h3 className="font-semibold">
                    {isRTL ? 'أنت على المسار الصحيح!' : "You're all caught up!"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? 'لا توجد إجراءات معلقة في هذه الفئة' : 'No pending actions in this category'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-2">
              {visibleActions.map((action) => (
                <ActionCard 
                  key={action.id} 
                  action={action} 
                  isRTL={isRTL}
                  lang={lang}
                  onNavigate={() => navigate(action.route)}
                />
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

// ============================================================================
// ACTION CARD COMPONENT
// ============================================================================

interface ActionCardProps {
  action: OptimizerAction;
  isRTL: boolean;
  lang: 'en' | 'ar';
  onNavigate: () => void;
}

function ActionCard({ action, isRTL, lang, onNavigate }: ActionCardProps) {
  const Icon = action.icon;
  const priorityStyle = getPriorityStyle(action.priority);
  const statusStyle = getStatusStyle(action.status);

  const getStatusLabel = () => {
    const labels = {
      action_required: { en: 'Action required', ar: 'إجراء مطلوب' },
      pending: { en: 'Pending', ar: 'معلق' },
      in_progress: { en: 'In progress', ar: 'قيد التنفيذ' },
      blocked: { en: 'Blocked', ar: 'محظور' },
    };
    return labels[action.status][lang];
  };

  return (
    <Card
      className={cn(
        "border-border/50 hover:border-accent/30 hover:shadow-sm transition-all cursor-pointer group",
        action.status === 'blocked' && "border-l-2 border-l-destructive",
        action.priority === 'critical' && action.status !== 'blocked' && "border-l-2 border-l-warning"
      )}
      onClick={onNavigate}
    >
      <CardContent className="p-4">
        <div className={cn("flex items-start gap-4", isRTL && "flex-row-reverse")}>
          {/* Icon */}
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
            action.priority === 'critical' ? 'bg-destructive/10' :
            action.priority === 'high' ? 'bg-warning/10' :
            'bg-muted'
          )}>
            <Icon className={cn(
              "w-5 h-5",
              action.priority === 'critical' ? 'text-destructive' :
              action.priority === 'high' ? 'text-warning' :
              'text-muted-foreground'
            )} />
          </div>
          
          {/* Content */}
          <div className={cn("flex-1 min-w-0 space-y-1", isRTL && "text-right")}>
            {/* Title + Impact */}
            <div className={cn("flex items-center gap-2 flex-wrap", isRTL && "flex-row-reverse justify-end")}>
              <h3 className="font-medium text-sm">
                {isRTL ? action.titleAr : action.title}
              </h3>
              {action.estimatedImpact !== null && (
                <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-[10px] px-1.5">
                  {isRTL ? action.impactLabelAr : action.impactLabel}
                </Badge>
              )}
              {action.isEducational && (
                <Badge variant="outline" className="bg-info/10 text-info border-info/20 text-[10px] px-1.5">
                  {action.impactLabel}
                </Badge>
              )}
            </div>

            {/* Why it matters */}
            <p className="text-xs text-muted-foreground line-clamp-1">
              {isRTL ? action.whyItMattersAr : action.whyItMatters}
            </p>
            
            {/* Status + Category + Confidence */}
            <div className={cn("flex items-center gap-2 text-xs text-muted-foreground flex-wrap", isRTL && "flex-row-reverse justify-end")}>
              <Badge variant="outline" className={cn("text-[10px] px-1.5", statusStyle)}>
                {getStatusLabel()}
              </Badge>
              <Badge variant="outline" className="text-[10px] px-1.5 bg-muted/50">
                {isRTL ? action.categoryAr : action.category}
              </Badge>
              {action.estimatedImpact !== null && (
                <>
                  <span>•</span>
                  <span className="text-[10px]">
                    {getTimeframeLabel(action.timeframe, lang)} • {getConfidenceLabel(action.confidence, lang)}
                  </span>
                </>
              )}
            </div>

            {/* Prerequisites (if blocked) */}
            {action.prerequisites && action.prerequisites.length > 0 && (
              <div className={cn("flex items-center gap-1 text-[10px] text-destructive mt-1", isRTL && "flex-row-reverse")}>
                <AlertTriangle className="w-3 h-3" />
                <span>
                  {isRTL ? 'مطلوب: ' : 'Needs: '}
                  {(isRTL ? action.prerequisitesAr : action.prerequisites)?.slice(0, 2).join(', ')}
                  {action.prerequisites.length > 2 && ` +${action.prerequisites.length - 2}`}
                </span>
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className={cn("flex items-center gap-2 shrink-0", isRTL && "flex-row-reverse")}>
            {/* How calculated popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  onClick={(e) => e.stopPropagation()}
                >
                  <HelpCircle className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 text-sm" align={isRTL ? "start" : "end"}>
                <p className={cn("font-medium mb-1 text-xs", isRTL && "text-right")}>
                  {isRTL ? 'كيف يتم الحساب' : 'How calculated'}
                </p>
                <p className={cn("text-muted-foreground text-xs", isRTL && "text-right")}>
                  {isRTL ? action.howCalculatedAr : action.howCalculated}
                </p>
              </PopoverContent>
            </Popover>
            
            {/* CTA button */}
            <Button
              size="sm"
              className="h-8 text-xs gap-1"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate();
              }}
            >
              {isRTL ? action.ctaLabelAr : action.ctaLabel}
              <ChevronRight className={cn("w-3 h-3", isRTL && "rotate-180")} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
