/**
 * SpendInsights - Key Insights with Deep Links for Spend & Utilization page
 * 
 * STRICT FORMAT: Max 4 insights, each with:
 * (a) Signal - what is happening
 * (b) Quantified metric - the number
 * (c) Recommended next step - actionable link to /employer/recommendations
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  ArrowRight,
  Lightbulb,
  AlertTriangle,
  Target,
  Ghost,
  FileText,
} from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { Link } from 'react-router-dom';

export interface SpendInsight {
  id: string;
  icon: 'trend-up' | 'trend-down' | 'neutral' | 'alert' | 'target' | 'ghost' | 'policy';
  /** The signal: what is happening */
  signal: string;
  /** Quantified metric with AED or % */
  metric: string;
  /** Recommended action label */
  actionLabel: string;
  /** Pre-filter for recommendations page */
  actionParams?: Record<string, string>;
  confidence: 'high' | 'medium' | 'low';
}

interface SpendInsightsProps {
  insights: SpendInsight[];
  isDemo?: boolean;
}

const iconMap = {
  'trend-up': TrendingUp,
  'trend-down': TrendingDown,
  'neutral': Minus,
  'alert': AlertTriangle,
  'target': Target,
  'ghost': Ghost,
  'policy': FileText,
};

const iconColorMap = {
  'trend-up': 'text-success bg-success/10',
  'trend-down': 'text-destructive bg-destructive/10',
  'neutral': 'text-muted-foreground bg-muted',
  'alert': 'text-warning bg-warning/10',
  'target': 'text-info bg-info/10',
  'ghost': 'text-warning bg-warning/10',
  'policy': 'text-primary bg-primary/10',
};

const confidenceBadges = {
  high: { label: 'Measured', variant: 'success' as const },
  medium: { label: 'Estimated', variant: 'warning' as const },
  low: { label: 'Proxy', variant: 'destructive' as const },
};

function buildActionLink(params?: Record<string, string>): string {
  const basePath = '/employer/recommendations';
  if (!params) return basePath;
  const searchParams = new URLSearchParams(params);
  return `${basePath}?${searchParams.toString()}`;
}

export function SpendInsights({ insights, isDemo }: SpendInsightsProps) {
  // Enforce max 4 insights
  const displayInsights = insights.slice(0, 4);

  return (
    <Card className="border-accent/20 bg-gradient-to-r from-card via-card to-accent/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-accent" />
            Key Insights
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">{displayInsights.length} of 4</Badge>
            {isDemo && (
              <Badge variant="outline" className="text-xs">Demo Data</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayInsights.map((insight) => {
            const Icon = iconMap[insight.icon];
            const iconColor = iconColorMap[insight.icon];
            const confidence = confidenceBadges[insight.confidence];
            const actionUrl = buildActionLink(insight.actionParams);

            return (
              <div
                key={insight.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
              >
                {/* Icon */}
                <div className={cn("p-1.5 rounded-lg shrink-0", iconColor)}>
                  <Icon className="w-4 h-4" />
                </div>

                {/* Content - Signal + Metric + Action */}
                <div className="flex-1 min-w-0">
                  {/* Signal */}
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-medium text-sm">{insight.signal}</p>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-[10px] px-1.5 py-0",
                        confidence.variant === 'success' && 'border-success/30 text-success',
                        confidence.variant === 'warning' && 'border-warning/30 text-warning',
                        confidence.variant === 'destructive' && 'border-destructive/30 text-destructive',
                      )}
                    >
                      {confidence.label}
                    </Badge>
                  </div>
                  
                  {/* Metric */}
                  <p className="text-xs text-muted-foreground">{insight.metric}</p>
                  
                  {/* Action - always link to recommendations with pre-filter */}
                  <Button
                    variant="link"
                    size="sm"
                    className="h-6 px-0 text-xs text-accent hover:text-accent/80"
                    asChild
                  >
                    <Link to={actionUrl}>
                      Open Action: {insight.actionLabel}
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper to generate insights from spend data
export interface SpendDataForInsights {
  overallUtilization: number;
  unusedEntitlement: number;
  topUnderutilizedCategory: { name: string; utilization: number; unused: number };
  lowUtilizationSegments: { name: string; dimension: string; utilization: number }[];
  highRejectionPolicy?: { name: string; rejectionRate: number };
  yoySpendChange: number;
}

export function generateSpendInsights(data: SpendDataForInsights): SpendInsight[] {
  const insights: SpendInsight[] = [];

  // 1. Top underutilized category (most actionable)
  if (data.topUnderutilizedCategory.utilization < 70) {
    insights.push({
      id: 'underutilized-category',
      icon: 'ghost',
      signal: `${data.topUnderutilizedCategory.name} has lowest utilization`,
      metric: `Only ${data.topUnderutilizedCategory.utilization.toFixed(0)}% claimed — ${formatCurrencyAED(data.topUnderutilizedCategory.unused, { abbreviate: false, decimals: 0 })} unused`,
      actionLabel: `Improve policy clarity for ${data.topUnderutilizedCategory.name}`,
      actionParams: { 
        category: data.topUnderutilizedCategory.name.toLowerCase(),
        type: 'awareness',
        source: 'spend-insights',
      },
      confidence: 'high',
    });
  }

  // 2. Overall utilization gap
  if (data.overallUtilization < 75) {
    insights.push({
      id: 'utilization-gap',
      icon: data.overallUtilization < 60 ? 'alert' : 'trend-down',
      signal: `Overall utilization at ${data.overallUtilization.toFixed(0)}% (target: 75%)`,
      metric: `${formatCurrencyAED(data.unusedEntitlement, { abbreviate: false, decimals: 0 })} in entitled benefits remain unclaimed`,
      actionLabel: 'Launch awareness campaign',
      actionParams: { 
        type: 'campaign',
        source: 'spend-insights',
      },
      confidence: 'high',
    });
  }

  // 3. Segment-based insight
  if (data.lowUtilizationSegments.length > 0) {
    const segment = data.lowUtilizationSegments[0];
    insights.push({
      id: 'segment-utilization',
      icon: 'target',
      signal: `Utilization lower in ${segment.name} (${segment.dimension})`,
      metric: `${segment.utilization.toFixed(0)}% utilization vs org average — investigate eligibility gaps`,
      actionLabel: `Target ${segment.name} segment`,
      actionParams: { 
        segment: segment.name.toLowerCase(),
        dimension: segment.dimension.toLowerCase(),
        source: 'spend-insights',
      },
      confidence: 'medium',
    });
  }

  // 4. Policy friction insight
  if (data.highRejectionPolicy) {
    insights.push({
      id: 'policy-friction',
      icon: 'policy',
      signal: `High rejection rate for ${data.highRejectionPolicy.name}`,
      metric: `${data.highRejectionPolicy.rejectionRate.toFixed(0)}% of claims rejected — may indicate policy ambiguity`,
      actionLabel: `Review ${data.highRejectionPolicy.name} policy`,
      actionParams: { 
        category: data.highRejectionPolicy.name.toLowerCase(),
        type: 'policy_review',
        source: 'spend-insights',
      },
      confidence: 'high',
    });
  }

  return insights.slice(0, 4); // Hard limit to 4
}
