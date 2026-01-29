import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Currency } from '@/components/ui/Currency';
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
      className="group cursor-pointer hover:border-accent/30 hover:shadow-md transition-shadow duration-150 overflow-hidden h-full flex flex-col"
      onClick={onClick}
    >
      {/* Main content area */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Header: Icon + Name + Arrow */}
        <div className={cn("flex items-start gap-4", isRTL && "flex-row-reverse")}>
          {/* Icon container */}
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent/15 to-accent/5 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-accent" />
          </div>
          
          {/* Title and description */}
          <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse justify-end")}>
              <h3 className="font-semibold text-[15px] text-foreground leading-tight">
                {name}
              </h3>
              <ChevronRight className={cn(
                "w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0",
                isRTL && "rotate-180"
              )} />
            </div>
            <p className="text-[13px] text-muted-foreground mt-1.5 line-clamp-1">
              {description}
            </p>
          </div>
        </div>
        
        {/* Spacer */}
        <div className="flex-1 min-h-5" />
        
        {/* Stats section */}
        <div className="space-y-4 mt-5">
          {/* Value and status row */}
          <div className={cn("flex items-end justify-between gap-3", isRTL && "flex-row-reverse")}>
            <div className={cn(isRTL && "text-right")}>
              <div className="text-xl font-bold text-foreground tracking-tight">
                <Currency amount={value} abbreviate={false} />
              </div>
              <p className="text-[13px] text-muted-foreground mt-1">
                {isRTL ? 'الاستحقاق السنوي' : 'Annual Entitlement'}
              </p>
            </div>
            <Badge 
              variant="outline"
              className={cn("text-[13px] px-3 py-1.5 font-medium border", status.badge)}
            >
              {utilization}%
            </Badge>
          </div>
          
          {/* Progress bar */}
          <div className="space-y-3">
            <Progress 
              value={utilization} 
              className={cn("h-1.5 bg-muted/30 rounded-full", status.progress)}
            />
            
            {/* Utilization details */}
            <div className={cn("flex items-center justify-between text-[13px]", isRTL && "flex-row-reverse")}>
              <span className="text-muted-foreground">
                <Currency amount={utilized} abbreviate={false} size="sm" /> {isRTL ? 'مستخدم' : 'utilized'}
              </span>
              <span className={cn(
                "font-medium",
                remaining > 0 ? "text-accent" : "text-success"
              )}>
                {remaining > 0 
                  ? <><Currency amount={remaining} abbreviate={false} size="sm" /> {isRTL ? 'متبقي' : 'remaining'}</>
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
