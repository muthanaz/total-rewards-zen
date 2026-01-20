import { ReactNode, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  HelpCircle, 
  Info, 
  ChevronDown, 
  ChevronUp,
  BarChart3,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DataConfidenceBadge, DataCoverageMetrics } from '@/components/employer/DataConfidenceBadge';

export interface ChartExplanation {
  short: string; // 1 sentence shown under chart
  detailed?: string; // Full explanation in tooltip
  methodology?: string; // How data is calculated
}

export interface ChartWrapperProps {
  // Required
  title: string;
  children: ReactNode;
  
  // Optional content
  subtitle?: string;
  explanation?: ChartExplanation | string;
  formula?: string;
  dataSource?: string;
  
  // Confidence/coverage
  confidenceMetrics?: DataCoverageMetrics;
  confidenceThreshold?: number;
  
  // Legend (if not handled by chart)
  legend?: Array<{ label: string; color: string }>;
  
  // Time scale
  timeRange?: string;
  lastUpdated?: Date | string;
  
  // Empty state
  isEmpty?: boolean;
  emptyMessage?: string;
  onRetry?: () => void;
  
  // Actions
  action?: ReactNode;
  
  // Styling
  className?: string;
  height?: number | 'auto';
  compact?: boolean;
  noPadding?: boolean;
}

// Empty state for charts
function ChartEmptyState({ 
  message = 'No data available', 
  onRetry 
}: { 
  message?: string; 
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-48 text-center p-6">
      <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
        <BarChart3 className="w-6 h-6 text-muted-foreground/60" />
      </div>
      <p className="text-sm text-muted-foreground font-medium mb-1">
        {message}
      </p>
      <p className="text-xs text-muted-foreground/70 max-w-[200px]">
        Data will appear here once available
      </p>
      {onRetry && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onRetry}
          className="mt-3 gap-1.5 text-xs"
        >
          <RefreshCw className="w-3 h-3" />
          Retry
        </Button>
      )}
    </div>
  );
}

// Chart legend component
function ChartLegend({ 
  items 
}: { 
  items: Array<{ label: string; color: string }>;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-3 pt-3 border-t border-border/30">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1.5">
          <div 
            className="w-2.5 h-2.5 rounded-sm shrink-0" 
            style={{ backgroundColor: item.color }}
          />
          <span className="text-xs text-muted-foreground font-medium">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// Info tooltip for chart metadata
function ChartInfoTooltip({ 
  formula, 
  dataSource,
  methodology,
  detailed
}: { 
  formula?: string; 
  dataSource?: string;
  methodology?: string;
  detailed?: string;
}) {
  if (!formula && !dataSource && !methodology && !detailed) return null;
  
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <button className="text-muted-foreground/60 hover:text-muted-foreground transition-colors">
            <Info className="w-4 h-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          align="end"
          className="max-w-xs p-3 space-y-2"
        >
          {detailed && (
            <p className="text-sm">{detailed}</p>
          )}
          {formula && (
            <div>
              <p className="text-[10px] font-medium uppercase text-muted-foreground mb-0.5">
                Formula
              </p>
              <p className="text-xs font-medium">{formula}</p>
            </div>
          )}
          {methodology && (
            <div>
              <p className="text-[10px] font-medium uppercase text-muted-foreground mb-0.5">
                Methodology
              </p>
              <p className="text-xs">{methodology}</p>
            </div>
          )}
          {dataSource && (
            <div>
              <p className="text-[10px] font-medium uppercase text-muted-foreground mb-0.5">
                Data Source
              </p>
              <p className="text-xs">{dataSource}</p>
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function ChartWrapper({
  title,
  children,
  subtitle,
  explanation,
  formula,
  dataSource,
  confidenceMetrics,
  confidenceThreshold,
  legend,
  timeRange,
  lastUpdated,
  isEmpty,
  emptyMessage,
  onRetry,
  action,
  className,
  height,
  compact = false,
  noPadding = false,
}: ChartWrapperProps) {
  const explanationObj = typeof explanation === 'string' 
    ? { short: explanation } 
    : explanation;

  const formatLastUpdated = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 5) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden border-border/40 bg-gradient-to-b from-card to-card/95",
        "shadow-sm hover:shadow-md transition-all duration-300",
        className
      )}
    >
      <CardHeader className={cn(
        "border-b border-border/30",
        compact ? "pb-2 pt-3 px-4" : "pb-3"
      )}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Title row */}
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={cn(
                "font-display font-semibold text-foreground truncate",
                compact ? "text-sm" : "text-base"
              )}>
                {title}
              </h3>
              
              <ChartInfoTooltip 
                formula={formula}
                dataSource={dataSource}
                methodology={explanationObj?.methodology}
                detailed={explanationObj?.detailed}
              />
              
              {timeRange && (
                <Badge variant="secondary" className="text-[10px] font-medium shrink-0">
                  {timeRange}
                </Badge>
              )}
            </div>
            
            {/* Subtitle */}
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {subtitle}
              </p>
            )}
          </div>
          
          {/* Right side: confidence badge + action */}
          <div className="flex items-center gap-2 shrink-0">
            {confidenceMetrics && (
              <DataConfidenceBadge 
                metrics={confidenceMetrics}
                threshold={confidenceThreshold}
                showDetails={false}
              />
            )}
            
            {lastUpdated && (
              <span className="text-[10px] text-muted-foreground/70">
                {formatLastUpdated(lastUpdated)}
              </span>
            )}
            
            {action}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className={cn(
        noPadding ? "p-0" : compact ? "pt-3 px-4 pb-3" : "pt-4"
      )}>
        {isEmpty ? (
          <ChartEmptyState message={emptyMessage} onRetry={onRetry} />
        ) : (
          <div style={height !== 'auto' ? { minHeight: height || 'auto' } : undefined}>
            {children}
          </div>
        )}
        
        {/* Legend */}
        {!isEmpty && legend && legend.length > 0 && (
          <ChartLegend items={legend} />
        )}
        
        {/* Explanation microcopy */}
        {!isEmpty && explanationObj?.short && (
          <p className="text-[11px] text-muted-foreground/80 mt-3 pt-2 border-t border-border/20 text-center italic">
            {explanationObj.short}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Pre-defined chart explanations for reuse
export const CHART_EXPLANATIONS = {
  utilizationTrend: {
    short: 'Shows how benefit usage changes over time relative to entitlements.',
    detailed: 'Utilization is calculated as the ratio of claimed amounts to total entitled amounts across all active employees.',
    methodology: 'Monthly average of (claimed / entitled) × 100',
  },
  spendDistribution: {
    short: 'Breakdown of how benefits budget is allocated across categories.',
    detailed: 'Each segment represents the percentage of total annual spend going to that benefit category.',
  },
  claimsVolume: {
    short: 'Total number of claims submitted and processed over time.',
    methodology: 'Count of claims grouped by submission date',
  },
  satisfactionScore: {
    short: 'Employee satisfaction with benefits program based on survey responses.',
    detailed: 'ESAT scores are collected through quarterly pulse surveys with a 1-5 rating scale.',
    methodology: '(Sum of ratings / Total responses) × 20 to get percentage',
  },
  benchmarkComparison: {
    short: 'How your organization compares to industry and regional peers.',
    detailed: 'Benchmarks are derived from anonymized aggregates of similar organizations.',
    methodology: 'Peer group median values with ±10% confidence bands',
  },
  vendorPerformance: {
    short: 'Redemption and engagement metrics for marketplace offers.',
    methodology: 'Views, clicks, and completed redemptions tracked per offer',
  },
} as const;

export default ChartWrapper;
