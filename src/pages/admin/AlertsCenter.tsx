import { useState } from 'react';
import { PageLayout, MetricCard, MetricGrid } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Bell, AlertTriangle, AlertCircle, CheckCircle, XCircle, Clock,
  Server, TrendingUp, Shield, Users, Eye, MessageSquare, UserPlus,
  Database, FileWarning, ExternalLink
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';
import { useAdminAuditLog } from '@/hooks/useAdminAuditLog';
import { Link } from 'react-router-dom';

const SEVERITY_CONFIG = {
  critical: { label: 'Critical', labelAr: 'حرج', color: 'bg-destructive text-destructive-foreground', icon: XCircle, borderColor: 'border-l-destructive' },
  high: { label: 'High', labelAr: 'عالي', color: 'bg-warning text-warning-foreground', icon: AlertTriangle, borderColor: 'border-l-warning' },
  medium: { label: 'Medium', labelAr: 'متوسط', color: 'bg-primary text-primary-foreground', icon: AlertCircle, borderColor: 'border-l-primary' },
  low: { label: 'Low', labelAr: 'منخفض', color: 'bg-muted text-muted-foreground', icon: Bell, borderColor: 'border-l-muted-foreground' },
};

const STATUS_CONFIG = {
  open: { label: 'Open', labelAr: 'مفتوح', color: 'bg-destructive/10 text-destructive border-destructive/30' },
  investigating: { label: 'Investigating', labelAr: 'قيد التحقيق', color: 'bg-warning/10 text-warning border-warning/30' },
  resolved: { label: 'Resolved', labelAr: 'محلول', color: 'bg-success/10 text-success border-success/30' },
  dismissed: { label: 'Dismissed', labelAr: 'مرفوض', color: 'bg-muted text-muted-foreground border-border' },
};

const ALERT_TYPES = {
  sync_failure: { label: 'Sync Failure', labelAr: 'فشل المزامنة', icon: Server, link: '/admin/sync-monitor' },
  data_quality: { label: 'Data Quality', labelAr: 'جودة البيانات', icon: Database, link: '/admin/data-quality-rules' },
  security: { label: 'Security', labelAr: 'الأمان', icon: Shield, link: '/admin/security' },
  moderation_sla: { label: 'Moderation SLA', labelAr: 'مراجعة SLA', icon: Clock, link: '/admin/moderation' },
  spike: { label: 'Abnormal Spike', labelAr: 'ارتفاع غير طبيعي', icon: TrendingUp, link: '/admin/dashboard' },
  vendor_kyb: { label: 'Vendor KYB', labelAr: 'بائع KYB', icon: FileWarning, link: '/admin/vendors' },
};

