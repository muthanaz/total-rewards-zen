/**
 * Integration Status Card
 * 
 * Shows integration health, last sync, coverage, and powered dashboards.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Clock,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Database,
  LayoutDashboard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import type { IntegrationSource, IntegrationHealthStatus } from './types';

interface IntegrationStatusCardProps {
  integration: IntegrationSource;
  onSync?: (id: string) => void;
  onFix?: (id: string) => void;
  isSyncing?: boolean;
}

const statusConfig: Record<IntegrationHealthStatus, {
  icon: typeof CheckCircle;
  label: string;
  color: string;
  bgColor: string;
}> = {
  healthy: {
    icon: CheckCircle,
    label: 'Healthy',
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
  degraded: {
    icon: AlertTriangle,
    label: 'Degraded',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
  },
  disconnected: {
    icon: XCircle,
    label: 'Disconnected',
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
  },
  syncing: {
    icon: RefreshCw,
    label: 'Syncing',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
};

export function IntegrationStatusCard({
  integration,
  onSync,
  onFix,
  isSyncing = false,
}: IntegrationStatusCardProps) {
  const [showDashboards, setShowDashboards] = useState(false);
  const config = statusConfig[integration.status];
  const StatusIcon = config.icon;

  const getFreshnessLabel = (freshness: IntegrationSource['dataFreshness']) => {
    switch (freshness) {
      case 'current': return { label: 'Current', color: 'text-success' };
      case 'stale': return { label: 'Stale (2h+)', color: 'text-warning' };
      case 'very_stale': return { label: 'Very Stale (7d+)', color: 'text-destructive' };
    }
  };

  const freshness = getFreshnessLabel(integration.dataFreshness);

  return (
    <Card className={cn(
      'card-elevated transition-all',
      integration.issues.length > 0 && 'border-warning/30'
    )}>
      <CardContent className="pt-5 pb-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className={cn('p-2 rounded-lg', config.bgColor)}>
              <Database className={cn('w-5 h-5', config.color)} />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{integration.name}</h3>
              <p className="text-xs text-muted-foreground line-clamp-1 max-w-[250px]">
                {integration.description}
              </p>
            </div>
          </div>
          <Badge variant="outline" className={cn('gap-1', config.bgColor, config.color, 'border-0')}>
            <StatusIcon className={cn('w-3 h-3', isSyncing && 'animate-spin')} />
            {isSyncing ? 'Syncing...' : config.label}
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Last Sync</p>
            <p className="text-sm font-medium">
              {integration.lastSyncAt 
                ? formatDistanceToNow(integration.lastSyncAt, { addSuffix: true })
                : 'Never'
              }
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Coverage</p>
            <div className="flex items-center gap-2">
              <Progress value={integration.coverage} className="h-1.5 flex-1" />
              <span className="text-sm font-medium tabular-nums">{integration.coverage}%</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Freshness</p>
            <p className={cn('text-sm font-medium', freshness.color)}>
              {freshness.label}
            </p>
          </div>
        </div>

        {/* Records Summary */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          <span>{integration.recordsSynced.toLocaleString()} records synced</span>
          {integration.recordsFailed > 0 && (
            <span className="text-warning">
              {integration.recordsFailed} failed
            </span>
          )}
          <span className="capitalize">{integration.syncFrequency} sync</span>
        </div>

        {/* Issues */}
        {integration.issues.length > 0 && (
          <div className="mb-4 p-3 rounded-lg border border-warning/20 bg-warning/5 space-y-2">
            {integration.issues.slice(0, 2).map((issue) => (
              <div key={issue.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={cn(
                    'w-3.5 h-3.5',
                    issue.severity === 'critical' ? 'text-destructive' : 'text-warning'
                  )} />
                  <span className="text-xs text-muted-foreground">{issue.message}</span>
                </div>
                {issue.fixPath && (
                  <Button variant="ghost" size="sm" asChild className="h-6 text-xs">
                    <Link to={issue.fixPath}>Fix</Link>
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Powered Dashboards */}
        <Collapsible open={showDashboards} onOpenChange={setShowDashboards}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between h-8 text-xs">
              <span className="flex items-center gap-2">
                <LayoutDashboard className="w-3.5 h-3.5" />
                Powers {integration.poweredDashboards.length} dashboard{integration.poweredDashboards.length !== 1 ? 's' : ''}
              </span>
              {showDashboards ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="space-y-2 pl-2">
              {integration.poweredDashboards.map((dash) => (
                <div 
                  key={dash.dashboardId}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        'text-[10px] px-1.5',
                        dash.confidenceImpact === 'critical' && 'bg-destructive/10 text-destructive border-destructive/20',
                        dash.confidenceImpact === 'high' && 'bg-warning/10 text-warning border-warning/20',
                        dash.confidenceImpact === 'medium' && 'bg-primary/10 text-primary border-primary/20',
                        dash.confidenceImpact === 'low' && 'bg-muted text-muted-foreground',
                      )}
                    >
                      {dash.confidenceImpact}
                    </Badge>
                    <span className="text-xs font-medium">{dash.dashboardName}</span>
                  </div>
                  <Button variant="ghost" size="sm" asChild className="h-6">
                    <Link to={dash.dashboardPath}>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Actions */}
        <div className="flex gap-2 mt-4 pt-4 border-t">
          {integration.status === 'disconnected' ? (
            <Button 
              size="sm" 
              className="flex-1 gap-2"
              onClick={() => onFix?.(integration.id)}
            >
              Reconnect
            </Button>
          ) : (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 gap-2"
                onClick={() => onSync?.(integration.id)}
                disabled={isSyncing}
              >
                <RefreshCw className={cn('w-3.5 h-3.5', isSyncing && 'animate-spin')} />
                Sync Now
              </Button>
              {integration.issues.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 border-warning text-warning hover:bg-warning/10"
                  onClick={() => onFix?.(integration.id)}
                >
                  Fix Issues
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
