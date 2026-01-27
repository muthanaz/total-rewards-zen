/**
 * Bullet Chart Component
 * 
 * Bar-in-Bar visualization comparing Budget Usage vs Participation Rate.
 * Compact, space-efficient design for executive dashboards.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SegmentMetrics } from './types';
import { formatPercent, formatCurrencyAED, cn } from '@/lib/utils';
import { DollarSign, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface BulletChartProps {
  metrics: SegmentMetrics;
}

export function BulletChart({ metrics }: BulletChartProps) {
  const { budgetUsage, participationRate, totalSpend, totalBudget, participatingCount, matches } = metrics;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Usage vs Adoption (Bullet Chart)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Combined Bullet Chart */}
        <div className="space-y-3">
          {/* Budget Usage (Background bar) + Participation Rate (Foreground bar) */}
          <div className="relative">
            {/* Background: Budget Usage (Gray) */}
            <div className="h-10 bg-muted/60 rounded-md overflow-hidden relative">
              <motion.div
                className="absolute inset-y-0 left-0 bg-muted-foreground/30 rounded-md"
                initial={{ width: 0 }}
                animate={{ width: `${budgetUsage}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
              {/* Foreground: Participation Rate (Green) */}
              <motion.div
                className="absolute inset-y-1.5 left-0 bg-success rounded-sm mx-1"
                initial={{ width: 0 }}
                animate={{ width: `calc(${participationRate}% - 8px)` }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
              />
              {/* Target marker at 75% */}
              <div 
                className="absolute inset-y-0 w-0.5 bg-foreground/60"
                style={{ left: '75%' }}
              />
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-muted-foreground/30" />
              <span className="text-muted-foreground">Budget Usage:</span>
              <span className="font-semibold tabular-nums">{formatPercent(budgetUsage)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-success" />
              <span className="text-muted-foreground">Participation:</span>
              <span className="font-semibold tabular-nums">{formatPercent(participationRate)}</span>
            </div>
          </div>

          {/* Detail Stats */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/50">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-accent" />
              <div className="text-xs">
                <span className="text-muted-foreground">Spent: </span>
                <span className="font-medium">{formatCurrencyAED(totalSpend, { abbreviate: true })}</span>
                <span className="text-muted-foreground"> / {formatCurrencyAED(totalBudget, { abbreviate: true })}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-success" />
              <div className="text-xs">
                <span className="text-muted-foreground">Participating: </span>
                <span className="font-medium">{participatingCount}</span>
                <span className="text-muted-foreground"> / {matches} employees</span>
              </div>
            </div>
          </div>

          {/* Insight */}
          <div className="text-xs text-muted-foreground bg-muted/30 rounded-md px-3 py-2">
            <span className="font-medium">Insight: </span>
            {participationRate > budgetUsage ? (
              <span>High engagement with efficient spend — benefits are well-valued.</span>
            ) : participationRate < budgetUsage - 20 ? (
              <span>Concentrated spend pattern — few users driving most costs.</span>
            ) : (
              <span>Balanced utilization across the segment.</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}