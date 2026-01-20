import { useState } from 'react';
import { PageLayout } from '@/components/shared/PageLayout';
import { MetricGrid, MetricCard } from '@/components/shared/MetricCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Receipt, Search, Download, CheckCircle, Clock, XCircle, Eye, TrendingUp, Users, Ticket } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useVendorAnalytics, useVendorOffers } from '@/hooks/useVendorData';
import { formatCurrencyAED, formatPercent, formatInteger, cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

interface Redemption {
  id: string;
  code: string;
  offerTitle: string;
  employeeName: string;
  organization: string;
  redeemedAt: string;
  amount: number;
  commission: number;
  status: 'verified' | 'pending' | 'disputed';
}

// Demo data - in production this would come from perk_activations/vendor_transactions
const demoRedemptions: Redemption[] = [
  { id: 'R001', code: 'FIT-2024-001', offerTitle: 'Gym Membership 30% Off', employeeName: 'Ahmed M.', organization: 'bnft.demo (AD)', redeemedAt: '2024-01-15T10:30:00', amount: 2800, commission: 280, status: 'verified' },
  { id: 'R002', code: 'FIT-2024-002', offerTitle: 'Personal Training Sessions', employeeName: 'Sara K.', organization: 'bnft.demo (DXB)', redeemedAt: '2024-01-14T14:15:00', amount: 1500, commission: 150, status: 'verified' },
  { id: 'R003', code: 'SPA-2024-001', offerTitle: 'Spa Package 25% Off', employeeName: 'Mohammed A.', organization: 'bnft.demo (AD)', redeemedAt: '2024-01-14T09:45:00', amount: 950, commission: 95, status: 'pending' },
  { id: 'R004', code: 'FIT-2024-003', offerTitle: 'Gym Membership 30% Off', employeeName: 'Fatima H.', organization: 'bnft.demo (AD)', redeemedAt: '2024-01-13T16:20:00', amount: 2800, commission: 280, status: 'verified' },
  { id: 'R005', code: 'YOGA-2024-001', offerTitle: 'Yoga Classes Bundle', employeeName: 'Ali R.', organization: 'bnft.demo (DXB)', redeemedAt: '2024-01-12T11:00:00', amount: 600, commission: 60, status: 'disputed' },
];

const STATUS_CONFIG = {
  verified: { label: 'Verified', labelAr: 'مُتحقق', icon: CheckCircle, className: 'bg-success/10 text-success border-success/30' },
  pending: { label: 'Pending', labelAr: 'قيد الانتظار', icon: Clock, className: 'bg-warning/10 text-warning border-warning/30' },
  disputed: { label: 'Disputed', labelAr: 'متنازع عليه', icon: XCircle, className: 'bg-destructive/10 text-destructive border-destructive/30' },
};

export default function VendorRedemptions() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: analytics, isLoading: analyticsLoading } = useVendorAnalytics();
  const { data: offers } = useVendorOffers();

  const filteredRedemptions = demoRedemptions.filter(r => {
    const matchesSearch = r.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.offerTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const metrics = [
    {
      title: t('Total Redemptions', 'إجمالي الاستردادات'),
      value: formatInteger(analytics?.totalRedemptions || demoRedemptions.length),
      icon: Ticket,
      trend: { value: 12, positive: true },
    },
    {
      title: t('Total Revenue', 'إجمالي الإيرادات'),
      value: formatCurrencyAED(demoRedemptions.reduce((s, r) => s + r.amount, 0)),
      icon: TrendingUp,
      trend: { value: 8, positive: true },
    },
    {
      title: t('Pending Verification', 'قيد التحقق'),
      value: formatInteger(demoRedemptions.filter(r => r.status === 'pending').length),
      icon: Clock,
    },
    {
      title: t('Active Offers', 'العروض النشطة'),
      value: formatInteger(offers?.filter(o => o.status === 'active').length || 0),
      icon: Receipt,
    },
  ];

  return (
    <PageLayout
      title={t('Voucher Redemptions', 'استرداد القسائم')}
      description={t('Track and verify voucher redemptions from employees', 'تتبع والتحقق من استردادات القسائم من الموظفين')}
      icon={Receipt}
      iconClassName="text-primary"
    >
      {/* Metrics */}
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

      {/* Redemptions Table */}
      <Card className="mt-6">
        <CardHeader>
          <div className={cn("flex flex-col sm:flex-row gap-4 justify-between", isRTL && "sm:flex-row-reverse")}>
            <CardTitle className="text-lg">
              {t('Recent Redemptions', 'الاستردادات الأخيرة')}
            </CardTitle>
            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <div className="relative">
                <Search className={cn("absolute top-2.5 w-4 h-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
                <Input
                  placeholder={t('Search by code, offer...', 'البحث بالرمز، العرض...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={cn("w-64", isRTL ? "pr-9" : "pl-9")}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('All Status', 'جميع الحالات')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('All Status', 'جميع الحالات')}</SelectItem>
                  <SelectItem value="verified">{t('Verified', 'مُتحقق')}</SelectItem>
                  <SelectItem value="pending">{t('Pending', 'قيد الانتظار')}</SelectItem>
                  <SelectItem value="disputed">{t('Disputed', 'متنازع عليه')}</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                {t('Export', 'تصدير')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {analyticsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : filteredRedemptions.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title={t('No redemptions found', 'لا توجد استردادات')}
              description={t('Redemptions will appear here when employees use your vouchers', 'ستظهر الاستردادات هنا عندما يستخدم الموظفون قسائمك')}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('Code', 'الرمز')}</TableHead>
                  <TableHead>{t('Offer', 'العرض')}</TableHead>
                  <TableHead>{t('Employee', 'الموظف')}</TableHead>
                  <TableHead>{t('Organization', 'المنظمة')}</TableHead>
                  <TableHead className="text-right">{t('Amount', 'المبلغ')}</TableHead>
                  <TableHead className="text-right">{t('Commission', 'العمولة')}</TableHead>
                  <TableHead>{t('Status', 'الحالة')}</TableHead>
                  <TableHead>{t('Date', 'التاريخ')}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRedemptions.map((redemption) => {
                  const statusConfig = STATUS_CONFIG[redemption.status];
                  const StatusIcon = statusConfig.icon;
                  return (
                    <TableRow key={redemption.id}>
                      <TableCell className="font-mono text-sm">{redemption.code}</TableCell>
                      <TableCell className="font-medium">{redemption.offerTitle}</TableCell>
                      <TableCell>{redemption.employeeName}</TableCell>
                      <TableCell className="text-muted-foreground">{redemption.organization}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrencyAED(redemption.amount)}</TableCell>
                      <TableCell className="text-right text-success font-medium">{formatCurrencyAED(redemption.commission)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusConfig.className}>
                          <StatusIcon className="w-3 h-3 me-1" />
                          {language === 'ar' ? statusConfig.labelAr : statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(redemption.redeemedAt).toLocaleDateString(language === 'ar' ? 'ar-AE' : 'en-AE')}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="mt-6 border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className={cn("flex items-start gap-4", isRTL && "flex-row-reverse text-right")}>
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Receipt className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">
                {t('How Redemptions Work', 'كيف تعمل الاستردادات')}
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                {t(
                  'When employees use your voucher codes, redemptions appear here for verification. Verified redemptions are automatically added to your next payout. Disputed redemptions require additional documentation.',
                  'عندما يستخدم الموظفون رموز القسائم الخاصة بك، تظهر الاستردادات هنا للتحقق. يتم إضافة الاستردادات المُتحقق منها تلقائيًا إلى دفعتك التالية. تتطلب الاستردادات المتنازع عليها وثائق إضافية.'
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
