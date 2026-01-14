import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { 
  Users, DollarSign, TrendingUp, Smile, 
  Recycle, FileCheck, Target, AlertTriangle, 
  CheckCircle2, Zap, Clock,
  BarChart3, Shield,
  ArrowUpRight, ArrowDownRight, PieChart
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

// Dashboard metrics data
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
  programScore: 72,
  roiScore: 3.2,
  riskExposure: 8500000,
};

// Executive Pulse data
const executivePulseCards = [
  {
    id: 'roi',
    title: { en: 'Benefits ROI', ar: 'عائد المزايا' },
    value: '3.2x',
    subtitle: { en: 'Return on investment', ar: 'العائد على الاستثمار' },
    trend: '+0.4x',
    trendUp: true,
    icon: TrendingUp,
    color: 'emerald',
    benchmark: { en: 'vs Industry: +12%', ar: 'مقارنة بالصناعة: +12%' },
    tooltip: 'Calculated as (Value Delivered / Total Spend). Based on employee valuations and productivity metrics.'
  },
  {
    id: 'financial',
    title: { en: 'Financial Health', ar: 'الصحة المالية' },
    value: '64%',
    subtitle: { en: 'Budget utilized', ar: 'الميزانية المستخدمة' },
    trend: '-11% to target',
    trendUp: false,
    icon: DollarSign,
    color: 'amber',
    benchmark: { en: 'Target: 75%', ar: 'الهدف: 75%' },
    tooltip: 'Percentage of annual budget spent year-to-date (YTD Spend / Annual Budget × 100).'
  },
  {
    id: 'risk',
    title: { en: 'Risk Exposure', ar: 'التعرض للمخاطر' },
    value: 'AED 8.5M',
    subtitle: { en: 'Zombie + SLA risks', ar: 'مخاطر الهدر والخدمة' },
    trend: 'AED 5.1M recoverable',
    trendUp: true,
    icon: Shield,
    color: 'red',
    benchmark: { en: 'Action needed', ar: 'يتطلب إجراء' },
    tooltip: 'Sum of underutilized benefits (zombie spend) and potential SLA penalty exposure.'
  },
  {
    id: 'sentiment',
    title: { en: 'Workforce Sentiment', ar: 'رضا الموظفين' },
    value: '4.2/5',
    subtitle: { en: '+0.3 since Q3', ar: '+0.3 منذ الربع الثالث' },
    trend: '+7.7%',
    trendUp: true,
    icon: Smile,
    color: 'violet',
    benchmark: { en: '142 responses', ar: '142 استجابة' },
    tooltip: 'Average satisfaction rating from employee surveys. Based on 142 responses this quarter.'
  },
];



// Industry benchmarks
const industryBenchmarks = [
  { metric: { en: 'Utilization Rate', ar: 'معدل الاستخدام' }, you: 64, industry: 62, top: 78, status: 'good' },
  { metric: { en: 'Cost Per Employee', ar: 'التكلفة لكل موظف' }, you: 45, industry: 42, top: 52, status: 'optimal' },
  { metric: { en: 'Zombie Spend Rate', ar: 'معدل الهدر' }, you: 13.7, industry: 18, top: 8, status: 'good' },
  { metric: { en: 'Satisfaction Score', ar: 'درجة الرضا' }, you: 4.2, industry: 3.6, top: 4.3, status: 'near-top' },
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
  { name: 'Housing Allowance', value: 95, color: 'success' as const },
  { name: 'Health Insurance', value: 78, color: 'success' as const },
  { name: 'Transport Allowance', value: 72, color: 'accent' as const },
];

const bottomBenefits = [
  { name: 'Learning & Development', value: 38, color: 'danger' as const },
  { name: 'Wellbeing Program', value: 45, color: 'warning' as const },
  { name: 'Financial Planning', value: 52, color: 'warning' as const },
];

