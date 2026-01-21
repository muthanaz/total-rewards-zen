import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Download, Clock, CheckCircle2, AlertCircle, Calendar,
  Wallet, TrendingUp, ArrowUpRight, Filter, Search, ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { format, addDays, subDays, startOfMonth, endOfMonth, differenceInDays } from 'date-fns';
import { toast } from 'sonner';

// Types
interface PayoutRecord {
  id: string;
  reference: string;
  amount: number;
  status: 'scheduled' | 'processing' | 'completed' | 'failed';
  method: 'bank_transfer' | 'wire' | 'check';
  periodStart: string;
  periodEnd: string;
  paidAt: string | null;
  createdAt: string;
  invoiceUrl?: string;
  transactionCount: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: 'draft' | 'issued' | 'paid' | 'overdue';
  issuedAt: string;
  dueDate: string;
  paidAt: string | null;
  periodLabel: string;
  downloadUrl?: string;
}

// Demo data
const DEMO_PAYOUTS: PayoutRecord[] = [
  {
    id: 'pay-001',
    reference: 'BNFT-JAN-2026',
    amount: 4850,
    status: 'scheduled',
    method: 'bank_transfer',
    periodStart: '2026-01-01',
    periodEnd: '2026-01-31',
    paidAt: null,
    createdAt: '2026-01-21',
    transactionCount: 42,
  },
  {
    id: 'pay-002',
    reference: 'BNFT-DEC-2025',
    amount: 12500,
    status: 'completed',
    method: 'bank_transfer',
    periodStart: '2025-12-01',
    periodEnd: '2025-12-31',
    paidAt: '2026-01-10',
    createdAt: '2025-12-31',
    invoiceUrl: '#',
    transactionCount: 156,
  },
  {
    id: 'pay-003',
    reference: 'BNFT-NOV-2025',
    amount: 8800,
    status: 'completed',
    method: 'bank_transfer',
    periodStart: '2025-11-01',
    periodEnd: '2025-11-30',
    paidAt: '2025-12-10',
    createdAt: '2025-11-30',
    invoiceUrl: '#',
    transactionCount: 98,
  },
  {
    id: 'pay-004',
    reference: 'BNFT-OCT-2025',
    amount: 7200,
    status: 'completed',
    method: 'bank_transfer',
    periodStart: '2025-10-01',
    periodEnd: '2025-10-31',
    paidAt: '2025-11-10',
    createdAt: '2025-10-31',
    invoiceUrl: '#',
    transactionCount: 85,
  },
];

const DEMO_INVOICES: Invoice[] = [
  {
    id: 'inv-001',
    invoiceNumber: 'INV-2026-001',
    amount: 4850,
    status: 'draft',
    issuedAt: '2026-01-31',
    dueDate: '2026-02-15',
    paidAt: null,
    periodLabel: 'January 2026',
  },
  {
    id: 'inv-002',
    invoiceNumber: 'INV-2025-012',
    amount: 12500,
    status: 'paid',
    issuedAt: '2025-12-31',
    dueDate: '2026-01-15',
    paidAt: '2026-01-10',
    periodLabel: 'December 2025',
    downloadUrl: '#',
  },
  {
    id: 'inv-003',
    invoiceNumber: 'INV-2025-011',
    amount: 8800,
    status: 'paid',
    issuedAt: '2025-11-30',
    dueDate: '2025-12-15',
    paidAt: '2025-12-10',
    periodLabel: 'November 2025',
    downloadUrl: '#',
  },
];

