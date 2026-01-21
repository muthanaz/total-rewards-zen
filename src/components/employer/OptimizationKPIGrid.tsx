/**
 * OptimizationKPIGrid - Standardized KPI Grid for Optimization Opportunities page
 * 
 * Displays 4-6 key metrics about unrealized value with proper tooltips.
 */

import { Card, CardContent } from '@/components/ui/card';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Badge } from '@/components/ui/badge';
import { 
  Ghost, 
  TrendingDown, 
  Target,
  AlertTriangle,
  Clock,
  FileX,
} from 'lucide-react';
import { formatCurrencyAED, formatPercent, cn } from '@/lib/utils';

interface OptimizationMetrics {
  unrealizedValue: number;
  unrealizedRate: number;
  estimatedRecoverable: number;
  topCategories: string[];
  missingDocsRate?: number;
  medianApprovalDays?: number;
  confidenceLevel: 'high' | 'medium' | 'low';
}

interface OptimizationKPIGridProps {
  metrics: OptimizationMetrics;
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
    name: 'Unrealized Rate',
    formula: '(Unrealized Value / Allocated Budget) × 100',
    dataSource: 'Calculated',
  },
  estimatedRecoverable: {
    name: 'Estimated Recoverable',
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
    formula: 'MEDIAN(reviewed_at - created_at) for approved claims',
    dataSource: 'requests table',
  },
};

export function OptimizationKPIGrid({ metrics, isDemo, onKPIClick }: OptimizationKPIGridProps) {
  const kpis = [
    {
      id: 'unrealized',
      label: 'Unrealized Value',
      value: formatCurrencyAED(metrics.unrealizedValue),
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
      id: 'topCategories',
      label: 'Top Drivers',
      value: null,
      badges: metrics.topCategories.slice(0, 3),
      icon: AlertTriangle,
      iconBg: 'bg-info/10',
      iconColor: 'text-info',
      definition: { name: 'Top Categories', formula: 'Categories with highest unrealized value', dataSource: 'Calculated' },
    },
    {
      id: 'recoverable',
      label: 'Estimated Recoverable',
      value: formatCurrencyAED(metrics.estimatedRecoverable),
      valueColor: 'text-success',
      icon: Target,
      iconBg: 'bg-success/10',
      iconColor: 'text-success',
      definition: METRIC_DEFINITIONS.estimatedRecoverable,
      borderColor: 'border-l-success',
      subtitle: `Confidence: ${metrics.confidenceLevel}`,
    },
    ...(metrics.missingDocsRate !== undefined ? [{
      id: 'missingDocs',
      label: 'Missing Docs Rate',
      value: formatPercent(metrics.missingDocsRate),
      valueColor: metrics.missingDocsRate > 20 ? 'text-destructive' : 'text-foreground',
      icon: FileX,
      iconBg: 'bg-destructive/10',
      iconColor: 'text-destructive',
      definition: METRIC_DEFINITIONS.missingDocsRate,
      isDemo: isDemo,
    }] : []),
    ...(metrics.medianApprovalDays !== undefined ? [{
      id: 'approvalTime',
      label: 'Median Approval Time',
      value: `${metrics.medianApprovalDays} days`,
      valueColor: metrics.medianApprovalDays > 5 ? 'text-warning' : 'text-foreground',
      icon: Clock,
      iconBg: 'bg-chart-3/10',
      iconColor: 'text-chart-3',
      definition: METRIC_DEFINITIONS.medianApprovalDays,
      isDemo: isDemo,
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
              kpi.borderColor && `border-l-4 ${kpi.borderColor}`,
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
                  {(isDemo || kpi.isDemo) && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">Demo</Badge>
                  )}
                  <InfoTooltip 
                    formula={kpi.definition.formula}
                    dataSource={kpi.definition.dataSource}
                  />
                </div>
              </div>

              {/* Value or Badges */}
              {kpi.value ? (
                <p className={cn("text-xl lg:text-2xl font-bold tracking-tight", kpi.valueColor)}>
                  {kpi.value}
                </p>
              ) : kpi.badges ? (
                <div className="flex flex-wrap gap-1">
                  {kpi.badges.map((badge, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {badge}
                    </Badge>
                  ))}
                </div>
              ) : null}

              {/* Label */}
              <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>

              {/* Optional Subtitle */}
              {kpi.subtitle && (
                <p className="text-xs text-muted-foreground/70 mt-1">{kpi.subtitle}</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
