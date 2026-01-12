import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Tag, 
  TrendingUp, 
  DollarSign, 
  Eye, 
  Users, 
  Plus,
  Edit,
  ToggleLeft,
  ToggleRight,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Wallet,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { AnimatedLineChart } from '@/components/charts/AnimatedLineChart';
import { AnimatedBarChart } from '@/components/charts/AnimatedBarChart';

const vendorMetrics = [
  { label: 'Active Offers', labelAr: 'العروض النشطة', value: '12', change: '+2', trend: 'up', icon: Tag },
  { label: 'Total Views', labelAr: 'إجمالي المشاهدات', value: '4,562', change: '+18%', trend: 'up', icon: Eye },
  { label: 'Redemptions', labelAr: 'عمليات الاسترداد', value: '847', change: '+12%', trend: 'up', icon: Users },
  { label: 'Total Earnings', labelAr: 'إجمالي الأرباح', value: 'AED 24,500', change: '+15%', trend: 'up', icon: DollarSign },
];

const myOffers = [
  { 
    id: 1, 
    title: '20% Off Premium Gym Membership', 
    category: 'Fitness',
    views: 1250, 
    redemptions: 245, 
    earnings: 8500,
    status: 'active',
    expiresAt: '2026-03-31',
  },
  { 
    id: 2, 
    title: 'Free Trial - Wellness App', 
    category: 'Wellness',
    views: 890, 
    redemptions: 167, 
    earnings: 4200,
    status: 'active',
    expiresAt: '2026-02-28',
  },
  { 
    id: 3, 
    title: '15% Off Health Checkup', 
    category: 'Health',
    views: 720, 
    redemptions: 134, 
    earnings: 5800,
    status: 'active',
    expiresAt: '2026-04-15',
  },
  { 
    id: 4, 
    title: 'Buy 1 Get 1 - Spa Treatment', 
    category: 'Wellness',
    views: 1102, 
    redemptions: 201, 
    earnings: 6000,
    status: 'paused',
    expiresAt: '2026-02-15',
  },
];

const monthlyPerformance = [
  { month: 'Jul', views: 2800, redemptions: 520, earnings: 15200 },
  { month: 'Aug', views: 3100, redemptions: 580, earnings: 17500 },
  { month: 'Sep', views: 3400, redemptions: 640, earnings: 19200 },
  { month: 'Oct', views: 3800, redemptions: 720, earnings: 21800 },
  { month: 'Nov', views: 4200, redemptions: 790, earnings: 23500 },
  { month: 'Dec', views: 4562, redemptions: 847, earnings: 24500 },
];

const recentTransactions = [
  { id: 'TXN001', offer: '20% Off Premium Gym', user: 'Employee #4521', amount: 35, date: '2026-01-12', status: 'completed' },
  { id: 'TXN002', offer: 'Free Trial - Wellness App', user: 'Employee #3892', amount: 25, date: '2026-01-12', status: 'completed' },
  { id: 'TXN003', offer: '15% Off Health Checkup', user: 'Employee #2156', amount: 45, date: '2026-01-11', status: 'completed' },
  { id: 'TXN004', offer: '20% Off Premium Gym', user: 'Employee #5678', amount: 35, date: '2026-01-11', status: 'pending' },
  { id: 'TXN005', offer: 'Buy 1 Get 1 - Spa', user: 'Employee #1234', amount: 30, date: '2026-01-10', status: 'completed' },
];

