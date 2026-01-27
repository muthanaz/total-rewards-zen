/**
 * Action Plan Card
 * Enhanced card for displaying actions with:
 * - Confidence badge + evidence link
 * - Dependency indicator
 * - Aging days
 * - Impact range
 */

import { useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Clock, 
  AlertTriangle, 
  Link2, 
  ExternalLink,
  CheckCircle2,
  Circle,
  Pause,
  XCircle,
  ArrowRight,
  FileText,
  Target,
  Users,
  ShoppingBag,
  TrendingDown,
  MoreHorizontal,
} from 'lucide-react';
import { format, formatDistanceToNow, differenceInDays, isPast } from 'date-fns';
import { cn } from '@/lib/utils';
import { formatCurrencyAED } from '@/lib/utils';
import type { ActionItem, Status, Priority, Confidence, ActionType, SourceType } from '@/hooks/useEmployerActions';

interface ActionPlanCardProps {
  action: ActionItem;
  onClick?: () => void;
  compact?: boolean;
}

const priorityConfig: Record<Priority, { color: string; bgColor: string }> = {
  P0: { color: 'text-red-600', bgColor: 'bg-red-500/10' },
  P1: { color: 'text-amber-600', bgColor: 'bg-amber-500/10' },
  P2: { color: 'text-primary', bgColor: 'bg-primary/10' },
};

const statusConfig: Record<Status, { icon: React.ElementType; color: string; label: string }> = {
  backlog: { icon: Circle, color: 'text-muted-foreground', label: 'Backlog' },
  in_progress: { icon: ArrowRight, color: 'text-blue-600', label: 'In Progress' },
  blocked: { icon: Pause, color: 'text-red-600', label: 'Blocked' },
  completed: { icon: CheckCircle2, color: 'text-emerald-600', label: 'Completed' },
  cancelled: { icon: XCircle, color: 'text-muted-foreground', label: 'Cancelled' },
};

const confidenceConfig: Record<Confidence, { color: string; bgColor: string; label: string }> = {
  high: { color: 'text-emerald-600', bgColor: 'bg-emerald-500/10', label: 'High Confidence' },
  medium: { color: 'text-amber-600', bgColor: 'bg-amber-500/10', label: 'Medium Confidence' },
  low: { color: 'text-muted-foreground', bgColor: 'bg-muted', label: 'Low Confidence' },
};

const typeIcons: Record<ActionType, React.ElementType> = {
  policy: FileText,
  process: Target,
  comms: Users,
  vendor: ShoppingBag,
  analytics: TrendingDown,
};

const sourceLabels: Record<SourceType, string> = {
  zombie_spend: 'Budget Leakage',
  segments: 'Segments',
  claims: 'Claims',
  policies: 'Policies',
  survey: 'Survey',
  manual: 'Manual',
};

