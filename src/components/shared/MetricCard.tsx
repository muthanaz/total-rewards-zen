import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  iconClassName?: string;
  subtitle?: string;
  trend?: {
    value: number;
    label?: string;
    higherIsBetter?: boolean;
  };
  tooltip?: {
    formula?: string;
    dataSource?: string;
    notes?: string;
  };
  badge?: ReactNode;
  footer?: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'gradient' | 'outline';
  size?: 'default' | 'compact' | 'large';
}

const variantStyles = {
  default: 'bg-card border-border/50',
  gradient: 'bg-gradient-to-br from-card to-accent/5 border-border/50',
  outline: 'bg-transparent border-border',
};

const sizeStyles = {
  default: { card: 'p-5', value: 'text-2xl lg:text-3xl', icon: 'p-2.5', iconSize: 'w-5 h-5' },
  compact: { card: 'p-4', value: 'text-xl lg:text-2xl', icon: 'p-2', iconSize: 'w-4 h-4' },
  large: { card: 'p-6', value: 'text-3xl lg:text-4xl', icon: 'p-3', iconSize: 'w-6 h-6' },
};

export function MetricCard({
  title,
  value,
  icon: Icon,
  iconClassName,
  subtitle,
  trend,
  tooltip,
  badge,
  footer,
  onClick,
  className,
  variant = 'default',
  size = 'default',
}: MetricCardProps) {
  const sizes = sizeStyles[size];
  
  const getTrendColor = () => {
    if (!trend) return '';
    if (trend.value === 0) return 'text-muted-foreground';
    const isPositive = trend.value > 0;
    const isGood = trend.higherIsBetter !== false ? isPositive : !isPositive;
    return isGood ? 'text-success' : 'text-destructive';
  };

  const TrendIcon = !trend ? null : trend.value > 0 ? TrendingUp : trend.value < 0 ? TrendingDown : Minus;

  return (
    <Card 
      className={cn(
        'border transition-all duration-200',
        variantStyles[variant],
        onClick && 'cursor-pointer hover:shadow-md hover:border-accent/30',
        className
      )}
      onClick={onClick}
    >
      <CardContent className={sizes.card}>
        {/* Header with Icon and Badge/Tooltip */}
        <div className="flex items-start justify-between mb-3">
          {Icon && (
            <div className={cn(
              "rounded-xl",
              sizes.icon,
              iconClassName || "bg-primary/10"
            )}>
              <Icon className={cn(sizes.iconSize, iconClassName ? '' : "text-primary")} />
            </div>
          )}
          <div className="flex items-center gap-2">
            {badge}
            {tooltip && (
              <InfoTooltip 
                formula={tooltip.formula}
                dataSource={tooltip.dataSource}
                notes={tooltip.notes}
              />
            )}
          </div>
        </div>

        {/* Value */}
        <p className={cn("font-bold tracking-tight", sizes.value)}>{value}</p>
        
        {/* Title */}
        <p className="text-sm text-muted-foreground mt-1">{title}</p>

        {/* Trend */}
        {trend && (
          <div className="flex items-center gap-1.5 mt-2">
            {TrendIcon && <TrendIcon className={cn("w-4 h-4", getTrendColor())} />}
            <span className={cn("text-sm font-medium", getTrendColor())}>
              {trend.value > 0 ? '+' : ''}{trend.value}%
            </span>
            {trend.label && (
              <span className="text-xs text-muted-foreground">{trend.label}</span>
            )}
          </div>
        )}

        {/* Subtitle */}
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>
        )}

        {/* Footer */}
        {footer && (
          <div className="mt-3 pt-3 border-t border-border/50">
            {footer}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Compact inline stat for use within cards
interface InlineStatProps {
  label: string;
  value: string | number;
  valueClassName?: string;
}

export function InlineStat({ label, value, valueClassName }: InlineStatProps) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-medium", valueClassName)}>{value}</span>
    </div>
  );
}

// Grid wrapper for consistent metric layouts
interface MetricGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4 | 5;
  className?: string;
}

export function MetricGrid({ children, columns = 4, className }: MetricGridProps) {
  const colClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-2 lg:grid-cols-5',
  };

  return (
    <div className={cn('grid gap-4', colClasses[columns], className)}>
      {children}
    </div>
  );
}
