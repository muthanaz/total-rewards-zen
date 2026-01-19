import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Lightbulb,
  ArrowRight,
  Clock,
  User,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Calendar,
  CheckCircle2,
  Pause,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface ActionItem {
  id: string;
  title: string;
  insight: string;
  expectedImpact: {
    type: 'savings' | 'efficiency' | 'engagement';
    value: string;
  };
  owner: string;
  ownerType: 'admin' | 'hr' | 'vendor';
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'blocked' | 'completed';
  blockedBy?: string;
  progress: number;
}

const actionItems: ActionItem[] = [
  {
    id: 'a1',
    title: 'Review low-performing vendors',
    insight: '12 vendors have < 10% conversion rate',
    expectedImpact: { type: 'engagement', value: '+15% platform engagement' },
    owner: 'Platform Team',
    ownerType: 'admin',
    dueDate: '2026-01-25',
    priority: 'high',
    status: 'in_progress',
    progress: 40,
  },
  {
    id: 'a2',
    title: 'Fix orphaned entitlement records',
    insight: '47 benefit entitlements lack valid user references',
    expectedImpact: { type: 'efficiency', value: '2 days saved in reconciliation' },
    owner: 'Data Team',
    ownerType: 'admin',
    dueDate: '2026-01-22',
    priority: 'high',
    status: 'blocked',
    blockedBy: 'Awaiting HRIS data refresh',
    progress: 20,
  },
  {
    id: 'a3',
    title: 'Expand wellness vendor category',
    insight: 'Wellness offers have 25% higher engagement than average',
    expectedImpact: { type: 'savings', value: 'AED 120K additional GMV' },
    owner: 'Partnerships',
    ownerType: 'admin',
    dueDate: '2026-02-15',
    priority: 'medium',
    status: 'pending',
    progress: 0,
  },
  {
    id: 'a4',
    title: 'Audit Qatar region benchmarks',
    insight: 'Sample size (850) below confidence threshold for 3 metrics',
    expectedImpact: { type: 'efficiency', value: 'Accurate regional insights' },
    owner: 'Analytics Team',
    ownerType: 'admin',
    dueDate: '2026-01-30',
    priority: 'medium',
    status: 'in_progress',
    progress: 65,
  },
  {
    id: 'a5',
    title: 'Onboard 5 new health vendors',
    insight: 'Health category has 35% supply gap vs demand signals',
    expectedImpact: { type: 'savings', value: 'AED 80K potential GMV' },
    owner: 'Vendor Ops',
    ownerType: 'admin',
    dueDate: '2026-02-28',
    priority: 'low',
    status: 'pending',
    progress: 0,
  },
];

const priorityConfig = {
  high: { label: 'High', color: 'bg-destructive/10 text-destructive border-destructive/20' },
  medium: { label: 'Medium', color: 'bg-warning/10 text-warning border-warning/20' },
  low: { label: 'Low', color: 'bg-muted text-muted-foreground border-border' },
};

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, color: 'text-muted-foreground' },
  in_progress: { label: 'In Progress', icon: TrendingUp, color: 'text-accent' },
  blocked: { label: 'Blocked', icon: Pause, color: 'text-destructive' },
  completed: { label: 'Completed', icon: CheckCircle2, color: 'text-success' },
};

const impactIcons = {
  savings: DollarSign,
  efficiency: Clock,
  engagement: TrendingUp,
};

