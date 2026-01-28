import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  FileOutput, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';

interface LifecycleStats {
  ready: { count: number; totalAED: number; claims: number };
  exported: { count: number; totalAED: number; claims: number };
  paid: { count: number; totalAED: number; claims: number };
  exceptions: { critical: number; warning: number; totalAED: number };
}

interface SettlementStatsProps {
  stats: LifecycleStats;
  onStageClick?: (stage: 'ready' | 'exported' | 'paid' | 'exceptions') => void;
}

export function SettlementStats({ stats, onStageClick }: SettlementStatsProps) {
  const stages = [
    {
      id: 'ready' as const,
      label: 'Ready for Export',
      icon: Clock,
      count: stats.ready.count,
      claims: stats.ready.claims,
      total: stats.ready.totalAED,
      color: 'text-warning',
      bg: 'bg-warning/10',
      border: 'border-warning/30',
    },
    {
      id: 'exported' as const,
      label: 'Exported',
      icon: FileOutput,
      count: stats.exported.count,
      claims: stats.exported.claims,
      total: stats.exported.totalAED,
      color: 'text-primary',
      bg: 'bg-primary/10',
      border: 'border-primary/30',
    },
    {
      id: 'paid' as const,
      label: 'Paid',
      icon: CheckCircle2,
      count: stats.paid.count,
      claims: stats.paid.claims,
      total: stats.paid.totalAED,
      color: 'text-success',
      bg: 'bg-success/10',
      border: 'border-success/30',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Lifecycle Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          return (
            <Card 
              key={stage.id}
              className={cn(
                'cursor-pointer transition-all hover:shadow-md',
                stage.bg,
                stage.border
              )}
              onClick={() => onStageClick?.(stage.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Icon className={cn('w-4 h-4', stage.color)} />
                  <span className="text-xs font-medium text-muted-foreground">
                    {stage.label}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-2xl font-bold tabular-nums">
                      {stage.count}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stage.claims} claims
                    </p>
                  </div>
                  <p className={cn('text-sm font-semibold tabular-nums', stage.color)}>
                    {formatCurrencyAED(stage.total, { abbreviate: true })}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Flow Indicator + Exceptions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Ready</span>
          <ArrowRight className="w-3 h-3" />
          <span>Exported</span>
          <ArrowRight className="w-3 h-3" />
          <span>Paid</span>
        </div>
        
        {(stats.exceptions.critical > 0 || stats.exceptions.warning > 0) && (
          <button
            onClick={() => onStageClick?.('exceptions')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-destructive/10 border border-destructive/30 hover:bg-destructive/20 transition-colors"
          >
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="text-xs font-medium text-destructive">
              {stats.exceptions.critical + stats.exceptions.warning} Exceptions
            </span>
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
              {formatCurrencyAED(stats.exceptions.totalAED, { abbreviate: true })}
            </Badge>
          </button>
        )}
      </div>
    </div>
  );
}
