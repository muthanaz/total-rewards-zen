/**
 * MetricTooltip
 * 
 * Displays formula, time window, exclusions, and data source
 * for any metric via an info icon hover.
 */

import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getMetricTooltipContent, METRIC_DEFINITIONS } from '@/lib/metrics';
import { cn } from '@/lib/utils';

interface MetricTooltipProps {
  metricKey: string;
  className?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  /** Custom content to override the standard definition */
  customContent?: {
    formula?: string;
    timeWindow?: string;
    exclusions?: string[];
    dataSource?: string;
    notes?: string;
  };
}

export function MetricTooltip({ 
  metricKey, 
  className,
  side = 'top',
  customContent,
}: MetricTooltipProps) {
  const content = customContent || getMetricTooltipContent(metricKey);
  const definition = METRIC_DEFINITIONS[metricKey];
  
  if (!content && !definition) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button 
          className={cn(
            "inline-flex items-center justify-center w-4 h-4 rounded-full",
            "text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/50",
            "transition-colors focus:outline-none focus:ring-1 focus:ring-ring",
            className
          )}
          aria-label={`Info about ${definition?.name || metricKey}`}
        >
          <Info className="w-3 h-3" />
        </button>
      </TooltipTrigger>
      <TooltipContent 
        className="max-w-xs p-3 space-y-2.5 text-left" 
        side={side}
      >
        {/* Metric Name */}
        {definition?.name && (
          <p className="font-semibold text-sm text-foreground">
            {definition.name}
          </p>
        )}

        {/* Formula */}
        {content?.formula && (
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Formula
            </p>
            <p className="text-xs font-mono bg-muted/50 px-2 py-1 rounded mt-0.5">
              {content.formula}
            </p>
          </div>
        )}

        {/* Time Window */}
        {content?.timeWindow && (
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Time Window
            </p>
            <p className="text-xs">{content.timeWindow}</p>
          </div>
        )}

        {/* Exclusions */}
        {content?.exclusions && content.exclusions.length > 0 && (
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Exclusions
            </p>
            <ul className="text-xs text-muted-foreground list-disc list-inside space-y-0.5">
              {content.exclusions.map((ex, i) => (
                <li key={i}>{ex}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Data Source */}
        {content?.dataSource && (
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Data Source
            </p>
            <p className="text-xs text-muted-foreground">{content.dataSource}</p>
          </div>
        )}

        {/* Notes (custom) */}
        {customContent?.notes && (
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Notes
            </p>
            <p className="text-xs text-muted-foreground">{customContent.notes}</p>
          </div>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