export function AdminActionCenter() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const actionsByStatus = {
    blocked: actionItems.filter(a => a.status === 'blocked'),
    inProgress: actionItems.filter(a => a.status === 'in_progress'),
    pending: actionItems.filter(a => a.status === 'pending'),
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{actionsByStatus.blocked.length}</p>
                <p className="text-xs text-muted-foreground">{t('Blocked', 'محظور')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <div className="p-2 rounded-lg bg-accent/10">
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{actionsByStatus.inProgress.length}</p>
                <p className="text-xs text-muted-foreground">{t('In Progress', 'قيد التنفيذ')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <div className="p-2 rounded-lg bg-muted">
                <Clock className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{actionsByStatus.pending.length}</p>
                <p className="text-xs text-muted-foreground">{t('Pending', 'معلق')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <div className="p-2 rounded-lg bg-success/10">
                <Target className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">AED 200K</p>
                <p className="text-xs text-muted-foreground">{t('Potential Impact', 'التأثير المحتمل')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Queue */}
      <Card>
        <CardHeader className="pb-3">
          <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
            <div>
              <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <Lightbulb className="w-5 h-5 text-accent" />
                {t('Insight → Action Queue', 'قائمة الرؤى → الإجراءات')}
              </CardTitle>
              <CardDescription>
                {t('Data-driven actions prioritized by impact', 'إجراءات مبنية على البيانات مرتبة حسب التأثير')}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              {t('View All', 'عرض الكل')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {actionItems.map((action) => {
              const StatusIcon = statusConfig[action.status].icon;
              const ImpactIcon = impactIcons[action.expectedImpact.type];
              
              return (
                <div 
                  key={action.id}
                  className={cn(
                    "p-4 rounded-xl border border-border/60 hover:border-accent/30 hover:bg-muted/30 transition-all",
                    action.status === 'blocked' && "border-destructive/30 bg-destructive/5",
                    isRTL && "text-right"
                  )}
                >
                  <div className={cn("flex items-start justify-between gap-4", isRTL && "flex-row-reverse")}>
                    <div className="flex-1">
                      <div className={cn("flex items-center gap-2 flex-wrap", isRTL && "flex-row-reverse")}>
                        <Badge variant="outline" className={priorityConfig[action.priority].color}>
                          {priorityConfig[action.priority].label}
                        </Badge>
                        <div className={cn("flex items-center gap-1", statusConfig[action.status].color)}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">{statusConfig[action.status].label}</span>
                        </div>
                      </div>
                      
                      <h4 className="font-semibold mt-2">{action.title}</h4>
                      
                      <div className={cn("flex items-center gap-1 mt-1 text-xs text-muted-foreground", isRTL && "flex-row-reverse")}>
                        <Lightbulb className="w-3 h-3" />
                        <span>{action.insight}</span>
                      </div>
                      
                      {action.status === 'blocked' && action.blockedBy && (
                        <div className={cn("flex items-center gap-1 mt-2 text-xs text-destructive", isRTL && "flex-row-reverse")}>
                          <AlertTriangle className="w-3 h-3" />
                          <span>{action.blockedBy}</span>
                        </div>
                      )}
                      
                      <div className={cn("flex items-center gap-4 mt-3 text-xs", isRTL && "flex-row-reverse")}>
                        <div className={cn("flex items-center gap-1 text-muted-foreground", isRTL && "flex-row-reverse")}>
                          <User className="w-3 h-3" />
                          <span>{action.owner}</span>
                        </div>
                        <div className={cn("flex items-center gap-1 text-muted-foreground", isRTL && "flex-row-reverse")}>
                          <Calendar className="w-3 h-3" />
                          <span>{t('Due:', 'الاستحقاق:')} {action.dueDate}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className={cn("text-right min-w-[140px]", isRTL && "text-left")}>
                      <div className={cn("flex items-center gap-1 justify-end text-sm font-medium text-accent", isRTL && "flex-row-reverse justify-start")}>
                        <ImpactIcon className="w-3.5 h-3.5" />
                        <span>{action.expectedImpact.value}</span>
                      </div>
                      
                      {action.status !== 'pending' && action.status !== 'completed' && (
                        <div className="mt-3">
                          <div className={cn("flex items-center justify-between text-xs mb-1", isRTL && "flex-row-reverse")}>
                            <span className="text-muted-foreground">{t('Progress', 'التقدم')}</span>
                            <span className="font-medium">{action.progress}%</span>
                          </div>
                          <Progress value={action.progress} className="h-1.5" />
                        </div>
                      )}
                      
                      <Button variant="ghost" size="sm" className="mt-2 gap-1 text-xs">
                        {t('Take Action', 'اتخاذ إجراء')}
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
