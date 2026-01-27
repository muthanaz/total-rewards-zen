/**
 * Executive Summary Strip
 * 
 * One-line "executive headline" that answers:
 * "What do I need to know right now?"
 * 
 * Format: "AED X spent | Y% usage | AED Z unused | N actions needed"
 */

import { Card, CardContent } from '@/components/ui/card';
import { 
  DollarSign, 
  Target, 
  AlertTriangle, 
  Zap,
} from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';

interface ExecSummaryStripProps {
  totalInvestment: number;
  budgetAllocated: number;
  utilizationRate: number;
  targetUtilization: number;
  recoverableValue: number;
  priorityActionsCount: number;
  satisfactionScore?: number;
  className?: string;
}

export function ExecSummaryStrip({
  totalInvestment,
  budgetAllocated,
  utilizationRate,
  targetUtilization,
  recoverableValue,
  priorityActionsCount,
  className,
}: ExecSummaryStripProps) {
  const budgetVariance = totalInvestment - budgetAllocated;
  const isOverBudget = budgetVariance > 0;
  const variancePercent = budgetAllocated > 0 ? Math.abs((budgetVariance / budgetAllocated) * 100) : 0;
  const isOnTrack = utilizationRate >= targetUtilization;

  const summaryItems = [
    {
      icon: DollarSign,
      label: 'Total Spend',
      value: formatCurrencyAED(totalInvestment, { abbreviate: true }),
      sublabel: variancePercent < 1 
        ? 'On budget'
        : `${Math.round(variancePercent)}% ${isOverBudget ? 'over' : 'under'} budget`,
      status: variancePercent < 5 ? 'success' : isOverBudget ? 'warning' : 'success',
    },
    {
      icon: Target,
      label: 'Usage Rate',
      value: `${utilizationRate}%`,
      sublabel: `Target ${targetUtilization}%`,
      status: isOnTrack ? 'success' : 'warning',
    },
    {
      icon: AlertTriangle,
      label: 'Unutilized Budget',
      value: formatCurrencyAED(recoverableValue, { abbreviate: true }),
      sublabel: 'Opportunity to recapture',
      status: recoverableValue > totalInvestment * 0.2 ? 'destructive' : 'warning',
    },
    {
      icon: Zap,
      label: 'Actions Needed',
      value: priorityActionsCount.toString(),
      sublabel: 'Awaiting decision',
      status: priorityActionsCount > 0 ? 'warning' : 'success',
    },
  ];

  const statusColors = {
    success: 'text-success',
    warning: 'text-warning',
    destructive: 'text-destructive',
    muted: 'text-muted-foreground',
  };

  return (
    <Card className={cn("border-accent/20 bg-gradient-to-r from-card via-accent/5 to-card", className)}>
      <CardContent className="py-3 px-4">
        <div className="flex items-center gap-4 overflow-x-auto">
          <div className="flex items-center gap-6 flex-wrap">
            {summaryItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-2 shrink-0">
                  {index > 0 && (
                    <div className="w-px h-8 bg-border/50 mr-2" />
                  )}
                  <Icon className={cn("w-4 h-4", statusColors[item.status as keyof typeof statusColors])} />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold tabular-nums">{item.value}</span>
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{item.sublabel}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
