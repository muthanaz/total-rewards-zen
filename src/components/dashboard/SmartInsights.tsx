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

  // Generate AI-powered insights based on benefits data
  const insights = useMemo<Insight[]>(() => {
    const generatedInsights: Insight[] = [];
    const now = new Date();
    const currentMonth = now.getMonth();
    const daysInYear = 365;
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const yearProgress = dayOfYear / daysInYear;

    // Analyze each benefit for insights
    benefits.forEach(benefit => {
      const utilization = benefit.utilized / benefit.value;
      const remaining = benefit.value - benefit.utilized;

      // Underutilization warning (less than expected for this time of year)
      if (utilization < yearProgress * 0.7 && remaining > 5000) {
        if (benefit.name.includes('Health')) {
          generatedInsights.push({
            id: `health-checkup-${benefit.name}`,
            type: 'action',
            title: isRTL ? 'حان وقت الفحص الطبي' : 'Schedule Your Health Check-up',
            description: isRTL 
              ? `لديك ${remaining.toLocaleString('ar-AE')} درهم متبقية في التأمين الصحي. الفحوصات السنوية مغطاة بالكامل.`
              : `You have AED ${remaining.toLocaleString()} remaining in health insurance. Annual check-ups are fully covered.`,
            action: isRTL ? 'احجز الآن' : 'Book Now',
            route: benefit.route,
            priority: 'high',
          });
        } else if (benefit.name.includes('Learning')) {
          generatedInsights.push({
            id: `learning-${benefit.name}`,
            type: 'opportunity',
            title: isRTL ? 'استثمر في تطويرك' : 'Invest in Your Growth',
            description: isRTL
              ? `${remaining.toLocaleString('ar-AE')} درهم متاحة للتعلم. استكشف الدورات المعتمدة.`
              : `AED ${remaining.toLocaleString()} available for learning. Explore certified courses.`,
            action: isRTL ? 'استكشف الدورات' : 'Explore Courses',
            route: benefit.route,
            priority: 'medium',
          });
        } else if (benefit.name.includes('Wellbeing')) {
          generatedInsights.push({
            id: `wellbeing-${benefit.name}`,
            type: 'opportunity',
            title: isRTL ? 'عزز صحتك النفسية والجسدية' : 'Boost Your Wellness',
            description: isRTL
              ? `فعّل عضوية النادي الرياضي أو تطبيقات الصحة. ${remaining.toLocaleString('ar-AE')} درهم متبقية.`
              : `Activate gym membership or wellness apps. AED ${remaining.toLocaleString()} remaining.`,
            action: isRTL ? 'اكتشف الخيارات' : 'Discover Options',
            route: benefit.route,
            priority: 'medium',
          });
        }
      }

      // Achievement - fully utilized
      if (utilization >= 1) {
        generatedInsights.push({
          id: `achievement-${benefit.name}`,
          type: 'achievement',
          title: isRTL ? `${benefit.name} - مستخدم بالكامل` : `${benefit.name} - Fully Utilized`,
          description: isRTL
            ? 'أحسنت! استخدمت هذه الميزة بالكامل.'
            : 'Great job! You\'ve fully utilized this benefit.',
          priority: 'low',
        });
      }
    });

    // Time-based reminders
    if (currentMonth >= 9) { // October onwards
      const unusedTotal = benefits.reduce((sum, b) => sum + (b.value - b.utilized), 0);
      if (unusedTotal > 20000) {
        generatedInsights.push({
          id: 'year-end-reminder',
          type: 'reminder',
          title: isRTL ? 'تذكير نهاية السنة' : 'Year-End Reminder',
          description: isRTL
            ? `لديك ${unusedTotal.toLocaleString('ar-AE')} درهم من المزايا غير المستخدمة. بعض المزايا لا تُرحّل للسنة القادمة.`
            : `You have AED ${unusedTotal.toLocaleString()} in unused benefits. Some benefits don't carry over to next year.`,
          action: isRTL ? 'راجع المزايا' : 'Review Benefits',
          route: '/employee/benefits',
          priority: 'high',
        });
      }
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return generatedInsights
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
      .slice(0, 3); // Show max 3 insights
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
