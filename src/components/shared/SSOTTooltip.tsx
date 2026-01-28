/**
 * SSOTTooltip
 * 
 * Displays metric definition, scope, source, and notes via an info icon hover.
 * Uses the SSOT metrics dictionary for canonical definitions.
 * 
 * Features:
 * - Shows "Estimated" badge for non-defined metrics
 * - Links to assumptions log when applicable
 * - Supports scope and calculation method overrides
 */

import { Info, AlertCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { getSSOTMetric, isMetricEstimated, getMetricAssumptionText, type SSOTMetricDefinition } from '@/lib/ssot/metricsDictionary';
import { formatLastUpdated } from '@/lib/ssot/formatters';
import { cn } from '@/lib/utils';

interface SSOTTooltipProps {
  /** Key from SSOT_METRICS dictionary */
  metricKey: string;
  /** Override the default scope text */
  scopeOverride?: string;
  /** Override the calculation method text */
  calcMethod?: string;
  /** Show last updated timestamp */
  lastUpdated?: Date | string;
  /** Additional custom notes */
  notes?: string;
  /** Custom className for the trigger button */
  className?: string;
  /** Tooltip placement */
  side?: 'top' | 'bottom' | 'left' | 'right';
  /** Size variant */
  size?: 'sm' | 'md';
}

export function SSOTTooltip({
  metricKey,
  scopeOverride,
  calcMethod,
  lastUpdated,
  notes,
  className,
  side = 'top',
  size = 'sm',
}: SSOTTooltipProps) {
  const metric = getSSOTMetric(metricKey);
  const isEstimated = isMetricEstimated(metricKey);
  const assumptionText = getMetricAssumptionText(metricKey);
  
  // If metric not found, show a warning tooltip
  if (!metric) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={cn(
              'inline-flex items-center justify-center rounded-full',
              'text-warning/60 hover:text-warning hover:bg-warning/10',
              'transition-colors focus:outline-none focus:ring-1 focus:ring-ring',
              size === 'sm' ? 'w-4 h-4' : 'w-5 h-5',
              className
            )}
            aria-label={`Info about ${metricKey}`}
          >
            <AlertCircle className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
          </button>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs p-3">
          <p className="text-xs text-warning">
            Metric "{metricKey}" not found in SSOT dictionary.
          </p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className={cn(
            'inline-flex items-center justify-center rounded-full',
            'text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/50',
            'transition-colors focus:outline-none focus:ring-1 focus:ring-ring',
            size === 'sm' ? 'w-4 h-4' : 'w-5 h-5',
            className
          )}
          aria-label={`Info about ${metric.label}`}
        >
          <Info className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
        </button>
      </TooltipTrigger>
      <TooltipContent 
        side={side} 
        className="max-w-sm p-3 space-y-2.5 text-left"
      >
        {/* Metric Label + Status Badge */}
        <div className="flex items-center gap-2">
          <p className="font-semibold text-sm text-foreground">
            {metric.label}
          </p>
          {isEstimated && (
            <Badge 
              variant="outline" 
              className="text-[10px] bg-warning/10 text-warning border-warning/30"
            >
              Estimated
            </Badge>
          )}
        </div>

        {/* Definition */}
        <div>
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
            Definition
          </p>
          <p className="text-xs text-foreground/90 mt-0.5">
            {metric.definition}
          </p>
        </div>

        {/* Formula / Calculation */}
        <div>
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
            Calculation
          </p>
          <p className="text-xs font-mono bg-muted/50 px-2 py-1 rounded mt-0.5">
            {calcMethod || metric.formula}
          </p>
        </div>

        {/* Scope */}
        <div>
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
            Scope
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {scopeOverride || metric.scope}
          </p>
        </div>

        {/* Data Source */}
        <div>
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
            Source
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {metric.provenance}
          </p>
        </div>

        {/* Assumption Warning (for undefined/estimated) */}
        {assumptionText && (
          <div className="flex items-start gap-1.5 text-xs text-warning bg-warning/10 px-2 py-1.5 rounded">
            <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>{assumptionText}</span>
          </div>
        )}

        {/* Notes */}
        {(notes || metric.notes) && (
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Notes
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {notes || metric.notes}
            </p>
          </div>
        )}

        {/* Last Updated */}
        {lastUpdated && (
          <div className="pt-1 border-t border-border/50">
            <p className="text-[10px] text-muted-foreground">
              Last updated: {formatLastUpdated(lastUpdated)}
            </p>
          </div>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * Inline Estimated Badge
 * 
 * Use alongside metrics that have incomplete definitions
 */
export function EstimatedBadge({ className }: { className?: string }) {
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "text-[10px] bg-warning/10 text-warning border-warning/30",
        className
      )}
    >
      Estimated
    </Badge>
  );
}

/**
 * Metric Label with SSOT Tooltip
 * 
 * Convenience component that combines label text with tooltip
 */
interface MetricLabelWithTooltipProps {
  metricKey: string;
  label?: string;
  className?: string;
  tooltipSide?: 'top' | 'bottom' | 'left' | 'right';
  showEstimatedBadge?: boolean;
  lastUpdated?: Date | string;
}

export function MetricLabelWithTooltip({
  metricKey,
  label,
  className,
  tooltipSide = 'top',
  showEstimatedBadge = true,
  lastUpdated,
}: MetricLabelWithTooltipProps) {
  const metric = getSSOTMetric(metricKey);
  const isEstimated = isMetricEstimated(metricKey);
  const displayLabel = label || metric?.label || metricKey;

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span>{displayLabel}</span>
      <SSOTTooltip 
        metricKey={metricKey} 
        side={tooltipSide}
        lastUpdated={lastUpdated}
      />
      {showEstimatedBadge && isEstimated && <EstimatedBadge />}
    </span>
  );
}
