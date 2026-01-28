/**
 * HR Ops Throughput Section
 * 
 * Shows:
 * - Approved today
 * - Approved this week
 * - Rejected this week
 * - CTA: "View Audit Trail" for decisions
 */

import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MetricsContract, MetricsContractGrid } from '@/components/shared/MetricsContract';

export interface ThroughputMetrics {
  approvedToday: number;
  approvedThisWeek: number;
  rejectedThisWeek: number;
  approvalRate?: number;
  todayDelta?: number;
  weekDelta?: number;
}

interface HROpsThroughputProps {
  metrics: ThroughputMetrics;
  lastUpdated?: Date;
  className?: string;
}

export function HROpsThroughput({
  metrics,
  lastUpdated = new Date(),
  className,
}: HROpsThroughputProps) {
  const {
    approvedToday,
    approvedThisWeek,
    rejectedThisWeek,
    approvalRate = 87,
    todayDelta = 12,
    weekDelta = 5,
  } = metrics;

  const totalThisWeek = approvedThisWeek + rejectedThisWeek;
  const actualApprovalRate = totalThisWeek > 0 
    ? Math.round((approvedThisWeek / totalThisWeek) * 100) 
    : approvalRate;

  return (
    <Card className={cn('border-border/50', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-success" />
            Throughput
          </CardTitle>
          <Link to="/employer/audit">
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
              View Audit Trail
              <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <MetricsContractGrid columns={3}>
          {/* Approved Today */}
          <MetricsContract
            title="Approved Today"
            value={approvedToday.toString()}
            icon={CheckCircle2}
            iconClassName="bg-success/10 text-success"
            trend={{
              value: todayDelta,
              label: 'vs yesterday',
              higherIsBetter: true,
            }}
            metadata={{
              definition: 'Number of claims/requests approved today',
              formula: 'COUNT(requests WHERE status=approved AND reviewed_at=today)',
              source: 'requests',
              lastUpdated,
              confidence: 'high',
            }}
            size="sm"
          />

          {/* Approved This Week */}
          <MetricsContract
            title="Approved This Week"
            value={approvedThisWeek.toString()}
            icon={Calendar}
            iconClassName="bg-primary/10 text-primary"
            trend={{
              value: weekDelta,
              label: 'vs last week',
              higherIsBetter: true,
            }}
            metadata={{
              definition: 'Number of claims/requests approved this week',
              formula: 'COUNT(requests WHERE status=approved AND reviewed_at>=week_start)',
              source: 'requests',
              lastUpdated,
              confidence: 'high',
            }}
            size="sm"
            footer={
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Approval Rate</span>
                <Badge 
                  variant="outline" 
                  className={cn(
                    'text-[10px]',
                    actualApprovalRate >= 85 ? 'bg-success/10 text-success border-success/30' :
                    actualApprovalRate >= 70 ? 'bg-primary/10 text-primary border-primary/30' :
                    'bg-warning/10 text-warning border-warning/30'
                  )}
                >
                  {actualApprovalRate}%
                </Badge>
              </div>
            }
          />

          {/* Rejected This Week */}
          <MetricsContract
            title="Rejected This Week"
            value={rejectedThisWeek.toString()}
            icon={XCircle}
            iconClassName="bg-muted text-muted-foreground"
            metadata={{
              definition: 'Number of claims/requests rejected this week',
              formula: 'COUNT(requests WHERE status=rejected AND reviewed_at>=week_start)',
              source: 'requests',
              lastUpdated,
              confidence: 'high',
            }}
            size="sm"
            footer={
              rejectedThisWeek > 0 ? (
                <Link 
                  to="/employer/ops?status=rejected" 
                  className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                >
                  Review reasons →
                </Link>
              ) : (
                <span className="text-xs text-muted-foreground">No rejections</span>
              )
            }
          />
        </MetricsContractGrid>
      </CardContent>
    </Card>
  );
}
