import { Card } from '@/components/ui/card';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface BenefitsUtilizationCardProps {
  utilization: {
    used: string;
    usedPercent: number;
    remaining: string;
    remainingPercent: number;
    formula: string;
    dataSource: string;
    totalLabel?: string;
  };
  isRTL?: boolean;
  salaryHidden?: boolean;
}

// Get color scheme based on utilization percentage
function getUtilizationColorScheme(percent: number) {
  if (percent >= 70) {
    return {
      border: 'border-emerald-200/50 dark:border-emerald-500/15',
      bg: 'bg-emerald-50/20 dark:bg-emerald-900/5',
      progressBg: 'bg-emerald-100/30 dark:bg-emerald-900/15',
      progressFill: 'bg-emerald-400/80',
      usedDot: 'bg-emerald-400',
      remainingDot: 'bg-emerald-200/80 dark:bg-emerald-600/30',
      usedPercentText: 'text-emerald-500',
      remainingPercentText: 'text-emerald-400',
    };
  } else if (percent >= 30) {
    return {
      border: 'border-amber-200/50 dark:border-amber-500/15',
      bg: 'bg-amber-50/20 dark:bg-amber-900/5',
      progressBg: 'bg-amber-100/30 dark:bg-amber-900/15',
      progressFill: 'bg-amber-300/80',
      usedDot: 'bg-amber-400',
      remainingDot: 'bg-amber-200/80 dark:bg-amber-600/30',
      usedPercentText: 'text-amber-500',
      remainingPercentText: 'text-amber-400',
    };
  } else {
    return {
      border: 'border-red-200/50 dark:border-red-500/15',
      bg: 'bg-red-50/20 dark:bg-red-900/5',
      progressBg: 'bg-red-100/30 dark:bg-red-900/15',
      progressFill: 'bg-red-400/80',
      usedDot: 'bg-red-400',
      remainingDot: 'bg-red-200/80 dark:bg-red-600/30',
      usedPercentText: 'text-red-500',
      remainingPercentText: 'text-red-400',
    };
  }
}

export function BenefitsUtilizationCard({ utilization, isRTL = false, salaryHidden = false }: BenefitsUtilizationCardProps) {
  const colors = getUtilizationColorScheme(utilization.usedPercent);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.3 }}
    >
      <Card className={cn("relative border p-4", colors.border, colors.bg)}>
        {/* Header with total label and info tooltip */}
        <div className={cn("flex items-center justify-between mb-3", isRTL && "flex-row-reverse")}>
          <p className={cn("text-[11px] text-muted-foreground", isRTL && "text-right")}>
            {isRTL 
              ? 'من إجمالي قيمة المزايا (جميع المزايا)'
              : 'Of Total Benefits Value (All Benefits)'}
          </p>
          <InfoTooltip formula={utilization.formula} dataSource={utilization.dataSource} />
        </div>
        
        {/* Progress bar */}
        <div className={cn("relative h-2 rounded-full overflow-hidden mb-3", colors.progressBg)}>
          <motion.div 
            className={cn("absolute inset-y-0 left-0 rounded-full", colors.progressFill)}
            initial={{ width: 0 }}
            animate={{ width: `${utilization.usedPercent}%` }}
            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
          />
        </div>
        
        {/* Used and Remaining */}
        <div className={cn("grid grid-cols-2 gap-4", isRTL && "direction-rtl")}>
          <div className={cn("flex items-center gap-2.5", isRTL && "flex-row-reverse")}>
            <div className={cn("w-2.5 h-2.5 rounded-full", colors.usedDot)} />
            <div>
              <p className={cn(
                "text-sm font-bold text-foreground transition-all duration-200",
                salaryHidden && "blur-[4px] select-none"
              )}>
                {utilization.used}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {isRTL ? 'مستخدم' : 'Used'} <span className={cn(
                  "font-semibold",
                  colors.usedPercentText,
                  salaryHidden && "blur-[4px] select-none"
                )}>({utilization.usedPercent}%)</span>
              </p>
            </div>
          </div>
          <div className={cn("flex items-center gap-2.5", isRTL && "flex-row-reverse text-right")}>
            <div className={cn("w-2.5 h-2.5 rounded-full", colors.remainingDot)} />
            <div>
              <p className={cn(
                "text-sm font-bold text-foreground transition-all duration-200",
                salaryHidden && "blur-[4px] select-none"
              )}>
                {utilization.remaining}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {isRTL ? 'متاح' : 'Available'} <span className={cn(
                  "font-semibold",
                  colors.remainingPercentText,
                  salaryHidden && "blur-[4px] select-none"
                )}>({utilization.remainingPercent}%)</span>
              </p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
