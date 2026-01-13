import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { cn } from '@/lib/utils';
import { LucideIcon, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

interface MetricItem {
  icon: LucideIcon;
  value: string;
  label: string;
  formula?: string;
  dataSource?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'benefits';
  isSensitive?: boolean;
}

interface CompensationGridProps {
  metrics: MetricItem[];
  totalCompensation: {
    value: string;
    formula: string;
    dataSource: string;
    salaryHidden?: boolean;
    onTogglePrivacy?: () => void;
  };
  utilization: {
    used: string;
    usedPercent: number;
    remaining: string;
    remainingPercent: number;
    formula: string;
    dataSource: string;
  };
  isRTL?: boolean;
}

const variantStyles = {
  default: 'border-border/50 bg-card',
  primary: 'border-accent/30 bg-accent/5',
  success: 'border-emerald-500/30 bg-emerald-500/5',
  warning: 'border-amber-500/30 bg-amber-500/5',
  benefits: 'border-amber-500/30 bg-amber-500/5',
};

const iconVariantStyles = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-accent/15 text-accent',
  success: 'bg-emerald-500/15 text-emerald-500',
  warning: 'bg-amber-500/15 text-amber-500',
  benefits: 'bg-amber-500/15 text-amber-500',
};

export function CompensationGrid({ metrics, totalCompensation, utilization, isRTL = false }: CompensationGridProps) {
  return (
    <div className="space-y-3">
      {/* Top Row - 4 Metrics with visual flow to Total */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
          >
            <Card className={cn(
              'relative p-3 border transition-all duration-200 hover:shadow-md',
              variantStyles[metric.variant || 'default']
            )}>
              <div className="flex items-start justify-between gap-2">
                <div className={cn('p-1.5 rounded-lg', iconVariantStyles[metric.variant || 'default'])}>
                  <metric.icon className="w-3.5 h-3.5" />
                </div>
                {metric.formula && (
                  <InfoTooltip formula={metric.formula} dataSource={metric.dataSource} />
                )}
              </div>
              <div className="mt-2">
                <p className={cn(
                  "text-lg font-bold text-foreground tracking-tight transition-all duration-200",
                  metric.isSensitive && totalCompensation.salaryHidden && "blur-[4px] select-none"
                )}>
                  {metric.value}
                </p>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mt-0.5">{metric.label}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Total Compensation Row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <div className="relative rounded-xl p-[1.5px] bg-gradient-to-r from-accent via-transparent to-amber-400">
          <Card className="relative overflow-hidden rounded-[10px] bg-gradient-to-r from-accent/12 via-white to-amber-100/30 dark:from-accent/15 dark:via-card dark:to-amber-900/15 p-5">
            {/* Subtle decorative background */}
            <div className="absolute top-0 left-0 w-[35%] h-full bg-gradient-to-r from-accent/10 to-transparent" />
            <div className="absolute top-0 right-0 w-[35%] h-full bg-gradient-to-l from-amber-400/10 to-transparent" />
          
            <div className="relative z-10">
              <div className={cn("flex flex-col md:flex-row md:items-center md:justify-between gap-4", isRTL && "md:flex-row-reverse")}>
                {/* Left side - Value */}
                <div className={cn("flex-1", isRTL && "text-right")}>
                  {/* Header */}
                  <div className={cn("flex items-center gap-2.5 mb-3", isRTL && "flex-row-reverse")}>
                    <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
                      <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v12M8 12h8" />
                      </svg>
                    </div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {isRTL ? 'إجمالي التعويضات السنوية' : 'Total Annual Compensation'}
                    </h3>
                    <InfoTooltip formula={totalCompensation.formula} dataSource={totalCompensation.dataSource} />
                    
                    {/* Privacy Toggle Button */}
                    {totalCompensation.onTogglePrivacy && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-accent/10"
                        onClick={totalCompensation.onTogglePrivacy}
                        aria-label={totalCompensation.salaryHidden ? 'Show salary' : 'Hide salary'}
                      >
                        {totalCompensation.salaryHidden ? (
                          <Eye className="h-3.5 w-3.5" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    )}
                  </div>
                  
                  {/* Main value */}
                  <p className={cn(
                    "text-2xl md:text-3xl font-bold text-foreground tracking-tight leading-none transition-all duration-200",
                    totalCompensation.salaryHidden && "blur-[6px] select-none"
                  )}>
                    {totalCompensation.value}
                  </p>
                </div>
                
                {/* Right side - Stacked bar breakdown */}
                <div className={cn("flex flex-col gap-2", isRTL && "items-end")}>
                  {/* Stacked horizontal bar */}
                  <div className="w-44 h-5 rounded-full overflow-hidden flex bg-muted/30">
                    <div className="h-full bg-accent" style={{ width: '60%' }} />
                    <div className="h-full bg-amber-400" style={{ width: '40%' }} />
                  </div>
                  
                  {/* Legend items */}
                  <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
                    <div className={cn("flex items-center gap-1.5", isRTL && "flex-row-reverse")}>
                      <div className="w-2 h-2 rounded-full bg-accent" />
                      <span className="text-xs font-semibold text-accent">60%</span>
                      <span className="text-[10px] text-muted-foreground">{isRTL ? 'الراتب' : 'Salary'}</span>
                    </div>
                    <div className={cn("flex items-center gap-1.5", isRTL && "flex-row-reverse")}>
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="text-xs font-semibold text-amber-500">40%</span>
                      <span className="text-[10px] text-muted-foreground">{isRTL ? 'المزايا' : 'Benefits'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Utilization Row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.3 }}
      >
        <Card className="relative border border-amber-300/40 bg-amber-50/30 dark:bg-amber-900/10 dark:border-amber-500/20 p-4">
          <div className={cn("flex items-center justify-between mb-3", isRTL && "flex-row-reverse")}>
            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <div className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
              </div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {isRTL ? 'استخدام المزايا' : 'Benefits Utilization'}
              </h3>
            </div>
            <InfoTooltip formula={utilization.formula} dataSource={utilization.dataSource} />
          </div>
          
          {/* Progress bar */}
          <div className="relative h-2.5 bg-amber-100/60 dark:bg-amber-900/30 rounded-full overflow-hidden mb-3">
            <motion.div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent to-teal-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${utilization.usedPercent}%` }}
              transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
            />
          </div>
          
          {/* Used and Remaining */}
          <div className={cn("grid grid-cols-2 gap-4", isRTL && "direction-rtl")}>
            <div className={cn("flex items-center gap-2.5", isRTL && "flex-row-reverse")}>
              <div className="w-2.5 h-2.5 rounded-full bg-accent" />
              <div>
                <p className="text-sm font-bold text-foreground">{utilization.used}</p>
                <p className="text-[10px] text-muted-foreground">
                  {isRTL ? 'مستخدم' : 'Used'} <span className="font-semibold text-accent">({utilization.usedPercent}%)</span>
                </p>
              </div>
            </div>
            <div className={cn("flex items-center gap-2.5", isRTL && "flex-row-reverse text-right")}>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-200 dark:bg-amber-600/40" />
              <div>
                <p className="text-sm font-bold text-foreground">{utilization.remaining}</p>
                <p className="text-[10px] text-muted-foreground">
                  {isRTL ? 'متاح' : 'Available'} <span className="font-semibold text-amber-500">({utilization.remainingPercent}%)</span>
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
