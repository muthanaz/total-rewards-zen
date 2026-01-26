/**
 * Executive Summary Strip
 * 
 * One-line "executive headline" that answers:
 * "What do I need to know right now?"
 * 
 * Format: "AED X invested | Y% utilized | AED Z recoverable | N priority actions"
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Target, 
  AlertTriangle, 
  Zap,
  TrendingUp,
  TrendingDown,
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
  satisfactionScore,
  className,
}: ExecSummaryStripProps) {
  const budgetVariance = totalInvestment - budgetAllocated;
  const isOverBudget = budgetVariance > 0;
  const isOnTrack = utilizationRate >= targetUtilization;

  const summaryItems = [
    {
      icon: DollarSign,
      label: 'Invested',
      value: formatCurrencyAED(totalInvestment, { abbreviate: true }),
      sublabel: budgetVariance !== 0 
        ? `${isOverBudget ? '+' : ''}${formatCurrencyAED(budgetVariance, { abbreviate: true })} vs budget`
        : 'On budget',
      status: Math.abs(budgetVariance) < budgetAllocated * 0.05 ? 'success' : isOverBudget ? 'warning' : 'success',
    },
    {
      icon: Target,
      label: 'Utilized',
      value: `${utilizationRate}%`,
      sublabel: `Target: ${targetUtilization}%`,
      status: isOnTrack ? 'success' : 'warning',
    },
    {
      icon: AlertTriangle,
      label: 'Recoverable',
      value: formatCurrencyAED(recoverableValue, { abbreviate: true }),
      sublabel: 'Unrealized value',
      status: recoverableValue > totalInvestment * 0.2 ? 'destructive' : 'warning',
    },
    {
      icon: Zap,
      label: 'Priority Actions',
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
        <div className="flex items-center justify-between gap-4 overflow-x-auto">
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

          {/* Overall Status Badge */}
          <Badge 
            variant="outline" 
            className={cn(
              "shrink-0 gap-1",
              isOnTrack 
                ? "bg-success/10 text-success border-success/30" 
                : "bg-warning/10 text-warning border-warning/30"
            )}
          >
            {isOnTrack ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {isOnTrack ? 'On Track' : 'Action Needed'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
