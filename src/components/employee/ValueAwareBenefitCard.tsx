/**
 * Value-Type-Aware Benefit Card
 * 
 * Displays benefit information based on its value type:
 * - CASH: Shows remaining AED balance and utilization
 * - REIMBURSEMENT: Shows cap and claimed amount with disclaimer
 * - BUDGET: Shows budget allocation and usage
 * - COVERAGE: Shows plan info without AED remaining
 * - DEFERRED: Shows projected value without AED remaining
 * - ACCESS: Shows activation status without monetary values
 */

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Currency } from '@/components/ui/Currency';
import { LucideIcon } from 'lucide-react';
import { 
  VALUE_TYPE_METADATA, 
  getBenefitDisplayConfig,
  getUtilizationTerminology,
  shouldShowMonetaryRemaining,
} from '@/lib/benefitValueTypes';
import { BenefitValueType } from '@/lib/taxonomy';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { BenefitValueTypeChip } from '@/components/shared/BenefitValueTypeChip';

interface ValueAwareBenefitCardProps {
  name: string;
  icon: LucideIcon;
  value: number;
  utilized: number;
  description: string;
  valueType: BenefitValueType;
  onClick: () => void;
  index?: number;
  isRTL?: boolean;
  /** For coverage/access: alternative metric to show */
  alternativeMetric?: {
    label: string;
    value: string | number;
  };
}

export function ValueAwareBenefitCard({
  name,
  icon: Icon,
  value,
  utilized,
  description,
  valueType,
  onClick,
  index = 0,
  isRTL = false,
  alternativeMetric,
}: ValueAwareBenefitCardProps) {
  const showMonetaryRemaining = shouldShowMonetaryRemaining(valueType);
  const displayConfig = getBenefitDisplayConfig(valueType);
  const terminology = getUtilizationTerminology(valueType, isRTL);
  const valueTypeMeta = VALUE_TYPE_METADATA[valueType];
  
  const utilization = value > 0 ? Math.round((utilized / value) * 100) : 0;
  const remaining = value - utilized;
  const isFullyUsed = utilization >= 100;
  
  // Status configuration based on value type and utilization
  const getStatusConfig = () => {
    if (valueType === 'coverage' || valueType === 'access') {
      return {
        badge: valueTypeMeta.colorClass,
        progress: '[&>div]:bg-primary',
        label: valueTypeMeta.label,
      };
    }
    
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
      className="group cursor-pointer bg-card border border-border/40 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 overflow-hidden h-full flex flex-col"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={onClick}
    >
      <div className="p-6 flex-1 flex flex-col">
        {/* Header */}
        <div className={cn("flex items-start gap-4", isRTL && "flex-row-reverse")}>
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent/15 to-accent/5 flex items-center justify-center group-hover:from-accent/20 group-hover:to-accent/8 transition-all duration-300 shrink-0">
            <Icon className="w-5 h-5 text-accent" />
          </div>
          
          <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
            <div className={cn("flex items-center gap-2 flex-wrap", isRTL && "flex-row-reverse justify-end")}>
              <h3 className="font-semibold text-[15px] text-foreground group-hover:text-accent transition-colors leading-tight">
                {name}
              </h3>
              <ChevronRight className={cn(
                "w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0",
                isRTL && "rotate-180 group-hover:-translate-x-0.5"
              )} />
            </div>
            {/* Benefit Type Chip */}
            <div className="mt-1.5">
              <BenefitValueTypeChip valueType={valueType} size="sm" showTooltip={false} />
            </div>
            <p className="text-[13px] text-muted-foreground mt-1.5 line-clamp-1">
              {description}
            </p>
          </div>
        </div>
        
        <div className="flex-1 min-h-5" />
        
        {/* Stats section - varies by value type */}
        <div className="space-y-4 mt-5">
          {/* Value and type badge row */}
          <div className={cn("flex items-end justify-between gap-3", isRTL && "flex-row-reverse")}>
            <div className={cn(isRTL && "text-right")}>
              {showMonetaryRemaining ? (
                <>
                  <div className="text-xl font-bold text-foreground tracking-tight">
                    <Currency amount={value} abbreviate={false} />
                  </div>
                  <p className="text-[13px] text-muted-foreground mt-1">
                    {isRTL ? displayConfig.primaryValueLabelAr : displayConfig.primaryValueLabel}
                  </p>
                </>
              ) : (
                <>
                  <div className="text-lg font-semibold text-foreground tracking-tight flex items-center gap-2">
                    <valueTypeMeta.icon className="w-4 h-4" />
                    {valueTypeMeta.label}
                  </div>
                  <p className="text-[13px] text-muted-foreground mt-1">
                    {isRTL ? valueTypeMeta.descriptionAr : valueTypeMeta.description}
                  </p>
                </>
              )}
            </div>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge 
                  variant="outline"
                  className={cn("text-[12px] px-2.5 py-1 font-medium border cursor-help", status.badge)}
                >
                  {showMonetaryRemaining ? `${utilization}%` : status.label}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{valueTypeMeta.description}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          {/* Progress and details - only for cash/reimbursement */}
          {showMonetaryRemaining && (
            <div className="space-y-3">
              <Progress 
                value={utilization} 
                className={cn("h-1.5 bg-muted/30 rounded-full", status.progress)}
              />
              
              <div className={cn("flex items-center justify-between text-[13px]", isRTL && "flex-row-reverse")}>
                <span className="text-muted-foreground">
                  <Currency amount={utilized} abbreviate={false} size="sm" /> {terminology.utilized}
                </span>
                <span className={cn(
                  "font-medium",
                  remaining > 0 ? "text-accent" : "text-success"
                )}>
                  {remaining > 0 
                    ? <><Currency amount={remaining} abbreviate={false} size="sm" /> {terminology.remaining}</>
                    : isRTL ? 'تم الاستخدام بالكامل' : 'Fully utilized'
                  }
                </span>
              </div>
            </div>
          )}
          
          {/* Alternative metrics for coverage/access */}
          {!showMonetaryRemaining && alternativeMetric && (
            <div className={cn(
              "flex items-center justify-between p-2 rounded-lg bg-muted/30",
              isRTL && "flex-row-reverse"
            )}>
              <span className="text-xs text-muted-foreground">{alternativeMetric.label}</span>
              <span className="text-sm font-medium">{alternativeMetric.value}</span>
            </div>
          )}
          
          {/* Disclaimer for coverage/access showing employer cost */}
          {!showMonetaryRemaining && value > 0 && (
            <div className={cn(
              "flex items-start gap-1.5 text-[11px] text-muted-foreground/70",
              isRTL && "flex-row-reverse text-right"
            )}>
              <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
              <span>
                {isRTL 
                  ? `استثمار صاحب العمل: AED ${value.toLocaleString()}`
                  : `Employer investment: AED ${value.toLocaleString()}`
                }
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default ValueAwareBenefitCard;
