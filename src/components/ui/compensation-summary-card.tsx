import { Card } from '@/components/ui/card';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface MetricItem {
  icon: LucideIcon;
  value: string;
  label: string;
  formula?: string;
  dataSource?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'benefits';
}

interface CompensationGridProps {
  metrics: MetricItem[];
  totalCompensation: {
    value: string;
    formula: string;
    dataSource: string;
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
  primary: 'border-sky-500/30 bg-sky-500/5',
  success: 'border-emerald-500/30 bg-emerald-500/5',
  warning: 'border-amber-500/30 bg-amber-500/5',
  benefits: 'border-teal-500/30 bg-teal-500/5',
};

const iconVariantStyles = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-sky-500/15 text-sky-500',
  success: 'bg-emerald-500/15 text-emerald-500',
  warning: 'bg-amber-500/15 text-amber-500',
  benefits: 'bg-teal-500/15 text-teal-500',
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
                <p className="text-lg font-bold text-foreground tracking-tight">{metric.value}</p>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mt-0.5">{metric.label}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Total Compensation Row - Side by Side Layout */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <Card className="relative overflow-hidden border-2 border-transparent bg-gradient-to-r from-sky-500/10 via-card to-teal-500/10 p-5">
          {/* Gradient border effect */}
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-sky-500/40 via-purple-500/30 to-teal-500/40 -z-10 blur-[1px]" />
          <div className="absolute inset-[2px] rounded-lg bg-card -z-10" />
          
          {/* Decorative background elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/4" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl translate-y-1/2 translate-x-1/4" />
          
          <div className="relative z-10">
            <div className={cn("flex flex-col md:flex-row md:items-center md:justify-between gap-4", isRTL && "md:flex-row-reverse")}>
              {/* Left side - Value */}
              <div className={cn("flex-1", isRTL && "text-right")}>
                {/* Header */}
                <div className={cn("flex items-center gap-3 mb-3", isRTL && "flex-row-reverse")}>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 via-purple-500 to-teal-500 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">Σ</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground/70 block">
                      {isRTL ? 'إجمالي التعويضات السنوية' : 'Total Annual Compensation'}
                    </span>
                  </div>
                  <InfoTooltip formula={totalCompensation.formula} dataSource={totalCompensation.dataSource} />
                </div>
                
                {/* Main value */}
                <p className="text-3xl md:text-4xl font-bold text-foreground tracking-tight leading-none">
                  {totalCompensation.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1.5">
                  {isRTL ? 'قيمتك الإجمالية كموظف' : 'Your total employee value'}
                </p>
              </div>
              
              {/* Right side - Visual breakdown */}
              <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                {/* Salary segment */}
                <div className="flex flex-col items-center">
                  <div className="relative w-16 h-16">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      {/* Background circle */}
                      <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/20" />
                      {/* Salary arc (60%) */}
                      <circle 
                        cx="18" cy="18" r="14" fill="none" 
                        stroke="url(#salaryGradient)" 
                        strokeWidth="4" 
                        strokeDasharray="52.8 87.96" 
                        strokeLinecap="round"
                        className="drop-shadow-sm"
                      />
                      {/* Benefits arc (40%) */}
                      <circle 
                        cx="18" cy="18" r="14" fill="none" 
                        stroke="url(#benefitsGradient)" 
                        strokeWidth="4" 
                        strokeDasharray="35.2 87.96" 
                        strokeDashoffset="-52.8"
                        strokeLinecap="round"
                        className="drop-shadow-sm"
                      />
                      <defs>
                        <linearGradient id="salaryGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#0ea5e9" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                        <linearGradient id="benefitsGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#14b8a6" />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-foreground">100%</span>
                    </div>
                  </div>
                </div>
                
                {/* Legend */}
                <div className="flex flex-col gap-2">
                  <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-sky-500 to-purple-500" />
                    <div className={cn("flex flex-col", isRTL && "items-end")}>
                      <span className="text-[10px] font-medium text-muted-foreground">
                        {isRTL ? 'الراتب' : 'Salary'}
                      </span>
                      <span className="text-sm font-bold text-sky-500">60%</span>
                    </div>
                  </div>
                  <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500" />
                    <div className={cn("flex flex-col", isRTL && "items-end")}>
                      <span className="text-[10px] font-medium text-muted-foreground">
                        {isRTL ? 'المزايا' : 'Benefits'}
                      </span>
                      <span className="text-sm font-bold text-teal-500">40%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Utilization Row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.3 }}
      >
        <Card className="relative border border-teal-500/20 bg-gradient-to-r from-teal-500/5 to-transparent p-4">
          <div className={cn("flex items-center justify-between mb-3", isRTL && "flex-row-reverse")}>
            <h3 className="text-sm font-semibold text-foreground">{isRTL ? 'استخدام المزايا' : 'Benefits Utilization'}</h3>
            <InfoTooltip formula={utilization.formula} dataSource={utilization.dataSource} />
          </div>
          
          {/* Progress bar */}
          <div className="relative h-3 bg-teal-500/10 rounded-full overflow-hidden mb-3">
            <motion.div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${utilization.usedPercent}%` }}
              transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
            />
          </div>
          
          {/* Used and Remaining */}
          <div className={cn("grid grid-cols-2 gap-4", isRTL && "direction-rtl")}>
            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500" />
              <div>
                <p className="text-base font-bold text-foreground">{utilization.used}</p>
                <p className="text-[10px] text-muted-foreground">
                  {isRTL ? 'مستخدم' : 'Used'} <span className="font-semibold text-teal-500">({utilization.usedPercent}%)</span>
                </p>
              </div>
            </div>
            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse text-right")}>
              <div className="w-2.5 h-2.5 rounded-full bg-teal-500/30" />
              <div>
                <p className="text-base font-bold text-foreground">{utilization.remaining}</p>
                <p className="text-[10px] text-muted-foreground">
                  {isRTL ? 'متاح' : 'Available'} <span className="font-semibold text-teal-500/70">({utilization.remainingPercent}%)</span>
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
