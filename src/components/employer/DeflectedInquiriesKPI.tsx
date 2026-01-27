/**
 * Self-Service Resolution KPI
 * 
 * Shows the "Self-Service Resolution" metric with clear definition.
 * Only displays if data exists; otherwise shows "Not yet measured" with setup guidance.
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  MessageSquareOff, 
  Info, 
  TrendingUp, 
  TrendingDown,
  ArrowRight,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface DeflectedInquiriesKPIProps {
  deflectedCount?: number | null;
  totalInquiries?: number | null;
  percentDeflected?: number | null;
  trend?: number; // % change vs previous period
  periodLabel?: string; // e.g., "Last 30 days"
  isConfigured?: boolean;
  className?: string;
}

export function DeflectedInquiriesKPI({
  deflectedCount,
  totalInquiries,
  percentDeflected,
  trend,
  periodLabel = 'Last 30 days',
  isConfigured = false,
  className,
}: DeflectedInquiriesKPIProps) {
  const hasData = deflectedCount !== null && deflectedCount !== undefined && isConfigured;

  // Not configured or no data state
  if (!hasData) {
    return (
      <Card className={cn("border-dashed border-muted-foreground/30", className)}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
              <MessageSquareOff className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-muted-foreground">Self-Service Resolution</span>
                <Badge variant="outline" className="text-[10px] bg-muted/50">
                  Not measured
                </Badge>
              </div>
              <p className="text-[12px] text-muted-foreground mb-3">
                Track how many employee questions are answered by self-service before reaching HR.
              </p>
              <Link to="/employer/knowledge?tab=setup">
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
                  <Settings className="w-3 h-3" />
                  Set up tracking
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const TrendIcon = trend && trend > 0 ? TrendingUp : trend && trend < 0 ? TrendingDown : null;
  const trendColor = trend && trend > 0 ? 'text-success' : trend && trend < 0 ? 'text-destructive' : 'text-muted-foreground';

  return (
    <TooltipProvider>
      <Card className={cn("border-success/20 bg-success/5", className)}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/15 flex items-center justify-center shrink-0">
              <MessageSquareOff className="w-5 h-5 text-success" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium">Self-Service Resolution</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="p-0.5 rounded hover:bg-muted/50">
                      <Info className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[250px]">
                    <p className="text-xs font-medium mb-1">Definition</p>
                    <p className="text-xs text-muted-foreground">
                      Number of employee questions answered through self-service (Knowledge Hub, 
                      policy docs, FAQ) without requiring HR intervention. Calculated from 
                      Knowledge Hub analytics and policy page views before question submission.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              
              <div className="flex items-end gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-success tabular-nums">
                      {deflectedCount}
                    </span>
                    {trend !== undefined && TrendIcon && (
                      <span className={cn("flex items-center gap-0.5 text-xs", trendColor)}>
                        <TrendIcon className="w-3.5 h-3.5" />
                        {Math.abs(trend)}%
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">{periodLabel}</p>
                </div>
                
                {percentDeflected !== undefined && percentDeflected !== null && (
                  <div className="pb-0.5">
                    <Badge className="bg-success/10 text-success border-success/20 text-xs">
                      {percentDeflected}% deflection rate
                    </Badge>
                  </div>
                )}
              </div>
              
              {totalInquiries !== undefined && totalInquiries !== null && (
                <p className="text-[11px] text-muted-foreground mt-2">
                  {deflectedCount} of {totalInquiries} total inquiries resolved via self-service
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
