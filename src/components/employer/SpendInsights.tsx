/**
 * SpendInsights - Key Insights with Deep Links for Spend & Utilization page
 * 
 * Displays 3-5 data-derived insights with actionable deep links.
 * Each insight links to related pages (Segments, Zombie Spend, Claims, Policies).
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
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

export interface SpendInsight {
  id: string;
  icon: 'trend-up' | 'trend-down' | 'neutral' | 'alert' | 'target' | 'ghost' | 'policy';
  title: string;
  description: string;
  impact?: string;
  deepLink: {
    label: string;
    path: string;
    params?: Record<string, string>;
  };
  confidence: 'high' | 'medium' | 'low';
}

interface SpendInsightsProps {
  insights: SpendInsight[];
  isDemo?: boolean;
  maxItems?: number;
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

function buildDeepLink(path: string, params?: Record<string, string>): string {
  if (!params) return path;
  const searchParams = new URLSearchParams(params);
  return `${path}?${searchParams.toString()}`;
}

export function SpendInsights({ insights, isDemo, maxItems = 5 }: SpendInsightsProps) {
  const displayInsights = insights.slice(0, maxItems);

  return (
    <Card className="border-accent/20 bg-gradient-to-r from-card via-card to-accent/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-accent" />
            Key Insights
          </CardTitle>
          {isDemo && (
            <Badge variant="outline" className="text-xs">Demo Data</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayInsights.map((insight) => {
            const Icon = iconMap[insight.icon];
            const iconColor = iconColorMap[insight.icon];
            const confidence = confidenceBadges[insight.confidence];
            const deepLinkUrl = buildDeepLink(insight.deepLink.path, insight.deepLink.params);

            return (
              <div
                key={insight.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
              >
                {/* Icon */}
                <div className={cn("p-1.5 rounded-lg shrink-0", iconColor)}>
                  <Icon className="w-4 h-4" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-medium text-sm">{insight.title}</p>
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
                  <p className="text-xs text-muted-foreground">{insight.description}</p>
                  {insight.impact && (
                    <p className="text-xs text-success font-medium mt-1">{insight.impact}</p>
                  )}
                </div>

                {/* Deep Link */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 h-7 text-xs"
                  asChild
                >
                  <Link to={deepLinkUrl}>
                    {insight.deepLink.label}
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Link>
                </Button>
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

  // Utilization insight
  if (data.overallUtilization < 75) {
    insights.push({
      id: 'utilization-gap',
      icon: data.overallUtilization < 60 ? 'alert' : 'trend-down',
      title: `Overall utilization at ${data.overallUtilization.toFixed(0)}% (target: 75%)`,
      description: `${data.unusedEntitlement.toLocaleString('en-AE', { style: 'currency', currency: 'AED', maximumFractionDigits: 0 })} in entitled benefits remain unclaimed.`,
      deepLink: {
        label: 'View Zombie Spend',
        path: '/employer/zombie-spend',
      },
      confidence: 'high',
    });
  }

  // Top underutilized category
  if (data.topUnderutilizedCategory.utilization < 60) {
    insights.push({
      id: 'underutilized-category',
      icon: 'ghost',
      title: `${data.topUnderutilizedCategory.name} has lowest utilization`,
      description: `Only ${data.topUnderutilizedCategory.utilization.toFixed(0)}% claimed — ${data.topUnderutilizedCategory.unused.toLocaleString('en-AE', { style: 'currency', currency: 'AED', maximumFractionDigits: 0 })} unused.`,
      impact: 'High recovery potential',
      deepLink: {
        label: 'Drill down',
        path: '/employer/spend',
        params: { tab: 'benefit-type', focus: data.topUnderutilizedCategory.name.toLowerCase() },
      },
      confidence: 'high',
    });
  }

  // Segment-based insight
  if (data.lowUtilizationSegments.length > 0) {
    const segment = data.lowUtilizationSegments[0];
    insights.push({
      id: 'segment-utilization',
      icon: 'target',
      title: `Utilization lower in ${segment.name} (${segment.dimension})`,
      description: `${segment.utilization.toFixed(0)}% utilization vs org average. Investigate communication or eligibility gaps.`,
      deepLink: {
        label: 'View Segments',
        path: '/employer/segments',
        params: { dimension: segment.dimension.toLowerCase(), value: segment.name },
      },
      confidence: 'medium',
    });
  }

  // Policy-related insight
  if (data.highRejectionPolicy) {
    insights.push({
      id: 'policy-friction',
      icon: 'policy',
      title: `High rejection rate for ${data.highRejectionPolicy.name}`,
      description: `${data.highRejectionPolicy.rejectionRate.toFixed(0)}% of claims rejected — may indicate policy ambiguity or missing docs.`,
      deepLink: {
        label: 'Review Claims',
        path: '/employer/claims',
        params: { category: data.highRejectionPolicy.name.toLowerCase(), status: 'rejected' },
      },
      confidence: 'high',
    });
  }

  // YoY trend
  if (Math.abs(data.yoySpendChange) > 5) {
    insights.push({
      id: 'yoy-trend',
      icon: data.yoySpendChange > 0 ? 'trend-up' : 'trend-down',
      title: `YTD spend ${data.yoySpendChange > 0 ? 'up' : 'down'} ${Math.abs(data.yoySpendChange).toFixed(1)}% vs last year`,
      description: data.yoySpendChange > 0 
        ? 'Driven by increased health claims and education allowance uptake.'
        : 'Lower claims activity detected — review employee awareness.',
      deepLink: {
        label: 'View Trends',
        path: '/employer/spend',
        params: { tab: 'trend' },
      },
      confidence: 'high',
    });
  }

  return insights;
}
