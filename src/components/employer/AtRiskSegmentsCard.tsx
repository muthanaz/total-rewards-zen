/**
 * At-Risk Segments Card
 * 
 * Surfaces the top 3 segments with highest retention risk or lowest utilization
 * directly on the executive dashboard for immediate visibility.
 */

import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { 
  AlertTriangle, 
  Users, 
  ArrowRight,
  TrendingDown,
  Shield,
} from 'lucide-react';
import { cn, formatCurrencyAED, formatPercent } from '@/lib/utils';

export interface AtRiskSegment {
  id: string;
  name: string;
  dimension: string; // e.g., "Grade", "Department"
  headcount: number;
  utilizationRate: number;
  unusedEntitlement: number;
  retentionRisk: 'high' | 'medium' | 'low';
  topDriver: string; // e.g., "Awareness Gap", "Process Friction"
}

interface AtRiskSegmentsCardProps {
  segments: AtRiskSegment[];
  className?: string;
}

const riskConfig = {
  high: { 
    label: 'High Risk', 
    className: 'bg-destructive/10 text-destructive border-destructive/30',
    icon: AlertTriangle,
  },
  medium: { 
    label: 'Medium Risk', 
    className: 'bg-warning/10 text-warning border-warning/30',
    icon: TrendingDown,
  },
  low: { 
    label: 'Low Risk', 
    className: 'bg-success/10 text-success border-success/30',
    icon: Shield,
  },
};

export function AtRiskSegmentsCard({ segments, className }: AtRiskSegmentsCardProps) {
  // Take top 3 by risk level (high first) then by unused entitlement
  const sortedSegments = [...segments]
    .sort((a, b) => {
      const riskOrder = { high: 0, medium: 1, low: 2 };
      if (riskOrder[a.retentionRisk] !== riskOrder[b.retentionRisk]) {
        return riskOrder[a.retentionRisk] - riskOrder[b.retentionRisk];
      }
      return b.unusedEntitlement - a.unusedEntitlement;
    })
    .slice(0, 3);

  const totalAtRiskValue = sortedSegments.reduce((sum, s) => sum + s.unusedEntitlement, 0);

  return (
    <Card className={cn("border-destructive/20", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            At-Risk Segments
            <InfoTooltip 
              formula="Segments with utilization <50% OR satisfaction <70%"
              dataSource="Segment analysis from benefit_entitlements + requests"
            />
          </CardTitle>
          <Badge variant="outline" className="text-xs bg-destructive/5 text-destructive border-destructive/20">
            {formatCurrencyAED(totalAtRiskValue, { abbreviate: true })} at risk
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedSegments.map((segment) => {
          const risk = riskConfig[segment.retentionRisk];
          const RiskIcon = risk.icon;

          return (
            <Link 
              key={segment.id} 
              to={`/employer/segments?dimension=${segment.dimension.toLowerCase()}&value=${segment.id}`}
            >
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-accent/30 hover:bg-muted/30 transition-all group">
                {/* Risk Indicator */}
                <div className={cn(
                  "p-2 rounded-lg shrink-0",
                  segment.retentionRisk === 'high' ? 'bg-destructive/10' : 
                  segment.retentionRisk === 'medium' ? 'bg-warning/10' : 'bg-success/10'
                )}>
                  <RiskIcon className={cn(
                    "w-4 h-4",
                    segment.retentionRisk === 'high' ? 'text-destructive' : 
                    segment.retentionRisk === 'medium' ? 'text-warning' : 'text-success'
                  )} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm truncate">{segment.name}</span>
                    <Badge variant="outline" className={cn("text-[10px] shrink-0", risk.className)}>
                      {risk.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {segment.headcount}
                    </span>
                    <span>•</span>
                    <span>{formatPercent(segment.utilizationRate)} util.</span>
                    <span>•</span>
                    <span className="text-warning">{segment.topDriver}</span>
                  </div>
                </div>

                {/* Unrealized Value */}
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-destructive tabular-nums">
                    {formatCurrencyAED(segment.unusedEntitlement, { abbreviate: true })}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Unrealized</p>
                </div>

                {/* Arrow */}
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
            </Link>
          );
        })}

        {/* View All Link */}
        <Button variant="ghost" size="sm" className="w-full mt-2" asChild>
          <Link to="/employer/segments">
            View all segments
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
