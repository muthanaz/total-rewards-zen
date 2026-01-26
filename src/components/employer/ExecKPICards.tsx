/**
 * Executive KPI Cards
 * 
 * Exactly 4 KPI cards for CEO/CFO dashboard:
 * 1. Total Investment (AED)
 * 2. Utilization Rate (%)
 * 3. Unrealized Value (AED) - renamed from Unused Budget
 * 4. SLA Compliance (%)
 * 
 * Each card shows: value, delta vs last period, "Why it moved" tooltip
 */

import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  DollarSign, 
  Target, 
  AlertTriangle, 
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
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
}

interface ExecKPICardsProps {
  totalInvestment: number;
  utilizationRate: number;
  unrealizedValue: number;
  slaCompliance: number;
  // Deltas (vs last period)
  investmentDelta?: number;
  utilizationDelta?: number;
  unrealizedDelta?: number;
  slaDelta?: number;
  // Why it moved explanations
  investmentWhy?: string;
  utilizationWhy?: string;
  unrealizedWhy?: string;
  slaWhy?: string;
  onKPIClick?: (kpiId: string) => void;
  className?: string;
}

export function ExecKPICards({
  totalInvestment,
  utilizationRate,
  unrealizedValue,
  slaCompliance,
  investmentDelta = 8.2,
  utilizationDelta = 5.3,
  unrealizedDelta = -12.4,
  slaDelta = 2.1,
  investmentWhy = 'Annual budget increased by 8% due to headcount growth and new L&D programs.',
  utilizationWhy = 'Q4 utilization improved with education claims during school enrollment period.',
  unrealizedWhy = 'Reduced unrealized value through targeted awareness campaigns for unused benefits.',
  slaWhy = 'SLA improved due to automation of document verification process.',
  onKPIClick,
  className,
}: ExecKPICardsProps) {
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
      iconColor: utilizationRate >= 70 ? 'text-success' : 'text-warning',
      iconBg: utilizationRate >= 70 ? 'bg-success/10' : 'bg-warning/10',
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
    },
    {
      id: 'slaCompliance',
      label: 'SLA Compliance',
      value: formatPercent(slaCompliance),
      delta: slaDelta,
      deltaLabel: 'vs last month',
      higherIsBetter: true,
      whyMoved: slaWhy,
      icon: Clock,
      iconColor: slaCompliance >= 90 ? 'text-success' : 'text-warning',
      iconBg: slaCompliance >= 90 ? 'bg-success/10' : 'bg-warning/10',
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