export function ActionPlanCard({ action, onClick, compact = false }: ActionPlanCardProps) {
  const agingDays = useMemo(() => {
    return differenceInDays(new Date(), action.createdAt);
  }, [action.createdAt]);

  const isOverdue = useMemo(() => {
    return action.dueDate && isPast(action.dueDate) && !['completed', 'cancelled'].includes(action.status);
  }, [action.dueDate, action.status]);

  const hasBlockers = action.blockers.length > 0;
  const hasDependencies = action.linkedEntities.some(e => e.type === 'policy' || e.type === 'metric');
  const hasEvidence = action.confidenceNote?.includes('Evidence:');

  const impactDisplay = useMemo(() => {
    const { expectedImpact } = action;
    if (expectedImpact.costAvoidanceLow && expectedImpact.costAvoidanceHigh) {
      return `${formatCurrencyAED(expectedImpact.costAvoidanceLow)} – ${formatCurrencyAED(expectedImpact.costAvoidanceHigh)}`;
    }
    if (expectedImpact.costAvoidance) {
      return formatCurrencyAED(expectedImpact.costAvoidance);
    }
    if (expectedImpact.utilizationChange) {
      return `+${expectedImpact.utilizationChange}% utilization`;
    }
    if (expectedImpact.slaReduction) {
      return `-${expectedImpact.slaReduction}h SLA`;
    }
    if (expectedImpact.satisfactionChange) {
      return `+${expectedImpact.satisfactionChange} pts`;
    }
    return null;
  }, [action.expectedImpact]);

  const StatusIcon = statusConfig[action.status].icon;
  const TypeIcon = typeIcons[action.type];
  const confConfig = confidenceConfig[action.confidence];

  if (compact) {
    return (
      <div 
        className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
        onClick={onClick}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={cn("text-[10px] border-0", priorityConfig[action.priority].bgColor, priorityConfig[action.priority].color)}>
                {action.priority}
              </Badge>
              <Badge variant="outline" className={cn("text-[10px] gap-1", confConfig.color)}>
                {action.confidence}
              </Badge>
            </div>
            <p className="text-sm font-medium line-clamp-1">{action.title}</p>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {agingDays}d ago
              </span>
              {hasBlockers && (
                <span className="flex items-center gap-1 text-red-500">
                  <AlertTriangle className="w-3 h-3" />
                  Blocked
                </span>
              )}
              {hasDependencies && (
                <span className="flex items-center gap-1">
                  <Link2 className="w-3 h-3" />
                  Linked
                </span>
              )}
            </div>
          </div>
          {impactDisplay && (
            <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
              {impactDisplay}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Card 
        className={cn(
          "hover:shadow-md cursor-pointer transition-all group",
          hasBlockers && "border-red-500/30",
          isOverdue && "border-amber-500/30"
        )}
        onClick={onClick}
      >
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge className={cn("text-xs border-0", priorityConfig[action.priority].bgColor, priorityConfig[action.priority].color)}>
                {action.priority}
              </Badge>
              <Badge variant="outline" className={cn("text-xs", statusConfig[action.status].color)}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusConfig[action.status].label}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <TypeIcon className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-2 px-4 pb-4 space-y-3">
          {/* Title & Description */}
          <div>
            <h4 className="font-medium text-sm line-clamp-2">{action.title}</h4>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{action.description}</p>
          </div>

          {/* Confidence Badge + Evidence Link */}
          <div className="flex items-center gap-2 flex-wrap">
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className={cn("text-[10px] border-0 gap-1", confConfig.bgColor, confConfig.color)}>
                  {action.confidence} confidence
                  {action.dataCompletenessPct < 100 && (
                    <span className="opacity-70">({Math.round(action.dataCompletenessPct)}%)</span>
                  )}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{confConfig.label}</p>
                {action.confidenceNote && (
                  <p className="text-xs text-muted-foreground mt-1">{action.confidenceNote}</p>
                )}
              </TooltipContent>
            </Tooltip>

            {hasEvidence && (
              <Badge variant="outline" className="text-[10px] gap-1 text-primary">
                <ExternalLink className="w-3 h-3" />
                Evidence
              </Badge>
            )}

            {hasDependencies && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="text-[10px] gap-1">
                    <Link2 className="w-3 h-3" />
                    {action.linkedEntities.length} linked
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs font-medium mb-1">Dependencies:</p>
                  {action.linkedEntities.map((e, i) => (
                    <p key={i} className="text-xs text-muted-foreground">• {e.name}</p>
                  ))}
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Impact Range */}
          {impactDisplay && (
            <div className="p-2 rounded bg-muted/50">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Expected Impact</p>
              <p className="text-sm font-mono font-medium">{impactDisplay}</p>
            </div>
          )}

          {/* Blockers Warning */}
          {hasBlockers && (
            <div className="flex items-center gap-2 p-2 rounded bg-red-500/5 border border-red-500/20">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-xs text-red-600">
                {action.blockers.length} blocker{action.blockers.length > 1 ? 's' : ''}
              </span>
            </div>
          )}

          {/* Footer: Owner, Due, Aging */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarFallback className={cn("text-[9px]", !action.ownerId && "bg-amber-500/10 text-amber-600")}>
                  {action.ownerId ? action.owner.split(' ').map(n => n[0]).join('') : '?'}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground truncate max-w-[60px]">
                {action.ownerId ? action.owner.split(' ')[0] : 'None'}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs">
              {/* Aging Days */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={cn(
                    "flex items-center gap-1",
                    agingDays > 14 && "text-amber-600",
                    agingDays > 30 && "text-red-500"
                  )}>
                    <Clock className="w-3 h-3" />
                    {agingDays}d
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Created {formatDistanceToNow(action.createdAt, { addSuffix: true })}</p>
                </TooltipContent>
              </Tooltip>

              {/* Due Date */}
              {action.dueDate && (
                <span className={cn("text-muted-foreground", isOverdue && "text-red-500 font-medium")}>
                  Due {format(action.dueDate, 'MMM d')}
                  {isOverdue && ' ⚠'}
                </span>
              )}
            </div>
          </div>

          {/* Source Badge */}
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-[10px]">
              {sourceLabels[action.sourceType]}
            </Badge>
            {action.linkedCategories.length > 0 && (
              <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                {action.linkedCategories[0]}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

export default ActionPlanCard;
