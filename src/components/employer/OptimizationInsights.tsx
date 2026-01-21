/**
 * OptimizationInsights - Key Insights with Deep Links for Optimization page
 * 
 * Displays 3-5 data-derived insights about waste concentration, root causes,
 * and segment drivers, each with actionable deep links.
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
  Users,
  FileText,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

export interface OptimizationInsight {
  id: string;
  icon: 'concentration' | 'root-cause' | 'segment' | 'process' | 'trend';
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

interface OptimizationInsightsProps {
  insights: OptimizationInsight[];
  isDemo?: boolean;
  maxItems?: number;
}

const iconMap = {
  'concentration': AlertTriangle,
  'root-cause': FileText,
  'segment': Users,
  'process': Clock,
  'trend': TrendingDown,
};

const iconColorMap = {
  'concentration': 'text-warning bg-warning/10',
  'root-cause': 'text-destructive bg-destructive/10',
  'segment': 'text-info bg-info/10',
  'process': 'text-chart-3 bg-chart-3/10',
  'trend': 'text-primary bg-primary/10',
};

const confidenceBadges = {
  high: { label: 'Measured', className: 'border-success/30 text-success' },
  medium: { label: 'Estimated', className: 'border-warning/30 text-warning' },
  low: { label: 'Proxy', className: 'border-destructive/30 text-destructive' },
};

function buildDeepLink(path: string, params?: Record<string, string>): string {
  if (!params) return path;
  const searchParams = new URLSearchParams(params);
  return `${path}?${searchParams.toString()}`;
}

export function OptimizationInsights({ insights, isDemo, maxItems = 5 }: OptimizationInsightsProps) {
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
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="font-medium text-sm">{insight.title}</p>
                    <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", confidence.className)}>
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

// Helper to generate insights from optimization data
export interface OptimizationDataForInsights {
  topCategories: { name: string; unused: number; utilizationRate: number }[];
  primaryRootCauses: { cause: string; count: number }[];
  lowUtilizationSegments: { name: string; dimension: string; utilization: number }[];
  processMetrics: { missingDocsRate: number; avgApprovalDays: number };
  yoyChange: number;
}

export function generateOptimizationInsights(data: OptimizationDataForInsights): OptimizationInsight[] {
  const insights: OptimizationInsight[] = [];
  const topTwo = data.topCategories.slice(0, 2);
  const topTwoNames = topTwo.map(c => c.name).join(' + ');
  const topTwoPercent = data.topCategories.length > 0 
    ? Math.round((topTwo.reduce((s, c) => s + c.unused, 0) / data.topCategories.reduce((s, c) => s + c.unused, 0)) * 100)
    : 0;

  // Concentration insight
  if (topTwoPercent > 50) {
    insights.push({
      id: 'concentration',
      icon: 'concentration',
      title: `${topTwoPercent}% of unrealized value is in ${topTwoNames}`,
      description: 'Concentrating recovery efforts here will have the highest impact.',
      impact: 'Focus area identified',
      deepLink: {
        label: 'View Spend',
        path: '/employer/spend',
        params: { tab: 'benefit-type' },
      },
      confidence: 'high',
    });
  }

  // Root cause insight
  if (data.primaryRootCauses.length > 0) {
    const topCause = data.primaryRootCauses[0];
    insights.push({
      id: 'root-cause',
      icon: 'root-cause',
      title: `Main driver: ${topCause.cause}`,
      description: `${topCause.count} categories affected by this root cause. Address with targeted interventions.`,
      deepLink: {
        label: 'View Policies',
        path: '/employer/policies',
      },
      confidence: 'medium',
    });
  }

  // Segment insight
  if (data.lowUtilizationSegments.length > 0) {
    const seg = data.lowUtilizationSegments[0];
    insights.push({
      id: 'segment',
      icon: 'segment',
      title: `${seg.name} (${seg.dimension}) has ${seg.utilization.toFixed(0)}% utilization`,
      description: 'This segment is significantly below average. Investigate eligibility or awareness gaps.',
      deepLink: {
        label: 'View Segments',
        path: '/employer/segments',
        params: { dimension: seg.dimension.toLowerCase(), value: seg.name },
      },
      confidence: 'high',
    });
  }

  // Process friction insight
  if (data.processMetrics.missingDocsRate > 15 || data.processMetrics.avgApprovalDays > 5) {
    insights.push({
      id: 'process',
      icon: 'process',
      title: 'Process friction detected',
      description: `${data.processMetrics.missingDocsRate.toFixed(0)}% missing docs rate, ${data.processMetrics.avgApprovalDays.toFixed(1)} day avg approval. May cause drop-offs.`,
      deepLink: {
        label: 'View Claims',
        path: '/employer/claims',
        params: { view: 'ops', status: 'pending' },
      },
      confidence: 'high',
    });
  }

  return insights;
}
