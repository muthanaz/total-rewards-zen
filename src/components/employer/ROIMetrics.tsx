import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Target,
  Zap,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface ROIMetricsProps {
  className?: string;
}

export function ROIMetrics({ className }: ROIMetricsProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const isArabic = language === 'ar';

  const roiMetrics = [
    {
      id: 'cost-per-employee',
      label: { en: 'Cost Per Employee', ar: 'التكلفة لكل موظف' },
      value: 'AED 254K',
      trend: -3.2,
      benchmark: 'AED 268K',
      status: 'good' as const,
      icon: Users,
      color: 'emerald',
    },
    {
      id: 'retention-impact',
      label: { en: 'Retention Impact', ar: 'تأثير الاحتفاظ' },
      value: '+8.2%',
      trend: 2.1,
      benchmark: '+5% target',
      status: 'excellent' as const,
      icon: Target,
      color: 'blue',
    },
    {
      id: 'productivity-gain',
      label: { en: 'Productivity Gain', ar: 'مكاسب الإنتاجية' },
      value: '+12%',
      trend: 4.5,
      benchmark: 'Industry: +8%',
      status: 'excellent' as const,
      icon: Zap,
      color: 'purple',
    },
    {
      id: 'total-roi',
      label: { en: 'Total ROI', ar: 'العائد الإجمالي' },
      value: '3.2x',
      trend: 0.4,
      benchmark: 'Target: 2.5x',
      status: 'excellent' as const,
      icon: TrendingUp,
      color: 'amber',
    },
  ];

  const costBreakdown = [
    { category: { en: 'Cash Allowances', ar: 'البدلات النقدية' }, value: 45, amount: 'AED 27.9M' },
    { category: { en: 'Health & Insurance', ar: 'الصحة والتأمين' }, value: 22, amount: 'AED 13.6M' },
    { category: { en: 'Retirement & Gratuity', ar: 'التقاعد والمكافآت' }, value: 18, amount: 'AED 11.2M' },
    { category: { en: 'Learning & Growth', ar: 'التعلم والنمو' }, value: 8, amount: 'AED 5.0M' },
    { category: { en: 'Wellbeing & Perks', ar: 'الرفاهية والمزايا' }, value: 7, amount: 'AED 4.3M' },
  ];

  const getStatusColor = (status: 'excellent' | 'good' | 'fair' | 'poor') => {
    const colors = {
      excellent: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      good: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      fair: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      poor: 'bg-red-500/10 text-red-600 border-red-500/20',
    };
    return colors[status];
  };

  return (
    <Card className={cn("border-border/50", className)}>
      <CardHeader className="pb-2">
        <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
          <CardTitle className={cn(
            "text-base font-display font-semibold flex items-center gap-2",
            isRTL && "flex-row-reverse"
          )}>
            <DollarSign className="w-5 h-5 text-primary" />
            {isArabic ? 'مقاييس العائد على الاستثمار' : 'ROI Metrics'}
          </CardTitle>
          <InfoTooltip 
            formula="ROI calculated based on retention savings, productivity gains, and reduced absenteeism vs. total benefits spend." 
            dataSource="HR Analytics & Finance" 
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {roiMetrics.map((metric) => (
            <div 
              key={metric.id}
              className={cn(
                "p-3 rounded-lg border",
                getStatusColor(metric.status)
              )}
            >
              <div className={cn("flex items-start justify-between", isRTL && "flex-row-reverse")}>
                <div className={cn("p-1.5 rounded-lg bg-background/50")}>
                  <metric.icon className="w-4 h-4" />
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-xs",
                  metric.trend >= 0 ? "text-emerald-600" : "text-red-600"
                )}>
                  {metric.trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {metric.trend >= 0 ? '+' : ''}{metric.trend}%
                </div>
              </div>
              <div className={cn("mt-2", isRTL && "text-right")}>
                <p className="text-lg font-bold">{metric.value}</p>
                <p className="text-[10px] text-muted-foreground">
                  {isArabic ? metric.label.ar : metric.label.en}
                </p>
                <p className="text-[10px] mt-1 opacity-70">{metric.benchmark}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Cost Breakdown */}
        <div className="pt-3 border-t border-border/50">
          <p className={cn("text-xs font-medium mb-3", isRTL && "text-right")}>
            {isArabic ? 'توزيع التكاليف' : 'Cost Distribution'}
          </p>
          <div className="space-y-2">
            {costBreakdown.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className={cn("flex items-center justify-between text-xs", isRTL && "flex-row-reverse")}>
                  <span className="text-muted-foreground">
                    {isArabic ? item.category.ar : item.category.en}
                  </span>
                  <span className="font-medium">{item.amount}</span>
                </div>
                <Progress value={item.value} className="h-1.5" />
              </div>
            ))}
          </div>
        </div>

        {/* AI Insight */}
        <div className={cn(
          "p-3 rounded-lg bg-primary/5 border border-primary/20",
          isRTL && "text-right"
        )}>
          <div className={cn("flex items-start gap-2", isRTL && "flex-row-reverse")}>
            <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-primary">
                {isArabic ? 'رؤية ذكية' : 'AI Insight'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {isArabic 
                  ? 'تحسين استخدام برنامج التعلم والتطوير بنسبة 15% يمكن أن يزيد العائد الإجمالي إلى 3.5x'
                  : 'Improving L&D utilization by 15% could increase total ROI to 3.5x'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
