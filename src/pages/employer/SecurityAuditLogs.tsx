/**
 * Security Audit Logs Page
 * 
 * Executive-trust view: Searchable timeline, strict permissions, PII access logs.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Lock,
  Eye,
  FileText,
} from 'lucide-react';
import { cn, formatInteger } from '@/lib/utils';
import { DemoModeBadge } from '@/components/shared/DemoDataGate';
import { subDays, subHours } from 'date-fns';
import { 
  AuditLogTimeline,
  MOCK_AUDIT_LOGS,
} from '@/components/employer/integrations';
import { useEmployerPermissions } from '@/hooks/useEmployerPermissions';

export default function SecurityAuditLogs() {
  const { hasPermission } = useEmployerPermissions();
  const canViewPII = hasPermission('can_view_exec_analytics'); // Simplified permission check

  const logs = MOCK_AUDIT_LOGS;

  // Calculate stats
  const stats = {
    total: logs.length,
    last24h: logs.filter(l => l.timestamp > subHours(new Date(), 24)).length,
    piiAccess: logs.filter(l => l.isPIIAccess).length,
    failed: logs.filter(l => l.outcome === 'failure').length,
    blocked: logs.filter(l => l.outcome === 'failure' && l.isPIIAccess).length,
  };

  // Recent PII access for quick view
  const recentPIIAccess = logs
    .filter(l => l.isPIIAccess)
    .slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Security Audit Log</h1>
            <p className="text-muted-foreground">Complete activity trail with PII access monitoring</p>
          </div>
          <DemoModeBadge />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Permission Warning */}
      {!canViewPII && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-warning" />
              <div>
                <p className="font-medium text-sm">Limited Access</p>
                <p className="text-xs text-muted-foreground">
                  You can view activity logs but PII access details are restricted to authorized personnel.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="card-elevated">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatInteger(stats.total)}</p>
                <p className="text-xs text-muted-foreground">Total Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Clock className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatInteger(stats.last24h)}</p>
                <p className="text-xs text-muted-foreground">Last 24h</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <ShieldAlert className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatInteger(stats.piiAccess)}</p>
                <p className="text-xs text-muted-foreground">PII Access</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatInteger(stats.failed)}</p>
                <p className="text-xs text-muted-foreground">Failed Actions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <Lock className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatInteger(stats.blocked)}</p>
                <p className="text-xs text-muted-foreground">Blocked PII</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="timeline" className="space-y-6">
        <TabsList>
          <TabsTrigger value="timeline" className="gap-2">
            <FileText className="w-4 h-4" />
            Full Timeline
          </TabsTrigger>
          <TabsTrigger value="pii" className="gap-2">
            <ShieldAlert className="w-4 h-4" />
            PII Access
            <Badge variant="secondary" className="ml-1">{stats.piiAccess}</Badge>
          </TabsTrigger>
          <TabsTrigger value="failed" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            Failed Actions
            <Badge variant="secondary" className="ml-1">{stats.failed}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <AuditLogTimeline 
            logs={logs} 
            canViewPII={canViewPII}
          />
        </TabsContent>

        <TabsContent value="pii">
          <AuditLogTimeline 
            logs={logs.filter(l => l.isPIIAccess)} 
            canViewPII={canViewPII}
          />
        </TabsContent>

        <TabsContent value="failed">
          <AuditLogTimeline 
            logs={logs.filter(l => l.outcome === 'failure')} 
            canViewPII={canViewPII}
          />
        </TabsContent>
      </Tabs>

      {/* PII Access Summary */}
      {canViewPII && recentPIIAccess.length > 0 && (
        <Card className="card-elevated border-warning/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-warning" />
              <div>
                <CardTitle className="text-base font-medium">Recent PII Access</CardTitle>
                <CardDescription>Sensitive data access in the last 7 days</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPIIAccess.map((log) => (
                <div 
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-warning/5 border border-warning/20"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'p-1.5 rounded-full',
                      log.outcome === 'success' ? 'bg-warning/10' : 'bg-destructive/10'
                    )}>
                      {log.outcome === 'success' ? (
                        <Eye className="w-3.5 h-3.5 text-warning" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-destructive" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{log.actor.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Accessed {log.piiFields?.join(', ')} for {log.resource.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        'text-[10px]',
                        log.outcome === 'success' 
                          ? 'bg-success/10 text-success border-success/20'
                          : 'bg-destructive/10 text-destructive border-destructive/20'
                      )}
                    >
                      {log.outcome === 'success' ? 'Allowed' : 'Blocked'}
                    </Badge>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {log.actor.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
