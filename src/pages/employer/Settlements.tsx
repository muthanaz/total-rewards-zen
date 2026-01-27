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
];

const statusConfig = {
  ready: { label: 'Ready to Export', color: 'bg-success/10 text-success border-success/30', icon: CheckCircle2 },
  pending_review: { label: 'Pending Review', color: 'bg-warning/10 text-warning border-warning/30', icon: Clock },
  exported: { label: 'Exported', color: 'bg-muted text-muted-foreground', icon: FileText },
};

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
                <p className="text-2xl font-bold tabular-nums">1 Batch</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold tabular-nums">1 Batch</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Banknote className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total This Month</p>
                <p className="text-2xl font-bold tabular-nums">
                  {formatCurrencyAED(440700, { abbreviate: true })}
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
