/**
 * Waiver Analytics Panel
 * 
 * Privacy-safe aggregated display of exception/waiver metrics
 * for executive and HR ops dashboards.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  FileX, 
  TrendingUp, 
  TrendingDown, 
  Info, 
  Shield,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWaiverAnalytics, type WaiverReasonBreakdown, type PolicyWaiverStats } from '@/hooks/useWaiverAnalytics';

interface WaiverAnalyticsPanelProps {
  className?: string;
  variant?: 'full' | 'compact' | 'kpi';
  startDate?: string;
  endDate?: string;
}

export function WaiverAnalyticsPanel({
  className,
  variant = 'full',
  startDate,
  endDate,
}: WaiverAnalyticsPanelProps) {
  const { summary, topReasons, byPolicy, isLoading, error } = useWaiverAnalytics({
    startDate,
    endDate,
  });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="py-6 text-center text-muted-foreground">
          Unable to load waiver analytics
        </CardContent>
      </Card>
    );
  }

  // KPI variant - just the number
  if (variant === 'kpi') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="flex flex-col">
          <span className="text-2xl font-bold">{summary.waiver_rate_pct}%</span>
          <span className="text-xs text-muted-foreground">Waiver Rate</span>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>{summary.requests_with_waivers} of {summary.total_requests} requests had document waivers</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  // Compact variant - summary only
  if (variant === 'compact') {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileX className="h-4 w-4" />
            Exception Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{summary.waiver_rate_pct}%</span>
            <span className="text-sm text-muted-foreground">of requests</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {summary.total_documents_waived} documents waived across {summary.requests_with_waivers} requests
          </p>
          {topReasons.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {topReasons.slice(0, 3).map((reason) => (
                <Badge key={reason.reason} variant="secondary" className="text-xs">
                  {reason.label} ({reason.count})
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Full variant
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileX className="h-5 w-5" />
          Exception Analytics
        </CardTitle>
        <CardDescription>
          Document waiver patterns (privacy-safe aggregation)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Waiver Rate</p>
            <p className="text-2xl font-bold">{summary.waiver_rate_pct}%</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Requests w/ Waivers</p>
            <p className="text-2xl font-bold">{summary.requests_with_waivers}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Docs Waived</p>
            <p className="text-2xl font-bold">{summary.total_documents_waived}</p>
          </div>
        </div>

        {/* Top reasons */}
        {topReasons.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Top Waiver Reasons</h4>
            {topReasons.slice(0, 5).map((reason) => (
              <WaiverReasonBar key={reason.reason} reason={reason} />
            ))}
          </div>
        )}

        {/* By policy */}
        {byPolicy.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">By Policy</h4>
            <div className="space-y-2">
              {byPolicy.slice(0, 5).map((stats) => (
                <PolicyWaiverRow key={stats.policy_id} stats={stats} />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {summary.total_requests === 0 && (
          <div className="py-8 text-center">
            <CheckCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No waiver data available yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function WaiverReasonBar({ reason }: { reason: WaiverReasonBreakdown }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span>{reason.label}</span>
        <span className="text-muted-foreground">{reason.count} ({reason.percentage}%)</span>
      </div>
      <Progress value={reason.percentage} className="h-2" />
    </div>
  );
}

function PolicyWaiverRow({ stats }: { stats: PolicyWaiverStats }) {
  const isHighRate = stats.waiver_rate_pct > 20;

  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{stats.policy_title}</p>
        <p className="text-xs text-muted-foreground">{stats.policy_category}</p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={isHighRate ? 'destructive' : 'secondary'} className="text-xs">
          {stats.waiver_rate_pct}%
        </Badge>
        <span className="text-xs text-muted-foreground">
          {stats.waiver_count} / {stats.total_requests}
        </span>
      </div>
    </div>
  );
}

/**
 * Waiver status indicator for individual requests
 */
interface WaiverStatusBadgeProps {
  hasWaivers: boolean;
  waiverCount?: number;
  className?: string;
}

export function WaiverStatusBadge({ hasWaivers, waiverCount, className }: WaiverStatusBadgeProps) {
  if (!hasWaivers) return null;

  return (
    <Badge variant="outline" className={cn('gap-1 border-amber-300 text-amber-700', className)}>
      <AlertTriangle className="h-3 w-3" />
      {waiverCount ? `${waiverCount} waived` : 'Has waivers'}
    </Badge>
  );
}
