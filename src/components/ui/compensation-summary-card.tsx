import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface MetricRow {
  label: string;
  value: string;
  secondary?: string;
}

interface CompensationSummaryCardProps {
  icon: LucideIcon;
  title: string;
  metrics: MetricRow[];
  variant?: 'salary' | 'benefits' | 'utilization';
  className?: string;
  index?: number;
}

const variantStyles = {
  salary: {
    bg: 'bg-gradient-to-br from-accent/15 via-card to-card dark:from-accent/25',
    iconBg: 'bg-accent/20 dark:bg-accent/30',
    iconColor: 'text-accent',
    border: 'border-accent/30 hover:border-accent/50',
    glow: 'bg-accent',
  },
  benefits: {
    bg: 'bg-gradient-to-br from-purple-500/15 via-card to-card dark:from-purple-500/25',
    iconBg: 'bg-purple-500/20 dark:bg-purple-500/30',
    iconColor: 'text-purple-500 dark:text-purple-400',
    border: 'border-purple-500/30 hover:border-purple-500/50',
    glow: 'bg-purple-500',
  },
  utilization: {
    bg: 'bg-gradient-to-br from-blue-500/15 via-card to-card dark:from-blue-500/25',
    iconBg: 'bg-blue-500/20 dark:bg-blue-500/30',
    iconColor: 'text-blue-500 dark:text-blue-400',
    border: 'border-blue-500/30 hover:border-blue-500/50',
    glow: 'bg-blue-500',
  },
};

export function CompensationSummaryCard({
  icon: Icon,
  title,
  metrics,
  variant = 'salary',
  className,
  index = 0,
}: CompensationSummaryCardProps) {
  const styles = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.3, 
        delay: index * 0.05,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className="h-full"
    >
      <Card
        className={cn(
          'relative overflow-hidden rounded-xl transition-all duration-300 shadow-md hover:shadow-lg dark:shadow-none dark:hover:shadow-lg dark:hover:shadow-black/30 h-full p-4',
          styles.bg,
          styles.border,
          'ring-1 ring-white/10',
          className
        )}
      >
        {/* Decorative glow */}
        <div className={cn(
          'absolute top-0 right-0 w-24 h-24 opacity-[0.08] dark:opacity-[0.15] -translate-y-1/2 translate-x-1/2 rounded-full blur-2xl',
          styles.glow,
        )} />

        {/* Header */}
        <div className="flex items-center gap-2 mb-3 relative z-10">
          <div className={cn('p-2 rounded-lg shrink-0', styles.iconBg)}>
            <Icon className={cn('w-4 h-4', styles.iconColor)} />
          </div>
          <h3 className="font-semibold text-sm text-foreground/80 uppercase tracking-wide">
            {title}
          </h3>
        </div>

        {/* Metrics */}
        <div className="space-y-2 relative z-10">
          {metrics.map((metric, idx) => (
            <div key={idx} className="flex items-baseline justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xl md:text-2xl font-bold text-foreground tracking-tight truncate">
                  {metric.value}
                </p>
                {metric.secondary && (
                  <span className="text-xs font-medium text-muted-foreground/80 ml-1">
                    {metric.secondary}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide shrink-0 text-right">
                {metric.label}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
