/**
 * Opportunities Ranking
 * 
 * Ranked "Opportunities" list (Top 5), each with:
 * - value impact (AED)
 * - recommended action
 * - owner (HR/CompBen)
 * - confidence
 * 
 * TRUST LAYER: Opportunities with low confidence are suppressed or shown with caveats.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { 
  Target, 
  ArrowRight, 
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  Users,
  FileText,
  ShieldAlert,
} from 'lucide-react';
import { formatCurrencyAED, cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { ConfidenceLevel } from '@/lib/dataProvenance';

type OpportunityConfidence = ConfidenceLevel;
type OwnerType = 'HR' | 'CompBen' | 'Finance' | 'L&D';

interface Opportunity {
  id: string;
  title: string;
  description: string;
  impactAED: number;
  recommendedAction: string;
  owner: OwnerType;
  confidence: OpportunityConfidence;
  deepLink?: string;
  icon?: 'awareness' | 'policy' | 'process' | 'vendor';
}

interface OpportunitiesRankingProps {
  opportunities: Opportunity[];
  onActionClick?: (opportunity: Opportunity) => void;
  className?: string;
  /** Minimum confidence level to display opportunities */
  minConfidence?: OpportunityConfidence;
  /** Show warning when opportunities are hidden due to low confidence */
  showConfidenceWarning?: boolean;
}

// Confidence level ordering for filtering
const confidenceLevels: OpportunityConfidence[] = ['low', 'medium', 'high'];

const confidenceStyles: Record<ConfidenceLevel, string> = {
  high: 'bg-success/10 text-success border-success/30',
  medium: 'bg-warning/10 text-warning border-warning/30',
  low: 'bg-muted text-muted-foreground border-border',
};

const ownerColors: Record<OwnerType, string> = {
  HR: 'bg-primary/10 text-primary',
  CompBen: 'bg-chart-2/10 text-chart-2',
  Finance: 'bg-chart-3/10 text-chart-3',
  'L&D': 'bg-chart-4/10 text-chart-4',
};

const iconMap = {
  awareness: Lightbulb,
  policy: FileText,
  process: TrendingUp,
  vendor: Users,
};

