/**
 * Segment Opportunities Panel
 * 
 * Ranked list of top segment opportunities with action buttons.
 */

import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { 
  Lightbulb, 
  ArrowRight, 
  Target, 
  Ghost, 
  Megaphone,
  Users,
  TrendingUp
} from 'lucide-react';
import { Currency } from '@/components/ui/Currency';
import { formatPercent, cn } from '@/lib/utils';
import { SegmentOpportunity, DRIVER_DEFINITIONS, ConfidenceLevel } from '@/hooks/useSegmentData';
import { toast } from 'sonner';

interface SegmentOpportunitiesProps {
  opportunities: SegmentOpportunity[];
  onSelectSegment: (dimensionId: string, segmentId: string) => void;
}

const driverIcons: Record<string, React.ElementType> = {
  awareness: Megaphone,
  policy_complexity: Target,
  process_friction: Ghost,
  vendor_access: Users,
  timing_mismatch: TrendingUp,
};

const confidenceBadgeStyles: Record<ConfidenceLevel, string> = {
  high: 'bg-success/10 text-success border-success/30',
  medium: 'bg-warning/10 text-warning border-warning/30',
  low: 'bg-destructive/10 text-destructive border-destructive/30',
};

export function SegmentOpportunities({ opportunities, onSelectSegment }: SegmentOpportunitiesProps) {
  const navigate = useNavigate();
  
  if (opportunities.length === 0) {
    return (
      <Card className="card-elevated">
        <CardContent className="py-8 text-center text-muted-foreground">
          <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No opportunities detected with current filters</p>
        </CardContent>
      </Card>
    );
  }
  
  const handleLaunchPlaybook = (opportunity: SegmentOpportunity) => {
    const playbookMap: Record<string, string> = {
      awareness: 'awareness_campaign',
      policy_complexity: 'policy_simplification',
      process_friction: 'friction_fix',
      vendor_access: 'vendor_enablement',
      timing_mismatch: 'awareness_campaign',
    };
    
    const playbookId = playbookMap[opportunity.primaryDriver] || 'awareness_campaign';
    navigate(`/employer/zombie?tab=playbooks&prefill_playbook=${playbookId}&prefill_segment=${opportunity.segmentId}`);
    
    toast.success('Opening Recovery Playbooks', {
      description: `Pre-filtered for ${opportunity.segmentName}`,
    });
  };
  
  const handleCreateRecommendation = (opportunity: SegmentOpportunity) => {
    navigate(`/employer/recommendations?prefill_segment=${opportunity.segmentId}&prefill_type=awareness`);
    
    toast.success('Creating Recommendation', {
      description: `For ${opportunity.segmentName}`,
    });
  };
  
  return (
    <Card className="card-elevated">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-accent" />
          Top Opportunities
          <InfoTooltip 
            formula="Segments with highest weighted recoverable value" 
            dataSource="benefit_entitlements × confidence" 
          />
          <Badge variant="secondary" className="ml-auto text-xs">
            Top {opportunities.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {opportunities.map((opp, idx) => {
          const DriverIcon = driverIcons[opp.primaryDriver] || Lightbulb;
          const driverDef = DRIVER_DEFINITIONS[opp.primaryDriver];
          
          return (
            <div 
              key={opp.segmentId}
              className="p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-medium w-5">
                    #{idx + 1}
                  </span>
                  <div>
                    <button
                      onClick={() => onSelectSegment(opp.dimensionId, opp.segmentId)}
                      className="font-medium text-sm hover:text-accent transition-colors text-left"
                    >
                      {opp.segmentName}
                    </button>
                    <p className="text-xs text-muted-foreground">
                      {opp.dimensionName} • {opp.headcount} employees
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-accent">
                    <Currency amount={opp.opportunityAED} />
                  </p>
                  <p className="text-xs text-muted-foreground">recoverable</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <Progress value={opp.utilizationRate} className="h-1.5 flex-1" />
                <span className="text-xs text-muted-foreground w-10">
                  {formatPercent(opp.utilizationRate)}
                </span>
                <Badge 
                  variant="outline" 
                  className={cn('text-xs capitalize', confidenceBadgeStyles[opp.confidence])}
                >
                  {opp.confidence}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs gap-1">
                    <DriverIcon className="h-3 w-3" />
                    {driverDef?.shortName || 'Awareness'}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 text-xs gap-1"
                    onClick={() => handleLaunchPlaybook(opp)}
                  >
                    <Ghost className="h-3 w-3" />
                    Launch playbook
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 text-xs gap-1"
                    onClick={() => handleCreateRecommendation(opp)}
                  >
                    <Target className="h-3 w-3" />
                    Recommend
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
