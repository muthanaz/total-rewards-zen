/**
 * Employer Sync Monitor Page
 * 
 * Monitor and trigger data synchronization jobs with issue resolution.
 */

import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { PageLayout, MetricCard, MetricGrid } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { toast } from 'sonner';
import {
  Server,
  RefreshCw,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Activity,
  Zap,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { useSyncMonitor, type SyncStatus } from '@/hooks/useSyncMonitor';
import { useDataConfidenceIssues } from '@/hooks/useDataConfidenceIssues';

const STATUS_CONFIG: Record<SyncStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
  success: { label: 'Success', color: 'bg-success/10 text-success border-success/30', icon: CheckCircle },
  running: { label: 'Running', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30', icon: RefreshCw },
  failed: { label: 'Failed', color: 'bg-destructive/10 text-destructive border-destructive/30', icon: XCircle },
  pending: { label: 'Pending', color: 'bg-muted text-muted-foreground border-border', icon: Clock },
  stale: { label: 'Stale', color: 'bg-warning/10 text-warning border-warning/30', icon: AlertTriangle },
};

export default function EmployerSyncMonitor() {
  const [searchParams] = useSearchParams();
  const resolveIssueId = searchParams.get('resolve_issue');
  
  const {
    jobs,
    stats,
    syncingJobId,
    highlightedJobId,
    getLogsForJob,
    runSyncAndResolve,
    highlightJob,
    getJobByIssueId,
  } = useSyncMonitor();
  
  const { resolveIssue, getIssueById } = useDataConfidenceIssues();
  
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [logsSheetOpen, setLogsSheetOpen] = useState(false);

  // Handle deep link from Data Confidence
  useEffect(() => {
    if (resolveIssueId) {
      const linkedJob = getJobByIssueId(resolveIssueId);
      if (linkedJob) {
        highlightJob(linkedJob.id);
        setTimeout(() => {
          document.getElementById(`job-${linkedJob.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    }
  }, [resolveIssueId, getJobByIssueId, highlightJob]);

  const linkedIssue = resolveIssueId ? getIssueById(resolveIssueId) : null;

  const handleSyncNow = async (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    
    toast.info(`Starting sync for "${job.name}"...`);
    
    const result = await runSyncAndResolve(jobId, (issueId, type, note) => {
      resolveIssue(issueId, type as any, note);
    });
    
    if (result.issueResolved) {
      toast.success(`Sync complete! Related issue has been resolved and confidence score updated.`);
    } else {
      toast.success(`Sync completed successfully.`);
    }
  };

  const handleViewLogs = (jobId: string) => {
    setSelectedJobId(jobId);
    setLogsSheetOpen(true);
  };

  const selectedJob = selectedJobId ? jobs.find(j => j.id === selectedJobId) : null;
  const selectedLogs = selectedJobId ? getLogsForJob(selectedJobId) : [];

  return (
    <PageLayout
      title="Sync Monitor"
      description="Monitor data synchronization jobs and troubleshoot issues"
      actions={
        <Button variant="outline" asChild className="gap-2">
          <Link to="/employer/integrations">
            <ArrowLeft className="w-4 h-4" />
            Back to Data Confidence
          </Link>
        </Button>
      }
    >
      {/* Linked Issue Banner */}
      {linkedIssue && (
        <Card className="mb-6 border-primary/30 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Resolving: {linkedIssue.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Run the highlighted sync below to refresh data and resolve this issue.
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="gap-1">
                <AlertTriangle className="w-3 h-3" />
                {linkedIssue.confidence} confidence
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <MetricGrid columns={4}>
        <MetricCard title="Total Jobs" value={stats.total} icon={Server} />
        <MetricCard title="Successful" value={stats.success} icon={CheckCircle} />
        <MetricCard title="Running" value={stats.running} icon={Activity} />
        <MetricCard title="Stale/Failed" value={stats.stale + stats.failed} icon={AlertTriangle} />
      </MetricGrid>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Sync Jobs
          </CardTitle>
          <CardDescription>
            Data synchronization status and controls
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Name</TableHead>
                <TableHead>Data Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Sync</TableHead>
                <TableHead>Next Sync</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Records</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => {
                const statusConfig = STATUS_CONFIG[job.status];
                const StatusIcon = statusConfig.icon;
                const isSyncing = syncingJobId === job.id;
                const isHighlighted = highlightedJobId === job.id;
                
                return (
                  <TableRow
                    key={job.id}
                    id={`job-${job.id}`}
                    className={cn(
                      'group',
                      isHighlighted && 'bg-primary/10 animate-pulse'
                    )}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium">{job.name}</p>
                        {job.errorMessage && (
                          <p className="text-xs text-destructive line-clamp-1 max-w-[200px]">
                            {job.errorMessage}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{job.dataSource}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusConfig.color}>
                        <StatusIcon className={cn(
                          'w-3 h-3 mr-1',
                          (isSyncing || job.status === 'running') && 'animate-spin'
                        )} />
                        {isSyncing ? 'Running' : statusConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {job.lastSync ? (
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(job.lastSync, { addSuffix: true })}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {job.nextSync ? (
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(job.nextSync, { addSuffix: true })}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{job.duration}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="font-medium">{job.recordsProcessed.toLocaleString()}</span>
                        {job.recordsFailed > 0 && (
                          <span className="text-destructive ml-1">
                            ({job.recordsFailed} failed)
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewLogs(job.id)}
                          className="gap-1"
                        >
                          <FileText className="w-3 h-3" />
                          Logs
                        </Button>
                        <Button
                          variant={isHighlighted ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleSyncNow(job.id)}
                          disabled={isSyncing}
                          className="gap-1"
                        >
                          {isSyncing ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <Play className="w-3 h-3" />
                          )}
                          Sync Now
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Stale/Failed Jobs Alert */}
      {(stats.stale + stats.failed) > 0 && (
        <Card className="border-warning/30 bg-warning/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-warning">
              <AlertTriangle className="w-4 h-4" />
              Attention Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {jobs.filter(j => j.status === 'stale' || j.status === 'failed').map(job => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-background border"
                >
                  <div>
                    <p className="font-medium text-sm">{job.name}</p>
                    <p className="text-xs text-muted-foreground">{job.errorMessage}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleSyncNow(job.id)}
                    disabled={syncingJobId === job.id}
                    className="gap-1"
                  >
                    {syncingJobId === job.id ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Play className="w-3 h-3" />
                    )}
                    Retry
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Logs Sheet */}
      <Sheet open={logsSheetOpen} onOpenChange={setLogsSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg">
          {selectedJob && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  {selectedJob.name} Logs
                </SheetTitle>
                <SheetDescription>
                  Last 20 sync events
                </SheetDescription>
              </SheetHeader>
              
              <div className="mt-6">
                <ScrollArea className="h-[500px] pr-4">
                  {selectedLogs.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      No logs available
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedLogs.map((log) => (
                        <div
                          key={log.id}
                          className={cn(
                            'p-3 rounded-lg border text-sm',
                            log.level === 'error' && 'border-destructive/30 bg-destructive/5',
                            log.level === 'warning' && 'border-warning/30 bg-warning/5',
                            log.level === 'info' && 'border-border bg-muted/30'
                          )}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-xs',
                                log.level === 'error' && 'bg-destructive/10 text-destructive',
                                log.level === 'warning' && 'bg-warning/10 text-warning',
                                log.level === 'info' && 'bg-muted text-muted-foreground'
                              )}
                            >
                              {log.level.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(log.timestamp, 'MMM d, HH:mm:ss')}
                            </span>
                          </div>
                          <p className="text-sm">{log.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </PageLayout>
  );
}
