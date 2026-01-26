/**
 * Spend Red Flag Badge
 * 
 * Visual indicator for categories that are:
 * - >15% over budget
 * - <50% utilized
 */

import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriangle, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpendRedFlagBadgeProps {
  spend: number;
  budget: number;
  utilization: number;
  className?: string;
}

export function SpendRedFlagBadge({ spend, budget, utilization, className }: SpendRedFlagBadgeProps) {
  const budgetVariancePercent = budget > 0 ? ((spend - budget) / budget) * 100 : 0;
  const isOverBudget = budgetVariancePercent > 15;
  const isUnderutilized = utilization < 50;

  if (!isOverBudget && !isUnderutilized) return null;

  const flags = [];
  if (isOverBudget) flags.push({ type: 'over-budget', label: `${budgetVariancePercent.toFixed(0)}% over budget`, icon: AlertTriangle });
  if (isUnderutilized) flags.push({ type: 'under-utilized', label: `${utilization.toFixed(0)}% utilized`, icon: TrendingDown });

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {flags.map((flag) => {
        const Icon = flag.icon;
        return (
          <Tooltip key={flag.type}>
            <TooltipTrigger asChild>
              <Badge 
                variant="outline" 
                className={cn(
                  "px-1.5 py-0.5 text-[10px] gap-1 cursor-help",
                  flag.type === 'over-budget' 
                    ? "bg-destructive/10 text-destructive border-destructive/30" 
                    : "bg-warning/10 text-warning border-warning/30"
                )}
              >
                <Icon className="h-3 w-3" />
                {flag.type === 'over-budget' ? 'Over' : 'Low'}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{flag.label}</p>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
