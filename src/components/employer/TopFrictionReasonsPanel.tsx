/**
 * Top Friction Reasons Panel
 * 
 * Shows ranked friction reasons causing claim/request delays:
 * - Missing docs
 * - Ineligible
 * - Cap exceeded
 * - Delayed approvals
 * - Unclear policy
 * 
 * Each item is clickable to filter the queue.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  FileQuestion, 
  UserX, 
  AlertCircle, 
  Clock, 
  HelpCircle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export type FrictionType = 'missing_docs' | 'ineligible' | 'cap_exceeded' | 'delayed_approval' | 'unclear_policy';

export interface FrictionReason {
  type: FrictionType;
  count: number;
  percentOfTotal: number;
  trend?: 'up' | 'down' | 'stable';
  avgDelayDays?: number;
}

interface TopFrictionReasonsPanelProps {
  reasons: FrictionReason[];
  totalIssues?: number;
  className?: string;
}

const frictionConfig: Record<FrictionType, { 
  label: string; 
  icon: React.ElementType; 
  color: string;
  bgColor: string;
  filterPath: string;
}> = {
  missing_docs: { 
    label: 'Missing Documents', 
    icon: FileQuestion, 
    color: 'text-amber-600',
    bgColor: 'bg-amber-500/10',
    filterPath: '/employer/claims?tab=missing_docs',
  },
  ineligible: { 
    label: 'Not Eligible', 
    icon: UserX, 
    color: 'text-red-600',
    bgColor: 'bg-red-500/10',
    filterPath: '/employer/claims?status=rejected&reason=ineligible',
  },
  cap_exceeded: { 
    label: 'Cap Exceeded', 
    icon: AlertCircle, 
    color: 'text-orange-600',
    bgColor: 'bg-orange-500/10',
    filterPath: '/employer/claims?status=rejected&reason=cap_exceeded',
  },
  delayed_approval: { 
    label: 'Delayed Approvals', 
    icon: Clock, 
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
    filterPath: '/employer/claims?tab=sla_risk',
  },
  unclear_policy: { 
    label: 'Unclear Policy', 
    icon: HelpCircle, 
    color: 'text-purple-600',
    bgColor: 'bg-purple-500/10',
    filterPath: '/employer/knowledge?tab=questions',
  },
};

export function TopFrictionReasonsPanel({ 
  reasons, 
  totalIssues,
  className,
}: TopFrictionReasonsPanelProps) {
  const navigate = useNavigate();
  
  // Sort by count descending
  const sortedReasons = [...reasons].sort((a, b) => b.count - a.count);
  const maxCount = sortedReasons[0]?.count || 1;

  if (reasons.length === 0) {
    return null;
  }

  return (
    <Card className={cn("border-border/40", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-warning" />
            Top Friction Reasons
          </CardTitle>
          {totalIssues !== undefined && (
            <Badge variant="outline" className="text-[11px]">
              {totalIssues} total issues
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {sortedReasons.map((reason) => {
          const config = frictionConfig[reason.type];
          const Icon = config.icon;
          
          return (
            <div
              key={reason.type}
              className="group flex items-center gap-3 p-3 rounded-lg border border-border/40 hover:border-accent/30 hover:bg-accent/5 cursor-pointer transition-all"
              onClick={() => navigate(config.filterPath)}
            >
              {/* Icon */}
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", config.bgColor)}>
                <Icon className={cn("w-4 h-4", config.color)} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-sm font-medium">{config.label}</span>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-sm font-bold tabular-nums", config.color)}>
                      {reason.count}
                    </span>
                    {reason.trend && (
                      <span className={cn(
                        "text-[10px]",
                        reason.trend === 'up' ? 'text-destructive' : 
                        reason.trend === 'down' ? 'text-success' : 'text-muted-foreground'
                      )}>
                        {reason.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : 
                         reason.trend === 'down' ? <TrendingDown className="w-3 h-3" /> : null}
                      </span>
                    )}
                  </div>
                </div>
                <Progress 
                  value={(reason.count / maxCount) * 100} 
                  className="h-1.5 bg-muted/30 [&>div]:bg-current"
                  style={{ color: `var(--${config.color.replace('text-', '')})` }}
                />
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[11px] text-muted-foreground">
                    {reason.percentOfTotal}% of issues
                  </span>
                  {reason.avgDelayDays !== undefined && (
                    <span className="text-[11px] text-muted-foreground">
                      Avg delay: {reason.avgDelayDays}d
                    </span>
                  )}
                </div>
              </div>

              {/* Arrow */}
              <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
