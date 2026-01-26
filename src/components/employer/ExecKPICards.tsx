/**
 * Executive KPI Cards
 * 
 * Exactly 4 KPI cards for CEO/CFO dashboard:
 * 1. Total Investment (AED) - with budget variance
 * 2. Utilization Rate (%) - with benchmark band
 * 3. Unrealized Value (AED) - with root cause mini-breakdown
 * 4. Employee Satisfaction (%) - replaces SLA (more executive-relevant)
 * 
 * Each card shows: value, delta vs last period, "Why it moved" tooltip
 */

import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  Target, 
  AlertTriangle, 
  Heart,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  PieChart,
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
  miniBreakdown?: Array<{
    label: string;
    percent: number;
    color: string;
  }>;
}

interface ExecKPICardsProps {
  totalInvestment: number;
  utilizationRate: number;
  unrealizedValue: number;
  satisfactionScore: number; // Replaces SLA
  // Budget context
  budgetAllocated?: number;
  // Deltas (vs last period)
  investmentDelta?: number;
  utilizationDelta?: number;
  unrealizedDelta?: number;
  satisfactionDelta?: number;
  // Targets/benchmarks
  utilizationTarget?: number;
  satisfactionBenchmark?: number;
  // Why it moved explanations
  investmentWhy?: string;
  utilizationWhy?: string;
  unrealizedWhy?: string;
  satisfactionWhy?: string;
  // Unrealized value breakdown
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
  budgetAllocated = totalInvestment * 0.95, // Default 5% over budget
  investmentDelta = 8.2,
  utilizationDelta = 5.3,
  unrealizedDelta = -12.4,
  satisfactionDelta = 3.2,
  utilizationTarget = 75,
  satisfactionBenchmark = 80,
  investmentWhy = 'Annual budget increased by 8% due to headcount growth and new L&D programs.',
  utilizationWhy = 'Q4 utilization improved with education claims during school enrollment period.',
  unrealizedWhy = 'Reduced unrealized value through targeted awareness campaigns for unused benefits.',
  satisfactionWhy = 'Satisfaction improved due to streamlined claims process and faster approvals.',
  unrealizedBreakdown = [
    { cause: 'Awareness', percent: 35 },
    { cause: 'Friction', percent: 28 },
    { cause: 'Eligibility', percent: 22 },
    { cause: 'Policy', percent: 15 },
  ],
  onKPIClick,
  className,
}: ExecKPICardsProps) {
  const budgetVariance = totalInvestment - budgetAllocated;
  const isOverBudget = budgetVariance > 0;
  const variancePercent = budgetAllocated > 0 ? Math.abs((budgetVariance / budgetAllocated) * 100) : 0;

  const breakdownColors = ['hsl(var(--info))', 'hsl(var(--warning))', 'hsl(var(--chart-3))', 'hsl(var(--destructive))'];

  const kpis: KPICardData[] = [
    {
      id: 'totalInvestment',
      label: 'Total Investment',
      value: formatCurrencyAED(totalInvestment),
      delta: investmentDelta,
      deltaLabel: 'vs last year',
      higherIsBetter: true,
      whyMoved: investmentWhy,
      icon: DollarSign,
      iconColor: 'text-primary',
      iconBg: 'bg-primary/10',
      subMetric: {
        label: 'vs Budget',
        value: `${isOverBudget ? '+' : '-'}${formatCurrencyAED(Math.abs(budgetVariance), { abbreviate: true })} (${variancePercent.toFixed(1)}%)`,
        status: variancePercent < 5 ? 'success' : isOverBudget ? 'warning' : 'success',
      },
    },
    {
      id: 'utilizationRate',
      label: 'Utilization Rate',
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
      label: 'Unrealized Value',
      value: formatCurrencyAED(unrealizedValue),
      delta: unrealizedDelta,
      deltaLabel: 'vs last quarter',
      higherIsBetter: false, // Lower is better
      whyMoved: unrealizedWhy,
      icon: AlertTriangle,
      iconColor: unrealizedValue > totalInvestment * 0.3 ? 'text-destructive' : 'text-warning',
      iconBg: unrealizedValue > totalInvestment * 0.3 ? 'bg-destructive/10' : 'bg-warning/10',
      miniBreakdown: unrealizedBreakdown.map((item, idx) => ({
        label: item.cause,
        percent: item.percent,
        color: breakdownColors[idx % breakdownColors.length],
      })),
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
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className={cn('rounded-xl p-2.5', kpi.iconBg)}>
                  <Icon className={cn('w-5 h-5', kpi.iconColor)} />
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="p-1 hover:bg-muted rounded">
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p className="text-xs font-medium mb-1">Why it moved</p>
                    <p className="text-xs text-muted-foreground">{kpi.whyMoved}</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Value */}
              <p className="text-2xl lg:text-3xl font-bold tracking-tight tabular-nums">
                {kpi.value}
              </p>

              {/* Label */}
              <p className="text-sm text-muted-foreground mt-1">{kpi.label}</p>

              {/* Sub-metric (budget variance, target, benchmark) */}
              {kpi.subMetric && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{kpi.subMetric.label}:</span>
                  <span className={cn(
                    'text-xs font-medium',
                    kpi.subMetric.status === 'success' ? 'text-success' :
                    kpi.subMetric.status === 'warning' ? 'text-warning' :
                    kpi.subMetric.status === 'destructive' ? 'text-destructive' : 'text-muted-foreground'
                  )}>
                    {kpi.subMetric.value}
                  </span>
                </div>
              )}

              {/* Mini breakdown for Unrealized Value */}
              {kpi.miniBreakdown && (
                <div className="mt-2">
                  <div className="flex h-1.5 rounded-full overflow-hidden bg-muted">
                    {kpi.miniBreakdown.map((item, idx) => (
                      <div 
                        key={item.label}
                        className="h-full"
                        style={{ 
                          width: `${item.percent}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {kpi.miniBreakdown.slice(0, 2).map((item) => (
                      <span key={item.label} className="text-[10px] text-muted-foreground">
                        {item.label} {item.percent}%
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Delta */}
              <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{kpi.deltaLabel}</span>
                <div className={cn('flex items-center gap-1 text-xs', trendColor)}>
                  <TrendIcon className="w-3 h-3" />
                  <span className="tabular-nums">
                    {kpi.delta > 0 ? '+' : ''}{kpi.delta}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
