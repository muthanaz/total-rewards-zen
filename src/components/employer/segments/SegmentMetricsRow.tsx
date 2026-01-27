/**
 * Segment Metrics Row
 * 
 * Top metric row with live-updating KPIs for the current filter.
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { SegmentMetrics } from './types';
import { formatCurrencyAED, formatPercent, formatInteger, cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface SegmentMetricsRowProps {
  metrics: SegmentMetrics;
  title: string;
}

const riskConfig = {
  high: { label: 'High Risk', className: 'bg-destructive/10 text-destructive border-destructive/30' },
  medium: { label: 'Medium Risk', className: 'bg-warning/10 text-warning border-warning/30' },
  low: { label: 'Low Risk', className: 'bg-success/10 text-success border-success/30' },
};

export function SegmentMetricsRow({ metrics, title }: SegmentMetricsRowProps) {
  const risk = riskConfig[metrics.riskScore];

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

          {/* Total Spend */}
          <motion.div
            key={`spend-${metrics.totalSpend}`}
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
                    <p className="text-2xl font-bold tabular-nums">
                      {formatCurrencyAED(metrics.totalSpend, { abbreviate: true })}
                    </p>
                    <p className="text-xs text-muted-foreground">Total Spend</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Utilization */}
          <motion.div
            key={`util-${metrics.utilizationRate}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            <Card className="card-elevated">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/10">
                    <TrendingUp className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className={cn(
                      "text-2xl font-bold tabular-nums",
                      metrics.utilizationRate >= 80 ? 'text-success' :
                      metrics.utilizationRate >= 60 ? 'text-foreground' : 'text-warning'
                    )}>
                      {formatPercent(metrics.utilizationRate)}
                    </p>
                    <p className="text-xs text-muted-foreground">Utilization</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Risk Score */}
          <motion.div
            key={`risk-${metrics.riskScore}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: 0.15 }}
          >
            <Card className="card-elevated">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    metrics.riskScore === 'high' ? 'bg-destructive/10' :
                    metrics.riskScore === 'medium' ? 'bg-warning/10' : 'bg-success/10'
                  )}>
                    <AlertTriangle className={cn(
                      "h-5 w-5",
                      metrics.riskScore === 'high' ? 'text-destructive' :
                      metrics.riskScore === 'medium' ? 'text-warning' : 'text-success'
                    )} />
                  </div>
                  <div>
                    <Badge variant="outline" className={cn('text-xs', risk.className)}>
                      {risk.label}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {metrics.frustratedCount} frustrated
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
