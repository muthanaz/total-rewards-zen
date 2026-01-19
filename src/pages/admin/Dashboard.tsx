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
  ArrowUpRight, 
  ArrowDownRight,
  Target,
  PieChart,
  Activity,
  Download,
  RefreshCw,
  Calendar,
  Filter,
  Database,
  Lightbulb,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { AnimatedLineChart } from '@/components/charts/AnimatedLineChart';
import { AnimatedBarChart } from '@/components/charts/AnimatedBarChart';
import { AnimatedDonutChart } from '@/components/charts/AnimatedDonutChart';
import { VendorPerformanceTab } from '@/components/admin/VendorPerformanceTab';
import { DataQualityDashboard } from '@/components/admin/DataQualityDashboard';
import { AdminActionCenter } from '@/components/admin/AdminActionCenter';

const platformMetrics = [
  { label: 'Total Organizations', labelAr: 'إجمالي المنظمات', value: '47', change: '+12%', trend: 'up', icon: Building2 },
  { label: 'Active Employees', labelAr: 'الموظفون النشطون', value: '12,847', change: '+8%', trend: 'up', icon: Users },
  { label: 'Platform GMV', labelAr: 'إجمالي قيمة المنصة', value: 'AED 24.5M', change: '+15%', trend: 'up', icon: DollarSign },
  { label: 'Active Vendors', labelAr: 'الموردون النشطون', value: '156', change: '+23%', trend: 'up', icon: Target },
];

const regionalBenchmarks = [
  { region: 'UAE', avgUtilization: 72, avgSpend: 185000, employees: 8500, organizations: 28 },
  { region: 'Saudi Arabia', avgUtilization: 68, avgSpend: 165000, employees: 3200, organizations: 12 },
  { region: 'Qatar', avgUtilization: 75, avgSpend: 195000, employees: 850, organizations: 5 },
  { region: 'Kuwait', avgUtilization: 65, avgSpend: 155000, employees: 297, organizations: 2 },
];

const industryBreakdown = [
  { name: 'Financial Services', value: 35, color: 'hsl(160 84% 39%)' },
  { name: 'Technology', value: 25, color: 'hsl(262 52% 55%)' },
  { name: 'Healthcare', value: 18, color: 'hsl(340 65% 55%)' },
  { name: 'Retail', value: 12, color: 'hsl(199 89% 48%)' },
  { name: 'Manufacturing', value: 10, color: 'hsl(38 92% 50%)' },
];

// Transformed for AnimatedLineChart (expects name/value)
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

  return (
    <div className={cn("space-y-8", isRTL && "text-right")}>
      {/* Header */}
      <div className={cn("flex flex-col md:flex-row md:items-center md:justify-between gap-4", isRTL && "md:flex-row-reverse")}>
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            {t('Platform Command Center', 'مركز قيادة المنصة')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('Real-time analytics and market intelligence', 'التحليلات الفورية وذكاء السوق')}
          </p>
        </div>
        <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            {t('Last 30 Days', 'آخر 30 يوم')}
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            {t('Filters', 'تصفية')}
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('Refresh', 'تحديث')}
          </Button>
          <Button size="sm">
            <Download className="w-4 h-4 mr-2" />
            {t('Export Report', 'تصدير التقرير')}
          </Button>
        </div>
      </div>

      {/* Platform Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {platformMetrics.map((metric) => (
          <Card key={metric.label} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className={cn("flex items-start justify-between", isRTL && "flex-row-reverse")}>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? metric.labelAr : metric.label}
                  </p>
                  <p className="text-2xl font-bold mt-1">{metric.value}</p>
                  <div className={cn("flex items-center gap-1 mt-2", isRTL && "flex-row-reverse")}>
                    {metric.trend === 'up' ? (
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-500" />
                    )}
                    <span className={cn(
                      "text-sm font-medium",
                      metric.trend === 'up' ? "text-green-500" : "text-red-500"
                    )}>
                      {metric.change}
                    </span>
                    <span className="text-xs text-muted-foreground">{t('vs last month', 'مقارنة بالشهر الماضي')}</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-primary/10">
                  <metric.icon className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="w-full justify-start flex-wrap">
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
                          {t('Avg Value:', 'متوسط القيمة:')} AED {benefit.avgValue.toLocaleString()}
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
                        <td className="py-4">{region.employees.toLocaleString()}</td>
                        <td className="py-4">AED {region.avgSpend.toLocaleString()}</td>
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
    </div>
  );
}