export default function EmployerDashboard() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const isArabic = language === 'ar';
  const viewMode = useEmployerViewMode();
  
  const formatCurrency = (value: number) => `AED ${(value / 1000000).toFixed(1)}M`;
  
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

  return (
    <div className="space-y-6 animate-fade-in">
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
                {isArabic ? 'ديسمبر 2024 • شهري' : 'December 2024 • Monthly View'}
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
                metrics.programScore >= 70 ? "bg-emerald-500" : "bg-amber-500"
              )} />
              <span className="text-muted-foreground">{isArabic ? 'البرنامج:' : 'Program:'}</span>
              <span className="font-bold">{metrics.programScore}/100</span>
              <InfoTooltip 
                formula="Weighted average of utilization (40%), satisfaction (30%), cost efficiency (20%), and compliance (10%)." 
                dataSource="Benefits Analytics" 
              />
            </div>
            <div className="h-4 w-px bg-border" />
            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <span className="text-muted-foreground">{isArabic ? 'الميزانية:' : 'Budget:'}</span>
              <span className="font-bold">{formatCurrency(metrics.annualBudget)}</span>
              <InfoTooltip 
                formula="Total allocated benefits budget for the fiscal year." 
                dataSource="Finance System" 
              />
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
                            <InfoTooltip formula={card.tooltip} dataSource="Benefits Analytics" />
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
                  satisfactionScore={metrics.satisfactionScore}
                />
              </div>
              <div className="flex">
                <YearEndProjection
                  currentSpend={metrics.budgetUsed}
                  budget={metrics.annualBudget}
                  projectedSpend={61200000}
                  currentUtilization={metrics.utilizationRate}
                  monthsRemaining={4}
                />
              </div>
            </div>

            {/* AI Strategic Insights */}
            <AIInsightsPanel
              insights={[
                {
                  id: '1',
                  text: isArabic 
                    ? 'التطوير المهني يسجل استخدام 38% فقط. حملة تواصل مستهدفة يمكن أن توفر 2.8 مليون درهم سنوياً.'
                    : 'L&D is at 38% utilization. A targeted communication campaign could save AED 2.8M annually.',
                  impact: 'AED 2.8M/year',
                  action: isArabic ? 'إطلاق حملة التعلم' : 'Launch L&D campaign',
                  type: 'opportunity',
                  category: isArabic ? 'التعليم' : 'Learning'
                },
                {
                  id: '2',
                  text: isArabic
                    ? '45% من الموظفين لم يقدموا مطالبات رفاهية. تبسيط العملية سيزيد الاستخدام.'
                    : '45% of employees haven\'t claimed wellbeing benefits. Simplifying the process could boost adoption.',
                  impact: '+25% usage',
                  action: isArabic ? 'تبسيط المطالبات' : 'Streamline claims',
                  type: 'warning',
                  category: isArabic ? 'الرفاهية' : 'Wellbeing'
                },
                {
                  id: '3',
                  text: isArabic
                    ? 'رضا الموظفين عن المزايا الصحية أعلى بنسبة 15% من معيار الصناعة.'
                    : 'Employee satisfaction with health benefits is 15% above industry benchmark.',
                  type: 'info',
                  category: isArabic ? 'الصحة' : 'Health'
                }
              ]}
              lastUpdated={isArabic ? 'منذ ساعتين' : '2 hours ago'}
            />

            {/* Competitive Position + Utilization Snapshot - Side by Side */}
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
                    <InfoTooltip 
                      formula="Comparison of your metrics against UAE industry averages and top 10% performers." 
                      dataSource="Industry Benchmarks Q4 2024" 
                    />
                  </div>
                  <CardDescription>{isArabic ? 'مقارنة بمعايير الصناعة' : 'vs Industry Benchmarks'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {industryBenchmarks.map((item, index) => (
                      <div key={index} className={cn(
                        "flex items-center justify-between p-2 rounded-lg bg-muted/30",
                        isRTL && "flex-row-reverse"
                      )}>
                        <span className="text-sm font-medium flex-1">
                          {isArabic ? item.metric.ar : item.metric.en}
                        </span>
                        <div className={cn("flex items-center gap-3 text-sm", isRTL && "flex-row-reverse")}>
                          <span className="font-bold text-primary">{item.you}%</span>
                          <span className="text-muted-foreground">{item.industry}%</span>
                          <span className="text-emerald-600 font-medium">{item.top}%</span>
                          <Badge variant="outline" className={cn(
                            "text-[9px]",
                            item.status === 'optimal' ? 'bg-emerald-500/10 text-emerald-600' :
                            item.status === 'near-top' ? 'bg-blue-500/10 text-blue-600' :
                            'bg-amber-500/10 text-amber-600'
                          )}>
                            {item.status === 'optimal' ? '✓' : item.status === 'near-top' ? '★' : '○'}
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

              {/* Utilization Snapshot - Combined */}
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
                    <InfoTooltip formula="Top and bottom performing benefits by utilization rate." dataSource="Analytics" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className={cn("text-xs font-medium text-emerald-600 mb-2 flex items-center gap-1", isRTL && "flex-row-reverse")}>
                      <CheckCircle2 className="w-3 h-3" />
                      {isArabic ? 'الأعلى أداءً' : 'Top Performers'}
                    </p>
                    <ProgressBarList items={topBenefits} />
                  </div>
                  <div className="border-t border-border/50 pt-4">
                    <p className={cn("text-xs font-medium text-amber-600 mb-2 flex items-center gap-1", isRTL && "flex-row-reverse")}>
                      <AlertTriangle className="w-3 h-3" />
                      {isArabic ? 'يحتاج اهتمام' : 'Needs Attention'}
                    </p>
                    <ProgressBarList items={bottomBenefits} />
                  </div>
                </CardContent>
              </Card>
            </div>


            {/* Utilization Trend Chart - Full Width at Bottom */}
            {showUtilizationSnapshot && (
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                    <CardTitle className={cn("text-base font-display font-semibold flex items-center gap-2", isRTL && "flex-row-reverse")}>
                      <TrendingUp className="w-5 h-5 text-primary" />
                      {isArabic ? 'اتجاه الاستخدام - آخر 6 أشهر' : 'Utilization Trend - Last 6 Months'}
                    </CardTitle>
                    <InfoTooltip formula="Monthly utilization percentage over the last 6 months." dataSource="Analytics" />
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
                        <InfoTooltip formula="Count of claims in 'pending' status." dataSource="Claims System" />
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
                        <InfoTooltip formula="Total active employees enrolled in benefits." dataSource="HR System" />
                      </div>
                      <p className="text-xs text-muted-foreground">{isArabic ? 'إجمالي الموظفين' : 'Total Employees'}</p>
                    </div>
                  </div>
                  <div className={cn("mt-2 flex items-center gap-1 text-xs text-emerald-600", isRTL && "flex-row-reverse")}>
                    <TrendingUp className="w-3 h-3" />
                    <span>+{metrics.employeeChange} {isArabic ? 'هذا العام' : 'YTD'}</span>
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
                        <p className="text-2xl font-bold tracking-tight">{metrics.satisfactionScore}<span className="text-base text-muted-foreground font-normal">/5</span></p>
                        <InfoTooltip formula="Average rating from employee satisfaction surveys." dataSource="Survey System" />
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
                        <p className="text-2xl font-bold tracking-tight text-emerald-600">{metrics.retentionRate}%</p>
                        <InfoTooltip formula="(Employees at end of period / Employees at start) × 100." dataSource="HR Analytics" />
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
                    <InfoTooltip formula="Pending claims sorted by submission date." dataSource="Claims System" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className={cn("flex items-center justify-between p-3 rounded-lg bg-amber-500/5 border border-amber-500/20", isRTL && "flex-row-reverse")}>
                    <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                      <Clock className="w-4 h-4 text-amber-500" />
                      <div className={isRTL ? "text-right" : ""}>
                        <p className="text-sm font-medium">{isArabic ? 'متوسط وقت المعالجة' : 'Avg Processing Time'}</p>
                        <p className="text-xs text-muted-foreground">{isArabic ? 'الهدف: 3 أيام' : 'Target: 3 days'}</p>
                      </div>
                    </div>
                    <div className={cn("text-right", isRTL && "text-left")}>
                      <p className="text-lg font-bold text-amber-600">{metrics.avgProcessingDays} {isArabic ? 'أيام' : 'days'}</p>
                      <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                        {isArabic ? 'ضمن الهدف' : 'On Target'}
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
                    <InfoTooltip formula="Monthly utilization percentage over the last 6 months." dataSource="Analytics" />
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
                    <InfoTooltip formula="Benefits with highest utilization rates (>70%)." dataSource="Analytics" />
                  </div>
                </CardHeader>
                <CardContent>
                  <ProgressBarList items={topBenefits} />
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                    <CardTitle className={cn("text-sm font-medium flex items-center gap-2", isRTL && "flex-row-reverse")}>
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      {isArabic ? 'يحتاج اهتمام' : 'Needs Attention'}
                    </CardTitle>
                    <InfoTooltip formula="Benefits with low utilization rates (<60%) - potential zombie spend." dataSource="Analytics" />
                  </div>
                </CardHeader>
                <CardContent>
                  <ProgressBarList items={bottomBenefits} />
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
