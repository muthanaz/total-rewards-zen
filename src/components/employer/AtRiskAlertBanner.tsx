/**
 * At-Risk Alert Banner
 * 
 * Displays a prominent alert when any segment drops below utilization threshold.
 * Used on Segments page for executive visibility.
 */

import { Link } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowRight, Users } from 'lucide-react';
import { cn, formatCurrencyAED, formatPercent } from '@/lib/utils';

export interface AtRiskSegmentAlert {
  segmentName: string;
  dimension: string;
  headcount: number;
  utilizationRate: number;
  unusedEntitlement: number;
}

interface AtRiskAlertBannerProps {
  segments: AtRiskSegmentAlert[];
  utilizationThreshold?: number;
  className?: string;
}

export function AtRiskAlertBanner({ 
  segments, 
  utilizationThreshold = 50, 
  className 
}: AtRiskAlertBannerProps) {
  // Filter segments below threshold
  const atRiskSegments = segments.filter(s => s.utilizationRate < utilizationThreshold);
  
  if (atRiskSegments.length === 0) return null;

  const totalHeadcount = atRiskSegments.reduce((sum, s) => sum + s.headcount, 0);
  const totalUnused = atRiskSegments.reduce((sum, s) => sum + s.unusedEntitlement, 0);
  const worstSegment = atRiskSegments.reduce((worst, s) => 
    s.utilizationRate < worst.utilizationRate ? s : worst
  , atRiskSegments[0]);

  return (
    <Alert 
      variant="destructive" 
      className={cn(
        "border-warning/50 bg-warning/5 [&>svg]:text-warning",
        className
      )}
    >
      <AlertTriangle className="h-5 w-5" />
      <div className="flex-1">
        <AlertTitle className="text-foreground mb-1">
          {atRiskSegments.length} Segment{atRiskSegments.length > 1 ? 's' : ''} Below {utilizationThreshold}% Utilization
        </AlertTitle>
        <AlertDescription className="text-muted-foreground">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-6">
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                <strong>{totalHeadcount}</strong> employees at risk
              </span>
              <span>
                <strong className="text-warning">{formatCurrencyAED(totalUnused, { abbreviate: true })}</strong> unrealized value
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Lowest:</span>
              <span className="font-medium">{worstSegment.segmentName}</span>
              <span className="text-destructive font-bold">{formatPercent(worstSegment.utilizationRate)}</span>
            </div>
          </div>
        </AlertDescription>
      </div>
      
      <Link to="/employer/recommendations" className="shrink-0">
        <Button variant="outline" size="sm" className="gap-1.5 border-warning/30 hover:bg-warning/10">
          Take Action
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </Alert>
  );
}
