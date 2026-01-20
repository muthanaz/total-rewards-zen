import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn, formatCurrencyAED, formatPercent, formatInteger } from '@/lib/utils';

interface TrendIndicatorProps {
  currentValue: number;
  previousValue: number;
  format?: 'percent' | 'number' | 'currency';
  showLabel?: boolean;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function TrendIndicator({
  currentValue,
  previousValue,
  format = 'percent',
  showLabel = true,
  label = 'vs last month',
  size = 'sm',
  className,
}: TrendIndicatorProps) {
  const difference = currentValue - previousValue;
  const percentChange = previousValue !== 0 
    ? Math.round((difference / previousValue) * 100) 
    : 0;

  const isPositive = difference > 0;
  const isNegative = difference < 0;
  const isNeutral = difference === 0;

  const formatValue = () => {
    const absChange = Math.abs(percentChange);
    if (format === 'percent') {
      return formatPercent(absChange);
    } else if (format === 'currency') {
      return formatCurrencyAED(Math.abs(difference), { abbreviate: false });
    }
    return formatInteger(Math.abs(difference));
  };

  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs';

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {isPositive && (
        <>
          <TrendingUp className={cn(iconSize, "text-emerald-500")} />
          <span className={cn(textSize, "font-medium text-emerald-600")}>
            +{formatValue()}
          </span>
        </>
      )}
      {isNegative && (
        <>
          <TrendingDown className={cn(iconSize, "text-red-500")} />
          <span className={cn(textSize, "font-medium text-red-600")}>
            -{formatValue()}
          </span>
        </>
      )}
      {isNeutral && (
        <>
          <Minus className={cn(iconSize, "text-muted-foreground")} />
          <span className={cn(textSize, "text-muted-foreground")}>
            0%
          </span>
        </>
      )}
      {showLabel && (
        <span className={cn(textSize, "text-muted-foreground ml-0.5")}>
          {label}
        </span>
      )}
    </div>
  );
}
