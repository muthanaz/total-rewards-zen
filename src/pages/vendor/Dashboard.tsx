import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LayoutDashboard, 
  Tag,
  TrendingUp,
  Users,
  Wallet,
  Plus,
  ArrowRight,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { cn, formatCurrencyAED, formatPercent, formatInteger } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useVendor, useVendorOffers, useVendorAnalytics, usePayoutSummary } from '@/hooks/useVendorData';
import { ChartWrapper, CHART_EXPLANATIONS, AnimatedLineChart, AnimatedBarChart } from '@/components/charts';
import { PageLayout, MetricCard, MetricGrid } from '@/components/shared';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

const STATUS_CONFIG: Record<string, { label: string; labelAr: string; icon: React.ElementType; className: string }> = {
  pending: { label: 'Pending', labelAr: 'قيد الانتظار', icon: Clock, className: 'bg-warning/10 text-warning border-warning/30' },
  active: { label: 'Active', labelAr: 'نشط', icon: CheckCircle, className: 'bg-success/10 text-success border-success/30' },
  suspended: { label: 'Suspended', labelAr: 'موقوف', icon: AlertTriangle, className: 'bg-muted text-muted-foreground border-border' },
  rejected: { label: 'Rejected', labelAr: 'مرفوض', icon: XCircle, className: 'bg-destructive/10 text-destructive border-destructive/30' },
};

