import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Lightbulb, 
  ArrowRight, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { DataCoverageMetrics } from './DataConfidenceBadge';

export interface NarrativeInsight {
  id: string;
  change: string; // What changed
  impact: string; // Why it matters
  action: string; // Suggested action
  actionLabel?: string;
  actionPath?: string;
  trend: 'up' | 'down' | 'neutral';
  trendIsPositive?: boolean; // Whether this trend direction is good
  confidence: 'high' | 'medium' | 'low';
  category?: string;
  metricValue?: string;
  previousValue?: string;
}

interface NarrativeInsightsProps {
  insights: NarrativeInsight[];
  coverageMetrics?: DataCoverageMetrics;
  coverageThreshold?: number;
  title?: string;
  subtitle?: string;
  className?: string;
  compact?: boolean;
  maxItems?: number;
  onCreateRecommendation?: (insight: NarrativeInsight) => void;
}

// Confidence indicator component
function ConfidenceIndicator({ confidence }: { confidence: 'high' | 'medium' | 'low' }) {
  const config = {
    high: { 
      label: 'Measured — Based on recorded data', 
      color: 'bg-emerald-500', 
      dots: 3 
    },
    medium: { 
      label: 'Estimated — Based on historical patterns', 
      color: 'bg-amber-500', 
      dots: 2 
    },
    low: { 
      label: 'Proxy — Derived from related data', 
      color: 'bg-red-500', 
      dots: 1 
    },
  };
  
  const { label, color, dots } = config[confidence];
  
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3].map(i => (
              <div 
                key={i}
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  i <= dots ? color : 'bg-muted'
                )}
              />
            ))}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Single insight bullet component
