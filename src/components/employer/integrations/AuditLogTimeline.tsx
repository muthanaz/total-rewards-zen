/**
 * Audit Log Timeline
 * 
 * Searchable timeline with PII access highlighting and strict permission display.
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Search,
  Shield,
  ShieldAlert,
  Eye,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Filter,
  Clock,
  User,
  Settings,
  RefreshCw,
  Lock,
  KeyRound,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, subDays } from 'date-fns';
import type { AuditLogEntry, AuditAction, AuditResourceType } from './types';

interface AuditLogTimelineProps {
  logs: AuditLogEntry[];
  canViewPII?: boolean;
  className?: string;
}

const actionConfig: Record<AuditAction, { icon: typeof Eye; label: string; color: string }> = {
  view: { icon: Eye, label: 'Viewed', color: 'text-muted-foreground' },
  create: { icon: FileText, label: 'Created', color: 'text-success' },
  update: { icon: RefreshCw, label: 'Updated', color: 'text-primary' },
  delete: { icon: XCircle, label: 'Deleted', color: 'text-destructive' },
  export: { icon: Download, label: 'Exported', color: 'text-primary' },
  login: { icon: User, label: 'Logged In', color: 'text-success' },
  logout: { icon: User, label: 'Logged Out', color: 'text-muted-foreground' },
  approve: { icon: CheckCircle, label: 'Approved', color: 'text-success' },
  reject: { icon: XCircle, label: 'Rejected', color: 'text-destructive' },
  sync: { icon: RefreshCw, label: 'Synced', color: 'text-primary' },
  pii_access: { icon: ShieldAlert, label: 'PII Access', color: 'text-warning' },
  bulk_action: { icon: FileText, label: 'Bulk Action', color: 'text-primary' },
  permission_change: { icon: KeyRound, label: 'Permission Change', color: 'text-warning' },
  config_change: { icon: Settings, label: 'Config Change', color: 'text-warning' },
};

const resourceTypeLabels: Record<AuditResourceType, string> = {
  employee: 'Employee',
  claim: 'Claim',
  policy: 'Policy',
  integration: 'Integration',
  report: 'Report',
  workflow: 'Workflow',
  user: 'User',
  settings: 'Settings',
  budget: 'Budget',
  sensitive_data: 'Sensitive Data',
};

export function AuditLogTimeline({ 
  logs, 
  canViewPII = false,
  className 
}: AuditLogTimelineProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [resourceFilter, setResourceFilter] = useState<string>('all');
  const [piiOnly, setPiiOnly] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          log.actor.name.toLowerCase().includes(query) ||
          log.resource.name.toLowerCase().includes(query) ||
          log.details.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Action filter
      if (actionFilter !== 'all' && log.action !== actionFilter) return false;

      // Resource filter
      if (resourceFilter !== 'all' && log.resource.type !== resourceFilter) return false;

      // PII only filter
      if (piiOnly && !log.isPIIAccess) return false;

      return true;
    });
  }, [logs, searchQuery, actionFilter, resourceFilter, piiOnly]);

  // Group logs by date
  const groupedLogs = useMemo(() => {
    const groups: Record<string, AuditLogEntry[]> = {};
    filteredLogs.forEach(log => {
      const dateKey = format(log.timestamp, 'yyyy-MM-dd');
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(log);
    });
    return groups;
  }, [filteredLogs]);

  const piiCount = logs.filter(l => l.isPIIAccess).length;
  const failedCount = logs.filter(l => l.outcome === 'failure').length;

  const handleViewDetails = (log: AuditLogEntry) => {
    setSelectedLog(log);
    setDetailOpen(true);
  };

  const getOutcomeBadge = (outcome: AuditLogEntry['outcome']) => {
    switch (outcome) {
      case 'success':
        return <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-[10px]">Success</Badge>;
      case 'failure':
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-[10px]">Failed</Badge>;
      case 'partial':
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 text-[10px]">Partial</Badge>;
    }
  };

  return (
    <>
      <Card className={cn('card-elevated', className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Security Audit Log
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                {filteredLogs.length} events
              </Badge>
              {piiCount > 0 && (
                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  {piiCount} PII
                </Badge>
              )}
              {failedCount > 0 && (
                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 gap-1">
                  <XCircle className="w-3 h-3" />
                  {failedCount} failed
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search actor, resource, or details..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {Object.entries(actionConfig).map(([action, config]) => (
                  <SelectItem key={action} value={action}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={resourceFilter} onValueChange={setResourceFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Resource" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Resources</SelectItem>
                {Object.entries(resourceTypeLabels).map(([type, label]) => (
                  <SelectItem key={type} value={type}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-warning/5 border-warning/20">
              <Checkbox 
                id="pii-filter" 
                checked={piiOnly}
                onCheckedChange={(checked) => setPiiOnly(checked === true)}
              />
              <label htmlFor="pii-filter" className="text-xs font-medium text-warning cursor-pointer flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" />
                PII Only
              </label>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
            {Object.entries(groupedLogs).map(([dateKey, dateLogs]) => (
              <div key={dateKey}>
                {/* Date Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs font-medium text-muted-foreground">
                    {format(new Date(dateKey), 'EEEE, MMMM d')}
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                {/* Logs for this date */}
                <div className="space-y-2">
                  {dateLogs.map((log) => {
                    const config = actionConfig[log.action];
                    const ActionIcon = config.icon;

                    return (
                      <div 
                        key={log.id}
                        className={cn(
                          'flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50',
                          log.isPIIAccess && 'border-warning/30 bg-warning/5',
                          log.outcome === 'failure' && 'border-destructive/30 bg-destructive/5'
                        )}
                        onClick={() => handleViewDetails(log)}
                      >
                        {/* Icon */}
                        <div className={cn(
                          'p-2 rounded-lg shrink-0',
                          log.isPIIAccess ? 'bg-warning/10' : 'bg-muted'
                        )}>
                          <ActionIcon className={cn('w-4 h-4', config.color)} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={cn('text-sm font-medium', config.color)}>
                              {config.label}
                            </span>
                            <Badge variant="secondary" className="text-[10px]">
                              {resourceTypeLabels[log.resource.type]}
                            </Badge>
                            {log.isPIIAccess && (
                              <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 text-[10px] gap-1">
                                <Lock className="w-2.5 h-2.5" />
                                PII
                              </Badge>
                            )}
                            {getOutcomeBadge(log.outcome)}
                          </div>
                          <p className="text-sm mt-1 truncate">{log.resource.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {log.details}
                          </p>
                          
                          {/* PII Fields Warning */}
                          {log.isPIIAccess && log.piiFields && log.piiFields.length > 0 && (
                            <div className="flex items-center gap-1.5 mt-2">
                              <ShieldAlert className="w-3 h-3 text-warning" />
                              <span className="text-[10px] text-warning">
                                Accessed: {log.piiFields.join(', ')}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Right side */}
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="text-xs text-muted-foreground">
                            {format(log.timestamp, 'HH:mm')}
                          </span>
                          <div className="flex items-center gap-1">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-[10px]">
                                {log.actor.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                              {log.actor.name}
                            </span>
                          </div>
                          <ChevronRight className="w-3 h-3 text-muted-foreground" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {filteredLogs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No audit logs match your filters</p>
              </div>
            )}
          </div>

          {/* Export Button */}
          <div className="mt-4 pt-4 border-t flex justify-end">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-3.5 h-3.5" />
              Export Logs
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detail Sheet */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="w-full sm:max-w-lg">
          {selectedLog && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  {selectedLog.isPIIAccess && (
                    <ShieldAlert className="w-5 h-5 text-warning" />
                  )}
                  Audit Log Details
                </SheetTitle>
                <SheetDescription>
                  {format(selectedLog.timestamp, 'PPpp')}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Action & Outcome */}
                <div className="flex items-center gap-3">
                  <Badge className={cn(
                    'text-sm',
                    actionConfig[selectedLog.action].color === 'text-success' && 'bg-success/10 text-success',
                    actionConfig[selectedLog.action].color === 'text-destructive' && 'bg-destructive/10 text-destructive',
                    actionConfig[selectedLog.action].color === 'text-warning' && 'bg-warning/10 text-warning',
                    actionConfig[selectedLog.action].color === 'text-primary' && 'bg-primary/10 text-primary',
                  )}>
                    {actionConfig[selectedLog.action].label}
                  </Badge>
                  {getOutcomeBadge(selectedLog.outcome)}
                  {selectedLog.isPIIAccess && (
                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 gap-1">
                      <Lock className="w-3 h-3" />
                      Sensitive Data Access
                    </Badge>
                  )}
                </div>

                {/* Actor */}
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-2">Performed By</p>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {selectedLog.actor.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedLog.actor.name}</p>
                      <p className="text-xs text-muted-foreground">{selectedLog.actor.role}</p>
                      {selectedLog.actor.email && (
                        <p className="text-xs text-muted-foreground">{selectedLog.actor.email}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Resource */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Resource</p>
                  <div className="p-3 rounded-lg border">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary">{resourceTypeLabels[selectedLog.resource.type]}</Badge>
                      <span className="text-xs text-muted-foreground">ID: {selectedLog.resource.id}</span>
                    </div>
                    <p className="font-medium">{selectedLog.resource.name}</p>
                  </div>
                </div>

                {/* Details */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Details</p>
                  <p className="text-sm">{selectedLog.details}</p>
                </div>

                {/* PII Fields */}
                {selectedLog.isPIIAccess && selectedLog.piiFields && (
                  <div className="p-3 rounded-lg border border-warning/30 bg-warning/5">
                    <p className="text-xs font-medium text-warning mb-2 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" />
                      Sensitive Fields Accessed
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedLog.piiFields.map(field => (
                        <Badge key={field} variant="outline" className="bg-warning/10 text-warning border-warning/20">
                          {field.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                    {selectedLog.metadata?.reason && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Reason: {String(selectedLog.metadata.reason)}
                      </p>
                    )}
                  </div>
                )}

                {/* Metadata */}
                {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && !selectedLog.isPIIAccess && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Additional Metadata</p>
                    <pre className="p-3 rounded-lg bg-muted text-xs overflow-x-auto">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Session Info */}
                {(selectedLog.ipAddress || selectedLog.sessionId) && (
                  <div className="text-xs text-muted-foreground space-y-1">
                    {selectedLog.ipAddress && <p>IP: {selectedLog.ipAddress}</p>}
                    {selectedLog.sessionId && <p>Session: {selectedLog.sessionId}</p>}
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
