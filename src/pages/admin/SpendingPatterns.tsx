import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wallet, 
  TrendingUp,
  TrendingDown,
  DollarSign, 
  PieChart,
  BarChart3,
  Calendar,
  Download,
  Filter,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { AnimatedBarChart } from '@/components/charts/AnimatedBarChart';
import { AnimatedDonutChart } from '@/components/charts/AnimatedDonutChart';
import { AnimatedLineChart } from '@/components/charts/AnimatedLineChart';
import { StackedAreaChart } from '@/components/charts/StackedAreaChart';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/PageHeader';

const spendSummary = [
  { label: 'Total Platform Spend', value: 'AED 24.5M', change: '+15%', trend: 'up' },
  { label: 'Avg per Employee', value: 'AED 19,100', change: '+8%', trend: 'up' },
  { label: 'Budget Utilization', value: '72%', change: '+4%', trend: 'up' },
  { label: 'Unused Budget', value: 'AED 9.4M', change: '-12%', trend: 'down' },
];

const spendByCategory = [
  { name: 'Housing', value: 42, color: 'hsl(199 89% 48%)', amount: 10290000 },
  { name: 'Education', value: 22, color: 'hsl(262 52% 55%)', amount: 5390000 },
  { name: 'Health', value: 18, color: 'hsl(340 65% 55%)', amount: 4410000 },
  { name: 'Transport', value: 10, color: 'hsl(38 92% 50%)', amount: 2450000 },
  { name: 'Wellness', value: 5, color: 'hsl(174 60% 45%)', amount: 1225000 },
  { name: 'Other', value: 3, color: 'hsl(220 14% 60%)', amount: 735000 },
];

const monthlySpendTrend = [
  { name: 'Jul', value: 3.2, secondaryValue: 3.8 },
  { name: 'Aug', value: 3.5, secondaryValue: 3.9 },
  { name: 'Sep', value: 3.8, secondaryValue: 4.0 },
  { name: 'Oct', value: 4.1, secondaryValue: 4.2 },
  { name: 'Nov', value: 4.3, secondaryValue: 4.3 },
  { name: 'Dec', value: 4.5, secondaryValue: 4.5 },
];

const organizationSpend = [
  { org: 'Emirates NBD', employees: 2450, budget: 4800000, spent: 3950000, utilization: 82 },
  { org: 'Dubai Holding', employees: 1890, budget: 3200000, spent: 2560000, utilization: 80 },
  { org: 'Etisalat', employees: 1650, budget: 2900000, spent: 2175000, utilization: 75 },
  { org: 'ADNOC', employees: 1420, budget: 3500000, spent: 2450000, utilization: 70 },
  { org: 'Majid Al Futtaim', employees: 1280, budget: 2100000, spent: 1470000, utilization: 70 },
  { org: 'Emaar', employees: 980, budget: 1800000, spent: 1260000, utilization: 70 },
];

const spendByDepartment = [
  { department: 'Engineering', spend: 4200000, employees: 1850, avgSpend: 22700 },
  { department: 'Sales', spend: 3100000, employees: 1420, avgSpend: 21800 },
  { department: 'Operations', spend: 2800000, employees: 1650, avgSpend: 17000 },
  { department: 'Finance', spend: 1900000, employees: 890, avgSpend: 21300 },
  { department: 'HR', spend: 1400000, employees: 620, avgSpend: 22600 },
  { department: 'Marketing', spend: 1200000, employees: 580, avgSpend: 20700 },
];

const zombieSpendRisks = [
  { category: 'Gym Memberships', allocated: 450000, used: 135000, waste: 315000, users: 850, activeUsers: 245 },
  { category: 'Learning Subscriptions', allocated: 320000, used: 128000, waste: 192000, users: 640, activeUsers: 256 },
  { category: 'Commuter Benefits', allocated: 280000, used: 140000, waste: 140000, users: 420, activeUsers: 210 },
  { category: 'Meal Allowances', allocated: 180000, used: 126000, waste: 54000, users: 300, activeUsers: 210 },
];

const stackedAreaData = [
  { name: 'Jan', housing: 850, education: 420, health: 380, transport: 220, other: 130 },
  { name: 'Feb', housing: 920, education: 450, health: 400, transport: 240, other: 140 },
  { name: 'Mar', housing: 980, education: 480, health: 420, transport: 260, other: 160 },
  { name: 'Apr', housing: 1050, education: 520, health: 450, transport: 280, other: 180 },
  { name: 'May', housing: 1100, education: 550, health: 480, transport: 300, other: 200 },
  { name: 'Jun', housing: 1180, education: 580, health: 510, transport: 320, other: 210 },
];

