import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, DollarSign, TrendingUp, TrendingDown, Smile, 
  Recycle, FileCheck, Target, ArrowRight, AlertTriangle, 
  CheckCircle2, Sparkles, Zap, Clock, ExternalLink 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChartContainer, AnimatedLineChart, ProgressBarList } from '@/components/charts';
import { useElementVisibility } from '@/contexts/UIVisibilityContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const metrics = {
  totalEmployees: 156,
  employeeChange: 8,
  annualBudget: 62000000,
  budgetUsed: 39680000,
  budgetRemaining: 22320000,
  utilizationRate: 64,
  utilizationTarget: 75,
  satisfactionScore: 4.2,
  retentionRate: 92,
  wasteSpend: 8500000,
  wasteRecoveryPotential: 5100000,
  pendingClaims: 12,
  avgProcessingDays: 2.3,
  slaTarget: 3,
};

// Urgent actions that need attention
const urgentActions = [
  { 
    id: 1, 
    type: 'claims', 
    title: '12 claims pending review', 
    subtitle: 'Avg wait: 2.3 days (SLA: 3 days)',
    icon: FileCheck,
    color: 'amber',
    link: '/employer/claims',
    urgent: true,
  },
  { 
    id: 2, 
    type: 'waste', 
    title: 'AED 8.5M waste identified', 
    subtitle: 'AED 5.1M recoverable this quarter',
    icon: Recycle,
    color: 'amber',
    link: '/employer/zombie',
    urgent: true,
  },
  { 
    id: 3, 
    type: 'utilization', 
    title: 'Utilization at 64%', 
    subtitle: '11% below 75% target',
    icon: TrendingUp,
    color: 'blue',
    link: '/employer/spend',
    urgent: false,
  },
];

// Smart recommendations with ROI
const smartRecommendations = [
  { 
    title: 'Boost L&D communication', 
    impact: 'Could save AED 2.8M',
    roi: '3.2x',
    effort: 'low',
  },
  { 
    title: 'Simplify wellbeing claims', 
    impact: 'Could increase usage by 25%',
    roi: '2.1x',
    effort: 'medium',
  },
  { 
    title: 'Launch flex benefits pilot', 
    impact: 'Improve satisfaction 15%',
    roi: '2.8x',
    effort: 'high',
  },
];

const utilizationTrend = [
  { name: 'Jul', value: 58 },
  { name: 'Aug', value: 59 },
  { name: 'Sep', value: 61 },
  { name: 'Oct', value: 60 },
  { name: 'Nov', value: 63 },
  { name: 'Dec', value: 64 },
];

const topBenefits = [
  { name: 'Housing Allowance', value: 95 },
  { name: 'Health Insurance', value: 78 },
  { name: 'Transport Allowance', value: 72 },
];

const bottomBenefits = [
  { name: 'Learning & Development', value: 38 },
  { name: 'Wellbeing Program', value: 45 },
  { name: 'Financial Planning', value: 52 },
];

