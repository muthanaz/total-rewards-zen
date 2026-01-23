import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Search,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  Receipt,
  ShieldCheck,
} from 'lucide-react';
import { cn, formatCurrencyAED, formatInteger } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { PageLayout, MetricCard, MetricGrid } from '@/components/shared';
import { EmptyState } from '@/components/ui/empty-state';

// Transaction structure - NO PII, aggregated data only
interface Transaction {
  id: string;
  offerTitle: string;
  // Organization is allowed (not individual PII)
  organization: string;
  originalAmount: number;
  discountAmount: number;
  commissionAmount: number;
  codeUsed: string;
  status: 'completed' | 'pending' | 'failed';
  redeemedAt: string;
}

// Demo data - AGGREGATED ONLY, no employee names/emails/IDs
const transactions: Transaction[] = [
  { id: 'TXN001', offerTitle: '20% Off Premium Gym', organization: 'bnft.demo (AD)', originalAmount: 500, discountAmount: 100, commissionAmount: 35, codeUsed: 'BNFT-GYM-2024', status: 'completed', redeemedAt: '2026-01-12 14:32' },
  { id: 'TXN002', offerTitle: 'Free Trial - Wellness App', organization: 'bnft.demo (DXB)', originalAmount: 0, discountAmount: 0, commissionAmount: 25, codeUsed: 'BNFT-WELL-FREE', status: 'completed', redeemedAt: '2026-01-12 11:15' },
  { id: 'TXN003', offerTitle: '15% Off Health Checkup', organization: 'bnft.demo (AD)', originalAmount: 800, discountAmount: 120, commissionAmount: 45, codeUsed: 'BNFT-HEALTH-15', status: 'completed', redeemedAt: '2026-01-11 16:45' },
  { id: 'TXN004', offerTitle: '20% Off Premium Gym', organization: 'bnft.demo (AD)', originalAmount: 500, discountAmount: 100, commissionAmount: 35, codeUsed: 'BNFT-GYM-2024', status: 'pending', redeemedAt: '2026-01-11 10:20' },
  { id: 'TXN005', offerTitle: 'Buy 1 Get 1 - Spa Treatment', organization: 'bnft.demo (DXB)', originalAmount: 400, discountAmount: 200, commissionAmount: 30, codeUsed: 'BNFT-SPA-BOGO', status: 'completed', redeemedAt: '2026-01-10 13:55' },
  { id: 'TXN006', offerTitle: '30% Off Dental Plan', organization: 'bnft.demo (AD)', originalAmount: 1200, discountAmount: 360, commissionAmount: 55, codeUsed: 'BNFT-DENTAL-30', status: 'failed', redeemedAt: '2026-01-10 09:30' },
  { id: 'TXN007', offerTitle: '20% Off Premium Gym', organization: 'bnft.demo (DXB)', originalAmount: 500, discountAmount: 100, commissionAmount: 35, codeUsed: 'BNFT-GYM-2024', status: 'completed', redeemedAt: '2026-01-09 15:10' },
  { id: 'TXN008', offerTitle: 'Free Trial - Wellness App', organization: 'bnft.demo (AD)', originalAmount: 0, discountAmount: 0, commissionAmount: 25, codeUsed: 'BNFT-WELL-FREE', status: 'completed', redeemedAt: '2026-01-09 11:25' },
];

const STATUS_CONFIG = {
  completed: { label: 'Completed', labelAr: 'مكتمل', icon: CheckCircle2, className: 'bg-success/10 text-success border-success/30' },
  pending: { label: 'Pending', labelAr: 'قيد الانتظار', icon: Clock, className: 'bg-warning/10 text-warning border-warning/30' },
  failed: { label: 'Failed', labelAr: 'فشل', icon: XCircle, className: 'bg-destructive/10 text-destructive border-destructive/30' },
};

