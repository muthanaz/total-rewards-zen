/**
 * Governance Action Card
 * 
 * Full-featured card displaying all mandatory fields for governance-grade tracking.
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Calendar, 
  DollarSign, 
  Target,
  ExternalLink,
  User,
  ArrowRight,
  AlertTriangle,
  TrendingUp,
  Clock
} from 'lucide-react';
import { format, isPast, formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { cn, formatCurrencyAED, formatPercent } from '@/lib/utils';
import { GovernanceAction, KanbanColumn } from './types';

interface GovernanceActionCardProps {
  action: GovernanceAction;
  onClick?: () => void;
  compact?: boolean;
}

const priorityConfig = {
  P0: { label: 'P0 - Critical', color: 'text-destructive', bgColor: 'bg-destructive/10' },
  P1: { label: 'P1 - High', color: 'text-warning', bgColor: 'bg-warning/10' },
  P2: { label: 'P2 - Medium', color: 'text-muted-foreground', bgColor: 'bg-muted' },
};

const statusConfig: Record<KanbanColumn, { label: string; color: string }> = {
  backlog: { label: 'Backlog', color: 'text-muted-foreground' },
  in_progress: { label: 'In Progress', color: 'text-blue-500' },
  waiting: { label: 'Waiting', color: 'text-warning' },
  done: { label: 'Done', color: 'text-success' },
};

const confidenceConfig = {
  high: { label: 'High', color: 'text-success', bgColor: 'bg-success/10' },
  medium: { label: 'Med', color: 'text-warning', bgColor: 'bg-warning/10' },
  low: { label: 'Low', color: 'text-muted-foreground', bgColor: 'bg-muted' },
};

const sourceTypeIcons = {
  spend: '💰',
  optimization: '⚡',
  segments: '👥',
  benchmarks: '📊',
  policy: '📋',
};

export function GovernanceActionCard({ action, onClick, compact = false }: GovernanceActionCardProps) {
  const navigate = useNavigate();
  const isOverdue = action.dueDate && isPast(action.dueDate) && action.status !== 'done';
  const hasBlockers = action.blockers.length > 0;
  
  const handleSourceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(action.sourceInsight.pageRoute);
  };

  // KPI progress
  const kpiProgress = action.linkedKPI && action.linkedKPI.current !== undefined
    ? ((action.linkedKPI.current - action.linkedKPI.baseline) / 
       (action.linkedKPI.target - action.linkedKPI.baseline)) * 100
    : null;

  if (compact) {
    return (
      <div
        className={cn(
          "p-3 rounded-lg border bg-card hover:border-accent/50 cursor-pointer transition-all",
          isOverdue && "border-destructive/30",
          hasBlockers && "border-warning/30"
        )}
        onClick={onClick}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <Badge className={cn("text-[10px] border-0", priorityConfig[action.priority].bgColor, priorityConfig[action.priority].color)}>
            {action.priority}
          </Badge>
          {isOverdue && (
            <Badge variant="destructive" className="text-[10px]">Overdue</Badge>
          )}
          {hasBlockers && (
            <Badge variant="outline" className="text-[10px] text-warning border-warning/30">
              <AlertTriangle className="h-3 w-3 mr-0.5" />
              Blocked
            </Badge>
          )}
          <span className="ml-auto text-xs">{sourceTypeIcons[action.sourceInsight.type]}</span>
        </div>

        {/* Title */}
        <h4 className="font-medium text-sm line-clamp-2 mb-2">{action.title}</h4>

        {/* Impact + Owner */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <Avatar className="h-5 w-5">
              <AvatarFallback className={cn("text-[9px]", !action.owner && "bg-warning/10 text-warning")}>
                {action.owner ? action.owner.name.split(' ').map(n => n[0]).join('') : '?'}
              </AvatarFallback>
            </Avatar>
            <span className="text-muted-foreground truncate max-w-[60px]">
              {action.owner ? action.owner.name.split(' ')[0] : 'Unassigned'}
            </span>
          </div>
          {action.expectedImpactAED > 0 && (
            <span className="font-medium text-success">
              {formatCurrencyAED(action.expectedImpactAED, { abbreviate: true })}
            </span>
          )}
        </div>

        {/* Due date */}
        {action.dueDate && (
          <div className={cn(
            "flex items-center gap-1 text-[10px] mt-2 pt-2 border-t",
            isOverdue ? 'text-destructive' : 'text-muted-foreground'
          )}>
            <Calendar className="h-3 w-3" />
            Due {format(action.dueDate, 'MMM d')}
          </div>
        )}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Card 
        className={cn(
          "cursor-pointer hover:shadow-md transition-all",
          isOverdue && "border-destructive/30",
          hasBlockers && "border-warning/30"
        )}
        onClick={onClick}
      >
        <CardContent className="p-4 space-y-3">
          {/* Header: Priority + Status + Source */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className={cn("text-xs border-0", priorityConfig[action.priority].bgColor, priorityConfig[action.priority].color)}>
                {action.priority}
              </Badge>
              <Badge variant="outline" className={cn("text-xs", confidenceConfig[action.confidence].color)}>
                {confidenceConfig[action.confidence].label} conf
              </Badge>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs gap-1"
                  onClick={handleSourceClick}
                >
                  {sourceTypeIcons[action.sourceInsight.type]}
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{action.sourceInsight.label}</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Title (verb-led) */}
          <h4 className="font-semibold text-sm line-clamp-2">{action.title}</h4>

          {/* Owner + Due Date */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <div className="flex items-center gap-1.5">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className={cn("text-[9px]", !action.owner && "bg-warning/10 text-warning")}>
                    {action.owner ? action.owner.name.split(' ').map(n => n[0]).join('') : '?'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs">
                  {action.owner ? action.owner.name : <span className="text-warning">Unassigned</span>}
                </span>
              </div>
            </div>
            {action.dueDate && (
              <div className={cn(
                "flex items-center gap-1 text-xs",
                isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'
              )}>
                <Calendar className="h-3.5 w-3.5" />
                {format(action.dueDate, 'MMM d, yyyy')}
                {isOverdue && <AlertTriangle className="h-3 w-3 ml-0.5" />}
              </div>
            )}
          </div>

          {/* Expected Impact */}
          <div className="p-2.5 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Expected Impact</span>
              <DollarSign className="h-3.5 w-3.5 text-success" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-success tabular-nums">
                {formatCurrencyAED(action.expectedImpactAED, { abbreviate: true })}
              </span>
              {action.expectedImpactPercent && (
                <Badge variant="outline" className="text-[10px] text-success border-success/30">
                  +{action.expectedImpactPercent}%
                </Badge>
              )}
            </div>
          </div>

          {/* Linked KPI */}
          {action.linkedKPI && (
            <div className="p-2.5 rounded-lg border border-border/50">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium">{action.linkedKPI.name}</span>
                <Target className="h-3.5 w-3.5 text-accent" />
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Baseline:</span>
                  <span className="ml-1 font-medium tabular-nums">
                    {action.linkedKPI.unit === 'currency' 
                      ? formatCurrencyAED(action.linkedKPI.baseline, { abbreviate: true })
                      : action.linkedKPI.unit === 'percent'
                        ? formatPercent(action.linkedKPI.baseline)
                        : action.linkedKPI.baseline
                    }
                  </span>
                </div>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <div>
                  <span className="text-muted-foreground">Target:</span>
                  <span className="ml-1 font-medium text-accent tabular-nums">
                    {action.linkedKPI.unit === 'currency' 
                      ? formatCurrencyAED(action.linkedKPI.target, { abbreviate: true })
                      : action.linkedKPI.unit === 'percent'
                        ? formatPercent(action.linkedKPI.target)
                        : action.linkedKPI.target
                    }
                  </span>
                </div>
              </div>
              {kpiProgress !== null && (
                <div className="mt-2">
                  <Progress value={Math.min(100, Math.max(0, kpiProgress))} className="h-1.5" />
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {Math.round(kpiProgress)}% progress to target
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Blockers */}
          {hasBlockers && (
            <div className="flex items-start gap-2 p-2 rounded bg-warning/5 border border-warning/20">
              <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
              <div className="text-xs">
                <span className="font-medium text-warning">Blocked:</span>
                <span className="text-muted-foreground ml-1">
                  {action.blockers[0]}
                  {action.blockers.length > 1 && ` (+${action.blockers.length - 1} more)`}
                </span>
              </div>
            </div>
          )}

          {/* Next Step */}
          <div className="pt-2 border-t border-border/50">
            <div className="flex items-center gap-1.5 text-xs">
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Next:</span>
              <span className="font-medium truncate">{action.nextStep}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
