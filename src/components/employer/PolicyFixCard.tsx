import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Users, 
  Zap, 
  ArrowRight,
  Plus,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Link2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConfidenceBadge } from '@/components/shared';

export interface PolicyFix {
  id: string;
  policy: string;
  policyId: string;
  fix: string;
  description?: string;
  type: 'quick_win' | 'strategic';
  effort: 'low' | 'medium' | 'high';
  timeToImplement: string;
  ownerRole: string;
  dependencies?: string[];
  expectedImpact: {
    questionsReduction?: number;
    rejectionsReduction?: number;
    cycleTimeReduction?: number;
    utilizationUplift?: number;
    costAvoidance?: number;
  };
  confidence: 'measured' | 'estimated' | 'proxy';
  evidenceLink?: string;
  isLinkedToAction: boolean;
  linkedActionId?: string;
}

interface PolicyFixCardProps {
  fix: PolicyFix;
  onAddToActionPlan: (fix: PolicyFix) => void;
  onViewEvidence?: (fix: PolicyFix) => void;
  onViewAction?: (actionId: string) => void;
  variant?: 'quick_win' | 'strategic';
}

export function PolicyFixCard({
  fix,
  onAddToActionPlan,
  onViewEvidence,
  onViewAction,
  variant = 'quick_win',
}: PolicyFixCardProps) {
  const getEffortConfig = (effort: string) => {
    switch (effort) {
      case 'low':
        return { bg: 'bg-green-500/10', text: 'text-green-600', label: 'Low Effort' };
      case 'medium':
        return { bg: 'bg-amber-500/10', text: 'text-amber-600', label: 'Medium Effort' };
      case 'high':
        return { bg: 'bg-red-500/10', text: 'text-red-600', label: 'High Effort' };
      default:
        return { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Unknown' };
    }
  };

  const effortConfig = getEffortConfig(fix.effort);
  const isQuickWin = variant === 'quick_win';

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `AED ${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `AED ${(value / 1000).toFixed(0)}K`;
    return `AED ${value}`;
  };

  return (
    <div className={cn(
      "p-4 rounded-lg border",
      isQuickWin ? "bg-green-500/5 border-green-500/20" : "bg-amber-500/5 border-amber-500/20"
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <Badge variant="outline" className="text-xs mb-1.5">{fix.policy}</Badge>
          <p className="text-sm font-medium">{fix.fix}</p>
          {fix.description && (
            <p className="text-xs text-muted-foreground mt-1">{fix.description}</p>
          )}
        </div>
        <Badge className={cn(effortConfig.bg, effortConfig.text, "shrink-0 text-xs")}>
          {effortConfig.label}
        </Badge>
      </div>

      {/* Metadata Row */}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {fix.timeToImplement}
        </div>
        <div className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          {fix.ownerRole}
        </div>
        {fix.dependencies && fix.dependencies.length > 0 && (
          <div className="flex items-center gap-1">
            <Link2 className="h-3 w-3" />
            {fix.dependencies.length} dependency
          </div>
        )}
      </div>

      {/* Impact Metrics */}
      <div className="flex flex-wrap gap-2 mb-3">
        {fix.expectedImpact.questionsReduction && (
          <Badge variant="outline" className={cn(
            "text-xs",
            isQuickWin ? "bg-green-500/10 text-green-600 border-green-500/30" : "bg-amber-500/10 text-amber-600 border-amber-500/30"
          )}>
            <TrendingUp className="h-3 w-3 mr-1" />
            -{fix.expectedImpact.questionsReduction}% questions
          </Badge>
        )}
        {fix.expectedImpact.rejectionsReduction && (
          <Badge variant="outline" className={cn(
            "text-xs",
            isQuickWin ? "bg-green-500/10 text-green-600 border-green-500/30" : "bg-amber-500/10 text-amber-600 border-amber-500/30"
          )}>
            -{fix.expectedImpact.rejectionsReduction}% rejections
          </Badge>
        )}
        {fix.expectedImpact.cycleTimeReduction && (
          <Badge variant="outline" className={cn(
            "text-xs",
            isQuickWin ? "bg-green-500/10 text-green-600 border-green-500/30" : "bg-amber-500/10 text-amber-600 border-amber-500/30"
          )}>
            -{fix.expectedImpact.cycleTimeReduction}% cycle time
          </Badge>
        )}
        {fix.expectedImpact.utilizationUplift && (
          <Badge variant="outline" className={cn(
            "text-xs",
            isQuickWin ? "bg-green-500/10 text-green-600 border-green-500/30" : "bg-amber-500/10 text-amber-600 border-amber-500/30"
          )}>
            +{fix.expectedImpact.utilizationUplift}% utilization
          </Badge>
        )}
        {fix.expectedImpact.costAvoidance && (
          <Badge variant="outline" className={cn(
            "text-xs",
            isQuickWin ? "bg-green-500/10 text-green-600 border-green-500/30" : "bg-amber-500/10 text-amber-600 border-amber-500/30"
          )}>
            <Zap className="h-3 w-3 mr-1" />
            {formatCurrency(fix.expectedImpact.costAvoidance)} savings
          </Badge>
        )}
      </div>

      {/* Confidence + Evidence */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ConfidenceBadge level={fix.confidence as 'measured' | 'estimated' | 'proxy' | 'missing'} size="sm" />
          {fix.evidenceLink && onViewEvidence && (
            <Button 
              variant="link" 
              size="sm" 
              className="h-auto p-0 text-xs"
              onClick={() => onViewEvidence(fix)}
            >
              View evidence
            </Button>
          )}
        </div>
      </div>

      {/* Dependencies (if any) */}
      {fix.dependencies && fix.dependencies.length > 0 && (
        <div className="p-2 rounded bg-muted/50 mb-3">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Dependencies: {fix.dependencies.join(', ')}
          </p>
        </div>
      )}

      {/* Action Button */}
      {fix.isLinkedToAction ? (
        <Button 
          size="sm" 
          variant="outline"
          className="w-full gap-1.5"
          onClick={() => fix.linkedActionId && onViewAction?.(fix.linkedActionId)}
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
          Linked to Action Plan
          <ArrowRight className="h-3.5 w-3.5 ml-auto" />
        </Button>
      ) : (
        <Button 
          size="sm" 
          className="w-full gap-1.5"
          onClick={() => onAddToActionPlan(fix)}
        >
          <Plus className="h-3.5 w-3.5" />
          Add to Action Plan
        </Button>
      )}
    </div>
  );
}
