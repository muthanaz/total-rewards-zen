import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Globe, 
  TrendingUp, 
  Users, 
  Building2, 
  DollarSign, 
  Target,
  PieChart,
  Activity,
  Download,
  RefreshCw,
  Calendar,
  Filter,
} from 'lucide-react';
import { cn, formatCurrencyAED, formatInteger } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { ChartWrapper, CHART_EXPLANATIONS, AnimatedLineChart, AnimatedBarChart, AnimatedDonutChart } from '@/components/charts';
import { VendorPerformanceTab } from '@/components/admin/VendorPerformanceTab';
import { DataQualityDashboard } from '@/components/admin/DataQualityDashboard';
import { AdminActionCenter } from '@/components/admin/AdminActionCenter';
import { PageLayout, MetricCard, MetricGrid, SectionCard } from '@/components/shared';

const platformMetrics = [
  { label: 'Total Organizations', labelAr: 'إجمالي المنظمات', value: '47', change: 12, icon: Building2 },
  { label: 'Active Employees', labelAr: 'الموظفون النشطون', value: '12,847', change: 8, icon: Users },
  { label: 'Platform GMV', labelAr: 'إجمالي قيمة المنصة', value: 'AED 24.5M', change: 15, icon: DollarSign },
  { label: 'Active Vendors', labelAr: 'الموردون النشطون', value: '156', change: 23, icon: Target },
];

const regionalBenchmarks = [
  { region: 'UAE', avgUtilization: 72, avgSpend: 185000, employees: 8500, organizations: 28 },
  { region: 'Saudi Arabia', avgUtilization: 68, avgSpend: 165000, employees: 3200, organizations: 12 },
  { region: 'Qatar', avgUtilization: 75, avgSpend: 195000, employees: 850, organizations: 5 },
  { region: 'Kuwait', avgUtilization: 65, avgSpend: 155000, employees: 297, organizations: 2 },
];

const industryBreakdown = [
  { name: 'Financial Services', value: 35, color: 'hsl(var(--success))' },
  { name: 'Technology', value: 25, color: 'hsl(var(--accent))' },
  { name: 'Healthcare', value: 18, color: 'hsl(var(--destructive))' },
  { name: 'Retail', value: 12, color: 'hsl(var(--primary))' },
  { name: 'Manufacturing', value: 10, color: 'hsl(var(--warning))' },
];

const monthlyGrowthChart = [
  { name: 'Jul', value: 32, secondaryValue: 15.2 },
  { name: 'Aug', value: 35, secondaryValue: 17.1 },
  { name: 'Sep', value: 38, secondaryValue: 19.3 },
  { name: 'Oct', value: 42, secondaryValue: 21.5 },
  { name: 'Nov', value: 45, secondaryValue: 23.2 },
  { name: 'Dec', value: 47, secondaryValue: 24.5 },
];

const topPerformingBenefits = [
  { name: 'Housing Allowance', utilizationRate: 94, avgValue: 85000 },
  { name: 'Education Support', utilizationRate: 87, avgValue: 45000 },
  { name: 'Health Insurance', utilizationRate: 82, avgValue: 32000 },
  { name: 'Transport Allowance', utilizationRate: 78, avgValue: 18000 },
  { name: 'Wellness Programs', utilizationRate: 65, avgValue: 8000 },
];

const highIntentUsers = [
  { segment: 'Young Professionals', intent: 'Career Growth', percentage: 42, opportunity: 'Learning benefits' },
  { segment: 'Working Parents', intent: 'Education', percentage: 38, opportunity: 'Schooling support' },
  { segment: 'Senior Staff', intent: 'Health', percentage: 35, opportunity: 'Premium health plans' },
  { segment: 'Remote Workers', intent: 'Flexibility', percentage: 31, opportunity: 'WFH allowances' },
];

