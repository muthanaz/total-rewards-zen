/**
 * BenefitGridCard
 * 
 * Clean benefit card for the overview grid.
 * Shows: Name, Icon, Annual/Used/Remaining, single CTA based on transaction model.
 */

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Currency } from '@/components/ui/Currency';
import { LucideIcon, ChevronRight } from 'lucide-react';

// Extended transaction model to include informational benefits
export type BenefitTransactionModel = 'request_only' | 'claim_only' | 'request_and_claim' | 'informational';

export interface BenefitGridCardProps {
  name: string;
  nameAr?: string;
  icon: LucideIcon;
  annualValue: number;
  utilized: number;
  transactionModel: BenefitTransactionModel;
  route: string;
  hasApprovedRequest?: boolean;
  onClick: () => void;
  isRTL?: boolean;
}

export function BenefitGridCard({
  name,
  nameAr,
  icon: Icon,
  annualValue,
  utilized,
  transactionModel,
  hasApprovedRequest = false,
  onClick,
  isRTL = false,
}: BenefitGridCardProps) {
  const remaining = Math.max(0, annualValue - utilized);
  const utilizationPercent = annualValue > 0 ? Math.round((utilized / annualValue) * 100) : 0;
  const isFullyUsed = utilizationPercent >= 100;
  
  // Determine CTA based on transaction model
  const getCTA = () => {
    // Long-term financials or informational benefits
    if (transactionModel === 'informational' || annualValue === 0) {
      return { label: isRTL ? 'عرض التفاصيل' : 'View details', variant: 'outline' as const };
    }
    
    // Request only
    if (transactionModel === 'request_only') {
      return { label: isRTL ? 'بدء طلب' : 'Start request', variant: 'default' as const };
    }
    
    // Request and claim - primary is request, claim only if approved
    if (transactionModel === 'request_and_claim') {
      if (hasApprovedRequest) {
        return { label: isRTL ? 'تقديم مطالبة' : 'Start claim', variant: 'default' as const };
      }
      return { label: isRTL ? 'بدء طلب' : 'Start request', variant: 'default' as const };
    }
    
    // Default: claim only
    return { label: isRTL ? 'تقديم مطالبة' : 'Start claim', variant: 'default' as const };
  };
  
  const cta = getCTA();
  
  // Progress color based on utilization
  const getProgressColor = () => {
    if (isFullyUsed) return '[&>div]:bg-success';
    if (utilizationPercent >= 50) return '[&>div]:bg-info';
    if (utilizationPercent >= 20) return '[&>div]:bg-warning';
    return '[&>div]:bg-muted-foreground/50';
  };
  
  return (
    <Card 
      className="group flex flex-col h-full bg-card border border-border/40 hover:border-accent/30 hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      {/* Main content */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Header: Icon + Name */}
        <div className={cn("flex items-center gap-3 mb-4", isRTL && "flex-row-reverse")}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/15 to-accent/5 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-accent" />
          </div>
          <h3 className={cn(
            "font-semibold text-[15px] text-foreground leading-tight",
            isRTL && "text-right"
          )}>
            {isRTL && nameAr ? nameAr : name}
          </h3>
        </div>
        
        {/* Stats: Annual / Used / Remaining */}
        <div className="space-y-3 flex-1">
          {/* Values row */}
          <div className={cn("grid grid-cols-3 gap-2 text-center", isRTL && "direction-rtl")}>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-0.5">
                {isRTL ? 'السنوي' : 'Annual'}
              </p>
              <p className="text-sm font-semibold text-foreground tabular-nums">
                <Currency amount={annualValue} size="sm" abbreviate />
              </p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-0.5">
                {isRTL ? 'مستخدم' : 'Used'}
              </p>
              <p className="text-sm font-semibold text-muted-foreground tabular-nums">
                <Currency amount={utilized} size="sm" abbreviate />
              </p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-0.5">
                {isRTL ? 'متبقي' : 'Remaining'}
              </p>
              <p className={cn(
                "text-sm font-semibold tabular-nums",
                remaining > 0 ? "text-accent" : "text-success"
              )}>
                <Currency amount={remaining} size="sm" abbreviate />
              </p>
            </div>
          </div>
          
          {/* Progress bar */}
          <Progress 
            value={utilizationPercent} 
            className={cn("h-1.5 bg-muted/30 rounded-full", getProgressColor())}
          />
        </div>
      </div>
      
      {/* Footer: CTA */}
      <div className="px-5 pb-4 pt-0">
        <Button 
          variant={cta.variant}
          size="sm"
          className={cn(
            "w-full h-9 text-[13px] gap-1.5",
            isRTL && "flex-row-reverse"
          )}
          onClick={onClick}
        >
          {cta.label}
          <ChevronRight className={cn("w-3.5 h-3.5", isRTL && "rotate-180")} />
        </Button>
      </div>
    </Card>
  );
}
