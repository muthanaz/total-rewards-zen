/**
 * RecoverableValueKPIGrid - Exactly 6 KPI Cards for Recoverable Value page
 * 
 * Displays:
 * 1. Unrealized Value (AED)
 * 2. % Budget Unused (%)
 * 3. Est. Recoverable (AED)
 * 4. Missing Docs Rate (%)
 * 5. Median Approval Time (days)
 * 6. Top Cause (category)
 */

import { Card, CardContent } from '@/components/ui/card';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Badge } from '@/components/ui/badge';
import { 
  Ghost, 
  TrendingDown, 
  Target,
  FileX,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { Currency } from '@/components/ui/Currency';
import { formatPercent, cn } from '@/lib/utils';
import { RecoveryCauseType } from './RecoverableValueInsights';

export interface RecoverableValueMetrics {
  unrealizedValue: number;
  unrealizedRate: number;
  estimatedRecoverable: number;
  missingDocsRate: number;
  medianApprovalDays: number;
  topCause: RecoveryCauseType;
}

interface RecoverableValueKPIGridProps {
  metrics: RecoverableValueMetrics;
  isDemo?: boolean;
  onKPIClick?: (kpiId: string) => void;
}

const METRIC_DEFINITIONS = {
  unrealizedValue: {
    name: 'Unrealized Value',
    formula: 'Entitled Value - Claimed Amount',
    dataSource: 'benefit_entitlements + requests',
  },
  unrealizedRate: {
    name: '% Budget Unused',
    formula: '(Unrealized Value / Allocated Budget) × 100',
    dataSource: 'Calculated',
  },
  estimatedRecoverable: {
    name: 'Est. Recoverable',
    formula: 'Unrealized × Confidence Factor (High=100%, Med=70%, Low=40%)',
    dataSource: 'Calculated with confidence weighting',
  },
  missingDocsRate: {
    name: 'Missing Docs Rate',
    formula: '(Claims with missing docs / Total claims) × 100',
    dataSource: 'claim_docs table',
  },
  medianApprovalDays: {
    name: 'Median Approval Time',
    formula: 'MEDIAN(reviewed_at - created_at) for claims',
    dataSource: 'requests table',
  },
  topCause: {
    name: 'Top Cause',
    formula: 'Most frequent root cause across categories',
    dataSource: 'Category analysis',
  },
};

const causeLabels: Record<RecoveryCauseType, { label: string; color: string }> = {
  awareness: { label: 'Awareness', color: 'text-info' },
  eligibility: { label: 'Eligibility', color: 'text-purple-500' },
  friction: { label: 'Friction', color: 'text-warning' },
  policy: { label: 'Policy', color: 'text-destructive' },
};

export function RecoverableValueKPIGrid({ metrics, isDemo, onKPIClick }: RecoverableValueKPIGridProps) {
  const kpis = [
    {
      id: 'unrealized',
      label: 'Unrealized Value',
      value: <Currency amount={metrics.unrealizedValue} />,
      valueColor: 'text-warning',
      icon: Ghost,
      iconBg: 'bg-warning/10',
      iconColor: 'text-warning',
      definition: METRIC_DEFINITIONS.unrealizedValue,
      borderColor: 'border-l-warning',
    },
    {
      id: 'unrealizedRate',
      label: '% Budget Unused',
      value: formatPercent(metrics.unrealizedRate),
      icon: TrendingDown,
      iconBg: 'bg-destructive/10',
      iconColor: 'text-destructive',
      definition: METRIC_DEFINITIONS.unrealizedRate,
    },
    {
      id: 'recoverable',
      label: 'Est. Recoverable',
      value: <Currency amount={metrics.estimatedRecoverable} />,
      valueColor: 'text-success',
      icon: Target,
      iconBg: 'bg-success/10',
      iconColor: 'text-success',
      definition: METRIC_DEFINITIONS.estimatedRecoverable,
      borderColor: 'border-l-success',
    },
    {
      id: 'missingDocs',
      label: 'Missing Docs Rate',
      value: formatPercent(metrics.missingDocsRate),
      valueColor: metrics.missingDocsRate > 20 ? 'text-destructive' : 'text-foreground',
      icon: FileX,
      iconBg: 'bg-destructive/10',
      iconColor: 'text-destructive',
      definition: METRIC_DEFINITIONS.missingDocsRate,
    },
    {
      id: 'approvalTime',
      label: 'Median Approval Time',
      value: `${metrics.medianApprovalDays} days`,
      valueColor: metrics.medianApprovalDays > 5 ? 'text-warning' : 'text-foreground',
      icon: Clock,
      iconBg: 'bg-chart-3/10',
      iconColor: 'text-chart-3',
      definition: METRIC_DEFINITIONS.medianApprovalDays,
    },
    {
      id: 'topCause',
      label: 'Top Cause',
      value: causeLabels[metrics.topCause].label,
      valueColor: causeLabels[metrics.topCause].color,
      icon: AlertTriangle,
      iconBg: 'bg-info/10',
      iconColor: 'text-info',
      definition: METRIC_DEFINITIONS.topCause,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card 
            key={kpi.id} 
            className={cn(
              "border-border/50 transition-all duration-200",
              kpi.borderColor && `border-l-4 ${kpi.borderColor}`,
              onKPIClick && "cursor-pointer hover:shadow-md hover:border-accent/30"
            )}
            onClick={() => onKPIClick?.(kpi.id)}
          >
            <CardContent className="p-4">
              {/* Header with Icon */}
              <div className="flex items-start justify-between mb-2">
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
              <p className={cn("text-xl font-bold tracking-tight", kpi.valueColor)}>
                {kpi.value}
              </p>

              {/* Label */}
              <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
