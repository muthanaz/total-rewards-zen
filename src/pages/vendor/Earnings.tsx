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
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { AnimatedLineChart } from '@/components/charts/AnimatedLineChart';
import { AnimatedBarChart } from '@/components/charts/AnimatedBarChart';
import { toast } from 'sonner';
import { PayoutThresholds } from '@/components/vendor/PayoutThresholds';

const earningsData = {
  totalEarnings: 24500,
  pendingPayout: 4200,
  lifetimeEarnings: 156800,
  commissionRate: 7,
  currentMonthEarnings: 4500,
  lastMonthEarnings: 3800,
};

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

const payoutHistory = [
  { id: 'PAY-001', amount: 12500, status: 'completed', method: 'Bank Transfer', date: '2025-12-15', reference: 'BNFT-DEC-2025' },
  { id: 'PAY-002', amount: 8800, status: 'completed', method: 'Bank Transfer', date: '2025-11-15', reference: 'BNFT-NOV-2025' },
  { id: 'PAY-003', amount: 7200, status: 'completed', method: 'Bank Transfer', date: '2025-10-15', reference: 'BNFT-OCT-2025' },
  { id: 'PAY-004', amount: 4200, status: 'pending', method: 'Bank Transfer', date: '2026-01-15', reference: 'BNFT-JAN-2026' },
];

export default function VendorEarnings() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const handleRequestPayout = () => {
    toast.success(t('Payout request submitted', 'تم تقديم طلب الدفع'));
  };

  const growthPercent = ((earningsData.currentMonthEarnings - earningsData.lastMonthEarnings) / earningsData.lastMonthEarnings * 100).toFixed(1);

  return (
    <div className={cn("space-y-6", isRTL && "text-right")}>
      {/* Header */}
      <div className={cn("flex flex-col md:flex-row md:items-center md:justify-between gap-4", isRTL && "md:flex-row-reverse")}>
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            {t('Earnings', 'الأرباح')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('Track your commissions and payouts', 'تتبع عمولاتك ومدفوعاتك')}
          </p>
        </div>
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
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">{t('Overview', 'نظرة عامة')}</TabsTrigger>
          <TabsTrigger value="tiers" className="gap-1.5">
            <Target className="w-3.5 h-3.5" />
            {t('Commission Tiers', 'مستويات العمولة')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className={cn("flex items-start justify-between", isRTL && "flex-row-reverse")}>
              <div>
                <p className="text-sm text-muted-foreground">{t('Total Balance', 'الرصيد الإجمالي')}</p>
                <p className="text-3xl font-bold mt-1">AED {earningsData.totalEarnings.toLocaleString()}</p>
                <div className={cn("flex items-center gap-1 mt-2 text-green-600", isRTL && "flex-row-reverse")}>
                  <ArrowUpRight className="w-4 h-4" />
                  <span className="text-sm font-medium">+{growthPercent}%</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-accent/10">
                <DollarSign className="w-6 h-6 text-accent" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent/20">
              <div className="h-full w-3/4 bg-accent rounded-full" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className={cn("flex items-start justify-between", isRTL && "flex-row-reverse")}>
              <div>
                <p className="text-sm text-muted-foreground">{t('Pending Payout', 'قيد الدفع')}</p>
                <p className="text-3xl font-bold mt-1">AED {earningsData.pendingPayout.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {t('Next payout: Jan 15', 'الدفعة التالية: ١٥ يناير')}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className={cn("flex items-start justify-between", isRTL && "flex-row-reverse")}>
              <div>
                <p className="text-sm text-muted-foreground">{t('Lifetime Earnings', 'الأرباح الإجمالية')}</p>
                <p className="text-3xl font-bold mt-1">AED {earningsData.lifetimeEarnings.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {t('Since Oct 2024', 'منذ أكتوبر ٢٠٢٤')}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className={cn("flex items-start justify-between", isRTL && "flex-row-reverse")}>
              <div>
                <p className="text-sm text-muted-foreground">{t('Commission Rate', 'نسبة العمولة')}</p>
                <p className="text-3xl font-bold mt-1">{earningsData.commissionRate}%</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {t('Per transaction', 'لكل معاملة')}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-green-500/10">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
            {payoutHistory.map((payout) => (
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
                    payout.status === 'completed' ? 'bg-green-500/10' : 'bg-amber-500/10'
                  )}>
                    {payout.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <Clock className="w-5 h-5 text-amber-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{payout.reference}</p>
                    <p className="text-sm text-muted-foreground">{payout.date} • {payout.method}</p>
                  </div>
                </div>
                <div className={cn("text-right", isRTL && "text-left")}>
                  <p className="text-lg font-bold">AED {payout.amount.toLocaleString()}</p>
                  <Badge className={cn(
                    payout.status === 'completed' 
                      ? 'bg-green-500/10 text-green-600' 
                      : 'bg-amber-500/10 text-amber-600'
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

        <TabsContent value="tiers" className="space-y-6">
          <PayoutThresholds />
        </TabsContent>
      </Tabs>
    </div>
  );
}
