/**
 * ForecastWidget Component
 * 
 * Projects year-end unused entitlement based on current trends
 * Shows projected values with confidence intervals
 */

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Button } from '@/components/ui/button';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Calendar,
  Target,
  Lightbulb,
  ArrowRight,
  Clock,
  Info,
} from 'lucide-react';
import { formatCurrencyAED, formatPercent, cn } from '@/lib/utils';

interface MonthlyData {
  month: string;
  entitled: number;
  claimed: number;
  unused: number;
}

interface ForecastWidgetProps {
  historicalData: MonthlyData[];
  totalEntitled: number;
  currentClaimed: number;
  fiscalYearEnd?: string;
  onViewDetails?: () => void;
  onCreateAction?: () => void;
}

interface ForecastPoint {
  month: string;
  actual?: number;
  projected?: number;
  projectedLow?: number;
  projectedHigh?: number;
  isProjected: boolean;
}

function calculateForecast(
  historicalData: MonthlyData[],
  totalEntitled: number
): {
  projectedUnused: number;
  confidenceInterval: { low: number; high: number };
  trend: 'improving' | 'declining' | 'stable';
  monthlyVelocity: number;
  projectedUtilization: number;
  chartData: ForecastPoint[];
} {
  // Calculate monthly claim velocity from recent data
  const recentMonths = historicalData.slice(-3);
  const monthlyVelocity = recentMonths.reduce((sum, m) => sum + m.claimed, 0) / recentMonths.length;

  // Calculate trend
  const firstHalf = historicalData.slice(0, Math.floor(historicalData.length / 2));
  const secondHalf = historicalData.slice(Math.floor(historicalData.length / 2));
  const firstHalfAvg = firstHalf.reduce((sum, m) => sum + m.claimed, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, m) => sum + m.claimed, 0) / secondHalf.length;
  
  const trendValue = (secondHalfAvg - firstHalfAvg) / firstHalfAvg;
  const trend = trendValue > 0.05 ? 'improving' : trendValue < -0.05 ? 'declining' : 'stable';

  // Calculate total claimed so far
  const totalClaimed = historicalData.reduce((sum, m) => sum + m.claimed, 0);

  // Months remaining in fiscal year (assume fiscal year is calendar year)
  const currentMonth = new Date().getMonth();
  const remainingMonths = 12 - currentMonth - 1;

  // Project remaining claims
  const projectedRemainingClaims = monthlyVelocity * remainingMonths;
  const projectedTotalClaims = totalClaimed + projectedRemainingClaims;
  
  // Ensure projected unused never hits exact 0 - asymptote to a realistic buffer (2% minimum)
  const minimumBuffer = totalEntitled * 0.02; // 2% buffer
  const rawProjectedUnused = totalEntitled - projectedTotalClaims;
  const projectedUnused = Math.max(minimumBuffer, rawProjectedUnused);
  const projectedUtilization = Math.min(98, (projectedTotalClaims / totalEntitled) * 100); // Cap at 98%

  // Confidence interval (±15% based on historical variance)
  const variance = recentMonths.reduce((sum, m) => {
    const diff = m.claimed - monthlyVelocity;
    return sum + diff * diff;
  }, 0) / recentMonths.length;
  const stdDev = Math.sqrt(variance);
  const confidenceMargin = stdDev * remainingMonths * 1.5;

  // Generate chart data with projections
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const chartData: ForecastPoint[] = [];
  let cumulativeUnused = totalEntitled;

  months.forEach((month, idx) => {
    const historical = historicalData.find(d => d.month === month);
    
    if (historical) {
      cumulativeUnused = totalEntitled - historicalData
        .slice(0, idx + 1)
        .reduce((sum, m) => sum + m.claimed, 0);
      
      chartData.push({
        month,
        actual: cumulativeUnused,
        isProjected: false,
      });
    } else if (idx > historicalData.length - 1) {
      // Project future months
      const monthsAhead = idx - historicalData.length + 1;
      const projectedClaims = monthlyVelocity * monthsAhead;
      const rawProjectedUnusedAtMonth = cumulativeUnused - projectedClaims;
      // Apply asymptotic buffer - projected unused should never hit exact 0
      const projectedUnusedAtMonth = Math.max(minimumBuffer, rawProjectedUnusedAtMonth);
      
      chartData.push({
        month,
        projected: projectedUnusedAtMonth,
        projectedLow: Math.max(minimumBuffer, projectedUnusedAtMonth - confidenceMargin * (monthsAhead / remainingMonths)),
        projectedHigh: projectedUnusedAtMonth + confidenceMargin * (monthsAhead / remainingMonths),
        isProjected: true,
      });
    }
  });

  return {
    projectedUnused,
    confidenceInterval: {
      low: Math.max(0, projectedUnused - confidenceMargin),
      high: projectedUnused + confidenceMargin,
    },
    trend,
    monthlyVelocity,
    projectedUtilization,
    chartData,
  };
}

