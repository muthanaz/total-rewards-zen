import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Lightbulb, ArrowRight, Sparkles, TrendingUp, Gift, 
  GraduationCap, Heart, Dumbbell, PiggyBank 
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface Benefit {
  name: string;
  nameKey: string;
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  utilized: number;
  route: string;
}

interface PersonalizedRecommendationsProps {
  benefits: Benefit[];
  className?: string;
}

export function PersonalizedRecommendations({ benefits, className }: PersonalizedRecommendationsProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const navigate = useNavigate();

  // Get underutilized benefits (less than 50% used)
  const underutilizedBenefits = benefits
    .map(b => ({
      ...b,
      utilization: Math.round((b.utilized / b.value) * 100),
      remaining: b.value - b.utilized,
    }))
    .filter(b => b.utilization < 50)
    .sort((a, b) => a.utilization - b.utilization)
    .slice(0, 4);

  // Generate personalized recommendations
  const recommendations = underutilizedBenefits.map(benefit => {
    let tip = '';
    let urgency: 'high' | 'medium' | 'low' = 'medium';
    
    if (benefit.name.includes('Health')) {
      tip = isRTL 
        ? 'احجز فحصاً طبياً - التغطية تنتهي في ديسمبر'
        : 'Book a health check-up - coverage expires in December';
      urgency = 'high';
    } else if (benefit.name.includes('Learning')) {
      tip = isRTL
        ? 'استكشف الدورات المتاحة لتطوير مهاراتك'
        : 'Explore available courses to upskill';
      urgency = 'medium';
    } else if (benefit.name.includes('Wellbeing')) {
      tip = isRTL
        ? 'فعّل عضوية النادي الرياضي أو اشتراك تطبيق اللياقة'
        : 'Activate gym membership or fitness app subscription';
      urgency = 'medium';
    } else if (benefit.name.includes('Financial')) {
      tip = isRTL
        ? 'راجع خيارات الادخار للحصول على مطابقة صاحب العمل'
        : 'Review savings options to get employer matching';
      urgency = 'high';
    } else {
      tip = isRTL
        ? `لديك ${benefit.remaining.toLocaleString('ar-AE')} درهم متبقي`
        : `You have ${formatCurrencyAED(benefit.remaining, { abbreviate: false })} remaining`;
    }

    return {
      ...benefit,
      tip,
      urgency,
    };
  });

  const totalUnused = underutilizedBenefits.reduce((sum, b) => sum + b.remaining, 0);

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Card className={cn(
      "border-accent/20 overflow-hidden bg-gradient-to-br from-card via-card to-accent/5",
      className
    )}>
      <CardHeader className="pb-3 border-b border-border/30">
        <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <div className="p-2 rounded-lg bg-accent/10">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <div>
              <CardTitle className={cn("text-base font-display font-semibold", isRTL && "text-right")}>
                {isRTL ? 'توصيات مخصصة لك' : 'Personalized for You'}
              </CardTitle>
              <p className={cn("text-xs text-muted-foreground", isRTL && "text-right")}>
                {isRTL 
                  ? `${totalUnused.toLocaleString('ar-AE')} درهم من المزايا غير مستخدمة`
                  : `AED ${totalUnused.toLocaleString()} in benefits waiting to be used`
                }
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
            {recommendations.length} {isRTL ? 'فرص' : 'opportunities'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recommendations.map((rec, index) => (
            <motion.div
              key={rec.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "p-4 rounded-xl border transition-all duration-300 cursor-pointer group",
                rec.urgency === 'high' 
                  ? "bg-gradient-to-r from-amber-500/5 to-amber-500/10 border-amber-500/20 hover:border-amber-500/40" 
                  : "bg-gradient-to-r from-accent/5 to-accent/10 border-accent/20 hover:border-accent/40"
              )}
              onClick={() => navigate(rec.route)}
            >
              <div className={cn("flex items-start gap-3", isRTL && "flex-row-reverse")}>
                <div className={cn(
                  "p-2 rounded-lg shrink-0",
                  rec.urgency === 'high' ? "bg-amber-500/10" : "bg-accent/10"
                )}>
                  <rec.icon className={cn(
                    "w-4 h-4",
                    rec.urgency === 'high' ? "text-amber-500" : "text-accent"
                  )} />
                </div>
                <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
                  <div className={cn("flex items-center gap-2 mb-1", isRTL && "flex-row-reverse justify-end")}>
                    <h4 className="font-medium text-sm truncate">{rec.name}</h4>
                    {rec.urgency === 'high' && (
                      <Badge className="bg-amber-500/10 text-amber-600 border-0 text-[10px] px-1.5">
                        {isRTL ? 'عاجل' : 'Urgent'}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{rec.tip}</p>
                  <div className="mt-2 space-y-1.5">
                    <div className={cn("flex items-center justify-between text-[10px]", isRTL && "flex-row-reverse")}>
                      <span className="text-muted-foreground">
                        {isRTL ? 'نسبة الاستخدام' : 'Utilization'}
                      </span>
                      <span className={rec.utilization < 30 ? "text-amber-600 font-medium" : "text-muted-foreground"}>
                        {rec.utilization}%
                      </span>
                    </div>
                    <Progress 
                      value={rec.utilization} 
                      className={cn(
                        "h-1",
                        rec.utilization < 30 ? "[&>div]:bg-amber-500" : "[&>div]:bg-accent"
                      )} 
                    />
                    <p className={cn("text-[10px] text-muted-foreground", isRTL && "text-right")}>
                      {isRTL 
                        ? `${rec.remaining.toLocaleString('ar-AE')} درهم متبقي`
                        : `AED ${rec.remaining.toLocaleString()} remaining`
                      }
                    </p>
                  </div>
                </div>
                <ArrowRight className={cn(
                  "w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all shrink-0 mt-1",
                  !isRTL && "group-hover:translate-x-0.5",
                  isRTL && "rotate-180 group-hover:-translate-x-0.5"
                )} />
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
