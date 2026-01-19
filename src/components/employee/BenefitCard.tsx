import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface BenefitCardProps {
  name: string;
  icon: LucideIcon;
  value: number;
  utilized: number;
  description: string;
  route: string;
  onClick: () => void;
  index?: number;
  isRTL?: boolean;
}

export function BenefitCard({
  name,
  icon: Icon,
  value,
  utilized,
  description,
  onClick,
  index = 0,
  isRTL = false,
}: BenefitCardProps) {
  const utilization = value > 0 ? Math.round((utilized / value) * 100) : 0;
  const remaining = value - utilized;
  const isFullyUsed = utilization >= 100;
  
  const formatCurrency = (val: number) => `AED ${val.toLocaleString()}`;
  
  // Determine status color based on utilization - using semantic tokens
  const getStatusConfig = () => {
    if (isFullyUsed) {
      return {
        badge: 'bg-success/10 text-success border-success/20',
        progress: '[&>div]:bg-success',
        label: isRTL ? 'مكتمل' : 'Complete',
      };
    }
    if (utilization >= 50) {
      return {
        badge: 'bg-info/10 text-info border-info/20',
        progress: '[&>div]:bg-info',
        label: isRTL ? 'قيد الاستخدام' : 'On Track',
      };
    }
    if (utilization >= 20) {
      return {
        badge: 'bg-warning/10 text-warning border-warning/20',
        progress: '[&>div]:bg-warning',
        label: isRTL ? 'فرصة' : 'Opportunity',
      };
    }
    return {
      badge: 'bg-muted text-muted-foreground border-border',
      progress: '[&>div]:bg-muted-foreground/50',
      label: isRTL ? 'جديد' : 'New',
    };
  };
  
  const status = getStatusConfig();
  
  return (
    <Card 
      className="group cursor-pointer bg-card border border-border/60 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 overflow-hidden h-full flex flex-col"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={onClick}
    >
      {/* Main content area */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Header: Icon + Name + Arrow */}
        <div className={cn("flex items-start gap-4", isRTL && "flex-row-reverse")}>
          {/* Icon container */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center group-hover:from-accent/30 group-hover:to-accent/10 transition-all duration-300 shrink-0">
            <Icon className="w-6 h-6 text-accent" />
          </div>
          
          {/* Title and description */}
          <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse justify-end")}>
              <h3 className="font-semibold text-base text-foreground group-hover:text-accent transition-colors leading-tight">
                {name}
              </h3>
              <ChevronRight className={cn(
                "w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0",
                isRTL && "rotate-180 group-hover:-translate-x-0.5"
              )} />
            </div>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
              {description}
            </p>
          </div>
        </div>
        
        {/* Spacer */}
        <div className="flex-1 min-h-4" />
        
        {/* Stats section */}
        <div className="space-y-3 mt-4">
          {/* Value and status row */}
          <div className={cn("flex items-end justify-between gap-2", isRTL && "flex-row-reverse")}>
            <div className={cn(isRTL && "text-right")}>
              <p className="text-2xl font-bold text-foreground tracking-tight">
                {formatCurrency(value)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isRTL ? 'القيمة السنوية' : 'Annual Value'}
              </p>
            </div>
            <Badge 
              variant="outline"
              className={cn("text-xs px-2.5 py-1 font-medium border", status.badge)}
            >
              {utilization}%
            </Badge>
          </div>
          
          {/* Progress bar */}
          <div className="space-y-2">
            <Progress 
              value={utilization} 
              className={cn("h-2 bg-muted/40 rounded-full", status.progress)}
            />
            
            {/* Utilization details */}
            <div className={cn("flex items-center justify-between text-xs", isRTL && "flex-row-reverse")}>
              <span className="text-muted-foreground">
                {formatCurrency(utilized)} {isRTL ? 'مستخدم' : 'used'}
              </span>
              <span className={cn(
                "font-medium",
                remaining > 0 ? "text-accent" : "text-success"
              )}>
                {remaining > 0 
                  ? `${formatCurrency(remaining)} ${isRTL ? 'متبقي' : 'remaining'}`
                  : isRTL ? 'تم الاستخدام بالكامل' : 'Fully utilized'
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
