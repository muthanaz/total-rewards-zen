/**
 * CFORecoveryKPIGrid - Executive-grade KPI Grid for ROI & Savings
 * 
 * Displays 4 core metrics a CFO needs to see for recovery:
 * 1. Unrealized Value (the problem)
 * 2. Estimated Recoverable (the opportunity)
 * 3. Top Cause (root cause)
 * 4. Time to Impact (urgency)
 */

import { Card, CardContent } from '@/components/ui/card';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Progress } from '@/components/ui/progress';
import { 
  Ghost,
  Target,
  AlertTriangle,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { formatPercent, cn } from '@/lib/utils';
import { Currency } from '@/components/ui/Currency';
import { RecoveryCauseType } from './RecoverableValueInsights';

interface CFORecoveryMetrics {
  unrealizedValue: number;
  estimatedRecoverable: number;
  topCause: RecoveryCauseType;
  topCausePercent: number;
  quickWinPotential: number;
  avgTimeToImpact: string;
}

interface CFORecoveryKPIGridProps {
  metrics: CFORecoveryMetrics;
  onKPIClick?: (kpiId: string) => void;
}

const METRIC_DEFINITIONS = {
  unrealizedValue: {
    formula: 'Entitled Value - Claimed Amount',
    dataSource: 'Budgeted funds blocked by policy or process friction',
  },
  valueOpportunity: {
    formula: 'Unrealized × Confidence Factor (High=100%, Med=70%, Low=40%)',
    dataSource: 'Category analysis with confidence weighting',
  },
  topCause: {
    formula: 'Highest-value root cause category',
    dataSource: 'Root cause analysis',
  },
  quickWinPotential: {
    formula: 'SUM(low-effort recovery opportunities)',
    dataSource: 'Playbook analysis',
  },
};

const causeConfig: Record<RecoveryCauseType, { label: string; color: string; bgColor: string }> = {
  awareness: { label: 'Low Awareness', color: 'text-info', bgColor: 'bg-info/10' },
  eligibility: { label: 'Eligibility', color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
  friction: { label: 'Process Friction', color: 'text-warning', bgColor: 'bg-warning/10' },
  policy: { label: 'Policy Design', color: 'text-destructive', bgColor: 'bg-destructive/10' },
};

export function CFORecoveryKPIGrid({ metrics, onKPIClick }: CFORecoveryKPIGridProps) {
  const recoveryRate = metrics.unrealizedValue > 0 
    ? (metrics.estimatedRecoverable / metrics.unrealizedValue) * 100 
    : 0;
  
  const kpis = [
    {
      id: 'unrealized',
      label: 'Unrealized Value',
      value: <Currency amount={metrics.unrealizedValue} abbreviate />,
      valueColor: 'text-warning',
      subtitle: 'Entitled but unclaimed',
      icon: Ghost,
      iconBg: 'bg-warning/10',
      iconColor: 'text-warning',
      definition: METRIC_DEFINITIONS.unrealizedValue,
      context: 'Opportunity to optimize',
    },
    {
      id: 'recoverable',
      label: 'Value Opportunity',
      value: <Currency amount={metrics.estimatedRecoverable} abbreviate />,
      valueColor: 'text-success',
      subtitle: `${recoveryRate.toFixed(0)}% recovery potential`,
      subtitleColor: 'text-success',
      icon: Target,
      iconBg: 'bg-success/10',
      iconColor: 'text-success',
      definition: METRIC_DEFINITIONS.valueOpportunity,
      context: 'Confidence-weighted',
      progress: recoveryRate,
    },
    {
      id: 'topCause',
      label: 'Top Driver',
      value: causeConfig[metrics.topCause].label,
      valueColor: causeConfig[metrics.topCause].color,
      subtitle: `${metrics.topCausePercent}% of unrealized value`,
      icon: AlertTriangle,
      iconBg: causeConfig[metrics.topCause].bgColor,
      iconColor: causeConfig[metrics.topCause].color,
      definition: METRIC_DEFINITIONS.topCause,
      context: 'Focus recovery efforts here',
    },
    {
      id: 'quickWins',
      label: 'Quick Wins',
      value: (
        <div className="flex items-center gap-2">
          <Currency amount={metrics.quickWinPotential} abbreviate />
          <TrendingUp className="w-4 h-4 text-success" />
        </div>
      ),
      subtitle: metrics.avgTimeToImpact,
      subtitleColor: 'text-muted-foreground',
      icon: Clock,
      iconBg: 'bg-chart-2/10',
      iconColor: 'text-chart-2',
      definition: METRIC_DEFINITIONS.quickWinPotential,
      context: 'Low-effort, high-impact',
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

              {/* Subtitle */}
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
