/**
 * Segment Metrics Row
 * 
 * Top metric row with live-updating KPIs.
 * Uses OBJECTIVE BEHAVIORAL DATA: Budget Usage & Participation Rate.
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, DollarSign, UserCheck, PieChart } from 'lucide-react';
import { SegmentMetrics } from './types';
import { formatCurrencyAED, formatPercent, formatInteger, cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface SegmentMetricsRowProps {
  metrics: SegmentMetrics;
  title: string;
}

const gapConfig = {
  'high-engagement-low-cost': { 
    label: 'High Engagement / Low Cost', 
    className: 'bg-success/10 text-success border-success/30' 
  },
  'concentrated-spend': { 
    label: 'Concentrated Spend', 
    className: 'bg-warning/10 text-warning border-warning/30' 
  },
  'balanced': { 
    label: 'Balanced', 
    className: 'bg-primary/10 text-primary border-primary/30' 
  },
  'low-engagement': { 
    label: 'Low Engagement', 
    className: 'bg-destructive/10 text-destructive border-destructive/30' 
  },
};

export function SegmentMetricsRow({ metrics, title }: SegmentMetricsRowProps) {
  const gap = gapConfig[metrics.behavioralGap];

  return (
    <div className="space-y-4">
      {/* Dynamic Title */}
      <motion.h2
        key={title}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-lg font-semibold"
      >
        {title}
      </motion.h2>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AnimatePresence mode="wait">
          {/* Matches */}
          <motion.div
            key={`matches-${metrics.matches}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="card-elevated">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold tabular-nums">
                      {formatInteger(metrics.matches)}
                    </p>
                    <p className="text-xs text-muted-foreground">Employees</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Budget Usage (Financial Utilization) */}
          <motion.div
            key={`budget-${metrics.budgetUsage}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: 0.05 }}
          >
            <Card className="card-elevated">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <DollarSign className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className={cn(
                      "text-2xl font-bold tabular-nums",
                      metrics.budgetUsage >= 80 ? 'text-success' :
                      metrics.budgetUsage >= 60 ? 'text-foreground' : 'text-warning'
                    )}>
                      {formatPercent(metrics.budgetUsage)}
                    </p>
                    <p className="text-xs text-muted-foreground">Budget Usage</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Participation Rate (Adoption) */}
          <motion.div
            key={`participation-${metrics.participationRate}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            <Card className="card-elevated">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/10">
                    <UserCheck className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className={cn(
                      "text-2xl font-bold tabular-nums",
                      metrics.participationRate >= 80 ? 'text-success' :
                      metrics.participationRate >= 60 ? 'text-foreground' : 'text-warning'
                    )}>
                      {formatPercent(metrics.participationRate)}
                    </p>
                    <p className="text-xs text-muted-foreground">Employee Participation</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Behavioral Gap */}
          <motion.div
            key={`gap-${metrics.behavioralGap}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: 0.15 }}
          >
            <Card className="card-elevated">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    metrics.behavioralGap === 'high-engagement-low-cost' ? 'bg-success/10' :
                    metrics.behavioralGap === 'concentrated-spend' ? 'bg-warning/10' :
                    metrics.behavioralGap === 'balanced' ? 'bg-primary/10' : 'bg-destructive/10'
                  )}>
                    <PieChart className={cn(
                      "h-5 w-5",
                      metrics.behavioralGap === 'high-engagement-low-cost' ? 'text-success' :
                      metrics.behavioralGap === 'concentrated-spend' ? 'text-warning' :
                      metrics.behavioralGap === 'balanced' ? 'text-primary' : 'text-destructive'
                    )} />
                  </div>
                  <div>
                    <Badge variant="outline" className={cn('text-xs', gap.className)}>
                      {gap.label}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatInteger(metrics.participatingCount)} claiming
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