const STATUS_CONFIG = {
  scheduled: { label: 'Scheduled', labelAr: 'مجدول', icon: Calendar, className: 'bg-info/10 text-info border-info/30' },
  processing: { label: 'Processing', labelAr: 'قيد المعالجة', icon: Clock, className: 'bg-warning/10 text-warning border-warning/30' },
  completed: { label: 'Completed', labelAr: 'مكتمل', icon: CheckCircle2, className: 'bg-success/10 text-success border-success/30' },
  failed: { label: 'Failed', labelAr: 'فشل', icon: AlertCircle, className: 'bg-destructive/10 text-destructive border-destructive/30' },
  draft: { label: 'Draft', labelAr: 'مسودة', icon: FileText, className: 'bg-muted text-muted-foreground border-border' },
  issued: { label: 'Issued', labelAr: 'صادر', icon: FileText, className: 'bg-info/10 text-info border-info/30' },
  paid: { label: 'Paid', labelAr: 'مدفوع', icon: CheckCircle2, className: 'bg-success/10 text-success border-success/30' },
  overdue: { label: 'Overdue', labelAr: 'متأخر', icon: AlertCircle, className: 'bg-destructive/10 text-destructive border-destructive/30' },
};

export function VendorPayoutInvoices() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate summary metrics
  const pendingPayout = DEMO_PAYOUTS.filter(p => p.status === 'scheduled').reduce((sum, p) => sum + p.amount, 0);
  const lifetimePaid = DEMO_PAYOUTS.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const nextPayoutDate = '2026-02-10'; // 10th of next month
  const daysUntilPayout = differenceInDays(new Date(nextPayoutDate), new Date());

  const handleDownloadInvoice = (invoice: Invoice) => {
    toast.success(t('Downloading invoice...', 'جارٍ تحميل الفاتورة...'));
  };

  const handleRequestPayout = () => {
    toast.success(t('Payout request submitted!', 'تم إرسال طلب الدفع!'));
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-accent/30 bg-gradient-to-br from-card to-accent/5">
          <CardContent className="p-5">
            <div className={cn('flex items-start justify-between', isRTL && 'flex-row-reverse')}>
              <div className={cn(isRTL && 'text-right')}>
                <p className="text-sm text-muted-foreground mb-1">
                  {t('Pending Payout', 'الدفع المعلق')}
                </p>
                <p className="text-2xl font-bold">{formatCurrencyAED(pendingPayout)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t(`${daysUntilPayout} days until payout`, `${daysUntilPayout} يوم حتى الدفع`)}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-accent/10">
                <Wallet className="w-5 h-5 text-accent" />
              </div>
            </div>
            <Progress value={(30 - daysUntilPayout) / 30 * 100} className="h-1.5 mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className={cn('flex items-start justify-between', isRTL && 'flex-row-reverse')}>
              <div className={cn(isRTL && 'text-right')}>
                <p className="text-sm text-muted-foreground mb-1">
                  {t('Lifetime Paid', 'إجمالي المدفوعات')}
                </p>
                <p className="text-2xl font-bold text-success">{formatCurrencyAED(lifetimePaid)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {DEMO_PAYOUTS.filter(p => p.status === 'completed').length} {t('payouts completed', 'عملية دفع مكتملة')}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-success/10">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className={cn('flex items-start justify-between', isRTL && 'flex-row-reverse')}>
              <div className={cn(isRTL && 'text-right')}>
                <p className="text-sm text-muted-foreground mb-1">
                  {t('Next Payout', 'الدفعة القادمة')}
                </p>
                <p className="text-2xl font-bold">{format(new Date(nextPayoutDate), 'MMM d')}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('Payouts on the 10th of each month', 'المدفوعات في العاشر من كل شهر')}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-info/10">
                <Calendar className="w-5 h-5 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="payouts" className="space-y-4">
        <div className={cn('flex items-center justify-between flex-wrap gap-4', isRTL && 'flex-row-reverse')}>
          <TabsList>
            <TabsTrigger value="payouts" className="gap-2">
              <Wallet className="w-4 h-4" />
              {t('Payouts', 'المدفوعات')}
            </TabsTrigger>
            <TabsTrigger value="invoices" className="gap-2">
              <FileText className="w-4 h-4" />
              {t('Invoices', 'الفواتير')}
            </TabsTrigger>
          </TabsList>

          <Button onClick={handleRequestPayout} className="gap-2">
            <ArrowUpRight className="w-4 h-4" />
            {t('Request Early Payout', 'طلب دفع مبكر')}
          </Button>
        </div>

        {/* Payouts Tab */}
        <TabsContent value="payouts" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
                <CardTitle className="text-lg">{t('Payout History', 'سجل المدفوعات')}</CardTitle>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder={t('All Status', 'جميع الحالات')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('All Status', 'جميع الحالات')}</SelectItem>
                    <SelectItem value="scheduled">{t('Scheduled', 'مجدول')}</SelectItem>
                    <SelectItem value="completed">{t('Completed', 'مكتمل')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {DEMO_PAYOUTS.filter(p => statusFilter === 'all' || p.status === statusFilter).map((payout, index) => {
                  const config = STATUS_CONFIG[payout.status];
                  const StatusIcon = config.icon;
                  
                  return (
                    <motion.div
                      key={payout.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        'flex items-center justify-between p-4 rounded-xl border hover:bg-muted/30 transition-colors',
                        isRTL && 'flex-row-reverse'
                      )}
                    >
                      <div className={cn('flex items-center gap-4', isRTL && 'flex-row-reverse')}>
                        <div className={cn('p-2.5 rounded-lg', config.className.split(' ')[0])}>
                          <StatusIcon className={cn('w-5 h-5', config.className.split(' ')[1])} />
                        </div>
                        <div className={cn(isRTL && 'text-right')}>
                          <p className="font-semibold">{payout.reference}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(payout.periodStart), 'MMM d')} - {format(new Date(payout.periodEnd), 'MMM d, yyyy')}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {payout.transactionCount} {t('transactions', 'معاملة')}
                          </p>
                        </div>
                      </div>
                      
                      <div className={cn('flex items-center gap-4', isRTL && 'flex-row-reverse')}>
                        <div className={cn('text-right', isRTL && 'text-left')}>
                          <p className="text-lg font-bold">{formatCurrencyAED(payout.amount)}</p>
                          <Badge variant="outline" className={config.className}>
                            {t(config.label, config.labelAr)}
                          </Badge>
                        </div>
                        {payout.invoiceUrl && (
                          <Button variant="ghost" size="icon" onClick={() => handleDownloadInvoice(payout as any)}>
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
                <CardTitle className="text-lg">{t('Invoices', 'الفواتير')}</CardTitle>
                <div className="relative">
                  <Search className={cn('absolute top-2.5 w-4 h-4 text-muted-foreground', isRTL ? 'right-3' : 'left-3')} />
                  <Input
                    placeholder={t('Search invoices...', 'البحث في الفواتير...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={cn('w-[200px]', isRTL ? 'pr-9' : 'pl-9')}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {DEMO_INVOICES.filter(inv => 
                  inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  inv.periodLabel.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((invoice, index) => {
                  const config = STATUS_CONFIG[invoice.status];
                  const StatusIcon = config.icon;
                  
                  return (
                    <motion.div
                      key={invoice.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        'flex items-center justify-between p-4 rounded-xl border hover:bg-muted/30 transition-colors',
                        isRTL && 'flex-row-reverse'
                      )}
                    >
                      <div className={cn('flex items-center gap-4', isRTL && 'flex-row-reverse')}>
                        <div className="p-2.5 rounded-lg bg-muted">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className={cn(isRTL && 'text-right')}>
                          <p className="font-semibold">{invoice.invoiceNumber}</p>
                          <p className="text-sm text-muted-foreground">{invoice.periodLabel}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {t('Due:', 'الاستحقاق:')} {format(new Date(invoice.dueDate), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      
                      <div className={cn('flex items-center gap-4', isRTL && 'flex-row-reverse')}>
                        <div className={cn('text-right', isRTL && 'text-left')}>
                          <p className="text-lg font-bold">{formatCurrencyAED(invoice.amount)}</p>
                          <Badge variant="outline" className={config.className}>
                            {t(config.label, config.labelAr)}
                          </Badge>
                        </div>
                        {invoice.downloadUrl && (
                          <Button variant="ghost" size="icon" onClick={() => handleDownloadInvoice(invoice)}>
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </motion.div>
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
