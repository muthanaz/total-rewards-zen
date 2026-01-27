/**
 * Budget vs Actual Chart
 * 
 * A horizontal bar chart for CEO-level gap analysis.
 * Shows budget allocation vs actual spend per category with clear gap visualization.
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { formatCurrencyAED } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface BudgetCategory {
  name: string;
  budget: number;
  actual: number;
  color?: string;
}

interface BudgetVsActualChartProps {
  data: BudgetCategory[];
  className?: string;
  maxItems?: number;
}

export function BudgetVsActualChart({
  data,
  className,
  maxItems = 6,
}: BudgetVsActualChartProps) {
  const chartData = useMemo(() => {
    // Sort by budget descending and take top items
    const sorted = [...data]
      .sort((a, b) => b.budget - a.budget)
      .slice(0, maxItems);
    
    const maxBudget = Math.max(...sorted.map(item => item.budget));
    
    return sorted.map((item, index) => {
      const utilizationPercent = item.budget > 0 ? (item.actual / item.budget) * 100 : 0;
      const isOverBudget = item.actual > item.budget;
      const gap = item.budget - item.actual;
      
      return {
        ...item,
        utilizationPercent: Math.min(utilizationPercent, 100), // Cap at 100% for bar display
        actualUtilization: utilizationPercent, // Real value for display
        widthPercent: maxBudget > 0 ? (item.budget / maxBudget) * 100 : 0,
        isOverBudget,
        gap,
        color: item.color || `hsl(var(--chart-${(index % 6) + 1}))`,
      };
    });
  }, [data, maxItems]);

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        No budget data available
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {chartData.map((item, index) => (
        <motion.div
          key={item.name}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
          className="group"
        >
          <div className="space-y-1.5">
            {/* Category label and gap text */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{item.name}</span>
              <span className="text-xs tabular-nums text-muted-foreground">
                {formatCurrencyAED(item.actual, { abbreviate: true })} used / {formatCurrencyAED(item.budget, { abbreviate: true })} Budget
              </span>
            </div>
            
            {/* Bar container - gray background represents 100% budget */}
            <div className="relative h-6 bg-muted/50 rounded-md overflow-hidden">
              {/* Actual spend bar */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.utilizationPercent}%` }}
                transition={{ delay: index * 0.05 + 0.2, duration: 0.5, ease: "easeOut" }}
                className={cn(
                  "h-full rounded-md relative",
                  item.isOverBudget ? "bg-destructive" : "bg-success"
                )}
              >
                {/* Inner gradient overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10" />
              </motion.div>
              
              {/* Percentage indicator inside bar */}
              {item.utilizationPercent > 15 && (
                <span className={cn(
                  "absolute left-2 top-1/2 -translate-y-1/2 text-xs font-medium",
                  item.isOverBudget ? "text-destructive-foreground" : "text-success-foreground"
                )}>
                  {Math.round(item.actualUtilization)}%
                </span>
              )}
            </div>
            
            {/* Gap indicator */}
            <div className="flex items-center justify-end">
              {item.isOverBudget ? (
                <span className="text-xs text-destructive font-medium">
                  ⚠ {formatCurrencyAED(Math.abs(item.gap), { abbreviate: true })} over budget
                </span>
              ) : item.gap > 0 ? (
                <span className="text-xs text-success">
                  {formatCurrencyAED(item.gap, { abbreviate: true })} remaining
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">On target</span>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