export default function VendorTransactions() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const filteredTransactions = transactions.filter(txn => {
    const matchesSearch = txn.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          txn.offerTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          txn.organization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || txn.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCommission = filteredTransactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.commissionAmount, 0);

  const handleExport = () => {
    toast.success(t('Transactions exported successfully', 'تم تصدير المعاملات بنجاح'));
  };

  const metrics = [
    { title: t('Total Transactions', 'إجمالي المعاملات'), value: formatInteger(filteredTransactions.length), icon: Receipt },
    { title: t('Completed', 'مكتملة'), value: formatInteger(filteredTransactions.filter(t => t.status === 'completed').length), icon: CheckCircle2, trend: { value: 12, positive: true } },
    { title: t('Total Commission', 'إجمالي العمولة'), value: formatCurrencyAED(totalCommission), icon: Receipt },
  ];

  return (
    <PageLayout
      title={t('Transactions', 'المعاملات')}
      description={t('Track all redemptions and commissions by offer', 'تتبع جميع عمليات الاسترداد والعمولات حسب العرض')}
      icon={Receipt}
      iconClassName="text-primary"
      actions={
        <Button variant="outline" className="gap-2" onClick={handleExport}>
          <Download className="w-4 h-4" />
          {t('Export CSV', 'تصدير CSV')}
        </Button>
      }
    >
      {/* Summary Cards */}
      <MetricGrid columns={3}>
        {metrics.map((metric, i) => (
          <MetricCard key={i} title={metric.title} value={metric.value} icon={metric.icon} trend={metric.trend} />
        ))}
      </MetricGrid>

      {/* Filters */}
      <Card className="mt-6">
        <CardContent className="p-4">
          <div className={cn("flex flex-col md:flex-row gap-4", isRTL && "md:flex-row-reverse")}>
            <div className="relative flex-1">
              <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
              <Input 
                placeholder={t('Search by ID, offer, or organization...', 'البحث بالمعرف أو العرض أو المنظمة...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(isRTL ? "pr-10" : "pl-10")}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder={t('Status', 'الحالة')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('All Statuses', 'جميع الحالات')}</SelectItem>
                <SelectItem value="completed">{t('Completed', 'مكتمل')}</SelectItem>
                <SelectItem value="pending">{t('Pending', 'قيد الانتظار')}</SelectItem>
                <SelectItem value="failed">{t('Failed', 'فشل')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="mt-6">
        <CardContent className="p-0">
          {filteredTransactions.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Receipt}
                title={t('No transactions found', 'لا توجد معاملات')}
                description={t('Transactions will appear here when employees redeem your offers', 'ستظهر المعاملات هنا عندما يسترد الموظفون عروضك')}
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={cn(isRTL && "text-right")}>{t('Transaction ID', 'معرف المعاملة')}</TableHead>
                  <TableHead className={cn(isRTL && "text-right")}>{t('Offer', 'العرض')}</TableHead>
                  <TableHead className={cn(isRTL && "text-right")}>{t('Organization', 'المنظمة')}</TableHead>
                  <TableHead className={cn("text-right", isRTL && "text-left")}>{t('Original', 'الأصلي')}</TableHead>
                  <TableHead className={cn("text-right", isRTL && "text-left")}>{t('Discount', 'الخصم')}</TableHead>
                  <TableHead className={cn("text-right", isRTL && "text-left")}>{t('Commission', 'العمولة')}</TableHead>
                  <TableHead className={cn(isRTL && "text-right")}>{t('Status', 'الحالة')}</TableHead>
                  <TableHead className={cn(isRTL && "text-right")}>{t('Date', 'التاريخ')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((txn) => {
                  const StatusIcon = STATUS_CONFIG[txn.status].icon;
                  return (
                    <TableRow key={txn.id}>
                      <TableCell className="font-mono text-sm">{txn.id}</TableCell>
                      <TableCell className="font-medium">{txn.offerTitle}</TableCell>
                      <TableCell className="text-muted-foreground">{txn.organization}</TableCell>
                      <TableCell className="text-right">{formatCurrencyAED(txn.originalAmount)}</TableCell>
                      <TableCell className="text-right text-warning">-{formatCurrencyAED(txn.discountAmount)}</TableCell>
                      <TableCell className="text-right font-semibold text-primary">{formatCurrencyAED(txn.commissionAmount)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("gap-1", STATUS_CONFIG[txn.status].className)}>
                          <StatusIcon className="w-3 h-3" />
                          {language === 'ar' ? STATUS_CONFIG[txn.status].labelAr : STATUS_CONFIG[txn.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{txn.redeemedAt}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <Card className="mt-6 border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className={cn("flex items-start gap-4", isRTL && "flex-row-reverse text-right")}>
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">
                {t('Aggregated Transaction Data', 'بيانات المعاملات المجمعة')}
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                {t(
                  'For privacy, employee identities are not disclosed. Transactions are shown by offer and organization only. Commission is calculated automatically based on your tier.',
                  'لأغراض الخصوصية، لا يتم الكشف عن هويات الموظفين. تُعرض المعاملات حسب العرض والمنظمة فقط. يتم احتساب العمولة تلقائيًا بناءً على مستواك.'
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
