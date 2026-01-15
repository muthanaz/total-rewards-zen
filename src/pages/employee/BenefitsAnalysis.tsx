import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle, Clock, ArrowRight, Wallet, CalendarClock, 
  TrendingUp, Lightbulb, ChevronRight, Sparkles, Target
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

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
    urgency: 'low'
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
    urgency: 'medium'
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
    urgency: 'low'
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
    urgency: 'medium'
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
    urgency: 'low'
  },
];

// Fully utilized benefits (for celebration)
const fullyUtilizedBenefits = [
  { name: 'Housing Allowance', nameAr: 'بدل السكن', value: 120000 },
  { name: 'Transport & Mobility', nameAr: 'النقل والتنقل', value: 39000 },
  { name: 'End of Service Gratuity', nameAr: 'مكافأة نهاية الخدمة', value: 102083 },
];

export default function BenefitsAnalysis() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const navigate = useNavigate();

  const calculatedMetrics = useMemo(() => {
    const totalValue = benefits.reduce((sum, b) => sum + b.value, 0) + 
                       fullyUtilizedBenefits.reduce((sum, b) => sum + b.value, 0);
    const totalUtilized = benefits.reduce((sum, b) => sum + b.utilized, 0) + 
                          fullyUtilizedBenefits.reduce((sum, b) => sum + b.value, 0);
    const unclaimed = totalValue - totalUtilized;
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

  const formatCurrency = (value: number) => 
    `${isRTL ? '' : 'AED '}${value.toLocaleString(isRTL ? 'ar-AE' : 'en-AE')}${isRTL ? ' درهم' : ''}`;

  const getDaysUntilDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    return Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header - Renamed to Insights & Optimization */}
      <div className={cn("space-y-1", isRTL && "text-right")}>
        <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
          {isRTL ? 'الرؤى والتحسين' : 'Insights & Optimization'}
        </h1>
        <p className="text-muted-foreground">
          {isRTL ? 'اكتشف فرص التوفير واتخذ إجراءً بناءً على بياناتك' : 'Discover savings opportunities and take action based on your data'}
        </p>
      </div>

      {/* Hero: Money Left on Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="overflow-hidden border-accent/30 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent">
          <CardContent className="p-6">
            <div className={cn("flex flex-col md:flex-row md:items-center md:justify-between gap-4", isRTL && "md:flex-row-reverse")}>
              <div className={cn("space-y-2", isRTL && "text-right")}>
                <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <div className="p-2 rounded-full bg-accent/20">
                    <Wallet className="w-5 h-5 text-accent" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    {isRTL ? 'القيمة غير المطالب بها' : 'Unclaimed Value'}
                  </span>
                </div>
                <p className="text-4xl md:text-5xl font-bold text-foreground">
                  {formatCurrency(calculatedMetrics.unclaimed)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isRTL 
                    ? `من أصل ${formatCurrency(calculatedMetrics.totalValue)} إجمالي المزايا`
                    : `Out of ${formatCurrency(calculatedMetrics.totalValue)} total benefits`}
                </p>
              </div>
              
              <div className={cn("flex flex-col items-start md:items-end gap-3", isRTL && "md:items-start")}>
                <div className={cn("flex items-center gap-2 px-3 py-2 rounded-full bg-amber-500/10 border border-amber-500/20", isRTL && "flex-row-reverse")}>
                  <CalendarClock className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                    {isRTL 
                      ? `${calculatedMetrics.daysRemaining} يوم متبقي هذا العام`
                      : `${calculatedMetrics.daysRemaining} days left this year`}
                  </span>
                </div>
                <div className="w-full md:w-48">
                  <div className={cn("flex justify-between text-xs mb-1", isRTL && "flex-row-reverse")}>
                    <span className="text-muted-foreground">{isRTL ? 'نسبة الاستخدام' : 'Utilization'}</span>
                    <span className="font-semibold">{calculatedMetrics.utilizationPercent}%</span>
                  </div>
                  <Progress value={calculatedMetrics.utilizationPercent} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Urgent Actions */}
      {urgentActions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-transparent">
            <CardHeader className="pb-3">
              <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <div className="p-1.5 rounded-lg bg-amber-500/15">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                </div>
                <CardTitle className="text-base font-semibold">
                  {isRTL ? 'إجراءات موصى بها' : 'Recommended Actions'}
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
                    className={cn(
                      "p-4 rounded-xl bg-card border border-border/50 hover:border-accent/50 transition-all cursor-pointer group",
                    )}
                    onClick={() => navigate(benefit.route)}
                  >
                    <div className={cn("flex items-start justify-between gap-3", isRTL && "flex-row-reverse")}>
                      <div className={cn("flex-1 space-y-2", isRTL && "text-right")}>
                        <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                          <span className="font-semibold text-sm">
                            {isRTL ? benefit.nameAr : benefit.name}
                          </span>
                          <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-400">
                            {benefit.utilizationPercent}% {isRTL ? 'مستخدم' : 'used'}
                          </Badge>
                        </div>
                        <p className="text-lg font-bold text-accent">
                          {formatCurrency(benefit.remaining)} <span className="text-xs font-normal text-muted-foreground">{isRTL ? 'متاح' : 'available'}</span>
                        </p>
                        <div className={cn("flex items-center gap-1.5 text-xs text-muted-foreground", isRTL && "flex-row-reverse")}>
                          <Lightbulb className="w-3 h-3 text-amber-500" />
                          <span>{isRTL ? benefit.tipAr : benefit.tip}</span>
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
        </motion.div>
      )}

      {/* All Benefits Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <div className="p-1.5 rounded-lg bg-accent/15">
                  <Target className="w-4 h-4 text-accent" />
                </div>
                <CardTitle className="text-base font-semibold">
                  {isRTL ? 'المزايا القابلة للمطالبة' : 'Claimable Benefits'}
                </CardTitle>
              </div>
              <span className="text-xs text-muted-foreground">
                {actionableBenefits.length} {isRTL ? 'مزايا متاحة' : 'benefits available'}
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
                    className={cn(
                      "p-4 rounded-lg border border-border/50 hover:border-accent/30 transition-all bg-card/50",
                    )}
                  >
                    <div className={cn("flex flex-col sm:flex-row sm:items-center gap-4", isRTL && "sm:flex-row-reverse")}>
                      {/* Benefit Info */}
                      <div className={cn("flex-1 space-y-2", isRTL && "text-right")}>
                        <div className={cn("flex items-center gap-2 flex-wrap", isRTL && "flex-row-reverse")}>
                          <span className="font-medium">
                            {isRTL ? benefit.nameAr : benefit.name}
                          </span>
                          {isUrgent && (
                            <Badge variant="destructive" className="text-[10px]">
                              <Clock className="w-3 h-3 mr-1" />
                              {daysUntil} {isRTL ? 'يوم' : 'days'}
                            </Badge>
                          )}
                        </div>
                        <div className={cn("flex items-center gap-4 text-sm", isRTL && "flex-row-reverse")}>
                          <span className="text-muted-foreground">
                            {isRTL ? 'مستخدم:' : 'Used:'} {formatCurrency(benefit.utilized)}
                          </span>
                          <span className="text-muted-foreground">•</span>
                          <span className="font-semibold text-accent">
                            {isRTL ? 'متاح:' : 'Available:'} {formatCurrency(benefit.remaining)}
                          </span>
                        </div>
                        <Progress value={benefit.utilizationPercent} className="h-1.5" />
                      </div>
                      
                      {/* Action */}
                      <Button 
                        size="sm" 
                        className="shrink-0"
                        onClick={() => navigate(benefit.route)}
                      >
                        {isRTL ? 'عرض التفاصيل' : 'View Details'}
                        <ArrowRight className={cn("w-4 h-4 ml-1", isRTL && "rotate-180 mr-1 ml-0")} />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Fully Utilized - Celebration */}
      {fullyUtilizedBenefits.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="border-emerald-500/30 bg-gradient-to-r from-emerald-500/5 to-transparent">
            <CardHeader className="pb-3">
              <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <div className="p-1.5 rounded-lg bg-emerald-500/15">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                </div>
                <CardTitle className="text-base font-semibold text-emerald-700 dark:text-emerald-400">
                  {isRTL ? 'أحسنت! مزايا مستخدمة بالكامل' : 'Great job! Fully Utilized'}
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
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <div className={isRTL ? "text-right" : ""}>
                      <p className="font-medium text-sm">{isRTL ? benefit.nameAr : benefit.name}</p>
                      <p className="text-xs text-emerald-600">{formatCurrency(benefit.value)} • 100%</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Smart Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Card className="bg-gradient-to-br from-blue-500/5 via-transparent to-violet-500/5 border-blue-500/20">
          <CardContent className="p-5">
            <div className={cn("flex items-start gap-4", isRTL && "flex-row-reverse")}>
              <div className="p-2 rounded-full bg-blue-500/15 shrink-0">
                <Lightbulb className="w-5 h-5 text-blue-600" />
              </div>
              <div className={cn("space-y-2", isRTL && "text-right")}>
                <h3 className="font-semibold text-sm">
                  {isRTL ? 'نصيحة ذكية' : 'Smart Tip'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isRTL 
                    ? `لديك ${formatCurrency(calculatedMetrics.unclaimed)} غير مستخدمة. ركز على التعلم والتطوير والتأمين الصحي - هذه المزايا تنتهي صلاحيتها في نهاية العام ولا يمكن ترحيلها.`
                    : `You have ${formatCurrency(calculatedMetrics.unclaimed)} unclaimed. Focus on Learning & Development and Health Insurance - these benefits expire at year-end and cannot be rolled over.`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