export default function VendorDashboard() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const [searchQuery, setSearchQuery] = useState('');

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const filteredOffers = myOffers.filter(offer => 
    offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    offer.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={cn("space-y-8", isRTL && "text-right")}>
      {/* Header */}
      <div className={cn("flex flex-col md:flex-row md:items-center md:justify-between gap-4", isRTL && "md:flex-row-reverse")}>
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            {t('Vendor Dashboard', 'لوحة تحكم المورد')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('Manage your offers and track performance', 'إدارة عروضك وتتبع الأداء')}
          </p>
        </div>
        <Button size="lg" className="gap-2">
          <Plus className="w-4 h-4" />
          {t('Create New Offer', 'إنشاء عرض جديد')}
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {vendorMetrics.map((metric) => (
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
                    <span className="text-xs text-muted-foreground">{t('this month', 'هذا الشهر')}</span>
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
      <Tabs defaultValue="offers" className="space-y-6">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="offers">{t('My Offers', 'عروضي')}</TabsTrigger>
          <TabsTrigger value="analytics">{t('Analytics', 'التحليلات')}</TabsTrigger>
          <TabsTrigger value="transactions">{t('Transactions', 'المعاملات')}</TabsTrigger>
          <TabsTrigger value="earnings">{t('Earnings', 'الأرباح')}</TabsTrigger>
        </TabsList>

        <TabsContent value="offers" className="space-y-6">
          {/* Search */}
          <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
            <Input
              placeholder={t('Search offers...', 'بحث في العروض...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {/* Offers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOffers.map((offer) => (
              <Card key={offer.id} className={cn(offer.status === 'paused' && "opacity-75")}>
                <CardContent className="p-6">
                  <div className={cn("flex items-start justify-between mb-4", isRTL && "flex-row-reverse")}>
                    <div>
                      <h3 className="font-semibold">{offer.title}</h3>
                      <div className={cn("flex items-center gap-2 mt-1", isRTL && "flex-row-reverse")}>
                        <Badge variant="secondary">{offer.category}</Badge>
                        <Badge variant={offer.status === 'active' ? 'default' : 'outline'}>
                          {offer.status === 'active' ? t('Active', 'نشط') : t('Paused', 'متوقف')}
                        </Badge>
                      </div>
                    </div>
                    <div className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")}>
                      <Button variant="ghost" size="icon">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        {offer.status === 'active' ? (
                          <ToggleRight className="w-4 h-4 text-green-500" />
                        ) : (
                          <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-4 border-t border-b">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{offer.views.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{t('Views', 'المشاهدات')}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{offer.redemptions}</p>
                      <p className="text-xs text-muted-foreground">{t('Redemptions', 'الاستردادات')}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">AED {offer.earnings.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{t('Earnings', 'الأرباح')}</p>
                    </div>
                  </div>

                  <div className={cn("flex items-center justify-between mt-4 text-sm text-muted-foreground", isRTL && "flex-row-reverse")}>
                    <span className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")}>
                      <Calendar className="w-4 h-4" />
                      {t('Expires:', 'ينتهي:')} {offer.expiresAt}
                    </span>
                    <span className="font-medium">
                      {((offer.redemptions / offer.views) * 100).toFixed(1)}% {t('conversion', 'معدل التحويل')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('Views & Redemptions', 'المشاهدات والاستردادات')}</CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatedLineChart
                  data={monthlyPerformance}
                  lines={[
                    { key: 'views', name: t('Views', 'المشاهدات'), color: 'hsl(var(--chart-1))' },
                    { key: 'redemptions', name: t('Redemptions', 'الاستردادات'), color: 'hsl(var(--chart-2))' },
                  ]}
                  xAxisKey="month"
                  height={300}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('Monthly Earnings', 'الأرباح الشهرية')}</CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatedBarChart
                  data={monthlyPerformance.map(m => ({ name: m.month, value: m.earnings / 1000 }))}
                  height={300}
                  barColor="hsl(var(--chart-3))"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('Recent Transactions', 'المعاملات الأخيرة')}</CardTitle>
              <CardDescription>
                {t('Track redemptions and commission earnings', 'تتبع الاستردادات وأرباح العمولة')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className={cn("py-3 text-left font-medium", isRTL && "text-right")}>{t('ID', 'المعرف')}</th>
                      <th className={cn("py-3 text-left font-medium", isRTL && "text-right")}>{t('Offer', 'العرض')}</th>
                      <th className={cn("py-3 text-left font-medium", isRTL && "text-right")}>{t('User', 'المستخدم')}</th>
                      <th className={cn("py-3 text-left font-medium", isRTL && "text-right")}>{t('Commission', 'العمولة')}</th>
                      <th className={cn("py-3 text-left font-medium", isRTL && "text-right")}>{t('Date', 'التاريخ')}</th>
                      <th className={cn("py-3 text-left font-medium", isRTL && "text-right")}>{t('Status', 'الحالة')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((txn) => (
                      <tr key={txn.id} className="border-b last:border-0">
                        <td className="py-4 font-mono text-sm">{txn.id}</td>
                        <td className="py-4">{txn.offer}</td>
                        <td className="py-4 text-muted-foreground">{txn.user}</td>
                        <td className="py-4 font-medium text-green-600">AED {txn.amount}</td>
                        <td className="py-4 text-muted-foreground">{txn.date}</td>
                        <td className="py-4">
                          <Badge variant={txn.status === 'completed' ? 'default' : 'secondary'}>
                            {txn.status === 'completed' ? t('Completed', 'مكتمل') : t('Pending', 'قيد الانتظار')}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Wallet className="w-8 h-8 mx-auto text-primary mb-2" />
                <p className="text-sm text-muted-foreground">{t('Total Earnings (YTD)', 'إجمالي الأرباح (منذ بداية العام)')}</p>
                <p className="text-3xl font-bold mt-1 text-green-600">AED 24,500</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <DollarSign className="w-8 h-8 mx-auto text-primary mb-2" />
                <p className="text-sm text-muted-foreground">{t('Pending Payout', 'الدفع المعلق')}</p>
                <p className="text-3xl font-bold mt-1">AED 3,250</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 mx-auto text-primary mb-2" />
                <p className="text-sm text-muted-foreground">{t('Commission Rate', 'معدل العمولة')}</p>
                <p className="text-3xl font-bold mt-1">10%</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('Payout History', 'سجل الدفعات')}</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-12">
              <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                {t('Payout history will appear here', 'سيظهر سجل الدفعات هنا')}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}