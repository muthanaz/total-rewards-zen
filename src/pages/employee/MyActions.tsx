import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, Clock, FileText, AlertTriangle, User, Gift,
  ChevronRight, HelpCircle, Zap, Calendar, Home, Heart,
  GraduationCap, Car, Dumbbell, BookOpen, LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PageLayout } from '@/components/shared/PageLayout';
import { SectionCard } from '@/components/shared/SectionCard';
import { ZeroState } from '@/components/shared/ZeroState';
import { UniversalConfidenceBadge } from '@/components/shared/UniversalConfidenceBadge';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn, formatCurrencyAED } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

type ActionCategory = 'all' | 'due_soon' | 'missing_docs' | 'profile' | 'eligible' | 'in_review';

interface ActionItem {
  id: string;
  title: string;
  titleAr: string;
  impact: string;
  impactAr: string;
  impactType: 'unlock' | 'avoid' | 'save' | 'due';
  category: ActionCategory;
  dueDate?: string;
  status: 'action_required' | 'in_review' | 'pending';
  route: string;
  policyReason: string;
  policyReasonAr: string;
  priority: number;
  icon: LucideIcon;
}

interface BenefitOpportunity {
  id: string;
  name: string;
  nameAr: string;
  icon: LucideIcon;
  eligible: number;
  used: number;
  pending: number;
  route: string;
}

interface FrictionItem {
  id: string;
  count: number;
  label: string;
  labelAr: string;
  route: string;
  filter?: string;
}

// ============================================================================
// DEMO DATA - Would come from hooks/API in production
// ============================================================================

const demoActions: ActionItem[] = [
  {
    id: '1',
    title: 'Upload missing document',
    titleAr: 'رفع المستند المفقود',
    impact: 'Unlocks AED 8,000',
    impactAr: 'يفتح AED 8,000',
    impactType: 'unlock',
    category: 'missing_docs',
    dueDate: '2026-02-15',
    status: 'action_required',
    route: '/employee/requests',
    policyReason: 'School tuition receipt required per Education Policy §3.2',
    policyReasonAr: 'إيصال الرسوم المدرسية مطلوب حسب سياسة التعليم §3.2',
    priority: 100,
    icon: FileText,
  },
  {
    id: '2',
    title: 'Complete your profile',
    titleAr: 'أكمل ملفك الشخصي',
    impact: 'Avoid rejection',
    impactAr: 'تجنب الرفض',
    impactType: 'avoid',
    category: 'profile',
    status: 'action_required',
    route: '/employee/profile',
    policyReason: 'Emirates ID and emergency contact required for all claims',
    policyReasonAr: 'الهوية الإماراتية وجهة الاتصال الطارئة مطلوبة لجميع المطالبات',
    priority: 90,
    icon: User,
  },
  {
    id: '3',
    title: 'Submit Q2 schooling claim',
    titleAr: 'قدم مطالبة التعليم للربع الثاني',
    impact: 'Unlocks AED 17,000',
    impactAr: 'يفتح AED 17,000',
    impactType: 'unlock',
    category: 'eligible',
    dueDate: '2026-06-30',
    status: 'action_required',
    route: '/employee/schooling',
    policyReason: 'Education allowance: AED 17,000 remaining this year',
    policyReasonAr: 'بدل التعليم: AED 17,000 متبقي هذا العام',
    priority: 80,
    icon: GraduationCap,
  },
  {
    id: '4',
    title: 'Claim is waiting for you',
    titleAr: 'المطالبة بانتظارك',
    impact: 'Due soon',
    impactAr: 'موعد قريب',
    impactType: 'due',
    category: 'due_soon',
    dueDate: '2026-01-28',
    status: 'action_required',
    route: '/employee/requests',
    policyReason: 'HR requested additional information for transport claim #TR-2024-089',
    policyReasonAr: 'طلبت الموارد البشرية معلومات إضافية للمطالبة #TR-2024-089',
    priority: 95,
    icon: Clock,
  },
  {
    id: '5',
    title: "You're eligible — activate gym benefit",
    titleAr: 'أنت مؤهل — فعّل ميزة النادي',
    impact: 'Saves AED 2,800',
    impactAr: 'يوفر AED 2,800',
    impactType: 'save',
    category: 'eligible',
    status: 'action_required',
    route: '/employee/wellbeing',
    policyReason: 'Wellbeing budget: AED 2,800 available for gym membership',
    policyReasonAr: 'ميزانية الرفاهية: AED 2,800 متاحة لعضوية النادي',
    priority: 60,
    icon: Dumbbell,
  },
  {
    id: '6',
    title: 'Learning course reimbursement',
    titleAr: 'استرداد دورة التعلم',
    impact: 'In review',
    impactAr: 'قيد المراجعة',
    impactType: 'due',
    category: 'in_review',
    status: 'in_review',
    route: '/employee/requests',
    policyReason: 'Submitted Jan 15, expected decision by Jan 25',
    policyReasonAr: 'تم التقديم في 15 يناير، القرار المتوقع بحلول 25 يناير',
    priority: 40,
    icon: BookOpen,
  },
];

