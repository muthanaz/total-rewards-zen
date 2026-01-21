import { useState } from 'react';
import { PageLayout, MetricCard, MetricGrid } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Server, CheckCircle, XCircle, Clock, AlertTriangle, 
  RefreshCw, Play, Pause, RotateCcw, Activity, Eye, 
  FileWarning, AlertCircle, Bell, ExternalLink
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { useAdminAuditLog } from '@/hooks/useAdminAuditLog';
import { Link } from 'react-router-dom';

const STATUS_CONFIG = {
  success: { label: 'Success', labelAr: 'نجاح', color: 'bg-success/10 text-success border-success/30', icon: CheckCircle },
  running: { label: 'Running', labelAr: 'قيد التشغيل', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30', icon: RefreshCw },
  failed: { label: 'Failed', labelAr: 'فشل', color: 'bg-destructive/10 text-destructive border-destructive/30', icon: XCircle },
  partial: { label: 'Partial', labelAr: 'جزئي', color: 'bg-warning/10 text-warning border-warning/30', icon: AlertTriangle },
  pending: { label: 'Pending', labelAr: 'معلق', color: 'bg-muted text-muted-foreground border-border', icon: Clock },
};

const SAMPLE_RUNS = [
  { 
    id: '1', name: 'HRIS Full Sync', connector: 'SAP SuccessFactors', connectorIcon: '🟦',
    org: 'Acme Corp', status: 'success', 
    startedAt: new Date(Date.now() - 1000 * 60 * 15), 
    endedAt: new Date(Date.now() - 1000 * 60 * 11),
    duration: '4m 32s', recordsIn: 12450, recordsOut: 12448, 
    errors: 2, retryCount: 0, errorType: null
  },
  { 
    id: '2', name: 'Payroll Delta Sync', connector: 'Oracle HCM', connectorIcon: '🔶',
    org: 'TechStart Inc', status: 'success', 
    startedAt: new Date(Date.now() - 1000 * 60 * 45), 
    endedAt: new Date(Date.now() - 1000 * 60 * 44),
    duration: '1m 18s', recordsIn: 342, recordsOut: 342, 
    errors: 0, retryCount: 0, errorType: null
  },
  { 
    id: '3', name: 'Benefits Sync', connector: 'Cigna API', connectorIcon: '🎁',
    org: 'GlobalBank', status: 'running', 
    startedAt: new Date(Date.now() - 1000 * 60 * 5), 
    endedAt: null,
    duration: '5m 12s...', recordsIn: 3200, recordsOut: 2890, 
    errors: 0, retryCount: 0, errorType: null
  },
  { 
    id: '4', name: 'Finance Sync', connector: 'Workday', connectorIcon: '🔷',
    org: 'RetailMax', status: 'failed', 
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), 
    endedAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 45000),
    duration: '0m 45s', recordsIn: 0, recordsOut: 0, 
    errors: 1, retryCount: 3, errorType: 'api_rate_limit',
    errorPayload: { code: 429, message: 'API rate limit exceeded. Retry after 3600 seconds.', endpoint: '/api/v2/employees' }
  },
  { 
    id: '5', name: 'Employee Photos Sync', connector: 'SharePoint', connectorIcon: '📁',
    org: 'Acme Corp', status: 'partial', 
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 4), 
    endedAt: new Date(Date.now() - 1000 * 60 * 60 * 4 + 728000),
    duration: '12m 08s', recordsIn: 8920, recordsOut: 8650, 
    errors: 270, retryCount: 1, errorType: 'validation_errors',
    errorPayload: { rejectedRecords: 270, rejectRate: '3.02%', sampleErrors: ['Invalid file format: emp_1234.bmp', 'File too large: emp_5678.png (>5MB)'] }
  },
  { 
    id: '6', name: 'Leave Balance Sync', connector: 'SAP SuccessFactors', connectorIcon: '🟦',
    org: 'TechStart Inc', status: 'pending', 
    startedAt: null, endedAt: null,
    duration: '—', recordsIn: 0, recordsOut: 0, 
    errors: 0, retryCount: 0, errorType: null, scheduled: '2025-01-21 02:00 UTC'
  },
];

