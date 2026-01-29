import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Lightbulb,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Eye,
  Users,
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { AnimatedLineChart } from '@/components/charts/AnimatedLineChart';

interface PerformanceMetric {
  id: string;
  label: string;
  labelAr: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  benchmark: number;
  status: 'above' | 'below' | 'at';
}

interface Insight {
  id: string;
  type: 'opportunity' | 'warning' | 'success';
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  action: string;
  actionAr: string;
  impact: string;
}

const performanceMetrics: PerformanceMetric[] = [
  { id: 'views', label: 'Daily Views', labelAr: 'المشاهدات اليومية', value: 425, change: 12, trend: 'up', benchmark: 380, status: 'above' },
  { id: 'conversion', label: 'Conversion Rate', labelAr: 'معدل التحويل', value: 18.5, change: -2.3, trend: 'down', benchmark: 15, status: 'above' },
  { id: 'avgOrder', label: 'Avg Transaction', labelAr: 'متوسط المعاملة', value: 145, change: 8, trend: 'up', benchmark: 120, status: 'above' },
  { id: 'repeatRate', label: 'Repeat Redemptions', labelAr: 'الاستردادات المتكررة', value: 23, change: 5, trend: 'up', benchmark: 30, status: 'below' },
];

const insights: Insight[] = [
  {
    id: 'i1',
    type: 'opportunity',
    title: 'Peak hours untapped',
    titleAr: 'ساعات الذروة غير مستغلة',
    description: 'Your offers get 40% more views between 12-2 PM. Consider time-limited flash offers.',
    descriptionAr: 'عروضك تحصل على ٤٠٪ مشاهدات أكثر بين ١٢-٢ ظهراً. فكر في عروض فلاش محدودة الوقت.',
    action: 'Create Flash Offer',
    actionAr: 'إنشاء عرض فلاش',
    impact: '+25% conversions',
  },
  {
    id: 'i2',
    type: 'warning',
    title: 'Repeat rate below benchmark',
    titleAr: 'معدل التكرار أقل من المعيار',
    description: 'Your repeat redemption rate (23%) is below the category average (30%). Consider loyalty incentives.',
    descriptionAr: 'معدل الاسترداد المتكرر لديك (٢٣٪) أقل من متوسط الفئة (٣٠٪). فكر في حوافز الولاء.',
    action: 'Add Loyalty Bonus',
    actionAr: 'إضافة مكافأة ولاء',
    impact: '+7% repeat rate',
  },
  {
    id: 'i3',
    type: 'success',
    title: 'Top performer this week',
    titleAr: 'الأفضل أداءً هذا الأسبوع',
    description: 'Your "20% Off Gym Membership" is in the top 5% of all offers by conversion rate.',
    descriptionAr: 'عرض "٢٠٪ خصم عضوية النادي" في أفضل ٥٪ من جميع العروض حسب معدل التحويل.',
    action: 'Boost Visibility',
    actionAr: 'تعزيز الظهور',
    impact: '+50% reach',
  },
];

const weeklyTrend = [
  { name: 'Mon', value: 380, secondaryValue: 68 },
  { name: 'Tue', value: 420, secondaryValue: 75 },
  { name: 'Wed', value: 395, secondaryValue: 71 },
  { name: 'Thu', value: 450, secondaryValue: 82 },
  { name: 'Fri', value: 520, secondaryValue: 95 },
  { name: 'Sat', value: 480, secondaryValue: 88 },
  { name: 'Sun', value: 425, secondaryValue: 78 },
];

