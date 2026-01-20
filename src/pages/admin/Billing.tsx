import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PageLayout, MetricCard, MetricGrid } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { 
  CreditCard, Download, DollarSign, Building2, TrendingUp, 
  Calendar, FileText, CheckCircle, Clock, AlertTriangle
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const PLANS = [
  { id: 'starter', name: 'Starter', price: 2500, features: ['Up to 100 employees', 'Basic analytics', 'Email support'], orgs: 8 },
  { id: 'professional', name: 'Professional', price: 7500, features: ['Up to 500 employees', 'Advanced analytics', 'Priority support', 'SSO'], orgs: 24 },
  { id: 'enterprise', name: 'Enterprise', price: 15000, features: ['Unlimited employees', 'Custom integrations', 'Dedicated support', 'SLA'], orgs: 15 },
];

const INVOICES = [
  { id: 'INV-2025-001', org: 'Acme Corp', plan: 'Enterprise', amount: 15000, status: 'paid', date: '2025-01-15', due_date: '2025-01-30' },
  { id: 'INV-2025-002', org: 'TechStart Inc', plan: 'Professional', amount: 7500, status: 'paid', date: '2025-01-15', due_date: '2025-01-30' },
  { id: 'INV-2025-003', org: 'GlobalBank', plan: 'Enterprise', amount: 15000, status: 'pending', date: '2025-01-18', due_date: '2025-02-02' },
  { id: 'INV-2025-004', org: 'RetailMax', plan: 'Starter', amount: 2500, status: 'overdue', date: '2024-12-15', due_date: '2024-12-30' },
  { id: 'INV-2025-005', org: 'HealthCo', plan: 'Professional', amount: 7500, status: 'paid', date: '2025-01-10', due_date: '2025-01-25' },
];

const STATUS_CONFIG = {
  paid: { label: 'Paid', labelAr: 'مدفوع', color: 'bg-success/10 text-success border-success/30', icon: CheckCircle },
  pending: { label: 'Pending', labelAr: 'معلق', color: 'bg-warning/10 text-warning border-warning/30', icon: Clock },
  overdue: { label: 'Overdue', labelAr: 'متأخر', color: 'bg-destructive/10 text-destructive border-destructive/30', icon: AlertTriangle },
};

export default function AdminBilling() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  // Fetch organizations count
  const { data: organizations } = useQuery({
    queryKey: ['billing-orgs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('organizations').select('id');
      if (error) throw error;
      return data || [];
    },
  });

  const totalMRR = PLANS.reduce((acc, p) => acc + (p.price * p.orgs), 0);
  const paidInvoices = INVOICES.filter(i => i.status === 'paid');
  const pendingAmount = INVOICES.filter(i => i.status !== 'paid').reduce((acc, i) => acc + i.amount, 0);

  const metrics = [
    { title: t('Monthly Revenue', 'الإيرادات الشهرية'), value: `AED ${totalMRR.toLocaleString()}`, icon: DollarSign },
    { title: t('Active Organizations', 'المنظمات النشطة'), value: organizations?.length || PLANS.reduce((acc, p) => acc + p.orgs, 0), icon: Building2 },
    { title: t('Pending Invoices', 'الفواتير المعلقة'), value: `AED ${pendingAmount.toLocaleString()}`, icon: Clock },
    { title: t('Collection Rate', 'معدل التحصيل'), value: `${Math.round((paidInvoices.length / INVOICES.length) * 100)}%`, icon: TrendingUp },
  ];

  return (
    <PageLayout
      title={t('Plans & Invoices', 'الخطط والفواتير')}
      description={t('Manage subscription plans and billing for all organizations', 'إدارة خطط الاشتراك والفوترة لجميع المنظمات')}
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
          <MetricCard key={m.title} title={m.title} value={m.value} icon={m.icon} />
        ))}
      </MetricGrid>

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
              <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <FileText className="w-5 h-5" />
                {t('Recent Invoices', 'الفواتير الأخيرة')}
              </CardTitle>
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
                    <TableHead>{t('Invoice Date', 'تاريخ الفاتورة')}</TableHead>
                    <TableHead>{t('Due Date', 'تاريخ الاستحقاق')}</TableHead>
                    <TableHead>{t('Actions', 'الإجراءات')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {INVOICES.map((invoice) => {
                    const statusConfig = STATUS_CONFIG[invoice.status as keyof typeof STATUS_CONFIG];
                    return (
                      <TableRow key={invoice.id}>
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
                        <TableCell>{invoice.date}</TableCell>
                        <TableCell>{invoice.due_date}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4 me-1" />
                            PDF
                          </Button>
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

          {/* Revenue by Plan */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>{t('Revenue by Plan', 'الإيرادات حسب الخطة')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {PLANS.map((plan) => {
                  const revenue = plan.price * plan.orgs;
                  const percentage = Math.round((revenue / totalMRR) * 100);
                  return (
                    <div key={plan.id}>
                      <div className={cn("flex items-center justify-between mb-1", isRTL && "flex-row-reverse")}>
                        <span className="font-medium">{plan.name}</span>
                        <span className="text-sm text-muted-foreground">
                          AED {revenue.toLocaleString()} ({percentage}%)
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}
