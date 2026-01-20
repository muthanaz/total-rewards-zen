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
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
} from 'lucide-react';
import { cn, formatInteger, formatPercent, formatCurrencyAED } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { AnimatedLineChart } from '@/components/charts/AnimatedLineChart';
import { AnimatedBarChart } from '@/components/charts/AnimatedBarChart';
import { AnimatedDonutChart } from '@/components/charts/AnimatedDonutChart';
import { PageLayout, MetricCard, MetricGrid } from '@/components/shared';
import { useVendorAnalytics } from '@/hooks/useVendorData';

export default function VendorAnalytics() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const [timeRange, setTimeRange] = useState('30days');
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const { data: analytics, isLoading } = useVendorAnalytics();

  const summaryMetrics = [
    { 
      title: t('Total Views', 'إجمالي المشاهدات'), 
      value: formatInteger(45620), 
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
      value: formatCurrencyAED(285), 
      change: 3, 
      positive: false, 
      icon: TrendingUp 
    },
  ];

  const viewsTrendData = [
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

  const dayOfWeekData = [
    { name: 'Mon', value: 1250 },
    { name: 'Tue', value: 1480 },
    { name: 'Wed', value: 1320 },
    { name: 'Thu', value: 1190 },
    { name: 'Fri', value: 850 },
    { name: 'Sat', value: 620 },
    { name: 'Sun', value: 910 },
  ];

  return (
    <PageLayout
      title={t('Analytics', 'التحليلات')}
      description={t('Deep dive into your offer performance', 'نظرة معمقة على أداء عروضك')}
      icon={BarChart3}
      iconClassName="text-primary"
      actions={
        <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">{t('Last 7 Days', 'آخر ٧ أيام')}</SelectItem>
              <SelectItem value="30days">{t('Last 30 Days', 'آخر ٣٠ يوم')}</SelectItem>
              <SelectItem value="90days">{t('Last 90 Days', 'آخر ٩٠ يوم')}</SelectItem>
              <SelectItem value="12months">{t('Last 12 Months', 'آخر ١٢ شهر')}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            {t('Export', 'تصدير')}
          </Button>
        </div>
      }
    >
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
          <TabsTrigger value="audience">{t('Audience', 'الجمهور')}</TabsTrigger>
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

          <Card>
            <CardHeader className={cn(isRTL && "text-right")}>
              <CardTitle className="text-lg">{t('Engagement by Day of Week', 'التفاعل حسب يوم الأسبوع')}</CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatedBarChart
                data={dayOfWeekData}
                height={250}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offers" className="space-y-6">
          <Card>
            <CardHeader className={cn(isRTL && "text-right")}>
              <CardTitle className="text-lg">{t('Redemptions by Offer', 'الاستردادات حسب العرض')}</CardTitle>
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

        <TabsContent value="audience" className="space-y-6">
          <Card>
            <CardHeader className={cn(isRTL && "text-right")}>
              <CardTitle className="text-lg">{t('Audience Insights', 'رؤى الجمهور')}</CardTitle>
              <CardDescription>{t('Understand who engages with your offers', 'افهم من يتفاعل مع عروضك')}</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <PieChart className="w-12 h-12 mx-auto text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                {t('Detailed audience analytics coming soon', 'تحليلات الجمهور التفصيلية قريباً')}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}