/**
 * EmployerPageInsights - Standardized insights section for employer analytics pages
 * 
 * Provides meaningful, actionable insights for HR/Exec users:
 * - Top drivers of spend/utilization
 * - Utilization gaps by segment
 * - Processing bottlenecks (claims SLA)
 * - NO speculative ROI claims
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, TrendingDown, AlertTriangle, Target, 
  ArrowRight, Users, Clock, BarChart3
} from 'lucide-react';
import { cn, formatCurrencyAED, formatPercent } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

export interface EmployerInsight {
  type: 'driver' | 'gap' | 'bottleneck' | 'opportunity';
  title: string;
  description: string;
  metric?: string;
  trend?: 'up' | 'down' | 'stable';
  actionLabel?: string;
  actionPath?: string;
}

export interface EmployerPageInsightsProps {
  title?: string;
  insights: EmployerInsight[];
  className?: string;
  onActionClick?: (path: string) => void;
}

const insightIcons = {
  driver: TrendingUp,
  gap: Users,
  bottleneck: Clock,
  opportunity: Target,
};

const insightColors = {
  driver: 'text-chart-1 bg-chart-1/10 border-chart-1/20',
  gap: 'text-warning bg-warning/10 border-warning/20',
  bottleneck: 'text-destructive bg-destructive/10 border-destructive/20',
  opportunity: 'text-success bg-success/10 border-success/20',
};

export function EmployerPageInsights({
  title = 'Key Insights',
  insights,
  className,
  onActionClick,
}: EmployerPageInsightsProps) {
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';
  
  if (insights.length === 0) return null;
  
  return (
    <Card className={cn('border-muted', className)}>
      <CardHeader className="pb-3">
        <CardTitle className={cn(
          'text-base font-display flex items-center gap-2',
          isRTL && 'flex-row-reverse'
        )}>
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.map((insight, index) => {
            const Icon = insightIcons[insight.type];
            const colorClass = insightColors[insight.type];
            
            return (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border',
                  colorClass,
                  isRTL && 'flex-row-reverse text-right'
                )}
              >
                <div className="p-1.5 rounded-md bg-background/50 shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={cn(
                    'flex items-center gap-2 flex-wrap',
                    isRTL && 'flex-row-reverse'
                  )}>
                    <p className="font-medium text-sm">{insight.title}</p>
                    {insight.metric && (
                      <Badge variant="secondary" className="text-xs">
                        {insight.metric}
                      </Badge>
                    )}
                    {insight.trend && (
                      <span className={cn(
                        'text-xs flex items-center gap-0.5',
                        insight.trend === 'up' ? 'text-success' : 
                        insight.trend === 'down' ? 'text-destructive' : 
                        'text-muted-foreground'
                      )}>
                        {insight.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                        {insight.trend === 'down' && <TrendingDown className="w-3 h-3" />}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {insight.description}
                  </p>
                  {insight.actionLabel && insight.actionPath && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 mt-2 text-xs"
                      onClick={() => onActionClick?.(insight.actionPath!)}
                    >
                      {insight.actionLabel}
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Generate default employer insights based on data
 */
export function generateSpendInsights(data: {
  totalAllocated: number;
  totalUtilized: number;
  claimsSlaPercent: number;
  topCategory?: string;
  lowUtilizationSegment?: string;
}): EmployerInsight[] {
  const insights: EmployerInsight[] = [];
  const utilizationPercent = data.totalAllocated > 0 
    ? Math.round((data.totalUtilized / data.totalAllocated) * 100) 
    : 0;
  
  // Top driver
  if (data.topCategory) {
    insights.push({
      type: 'driver',
      title: `${data.topCategory} leads utilization`,
      description: `This category represents the highest share of benefit spend across your organization.`,
      metric: data.topCategory,
    });
  }
  
  // Utilization gap
  if (utilizationPercent < 60 && data.lowUtilizationSegment) {
    insights.push({
      type: 'gap',
      title: `Low utilization in ${data.lowUtilizationSegment}`,
      description: `This segment is significantly below average. Consider targeted communication or benefit education.`,
      metric: `${utilizationPercent}% utilized`,
      actionLabel: 'View Segment',
      actionPath: '/employer/segments',
    });
  }
  
  // SLA bottleneck
  if (data.claimsSlaPercent < 90) {
    insights.push({
      type: 'bottleneck',
      title: 'Claims SLA under target',
      description: `${100 - data.claimsSlaPercent}% of claims are missing the 5-day processing target. Review queue for blockers.`,
      metric: `${data.claimsSlaPercent}% on-time`,
      trend: 'down',
      actionLabel: 'View Queue',
      actionPath: '/employer/claims',
    });
  }
  
  // Opportunity
  const unusedSpend = data.totalAllocated - data.totalUtilized;
  if (unusedSpend > 100000) {
    insights.push({
      type: 'opportunity',
      title: 'Unused benefit budget',
      description: `${formatCurrencyAED(unusedSpend)} remains unutilized. Consider awareness campaigns or policy adjustments.`,
      metric: formatCurrencyAED(unusedSpend),
      actionLabel: 'See Recommendations',
      actionPath: '/employer/recommendations',
    });
  }
  
  return insights;
}
