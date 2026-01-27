/**
 * Executive Spend Chart
 * 
 * A horizontal bar chart designed for CEO-level visualization of spend allocation.
 * Shows ranked categories with amounts and percentages for quick scanning.
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { formatCurrencyAED } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface SpendCategory {
  name: string;
  value: number;
  amount?: number;
  color?: string;
}

interface ExecutiveSpendChartProps {
  data: SpendCategory[];
  totalAmount?: number;
  className?: string;
  showRank?: boolean;
  maxItems?: number;
}

export function ExecutiveSpendChart({
  data,
  totalAmount,
  className,
  showRank = true,
  maxItems = 6,
}: ExecutiveSpendChartProps) {
  const chartData = useMemo(() => {
    // Sort by value descending and take top items
    const sorted = [...data]
      .sort((a, b) => (b.amount || b.value) - (a.amount || a.value))
      .slice(0, maxItems);
    
    const total = totalAmount || sorted.reduce((sum, item) => sum + (item.amount || item.value), 0);
    const maxValue = Math.max(...sorted.map(item => item.amount || item.value));
    
    return sorted.map((item, index) => ({
      ...item,
      amount: item.amount || item.value * 50000, // Fallback calculation
      percentage: total > 0 ? ((item.amount || item.value * 50000) / total) * 100 : 0,
      widthPercent: maxValue > 0 ? ((item.amount || item.value) / maxValue) * 100 : 0,
      rank: index + 1,
      color: item.color || `hsl(var(--chart-${(index % 6) + 1}))`,
    }));
  }, [data, totalAmount, maxItems]);

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        No spend data available
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {chartData.map((item, index) => (
        <motion.div
          key={item.name}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
          className="group"
        >
          <div className="flex items-center gap-3">
            {/* Rank indicator */}
            {showRank && (
              <div 
                className={cn(
                  "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                  index === 0 && "bg-primary/20 text-primary",
                  index === 1 && "bg-muted text-muted-foreground",
                  index === 2 && "bg-muted text-muted-foreground",
                  index > 2 && "bg-muted/50 text-muted-foreground"
                )}
              >
                {item.rank}
              </div>
            )}
            
            {/* Category name */}
            <div className="flex-shrink-0 w-24 text-sm font-medium truncate">
              {item.name}
            </div>
            
            {/* Bar container */}
            <div className="flex-1 relative">
              <div className="h-8 bg-muted/30 rounded-md overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.widthPercent}%` }}
                  transition={{ delay: index * 0.05 + 0.2, duration: 0.5, ease: "easeOut" }}
                  className="h-full rounded-md relative"
                  style={{ backgroundColor: item.color }}
                >
                  {/* Inner gradient overlay for depth */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10" />
                </motion.div>
              </div>
            </div>
            
            {/* Amount and percentage */}
            <div className="flex-shrink-0 text-right min-w-[140px]">
              <div className="text-sm font-semibold tabular-nums">
                {formatCurrencyAED(item.amount, { abbreviate: true })}
              </div>
              <div className="text-xs text-muted-foreground tabular-nums">
                {item.percentage.toFixed(1)}% of total
              </div>
            </div>
          </div>
        </motion.div>
      ))}
      
      {/* Summary footer */}
      {totalAmount && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="pt-3 mt-3 border-t border-border/50"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Investment</span>
            <span className="font-bold text-lg">
              {formatCurrencyAED(totalAmount, { abbreviate: true })}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
