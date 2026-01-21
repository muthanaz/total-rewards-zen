import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PageLayout, MetricCard, MetricGrid } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  Server, CheckCircle, XCircle, Clock, AlertTriangle, 
  RefreshCw, Play, Pause, RotateCcw, Activity
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { useAdminAuditLog } from '@/hooks/useAdminAuditLog';

const STATUS_CONFIG = {
  success: { label: 'Success', labelAr: 'نجاح', color: 'bg-success/10 text-success border-success/30', icon: CheckCircle },
  running: { label: 'Running', labelAr: 'قيد التشغيل', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30', icon: RefreshCw },
  failed: { label: 'Failed', labelAr: 'فشل', color: 'bg-destructive/10 text-destructive border-destructive/30', icon: XCircle },
  pending: { label: 'Pending', labelAr: 'معلق', color: 'bg-warning/10 text-warning border-warning/30', icon: Clock },
};

const SAMPLE_JOBS = [
  { id: '1', name: 'HRIS Full Sync', connector: 'SAP SuccessFactors', status: 'success', started_at: new Date(Date.now() - 1000 * 60 * 15), duration: '4m 32s', records: 12450, errors: 0 },
  { id: '2', name: 'Payroll Delta Sync', connector: 'Oracle HCM', status: 'success', started_at: new Date(Date.now() - 1000 * 60 * 45), duration: '1m 18s', records: 342, errors: 0 },
  { id: '3', name: 'Benefits Sync', connector: 'Cigna', status: 'running', started_at: new Date(Date.now() - 1000 * 60 * 5), duration: '5m 12s...', records: 3200, errors: 0 },
  { id: '4', name: 'Finance Sync', connector: 'Workday', status: 'failed', started_at: new Date(Date.now() - 1000 * 60 * 60 * 2), duration: '0m 45s', records: 0, errors: 1, error_message: 'API rate limit exceeded' },
  { id: '5', name: 'Employee Photos Sync', connector: 'SharePoint', status: 'success', started_at: new Date(Date.now() - 1000 * 60 * 60 * 4), duration: '12m 08s', records: 8920, errors: 3 },
  { id: '6', name: 'Leave Balance Sync', connector: 'SAP SuccessFactors', status: 'pending', started_at: null, duration: '—', records: 0, errors: 0 },
];

export default function AdminSyncMonitor() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;
  const queryClient = useQueryClient();
  const { createAuditLog } = useAdminAuditLog();

  const [jobs, setJobs] = useState(SAMPLE_JOBS);

  // Fetch real integration runs
  const { data: integrationRuns, isLoading, refetch } = useQuery({
    queryKey: ['sync-monitor-runs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integration_runs')
        .select('*')
        .order('last_sync_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  // P1 FIX: Mutation to update integration run status
  const updateRunStatusMutation = useMutation({
    mutationFn: async ({ runId, status, action }: { runId: string; status: string; action: string }) => {
      // Check if this is a real DB run or sample data
      const isRealRun = integrationRuns?.some(r => r.id === runId);
      
      if (isRealRun) {
        const { error } = await supabase
          .from('integration_runs')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', runId);
        if (error) throw error;
      }
      
      return { runId, status, action };
    },
    onSuccess: async ({ runId, status, action }) => {
      // Update local state for sample jobs
      setJobs(prev => prev.map(j => 
        j.id === runId ? { ...j, status } : j
      ));
      
      // Invalidate real data
      queryClient.invalidateQueries({ queryKey: ['sync-monitor-runs'] });
      
      // Write audit log
      await createAuditLog({
        action: 'SETTINGS_UPDATE',
        entityType: 'settings',
        entityId: runId,
        metadata: {
          setting_type: 'integration_run',
          action_performed: action,
          new_status: status,
        },
      });
    },
  });

  const metrics = [
    { title: t('Total Jobs', 'إجمالي المهام'), value: jobs.length, icon: Server },
    { title: t('Successful', 'ناجح'), value: jobs.filter(j => j.status === 'success').length, icon: CheckCircle },
    { title: t('Running', 'قيد التشغيل'), value: jobs.filter(j => j.status === 'running').length, icon: Activity },
    { title: t('Failed', 'فشل'), value: jobs.filter(j => j.status === 'failed').length, icon: AlertTriangle },
  ];

  const handleRetry = async (job: typeof SAMPLE_JOBS[0]) => {
    toast.info(t(`Retrying ${job.name}...`, `إعادة محاولة ${job.name}...`));
    await updateRunStatusMutation.mutateAsync({ 
      runId: job.id, 
      status: 'pending', 
      action: 'retry' 
    });
    toast.success(t(`${job.name} queued for retry`, `تمت جدولة ${job.name} لإعادة المحاولة`));
  };

  const handleCancel = async (job: typeof SAMPLE_JOBS[0]) => {
    await updateRunStatusMutation.mutateAsync({ 
      runId: job.id, 
      status: 'failed', 
      action: 'cancel' 
    });
    toast.warning(t(`Cancelled ${job.name}`, `تم إلغاء ${job.name}`));
  };

  const handleRunNow = async (job: typeof SAMPLE_JOBS[0]) => {
    toast.info(t(`Starting ${job.name}...`, `بدء ${job.name}...`));
    await updateRunStatusMutation.mutateAsync({ 
      runId: job.id, 
      status: 'running', 
      action: 'run_now' 
    });
  };

  return (
    <PageLayout
      title={t('Sync Monitor', 'مراقبة المزامنة')}
      description={t('Monitor data synchronization jobs and troubleshoot failures', 'مراقبة مهام مزامنة البيانات واستكشاف الأخطاء')}
      icon={Server}
      iconClassName="from-indigo-500 to-violet-500"
      actions={
        <Button variant="outline">
          <RefreshCw className="w-4 h-4 me-2" />
          {t('Refresh', 'تحديث')}
        </Button>
      }
    >
      <MetricGrid columns={4}>
        {metrics.map((m) => (
          <MetricCard key={m.title} title={m.title} value={m.value} icon={m.icon} />
        ))}
      </MetricGrid>

      <Card>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Activity className="w-5 h-5" />
            {t('Recent Jobs', 'المهام الأخيرة')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('Job Name', 'اسم المهمة')}</TableHead>
                  <TableHead>{t('Connector', 'الموصل')}</TableHead>
                  <TableHead>{t('Status', 'الحالة')}</TableHead>
                  <TableHead>{t('Started', 'بدأت')}</TableHead>
                  <TableHead>{t('Duration', 'المدة')}</TableHead>
                  <TableHead>{t('Records', 'السجلات')}</TableHead>
                  <TableHead>{t('Errors', 'الأخطاء')}</TableHead>
                  <TableHead>{t('Actions', 'الإجراءات')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => {
                  const statusConfig = STATUS_CONFIG[job.status as keyof typeof STATUS_CONFIG];
                  return (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">{job.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{job.connector}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusConfig.color}>
                          <statusConfig.icon className={cn("w-3 h-3 me-1", job.status === 'running' && 'animate-spin')} />
                          {isRTL ? statusConfig.labelAr : statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {job.started_at 
                          ? formatDistanceToNow(job.started_at, { addSuffix: true })
                          : '—'}
                      </TableCell>
                      <TableCell>{job.duration}</TableCell>
                      <TableCell>{job.records.toLocaleString()}</TableCell>
                      <TableCell>
                        {job.errors > 0 ? (
                          <Badge variant="destructive">{job.errors}</Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {job.status === 'failed' && (
                            <Button variant="ghost" size="icon" onClick={() => handleRetry(job)} title={t('Retry', 'إعادة المحاولة')}>
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          )}
                          {job.status === 'running' && (
                            <Button variant="ghost" size="icon" onClick={() => handleCancel(job)} title={t('Cancel', 'إلغاء')}>
                              <Pause className="w-4 h-4" />
                            </Button>
                          )}
                          {job.status === 'pending' && (
                            <Button variant="ghost" size="icon" onClick={() => handleRunNow(job)} title={t('Run Now', 'تشغيل الآن')}>
                              <Play className="w-4 h-4" />
                            </Button>
                          )}
                          {job.status === 'success' && (
                            <Button variant="ghost" size="icon" onClick={() => handleRetry(job)} title={t('Re-run', 'إعادة التشغيل')}>
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {/* Error Details for Failed Jobs */}
          {jobs.filter(j => j.status === 'failed').length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium mb-3 text-destructive">{t('Error Details', 'تفاصيل الأخطاء')}</h4>
              <div className="space-y-2">
                {jobs.filter(j => j.status === 'failed').map(job => (
                  <div key={job.id} className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                    <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                      <span className="font-medium">{job.name}</span>
                      <Button variant="outline" size="sm" onClick={() => handleRetry(job)}>
                        <RotateCcw className="w-3 h-3 me-1" />
                        {t('Retry', 'إعادة')}
                      </Button>
                    </div>
                    <p className="text-sm text-destructive mt-1">{job.error_message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
}
