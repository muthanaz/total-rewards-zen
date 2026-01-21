import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
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
  Eye,
  Edit,
  Activity,
  Zap,
  Target,
  BarChart3,
  CircleDollarSign,
  Info,
  Lightbulb,
  FileCheck,
  Image,
  Type,
  MapPin,
  Gift,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { cn, formatCurrencyAED, formatPercent, formatInteger } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { useVendor } from '@/hooks/useVendorData';
import { 
  useVendorDashboard, 
  useVendorActivity, 
  useVendorProfileCompleteness,
  useSeedVendorDemoData,
  type OfferSummary,
  type ActivityEvent,
} from '@/hooks/useVendorDashboard';
import { AnimatedLineChart } from '@/components/charts';
import { PageLayout, MetricCard, MetricGrid } from '@/components/shared';
import { VendorOnboardingChecklist } from '@/components/vendor/VendorOnboardingChecklist';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

// ============= STATUS CONFIGURATION =============

const STATUS_CONFIG: Record<string, { label: string; labelAr: string; icon: React.ElementType; className: string }> = {
  pending: { label: 'Pending Approval', labelAr: 'قيد الموافقة', icon: Clock, className: 'bg-warning/10 text-warning border-warning/30' },
  active: { label: 'Active in Marketplace', labelAr: 'نشط في السوق', icon: CheckCircle, className: 'bg-success/10 text-success border-success/30' },
  expired: { label: 'Expired', labelAr: 'منتهي الصلاحية', icon: Calendar, className: 'bg-muted text-muted-foreground border-border' },
  suspended: { label: 'Suspended', labelAr: 'موقوف', icon: AlertTriangle, className: 'bg-muted text-muted-foreground border-border' },
  rejected: { label: 'Rejected', labelAr: 'مرفوض', icon: XCircle, className: 'bg-destructive/10 text-destructive border-destructive/30' },
};

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  activation: Users,
  redemption: CircleDollarSign,
  approval: CheckCircle,
  rejection: XCircle,
  creation: Plus,
};

// ============= MAIN COMPONENT =============