const demoBenefitOpportunities: BenefitOpportunity[] = [
  { id: 'schooling', name: 'Education', nameAr: 'التعليم', icon: GraduationCap, eligible: 60000, used: 35000, pending: 8000, route: '/employee/schooling' },
  { id: 'learning', name: 'Learning', nameAr: 'التعلم', icon: BookOpen, eligible: 12000, used: 4500, pending: 0, route: '/employee/learning' },
  { id: 'wellbeing', name: 'Wellbeing', nameAr: 'الرفاهية', icon: Dumbbell, eligible: 6000, used: 3200, pending: 0, route: '/employee/wellbeing' },
  { id: 'health', name: 'Health', nameAr: 'الصحة', icon: Heart, eligible: 5000, used: 1500, pending: 0, route: '/employee/health' },
];

const demoFrictionItems: FrictionItem[] = [
  { id: '1', count: 2, label: 'requests delayed by missing docs', labelAr: 'طلبات متأخرة بسبب مستندات ناقصة', route: '/employee/requests', filter: 'missing_docs' },
  { id: '2', count: 3, label: 'items blocked by incomplete profile', labelAr: 'عناصر محظورة بسبب ملف غير مكتمل', route: '/employee/profile' },
  { id: '3', count: 1, label: 'claim rejected recently — tap to learn why', labelAr: 'مطالبة مرفوضة مؤخراً — انقر لمعرفة السبب', route: '/employee/requests', filter: 'rejected' },
];

// ============================================================================
// FILTER TABS
// ============================================================================

const filterTabs: { id: ActionCategory; label: string; labelAr: string }[] = [
  { id: 'all', label: 'All', labelAr: 'الكل' },
  { id: 'due_soon', label: 'Due soon', labelAr: 'قريب' },
  { id: 'missing_docs', label: 'Missing docs', labelAr: 'مستندات ناقصة' },
  { id: 'profile', label: 'Profile', labelAr: 'الملف' },
  { id: 'eligible', label: 'Eligible now', labelAr: 'مؤهل الآن' },
  { id: 'in_review', label: 'In review', labelAr: 'قيد المراجعة' },
];

// ============================================================================
// COMPONENT
// ============================================================================

