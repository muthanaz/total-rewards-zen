// Employee Insights & Optimization Page - Renamed from BenefitsAnalysis
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertCircle, Clock, ArrowRight, Wallet, CalendarClock, 
  TrendingUp, Lightbulb, ChevronRight, Sparkles, Target,
  Download, Users, BarChart3, FileText, CheckCircle2
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/page-header';
import { StatusStrip } from '@/components/ui/status-strip';
import { PrimaryInsight } from '@/components/ui/primary-insight';
import { ConfidenceGate } from '@/components/employer/ConfidenceGate';
import { AnimatedDonutChart, AnimatedBarChart } from '@/components/charts';

// Demo data with actionable info
const benefits = [
  { 
    id: 'health',
    name: 'Health Insurance', 
    nameAr: 'التأمين الصحي',
    value: 45000, 
    utilized: 12500, 
    route: '/employee/health',
    deadline: '2026-12-31',
    tip: 'Schedule your annual checkup',
    tipAr: 'حدد موعد الفحص السنوي',
    urgency: 'low',
    status: 'claimable'
  },
  { 
    id: 'education',
    name: 'Education Allowance', 
    nameAr: 'بدل التعليم',
    value: 60000, 
    utilized: 42000, 
    route: '/employee/schooling',
    deadline: '2026-08-31',
    tip: 'Submit tuition receipts before school year ends',
    tipAr: 'قدم إيصالات الرسوم قبل نهاية العام الدراسي',
    urgency: 'medium',
    status: 'claimable'
  },
  { 
    id: 'wellbeing',
    name: 'Wellbeing Program', 
    nameAr: 'برنامج الرفاهية',
    value: 6000, 
    utilized: 3200, 
    route: '/employee/wellbeing',
    deadline: '2026-12-31',
    tip: 'Renew your gym membership',
    tipAr: 'جدد اشتراك النادي الرياضي',
    urgency: 'low',
    status: 'claimable'
  },
  { 
    id: 'learning',
    name: 'Learning & Development', 
    nameAr: 'التعلم والتطوير',
    value: 12000, 
    utilized: 4500, 
    route: '/employee/learning',
    deadline: '2026-12-31',
    tip: 'Enroll in a certification course',
    tipAr: 'سجل في دورة شهادة مهنية',
    urgency: 'medium',
    status: 'claimable'
  },
  { 
    id: 'financial',
    name: 'Financial Planning', 
    nameAr: 'التخطيط المالي',
    value: 36000, 
    utilized: 18000, 
    route: '/employee/financial',
    deadline: '2026-12-31',
    tip: 'Increase your retirement contribution',
    tipAr: 'زد مساهمتك في صندوق التقاعد',
    urgency: 'low',
    status: 'claimable'
  },
];

// Fully utilized benefits (for celebration)
const fullyUtilizedBenefits = [
  { name: 'Housing Allowance', nameAr: 'بدل السكن', value: 120000 },
  { name: 'Transport & Mobility', nameAr: 'النقل والتنقل', value: 39000 },
  { name: 'End of Service Gratuity', nameAr: 'مكافأة نهاية الخدمة', value: 102083 },
];

// Demo peer comparison data (anonymized)
const peerComparisonData = {
  sampleSize: 45,
  minRequired: 30,
  yourUtilization: 68,
  gradeAverage: 62,
  topPerformers: 85,
};

