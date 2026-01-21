/**
 * Marketplace Opportunity Insights
 * 
 * Panel displaying 3-5 actionable insights with "Why it matters" + CTA
 * Similar to Zombie Spend style insights
 */

import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Lightbulb, TrendingUp, TrendingDown, AlertTriangle, Target, ArrowRight,
  Megaphone, RefreshCw, Star
} from 'lucide-react';
import { formatCurrencyAED, formatPercent, cn } from '@/lib/utils';
import { toast } from 'sonner';

interface OpportunityInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'success';
  title: string;
  description: string;
  whyItMatters: string;
  impact?: string;
  confidence: 'high' | 'medium' | 'low';
  cta: {
    label: string;
    action: string;
    params?: Record<string, string>;
  };
}

interface MarketplaceOpportunityInsightsProps {
  data?: {
    totalActivations: number;
    totalSavings: number;
    engagementRate: number;
    avgRating: number;
    categoryPerformance: { category: string; activations: number; avgSavings: number }[];
  };
}

const typeStyles = {
  opportunity: {
    icon: TrendingUp,
    bg: 'bg-accent/5',
    border: 'border-accent/30',
    iconColor: 'text-accent',
    badgeClass: 'bg-accent/10 text-accent border-accent/30',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-warning/5',
    border: 'border-warning/30',
    iconColor: 'text-warning',
    badgeClass: 'bg-warning/10 text-warning border-warning/30',
  },
  success: {
    icon: Star,
    bg: 'bg-success/5',
    border: 'border-success/30',
    iconColor: 'text-success',
    badgeClass: 'bg-success/10 text-success border-success/30',
  },
};

const confidenceLabels = {
  high: 'High confidence',
  medium: 'Medium confidence',
  low: 'Low confidence (Est.)',
};

export function MarketplaceOpportunityInsights({ data }: MarketplaceOpportunityInsightsProps) {
  const navigate = useNavigate();
  
  // Generate insights based on data patterns
  const insights: OpportunityInsight[] = [
    {
      id: '1',
      type: 'opportunity',
      title: 'High engagement, low savings in Food & Coffee',
      description: 'This category has the most activations but below-average savings per redemption.',
      whyItMatters: 'Negotiating better discount depth could increase total savings by AED 15K+ annually without changing behavior.',
      impact: '+AED 15,000',
      confidence: 'high',
      cta: {
        label: 'Negotiate discounts',
        action: '/employer/recommendations',
        params: { create: 'true', source: 'marketplace', prefill_type: 'vendor_negotiation', prefill_category: 'Food & Coffee' },
      },
    },
    {
      id: '2',
      type: 'opportunity',
      title: 'Strong savings in Travel but low unique users',
      description: 'Travel offers deliver highest savings per activation, but only 23% of employees use them.',
      whyItMatters: 'A targeted awareness campaign could unlock AED 25K+ in additional employee savings.',
      impact: '+AED 25,000',
      confidence: 'medium',
      cta: {
        label: 'Launch awareness campaign',
        action: '/employer/recommendations',
        params: { create: 'true', source: 'marketplace', prefill_type: 'awareness', prefill_category: 'Travel' },
      },
    },
    {
      id: '3',
      type: 'warning',
      title: 'Low ratings in Food & Coffee offers',
      description: '3 offers in this category have ratings below 4.0, indicating quality or experience issues.',
      whyItMatters: 'Low-rated offers reduce trust and engagement across the marketplace.',
      confidence: 'high',
      cta: {
        label: 'Audit offer quality',
        action: '/employer/recommendations',
        params: { create: 'true', source: 'marketplace', prefill_type: 'vendor_audit', prefill_category: 'Food & Coffee' },
      },
    },
    {
      id: '4',
      type: 'success',
      title: 'Fitness & Health showing strong growth',
      description: 'This category grew 45% MoM with improving repeat rates.',
      whyItMatters: 'Momentum to build on — consider expanding vendor partnerships.',
      confidence: 'high',
      cta: {
        label: 'Expand partnerships',
        action: '/admin/vendors',
        params: { filter_category: 'Health & Fitness' },
      },
    },
    {
      id: '5',
      type: 'warning',
      title: '22% coverage gap identified',
      description: '22% of employees have no marketplace activity in the last 90 days.',
      whyItMatters: 'These employees are missing out on potential savings, impacting perceived benefits value.',
      confidence: 'medium',
      cta: {
        label: 'Target inactive users',
        action: '/employer/recommendations',
        params: { create: 'true', source: 'marketplace', prefill_type: 'awareness', prefill_segment: 'inactive' },
      },
    },
  ];
  
  const handleInsightAction = (insight: OpportunityInsight) => {
    const queryParams = new URLSearchParams(insight.cta.params || {}).toString();
    const url = insight.cta.action + (queryParams ? `?${queryParams}` : '');
    navigate(url);
    toast.success('Opening action', { description: insight.cta.label });
  };
  
  return (
    <Card className="card-elevated">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-accent" />
          Opportunity Insights
          <Badge variant="secondary" className="ml-auto text-xs">
            {insights.length} insights
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight) => {
          const style = typeStyles[insight.type];
          const Icon = style.icon;
          
          return (
            <div 
              key={insight.id}
              className={cn(
                'p-4 rounded-lg border transition-colors',
                style.bg,
                style.border,
                'hover:shadow-sm'
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn('p-2 rounded-lg bg-background/50', style.iconColor)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-medium text-sm">{insight.title}</p>
                    <Badge variant="outline" className={cn('text-xs', style.badgeClass)}>
                      {confidenceLabels[insight.confidence]}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{insight.description}</p>
                  <div className="bg-background/50 p-2 rounded text-xs mb-3">
                    <span className="font-medium">Why it matters: </span>
                    <span className="text-muted-foreground">{insight.whyItMatters}</span>
                    {insight.impact && (
                      <Badge variant="secondary" className="ml-2 text-success">
                        {insight.impact}
                      </Badge>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-xs gap-1"
                    onClick={() => handleInsightAction(insight)}
                  >
                    {insight.cta.label}
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
