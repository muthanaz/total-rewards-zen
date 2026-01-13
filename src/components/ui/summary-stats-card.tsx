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
    bg: 'bg-gradient-to-br from-blue-500/10 via-card to-card dark:from-blue-500/20 dark:via-card dark:to-card',
    iconBg: 'bg-blue-500/15 dark:bg-blue-500/25',
    iconColor: 'text-blue-500 dark:text-blue-400',
    valueColor: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/20 hover:border-blue-500/40 dark:border-blue-500/30 dark:hover:border-blue-500/50',
    glow: 'bg-blue-500',
  },
  remaining: {
    bg: 'bg-gradient-to-br from-emerald-500/10 via-card to-card dark:from-emerald-500/20 dark:via-card dark:to-card',
    iconBg: 'bg-emerald-500/15 dark:bg-emerald-500/25',
    iconColor: 'text-emerald-500 dark:text-emerald-400',
    valueColor: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/20 hover:border-emerald-500/40 dark:border-emerald-500/30 dark:hover:border-emerald-500/50',
    glow: 'bg-emerald-500',
  },
  utilization: {
    bg: 'bg-gradient-to-br from-purple-500/10 via-card to-card dark:from-purple-500/20 dark:via-card dark:to-card',
    iconBg: 'bg-purple-500/15 dark:bg-purple-500/25',
    iconColor: 'text-purple-500 dark:text-purple-400',
    valueColor: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-500/20 hover:border-purple-500/40 dark:border-purple-500/30 dark:hover:border-purple-500/50',
    glow: 'bg-purple-500',
  },
  info: {
    bg: 'bg-gradient-to-br from-amber-500/10 via-card to-card dark:from-amber-500/20 dark:via-card dark:to-card',
    iconBg: 'bg-amber-500/15 dark:bg-amber-500/25',
    iconColor: 'text-amber-500 dark:text-amber-400',
    valueColor: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/20 hover:border-amber-500/40 dark:border-amber-500/30 dark:hover:border-amber-500/50',
    glow: 'bg-amber-500',
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
  index = 0,
  secondaryValue,
}: SummaryStatsCardProps) {
  const styles = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
    >
      <Card
        className={cn(
          'relative overflow-hidden rounded-xl p-5 transition-all duration-300 shadow-sm hover:shadow-lg dark:shadow-none dark:hover:shadow-lg dark:hover:shadow-black/20',
          styles.bg,
          styles.border,
          className
        )}
      >
        {/* Decorative corner accent with glow effect */}
        <div className={cn(
          'absolute top-0 right-0 w-24 h-24 opacity-[0.08] dark:opacity-[0.15] -translate-y-1/2 translate-x-1/2 rounded-full blur-2xl',
          styles.glow,
        )} />
        <div className={cn(
          'absolute top-0 right-0 w-16 h-16 opacity-[0.04] dark:opacity-[0.08] -translate-y-1/3 translate-x-1/3 rounded-full',
          styles.glow,
        )} />

        <div className="flex items-start justify-between relative z-10">
          <motion.div 
            className={cn('p-2.5 rounded-xl', styles.iconBg)}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Icon className={cn('w-4 h-4', styles.iconColor)} />
          </motion.div>
          {formula && (
            <InfoTooltip formula={formula} dataSource={dataSource} />
          )}
        </div>
        
        <div className="mt-3">
          <motion.p 
            className={cn('text-2xl font-bold tracking-tight', styles.valueColor)}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 + 0.2, duration: 0.3 }}
          >
            {value}
          </motion.p>
          {secondaryValue && (
            <motion.p
              className="text-xs text-muted-foreground/80 mt-0.5 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.3, duration: 0.3 }}
            >
              {secondaryValue}
            </motion.p>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1 font-medium uppercase tracking-wide">
          {label}
        </p>
        
        {progress !== undefined && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: index * 0.1 + 0.3, duration: 0.5, ease: "easeOut" }}
            style={{ transformOrigin: 'left' }}
          >
            <Progress 
              value={progress} 
              className={cn('h-1.5 mt-3', progressColors[variant])} 
            />
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}