export function PerformanceInsights() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'opportunity': return <Lightbulb className="w-5 h-5 text-accent" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-warning" />;
      case 'success': return <CheckCircle2 className="w-5 h-5 text-success" />;
    }
  };

  const getInsightStyle = (type: Insight['type']) => {
    switch (type) {
      case 'opportunity': return 'border-accent/30 bg-accent/5';
      case 'warning': return 'border-warning/30 bg-warning/5';
      case 'success': return 'border-success/30 bg-success/5';
    }
  };

  const getMetricIcon = (id: string) => {
    switch (id) {
      case 'views': return Eye;
      case 'conversion': return Target;
      case 'avgOrder': return DollarSign;
      case 'repeatRate': return Users;
      default: return BarChart3;
    }
  };

  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceMetrics.map((metric) => {
          const Icon = getMetricIcon(metric.id);
          return (
            <Card key={metric.id}>
              <CardContent className="p-4">
                <div className={cn("flex items-center justify-between mb-2", isRTL && "flex-row-reverse")}>
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Icon className="w-4 h-4 text-accent" />
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 text-xs font-medium",
                    metric.trend === 'up' ? 'text-success' : metric.trend === 'down' ? 'text-destructive' : 'text-muted-foreground',
                    isRTL && "flex-row-reverse"
                  )}>
                    {metric.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : 
                     metric.trend === 'down' ? <TrendingDown className="w-3 h-3" /> : null}
                    {metric.change > 0 ? '+' : ''}{metric.change}%
                  </div>
                </div>
                <p className="text-2xl font-bold">
                  {metric.id === 'conversion' || metric.id === 'repeatRate' 
                    ? `${metric.value}%` 
                    : metric.id === 'avgOrder' 
                      ? `AED ${metric.value}` 
                      : metric.value.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'ar' ? metric.labelAr : metric.label}
                </p>
                <div className="mt-3">
                  <div className={cn("flex items-center justify-between text-xs mb-1", isRTL && "flex-row-reverse")}>
                    <span className="text-muted-foreground">{t('vs benchmark', 'مقارنة بالمعيار')}</span>
                    <span className={cn(
                      "font-medium",
                      metric.status === 'above' ? 'text-success' : metric.status === 'below' ? 'text-warning' : 'text-muted-foreground'
                    )}>
                      {metric.benchmark}{metric.id === 'conversion' || metric.id === 'repeatRate' ? '%' : ''}
                    </span>
                  </div>
                  <Progress 
                    value={(metric.value / metric.benchmark) * 100} 
                    className={cn(
                      "h-1.5",
                      metric.status === 'above' ? '[&>div]:bg-success' : 
                      metric.status === 'below' ? '[&>div]:bg-warning' : ''
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Calendar className="w-5 h-5 text-accent" />
              {t('Weekly Performance', 'الأداء الأسبوعي')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AnimatedLineChart
              data={weeklyTrend}
              showSecondary={true}
              primaryLabel={t('Views', 'المشاهدات')}
              secondaryLabel={t('Redemptions', 'الاستردادات')}
              height={220}
            />
          </CardContent>
        </Card>

        {/* System Insights */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Sparkles className="w-5 h-5 text-accent" />
              {t('Performance Insights', 'رؤى الأداء')}
            </CardTitle>
            <CardDescription>
              {t('Actionable recommendations based on your data', 'توصيات قابلة للتنفيذ بناءً على بياناتك')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.map((insight) => (
                <div 
                  key={insight.id}
                  className={cn(
                    "p-4 rounded-xl border transition-all hover:shadow-sm",
                    getInsightStyle(insight.type),
                    isRTL && "text-right"
                  )}
                >
                  <div className={cn("flex items-start gap-3", isRTL && "flex-row-reverse")}>
                    <div className="shrink-0 mt-0.5">
                      {getInsightIcon(insight.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">
                        {language === 'ar' ? insight.titleAr : insight.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {language === 'ar' ? insight.descriptionAr : insight.description}
                      </p>
                      <div className={cn("flex items-center gap-3 mt-3", isRTL && "flex-row-reverse")}>
                        <Button variant="outline" size="sm" className="gap-1 text-xs h-7">
                          {language === 'ar' ? insight.actionAr : insight.action}
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                        <Badge variant="outline" className="text-[10px] bg-accent/10 text-accent border-accent/20">
                          {insight.impact}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
