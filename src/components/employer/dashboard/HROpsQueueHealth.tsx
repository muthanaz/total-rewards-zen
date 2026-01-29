/**
 * HR Ops Queue Health Section
 * 
 * Uses StandardKpiCard with gap-4 for HR Ops variant
 */

import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Inbox, 
  FileText, 
  FileQuestion, 
  ArrowRight,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StandardKpiCard } from '@/components/ui/StandardKpiCard';
import { StandardCardGrid } from '@/components/ui/StandardCard';

export interface QueueHealthMetrics {
  pendingClaims: number;
  pendingRequests: number;
  pendingDocuments: number;
  agingBuckets: {
    fresh: number; // 0-2 days
    aging: number; // 3-5 days
    overdue: number; // 6+ days
  };
}

interface HROpsQueueHealthProps {
  metrics: QueueHealthMetrics;
  lastUpdated?: Date;
  className?: string;
}

export function HROpsQueueHealth({
  metrics,
  lastUpdated = new Date(),
  className,
}: HROpsQueueHealthProps) {
  const {
    pendingClaims,
    pendingRequests,
    pendingDocuments,
    agingBuckets,
  } = metrics;

  const totalPending = pendingClaims + pendingRequests;
  const totalInBuckets = agingBuckets.fresh + agingBuckets.aging + agingBuckets.overdue;

  return (
    <Card className={cn('border-border/50', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Inbox className="w-4 h-4 text-primary" />
            Queue Health
          </CardTitle>
          <Link to="/employer/ops">
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
              Open Operations Hub
              <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pending Counts - using StandardCardGrid with hr_ops variant (gap-4) */}
        <StandardCardGrid variant="hr_ops" columns={3}>
          <StandardKpiCard
            label="Pending Claims"
            value={pendingClaims.toString()}
            icon={FileText}
            iconClassName="bg-primary/10 text-primary"
            tooltip="Reimbursement claims awaiting review"
            variant="hr_ops"
            footer={
              <Link 
                to="/employer/ops?type=claim" 
                className="text-xs text-primary hover:underline"
              >
                View claims →
              </Link>
            }
          />
          
          <StandardKpiCard
            label="Pending Requests"
            value={pendingRequests.toString()}
            icon={Inbox}
            iconClassName="bg-accent/10 text-accent"
            tooltip="Pre-approval requests awaiting review"
            variant="hr_ops"
            footer={
              <Link 
                to="/employer/ops?type=request" 
                className="text-xs text-primary hover:underline"
              >
                View requests →
              </Link>
            }
          />
          
          <StandardKpiCard
            label="Needs Docs"
            value={pendingDocuments.toString()}
            icon={FileQuestion}
            iconClassName="bg-warning/10 text-warning"
            tooltip="Items waiting on employee documentation"
            variant="hr_ops"
            footer={
              <Link 
                to="/employer/ops?tab=missing_docs" 
                className="text-xs text-primary hover:underline"
              >
                View pending →
              </Link>
            }
          />
        </StandardCardGrid>

        {/* Aging Buckets */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Queue Aging
            </span>
            <span className="text-muted-foreground tabular-nums">
              {totalInBuckets} total items
            </span>
          </div>
          
          {/* Stacked bar visualization */}
          <div className="h-4 rounded-full overflow-hidden flex bg-muted/30">
            {totalInBuckets > 0 && (
              <>
                <div 
                  className="bg-success h-full transition-all"
                  style={{ width: `${(agingBuckets.fresh / totalInBuckets) * 100}%` }}
                />
                <div 
                  className="bg-warning h-full transition-all"
                  style={{ width: `${(agingBuckets.aging / totalInBuckets) * 100}%` }}
                />
                <div 
                  className="bg-destructive h-full transition-all"
                  style={{ width: `${(agingBuckets.overdue / totalInBuckets) * 100}%` }}
                />
              </>
            )}
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-success" />
                <span className="text-muted-foreground">0-2 days</span>
                <span className="font-semibold tabular-nums">{agingBuckets.fresh}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-warning" />
                <span className="text-muted-foreground">3-5 days</span>
                <span className="font-semibold tabular-nums">{agingBuckets.aging}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
                <span className="text-muted-foreground">6+ days</span>
                <span className="font-semibold tabular-nums">{agingBuckets.overdue}</span>
              </div>
            </div>
            {agingBuckets.overdue > 0 && (
              <Link to="/employer/ops?tab=sla_risk">
                <Badge 
                  variant="outline" 
                  className="bg-destructive/10 text-destructive border-destructive/30 text-[10px] gap-1 cursor-pointer hover:bg-destructive/20"
                >
                  {agingBuckets.overdue} overdue
                  <ArrowRight className="w-2.5 h-2.5" />
                </Badge>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