function InsightBullet({ 
  insight, 
  onCreateRecommendation,
  compact = false
}: { 
  insight: NarrativeInsight;
  onCreateRecommendation?: (insight: NarrativeInsight) => void;
  compact?: boolean;
}) {
  const TrendIcon = insight.trend === 'up' ? TrendingUp : 
                    insight.trend === 'down' ? TrendingDown : null;
  
  const trendColor = insight.trendIsPositive !== undefined
    ? (insight.trendIsPositive ? 'text-success' : 'text-destructive')
    : (insight.trend === 'up' ? 'text-success' : insight.trend === 'down' ? 'text-destructive' : 'text-muted-foreground');

  return (
    <div className={cn(
      "group relative flex gap-3 p-3 rounded-lg transition-all duration-200",
      "border border-transparent hover:border-border/50 hover:bg-accent/5",
      compact && "p-2"
    )}>
      {/* Trend indicator */}
      <div className={cn(
        "shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        insight.trendIsPositive 
          ? "bg-success/10" 
          : insight.trendIsPositive === false 
            ? "bg-destructive/10"
            : "bg-accent/10"
      )}>
        {TrendIcon ? (
          <TrendIcon className={cn("w-4 h-4", trendColor)} />
        ) : (
          <Lightbulb className="w-4 h-4 text-accent" />
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        {/* Change - What happened */}
        <div className="flex items-start gap-2">
          <p className={cn(
            "font-medium text-foreground leading-snug",
            compact ? "text-sm" : "text-sm"
          )}>
            {insight.change}
            {insight.metricValue && (
              <span className="ml-1.5 font-semibold text-accent">
                {insight.metricValue}
              </span>
            )}
            {insight.previousValue && (
              <span className="ml-1 text-muted-foreground text-xs">
                (was {insight.previousValue})
              </span>
            )}
          </p>
          <ConfidenceIndicator confidence={insight.confidence} />
        </div>
        
        {/* Impact - Why it matters */}
        <p className={cn(
          "text-muted-foreground leading-relaxed",
          compact ? "text-xs" : "text-sm"
        )}>
          <span className="font-medium text-foreground/80">Why it matters:</span>{' '}
          {insight.impact}
        </p>
        
        {/* Action - What to do */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className={cn(
            "text-accent font-medium",
            compact ? "text-xs" : "text-sm"
          )}>
            → {insight.action}
          </span>
          
          {insight.actionPath && (
            <Button 
              asChild 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 text-xs gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Link to={insight.actionPath}>
                {insight.actionLabel || 'View'}
                <ArrowRight className="w-3 h-3" />
              </Link>
            </Button>
          )}
          
          {onCreateRecommendation && (
            <Button 
              variant="outline" 
              size="sm" 
              className="h-6 px-2 text-xs gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onCreateRecommendation(insight)}
            >
              <Plus className="w-3 h-3" />
              Create recommendation
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Coverage caution banner
function CoverageCaution({ 
  coverage, 
  threshold = 70 
}: { 
  coverage: number; 
  threshold?: number;
}) {
  if (coverage >= threshold) return null;
  
  return (
    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-warning/10 border border-warning/20 text-sm">
      <ShieldAlert className="w-4 h-4 text-warning shrink-0" />
      <p className="text-warning-foreground">
        <span className="font-medium">Limited data coverage ({coverage}%)</span>
        {' '}— These insights are based on partial data. Improve coverage for more accurate analysis.
      </p>
      <Button 
        asChild 
        variant="outline" 
        size="sm" 
        className="shrink-0 h-7 text-xs ml-auto"
      >
        <Link to="/employer/integrations">
          Improve data
        </Link>
      </Button>
    </div>
  );
}

export function NarrativeInsights({
  insights,
  coverageMetrics,
  coverageThreshold = 70,
  title = 'Key Insights',
  subtitle,
  className,
  compact = false,
  maxItems = 4,
  onCreateRecommendation,
}: NarrativeInsightsProps) {
  const { language } = useLanguage();
  
  // Calculate overall coverage if metrics provided
  const overallCoverage = coverageMetrics 
    ? Math.round(
        (coverageMetrics.employeeCoverage + 
         coverageMetrics.entitlementCoverage + 
         coverageMetrics.policyCoverage + 
         coverageMetrics.claimsCoverage) / 4
      )
    : 100;
  
  const displayInsights = insights.slice(0, maxItems);
  const isLowCoverage = overallCoverage < coverageThreshold;

  if (insights.length === 0) {
    return null;
  }

  return (
    <Card className={cn(
      "border-accent/20 bg-gradient-to-br from-accent/5 via-card to-card",
      className
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-accent/10">
              <Sparkles className="w-4 h-4 text-accent" />
            </div>
            <div>
              <CardTitle className="text-base font-display">
                {title}
              </CardTitle>
              {subtitle && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          {displayInsights.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {displayInsights.length} insight{displayInsights.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2 pt-2">
        {/* Coverage caution if low */}
        {isLowCoverage && (
          <CoverageCaution coverage={overallCoverage} threshold={coverageThreshold} />
        )}
        
        {/* Insights list */}
        <div className="space-y-1">
          {displayInsights.map((insight) => (
            <InsightBullet 
              key={insight.id}
              insight={insight}
              onCreateRecommendation={onCreateRecommendation}
              compact={compact}
            />
          ))}
        </div>
        
        {/* View all link if more insights */}
        {insights.length > maxItems && (
          <div className="pt-2 text-center">
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
              View {insights.length - maxItems} more insights
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Pre-built insight generators for common scenarios
export function generateUtilizationInsight(
  current: number, 
  previous: number, 
  target: number
): NarrativeInsight {
  const change = current - previous;
  const isPositive = change > 0;
  const gapToTarget = target - current;
  
  return {
    id: 'utilization-trend',
    change: `Benefit utilization ${isPositive ? 'increased' : 'decreased'} by ${Math.abs(change).toFixed(1)}pp`,
    metricValue: `${current}%`,
    previousValue: `${previous}%`,
    impact: gapToTarget > 0 
      ? `Still ${gapToTarget.toFixed(1)}pp below target. Unrealized value may indicate awareness or accessibility gaps.`
      : `Exceeding target by ${Math.abs(gapToTarget).toFixed(1)}pp. Strong employee engagement with benefits.`,
    action: gapToTarget > 5 
      ? 'Review low-utilization benefits in Optimization'
      : 'Monitor and maintain current engagement levels',
    actionPath: gapToTarget > 5 ? '/employer/optimization' : undefined,
    trend: isPositive ? 'up' : 'down',
    trendIsPositive: isPositive,
    confidence: 'high',
    category: 'utilization',
  };
}

export function generateSpendInsight(
  totalSpend: number,
  budgetUtilization: number,
  topCategory: string
): NarrativeInsight {
  const isOverBudget = budgetUtilization > 100;
  
  return {
    id: 'spend-efficiency',
    change: `${topCategory} accounts for largest spend allocation`,
    metricValue: `${budgetUtilization.toFixed(0)}% of budget`,
    impact: isOverBudget 
      ? 'Spending exceeds allocated budget. Review forecasting accuracy and cost controls.'
      : 'Within budget parameters. Focus on ROI optimization.',
    action: isOverBudget 
      ? 'Review budget allocation in Spend & Utilization'
      : 'Analyze category-level ROI for rebalancing opportunities',
    actionPath: '/employer/spend',
    trend: isOverBudget ? 'up' : 'neutral',
    trendIsPositive: !isOverBudget,
    confidence: 'high',
    category: 'spend',
  };
}

export function generateLeakageInsight(
  leakageAmount: number,
  recoveryPotential: number,
  topCategory: string
): NarrativeInsight {
  return {
    id: 'leakage-recovery',
    change: `${topCategory} has highest unrealized value`,
    metricValue: `AED ${(leakageAmount / 1000).toFixed(0)}K`,
    impact: `Recovery potential of AED ${(recoveryPotential / 1000).toFixed(0)}K if addressed. This represents budget that could be reallocated or employee value that could be unlocked.`,
    action: 'Launch targeted recovery playbook for this category',
    actionPath: '/employer/optimization',
    actionLabel: 'View playbooks',
    trend: 'down',
    trendIsPositive: false,
    confidence: 'medium',
    category: 'leakage',
  };
}

export function generateSatisfactionInsight(
  current: number,
  previous: number,
  benchmark: number
): NarrativeInsight {
  const change = current - previous;
  const isPositive = change > 0;
  const vsBenchmark = current - benchmark;
  
  return {
    id: 'satisfaction-trend',
    change: `Employee satisfaction ${isPositive ? 'improved' : 'declined'} by ${Math.abs(change).toFixed(1)}pp`,
    metricValue: `${current}%`,
    previousValue: `${previous}%`,
    impact: vsBenchmark >= 0 
      ? `Outperforming industry benchmark by ${vsBenchmark.toFixed(1)}pp. Benefits program is a competitive advantage.`
      : `Below benchmark by ${Math.abs(vsBenchmark).toFixed(1)}pp. May impact retention and employer brand.`,
    action: vsBenchmark < 0 
      ? 'Review feedback themes and prioritize improvements'
      : 'Document success factors for continued excellence',
    actionPath: '/employer/recommendations',
    trend: isPositive ? 'up' : 'down',
    trendIsPositive: isPositive,
    confidence: 'high',
    category: 'satisfaction',
  };
}

export default NarrativeInsights;
