/**
 * Percentile Band Chart
 * 
 * Displays benchmarks as P25/P50/P75 bands with organization position.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react';
import { cn, formatCurrencyAED, formatPercent } from '@/lib/utils';
import { BenchmarkMetric } from './types';
import { motion } from 'framer-motion';

interface PercentileBandChartProps {
  metric: BenchmarkMetric;
  onClick?: () => void;
  isSelected?: boolean;
}

function formatValue(value: number, unit: BenchmarkMetric['unit']): string {
  switch (unit) {
    case 'currency':
      return formatCurrencyAED(value, { abbreviate: true });
    case 'percent':
      return formatPercent(value);
    case 'days':
      return `${value.toFixed(1)} days`;
    case 'ratio':
      return value.toFixed(2);
    case 'count':
      return value.toLocaleString();
    default:
      return String(value);
  }
}

function getPercentilePosition(percentile: number): number {
  // Map 0-100 percentile to 0-100% position
  return Math.max(2, Math.min(98, percentile));
}

function getPercentileLabel(percentile: number): string {
  if (percentile <= 25) return 'Bottom Quartile';
  if (percentile <= 50) return 'Below Median';
  if (percentile <= 75) return 'Above Median';
  return 'Top Quartile';
}

function getPercentileColor(percentile: number, metric: BenchmarkMetric): string {
  // For metrics where lower is better (like cycle time), invert the logic
  const isLowerBetter = metric.unit === 'days' || metric.key.includes('cost') || metric.key.includes('spend');
  
  if (isLowerBetter) {
    if (percentile <= 25) return 'text-success';
    if (percentile <= 50) return 'text-foreground';
    if (percentile <= 75) return 'text-warning';
    return 'text-destructive';
  }
  
  if (percentile <= 25) return 'text-destructive';
  if (percentile <= 50) return 'text-warning';
  if (percentile <= 75) return 'text-foreground';
  return 'text-success';
}

export function PercentileBandChart({ metric, onClick, isSelected }: PercentileBandChartProps) {
  const { percentileBand, yourValue, yourPercentile } = metric;
  const position = getPercentilePosition(yourPercentile);
  
  const TrendIcon = metric.trend === 'improving' ? TrendingUp : 
                    metric.trend === 'declining' ? TrendingDown : Minus;
  
  const trendColor = metric.trend === 'improving' ? 'text-success' : 
                     metric.trend === 'declining' ? 'text-warning' : 'text-muted-foreground';

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all hover:border-accent/50 hover:shadow-md",
        isSelected && "ring-2 ring-accent border-accent"
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {metric.name}
              <InfoTooltip notes={metric.description} />
            </CardTitle>
            <p className="text-xs text-muted-foreground">{metric.description}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Your Value Display */}
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-2xl font-bold tabular-nums">
              {formatValue(yourValue, metric.unit)}
            </span>
            <Badge 
              variant="outline" 
              className={cn("ml-2 text-[10px]", getPercentileColor(yourPercentile, metric))}
            >
              P{yourPercentile}
            </Badge>
          </div>
          {metric.trend && (
            <div className={cn("flex items-center gap-1 text-xs", trendColor)}>
              <TrendIcon className="h-3 w-3" />
              {metric.trendValue && (
                <span>{metric.trendValue > 0 ? '+' : ''}{metric.trendValue}%</span>
              )}
            </div>
          )}
        </div>

        {/* Percentile Band Visualization */}
        <div className="space-y-2">
          <div className="relative h-8">
            {/* Background bands */}
            <div className="absolute inset-0 flex rounded-md overflow-hidden">
              <div className="w-1/4 bg-destructive/20" title="P0-P25" />
              <div className="w-1/4 bg-warning/20" title="P25-P50" />
              <div className="w-1/4 bg-muted" title="P50-P75" />
              <div className="w-1/4 bg-success/20" title="P75-P100" />
            </div>
            
            {/* Percentile markers */}
            <div className="absolute inset-0">
              {/* P25 line */}
              <div 
                className="absolute top-0 bottom-0 w-px bg-border"
                style={{ left: '25%' }}
              />
              {/* P50 line (Median) */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-foreground/40"
                style={{ left: '50%' }}
              />
              {/* P75 line */}
              <div 
                className="absolute top-0 bottom-0 w-px bg-border"
                style={{ left: '75%' }}
              />
            </div>

            {/* Your position marker */}
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 z-10"
              style={{ left: `${position}%` }}
              initial={{ scale: 0, x: '-50%' }}
              animate={{ scale: 1, x: '-50%' }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <div className="relative">
                <div className="w-4 h-4 rounded-full bg-accent border-2 border-background shadow-md" />
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-medium whitespace-nowrap bg-accent text-accent-foreground px-1.5 py-0.5 rounded">
                  You
                </div>
              </div>
            </motion.div>
          </div>

          {/* Legend */}
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>P25: {formatValue(percentileBand.p25, metric.unit)}</span>
            <span className="font-medium">P50: {formatValue(percentileBand.p50, metric.unit)}</span>
            <span>P75: {formatValue(percentileBand.p75, metric.unit)}</span>
          </div>
        </div>

        {/* Status Label */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <span className="text-xs text-muted-foreground">Position:</span>
          <Badge 
            variant="secondary" 
            className={cn("text-[10px]", getPercentileColor(yourPercentile, metric))}
          >
            {getPercentileLabel(yourPercentile)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
