/**
 * Decisions & Actions Card (Next 30 days)
 * 
 * Shows 3 recommended actions with:
 * - Title
 * - Expected Impact (AED)
 * - Owner
 * - Status
 * - "Open action" button
 * - "View full Action Plan" link
 */

import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CalendarDays, 
  ArrowRight, 
  User,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';

export type ActionStatus = 'backlog' | 'in_progress' | 'blocked' | 'completed' | 'cancelled';

interface ActionItem {
  id: string;
  title: string;
  expectedImpact: number;
  owner: string;
  status: ActionStatus;
}

interface DecisionsActionsCardProps {
  actions: ActionItem[];
  className?: string;
}

const STATUS_CONFIG: Record<ActionStatus, {
  icon: typeof CheckCircle2;
  label: string;
  color: string;
  bg: string;
}> = {
  backlog: {
    icon: Clock,
    label: 'Backlog',
    color: 'text-muted-foreground',
    bg: 'bg-muted',
  },
  in_progress: {
    icon: Clock,
    label: 'In Progress',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  blocked: {
    icon: AlertCircle,
    label: 'Blocked',
    color: 'text-destructive',
    bg: 'bg-destructive/10',
  },
  completed: {
    icon: CheckCircle2,
    label: 'Completed',
    color: 'text-success',
    bg: 'bg-success/10',
  },
  cancelled: {
    icon: XCircle,
    label: 'Cancelled',
    color: 'text-muted-foreground',
    bg: 'bg-muted',
  },
};

export function DecisionsActionsCard({ actions, className }: DecisionsActionsCardProps) {
  const top3 = actions.slice(0, 3);

  return (
    <Card className={cn('card-elevated', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-accent" />
            Decisions & Actions
            <Badge variant="secondary" className="ml-2 text-xs">
              Next 30 days
            </Badge>
          </CardTitle>
          <Link 
            to="/employer/recommendations"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            View full Action Plan
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {top3.map((action) => {
            const statusConfig = STATUS_CONFIG[action.status];
            const StatusIcon = statusConfig.icon;

            return (
              <div 
                key={action.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{action.title}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{action.owner}</span>
                    </div>
                    <span>•</span>
                    <span className="font-medium text-foreground tabular-nums">
                      {formatCurrencyAED(action.expectedImpact)} impact
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <Badge 
                    variant="outline" 
                    className={cn('gap-1', statusConfig.bg, statusConfig.color)}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {statusConfig.label}
                  </Badge>
                  <Link to={`/employer/recommendations?action=${action.id}`}>
                    <Button size="sm" variant="outline">
                      Open
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}

          {top3.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No actions scheduled for next 30 days</p>
              <Link to="/employer/recommendations" className="text-primary text-sm hover:underline">
                Create an action
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
