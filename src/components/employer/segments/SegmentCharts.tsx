/**
 * Segment Charts
 * 
 * Visualizations for the segment builder - Benefit Mix, Sentiment, Top Needs.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { SegmentMetrics } from './types';
import { formatCurrencyAED, formatPercent, cn } from '@/lib/utils';
import { Smile, Frown, Meh, Lightbulb, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface SegmentChartsProps {
  metrics: SegmentMetrics;
}

const COLORS = ['hsl(var(--accent))', 'hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--chart-5))', 'hsl(var(--chart-6))'];

export function SegmentCharts({ metrics }: SegmentChartsProps) {
  const totalSentiment = metrics.happyCount + metrics.frustratedCount + 
    (metrics.matches - metrics.happyCount - metrics.frustratedCount);
  const neutralCount = metrics.matches - metrics.happyCount - metrics.frustratedCount;
  
  const sentimentData = [
    { name: 'Happy', value: metrics.happyCount, color: 'hsl(var(--success))' },
    { name: 'Neutral', value: neutralCount, color: 'hsl(var(--muted-foreground))' },
    { name: 'Frustrated', value: metrics.frustratedCount, color: 'hsl(var(--destructive))' },
  ];

  const happyPercent = totalSentiment > 0 ? Math.round((metrics.happyCount / totalSentiment) * 100) : 0;
  const frustratedPercent = totalSentiment > 0 ? Math.round((metrics.frustratedCount / totalSentiment) * 100) : 0;

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

  return (
    <div className="space-y-4">
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

        {/* Sentiment Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Sentiment Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Visual Bar */}
                <div className="h-12 flex rounded-lg overflow-hidden">
                  <div
                    className="bg-success flex items-center justify-center text-white text-xs font-medium transition-all"
                    style={{ width: `${happyPercent}%` }}
                  >
                    {happyPercent > 15 && `${happyPercent}%`}
                  </div>
                  <div
                    className="bg-muted flex items-center justify-center text-muted-foreground text-xs font-medium transition-all"
                    style={{ width: `${100 - happyPercent - frustratedPercent}%` }}
                  />
                  <div
                    className="bg-destructive flex items-center justify-center text-white text-xs font-medium transition-all"
                    style={{ width: `${frustratedPercent}%` }}
                  >
                    {frustratedPercent > 15 && `${frustratedPercent}%`}
                  </div>
                </div>

                {/* Legend */}
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-success/10">
                    <Smile className="h-4 w-4 text-success" />
                    <div>
                      <p className="font-semibold">{metrics.happyCount}</p>
                      <p className="text-xs text-muted-foreground">Happy</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    <Meh className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-semibold">{neutralCount}</p>
                      <p className="text-xs text-muted-foreground">Neutral</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10">
                    <Frown className="h-4 w-4 text-destructive" />
                    <div>
                      <p className="font-semibold">{metrics.frustratedCount}</p>
                      <p className="text-xs text-muted-foreground">Frustrated</p>
                    </div>
                  </div>
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
              Top 3 Needs
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
                No specific needs identified for this segment
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
