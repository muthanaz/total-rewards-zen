/**
 * ROI/Savings Display Guard
 * 
 * Hard rule: Do not compute or display "savings / ROI" if based on estimates
 * without explicit assumptions. Use neutral language + assumptions tooltip.
 * 
 * This component wraps ROI/savings values and enforces trust layer rules.
 */

import { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  AlertTriangle, 
  Info, 
  Calculator,
  ShieldAlert,
} from 'lucide-react';
import { DataProvenance, ConfidenceLevel, CONFIDENCE_LABELS } from '@/lib/dataProvenance';
import { formatCurrencyAED, cn } from '@/lib/utils';

interface ROIDisplayGuardProps {
  /** The ROI or savings value */
  value: number | null | undefined;
  /** Data provenance */
  provenance: DataProvenance;
  /** Explicit assumptions for the calculation */
  assumptions: string[];
  /** Label for the value (e.g., "Potential Savings", "Expected ROI") */
  label: string;
  /** Format type */
  format?: 'currency' | 'multiplier' | 'percent';
  /** Whether this is a critical decision metric */
  isCritical?: boolean;
  /** Custom className */
  className?: string;
  /** Compact mode */
  compact?: boolean;
}

/**
 * Determines if ROI/savings should be displayed based on trust rules
 */
export function shouldDisplayROI(
  provenance: DataProvenance,
  assumptions: string[]
): { display: boolean; reason?: string } {
  // Rule 1: Never display if confidence is low
  if (provenance.confidence_level === 'low') {
    return {
      display: false,
      reason: 'Data confidence too low to project savings',
    };
  }

  // Rule 2: Estimates require explicit assumptions
  if (provenance.is_estimate && assumptions.length === 0) {
    return {
      display: false,
      reason: 'Estimated values require documented assumptions',
    };
  }

  // Rule 3: Stale data reduces confidence
  const lastUpdated = new Date(provenance.last_updated_at);
  const daysSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceUpdate > 30) {
    return {
      display: false,
      reason: 'Data is over 30 days old; projections may be unreliable',
    };
  }

  return { display: true };
}

/**
 * Format value based on type
 */
function formatValue(
  value: number,
  format: 'currency' | 'multiplier' | 'percent'
): string {
  switch (format) {
    case 'currency':
      return formatCurrencyAED(value);
    case 'multiplier':
      return `${value.toFixed(1)}x`;
    case 'percent':
      return `${value.toFixed(1)}%`;
    default:
      return String(value);
  }
}

/**
 * Get neutral language based on confidence
 */
function getNeutralLabel(
  label: string,
  confidence: ConfidenceLevel
): string {
  if (confidence === 'high') return label;
  if (confidence === 'medium') return `Estimated ${label}`;
  return `Indicative ${label}`;
}

export function ROIDisplayGuard({
  value,
  provenance,
  assumptions,
  label,
  format = 'currency',
  isCritical = false,
  className,
  compact = false,
}: ROIDisplayGuardProps) {
  const { display, reason } = shouldDisplayROI(provenance, assumptions);

  // Value is null/undefined
  if (value === null || value === undefined) {
    return (
      <div className={cn('text-muted-foreground', className)}>
        <span className="text-sm">{label}</span>
        <span className="text-lg font-medium ml-2">—</span>
      </div>
    );
  }

  // Should not display based on trust rules
  if (!display) {
    return (
      <div className={cn(
        'p-3 rounded-lg border border-dashed',
        isCritical ? 'border-destructive/40 bg-destructive/5' : 'border-muted',
        className
      )}>
        <div className="flex items-start gap-2">
          <ShieldAlert className={cn(
            'w-4 h-4 mt-0.5',
            isCritical ? 'text-destructive' : 'text-muted-foreground'
          )} />
          <div>
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {reason}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Display with appropriate caveats
  const neutralLabel = getNeutralLabel(label, provenance.confidence_level);
  const formattedValue = formatValue(value, format);

  return (
    <TooltipProvider>
      <div className={cn('space-y-1', className)}>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{neutralLabel}</span>
          {provenance.is_estimate && (
            <Badge 
              variant="outline" 
              className="text-[10px] px-1.5 py-0 bg-amber-500/10 text-amber-600 border-amber-500/20"
            >
              Est.
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className={cn(
            'font-bold tabular-nums',
            compact ? 'text-lg' : 'text-2xl',
            provenance.confidence_level === 'medium' && 'text-amber-600',
          )}>
            {formattedValue}
          </span>

          {/* Assumptions tooltip - required for estimates */}
          {assumptions.length > 0 && (
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Calculator className="w-3.5 h-3.5 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent 
                side="right" 
                className="max-w-xs"
                sideOffset={5}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-info" />
                    <span className="font-medium text-sm">Calculation Assumptions</span>
                  </div>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    {assumptions.map((assumption, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-muted-foreground/50">•</span>
                        {assumption}
                      </li>
                    ))}
                  </ul>
                  <div className="pt-2 border-t text-xs text-muted-foreground/70">
                    {CONFIDENCE_LABELS[provenance.confidence_level]}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Low/medium confidence warning */}
        {provenance.confidence_level === 'medium' && !compact && (
          <p className="text-xs text-amber-600/80 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Based on historical patterns; actual results may vary
          </p>
        )}
      </div>
    </TooltipProvider>
  );
}

/**
 * Simple wrapper for suppressing insights based on confidence
 */
interface ConfidenceGatedContentProps {
  /** Required minimum confidence level */
  minConfidence: ConfidenceLevel;
  /** Current confidence level */
  currentConfidence: ConfidenceLevel;
  /** Content to show if confidence is sufficient */
  children: ReactNode;
  /** Fallback when confidence is insufficient */
  fallback?: ReactNode;
  /** Show explanation why content is hidden */
  showExplanation?: boolean;
}

export function ConfidenceGatedContent({
  minConfidence,
  currentConfidence,
  children,
  fallback,
  showExplanation = true,
}: ConfidenceGatedContentProps) {
  const confidenceLevels: ConfidenceLevel[] = ['low', 'medium', 'high'];
  const currentIndex = confidenceLevels.indexOf(currentConfidence);
  const minIndex = confidenceLevels.indexOf(minConfidence);

  if (currentIndex >= minIndex) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showExplanation) {
    return null;
  }

  return (
    <div className="p-4 rounded-lg border border-dashed border-muted bg-muted/30 text-center">
      <ShieldAlert className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
      <p className="text-sm text-muted-foreground">
        This insight requires {CONFIDENCE_LABELS[minConfidence].toLowerCase()} data
      </p>
      <p className="text-xs text-muted-foreground/70 mt-1">
        Current: {CONFIDENCE_LABELS[currentConfidence]}
      </p>
    </div>
  );
}
