import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

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
  index?: number;
  secondaryValue?: string | null;
  compact?: boolean;
  highlight?: boolean;
}

const variantStyles: Record<CardVariant, { bg: string; iconBg: string; iconColor: string; valueColor: string; border: string; glow: string }> = {
  primary: {
    bg: 'bg-gradient-to-br from-accent/10 via-card to-card dark:from-accent/20 dark:via-card dark:to-card',
    iconBg: 'bg-accent/15 dark:bg-accent/25',
    iconColor: 'text-accent',
    valueColor: 'text-foreground',
    border: 'border-accent/20 hover:border-accent/40 dark:border-accent/30 dark:hover:border-accent/50',
    glow: 'bg-accent',
  },
  utilized: {
    bg: 'bg-gradient-to-br from-info/10 via-card to-card dark:from-info/20 dark:via-card dark:to-card',
    iconBg: 'bg-info/15 dark:bg-info/25',
    iconColor: 'text-info',
    valueColor: 'text-info',
    border: 'border-info/20 hover:border-info/40 dark:border-info/30 dark:hover:border-info/50',
    glow: 'bg-info',
  },
  remaining: {
    bg: 'bg-gradient-to-br from-success/10 via-card to-card dark:from-success/20 dark:via-card dark:to-card',
    iconBg: 'bg-success/15 dark:bg-success/25',
    iconColor: 'text-success',
    valueColor: 'text-success',
    border: 'border-success/20 hover:border-success/40 dark:border-success/30 dark:hover:border-success/50',
    glow: 'bg-success',
  },
  utilization: {
    bg: 'bg-gradient-to-br from-chart-3/10 via-card to-card dark:from-chart-3/20 dark:via-card dark:to-card',
    iconBg: 'bg-chart-3/15 dark:bg-chart-3/25',
    iconColor: 'text-chart-3',
    valueColor: 'text-chart-3',
    border: 'border-chart-3/20 hover:border-chart-3/40 dark:border-chart-3/30 dark:hover:border-chart-3/50',
    glow: 'bg-chart-3',
  },
  info: {
    bg: 'bg-gradient-to-br from-warning/10 via-card to-card dark:from-warning/20 dark:via-card dark:to-card',
    iconBg: 'bg-warning/15 dark:bg-warning/25',
    iconColor: 'text-warning',
    valueColor: 'text-warning',
    border: 'border-warning/20 hover:border-warning/40 dark:border-warning/30 dark:hover:border-warning/50',
    glow: 'bg-warning',
  },
};

const progressColors: Record<CardVariant, string> = {
  primary: '[&>div]:bg-accent',
  utilized: '[&>div]:bg-info',
  remaining: '[&>div]:bg-success',
  utilization: '[&>div]:bg-chart-3',
  info: '[&>div]:bg-warning',
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
  index = 0,
  secondaryValue,
  compact = false,
  highlight = false,
}: SummaryStatsCardProps) {
  const styles = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.3, 
        delay: index * 0.03,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
    >
      <Card
        className={cn(
          'relative overflow-hidden rounded-lg transition-all duration-300 shadow-sm hover:shadow-md dark:shadow-none dark:hover:shadow-md dark:hover:shadow-black/20 h-full flex flex-col',
          compact ? 'p-2.5' : 'p-4',
          styles.bg,
          styles.border,
          highlight && 'ring-2 ring-accent/30 shadow-lg',
          className
        )}
      >
        {/* Decorative corner accent with glow effect */}
        <div className={cn(
          'absolute top-0 right-0 opacity-[0.06] dark:opacity-[0.12] -translate-y-1/2 translate-x-1/2 rounded-full blur-xl',
          compact ? 'w-12 h-12' : 'w-20 h-20',
          styles.glow,
        )} />

        <div className="flex items-start justify-between relative z-10 gap-1">
          <motion.div 
            className={cn(
              'rounded-lg shrink-0',
              compact ? 'p-1.5' : 'p-2',
              styles.iconBg
            )}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Icon className={cn(compact ? 'w-3 h-3' : 'w-4 h-4', styles.iconColor)} />
          </motion.div>
          {formula && !compact && (
            <InfoTooltip formula={formula} dataSource={dataSource} />
          )}
        </div>
        
        <div className={cn(compact ? 'mt-1.5' : 'mt-2', 'flex-1 flex flex-col justify-center')}>
          <motion.p 
            className={cn(
              'font-bold tracking-tight truncate',
              compact ? (highlight ? 'text-base' : 'text-sm') : 'text-xl',
              highlight && 'text-foreground',
              !highlight && styles.valueColor
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.03 + 0.1, duration: 0.2 }}
          >
            {value}
          </motion.p>
          {secondaryValue && (
            <motion.p
              className={cn(
                'text-muted-foreground/70 font-medium truncate',
                compact ? 'text-[9px] mt-0.5' : 'text-[10px] mt-0.5'
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.03 + 0.15, duration: 0.2 }}
            >
              {secondaryValue}
            </motion.p>
          )}
        </div>
        <p className={cn(
          'text-muted-foreground font-medium uppercase tracking-wide truncate',
          compact ? 'text-[8px] mt-1 leading-tight' : 'text-[10px] mt-1'
        )}>
          {label}
        </p>
        
        {progress !== undefined && !compact && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: index * 0.03 + 0.2, duration: 0.4, ease: "easeOut" }}
            style={{ transformOrigin: 'left' }}
          >
            <Progress 
              value={progress} 
              className={cn('h-1 mt-2', progressColors[variant])} 
            />
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}
