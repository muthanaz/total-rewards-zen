/**
 * Executive KPI Cards
 * 
 * Exactly 4 KPI cards for CEO/CFO dashboard:
 * 1. Total Investment (AED) - with budget variance
 * 2. Utilization Rate (%) - with target
 * 3. Unrealized Value (AED) - with top driver
 * 4. Employee Satisfaction (%) - with benchmark
 * 
 * Each card shows: value, delta vs last period, "Why it moved" as visible subtitle
 */

import { Card, CardContent } from '@/components/ui/card';
import { 
  DollarSign, 
  Target, 
  AlertTriangle, 
  Heart,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { cn, formatCurrencyAED, formatPercent } from '@/lib/utils';

interface KPICardData {
  id: string;
  label: string;
  value: string;
  delta: number;
  deltaLabel: string;
  higherIsBetter: boolean;
  whyMoved: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  subMetric?: {
    label: string;
    value: string;
    status: 'success' | 'warning' | 'destructive' | 'muted';
  };
  topDriver?: string;
}

interface ExecKPICardsProps {
  totalInvestment: number;
  utilizationRate: number;
  unrealizedValue: number;
  satisfactionScore: number;
  budgetAllocated?: number;
  investmentDelta?: number;
  utilizationDelta?: number;
  unrealizedDelta?: number;
  satisfactionDelta?: number;
  utilizationTarget?: number;
  satisfactionBenchmark?: number;
  investmentWhy?: string;
  utilizationWhy?: string;
  unrealizedWhy?: string;
  satisfactionWhy?: string;
  unrealizedBreakdown?: Array<{
    cause: string;
    percent: number;
  }>;
  onKPIClick?: (kpiId: string) => void;
  className?: string;
}

export function ExecKPICards({
  totalInvestment,
  utilizationRate,
  unrealizedValue,
  satisfactionScore,
  budgetAllocated = totalInvestment * 0.95,
  investmentDelta = 8.2,
  utilizationDelta = 5.3,
  unrealizedDelta = -12.4,
  satisfactionDelta = 3.2,
  utilizationTarget = 75,
  satisfactionBenchmark = 80,
  investmentWhy = 'Headcount growth + L&D expansion',
  utilizationWhy = 'Q4 education claims spike',
  unrealizedWhy = 'Awareness campaigns working',
  satisfactionWhy = 'Faster claims approval',
  unrealizedBreakdown = [
    { cause: 'Awareness Gap', percent: 35 },
    { cause: 'Process Friction', percent: 28 },
    { cause: 'Eligibility Confusion', percent: 22 },
    { cause: 'Policy Design', percent: 15 },
  ],
  onKPIClick,
  className,
}: ExecKPICardsProps) {
  const budgetVariance = totalInvestment - budgetAllocated;
  const isOverBudget = budgetVariance > 0;
  const variancePercent = budgetAllocated > 0 ? Math.abs((budgetVariance / budgetAllocated) * 100) : 0;

  // Find top driver for unrealized value
  const topDriver = unrealizedBreakdown.length > 0 
    ? unrealizedBreakdown.reduce((a, b) => a.percent > b.percent ? a : b)
    : null;

  const kpis: KPICardData[] = [
    {
      id: 'totalInvestment',
      label: 'Total Investment',
      value: formatCurrencyAED(totalInvestment, { abbreviate: true }),
      delta: investmentDelta,
      deltaLabel: 'vs last year',
      higherIsBetter: true,
      whyMoved: investmentWhy,
      icon: DollarSign,
      iconColor: 'text-primary',
      iconBg: 'bg-primary/10',
      subMetric: {
        label: 'Budget',
        value: variancePercent < 1 
          ? 'On budget' 
          : `${Math.round(variancePercent)}% ${isOverBudget ? 'over' : 'under'} budget`,
        status: variancePercent < 5 ? 'success' : isOverBudget ? 'warning' : 'success',
      },
    },
    {
      id: 'utilizationRate',
      label: 'Usage Rate',
      value: formatPercent(utilizationRate),
      delta: utilizationDelta,
      deltaLabel: 'vs last quarter',
      higherIsBetter: true,
      whyMoved: utilizationWhy,
      icon: Target,
      iconColor: utilizationRate >= utilizationTarget ? 'text-success' : 'text-warning',
      iconBg: utilizationRate >= utilizationTarget ? 'bg-success/10' : 'bg-warning/10',
      subMetric: {
        label: 'Target',
        value: `${utilizationTarget}%`,
        status: utilizationRate >= utilizationTarget ? 'success' : 'warning',
      },
    },
    {
      id: 'unrealizedValue',
      label: 'Unused Value',
      value: formatCurrencyAED(unrealizedValue, { abbreviate: true }),
      delta: unrealizedDelta,
      deltaLabel: 'vs last quarter',
      higherIsBetter: false,
      whyMoved: unrealizedWhy,
      icon: AlertTriangle,
      iconColor: unrealizedValue > totalInvestment * 0.3 ? 'text-destructive' : 'text-warning',
      iconBg: unrealizedValue > totalInvestment * 0.3 ? 'bg-destructive/10' : 'bg-warning/10',
      topDriver: topDriver ? `Top driver: ${topDriver.cause} (${topDriver.percent}%)` : undefined,
    },
    {
      id: 'satisfactionScore',
      label: 'Employee Satisfaction',
      value: formatPercent(satisfactionScore),
      delta: satisfactionDelta,
      deltaLabel: 'vs last month',
      higherIsBetter: true,
      whyMoved: satisfactionWhy,
      icon: Heart,
      iconColor: satisfactionScore >= satisfactionBenchmark ? 'text-success' : 'text-warning',
      iconBg: satisfactionScore >= satisfactionBenchmark ? 'bg-success/10' : 'bg-warning/10',
      subMetric: {
        label: 'Benchmark',
        value: `${satisfactionBenchmark}%`,
        status: satisfactionScore >= satisfactionBenchmark ? 'success' : 'warning',
      },
    },
  ];

  return (
    <div className={cn('grid grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        const isPositiveMove = kpi.delta > 0;
        const isGoodMove = kpi.higherIsBetter ? isPositiveMove : !isPositiveMove;
        const TrendIcon = kpi.delta > 0 ? TrendingUp : kpi.delta < 0 ? TrendingDown : Minus;
        const trendColor = isGoodMove ? 'text-success' : 'text-destructive';

        return (
          <Card 
            key={kpi.id}
            className={cn(
              'border-border/50 transition-all duration-200',
              onKPIClick && 'cursor-pointer hover:shadow-md hover:border-accent/30'
            )}
            onClick={() => onKPIClick?.(kpi.id)}
          >
            <CardContent className="p-5">
              {/* Header with icon */}
              <div className="flex items-start justify-between mb-3">
                <div className={cn('rounded-xl p-2.5', kpi.iconBg)}>
                  <Icon className={cn('w-5 h-5', kpi.iconColor)} />
                </div>
                {/* Delta indicator */}
                <div className={cn('flex items-center gap-1 text-xs', trendColor)}>
                  <TrendIcon className="w-3 h-3" />
                  <span className="tabular-nums">
                    {kpi.delta > 0 ? '+' : ''}{kpi.delta}%
                  </span>
                </div>
              </div>

              {/* Value */}
              <p className="text-2xl lg:text-3xl font-bold tracking-tight tabular-nums">
                {kpi.value}
              </p>

              {/* Label */}
              <p className="text-sm text-muted-foreground mt-1">{kpi.label}</p>

              {/* Why it moved - visible subtitle */}
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <TrendIcon className={cn("w-3 h-3", trendColor)} />
                {kpi.whyMoved}
              </p>

              {/* Sub-metric OR top driver */}
              <div className="mt-3 pt-3 border-t border-border/50">
                {kpi.topDriver ? (
                  <span className="text-xs text-warning">{kpi.topDriver}</span>
                ) : kpi.subMetric ? (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{kpi.subMetric.label} {kpi.subMetric.value}</span>
                    <span className={cn(
                      kpi.subMetric.status === 'success' ? 'text-success' :
                      kpi.subMetric.status === 'warning' ? 'text-warning' :
                      kpi.subMetric.status === 'destructive' ? 'text-destructive' : 'text-muted-foreground'
                    )}>
                      {kpi.subMetric.status === 'success' ? '✓' : kpi.subMetric.status === 'warning' ? '!' : ''}
                    </span>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
