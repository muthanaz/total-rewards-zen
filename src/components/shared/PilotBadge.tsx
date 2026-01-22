/**
 * Pilot Badge Component
 * 
 * Visual indicator for pilot/temporary benefits with effective_to date.
 */

import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Beaker, Calendar, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, differenceInDays, isPast } from 'date-fns';

interface PilotBadgeProps {
  isPilot: boolean;
  pilotEndDate?: string | null;
  effectiveTo?: string | null;
  className?: string;
  showTooltip?: boolean;
  size?: 'sm' | 'default';
}

export function PilotBadge({
  isPilot,
  pilotEndDate,
  effectiveTo,
  className,
  showTooltip = true,
  size = 'default',
}: PilotBadgeProps) {
  if (!isPilot && !effectiveTo) return null;

  const endDate = pilotEndDate || effectiveTo;
  const endDateObj = endDate ? new Date(endDate) : null;
  const isExpired = endDateObj ? isPast(endDateObj) : false;
  const daysRemaining = endDateObj ? differenceInDays(endDateObj, new Date()) : null;

  // Determine urgency level
  const isUrgent = daysRemaining !== null && daysRemaining <= 30 && daysRemaining > 0;
  const isExpiringSoon = daysRemaining !== null && daysRemaining <= 7 && daysRemaining > 0;

  const badge = (
    <Badge
      variant="outline"
      className={cn(
        'gap-1.5',
        size === 'sm' && 'text-xs px-1.5 py-0.5',
        isPilot && !isExpired && 'border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-700 dark:bg-purple-950/50 dark:text-purple-300',
        isExpired && 'border-muted bg-muted/50 text-muted-foreground',
        isExpiringSoon && 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
        className
      )}
    >
      {isPilot ? (
        <Beaker className={cn('h-3 w-3', size === 'sm' && 'h-2.5 w-2.5')} />
      ) : isExpiringSoon ? (
        <AlertTriangle className={cn('h-3 w-3', size === 'sm' && 'h-2.5 w-2.5')} />
      ) : (
        <Calendar className={cn('h-3 w-3', size === 'sm' && 'h-2.5 w-2.5')} />
      )}
      {isPilot ? 'Pilot' : 'Limited Time'}
    </Badge>
  );

  if (!showTooltip || !endDateObj) return badge;

  const formattedDate = format(endDateObj, 'MMM d, yyyy');

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">
              {isPilot ? 'Pilot Program' : 'Limited Time Benefit'}
            </p>
            {isExpired ? (
              <p className="text-sm text-muted-foreground">
                Ended on {formattedDate}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {isExpiringSoon ? (
                  <span className="text-amber-600">
                    Expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} ({formattedDate})
                  </span>
                ) : isUrgent ? (
                  <span className="text-amber-600">
                    Expires {formattedDate} ({daysRemaining} days remaining)
                  </span>
                ) : (
                  <>Available until {formattedDate}</>
                )}
              </p>
            )}
            {isPilot && (
              <p className="text-xs text-muted-foreground">
                This is a pilot benefit being tested with select employees
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Policy applicability window display
 */
interface PolicyWindowBadgeProps {
  effectiveFrom: string;
  effectiveTo?: string | null;
  className?: string;
}

export function PolicyWindowBadge({
  effectiveFrom,
  effectiveTo,
  className,
}: PolicyWindowBadgeProps) {
  const fromDate = new Date(effectiveFrom);
  const toDate = effectiveTo ? new Date(effectiveTo) : null;
  const now = new Date();

  const isNotYetActive = now < fromDate;
  const isExpired = toDate && now > toDate;
  const isActive = !isNotYetActive && !isExpired;

  if (isNotYetActive) {
    return (
      <Badge variant="outline" className={cn('gap-1', className)}>
        <Calendar className="h-3 w-3" />
        Starts {format(fromDate, 'MMM d, yyyy')}
      </Badge>
    );
  }

  if (isExpired) {
    return (
      <Badge variant="secondary" className={cn('gap-1 text-muted-foreground', className)}>
        <Calendar className="h-3 w-3" />
        Ended {format(toDate!, 'MMM d, yyyy')}
      </Badge>
    );
  }

  if (toDate) {
    const daysRemaining = differenceInDays(toDate, now);
    const isExpiringSoon = daysRemaining <= 30;

    return (
      <Badge
        variant="outline"
        className={cn(
          'gap-1',
          isExpiringSoon && 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/50',
          className
        )}
      >
        <Calendar className="h-3 w-3" />
        Until {format(toDate, 'MMM d, yyyy')}
      </Badge>
    );
  }

  // No end date = ongoing
  return null;
}
