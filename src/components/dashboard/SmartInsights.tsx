import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, TrendingUp, AlertTriangle, Lightbulb, 
  ArrowRight, CheckCircle2, Clock, Target
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';

interface Benefit {
  name: string;
  value: number;
  utilized: number;
  route: string;
  valueType?: string;
}

interface SmartInsightsProps {
  benefits: Benefit[];
  className?: string;
}

type InsightType = 'action' | 'opportunity' | 'achievement' | 'reminder';

interface Insight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  action?: string;
  route?: string;
  priority: 'high' | 'medium' | 'low';
}

export function SmartInsights({ benefits, className }: SmartInsightsProps) {
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const navigate = useNavigate();

  // Generate truly smart, contextual insights based on actual benefits data
  const insights = useMemo<Insight[]>(() => {
    const generatedInsights: Insight[] = [];
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();
    const daysInYear = 365;
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const yearProgress = dayOfYear / daysInYear;
    const monthsRemaining = 12 - currentMonth;
    
    // Calculate aggregate stats
    const totalValue = benefits.reduce((sum, b) => sum + b.value, 0);
    const totalUtilized = benefits.reduce((sum, b) => sum + b.utilized, 0);
    const totalRemaining = totalValue - totalUtilized;
    const overallUtilization = totalUtilized / totalValue;
    
    // Find specific benefit patterns
    const healthBenefit = benefits.find(b => b.name.includes('Health'));
    const learningBenefit = benefits.find(b => b.name.includes('Learning'));
    const wellbeingBenefit = benefits.find(b => b.name.includes('Wellbeing'));
    const financialBenefit = benefits.find(b => b.name.includes('Financial'));
    const transportBenefit = benefits.find(b => b.name.includes('Transport'));
    
    const underutilizedBenefits = benefits.filter(b => {
      const util = b.utilized / b.value;
      return util < yearProgress * 0.7 && (b.value - b.utilized) > 1000;
    });
    
    const fullyUtilizedCount = benefits.filter(b => b.utilized >= b.value).length;
    
    // 1. Health-specific insight with actionable recommendation
    if (healthBenefit) {
      const healthRemaining = healthBenefit.value - healthBenefit.utilized;
      const healthUtilization = healthBenefit.utilized / healthBenefit.value;
      
      if (healthUtilization < 0.4 && healthRemaining > 20000) {
        generatedInsights.push({
          id: 'health-checkup',
          type: 'action',
          title: isRTL ? 'فحص طبي سنوي مجاني' : 'Free Annual Health Screening',
          description: isRTL 
            ? `AED ${healthRemaining.toLocaleString()} متبقية. احجز فحصك الوقائي السنوي - مغطى بالكامل بدون خصم.`
            : `AED ${healthRemaining.toLocaleString()} remaining. Book your preventive annual screening - fully covered with no deductible.`,
          action: isRTL ? 'احجز موعدك' : 'Book Appointment',
          route: healthBenefit.route,
          priority: 'high',
        });
      } else if (healthUtilization < 0.6) {
        generatedInsights.push({
          id: 'health-dental',
          type: 'opportunity',
          title: isRTL ? 'لا تنسَ فحص الأسنان' : 'Dental Check-up Covered',
          description: isRTL
            ? `تأمينك يغطي فحصين للأسنان سنوياً. AED ${healthRemaining.toLocaleString()} متاحة للعلاجات الأخرى.`
            : `Your plan covers 2 dental visits/year. AED ${healthRemaining.toLocaleString()} available for other treatments.`,
          action: isRTL ? 'عرض التغطية' : 'View Coverage',
          route: healthBenefit.route,
          priority: 'medium',
        });
      }
    }
    
    // 2. Learning with deadline urgency
    if (learningBenefit) {
      const learningRemaining = learningBenefit.value - learningBenefit.utilized;
      const learningUtilization = learningBenefit.utilized / learningBenefit.value;
      
      if (learningUtilization < 0.5 && learningRemaining > 5000) {
        const monthlyBudget = Math.round(learningRemaining / monthsRemaining);
        generatedInsights.push({
          id: 'learning-budget',
          type: 'opportunity',
          title: isRTL ? 'ميزانية تطوير غير مستخدمة' : 'Unused Development Budget',
          description: isRTL
            ? `AED ${learningRemaining.toLocaleString('en-US')} متبقية (AED ${monthlyBudget.toLocaleString('en-US')} شهرياً). دورات LinkedIn و Coursera مؤهلة.`
            : `AED ${learningRemaining.toLocaleString()} remaining (AED ${monthlyBudget.toLocaleString()}/month). LinkedIn Learning & Coursera courses eligible.`,
          action: isRTL ? 'تصفح الدورات' : 'Browse Courses',
          route: learningBenefit.route,
          priority: 'medium',
        });
      }
    }
    
    // 3. Wellbeing with specific actionable tip
    if (wellbeingBenefit) {
      const wellbeingRemaining = wellbeingBenefit.value - wellbeingBenefit.utilized;
      const wellbeingUtilization = wellbeingBenefit.utilized / wellbeingBenefit.value;
      
      if (wellbeingUtilization < 0.6 && wellbeingRemaining > 1500) {
        generatedInsights.push({
          id: 'wellbeing-gym',
          type: 'opportunity',
          title: isRTL ? 'عضوية النادي مغطاة' : 'Gym Membership Covered',
          description: isRTL
            ? `فعّل عضوية Fitness First أو GymNation مجاناً. AED ${wellbeingRemaining.toLocaleString('en-US')} متبقية لتطبيقات الصحة.`
            : `Activate Fitness First or GymNation membership free. AED ${wellbeingRemaining.toLocaleString()} left for wellness apps.`,
          action: isRTL ? 'فعّل الآن' : 'Activate Now',
          route: wellbeingBenefit.route,
          priority: 'medium',
        });
      }
    }
    
    // 4. Year-end urgency (Q4 only)
    if (currentMonth >= 9 && totalRemaining > 30000) {
      const weeksRemaining = Math.ceil((new Date(now.getFullYear(), 11, 31).getTime() - now.getTime()) / (7 * 24 * 60 * 60 * 1000));
      generatedInsights.push({
        id: 'year-end-urgency',
        type: 'reminder',
        title: isRTL ? `${weeksRemaining} أسابيع متبقية` : `${weeksRemaining} Weeks Left This Year`,
        description: isRTL
          ? `AED ${totalRemaining.toLocaleString('en-US')} من المزايا لن تُرحّل. راجع الآن لتحقيق أقصى استفادة.`
          : `AED ${totalRemaining.toLocaleString()} in benefits won't carry over. Review now to maximize your package.`,
        action: isRTL ? 'راجع الكل' : 'Review All',
        route: '/employee/benefits',
        priority: 'high',
      });
    }
    
    // 5. Savings/Financial planning insight
    if (financialBenefit) {
      const financialUtilization = financialBenefit.utilized / financialBenefit.value;
      if (financialUtilization < 1) {
        const matchAvailable = financialBenefit.value - financialBenefit.utilized;
        generatedInsights.push({
          id: 'savings-match',
          type: 'action',
          title: isRTL ? 'احصل على مطابقة صاحب العمل' : 'Claim Employer Match',
          description: isRTL
            ? `صاحب العمل يطابق مدخراتك حتى AED ${matchAvailable.toLocaleString('en-US')} سنوياً. ضاعف مدخراتك.`
            : `Your employer matches contributions up to AED ${matchAvailable.toLocaleString()}/year. Double your savings.`,
          action: isRTL ? 'زيادة المساهمة' : 'Increase Contribution',
          route: financialBenefit.route,
          priority: 'high',
        });
      }
    }
    
    // 6. Achievement for good utilizers
    if (fullyUtilizedCount >= 2) {
      generatedInsights.push({
        id: 'achievement-utilizer',
        type: 'achievement',
        title: isRTL ? 'أداء ممتاز!' : 'Great Utilization!',
        description: isRTL
          ? `${fullyUtilizedCount} مزايا مستخدمة بالكامل. أنت من أفضل ٢٠٪ من الموظفين في استخدام المزايا.`
          : `${fullyUtilizedCount} benefits fully utilized. You're in the top 20% of benefits users.`,
        priority: 'low',
      });
    }
    
    // 7. Transport/Flight tickets reminder mid-year
    if (currentMonth >= 5 && currentMonth <= 8 && transportBenefit) {
      const transportRemaining = transportBenefit.value - transportBenefit.utilized;
      if (transportRemaining > 10000) {
        generatedInsights.push({
          id: 'flight-reminder',
          type: 'reminder',
          title: isRTL ? 'تذاكر الطيران السنوية' : 'Annual Flight Tickets',
          description: isRTL
            ? `تذكر حجز تذاكر الإجازة السنوية. AED ${transportRemaining.toLocaleString('en-US')} متاحة للسفر.`
            : `Remember to book your annual leave flights. AED ${transportRemaining.toLocaleString()} available for travel.`,
          action: isRTL ? 'عرض التفاصيل' : 'View Details',
          route: transportBenefit.route,
          priority: 'medium',
        });
      }
    }

    // Sort by priority and limit to 3 most relevant
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return generatedInsights
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
      .slice(0, 3);
  }, [benefits, isRTL]);

  if (insights.length === 0) return null;

  const getInsightIcon = (type: InsightType) => {
    switch (type) {
      case 'action': return AlertTriangle;
      case 'opportunity': return Lightbulb;
      case 'achievement': return CheckCircle2;
      case 'reminder': return Clock;
      default: return Sparkles;
    }
  };

  const getInsightStyles = (type: InsightType, priority: 'high' | 'medium' | 'low') => {
    if (type === 'achievement') {
      return 'from-emerald-500/5 to-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40';
    }
    if (priority === 'high') {
      return 'from-amber-500/5 to-amber-500/10 border-amber-500/20 hover:border-amber-500/40';
    }
    return 'from-accent/5 to-accent/10 border-accent/20 hover:border-accent/40';
  };

  const getIconColor = (type: InsightType, priority: 'high' | 'medium' | 'low') => {
    if (type === 'achievement') return 'text-emerald-500 bg-emerald-500/10';
    if (priority === 'high') return 'text-amber-500 bg-amber-500/10';
    return 'text-accent bg-accent/10';
  };

  return (
    <Card className={cn(
      "border-accent/20 overflow-hidden",
      className
    )}>
      <CardHeader className="pb-3 border-b border-border/30">
        <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <div className="p-2 rounded-lg bg-gradient-to-br from-accent/20 to-accent/10">
              <Sparkles className="w-4 h-4 text-accent" />
            </div>
            <div>
              <CardTitle className={cn("text-sm font-display font-semibold", isRTL && "text-right")}>
                {isRTL ? 'رؤى ذكية' : 'Smart Insights'}
              </CardTitle>
              <p className={cn("text-xs text-muted-foreground", isRTL && "text-right")}>
                {isRTL ? 'توصيات مخصصة لتعظيم مزاياك' : 'Personalized recommendations to maximize your benefits'}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20 text-[10px]">
            <TrendingUp className="w-3 h-3 mr-1" />
            AI
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-2">
          {insights.map((insight, index) => {
            const Icon = getInsightIcon(insight.type);
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "p-3 rounded-lg border transition-all duration-300 cursor-pointer group bg-gradient-to-r",
                  getInsightStyles(insight.type, insight.priority)
                )}
                onClick={() => insight.route && navigate(insight.route)}
              >
                <div className={cn("flex items-start gap-3", isRTL && "flex-row-reverse")}>
                  <div className={cn("p-1.5 rounded-lg shrink-0", getIconColor(insight.type, insight.priority))}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
                    <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse justify-end")}>
                      <h4 className="font-medium text-xs">{insight.title}</h4>
                      {insight.priority === 'high' && (
                        <Badge className="bg-amber-500/10 text-amber-600 border-0 text-[9px] px-1 py-0">
                          {isRTL ? 'مهم' : 'Important'}
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                      {insight.description}
                    </p>
                  </div>
                  {insight.action && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-7 text-[10px] px-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {insight.action}
                      <ArrowRight className={cn("w-3 h-3 ml-1", isRTL && "rotate-180")} />
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
