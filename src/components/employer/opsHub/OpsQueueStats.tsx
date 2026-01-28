/**
 * Operations Hub KPI Strip
 * 
 * Quick stats for the queue:
 * - New Today
 * - SLA At Risk
 * - Awaiting Employee
 * - Median Cycle Time
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Inbox,
  Flame,
  UserCheck,
  Timer,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OpsQueueStatsProps {
  newToday: number;
  slaAtRisk: number;
  awaitingEmployee: number;
  medianCycleTime: number;
  slaTarget?: number;
  trends?: {
    newToday?: number;
    slaAtRisk?: number;
    cycleTime?: number;
  };
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  trend?: number;
  warning?: boolean;
  critical?: boolean;
  suffix?: string;
  tooltip?: string;
}

function StatCard({ icon, label, value, trend, warning, critical, suffix, tooltip }: StatCardProps) {
  const TrendIcon = trend === undefined ? null : trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Card className={cn(
          "flex-1 min-w-[140px] transition-all",
          critical && "border-destructive/50 bg-destructive/5",
          warning && !critical && "border-warning/50 bg-warning/5"
        )}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-full",
                critical ? "bg-destructive/10 text-destructive" :
                warning ? "bg-warning/10 text-warning" :
                "bg-primary/10 text-primary"
              )}>
                {icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-2xl font-bold tabular-nums",
                    critical && "text-destructive",
                    warning && !critical && "text-warning"
                  )}>
                    {value}
                  </span>
                  {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
                  {TrendIcon && trend !== 0 && (
                    <TrendIcon className={cn(
                      "w-3 h-3",
                      trend > 0 ? "text-destructive" : "text-success"
                    )} />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TooltipTrigger>
      {tooltip && (
        <TooltipContent>
          <p className="text-xs">{tooltip}</p>
        </TooltipContent>
      )}
    </Tooltip>
  );
}

export function OpsQueueStats({
  newToday,
  slaAtRisk,
  awaitingEmployee,
  medianCycleTime,
  slaTarget = 72,
  trends,
}: OpsQueueStatsProps) {
  const cycleTimeWarning = medianCycleTime > (slaTarget / 24);
  const cycleTimeCritical = medianCycleTime > ((slaTarget * 1.5) / 24);

  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-3">
        <StatCard
          icon={<Inbox className="w-5 h-5" />}
          label="New Today"
          value={newToday}
          trend={trends?.newToday}
          tooltip="Requests submitted today"
        />
        
        <StatCard
          icon={<Flame className="w-5 h-5" />}
          label="SLA At Risk"
          value={slaAtRisk}
          trend={trends?.slaAtRisk}
          warning={slaAtRisk > 0}
          critical={slaAtRisk > 5}
          tooltip="Requests with less than 24h remaining before SLA breach"
        />
        
        <StatCard
          icon={<UserCheck className="w-5 h-5" />}
          label="Awaiting Employee"
          value={awaitingEmployee}
          tooltip="Requests paused pending employee response"
        />
        
        <StatCard
          icon={<Timer className="w-5 h-5" />}
          label="Median Cycle Time"
          value={medianCycleTime.toFixed(1)}
          suffix="days"
          trend={trends?.cycleTime}
          warning={cycleTimeWarning}
          critical={cycleTimeCritical}
          tooltip={`Target: ${(slaTarget / 24).toFixed(1)} days`}
        />
      </div>
    </TooltipProvider>
  );
}

export default OpsQueueStats;
