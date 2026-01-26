/**
 * Executive KPI Strip (5 cards max)
 * 
 * Streamlined KPI display with:
 * - Total Investment
 * - Utilization
 * - Unrealized Value
 * - Employee Friction Index
 * - SLA Health (only if reliable)
 * 
 * Each shows: Current | Target | Trend | Confidence
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  DollarSign, 
  Target, 
  AlertTriangle,
  Users,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
} from 'lucide-react';
import { cn, formatCurrencyAED, formatPercent } from '@/lib/utils';
import { UnifiedConfidenceBadge } from '@/components/shared/UnifiedConfidenceBadge';

export interface ExecKPI {
  id: string;
  label: string;
  current: number;
  target?: number;
  trend: number; // positive = up, negative = down
  unit: 'currency' | 'percent' | 'score' | 'days';
  confidence: 'high' | 'medium' | 'low';
  icon: React.ElementType;
  higherIsBetter: boolean;
  formula?: string;
  hiddenWhenLowConfidence?: boolean;
}

interface ExecKPIStripProps {
  kpis: ExecKPI[];
  onKPIClick?: (kpiId: string) => void;
  className?: string;
}

export function ExecKPIStrip({ kpis, onKPIClick, className }: ExecKPIStripProps) {
  const formatValue = (value: number, unit: ExecKPI['unit']) => {
    switch (unit) {
      case 'currency':
        return formatCurrencyAED(value);
      case 'percent':
        return formatPercent(value);
      case 'score':
        return value.toFixed(1);
      case 'days':
        return `${value.toFixed(1)}d`;
      default:
        return value.toString();
    }
  };

  const getTrendIcon = (trend: number, higherIsBetter: boolean) => {
    if (Math.abs(trend) < 0.5) return Minus;
    const isPositive = higherIsBetter ? trend > 0 : trend < 0;
    return isPositive ? TrendingUp : TrendingDown;
  };

  const getTrendColor = (trend: number, higherIsBetter: boolean) => {
    if (Math.abs(trend) < 0.5) return 'text-muted-foreground';
    const isPositive = higherIsBetter ? trend > 0 : trend < 0;
    return isPositive ? 'text-success' : 'text-destructive';
  };

  // Filter out low confidence KPIs that should be hidden
  const visibleKPIs = kpis.filter(kpi => 
    !(kpi.hiddenWhenLowConfidence && kpi.confidence === 'low')
  ).slice(0, 5);

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-5 gap-4', className)}>
      {visibleKPIs.map((kpi) => {
        const Icon = kpi.icon;
        const TrendIcon = getTrendIcon(kpi.trend, kpi.higherIsBetter);
        const trendColor = getTrendColor(kpi.trend, kpi.higherIsBetter);
        
        return (
          <Card 
            key={kpi.id}
            className={cn(
              'cursor-pointer hover:bg-muted/50 transition-colors',
              kpi.confidence === 'low' && 'opacity-70 border-dashed'
            )}
            onClick={() => onKPIClick?.(kpi.id)}
          >
            <CardContent className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground truncate">
                    {kpi.label}
                  </span>
                </div>
                {kpi.formula && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3 h-3 text-muted-foreground/50" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p className="text-xs">{kpi.formula}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>

              {/* Current Value */}
              <div className="flex items-end gap-2 mb-1">
                <span className="text-xl font-bold tabular-nums">
                  {formatValue(kpi.current, kpi.unit)}
                </span>
                <div className={cn('flex items-center gap-0.5 text-xs', trendColor)}>
                  <TrendIcon className="w-3 h-3" />
                  <span>{Math.abs(kpi.trend).toFixed(1)}%</span>
                </div>
              </div>

              {/* Target + Confidence */}
              <div className="flex items-center justify-between">
                {kpi.target !== undefined && (
                  <span className="text-xs text-muted-foreground">
                    Target: {formatValue(kpi.target, kpi.unit)}
                  </span>
                )}
                <Badge variant="outline" className={cn(
                  'text-[10px] h-5',
                  kpi.confidence === 'high' ? 'bg-success/10 text-success' :
                  kpi.confidence === 'medium' ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'
                )}>
                  {kpi.confidence === 'high' ? 'Measured' : kpi.confidence === 'medium' ? 'Estimated' : 'Partial'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Default KPIs for executive dashboard
export function useExecKPIs(metrics: any): ExecKPI[] {
  if (!metrics) return [];
  
  return [
    {
      id: 'totalInvestment',
      label: 'Total Investment',
      current: metrics.totalInvestment || 24600000,
      target: 28000000,
      trend: 8.2,
      unit: 'currency',
      confidence: 'high',
      icon: DollarSign,
      higherIsBetter: true,
      formula: 'SUM(org_budgets.annual_budget)',
    },
    {
      id: 'utilization',
      label: 'Utilization',
      current: metrics.utilizationRate || 68,
      target: 75,
      trend: 5.3,
      unit: 'percent',
      confidence: 'high',
      icon: Target,
      higherIsBetter: true,
      formula: '(Claimed / Entitled) × 100',
    },
    {
      id: 'unrealizedValue',
      label: 'Unrealized Value',
      current: metrics.unrealizedValue || 7872000,
      trend: -12.4,
      unit: 'currency',
      confidence: 'medium',
      icon: AlertTriangle,
      higherIsBetter: false,
      formula: 'Entitled - Claimed',
    },
    {
      id: 'frictionIndex',
      label: 'Friction Index',
      current: metrics.frictionIndex || 2.3,
      target: 1.5,
      trend: -8.5,
      unit: 'score',
      confidence: 'medium',
      icon: Users,
      higherIsBetter: false,
      formula: 'Weighted avg of rejection rate, missing docs, SLA breach',
    },
    {
      id: 'slaHealth',
      label: 'SLA Health',
      current: metrics.slaCompliance || 94,
      target: 98,
      trend: 2.1,
      unit: 'percent',
      confidence: metrics.slaConfidence || 'high',
      icon: Clock,
      higherIsBetter: true,
      formula: '(On-time / Total) × 100',
      hiddenWhenLowConfidence: true,
    },
  ];
}
