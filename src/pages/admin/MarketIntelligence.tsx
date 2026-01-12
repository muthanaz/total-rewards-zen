import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  TrendingUp, 
  Target, 
  Lightbulb, 
  ShoppingBag,
  Heart,
  Zap,
  BookOpen,
  Home,
  Car,
  GraduationCap,
  Wallet,
  Download,
  RefreshCw,
  Filter,
  Eye,
  MousePointer,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { AnimatedBarChart } from '@/components/charts/AnimatedBarChart';
import { AnimatedDonutChart } from '@/components/charts/AnimatedDonutChart';
import { AnimatedLineChart } from '@/components/charts/AnimatedLineChart';
import { toast } from 'sonner';

const highIntentSegments = [
  { 
    segment: 'Young Professionals (25-35)', 
    size: 3240,
    intent: 'Career Growth',
    topInterests: ['Learning', 'Equity', 'Wellness'],
    conversionPotential: 85,
    avgEngagement: 4.2,
    opportunity: 'Premium learning subscriptions',
    revenue: 580000,
  },
  { 
    segment: 'Working Parents (30-45)', 
    size: 2890,
    intent: 'Family Support',
    topInterests: ['Education', 'Health', 'Housing'],
    conversionPotential: 92,
    avgEngagement: 5.1,
    opportunity: 'School fee support expansion',
    revenue: 1250000,
  },
  { 
    segment: 'Senior Executives (45+)', 
    size: 980,
    intent: 'Premium Health',
    topInterests: ['Health', 'Wellness', 'Financial'],
    conversionPotential: 78,
    avgEngagement: 3.8,
    opportunity: 'Executive health packages',
    revenue: 890000,
  },
  { 
    segment: 'Remote Workers', 
    size: 1560,
    intent: 'Flexibility',
    topInterests: ['WFH Setup', 'Wellness', 'Transport'],
    conversionPotential: 72,
    avgEngagement: 4.5,
    opportunity: 'Home office allowances',
    revenue: 320000,
  },
  { 
    segment: 'New Hires (<1 year)', 
    size: 2100,
    intent: 'Onboarding Benefits',
    topInterests: ['Housing', 'Transport', 'Health'],
    conversionPotential: 88,
    avgEngagement: 4.8,
    opportunity: 'Relocation packages',
    revenue: 720000,
  },
];

const behaviorPatterns = [
  { behavior: 'Frequent benefit browsers', count: 4250, percentage: 33, trend: 'up' },
  { behavior: 'Single benefit focused', count: 3100, percentage: 24, trend: 'stable' },
  { behavior: 'Benefits maximizers', count: 2800, percentage: 22, trend: 'up' },
  { behavior: 'Occasional users', count: 1650, percentage: 13, trend: 'down' },
  { behavior: 'Non-engaged', count: 1047, percentage: 8, trend: 'down' },
];

const intentSignals = [
  { signal: 'Housing page views > 5/month', users: 1850, conversion: 78, value: 'High' },
  { signal: 'Education calculator usage', users: 1420, conversion: 85, value: 'Very High' },
  { signal: 'Health plan comparisons', users: 2100, conversion: 72, value: 'High' },
  { signal: 'Savings goal setting', users: 980, conversion: 65, value: 'Medium' },
  { signal: 'Marketplace repeat visits', users: 3200, conversion: 45, value: 'Medium' },
];

const engagementMetrics = [
  { name: 'Jan', value: 3.2, secondaryValue: 42 },
  { name: 'Feb', value: 3.5, secondaryValue: 45 },
  { name: 'Mar', value: 3.8, secondaryValue: 52 },
  { name: 'Apr', value: 4.1, secondaryValue: 58 },
  { name: 'May', value: 4.3, secondaryValue: 62 },
  { name: 'Jun', value: 4.5, secondaryValue: 68 },
];

const perkCategoryDistribution = [
  { name: 'Lifestyle', value: 35, color: 'hsl(174 60% 45%)' },
  { name: 'Health & Wellness', value: 25, color: 'hsl(340 65% 55%)' },
  { name: 'Food & Dining', value: 20, color: 'hsl(38 92% 50%)' },
  { name: 'Travel', value: 12, color: 'hsl(199 89% 48%)' },
  { name: 'Entertainment', value: 8, color: 'hsl(262 52% 55%)' },
];

