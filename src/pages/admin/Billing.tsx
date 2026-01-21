import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PageLayout, MetricCard, MetricGrid } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, Download, DollarSign, Building2, TrendingUp, TrendingDown,
  Calendar, FileText, CheckCircle, Clock, AlertTriangle, Eye, MoreHorizontal,
  RefreshCw, ArrowUpRight, ArrowDownRight, BarChart3, Users, Percent, Activity
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { format, differenceInDays } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { 
  INVOICE_STATUS_CONFIG, 
  NORTH_STAR_ORGS,
  type InvoiceStatus 
} from '@/lib/admin/constants';
import { ADMIN_I18N } from '@/lib/admin/i18n';
import { formatCurrencyCompact, formatCurrencyFull, formatPercentage } from '@/lib/admin/formatting';
import { InvoiceStatusBadge } from '@/components/admin/badges';

// Plans aligned with North Star orgs
const PLANS = [
  { 
    id: 'starter', name: 'Starter', price: 2500, 
    features: ['Up to 100 employees', 'Basic analytics', 'Email support'], 
    limits: { employees: 100, admins: 2, integrations: 1, storage: '5GB' },
    orgs: 8 
  },
  { 
    id: 'professional', name: 'Professional', price: 7500, 
    features: ['Up to 500 employees', 'Advanced analytics', 'Priority support', 'SSO'], 
    limits: { employees: 500, admins: 10, integrations: 5, storage: '50GB' },
    orgs: 24 
  },
  { 
    id: 'enterprise', name: 'Enterprise', price: 15000, 
    features: ['Unlimited employees', 'Custom integrations', 'Dedicated support', 'SLA'], 
    limits: { employees: 'Unlimited', admins: 'Unlimited', integrations: 'Unlimited', storage: '500GB' },
    orgs: 15 
  },
];

// Invoices using North Star orgs - includes one overdue and one pending
const INVOICES = [
  { id: 'INV-2025-001', org: 'Acme Corp', orgId: 'org_acme', plan: 'Enterprise', amount: 15000, status: 'paid' as InvoiceStatus, date: '2025-01-15', due_date: '2025-01-30', paid_date: '2025-01-20', method: 'Bank Transfer' },
  { id: 'INV-2025-002', org: 'TechStart Inc', orgId: 'org_tech', plan: 'Professional', amount: 7500, status: 'paid' as InvoiceStatus, date: '2025-01-15', due_date: '2025-01-30', paid_date: '2025-01-22', method: 'Credit Card' },
  { id: 'INV-2025-003', org: 'GlobalBank', orgId: 'org_global', plan: 'Enterprise', amount: 15000, status: 'pending' as InvoiceStatus, date: '2025-01-18', due_date: '2025-02-02', paid_date: null, method: null },
  { id: 'INV-2025-004', org: 'RetailMax', orgId: 'org_retail', plan: 'Starter', amount: 2500, status: 'overdue' as InvoiceStatus, date: '2024-12-15', due_date: '2024-12-30', paid_date: null, method: null, daysOverdue: 22 },
  { id: 'INV-2025-005', org: 'HealthCo', orgId: 'org_health', plan: 'Professional', amount: 7500, status: 'paid' as InvoiceStatus, date: '2025-01-10', due_date: '2025-01-25', paid_date: '2025-01-18', method: 'Credit Card' },
];

// Use shared status config
const STATUS_CONFIG = INVOICE_STATUS_CONFIG;

// Monthly Revenue History for chart coherence
const MONTHLY_REVENUE = [
  { month: 'Aug', mrr: 285000 },
  { month: 'Sep', mrr: 295000 },
  { month: 'Oct', mrr: 310000 },
  { month: 'Nov', mrr: 320000 },
  { month: 'Dec', mrr: 335000 },
  { month: 'Jan', mrr: 355000 },
];

