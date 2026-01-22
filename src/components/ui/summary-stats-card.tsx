import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LucideIcon, Info, Clock, Database } from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  DataProvenance, 
  SOURCE_TYPE_LABELS, 
  CONFIDENCE_COLORS,
  getFreshnessLabel,
} from '@/lib/dataProvenance';

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
  /** Data provenance for Trust Layer */
  provenance?: DataProvenance;
  /** Mark value as estimate */
  isEstimate?: boolean;
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
  provenance,
  isEstimate = false,
}: SummaryStatsCardProps) {
  const styles = variantStyles[variant];
  const showProvenance = provenance && !compact;
  const confidenceColors = provenance ? CONFIDENCE_COLORS[provenance.confidence_level] : null;

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
          <div className="flex items-center gap-1">
            {/* Estimate badge */}
            {isEstimate && !compact && (
              <Badge 
                variant="outline" 
                className="text-[9px] px-1 py-0 bg-amber-500/10 text-amber-600 border-amber-500/20"
              >
                Est.
              </Badge>
            )}
            {/* Provenance indicator */}
            {showProvenance && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs p-3 space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Database className="h-3.5 w-3.5 shrink-0" />
                      <span className="font-medium">
                        {provenance.source_label || SOURCE_TYPE_LABELS[provenance.source_type]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span>Updated: {getFreshnessLabel(provenance)}</span>
                    </div>
                    {confidenceColors && (
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          'h-2 w-2 rounded-full shrink-0',
                          provenance.confidence_level === 'high' && 'bg-emerald-500',
                          provenance.confidence_level === 'medium' && 'bg-amber-500',
                          provenance.confidence_level === 'low' && 'bg-red-500'
                        )} />
                        <span className="capitalize">{provenance.confidence_level} confidence</span>
                      </div>
                    )}
                    {provenance.assumptions && provenance.assumptions.length > 0 && (
                      <div className="pt-1 border-t text-muted-foreground">
                        <span className="font-medium">Assumptions:</span>
                        <ul className="mt-1 space-y-0.5">
                          {provenance.assumptions.map((a, i) => (
                            <li key={i}>• {a}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {/* Original formula tooltip */}
            {formula && !compact && !showProvenance && (
              <InfoTooltip formula={formula} dataSource={dataSource} />
            )}
          </div>
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