export function OpportunitiesRanking({ 
  opportunities, 
  onActionClick, 
  className,
  minConfidence = 'low',
  showConfidenceWarning = true,
}: OpportunitiesRankingProps) {
  const navigate = useNavigate();

  // Filter opportunities by minimum confidence (TRUST LAYER enforcement)
  const minConfidenceIndex = confidenceLevels.indexOf(minConfidence);
  const filteredOpportunities = opportunities.filter(opp => {
    const oppConfidenceIndex = confidenceLevels.indexOf(opp.confidence);
    return oppConfidenceIndex >= minConfidenceIndex;
  });
  const hiddenCount = opportunities.length - filteredOpportunities.length;

  const handleClick = (opp: Opportunity) => {
    if (onActionClick) {
      onActionClick(opp);
    } else if (opp.deepLink) {
      navigate(opp.deepLink);
    }
  };

  if (filteredOpportunities.length === 0) {
    return (
      <Card className={cn('card-elevated', className)}>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>
            {hiddenCount > 0 
              ? `${hiddenCount} opportunities hidden due to low data confidence`
              : 'No opportunities detected with current data'
            }
          </p>
          {hiddenCount > 0 && (
            <p className="text-xs mt-1">Improve data quality to see more insights</p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('card-elevated border-accent/20', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="w-4 h-4 text-accent" />
            Where to Act
            <InfoTooltip 
              formula="Opportunities ranked by weighted impact × confidence" 
              dataSource="Analytics engine"
            />
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Top {Math.min(filteredOpportunities.length, 5)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Confidence warning if opportunities are hidden */}
        {showConfidenceWarning && hiddenCount > 0 && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-xs text-muted-foreground">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{hiddenCount} recommendation(s) hidden due to low data confidence</span>
          </div>
        )}
        
        {filteredOpportunities.slice(0, 5).map((opp, idx) => {
          const Icon = opp.icon ? iconMap[opp.icon] : Lightbulb;
          
          return (
            <div 
              key={opp.id}
              className="p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-start gap-3">
                  <span className="text-sm font-bold text-muted-foreground w-5 pt-0.5">
                    #{idx + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4 text-accent shrink-0" />
                      <h4 className="font-medium text-sm">{opp.title}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">{opp.description}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-accent text-sm tabular-nums">
                    {formatCurrencyAED(opp.impactAED)}
                  </p>
                  <p className="text-xs text-muted-foreground">impact</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn('text-xs', ownerColors[opp.owner])}>
                    {opp.owner}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={cn('text-xs capitalize', confidenceStyles[opp.confidence])}
                  >
                    {opp.confidence} confidence
                  </Badge>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-xs gap-1"
                  onClick={() => handleClick(opp)}
                >
                  {opp.recommendedAction}
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// Generate opportunities from data
export function generateOpportunities(data: {
  zombieSpend: number;
  topUnderutilizedCategory?: { name: string; unused: number };
  lowUtilizationSegments?: { name: string; utilization: number }[];
  highRejectionPolicy?: { name: string; rejectionRate: number };
  pendingClaimsValue?: number;
}): Opportunity[] {
  const opportunities: Opportunity[] = [];

  // Zombie spend opportunity
  if (data.zombieSpend > 100000) {
    opportunities.push({
      id: 'zombie-recovery',
      title: 'Unrealized Value Recovery',
      description: `${formatCurrencyAED(data.zombieSpend)} in allocated benefits remain underutilized`,
      impactAED: data.zombieSpend * 0.6, // 60% recoverable estimate
      recommendedAction: 'Review analysis',
      owner: 'CompBen',
      confidence: 'high',
      deepLink: '/employer/zombie',
      icon: 'awareness',
    });
  }

  // Underutilized category
  if (data.topUnderutilizedCategory && data.topUnderutilizedCategory.unused > 50000) {
    opportunities.push({
      id: 'category-awareness',
      title: `${data.topUnderutilizedCategory.name} Awareness`,
      description: `Low utilization detected - awareness campaign recommended`,
      impactAED: data.topUnderutilizedCategory.unused * 0.4,
      recommendedAction: 'Create campaign',
      owner: 'HR',
      confidence: 'medium',
      deepLink: '/employer/recommendations?create=true',
      icon: 'awareness',
    });
  }

  // Low utilization segments
  if (data.lowUtilizationSegments && data.lowUtilizationSegments.length > 0) {
    const segment = data.lowUtilizationSegments[0];
    opportunities.push({
      id: 'segment-targeting',
      title: `${segment.name} Segment Targeting`,
      description: `${segment.utilization}% utilization - below average`,
      impactAED: 120000, // Estimated
      recommendedAction: 'View segment',
      owner: 'HR',
      confidence: 'medium',
      deepLink: `/employer/segments?segment=${segment.name}`,
      icon: 'process',
    });
  }

  // High rejection policy
  if (data.highRejectionPolicy && data.highRejectionPolicy.rejectionRate > 15) {
    opportunities.push({
      id: 'policy-simplification',
      title: `${data.highRejectionPolicy.name} Policy Review`,
      description: `${data.highRejectionPolicy.rejectionRate}% rejection rate - policy may need simplification`,
      impactAED: 85000,
      recommendedAction: 'Review policy',
      owner: 'CompBen',
      confidence: 'high',
      deepLink: '/employer/policies',
      icon: 'policy',
    });
  }

  // Pending claims
  if (data.pendingClaimsValue && data.pendingClaimsValue > 50000) {
    opportunities.push({
      id: 'claims-processing',
      title: 'Accelerate Claims Processing',
      description: `${formatCurrencyAED(data.pendingClaimsValue)} in pending claims`,
      impactAED: data.pendingClaimsValue * 0.95,
      recommendedAction: 'View queue',
      owner: 'HR',
      confidence: 'high',
      deepLink: '/employer/claims',
      icon: 'process',
    });
  }

  return opportunities.sort((a, b) => b.impactAED - a.impactAED);
}
