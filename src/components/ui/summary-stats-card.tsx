import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

type CardVariant = 'primary' | 'utilized' | 'remaining' | 'utilization' | 'info';

interface SummaryStatsCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
  formula?: string;
  dataSource?: string;
  variant?: CardVariant;
  progress?: number;
  className?: string;
}

const variantStyles: Record<CardVariant, { bg: string; iconBg: string; iconColor: string; valueColor: string; border: string }> = {
  primary: {
    bg: 'bg-gradient-to-br from-accent/5 via-card to-card',
    iconBg: 'bg-accent/15',
    iconColor: 'text-accent',
    valueColor: 'text-foreground',
    border: 'border-accent/20 hover:border-accent/40',
  },
  utilized: {
    bg: 'bg-gradient-to-br from-blue-500/5 via-card to-card',
    iconBg: 'bg-blue-500/15',
    iconColor: 'text-blue-500',
    valueColor: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/20 hover:border-blue-500/40',
  },
  remaining: {
    bg: 'bg-gradient-to-br from-emerald-500/5 via-card to-card',
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-500',
    valueColor: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/20 hover:border-emerald-500/40',
  },
  utilization: {
    bg: 'bg-gradient-to-br from-purple-500/5 via-card to-card',
    iconBg: 'bg-purple-500/15',
    iconColor: 'text-purple-500',
    valueColor: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-500/20 hover:border-purple-500/40',
  },
  info: {
    bg: 'bg-gradient-to-br from-amber-500/5 via-card to-card',
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-500',
    valueColor: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/20 hover:border-amber-500/40',
  },
};

const progressColors: Record<CardVariant, string> = {
  primary: '[&>div]:bg-accent',
  utilized: '[&>div]:bg-blue-500',
  remaining: '[&>div]:bg-emerald-500',
  utilization: '[&>div]:bg-purple-500',
  info: '[&>div]:bg-amber-500',
};

export function SummaryStatsCard({
  icon: Icon,
  value,
  label,
  formula,
  dataSource,
  variant = 'primary',
  progress,
  className,
}: SummaryStatsCardProps) {
  const styles = variantStyles[variant];

  return (
    <Card
      className={cn(
        'relative overflow-hidden rounded-xl p-5 transition-all duration-300 shadow-sm hover:shadow-md',
        styles.bg,
        styles.border,
        className
      )}
    >
      {/* Decorative corner accent */}
      <div className={cn(
        'absolute top-0 right-0 w-20 h-20 opacity-[0.03] -translate-y-1/2 translate-x-1/2 rounded-full',
        variant === 'primary' && 'bg-accent',
        variant === 'utilized' && 'bg-blue-500',
        variant === 'remaining' && 'bg-emerald-500',
        variant === 'utilization' && 'bg-purple-500',
        variant === 'info' && 'bg-amber-500',
      )} />

      <div className="flex items-start justify-between relative z-10">
        <div className={cn('p-2 rounded-lg', styles.iconBg)}>
          <Icon className={cn('w-4 h-4', styles.iconColor)} />
        </div>
        {formula && (
          <InfoTooltip formula={formula} dataSource={dataSource} />
        )}
      </div>
      
      <p className={cn('text-xl font-bold mt-3 tracking-tight', styles.valueColor)}>
        {value}
      </p>
      <p className="text-xs text-muted-foreground mt-1 font-medium uppercase tracking-wide">
        {label}
      </p>
      
      {progress !== undefined && (
        <Progress 
          value={progress} 
          className={cn('h-1.5 mt-3', progressColors[variant])} 
        />
      )}
    </Card>
  );
}
