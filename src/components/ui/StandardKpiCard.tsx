/**
 * StandardKpiCard - Universal KPI display component
 * 
 * Enforces identical 4-row structure everywhere:
 * - Row 1: Label + tooltip icon
 * - Row 2: Primary value (largest)
 * - Row 3: Secondary context (delta OR scope OR confidence)
 * - Row 4: Footer meta ("Last updated", "Confidence")
 */

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type DataConfidence = 'high' | 'medium' | 'low';
export type CardVariant = 'employee' | 'hr_ops' | 'executive';

export interface StandardKpiCardProps {
  /** Row 1: KPI label */
  label: string;
  /** Row 1: Optional tooltip content */
  tooltip?: string;
  /** Row 2: Primary value */
  value: string | number;
  /** Row 2: Optional icon */
  icon?: LucideIcon;
  /** Row 2: Icon styling */
  iconClassName?: string;
  /** Row 3: Delta percentage vs prior period */
  delta?: number;
  /** Row 3: Delta label (e.g., "vs last month") */
  deltaLabel?: string;
  /** Row 3: Is higher value better? (affects delta color) */
  higherIsBetter?: boolean;
  /** Row 3: Alternative - scope text instead of delta */
  scope?: string;
  /** Row 3: Alternative - confidence badge instead of delta */
  confidence?: DataConfidence;
  /** Row 4: Footer - last updated timestamp */
  lastUpdated?: Date | string;
  /** Row 4: Footer - custom footer content */
  footer?: React.ReactNode;
  /** Portal variant for styling */
  variant?: CardVariant;
  /** Click handler for drilldown */
  onClick?: () => void;
  /** Additional className */
  className?: string;
}

// Enforced minimum heights per variant
const MIN_HEIGHTS = {
  employee: 'min-h-[140px]',
  hr_ops: 'min-h-[120px]',
  executive: 'min-h-[140px]',
};

// Confidence badge styling
const CONFIDENCE_STYLES = {
  high: 'bg-success/10 text-success border-success/30',
  medium: 'bg-warning/10 text-warning border-warning/30',
  low: 'bg-destructive/10 text-destructive border-destructive/30',
};

export function StandardKpiCard({
  label,
  tooltip,
  value,
  icon: Icon,
  iconClassName,
  delta,
  deltaLabel,
  higherIsBetter = true,
  scope,
  confidence,
  lastUpdated,
  footer,
  variant = 'executive',
  onClick,
  className,
}: StandardKpiCardProps) {
  const minHeight = MIN_HEIGHTS[variant];

  // Determine delta display
  const getDeltaColor = () => {
    if (delta === undefined || delta === 0) return 'text-muted-foreground';
    const isPositive = delta > 0;
    const isGood = higherIsBetter ? isPositive : !isPositive;
    return isGood ? 'text-success' : 'text-destructive';
  };

  const DeltaIcon = delta === undefined ? null :
    delta > 0 ? TrendingUp :
    delta < 0 ? TrendingDown : Minus;

  // Format last updated
  const formatLastUpdated = (date: Date | string | undefined) => {
    if (!date) return null;
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  return (
    <Card
      className={cn(
        'border-border/50 transition-all duration-200',
        minHeight,
        onClick && 'cursor-pointer hover:shadow-md hover:border-accent/30',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 h-full flex flex-col justify-between">
        {/* Row 1: Label + Icon + Tooltip */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {Icon && (
              <div className={cn(
                'p-2 rounded-lg',
                iconClassName || 'bg-primary/10'
              )}>
                <Icon className={cn('w-4 h-4', iconClassName ? '' : 'text-primary')} />
              </div>
            )}
            <span className="text-sm text-muted-foreground font-medium">{label}</span>
          </div>
          {tooltip && (
            <TooltipProvider>
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <button 
                    className="p-1 rounded-full hover:bg-muted/50 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Info className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="text-xs">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Row 2: Primary Value */}
        <p className="text-2xl lg:text-3xl font-bold tracking-tight tabular-nums mt-2">
          {value}
        </p>

        {/* Row 3: Secondary Context (delta OR scope OR confidence) */}
        <div className="mt-2">
          {delta !== undefined ? (
            <div className="flex items-center gap-1.5">
              {DeltaIcon && <DeltaIcon className={cn('w-4 h-4', getDeltaColor())} />}
              <span className={cn('text-sm font-medium tabular-nums', getDeltaColor())}>
                {delta > 0 ? '+' : ''}{delta}%
              </span>
              {deltaLabel && (
                <span className="text-xs text-muted-foreground">{deltaLabel}</span>
              )}
            </div>
          ) : scope ? (
            <span className="text-xs text-muted-foreground">{scope}</span>
          ) : confidence ? (
            <Badge variant="outline" className={cn('text-[10px]', CONFIDENCE_STYLES[confidence])}>
              {confidence.charAt(0).toUpperCase() + confidence.slice(1)} confidence
            </Badge>
          ) : (
            <div className="h-5" /> /* Spacer for consistent height */
          )}
        </div>

        {/* Row 4: Footer Meta */}
        <div className="mt-auto pt-2 border-t border-border/30 text-[10px] text-muted-foreground">
          {footer || (
            lastUpdated && (
              <span>Last updated: {formatLastUpdated(lastUpdated)}</span>
            )
          ) || (
            <span className="opacity-0">-</span> /* Invisible spacer */
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default StandardKpiCard;