export default function AdminDashboard() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const headerActions = (
    <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
      <Button variant="outline" size="sm">
        <Calendar className="w-4 h-4 me-2" />
        {t('Last 30 Days', 'آخر 30 يوم')}
      </Button>
      <Button variant="outline" size="sm">
        <Filter className="w-4 h-4 me-2" />
        {t('Filters', 'تصفية')}
      </Button>
      <Button variant="outline" size="sm">
        <RefreshCw className="w-4 h-4 me-2" />
        {t('Refresh', 'تحديث')}
      </Button>
      <Button size="sm">
        <Download className="w-4 h-4 me-2" />
        {t('Export Report', 'تصدير التقرير')}
      </Button>
    </div>
  );

  // Calculate platform health
  const platformHealth = {
    organizations: parseInt(platformMetrics[0].value) >= 40 ? 'excellent' : 'good',
    growth: Math.max(...platformMetrics.map(m => m.change)) >= 15 ? 'high' : 'moderate',
  };

  return (
    <PageLayout
      title={t('Platform Command Center', 'مركز قيادة المنصة')}
      description={t('Real-time platform analytics, governance, and market intelligence', 'تحليلات المنصة الفورية والحوكمة وذكاء السوق')}
      icon={Globe}
      iconClassName="from-primary to-primary/80"
      badge={{
        label: t('System Healthy', 'النظام سليم'),
        variant: 'success',
        icon: Activity,
      }}
      actions={headerActions}
    >
      {/* Hero Platform Metrics - Premium Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {platformMetrics.map((metric, index) => {
          const colors = [
            { bg: 'from-card to-primary/5', iconBg: 'bg-primary/10', iconColor: 'text-primary' },
            { bg: 'from-card to-accent/5', iconBg: 'bg-accent/10', iconColor: 'text-accent' },
            { bg: 'from-card to-success/5', iconBg: 'bg-success/10', iconColor: 'text-success' },
            { bg: 'from-card to-warning/5', iconBg: 'bg-warning/10', iconColor: 'text-warning' },
          ];
          const color = colors[index];
          const Icon = metric.icon;
          
          return (
            <Card key={metric.label} className={cn("border-border/40 bg-gradient-to-br", color.bg)}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={cn("p-2.5 rounded-xl", color.iconBg)}>
                    <Icon className={cn("w-5 h-5", color.iconColor)} />
                  </div>
                  <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-xs">
                    +{metric.change}%
                  </Badge>
                </div>
                <p className="text-3xl font-bold tracking-tight">{metric.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{language === 'ar' ? metric.labelAr : metric.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="w-full justify-start flex-wrap bg-muted/50 p-1">
          <TabsTrigger value="overview">{t('Overview', 'نظرة عامة')}</TabsTrigger>
          <TabsTrigger value="benchmarks">{t('Benchmarks', 'المعايير')}</TabsTrigger>
          <TabsTrigger value="market">{t('Market Intelligence', 'ذكاء السوق')}</TabsTrigger>
          <TabsTrigger value="vendors">{t('Vendor Performance', 'أداء الموردين')}</TabsTrigger>
          <TabsTrigger value="data-quality">{t('Data Quality', 'جودة البيانات')}</TabsTrigger>
          <TabsTrigger value="actions">{t('Action Center', 'مركز الإجراءات')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Growth Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <TrendingUp className="w-5 h-5 text-primary" />
                  {t('Platform Growth', 'نمو المنصة')}
                </CardTitle>
                <CardDescription>
                  {t('Monthly platform growth metrics', 'مقاييس نمو المنصة الشهرية')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AnimatedLineChart
                  data={monthlyGrowthChart}
                  showSecondary={true}
                  primaryLabel={t('Organizations', 'المنظمات')}
                  secondaryLabel={t('GMV (M)', 'القيمة (م)')}
                  height={300}
                />
              </CardContent>
            </Card>

            {/* Industry Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <PieChart className="w-5 h-5 text-primary" />
                  {t('Industry Distribution', 'توزيع الصناعات')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatedDonutChart
                  data={industryBreakdown}
                  height={200}
                  innerRadius={50}
                  outerRadius={80}
                />
                <div className="mt-4 space-y-2">
                  {industryBreakdown.map((item) => (
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

          {/* Top Benefits Performance */}
          <Card>
            <CardHeader>
              <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <Activity className="w-5 h-5 text-primary" />
                {t('Top Performing Benefits (Platform-wide)', 'أفضل المزايا أداءً (على مستوى المنصة)')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformingBenefits.map((benefit) => (
                  <div key={benefit.name} className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
                    <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
                      <div className={cn("flex items-center justify-between mb-1", isRTL && "flex-row-reverse")}>
                        <span className="font-medium">{benefit.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {t('Avg Value:', 'متوسط القيمة:')} {formatCurrencyAED(benefit.avgValue)}
                        </span>
                      </div>
                      <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                        <Progress value={benefit.utilizationRate} className="flex-1 h-2" />
                        <span className="text-sm font-medium w-12 text-right">{benefit.utilizationRate}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <Globe className="w-5 h-5 text-primary" />
                {t('Regional Benchmarks', 'المعايير الإقليمية')}
              </CardTitle>
              <CardDescription>
                {t('Compare performance across GCC regions', 'قارن الأداء عبر مناطق الخليج')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className={cn("py-3 text-left font-medium", isRTL && "text-right")}>{t('Region', 'المنطقة')}</th>
                      <th className={cn("py-3 text-left font-medium", isRTL && "text-right")}>{t('Organizations', 'المنظمات')}</th>
                      <th className={cn("py-3 text-left font-medium", isRTL && "text-right")}>{t('Employees', 'الموظفون')}</th>
                      <th className={cn("py-3 text-left font-medium", isRTL && "text-right")}>{t('Avg Spend', 'متوسط الإنفاق')}</th>
                      <th className={cn("py-3 text-left font-medium", isRTL && "text-right")}>{t('Utilization', 'الاستخدام')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {regionalBenchmarks.map((region) => (
                      <tr key={region.region} className="border-b last:border-0">
                        <td className="py-4 font-medium">{region.region}</td>
                        <td className="py-4">{region.organizations}</td>
                        <td className="py-4">{formatInteger(region.employees)}</td>
                        <td className="py-4">{formatCurrencyAED(region.avgSpend)}</td>
                        <td className="py-4">
                          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                            <Progress value={region.avgUtilization} className="w-20 h-2" />
                            <span className="text-sm">{region.avgUtilization}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('Utilization by Region', 'الاستخدام حسب المنطقة')}</CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatedBarChart
                  data={regionalBenchmarks.map(r => ({ name: r.region, value: r.avgUtilization }))}
                  height={250}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('Average Spend by Region', 'متوسط الإنفاق حسب المنطقة')}</CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatedBarChart
                  data={regionalBenchmarks.map(r => ({ name: r.region, value: r.avgSpend / 1000 }))}
                  height={250}
                  formatValue={(v) => `${v}K`}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="market" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <Users className="w-5 h-5 text-primary" />
                {t('High-Intent User Segments', 'شرائح المستخدمين ذوي النوايا العالية')}
              </CardTitle>
              <CardDescription>
                {t('Identify opportunities based on user behavior and intent signals', 'تحديد الفرص بناءً على سلوك المستخدم وإشارات النية')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {highIntentUsers.map((segment) => (
                  <Card key={segment.segment} className="border-dashed">
                    <CardContent className="p-4">
                      <div className={cn("flex items-start justify-between", isRTL && "flex-row-reverse")}>
                        <div>
                          <h4 className="font-semibold">{segment.segment}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {t('Primary Intent:', 'النية الأساسية:')} {segment.intent}
                          </p>
                        </div>
                        <Badge variant="secondary">{segment.percentage}%</Badge>
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm">
                          <span className="text-muted-foreground">{t('Opportunity:', 'الفرصة:')}</span>{' '}
                          <span className="font-medium text-primary">{segment.opportunity}</span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendors" className="space-y-6">
          <VendorPerformanceTab />
        </TabsContent>

        <TabsContent value="data-quality" className="space-y-6">
          <DataQualityDashboard />
        </TabsContent>

        <TabsContent value="actions" className="space-y-6">
          <AdminActionCenter />
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}