export default function VendorDashboard() {
  const navigate = useNavigate();
  const { language, direction } = useLanguage();
  const { isDemoMode } = useDemoMode();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const { data: vendor, isLoading: vendorLoading } = useVendor();
  const { data: dashboardData, isLoading: dashboardLoading } = useVendorDashboard();
  const { data: activityEvents, isLoading: activityLoading } = useVendorActivity();
  const { data: profileCompleteness } = useVendorProfileCompleteness();
  const seedDemoData = useSeedVendorDemoData();

  const [selectedOffer, setSelectedOffer] = useState<OfferSummary | null>(null);

  const isLoading = vendorLoading || dashboardLoading;
  const metrics = dashboardData?.metrics;
  const offers = dashboardData?.offers || [];
  const trendData = dashboardData?.trendData || [];
  const hasData = dashboardData?.hasData ?? false;

  // Convert trend data for chart
  const chartData = trendData.map(d => ({
    name: d.date,
    value: d.activations,
    secondaryValue: d.redemptions,
  }));

  // Handle no vendor profile
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

  // Handle empty state with demo seeding option
  if (!hasData && !isLoading && isDemoMode) {
    return (
      <PageLayout
        title={t('Dashboard', 'لوحة التحكم')}
        description={t(`Welcome, ${vendor?.company_name || 'Vendor'}`, `مرحبًا، ${vendor?.company_name || 'البائع'}`)}
        icon={LayoutDashboard}
        iconClassName="text-primary"
        actions={
          <Button onClick={() => navigate('/vendor/offers/new')}>
            <Plus className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
            {t('Create Offer', 'إنشاء عرض')}
          </Button>
        }
      >
        <div className="max-w-2xl mx-auto">
          <Card className="border-dashed border-2 border-primary/20">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t('Your Dashboard is Ready', 'لوحة التحكم جاهزة')}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {t(
                  'Create your first offer to start tracking activations, redemptions, and earnings.',
                  'أنشئ عرضك الأول لبدء تتبع التفعيلات والاستردادات والأرباح.'
                )}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => navigate('/vendor/offers/new')}>
                  <Plus className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                  {t('Create Your First Offer', 'أنشئ عرضك الأول')}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => seedDemoData.mutate()}
                  disabled={seedDemoData.isPending}
                >
                  <RefreshCw className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2", seedDemoData.isPending && "animate-spin")} />
                  {t('Load Demo Data', 'تحميل بيانات تجريبية')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* What happens next guidance */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-warning" />
                {t('What Happens Next?', 'ماذا يحدث بعد ذلك؟')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={cn("flex gap-3", isRTL && "flex-row-reverse text-right")}>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-medium text-primary">1</div>
                <div>
                  <p className="font-medium">{t('Create an Offer', 'أنشئ عرضًا')}</p>
                  <p className="text-sm text-muted-foreground">{t('Add your discount, terms, and images.', 'أضف خصمك وشروطك وصورك.')}</p>
                </div>
              </div>
              <div className={cn("flex gap-3", isRTL && "flex-row-reverse text-right")}>
                <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center shrink-0 text-sm font-medium text-warning">2</div>
                <div>
                  <p className="font-medium">{t('Admin Review', 'مراجعة الإدارة')}</p>
                  <p className="text-sm text-muted-foreground">{t('Your offer is reviewed for quality and compliance (usually 1-2 business days).', 'يتم مراجعة عرضك للجودة والامتثال (عادة 1-2 أيام عمل).')}</p>
                </div>
              </div>
              <div className={cn("flex gap-3", isRTL && "flex-row-reverse text-right")}>
                <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center shrink-0 text-sm font-medium text-success">3</div>
                <div>
                  <p className="font-medium">{t('Go Live', 'انطلق')}</p>
                  <p className="text-sm text-muted-foreground">{t('Once approved, your offer appears in the Employee Marketplace.', 'بمجرد الموافقة، يظهر عرضك في سوق الموظفين.')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  // Calculate additional metrics for hero display
  const conversionHealth = (metrics?.redemptionRate || 0) >= 40 ? 'excellent' : 
                           (metrics?.redemptionRate || 0) >= 25 ? 'good' : 'attention';

  return (
    <PageLayout
      title={t('Vendor Dashboard', 'لوحة تحكم البائع')}
      description={t(`Welcome, ${vendor?.company_name || 'Vendor'}! Track your offers, performance, and earnings.`, `مرحباً، ${vendor?.company_name || 'البائع'}! تتبع عروضك وأدائك وأرباحك.`)}
      icon={LayoutDashboard}
      iconClassName="from-accent to-accent/80"
      badge={hasData ? {
        label: conversionHealth === 'excellent' ? t('Healthy', 'صحي') : 
               conversionHealth === 'good' ? t('Good', 'جيد') : 
               t('Needs Attention', 'يحتاج اهتمام'),
        variant: conversionHealth === 'excellent' ? 'success' : 
                 conversionHealth === 'good' ? 'default' : 'warning',
        icon: conversionHealth === 'excellent' ? CheckCircle : 
              conversionHealth === 'good' ? TrendingUp : AlertTriangle,
      } : undefined}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/vendor/analytics')}>
            <BarChart3 className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
            {t('Analytics', 'التحليلات')}
          </Button>
          <Button onClick={() => navigate('/vendor/offers/new')}>
            <Plus className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
            {t('Create Offer', 'إنشاء عرض')}
          </Button>
        </div>
      }
    >
      {/* Onboarding Checklist - Show if profile incomplete */}
      {profileCompleteness && profileCompleteness.completionPercent < 100 && (
        <VendorOnboardingChecklist compact className="mb-6" />
      )}

      {/* Hero KPI Metrics Grid - Premium 2x3 layout */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Active Offers - Primary metric */}
          <Card className="border-success/30 bg-gradient-to-br from-card to-success/5">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-success/10">
                  <Tag className="w-5 h-5 text-success" />
                </div>
                <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-xs">Live</Badge>
              </div>
              <p className="text-3xl font-bold tracking-tight">{formatInteger(metrics?.activeOffers || 0)}</p>
              <p className="text-sm text-muted-foreground mt-1">{t('Active Offers', 'العروض النشطة')}</p>
            </CardContent>
          </Card>

          {/* Pending Offers */}
          <Card className={cn("border-warning/30", (metrics?.pendingOffers || 0) > 0 && "bg-gradient-to-br from-card to-warning/5")}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-warning/10">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                {(metrics?.pendingOffers || 0) > 0 && (
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 text-xs">Pending</Badge>
                )}
              </div>
              <p className="text-3xl font-bold tracking-tight">{formatInteger(metrics?.pendingOffers || 0)}</p>
              <p className="text-sm text-muted-foreground mt-1">{t('Pending Approval', 'قيد الموافقة')}</p>
            </CardContent>
          </Card>

          {/* Activations */}
          <Card className="border-primary/30 bg-gradient-to-br from-card to-primary/5">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground">30d</span>
              </div>
              <p className="text-3xl font-bold tracking-tight">{formatInteger(metrics?.activations30d || 0)}</p>
              <p className="text-sm text-muted-foreground mt-1">{t('Activations', 'التفعيلات')}</p>
            </CardContent>
          </Card>

          {/* Redemption Rate */}
          <Card className="border-accent/30 bg-gradient-to-br from-card to-accent/5">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-accent/10">
                  <Target className="w-5 h-5 text-accent" />
                </div>
                <Badge variant="outline" className={cn(
                  "text-xs",
                  (metrics?.redemptionRate || 0) >= 40 ? "bg-success/10 text-success border-success/30" :
                  (metrics?.redemptionRate || 0) >= 25 ? "bg-accent/10 text-accent border-accent/30" :
                  "bg-warning/10 text-warning border-warning/30"
                )}>
                  {(metrics?.redemptionRate || 0) >= 40 ? 'High' : (metrics?.redemptionRate || 0) >= 25 ? 'Good' : 'Low'}
                </Badge>
              </div>
              <p className="text-3xl font-bold tracking-tight">{metrics?.activations30d ? formatPercent(metrics?.redemptionRate || 0) : '—'}</p>
              <p className="text-sm text-muted-foreground mt-1">{t('Conversion Rate', 'معدل التحويل')}</p>
            </CardContent>
          </Card>

          {/* Earnings */}
          <Card className="border-success/30 bg-gradient-to-br from-card to-success/5">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-success/10">
                  <CircleDollarSign className="w-5 h-5 text-success" />
                </div>
                <span className="text-xs text-muted-foreground">30d</span>
              </div>
              <p className="text-3xl font-bold tracking-tight text-success">{formatCurrencyAED(metrics?.earnings30d || 0)}</p>
              <p className="text-sm text-muted-foreground mt-1">{t('Earnings', 'الأرباح')}</p>
            </CardContent>
          </Card>

          {/* Pending Payout - Clickable */}
          <Card 
            className="border-accent/30 bg-gradient-to-br from-card to-accent/5 cursor-pointer hover:shadow-md transition-all"
            onClick={() => navigate('/vendor/earnings')}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-accent/10">
                  <Wallet className="w-5 h-5 text-accent" />
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold tracking-tight">{formatCurrencyAED(metrics?.pendingPayout || 0)}</p>
              <p className="text-sm text-muted-foreground mt-1">{t('Pending Payout', 'مدفوعات معلقة')}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pending Offers Alert */}
      {(metrics?.pendingOffers || 0) > 0 && (
        <Card className="mt-6 border-warning/30 bg-warning/5">
          <CardContent className="pt-6">
            <div className={cn("flex items-center justify-between flex-wrap gap-4", isRTL && "flex-row-reverse")}>
              <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <div className={cn(isRTL && "text-right")}>
                  <p className="font-medium">
                    {t(`${metrics?.pendingOffers} offer(s) pending approval`, `${metrics?.pendingOffers} عرض(عروض) قيد الموافقة`)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('Your offers are being reviewed by the admin team. This typically takes 1-2 business days.', 'يتم مراجعة عروضك من قبل فريق الإدارة. يستغرق هذا عادة 1-2 أيام عمل.')}
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={() => navigate('/vendor/offers')}>
                {t('View Offers', 'عرض العروض')}
                <ArrowRight className={cn("w-4 h-4", isRTL ? "mr-2 rotate-180" : "ml-2")} />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left Column: Charts + Offers Table */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                {t('Performance Trend (30 Days)', 'اتجاه الأداء (30 يومًا)')}
              </CardTitle>
              <CardDescription>
                {t('Daily activations and redemptions for your offers', 'التفعيلات والاستردادات اليومية لعروضك')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 && chartData.some(d => d.value > 0 || d.secondaryValue > 0) ? (
                <AnimatedLineChart
                  data={chartData}
                  height={280}
                  showArea
                  showSecondary
                  primaryLabel={t('Activations', 'التفعيلات')}
                  secondaryLabel={t('Redemptions', 'الاستردادات')}
                />
              ) : (
                <div className="h-[280px] flex flex-col items-center justify-center text-muted-foreground">
                  <Activity className="w-12 h-12 mb-3 opacity-30" />
                  <p>{t('No activity data yet', 'لا توجد بيانات نشاط بعد')}</p>
                  <p className="text-sm">{t('Activations will appear here once employees engage with your offers', 'ستظهر التفعيلات هنا بمجرد تفاعل الموظفين مع عروضك')}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Your Offers Table */}
          <Card>
            <CardHeader className={cn("flex flex-row items-center justify-between", isRTL && "flex-row-reverse")}>
              <div>
                <CardTitle className="text-lg">{t('Your Offers', 'عروضك')}</CardTitle>
                <CardDescription>{t('Sorted by status priority and recency', 'مرتبة حسب أولوية الحالة والحداثة')}</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/vendor/offers')}>
                {t('View All', 'عرض الكل')}
                <ArrowRight className={cn("w-4 h-4", isRTL ? "mr-1 rotate-180" : "ml-1")} />
              </Button>
            </CardHeader>
            <CardContent>
              {offers.length === 0 ? (
                <EmptyState
                  icon={Tag}
                  title={t('No offers yet', 'لا توجد عروض بعد')}
                  description={t('Create your first offer to reach employees', 'أنشئ عرضك الأول للوصول إلى الموظفين')}
                  action={{
                    label: t('Create Offer', 'إنشاء عرض'),
                    onClick: () => navigate('/vendor/offers/new'),
                  }}
                />
              ) : (
                <div className="space-y-2">
                  {offers.slice(0, 5).map(offer => {
                    const statusConfig = STATUS_CONFIG[offer.status] || STATUS_CONFIG.pending;
                    const StatusIcon = statusConfig.icon;
                    const isEditable = offer.status === 'pending' || offer.status === 'rejected';
                    
                    return (
                      <div 
                        key={offer.id}
                        className={cn(
                          "flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors",
                          isRTL && "flex-row-reverse"
                        )}
                      >
                        <div className={cn("flex items-center gap-3 flex-1 min-w-0", isRTL && "flex-row-reverse")}>
                          {offer.imageUrl ? (
                            <img src={offer.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                              <Tag className="w-5 h-5 text-muted-foreground" />
                            </div>
                          )}
                          <div className={cn("min-w-0 flex-1", isRTL && "text-right")}>
                            <p className="font-medium text-sm truncate">{offer.title}</p>
                            <div className={cn("flex items-center gap-2 text-xs text-muted-foreground mt-0.5", isRTL && "flex-row-reverse")}>
                              <span>{offer.discountDisplay}</span>
                              <span>•</span>
                              <span>{offer.category}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className={cn("flex items-center gap-2 shrink-0", isRTL && "flex-row-reverse")}>
                          <Badge variant="outline" className={cn("text-xs", statusConfig.className)}>
                            <StatusIcon className="w-3 h-3 me-1" />
                            {language === 'ar' ? statusConfig.labelAr : statusConfig.label}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => setSelectedOffer(offer)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {isEditable && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => navigate(`/vendor/offers?edit=${offer.id}`)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Activity + Payout + Guidance */}
        <div className="space-y-6">
          {/* Payout Snapshot */}
          <Card className="border-accent/20 bg-gradient-to-br from-card to-accent/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Wallet className="w-5 h-5 text-accent" />
                {t('Payout Snapshot', 'ملخص المدفوعات')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                <span className="text-sm text-muted-foreground">{t('Pending Payout', 'مدفوعات معلقة')}</span>
                <span className="text-xl font-bold">{formatCurrencyAED(metrics?.pendingPayout || 0)}</span>
              </div>
              <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                <span className="text-sm text-muted-foreground">{t('Lifetime Earnings', 'الأرباح الإجمالية')}</span>
                <span className="font-medium">{formatCurrencyAED(metrics?.lifetimeEarnings || 0)}</span>
              </div>
              
              {/* Threshold Progress */}
              <div className="pt-2">
                <div className={cn("flex items-center justify-between text-xs mb-1", isRTL && "flex-row-reverse")}>
                  <span className="text-muted-foreground">{t('To next tier', 'للمستوى التالي')}</span>
                  <span className="font-medium">68%</span>
                </div>
                <Progress value={68} className="h-2" />
              </div>
              
              <Button 
                variant="outline" 
                className="w-full mt-2"
                onClick={() => navigate('/vendor/earnings')}
              >
                {t('View Earnings & Payouts', 'عرض الأرباح والمدفوعات')}
                <ArrowRight className={cn("w-4 h-4", isRTL ? "mr-2 rotate-180" : "ml-2")} />
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                {t('Recent Activity', 'النشاط الأخير')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-12" />)}
                </div>
              ) : !activityEvents || activityEvents.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">{t('No recent activity', 'لا يوجد نشاط حديث')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activityEvents.slice(0, 6).map(event => {
                    const Icon = ACTIVITY_ICONS[event.type] || Activity;
                    const isPositive = event.type === 'activation' || event.type === 'redemption' || event.type === 'approval';
                    
                    return (
                      <div 
                        key={event.id}
                        className={cn("flex items-start gap-3", isRTL && "flex-row-reverse")}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                          isPositive ? "bg-success/10" : "bg-muted"
                        )}>
                          <Icon className={cn("w-4 h-4", isPositive ? "text-success" : "text-muted-foreground")} />
                        </div>
                        <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
                          <p className="text-sm font-medium truncate">{event.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{event.offerTitle}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Vendor Guidance */}
          <VendorGuidanceCard 
            profileCompleteness={profileCompleteness}
            hasOffers={offers.length > 0}
            hasPendingOffers={(metrics?.pendingOffers || 0) > 0}
            hasActiveOffers={(metrics?.activeOffers || 0) > 0}
            lowConversion={(metrics?.redemptionRate || 0) < 30 && (metrics?.activations30d || 0) > 10}
            navigate={navigate}
            t={t}
            isRTL={isRTL}
          />

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-warning" />
                {t('Quick Actions', 'إجراءات سريعة')}
              </CardTitle>
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
                <BarChart3 className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                {t('View Full Analytics', 'عرض التحليلات الكاملة')}
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => navigate('/vendor/profile')}
              >
                <FileCheck className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                {t('Update Profile', 'تحديث الملف الشخصي')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Offer Detail Sheet */}
      <Sheet open={!!selectedOffer} onOpenChange={() => setSelectedOffer(null)}>
        <SheetContent className="sm:max-w-lg">
          {selectedOffer && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedOffer.title}</SheetTitle>
                <SheetDescription>{selectedOffer.merchant}</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                {selectedOffer.imageUrl && (
                  <img 
                    src={selectedOffer.imageUrl} 
                    alt={selectedOffer.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('Status', 'الحالة')}</p>
                    <Badge variant="outline" className={STATUS_CONFIG[selectedOffer.status]?.className}>
                      {language === 'ar' 
                        ? STATUS_CONFIG[selectedOffer.status]?.labelAr 
                        : STATUS_CONFIG[selectedOffer.status]?.label}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('Category', 'الفئة')}</p>
                    <p className="font-medium">{selectedOffer.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('Discount', 'الخصم')}</p>
                    <p className="font-medium">{selectedOffer.discountDisplay}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('Valid Until', 'صالح حتى')}</p>
                    <p className="font-medium">{selectedOffer.validTo || '—'}</p>
                  </div>
                </div>
                
                {/* Status explanation */}
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <div className={cn("flex gap-3", isRTL && "flex-row-reverse")}>
                      <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        {selectedOffer.status === 'pending' && (
                          <p className="text-sm">{t('This offer is awaiting admin approval. Once approved, it will be visible to employees in the Marketplace.', 'هذا العرض في انتظار موافقة الإدارة. بمجرد الموافقة، سيكون مرئيًا للموظفين في السوق.')}</p>
                        )}
                        {selectedOffer.status === 'active' && (
                          <p className="text-sm">{t('This offer is live and visible to employees in the Marketplace. Editing will require re-approval.', 'هذا العرض نشط ومرئي للموظفين في السوق. سيتطلب التعديل إعادة الموافقة.')}</p>
                        )}
                        {selectedOffer.status === 'expired' && (
                          <p className="text-sm">{t('This offer has expired. Create a new offer or extend the validity period.', 'انتهت صلاحية هذا العرض. أنشئ عرضًا جديدًا أو قم بتمديد فترة الصلاحية.')}</p>
                        )}
                        {selectedOffer.status === 'rejected' && (
                          <p className="text-sm">{t('This offer was not approved. Please review the admin feedback and resubmit.', 'لم تتم الموافقة على هذا العرض. يرجى مراجعة ملاحظات الإدارة وإعادة الإرسال.')}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setSelectedOffer(null);
                      navigate('/vendor/offers');
                    }}
                  >
                    {t('Manage Offers', 'إدارة العروض')}
                  </Button>
                  {(selectedOffer.status === 'pending' || selectedOffer.status === 'rejected') && (
                    <Button 
                      className="flex-1"
                      onClick={() => {
                        setSelectedOffer(null);
                        navigate(`/vendor/offers?edit=${selectedOffer.id}`);
                      }}
                    >
                      {t('Edit Offer', 'تعديل العرض')}
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </PageLayout>
  );
}

// ============= GUIDANCE COMPONENT =============

interface VendorGuidanceCardProps {
  profileCompleteness?: {
    completionPercent: number;
    missingFields: string[];
  };
  hasOffers: boolean;
  hasPendingOffers: boolean;
  hasActiveOffers: boolean;
  lowConversion: boolean;
  navigate: (path: string) => void;
  t: (en: string, ar: string) => string;
  isRTL: boolean;
}

function VendorGuidanceCard({ 
  profileCompleteness, 
  hasOffers, 
  hasPendingOffers, 
  hasActiveOffers,
  lowConversion,
  navigate, 
  t, 
  isRTL 
}: VendorGuidanceCardProps) {
  // Determine which guidance to show
  const profileIncomplete = profileCompleteness && profileCompleteness.completionPercent < 100;
  
  if (profileIncomplete) {
    return (
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            {t('Complete Your Profile', 'أكمل ملفك الشخصي')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress value={profileCompleteness.completionPercent} className="h-2" />
          <p className="text-sm text-muted-foreground">
            {t(
              `${profileCompleteness.completionPercent}% complete. Add ${profileCompleteness.missingFields.join(', ')} to improve visibility.`,
              `${profileCompleteness.completionPercent}% مكتمل. أضف ${profileCompleteness.missingFields.join('، ')} لتحسين الظهور.`
            )}
          </p>
          <Button size="sm" variant="outline" onClick={() => navigate('/vendor/profile')}>
            {t('Complete Profile', 'أكمل الملف الشخصي')}
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  if (!hasOffers) {
    return (
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            {t('Create Your First Offer', 'أنشئ عرضك الأول')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            {t(
              'Top-performing categories: Health & Fitness, Food & Coffee, and Learning & Skills.',
              'الفئات الأفضل أداءً: الصحة واللياقة، الطعام والقهوة، والتعلم والمهارات.'
            )}
          </p>
          <Button size="sm" onClick={() => navigate('/vendor/offers/new')}>
            <Plus className={cn("w-4 h-4", isRTL ? "ml-1" : "mr-1")} />
            {t('Create Offer', 'إنشاء عرض')}
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  if (hasPendingOffers && !hasActiveOffers) {
    return (
      <Card className="border-warning/20 bg-warning/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-warning" />
            {t('Approval in Progress', 'الموافقة قيد التنفيذ')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-2">
            {t(
              'Your offers are being reviewed. Typical review time is 1-2 business days.',
              'يتم مراجعة عروضك. وقت المراجعة النموذجي هو 1-2 أيام عمل.'
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            {t(
              "We'll notify you via email once your offers are approved.",
              'سنقوم بإعلامك عبر البريد الإلكتروني بمجرد الموافقة على عروضك.'
            )}
          </p>
        </CardContent>
      </Card>
    );
  }
  
  if (lowConversion) {
    return (
      <Card className="border-accent/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-accent" />
            {t('Improve Conversions', 'تحسين التحويلات')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            {t('Tips to boost your redemption rate:', 'نصائح لتعزيز معدل الاسترداد:')}
          </p>
          <ul className={cn("text-sm space-y-1.5", isRTL && "text-right")}>
            <li className={cn("flex items-start gap-2", isRTL && "flex-row-reverse")}>
              <Image className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
              <span>{t('Add high-quality images', 'أضف صورًا عالية الجودة')}</span>
            </li>
            <li className={cn("flex items-start gap-2", isRTL && "flex-row-reverse")}>
              <Type className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
              <span>{t('Use clear, benefit-focused titles', 'استخدم عناوين واضحة تركز على الفوائد')}</span>
            </li>
            <li className={cn("flex items-start gap-2", isRTL && "flex-row-reverse")}>
              <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
              <span>{t('Add location details if applicable', 'أضف تفاصيل الموقع إن أمكن')}</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    );
  }
  
  // Default: Commission info
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="pt-6">
        <div className={cn("flex items-start gap-3", isRTL && "flex-row-reverse text-right")}>
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <Wallet className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{t('Your Commission Rate', 'معدل عمولتك')}</p>
            <p className="text-2xl font-bold text-primary">10%</p>
            <p className="text-xs text-muted-foreground mt-1">
              {t(
                'Earn this on every successful redemption. Increase it by reaching higher tiers.',
                'اكسب هذه النسبة على كل استرداد ناجح. زدها بالوصول إلى مستويات أعلى.'
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
