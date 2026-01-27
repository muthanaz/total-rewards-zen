/**
 * CFOKPIGrid - Executive-grade KPI Grid for Investment Analysis
 * 
 * Displays 4 core metrics a CFO needs to see first:
 * 1. Budget vs Spend (variance)
 * 2. Usage Rate (efficiency)
 * 3. Unutilized Budget (waste)
 * 4. YoY Change (trajectory)
 */

import { Card, CardContent } from '@/components/ui/card';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown,
  Target,
  PieChart,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { formatPercent, cn } from '@/lib/utils';
import { Currency } from '@/components/ui/Currency';

interface CFOMetrics {
  allocatedBudget: number;
  actualSpend: number;
  utilizationRate: number;
  targetUtilization?: number;
  unusedValue: number;
  yoyChange: number;
}

interface CFOKPIGridProps {
  metrics: CFOMetrics;
  onKPIClick?: (kpiId: string) => void;
}

const METRIC_DEFINITIONS = {
  budgetVariance: {
    formula: '(Actual Spend - Allocated Budget) / Allocated Budget × 100',
    dataSource: 'org_budgets + benefit_entitlements',
  },
  usageRate: {
    formula: '(Claimed Amount / Entitled Value) × 100',
    dataSource: 'requests + benefit_entitlements',
  },
  unusedValue: {
    formula: 'Entitled Value - Claimed Amount',
    dataSource: 'Calculated',
  },
  yoyChange: {
    formula: '(Current Year Spend - Prior Year Spend) / Prior Year Spend × 100',
    dataSource: 'requests (year comparison)',
  },
};

export function CFOKPIGrid({ metrics, onKPIClick }: CFOKPIGridProps) {
  const variance = metrics.actualSpend - metrics.allocatedBudget;
  const variancePercent = (variance / metrics.allocatedBudget) * 100;
  const isOverBudget = variance > 0;
  
  const targetUtil = metrics.targetUtilization || 75;
  const utilizationGap = metrics.utilizationRate - targetUtil;
  
  const kpis = [
    {
      id: 'budgetVariance',
      label: 'Budget vs Spend',
      value: (
        <div className="flex items-baseline gap-2">
          <Currency amount={metrics.actualSpend} abbreviate />
          <span className={cn(
            "text-sm font-medium",
            isOverBudget ? "text-destructive" : "text-success"
          )}>
            {isOverBudget ? '+' : ''}{variancePercent.toFixed(1)}%
          </span>
        </div>
      ),
      subtitle: isOverBudget 
        ? `Over budget by ${formatPercent(Math.abs(variancePercent))}`
        : `Under budget by ${formatPercent(Math.abs(variancePercent))}`,
      subtitleColor: isOverBudget ? 'text-destructive' : 'text-success',
      icon: isOverBudget ? ArrowUpRight : ArrowDownRight,
      iconBg: isOverBudget ? 'bg-destructive/10' : 'bg-success/10',
      iconColor: isOverBudget ? 'text-destructive' : 'text-success',
      definition: METRIC_DEFINITIONS.budgetVariance,
      context: `Budget: AED ${(metrics.allocatedBudget / 1000000).toFixed(1)}M`,
    },
    {
      id: 'usageRate',
      label: 'Usage Rate',
      value: formatPercent(metrics.utilizationRate),
      valueColor: metrics.utilizationRate >= targetUtil ? 'text-success' : 
                  metrics.utilizationRate >= 60 ? 'text-warning' : 'text-destructive',
      subtitle: utilizationGap >= 0 
        ? `${formatPercent(utilizationGap)} above target`
        : `${formatPercent(Math.abs(utilizationGap))} below target`,
      subtitleColor: utilizationGap >= 0 ? 'text-success' : 'text-warning',
      icon: PieChart,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      definition: METRIC_DEFINITIONS.usageRate,
      progress: metrics.utilizationRate,
      context: `Target: ${formatPercent(targetUtil)}`,
    },
    {
      id: 'unusedValue',
      label: 'Unutilized Budget',
      value: <Currency amount={metrics.unusedValue} abbreviate />,
      valueColor: 'text-warning',
      subtitle: 'Entitled but unclaimed',
      icon: AlertTriangle,
      iconBg: 'bg-warning/10',
      iconColor: 'text-warning',
      definition: METRIC_DEFINITIONS.unusedValue,
      context: 'Opportunity to recapture',
    },
    {
      id: 'yoyChange',
      label: 'YoY Change',
      value: (
        <div className="flex items-center gap-2">
          {metrics.yoyChange >= 0 ? (
            <TrendingUp className="w-5 h-5 text-chart-2" />
          ) : (
            <TrendingDown className="w-5 h-5 text-success" />
          )}
          <span>{metrics.yoyChange >= 0 ? '+' : ''}{metrics.yoyChange.toFixed(1)}%</span>
        </div>
      ),
      subtitle: metrics.yoyChange >= 0 
        ? 'Spend increased vs last year'
        : 'Spend decreased vs last year',
      subtitleColor: 'text-muted-foreground',
      icon: Target,
      iconBg: 'bg-chart-2/10',
      iconColor: 'text-chart-2',
      definition: METRIC_DEFINITIONS.yoyChange,
      context: 'vs prior fiscal year',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card 
            key={kpi.id} 
            className={cn(
              "border-border/50 transition-all duration-200",
              onKPIClick && "cursor-pointer hover:shadow-md hover:border-accent/30"
            )}
            onClick={() => onKPIClick?.(kpi.id)}
          >
            <CardContent className="p-5">
              {/* Header with Icon */}
              <div className="flex items-start justify-between mb-3">
                <div className={cn("p-2.5 rounded-xl", kpi.iconBg)}>
                  <Icon className={cn("w-5 h-5", kpi.iconColor)} />
                </div>
                <InfoTooltip 
                  formula={kpi.definition.formula}
                  dataSource={kpi.definition.dataSource}
                />
              </div>

              {/* Value */}
              <div className={cn(
                "text-2xl lg:text-3xl font-bold tracking-tight",
                kpi.valueColor
              )}>
                {kpi.value}
              </div>

              {/* Label */}
              <p className="text-sm text-muted-foreground mt-1 font-medium">{kpi.label}</p>

              {/* Optional Progress */}
              {kpi.progress !== undefined && (
                <Progress value={kpi.progress} className="h-2 mt-3" />
              )}

              {/* Subtitle with context */}
              {kpi.subtitle && (
                <p className={cn(
                  "text-xs mt-2",
                  kpi.subtitleColor || "text-muted-foreground"
                )}>
                  {kpi.subtitle}
                </p>
              )}

              {/* Context line */}
              {kpi.context && (
                <p className="text-xs text-muted-foreground/70 mt-1">
                  {kpi.context}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
