import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle, Clock, ArrowRight, Wallet, CalendarClock, 
  TrendingUp, Lightbulb, ChevronRight, Sparkles, Target,
  CheckCircle2, Heart, GraduationCap, Car, BookOpen, Dumbbell
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Realistic benefit breakdown - only show what we can accurately track
const trackableBenefits = [
  { 
    id: 'education',
    name: 'Schooling Allowance', 
    nameAr: 'بدل التعليم المدرسي',
    icon: GraduationCap,
    route: '/employee/schooling',
    items: [
      { name: 'Per-child allowance', value: 30000, description: 'Annual allowance per registered child' },
      { name: 'Children registered', value: 2, type: 'count' },
    ],
    tip: 'Submit tuition receipts to claim your allowance',
    tipAr: 'قدم إيصالات الرسوم للمطالبة ببدلك',
  },
  { 
    id: 'learning',
    name: 'Learning & Development', 
    nameAr: 'التعلم والتطوير',
    icon: BookOpen,
    route: '/employee/learning',
    items: [
      { name: 'Annual budget', value: 12000, description: 'Pre-approved learning expenses' },
      { name: 'Claimed to date', value: 4500, type: 'utilized' },
    ],
    tip: 'Enroll in a certification course - AED 7,500 remaining',
    tipAr: 'سجل في دورة شهادة - 7,500 درهم متاح',
  },
  { 
    id: 'wellbeing',
    name: 'Wellbeing Program', 
    nameAr: 'برنامج الرفاهية',
    icon: Dumbbell,
    route: '/employee/wellbeing',
    items: [
      { name: 'Annual allowance', value: 6000, description: 'Gym, wellness, mental health' },
      { name: 'Claimed to date', value: 3200, type: 'utilized' },
    ],
    tip: 'Renew gym membership - AED 2,800 available',
    tipAr: 'جدد اشتراك النادي - 2,800 درهم متاح',
  },
];

// Benefits that are paid automatically (no action needed)
const automaticBenefits = [
  { name: 'Housing Allowance', nameAr: 'بدل السكن', value: 120000, frequency: 'Monthly with salary' },
  { name: 'Transport Allowance', nameAr: 'بدل النقل', value: 24000, frequency: 'Monthly with salary' },
];

// Health coverage - show plan info, not amounts (since claims vary)
const healthCoverage = {
  plan: 'Premium Family Plan',
  coverage: ['Employee', 'Spouse', 'Children (2)'],
  network: 'Enhanced Network',
  features: [
    { name: 'Outpatient', limit: 'Unlimited', coinsurance: '0% at network' },
    { name: 'Inpatient', limit: 'Unlimited', coinsurance: '0% at network' },
    { name: 'Dental', limit: 'AED 5,000/year', coinsurance: '20% coinsurance' },
    { name: 'Optical', limit: 'AED 2,000/year', coinsurance: '20% coinsurance' },
    { name: 'Maternity', limit: 'AED 15,000', coinsurance: 'Subject to waiting period' },
  ],
};

