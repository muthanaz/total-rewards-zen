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
  };
  isRTL?: boolean;
  salaryHidden?: boolean;
}

export function BenefitsUtilizationCard({ utilization, isRTL = false, salaryHidden = false }: BenefitsUtilizationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.3 }}
    >
      <Card className="relative border border-amber-200/50 bg-amber-50/20 dark:bg-amber-900/5 dark:border-amber-500/15 p-4">
        <div className={cn("flex items-center justify-between mb-3", isRTL && "flex-row-reverse")}>
          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <div className="w-5 h-5 rounded-md bg-amber-100/60 dark:bg-amber-500/15 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            </div>
          </div>
          <InfoTooltip formula={utilization.formula} dataSource={utilization.dataSource} />
        </div>
        
        {/* Progress bar */}
        <div className="relative h-2 bg-amber-100/30 dark:bg-amber-900/15 rounded-full overflow-hidden mb-3">
          <motion.div 
            className="absolute inset-y-0 left-0 bg-amber-300/80 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${utilization.usedPercent}%` }}
            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
          />
        </div>
        
        {/* Used and Remaining */}
        <div className={cn("grid grid-cols-2 gap-4", isRTL && "direction-rtl")}>
          <div className={cn("flex items-center gap-2.5", isRTL && "flex-row-reverse")}>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <div>
              <p className={cn(
                "text-sm font-bold text-foreground transition-all duration-200",
                salaryHidden && "blur-[4px] select-none"
              )}>
                {utilization.used}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {isRTL ? 'مستخدم' : 'Used'} <span className={cn(
                  "font-semibold text-amber-500",
                  salaryHidden && "blur-[4px] select-none"
                )}>({utilization.usedPercent}%)</span>
              </p>
            </div>
          </div>
          <div className={cn("flex items-center gap-2.5", isRTL && "flex-row-reverse text-right")}>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-200/80 dark:bg-amber-600/30" />
            <div>
              <p className={cn(
                "text-sm font-bold text-foreground transition-all duration-200",
                salaryHidden && "blur-[4px] select-none"
              )}>
                {utilization.remaining}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {isRTL ? 'متاح' : 'Available'} <span className={cn(
                  "font-semibold text-amber-400",
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