const SAMPLE_ALERTS = [
  { 
    id: '1', type: 'sync_failure', severity: 'critical', status: 'open', 
    title: 'HRIS Sync Failed - RetailMax', 
    description: 'Workday sync failed after 3 retries. API rate limit exceeded.', 
    createdAt: new Date(Date.now() - 1000 * 60 * 15), 
    assignedTo: null, 
    org: 'RetailMax',
    sourceId: 'sync_run_4',
    autoResolved: false
  },
  { 
    id: '2', type: 'spike', severity: 'high', status: 'investigating', 
    title: 'Abnormal Claims Spike Detected', 
    description: 'Medical claims volume 340% higher than daily average. Review recommended.', 
    createdAt: new Date(Date.now() - 1000 * 60 * 45), 
    assignedTo: 'JD', 
    org: 'TechStart Inc',
    sourceId: null,
    autoResolved: false
  },
  { 
    id: '3', type: 'security', severity: 'critical', status: 'open', 
    title: 'Multiple Failed Login Attempts', 
    description: '15 failed login attempts from IP 192.168.1.100 in the last hour. Account lockout triggered.', 
    createdAt: new Date(Date.now() - 1000 * 60 * 60), 
    assignedTo: null, 
    org: 'System',
    sourceId: 'ip_192.168.1.100',
    autoResolved: false
  },
  { 
    id: '4', type: 'data_quality', severity: 'medium', status: 'open', 
    title: 'Missing Grade Data - 45 Records', 
    description: 'New employee imports missing grade classification. Affects benefit eligibility.', 
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3), 
    assignedTo: 'SM', 
    org: 'GlobalBank',
    sourceId: 'rule_1',
    autoResolved: false
  },
  { 
    id: '5', type: 'sync_failure', severity: 'high', status: 'resolved', 
    title: 'Payroll Sync Recovered', 
    description: 'Oracle HCM sync restored after temporary API outage.', 
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6), 
    assignedTo: 'JD', 
    org: 'Acme Corp',
    sourceId: 'sync_run_2',
    autoResolved: true
  },
  { 
    id: '6', type: 'moderation_sla', severity: 'high', status: 'open', 
    title: 'SLA Breach - 3 Items Overdue', 
    description: '3 high-priority moderation items have exceeded 24h SLA. Immediate review required.', 
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), 
    assignedTo: null, 
    org: 'Platform',
    sourceId: null,
    autoResolved: false
  },
  { 
    id: '7', type: 'vendor_kyb', severity: 'medium', status: 'open', 
    title: 'Repeated KYB Rejections - TravelWise', 
    description: 'Vendor has 3 consecutive KYB document rejections. Manual review recommended.', 
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8), 
    assignedTo: null, 
    org: 'Marketplace',
    sourceId: 'vendor_789',
    autoResolved: false
  },
  { 
    id: '8', type: 'data_quality', severity: 'low', status: 'dismissed', 
    title: 'Optional Field Missing - 12 Records', 
    description: 'Employee nationality field missing for 12 records. Non-critical.', 
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), 
    assignedTo: 'AK', 
    org: 'TechStart Inc',
    sourceId: 'rule_7',
    autoResolved: false
  },
];

const TEAM_MEMBERS = [
  { initials: 'JD', name: 'John Doe' },
  { initials: 'SM', name: 'Sarah Miller' },
  { initials: 'AK', name: 'Ahmed Khan' },
];

