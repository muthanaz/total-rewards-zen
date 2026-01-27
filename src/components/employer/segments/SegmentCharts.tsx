/**
 * Segment Charts
 * 
 * Visualizations for the segment builder.
 * Uses OBJECTIVE BEHAVIORAL DATA - Budget vs Participation comparison.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { SegmentMetrics } from './types';
import { formatCurrencyAED, formatPercent, cn } from '@/lib/utils';
import { Lightbulb, TrendingUp, Target, AlertTriangle, CheckCircle, DollarSign, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface SegmentChartsProps {
  metrics: SegmentMetrics;
}

const COLORS = ['hsl(var(--accent))', 'hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--chart-5))', 'hsl(var(--chart-6))'];

const gapIcons = {
  'high-engagement-low-cost': CheckCircle,
  'concentrated-spend': AlertTriangle,
  'balanced': Target,
  'low-engagement': TrendingUp,
};

const gapColors = {
  'high-engagement-low-cost': 'text-success',
  'concentrated-spend': 'text-warning',
  'balanced': 'text-primary',
  'low-engagement': 'text-destructive',
};

export function SegmentCharts({ metrics }: SegmentChartsProps) {
  if (metrics.matches === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <TrendingUp className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="font-semibold text-lg mb-2">No Employees Match</h3>
          <p className="text-sm text-muted-foreground max-w-[280px]">
            Adjust your filters to see segment analytics and insights
          </p>
        </CardContent>
      </Card>
    );
  }

  const GapIcon = gapIcons[metrics.behavioralGap];

  return (
    <div className="space-y-4">
      {/* Behavioral Gap Insight - Prominent display */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className={cn(
          'border-2',
          metrics.behavioralGap === 'high-engagement-low-cost' ? 'border-success/30 bg-success/5' :
          metrics.behavioralGap === 'concentrated-spend' ? 'border-warning/30 bg-warning/5' :
          metrics.behavioralGap === 'balanced' ? 'border-primary/30 bg-primary/5' :
          'border-destructive/30 bg-destructive/5'
        )}>
          <CardContent className="py-4">
            <div className="flex items-start gap-4">
              <div className={cn(
                'p-3 rounded-xl shrink-0',
                metrics.behavioralGap === 'high-engagement-low-cost' ? 'bg-success/10' :
                metrics.behavioralGap === 'concentrated-spend' ? 'bg-warning/10' :
                metrics.behavioralGap === 'balanced' ? 'bg-primary/10' :
                'bg-destructive/10'
              )}>
                <GapIcon className={cn('h-6 w-6', gapColors[metrics.behavioralGap])} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base mb-1">Behavioral Gap Analysis</h3>
                <p className="text-sm text-muted-foreground">{metrics.behavioralGapInsight}</p>
                
                {/* Visual comparison */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-success" />
                    <span className="text-sm">
                      <span className="font-semibold">{formatPercent(metrics.participationRate)}</span>{' '}
                      <span className="text-muted-foreground">Participation</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-accent" />
                    <span className="text-sm">
                      <span className="font-semibold">{formatPercent(metrics.budgetUsage)}</span>{' '}
                      <span className="text-muted-foreground">Budget Usage</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Benefit Mix Stacked Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Benefit Mix</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={metrics.benefitMix}
                    layout="vertical"
                    margin={{ left: 0, right: 10 }}
                  >
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={70}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip
                      formatter={(value: number, name: string, props: any) => [
                        `${value}% (${formatCurrencyAED(props.payload.amount)})`,
                        'Share'
                      ]}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="percentage" name="Share" radius={[0, 4, 4, 0]}>
                      {metrics.benefitMix.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Budget vs Participation Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Usage vs Adoption</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 py-2">
                {/* Budget Usage Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-accent" />
                      Budget Usage
                    </span>
                    <span className="font-semibold tabular-nums">{formatPercent(metrics.budgetUsage)}</span>
                  </div>
                  <div className="h-6 bg-muted rounded-md overflow-hidden relative">
                    <motion.div
                      className="h-full bg-accent rounded-md"
                      initial={{ width: 0 }}
                      animate={{ width: `${metrics.budgetUsage}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                      {formatCurrencyAED(metrics.totalSpend, { abbreviate: true })} / {formatCurrencyAED(metrics.totalBudget, { abbreviate: true })}
                    </div>
                  </div>
                </div>

                {/* Participation Rate Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-success" />
                      Employee Participation
                    </span>
                    <span className="font-semibold tabular-nums">{formatPercent(metrics.participationRate)}</span>
                  </div>
                  <div className="h-6 bg-muted rounded-md overflow-hidden relative">
                    <motion.div
                      className="h-full bg-success rounded-md"
                      initial={{ width: 0 }}
                      animate={{ width: `${metrics.participationRate}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                      {metrics.participatingCount} / {metrics.matches} employees
                    </div>
                  </div>
                </div>

                {/* Gap indicator */}
                <div className="flex items-center justify-center gap-2 pt-2 border-t border-border/50">
                  <span className="text-xs text-muted-foreground">Gap:</span>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      'text-xs',
                      metrics.behavioralGap === 'high-engagement-low-cost' ? 'bg-success/10 text-success border-success/30' :
                      metrics.behavioralGap === 'concentrated-spend' ? 'bg-warning/10 text-warning border-warning/30' :
                      metrics.behavioralGap === 'balanced' ? 'bg-primary/10 text-primary border-primary/30' :
                      'bg-destructive/10 text-destructive border-destructive/30'
                    )}
                  >
                    {Math.abs(metrics.participationRate - metrics.budgetUsage)}% difference
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top 3 Needs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-warning" />
              Top 3 Requests (from Claims Data)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.topNeeds.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {metrics.topNeeds.map((need, index) => (
                  <div
                    key={need.need}
                    className={cn(
                      "p-3 rounded-lg border",
                      index === 0 ? 'bg-accent/10 border-accent/30' : 'bg-muted/50'
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="shrink-0">
                        #{index + 1}
                      </Badge>
                      <div>
                        <p className="text-sm font-medium">{need.need}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {need.count} employees requesting
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No specific requests identified for this segment
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