export default function EmployerDashboard() {
  const { t, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  
  const formatCurrency = (value: number) => `AED ${(value / 1000000).toFixed(1)}M`;
  const budgetUtilization = (metrics.budgetUsed / metrics.annualBudget) * 100;
  
  // UI Visibility hooks
  const { isVisible: showAlerts } = useElementVisibility('employer', 'dashboard', 'alerts');
  const { isVisible: showFinancialSummary } = useElementVisibility('employer', 'dashboard', 'financial_summary');
  const { isVisible: showActionMatrix } = useElementVisibility('employer', 'dashboard', 'action_matrix');
  const { isVisible: showTeamHealth } = useElementVisibility('employer', 'dashboard', 'team_health');
  const { isVisible: showUtilizationSnapshot } = useElementVisibility('employer', 'dashboard', 'utilization_snapshot');

  const getEffortBadge = (effort: string) => {
    const styles = {
      low: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      medium: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      high: 'bg-red-500/10 text-red-600 border-red-500/20',
    };
    return <Badge variant="outline" className={cn("text-[10px]", styles[effort as keyof typeof styles])}>{effort} effort</Badge>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Executive Header */}
      <div className={cn(
        "flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4",
        isRTL && "lg:flex-row-reverse"
      )}>
        <div className={cn("space-y-1", isRTL && "text-right")}>
          <h1 className="text-2xl lg:text-3xl font-display font-bold tracking-tight">
            {t('employer.dashboard.title')}
          </h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {t('employer.dashboard.subtitle')} • December 2024
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn(
            "px-3 py-1",
            metrics.utilizationRate >= 70 
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
              : "bg-amber-500/10 text-amber-600 border-amber-500/20"
          )}>
            {metrics.utilizationRate >= 70 ? (
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
            )}
            Program Health: {metrics.utilizationRate >= 70 ? 'Good' : 'Needs Attention'}
          </Badge>
        </div>
      </div>

      {/* Hero Alert Bar */}
      {showAlerts && urgentActions.filter(a => a.urgent).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {urgentActions.filter(a => a.urgent).map((action) => (
            <Link key={action.id} to={action.link}>
              <div className={cn(
                "p-4 rounded-xl border transition-all duration-300 cursor-pointer hover:scale-[1.01]",
                action.color === 'amber' 
                  ? "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40" 
                  : "bg-blue-500/5 border-blue-500/20 hover:border-blue-500/40"
              )}>
                <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                  <div className={cn(
                    "p-2 rounded-lg",
                    action.color === 'amber' ? "bg-amber-500/10" : "bg-blue-500/10"
                  )}>
                    <action.icon className={cn(
                      "w-5 h-5",
                      action.color === 'amber' ? "text-amber-500" : "text-blue-500"
                    )} />
                  </div>
                  <div className={cn("flex-1", isRTL && "text-right")}>
                    <p className="font-semibold text-sm">{action.title}</p>
                    <p className="text-xs text-muted-foreground">{action.subtitle}</p>
                  </div>
                  <ArrowRight className={cn("w-4 h-4 text-muted-foreground", isRTL && "rotate-180")} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Financial Health Summary */}
      {showFinancialSummary && (
        <Card className="border-border/50 bg-gradient-to-br from-card via-card to-primary/5">
          <CardContent className="p-6">
            <div className={cn("flex items-center gap-2 mb-4", isRTL && "flex-row-reverse")}>
              <DollarSign className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold text-lg">Financial Health Summary</h2>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className={cn("space-y-1", isRTL && "text-right")}>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Annual Budget</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.annualBudget)}</p>
              </div>
              <div className={cn("space-y-1", isRTL && "text-right")}>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Spent YTD</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(metrics.budgetUsed)}</p>
              </div>
              <div className={cn("space-y-1", isRTL && "text-right")}>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Remaining</p>
                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(metrics.budgetRemaining)}</p>
              </div>
              <div className={cn("space-y-1", isRTL && "text-right")}>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Utilization</p>
                <div className="flex items-baseline gap-2">
                  <p className={cn(
                    "text-2xl font-bold",
                    metrics.utilizationRate >= metrics.utilizationTarget ? "text-emerald-600" : "text-amber-600"
                  )}>
                    {metrics.utilizationRate}%
                  </p>
                  <span className="text-xs text-muted-foreground">/ {metrics.utilizationTarget}% target</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className={cn("flex justify-between text-xs", isRTL && "flex-row-reverse")}>
                <span className="text-muted-foreground">Budget Progress</span>
                <span className="font-medium">{budgetUtilization.toFixed(0)}% deployed</span>
              </div>
              <Progress value={budgetUtilization} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Priority Matrix */}
      {showActionMatrix && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Urgent Actions */}
          <Card className="border-amber-500/20 bg-gradient-to-br from-card to-amber-500/5">
            <CardHeader className="pb-3">
              <CardTitle className={cn(
                "text-base font-display font-semibold flex items-center gap-2",
                isRTL && "flex-row-reverse"
              )}>
                <Zap className="w-4 h-4 text-amber-500" />
                Action Required
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {urgentActions.map((action) => (
                <Link key={action.id} to={action.link}>
                  <div className={cn(
                    "p-3 rounded-lg border border-border/50 bg-card hover:bg-accent/5 transition-colors cursor-pointer group",
                    "flex items-center gap-3",
                    isRTL && "flex-row-reverse"
                  )}>
                    <div className={cn(
                      "p-2 rounded-lg shrink-0",
                      action.color === 'amber' ? "bg-amber-500/10" : "bg-blue-500/10"
                    )}>
                      <action.icon className={cn(
                        "w-4 h-4",
                        action.color === 'amber' ? "text-amber-500" : "text-blue-500"
                      )} />
                    </div>
                    <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
                      <p className="text-sm font-medium truncate">{action.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{action.subtitle}</p>
                    </div>
                    <ExternalLink className={cn(
                      "w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0",
                      isRTL && "rotate-180"
                    )} />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Smart Recommendations */}
          <Card className="border-emerald-500/20 bg-gradient-to-br from-card to-emerald-500/5">
            <CardHeader className="pb-3">
              <CardTitle className={cn(
                "text-base font-display font-semibold flex items-center gap-2",
                isRTL && "flex-row-reverse"
              )}>
                <Sparkles className="w-4 h-4 text-emerald-500" />
                Smart Recommendations
                <Badge variant="outline" className="ml-auto text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                  AI Powered
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {smartRecommendations.map((rec, idx) => (
                <div 
                  key={idx}
                  className={cn(
                    "p-3 rounded-lg border border-border/50 bg-card hover:bg-accent/5 transition-colors cursor-pointer",
                    isRTL && "text-right"
                  )}
                >
                  <div className={cn("flex items-start justify-between gap-2", isRTL && "flex-row-reverse")}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{rec.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{rec.impact}</p>
                    </div>
                    <div className={cn("flex items-center gap-2 shrink-0", isRTL && "flex-row-reverse")}>
                      <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                        {rec.roi} ROI
                      </Badge>
                      {getEffortBadge(rec.effort)}
                    </div>
                  </div>
                </div>
              ))}
              <Link to="/employer/recommendations">
                <Button variant="ghost" size="sm" className="w-full text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10">
                  View All Recommendations <ArrowRight className={cn("w-4 h-4 ml-1", isRTL && "rotate-180 mr-1 ml-0")} />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Team Health Indicators */}
      {showTeamHealth && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Employees */}
          <Card className="border-border/50 hover:shadow-md transition-all duration-300">
            <CardContent className="p-4">
              <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div className={cn("min-w-0 flex-1", isRTL && "text-right")}>
                  <p className="text-2xl font-bold tracking-tight">{metrics.totalEmployees}</p>
                  <p className="text-xs text-muted-foreground">Total Employees</p>
                </div>
              </div>
              <div className={cn("mt-3 flex items-center gap-1 text-xs", isRTL && "flex-row-reverse")}>
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                <span className="text-emerald-600 font-medium">+{metrics.employeeChange}</span>
                <span className="text-muted-foreground">YTD</span>
              </div>
            </CardContent>
          </Card>

          {/* Satisfaction */}
          <Card className="border-border/50 hover:shadow-md transition-all duration-300">
            <CardContent className="p-4">
              <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                <div className="p-2.5 rounded-xl bg-violet-500/10 shrink-0">
                  <Smile className="w-5 h-5 text-violet-500" />
                </div>
                <div className={cn("min-w-0 flex-1", isRTL && "text-right")}>
                  <p className="text-2xl font-bold tracking-tight">{metrics.satisfactionScore}<span className="text-base text-muted-foreground font-normal">/5</span></p>
                  <p className="text-xs text-muted-foreground">Satisfaction</p>
                </div>
              </div>
              <div className="mt-3 flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div 
                    key={star} 
                    className={`h-1.5 flex-1 rounded-full ${star <= Math.round(metrics.satisfactionScore) ? 'bg-violet-500' : 'bg-muted'}`} 
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Retention */}
          <Card className="border-border/50 hover:shadow-md transition-all duration-300">
            <CardContent className="p-4">
              <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                <div className="p-2.5 rounded-xl bg-emerald-500/10 shrink-0">
                  <Target className="w-5 h-5 text-emerald-500" />
                </div>
                <div className={cn("min-w-0 flex-1", isRTL && "text-right")}>
                  <p className="text-2xl font-bold tracking-tight text-emerald-600">{metrics.retentionRate}%</p>
                  <p className="text-xs text-muted-foreground">Retention Rate</p>
                </div>
              </div>
              <div className="mt-3">
                <Progress value={metrics.retentionRate} className="h-1.5 [&>div]:bg-emerald-500" />
              </div>
            </CardContent>
          </Card>

          {/* Pending Claims */}
          <Link to="/employer/claims">
            <Card className="border-amber-500/20 hover:shadow-md transition-all duration-300 cursor-pointer hover:border-amber-500/40">
              <CardContent className="p-4">
                <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                  <div className="p-2.5 rounded-xl bg-amber-500/10 shrink-0">
                    <FileCheck className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className={cn("min-w-0 flex-1", isRTL && "text-right")}>
                    <p className="text-2xl font-bold tracking-tight text-amber-600">{metrics.pendingClaims}</p>
                    <p className="text-xs text-muted-foreground">Pending Claims</p>
                  </div>
                </div>
                <div className={cn("mt-3 flex items-center justify-between text-xs", isRTL && "flex-row-reverse")}>
                  <span className="text-muted-foreground">Avg processing</span>
                  <span className={cn(
                    "font-medium",
                    metrics.avgProcessingDays <= metrics.slaTarget ? "text-emerald-600" : "text-amber-600"
                  )}>
                    {metrics.avgProcessingDays} days
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      )}

      {/* Utilization Snapshot */}
      {showUtilizationSnapshot && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Trend Chart */}
          <div className="lg:col-span-1">
            <ChartContainer title="Utilization Trend" formula="6-month trend" dataSource="Analytics">
              <AnimatedLineChart 
                data={utilizationTrend} 
                showArea={true} 
                primaryLabel="Utilization" 
                formatValue={(v) => `${v}%`} 
                height={200} 
                yDomain={[50, 70]} 
              />
            </ChartContainer>
          </div>
          
          {/* Top Benefits */}
          <ChartContainer title="Top Performing">
            <ProgressBarList 
              items={topBenefits.map(b => ({ ...b, color: 'success' as const }))} 
              size="sm" 
            />
          </ChartContainer>
          
          {/* Bottom Benefits */}
          <ChartContainer title="Needs Attention">
            <ProgressBarList 
              items={bottomBenefits.map(b => ({ ...b, color: 'warning' as const }))} 
              size="sm" 
            />
            <Link to="/employer/zombie" className="block mt-3">
              <Button variant="ghost" size="sm" className="w-full text-amber-600 hover:text-amber-700 hover:bg-amber-500/10">
                Explore Recovery Options <ArrowRight className={cn("w-4 h-4 ml-1", isRTL && "rotate-180 mr-1 ml-0")} />
              </Button>
            </Link>
          </ChartContainer>
        </div>
      )}
    </div>
  );
}
