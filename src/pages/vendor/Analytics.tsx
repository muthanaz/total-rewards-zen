import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  TrendingUp,
  Eye,
  Users,
  Target,
  Download,
  Calendar,
  BarChart3,
  FlaskConical,
  AlertCircle,
} from 'lucide-react';
import { cn, formatInteger, formatPercent, formatCurrencyAED } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { AnimatedLineChart } from '@/components/charts/AnimatedLineChart';
import { AnimatedBarChart } from '@/components/charts/AnimatedBarChart';
import { AnimatedDonutChart } from '@/components/charts/AnimatedDonutChart';
import { PageLayout, MetricCard, MetricGrid } from '@/components/shared';
import { useVendorAnalytics, useVendorOffers } from '@/hooks/useVendorData';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { EmptyState } from '@/components/ui/empty-state';

export default function VendorAnalytics() {
  const { language, direction } = useLanguage();
  const { isDemoMode } = useDemoMode();
  const isRTL = direction === 'rtl';
  const [timeRange, setTimeRange] = useState('30days');
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const { data: analytics, isLoading } = useVendorAnalytics();
  const { data: offers } = useVendorOffers();

  // Determine if we have real data
  const hasRealData = (analytics?.totalActivations || 0) > 0 || (offers?.length || 0) > 0;
  const showData = isDemoMode || hasRealData;

  // Demo data - only shown in demo mode or when real data exists
  const summaryMetrics = [
    { 
      title: t('Total Views', 'إجمالي المشاهدات'), 
      value: formatInteger(analytics?.totalActivations || 45620), 
      change: 18, 
      positive: true, 
      icon: Eye 
    },
    { 
      title: t('Total Redemptions', 'إجمالي الاستردادات'), 
      value: formatInteger(analytics?.totalRedemptions || 8470), 
      change: 12, 
      positive: true, 
      icon: Users 
    },
    { 
      title: t('Conversion Rate', 'معدل التحويل'), 
      value: formatPercent(analytics?.conversionRate || 18.6), 
      change: 2.3, 
      positive: true, 
      icon: Target 
    },
    { 
      title: t('Avg. Order Value', 'متوسط قيمة الطلب'), 
      value: formatCurrencyAED(analytics?.estimatedEarnings ? (analytics.estimatedEarnings / (analytics.totalRedemptions || 1)) : 285), 
      change: 3, 
      positive: false, 
      icon: TrendingUp 
    },
  ];

  const viewsTrendData = analytics?.activationsByDate?.map(d => ({
    name: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: d.count * 5, // Estimated views
    secondaryValue: d.count,
  })) || [
    { name: 'Jul', value: 5200, secondaryValue: 820 },
    { name: 'Aug', value: 6100, secondaryValue: 980 },
    { name: 'Sep', value: 7400, secondaryValue: 1250 },
    { name: 'Oct', value: 8200, secondaryValue: 1480 },
    { name: 'Nov', value: 9100, secondaryValue: 1720 },
    { name: 'Dec', value: 9620, secondaryValue: 2220 },
  ];

  const offerPerformance = analytics?.topOffers?.map(o => ({
    name: o.title.substring(0, 15),
    value: o.activations,
  })) || [
    { name: 'Gym 20%', value: 1250 },
    { name: 'Wellness App', value: 890 },
    { name: 'Health Check', value: 720 },
    { name: 'Spa BOGO', value: 1102 },
    { name: 'Dental 30%', value: 560 },
  ];

  const categoryBreakdown = analytics?.activationsByCategory?.map((c, i) => ({
    name: c.category,
    value: c.count,
    color: ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--destructive))', 'hsl(var(--warning))'][i % 4],
  })) || [
    { name: 'Fitness', value: 42, color: 'hsl(var(--primary))' },
    { name: 'Wellness', value: 28, color: 'hsl(var(--accent))' },
    { name: 'Health', value: 20, color: 'hsl(var(--destructive))' },
    { name: 'Other', value: 10, color: 'hsl(var(--warning))' },
  ];

  return (
    <PageLayout
      title={t('Analytics', 'التحليلات')}
      description={t('Aggregated performance insights for your offers', 'رؤى الأداء المجمعة لعروضك')}
      icon={BarChart3}
      iconClassName="text-primary"
      badge={{
        label: t('Beta', 'تجريبي'),
        variant: 'warning',
        icon: FlaskConical,
      }}
      actions={
        <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">{t('Last 7 Days', 'آخر 7 أيام')}</SelectItem>
              <SelectItem value="30days">{t('Last 30 Days', 'آخر 30 يوم')}</SelectItem>
              <SelectItem value="90days">{t('Last 90 Days', 'آخر 90 يوم')}</SelectItem>
              <SelectItem value="12months">{t('Last 12 Months', 'آخر 12 شهر')}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2" disabled={!showData}>
            <Download className="w-4 h-4" />
            {t('Export', 'تصدير')}
          </Button>
        </div>
      }
    >
      {/* Beta Notice */}
      <Card className="mb-6 border-warning/30 bg-warning/5">
        <CardContent className="pt-4 pb-4">
          <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
            <FlaskConical className="w-5 h-5 text-warning shrink-0" />
            <div className={cn(isRTL && "text-right")}>
              <p className="text-sm font-medium text-foreground">
                {t('Analytics Beta', 'التحليلات تجريبية')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t(
                  'Analytics are aggregated across all activations. Individual employee data is never exposed. More metrics will be added as data accumulates.',
                  'يتم تجميع التحليلات عبر جميع التفعيلات. لا يتم الكشف عن بيانات الموظفين الفردية. سيتم إضافة المزيد من المقاييس مع تراكم البيانات.'
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Show zero state if no data and not in demo mode */}
      {!showData ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-16">
            <EmptyState
              icon={BarChart3}
              title={t('Waiting for Activations', 'في انتظار التفعيلات')}
              description={t(
                'Analytics will populate once employees start activating your offers. Create an offer to get started.',
                'ستظهر التحليلات بمجرد أن يبدأ الموظفون في تفعيل عروضك. أنشئ عرضًا للبدء.'
              )}
              action={{
                label: t('Create Offer', 'إنشاء عرض'),
                onClick: () => window.location.href = '/vendor/offers/new',
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Metrics */}
          <MetricGrid columns={4}>
            {summaryMetrics.map((metric, i) => (
              <MetricCard
                key={i}
                title={metric.title}
                value={metric.value}
                icon={metric.icon}
                trend={{ value: metric.change, higherIsBetter: metric.positive }}
              />
            ))}
          </MetricGrid>

          {/* Main Content */}
          <Tabs defaultValue="overview" className="space-y-6 mt-6">
            <TabsList>
              <TabsTrigger value="overview">{t('Overview', 'نظرة عامة')}</TabsTrigger>
              <TabsTrigger value="offers">{t('By Offer', 'حسب العرض')}</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader className={cn(isRTL && "text-right")}>
                    <CardTitle className="text-lg">{t('Views & Redemptions Trend', 'اتجاه المشاهدات والاستردادات')}</CardTitle>
                    <CardDescription>{t('Track your engagement over time', 'تتبع التفاعل عبر الزمن')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AnimatedLineChart
                      data={viewsTrendData}
                      height={300}
                      showSecondary={true}
                      primaryLabel={t('Views', 'المشاهدات')}
                      secondaryLabel={t('Redemptions', 'الاستردادات')}
                      showArea
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className={cn(isRTL && "text-right")}>
                    <CardTitle className="text-lg">{t('Category Distribution', 'توزيع الفئات')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AnimatedDonutChart
                      data={categoryBreakdown}
                      height={200}
                      innerRadius={50}
                      outerRadius={80}
                    />
                    <div className="mt-4 space-y-2">
                      {categoryBreakdown.map((item) => (
                        <div key={item.name} className={cn("flex items-center justify-between text-sm", isRTL && "flex-row-reverse")}>
                          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span>{item.name}</span>
                          </div>
                          <span className="font-medium">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="offers" className="space-y-6">
              <Card>
                <CardHeader className={cn(isRTL && "text-right")}>
                  <CardTitle className="text-lg">{t('Redemptions by Offer', 'الاستردادات حسب العرض')}</CardTitle>
                  <CardDescription>
                    {t('Aggregated redemption counts per offer', 'أعداد الاستردادات المجمعة لكل عرض')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AnimatedBarChart
                    data={offerPerformance}
                    height={300}
                    layout="vertical"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </PageLayout>
  );
}