export default function AdminAlertsCenter() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;
  const { createAuditLog } = useAdminAuditLog();

  const [alerts, setAlerts] = useState(SAMPLE_ALERTS);
  const [selectedAlert, setSelectedAlert] = useState<typeof SAMPLE_ALERTS[0] | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [notes, setNotes] = useState('');

  const filteredAlerts = alerts.filter(a => {
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || a.severity === severityFilter;
    const matchesType = typeFilter === 'all' || a.type === typeFilter;
    return matchesStatus && matchesSeverity && matchesType;
  });

  const openAlerts = alerts.filter(a => a.status === 'open' || a.status === 'investigating');
  const criticalCount = alerts.filter(a => a.severity === 'critical' && a.status === 'open').length;

  const metrics = [
    { title: t('Open Alerts', 'التنبيهات المفتوحة'), value: openAlerts.length, icon: Bell },
    { title: t('Critical', 'حرجة'), value: criticalCount, icon: XCircle },
    { title: t('Investigating', 'قيد التحقيق'), value: alerts.filter(a => a.status === 'investigating').length, icon: Eye },
    { title: t('Resolved Today', 'تم حلها اليوم'), value: alerts.filter(a => a.status === 'resolved').length, icon: CheckCircle },
  ];

  const handleAssign = async (alertId: string, assignee: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, assignedTo: assignee, status: 'investigating' } : a
    ));
    
    await createAuditLog({
      action: 'SETTINGS_UPDATE',
      entityType: 'settings',
      entityId: alertId,
      metadata: { setting_type: 'alert', action: 'alert_assigned', assignee },
    });
    
    toast.success(t('Alert assigned', 'تم تعيين التنبيه'));
  };

  const handleUpdateStatus = async (alertId: string, newStatus: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, status: newStatus } : a
    ));
    
    await createAuditLog({
      action: 'SETTINGS_UPDATE',
      entityType: 'settings',
      entityId: alertId,
      metadata: { setting_type: 'alert', action: 'alert_status_updated', new_status: newStatus, notes },
    });
    
    toast.success(t('Status updated', 'تم تحديث الحالة'));
    if (newStatus === 'resolved' || newStatus === 'dismissed') {
      setSelectedAlert(null);
      setNotes('');
    }
  };

  // Group alerts by type for summary
  const alertsByType = Object.entries(ALERT_TYPES).map(([type, config]) => ({
    type,
    ...config,
    count: alerts.filter(a => a.type === type && (a.status === 'open' || a.status === 'investigating')).length,
  }));

  return (
    <PageLayout
      title={t('Alerts Center', 'مركز التنبيهات')}
      description={t('Monitor sync failures, data quality issues, security incidents, and SLA breaches', 'مراقبة فشل المزامنة ومشاكل جودة البيانات وحوادث الأمان')}
      icon={Bell}
      iconClassName="from-rose-500 to-red-500"
    >
      <MetricGrid columns={4}>
        {metrics.map((m) => (
          <MetricCard key={m.title} title={m.title} value={m.value} icon={m.icon} />
        ))}
      </MetricGrid>

      {/* Alert Type Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {alertsByType.map(({ type, label, icon: Icon, count, link }) => (
          <Link key={type} to={link}>
            <Card className={cn("cursor-pointer transition-all hover:border-primary/50", count > 0 && 'border-warning/50')}>
              <CardContent className="p-4 text-center">
                <Icon className={cn("w-6 h-6 mx-auto mb-2", count > 0 ? 'text-warning' : 'text-muted-foreground')} />
                <p className="text-sm font-medium">{label}</p>
                <p className={cn("text-2xl font-bold", count > 0 ? 'text-warning' : 'text-muted-foreground')}>{count}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4", isRTL && "md:flex-row-reverse")}>
                <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <Bell className="w-5 h-5" />
                  {t('Active Alerts', 'التنبيهات النشطة')}
                </CardTitle>
                <div className={cn("flex items-center gap-2 flex-wrap", isRTL && "flex-row-reverse")}>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder={t('Type', 'النوع')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('All Types', 'جميع الأنواع')}</SelectItem>
                      {Object.entries(ALERT_TYPES).map(([key, config]) => (
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
                      {Object.entries(SEVERITY_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder={t('Status', 'الحالة')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('All', 'الكل')}</SelectItem>
                      {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3 pr-4">
                  {filteredAlerts.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <CheckCircle className="w-12 h-12 mx-auto mb-3 text-success" />
                      <p className="font-medium">{t('All clear!', 'كل شيء على ما يرام!')}</p>
                      <p className="text-sm">{t('No alerts matching filters', 'لا توجد تنبيهات مطابقة للفلاتر')}</p>
                    </div>
                  ) : (
                    filteredAlerts.map((alert) => {
                      const severityConfig = SEVERITY_CONFIG[alert.severity as keyof typeof SEVERITY_CONFIG];
                      const statusConfig = STATUS_CONFIG[alert.status as keyof typeof STATUS_CONFIG];
                      const typeConfig = ALERT_TYPES[alert.type as keyof typeof ALERT_TYPES];
                      const isSelected = selectedAlert?.id === alert.id;

                      return (
                        <div
                          key={alert.id}
                          onClick={() => setSelectedAlert(alert)}
                          className={cn(
                            "p-4 rounded-lg border-l-4 cursor-pointer transition-all bg-card",
                            severityConfig.borderColor,
                            isSelected ? "ring-2 ring-primary" : "hover:bg-muted/50"
                          )}
                        >
                          <div className={cn("flex items-start justify-between gap-3", isRTL && "flex-row-reverse")}>
                            <div className={cn("flex items-start gap-3", isRTL && "flex-row-reverse")}>
                              <div className={cn("p-2 rounded-lg", severityConfig.color)}>
                                <severityConfig.icon className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="font-medium">{alert.title}</h4>
                                <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                                <div className={cn("flex items-center gap-2 mt-2 text-xs text-muted-foreground flex-wrap", isRTL && "flex-row-reverse")}>
                                  <typeConfig.icon className="w-3 h-3" />
                                  <span>{typeConfig.label}</span>
                                  <span>•</span>
                                  <span>{alert.org}</span>
                                  <span>•</span>
                                  <span>{formatDistanceToNow(alert.createdAt, { addSuffix: true })}</span>
                                  {alert.autoResolved && (
                                    <>
                                      <span>•</span>
                                      <Badge variant="outline" className="text-[10px] bg-success/10 text-success">Auto-resolved</Badge>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className={cn("flex items-center gap-2 shrink-0", isRTL && "flex-row-reverse")}>
                              {alert.assignedTo && (
                                <Avatar className="w-6 h-6">
                                  <AvatarFallback className="text-[10px]">{alert.assignedTo}</AvatarFallback>
                                </Avatar>
                              )}
                              <Badge variant="outline" className={statusConfig.color}>
                                {isRTL ? statusConfig.labelAr : statusConfig.label}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Alert Details Panel */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <Eye className="w-5 h-5" />
                {t('Alert Details', 'تفاصيل التنبيه')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedAlert ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <h4 className="font-semibold">{selectedAlert.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{selectedAlert.description}</p>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      <Badge variant="outline">{ALERT_TYPES[selectedAlert.type as keyof typeof ALERT_TYPES]?.label}</Badge>
                      <Badge variant="outline">{selectedAlert.org}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {format(selectedAlert.createdAt, 'MMM d, yyyy HH:mm')}
                    </p>
                  </div>

                  {selectedAlert.sourceId && (
                    <Link to={ALERT_TYPES[selectedAlert.type as keyof typeof ALERT_TYPES]?.link || '#'}>
                      <Button variant="outline" className="w-full">
                        <ExternalLink className="w-4 h-4 me-2" />
                        {t('View Source', 'عرض المصدر')}
                      </Button>
                    </Link>
                  )}

                  <Separator />

                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('Assign To', 'تعيين إلى')}</label>
                    <Select 
                      value={selectedAlert.assignedTo || ''} 
                      onValueChange={(v) => handleAssign(selectedAlert.id, v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('Select team member', 'اختر عضو الفريق')} />
                      </SelectTrigger>
                      <SelectContent>
                        {TEAM_MEMBERS.map(m => (
                          <SelectItem key={m.initials} value={m.initials}>
                            <span className="flex items-center gap-2">
                              <Avatar className="w-5 h-5">
                                <AvatarFallback className="text-[10px]">{m.initials}</AvatarFallback>
                              </Avatar>
                              {m.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('Update Status', 'تحديث الحالة')}</label>
                    <Select 
                      value={selectedAlert.status} 
                      onValueChange={(v) => handleUpdateStatus(selectedAlert.id, v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                          <SelectItem key={key} value={key}>{config.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('Notes', 'ملاحظات')}</label>
                    <Textarea
                      placeholder={t('Add investigation notes...', 'أضف ملاحظات التحقيق...')}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      className="flex-1" 
                      variant="outline"
                      onClick={() => handleUpdateStatus(selectedAlert.id, 'dismissed')}
                    >
                      {t('Dismiss', 'رفض')}
                    </Button>
                    <Button 
                      className="flex-1"
                      onClick={() => handleUpdateStatus(selectedAlert.id, 'resolved')}
                    >
                      <CheckCircle className="w-4 h-4 me-2" />
                      {t('Resolve', 'حل')}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">{t('Select an alert to view details', 'اختر تنبيهاً لعرض التفاصيل')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
