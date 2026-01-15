import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/ui/page-header';
import { StatusStrip } from '@/components/ui/status-strip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  Clock, 
  CheckCircle, 
  DollarSign,
  ArrowRight,
  Calendar,
  AlertCircle,
  Wallet,
  BanknoteIcon,
  FileText,
  TrendingUp,
  Info,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Mock data for payouts
const payoutHistory = [
  { id: '1', amount: 12500, status: 'paid', requestedAt: '2024-01-10', paidAt: '2024-01-12', reference: 'PAY-2024-001' },
  { id: '2', amount: 8750, status: 'paid', requestedAt: '2023-12-15', paidAt: '2023-12-18', reference: 'PAY-2023-012' },
  { id: '3', amount: 15200, status: 'paid', requestedAt: '2023-11-20', paidAt: '2023-11-23', reference: 'PAY-2023-011' },
  { id: '4', amount: 9800, status: 'paid', requestedAt: '2023-10-18', paidAt: '2023-10-21', reference: 'PAY-2023-010' },
];

const pendingPayouts = [
  { id: '5', amount: 6250, status: 'pending', requestedAt: '2024-01-14', estimatedPayout: '2024-01-17' },
];

// Payout tiers/thresholds
const payoutTiers = [
  { name: 'Standard', minAmount: 1000, processingDays: 5, fee: 0 },
  { name: 'Express', minAmount: 5000, processingDays: 2, fee: 25 },
  { name: 'Instant', minAmount: 10000, processingDays: 0, fee: 50 },
];