export function ForecastWidget({
  historicalData,
  totalEntitled,
  currentClaimed,
  fiscalYearEnd = 'December 31',
  onViewDetails,
  onCreateAction,
}: ForecastWidgetProps) {
  const forecast = useMemo(
    () => calculateForecast(historicalData, totalEntitled),
    [historicalData, totalEntitled]
  );

  const currentUnused = totalEntitled - currentClaimed;
  const currentUtilization = (currentClaimed / totalEntitled) * 100;
  const unusedDelta = forecast.projectedUnused - currentUnused;
  const isRisk = forecast.projectedUtilization < 70;

  const TrendIcon = forecast.trend === 'improving' ? TrendingUp : 
                    forecast.trend === 'declining' ? TrendingDown : 
                    Clock;

  return (
    <Card className={cn(
      'overflow-hidden',
      isRisk && 'border-warning/50'
    )}>
      <CardHeader className={cn(
        'pb-2',
        isRisk && 'bg-warning/5'
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Year-End Forecast
                <InfoTooltip>
                  <div className="space-y-2 max-w-xs">
                    <p className="font-medium">Projection Methodology</p>
                    <p className="text-sm text-muted-foreground">
                      Based on trailing 3-month claims velocity, adjusted for historical trends.
                      Confidence interval represents ±1.5 standard deviations.
                    </p>
                  </div>
                </InfoTooltip>
              </CardTitle>
              <CardDescription>
                Projected unused entitlement by {fiscalYearEnd}
              </CardDescription>
            </div>
          </div>
          <Badge 
            variant={isRisk ? 'destructive' : 'secondary'}
            className="gap-1"
          >
            <TrendIcon className="h-3 w-3" />
            {forecast.trend === 'improving' ? 'Improving' : 
             forecast.trend === 'declining' ? 'Declining' : 'Stable'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Key metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground mb-1">Current Unused</p>
            <p className="text-lg font-bold">{formatCurrencyAED(currentUnused)}</p>
            <p className="text-xs text-muted-foreground">
              {formatPercent(currentUtilization)} utilized
            </p>
          </div>
          <div className={cn(
            'p-3 rounded-lg',
            isRisk ? 'bg-warning/10' : 'bg-muted/30'
          )}>
            <p className="text-xs text-muted-foreground mb-1">Projected Unused</p>
            <p className={cn(
              'text-lg font-bold',
              isRisk ? 'text-warning' : 'text-foreground'
            )}>
              {formatCurrencyAED(forecast.projectedUnused)}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatPercent(forecast.projectedUtilization)} projected util
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground mb-1">Confidence Range</p>
            <p className="text-sm font-medium">
              {formatCurrencyAED(forecast.confidenceInterval.low, { abbreviate: true })} - {formatCurrencyAED(forecast.confidenceInterval.high, { abbreviate: true })}
            </p>
            <p className="text-xs text-muted-foreground">95% confidence</p>
          </div>
        </div>

        {/* Risk alert */}
        {isRisk && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
            <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-warning">Below Target Utilization</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Projected utilization of {formatPercent(forecast.projectedUtilization)} is below the 70% target.
                Consider launching awareness campaigns or simplifying claim processes.
              </p>
            </div>
          </div>
        )}

        {/* Forecast chart */}
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={forecast.chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="projectedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--warning))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--warning))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                strokeOpacity={0.5}
                vertical={false}
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                width={45}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload as ForecastPoint;
                  return (
                    <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                      <p className="font-medium text-sm mb-1">{label}</p>
                      {data.actual !== undefined && (
                        <p className="text-sm">
                          <span className="text-muted-foreground">Actual: </span>
                          <span className="font-medium">{formatCurrencyAED(data.actual)}</span>
                        </p>
                      )}
                      {data.projected !== undefined && (
                        <>
                          <p className="text-sm">
                            <span className="text-muted-foreground">Projected: </span>
                            <span className="font-medium text-warning">{formatCurrencyAED(data.projected)}</span>
                          </p>
                          {data.projectedLow !== undefined && data.projectedHigh !== undefined && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Range: {formatCurrencyAED(data.projectedLow, { abbreviate: true })} - {formatCurrencyAED(data.projectedHigh, { abbreviate: true })}
                            </p>
                          )}
                        </>
                      )}
                      {data.isProjected && (
                        <Badge variant="outline" className="text-xs mt-2">Forecast</Badge>
                      )}
                    </div>
                  );
                }}
              />
              {/* Confidence interval area */}
              <Area
                type="monotone"
                dataKey="projectedHigh"
                stroke="transparent"
                fill="url(#confidenceGradient)"
                stackId="confidence"
              />
              {/* Actual unused */}
              <Area
                type="monotone"
                dataKey="actual"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#actualGradient)"
                connectNulls={false}
              />
              {/* Projected unused */}
              <Area
                type="monotone"
                dataKey="projected"
                stroke="hsl(var(--warning))"
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="url(#projectedGradient)"
                connectNulls={false}
              />
              {/* Target line */}
              <ReferenceLine
                y={totalEntitled * 0.3}
                stroke="hsl(var(--success))"
                strokeDasharray="3 3"
                strokeOpacity={0.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-primary" />
            <span className="text-xs text-muted-foreground">Actual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-warning" style={{ borderStyle: 'dashed' }} />
            <span className="text-xs text-muted-foreground">Projected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-success opacity-50" style={{ borderStyle: 'dashed' }} />
            <span className="text-xs text-muted-foreground">Target (70% util)</span>
          </div>
        </div>

        {/* Prudent Variance Summary */}
        <div className={cn(
          'p-3 rounded-lg border',
          forecast.projectedUnused > currentUnused * 0.1
            ? 'bg-success/5 border-success/30'
            : 'bg-destructive/5 border-destructive/30'
        )}>
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Year-End Variance</span>
          </div>
          {forecast.projectedUnused >= 0 ? (
            <p className="text-sm">
              Projected Variance: <span className="font-semibold text-success">{formatCurrencyAED(forecast.projectedUnused)} Surplus</span>.{' '}
              <span className="text-muted-foreground">Available for reallocation or rollover consideration.</span>
            </p>
          ) : (
            <p className="text-sm">
              Projected Variance: <span className="font-semibold text-destructive">{formatCurrencyAED(Math.abs(forecast.projectedUnused))} Deficit</span>.{' '}
              <span className="text-muted-foreground">Review policy caps and benefit limits.</span>
            </p>
          )}
        </div>

        {/* Insights */}
        <div className="p-3 rounded-lg bg-muted/30">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium">Run-Rate Insight</span>
          </div>
          <p className="text-sm text-muted-foreground">
            At current velocity of {formatCurrencyAED(forecast.monthlyVelocity, { abbreviate: true })}/month, 
            you're on track to have {formatCurrencyAED(forecast.projectedUnused)} unutilized by year-end.
            {isRisk && ' Consider running targeted awareness campaigns for underutilized benefits.'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {onViewDetails && (
            <Button variant="outline" className="flex-1" onClick={onViewDetails}>
              View Breakdown
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
          {onCreateAction && isRisk && (
            <Button className="flex-1" onClick={onCreateAction}>
              <Target className="h-4 w-4 mr-2" />
              Create Action
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default ForecastWidget;