export default function BenefitsAnalysis() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const navigate = useNavigate();

  const calculatedMetrics = useMemo(() => {
    // Only count claimable benefits where we know the remaining amount
    const totalClaimable = trackableBenefits.reduce((sum, b) => {
      const budget = b.items.find(i => i.description?.includes('allowance') || i.description?.includes('budget'));
      const utilized = b.items.find(i => i.type === 'utilized');
      if (budget && utilized) {
        return sum + (budget.value - utilized.value);
      }
      return sum;
    }, 0);
    
    // Days until year end
    const yearEnd = new Date('2026-12-31');
    const today = new Date();
    const daysRemaining = Math.ceil((yearEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      totalClaimable,
      daysRemaining,
    };
  }, []);

  const formatCurrency = (value: number) => 
    `${isRTL ? '' : 'AED '}${value.toLocaleString(isRTL ? 'ar-AE' : 'en-AE')}${isRTL ? ' درهم' : ''}`;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className={cn("space-y-1", isRTL && "text-right")}>
        <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
          {isRTL ? 'تحليل المزايا' : 'Benefits Analysis'}
        </h1>
        <p className="text-muted-foreground">
          {isRTL ? 'فهم مزاياك واتخذ إجراءً' : 'Understand your benefits and take action'}
        </p>
      </div>

      {/* Hero: Claimable Benefits Summary */}
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
                    {isRTL ? 'مزايا قابلة للمطالبة' : 'Claimable Benefits Available'}
                  </span>
                </div>
                <p className="text-4xl md:text-5xl font-bold text-foreground">
                  {formatCurrency(calculatedMetrics.totalClaimable)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isRTL 
                    ? 'من مزايا التعلم والرفاهية والتطوير'
                    : 'From learning, wellbeing & development allowances'}
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
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Claimable Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <div className="p-1.5 rounded-lg bg-accent/15">
                <Target className="w-4 h-4 text-accent" />
              </div>
              <CardTitle className="text-base font-semibold">
                {isRTL ? 'مزايا يمكنك المطالبة بها' : 'Benefits You Can Claim'}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {trackableBenefits.map((benefit, index) => {
              const budget = benefit.items.find(i => i.description?.includes('allowance') || i.description?.includes('budget'));
              const utilized = benefit.items.find(i => i.type === 'utilized');
              const remaining = budget && utilized ? budget.value - utilized.value : 0;
              const utilizationPercent = budget && utilized ? Math.round((utilized.value / budget.value) * 100) : 0;
              
              return (
                <motion.div
                  key={benefit.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + index * 0.05 }}
                  className={cn(
                    "p-4 rounded-xl border border-border/50 hover:border-accent/30 transition-all cursor-pointer group",
                  )}
                  onClick={() => navigate(benefit.route)}
                >
                  <div className={cn("flex items-start justify-between gap-4", isRTL && "flex-row-reverse")}>
                    <div className={cn("flex items-start gap-3", isRTL && "flex-row-reverse")}>
                      <div className="p-2 rounded-lg bg-accent/10 shrink-0">
                        <benefit.icon className="w-5 h-5 text-accent" />
                      </div>
                      <div className={cn("space-y-1", isRTL && "text-right")}>
                        <h3 className="font-semibold">{isRTL ? benefit.nameAr : benefit.name}</h3>
                        <div className="text-sm text-muted-foreground">
                          {budget && <span>Budget: {formatCurrency(budget.value)}</span>}
                          {utilized && <span className="mx-2">•</span>}
                          {utilized && <span>Used: {formatCurrency(utilized.value)}</span>}
                        </div>
                        {remaining > 0 && (
                          <p className="text-sm font-medium text-accent">
                            {formatCurrency(remaining)} {isRTL ? 'متاح' : 'available'}
                          </p>
                        )}
                      </div>
                    </div>
                    <ChevronRight className={cn(
                      "w-5 h-5 text-muted-foreground group-hover:text-accent transition-all group-hover:translate-x-1 shrink-0",
                      isRTL && "rotate-180 group-hover:-translate-x-1"
                    )} />
                  </div>
                  <Progress value={utilizationPercent} className="h-1.5 mt-3" />
                  {benefit.tip && (
                    <div className={cn("flex items-center gap-1.5 mt-2 text-xs text-muted-foreground", isRTL && "flex-row-reverse")}>
                      <Lightbulb className="w-3 h-3 text-amber-500" />
                      <span>{isRTL ? benefit.tipAr : benefit.tip}</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>

      {/* Automatic Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card className="border-emerald-500/30 bg-gradient-to-r from-emerald-500/5 to-transparent">
          <CardHeader className="pb-3">
            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <div className="p-1.5 rounded-lg bg-emerald-500/15">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <CardTitle className="text-base font-semibold text-emerald-700 dark:text-emerald-400">
                {isRTL ? 'بدلات تلقائية (لا حاجة لأي إجراء)' : 'Automatic Allowances (No Action Needed)'}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {automaticBenefits.map((benefit, index) => (
                <motion.div
                  key={benefit.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25 + index * 0.05 }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20",
                    isRTL && "flex-row-reverse"
                  )}
                >
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <div className={isRTL ? "text-right" : ""}>
                    <p className="font-medium text-sm">{isRTL ? benefit.nameAr : benefit.name}</p>
                    <p className="text-xs text-emerald-600">{formatCurrency(benefit.value)}/year • {benefit.frequency}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Health Coverage Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card 
          className="cursor-pointer hover:border-accent/30 transition-all group"
          onClick={() => navigate('/employee/health')}
        >
          <CardHeader className="pb-3">
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <div className="p-1.5 rounded-lg bg-rose-500/15">
                  <Heart className="w-4 h-4 text-rose-500" />
                </div>
                <CardTitle className="text-base font-semibold">
                  {isRTL ? 'تغطية التأمين الصحي' : 'Health Insurance Coverage'}
                </CardTitle>
              </div>
              <ChevronRight className={cn(
                "w-5 h-5 text-muted-foreground group-hover:text-accent transition-all group-hover:translate-x-1",
                isRTL && "rotate-180 group-hover:-translate-x-1"
              )} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className={cn("flex items-center justify-between flex-wrap gap-2", isRTL && "flex-row-reverse")}>
                <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <Badge variant="secondary">{healthCoverage.plan}</Badge>
                  <Badge variant="outline">{healthCoverage.network}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {isRTL ? 'يغطي:' : 'Covers:'} {healthCoverage.coverage.join(', ')}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                {healthCoverage.features.map((feature) => (
                  <div key={feature.name} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <p className="font-medium text-sm">{feature.name}</p>
                    <p className="text-xs text-accent font-medium">{feature.limit}</p>
                    <p className="text-xs text-muted-foreground">{feature.coinsurance}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                <AlertCircle className="w-3 h-3 inline mr-1" />
                {isRTL 
                  ? 'استخدام التأمين الصحي يختلف حسب الحالة الفردية ولا يمكن التنبؤ به مسبقاً'
                  : 'Health insurance usage varies by individual circumstances and cannot be predicted in advance'}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

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
                <h4 className="font-semibold">
                  {isRTL ? 'نصائح لتعظيم مزاياك' : 'Tips to Maximize Your Benefits'}
                </h4>
                <ul className={cn("text-sm text-muted-foreground space-y-1", isRTL ? "pr-4" : "pl-4")}>
                  <li>• {isRTL ? 'قدم إيصالات التعليم قبل نهاية العام الدراسي' : 'Submit education receipts before school year ends'}</li>
                  <li>• {isRTL ? 'استخدم ميزانية التعلم للحصول على شهادات مهنية' : 'Use learning budget for professional certifications'}</li>
                  <li>• {isRTL ? 'طالب باشتراكات الصالة الرياضية والعافية ربع سنويًا' : 'Claim gym and wellness subscriptions quarterly'}</li>
                  <li>• {isRTL ? 'احجز موعد فحص الأسنان والعيون السنوي' : 'Schedule annual dental and optical checkups'}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
