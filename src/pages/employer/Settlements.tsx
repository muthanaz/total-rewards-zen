import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Banknote, 
  Download, 
  CheckCircle2, 
  Clock, 
  FileText,
  ArrowRight,
} from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

const settlementBatches = [
  {
    id: 'BATCH-2026-001',
    period: 'Jan 2026',
    status: 'ready',
    claimsCount: 47,
    totalAmount: 284500,
    createdAt: '2026-01-25',
  },
  {
    id: 'BATCH-2026-002',
    period: 'Jan 2026 (Week 4)',
    status: 'pending_review',
    claimsCount: 23,
    totalAmount: 156200,
    createdAt: '2026-01-27',
  },
  {
    id: 'BATCH-2025-052',
    period: 'Dec 2025',
    status: 'exported',
    claimsCount: 89,
    totalAmount: 512800,
    createdAt: '2025-12-31',
  },
  {
    id: 'BATCH-2025-051',
    period: 'Dec 2025',
    status: 'paid',
    claimsCount: 112,
    totalAmount: 687400,
    createdAt: '2025-12-15',
  },
  {
    id: 'BATCH-2025-050',
    period: 'Nov 2025',
    status: 'paid',
    claimsCount: 95,
    totalAmount: 543200,
    createdAt: '2025-11-30',
  },
];

const statusConfig = {
  ready: { label: 'Ready to Export', color: 'bg-success/10 text-success border-success/30', icon: CheckCircle2, step: 1 },
  pending_review: { label: 'Pending Review', color: 'bg-warning/10 text-warning border-warning/30', icon: Clock, step: 0 },
  exported: { label: 'Exported', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30', icon: FileText, step: 2 },
  paid: { label: 'Paid', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30', icon: CheckCircle2, step: 3 },
};

const statusSteps = [
  { key: 'ready', label: 'Ready' },
  { key: 'exported', label: 'Exported' },
  { key: 'paid', label: 'Paid' },
];

export default function SettlementsPage() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';

  return (
    <div className={cn('p-6 space-y-6 animate-fade-in', isRTL && 'text-right')}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {language === 'ar' ? 'التسويات' : 'Settlements'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {language === 'ar' 
              ? 'دفعات المطالبات المعتمدة للتصدير إلى الرواتب/المالية'
              : 'Batch approved claims for payroll/finance export'
            }
          </p>
        </div>
        <Button className="gap-2">
          <Banknote className="w-4 h-4" />
          Create New Batch
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ready to Export</p>
                <p className="text-2xl font-bold tabular-nums">
                  {settlementBatches.filter(b => b.status === 'ready').length} Batch
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Payment</p>
                <p className="text-2xl font-bold tabular-nums">
                  {formatCurrencyAED(
                    settlementBatches
                      .filter(b => b.status === 'exported')
                      .reduce((sum, b) => sum + b.totalAmount, 0),
                    { abbreviate: true }
                  )}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {settlementBatches.filter(b => b.status === 'exported').length} batch(es) with Finance
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Banknote className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Paid YTD</p>
                <p className="text-2xl font-bold tabular-nums">
                  {formatCurrencyAED(
                    settlementBatches
                      .filter(b => b.status === 'paid')
                      .reduce((sum, b) => sum + b.totalAmount, 0),
                    { abbreviate: true }
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Batches List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Settlement Batches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {settlementBatches.map((batch) => {
              const config = statusConfig[batch.status as keyof typeof statusConfig];
              const StatusIcon = config.icon;

              return (
                <div 
                  key={batch.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-muted">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{batch.id}</p>
                        <Badge variant="outline" className={cn('text-[10px]', config.color)}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {batch.period} • {batch.claimsCount} claims
                      </p>
                    </div>
                  </div>
                  {/* Status Tracker */}
                  <div className="hidden md:flex items-center gap-1 mr-4">
                    {statusSteps.map((step, idx) => {
                      const currentStep = config.step;
                      const isCompleted = currentStep > idx;
                      const isCurrent = currentStep === idx + 1;
                      return (
                        <div key={step.key} className="flex items-center">
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium border transition-colors",
                            isCompleted && "bg-emerald-500 text-white border-emerald-500",
                            isCurrent && "bg-primary text-primary-foreground border-primary",
                            !isCompleted && !isCurrent && "bg-muted text-muted-foreground border-border"
                          )}>
                            {isCompleted ? '✓' : idx + 1}
                          </div>
                          {idx < statusSteps.length - 1 && (
                            <div className={cn(
                              "w-4 h-0.5 mx-0.5",
                              isCompleted ? "bg-emerald-500" : "bg-border"
                            )} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold tabular-nums">
                        {formatCurrencyAED(batch.totalAmount, { abbreviate: true })}
                      </p>
                      <p className="text-xs text-muted-foreground">{batch.createdAt}</p>
                    </div>
                    {batch.status === 'ready' && (
                      <Button size="sm" variant="outline" className="gap-1">
                        <Download className="w-3 h-3" />
                        Export
                      </Button>
                    )}
                    {batch.status === 'pending_review' && (
                      <Button size="sm" variant="outline" className="gap-1">
                        Review
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    )}
                    {batch.status === 'exported' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="gap-1 border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Mark as Paid
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