export default function VendorDashboard() {
  const navigate = useNavigate();
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const { data: vendor, isLoading: vendorLoading } = useVendor();
  const { data: offers, isLoading: offersLoading } = useVendorOffers();
  const { data: analytics, isLoading: analyticsLoading } = useVendorAnalytics();
  const { data: payoutSummary } = usePayoutSummary();

  const isLoading = vendorLoading || offersLoading || analyticsLoading;

  const activeOffers = offers?.filter(o => o.status === 'active') || [];
  const pendingOffers = offers?.filter(o => o.status === 'pending') || [];

  const metrics = [
    {
      title: t('Active Offers', 'العروض النشطة'),
      value: formatInteger(activeOffers.length),
      icon: Tag,
      trend: { value: 5, positive: true },
    },
    {
      title: t('Total Activations', 'إجمالي التفعيلات'),
      value: formatInteger(analytics?.totalActivations || 0),
      icon: Users,
      trend: { value: 12, positive: true },
    },
    {
      title: t('Conversion Rate', 'معدل التحويل'),
      value: formatPercent(analytics?.conversionRate || 0),
      icon: TrendingUp,
      trend: { value: 3, positive: true },
    },
    {
      title: t('Pending Payout', 'المدفوعات المعلقة'),
      value: formatCurrencyAED(payoutSummary?.pendingPayout || analytics?.pendingPayout || 0),
      icon: Wallet,
    },
  ];

  // Chart data from analytics
  const activationsChartData = analytics?.activationsByDate.map(d => ({
    name: d.date,
    value: d.count,
  })) || [];

  const categoryChartData = analytics?.activationsByCategory.map(d => ({
    name: d.category,
    value: d.count,
  })) || [];

  if (!vendor && !vendorLoading) {
    return (
      <PageLayout
        title={t('Vendor Dashboard', 'لوحة تحكم البائع')}
        description={t('Set up your vendor profile to start creating offers', 'قم بإعداد ملف البائع الخاص بك لبدء إنشاء العروض')}
        icon={LayoutDashboard}
      >
        <EmptyState
          icon={Sparkles}
          title={t('Welcome to the Vendor Portal', 'مرحبًا بك في بوابة البائعين')}
          description={t('Complete your vendor profile to start creating offers for employees', 'أكمل ملف البائع الخاص بك لبدء إنشاء عروض للموظفين')}
          action={{
            label: t('Complete Profile', 'أكمل الملف الشخصي'),
            onClick: () => navigate('/vendor/profile'),
          }}
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={t('Dashboard', 'لوحة التحكم')}
      description={t(`Welcome back, ${vendor?.company_name || 'Vendor'}`, `مرحبًا بعودتك، ${vendor?.company_name || 'البائع'}`)}
      icon={LayoutDashboard}
      iconClassName="text-primary"
      actions={
        <Button onClick={() => navigate('/vendor/offers/new')}>
          <Plus className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
          {t('Create Offer', 'إنشاء عرض')}
        </Button>
      }
    >
      {/* Metrics */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : (
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
      )}

      {/* Pending Offers Alert */}
      {pendingOffers.length > 0 && (
        <Card className="mt-6 border-warning/30 bg-warning/5">
          <CardContent className="pt-6">
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <div className={cn(isRTL && "text-right")}>
                  <p className="font-medium">
                    {t(`${pendingOffers.length} offer(s) pending review`, `${pendingOffers.length} عرض(عروض) قيد المراجعة`)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('Your offers are being reviewed by the admin team', 'يتم مراجعة عروضك من قبل فريق الإدارة')}
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={() => navigate('/vendor/offers')}>
                {t('View Offers', 'عرض العروض')}
                {isRTL ? <ArrowRight className="w-4 h-4 mr-2 rotate-180" /> : <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Charts */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="activations">
            <TabsList>
              <TabsTrigger value="activations">{t('Activations', 'التفعيلات')}</TabsTrigger>
              <TabsTrigger value="categories">{t('Categories', 'الفئات')}</TabsTrigger>
            </TabsList>
            <TabsContent value="activations" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('Activations Over Time', 'التفعيلات عبر الزمن')}</CardTitle>
                </CardHeader>
                <CardContent>
                  {activationsChartData.length > 0 ? (
                    <AnimatedLineChart
                      data={activationsChartData}
                      height={300}
                    />
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      {t('No activation data yet', 'لا توجد بيانات تفعيل بعد')}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="categories" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('Activations by Category', 'التفعيلات حسب الفئة')}</CardTitle>
                </CardHeader>
                <CardContent>
                  {categoryChartData.length > 0 ? (
                    <AnimatedBarChart
                      data={categoryChartData}
                      height={300}
                    />
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      {t('No category data yet', 'لا توجد بيانات فئات بعد')}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Recent Offers */}
        <div className="space-y-6">
          <Card>
            <CardHeader className={cn("flex flex-row items-center justify-between", isRTL && "flex-row-reverse")}>
              <CardTitle className="text-lg">{t('Recent Offers', 'أحدث العروض')}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/vendor/offers')}>
                {t('View All', 'عرض الكل')}
              </Button>
            </CardHeader>
            <CardContent>
              {offersLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}
                </div>
              ) : offers?.length === 0 ? (
                <EmptyState
                  icon={Tag}
                  title={t('No offers yet', 'لا توجد عروض بعد')}
                  description={t('Create your first offer', 'أنشئ عرضك الأول')}
                />
              ) : (
                <div className="space-y-3">
                  {offers?.slice(0, 5).map(offer => {
                    const statusConfig = STATUS_CONFIG[offer.status] || STATUS_CONFIG.pending;
                    const StatusIcon = statusConfig.icon;
                    return (
                      <div 
                        key={offer.id} 
                        className={cn(
                          "flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors",
                          isRTL && "flex-row-reverse"
                        )}
                        onClick={() => navigate('/vendor/offers')}
                      >
                        <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                          {offer.image_url ? (
                            <img src={offer.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                              <Tag className="w-5 h-5 text-muted-foreground" />
                            </div>
                          )}
                          <div className={cn(isRTL && "text-right")}>
                            <p className="font-medium text-sm line-clamp-1">{offer.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {offer.discount_percent ? `${offer.discount_percent}% off` : offer.category}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className={cn("shrink-0", statusConfig.className)}>
                          <StatusIcon className="w-3 h-3 me-1" />
                          {language === 'ar' ? statusConfig.labelAr : statusConfig.label}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('Quick Actions', 'الإجراءات السريعة')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => navigate('/vendor/offers/new')}
              >
                <Plus className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                {t('Create New Offer', 'إنشاء عرض جديد')}
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => navigate('/vendor/analytics')}
              >
                <TrendingUp className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                {t('View Analytics', 'عرض التحليلات')}
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => navigate('/vendor/earnings')}
              >
                <Wallet className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                {t('View Payouts', 'عرض المدفوعات')}
              </Button>
            </CardContent>
          </Card>

          {/* Commission Info */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className={cn("flex items-start gap-3", isRTL && "flex-row-reverse text-right")}>
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Wallet className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{t('Commission Rate', 'معدل العمولة')}</p>
                  <p className="text-2xl font-bold text-primary">{vendor?.commission_rate || 10}%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t(
                      'You earn this percentage on every successful redemption',
                      'تكسب هذه النسبة على كل استرداد ناجح'
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