export default function InsightsPage() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const isArabic = language === 'ar';
  const navigate = useNavigate();

  const calculatedMetrics = useMemo(() => {
    const totalValue = benefits.reduce((sum, b) => sum + b.value, 0) + 
                       fullyUtilizedBenefits.reduce((sum, b) => sum + b.value, 0);
    const totalUtilized = benefits.reduce((sum, b) => sum + b.utilized, 0) + 
                          fullyUtilizedBenefits.reduce((sum, b) => sum + b.value, 0);
    const unclaimed = benefits.reduce((sum, b) => sum + (b.value - b.utilized), 0);
    const utilizationPercent = Math.round((totalUtilized / totalValue) * 100);
    
    // Days until year end
    const yearEnd = new Date('2026-12-31');
    const today = new Date();
    const daysRemaining = Math.ceil((yearEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      totalValue,
      totalUtilized,
      unclaimed,
      utilizationPercent,
      daysRemaining,
    };
  }, []);

  // Sort benefits by urgency and utilization
  const actionableBenefits = useMemo(() => {
    return benefits
      .map(b => ({
        ...b,
        remaining: b.value - b.utilized,
        utilizationPercent: Math.round((b.utilized / b.value) * 100),
      }))
      .filter(b => b.remaining > 0)
      .sort((a, b) => a.utilizationPercent - b.utilizationPercent);
  }, []);

  // Top 2 urgent actions
  const urgentActions = actionableBenefits.slice(0, 2);

  // Chart data for utilization by category
  const utilizationByCategory = useMemo(() => 
    actionableBenefits.map(b => ({
      name: isArabic ? b.nameAr : b.name,
      value: b.utilizationPercent,
      remaining: 100 - b.utilizationPercent,
    })), [actionableBenefits, isArabic]);

  const formatCurrency = (value: number) => 
    `${isRTL ? '' : 'AED '}${value.toLocaleString(isRTL ? 'ar-AE' : 'en-AE')}${isRTL ? ' درهم' : ''}`;

  const getDaysUntilDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    return Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <PageHeader
        title={isArabic ? 'الرؤى والتحسين' : 'Insights & Optimization'}
        titleAr="الرؤى والتحسين"
        subtitle={isArabic ? 'اكتشف فرص التوفير واتخذ إجراءً بناءً على بياناتك' : 'Discover savings opportunities and take action based on your data'}
        subtitleAr="اكتشف فرص التوفير واتخذ إجراءً بناءً على بياناتك"
        icon={Lightbulb}
        actions={
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            {isArabic ? 'تصدير البيان' : 'Export Statement'}
          </Button>
        }
      />

      {/* Status Strip */}
      <StatusStrip
        confidence="high"
        lastUpdated={new Date()}
        dataSource="Benefits System"
        dataSourceAr="نظام المزايا"
      />

      {/* Hero: Money Left on Table */}
      <PrimaryInsight
        title={isArabic ? 'القيمة غير المطالب بها' : 'Unclaimed Value'}
        titleAr="القيمة غير المطالب بها"
        value={formatCurrency(calculatedMetrics.unclaimed)}
        subtitle={`${calculatedMetrics.daysRemaining} ${isArabic ? 'يوم متبقي هذا العام' : 'days left this year'}`}
        subtitleAr={`${calculatedMetrics.daysRemaining} يوم متبقي هذا العام`}
        icon={Wallet}
        iconColor="text-accent"
        confidence="high"
        source={isArabic ? 'المزايا القابلة للمطالبة' : 'Claimable Benefits'}
        sourceAr="المزايا القابلة للمطالبة"
        formula="Sum of (Entitlement - Utilized) for budget benefits"
        formulaAr="مجموع (الاستحقاق - المستخدم) لمزايا الميزانية"
        trend={{
          value: calculatedMetrics.utilizationPercent,
          label: 'utilized',
          labelAr: 'مستخدم',
          direction: 'up',
        }}
        action={{
          label: 'View All Benefits',
          labelAr: 'عرض جميع المزايا',
          onClick: () => navigate('/employee/benefits'),
        }}
      />

      {/* Tabs for different views */}
      <Tabs defaultValue="opportunities" className="space-y-4">
        <TabsList>
          <TabsTrigger value="opportunities" className="gap-2">
            <Lightbulb className="w-4 h-4" />
            {isArabic ? 'الفرص' : 'Opportunities'}
          </TabsTrigger>
          <TabsTrigger value="breakdown" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            {isArabic ? 'التفاصيل' : 'Breakdown'}
          </TabsTrigger>
          <TabsTrigger value="compare" className="gap-2">
            <Users className="w-4 h-4" />
            {isArabic ? 'المقارنة' : 'Compare'}
          </TabsTrigger>
        </TabsList>

        {/* Opportunities Tab */}
        <TabsContent value="opportunities" className="space-y-4">
          {/* Urgent Actions */}
          {urgentActions.length > 0 && (
            <Card className="border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-transparent">
              <CardHeader className="pb-3">
                <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <div className="p-1.5 rounded-lg bg-amber-500/15">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                  </div>
                  <CardTitle className="text-base font-semibold">
                    {isArabic ? 'إجراءات موصى بها' : 'Recommended Actions'}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid md:grid-cols-2 gap-3">
                  {urgentActions.map((benefit, index) => (
                    <motion.div
                      key={benefit.id}
                      initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + index * 0.05 }}
                      className="p-4 rounded-xl bg-card border border-border/50 hover:border-accent/50 transition-all cursor-pointer group"
                      onClick={() => navigate(benefit.route)}
                    >
                      <div className={cn("flex items-start justify-between gap-3", isRTL && "flex-row-reverse")}>
                        <div className={cn("flex-1 space-y-2", isRTL && "text-right")}>
                          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                            <span className="font-semibold text-sm">
                              {isArabic ? benefit.nameAr : benefit.name}
                            </span>
                            <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-400">
                              {benefit.utilizationPercent}% {isArabic ? 'مستخدم' : 'used'}
                            </Badge>
                          </div>
                          <p className="text-lg font-bold text-accent">
                            {formatCurrency(benefit.remaining)} 
                            <span className="text-xs font-normal text-muted-foreground ml-1">
                              {isArabic ? 'متاح' : 'available'}
                            </span>
                          </p>
                          <div className={cn("flex items-center gap-1.5 text-xs text-muted-foreground", isRTL && "flex-row-reverse")}>
                            <Lightbulb className="w-3 h-3 text-amber-500" />
                            <span>{isArabic ? benefit.tipAr : benefit.tip}</span>
                          </div>
                        </div>
                        <ChevronRight className={cn(
                          "w-5 h-5 text-muted-foreground group-hover:text-accent transition-all group-hover:translate-x-1",
                          isRTL && "rotate-180 group-hover:-translate-x-1"
                        )} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Benefits Breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <div className="p-1.5 rounded-lg bg-accent/15">
                    <Target className="w-4 h-4 text-accent" />
                  </div>
                  <CardTitle className="text-base font-semibold">
                    {isArabic ? 'المزايا القابلة للمطالبة' : 'Claimable Benefits'}
                  </CardTitle>
                </div>
                <span className="text-xs text-muted-foreground">
                  {actionableBenefits.length} {isArabic ? 'مزايا متاحة' : 'benefits available'}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {actionableBenefits.map((benefit, index) => {
                  const daysUntil = getDaysUntilDeadline(benefit.deadline);
                  const isUrgent = daysUntil < 90;
                  
                  return (
                    <motion.div
                      key={benefit.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 + index * 0.03 }}
                      className="p-4 rounded-lg border border-border/50 hover:border-accent/30 transition-all bg-card/50"
                    >
                      <div className={cn("flex flex-col sm:flex-row sm:items-center gap-4", isRTL && "sm:flex-row-reverse")}>
                        <div className={cn("flex-1 space-y-2", isRTL && "text-right")}>
                          <div className={cn("flex items-center gap-2 flex-wrap", isRTL && "flex-row-reverse")}>
                            <span className="font-medium">
                              {isArabic ? benefit.nameAr : benefit.name}
                            </span>
                            {isUrgent && (
                              <Badge variant="destructive" className="text-[10px]">
                                <Clock className="w-3 h-3 mr-1" />
                                {daysUntil} {isArabic ? 'يوم' : 'days'}
                              </Badge>
                            )}
                          </div>
                          <div className={cn("flex items-center gap-4 text-sm", isRTL && "flex-row-reverse")}>
                            <span className="text-muted-foreground">
                              {isArabic ? 'مستخدم:' : 'Used:'} {formatCurrency(benefit.utilized)}
                            </span>
                            <span className="text-muted-foreground">•</span>
                            <span className="font-semibold text-accent">
                              {isArabic ? 'متاح:' : 'Available:'} {formatCurrency(benefit.remaining)}
                            </span>
                          </div>
                          <Progress value={benefit.utilizationPercent} className="h-1.5" />
                        </div>
                        
                        <Button 
                          size="sm" 
                          className="shrink-0"
                          onClick={() => navigate(benefit.route)}
                        >
                          {isArabic ? 'عرض التفاصيل' : 'View Details'}
                          <ArrowRight className={cn("w-4 h-4 ml-1", isRTL && "rotate-180 mr-1 ml-0")} />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Fully Utilized - Celebration */}
          {fullyUtilizedBenefits.length > 0 && (
            <Card className="border-emerald-500/30 bg-gradient-to-r from-emerald-500/5 to-transparent">
              <CardHeader className="pb-3">
                <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <div className="p-1.5 rounded-lg bg-emerald-500/15">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                  </div>
                  <CardTitle className="text-base font-semibold text-emerald-700 dark:text-emerald-400">
                    {isArabic ? 'أحسنت! مزايا مستخدمة بالكامل' : 'Great job! Fully Utilized'}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-3">
                  {fullyUtilizedBenefits.map((benefit, index) => (
                    <motion.div
                      key={benefit.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.35 + index * 0.05 }}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20",
                        isRTL && "flex-row-reverse"
                      )}
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <div className={isRTL ? "text-right" : ""}>
                        <p className="font-medium text-sm">{isArabic ? benefit.nameAr : benefit.name}</p>
                        <p className="text-xs text-emerald-600">{formatCurrency(benefit.value)} • 100%</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Breakdown Tab */}
        <TabsContent value="breakdown" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {isArabic ? 'الاستخدام حسب الفئة' : 'Utilization by Category'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {utilizationByCategory.map((item, i) => (
                    <div key={i}>
                      <div className={cn("flex justify-between text-sm mb-1", isRTL && "flex-row-reverse")}>
                        <span>{item.name}</span>
                        <span className="font-medium">{item.value}%</span>
                      </div>
                      <Progress value={item.value} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {isArabic ? 'حسب الحالة' : 'By Claim Status'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { status: 'Claimed & Paid', statusAr: 'مطالب به ومدفوع', count: 8, amount: 285000, color: 'bg-emerald-500' },
                    { status: 'Approved', statusAr: 'موافق عليه', count: 2, amount: 15000, color: 'bg-blue-500' },
                    { status: 'In Review', statusAr: 'قيد المراجعة', count: 1, amount: 8500, color: 'bg-amber-500' },
                    { status: 'Available', statusAr: 'متاح', count: 5, amount: calculatedMetrics.unclaimed, color: 'bg-muted' },
                  ].map((item) => (
                    <div key={item.status} className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                      <div className={cn("w-3 h-3 rounded-full", item.color)} />
                      <div className="flex-1">
                        <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                          <span className="text-sm font-medium">{isArabic ? item.statusAr : item.status}</span>
                          <span className="text-sm text-muted-foreground">{item.count}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{formatCurrency(item.amount)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Compare Tab */}
        <TabsContent value="compare" className="space-y-4">
          <ConfidenceGate
            confidence={peerComparisonData.sampleSize >= peerComparisonData.minRequired ? 'medium' : 'low'}
            showEstimatedLabel
            metricName="Peer Comparison"
          >
            <Card>
              <CardHeader>
                <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                  <CardTitle className="text-base">
                    {isArabic ? 'مقارنة مع الأقران' : 'Compare to Peers'}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">
                    n={peerComparisonData.sampleSize}/{peerComparisonData.minRequired}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {isArabic 
                    ? 'مقارنة استخدامك مع الموظفين في نفس الدرجة (مجهول الهوية)'
                    : 'Compare your utilization with employees in the same grade (anonymized)'}
                </p>
                
                <div className="space-y-4">
                  {[
                    { 
                      label: isArabic ? 'استخدامك' : 'Your Utilization', 
                      value: peerComparisonData.yourUtilization, 
                      color: 'bg-accent',
                      highlight: true 
                    },
                    { 
                      label: isArabic ? 'متوسط الدرجة' : 'Grade Average', 
                      value: peerComparisonData.gradeAverage, 
                      color: 'bg-muted-foreground/50' 
                    },
                    { 
                      label: isArabic ? 'أفضل 25%' : 'Top 25%', 
                      value: peerComparisonData.topPerformers, 
                      color: 'bg-emerald-500' 
                    },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className={cn("flex items-center justify-between mb-1", isRTL && "flex-row-reverse")}>
                        <span className={cn("text-sm", item.highlight && "font-medium")}>{item.label}</span>
                        <span className={cn("text-sm tabular-nums", item.highlight && "font-bold")}>{item.value}%</span>
                      </div>
                      <Progress value={item.value} className={cn("h-2", item.color)} />
                    </div>
                  ))}
                </div>

                {peerComparisonData.yourUtilization > peerComparisonData.gradeAverage && (
                  <div className={cn("mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20", isRTL && "text-right")}>
                    <p className="text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      {isArabic 
                        ? 'أنت أعلى من المتوسط! استمر في العمل الجيد.'
                        : "You're above average! Keep up the good work."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </ConfidenceGate>
        </TabsContent>
      </Tabs>
    </div>
  );
}
