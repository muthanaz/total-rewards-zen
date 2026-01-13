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
  variant?: 'default' | 'primary' | 'success' | 'warning';
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
  primary: 'border-accent/30 bg-accent/5',
  success: 'border-emerald-500/30 bg-emerald-500/5',
  warning: 'border-amber-500/30 bg-amber-500/5',
};

const iconVariantStyles = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-accent/15 text-accent',
  success: 'bg-emerald-500/15 text-emerald-500',
  warning: 'bg-amber-500/15 text-amber-500',
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

      {/* Total Compensation Row - Visual Sum */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <Card className="relative overflow-hidden border-2 border-accent/40 bg-gradient-to-br from-accent/15 via-accent/5 to-purple-500/15 p-5">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/15 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
          <div className="absolute top-1/2 left-1/2 w-20 h-20 bg-accent/10 rounded-full blur-xl -translate-x-1/2 -translate-y-1/2" />
          
          <div className="relative z-10">
            {/* Header with icon and label */}
            <div className={cn("flex items-center justify-between mb-4", isRTL && "flex-row-reverse")}>
              <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center shadow-lg shadow-accent/30">
                  <span className="text-white font-bold text-xl">Σ</span>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-accent block">
                    {isRTL ? 'إجمالي التعويضات السنوية' : 'Total Annual Compensation'}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {isRTL ? 'الراتب + جميع المزايا' : 'Salary + All Benefits Combined'}
                  </span>
                </div>
              </div>
              <InfoTooltip formula={totalCompensation.formula} dataSource={totalCompensation.dataSource} />
            </div>
            
            {/* Main value - prominent display */}
            <div className={cn("mb-5", isRTL && "text-right")}>
              <p className="text-4xl md:text-5xl font-bold text-foreground tracking-tight leading-none">
                {totalCompensation.value}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {isRTL ? 'قيمتك الإجمالية كموظف' : 'Your total value as an employee'}
              </p>
            </div>
            
            {/* Visual equation breakdown - enhanced */}
            <div className={cn("grid grid-cols-3 gap-3 pt-4 border-t border-accent/20", isRTL && "direction-rtl")}>
              {/* Salary Component */}
              <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-accent/10 border border-accent/20">
                <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-accent" />
                </div>
                <span className="text-[10px] font-medium text-muted-foreground text-center">
                  {isRTL ? 'الراتب السنوي' : 'Annual Salary'}
                </span>
                <span className="text-sm font-bold text-foreground">60%</span>
              </div>
              
              {/* Plus Sign */}
              <div className="flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">=</span>
                </div>
              </div>
              
              {/* Benefits Component */}
              <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                </div>
                <span className="text-[10px] font-medium text-muted-foreground text-center">
                  {isRTL ? 'قيمة المزايا' : 'Benefits Value'}
                </span>
                <span className="text-sm font-bold text-foreground">40%</span>
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
            <h3 className="text-sm font-semibold text-foreground">{isRTL ? 'استخدام المزايا' : 'Benefits Utilization'}</h3>
            <InfoTooltip formula={utilization.formula} dataSource={utilization.dataSource} />
          </div>
          
          {/* Progress bar */}
          <div className="relative h-3 bg-muted rounded-full overflow-hidden mb-3">
            <motion.div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${utilization.usedPercent}%` }}
              transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
            />
          </div>
          
          {/* Used and Remaining */}
          <div className={cn("grid grid-cols-2 gap-4", isRTL && "direction-rtl")}>
            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <div>
                <p className="text-base font-bold text-foreground">{utilization.used}</p>
                <p className="text-[10px] text-muted-foreground">
                  {isRTL ? 'مستخدم' : 'Used'} <span className="font-semibold text-blue-500">({utilization.usedPercent}%)</span>
                </p>
              </div>
            </div>
            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse text-right")}>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <div>
                <p className="text-base font-bold text-foreground">{utilization.remaining}</p>
                <p className="text-[10px] text-muted-foreground">
                  {isRTL ? 'متاح' : 'Available'} <span className="font-semibold text-emerald-500">({utilization.remainingPercent}%)</span>
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
