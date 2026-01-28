/**
 * HR Ops Payments Pipeline Section
 * 
 * Shows:
 * - Ready for Export (count + AED total)
 * - Exported (count + AED total)
 * - Paid (count + AED total)
 * - CTA: "Export Batch" (if permissions)
 */

import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Banknote, 
  Download, 
  FileOutput, 
  CheckCircle2,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';

export interface PaymentsPipelineMetrics {
  readyForExport: {
    count: number;
    totalAED: number;
  };
  exported: {
    count: number;
    totalAED: number;
  };
  paid: {
    count: number;
    totalAED: number;
  };
}

interface HROpsPaymentsPipelineProps {
  metrics: PaymentsPipelineMetrics;
  canExport?: boolean;
  onExportClick?: () => void;
  className?: string;
}

export function HROpsPaymentsPipeline({
  metrics,
  canExport = true,
  onExportClick,
  className,
}: HROpsPaymentsPipelineProps) {
  const { readyForExport, exported, paid } = metrics;

  const stages = [
    {
      id: 'ready',
      label: 'Ready for Export',
      icon: Clock,
      count: readyForExport.count,
      total: readyForExport.totalAED,
      color: 'text-warning',
      bg: 'bg-warning/10',
      borderColor: 'border-warning/30',
      link: '/employer/settlements?status=ready',
    },
    {
      id: 'exported',
      label: 'Exported',
      icon: FileOutput,
      count: exported.count,
      total: exported.totalAED,
      color: 'text-primary',
      bg: 'bg-primary/10',
      borderColor: 'border-primary/30',
      link: '/employer/settlements?status=exported',
    },
    {
      id: 'paid',
      label: 'Paid',
      icon: CheckCircle2,
      count: paid.count,
      total: paid.totalAED,
      color: 'text-success',
      bg: 'bg-success/10',
      borderColor: 'border-success/30',
      link: '/employer/settlements?status=paid',
    },
  ];

  return (
    <Card className={cn('border-border/50', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Banknote className="w-4 h-4 text-success" />
            Payments Pipeline
          </CardTitle>
          <div className="flex items-center gap-2">
            {canExport && readyForExport.count > 0 && (
              <Button 
                size="sm" 
                className="h-7 text-xs gap-1.5"
                onClick={onExportClick}
              >
                <Download className="w-3 h-3" />
                Export Batch
              </Button>
            )}
            <Link to="/employer/settlements">
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
                View All
                <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Pipeline visualization */}
        <div className="flex items-stretch gap-2">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            return (
              <Link 
                key={stage.id}
                to={stage.link}
                className="flex-1"
              >
                <div 
                  className={cn(
                    'p-4 rounded-lg border transition-all hover:shadow-md cursor-pointer',
                    stage.bg,
                    stage.borderColor,
                    'hover:opacity-90'
                  )}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className={cn('w-4 h-4', stage.color)} />
                    <span className="text-xs font-medium text-muted-foreground">
                      {stage.label}
                    </span>
                  </div>
                  <p className="text-2xl font-bold tabular-nums mb-1">
                    {stage.count}
                  </p>
                  <p className={cn('text-sm font-semibold tabular-nums', stage.color)}>
                    {formatCurrencyAED(stage.total, { abbreviate: true })}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Pipeline flow indicator */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span>Ready</span>
          <ArrowRight className="w-3 h-3" />
          <span>Exported</span>
          <ArrowRight className="w-3 h-3" />
          <span>Paid</span>
        </div>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total in Pipeline</span>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="tabular-nums">
              {readyForExport.count + exported.count + paid.count} items
            </Badge>
            <span className="font-semibold tabular-nums">
              {formatCurrencyAED(
                readyForExport.totalAED + exported.totalAED + paid.totalAED, 
                { abbreviate: true }
              )}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
