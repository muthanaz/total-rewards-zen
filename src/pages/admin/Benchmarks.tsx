import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/ui/page-header';
import { StatusStrip } from '@/components/ui/status-strip';
import { PrimaryInsight } from '@/components/ui/primary-insight';
import { 
  Globe, 
  TrendingUp, 
  Building2, 
  Download, 
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Bookmark,
  Target,
  Award,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { AnimatedBarChart } from '@/components/charts/AnimatedBarChart';
import { AnimatedRadarChart } from '@/components/charts/AnimatedRadarChart';
import { AnimatedLineChart } from '@/components/charts/AnimatedLineChart';
import { toast } from 'sonner';

const regionalData = [
  { region: 'UAE', avgUtilization: 72, avgSpend: 185000, employees: 8500, organizations: 28, benefits: 12, marketShare: 35 },
  { region: 'Saudi Arabia', avgUtilization: 68, avgSpend: 165000, employees: 3200, organizations: 12, benefits: 10, marketShare: 28 },
  { region: 'Qatar', avgUtilization: 75, avgSpend: 195000, employees: 850, organizations: 5, benefits: 14, marketShare: 18 },
  { region: 'Kuwait', avgUtilization: 65, avgSpend: 155000, employees: 297, organizations: 2, benefits: 8, marketShare: 10 },
  { region: 'Bahrain', avgUtilization: 70, avgSpend: 145000, employees: 420, organizations: 3, benefits: 9, marketShare: 9 },
];

const industryBenchmarks = [
  { industry: 'Financial Services', utilization: 78, spend: 225000, topBenefit: 'Housing', satisfaction: 82 },
  { industry: 'Technology', utilization: 85, spend: 195000, topBenefit: 'Equity', satisfaction: 88 },
  { industry: 'Healthcare', utilization: 72, spend: 175000, topBenefit: 'Education', satisfaction: 79 },
  { industry: 'Retail', utilization: 65, spend: 125000, topBenefit: 'Transport', satisfaction: 74 },
  { industry: 'Manufacturing', utilization: 62, spend: 115000, topBenefit: 'Health', satisfaction: 71 },
  { industry: 'Energy', utilization: 75, spend: 245000, topBenefit: 'Housing', satisfaction: 85 },
];

const companySizeBenchmarks = [
  { size: 'Enterprise (1000+)', avgBenefits: 15, avgSpend: 285000, utilization: 82 },
  { size: 'Large (500-999)', avgBenefits: 12, avgSpend: 195000, utilization: 75 },
  { size: 'Medium (100-499)', avgBenefits: 9, avgSpend: 145000, utilization: 68 },
  { size: 'Small (50-99)', avgBenefits: 6, avgSpend: 95000, utilization: 62 },
  { size: 'Startup (<50)', avgBenefits: 4, avgSpend: 55000, utilization: 55 },
];

const benefitTypeBenchmarks = [
  { type: 'Housing', avgAllocation: 85000, utilizationRate: 94, marketPenetration: 88 },
  { type: 'Education', avgAllocation: 45000, utilizationRate: 87, marketPenetration: 72 },
  { type: 'Health Insurance', avgAllocation: 32000, utilizationRate: 96, marketPenetration: 95 },
  { type: 'Transport', avgAllocation: 18000, utilizationRate: 78, marketPenetration: 65 },
  { type: 'End of Service', avgAllocation: 95000, utilizationRate: 100, marketPenetration: 100 },
  { type: 'Wellness', avgAllocation: 8000, utilizationRate: 65, marketPenetration: 45 },
  { type: 'Professional Dev', avgAllocation: 12000, utilizationRate: 42, marketPenetration: 38 },
];

const historicalTrends = [
  { name: 'Q1 2024', value: 68, secondaryValue: 145 },
  { name: 'Q2 2024', value: 70, secondaryValue: 152 },
  { name: 'Q3 2024', value: 72, secondaryValue: 168 },
  { name: 'Q4 2024', value: 75, secondaryValue: 175 },
  { name: 'Q1 2025', value: 78, secondaryValue: 185 },
];

export default function AdminBenchmarks() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const isArabic = language === 'ar';
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedIndustry, setSelectedIndustry] = useState('all');

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const handleSaveReport = () => {
    toast.success(t('Benchmark report saved successfully', 'تم حفظ تقرير المعايير بنجاح'));
  };

  const radarData = regionalData.map(r => ({
    subject: r.region,
    value: r.avgUtilization,
    fullMark: 100,
  }));

  // Find outlier region
  const lowestRegion = regionalData.reduce((prev, curr) => 
    prev.avgUtilization < curr.avgUtilization ? prev : curr
  );

  return (
    <div className={cn("space-y-8", isRTL && "text-right")}>
      {/* Page Header */}
      <PageHeader
        title={t('Regional & Industry Benchmarks', 'المعايير الإقليمية والصناعية')}
        titleAr="المعايير الإقليمية والصناعية"
        subtitle={t('Compare performance metrics across regions, industries, and company sizes', 'قارن مقاييس الأداء عبر المناطق والصناعات وأحجام الشركات')}
        subtitleAr="قارن مقاييس الأداء عبر المناطق والصناعات وأحجام الشركات"
        icon={Globe}
        action={
          <div className={cn("flex items-center gap-2 flex-wrap", isRTL && "flex-row-reverse")}>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t('Region', 'المنطقة')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('All Regions', 'جميع المناطق')}</SelectItem>
                {regionalData.map(r => (
                  <SelectItem key={r.region} value={r.region}>{r.region}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleSaveReport}>
              <Bookmark className="w-4 h-4 mr-2" />
              {t('Save Report', 'حفظ التقرير')}
            </Button>
            <Button size="sm">
              <Download className="w-4 h-4 mr-2" />
              {t('Export', 'تصدير')}
            </Button>
          </div>
        }
      />

      {/* Status Strip */}
      <StatusStrip
        confidence="high"
        lastUpdated={new Date()}
        dataSource="Platform Analytics"
        dataSourceAr="تحليلات المنصة"
      />

      {/* Primary Insight */}
      <PrimaryInsight
        icon={AlertTriangle}
        title={t('Regional Insight', 'رؤية إقليمية')}
        titleAr="رؤية إقليمية"
        value={`${lowestRegion.region}: ${lowestRegion.avgUtilization}%`}
        subtitle={t(
          `Lowest utilization across GCC. Consider targeted engagement campaigns or benefit restructuring for organizations in this region.`,
          `أدنى معدل استخدام عبر الخليج. فكر في حملات المشاركة المستهدفة أو إعادة هيكلة المزايا للمنظمات في هذه المنطقة.`
        )}
        subtitleAr="أدنى معدل استخدام عبر الخليج. فكر في حملات المشاركة المستهدفة أو إعادة هيكلة المزايا للمنظمات في هذه المنطقة."
        variant="warning"
      />

      {/* Key Benchmark Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: t('GCC Avg Utilization', 'متوسط الاستخدام الخليجي'), value: '72%', change: '+4%', trend: 'up', icon: Target },
          { label: t('Avg Benefits per Org', 'متوسط المزايا لكل منظمة'), value: '11.2', change: '+2.1', trend: 'up', icon: Award },
          { label: t('Avg Annual Spend', 'متوسط الإنفاق السنوي'), value: 'AED 175K', change: '+12%', trend: 'up', icon: TrendingUp },
          { label: t('Market Coverage', 'تغطية السوق'), value: '47 Orgs', change: '+8', trend: 'up', icon: Building2 },
        ].map((metric) => (
          <Card key={metric.label}>
            <CardContent className="p-6">
              <div className={cn("flex items-start justify-between", isRTL && "flex-row-reverse")}>
                <div>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="text-2xl font-bold mt-1">{metric.value}</p>
                  <div className={cn("flex items-center gap-1 mt-2", isRTL && "flex-row-reverse")}>
                    {metric.trend === 'up' ? (
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm font-medium text-green-500">{metric.change}</span>
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

      {/* Main Content Tabs */}
      <Tabs defaultValue="regional" className="space-y-6">
        <TabsList>
          <TabsTrigger value="regional">{t('Regional', 'إقليمي')}</TabsTrigger>
          <TabsTrigger value="industry">{t('By Industry', 'حسب الصناعة')}</TabsTrigger>
          <TabsTrigger value="company-size">{t('By Company Size', 'حسب حجم الشركة')}</TabsTrigger>
          <TabsTrigger value="benefits">{t('By Benefit Type', 'حسب نوع المزية')}</TabsTrigger>
        </TabsList>

        <TabsContent value="regional" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Regional Radar */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <Globe className="w-5 h-5 text-primary" />
                  {t('Utilization by Region', 'الاستخدام حسب المنطقة')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatedRadarChart data={radarData} height={280} />
              </CardContent>
            </Card>

            {/* Regional Table */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>{t('Regional Performance Comparison', 'مقارنة الأداء الإقليمي')}</CardTitle>
                <CardDescription>{t('Detailed metrics by GCC region', 'مقاييس تفصيلية حسب منطقة الخليج')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className={cn("py-3 text-left font-medium text-sm", isRTL && "text-right")}>{t('Region', 'المنطقة')}</th>
                        <th className={cn("py-3 text-left font-medium text-sm", isRTL && "text-right")}>{t('Orgs', 'المنظمات')}</th>
                        <th className={cn("py-3 text-left font-medium text-sm", isRTL && "text-right")}>{t('Employees', 'الموظفون')}</th>
                        <th className={cn("py-3 text-left font-medium text-sm", isRTL && "text-right")}>{t('Avg Spend', 'متوسط الإنفاق')}</th>
                        <th className={cn("py-3 text-left font-medium text-sm", isRTL && "text-right")}>{t('Utilization', 'الاستخدام')}</th>
                        <th className={cn("py-3 text-left font-medium text-sm", isRTL && "text-right")}>{t('Market Share', 'حصة السوق')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {regionalData.map((r) => (
                        <tr key={r.region} className="border-b last:border-0">
                          <td className="py-4 font-medium">{r.region}</td>
                          <td className="py-4">{r.organizations}</td>
                          <td className="py-4">{r.employees.toLocaleString()}</td>
                          <td className="py-4">AED {(r.avgSpend / 1000).toFixed(0)}K</td>
                          <td className="py-4">
                            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                              <Progress value={r.avgUtilization} className="w-16 h-2" />
                              <span className="text-sm w-10">{r.avgUtilization}%</span>
                            </div>
                          </td>
                          <td className="py-4">
                            <Badge variant="secondary">{r.marketShare}%</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Historical Trends */}
          <Card>
            <CardHeader>
              <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <TrendingUp className="w-5 h-5 text-primary" />
                {t('Historical Benchmark Trends', 'اتجاهات المعايير التاريخية')}
              </CardTitle>
              <CardDescription>{t('Quarterly trends for utilization and spend', 'الاتجاهات الربع سنوية للاستخدام والإنفاق')}</CardDescription>
            </CardHeader>
            <CardContent>
              <AnimatedLineChart
                data={historicalTrends}
                height={300}
                showSecondary={true}
                primaryLabel={t('Utilization %', 'الاستخدام %')}
                secondaryLabel={t('Avg Spend (K)', 'متوسط الإنفاق (ألف)')}
                showArea
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="industry" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('Utilization by Industry', 'الاستخدام حسب الصناعة')}</CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatedBarChart
                  data={industryBenchmarks.map(i => ({ name: i.industry, value: i.utilization }))}
                  height={300}
                  layout="vertical"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('Average Spend by Industry', 'متوسط الإنفاق حسب الصناعة')}</CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatedBarChart
                  data={industryBenchmarks.map(i => ({ name: i.industry, value: i.spend / 1000 }))}
                  height={300}
                  layout="vertical"
                  formatValue={(v) => `${v}K`}
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('Industry Benchmark Details', 'تفاصيل معايير الصناعة')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className={cn("py-3 text-left font-medium", isRTL && "text-right")}>{t('Industry', 'الصناعة')}</th>
                      <th className={cn("py-3 text-left font-medium", isRTL && "text-right")}>{t('Utilization', 'الاستخدام')}</th>
                      <th className={cn("py-3 text-left font-medium", isRTL && "text-right")}>{t('Avg Spend', 'متوسط الإنفاق')}</th>
                      <th className={cn("py-3 text-left font-medium", isRTL && "text-right")}>{t('Top Benefit', 'أفضل مزية')}</th>
                      <th className={cn("py-3 text-left font-medium", isRTL && "text-right")}>{t('Satisfaction', 'الرضا')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {industryBenchmarks.map((ind) => (
                      <tr key={ind.industry} className="border-b last:border-0">
                        <td className="py-4 font-medium">{ind.industry}</td>
                        <td className="py-4">
                          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                            <Progress value={ind.utilization} className="w-16 h-2" />
                            <span>{ind.utilization}%</span>
                          </div>
                        </td>
                        <td className="py-4">AED {(ind.spend / 1000).toFixed(0)}K</td>
                        <td className="py-4"><Badge variant="outline">{ind.topBenefit}</Badge></td>
                        <td className="py-4">
                          <span className={cn(
                            "font-medium",
                            ind.satisfaction >= 80 ? "text-green-500" : ind.satisfaction >= 70 ? "text-yellow-500" : "text-red-500"
                          )}>
                            {ind.satisfaction}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company-size" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {companySizeBenchmarks.map((size) => (
              <Card key={size.size}>
                <CardContent className="p-6 text-center">
                  <h4 className="font-semibold text-sm mb-4">{size.size}</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-3xl font-bold text-primary">{size.avgBenefits}</p>
                      <p className="text-xs text-muted-foreground">{t('Avg Benefits', 'متوسط المزايا')}</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">AED {(size.avgSpend / 1000).toFixed(0)}K</p>
                      <p className="text-xs text-muted-foreground">{t('Avg Spend', 'متوسط الإنفاق')}</p>
                    </div>
                    <div>
                      <Progress value={size.utilization} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">{size.utilization}% {t('utilization', 'استخدام')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('Size Comparison Analysis', 'تحليل مقارنة الحجم')}</CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatedBarChart
                data={companySizeBenchmarks.map(s => ({ 
                  name: s.size.split(' ')[0], 
                  value: s.utilization,
                  secondaryValue: s.avgSpend / 1000
                }))}
                height={300}
                showSecondary
                primaryLabel={t('Utilization %', 'الاستخدام %')}
                secondaryLabel={t('Spend (K)', 'الإنفاق (ألف)')}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benefits" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {benefitTypeBenchmarks.map((benefit) => (
              <Card key={benefit.type}>
                <CardContent className="p-6">
                  <div className={cn("flex items-start justify-between mb-4", isRTL && "flex-row-reverse")}>
                    <div>
                      <h4 className="font-semibold text-lg">{benefit.type}</h4>
                      <p className="text-sm text-muted-foreground">
                        {t('Market Penetration:', 'اختراق السوق:')} {benefit.marketPenetration}%
                      </p>
                    </div>
                    <Badge variant={benefit.utilizationRate >= 80 ? "default" : "secondary"}>
                      {benefit.utilizationRate}% {t('utilized', 'مستخدم')}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className={cn("flex justify-between text-sm mb-1", isRTL && "flex-row-reverse")}>
                        <span>{t('Avg Allocation', 'متوسط التخصيص')}</span>
                        <span className="font-medium">AED {benefit.avgAllocation.toLocaleString()}</span>
                      </div>
                      <Progress value={(benefit.avgAllocation / 100000) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className={cn("flex justify-between text-sm mb-1", isRTL && "flex-row-reverse")}>
                        <span>{t('Utilization Rate', 'معدل الاستخدام')}</span>
                        <span className="font-medium">{benefit.utilizationRate}%</span>
                      </div>
                      <Progress value={benefit.utilizationRate} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
