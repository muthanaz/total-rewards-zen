/**
 * Suggested Actions Panel - HR Ops Dashboard
 * 
 * Auto-generated action suggestions based on current queue state.
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuggestedAction {
  id: string;
  title: string;
  description: string;
  type: 'approve' | 'request_docs' | 'escalate' | 'review';
  count?: number;
  path: string;
  impact?: string;
}

interface SuggestedActionsPanelProps {
  actions?: SuggestedAction[];
}

const defaultActions: SuggestedAction[] = [
  {
    id: '1',
    title: 'Request missing documents',
    description: '4 claims are pending documentation',
    type: 'request_docs',
    count: 4,
    path: '/employer/claims?tab=missing_docs',
    impact: 'Reduces SLA risk',
  },
  {
    id: '2',
    title: 'Approve low-risk claims',
    description: '6 claims passed all validation checks',
    type: 'approve',
    count: 6,
    path: '/employer/claims?tab=pending&risk=low',
    impact: 'Clear 40% of queue',
  },
  {
    id: '3',
    title: 'Escalate high-value claims',
    description: '2 claims over AED 10,000 need senior review',
    type: 'escalate',
    count: 2,
    path: '/employer/claims?tab=high_value&amount_min=10000',
    impact: 'Meet compliance SLA',
  },
  {
    id: '4',
    title: 'Review SLA breaching claims',
    description: '3 claims will breach SLA in < 4 hours',
    type: 'review',
    count: 3,
    path: '/employer/claims?tab=sla_risk&due=4h',
    impact: 'Prevent SLA breach',
  },
];

const typeConfig = {
  approve: {
    icon: CheckCircle2,
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
  request_docs: {
    icon: FileText,
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
};

export function SuggestedActionsPanel({ actions = defaultActions }: SuggestedActionsPanelProps) {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-display flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          Suggested Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.slice(0, 4).map((action) => {
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
                    {action.count && (
                      <Badge variant="secondary" className="text-xs">
                        {action.count}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{action.description}</p>
                  {action.impact && (
                    <p className="text-xs text-primary mt-0.5">{action.impact}</p>
                  )}
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
