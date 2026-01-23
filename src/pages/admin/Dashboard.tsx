import { useState } from 'react';
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
  Activity,
  Download,
  RefreshCw,
  Calendar,
  Filter,
  Zap,
} from 'lucide-react';
import { cn, formatCurrencyAED, formatInteger } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { AnimatedBarChart } from '@/components/charts';
import { VendorPerformanceTab } from '@/components/admin/VendorPerformanceTab';
import { DataQualityDashboard } from '@/components/admin/DataQualityDashboard';
import { AdminActionCenter } from '@/components/admin/AdminActionCenter';
import { AdminActionCenterDashboard } from '@/components/admin/AdminActionCenterDashboard';
import { CommandCenterKPICard } from '@/components/admin/CommandCenterKPICard';
import { InsightsActionsStrip } from '@/components/admin/InsightsActionsStrip';
import { AnomaliesWidget } from '@/components/admin/AnomaliesWidget';
import { TopBenefitsTable } from '@/components/admin/TopBenefitsTable';
import { InteractiveGrowthChart } from '@/components/admin/InteractiveGrowthChart';
import { InteractiveIndustryChart } from '@/components/admin/InteractiveIndustryChart';
import { PageLayout } from '@/components/shared';

// KPI data with sparklines and tooltips
const platformMetrics = [
  { 
    label: 'Total Organizations', 
    labelAr: 'إجمالي المنظمات', 
    value: '47',
    previousValue: '42',
    change: 12, 
    icon: Building2,
    sparklineData: [{ value: 38 }, { value: 40 }, { value: 41 }, { value: 42 }, { value: 44 }, { value: 47 }],
    tooltip: {
      definition: 'Total number of active organizations on the platform with at least one enrolled employee.',
      formula: 'COUNT(organizations WHERE status = "active")',
      source: 'Organizations Database',
    },
  },
  { 
    label: 'Active Employees', 
    labelAr: 'الموظفون النشطون', 
    value: '12,847',
    previousValue: '11,895',
    change: 8, 
    icon: Users,
    sparklineData: [{ value: 10500 }, { value: 11000 }, { value: 11400 }, { value: 11895 }, { value: 12300 }, { value: 12847 }],
    tooltip: {
      definition: 'Employees with verified accounts who accessed the platform in the last 90 days.',
      formula: 'COUNT(employees WHERE last_active >= NOW() - 90d)',
      source: 'User Activity Logs',
    },
  },
  { 
    label: 'Platform GMV', 
    labelAr: 'إجمالي قيمة المنصة', 
    value: 'AED 24.5M',
    previousValue: 'AED 21.3M',
    change: 15, 
    icon: DollarSign,
    sparklineData: [{ value: 18.2 }, { value: 19.5 }, { value: 20.1 }, { value: 21.3 }, { value: 22.8 }, { value: 24.5 }],
    tooltip: {
      definition: 'Gross Merchandise Value — total value of all benefits processed through the platform.',
      formula: 'SUM(claims.amount) + SUM(allowances.value)',
      source: 'Claims & Entitlements DB',
    },
  },
  { 
    label: 'Active Vendors', 
    labelAr: 'الموردون النشطون', 
    value: '156',
    previousValue: '127',
    change: 23, 
    icon: Target,
    sparklineData: [{ value: 98 }, { value: 112 }, { value: 120 }, { value: 127 }, { value: 142 }, { value: 156 }],
    tooltip: {
      definition: 'Vendors with approved profiles and at least one active offer in the marketplace.',
      formula: 'COUNT(vendors WHERE status = "approved" AND offers_count > 0)',
      source: 'Vendor Management DB',
    },
  },
];

// Growth chart data with all three series
const monthlyGrowthData = [
  { name: 'Jul', organizations: 32, employees: 8500, gmv: 15.2 },
  { name: 'Aug', organizations: 35, employees: 9200, gmv: 17.1 },
  { name: 'Sep', organizations: 38, employees: 10100, gmv: 19.3 },
  { name: 'Oct', organizations: 42, employees: 11200, gmv: 21.5 },
  { name: 'Nov', organizations: 45, employees: 12000, gmv: 23.2 },
  { name: 'Dec', organizations: 47, employees: 12847, gmv: 24.5 },
];

// Industry breakdown with additional data
const industryBreakdown = [
  { name: 'Financial Services', value: 35, color: 'hsl(var(--success))', organizations: 16, employees: 4500 },
  { name: 'Technology', value: 25, color: 'hsl(var(--accent))', organizations: 12, employees: 3200 },
  { name: 'Healthcare', value: 18, color: 'hsl(var(--destructive))', organizations: 8, employees: 2300 },
  { name: 'Retail', value: 12, color: 'hsl(var(--primary))', organizations: 6, employees: 1540 },
  { name: 'Manufacturing', value: 10, color: 'hsl(var(--warning))', organizations: 5, employees: 1307 },
];

// Top benefits with trend data
const topPerformingBenefits = [
  { name: 'Housing Allowance', utilizationRate: 94, avgValue: 85000, trend: 5, claims: 12480 },
  { name: 'Education Support', utilizationRate: 87, avgValue: 45000, trend: 12, claims: 8920 },
  { name: 'Health Insurance', utilizationRate: 82, avgValue: 32000, trend: 3, claims: 15340 },
  { name: 'Transport Allowance', utilizationRate: 78, avgValue: 18000, trend: -2, claims: 11200 },
  { name: 'Wellness Programs', utilizationRate: 65, avgValue: 8000, trend: 18, claims: 6780 },
];

