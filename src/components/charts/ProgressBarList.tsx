import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ProgressItem {
  name: string;
  value: number;
  maxValue?: number;
  color?: 'success' | 'warning' | 'danger' | 'accent' | 'primary';
  suffix?: string;
}

interface ProgressBarListProps {
  items: ProgressItem[];
  showValue?: boolean;
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const colorClasses = {
  success: 'text-emerald-600',
  warning: 'text-amber-600',
  danger: 'text-red-600',
  accent: 'text-accent',
  primary: 'text-primary'
};

const progressColors = {
  success: '[&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-emerald-400',
  warning: '[&>div]:bg-gradient-to-r [&>div]:from-amber-500 [&>div]:to-amber-400',
  danger: '[&>div]:bg-gradient-to-r [&>div]:from-red-500 [&>div]:to-red-400',
  accent: '[&>div]:bg-gradient-to-r [&>div]:from-accent [&>div]:to-accent/80',
  primary: '[&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-primary/80'
};

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3'
};

export function ProgressBarList({ 
  items, 
  showValue = true, 
  animated = true,
  size = 'md'
}: ProgressBarListProps) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const percentage = item.maxValue ? (item.value / item.maxValue) * 100 : item.value;
        const color = item.color || (percentage >= 70 ? 'success' : percentage >= 40 ? 'warning' : 'danger');
        
        return (
          <div 
            key={item.name} 
            className={cn(
              "space-y-2 group",
              animated && "animate-fade-in"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-foreground group-hover:text-accent transition-colors">
                {item.name}
              </span>
              {showValue && (
                <span className={cn("font-semibold tabular-nums", colorClasses[color])}>
                  {item.value}{item.suffix || '%'}
                </span>
              )}
            </div>
            <div className="relative">
              <Progress 
                value={percentage} 
                className={cn(
                  sizeClasses[size],
                  "bg-muted/50",
                  progressColors[color],
                  "transition-all duration-500"
                )}
              />
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
