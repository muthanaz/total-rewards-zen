/**
 * Proration Display Component
 * 
 * Shows prorated entitlements with clear breakdown for employees and HR.
 */

import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Calculator, Calendar, Info, TrendingDown } from 'lucide-react';
import { cn, CURRENCY_LABEL } from '@/lib/utils';
import type { ProrationResult } from '@/lib/prorationEngine';

interface ProrationDisplayProps {
  proration: ProrationResult;
  currency?: string;
  variant?: 'inline' | 'detailed' | 'compact';
  className?: string;
}

export function ProrationDisplay({
  proration,
  currency = CURRENCY_LABEL,
  variant = 'inline',
  className,
}: ProrationDisplayProps) {
  if (!proration.was_prorated) {
    return null;
  }

  const percentageDisplay = Math.round(proration.proration_factor * 100);

  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={cn('gap-1', className)}>
              <TrendingDown className="h-3 w-3" />
              {percentageDisplay}% prorated
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{proration.reason}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-2 text-sm', className)}>
        <Badge variant="secondary" className="gap-1">
          <Calculator className="h-3 w-3" />
          Prorated
        </Badge>
        <span className="text-muted-foreground">
          {proration.prorated_cap.toLocaleString()} {currency}
          <span className="text-xs ml-1">
            ({percentageDisplay}% of {proration.original_cap.toLocaleString()})
          </span>
        </span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>{proration.reason}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  // Detailed variant
  return (
    <Card className={cn('border-dashed', className)}>
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Prorated Entitlement</span>
          </div>
          <Badge variant="secondary">{percentageDisplay}%</Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Full annual cap</span>
            <span>{proration.original_cap.toLocaleString()} {currency}</span>
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span>Your prorated cap</span>
            <span className="text-primary">
              {proration.prorated_cap.toLocaleString()} {currency}
            </span>
          </div>
        </div>

        <Progress value={percentageDisplay} className="h-2" />

        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded">
          <Calendar className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>{proration.reason}</span>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Entitlement breakdown with proration for employee dashboard
 */
interface EntitlementBreakdownProps {
  originalCap: number;
  proratedCap: number | null;
  utilized: number;
  currency?: string;
  prorationReason?: string;
  className?: string;
}

export function EntitlementBreakdown({
  originalCap,
  proratedCap,
  utilized,
  currency = CURRENCY_LABEL,
  prorationReason,
  className,
}: EntitlementBreakdownProps) {
  const effectiveCap = proratedCap ?? originalCap;
  const remaining = Math.max(0, effectiveCap - utilized);
  const utilizationPct = effectiveCap > 0 ? Math.round((utilized / effectiveCap) * 100) : 0;
  const isProrated = proratedCap !== null && proratedCap !== originalCap;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Cap display */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {isProrated ? 'Prorated cap' : 'Annual cap'}
        </span>
        <div className="flex items-center gap-2">
          <span className="font-medium">
            {effectiveCap.toLocaleString()} {currency}
          </span>
          {isProrated && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="text-xs">
                    of {originalCap.toLocaleString()}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{prorationReason || 'Prorated based on your start date'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <Progress 
          value={utilizationPct} 
          className={cn(
            'h-2',
            utilizationPct >= 90 && 'bg-amber-100 [&>div]:bg-amber-500',
            utilizationPct >= 100 && 'bg-red-100 [&>div]:bg-red-500'
          )}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Used: {utilized.toLocaleString()} {currency}</span>
          <span>Remaining: {remaining.toLocaleString()} {currency}</span>
        </div>
      </div>

      {/* Utilization percentage */}
      <div className="text-right">
        <span className={cn(
          'text-sm font-medium',
          utilizationPct >= 90 && 'text-amber-600',
          utilizationPct >= 100 && 'text-red-600'
        )}>
          {utilizationPct}% utilized
        </span>
      </div>
    </div>
  );
}

/**
 * HR view of proration info on a claim
 */
interface ProrationAuditInfoProps {
  proratedAmount?: number | null;
  prorationFactor?: number | null;
  prorationReason?: string | null;
  currency?: string;
  className?: string;
}

export function ProrationAuditInfo({
  proratedAmount,
  prorationFactor,
  prorationReason,
  currency = CURRENCY_LABEL,
  className,
}: ProrationAuditInfoProps) {
  if (!proratedAmount && !prorationFactor) return null;

  const percentageDisplay = prorationFactor ? Math.round(prorationFactor * 100) : null;

  return (
    <div className={cn(
      'flex items-start gap-2 p-2 rounded border bg-muted/30 text-sm',
      className
    )}>
      <Calculator className="h-4 w-4 text-muted-foreground mt-0.5" />
      <div className="space-y-0.5">
        <p className="font-medium">Proration Applied</p>
        {proratedAmount && (
          <p className="text-muted-foreground">
            Prorated cap: {proratedAmount.toLocaleString()} {currency}
            {percentageDisplay && <span className="ml-1">({percentageDisplay}%)</span>}
          </p>
        )}
        {prorationReason && (
          <p className="text-xs text-muted-foreground">{prorationReason}</p>
        )}
      </div>
    </div>
  );
}
