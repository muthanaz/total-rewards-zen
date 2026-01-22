/**
 * HR Ops KPI Strip
 * 
 * Operational KPIs for HR Ops dashboard:
 * - New submissions today
 * - SLA at risk
 * - Info requested (awaiting employee)
 * - Median cycle time (last 30 days)
 * - Rejection rate (last 30 days)
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Inbox, 
  AlertTriangle, 
  Clock, 
  Timer, 
  XCircle,
  Info,
  TrendingDown,
  TrendingUp,
  Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OpsKPIData {
  newToday: number;
  slaAtRisk: number;
  awaitingEmployee: number;
  medianCycleTimeDays: number;
  rejectionRatePercent: number;
  // Comparisons (optional)
  newTodayTrend?: number; // % change vs same day last week
  cycleTimeTrend?: number; // % change vs last 30 days prior
  rejectionTrend?: number; // % change
}

interface HROpsKPIStripProps {
  data: OpsKPIData;
  slaEnabled?: boolean;
  className?: string;
}

interface KPIItemProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sublabel?: string;
  trend?: number;
  variant?: 'default' | 'warning' | 'danger' | 'success';
  tooltip?: string;
  onClick?: () => void;
}

function KPIItem({ 
  icon: Icon, 
  label, 
  value, 
  sublabel, 
  trend, 
  variant = 'default',
  tooltip,
  onClick,
}: KPIItemProps) {
  const variantStyles = {
    default: { icon: 'text-muted-foreground', bg: 'bg-muted/30', badge: '' },
    warning: { icon: 'text-warning', bg: 'bg-warning/10', badge: 'bg-warning/10 text-warning border-warning/20' },
    danger: { icon: 'text-destructive', bg: 'bg-destructive/10', badge: 'bg-destructive/10 text-destructive border-destructive/20' },
    success: { icon: 'text-success', bg: 'bg-success/10', badge: 'bg-success/10 text-success border-success/20' },
  };

  const style = variantStyles[variant];

  const TrendIcon = trend && trend > 0 ? TrendingUp : trend && trend < 0 ? TrendingDown : Minus;
  const trendColor = trend && trend > 0 ? 'text-destructive' : trend && trend < 0 ? 'text-success' : 'text-muted-foreground';

  const content = (
    <div 
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border border-border/40 bg-card",
        onClick && "cursor-pointer hover:border-accent/30 hover:bg-accent/5 transition-all"
      )}
      onClick={onClick}
    >
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", style.bg)}>
        <Icon className={cn("w-5 h-5", style.icon)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tabular-nums">{value}</span>
          {trend !== undefined && (
            <span className={cn("flex items-center gap-0.5 text-[11px]", trendColor)}>
              <TrendIcon className="w-3 h-3" />
              {Math.abs(trend)}%
            </span>
          )}
        </div>
        <p className="text-[12px] text-muted-foreground truncate">{label}</p>
        {sublabel && (
          <p className="text-[10px] text-muted-foreground/70">{sublabel}</p>
        )}
      </div>
    </div>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[200px]">
          <p className="text-xs">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

export function HROpsKPIStrip({ data, slaEnabled = true, className }: HROpsKPIStripProps) {
  return (
    <TooltipProvider>
      <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3", className)}>
        <KPIItem
          icon={Inbox}
          label="New Today"
          value={data.newToday}
          sublabel="Submissions"
          trend={data.newTodayTrend}
          variant={data.newToday > 10 ? 'warning' : 'default'}
          tooltip="New claims and requests submitted today"
        />
        
        {slaEnabled && (
          <KPIItem
            icon={AlertTriangle}
            label="SLA at Risk"
            value={data.slaAtRisk}
            sublabel="< 24 hours"
            variant={data.slaAtRisk > 0 ? 'danger' : 'success'}
            tooltip="Requests due within 24 hours or overdue"
          />
        )}
        
        <KPIItem
          icon={Clock}
          label="Awaiting Employee"
          value={data.awaitingEmployee}
          sublabel="Info requested"
          variant={data.awaitingEmployee > 5 ? 'warning' : 'default'}
          tooltip="Requests where additional information has been requested from the employee"
        />
        
        <KPIItem
          icon={Timer}
          label="Median Cycle Time"
          value={`${data.medianCycleTimeDays}d`}
          sublabel="Last 30 days"
          trend={data.cycleTimeTrend}
          variant={data.medianCycleTimeDays > 5 ? 'warning' : data.medianCycleTimeDays <= 2 ? 'success' : 'default'}
          tooltip="Median time from submission to resolution (last 30 days)"
        />
        
        <KPIItem
          icon={XCircle}
          label="Rejection Rate"
          value={`${data.rejectionRatePercent}%`}
          sublabel="Last 30 days"
          trend={data.rejectionTrend}
          variant={data.rejectionRatePercent > 20 ? 'warning' : 'default'}
          tooltip="Percentage of requests rejected in the last 30 days"
        />
      </div>
    </TooltipProvider>
  );
}
