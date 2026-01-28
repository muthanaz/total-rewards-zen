import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle,
  Upload,
  FileSpreadsheet,
  Clock,
} from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { SettlementBatch } from './types';
import { format } from 'date-fns';

interface ReconciliationPanelProps {
  batch: SettlementBatch;
  onRunReconciliation: () => void;
  onUploadStatement?: () => void;
  className?: string;
}

const statusConfig = {
  pending: { 
    label: 'Pending', 
    icon: Clock, 
    color: 'text-muted-foreground',
    bg: 'bg-muted',
    description: 'Reconciliation has not been run yet',
  },
  matched: { 
    label: 'Fully Matched', 
    icon: CheckCircle, 
    color: 'text-success',
    bg: 'bg-success/10',
    description: 'All transactions matched successfully',
  },
  partial: { 
    label: 'Partially Matched', 
    icon: AlertCircle, 
    color: 'text-warning',
    bg: 'bg-warning/10',
    description: 'Some transactions require attention',
  },
  unmatched: { 
    label: 'Unmatched', 
    icon: AlertTriangle, 
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    description: 'Multiple transactions failed to match',
  },
};

export function ReconciliationPanel({ 
  batch, 
  onRunReconciliation,
  onUploadStatement,
  className 
}: ReconciliationPanelProps) {
  const { reconciliation } = batch;
  const config = statusConfig[reconciliation.status];
  const StatusIcon = config.icon;

  const total = reconciliation.matchedCount + reconciliation.partialCount + reconciliation.unmatchedCount;
  const matchRate = total > 0 ? (reconciliation.matchedCount / total) * 100 : 0;

  return (
    <Card className={cn('border-border/50', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-primary" />
            Reconciliation Status
          </CardTitle>
          <Badge variant="outline" className={cn('gap-1', config.color, config.bg)}>
            <StatusIcon className="w-3 h-3" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{config.description}</p>

        {reconciliation.status !== 'pending' && (
          <>
            {/* Match Rate */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Match Rate</span>
                <span className="font-semibold tabular-nums">{matchRate.toFixed(1)}%</span>
              </div>
              <Progress 
                value={matchRate} 
                className={cn(
                  'h-2',
                  matchRate === 100 && '[&>div]:bg-success',
                  matchRate >= 90 && matchRate < 100 && '[&>div]:bg-warning',
                  matchRate < 90 && '[&>div]:bg-destructive'
                )}
              />
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 rounded-lg bg-success/10 text-center">
                <p className="text-lg font-bold tabular-nums text-success">
                  {reconciliation.matchedCount}
                </p>
                <p className="text-[10px] text-muted-foreground">Matched</p>
              </div>
              <div className="p-2 rounded-lg bg-warning/10 text-center">
                <p className="text-lg font-bold tabular-nums text-warning">
                  {reconciliation.partialCount}
                </p>
                <p className="text-[10px] text-muted-foreground">Partial</p>
              </div>
              <div className="p-2 rounded-lg bg-destructive/10 text-center">
                <p className="text-lg font-bold tabular-nums text-destructive">
                  {reconciliation.unmatchedCount}
                </p>
                <p className="text-[10px] text-muted-foreground">Unmatched</p>
              </div>
            </div>

            {/* Last Run Info */}
            {reconciliation.lastRunAt && (
              <div className="pt-2 border-t text-xs text-muted-foreground">
                <span>Last run: </span>
                <span className="font-medium">
                  {format(new Date(reconciliation.lastRunAt), 'dd MMM yyyy, HH:mm')}
                </span>
                {reconciliation.runBy && (
                  <span> by {reconciliation.runBy}</span>
                )}
              </div>
            )}
          </>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          {batch.status === 'exported' && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-2"
                onClick={onUploadStatement}
              >
                <Upload className="w-4 h-4" />
                Upload Statement
              </Button>
              <Button
                size="sm"
                className="flex-1 gap-2"
                onClick={onRunReconciliation}
              >
                <RefreshCw className="w-4 h-4" />
                Run Reconciliation
              </Button>
            </>
          )}
          {batch.status === 'ready' && (
            <div className="flex items-center gap-2 p-3 w-full rounded-lg bg-muted text-sm text-muted-foreground">
              <FileSpreadsheet className="w-4 h-4" />
              Export batch first to enable reconciliation
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
