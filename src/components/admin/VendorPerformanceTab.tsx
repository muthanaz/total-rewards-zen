import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Store, 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Users, 
  Star,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  Eye,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { AnimatedBarChart } from '@/components/charts/AnimatedBarChart';
import { DataQualityBadge } from '@/components/employer/DataQualityBadge';

interface VendorMetric {
  id: string;
  name: string;
  category: string;
  offers: number;
  views: number;
  redemptions: number;
  conversionRate: number;
  earnings: number;
  commissionTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  complianceScore: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: string;
  status: 'active' | 'warning' | 'suspended';
}

const vendorPerformanceData: VendorMetric[] = [
  { 
    id: 'v1', 
    name: 'FitLife Gym', 
    category: 'Fitness', 
    offers: 5, 
    views: 12500, 
    redemptions: 2450, 
    conversionRate: 19.6, 
    earnings: 85000, 
    commissionTier: 'gold',
    complianceScore: 98,
    trend: 'up',
    trendValue: '+15%',
    status: 'active'
  },
  { 
    id: 'v2', 
    name: 'Wellness Spa', 
    category: 'Wellness', 
    offers: 3, 
    views: 8900, 
    redemptions: 1670, 
    conversionRate: 18.8, 
    earnings: 62000, 
    commissionTier: 'silver',
    complianceScore: 92,
    trend: 'up',
    trendValue: '+8%',
    status: 'active'
  },
  { 
    id: 'v3', 
    name: 'HealthFirst Clinic', 
    category: 'Health', 
    offers: 4, 
    views: 7200, 
    redemptions: 1340, 
    conversionRate: 18.6, 
    earnings: 58000, 
    commissionTier: 'silver',
    complianceScore: 88,
    trend: 'down',
    trendValue: '-3%',
    status: 'warning'
  },
  { 
    id: 'v4', 
    name: 'MindBody Studios', 
    category: 'Wellness', 
    offers: 2, 
    views: 5600, 
    redemptions: 890, 
    conversionRate: 15.9, 
    earnings: 32000, 
    commissionTier: 'bronze',
    complianceScore: 75,
    trend: 'stable',
    trendValue: '+1%',
    status: 'warning'
  },
  { 
    id: 'v5', 
    name: 'Premium Dental', 
    category: 'Health', 
    offers: 3, 
    views: 4500, 
    redemptions: 720, 
    conversionRate: 16.0, 
    earnings: 28000, 
    commissionTier: 'bronze',
    complianceScore: 95,
    trend: 'up',
    trendValue: '+12%',
    status: 'active'
  },
];

const commissionTierConfig = {
  bronze: { label: 'Bronze', rate: '5%', threshold: 'AED 0-25K', color: 'bg-chart-4/10 text-chart-4' },
  silver: { label: 'Silver', rate: '7%', threshold: 'AED 25-50K', color: 'bg-muted text-muted-foreground' },
  gold: { label: 'Gold', rate: '10%', threshold: 'AED 50-100K', color: 'bg-warning/10 text-warning' },
  platinum: { label: 'Platinum', rate: '12%', threshold: 'AED 100K+', color: 'bg-chart-3/10 text-chart-3' },
};

const categoryEarningsData = [
  { name: 'Fitness', value: 85 },
  { name: 'Wellness', value: 94 },
  { name: 'Health', value: 86 },
  { name: 'Education', value: 42 },
  { name: 'Retail', value: 35 },
];

const platformSummary = {
  totalVendors: 156,
  activeOffers: 487,
  totalRedemptions: 84500,
  totalRevenue: 2450000,
  avgConversion: 17.3,
  avgCompliance: 89,
};

