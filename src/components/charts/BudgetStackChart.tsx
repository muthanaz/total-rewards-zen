/**
 * BudgetStackChart Component
 * 
 * Stacked budget visualization following Financial Audit standards:
 * - Base Layer (Gray): Total Allocated Budget
 * - Fill Layer (Green): Actual Utilized (Claims Paid)
 * - Marker (Dotted Line): Current Run-Rate Projection
 * - Utilization % displayed prominently
 */

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { formatCurrencyAED, formatPercent } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface BudgetStackItem {
  name: string;
  allocated: number;
  utilized: number;
  runRateProjection?: number;
}

interface BudgetStackChartProps {
  data: BudgetStackItem[];
  orientation?: 'horizontal' | 'vertical';
  showLabels?: boolean;
  showRunRate?: boolean;
  barHeight?: number;
  onItemClick?: (item: BudgetStackItem) => void;
}

export function BudgetStackChart({
  data,
  orientation = 'horizontal',
  showLabels = true,
  showRunRate = true,
  barHeight = 32,
  onItemClick,
}: BudgetStackChartProps) {
  // Calculate max value for scaling
  const maxValue = useMemo(() => 
    Math.max(...data.map(d => d.allocated)),
    [data]
  );

  return (
    <TooltipProvider>
      <div className={cn(
        'space-y-4',
        orientation === 'vertical' && 'flex flex-col'
      )}>
        {data.map((item) => {
          const utilization = item.allocated > 0 
            ? (item.utilized / item.allocated) * 100 
            : 0;
          const runRatePercent = item.runRateProjection && item.allocated > 0
            ? (item.runRateProjection / item.allocated) * 100
            : undefined;
          const widthPercent = (item.allocated / maxValue) * 100;

          return (
            <div 
              key={item.name}
              className={cn(
                'group transition-all',
                onItemClick && 'cursor-pointer hover:opacity-80'
              )}
              onClick={() => onItemClick?.(item)}
            >
              {/* Label row */}
              {showLabels && (
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">
                    {item.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {formatCurrencyAED(item.utilized, { abbreviate: true })} / {formatCurrencyAED(item.allocated, { abbreviate: true })}
                    </span>
                    <span className={cn(
                      'text-sm font-semibold tabular-nums min-w-[4rem] text-right',
                      utilization >= 80 ? 'text-success' :
                      utilization >= 60 ? 'text-warning' :
                      'text-destructive'
                    )}>
                      {formatPercent(utilization)}
                    </span>
                  </div>
                </div>
              )}

              {/* Stack bar container */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className="relative rounded-md overflow-hidden"
                    style={{ 
                      height: barHeight,
                      width: `${Math.max(widthPercent, 20)}%`,
                    }}
                  >
                    {/* Base Layer (Gray) - Total Allocated Budget */}
                    <div 
                      className="absolute inset-0 bg-muted-foreground/20"
                      aria-label="Allocated Budget"
                    />

                    {/* Fill Layer (Green) - Actual Utilized */}
                    <div 
                      className={cn(
                        'absolute inset-y-0 left-0 transition-all duration-500',
                        utilization >= 80 ? 'bg-success' :
                        utilization >= 60 ? 'bg-warning' :
                        'bg-destructive/80'
                      )}
                      style={{ width: `${Math.min(utilization, 100)}%` }}
                      aria-label="Utilized Amount"
                    />

                    {/* Run-Rate Projection Marker (Dotted Line) */}
                    {showRunRate && runRatePercent !== undefined && (
                      <div 
                        className="absolute inset-y-0 z-10 border-r-2 border-dashed border-primary"
                        style={{ 
                          left: `${Math.min(runRatePercent, 100)}%`,
                        }}
                        aria-label="Run-Rate Projection"
                      >
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary" />
                      </div>
                    )}

                    {/* Subtle shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <div className="space-y-2">
                    <p className="font-medium">{item.name}</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <span className="text-muted-foreground">Allocated:</span>
                      <span className="font-medium text-right">{formatCurrencyAED(item.allocated)}</span>
                      <span className="text-muted-foreground">Utilized:</span>
                      <span className="font-medium text-right text-success">{formatCurrencyAED(item.utilized)}</span>
                      {item.runRateProjection !== undefined && (
                        <>
                          <span className="text-muted-foreground">Run-Rate:</span>
                          <span className="font-medium text-right text-primary">{formatCurrencyAED(item.runRateProjection)}</span>
                        </>
                      )}
                      <span className="text-muted-foreground">Utilization:</span>
                      <span className={cn(
                        'font-semibold text-right',
                        utilization >= 80 ? 'text-success' :
                        utilization >= 60 ? 'text-warning' :
                        'text-destructive'
                      )}>
                        {formatPercent(utilization)}
                      </span>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          );
        })}

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded-sm bg-muted-foreground/20" />
            <span className="text-xs text-muted-foreground">Allocated Budget</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded-sm bg-success" />
            <span className="text-xs text-muted-foreground">Utilized</span>
          </div>
          {showRunRate && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-0 border-t-2 border-dashed border-primary" />
              <span className="text-xs text-muted-foreground">Run-Rate Projection</span>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

// Compact version for tables
interface BudgetStackCellProps {
  allocated: number;
  utilized: number;
  runRateProjection?: number;
  width?: number;
}

export function BudgetStackCell({
  allocated,
  utilized,
  runRateProjection,
  width = 100,
}: BudgetStackCellProps) {
  const utilization = allocated > 0 ? (utilized / allocated) * 100 : 0;
  const runRatePercent = runRateProjection && allocated > 0
    ? (runRateProjection / allocated) * 100
    : undefined;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <div 
              className="relative h-4 rounded overflow-hidden"
              style={{ width }}
            >
              {/* Base (allocated) */}
              <div className="absolute inset-0 bg-muted-foreground/20" />
              {/* Fill (utilized) */}
              <div 
                className={cn(
                  'absolute inset-y-0 left-0 transition-all',
                  utilization >= 80 ? 'bg-success' :
                  utilization >= 60 ? 'bg-warning' :
                  'bg-destructive/80'
                )}
                style={{ width: `${Math.min(utilization, 100)}%` }}
              />
              {/* Run-rate marker */}
              {runRatePercent !== undefined && (
                <div 
                  className="absolute inset-y-0 border-r-2 border-dashed border-primary"
                  style={{ left: `${Math.min(runRatePercent, 100)}%` }}
                />
              )}
            </div>
            <span className={cn(
              'text-sm font-medium tabular-nums min-w-[3rem]',
              utilization >= 80 ? 'text-success' :
              utilization >= 60 ? 'text-warning' :
              'text-destructive'
            )}>
              {formatPercent(utilization)}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs space-y-1">
            <p>Allocated: {formatCurrencyAED(allocated)}</p>
            <p className="text-success">Utilized: {formatCurrencyAED(utilized)}</p>
            {runRateProjection && (
              <p className="text-primary">Projected: {formatCurrencyAED(runRateProjection)}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default BudgetStackChart;
