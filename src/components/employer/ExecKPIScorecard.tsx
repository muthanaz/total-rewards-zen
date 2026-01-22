/**
 * Executive KPI Scorecard
 * 
 * At-a-glance KPI scorecard (4–6 KPIs with trends + tooltips):
 * - Total Benefits Investment (YTD + annualized)
 * - Utilization Rate + Utilization Value
 * - Unused / At-risk Budget
 * - Median Cycle Time + SLA Compliance
 * - Policy Complexity Load (optional)
 * - Data Confidence badge
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MetricTooltip, ConfidenceBadge } from '@/components/shared';
import { TrendingUp, TrendingDown, Minus, DollarSign, Target, Clock, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatCurrencyAED, formatPercent, cn } from '@/lib/utils';
import { EmployerMetrics } from '@/hooks/useEmployerDashboard';

interface ExecKPIScorecardProps {
  metrics: EmployerMetrics;
  claimMetrics?: {
    avgProcessingDays: number;
    slaCompliance: number;
  };
  onKPIClick?: (kpiId: string) => void;
  compact?: boolean;
}

interface KPICardData {
  id: string;
  label: string;
  value: string;
  subValue?: string;
  trend?: { value: number; higherIsBetter: boolean };
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  metricKey?: string;
  borderColor?: string;
}

export function ExecKPIScorecard({ metrics, claimMetrics, onKPIClick, compact = false }: ExecKPIScorecardProps) {
  const utilizationValue = Math.round(metrics.totalInvestment * (metrics.utilizationRate / 100));
  const unusedBudget = metrics.totalInvestment - utilizationValue;
  const utilizationGap = metrics.targetUtilization - metrics.utilizationRate;

  const kpis: KPICardData[] = [
    {
      id: 'totalInvestment',
      label: 'Total Investment',
      value: formatCurrencyAED(metrics.totalInvestment),
      subValue: `YTD: ${formatCurrencyAED(metrics.budgetUtilized)}`,
      trend: { value: 8, higherIsBetter: true },
      icon: DollarSign,
      iconColor: 'text-primary',
      iconBg: 'bg-primary/10',
      metricKey: 'totalInvestment',
    },
    {
      id: 'utilization',
      label: 'Utilization Rate',
      value: formatPercent(metrics.utilizationRate),
      subValue: `Value: ${formatCurrencyAED(utilizationValue)}`,
      trend: { value: metrics.utilizationRate - 62, higherIsBetter: true },
      icon: Target,
      iconColor: metrics.utilizationRate >= metrics.targetUtilization ? 'text-success' : 'text-warning',
      iconBg: metrics.utilizationRate >= metrics.targetUtilization ? 'bg-success/10' : 'bg-warning/10',
      metricKey: 'utilizationRate',
      borderColor: metrics.utilizationRate >= metrics.targetUtilization ? 'border-l-success' : 'border-l-warning',
    },
    {
      id: 'unused',
      label: 'Unused Budget',
      value: formatCurrencyAED(unusedBudget),
      subValue: `${formatPercent(100 - metrics.utilizationRate)} of total`,
      trend: { value: -utilizationGap, higherIsBetter: false },
      icon: AlertTriangle,
      iconColor: unusedBudget > metrics.totalInvestment * 0.3 ? 'text-destructive' : 'text-warning',
      iconBg: unusedBudget > metrics.totalInvestment * 0.3 ? 'bg-destructive/10' : 'bg-warning/10',
      borderColor: 'border-l-warning',
    },
    {
      id: 'sla',
      label: 'SLA Compliance',
      value: formatPercent(claimMetrics?.slaCompliance || 94),
      subValue: `Avg: ${claimMetrics?.avgProcessingDays || 2.3} days`,
      trend: { value: 3, higherIsBetter: true },
      icon: Clock,
      iconColor: (claimMetrics?.slaCompliance || 94) >= 90 ? 'text-success' : 'text-warning',
      iconBg: (claimMetrics?.slaCompliance || 94) >= 90 ? 'bg-success/10' : 'bg-warning/10',
      metricKey: 'slaCompliance',
    },
    {
      id: 'dataConfidence',
      label: 'Data Confidence',
      value: metrics.dataConfidence === 'high' ? 'High' : metrics.dataConfidence === 'medium' ? 'Medium' : 'Low',
      subValue: `${metrics.dataSources.length} sources`,
      icon: Shield,
      iconColor: metrics.dataConfidence === 'high' ? 'text-success' : metrics.dataConfidence === 'medium' ? 'text-warning' : 'text-destructive',
      iconBg: metrics.dataConfidence === 'high' ? 'bg-success/10' : metrics.dataConfidence === 'medium' ? 'bg-warning/10' : 'bg-destructive/10',
    },
  ];

  // Filter for compact mode
  const displayKpis = compact ? kpis.slice(0, 4) : kpis;

  return (
    <div className={cn(
      'grid gap-4',
      compact ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 lg:grid-cols-5'
    )}>
      {displayKpis.map((kpi) => {
        const Icon = kpi.icon;
        const TrendIcon = !kpi.trend ? null : kpi.trend.value > 0 ? TrendingUp : kpi.trend.value < 0 ? TrendingDown : Minus;
        const trendColor = !kpi.trend ? '' : 
          (kpi.trend.value > 0 === kpi.trend.higherIsBetter) ? 'text-success' : 'text-destructive';

        return (
          <Card 
            key={kpi.id}
            className={cn(
              'border-border/50 transition-all duration-200',
              kpi.borderColor && `border-l-4 ${kpi.borderColor}`,
              onKPIClick && 'cursor-pointer hover:shadow-md hover:border-accent/30'
            )}
            onClick={() => onKPIClick?.(kpi.id)}
          >
            <CardContent className={cn(compact ? 'p-4' : 'p-5')}>
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className={cn('rounded-xl', kpi.iconBg, compact ? 'p-2' : 'p-2.5')}>
                  <Icon className={cn(kpi.iconColor, compact ? 'w-4 h-4' : 'w-5 h-5')} />
                </div>
                {kpi.metricKey && <MetricTooltip metricKey={kpi.metricKey} />}
              </div>

              {/* Value */}
              <p className={cn(
                'font-bold tracking-tight tabular-nums',
                compact ? 'text-xl lg:text-2xl' : 'text-2xl lg:text-3xl'
              )}>
                {kpi.value}
              </p>

              {/* Label */}
              <p className="text-sm text-muted-foreground mt-1">{kpi.label}</p>

              {/* Sub-value and Trend */}
              <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{kpi.subValue}</span>
                {kpi.trend && TrendIcon && (
                  <div className={cn('flex items-center gap-1 text-xs', trendColor)}>
                    <TrendIcon className="w-3 h-3" />
                    <span className="tabular-nums">
                      {kpi.trend.value > 0 ? '+' : ''}{kpi.trend.value}%
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
