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
  subtitle?: string;
}

interface CompensationGridProps {
  metrics: MetricItem[];
  totalCompensation: {
    value: string;
    formula: string;
    dataSource: string;
    subtitle?: string;
    salaryHidden?: boolean;
    onTogglePrivacy?: () => void;
    salaryPercent?: number;
    benefitsPercent?: number;
    onCardClick?: () => void;
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

export function CompensationGrid({ metrics, totalCompensation, isRTL = false }: CompensationGridProps) {
  const salaryPercent = totalCompensation.salaryPercent ?? 66;
  const benefitsPercent = totalCompensation.benefitsPercent ?? 34;
  
  return (
    <div className="space-y-3">
      {/* Total Compensation Row - Now at Top */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <Card 
          className={cn(
            "relative overflow-hidden border border-border/50 p-4",
            totalCompensation.onCardClick && "cursor-pointer hover:shadow-md hover:border-accent/30 transition-all group"
          )}
          onClick={totalCompensation.onCardClick}
        >
          {/* Gradient background: Teal (accent) from LEFT fading to white, Gold (amber) from RIGHT fading to white */}
          <div className="absolute inset-0 bg-white dark:bg-card" />
          <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-accent/10 via-accent/5 to-transparent" />
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-amber-500/10 via-amber-500/5 to-transparent" />
        
          <div className="relative z-10">
            <div className={cn("flex flex-col md:flex-row md:items-center md:justify-between gap-3", isRTL && "md:flex-row-reverse")}>
              {/* Left side - Label and Formula */}
              <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                <div>
                  <div className={cn("flex items-center gap-2 mb-1", isRTL && "flex-row-reverse")}>
                    <h3 className="text-sm font-semibold text-foreground tracking-tight">
                      {isRTL ? 'إجمالي التعويضات المضمونة' : 'Total Guaranteed Compensation'}
                    </h3>
                    <InfoTooltip formula={totalCompensation.formula} dataSource={totalCompensation.dataSource} />
                    
                    {/* Privacy Toggle Button */}
                    {totalCompensation.onTogglePrivacy && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-accent/10"
                        onClick={totalCompensation.onTogglePrivacy}
                        aria-label={totalCompensation.salaryHidden ? 'Show salary' : 'Hide salary'}
                      >
                        {totalCompensation.salaryHidden ? (
                          <Eye className="h-3 w-3" />
                        ) : (
                          <EyeOff className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                  </div>
                  <p className={cn("text-[11px] text-muted-foreground", isRTL && "text-right")}>
                    {isRTL ? 'الراتب السنوي + المزايا المضمونة' : 'Annual Salary + Guaranteed Benefits'}
                  </p>
                  {/* Subtitle showing potential total */}
                  {totalCompensation.subtitle && (
                    <p className={cn("text-[10px] text-amber-600/80 dark:text-amber-400/80 mt-0.5", isRTL && "text-right")}>
                      {totalCompensation.subtitle}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Center - Main value */}
              <div className={cn("flex-1 flex justify-center", isRTL && "justify-center")}>
                <p className={cn(
                  "text-2xl md:text-3xl font-bold text-foreground tracking-tight leading-none transition-all duration-200",
                  totalCompensation.salaryHidden && "blur-[6px] select-none"
                )}>
                  {totalCompensation.value}
                </p>
              </div>
              
              {/* Right side - Visual breakdown */}
              <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                {/* Dual arc visualization */}
                <div className="relative w-20 h-10">
                  <svg className="w-full h-full" viewBox="0 0 80 40">
                    {/* Background track */}
                    <path 
                      d="M 6 36 A 34 34 0 0 1 74 36" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="5" 
                      strokeLinecap="round"
                      className="text-muted/20"
                    />
                    {/* Salary arc (dynamic %) - teal/accent color */}
                    <path 
                      d="M 6 36 A 34 34 0 0 1 40 2" 
                      fill="none" 
                      stroke="hsl(var(--accent))" 
                      strokeWidth="5" 
                      strokeLinecap="round"
                      className="opacity-70"
                    />
                    {/* Benefits arc (dynamic %) - amber color */}
                    <path 
                      d="M 40 2 A 34 34 0 0 1 74 36" 
                      fill="none" 
                      stroke="#f59e0b" 
                      strokeWidth="5" 
                      strokeLinecap="round"
                      className="opacity-60"
                    />
                  </svg>
                </div>
                
                {/* Legend - now with dynamic percentages */}
                <div className="flex flex-col gap-1">
                  <div className={cn("flex items-center gap-1.5", isRTL && "flex-row-reverse")}>
                    <div className="w-2.5 h-1 rounded-full bg-accent/70" />
                    <span className="text-[10px] font-medium text-foreground/80">{salaryPercent}% <span className="text-muted-foreground font-normal">{isRTL ? 'راتب' : 'Salary'}</span></span>
                  </div>
                  <div className={cn("flex items-center gap-1.5", isRTL && "flex-row-reverse")}>
                    <div className="w-2.5 h-1 rounded-full bg-amber-500/70" />
                    <span className="text-[10px] font-medium text-foreground/80">{benefitsPercent}% <span className="text-muted-foreground font-normal">{isRTL ? 'مزايا' : 'Benefits'}</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Metrics Row - 4 Cards with consistent height */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + index * 0.05, duration: 0.3 }}
            className="flex"
          >
            <Card className={cn(
              'relative p-3 border transition-all duration-200 hover:shadow-md w-full flex flex-col',
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
              <div className="mt-2 flex-1 flex flex-col justify-end">
                <p className={cn(
                  "text-lg font-bold text-foreground tracking-tight transition-all duration-200",
                  metric.isSensitive && totalCompensation.salaryHidden && "blur-[4px] select-none"
                )}>
                  {metric.value}
                </p>
                {/* Subtitle for benefits showing potential value */}
                {metric.subtitle && (
                  <p className="text-[9px] text-amber-600/80 dark:text-amber-400/80 mt-0.5">
                    {metric.subtitle}
                  </p>
                )}
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mt-0.5">{metric.label}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

    </div>
  );
}
