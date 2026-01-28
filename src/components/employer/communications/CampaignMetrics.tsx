import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Send, 
  CheckCircle2, 
  Eye, 
  MousePointerClick,
  Zap,
  UserX,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CampaignMetrics as MetricsType } from './types';

interface CampaignMetricsProps {
  metrics: MetricsType;
  className?: string;
}

export function CampaignMetricsCard({ metrics, className }: CampaignMetricsProps) {
  const deliveryRate = metrics.totalRecipients > 0 
    ? (metrics.delivered / metrics.totalRecipients) * 100 
    : 0;

  return (
    <Card className={cn('border-border/50', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          Campaign Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Funnel Metrics */}
        <div className="space-y-3">
          {/* Sent */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Sent</span>
            </div>
            <span className="text-sm font-semibold tabular-nums">{metrics.sent}</span>
          </div>

          {/* Delivered */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="text-sm">Delivered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tabular-nums">{metrics.delivered}</span>
                <Badge variant="secondary" className="text-[10px]">
                  {deliveryRate.toFixed(1)}%
                </Badge>
              </div>
            </div>
            <Progress value={deliveryRate} className="h-1.5 [&>div]:bg-success" />
          </div>

          {/* Opened */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <span className="text-sm">Opened</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tabular-nums">{metrics.opened}</span>
                <Badge 
                  variant="secondary" 
                  className={cn(
                    'text-[10px]',
                    metrics.openRate >= 50 ? 'bg-success/10 text-success' : 
                    metrics.openRate >= 30 ? 'bg-warning/10 text-warning' : ''
                  )}
                >
                  {metrics.openRate.toFixed(1)}%
                </Badge>
              </div>
            </div>
            <Progress 
              value={metrics.openRate} 
              className={cn(
                'h-1.5',
                metrics.openRate >= 50 ? '[&>div]:bg-success' : 
                metrics.openRate >= 30 ? '[&>div]:bg-warning' : '[&>div]:bg-blue-600'
              )} 
            />
          </div>

          {/* Clicked */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MousePointerClick className="w-4 h-4 text-purple-600" />
                <span className="text-sm">Clicked</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tabular-nums">{metrics.clicked}</span>
                <Badge variant="secondary" className="text-[10px]">
                  {metrics.clickRate.toFixed(1)}%
                </Badge>
              </div>
            </div>
            <Progress value={metrics.clickRate} className="h-1.5 [&>div]:bg-purple-600" />
          </div>

          {/* Actions Started */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Actions Started</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tabular-nums">{metrics.actionsStarted}</span>
                <Badge 
                  variant="default" 
                  className="text-[10px]"
                >
                  {metrics.actionRate.toFixed(1)}%
                </Badge>
              </div>
            </div>
            <Progress value={metrics.actionRate} className="h-2" />
          </div>
        </div>

        {/* Issues */}
        {(metrics.bounced > 0 || metrics.optedOut > 0) && (
          <div className="pt-3 border-t space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Issues</p>
            <div className="flex items-center gap-4">
              {metrics.bounced > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-destructive">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{metrics.bounced} bounced</span>
                </div>
              )}
              {metrics.optedOut > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <UserX className="w-3 h-3" />
                  <span>{metrics.optedOut} opted out</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