export default function AdminSpendingPatterns() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const [period, setPeriod] = useState('ytd');

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const totalZombieWaste = zombieSpendRisks.reduce((acc, r) => acc + r.waste, 0);

  return (
    <div className={cn("space-y-8", isRTL && "text-right")}>
      {/* Header */}
      <div className={cn("flex flex-col md:flex-row md:items-center md:justify-between gap-4", isRTL && "md:flex-row-reverse")}>
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            {t('Spending Patterns Analysis', 'تحليل أنماط الإنفاق')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('Deep dive into platform-wide spending behavior and optimization opportunities', 'تعمق في سلوك الإنفاق على مستوى المنصة وفرص التحسين')}
          </p>
        </div>
        <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mtd">{t('Month to Date', 'من بداية الشهر')}</SelectItem>
              <SelectItem value="qtd">{t('Quarter to Date', 'من بداية الربع')}</SelectItem>
              <SelectItem value="ytd">{t('Year to Date', 'من بداية السنة')}</SelectItem>
              <SelectItem value="all">{t('All Time', 'كل الوقت')}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            {t('Filters', 'تصفية')}
          </Button>
          <Button size="sm">
            <Download className="w-4 h-4 mr-2" />
            {t('Export', 'تصدير')}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {spendSummary.map((item) => (
          <Card key={item.label}>
            <CardContent className="p-6">
              <div className={cn("flex items-start justify-between", isRTL && "flex-row-reverse")}>
                <div>
                  <p className="text-sm text-muted-foreground">{t(item.label, item.label)}</p>
                  <p className="text-2xl font-bold mt-1">{item.value}</p>
                  <div className={cn("flex items-center gap-1 mt-2", isRTL && "flex-row-reverse")}>
                    {item.trend === 'up' ? (
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-500" />
                    )}
                    <span className={cn("text-sm font-medium", item.trend === 'up' ? "text-green-500" : "text-red-500")}>
                      {item.change}
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-primary/10">
                  <Wallet className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">{t('Overview', 'نظرة عامة')}</TabsTrigger>
          <TabsTrigger value="by-org">{t('By Organization', 'حسب المنظمة')}</TabsTrigger>
          <TabsTrigger value="by-category">{t('By Category', 'حسب الفئة')}</TabsTrigger>
          <TabsTrigger value="zombie">{t('Zombie Spend', 'الإنفاق الميت')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Spend Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <PieChart className="w-5 h-5 text-primary" />
                  {t('Spend Distribution', 'توزيع الإنفاق')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatedDonutChart
                  data={spendByCategory}
                  height={200}
                  innerRadius={50}
                  outerRadius={80}
                />
                <div className="mt-4 space-y-2">
                  {spendByCategory.map((cat) => (
                    <div key={cat.name} className={cn("flex items-center justify-between text-sm", isRTL && "flex-row-reverse")}>
                      <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span>{cat.name}</span>
                      </div>
                      <span className="font-medium">AED {(cat.amount / 1000000).toFixed(1)}M</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Spend Trend */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <TrendingUp className="w-5 h-5 text-primary" />
                  {t('Monthly Spend Trend', 'اتجاه الإنفاق الشهري')}
                </CardTitle>
                <CardDescription>
                  {t('Actual vs Budget (in millions AED)', 'الفعلي مقابل الميزانية (بالملايين درهم)')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AnimatedLineChart
                  data={monthlySpendTrend}
                  height={280}
                  showSecondary
                  primaryLabel={t('Actual Spend', 'الإنفاق الفعلي')}
                  secondaryLabel={t('Budget', 'الميزانية')}
                  formatValue={(v) => `${v}M`}
                />
              </CardContent>
            </Card>
          </div>

          {/* Stacked Area */}
          <Card>
            <CardHeader>
              <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <BarChart3 className="w-5 h-5 text-primary" />
                {t('Cumulative Spend by Category', 'الإنفاق التراكمي حسب الفئة')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StackedAreaChart
                data={stackedAreaData}
                height={300}
                stacks={[
                  { key: 'housing', label: 'Housing', color: 'hsl(199 89% 48%)' },
                  { key: 'education', label: 'Education', color: 'hsl(262 52% 55%)' },
                  { key: 'health', label: 'Health', color: 'hsl(340 65% 55%)' },
                  { key: 'transport', label: 'Transport', color: 'hsl(38 92% 50%)' },
                  { key: 'other', label: 'Other', color: 'hsl(174 60% 45%)' },
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-org" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('Organization Spending Analysis', 'تحليل إنفاق المنظمات')}</CardTitle>
              <CardDescription>{t('Budget allocation and utilization by organization', 'تخصيص الميزانية والاستخدام حسب المنظمة')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className={cn("py-3 text-left font-medium", isRTL && "text-right")}>{t('Organization', 'المنظمة')}</th>
                      <th className={cn("py-3 text-left font-medium", isRTL && "text-right")}>{t('Employees', 'الموظفون')}</th>
                      <th className={cn("py-3 text-left font-medium", isRTL && "text-right")}>{t('Budget', 'الميزانية')}</th>
                      <th className={cn("py-3 text-left font-medium", isRTL && "text-right")}>{t('Spent', 'المنفق')}</th>
                      <th className={cn("py-3 text-left font-medium", isRTL && "text-right")}>{t('Utilization', 'الاستخدام')}</th>
                      <th className={cn("py-3 text-left font-medium", isRTL && "text-right")}>{t('Status', 'الحالة')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {organizationSpend.map((org) => (
                      <tr key={org.org} className="border-b last:border-0">
                        <td className="py-4 font-medium">{org.org}</td>
                        <td className="py-4">{org.employees.toLocaleString()}</td>
                        <td className="py-4">AED {(org.budget / 1000000).toFixed(1)}M</td>
                        <td className="py-4">AED {(org.spent / 1000000).toFixed(1)}M</td>
                        <td className="py-4">
                          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                            <Progress value={org.utilization} className="w-20 h-2" />
                            <span className="text-sm w-10">{org.utilization}%</span>
                          </div>
                        </td>
                        <td className="py-4">
                          {org.utilization >= 75 ? (
                            <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                              <CheckCircle className="w-3 h-3 mr-1" /> {t('Healthy', 'صحي')}
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">
                              <AlertTriangle className="w-3 h-3 mr-1" /> {t('Review', 'مراجعة')}
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('Spend by Department (Platform-wide)', 'الإنفاق حسب القسم (على مستوى المنصة)')}</CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatedBarChart
                data={spendByDepartment.map(d => ({ 
                  name: d.department, 
                  value: d.spend / 1000000,
                  secondaryValue: d.avgSpend / 1000
                }))}
                height={300}
                formatValue={(v) => `${v.toFixed(1)}M`}
                showLabels
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-category" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {spendByCategory.map((cat) => (
              <Card key={cat.name}>
                <CardContent className="p-6">
                  <div className={cn("flex items-center justify-between mb-4", isRTL && "flex-row-reverse")}>
                    <h4 className="font-semibold text-lg">{cat.name}</h4>
                    <Badge variant="secondary">{cat.value}%</Badge>
                  </div>
                  <p className="text-3xl font-bold mb-2">AED {(cat.amount / 1000000).toFixed(2)}M</p>
                  <Progress value={cat.value} className="h-2" style={{ '--progress-color': cat.color } as React.CSSProperties} />
                  <p className="text-sm text-muted-foreground mt-2">
                    {t('of total platform spend', 'من إجمالي إنفاق المنصة')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="zombie" className="space-y-6">
          {/* Zombie Spend Alert */}
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="p-6">
              <div className={cn("flex items-start gap-4", isRTL && "flex-row-reverse")}>
                <div className="p-3 rounded-xl bg-destructive/10">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{t('Zombie Spend Detected', 'تم اكتشاف الإنفاق الميت')}</h3>
                  <p className="text-muted-foreground mb-2">
                    {t('Benefits allocated but significantly underutilized across the platform', 'مزايا مخصصة ولكنها غير مستخدمة بشكل كبير عبر المنصة')}
                  </p>
                  <p className="text-2xl font-bold text-destructive">
                    AED {(totalZombieWaste / 1000).toFixed(0)}K {t('potential savings', 'توفير محتمل')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Zombie Spend Details */}
          <Card>
            <CardHeader>
              <CardTitle>{t('Underutilized Benefits Analysis', 'تحليل المزايا غير المستغلة')}</CardTitle>
              <CardDescription>
                {t('Identify benefits with low engagement and high waste potential', 'تحديد المزايا ذات التفاعل المنخفض وإمكانية الهدر العالية')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {zombieSpendRisks.map((risk) => {
                  const utilizationRate = Math.round((risk.used / risk.allocated) * 100);
                  const userRate = Math.round((risk.activeUsers / risk.users) * 100);
                  
                  return (
                    <div key={risk.category} className="p-4 rounded-lg border">
                      <div className={cn("flex items-start justify-between mb-3", isRTL && "flex-row-reverse")}>
                        <div>
                          <h4 className="font-semibold">{risk.category}</h4>
                          <p className="text-sm text-muted-foreground">
                            {risk.activeUsers} / {risk.users} {t('users active', 'مستخدم نشط')} ({userRate}%)
                          </p>
                        </div>
                        <Badge variant="destructive">
                          AED {(risk.waste / 1000).toFixed(0)}K {t('waste', 'هدر')}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">{t('Allocated', 'المخصص')}</p>
                          <p className="font-medium">AED {(risk.allocated / 1000).toFixed(0)}K</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">{t('Used', 'المستخدم')}</p>
                          <p className="font-medium">AED {(risk.used / 1000).toFixed(0)}K</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">{t('Utilization', 'الاستخدام')}</p>
                          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                            <Progress value={utilizationRate} className="flex-1 h-2" />
                            <span className={cn("font-medium", utilizationRate < 50 ? "text-destructive" : "text-yellow-500")}>
                              {utilizationRate}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
