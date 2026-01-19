import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrendComparisonProps {
  current: number;
  previous: number;
  format?: 'percent' | 'currency' | 'number';
  higherIsBetter?: boolean;
  showPrevious?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export function TrendComparison({
  current,
  previous,
  format = 'percent',
  higherIsBetter = true,
  showPrevious = false,
  className,
  size = 'sm',
}: TrendComparisonProps) {
  const change = previous !== 0 ? ((current - previous) / previous) * 100 : 0;
  const isPositive = change > 0;
  const isNeutral = Math.abs(change) < 0.5;
  
  // Determine if the trend is good or bad
  const isGood = isNeutral ? null : (higherIsBetter ? isPositive : !isPositive);

  const formatValue = (value: number): string => {
    switch (format) {
      case 'currency':
        return `AED ${(value / 1000).toFixed(0)}K`;
      case 'percent':
        return `${value.toFixed(1)}%`;
      default:
        return value.toLocaleString();
    }
  };

  const Icon = isNeutral ? Minus : (isPositive ? TrendingUp : TrendingDown);
  
  const colorClass = isNeutral 
    ? 'text-muted-foreground' 
    : isGood 
      ? 'text-success' 
      : 'text-destructive';

  const bgClass = isNeutral
    ? 'bg-muted/50'
    : isGood
      ? 'bg-success/10'
      : 'bg-destructive/10';

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className={cn(
        "flex items-center gap-1 px-1.5 py-0.5 rounded-md",
        bgClass,
        size === 'sm' ? 'text-[10px]' : 'text-xs'
      )}>
        <Icon className={cn(
          colorClass,
          size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'
        )} />
        <span className={cn("font-medium", colorClass)}>
          {isPositive ? '+' : ''}{change.toFixed(1)}%
        </span>
      </div>
      
      {showPrevious && (
        <span className="text-xs text-muted-foreground">
          vs {formatValue(previous)}
        </span>
      )}
    </div>
  );
}

// Compact trend indicator for cards
export function TrendIndicatorCompact({
  change,
  higherIsBetter = true,
  label,
  className,
}: {
  change: number;
  higherIsBetter?: boolean;
  label?: string;
  className?: string;
}) {
  const isPositive = change > 0;
  const isNeutral = Math.abs(change) < 0.5;
  const isGood = isNeutral ? null : (higherIsBetter ? isPositive : !isPositive);

  const Icon = isNeutral ? Minus : (isPositive ? TrendingUp : TrendingDown);
  
  const colorClass = isNeutral 
    ? 'text-muted-foreground' 
    : isGood 
      ? 'text-success' 
      : 'text-destructive';

  return (
    <div className={cn("flex items-center gap-1 text-xs", colorClass, className)}>
      <Icon className="w-3 h-3" />
      <span className="font-medium">
        {isPositive ? '+' : ''}{change.toFixed(1)}%
      </span>
      {label && <span className="text-muted-foreground">{label}</span>}
    </div>
  );
}
