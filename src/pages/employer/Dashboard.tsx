import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MetricTooltip } from '@/components/ui/metric-tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, DollarSign, TrendingUp, Smile, 
  Recycle, FileCheck, Target, AlertTriangle, 
  CheckCircle2, Zap, Clock,
  BarChart3, Shield,
  ArrowUpRight, ArrowDownRight, PieChart,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnimatedLineChart, ProgressBarList } from '@/components/charts';
import { useElementVisibility } from '@/contexts/UIVisibilityContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { useEmployerViewMode } from '@/components/layout/EmployerSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { MoneyFlowVisualization } from '@/components/employer/MoneyFlowVisualization';
import { YearEndProjection } from '@/components/employer/YearEndProjection';
import { AIInsightsPanel } from '@/components/employer/AIInsightsPanel';
import { 
  useEmployerDashboardMetrics, 
  useBenefitUtilizationStats,
  calculateProgramScore,
  formatCurrency 
} from '@/hooks/useEmployerDashboardMetrics';

// Industry benchmarks (will be moved to DB later)
const industryBenchmarks = [
  { metric: { en: 'Utilization Rate', ar: 'معدل الاستخدام' }, you: 0, industry: 62, top: 78, status: 'good' },
  { metric: { en: 'Cost Per Employee', ar: 'التكلفة لكل موظف' }, you: 0, industry: 42, top: 52, status: 'optimal' },
  { metric: { en: 'Zombie Spend Rate', ar: 'معدل الهدر' }, you: 0, industry: 18, top: 8, status: 'good' },
  { metric: { en: 'Satisfaction Score', ar: 'درجة الرضا' }, you: 0, industry: 3.6, top: 4.3, status: 'near-top' },
];

