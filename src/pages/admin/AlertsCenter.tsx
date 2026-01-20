import { useState } from 'react';
import { PageLayout, MetricCard, MetricGrid } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { 
  Bell, AlertTriangle, AlertCircle, CheckCircle, XCircle, Clock,
  Server, TrendingUp, Shield, Users, Eye, MessageSquare, UserPlus
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const SEVERITY_CONFIG = {
  critical: { label: 'Critical', labelAr: 'حرج', color: 'bg-destructive text-destructive-foreground', icon: XCircle, borderColor: 'border-destructive' },
  high: { label: 'High', labelAr: 'عالي', color: 'bg-warning text-warning-foreground', icon: AlertTriangle, borderColor: 'border-warning' },
  medium: { label: 'Medium', labelAr: 'متوسط', color: 'bg-blue-500 text-white', icon: AlertCircle, borderColor: 'border-blue-500' },
  low: { label: 'Low', labelAr: 'منخفض', color: 'bg-muted text-muted-foreground', icon: Bell, borderColor: 'border-muted' },
};

const STATUS_CONFIG = {
  open: { label: 'Open', labelAr: 'مفتوح', color: 'bg-destructive/10 text-destructive border-destructive/30' },
  investigating: { label: 'Investigating', labelAr: 'قيد التحقيق', color: 'bg-warning/10 text-warning border-warning/30' },
  resolved: { label: 'Resolved', labelAr: 'محلول', color: 'bg-success/10 text-success border-success/30' },
  dismissed: { label: 'Dismissed', labelAr: 'مرفوض', color: 'bg-muted text-muted-foreground border-border' },
};

const SAMPLE_ALERTS = [
  { id: '1', type: 'sync_failure', severity: 'critical', status: 'open', title: 'HRIS Sync Failed - Acme Corp', description: 'SAP SuccessFactors sync failed after 3 retries. API rate limit exceeded.', created_at: new Date(Date.now() - 1000 * 60 * 15), assigned_to: null, org: 'Acme Corp' },
  { id: '2', type: 'spike', severity: 'high', status: 'investigating', title: 'Abnormal Claims Spike Detected', description: 'Medical claims volume 340% higher than daily average. Review recommended.', created_at: new Date(Date.now() - 1000 * 60 * 45), assigned_to: 'JD', org: 'TechStart Inc' },
  { id: '3', type: 'security', severity: 'critical', status: 'open', title: 'Multiple Failed Login Attempts', description: '15 failed login attempts from IP 192.168.1.100 in the last hour.', created_at: new Date(Date.now() - 1000 * 60 * 60), assigned_to: null, org: 'System' },
  { id: '4', type: 'data_quality', severity: 'medium', status: 'open', title: 'Missing Grade Data - 45 Records', description: 'New employee imports missing grade classification. Affects benefit eligibility.', created_at: new Date(Date.now() - 1000 * 60 * 60 * 3), assigned_to: 'SM', org: 'GlobalBank' },
  { id: '5', type: 'sync_failure', severity: 'high', status: 'resolved', title: 'Payroll Sync Recovered', description: 'Oracle HCM sync restored after temporary API outage.', created_at: new Date(Date.now() - 1000 * 60 * 60 * 6), assigned_to: 'JD', org: 'RetailMax' },
];

const ALERT_TYPES = {
  sync_failure: { label: 'Sync Failure', icon: Server },
  spike: { label: 'Abnormal Spike', icon: TrendingUp },
  security: { label: 'Security', icon: Shield },
  data_quality: { label: 'Data Quality', icon: AlertCircle },
};

const TEAM_MEMBERS = [
  { initials: 'JD', name: 'John Doe' },
  { initials: 'SM', name: 'Sarah Miller' },
  { initials: 'AK', name: 'Ahmed Khan' },
];

export default function AdminAlertsCenter() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const [alerts, setAlerts] = useState(SAMPLE_ALERTS);
  const [selectedAlert, setSelectedAlert] = useState<typeof SAMPLE_ALERTS[0] | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [notes, setNotes] = useState('');

  const filteredAlerts = alerts.filter(a => {
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || a.severity === severityFilter;
    return matchesStatus && matchesSeverity;
  });

  const openAlerts = alerts.filter(a => a.status === 'open' || a.status === 'investigating');
  const criticalCount = alerts.filter(a => a.severity === 'critical' && a.status === 'open').length;

  const metrics = [
    { title: t('Open Alerts', 'التنبيهات المفتوحة'), value: openAlerts.length, icon: Bell },
    { title: t('Critical', 'حرجة'), value: criticalCount, icon: XCircle },
    { title: t('Investigating', 'قيد التحقيق'), value: alerts.filter(a => a.status === 'investigating').length, icon: Eye },
    { title: t('Resolved Today', 'تم حلها اليوم'), value: alerts.filter(a => a.status === 'resolved').length, icon: CheckCircle },
  ];

  const handleAssign = (alertId: string, assignee: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, assigned_to: assignee, status: 'investigating' } : a
    ));
    toast.success(t('Alert assigned', 'تم تعيين التنبيه'));
  };

  const handleUpdateStatus = (alertId: string, newStatus: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, status: newStatus } : a
    ));
    toast.success(t('Status updated', 'تم تحديث الحالة'));
    if (newStatus === 'resolved' || newStatus === 'dismissed') {
      setSelectedAlert(null);
    }
  };

  return (
    <PageLayout
      title={t('Alerts Center', 'مركز التنبيهات')}
      description={t('Monitor sync failures, abnormal spikes, and security incidents', 'مراقبة فشل المزامنة والارتفاعات غير الطبيعية وحوادث الأمان')}
      icon={Bell}
      iconClassName="from-rose-500 to-red-500"
    >
      <MetricGrid columns={4}>
        {metrics.map((m) => (
          <MetricCard key={m.title} title={m.title} value={m.value} icon={m.icon} />
        ))}
      </MetricGrid>

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
                <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
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
              <div className="space-y-3">
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
                            <div className={cn("p-2 rounded-lg", severityConfig.color.replace('text-', 'text-').replace('bg-', 'bg-'))}>
                              <severityConfig.icon className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="font-medium">{alert.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                              <div className={cn("flex items-center gap-2 mt-2 text-xs text-muted-foreground", isRTL && "flex-row-reverse")}>
                                <typeConfig.icon className="w-3 h-3" />
                                <span>{typeConfig.label}</span>
                                <span>•</span>
                                <span>{alert.org}</span>
                                <span>•</span>
                                <span>{formatDistanceToNow(alert.created_at, { addSuffix: true })}</span>
                              </div>
                            </div>
                          </div>
                          <div className={cn("flex items-center gap-2 shrink-0", isRTL && "flex-row-reverse")}>
                            {alert.assigned_to && (
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="text-[10px]">{alert.assigned_to}</AvatarFallback>
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
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('Assign To', 'تعيين إلى')}</label>
                    <Select 
                      value={selectedAlert.assigned_to || ''} 
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
