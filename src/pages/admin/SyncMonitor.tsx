import { useState } from 'react';
import { PageLayout, MetricCard, MetricGrid } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { 
  Server, CheckCircle, XCircle, Clock, AlertTriangle, 
  RefreshCw, Play, Pause, RotateCcw, Activity, Eye, 
  FileWarning, AlertCircle, Bell, ExternalLink, Download,
  Filter, CalendarIcon, ArrowRight, Loader2, Copy
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
    id: 'run-001', name: 'HRIS Full Sync', connector: 'SAP SuccessFactors', connectorIcon: '🟦',
    org: 'Acme Corp', status: 'success', severity: 'low',
    startedAt: new Date(Date.now() - 1000 * 60 * 15), 
    endedAt: new Date(Date.now() - 1000 * 60 * 11),
    duration: '4m 32s', recordsIn: 12450, recordsOut: 12448, 
    errors: 2, retryCount: 0, errorType: null,
    timeline: [
      { step: 'Extract', status: 'success', startedAt: new Date(Date.now() - 1000 * 60 * 15), duration: '1m 12s' },
      { step: 'Transform', status: 'success', startedAt: new Date(Date.now() - 1000 * 60 * 14), duration: '1m 45s' },
      { step: 'Validate', status: 'success', startedAt: new Date(Date.now() - 1000 * 60 * 12), duration: '0m 35s' },
      { step: 'Load', status: 'success', startedAt: new Date(Date.now() - 1000 * 60 * 11), duration: '1m 00s' },
    ],
  },
  { 
    id: 'run-002', name: 'Payroll Delta Sync', connector: 'Oracle HCM', connectorIcon: '🔶',
    org: 'TechStart Inc', status: 'success', severity: 'low',
    startedAt: new Date(Date.now() - 1000 * 60 * 45), 
    endedAt: new Date(Date.now() - 1000 * 60 * 44),
    duration: '1m 18s', recordsIn: 342, recordsOut: 342, 
    errors: 0, retryCount: 0, errorType: null,
    timeline: [
      { step: 'Extract', status: 'success', startedAt: new Date(Date.now() - 1000 * 60 * 45), duration: '0m 22s' },
      { step: 'Transform', status: 'success', startedAt: new Date(Date.now() - 1000 * 60 * 45), duration: '0m 18s' },
      { step: 'Validate', status: 'success', startedAt: new Date(Date.now() - 1000 * 60 * 44), duration: '0m 15s' },
      { step: 'Load', status: 'success', startedAt: new Date(Date.now() - 1000 * 60 * 44), duration: '0m 23s' },
    ],
  },
  { 
    id: 'run-003', name: 'Benefits Sync', connector: 'Cigna API', connectorIcon: '🎁',
    org: 'GlobalBank', status: 'running', severity: 'low',
    startedAt: new Date(Date.now() - 1000 * 60 * 5), 
    endedAt: null,
    duration: '5m 12s...', recordsIn: 3200, recordsOut: 2890, 
    errors: 0, retryCount: 0, errorType: null,
    timeline: [
      { step: 'Extract', status: 'success', startedAt: new Date(Date.now() - 1000 * 60 * 5), duration: '2m 05s' },
      { step: 'Transform', status: 'success', startedAt: new Date(Date.now() - 1000 * 60 * 3), duration: '1m 42s' },
      { step: 'Validate', status: 'running', startedAt: new Date(Date.now() - 1000 * 60 * 1), duration: '1m 25s...' },
      { step: 'Load', status: 'pending', startedAt: null, duration: '—' },
    ],
  },
  { 
    id: 'run-004', name: 'Finance Sync', connector: 'Workday', connectorIcon: '🔷',
    org: 'RetailMax', status: 'failed', severity: 'critical',
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), 
    endedAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 45000),
    duration: '0m 45s', recordsIn: 0, recordsOut: 0, 
    errors: 1, retryCount: 3, errorType: 'api_rate_limit',
    errorPayload: { code: 'API_RATE_LIMIT', message: 'API rate limit exceeded. Retry after 3600 seconds.', endpoint: '/api/v2/employees' },
    errorList: [
      { code: 'E429', message: 'Rate limit exceeded', entity: 'Employee', sampleRowId: '—', affectedCount: 'All' },
    ],
    timeline: [
      { step: 'Extract', status: 'failed', startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), duration: '0m 45s' },
      { step: 'Transform', status: 'skipped', startedAt: null, duration: '—' },
      { step: 'Validate', status: 'skipped', startedAt: null, duration: '—' },
      { step: 'Load', status: 'skipped', startedAt: null, duration: '—' },
    ],
  },
  { 
    id: 'run-005', name: 'Employee Photos Sync', connector: 'SharePoint', connectorIcon: '📁',
    org: 'Acme Corp', status: 'partial', severity: 'medium',
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 4), 
    endedAt: new Date(Date.now() - 1000 * 60 * 60 * 4 + 728000),
    duration: '12m 08s', recordsIn: 8920, recordsOut: 8650, 
    errors: 270, retryCount: 1, errorType: 'validation_errors',
    errorPayload: { rejectedRecords: 270, rejectRate: '3.02%', sampleErrors: ['Invalid file format: emp_1234.bmp', 'File too large: emp_5678.png (>5MB)'] },
    errorList: [
      { code: 'E101', message: 'Invalid file format', entity: 'Photo', sampleRowId: 'emp_1234', affectedCount: 145 },
      { code: 'E102', message: 'File too large (>5MB)', entity: 'Photo', sampleRowId: 'emp_5678', affectedCount: 89 },
      { code: 'E103', message: 'Missing employee reference', entity: 'Photo', sampleRowId: 'emp_9999', affectedCount: 36 },
    ],
    timeline: [
      { step: 'Extract', status: 'success', startedAt: new Date(Date.now() - 1000 * 60 * 60 * 4), duration: '4m 15s' },
      { step: 'Transform', status: 'success', startedAt: new Date(Date.now() - 1000 * 60 * 60 * 4 + 255000), duration: '3m 22s' },
      { step: 'Validate', status: 'partial', startedAt: new Date(Date.now() - 1000 * 60 * 60 * 4 + 457000), duration: '2m 45s' },
      { step: 'Load', status: 'success', startedAt: new Date(Date.now() - 1000 * 60 * 60 * 4 + 622000), duration: '1m 46s' },
    ],
  },
  { 
    id: 'run-006', name: 'Leave Balance Sync', connector: 'SAP SuccessFactors', connectorIcon: '🟦',
    org: 'TechStart Inc', status: 'pending', severity: 'low',
    startedAt: null, endedAt: null,
    duration: '—', recordsIn: 0, recordsOut: 0, 
    errors: 0, retryCount: 0, errorType: null, scheduled: '2025-01-21 02:00 UTC',
    timeline: [],
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
  const [orgFilter, setOrgFilter] = useState('all');
  const [connectorFilter, setConnectorFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [notes, setNotes] = useState('');
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [alertAcknowledged, setAlertAcknowledged] = useState(false);
  const [alertSnoozed, setAlertSnoozed] = useState(false);

  const filteredRuns = runs.filter(r => {
    let matches = true;
    if (statusFilter !== 'all') matches = matches && r.status === statusFilter;
    if (orgFilter !== 'all') matches = matches && r.org === orgFilter;
    if (connectorFilter !== 'all') matches = matches && r.connector === connectorFilter;
    if (severityFilter !== 'all') matches = matches && r.severity === severityFilter;
    if (quickFilters.includes('failed_after_retries')) matches = matches && r.status === 'failed' && r.retryCount >= 3;
    if (quickFilters.includes('partial_high_rejection')) matches = matches && r.status === 'partial' && r.errors / r.recordsIn > 0.02;
    if (quickFilters.includes('critical_only')) matches = matches && r.severity === 'critical';
    return matches;
  });

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
      r.id === run.id ? { ...r, status: 'running' as const, retryCount: r.retryCount + 1 } : r
    ));

    await createAuditLog({
      action: 'SETTINGS_UPDATE',
      entityType: 'settings',
      entityId: run.id,
      metadata: { setting_type: 'sync_run', action: 'retry', connector: run.connector, org: run.org },
    });

    setTimeout(() => {
      setRuns(prev => prev.map(r => 
        r.id === run.id ? { ...r, status: 'success' as const } : r
      ));
      toast.success(t('Sync completed successfully', 'اكتملت المزامنة بنجاح'));
    }, 3000);
  };

  const handleRerunNow = async (run: typeof SAMPLE_RUNS[0]) => {
    toast.info(t(`Re-running ${run.name}...`, `إعادة تشغيل ${run.name}...`));
    
    await createAuditLog({
      action: 'SETTINGS_UPDATE',
      entityType: 'settings',
      entityId: run.id,
      metadata: { setting_type: 'sync_run', action: 'rerun_now', connector: run.connector },
    });

    setRuns(prev => prev.map(r => 
      r.id === run.id ? { ...r, status: 'running' as const } : r
    ));
  };

  const handleMarkResolved = async (run: typeof SAMPLE_RUNS[0]) => {
    await createAuditLog({
      action: 'SETTINGS_UPDATE',
      entityType: 'settings',
      entityId: run.id,
      metadata: { setting_type: 'sync_run', action: 'mark_resolved', notes, connector: run.connector },
    });

    setRuns(prev => prev.map(r => 
      r.id === run.id ? { ...r, status: 'success' as const, errors: 0, severity: 'low' } : r
    ));
    
    toast.success(t('Marked as resolved', 'تم تحديده كمحلول'));
    setDetailOpen(false);
  };

  const handleCreateIncident = async (run: typeof SAMPLE_RUNS[0]) => {
    await createAuditLog({
      action: 'SETTINGS_UPDATE',
      entityType: 'settings',
      entityId: run.id,
      metadata: { setting_type: 'incident', action: 'incident_created_from_sync', connector: run.connector },
    });

    toast.success(t('Incident created', 'تم إنشاء حادثة'));
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

  const handleDownloadErrors = (run: typeof SAMPLE_RUNS[0]) => {
    const errorData = JSON.stringify(run.errorPayload || {}, null, 2);
    const blob = new Blob([errorData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sync_errors_${run.id}.json`;
    a.click();
    toast.success(t('Error file downloaded', 'تم تنزيل ملف الأخطاء'));
  };

  const handleAcknowledge = () => {
    setAlertAcknowledged(true);
    toast.success(t('Alert acknowledged', 'تم الإقرار بالتنبيه'));
  };

  const handleSnooze = () => {
    setAlertSnoozed(true);
    toast.success(t('Alert snoozed for 24 hours', 'تم تأجيل التنبيه لمدة 24 ساعة'));
  };

  const toggleQuickFilter = (filter: string) => {
    setQuickFilters(prev => 
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  // Alert conditions
  const criticalAlerts = runs.filter(r => r.status === 'failed' && r.retryCount >= 3);
  const partialAlerts = runs.filter(r => r.status === 'partial' && r.errors / r.recordsIn > 0.02);
  const totalAlertCount = criticalAlerts.length + partialAlerts.length;

  const uniqueOrgs = [...new Set(runs.map(r => r.org))];
  const uniqueConnectors = [...new Set(runs.map(r => r.connector))];

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

      {/* Alert Summary */}
      {totalAlertCount > 0 && !alertAcknowledged && !alertSnoozed && (
        <Alert variant="destructive" className="border-destructive/50">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription className={cn("flex items-center justify-between flex-wrap gap-2", isRTL && "flex-row-reverse")}>
            <div>
              <span className="font-medium">{totalAlertCount} {t('sync issue(s) require attention', 'مشكلة مزامنة تتطلب الاهتمام')}</span>
              <span className="text-sm block opacity-80">
                {criticalAlerts.length > 0 && `${criticalAlerts.length} ${t('critical failure(s) after 3 retries', 'فشل حرج بعد 3 محاولات')}`}
                {criticalAlerts.length > 0 && partialAlerts.length > 0 && ' • '}
                {partialAlerts.length > 0 && `${partialAlerts.length} ${t('partial sync(s) with >2% rejection', 'مزامنة جزئية مع >2% رفض')}`}
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleAcknowledge}>
                <CheckCircle className="w-3 h-3 me-1" />
                {t('Acknowledge', 'إقرار')}
              </Button>
              <Button variant="outline" size="sm" onClick={handleSnooze}>
                <Clock className="w-3 h-3 me-1" />
                {t('Snooze 24h', 'تأجيل 24 ساعة')}
              </Button>
              <Link to="/admin/alerts">
                <Button variant="secondary" size="sm">
                  <Bell className="w-3 h-3 me-1" />
                  {t('Open Alerts', 'فتح التنبيهات')}
                </Button>
              </Link>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className={cn("flex flex-wrap gap-3 items-center", isRTL && "flex-row-reverse")}>
            <Select value={orgFilter} onValueChange={setOrgFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t('Organization', 'المنظمة')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('All Organizations', 'جميع المنظمات')}</SelectItem>
                {uniqueOrgs.map(org => (
                  <SelectItem key={org} value={org}>{org}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={connectorFilter} onValueChange={setConnectorFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t('Connector', 'الموصل')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('All Connectors', 'جميع الموصلات')}</SelectItem>
                {uniqueConnectors.map(conn => (
                  <SelectItem key={conn} value={conn}>{conn}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder={t('Status', 'الحالة')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('All Status', 'جميع الحالات')}</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder={t('Severity', 'الخطورة')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('All', 'الكل')}</SelectItem>
                <SelectItem value="critical">{t('Critical', 'حرج')}</SelectItem>
                <SelectItem value="medium">{t('Medium', 'متوسط')}</SelectItem>
                <SelectItem value="low">{t('Low', 'منخفض')}</SelectItem>
              </SelectContent>
            </Select>

            <Separator orientation="vertical" className="h-8" />

            <div className="flex gap-2 flex-wrap">
              <Badge 
                variant={quickFilters.includes('failed_after_retries') ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleQuickFilter('failed_after_retries')}
              >
                Failed after retries
              </Badge>
              <Badge 
                variant={quickFilters.includes('partial_high_rejection') ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleQuickFilter('partial_high_rejection')}
              >
                Partial &gt;2% rejection
              </Badge>
              <Badge 
                variant={quickFilters.includes('critical_only') ? 'destructive' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleQuickFilter('critical_only')}
              >
                Critical only
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sync Runs Table */}
      <Card>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Activity className="w-5 h-5" />
            {t('Recent Sync Runs', 'التشغيلات الأخيرة')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRuns.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Server className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">{t('No sync runs match your filters', 'لا توجد تشغيلات تطابق الفلاتر')}</p>
              <p className="text-sm mt-1">{t('Try adjusting your filter criteria', 'حاول تعديل معايير الفلترة')}</p>
            </div>
          ) : (
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
                  const isCritical = run.severity === 'critical';
                  
                  return (
                    <TableRow 
                      key={run.id} 
                      className={cn(
                        "cursor-pointer hover:bg-muted/50",
                        isCritical && 'bg-destructive/5'
                      )}
                      onClick={() => handleViewDetails(run)}
                    >
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
                        {run.recordsIn > 0 ? `${run.recordsIn.toLocaleString()} → ${run.recordsOut.toLocaleString()}` : '—'}
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
                      <TableCell onClick={e => e.stopPropagation()}>
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
          )}
        </CardContent>
      </Card>

      {/* Run Details Drawer */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <span className="text-xl">{selectedRun?.connectorIcon}</span>
              {selectedRun?.name}
            </SheetTitle>
            <SheetDescription>{selectedRun?.connector} → {selectedRun?.org}</SheetDescription>
          </SheetHeader>

          {selectedRun && (
            <ScrollArea className="h-[calc(100vh-160px)] mt-4">
              <div className="space-y-4 pr-4">
                {/* Timeline Steps */}
                {selectedRun.timeline && selectedRun.timeline.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{t('Pipeline Timeline', 'جدول المراحل')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedRun.timeline.map((step, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-sm",
                              step.status === 'success' && 'bg-success/10 text-success',
                              step.status === 'failed' && 'bg-destructive/10 text-destructive',
                              step.status === 'running' && 'bg-blue-500/10 text-blue-600',
                              step.status === 'partial' && 'bg-warning/10 text-warning',
                              step.status === 'pending' && 'bg-muted text-muted-foreground',
                              step.status === 'skipped' && 'bg-muted text-muted-foreground opacity-50'
                            )}>
                              {step.status === 'success' && <CheckCircle className="w-4 h-4" />}
                              {step.status === 'failed' && <XCircle className="w-4 h-4" />}
                              {step.status === 'running' && <Loader2 className="w-4 h-4 animate-spin" />}
                              {step.status === 'partial' && <AlertTriangle className="w-4 h-4" />}
                              {step.status === 'pending' && <Clock className="w-4 h-4" />}
                              {step.status === 'skipped' && '—'}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{step.step}</p>
                              <p className="text-xs text-muted-foreground">
                                {step.startedAt ? format(step.startedAt, 'HH:mm:ss') : '—'} • {step.duration}
                              </p>
                            </div>
                            <Badge variant="outline" className={cn(
                              "text-xs",
                              step.status === 'success' && 'bg-success/10 text-success',
                              step.status === 'failed' && 'bg-destructive/10 text-destructive',
                              step.status === 'running' && 'bg-blue-500/10 text-blue-600',
                              step.status === 'partial' && 'bg-warning/10 text-warning'
                            )}>
                              {step.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Metrics Summary */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{t('Metrics', 'المقاييس')}</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">{t('Records In', 'السجلات الداخلة')}</p>
                      <p className="font-semibold text-lg">{selectedRun.recordsIn.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t('Records Out', 'السجلات الخارجة')}</p>
                      <p className="font-semibold text-lg">{selectedRun.recordsOut.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t('Rejected', 'مرفوضة')}</p>
                      <p className="font-semibold text-lg text-destructive">{selectedRun.errors}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t('Rejection Rate', 'معدل الرفض')}</p>
                      <p className="font-semibold text-lg">
                        {selectedRun.recordsIn > 0 ? ((selectedRun.errors / selectedRun.recordsIn) * 100).toFixed(2) : 0}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t('Duration', 'المدة')}</p>
                      <p className="font-mono">{selectedRun.duration}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t('Retry Count', 'عدد المحاولات')}</p>
                      <p className="font-semibold">{selectedRun.retryCount}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Error List */}
                {selectedRun.errorList && selectedRun.errorList.length > 0 && (
                  <Card className="border-destructive/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-destructive flex items-center gap-2">
                        <FileWarning className="w-4 h-4" />
                        {t('Error Details', 'تفاصيل الأخطاء')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {selectedRun.errorList.map((error, idx) => (
                        <div key={idx} className="p-3 rounded bg-muted/50 text-sm space-y-1">
                          <div className="flex items-center justify-between">
                            <Badge variant="destructive" className="font-mono text-xs">{error.code}</Badge>
                            <span className="text-xs text-muted-foreground">{error.affectedCount} affected</span>
                          </div>
                          <p className="font-medium">{error.message}</p>
                          <p className="text-xs text-muted-foreground">
                            Entity: {error.entity} • Sample: <code className="bg-muted px-1 rounded">{error.sampleRowId}</code>
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Error Payload */}
                {selectedRun.errorPayload && (
                  <Card className="border-destructive/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-destructive flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {t('Error Payload', 'حمولة الخطأ')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                        {JSON.stringify(selectedRun.errorPayload, null, 2)}
                      </pre>
                      <Button variant="outline" size="sm" className="mt-2" onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(selectedRun.errorPayload, null, 2));
                        toast.success(t('Copied to clipboard', 'تم النسخ'));
                      }}>
                        <Copy className="w-3 h-3 me-2" />
                        {t('Copy', 'نسخ')}
                      </Button>
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
                  {(selectedRun.status === 'failed' || selectedRun.status === 'partial') && (
                    <>
                      <Button className="w-full" onClick={() => handleRetry(selectedRun)}>
                        <RotateCcw className="w-4 h-4 me-2" />
                        {t('Retry Sync', 'إعادة المزامنة')}
                      </Button>
                      <Button className="w-full" variant="outline" onClick={() => handleRerunNow(selectedRun)}>
                        <Play className="w-4 h-4 me-2" />
                        {t('Re-run Now', 'تشغيل الآن')}
                      </Button>
                      <Button className="w-full" variant="outline" onClick={() => handleDownloadErrors(selectedRun)}>
                        <Download className="w-4 h-4 me-2" />
                        {t('Download Error File', 'تنزيل ملف الأخطاء')}
                      </Button>
                    </>
                  )}
                  <Button className="w-full" variant="outline" onClick={() => handleMarkResolved(selectedRun)}>
                    <CheckCircle className="w-4 h-4 me-2" />
                    {t('Mark Resolved', 'تحديد كمحلول')}
                  </Button>
                  <Button className="w-full" variant="outline" onClick={() => handleCreateIncident(selectedRun)}>
                    <AlertCircle className="w-4 h-4 me-2" />
                    {t('Create Incident', 'إنشاء حادثة')}
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
