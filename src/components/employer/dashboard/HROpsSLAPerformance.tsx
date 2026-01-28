/**
 * HR Ops SLA Performance Section
 * 
 * Shows:
 * - SLA Met %
 * - Breached count
 * - Average cycle time
 * - CTA: "View SLA Breaches"
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
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MetricsContract, MetricsContractGrid } from '@/components/shared/MetricsContract';

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
        <MetricsContractGrid columns={3}>
          {/* SLA Met % */}
          <MetricsContract
            title="SLA Met"
            value={`${slaMetPercent}%`}
            icon={CheckCircle2}
            iconClassName={cn(
              slaStatus === 'excellent' ? 'bg-success/10 text-success' :
              slaStatus === 'good' ? 'bg-primary/10 text-primary' :
              'bg-warning/10 text-warning'
            )}
            trend={{
              value: slaMetDelta,
              label: 'vs last period',
              higherIsBetter: true,
            }}
            metadata={{
              definition: 'Percentage of requests resolved within SLA target',
              formula: '(Resolved Within SLA / Total Resolved) × 100',
              source: 'requests + org_settings.sla_hours',
              lastUpdated,
              confidence: 'high',
            }}
            size="sm"
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
          <MetricsContract
            title="SLA Breached"
            value={breachedCount.toString()}
            icon={XCircle}
            iconClassName={cn(
              breachedCount === 0 ? 'bg-success/10 text-success' :
              breachedCount <= 5 ? 'bg-warning/10 text-warning' :
              'bg-destructive/10 text-destructive'
            )}
            metadata={{
              definition: 'Number of requests that exceeded SLA target time',
              formula: 'COUNT(requests WHERE resolved_at > sla_due_at)',
              source: 'requests',
              lastUpdated,
              confidence: 'high',
            }}
            size="sm"
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
          <MetricsContract
            title="Avg Cycle Time"
            value={`${avgCycleTimeDays.toFixed(1)}d`}
            icon={Clock}
            iconClassName={cn(
              avgCycleTimeDays <= 2 ? 'bg-success/10 text-success' :
              avgCycleTimeDays <= 4 ? 'bg-primary/10 text-primary' :
              'bg-warning/10 text-warning'
            )}
            trend={{
              value: cycleTimeDelta,
              label: 'vs last period',
              higherIsBetter: false,
            }}
            metadata={{
              definition: 'Average time from submission to resolution',
              formula: 'AVG(resolved_at - submitted_at)',
              source: 'requests',
              lastUpdated,
              confidence: 'high',
            }}
            size="sm"
            footer={
              <span className="text-xs text-muted-foreground">
                Target: ≤ 3 days
              </span>
            }
          />
        </MetricsContractGrid>
      </CardContent>
    </Card>
  );
}
