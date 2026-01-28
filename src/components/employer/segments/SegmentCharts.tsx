/**
 * Segment Charts
 * 
 * Visualizations for the segment builder with interactive drill-down.
 * Uses OBJECTIVE BEHAVIORAL DATA - Budget vs Participation comparison.
 * 
 * EVERY CHART CLICK opens a drilldown with CTAs.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { SegmentMetrics } from './types';
import { formatCurrencyAED, formatPercent, cn } from '@/lib/utils';
import { 
  Lightbulb, 
  TrendingUp, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign, 
  UserCheck, 
  MousePointerClick,
  ChevronRight,
  Mail,
  FileEdit,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface SegmentChartsProps {
  metrics: SegmentMetrics;
  onBenefitClick?: (benefitName: string) => void;
  onInsightClick?: () => void;
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

export function SegmentCharts({ metrics, onBenefitClick, onInsightClick }: SegmentChartsProps) {
  const navigate = useNavigate();

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

  const handleBarClick = (data: any) => {
    if (onBenefitClick && data?.name) {
      onBenefitClick(data.name);
    }
  };

  // Handle request action click
  const handleRequestAction = (need: string) => {
    navigate(`/employer/communications?template=education&topic=${encodeURIComponent(need)}`);
  };

  return (
    <div className="space-y-4">
      {/* Behavioral Gap Insight - Prominent & Clickable */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card 
          className={cn(
            'border-2 transition-all cursor-pointer group',
            'hover:shadow-md hover:scale-[1.01]',
            metrics.behavioralGap === 'high-engagement-low-cost' ? 'border-success/30 bg-success/5' :
            metrics.behavioralGap === 'concentrated-spend' ? 'border-warning/30 bg-warning/5' :
            metrics.behavioralGap === 'balanced' ? 'border-primary/30 bg-primary/5' :
            'border-destructive/30 bg-destructive/5'
          )}
          onClick={onInsightClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onInsightClick?.()}
        >
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
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-base">Behavioral Gap Analysis</h3>
                  <Badge variant="outline" className="text-[10px] gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MousePointerClick className="h-3 w-3" />
                    Click for details
                  </Badge>
                </div>
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
              <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Benefit Mix Stacked Bar - Interactive */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="relative">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                Benefit Mix
                {onBenefitClick && (
                  <Badge variant="outline" className="text-[10px] gap-1 bg-accent/10 border-accent/30">
                    <MousePointerClick className="h-3 w-3" />
                    Click to drill-down
                  </Badge>
                )}
              </CardTitle>
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
                    <Bar 
                      dataKey="percentage" 
                      name="Share" 
                      radius={[0, 4, 4, 0]}
                      onClick={handleBarClick}
                      className={onBenefitClick ? 'cursor-pointer' : ''}
                    >
                      {metrics.benefitMix.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]}
                          className={onBenefitClick ? 'hover:opacity-80 transition-opacity' : ''}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {onBenefitClick && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Click a bar to see employees with that benefit
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Top 3 Requests - Now with actionable CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1"
        >
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-warning" />
                Top 3 Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              {metrics.topNeeds.length > 0 ? (
                <div className="space-y-2">
                  {metrics.topNeeds.map((need, index) => (
                    <div
                      key={need.need}
                      className={cn(
                        "p-2 rounded-lg border text-sm group hover:border-accent/50 transition-colors",
                        index === 0 ? 'bg-accent/10 border-accent/30' : 'bg-muted/50'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="shrink-0 text-xs">
                          #{index + 1}
                        </Badge>
                        <span className="font-medium truncate flex-1">{need.need}</span>
                        <span className="text-xs text-muted-foreground">
                          {need.count}
                        </span>
                      </div>
                      
                      {/* Action buttons - visible on hover */}
                      <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 text-xs gap-1 flex-1"
                          onClick={() => handleRequestAction(need.need)}
                        >
                          <Mail className="h-3 w-3" />
                          Send Comms
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 text-xs gap-1 flex-1"
                          onClick={() => navigate(`/employer/policies?search=${encodeURIComponent(need.need)}`)}
                        >
                          <FileEdit className="h-3 w-3" />
                          Review Policy
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No specific requests identified
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
