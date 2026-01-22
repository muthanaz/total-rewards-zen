/**
 * SpendKPIGrid - Standardized KPI Grid for Spend & Utilization page
 * 
 * Displays 4-6 key metrics with consistent formatting and tooltips.
 * Uses MetricCard component for premium appearance.
 */

import { Card, CardContent } from '@/components/ui/card';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Target, 
  BarChart3, 
  PieChart, 
  TrendingDown,
  Users,
  TrendingUp,
} from 'lucide-react';
import { formatPercent, formatInteger, cn } from '@/lib/utils';
import { Currency } from '@/components/ui/Currency';
import { createSystemProvenance, DataProvenance } from '@/lib/dataProvenance';

interface SpendMetrics {
  allocatedBudget: number;
  entitledValue: number;
  claimedAmount: number;
  utilizationRate: number;
  unusedEntitlement: number;
  avgCostPerEmployee?: number;
  employeeCount?: number;
  pendingClaimsAmount?: number;
  yoyChange?: number;
}

interface SpendKPIGridProps {
  metrics: SpendMetrics;
  isDemo?: boolean;
  onKPIClick?: (kpiId: string) => void;
  /** Optional provenance for trust layer */
  provenance?: DataProvenance;
}

const METRIC_DEFINITIONS = {
  allocatedBudget: {
    name: 'Allocated Budget',
    formula: 'SUM(org_budgets.annual_budget) for current fiscal year',
    dataSource: 'org_budgets table',
  },
  entitledValue: {
    name: 'Entitled Value',
    formula: 'SUM(benefit_entitlements.annual_allowance) for all active employees',
    dataSource: 'benefit_entitlements table',
  },
  claimedAmount: {
    name: 'Claimed Amount',
    formula: 'SUM(requests.amount) WHERE status IN ("approved", "paid")',
    dataSource: 'requests table',
  },
  utilizationRate: {
    name: 'Utilization Rate',
    formula: '(Claimed Amount / Entitled Value) × 100',
    dataSource: 'Calculated',
  },
  unusedEntitlement: {
    name: 'Unused Entitlement',
    formula: 'Entitled Value - Claimed Amount',
    dataSource: 'Calculated',
  },
  avgCostPerEmployee: {
    name: 'Avg Cost per Employee',
    formula: 'Claimed Amount / Employee Count',
    dataSource: 'Calculated',
  },
};

export function SpendKPIGrid({ metrics, isDemo, onKPIClick, provenance }: SpendKPIGridProps) {
  const getUtilizationColor = (rate: number) => {
    if (rate >= 80) return 'text-success';
    if (rate >= 60) return 'text-warning';
    return 'text-destructive';
  };

  // Default provenance for demo mode
  const defaultProvenance = provenance || createSystemProvenance('Benefits Calculation Engine', new Date().toISOString());

  const kpis = [
    {
      id: 'allocated',
      label: 'Allocated Budget',
      value: metrics.allocatedBudget,
      isCurrency: true,
      icon: DollarSign,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      definition: METRIC_DEFINITIONS.allocatedBudget,
    },
    {
      id: 'entitled',
      label: 'Entitled Value',
      value: metrics.entitledValue,
      isCurrency: true,
      icon: Target,
      iconBg: 'bg-secondary/10',
      iconColor: 'text-secondary',
      definition: METRIC_DEFINITIONS.entitledValue,
      subtitle: metrics.entitledValue > metrics.allocatedBudget 
        ? <><Currency amount={metrics.entitledValue - metrics.allocatedBudget} size="xs" /> over-entitled</>
        : 'Within budget',
      subtitleColor: metrics.entitledValue > metrics.allocatedBudget ? 'text-warning' : 'text-success',
    },
    {
      id: 'claimed',
      label: 'Claimed Amount',
      value: metrics.claimedAmount,
      isCurrency: true,
      icon: BarChart3,
      iconBg: 'bg-accent/10',
      iconColor: 'text-accent',
      definition: METRIC_DEFINITIONS.claimedAmount,
      trend: metrics.yoyChange,
    },
    {
      id: 'utilization',
      label: 'Utilization Rate',
      value: formatPercent(metrics.utilizationRate),
      isCurrency: false,
      valueColor: getUtilizationColor(metrics.utilizationRate),
      icon: PieChart,
      iconBg: 'bg-chart-2/10',
      iconColor: 'text-chart-2',
      definition: METRIC_DEFINITIONS.utilizationRate,
      progress: metrics.utilizationRate,
    },
    {
      id: 'unused',
      label: 'Unused Entitlement',
      value: metrics.unusedEntitlement,
      isCurrency: true,
      valueColor: 'text-warning',
      icon: TrendingDown,
      iconBg: 'bg-warning/10',
      iconColor: 'text-warning',
      definition: METRIC_DEFINITIONS.unusedEntitlement,
      subtitle: 'Potential zombie spend',
    },
    ...(metrics.avgCostPerEmployee !== undefined ? [{
      id: 'avgCost',
      label: 'Avg Cost / Employee',
      value: metrics.avgCostPerEmployee,
      isCurrency: true,
      icon: Users,
      iconBg: 'bg-info/10',
      iconColor: 'text-info',
      definition: METRIC_DEFINITIONS.avgCostPerEmployee,
      subtitle: metrics.employeeCount ? `${formatInteger(metrics.employeeCount)} employees` : undefined,
    }] : []),
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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
                <div className={cn("p-2 rounded-xl", kpi.iconBg)}>
                  <Icon className={cn("w-4 h-4", kpi.iconColor)} />
                </div>
                <div className="flex items-center gap-1">
                  {isDemo && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">Demo</Badge>
                  )}
                  <InfoTooltip 
                    formula={kpi.definition.formula}
                    dataSource={kpi.definition.dataSource}
                  />
                </div>
              </div>

              {/* Value */}
              <div className={cn(
                "text-xl lg:text-2xl font-bold tracking-tight",
                kpi.valueColor
              )}>
                {kpi.isCurrency ? <Currency amount={kpi.value as number} /> : kpi.value}
              </div>

              {/* Label */}
              <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>

              {/* Optional Progress */}
              {kpi.progress !== undefined && (
                <Progress value={kpi.progress} className="h-1.5 mt-2" />
              )}

              {/* Optional Trend */}
              {kpi.trend !== undefined && (
                <div className={cn(
                  "flex items-center gap-1 mt-2 text-xs",
                  kpi.trend >= 0 ? "text-success" : "text-destructive"
                )}>
                  {kpi.trend >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>{kpi.trend >= 0 ? '+' : ''}{kpi.trend.toFixed(1)}% vs last year</span>
                </div>
              )}

              {/* Optional Subtitle */}
              {kpi.subtitle && !kpi.trend && (
                <p className={cn(
                  "text-xs mt-2",
                  kpi.subtitleColor || "text-muted-foreground"
                )}>
                  {kpi.subtitle}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