export default function AdminBilling() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const [selectedInvoice, setSelectedInvoice] = useState<typeof INVOICES[0] | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // Auto-select first alert on mount
  useEffect(() => {
    if (INVOICES.length > 0 && !selectedInvoice) {
      // Don't auto-select for billing
    }
  }, []);

  // Fetch organizations count
  const { data: organizations } = useQuery({
    queryKey: ['billing-orgs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('organizations').select('id');
      if (error) throw error;
      return data || [];
    },
  });

  // Calculate metrics
  const totalMRR = PLANS.reduce((acc, p) => acc + (p.price * p.orgs), 0);
  const totalARR = totalMRR * 12;
  const paidInvoices = INVOICES.filter(i => i.status === 'paid');
  const pendingAmount = INVOICES.filter(i => i.status === 'pending').reduce((acc, i) => acc + i.amount, 0);
  const overdueAmount = INVOICES.filter(i => i.status === 'overdue').reduce((acc, i) => acc + i.amount, 0);
  const totalOrgs = PLANS.reduce((acc, p) => acc + p.orgs, 0);
  
  // Churn calculation (mock: 2 orgs churned last month)
  const churnedOrgs = 2;
  const churnRate = ((churnedOrgs / totalOrgs) * 100).toFixed(1);
  
  // DSO calculation (Days Sales Outstanding)
  const avgDSO = 18; // Mock
  
  // Aging breakdown
  const aging = {
    current: INVOICES.filter(i => i.status === 'pending' && differenceInDays(new Date(i.due_date), new Date()) > 0).length,
    overdue30: INVOICES.filter(i => i.status === 'overdue' && (i as any).daysOverdue <= 30).length,
    overdue60: INVOICES.filter(i => i.status === 'overdue' && (i as any).daysOverdue > 30).length,
  };

  const filteredInvoices = INVOICES.filter(i => 
    statusFilter === 'all' || i.status === statusFilter
  );

  const metrics = [
    { title: t('Monthly Revenue (MRR)', 'الإيرادات الشهرية'), value: `AED ${totalMRR.toLocaleString()}`, icon: DollarSign, subtitle: `ARR: AED ${(totalARR / 1000000).toFixed(2)}M` },
    { title: t('Active Organizations', 'المنظمات النشطة'), value: organizations?.length || totalOrgs, icon: Building2, subtitle: `${churnRate}% churn rate` },
    { title: t('Overdue Amount', 'المبلغ المتأخر'), value: `AED ${overdueAmount.toLocaleString()}`, icon: AlertTriangle, subtitle: `${aging.overdue30 + aging.overdue60} invoices`, highlight: overdueAmount > 0 },
    { title: t('Avg DSO', 'متوسط أيام التحصيل'), value: `${avgDSO} days`, icon: Activity, subtitle: 'Target: 30 days' },
  ];

  const handleViewInvoice = (invoice: typeof INVOICES[0]) => {
    setSelectedInvoice(invoice);
    setDetailsOpen(true);
  };

  const handleDownloadInvoice = (invoice: typeof INVOICES[0]) => {
    toast.success(t(`Downloading ${invoice.id}...`, `جاري تنزيل ${invoice.id}...`));
  };

  const handleSendReminder = (invoice: typeof INVOICES[0]) => {
    toast.success(t(`Reminder sent for ${invoice.id}`, `تم إرسال تذكير لـ ${invoice.id}`));
  };

  return (
    <PageLayout
      title={t('Plans & Invoices', 'الخطط والفواتير')}
      description={t('Manage subscription plans, billing, and revenue analytics', 'إدارة خطط الاشتراك والفوترة وتحليلات الإيرادات')}
      icon={CreditCard}
      iconClassName="from-emerald-500 to-green-500"
      actions={
        <Button variant="outline">
          <Download className="w-4 h-4 me-2" />
          {t('Export Report', 'تصدير التقرير')}
        </Button>
      }
    >
      <MetricGrid columns={4}>
        {metrics.map((m) => (
          <Card key={m.title} className={cn((m as any).highlight && 'border-destructive/50')}>
            <CardContent className="pt-4">
              <div className={cn("flex items-start justify-between", isRTL && "flex-row-reverse")}>
                <div>
                  <p className="text-sm text-muted-foreground">{m.title}</p>
                  <p className="text-2xl font-bold mt-1">{m.value}</p>
                  {(m as any).subtitle && (
                    <p className="text-xs text-muted-foreground mt-1">{(m as any).subtitle}</p>
                  )}
                </div>
                <div className={cn("p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5")}>
                  <m.icon className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </MetricGrid>

      {/* Revenue Chart + Aging */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <BarChart3 className="w-5 h-5" />
              {t('Revenue Trend', 'اتجاه الإيرادات')}
            </CardTitle>
            <CardDescription>{t('Monthly recurring revenue over time', 'الإيرادات الشهرية المتكررة')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {MONTHLY_REVENUE.map((m, i) => {
                const maxMRR = Math.max(...MONTHLY_REVENUE.map(r => r.mrr));
                const percentage = (m.mrr / maxMRR) * 100;
                const isLatest = i === MONTHLY_REVENUE.length - 1;
                return (
                  <div key={m.month}>
                    <div className={cn("flex items-center justify-between mb-1", isRTL && "flex-row-reverse")}>
                      <span className={cn("text-sm", isLatest && "font-bold")}>{m.month}</span>
                      <span className={cn("text-sm", isLatest && "font-bold text-success")}>
                        AED {(m.mrr / 1000).toFixed(0)}k
                        {isLatest && ` = MRR`}
                      </span>
                    </div>
                    <Progress value={percentage} className={cn("h-2", isLatest && "bg-success/20")} />
                  </div>
                );
              })}
              <p className="text-xs text-muted-foreground mt-4 pt-2 border-t">
                {t('Total MRR matches plan breakdown:', 'إجمالي MRR يطابق توزيع الخطط:')} AED {totalMRR.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Clock className="w-5 h-5" />
              {t('AR Aging', 'تقادم المستحقات')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg bg-muted/50">
              <div className={cn("flex justify-between items-center", isRTL && "flex-row-reverse")}>
                <span className="text-sm">{t('Current', 'حالي')}</span>
                <Badge variant="secondary">{aging.current} {t('invoices', 'فواتير')}</Badge>
              </div>
              <p className="text-lg font-bold mt-1">AED {pendingAmount.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
              <div className={cn("flex justify-between items-center", isRTL && "flex-row-reverse")}>
                <span className="text-sm text-warning">{t('1-30 Days Overdue', 'متأخر 1-30 يوم')}</span>
                <Badge variant="outline" className="bg-warning/10 text-warning">{aging.overdue30}</Badge>
              </div>
              <p className="text-lg font-bold mt-1 text-warning">AED {(overdueAmount * 0.6).toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
              <div className={cn("flex justify-between items-center", isRTL && "flex-row-reverse")}>
                <span className="text-sm text-destructive">{t('30+ Days Overdue', 'متأخر +30 يوم')}</span>
                <Badge variant="outline" className="bg-destructive/10 text-destructive">{aging.overdue60}</Badge>
              </div>
              <p className="text-lg font-bold mt-1 text-destructive">AED {(overdueAmount * 0.4).toLocaleString()}</p>
            </div>
            <Separator />
            <div className={cn("flex justify-between items-center text-sm", isRTL && "flex-row-reverse")}>
              <span className="text-muted-foreground">{t('Collection Rate', 'معدل التحصيل')}</span>
              <span className="font-bold">{Math.round((paidInvoices.length / INVOICES.length) * 100)}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="invoices" className="space-y-6">
        <TabsList>
          <TabsTrigger value="invoices" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            {t('Invoices', 'الفواتير')}
          </TabsTrigger>
          <TabsTrigger value="plans" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            {t('Plans', 'الخطط')}
          </TabsTrigger>
        </TabsList>

        {/* Invoices Tab */}
        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <div className={cn("flex items-center justify-between flex-wrap gap-4", isRTL && "flex-row-reverse")}>
                <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <FileText className="w-5 h-5" />
                  <div>
                    <CardTitle>{t('Invoices', 'الفواتير')}</CardTitle>
                    <CardDescription>{filteredInvoices.length} {t('invoices', 'فواتير')}</CardDescription>
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder={t('Status', 'الحالة')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('All', 'الكل')}</SelectItem>
                    <SelectItem value="paid">{t('Paid', 'مدفوع')}</SelectItem>
                    <SelectItem value="pending">{t('Pending', 'معلق')}</SelectItem>
                    <SelectItem value="overdue">{t('Overdue', 'متأخر')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('Invoice', 'الفاتورة')}</TableHead>
                    <TableHead>{t('Organization', 'المنظمة')}</TableHead>
                    <TableHead>{t('Plan', 'الخطة')}</TableHead>
                    <TableHead>{t('Amount', 'المبلغ')}</TableHead>
                    <TableHead>{t('Status', 'الحالة')}</TableHead>
                    <TableHead>{t('Due Date', 'تاريخ الاستحقاق')}</TableHead>
                    <TableHead>{t('Actions', 'الإجراءات')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => {
                    const statusConfig = STATUS_CONFIG[invoice.status as keyof typeof STATUS_CONFIG];
                    return (
                      <TableRow key={invoice.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewInvoice(invoice)}>
                        <TableCell className="font-mono text-sm">{invoice.id}</TableCell>
                        <TableCell className="font-medium">{invoice.org}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{invoice.plan}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">AED {invoice.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusConfig.color}>
                            <statusConfig.icon className="w-3 h-3 me-1" />
                            {isRTL ? statusConfig.labelAr : statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className={cn(invoice.status === 'overdue' && 'text-destructive')}>
                          {invoice.due_date}
                          {(invoice as any).daysOverdue && (
                            <span className="text-xs ml-1">({(invoice as any).daysOverdue}d late)</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewInvoice(invoice); }}>
                                <Eye className="w-4 h-4 me-2" /> {t('View Details', 'عرض التفاصيل')}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDownloadInvoice(invoice); }}>
                                <Download className="w-4 h-4 me-2" /> {t('Download PDF', 'تنزيل PDF')}
                              </DropdownMenuItem>
                              {invoice.status !== 'paid' && (
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleSendReminder(invoice); }}>
                                  <RefreshCw className="w-4 h-4 me-2" /> {t('Send Reminder', 'إرسال تذكير')}
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <Card key={plan.id} className="relative overflow-hidden">
                {plan.id === 'professional' && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium">
                    {t('Most Popular', 'الأكثر شيوعاً')}
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold text-foreground">AED {plan.price.toLocaleString()}</span>
                    <span className="text-muted-foreground">/{t('month', 'شهر')}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className={cn("flex items-center justify-between mb-1", isRTL && "flex-row-reverse")}>
                      <span className="text-sm text-muted-foreground">{t('Active Organizations', 'المنظمات النشطة')}</span>
                      <span className="font-medium">{plan.orgs}</span>
                    </div>
                    <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                      <span className="text-sm text-muted-foreground">{t('Revenue', 'الإيرادات')}</span>
                      <span className="font-medium text-success">AED {(plan.price * plan.orgs).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Plan Limits */}
                  <div>
                    <p className="text-sm font-medium mb-2">{t('Plan Limits', 'حدود الخطة')}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded bg-muted/30">
                        <p className="text-muted-foreground">{t('Employees', 'الموظفين')}</p>
                        <p className="font-medium">{plan.limits.employees}</p>
                      </div>
                      <div className="p-2 rounded bg-muted/30">
                        <p className="text-muted-foreground">{t('Admins', 'المسؤولين')}</p>
                        <p className="font-medium">{plan.limits.admins}</p>
                      </div>
                      <div className="p-2 rounded bg-muted/30">
                        <p className="text-muted-foreground">{t('Integrations', 'التكاملات')}</p>
                        <p className="font-medium">{plan.limits.integrations}</p>
                      </div>
                      <div className="p-2 rounded bg-muted/30">
                        <p className="text-muted-foreground">{t('Storage', 'التخزين')}</p>
                        <p className="font-medium">{plan.limits.storage}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">{t('Features', 'الميزات')}</p>
                    <ul className="space-y-1">
                      {plan.features.map((feature, i) => (
                        <li key={i} className={cn("flex items-center gap-2 text-sm text-muted-foreground", isRTL && "flex-row-reverse")}>
                          <CheckCircle className="w-4 h-4 text-success shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Revenue by Plan - Coherent Totals */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>{t('Revenue by Plan', 'الإيرادات حسب الخطة')}</CardTitle>
              <CardDescription>
                {t('Total MRR:', 'إجمالي MRR:')} <span className="font-bold text-foreground">AED {totalMRR.toLocaleString()}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {PLANS.map((plan) => {
                  const revenue = plan.price * plan.orgs;
                  const percentage = Math.round((revenue / totalMRR) * 100);
                  return (
                    <div key={plan.id}>
                      <div className={cn("flex items-center justify-between mb-1", isRTL && "flex-row-reverse")}>
                        <span className="font-medium">{plan.name} ({plan.orgs} orgs × AED {plan.price.toLocaleString()})</span>
                        <span className="text-sm text-muted-foreground">
                          AED {revenue.toLocaleString()} ({percentage}%)
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
                <Separator />
                <div className={cn("flex items-center justify-between font-bold", isRTL && "flex-row-reverse")}>
                  <span>{t('Total MRR', 'إجمالي الإيرادات الشهرية')}</span>
                  <span className="text-success">AED {totalMRR.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invoice Details Drawer */}
      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{selectedInvoice?.id}</SheetTitle>
            <SheetDescription>{selectedInvoice?.org}</SheetDescription>
          </SheetHeader>
          
          {selectedInvoice && (
            <ScrollArea className="h-[calc(100vh-160px)] mt-4">
              <div className="space-y-4 pr-4">
                {/* Status */}
                <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <Badge variant="outline" className={STATUS_CONFIG[selectedInvoice.status as keyof typeof STATUS_CONFIG]?.color}>
                    {STATUS_CONFIG[selectedInvoice.status as keyof typeof STATUS_CONFIG]?.label}
                  </Badge>
                  <Badge variant="secondary">{selectedInvoice.plan}</Badge>
                </div>

                {/* Amount */}
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">{t('Amount', 'المبلغ')}</p>
                    <p className="text-3xl font-bold">AED {selectedInvoice.amount.toLocaleString()}</p>
                  </CardContent>
                </Card>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">{t('Invoice Date', 'تاريخ الفاتورة')}</p>
                    <p className="font-medium">{selectedInvoice.date}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">{t('Due Date', 'تاريخ الاستحقاق')}</p>
                    <p className="font-medium">{selectedInvoice.due_date}</p>
                  </div>
                  {selectedInvoice.paid_date && (
                    <div className="p-3 rounded-lg bg-success/10">
                      <p className="text-xs text-muted-foreground">{t('Paid Date', 'تاريخ الدفع')}</p>
                      <p className="font-medium text-success">{selectedInvoice.paid_date}</p>
                    </div>
                  )}
                  {selectedInvoice.method && (
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">{t('Payment Method', 'طريقة الدفع')}</p>
                      <p className="font-medium">{selectedInvoice.method}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Button className="w-full" variant="outline" onClick={() => handleDownloadInvoice(selectedInvoice)}>
                    <Download className="w-4 h-4 me-2" />
                    {t('Download PDF', 'تنزيل PDF')}
                  </Button>
                  {selectedInvoice.status !== 'paid' && (
                    <Button className="w-full" onClick={() => handleSendReminder(selectedInvoice)}>
                      <RefreshCw className="w-4 h-4 me-2" />
                      {t('Send Reminder', 'إرسال تذكير')}
                    </Button>
                  )}
                </div>

                {/* History */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{t('History', 'السجل')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                      <span className="text-muted-foreground">{selectedInvoice.date}</span>
                      <span>{t('Invoice created', 'تم إنشاء الفاتورة')}</span>
                    </div>
                    {selectedInvoice.paid_date && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-success" />
                        <span className="text-muted-foreground">{selectedInvoice.paid_date}</span>
                        <span className="text-success">{t('Payment received', 'تم استلام الدفع')}</span>
                      </div>
                    )}
                    {selectedInvoice.status === 'overdue' && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-destructive" />
                        <span className="text-muted-foreground">{selectedInvoice.due_date}</span>
                        <span className="text-destructive">{t('Payment overdue', 'الدفع متأخر')}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>
    </PageLayout>
  );
}
