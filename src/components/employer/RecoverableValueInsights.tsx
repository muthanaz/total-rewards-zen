/**
 * RecoverableValueInsights - Cause-Mapped Insights for Recoverable Value page
 * 
 * Displays exactly 4 insights, each mapped to one of the four causes:
 * - Awareness/Engagement
 * - Eligibility
 * - Process Friction
 * - Policy Design
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight,
  Lightbulb,
  Eye,
  Shield,
  FileWarning,
  BookOpen,
} from 'lucide-react';
import { cn, formatCurrencyAED, formatPercent } from '@/lib/utils';
import { Link } from 'react-router-dom';

export type RecoveryCauseType = 'awareness' | 'eligibility' | 'friction' | 'policy';

export interface RecoverableInsight {
  id: string;
  cause: RecoveryCauseType;
  signal: string;
  metric: string;
  metricValue: string;
  nextStep: string;
  deepLink: string;
}

interface RecoverableValueInsightsProps {
  insights: RecoverableInsight[];
  isDemo?: boolean;
}

const causeConfig: Record<RecoveryCauseType, {
  label: string;
  icon: typeof Eye;
  bgColor: string;
  textColor: string;
  badgeClass: string;
}> = {
  awareness: {
    label: 'Awareness',
    icon: Eye,
    bgColor: 'bg-info/10',
    textColor: 'text-info',
    badgeClass: 'border-info/30 text-info bg-info/5',
  },
  eligibility: {
    label: 'Eligibility',
    icon: Shield,
    bgColor: 'bg-purple-500/10',
    textColor: 'text-purple-500',
    badgeClass: 'border-purple-500/30 text-purple-500 bg-purple-500/5',
  },
  friction: {
    label: 'Friction',
    icon: FileWarning,
    bgColor: 'bg-warning/10',
    textColor: 'text-warning',
    badgeClass: 'border-warning/30 text-warning bg-warning/5',
  },
  policy: {
    label: 'Policy',
    icon: BookOpen,
    bgColor: 'bg-destructive/10',
    textColor: 'text-destructive',
    badgeClass: 'border-destructive/30 text-destructive bg-destructive/5',
  },
};

export function RecoverableValueInsights({ insights, isDemo }: RecoverableValueInsightsProps) {
  // Limit to exactly 4 insights
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
            <span className="text-xs text-muted-foreground">
              {displayInsights.length} insights by cause
            </span>
            {isDemo && (
              <Badge variant="outline" className="text-xs">Demo</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {displayInsights.map((insight) => {
            const config = causeConfig[insight.cause];
            const Icon = config.icon;

            return (
              <div
                key={insight.id}
                className="flex flex-col p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
              >
                {/* Header with Cause Badge */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={cn("p-1.5 rounded-lg", config.bgColor)}>
                      <Icon className={cn("w-4 h-4", config.textColor)} />
                    </div>
                    <Badge variant="outline" className={cn("text-[10px]", config.badgeClass)}>
                      {config.label}
                    </Badge>
                  </div>
                </div>

                {/* Signal */}
                <p className="font-medium text-sm mb-1">{insight.signal}</p>

                {/* Quantified Metric */}
                <p className="text-xs text-muted-foreground mb-2">
                  {insight.metric}: <span className="font-semibold text-foreground">{insight.metricValue}</span>
                </p>

                {/* Next Step with Deep Link */}
                <div className="mt-auto pt-2 border-t border-border/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs w-full justify-between hover:bg-accent/10"
                    asChild
                  >
                    <Link to={insight.deepLink}>
                      <span className="truncate">{insight.nextStep}</span>
                      <ArrowRight className="w-3 h-3 ml-1 shrink-0" />
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

// Helper to generate cause-mapped insights from data
export interface RecoverableDataForInsights {
  awarenessUnused: number;
  awarenessCategories: string[];
  eligibilityRejectRate: number;
  frictionMissingDocsRate: number;
  frictionAvgApprovalDays: number;
  policyRejectionCount: number;
  policyTopCategory: string;
}

export function generateRecoverableInsights(data: RecoverableDataForInsights): RecoverableInsight[] {
  return [
    {
      id: 'awareness',
      cause: 'awareness',
      signal: `${data.awarenessCategories.slice(0, 2).join(' & ')} have low claim rates despite high eligibility`,
      metric: 'Unrealized from awareness gaps',
      metricValue: formatCurrencyAED(data.awarenessUnused),
      nextStep: 'Launch awareness campaign',
      deepLink: '/employer/recommendations?action=awareness_campaign',
    },
    {
      id: 'eligibility',
      cause: 'eligibility',
      signal: 'Eligibility rules may be too restrictive',
      metric: 'Rejection rate due to eligibility',
      metricValue: formatPercent(data.eligibilityRejectRate),
      nextStep: 'Review eligibility criteria',
      deepLink: '/employer/policy-insights?filter=eligibility',
    },
    {
      id: 'friction',
      cause: 'friction',
      signal: 'Documentation requirements causing drop-offs',
      metric: 'Missing docs rate',
      metricValue: `${formatPercent(data.frictionMissingDocsRate)} | ${data.frictionAvgApprovalDays.toFixed(1)} days avg`,
      nextStep: 'Simplify claim process',
      deepLink: '/employer/recommendations?action=friction_fix',
    },
    {
      id: 'policy',
      cause: 'policy',
      signal: `${data.policyTopCategory} policy design causing rejections`,
      metric: 'Policy-related rejections',
      metricValue: `${data.policyRejectionCount} claims rejected`,
      nextStep: 'Revise policy language',
      deepLink: '/employer/policy-insights',
    },
  ];
}
