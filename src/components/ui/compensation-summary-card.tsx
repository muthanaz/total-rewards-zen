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

      {/* Total Compensation Row - Side by Side Layout */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <Card className="relative overflow-hidden border-2 border-transparent bg-gradient-to-r from-accent/8 via-card to-amber-500/8 p-5">
          {/* Gradient border effect */}
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-accent/50 via-emerald-500/30 to-amber-500/50 -z-10 blur-[1px]" />
          <div className="absolute inset-[2px] rounded-lg bg-card -z-10" />
          
          {/* Decorative background elements */}
          <div className="absolute top-0 left-0 w-40 h-40 bg-accent/15 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/4" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-amber-500/15 rounded-full blur-3xl translate-y-1/2 translate-x-1/4" />
          <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
          
          <div className="relative z-10">
            <div className={cn("flex flex-col md:flex-row md:items-center md:justify-between gap-4", isRTL && "md:flex-row-reverse")}>
              {/* Left side - Value */}
              <div className={cn("flex-1", isRTL && "text-right")}>
                {/* Header */}
                <div className={cn("flex items-center gap-3 mb-3", isRTL && "flex-row-reverse")}>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/90 to-accent flex items-center justify-center shadow-md shadow-accent/20">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v12M8 12h8" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-sm font-bold text-foreground block">
                      {isRTL ? 'إجمالي التعويضات السنوية' : 'Total Annual Compensation'}
                    </span>
                  </div>
                  <InfoTooltip formula={totalCompensation.formula} dataSource={totalCompensation.dataSource} />
                  
                  {/* Privacy Toggle Button */}
                  {totalCompensation.onTogglePrivacy && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent/10"
                      onClick={totalCompensation.onTogglePrivacy}
                      aria-label={totalCompensation.salaryHidden ? 'Show salary' : 'Hide salary'}
                    >
                      {totalCompensation.salaryHidden ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
                
                {/* Main value */}
                <p className={cn(
                  "text-3xl md:text-4xl font-bold text-foreground tracking-tight leading-none transition-all duration-200",
                  totalCompensation.salaryHidden && "blur-[6px] select-none"
                )}>
                  {totalCompensation.value}
                </p>
              </div>
              
              {/* Right side - Visual breakdown */}
              <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
                {/* Donut chart */}
                <div className="relative w-20 h-20">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    {/* Background circle */}
                    <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="3.5" className="text-muted/15" />
                    {/* Salary arc (60%) */}
                    <circle 
                      cx="18" cy="18" r="14" fill="none" 
                      stroke="url(#salaryGradientTeal)" 
                      strokeWidth="3.5" 
                      strokeDasharray="52.8 87.96" 
                      strokeLinecap="round"
                      className="drop-shadow-sm"
                    />
                    {/* Benefits arc (40%) */}
                    <circle 
                      cx="18" cy="18" r="14" fill="none" 
                      stroke="url(#benefitsGradientAmber)" 
                      strokeWidth="3.5" 
                      strokeDasharray="35.2 87.96" 
                      strokeDashoffset="-52.8"
                      strokeLinecap="round"
                      className="drop-shadow-sm"
                    />
                    <defs>
                      <linearGradient id="salaryGradientTeal" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#14b8a6" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                      <linearGradient id="benefitsGradientAmber" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#fbbf24" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-xs font-bold text-foreground block">100%</span>
                      <span className="text-[8px] text-muted-foreground">{isRTL ? 'مجموع' : 'Total'}</span>
                    </div>
                  </div>
                </div>
                
                {/* Legend */}
                <div className="flex flex-col gap-2.5">
                  <div className={cn("flex items-center gap-2.5 p-2 rounded-lg bg-accent/10 border border-accent/20", isRTL && "flex-row-reverse")}>
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-accent to-emerald-500 shadow-sm shadow-accent/50" />
                    <div className={cn("flex items-baseline gap-1.5", isRTL && "flex-row-reverse")}>
                      <span className="text-sm font-bold text-accent">60%</span>
                      <span className="text-[10px] font-medium text-muted-foreground">
                        {isRTL ? 'الراتب' : 'Salary'}
                      </span>
                    </div>
                  </div>
                  <div className={cn("flex items-center gap-2.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20", isRTL && "flex-row-reverse")}>
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 shadow-sm shadow-amber-500/50" />
                    <div className={cn("flex items-baseline gap-1.5", isRTL && "flex-row-reverse")}>
                      <span className="text-sm font-bold text-amber-500">40%</span>
                      <span className="text-[10px] font-medium text-muted-foreground">
                        {isRTL ? 'المزايا' : 'Benefits'}
                      </span>
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
        <Card className="relative border border-border/50 bg-card p-4">
          <div className={cn("flex items-center justify-between mb-3", isRTL && "flex-row-reverse")}>
            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <div className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-accent" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{isRTL ? 'استخدام المزايا' : 'Benefits Utilization'}</h3>
            </div>
            <InfoTooltip formula={utilization.formula} dataSource={utilization.dataSource} />
          </div>
          
          {/* Progress bar */}
          <div className="relative h-2.5 bg-muted rounded-full overflow-hidden mb-3">
            <motion.div 
              className="absolute inset-y-0 left-0 bg-accent rounded-full"
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
              <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
              <div>
                <p className="text-sm font-bold text-foreground">{utilization.remaining}</p>
                <p className="text-[10px] text-muted-foreground">
                  {isRTL ? 'متاح' : 'Available'} <span className="font-semibold text-muted-foreground">({utilization.remainingPercent}%)</span>
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