const SAMPLE_FAILED_RECORDS = [
  { id: 'emp_1234', field: 'grade', error: 'Invalid grade code: X99', source: 'row 1234' },
  { id: 'emp_5678', field: 'salary', error: 'Negative salary value', source: 'row 5678' },
  { id: 'emp_9012', field: 'join_date', error: 'Date in future: 2026-05-01', source: 'row 9012' },
];

export default function AdminSyncMonitor() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;
  const { createAuditLog } = useAdminAuditLog();

  const [runs, setRuns] = useState(SAMPLE_RUNS);
  const [selectedRun, setSelectedRun] = useState<typeof SAMPLE_RUNS[0] | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [notes, setNotes] = useState('');

  const filteredRuns = runs.filter(r => statusFilter === 'all' || r.status === statusFilter);

  const todayRuns = runs.filter(r => r.startedAt && r.startedAt.toDateString() === new Date().toDateString()).length;
  const failedRuns = runs.filter(r => r.status === 'failed').length;
  const avgDuration = '3m 42s';
  const totalRecords = runs.reduce((acc, r) => acc + r.recordsOut, 0);

  const metrics = [
    { title: t('Runs Today', 'التشغيلات اليوم'), value: todayRuns, icon: Activity },
    { title: t('Failed Runs', 'التشغيلات الفاشلة'), value: failedRuns, icon: XCircle },
    { title: t('Avg Duration', 'متوسط المدة'), value: avgDuration, icon: Clock },
    { title: t('Records Processed', 'السجلات المعالجة'), value: `${(totalRecords / 1000).toFixed(1)}k`, icon: Server },
  ];

  const handleViewDetails = (run: typeof SAMPLE_RUNS[0]) => {
    setSelectedRun(run);
    setDetailOpen(true);
  };

  const handleRetry = async (run: typeof SAMPLE_RUNS[0]) => {
    toast.info(t(`Retrying ${run.name}...`, `إعادة محاولة ${run.name}...`));
    
    setRuns(prev => prev.map(r => 
      r.id === run.id ? { ...r, status: 'pending' as const, retryCount: r.retryCount + 1 } : r
    ));

    await createAuditLog({
      action: 'SETTINGS_UPDATE',
      entityType: 'settings',
      entityId: run.id,
      metadata: { setting_type: 'sync_run', action: 'retry', connector: run.connector, org: run.org },
    });

    // Simulate retry
    setTimeout(() => {
      setRuns(prev => prev.map(r => 
        r.id === run.id ? { ...r, status: 'running' as const } : r
      ));
    }, 1000);
  };

  const handleMarkResolved = async (run: typeof SAMPLE_RUNS[0]) => {
    await createAuditLog({
      action: 'SETTINGS_UPDATE',
      entityType: 'settings',
      entityId: run.id,
      metadata: { setting_type: 'sync_run', action: 'mark_resolved', notes, connector: run.connector },
    });

    setRuns(prev => prev.map(r => 
      r.id === run.id ? { ...r, status: 'success' as const, errors: 0 } : r
    ));
    
    toast.success(t('Marked as resolved', 'تم تحديده كمحلول'));
    setDetailOpen(false);
  };

  const handleCreateAlert = async (run: typeof SAMPLE_RUNS[0]) => {
    await createAuditLog({
      action: 'SETTINGS_UPDATE',
      entityType: 'settings',
      entityId: run.id,
      metadata: { setting_type: 'alert', action: 'alert_created_from_sync', connector: run.connector },
    });

    toast.success(t('Alert created in Alerts Center', 'تم إنشاء تنبيه في مركز التنبيهات'));
  };

  // Alert conditions
  const criticalAlerts = runs.filter(r => r.status === 'failed' && r.retryCount >= 3);
  const partialAlerts = runs.filter(r => r.status === 'partial' && r.errors / r.recordsIn > 0.02);

  return (
    <PageLayout
      title={t('Sync Monitor', 'مراقبة المزامنة')}
      description={t('Monitor data synchronization jobs and troubleshoot failures', 'مراقبة مهام مزامنة البيانات واستكشاف الأخطاء')}
      icon={Server}
      iconClassName="from-indigo-500 to-violet-500"
      actions={
        <Button variant="outline" onClick={() => setRuns([...runs])}>
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

      {/* Alert Banner */}
      {(criticalAlerts.length > 0 || partialAlerts.length > 0) && (
        <Alert variant="destructive" className="border-destructive/50">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
            <span>
              {criticalAlerts.length > 0 && `${criticalAlerts.length} ${t('critical failure(s) after 3 retries', 'فشل حرج بعد 3 محاولات')}`}
              {criticalAlerts.length > 0 && partialAlerts.length > 0 && ' • '}
              {partialAlerts.length > 0 && `${partialAlerts.length} ${t('partial sync(s) with >2% rejection', 'مزامنة جزئية مع >2% رفض')}`}
            </span>
            <Link to="/admin/alerts">
              <Button variant="outline" size="sm">
                <Bell className="w-3 h-3 me-1" />
                {t('View Alerts', 'عرض التنبيهات')}
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Sync Runs Table */}
      <Card>
        <CardHeader>
          <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4", isRTL && "md:flex-row-reverse")}>
            <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Activity className="w-5 h-5" />
              {t('Recent Sync Runs', 'التشغيلات الأخيرة')}
            </CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('All Status', 'جميع الحالات')}</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('Connector', 'الموصل')}</TableHead>
                <TableHead>{t('Organization', 'المنظمة')}</TableHead>
                <TableHead>{t('Status', 'الحالة')}</TableHead>
                <TableHead>{t('Started', 'بدأت')}</TableHead>
                <TableHead>{t('Duration', 'المدة')}</TableHead>
                <TableHead>{t('Records In/Out', 'السجلات')}</TableHead>
                <TableHead>{t('Errors', 'الأخطاء')}</TableHead>
                <TableHead>{t('Retries', 'المحاولات')}</TableHead>
                <TableHead>{t('Actions', 'الإجراءات')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRuns.map((run) => {
                const statusConfig = STATUS_CONFIG[run.status as keyof typeof STATUS_CONFIG];
                const isCritical = run.status === 'failed' && run.retryCount >= 3;
                
                return (
                  <TableRow key={run.id} className={isCritical ? 'bg-destructive/5' : ''}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{run.connectorIcon}</span>
                        <div>
                          <p className="font-medium text-sm">{run.name}</p>
                          <p className="text-xs text-muted-foreground">{run.connector}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{run.org}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusConfig.color}>
                        <statusConfig.icon className={cn("w-3 h-3 me-1", run.status === 'running' && 'animate-spin')} />
                        {isRTL ? statusConfig.labelAr : statusConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {run.startedAt 
                        ? formatDistanceToNow(run.startedAt, { addSuffix: true })
                        : run.scheduled || '—'}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{run.duration}</TableCell>
                    <TableCell className="text-sm">
                      {run.recordsIn > 0 ? `${run.recordsIn.toLocaleString()} / ${run.recordsOut.toLocaleString()}` : '—'}
                    </TableCell>
                    <TableCell>
                      {run.errors > 0 ? (
                        <Badge variant="destructive">{run.errors}</Badge>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {run.retryCount > 0 ? (
                        <Badge variant={run.retryCount >= 3 ? 'destructive' : 'secondary'}>{run.retryCount}</Badge>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleViewDetails(run)} title={t('View Details', 'عرض التفاصيل')}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        {(run.status === 'failed' || run.status === 'partial') && (
                          <Button variant="ghost" size="icon" onClick={() => handleRetry(run)} title={t('Retry', 'إعادة')}>
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                        )}
                        {run.status === 'running' && (
                          <Button variant="ghost" size="icon" title={t('Cancel', 'إلغاء')}>
                            <Pause className="w-4 h-4" />
                          </Button>
                        )}
                        {run.status === 'pending' && (
                          <Button variant="ghost" size="icon" title={t('Run Now', 'تشغيل الآن')}>
                            <Play className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Run Details Drawer */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <span className="text-xl">{selectedRun?.connectorIcon}</span>
              {selectedRun?.name}
            </SheetTitle>
            <SheetDescription>{selectedRun?.connector} → {selectedRun?.org}</SheetDescription>
          </SheetHeader>

          {selectedRun && (
            <ScrollArea className="h-[calc(100vh-200px)] mt-4">
              <div className="space-y-4 pr-4">
                {/* Run Summary */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{t('Run Summary', 'ملخص التشغيل')}</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">{t('Status', 'الحالة')}</p>
                      <Badge variant="outline" className={STATUS_CONFIG[selectedRun.status as keyof typeof STATUS_CONFIG]?.color}>
                        {selectedRun.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t('Duration', 'المدة')}</p>
                      <p className="font-mono">{selectedRun.duration}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t('Records In', 'السجلات الداخلة')}</p>
                      <p className="font-semibold">{selectedRun.recordsIn.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t('Records Out', 'السجلات الخارجة')}</p>
                      <p className="font-semibold">{selectedRun.recordsOut.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t('Errors', 'الأخطاء')}</p>
                      <p className="font-semibold text-destructive">{selectedRun.errors}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t('Retry Count', 'عدد المحاولات')}</p>
                      <p className="font-semibold">{selectedRun.retryCount}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Error Payload */}
                {selectedRun.errorPayload && (
                  <Card className="border-destructive/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-destructive flex items-center gap-2">
                        <FileWarning className="w-4 h-4" />
                        {t('Error Details', 'تفاصيل الخطأ')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                        {JSON.stringify(selectedRun.errorPayload, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                )}

                {/* Sample Failed Records */}
                {(selectedRun.status === 'failed' || selectedRun.status === 'partial') && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{t('Sample Failed Records (masked)', 'سجلات فاشلة نموذجية')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {SAMPLE_FAILED_RECORDS.map((record, idx) => (
                          <div key={idx} className="p-2 rounded bg-muted/50 text-xs">
                            <p className="font-mono">{record.id} • {record.source}</p>
                            <p className="text-destructive">{record.field}: {record.error}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Separator />

                {/* Notes */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('Resolution Notes', 'ملاحظات الحل')}</label>
                  <Textarea
                    placeholder={t('Add notes about the issue or resolution...', 'أضف ملاحظات حول المشكلة أو الحل...')}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Button className="w-full" variant="outline" onClick={() => handleRetry(selectedRun)}>
                    <RotateCcw className="w-4 h-4 me-2" />
                    {t('Retry Sync', 'إعادة المزامنة')}
                  </Button>
                  <Button className="w-full" variant="outline" onClick={() => handleMarkResolved(selectedRun)}>
                    <CheckCircle className="w-4 h-4 me-2" />
                    {t('Mark Resolved', 'تحديد كمحلول')}
                  </Button>
                  <Button className="w-full" variant="outline" onClick={() => handleCreateAlert(selectedRun)}>
                    <Bell className="w-4 h-4 me-2" />
                    {t('Create Alert', 'إنشاء تنبيه')}
                  </Button>
                  <Link to="/admin/alerts" className="block">
                    <Button className="w-full" variant="secondary">
                      <ExternalLink className="w-4 h-4 me-2" />
                      {t('Open Alerts Center', 'فتح مركز التنبيهات')}
                    </Button>
                  </Link>
                </div>
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>
    </PageLayout>
  );
}