export default function VendorPayoutsPage() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const isArabic = language === 'ar';
  const { toast } = useToast();
  
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('Standard');
  
  // Summary stats
  const availableBalance = 18500;
  const pendingAmount = pendingPayouts.reduce((sum, p) => sum + p.amount, 0);
  const totalPaidThisMonth = 12500;
  const minPayout = 1000;
  const monthlyTarget = 25000;
  const progressToTarget = Math.round((totalPaidThisMonth / monthlyTarget) * 100);

  const handleRequestPayout = () => {
    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount < minPayout) {
      toast({
        title: isArabic ? 'خطأ' : 'Error',
        description: isArabic ? `الحد الأدنى للسحب ${minPayout} درهم` : `Minimum payout is AED ${minPayout}`,
        variant: 'destructive'
      });
      return;
    }
    if (amount > availableBalance) {
      toast({
        title: isArabic ? 'خطأ' : 'Error',
        description: isArabic ? 'الرصيد غير كافي' : 'Insufficient balance',
        variant: 'destructive'
      });
      return;
    }
    
    toast({
      title: isArabic ? 'تم طلب السحب' : 'Payout Requested',
      description: isArabic ? `تم طلب سحب ${amount} درهم` : `Payout of AED ${amount.toLocaleString()} requested successfully`,
    });
    setPayoutDialogOpen(false);
    setPayoutAmount('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20"><CheckCircle className="w-3 h-3 mr-1" />{isArabic ? 'مدفوع' : 'Paid'}</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20"><Clock className="w-3 h-3 mr-1" />{isArabic ? 'قيد المعالجة' : 'Processing'}</Badge>;
      case 'approved':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20"><CheckCircle className="w-3 h-3 mr-1" />{isArabic ? 'موافق عليه' : 'Approved'}</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={isArabic ? 'المدفوعات' : 'Payouts'}
        subtitle={isArabic ? 'إدارة طلبات السحب والمدفوعات' : 'Manage your withdrawal requests and settlements'}
        icon={CreditCard}
      />

      <StatusStrip
        confidence="high"
        lastUpdated={new Date()}
        dataSource={isArabic ? 'يناير 2024' : 'January 2024'}
      />

      {/* Payout Progress */}
      <Card className="card-elevated border-primary/20">
        <CardContent className="pt-6">
          <div className={cn("flex items-center justify-between mb-3", isRTL && "flex-row-reverse")}>
            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="font-medium">{isArabic ? 'هدف الشهر' : 'Monthly Target'}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              AED {totalPaidThisMonth.toLocaleString()} / {monthlyTarget.toLocaleString()}
            </span>
          </div>
          <Progress value={progressToTarget} className="h-3" />
          <p className="text-xs text-muted-foreground mt-2">
            {isArabic 
              ? `${progressToTarget}% من هدفك الشهري` 
              : `${progressToTarget}% of your monthly target`}
          </p>
        </CardContent>
      </Card>

      {/* Payout Tiers Info */}
      {availableBalance >= minPayout && (
        <Alert className="border-blue-500/30 bg-blue-500/5">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertDescription className={cn("flex flex-col md:flex-row md:items-center gap-2 justify-between", isRTL && "md:flex-row-reverse")}>
            <span>
              {isArabic 
                ? 'رصيدك مؤهل للسحب. اختر مستوى السرعة المناسب لك.'
                : 'Your balance qualifies for payout. Choose your preferred speed tier.'}
            </span>
            <Button size="sm" onClick={() => setPayoutDialogOpen(true)}>
              {isArabic ? 'طلب الآن' : 'Request Now'}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-elevated border-emerald-500/20">
          <CardContent className="pt-6">
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <div className="p-3 rounded-xl bg-emerald-500/10">
                <Wallet className="h-6 w-6 text-emerald-600" />
              </div>
              <div className={cn(isRTL && "text-right")}>
                <p className="text-2xl font-bold text-emerald-600">AED {availableBalance.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{isArabic ? 'الرصيد المتاح' : 'Available Balance'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated border-amber-500/20">
          <CardContent className="pt-6">
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <div className="p-3 rounded-xl bg-amber-500/10">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div className={cn(isRTL && "text-right")}>
                <p className="text-2xl font-bold text-amber-600">AED {pendingAmount.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{isArabic ? 'قيد المعالجة' : 'Pending'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <div className="p-3 rounded-xl bg-primary/10">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div className={cn(isRTL && "text-right")}>
                <p className="text-2xl font-bold">AED {totalPaidThisMonth.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{isArabic ? 'مدفوع هذا الشهر' : 'Paid This Month'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <Button 
              className="w-full h-full min-h-[80px] bg-gradient-to-r from-primary to-accent"
              onClick={() => setPayoutDialogOpen(true)}
              disabled={availableBalance < minPayout}
            >
              <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <BanknoteIcon className="h-5 w-5" />
                <span className="font-semibold">{isArabic ? 'طلب سحب' : 'Request Payout'}</span>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="w-4 h-4" />
            {isArabic ? 'قيد المعالجة' : 'Pending'}
            {pendingPayouts.length > 0 && (
              <Badge variant="secondary" className="ml-1">{pendingPayouts.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <FileText className="w-4 h-4" />
            {isArabic ? 'السجل' : 'History'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingPayouts.length === 0 ? (
            <Card className="card-elevated">
              <CardContent className="py-12 text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{isArabic ? 'لا توجد طلبات سحب قيد المعالجة' : 'No pending payout requests'}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingPayouts.map((payout) => (
                <Card key={payout.id} className="card-elevated border-amber-500/20">
                  <CardContent className="py-4">
                    <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                      <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
                        <div className="p-3 rounded-xl bg-amber-500/10">
                          <Clock className="h-5 w-5 text-amber-600" />
                        </div>
                        <div className={cn(isRTL && "text-right")}>
                          <p className="font-bold text-lg">AED {payout.amount.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">
                            {isArabic ? 'تم الطلب:' : 'Requested:'} {format(new Date(payout.requestedAt), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
                        <div className={cn("text-right", isRTL && "text-left")}>
                          <p className="text-sm text-muted-foreground">{isArabic ? 'الدفع المتوقع' : 'Expected Payout'}</p>
                          <p className="font-medium">{format(new Date(payout.estimatedPayout), 'MMM dd, yyyy')}</p>
                        </div>
                        {getStatusBadge(payout.status)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-lg">{isArabic ? 'سجل المدفوعات' : 'Payout History'}</CardTitle>
              <CardDescription>{isArabic ? 'جميع المدفوعات المكتملة' : 'All completed payouts'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className={cn("text-left py-3 px-4 font-medium text-sm", isRTL && "text-right")}>{isArabic ? 'المرجع' : 'Reference'}</th>
                      <th className={cn("text-right py-3 px-4 font-medium text-sm", isRTL && "text-left")}>{isArabic ? 'المبلغ' : 'Amount'}</th>
                      <th className={cn("text-left py-3 px-4 font-medium text-sm", isRTL && "text-right")}>{isArabic ? 'تاريخ الطلب' : 'Requested'}</th>
                      <th className={cn("text-left py-3 px-4 font-medium text-sm", isRTL && "text-right")}>{isArabic ? 'تاريخ الدفع' : 'Paid'}</th>
                      <th className={cn("text-left py-3 px-4 font-medium text-sm", isRTL && "text-right")}>{isArabic ? 'الحالة' : 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payoutHistory.map((payout) => (
                      <tr key={payout.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-3 px-4 font-mono text-sm">{payout.reference}</td>
                        <td className={cn("py-3 px-4 font-bold text-right", isRTL && "text-left")}>AED {payout.amount.toLocaleString()}</td>
                        <td className="py-3 px-4 text-sm">{format(new Date(payout.requestedAt), 'MMM dd, yyyy')}</td>
                        <td className="py-3 px-4 text-sm">{payout.paidAt ? format(new Date(payout.paidAt), 'MMM dd, yyyy') : '-'}</td>
                        <td className="py-3 px-4">{getStatusBadge(payout.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Request Payout Dialog with Tiers */}
      <Dialog open={payoutDialogOpen} onOpenChange={setPayoutDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isArabic ? 'طلب سحب' : 'Request Payout'}</DialogTitle>
            <DialogDescription>
              {isArabic 
                ? `الرصيد المتاح: ${availableBalance.toLocaleString()} درهم`
                : `Available balance: AED ${availableBalance.toLocaleString()}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Tier Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{isArabic ? 'اختر مستوى السرعة' : 'Select Speed Tier'}</label>
              <div className="grid grid-cols-3 gap-2">
                {payoutTiers.map((tier) => (
                  <button
                    key={tier.name}
                    onClick={() => setSelectedTier(tier.name)}
                    className={cn(
                      "p-3 rounded-lg border text-center transition-all",
                      selectedTier === tier.name 
                        ? "border-primary bg-primary/10" 
                        : "border-border hover:border-primary/50",
                      parseFloat(payoutAmount || '0') < tier.minAmount && "opacity-50 cursor-not-allowed"
                    )}
                    disabled={parseFloat(payoutAmount || '0') < tier.minAmount && parseFloat(payoutAmount || '0') > 0}
                  >
                    <p className="font-medium text-sm">{tier.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {tier.processingDays === 0 ? (isArabic ? 'فوري' : 'Instant') : `${tier.processingDays} ${isArabic ? 'أيام' : 'days'}`}
                    </p>
                    {tier.fee > 0 && (
                      <p className="text-xs text-amber-600 mt-1">AED {tier.fee} {isArabic ? 'رسوم' : 'fee'}</p>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{isArabic ? 'المبلغ (درهم)' : 'Amount (AED)'}</label>
              <Input
                type="number"
                placeholder={isArabic ? 'أدخل المبلغ' : 'Enter amount'}
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                min={minPayout}
                max={availableBalance}
              />
              <p className="text-xs text-muted-foreground">
                {isArabic ? `الحد الأدنى: ${minPayout.toLocaleString()} درهم` : `Minimum: AED ${minPayout.toLocaleString()}`}
              </p>
            </div>

            {/* Summary */}
            {payoutAmount && parseFloat(payoutAmount) >= minPayout && (
              <div className="p-3 rounded-lg bg-muted/50 border space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{isArabic ? 'المبلغ' : 'Amount'}</span>
                  <span>AED {parseFloat(payoutAmount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{isArabic ? 'الرسوم' : 'Fee'}</span>
                  <span>AED {payoutTiers.find(t => t.name === selectedTier)?.fee || 0}</span>
                </div>
                <div className="flex justify-between text-sm font-medium border-t pt-2">
                  <span>{isArabic ? 'الإجمالي' : 'Total'}</span>
                  <span>AED {(parseFloat(payoutAmount) - (payoutTiers.find(t => t.name === selectedTier)?.fee || 0)).toLocaleString()}</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="w-4 h-4" />
              <span>
                {selectedTier === 'Instant' 
                  ? (isArabic ? 'سيتم التحويل فوراً' : 'Transfer will be immediate')
                  : (isArabic ? `تتم المعالجة خلال ${payoutTiers.find(t => t.name === selectedTier)?.processingDays} أيام عمل` 
                    : `Processing within ${payoutTiers.find(t => t.name === selectedTier)?.processingDays} business days`)}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayoutDialogOpen(false)}>
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleRequestPayout}>
              {isArabic ? 'تأكيد الطلب' : 'Confirm Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}