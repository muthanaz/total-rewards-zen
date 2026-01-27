/**
 * PayrollCountdownCard - Urgency indicator for HR Operations
 * 
 * Shows countdown to payroll cutoff and number of claims that must be processed
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Clock, AlertTriangle, CalendarClock, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PayrollCountdownCardProps {
  /** Days until payroll cutoff */
  daysRemaining: number;
  /** Number of claims that must be processed before cutoff */
  claimsPending: number;
  /** Total claims in the queue */
  totalQueueSize?: number;
  /** Optional custom label */
  cutoffLabel?: string;
  className?: string;
}

export function PayrollCountdownCard({
  daysRemaining,
  claimsPending,
  totalQueueSize,
  cutoffLabel = 'January Payroll',
  className,
}: PayrollCountdownCardProps) {
  // Urgency levels
  const isUrgent = daysRemaining <= 2;
  const isWarning = daysRemaining > 2 && daysRemaining <= 4;
  const isOnTrack = daysRemaining > 4;

  // Progress calculation (assumes 10-day cycle)
  const progressPercent = Math.max(0, Math.min(100, ((10 - daysRemaining) / 10) * 100));

  // Color schemes based on urgency
  const urgencyConfig = isUrgent 
    ? { 
        bg: 'bg-destructive/10 border-destructive/30', 
        iconBg: 'bg-destructive/15',
        iconColor: 'text-destructive',
        textColor: 'text-destructive',
        progressColor: 'bg-destructive',
      }
    : isWarning 
    ? { 
        bg: 'bg-warning/10 border-warning/30', 
        iconBg: 'bg-warning/15',
        iconColor: 'text-warning',
        textColor: 'text-warning',
        progressColor: 'bg-warning',
      }
    : { 
        bg: 'bg-muted/50 border-border', 
        iconBg: 'bg-muted',
        iconColor: 'text-muted-foreground',
        textColor: 'text-foreground',
        progressColor: 'bg-primary',
      };

  return (
    <TooltipProvider>
      <Card className={cn('border', urgencyConfig.bg, className)}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
              urgencyConfig.iconBg
            )}>
              {isUrgent ? (
                <AlertTriangle className={cn('w-5 h-5', urgencyConfig.iconColor)} />
              ) : (
                <CalendarClock className={cn('w-5 h-5', urgencyConfig.iconColor)} />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium">Payroll Countdown</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="p-0.5 rounded hover:bg-muted/50">
                      <Info className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[250px]">
                    <p className="text-xs">
                      Claims must be processed before the payroll cutoff date to be included 
                      in the current pay cycle. Unprocessed claims will roll over to the next cycle.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Countdown Display */}
              <div className="flex items-baseline gap-3 mb-2">
                <div className="flex items-center gap-1.5">
                  <Clock className={cn('w-4 h-4', urgencyConfig.iconColor)} />
                  <span className={cn('text-2xl font-bold tabular-nums', urgencyConfig.textColor)}>
                    {daysRemaining}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {daysRemaining === 1 ? 'Day' : 'Days'} remaining
                  </span>
                </div>
              </div>

              {/* Claims to Process */}
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">
                  <span className={cn('font-semibold', claimsPending > 0 ? urgencyConfig.textColor : 'text-success')}>
                    {claimsPending}
                  </span>
                  {' Claims must be processed'}
                </span>
                {isUrgent && claimsPending > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    Urgent
                  </Badge>
                )}
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <Progress 
                  value={progressPercent} 
                  className="h-2"
                  style={{
                    '--progress-foreground': urgencyConfig.progressColor === 'bg-destructive' 
                      ? 'hsl(var(--destructive))' 
                      : urgencyConfig.progressColor === 'bg-warning'
                      ? 'hsl(var(--warning))'
                      : 'hsl(var(--primary))'
                  } as React.CSSProperties}
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{cutoffLabel}</span>
                  {totalQueueSize !== undefined && (
                    <span>{totalQueueSize - claimsPending} of {totalQueueSize} completed</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

export default PayrollCountdownCard;
