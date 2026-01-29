/**
 * HR Ops SLA Performance Section
 * 
 * Uses StandardKpiCard with 4-row structure and gap-4 for HR Ops
 */

import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Timer, 
  CheckCircle2, 
  XCircle, 
  Clock,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StandardKpiCard } from '@/components/ui/StandardKpiCard';
import { StandardCardGrid } from '@/components/ui/StandardCard';

export interface SLAMetrics {
  slaMetPercent: number;
  breachedCount: number;
  avgCycleTimeDays: number;
  slaMetDelta?: number;
  cycleTimeDelta?: number;
}

interface HROpsSLAPerformanceProps {
  metrics: SLAMetrics;
  lastUpdated?: Date;
  className?: string;
}

export function HROpsSLAPerformance({
  metrics,
  lastUpdated = new Date(),
  className,
}: HROpsSLAPerformanceProps) {
  const {
    slaMetPercent,
    breachedCount,
    avgCycleTimeDays,
    slaMetDelta = 2.5,
    cycleTimeDelta = -8,
  } = metrics;

  const slaStatus = slaMetPercent >= 95 ? 'excellent' : slaMetPercent >= 85 ? 'good' : 'needs_attention';

  return (
    <Card className={cn('border-border/50', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Timer className="w-4 h-4 text-accent" />
            SLA Performance
          </CardTitle>
          <Link to="/employer/ops?tab=sla_risk">
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
              View SLA Breaches
              <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <StandardCardGrid variant="hr_ops" columns={3}>
          {/* SLA Met % */}
          <StandardKpiCard
            label="SLA Met"
            value={`${slaMetPercent}%`}
            icon={CheckCircle2}
            iconClassName={cn(
              slaStatus === 'excellent' ? 'bg-success/10 text-success' :
              slaStatus === 'good' ? 'bg-primary/10 text-primary' :
              'bg-warning/10 text-warning'
            )}
            tooltip="Percentage of requests resolved within SLA target"
            delta={slaMetDelta}
            deltaLabel="vs last period"
            higherIsBetter={true}
            variant="hr_ops"
            footer={
              <Badge 
                variant="outline" 
                className={cn(
                  'text-[10px]',
                  slaStatus === 'excellent' ? 'bg-success/10 text-success border-success/30' :
                  slaStatus === 'good' ? 'bg-primary/10 text-primary border-primary/30' :
                  'bg-warning/10 text-warning border-warning/30'
                )}
              >
                {slaStatus === 'excellent' ? 'Excellent' : 
                 slaStatus === 'good' ? 'On Track' : 'Needs Attention'}
              </Badge>
            }
          />

          {/* Breached Count */}
          <StandardKpiCard
            label="SLA Breached"
            value={breachedCount.toString()}
            icon={XCircle}
            iconClassName={cn(
              breachedCount === 0 ? 'bg-success/10 text-success' :
              breachedCount <= 5 ? 'bg-warning/10 text-warning' :
              'bg-destructive/10 text-destructive'
            )}
            tooltip="Number of requests that exceeded SLA target time"
            variant="hr_ops"
            footer={
              breachedCount > 0 ? (
                <Link 
                  to="/employer/ops?tab=sla_risk" 
                  className="text-xs text-destructive hover:underline"
                >
                  Review breaches →
                </Link>
              ) : (
                <span className="text-xs text-success">All on track ✓</span>
              )
            }
          />

          {/* Average Cycle Time */}
          <StandardKpiCard
            label="Avg Cycle Time"
            value={`${avgCycleTimeDays.toFixed(1)}d`}
            icon={Clock}
            iconClassName={cn(
              avgCycleTimeDays <= 2 ? 'bg-success/10 text-success' :
              avgCycleTimeDays <= 4 ? 'bg-primary/10 text-primary' :
              'bg-warning/10 text-warning'
            )}
            tooltip="Average time from submission to resolution"
            delta={cycleTimeDelta}
            deltaLabel="vs last period"
            higherIsBetter={false}
            variant="hr_ops"
            footer={
              <span className="text-xs text-muted-foreground">
                Target: ≤ 3 days
              </span>
            }
          />
        </StandardCardGrid>
      </CardContent>
    </Card>
  );
}
