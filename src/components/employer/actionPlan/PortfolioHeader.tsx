/**
 * Portfolio Header
 * 
 * Executive summary of action plan with total impact, overdue count, and top blockers.
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  AlertTriangle, 
  Target,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { formatCurrencyAED } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { PortfolioMetrics } from './types';

interface PortfolioHeaderProps {
  metrics: PortfolioMetrics;
}

export function PortfolioHeader({ metrics }: PortfolioHeaderProps) {
  const { 
    totalExpectedImpactAED, 
    actionsOverdue, 
    actionsByStatus, 
    topBlockedReasons,
    completionRate,
    avgDaysToComplete,
  } = metrics;
  
  const activeActions = actionsByStatus.backlog + actionsByStatus.in_progress + actionsByStatus.waiting;
  
  return (
    <div className="space-y-4">
      {/* Primary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Expected Impact */}
        <Card className="bg-success/5 border-success/20">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <DollarSign className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-success tabular-nums">
                  {formatCurrencyAED(totalExpectedImpactAED, { abbreviate: true })}
                </p>
                <p className="text-xs text-muted-foreground">Total Expected Impact</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  From {activeActions} active actions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overdue Actions */}
        <Card className={cn(
          actionsOverdue > 0 ? 'bg-destructive/5 border-destructive/20' : ''
        )}>
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                actionsOverdue > 0 ? 'bg-destructive/10' : 'bg-muted'
              )}>
                <AlertTriangle className={cn(
                  "h-5 w-5",
                  actionsOverdue > 0 ? 'text-destructive' : 'text-muted-foreground'
                )} />
              </div>
              <div>
                <p className={cn(
                  "text-2xl font-bold tabular-nums",
                  actionsOverdue > 0 ? 'text-destructive' : ''
                )}>
                  {actionsOverdue}
                </p>
                <p className="text-xs text-muted-foreground">Actions Overdue</p>
                {actionsOverdue > 0 && (
                  <p className="text-[10px] text-destructive mt-0.5">
                    Requires immediate attention
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Target className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold tabular-nums">{completionRate}%</p>
                <p className="text-xs text-muted-foreground">Completion Rate</p>
                <Progress value={completionRate} className="h-1.5 mt-1.5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Avg Cycle Time */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{avgDaysToComplete}</p>
                <p className="text-xs text-muted-foreground">Avg Days to Complete</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Based on {actionsByStatus.done} completed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Blocked Reasons */}
      {topBlockedReasons.length > 0 && (
        <Card className="bg-warning/5 border-warning/20">
          <CardContent className="py-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-warning shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-warning">Top 3 Blocked Reasons</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {topBlockedReasons.map((blocker, index) => (
                    <Badge 
                      key={index}
                      variant="outline" 
                      className="text-xs bg-warning/10 text-warning border-warning/30"
                    >
                      {blocker.reason}
                      <span className="ml-1.5 opacity-70">
                        ({blocker.count} action{blocker.count > 1 ? 's' : ''}, {formatCurrencyAED(blocker.impactAED, { abbreviate: true })} at risk)
                      </span>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Distribution */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-muted-foreground" />
          Backlog: {actionsByStatus.backlog}
        </span>
        <span className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          In Progress: {actionsByStatus.in_progress}
        </span>
        <span className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-warning" />
          Waiting: {actionsByStatus.waiting}
        </span>
        <span className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-success" />
          Done: {actionsByStatus.done}
        </span>
      </div>
    </div>
  );
}