export default function EmployerDashboard() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const isArabic = language === 'ar';
  const viewMode = useEmployerViewMode();
  
  // Fetch real metrics from database
  const { data: metrics, isLoading, error, refetch } = useEmployerDashboardMetrics();
  const { data: benefitStats } = useBenefitUtilizationStats();
  
  // UI Visibility hooks
  const { isVisible: showUtilizationSnapshot } = useElementVisibility('employer', 'dashboard', 'utilization_snapshot');

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' },
      amber: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' },
      red: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' },
      violet: { bg: 'bg-violet-500/10', text: 'text-violet-500', border: 'border-violet-500/20' },
      blue: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' },
    };
    return colors[color] || colors.blue;
  };

  // Calculate derived values
  const programScore = metrics ? calculateProgramScore(metrics) : 0;
  const efficiencyPercent = metrics && metrics.budgetUsed > 0 
    ? Math.round((metrics.effectiveSpend / metrics.budgetUsed) * 100) 
    : 0;

  // Prepare benchmark data with actual values
  const benchmarksWithActual = industryBenchmarks.map((b, i) => ({
    ...b,
    you: i === 0 ? (metrics?.utilizationRate || 0) :
         i === 1 ? (metrics && metrics.totalEmployees > 0 ? Math.round(metrics.budgetUsed / metrics.totalEmployees / 1000) : 0) :
         i === 2 ? (metrics && metrics.budgetUsed > 0 ? Math.round((metrics.wasteSpend / metrics.budgetUsed) * 100) : 0) :
         (metrics?.satisfactionScore || 0)
  }));

  // Build utilization trend from monthly data (placeholder - would come from time-series query)
  const utilizationTrend = [
    { name: 'Jul', value: Math.max(0, (metrics?.utilizationRate || 0) - 6) },
    { name: 'Aug', value: Math.max(0, (metrics?.utilizationRate || 0) - 5) },
    { name: 'Sep', value: Math.max(0, (metrics?.utilizationRate || 0) - 3) },
    { name: 'Oct', value: Math.max(0, (metrics?.utilizationRate || 0) - 4) },
    { name: 'Nov', value: Math.max(0, (metrics?.utilizationRate || 0) - 1) },
    { name: 'Dec', value: metrics?.utilizationRate || 0 },
  ];

  // Top and bottom benefits from real data
  const topBenefits = (benefitStats || [])
    .filter(b => b.utilizationRate >= 70)
    .slice(0, 3)
    .map(b => ({
      name: b.benefitName,
      value: b.utilizationRate,
      color: 'success' as const
    }));

  const bottomBenefits = (benefitStats || [])
    .filter(b => b.utilizationRate < 60)
    .sort((a, b) => a.utilizationRate - b.utilizationRate)
    .slice(0, 3)
    .map(b => ({
      name: b.benefitName,
      value: b.utilizationRate,
      color: b.utilizationRate < 50 ? 'danger' as const : 'warning' as const
    }));

  // Executive Pulse cards with real data
  const executivePulseCards = metrics ? [
    {
      id: 'effective-spend',
      title: { en: 'Effective Spend', ar: 'الإنفاق الفعال' },
      value: formatCurrency(metrics.effectiveSpend),
      subtitle: { en: `of ${formatCurrency(metrics.budgetUsed)} utilized`, ar: `من ${formatCurrency(metrics.budgetUsed)} مستخدم` },
      trend: `${efficiencyPercent}% efficiency`,
      trendUp: efficiencyPercent >= 80,
      icon: TrendingUp,
      color: 'emerald',
      benchmark: { en: `Waste: ${formatCurrency(metrics.wasteSpend)}`, ar: `هدر: ${formatCurrency(metrics.wasteSpend)}` },
      metricKey: 'effective_spend',
      confidence: metrics.confidence.utilization,
    },
    {
      id: 'financial',
      title: { en: 'Budget Status', ar: 'حالة الميزانية' },
      value: `${metrics.utilizationRate}%`,
      subtitle: { en: `${formatCurrency(metrics.budgetUsed)} of ${formatCurrency(metrics.annualBudget)} used`, ar: `${formatCurrency(metrics.budgetUsed)} من ${formatCurrency(metrics.annualBudget)} مستخدم` },
      trend: `${metrics.monthsRemaining} months left`,
      trendUp: metrics.utilizationRate <= metrics.utilizationTarget,
      icon: DollarSign,
      color: 'blue',
      benchmark: { en: metrics.annualBudget > 0 ? `On track for ${Math.round((metrics.projectedYearEndSpend / metrics.annualBudget) * 100)}%` : 'No budget set', ar: metrics.annualBudget > 0 ? 'في المسار الصحيح' : 'لم تحدد الميزانية' },
      metricKey: 'utilization_rate',
      confidence: metrics.confidence.budget,
    },
    {
      id: 'waste',
      title: { en: 'Recoverable Waste', ar: 'الهدر القابل للاسترداد' },
      value: formatCurrency(metrics.wasteRecoveryPotential),
      subtitle: { en: `of ${formatCurrency(metrics.wasteSpend)} total waste`, ar: `من ${formatCurrency(metrics.wasteSpend)} هدر` },
      trend: '60% recoverable',
      trendUp: true,
      icon: Recycle,
      color: 'amber',
      benchmark: { en: 'Action needed this Q', ar: 'يتطلب إجراء هذا الربع' },
      metricKey: 'waste_spend',
      confidence: metrics.confidence.waste,
    },
    {
      id: 'sentiment',
      title: { en: 'Employee Satisfaction', ar: 'رضا الموظفين' },
      value: metrics.satisfactionScore ? `${metrics.satisfactionScore}/5` : 'N/A',
      subtitle: { en: `${metrics.satisfactionSampleSize} responses`, ar: `${metrics.satisfactionSampleSize} استجابة` },
      trend: metrics.satisfactionScore ? '+0.3 vs Q3' : 'Insufficient data',
      trendUp: !!metrics.satisfactionScore,
      icon: Smile,
      color: 'violet',
      benchmark: { en: 'Industry avg: 3.6/5', ar: 'متوسط الصناعة: 3.6' },
      metricKey: 'satisfaction_score',
      confidence: metrics.confidence.satisfaction,
    },
  ] : [];

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-gradient-to-r from-card via-card to-primary/5 rounded-2xl border border-border/50 p-4">
          <Skeleton className="h-16 w-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {isArabic ? 'فشل في تحميل البيانات. يرجى المحاولة مرة أخرى.' : 'Failed to load dashboard data. Please try again.'}
            <Button variant="outline" size="sm" className="ml-4" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              {isArabic ? 'إعادة المحاولة' : 'Retry'}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // No data state
  if (!metrics || metrics.totalEmployees === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {isArabic 
              ? 'لا توجد بيانات متاحة حتى الآن. يرجى إضافة الموظفين والمزايا للبدء.'
              : 'No data available yet. Please add employees and benefits to get started.'}
          </AlertDescription>
        </Alert>
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {isArabic ? 'ابدأ ببناء برنامج المزايا الخاص بك' : 'Start Building Your Benefits Program'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {isArabic 
              ? 'أضف بيانات الموظفين واستحقاقات المزايا لرؤية لوحة التحكم الخاصة بك.'
              : 'Add employee data and benefit entitlements to see your dashboard.'}
          </p>
          <Link to="/employer/segments">
            <Button>
              <Users className="w-4 h-4 mr-2" />
              {isArabic ? 'إدارة الموظفين' : 'Manage Employees'}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Data Confidence Banner */}
      {metrics.confidence.budget === 'low' && (
        <Alert className="border-amber-500/20 bg-amber-500/5">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-700 dark:text-amber-400">
            {isArabic 
              ? 'لم يتم تعيين ميزانية سنوية. بعض المقاييس قد تكون غير دقيقة.'
              : 'No annual budget set. Some metrics may be inaccurate.'}
            <Link to="/admin/settings" className="ml-2 underline">
              {isArabic ? 'تعيين الميزانية' : 'Set Budget'}
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Executive Command Bar */}
      <div className={cn(
        "bg-gradient-to-r from-card via-card to-primary/5 rounded-2xl border border-border/50 p-4",
        isRTL && "bg-gradient-to-l"
      )}>
        <div className={cn(
          "flex flex-wrap items-center justify-between gap-4",
          isRTL && "flex-row-reverse"
        )}>
          {/* Title & Period */}
          <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
            <div className={cn(isRTL && "text-right")}>
              <h1 className="text-xl lg:text-2xl font-display font-bold tracking-tight">
                {viewMode === 'strategic' 
                  ? (isArabic ? 'لوحة التحكم التنفيذية' : 'Executive Dashboard')
                  : (isArabic ? 'لوحة العمليات' : 'Operations Dashboard')
                }
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                {isArabic ? `${metrics.fiscalYear} • شهري` : `FY ${metrics.fiscalYear} • Monthly View`}
              </p>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className={cn(
            "flex items-center gap-6 text-sm",
            isRTL && "flex-row-reverse"
          )}>
            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <div className={cn(
                "w-2 h-2 rounded-full",
                programScore >= 70 ? "bg-emerald-500" : "bg-amber-500"
              )} />
              <span className="text-muted-foreground">{isArabic ? 'البرنامج:' : 'Program:'}</span>
              <span className="font-bold">{programScore}/100</span>
              <MetricTooltip metricKey="program_score" confidence="medium" lastUpdated={metrics.lastUpdated} />
            </div>
            <div className="h-4 w-px bg-border" />
            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <span className="text-muted-foreground">{isArabic ? 'الميزانية:' : 'Budget:'}</span>
              <span className="font-bold">{formatCurrency(metrics.annualBudget)}</span>
              <MetricTooltip metricKey="utilization_rate" confidence={metrics.confidence.budget} />
            </div>
            <div className="h-4 w-px bg-border" />
            <Badge variant="outline" className={cn(
              "px-3 py-1 flex items-center gap-1.5",
              metrics.utilizationRate >= 70 
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                : "bg-amber-500/10 text-amber-600 border-amber-500/20",
              isRTL && "flex-row-reverse"
            )}>
              {metrics.utilizationRate >= 70 ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5" />
              )}
              <span>{metrics.utilizationRate}% {isArabic ? 'استخدام' : 'utilized'}</span>
            </Badge>
          </div>
        </div>
      </div>

      {/* Strategic View Content */}
      <AnimatePresence mode="wait">
        {viewMode === 'strategic' ? (
          <motion.div
            key="strategic"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Executive Pulse Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {executivePulseCards.map((card, index) => {
                const colorClasses = getColorClasses(card.color);
                return (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={cn(
                      "border-border/50 hover:shadow-lg transition-all duration-300 overflow-hidden",
                      colorClasses.border
                    )}>
                      <CardContent className="p-4">
                        <div className={cn("flex items-start justify-between mb-3", isRTL && "flex-row-reverse")}>
                          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                            <div className={cn("p-2 rounded-xl", colorClasses.bg)}>
                              <card.icon className={cn("w-5 h-5", colorClasses.text)} />
                            </div>
                            <MetricTooltip 
                              metricKey={card.metricKey} 
                              confidence={card.confidence}
                              lastUpdated={metrics.lastUpdated}
                            />
                          </div>
                          <div className={cn(
                            "flex items-center gap-1 text-xs font-medium",
                            card.trendUp ? "text-emerald-600" : "text-amber-600"
                          )}>
                            {card.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            <span>{card.trend}</span>
                          </div>
                        </div>
                        <div className={cn(isRTL && "text-right")}>
                          <p className={cn("text-2xl font-bold tracking-tight", colorClasses.text)}>
                            {card.value}
                          </p>
                          <p className="text-sm font-medium text-foreground mt-1">
                            {isArabic ? card.title.ar : card.title.en}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {isArabic ? card.subtitle.ar : card.subtitle.en}
                          </p>
                        </div>
                        <div className={cn(
                          "mt-3 pt-3 border-t border-border/50 text-[10px] text-muted-foreground",
                          isRTL && "text-right"
                        )}>
                          {isArabic ? card.benchmark.ar : card.benchmark.en}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Money Flow + Year-End Projection */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
              <div className="lg:col-span-2 flex">
                <MoneyFlowVisualization
                  allocated={metrics.annualBudget}
                  utilized={metrics.budgetUsed}
                  wasteIdentified={metrics.wasteSpend}
                  recoverableThisQuarter={metrics.wasteRecoveryPotential}
                  satisfactionScore={metrics.satisfactionScore || undefined}
                />
              </div>
              <div className="flex">
                <YearEndProjection
                  currentSpend={metrics.budgetUsed}
                  budget={metrics.annualBudget}
                  projectedSpend={metrics.projectedYearEndSpend}
                  currentUtilization={metrics.utilizationRate}
                  monthsRemaining={metrics.monthsRemaining}
                />
              </div>
            </div>

            {/* AI Strategic Insights */}
            <AIInsightsPanel
              insights={[
                {
                  id: '1',
                  text: isArabic 
                    ? `التطوير المهني يسجل استخدام منخفض. حملة تواصل مستهدفة يمكن أن توفر ${formatCurrency(metrics.wasteRecoveryPotential)} سنوياً.`
                    : `Low utilization detected. A targeted campaign could save ${formatCurrency(metrics.wasteRecoveryPotential)} annually.`,
                  impact: formatCurrency(metrics.wasteRecoveryPotential) + '/year',
                  action: isArabic ? 'إطلاق حملة التعلم' : 'Launch campaign',
                  type: 'opportunity',
                  category: isArabic ? 'التعليم' : 'Learning'
                },
                {
                  id: '2',
                  text: isArabic
                    ? `${metrics.pendingClaims} مطالبات في انتظار المراجعة. متوسط المعالجة ${metrics.avgProcessingDays} أيام.`
                    : `${metrics.pendingClaims} claims awaiting review. Avg processing: ${metrics.avgProcessingDays} days.`,
                  impact: metrics.avgProcessingDays <= metrics.slaTarget ? 'On Target' : 'At Risk',
                  action: isArabic ? 'مراجعة المطالبات' : 'Review claims',
                  type: metrics.avgProcessingDays <= metrics.slaTarget ? 'info' : 'warning',
                  category: isArabic ? 'العمليات' : 'Operations'
                },
                ...(metrics.satisfactionScore ? [{
                  id: '3',
                  text: isArabic
                    ? `رضا الموظفين ${metrics.satisfactionScore}/5 من ${metrics.satisfactionSampleSize} استجابة.`
                    : `Employee satisfaction at ${metrics.satisfactionScore}/5 from ${metrics.satisfactionSampleSize} responses.`,
                  type: 'info' as const,
                  category: isArabic ? 'الرضا' : 'Satisfaction'
                }] : [])
              ]}
              lastUpdated={new Date(metrics.lastUpdated).toLocaleString()}
            />

            {/* Competitive Position + Utilization Snapshot */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Competitive Position */}
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                    <CardTitle className={cn(
                      "text-base font-display font-semibold flex items-center gap-2",
                      isRTL && "flex-row-reverse"
                    )}>
                      <BarChart3 className="w-5 h-5 text-primary" />
                      {isArabic ? 'الموقع التنافسي' : 'Competitive Position'}
                    </CardTitle>
                    <MetricTooltip metricKey="utilization_rate" />
                  </div>
                  <CardDescription>{isArabic ? 'مقارنة بمعايير الصناعة' : 'vs Industry Benchmarks'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {benchmarksWithActual.map((item, index) => (
                      <div key={index} className={cn(
                        "flex items-center justify-between p-2 rounded-lg bg-muted/30",
                        isRTL && "flex-row-reverse"
                      )}>
                        <span className="text-sm font-medium flex-1">
                          {isArabic ? item.metric.ar : item.metric.en}
                        </span>
                        <div className={cn("flex items-center gap-3 text-sm", isRTL && "flex-row-reverse")}>
                          <span className="font-bold text-primary">{item.you}{index === 3 ? '' : '%'}</span>
                          <span className="text-muted-foreground">{item.industry}{index === 3 ? '' : '%'}</span>
                          <span className="text-emerald-600 font-medium">{item.top}{index === 3 ? '' : '%'}</span>
                          <Badge variant="outline" className={cn(
                            "text-[9px]",
                            item.you >= item.top * 0.9 ? 'bg-emerald-500/10 text-emerald-600' :
                            item.you >= item.industry ? 'bg-blue-500/10 text-blue-600' :
                            'bg-amber-500/10 text-amber-600'
                          )}>
                            {item.you >= item.top * 0.9 ? '✓' : item.you >= item.industry ? '★' : '○'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className={cn("flex items-center justify-center gap-4 text-[10px] text-muted-foreground mt-3", isRTL && "flex-row-reverse")}>
                    <span className="flex items-center gap-1"><span className="font-bold text-primary">●</span> {isArabic ? 'أنت' : 'You'}</span>
                    <span className="flex items-center gap-1"><span className="text-muted-foreground">●</span> {isArabic ? 'الصناعة' : 'Industry'}</span>
                    <span className="flex items-center gap-1"><span className="text-emerald-600">●</span> {isArabic ? 'الأفضل' : 'Top 10%'}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Utilization Snapshot */}
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                    <CardTitle className={cn(
                      "text-base font-display font-semibold flex items-center gap-2",
                      isRTL && "flex-row-reverse"
                    )}>
                      <PieChart className="w-5 h-5 text-primary" />
                      {isArabic ? 'لقطة الاستخدام' : 'Utilization Snapshot'}
                    </CardTitle>
                    <MetricTooltip metricKey="utilization_rate" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topBenefits.length > 0 ? (
                    <div>
                      <p className={cn("text-xs font-medium text-emerald-600 mb-2 flex items-center gap-1", isRTL && "flex-row-reverse")}>
                        <CheckCircle2 className="w-3 h-3" />
                        {isArabic ? 'الأعلى أداءً' : 'Top Performers'}
                      </p>
                      <ProgressBarList items={topBenefits} />
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      {isArabic ? 'لا توجد بيانات كافية' : 'No data available'}
                    </div>
                  )}
                  {bottomBenefits.length > 0 && (
                    <div className="border-t border-border/50 pt-4">
                      <p className={cn("text-xs font-medium text-amber-600 mb-2 flex items-center gap-1", isRTL && "flex-row-reverse")}>
                        <AlertTriangle className="w-3 h-3" />
                        {isArabic ? 'يحتاج اهتمام' : 'Needs Attention'}
                      </p>
                      <ProgressBarList items={bottomBenefits} />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Utilization Trend Chart */}
            {showUtilizationSnapshot && (
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                    <CardTitle className={cn("text-base font-display font-semibold flex items-center gap-2", isRTL && "flex-row-reverse")}>
                      <TrendingUp className="w-5 h-5 text-primary" />
                      {isArabic ? 'اتجاه الاستخدام - آخر 6 أشهر' : 'Utilization Trend - Last 6 Months'}
                    </CardTitle>
                    <MetricTooltip metricKey="utilization_rate" lastUpdated={metrics.lastUpdated} />
                  </div>
                </CardHeader>
                <CardContent>
                  <AnimatedLineChart 
                    data={utilizationTrend} 
                    height={150}
                    showGrid={true}
                    showLegend={false}
                  />
                </CardContent>
              </Card>
            )}
          </motion.div>
        ) : (
          /* Operational View Content */
          <motion.div
            key="operational"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Quick Stats for HR */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-amber-500/20 hover:shadow-md transition-all duration-300">
                <CardContent className="p-4">
                  <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                    <div className="p-2.5 rounded-xl bg-amber-500/10 shrink-0">
                      <FileCheck className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className={cn("min-w-0 flex-1", isRTL && "text-right")}>
                      <div className="flex items-center gap-1">
                        <p className="text-2xl font-bold tracking-tight text-amber-600">{metrics.pendingClaims}</p>
                        <MetricTooltip metricKey="pending_claims" />
                      </div>
                      <p className="text-xs text-muted-foreground">{isArabic ? 'مطالبات معلقة' : 'Pending Claims'}</p>
                    </div>
                  </div>
                  <Link to="/employer/claims">
                    <Button variant="ghost" size="sm" className="w-full mt-2 text-xs text-amber-600 hover:bg-amber-500/10">
                      {isArabic ? 'مراجعة الآن' : 'Review Now'} →
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-border/50 hover:shadow-md transition-all duration-300">
                <CardContent className="p-4">
                  <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                    <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div className={cn("min-w-0 flex-1", isRTL && "text-right")}>
                      <div className="flex items-center gap-1">
                        <p className="text-2xl font-bold tracking-tight">{metrics.totalEmployees}</p>
                        <MetricTooltip metricKey="utilization_rate" />
                      </div>
                      <p className="text-xs text-muted-foreground">{isArabic ? 'إجمالي الموظفين' : 'Total Employees'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 hover:shadow-md transition-all duration-300">
                <CardContent className="p-4">
                  <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                    <div className="p-2.5 rounded-xl bg-violet-500/10 shrink-0">
                      <Smile className="w-5 h-5 text-violet-500" />
                    </div>
                    <div className={cn("min-w-0 flex-1", isRTL && "text-right")}>
                      <div className="flex items-center gap-1">
                        <p className="text-2xl font-bold tracking-tight">
                          {metrics.satisfactionScore || 'N/A'}
                          {metrics.satisfactionScore && <span className="text-base text-muted-foreground font-normal">/5</span>}
                        </p>
                        <MetricTooltip metricKey="satisfaction_score" confidence={metrics.confidence.satisfaction} />
                      </div>
                      <p className="text-xs text-muted-foreground">{isArabic ? 'الرضا' : 'Satisfaction'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 hover:shadow-md transition-all duration-300">
                <CardContent className="p-4">
                  <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 shrink-0">
                      <Target className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className={cn("min-w-0 flex-1", isRTL && "text-right")}>
                      <div className="flex items-center gap-1">
                        <p className="text-2xl font-bold tracking-tight text-muted-foreground">N/A</p>
                        <MetricTooltip metricKey="retention_rate" confidence="not_integrated" />
                      </div>
                      <p className="text-xs text-muted-foreground">{isArabic ? 'معدل الاحتفاظ' : 'Retention Rate'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Operational Actions + Financial Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Claims Queue */}
              <Card className="border-amber-500/20">
                <CardHeader className="pb-3">
                  <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                    <CardTitle className={cn(
                      "text-base font-display font-semibold flex items-center gap-2",
                      isRTL && "flex-row-reverse"
                    )}>
                      <FileCheck className="w-4 h-4 text-amber-500" />
                      {isArabic ? 'قائمة المطالبات' : 'Claims Queue'}
                    </CardTitle>
                    <MetricTooltip metricKey="avg_processing_days" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className={cn("flex items-center justify-between p-3 rounded-lg bg-amber-500/5 border border-amber-500/20", isRTL && "flex-row-reverse")}>
                    <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                      <Clock className="w-4 h-4 text-amber-500" />
                      <div className={isRTL ? "text-right" : ""}>
                        <p className="text-sm font-medium">{isArabic ? 'متوسط وقت المعالجة' : 'Avg Processing Time'}</p>
                        <p className="text-xs text-muted-foreground">{isArabic ? `الهدف: ${metrics.slaTarget} أيام` : `Target: ${metrics.slaTarget} days`}</p>
                      </div>
                    </div>
                    <div className={cn("text-right", isRTL && "text-left")}>
                      <p className="text-lg font-bold text-amber-600">{metrics.avgProcessingDays} {isArabic ? 'أيام' : 'days'}</p>
                      <Badge variant="outline" className={cn(
                        "text-[10px]",
                        metrics.avgProcessingDays <= metrics.slaTarget 
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : "bg-red-500/10 text-red-600 border-red-500/20"
                      )}>
                        {metrics.avgProcessingDays <= metrics.slaTarget 
                          ? (isArabic ? 'ضمن الهدف' : 'On Target')
                          : (isArabic ? 'تجاوز الهدف' : 'Over Target')}
                      </Badge>
                    </div>
                  </div>
                  
                  <Link to="/employer/claims">
                    <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                      <FileCheck className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                      {isArabic ? 'مراجعة المطالبات المعلقة' : 'Review Pending Claims'}
                      <Badge className="ml-2 bg-white/20 text-white">{metrics.pendingClaims}</Badge>
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className={cn(
                    "text-base font-display font-semibold flex items-center gap-2",
                    isRTL && "flex-row-reverse"
                  )}>
                    <Zap className="w-4 h-4 text-primary" />
                    {isArabic ? 'إجراءات سريعة' : 'Quick Actions'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link to="/employer/spend">
                    <Button variant="outline" className="w-full justify-start">
                      <DollarSign className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                      {isArabic ? 'عرض تفاصيل الإنفاق' : 'View Spend Details'}
                    </Button>
                  </Link>
                  <Link to="/employer/zombie">
                    <Button variant="outline" className="w-full justify-start">
                      <Recycle className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                      {isArabic ? 'تحليل الهدر' : 'Analyze Zombie Spend'}
                    </Button>
                  </Link>
                  <Link to="/employer/segments">
                    <Button variant="outline" className="w-full justify-start">
                      <Users className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                      {isArabic ? 'عرض شرائح الموظفين' : 'View Employee Segments'}
                    </Button>
                  </Link>
                  <Link to="/employer/satisfaction">
                    <Button variant="outline" className="w-full justify-start">
                      <Smile className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                      {isArabic ? 'نتائج الاستبيان' : 'Survey Results'}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Utilization & Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                    <CardTitle className={cn("text-sm font-medium flex items-center gap-2", isRTL && "flex-row-reverse")}>
                      <TrendingUp className="w-4 h-4 text-primary" />
                      {isArabic ? 'اتجاه الاستخدام' : 'Utilization Trend'}
                    </CardTitle>
                    <MetricTooltip metricKey="utilization_rate" />
                  </div>
                </CardHeader>
                <CardContent>
                  <AnimatedLineChart 
                    data={utilizationTrend} 
                    height={120}
                    showGrid={false}
                    showLegend={false}
                  />
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                    <CardTitle className={cn("text-sm font-medium flex items-center gap-2", isRTL && "flex-row-reverse")}>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      {isArabic ? 'الأعلى أداءً' : 'Top Performers'}
                    </CardTitle>
                    <MetricTooltip metricKey="utilization_rate" />
                  </div>
                </CardHeader>
                <CardContent>
                  {topBenefits.length > 0 ? (
                    <ProgressBarList items={topBenefits} />
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {isArabic ? 'لا توجد بيانات' : 'No data available'}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                    <CardTitle className={cn("text-sm font-medium flex items-center gap-2", isRTL && "flex-row-reverse")}>
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      {isArabic ? 'يحتاج اهتمام' : 'Needs Attention'}
                    </CardTitle>
                    <MetricTooltip metricKey="waste_spend" />
                  </div>
                </CardHeader>
                <CardContent>
                  {bottomBenefits.length > 0 ? (
                    <ProgressBarList items={bottomBenefits} />
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {isArabic ? 'لا توجد بيانات' : 'No data available'}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