const topPerks = [
  { name: 'Careem Rides 20% Off', activations: 4520, revenue: 180000, rating: 4.8 },
  { name: 'Talabat Premium', activations: 3890, revenue: 156000, rating: 4.6 },
  { name: 'Fitness First Discount', activations: 2850, revenue: 285000, rating: 4.7 },
  { name: 'Noon Express Free', activations: 2340, revenue: 94000, rating: 4.5 },
  { name: 'Amazon Prime', activations: 1980, revenue: 79000, rating: 4.4 },
];

export default function AdminMarketIntelligence() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const [timeframe, setTimeframe] = useState('30d');

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const handleExport = () => {
    toast.success(t('Report exported successfully', 'تم تصدير التقرير بنجاح'));
  };

  const getIntentIcon = (intent: string) => {
    const icons: Record<string, React.ElementType> = {
      'Career Growth': BookOpen,
      'Family Support': Heart,
      'Premium Health': Heart,
      'Flexibility': Zap,
      'Onboarding Benefits': Home,
    };
    return icons[intent] || Target;
  };

  return (
    <div className={cn("space-y-8", isRTL && "text-right")}>
      {/* Header */}
      <div className={cn("flex flex-col md:flex-row md:items-center md:justify-between gap-4", isRTL && "md:flex-row-reverse")}>
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            {t('Market Intelligence Hub', 'مركز ذكاء السوق')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('Deep insights into user behavior, intent signals, and market opportunities', 'رؤى عميقة حول سلوك المستخدم وإشارات النوايا وفرص السوق')}
          </p>
        </div>
        <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">{t('Last 7 days', 'آخر 7 أيام')}</SelectItem>
              <SelectItem value="30d">{t('Last 30 days', 'آخر 30 يوم')}</SelectItem>
              <SelectItem value="90d">{t('Last 90 days', 'آخر 90 يوم')}</SelectItem>
              <SelectItem value="1y">{t('Last year', 'السنة الماضية')}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('Refresh', 'تحديث')}
          </Button>
          <Button size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            {t('Export', 'تصدير')}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: t('High-Intent Users', 'المستخدمون ذوو النوايا العالية'), value: '4,850', change: '+18%', icon: Target },
          { label: t('Avg Engagement Score', 'متوسط درجة التفاعل'), value: '4.3/5', change: '+0.4', icon: Zap },
          { label: t('Conversion Rate', 'معدل التحويل'), value: '72%', change: '+5%', icon: TrendingUp },
          { label: t('Revenue Opportunity', 'فرصة الإيرادات'), value: 'AED 3.8M', change: '+22%', icon: Wallet },
        ].map((metric) => (
          <Card key={metric.label}>
            <CardContent className="p-6">
              <div className={cn("flex items-start justify-between", isRTL && "flex-row-reverse")}>
                <div>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="text-2xl font-bold mt-1">{metric.value}</p>
                  <p className="text-sm text-green-500 mt-1">{metric.change}</p>
                </div>
                <div className="p-3 rounded-xl bg-primary/10">
                  <metric.icon className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="segments" className="space-y-6">
        <TabsList>
          <TabsTrigger value="segments">{t('User Segments', 'شرائح المستخدمين')}</TabsTrigger>
          <TabsTrigger value="intent">{t('Intent Signals', 'إشارات النوايا')}</TabsTrigger>
          <TabsTrigger value="perks">{t('Perk Analytics', 'تحليلات الامتيازات')}</TabsTrigger>
          <TabsTrigger value="opportunities">{t('Opportunities', 'الفرص')}</TabsTrigger>
        </TabsList>

        <TabsContent value="segments" className="space-y-6">
          {/* High Intent Segments */}
          <div className="grid grid-cols-1 gap-4">
            {highIntentSegments.map((segment) => {
              const IntentIcon = getIntentIcon(segment.intent);
              return (
                <Card key={segment.segment}>
                  <CardContent className="p-6">
                    <div className={cn("flex flex-col lg:flex-row lg:items-center gap-6", isRTL && "lg:flex-row-reverse")}>
                      <div className="flex-1">
                        <div className={cn("flex items-center gap-3 mb-3", isRTL && "flex-row-reverse")}>
                          <div className="p-2 rounded-lg bg-primary/10">
                            <IntentIcon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{segment.segment}</h3>
                            <p className="text-sm text-muted-foreground">
                              {segment.size.toLocaleString()} {t('users', 'مستخدم')} • {t('Primary Intent:', 'النية الأساسية:')} {segment.intent}
                            </p>
                          </div>
                        </div>
                        <div className={cn("flex flex-wrap gap-2", isRTL && "flex-row-reverse")}>
                          {segment.topInterests.map((interest) => (
                            <Badge key={interest} variant="secondary">{interest}</Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-6 lg:w-1/2">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{segment.conversionPotential}%</p>
                          <p className="text-xs text-muted-foreground">{t('Conversion', 'التحويل')}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">{segment.avgEngagement}</p>
                          <p className="text-xs text-muted-foreground">{t('Engagement', 'التفاعل')}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-500">AED {(segment.revenue / 1000).toFixed(0)}K</p>
                          <p className="text-xs text-muted-foreground">{t('Revenue', 'الإيرادات')}</p>
                        </div>
                      </div>

                      <div className={cn("lg:w-1/4", isRTL && "text-right")}>
                        <p className="text-sm text-muted-foreground mb-1">{t('Opportunity', 'الفرصة')}</p>
                        <p className="font-medium text-primary">{segment.opportunity}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Behavior Patterns */}
          <Card>
            <CardHeader>
              <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <MousePointer className="w-5 h-5 text-primary" />
                {t('User Behavior Patterns', 'أنماط سلوك المستخدم')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {behaviorPatterns.map((pattern) => (
                  <div key={pattern.behavior} className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
                    <div className="flex-1">
                      <div className={cn("flex items-center justify-between mb-1", isRTL && "flex-row-reverse")}>
                        <span className="font-medium">{pattern.behavior}</span>
                        <span className="text-sm text-muted-foreground">
                          {pattern.count.toLocaleString()} {t('users', 'مستخدم')}
                        </span>
                      </div>
                      <Progress value={pattern.percentage} className="h-2" />
                    </div>
                    <Badge variant={pattern.trend === 'up' ? 'default' : pattern.trend === 'down' ? 'destructive' : 'secondary'}>
                      {pattern.trend === 'up' ? '↑' : pattern.trend === 'down' ? '↓' : '→'} {pattern.percentage}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="intent" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <Eye className="w-5 h-5 text-primary" />
                  {t('Intent Signals Detected', 'إشارات النوايا المكتشفة')}
                </CardTitle>
                <CardDescription>
                  {t('Behavioral indicators predicting user actions', 'المؤشرات السلوكية التي تتنبأ بإجراءات المستخدم')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {intentSignals.map((signal) => (
                    <div key={signal.signal} className="p-4 rounded-lg border">
                      <div className={cn("flex items-start justify-between mb-2", isRTL && "flex-row-reverse")}>
                        <div>
                          <p className="font-medium">{signal.signal}</p>
                          <p className="text-sm text-muted-foreground">
                            {signal.users.toLocaleString()} {t('users matched', 'مستخدم مطابق')}
                          </p>
                        </div>
                        <Badge variant={signal.value === 'Very High' ? 'default' : signal.value === 'High' ? 'secondary' : 'outline'}>
                          {signal.value}
                        </Badge>
                      </div>
                      <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                        <span className="text-sm">{t('Conversion:', 'التحويل:')}</span>
                        <Progress value={signal.conversion} className="flex-1 h-2" />
                        <span className="text-sm font-medium">{signal.conversion}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <Clock className="w-5 h-5 text-primary" />
                  {t('Engagement Trends', 'اتجاهات التفاعل')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatedLineChart
                  data={engagementMetrics}
                  height={280}
                  showSecondary
                  primaryLabel={t('Avg Score', 'متوسط الدرجة')}
                  secondaryLabel={t('Active Sessions', 'الجلسات النشطة')}
                  showArea
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="perks" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('Perk Categories', 'فئات الامتيازات')}</CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatedDonutChart
                  data={perkCategoryDistribution}
                  height={200}
                  innerRadius={50}
                  outerRadius={80}
                />
                <div className="mt-4 space-y-2">
                  {perkCategoryDistribution.map((cat) => (
                    <div key={cat.name} className={cn("flex items-center justify-between text-sm", isRTL && "flex-row-reverse")}>
                      <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span>{cat.name}</span>
                      </div>
                      <span className="font-medium">{cat.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <ShoppingBag className="w-5 h-5 text-primary" />
                  {t('Top Performing Perks', 'أفضل الامتيازات أداءً')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className={cn("py-3 text-left font-medium", isRTL && "text-right")}>{t('Perk', 'الامتياز')}</th>
                        <th className={cn("py-3 text-left font-medium", isRTL && "text-right")}>{t('Activations', 'التفعيلات')}</th>
                        <th className={cn("py-3 text-left font-medium", isRTL && "text-right")}>{t('Revenue', 'الإيرادات')}</th>
                        <th className={cn("py-3 text-left font-medium", isRTL && "text-right")}>{t('Rating', 'التقييم')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topPerks.map((perk, index) => (
                        <tr key={perk.name} className="border-b last:border-0">
                          <td className="py-4">
                            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                              <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                                {index + 1}
                              </span>
                              <span className="font-medium">{perk.name}</span>
                            </div>
                          </td>
                          <td className="py-4">{perk.activations.toLocaleString()}</td>
                          <td className="py-4">AED {perk.revenue.toLocaleString()}</td>
                          <td className="py-4">
                            <Badge variant="secondary">⭐ {perk.rating}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <Lightbulb className="w-5 h-5 text-primary" />
                {t('AI-Identified Opportunities', 'الفرص المحددة بالذكاء الاصطناعي')}
              </CardTitle>
              <CardDescription>
                {t('Strategic recommendations based on data analysis', 'التوصيات الاستراتيجية بناءً على تحليل البيانات')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    title: t('Education Benefit Expansion', 'توسيع مزايا التعليم'),
                    description: t('38% of working parents show high intent for additional schooling support', '38% من الآباء العاملين يظهرون نية عالية للحصول على دعم تعليمي إضافي'),
                    impact: 'AED 2.4M',
                    confidence: 92,
                    icon: GraduationCap,
                  },
                  {
                    title: t('Remote Work Package', 'حزمة العمل عن بعد'),
                    description: t('Growing segment of remote workers seeking home office benefits', 'شريحة متنامية من العاملين عن بعد يبحثون عن مزايا المكتب المنزلي'),
                    impact: 'AED 850K',
                    confidence: 78,
                    icon: Home,
                  },
                  {
                    title: t('Transport Optimization', 'تحسين النقل'),
                    description: t('Underutilized transport benefits present upselling opportunity', 'مزايا النقل غير المستغلة تمثل فرصة للبيع الإضافي'),
                    impact: 'AED 620K',
                    confidence: 85,
                    icon: Car,
                  },
                  {
                    title: t('Wellness Program Bundle', 'حزمة برنامج العافية'),
                    description: t('Senior executives showing 45% increase in health-related searches', 'المدراء التنفيذيون يظهرون زيادة 45% في البحث عن الصحة'),
                    impact: 'AED 1.1M',
                    confidence: 88,
                    icon: Heart,
                  },
                ].map((opp) => (
                  <Card key={opp.title} className="border-dashed">
                    <CardContent className="p-6">
                      <div className={cn("flex items-start gap-4", isRTL && "flex-row-reverse")}>
                        <div className="p-3 rounded-xl bg-primary/10">
                          <opp.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg mb-2">{opp.title}</h4>
                          <p className="text-sm text-muted-foreground mb-4">{opp.description}</p>
                          <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                            <div>
                              <p className="text-sm text-muted-foreground">{t('Potential Impact', 'التأثير المحتمل')}</p>
                              <p className="text-xl font-bold text-green-500">{opp.impact}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">{t('Confidence', 'الثقة')}</p>
                              <Badge variant="secondary">{opp.confidence}%</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
