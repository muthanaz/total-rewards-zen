/**
 * Claims Ops KPI Strip
 * 
 * "Today's Ops" summary strip with key metrics for HR operations.
 * SLA metrics only shown when SLA is enabled for the org.
 */

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Hourglass,
  Flame,
  TrendingUp,
  Timer,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RequestWithDetails } from '@/hooks/useSharedRequests';

interface ClaimsOpsKPIStripProps {
  requests: RequestWithDetails[];
  slaEnabled: boolean;
}

interface KPIMetric {
  key: string;
  label: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  variant?: 'default' | 'warning' | 'danger' | 'success';
  slaRequired?: boolean;
}

export function ClaimsOpsKPIStrip({ requests, slaEnabled }: ClaimsOpsKPIStripProps) {
  // Calculate metrics
  const pendingCount = requests.filter(
    r => r.status === 'pending' || r.status === 'submitted'
  ).length;
  
  const inReviewCount = requests.filter(r => r.status === 'in_review').length;
  
  const slaAtRiskCount = requests.filter(r => {
    if (!r.sla_due_at) return false;
    if (['approved', 'rejected', 'paid', 'closed'].includes(r.status || '')) return false;
    const hoursRemaining = (new Date(r.sla_due_at).getTime() - Date.now()) / (1000 * 60 * 60);
    return hoursRemaining <= 24;
  }).length;
  
  // Average days to approve (from approved requests this month)
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const approvedThisMonth = requests.filter(r => 
    r.status === 'approved' && 
    r.reviewed_at && 
    new Date(r.reviewed_at) >= startOfMonth
  );
  
  const avgDaysToApprove = approvedThisMonth.length > 0
    ? Math.round(
        approvedThisMonth.reduce((sum, r) => {
          const created = new Date(r.created_at || '');
          const reviewed = new Date(r.reviewed_at || '');
          return sum + (reviewed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
        }, 0) / approvedThisMonth.length * 10
      ) / 10
    : 0;
  
  // Rejection rate (last 30 days)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const recentDecisions = requests.filter(r => 
    (r.status === 'approved' || r.status === 'rejected') &&
    r.reviewed_at &&
    new Date(r.reviewed_at) >= thirtyDaysAgo
  );
  const rejectedCount = recentDecisions.filter(r => r.status === 'rejected').length;
  const rejectionRate = recentDecisions.length > 0
    ? Math.round((rejectedCount / recentDecisions.length) * 100)
    : 0;

  const metrics: KPIMetric[] = [
    {
      key: 'pending',
      label: 'Pending',
      value: pendingCount,
      subValue: 'awaiting review',
      icon: <Clock className="w-4 h-4" />,
      variant: pendingCount > 10 ? 'warning' : 'default',
    },
    {
      key: 'in_review',
      label: 'In Review',
      value: inReviewCount,
      subValue: 'being processed',
      icon: <Hourglass className="w-4 h-4" />,
      variant: 'default',
    },
    {
      key: 'sla_risk',
      label: 'SLA at Risk',
      value: slaAtRiskCount,
      subValue: 'due in < 24h',
      icon: <Flame className="w-4 h-4" />,
      variant: slaAtRiskCount > 0 ? 'danger' : 'success',
      slaRequired: true,
    },
    {
      key: 'avg_time',
      label: 'Avg. Processing',
      value: `${avgDaysToApprove}d`,
      subValue: 'this month',
      icon: <Timer className="w-4 h-4" />,
      variant: avgDaysToApprove > 3 ? 'warning' : 'default',
    },
    {
      key: 'rejection_rate',
      label: 'Rejections',
      value: `${rejectionRate}%`,
      subValue: 'last 30 days',
      icon: <XCircle className="w-4 h-4" />,
      variant: rejectionRate > 20 ? 'warning' : 'default',
    },
  ];

  // Filter out SLA metrics if SLA is disabled
  const visibleMetrics = metrics.filter(m => !m.slaRequired || slaEnabled);

  const variantStyles = {
    default: 'text-foreground',
    warning: 'text-warning',
    danger: 'text-destructive',
    success: 'text-success',
  };

  const variantBg = {
    default: 'bg-muted/50',
    warning: 'bg-warning/10',
    danger: 'bg-destructive/10',
    success: 'bg-success/10',
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-muted-foreground">Today's Ops</h3>
        <Badge variant="outline" className="text-xs">
          {requests.length} total
        </Badge>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {visibleMetrics.map((metric) => (
          <Tooltip key={metric.key}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  'p-3 rounded-lg border border-border/50 transition-colors hover:border-border cursor-default',
                  variantBg[metric.variant || 'default']
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn('opacity-70', variantStyles[metric.variant || 'default'])}>
                    {metric.icon}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground truncate">
                    {metric.label}
                  </span>
                </div>
                <div className={cn('text-xl font-bold', variantStyles[metric.variant || 'default'])}>
                  {metric.value}
                </div>
                {metric.subValue && (
                  <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
                    {metric.subValue}
                  </div>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">{metric.label}: {metric.subValue}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </Card>
  );
}