// Insights derived from metrics
const keyInsights = [
  { 
    id: '1', 
    text: 'Platform GMV grew 15% MoM — highest growth in 6 months, driven by housing claims surge.',
    type: 'positive' as const,
    metric: 'gmv',
  },
  { 
    id: '2', 
    text: 'Vendor approval queue has 12 pending applications older than 7 days — potential marketplace gap.',
    type: 'warning' as const,
    metric: 'vendors',
  },
  { 
    id: '3', 
    text: 'Technology sector shows 25% higher engagement than Financial Services despite smaller size.',
    type: 'neutral' as const,
    metric: 'industry',
  },
];

// Recommended actions
const recommendedActions = [
  {
    id: '1',
    title: 'Clear Moderation Backlog',
    description: '8 offers pending review > 48hrs',
    priority: 'high' as const,
    route: '/admin/offers',
  },
  {
    id: '2',
    title: 'Review Data Quality Alerts',
    description: '3 orgs with sync failures this week',
    priority: 'medium' as const,
    route: '/admin/data-quality',
  },
  {
    id: '3',
    title: 'Onboard Pending Vendors',
    description: '12 vendors awaiting approval',
    priority: 'low' as const,
    route: '/admin/vendors',
  },
];

// Anomalies
const detectedAnomalies = [
  { id: '1', type: 'sync' as const, title: 'HRIS sync failed for 2 orgs', count: 2, severity: 'warning' as const, timestamp: '2h ago' },
  { id: '2', type: 'auth' as const, title: 'Unusual login attempts detected', count: 15, severity: 'critical' as const, timestamp: '4h ago' },
  { id: '3', type: 'claims' as const, title: 'Claims volume 40% above average', count: 1, severity: 'info' as const, timestamp: '1d ago' },
];

const regionalBenchmarks = [
  { region: 'UAE', avgUtilization: 72, avgSpend: 185000, employees: 8500, organizations: 28 },
  { region: 'Saudi Arabia', avgUtilization: 68, avgSpend: 165000, employees: 3200, organizations: 12 },
  { region: 'Qatar', avgUtilization: 75, avgSpend: 195000, employees: 850, organizations: 5 },
  { region: 'Kuwait', avgUtilization: 65, avgSpend: 155000, employees: 297, organizations: 2 },
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
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);

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

  // Filter data based on selected industry
  const filteredBenefits = selectedIndustry 
    ? topPerformingBenefits.map(b => ({
        ...b,
        utilizationRate: Math.round(b.utilizationRate * (0.85 + Math.random() * 0.3)),
        claims: Math.round(b.claims * (0.7 + Math.random() * 0.4)),
      }))
    : topPerformingBenefits;

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
      {/* Hero Platform Metrics - Enhanced KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {platformMetrics.map((metric, index) => (
          <CommandCenterKPICard
            key={metric.label}
            label={metric.label}
            labelAr={metric.labelAr}
            value={metric.value}
            previousValue={metric.previousValue}
            change={metric.change}
            icon={metric.icon}
            sparklineData={metric.sparklineData}
            tooltip={metric.tooltip}
            colorIndex={index}
          />
        ))}
      </div>

      {/* Insights & Actions Strip */}
      <InsightsActionsStrip 
        insights={keyInsights}
        actions={recommendedActions}
      />

      {/* Main Analytics Tabs - Action Center is default */}
      <Tabs defaultValue="actions" className="space-y-6">
        <TabsList className="w-full justify-start flex-wrap bg-muted/50 p-1">
          <TabsTrigger value="actions" className="gap-1.5">
            <Zap className="w-4 h-4" />
            {t('Action Center', 'مركز الإجراءات')}
          </TabsTrigger>
          <TabsTrigger value="overview">{t('Overview', 'نظرة عامة')}</TabsTrigger>
          <TabsTrigger value="benchmarks">{t('Benchmarks', 'المعايير')}</TabsTrigger>
          <TabsTrigger value="market">{t('Market Intelligence', 'ذكاء السوق')}</TabsTrigger>
          <TabsTrigger value="vendors">{t('Vendor Performance', 'أداء الموردين')}</TabsTrigger>
          <TabsTrigger value="data-quality">{t('Data Quality', 'جودة البيانات')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Industry filter indicator */}
          {selectedIndustry && (
            <div className={cn(
              "flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20",
              isRTL && "flex-row-reverse"
            )}>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                {t('Filtered', 'مُفلتر')}
              </Badge>
              <span className="text-sm">
                {t('Showing data for', 'عرض البيانات لـ')} <strong>{selectedIndustry}</strong>
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ms-auto h-7 text-xs"
                onClick={() => setSelectedIndustry(null)}
              >
                {t('Clear Filter', 'مسح الفلتر')}
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Interactive Growth Chart */}
            <InteractiveGrowthChart data={monthlyGrowthData} />

            {/* Interactive Industry Distribution */}
            <InteractiveIndustryChart 
              data={industryBreakdown}
              selectedIndustry={selectedIndustry}
              onIndustrySelect={setSelectedIndustry}
            />
          </div>

          {/* Anomalies Widget + Top Benefits */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <AnomaliesWidget anomalies={detectedAnomalies} />
            </div>
            <div className="lg:col-span-3">
              <TopBenefitsTable benefits={filteredBenefits} />
            </div>
          </div>
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
          <AdminActionCenterDashboard />
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}
