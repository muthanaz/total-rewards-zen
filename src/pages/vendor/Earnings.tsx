import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign,
  TrendingUp,
  Calendar,
  Download,
  Wallet,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  CreditCard,
  Target,
} from 'lucide-react';
import { cn, formatCurrencyAED, formatPercent } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { AnimatedLineChart } from '@/components/charts/AnimatedLineChart';
import { AnimatedBarChart } from '@/components/charts/AnimatedBarChart';
import { toast } from 'sonner';
import { PayoutThresholds } from '@/components/vendor/PayoutThresholds';
import { VendorPayoutInvoices } from '@/components/vendor/VendorPayoutInvoices';
import { PageLayout, MetricCard, MetricGrid } from '@/components/shared';
import { usePayoutSummary, useVendorAnalytics } from '@/hooks/useVendorData';

export default function VendorEarnings() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const { data: payoutSummary } = usePayoutSummary();
  const { data: analytics } = useVendorAnalytics();

  const totalEarnings = payoutSummary?.totalEarned || analytics?.estimatedEarnings || 24500;
  const pendingPayout = payoutSummary?.pendingPayout || analytics?.pendingPayout || 4200;
  const lifetimeEarnings = payoutSummary?.totalEarned || 156800;
  const commissionRate = 7;
  const currentMonthEarnings = 4500;
  const lastMonthEarnings = 3800;

  const monthlyEarnings = [
    { name: 'Jul', value: 2800 },
    { name: 'Aug', value: 3100 },
    { name: 'Sep', value: 3400 },
    { name: 'Oct', value: 3800 },
    { name: 'Nov', value: 4200 },
    { name: 'Dec', value: 4500 },
  ];

  const earningsByOffer = [
    { name: 'Gym', value: 8500 },
    { name: 'Spa', value: 6000 },
    { name: 'Health', value: 5800 },
    { name: 'Wellness', value: 4200 },
  ];

  const payoutHistory = payoutSummary?.payoutHistory || [
    { id: 'PAY-001', amount: 12500, status: 'completed', method: 'Bank Transfer', date: '2025-12-15', reference: 'BNFT-DEC-2025' },
    { id: 'PAY-002', amount: 8800, status: 'completed', method: 'Bank Transfer', date: '2025-11-15', reference: 'BNFT-NOV-2025' },
    { id: 'PAY-003', amount: 7200, status: 'completed', method: 'Bank Transfer', date: '2025-10-15', reference: 'BNFT-OCT-2025' },
    { id: 'PAY-004', amount: 4200, status: 'pending', method: 'Bank Transfer', date: '2026-01-15', reference: 'BNFT-JAN-2026' },
  ];

  const handleRequestPayout = () => {
    toast.success(t('Payout request submitted', 'تم تقديم طلب الدفع'));
  };

  const growthPercent = ((currentMonthEarnings - lastMonthEarnings) / lastMonthEarnings * 100).toFixed(1);

  const metrics = [
    {
      title: t('Total Accrued Revenue', 'إجمالي الإيرادات المستحقة'),
      value: formatCurrencyAED(totalEarnings),
      icon: DollarSign,
      trend: { value: parseFloat(growthPercent), positive: true },
    },
    {
      title: t('Pending Disbursement', 'في انتظار الصرف'),
      value: formatCurrencyAED(pendingPayout),
      icon: Clock,
      subtitle: t('Scheduled: Jan 15', 'مجدول: ١٥ يناير'),
    },
    {
      title: t('Lifetime Earnings', 'الأرباح الإجمالية'),
      value: formatCurrencyAED(lifetimeEarnings),
      icon: TrendingUp,
      subtitle: t('Since Oct 2024', 'منذ أكتوبر ٢٠٢٤'),
    },
    {
      title: t('Commission Rate', 'نسبة العمولة'),
      value: formatPercent(commissionRate),
      icon: CreditCard,
      subtitle: t('Per transaction', 'لكل معاملة'),
    },
  ];

  return (
    <PageLayout
      title={t('Earnings', 'الأرباح')}
      description={t('Track your commissions and payouts', 'تتبع عمولاتك ومدفوعاتك')}
      icon={Wallet}
      iconClassName="text-primary"
      actions={
        <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            {t('Export', 'تصدير')}
          </Button>
          <Button className="gap-2" onClick={handleRequestPayout}>
            <Wallet className="w-4 h-4" />
            {t('Request Payout', 'طلب الدفع')}
          </Button>
        </div>
      }
    >
      {/* Tabs for different views */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">{t('Overview', 'نظرة عامة')}</TabsTrigger>
          <TabsTrigger value="payouts" className="gap-1.5">
            <Wallet className="w-3.5 h-3.5" />
            {t('Payouts & Invoices', 'المدفوعات والفواتير')}
          </TabsTrigger>
          <TabsTrigger value="tiers" className="gap-1.5">
            <Target className="w-3.5 h-3.5" />
            {t('Commission Tiers', 'مستويات العمولة')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <MetricGrid columns={4}>
            {metrics.map((metric, i) => (
              <MetricCard
                key={i}
                title={metric.title}
                value={metric.value}
                icon={metric.icon}
                trend={metric.trend}
              />
            ))}
          </MetricGrid>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className={cn(isRTL && "text-right")}>
                <CardTitle className="text-lg">{t('Monthly Earnings', 'الأرباح الشهرية')}</CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatedLineChart 
                  data={monthlyEarnings}
                  height={280}
                  showSecondary={false}
                  primaryLabel={t('Earnings (AED)', 'الأرباح (درهم)')}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className={cn(isRTL && "text-right")}>
                <CardTitle className="text-lg">{t('Earnings by Offer', 'الأرباح حسب العرض')}</CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatedBarChart 
                  data={earningsByOffer}
                  height={280}
                />
              </CardContent>
            </Card>
          </div>

          {/* Payout History */}
          <Card>
            <CardHeader className={cn(isRTL && "text-right")}>
              <CardTitle className="text-lg">{t('Payout History', 'سجل المدفوعات')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payoutHistory.map((payout: any) => (
                  <div 
                    key={payout.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors",
                      isRTL && "flex-row-reverse"
                    )}
                  >
                    <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
                      <div className={cn(
                        "p-2 rounded-lg",
                        payout.status === 'completed' ? 'bg-success/10' : 'bg-warning/10'
                      )}>
                        {payout.status === 'completed' ? (
                          <CheckCircle2 className="w-5 h-5 text-success" />
                        ) : (
                          <Clock className="w-5 h-5 text-warning" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{payout.reference}</p>
                        <p className="text-sm text-muted-foreground">{payout.date} • {payout.method}</p>
                      </div>
                    </div>
                    <div className={cn("text-right", isRTL && "text-left")}>
                      <p className="text-lg font-bold">{formatCurrencyAED(payout.amount)}</p>
                      <Badge variant="outline" className={cn(
                        payout.status === 'completed' 
                          ? 'bg-success/10 text-success border-success/30' 
                          : 'bg-warning/10 text-warning border-warning/30'
                      )}>
                        {payout.status === 'completed' 
                          ? t('Completed', 'مكتمل')
                          : t('Pending', 'قيد الانتظار')
                        }
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts" className="space-y-6">
          <VendorPayoutInvoices />
        </TabsContent>

        <TabsContent value="tiers" className="space-y-6">
          <PayoutThresholds />
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}