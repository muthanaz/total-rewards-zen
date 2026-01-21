/**
 * Sync Monitor Hook
 * 
 * Manages sync jobs for data sources with run, status updates, and issue resolution.
 */

import { useState, useMemo, useCallback } from 'react';

export type SyncStatus = 'success' | 'running' | 'failed' | 'pending' | 'stale';

export interface SyncJob {
  id: string;
  name: string;
  dataSource: string;
  integrationId: string;
  status: SyncStatus;
  lastSync: Date | null;
  nextSync: Date | null;
  duration: string;
  recordsProcessed: number;
  recordsFailed: number;
  errorMessage?: string;
  relatedIssueId?: string;
}

export interface SyncLogEntry {
  id: string;
  jobId: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error';
  message: string;
}

// Seed sync jobs
const SEED_JOBS: SyncJob[] = [
  {
    id: 'sync-hris',
    name: 'HRIS Full Sync',
    dataSource: 'SAP SuccessFactors',
    integrationId: 'int-hris',
    status: 'success',
    lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
    nextSync: new Date(Date.now() + 4 * 60 * 60 * 1000),
    duration: '4m 32s',
    recordsProcessed: 12847,
    recordsFailed: 0,
  },
  {
    id: 'sync-payroll',
    name: 'Payroll Delta Sync',
    dataSource: 'Oracle HCM',
    integrationId: 'int-payroll',
    status: 'success',
    lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000),
    nextSync: new Date(Date.now() + 2 * 60 * 60 * 1000),
    duration: '1m 18s',
    recordsProcessed: 342,
    recordsFailed: 0,
  },
  {
    id: 'sync-benefits',
    name: 'Benefits Platform Sync',
    dataSource: 'Cigna',
    integrationId: 'int-benefits',
    status: 'stale',
    lastSync: new Date(Date.now() - 72 * 60 * 60 * 1000),
    nextSync: new Date(Date.now() - 48 * 60 * 60 * 1000),
    duration: '2m 45s',
    recordsProcessed: 11200,
    recordsFailed: 12,
    errorMessage: 'Sync scheduled but not completed - connection timeout',
  },
  {
    id: 'sync-claims',
    name: 'Claims System Sync',
    dataSource: 'Claims Provider',
    integrationId: 'int-claims',
    status: 'stale',
    lastSync: new Date(Date.now() - 72 * 60 * 60 * 1000),
    nextSync: null,
    duration: '5m 12s',
    recordsProcessed: 45200,
    recordsFailed: 0,
    errorMessage: 'Connection intermittent - 3 days stale',
    relatedIssueId: 'issue-004',
  },
  {
    id: 'sync-exit-survey',
    name: 'Exit Survey Import',
    dataSource: 'Exit Survey System',
    integrationId: 'int-exit-survey',
    status: 'pending',
    lastSync: null,
    nextSync: null,
    duration: '—',
    recordsProcessed: 0,
    recordsFailed: 0,
    relatedIssueId: 'issue-001',
  },
  {
    id: 'sync-engagement',
    name: 'Engagement Survey Import',
    dataSource: 'Engagement Platform',
    integrationId: 'int-engagement',
    status: 'pending',
    lastSync: null,
    nextSync: null,
    duration: '—',
    recordsProcessed: 0,
    recordsFailed: 0,
    relatedIssueId: 'issue-003',
  },
];

// Seed logs
const SEED_LOGS: SyncLogEntry[] = [
  { id: 'log-1', jobId: 'sync-hris', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), level: 'info', message: 'Sync completed successfully. 12,847 records processed.' },
  { id: 'log-2', jobId: 'sync-hris', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 - 4 * 60 * 1000), level: 'info', message: 'Starting full sync...' },
  { id: 'log-3', jobId: 'sync-payroll', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), level: 'info', message: 'Delta sync completed. 342 records updated.' },
  { id: 'log-4', jobId: 'sync-claims', timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000), level: 'error', message: 'Connection timeout after 30 seconds. Will retry.' },
  { id: 'log-5', jobId: 'sync-claims', timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000 + 60 * 1000), level: 'error', message: 'Retry 1 failed: API returned 503 Service Unavailable' },
  { id: 'log-6', jobId: 'sync-claims', timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000 + 120 * 1000), level: 'error', message: 'Retry 2 failed: Connection reset by peer' },
  { id: 'log-7', jobId: 'sync-benefits', timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000), level: 'warning', message: 'Partial sync completed with 12 failed records.' },
  { id: 'log-8', jobId: 'sync-benefits', timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000 - 2 * 60 * 1000), level: 'info', message: 'Starting scheduled sync...' },
];

