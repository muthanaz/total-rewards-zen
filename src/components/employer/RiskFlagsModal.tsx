/**
 * Risk Flags Modal
 * 
 * Modal showing detailed breakdown of risk flags for a segment.
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle, 
  TrendingDown, 
  FileWarning, 
  Clock, 
  Ban,
  DollarSign,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SegmentValue } from '@/hooks/useSegmentData';

interface RiskFlag {
  id: string;
  name: string;
  severity: 'high' | 'medium' | 'low';
  reason: string;
  affectedMetric: string;
  icon: React.ElementType;
}

interface RiskFlagsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  segmentName: string;
  segmentValue: SegmentValue | null;
}

const severityStyles = {
  high: 'bg-destructive/10 text-destructive border-destructive/30',
  medium: 'bg-warning/10 text-warning border-warning/30',
  low: 'bg-muted text-muted-foreground border-border',
};

const severityLabels = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

function generateRiskFlags(value: SegmentValue): RiskFlag[] {
  const flags: RiskFlag[] = [];
  
  // Low utilization flag
  if (value.utilizationRate < 60) {
    flags.push({
      id: 'low_utilization',
      name: 'Low Utilization vs Org Avg',
      severity: value.utilizationRate < 50 ? 'high' : 'medium',
      reason: `Utilization at ${value.utilizationRate.toFixed(1)}% is below the organization average of 75%`,
      affectedMetric: 'Utilization Rate',
      icon: TrendingDown,
    });
  }
  
  // High unused entitlement
  if (value.unusedEntitlement > 150000) {
    flags.push({
      id: 'high_unused',
      name: 'High Unused Entitlement',
      severity: value.unusedEntitlement > 250000 ? 'high' : 'medium',
      reason: `AED ${(value.unusedEntitlement / 1000).toFixed(0)}K in unused benefits indicates potential awareness or access gaps`,
      affectedMetric: 'Unused Entitlement',
      icon: DollarSign,
    });
  }
  
  // SLA breach risk
  if (value.slaRiskCount > 0) {
    flags.push({
      id: 'sla_risk',
      name: 'SLA Breach Risk',
      severity: value.slaRiskCount >= 3 ? 'high' : value.slaRiskCount >= 2 ? 'medium' : 'low',
      reason: `${value.slaRiskCount} claim(s) approaching or past SLA deadline`,
      affectedMetric: 'Claims Processing',
      icon: Clock,
    });
  }
  
  // Missing docs
  if (value.missingDocsCount > 0) {
    flags.push({
      id: 'missing_docs',
      name: 'High Missing Documentation',
      severity: value.missingDocsCount >= 5 ? 'high' : value.missingDocsCount >= 3 ? 'medium' : 'low',
      reason: `${value.missingDocsCount} claim(s) pending required documentation`,
      affectedMetric: 'Claims Approval',
      icon: FileWarning,
    });
  }
  
  // Over limit claims
  if (value.overLimitCount > 0) {
    flags.push({
      id: 'over_limit',
      name: 'Over-Limit Claims',
      severity: value.overLimitCount >= 2 ? 'high' : 'medium',
      reason: `${value.overLimitCount} claim(s) exceed policy limits and require exceptions`,
      affectedMetric: 'Policy Compliance',
      icon: Ban,
    });
  }
  
  // High retention risk
  if ((value as any).retentionRisk === 'high') {
    flags.push({
      id: 'retention_risk',
      name: 'High Retention Risk',
      severity: 'high',
      reason: 'Segment shows elevated turnover indicators based on satisfaction and engagement signals',
      affectedMetric: 'Employee Retention',
      icon: Users,
    });
  }
  
  // High claims cost delta
  const claimsDelta = (value as any).claimsCostDelta || 0;
  if (claimsDelta > 15) {
    flags.push({
      id: 'cost_spike',
      name: 'Outlier Spend Increase',
      severity: claimsDelta > 25 ? 'high' : 'medium',
      reason: `Claims cost increased ${claimsDelta}% vs previous period`,
      affectedMetric: 'Claims Cost',
      icon: DollarSign,
    });
  }
  
  return flags.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.severity] - order[b.severity];
  });
}

export function RiskFlagsModal({ 
  open, 
  onOpenChange, 
  segmentName,
  segmentValue 
}: RiskFlagsModalProps) {
  if (!segmentValue) return null;
  
  const flags = generateRiskFlags(segmentValue);
  
  const highCount = flags.filter(f => f.severity === 'high').length;
  const mediumCount = flags.filter(f => f.severity === 'medium').length;
  const lowCount = flags.filter(f => f.severity === 'low').length;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Risk Flags for {segmentName}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-3">
            <span>{flags.length} total flags identified</span>
            <div className="flex gap-2">
              {highCount > 0 && (
                <Badge variant="outline" className={severityStyles.high}>
                  {highCount} High
                </Badge>
              )}
              {mediumCount > 0 && (
                <Badge variant="outline" className={severityStyles.medium}>
                  {mediumCount} Medium
                </Badge>
              )}
              {lowCount > 0 && (
                <Badge variant="outline" className={severityStyles.low}>
                  {lowCount} Low
                </Badge>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 max-h-[60vh] overflow-y-auto py-4">
          {flags.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No risk flags for this segment</p>
            </div>
          ) : (
            flags.map((flag) => {
              const IconComponent = flag.icon;
              return (
                <div 
                  key={flag.id} 
                  className={cn(
                    "p-4 rounded-lg border",
                    flag.severity === 'high' ? 'border-destructive/30 bg-destructive/5' :
                    flag.severity === 'medium' ? 'border-warning/30 bg-warning/5' :
                    'border-border bg-muted/30'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-2 rounded-lg shrink-0",
                      flag.severity === 'high' ? 'bg-destructive/10' :
                      flag.severity === 'medium' ? 'bg-warning/10' :
                      'bg-muted'
                    )}>
                      <IconComponent className={cn(
                        "h-4 w-4",
                        flag.severity === 'high' ? 'text-destructive' :
                        flag.severity === 'medium' ? 'text-warning' :
                        'text-muted-foreground'
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="font-medium text-sm">{flag.name}</h4>
                        <Badge 
                          variant="outline" 
                          className={cn('text-xs shrink-0', severityStyles[flag.severity])}
                        >
                          {severityLabels[flag.severity]}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{flag.reason}</p>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-muted-foreground">Affects:</span>
                        <Badge variant="secondary" className="text-xs">
                          {flag.affectedMetric}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        <Separator />
        
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
