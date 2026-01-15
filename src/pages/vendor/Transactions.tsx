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
  ArrowUpDown,
  CheckCircle2,
  Clock,
  XCircle,
  Receipt,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/page-header';
import { StatusStrip } from '@/components/ui/status-strip';

interface Transaction {
  id: string;
  offerTitle: string;
  employeeId: string;
  originalAmount: number;
  discountAmount: number;
  commissionAmount: number;
  codeUsed: string;
  status: 'completed' | 'pending' | 'failed';
  redeemedAt: string;
}

const transactions: Transaction[] = [
  { id: 'TXN001', offerTitle: '20% Off Premium Gym', employeeId: 'EMP-4521', originalAmount: 500, discountAmount: 100, commissionAmount: 35, codeUsed: 'BNFT-GYM-2024', status: 'completed', redeemedAt: '2026-01-12 14:32' },
  { id: 'TXN002', offerTitle: 'Free Trial - Wellness App', employeeId: 'EMP-3892', originalAmount: 0, discountAmount: 0, commissionAmount: 25, codeUsed: 'BNFT-WELL-FREE', status: 'completed', redeemedAt: '2026-01-12 11:15' },
  { id: 'TXN003', offerTitle: '15% Off Health Checkup', employeeId: 'EMP-2156', originalAmount: 800, discountAmount: 120, commissionAmount: 45, codeUsed: 'BNFT-HEALTH-15', status: 'completed', redeemedAt: '2026-01-11 16:45' },
  { id: 'TXN004', offerTitle: '20% Off Premium Gym', employeeId: 'EMP-5678', originalAmount: 500, discountAmount: 100, commissionAmount: 35, codeUsed: 'BNFT-GYM-2024', status: 'pending', redeemedAt: '2026-01-11 10:20' },
  { id: 'TXN005', offerTitle: 'Buy 1 Get 1 - Spa Treatment', employeeId: 'EMP-1234', originalAmount: 400, discountAmount: 200, commissionAmount: 30, codeUsed: 'BNFT-SPA-BOGO', status: 'completed', redeemedAt: '2026-01-10 13:55' },
  { id: 'TXN006', offerTitle: '30% Off Dental Plan', employeeId: 'EMP-9012', originalAmount: 1200, discountAmount: 360, commissionAmount: 55, codeUsed: 'BNFT-DENTAL-30', status: 'failed', redeemedAt: '2026-01-10 09:30' },
  { id: 'TXN007', offerTitle: '20% Off Premium Gym', employeeId: 'EMP-7890', originalAmount: 500, discountAmount: 100, commissionAmount: 35, codeUsed: 'BNFT-GYM-2024', status: 'completed', redeemedAt: '2026-01-09 15:10' },
  { id: 'TXN008', offerTitle: 'Free Trial - Wellness App', employeeId: 'EMP-6543', originalAmount: 0, discountAmount: 0, commissionAmount: 25, codeUsed: 'BNFT-WELL-FREE', status: 'completed', redeemedAt: '2026-01-09 11:25' },
];

const statusConfig = {
  completed: { label: 'Completed', labelAr: 'مكتمل', icon: CheckCircle2, color: 'bg-green-500/10 text-green-600' },
  pending: { label: 'Pending', labelAr: 'قيد الانتظار', icon: Clock, color: 'bg-amber-500/10 text-amber-600' },
  failed: { label: 'Failed', labelAr: 'فشل', icon: XCircle, color: 'bg-red-500/10 text-red-600' },
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
                          txn.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || txn.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCommission = filteredTransactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.commissionAmount, 0);

  const handleExport = () => {
    toast.success(t('Transactions exported successfully', 'تم تصدير المعاملات بنجاح'));
  };

  return (
    <div className={cn("space-y-6", isRTL && "text-right")}>
      <PageHeader
        title={t('Transactions', 'المعاملات')}
        subtitle={t('Track all redemptions and commissions', 'تتبع جميع عمليات الاسترداد والعمولات')}
        icon={Receipt}
        action={
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="w-4 h-4" />
            {t('Export CSV', 'تصدير CSV')}
          </Button>
        }
      />

      <StatusStrip
        confidence="high"
        lastUpdated={new Date()}
        dataSource={t('Transaction ledger', 'سجل المعاملات')}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
              <div className="p-3 rounded-xl bg-accent/10">
                <Receipt className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('Total Transactions', 'إجمالي المعاملات')}</p>
                <p className="text-2xl font-bold">{filteredTransactions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
              <div className="p-3 rounded-xl bg-green-500/10">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('Completed', 'مكتملة')}</p>
                <p className="text-2xl font-bold">{filteredTransactions.filter(t => t.status === 'completed').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
              <div className="p-3 rounded-xl bg-purple-500/10">
                <Receipt className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('Total Commission', 'إجمالي العمولة')}</p>
                <p className="text-2xl font-bold text-accent">AED {totalCommission.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className={cn("flex flex-col md:flex-row gap-4", isRTL && "md:flex-row-reverse")}>
            <div className="relative flex-1">
              <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
              <Input 
                placeholder={t('Search by ID, offer, or employee...', 'البحث بالمعرف أو العرض أو الموظف...')}
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
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={cn(isRTL && "text-right")}>{t('Transaction ID', 'معرف المعاملة')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('Offer', 'العرض')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('Employee', 'الموظف')}</TableHead>
                <TableHead className={cn("text-right", isRTL && "text-left")}>{t('Original', 'الأصلي')}</TableHead>
                <TableHead className={cn("text-right", isRTL && "text-left")}>{t('Discount', 'الخصم')}</TableHead>
                <TableHead className={cn("text-right", isRTL && "text-left")}>{t('Commission', 'العمولة')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('Status', 'الحالة')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('Date', 'التاريخ')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((txn) => {
                const StatusIcon = statusConfig[txn.status].icon;
                return (
                  <TableRow key={txn.id}>
                    <TableCell className="font-mono text-sm">{txn.id}</TableCell>
                    <TableCell className="font-medium">{txn.offerTitle}</TableCell>
                    <TableCell className="text-muted-foreground">{txn.employeeId}</TableCell>
                    <TableCell className="text-right">AED {txn.originalAmount}</TableCell>
                    <TableCell className="text-right text-amber-600">-AED {txn.discountAmount}</TableCell>
                    <TableCell className="text-right font-semibold text-accent">AED {txn.commissionAmount}</TableCell>
                    <TableCell>
                      <Badge className={cn("gap-1", statusConfig[txn.status].color)}>
                        <StatusIcon className="w-3 h-3" />
                        {language === 'ar' ? statusConfig[txn.status].labelAr : statusConfig[txn.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{txn.redeemedAt}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