export function useSyncMonitor() {
  const [jobs, setJobs] = useState<SyncJob[]>(SEED_JOBS);
  const [logs, setLogs] = useState<SyncLogEntry[]>(SEED_LOGS);
  const [syncingJobId, setSyncingJobId] = useState<string | null>(null);
  const [highlightedJobId, setHighlightedJobId] = useState<string | null>(null);

  // Stats
  const stats = useMemo(() => ({
    total: jobs.length,
    success: jobs.filter(j => j.status === 'success').length,
    running: jobs.filter(j => j.status === 'running').length,
    failed: jobs.filter(j => j.status === 'failed').length,
    stale: jobs.filter(j => j.status === 'stale').length,
    pending: jobs.filter(j => j.status === 'pending').length,
  }), [jobs]);

  // Get job by ID
  const getJob = useCallback((id: string) => {
    return jobs.find(j => j.id === id);
  }, [jobs]);

  // Get job by issue ID
  const getJobByIssueId = useCallback((issueId: string) => {
    return jobs.find(j => j.relatedIssueId === issueId);
  }, [jobs]);

  // Get logs for a job
  const getLogsForJob = useCallback((jobId: string) => {
    return logs.filter(l => l.jobId === jobId).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [logs]);

  // Run sync now
  const runSync = useCallback(async (jobId: string): Promise<{ success: boolean; recordsProcessed: number }> => {
    setSyncingJobId(jobId);
    
    // Update to running status
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        return { ...j, status: 'running' as SyncStatus };
      }
      return j;
    }));
    
    // Add log entry
    const startLog: SyncLogEntry = {
      id: `log-${Date.now()}`,
      jobId,
      timestamp: new Date(),
      level: 'info',
      message: 'Manual sync triggered...',
    };
    setLogs(prev => [startLog, ...prev]);
    
    // Simulate sync
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const recordsProcessed = Math.floor(Math.random() * 5000) + 1000;
    
    // Update to success
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        return {
          ...j,
          status: 'success' as SyncStatus,
          lastSync: new Date(),
          nextSync: new Date(Date.now() + 6 * 60 * 60 * 1000),
          duration: `${Math.floor(Math.random() * 5) + 1}m ${Math.floor(Math.random() * 59)}s`,
          recordsProcessed,
          recordsFailed: 0,
          errorMessage: undefined,
        };
      }
      return j;
    }));
    
    // Add completion log
    const completeLog: SyncLogEntry = {
      id: `log-${Date.now() + 1}`,
      jobId,
      timestamp: new Date(),
      level: 'info',
      message: `Sync completed successfully. ${recordsProcessed.toLocaleString()} records processed.`,
    };
    setLogs(prev => [completeLog, ...prev]);
    
    setSyncingJobId(null);
    return { success: true, recordsProcessed };
  }, []);

  // Run sync and resolve linked issue
  const runSyncAndResolve = useCallback(async (
    jobId: string,
    resolveIssueFn?: (issueId: string, type: string, note: string) => void
  ): Promise<{ success: boolean; issueResolved: boolean }> => {
    const result = await runSync(jobId);
    
    const job = jobs.find(j => j.id === jobId);
    
    if (result.success && job?.relatedIssueId && resolveIssueFn) {
      resolveIssueFn(
        job.relatedIssueId,
        'data_source',
        `Sync job "${job.name}" completed successfully. ${result.recordsProcessed.toLocaleString()} records synced. Data is now fresh.`
      );
      return { success: true, issueResolved: true };
    }
    
    return { success: result.success, issueResolved: false };
  }, [jobs, runSync]);

  // Highlight a job (for deep linking)
  const highlightJob = useCallback((jobId: string) => {
    setHighlightedJobId(jobId);
    setTimeout(() => setHighlightedJobId(null), 3000);
  }, []);

  return {
    jobs,
    logs,
    stats,
    syncingJobId,
    highlightedJobId,
    getJob,
    getJobByIssueId,
    getLogsForJob,
    runSync,
    runSyncAndResolve,
    highlightJob,
  };
}