export function VendorPerformanceTab() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const getStatusIcon = (status: VendorMetric['status']) => {
    switch (status) {
      case 'active': return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'suspended': return <XCircle className="w-4 h-4 text-destructive" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Platform Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Store className="w-3.5 h-3.5" />
              {t('Total Vendors', 'إجمالي الموردين')}
            </div>
            <p className="text-2xl font-bold">{platformSummary.totalVendors}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Target className="w-3.5 h-3.5" />
              {t('Active Offers', 'العروض النشطة')}
            </div>
            <p className="text-2xl font-bold">{platformSummary.activeOffers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Users className="w-3.5 h-3.5" />
              {t('Redemptions', 'الاستردادات')}
            </div>
            <p className="text-2xl font-bold">{(platformSummary.totalRedemptions / 1000).toFixed(1)}K</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <DollarSign className="w-3.5 h-3.5" />
              {t('GMV', 'إجمالي القيمة')}
            </div>
            <p className="text-2xl font-bold">AED {(platformSummary.totalRevenue / 1000000).toFixed(1)}M</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              {t('Avg Conversion', 'متوسط التحويل')}
            </div>
            <p className="text-2xl font-bold">{platformSummary.avgConversion}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Star className="w-3.5 h-3.5" />
              {t('Avg Compliance', 'متوسط الامتثال')}
            </div>
            <p className="text-2xl font-bold">{platformSummary.avgCompliance}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vendor Performance Table */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <div>
                <CardTitle className="text-lg">{t('Vendor Leaderboard', 'ترتيب الموردين')}</CardTitle>
                <CardDescription>{t('Top performers by GMV', 'أفضل الموردين حسب إجمالي القيمة')}</CardDescription>
              </div>
              <DataQualityBadge 
                confidence="high" 
                lastUpdated={new Date().toISOString()} 
                sampleSize={156}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {vendorPerformanceData.map((vendor, idx) => (
                <div 
                  key={vendor.id}
                  className={cn(
                    "p-4 rounded-xl border border-border/60 hover:border-accent/30 hover:bg-muted/30 transition-all",
                    isRTL && "text-right"
                  )}
                >
                  <div className={cn("flex items-start justify-between gap-4", isRTL && "flex-row-reverse")}>
                    <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center font-bold text-accent text-sm">
                        {idx + 1}
                      </div>
                      <div>
                        <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                          <span className="font-semibold">{vendor.name}</span>
                          {getStatusIcon(vendor.status)}
                        </div>
                        <div className={cn("flex items-center gap-2 mt-0.5", isRTL && "flex-row-reverse")}>
                          <Badge variant="outline" className="text-[10px]">{vendor.category}</Badge>
                          <Badge className={cn("text-[10px]", commissionTierConfig[vendor.commissionTier].color)}>
                            {commissionTierConfig[vendor.commissionTier].label} ({commissionTierConfig[vendor.commissionTier].rate})
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className={cn("text-right", isRTL && "text-left")}>
                      <div className="font-bold text-lg">AED {vendor.earnings.toLocaleString()}</div>
                      <div className={cn(
                        "flex items-center gap-1 text-xs",
                        vendor.trend === 'up' ? 'text-success' : vendor.trend === 'down' ? 'text-destructive' : 'text-muted-foreground',
                        isRTL && "flex-row-reverse justify-end"
                      )}>
                        {vendor.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : 
                         vendor.trend === 'down' ? <ArrowDownRight className="w-3 h-3" /> : null}
                        {vendor.trendValue} {t('vs last month', 'مقارنة بالشهر الماضي')}
                      </div>
                    </div>
                  </div>
                  
                  {/* Metrics Row */}
                  <div className={cn("grid grid-cols-4 gap-4 mt-4 pt-3 border-t border-border/40", isRTL && "text-right")}>
                    <div>
                      <p className="text-xs text-muted-foreground">{t('Offers', 'العروض')}</p>
                      <p className="font-semibold">{vendor.offers}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t('Views', 'المشاهدات')}</p>
                      <p className="font-semibold">{(vendor.views / 1000).toFixed(1)}K</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t('Conversion', 'التحويل')}</p>
                      <p className="font-semibold">{vendor.conversionRate}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t('Compliance', 'الامتثال')}</p>
                      <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                        <Progress 
                          value={vendor.complianceScore} 
                          className={cn(
                            "h-1.5 flex-1",
                            vendor.complianceScore >= 90 ? '[&>div]:bg-success' : 
                            vendor.complianceScore >= 80 ? '[&>div]:bg-warning' : '[&>div]:bg-destructive'
                          )}
                        />
                        <span className="text-xs font-medium">{vendor.complianceScore}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Performance & Commission Tiers */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{t('Earnings by Category', 'الأرباح حسب الفئة')}</CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatedBarChart
                data={categoryEarningsData}
                height={200}
                formatValue={(v) => `AED ${v}K`}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{t('Commission Tiers', 'مستويات العمولة')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(commissionTierConfig).map(([key, tier]) => (
                  <div key={key} className={cn("flex items-center justify-between p-3 rounded-lg border border-border/60", isRTL && "flex-row-reverse")}>
                    <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                      <Badge className={tier.color}>{tier.label}</Badge>
                      <span className="text-sm text-muted-foreground">{tier.threshold}</span>
                    </div>
                    <span className="font-bold">{tier.rate}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
