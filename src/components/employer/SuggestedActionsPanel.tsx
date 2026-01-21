/**
 * Suggested Actions Panel - HR Ops Dashboard
 * 
 * Auto-generated action suggestions based on current queue state.
 * Now with deep-link support to filtered claims views.
 */

import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Clock,
  TrendingUp,
  FileQuestion,
  Flame,
  DollarSign,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuggestedAction {
  id: string;
  title: string;
  description: string;
  type: 'approve' | 'request_docs' | 'escalate' | 'review' | 'sla_risk' | 'high_value';
  count?: number;
  path: string;
  impact?: string;
}

interface SuggestedActionsPanelProps {
  actions?: SuggestedAction[];
  /** Dynamic counts from claims data */
  counts?: {
    pendingDocs?: number;
    lowRiskPending?: number;
    highValue?: number;
    slaRisk?: number;
  };
}

const typeConfig = {
  approve: {
    icon: CheckCircle2,
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
  request_docs: {
    icon: FileQuestion,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
  },
  escalate: {
    icon: TrendingUp,
    color: 'text-info',
    bgColor: 'bg-info/10',
  },
  review: {
    icon: AlertTriangle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
  },
  sla_risk: {
    icon: Flame,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
  },
  high_value: {
    icon: DollarSign,
    color: 'text-amber-600',
    bgColor: 'bg-amber-500/10',
  },
};

export function SuggestedActionsPanel({ actions, counts }: SuggestedActionsPanelProps) {
  // Build dynamic actions based on counts if no actions provided
  const dynamicActions: SuggestedAction[] = actions || [
    {
      id: '1',
      title: 'Request missing documents',
      description: `${counts?.pendingDocs || 4} claims are pending documentation`,
      type: 'request_docs',
      count: counts?.pendingDocs || 4,
      path: '/employer/claims?tab=missing_docs',
      impact: 'Reduces SLA risk',
    },
    {
      id: '2',
      title: 'Approve low-risk claims',
      description: `${counts?.lowRiskPending || 6} claims passed all validation checks`,
      type: 'approve',
      count: counts?.lowRiskPending || 6,
      path: '/employer/claims?tab=pending&priority=low',
      impact: 'Clear queue faster',
    },
    {
      id: '3',
      title: 'Review high-value claims',
      description: `${counts?.highValue || 2} claims over AED 5,000 need review`,
      type: 'high_value',
      count: counts?.highValue || 2,
      path: '/employer/claims?tab=high_value',
      impact: 'Meet compliance SLA',
    },
    {
      id: '4',
      title: 'Handle SLA-breaching claims',
      description: `${counts?.slaRisk || 3} claims at risk of SLA breach`,
      type: 'sla_risk',
      count: counts?.slaRisk || 3,
      path: '/employer/claims?tab=sla_risk&slaSort=true',
      impact: 'Prevent SLA breach',
    },
  ];

  // Filter out actions with 0 count
  const visibleActions = dynamicActions.filter(a => !a.count || a.count > 0);

  if (visibleActions.length === 0) {
    return (
      <Card className="border-success/20 bg-gradient-to-br from-card to-success/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-success" />
            All Caught Up!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No urgent actions required. Keep up the great work!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-display flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          Suggested Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {visibleActions.slice(0, 4).map((action) => {
          const config = typeConfig[action.type];
          const Icon = config.icon;
          
          return (
            <Link key={action.id} to={action.path}>
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
                <div className={cn('p-2 rounded-lg shrink-0', config.bgColor)}>
                  <Icon className={cn('w-4 h-4', config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{action.title}</p>
                    {action.count !== undefined && action.count > 0 && (
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {action.count}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{action.description}</p>
                  {action.impact && (
                    <p className="text-xs text-primary mt-0.5">{action.impact}</p>
                  )}
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