export default function MyActions() {
  const navigate = useNavigate();
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  
  const [activeFilter, setActiveFilter] = useState<ActionCategory>('all');
  const [visibleCount, setVisibleCount] = useState(5);

  // Filter and sort actions
  const filteredActions = useMemo(() => {
    let actions = [...demoActions];
    
    if (activeFilter !== 'all') {
      actions = actions.filter(a => a.category === activeFilter);
    }
    
    // Sort by priority (higher first)
    return actions.sort((a, b) => b.priority - a.priority);
  }, [activeFilter]);

  const displayedActions = filteredActions.slice(0, visibleCount);
  const hasMore = filteredActions.length > visibleCount;

  // Impact badge styling
  const getImpactStyle = (type: ActionItem['impactType']) => {
    switch (type) {
      case 'unlock': return 'bg-success/10 text-success border-success/20';
      case 'avoid': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'save': return 'bg-accent/10 text-accent border-accent/20';
      case 'due': return 'bg-warning/10 text-warning border-warning/20';
    }
  };

  // Status badge
  const getStatusStyle = (status: ActionItem['status']) => {
    switch (status) {
      case 'action_required': return 'bg-warning/10 text-warning border-warning/20';
      case 'in_review': return 'bg-info/10 text-info border-info/20';
      case 'pending': return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusLabel = (status: ActionItem['status']) => {
    if (isRTL) {
      switch (status) {
        case 'action_required': return 'إجراء مطلوب';
        case 'in_review': return 'قيد المراجعة';
        case 'pending': return 'معلق';
      }
    }
    switch (status) {
      case 'action_required': return 'Action required';
      case 'in_review': return 'In review';
      case 'pending': return 'Pending';
    }
  };

  // Format due date
  const formatDueDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const days = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (days < 0) return isRTL ? 'متأخر' : 'Overdue';
    if (days === 0) return isRTL ? 'اليوم' : 'Today';
    if (days === 1) return isRTL ? 'غداً' : 'Tomorrow';
    if (days < 7) return isRTL ? `${days} أيام` : `${days} days`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <PageLayout
      title={isRTL ? 'إجراءاتي' : 'My Actions'}
      description={isRTL ? 'خطوات واضحة لاستخدام مزاياك بسلاسة' : 'Clear next steps to use your benefits smoothly'}
      icon={Zap}
      iconClassName="bg-accent/10 text-accent"
    >
      {/* A) Action Inbox - Primary Section */}
      <section className="space-y-4">
        {/* Filter Tabs */}
        <div className={cn(
          "flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide",
          isRTL && "flex-row-reverse"
        )}>
          {filterTabs.map((tab) => {
            const count = tab.id === 'all' 
              ? demoActions.length 
              : demoActions.filter(a => a.category === tab.id).length;
            
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
                  setVisibleCount(5);
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
        {displayedActions.length === 0 ? (
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
          <div className="space-y-2">
            {displayedActions.map((action) => (
              <Card
                key={action.id}
                className={cn(
                  "border-border/50 hover:border-accent/30 hover:shadow-sm transition-all cursor-pointer group",
                  action.status === 'action_required' && "border-l-2 border-l-warning"
                )}
                onClick={() => navigate(action.route)}
              >
                <CardContent className="p-4">
                  <div className={cn("flex items-start gap-4", isRTL && "flex-row-reverse")}>
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <action.icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    
                    {/* Content */}
                    <div className={cn("flex-1 min-w-0 space-y-1", isRTL && "text-right")}>
                      <div className={cn("flex items-center gap-2 flex-wrap", isRTL && "flex-row-reverse justify-end")}>
                        <h3 className="font-medium text-sm">
                          {isRTL ? action.titleAr : action.title}
                        </h3>
                        <Badge variant="outline" className={cn("text-[10px] px-1.5", getImpactStyle(action.impactType))}>
                          {isRTL ? action.impactAr : action.impact}
                        </Badge>
                      </div>
                      
                      <div className={cn("flex items-center gap-2 text-xs text-muted-foreground", isRTL && "flex-row-reverse justify-end")}>
                        <Badge variant="outline" className={cn("text-[10px] px-1.5", getStatusStyle(action.status))}>
                          {getStatusLabel(action.status)}
                        </Badge>
                        {action.dueDate && (
                          <>
                            <span>•</span>
                            <span className={cn(
                              "flex items-center gap-1",
                              isRTL && "flex-row-reverse"
                            )}>
                              <Calendar className="w-3 h-3" />
                              {formatDueDate(action.dueDate)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className={cn("flex items-center gap-2 shrink-0", isRTL && "flex-row-reverse")}>
                      {/* Why? Popover */}
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
                          <p className={cn("text-muted-foreground", isRTL && "text-right")}>
                            {isRTL ? action.policyReasonAr : action.policyReason}
                          </p>
                        </PopoverContent>
                      </Popover>
                      
                      {/* Fix now button */}
                      <Button
                        size="sm"
                        className="h-8 text-xs gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(action.route);
                        }}
                      >
                        {isRTL ? 'إصلاح الآن' : 'Fix now'}
                        <ChevronRight className={cn("w-3 h-3", isRTL && "rotate-180")} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Show more */}
            {hasMore && (
              <Button
                variant="ghost"
                className="w-full text-muted-foreground hover:text-foreground"
                onClick={() => setVisibleCount(prev => prev + 5)}
              >
                {isRTL ? `عرض المزيد (${filteredActions.length - visibleCount} متبقي)` : `Show more (${filteredActions.length - visibleCount} remaining)`}
              </Button>
            )}
          </div>
        )}
      </section>

      {/* B) Benefit Opportunities - Secondary Section */}
      <SectionCard
        title={isRTL ? 'فرص المزايا' : 'Benefit Opportunities'}
        description={isRTL ? 'القيمة غير المطالب بها حسب المجال' : 'Unclaimed value by life area'}
        icon={Gift}
        badge={<UniversalConfidenceBadge confidence="high" size="sm" />}
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {demoBenefitOpportunities.map((benefit) => {
            const remaining = benefit.eligible - benefit.used - benefit.pending;
            const utilizationPct = Math.round(((benefit.used + benefit.pending) / benefit.eligible) * 100);
            
            return (
              <Card
                key={benefit.id}
                className="border-border/40 hover:border-accent/30 cursor-pointer transition-all group"
                onClick={() => navigate(benefit.route)}
              >
                <CardContent className="p-4">
                  <div className={cn("flex items-center gap-2 mb-3", isRTL && "flex-row-reverse")}>
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <benefit.icon className="w-4 h-4 text-accent" />
                    </div>
                    <span className="font-medium text-sm truncate">
                      {isRTL ? benefit.nameAr : benefit.name}
                    </span>
                  </div>
                  
                  <div className={cn("space-y-1", isRTL && "text-right")}>
                    <p className="text-lg font-bold text-foreground">
                      {formatCurrencyAED(remaining, { abbreviate: false })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isRTL ? 'متبقي' : 'remaining'} • {utilizationPct}% {isRTL ? 'مستخدم' : 'used'}
                    </p>
                  </div>
                  
                  {benefit.pending > 0 && (
                    <Badge variant="outline" className="mt-2 text-[10px] bg-warning/10 text-warning border-warning/20">
                      {formatCurrencyAED(benefit.pending, { abbreviate: false })} {isRTL ? 'معلق' : 'pending'}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </SectionCard>

      {/* C) Friction Summary - Compact */}
      {demoFrictionItems.some(f => f.count > 0) && (
        <Card className="border-border/40 bg-muted/20">
          <CardContent className="p-4">
            <h3 className={cn("text-sm font-medium text-muted-foreground mb-3", isRTL && "text-right")}>
              {isRTL ? 'ملخص المشكلات' : 'Friction Summary'}
            </h3>
            <div className="space-y-2">
              {demoFrictionItems.filter(f => f.count > 0).map((item) => (
                <button
                  key={item.id}
                  className={cn(
                    "w-full flex items-center gap-2 text-sm text-left hover:text-accent transition-colors",
                    isRTL && "flex-row-reverse text-right"
                  )}
                  onClick={() => navigate(item.route)}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0" />
                  <span>
                    <strong>{item.count}</strong> {isRTL ? item.labelAr : item.label}
                  </span>
                  <ChevronRight className={cn("w-3.5 h-3.5 text-muted-foreground ml-auto", isRTL && "rotate-180 mr-auto ml-0")} />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}
