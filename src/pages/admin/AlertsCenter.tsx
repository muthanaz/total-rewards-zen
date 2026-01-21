import { useState } from 'react';
import { PageLayout, MetricCard, MetricGrid } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { 
  Bell, AlertTriangle, AlertCircle, CheckCircle, XCircle, Clock,
  Server, TrendingUp, Shield, Users, Eye, UserPlus,
  Database, FileWarning, ExternalLink, Timer, Pause, Check,
  RefreshCw, ChevronRight, Lightbulb, Link2, Activity, 
  CalendarIcon, MoreHorizontal, ListTodo, Copy, Hash
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';
import { useAdminAuditLog } from '@/hooks/useAdminAuditLog';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const SEVERITY_CONFIG = {
  critical: { label: 'Critical', labelAr: 'حرج', color: 'bg-destructive text-destructive-foreground', textColor: 'text-destructive', icon: XCircle, borderColor: 'border-l-destructive' },
  high: { label: 'High', labelAr: 'عالي', color: 'bg-warning text-warning-foreground', textColor: 'text-warning', icon: AlertTriangle, borderColor: 'border-l-warning' },
  medium: { label: 'Medium', labelAr: 'متوسط', color: 'bg-primary text-primary-foreground', textColor: 'text-primary', icon: AlertCircle, borderColor: 'border-l-primary' },
  low: { label: 'Low', labelAr: 'منخفض', color: 'bg-muted text-muted-foreground', textColor: 'text-muted-foreground', icon: Bell, borderColor: 'border-l-muted-foreground' },
};

const STATUS_CONFIG = {
  open: { label: 'Open', labelAr: 'مفتوح', color: 'bg-destructive/10 text-destructive border-destructive/30' },
  investigating: { label: 'Investigating', labelAr: 'قيد التحقيق', color: 'bg-warning/10 text-warning border-warning/30' },
  snoozed: { label: 'Snoozed', labelAr: 'مؤجل', color: 'bg-muted text-muted-foreground border-border' },
  resolved: { label: 'Resolved', labelAr: 'محلول', color: 'bg-success/10 text-success border-success/30' },
};

const ALERT_TYPES = {
  sync_failure: { label: 'Sync Failure', labelAr: 'فشل المزامنة', icon: Server, link: '/admin/sync-monitor', linkLabel: 'View Sync Monitor' },
  data_quality: { label: 'Data Quality', labelAr: 'جودة البيانات', icon: Database, link: '/admin/data-quality-rules', linkLabel: 'View Data Quality Rules' },
  security: { label: 'Security', labelAr: 'الأمان', icon: Shield, link: '/admin/security', linkLabel: 'View Security Logs' },
  moderation_sla: { label: 'Moderation SLA', labelAr: 'مراجعة SLA', icon: Clock, link: '/admin/moderation', linkLabel: 'View Moderation Queue' },
  spike: { label: 'Abnormal Spike', labelAr: 'ارتفاع غير طبيعي', icon: TrendingUp, link: '/admin/dashboard', linkLabel: 'View Dashboard' },
  vendor_kyb: { label: 'Vendor KYB', labelAr: 'بائع KYB', icon: FileWarning, link: '/admin/vendors', linkLabel: 'View Vendor Details' },
};

const RECOMMENDED_ACTIONS: Record<string, Array<{ action: string; icon: typeof RefreshCw }>> = {
  sync_failure: [
    { action: 'Retry sync run', icon: RefreshCw },
    { action: 'Check API rate limits', icon: Timer },
    { action: 'Reduce batch size', icon: ListTodo },
    { action: 'Contact vendor support', icon: Users },
  ],
  data_quality: [
    { action: 'Review impacted records', icon: Eye },
    { action: 'Update field mappings', icon: Link2 },
    { action: 'Contact data owner', icon: Users },
    { action: 'Create remediation task', icon: ListTodo },
  ],
  security: [
    { action: 'Review login attempts', icon: Eye },
    { action: 'Check IP whitelist', icon: Shield },
    { action: 'Reset user credentials', icon: RefreshCw },
    { action: 'Enable MFA for account', icon: Shield },
  ],
  moderation_sla: [
    { action: 'Review pending items', icon: Eye },
    { action: 'Reassign to available reviewer', icon: UserPlus },
    { action: 'Escalate to senior moderator', icon: AlertTriangle },
  ],
  spike: [
    { action: 'Investigate claim patterns', icon: Eye },
    { action: 'Check for fraud indicators', icon: Shield },
    { action: 'Review submission sources', icon: Database },
  ],
  vendor_kyb: [
    { action: 'Review vendor documents', icon: Eye },
    { action: 'Request updated documents', icon: RefreshCw },
    { action: 'Contact vendor directly', icon: Users },
    { action: 'Suspend vendor pending review', icon: Pause },
  ],
};

interface AlertActivity {
  id: string;
  action: string;
  actor: string;
  timestamp: Date;
  details?: string;
}

interface Alert {
  id: string;
  type: string;
  severity: string;
  status: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  assignedTo: string | null;
  org: string;
  connector?: string;
  sourceId: string | null;
  autoResolved: boolean;
  impactRecords?: number;
  impactUsers?: number;
  impactVendors?: number;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  activity: AlertActivity[];
  snoozedUntil?: Date;
}

const SAMPLE_ALERTS: Alert[] = [
  { 
    id: 'ALT-001', type: 'sync_failure', severity: 'critical', status: 'open', 
    title: 'HRIS Sync Failed - RetailMax', 
    description: 'Workday sync failed after 3 retries. API rate limit exceeded.', 
    createdAt: new Date(Date.now() - 1000 * 60 * 15),
    updatedAt: new Date(Date.now() - 1000 * 60 * 15),
    assignedTo: null, 
    org: 'RetailMax',
    connector: 'Workday',
    sourceId: 'sync_run_4',
    autoResolved: false,
    impactRecords: 1247,
    riskLevel: 'critical',
    activity: [
      { id: '1', action: 'Alert created', actor: 'System', timestamp: new Date(Date.now() - 1000 * 60 * 15) },
    ]
  },
  { 
    id: 'ALT-002', type: 'spike', severity: 'high', status: 'investigating', 
    title: 'Abnormal Claims Spike Detected', 
    description: 'Medical claims volume 340% higher than daily average. Review recommended.', 
    createdAt: new Date(Date.now() - 1000 * 60 * 45),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30),
    assignedTo: 'JD', 
    org: 'TechStart Inc',
    sourceId: null,
    autoResolved: false,
    impactRecords: 89,
    impactUsers: 45,
    riskLevel: 'high',
    activity: [
      { id: '1', action: 'Alert created', actor: 'System', timestamp: new Date(Date.now() - 1000 * 60 * 45) },
      { id: '2', action: 'Assigned to John Doe', actor: 'System', timestamp: new Date(Date.now() - 1000 * 60 * 40) },
      { id: '3', action: 'Status changed to Investigating', actor: 'John Doe', timestamp: new Date(Date.now() - 1000 * 60 * 30) },
    ]
  },
  { 
    id: 'ALT-003', type: 'security', severity: 'critical', status: 'open', 
    title: 'Multiple Failed Login Attempts', 
    description: '15 failed login attempts from IP 192.168.1.100 in the last hour. Account lockout triggered.', 
    createdAt: new Date(Date.now() - 1000 * 60 * 60),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60),
    assignedTo: null, 
    org: 'System',
    sourceId: 'ip_192.168.1.100',
    autoResolved: false,
    impactUsers: 1,
    riskLevel: 'critical',
    activity: [
      { id: '1', action: 'Alert created', actor: 'System', timestamp: new Date(Date.now() - 1000 * 60 * 60) },
      { id: '2', action: 'Account locked automatically', actor: 'System', timestamp: new Date(Date.now() - 1000 * 60 * 60) },
    ]
  },
  { 
    id: 'ALT-004', type: 'data_quality', severity: 'medium', status: 'open', 
    title: 'Missing Grade Data - 45 Records', 
    description: 'New employee imports missing grade classification. Affects benefit eligibility.', 
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    assignedTo: 'SM', 
    org: 'GlobalBank',
    connector: 'SAP SuccessFactors',
    sourceId: 'rule_1',
    autoResolved: false,
    impactRecords: 45,
    impactUsers: 45,
    riskLevel: 'medium',
    activity: [
      { id: '1', action: 'Alert created', actor: 'System', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3) },
      { id: '2', action: 'Assigned to Sarah Miller', actor: 'Ahmed Khan', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) },
    ]
  },
  { 
    id: 'ALT-005', type: 'sync_failure', severity: 'high', status: 'resolved', 
    title: 'Payroll Sync Recovered', 
    description: 'Oracle HCM sync restored after temporary API outage.', 
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
    assignedTo: 'JD', 
    org: 'Acme Corp',
    connector: 'Oracle HCM',
    sourceId: 'sync_run_2',
    autoResolved: true,
    impactRecords: 0,
    riskLevel: 'low',
    activity: [
      { id: '1', action: 'Alert created', actor: 'System', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6) },
      { id: '2', action: 'Auto-resolved after successful retry', actor: 'System', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5) },
    ]
  },
  { 
    id: 'ALT-006', type: 'moderation_sla', severity: 'high', status: 'open', 
    title: 'SLA Breach - 3 Items Overdue', 
    description: '3 high-priority moderation items have exceeded 24h SLA. Immediate review required.', 
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    assignedTo: null, 
    org: 'Platform',
    sourceId: null,
    autoResolved: false,
    impactRecords: 3,
    riskLevel: 'high',
    activity: [
      { id: '1', action: 'Alert created', actor: 'System', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) },
    ]
  },
  { 
    id: 'ALT-007', type: 'vendor_kyb', severity: 'medium', status: 'open', 
    title: 'Repeated KYB Rejections - TravelWise', 
    description: 'Vendor has 3 consecutive KYB document rejections. Manual review recommended.', 
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
    assignedTo: null, 
    org: 'Marketplace',
    sourceId: 'vendor_789',
    autoResolved: false,
    impactVendors: 1,
    riskLevel: 'medium',
    activity: [
      { id: '1', action: 'Alert created', actor: 'System', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8) },
    ]
  },
  { 
    id: 'ALT-008', type: 'data_quality', severity: 'low', status: 'snoozed', 
    title: 'Optional Field Missing - 12 Records', 
    description: 'Employee nationality field missing for 12 records. Non-critical.', 
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 20),
    assignedTo: 'AK', 
    org: 'TechStart Inc',
    connector: 'BambooHR',
    sourceId: 'rule_7',
    autoResolved: false,
    impactRecords: 12,
    riskLevel: 'low',
    snoozedUntil: new Date(Date.now() + 1000 * 60 * 60 * 24),
    activity: [
      { id: '1', action: 'Alert created', actor: 'System', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) },
      { id: '2', action: 'Assigned to Ahmed Khan', actor: 'Sarah Miller', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 22) },
      { id: '3', action: 'Snoozed for 24 hours', actor: 'Ahmed Khan', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20), details: 'Will address after data migration' },
    ]
  },
];

const TEAM_MEMBERS = [
  { initials: 'JD', name: 'John Doe' },
  { initials: 'SM', name: 'Sarah Miller' },
  { initials: 'AK', name: 'Ahmed Khan' },
];

const ORGS = ['All Organizations', 'RetailMax', 'TechStart Inc', 'GlobalBank', 'Acme Corp'];

export default function AdminAlertsCenter() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;
  const { createAuditLog } = useAdminAuditLog();

  const [alerts, setAlerts] = useState<Alert[]>(SAMPLE_ALERTS);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [orgFilter, setOrgFilter] = useState('all');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [resolutionNote, setResolutionNote] = useState('');

  const filteredAlerts = alerts.filter(a => {
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || a.severity === severityFilter;
    const matchesType = typeFilter === 'all' || a.type === typeFilter;
    const matchesOrg = orgFilter === 'all' || a.org === orgFilter;
    return matchesStatus && matchesSeverity && matchesType && matchesOrg;
  });

  const openAlerts = alerts.filter(a => a.status === 'open' || a.status === 'investigating');
  const criticalCount = alerts.filter(a => a.severity === 'critical' && a.status === 'open').length;
  const snoozedCount = alerts.filter(a => a.status === 'snoozed').length;

  const metrics = [
    { title: t('Open Alerts', 'التنبيهات المفتوحة'), value: openAlerts.length, icon: Bell },
    { title: t('Critical', 'حرجة'), value: criticalCount, icon: XCircle },
    { title: t('Investigating', 'قيد التحقيق'), value: alerts.filter(a => a.status === 'investigating').length, icon: Eye },
    { title: t('Resolved Today', 'تم حلها اليوم'), value: alerts.filter(a => a.status === 'resolved').length, icon: CheckCircle },
  ];

  const addActivity = (alertId: string, action: string, actor: string, details?: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId 
        ? { 
            ...a, 
            activity: [...a.activity, { 
              id: String(a.activity.length + 1), 
              action, 
              actor, 
              timestamp: new Date(),
              details 
            }],
            updatedAt: new Date()
          } 
        : a
    ));
  };

  const handleAcknowledge = async (alert: Alert) => {
    setAlerts(prev => prev.map(a => 
      a.id === alert.id ? { ...a, status: 'investigating' } : a
    ));
    addActivity(alert.id, 'Acknowledged', 'Current User');
    
    await createAuditLog({
      action: 'SETTINGS_UPDATE',
      entityType: 'settings',
      entityId: alert.id,
      metadata: { setting_type: 'alert', action: 'alert_acknowledged' },
    });
    
    toast.success(t('Alert acknowledged', 'تم الإقرار بالتنبيه'));
    if (selectedAlert?.id === alert.id) {
      setSelectedAlert({ ...alert, status: 'investigating' });
    }
  };

  const handleSnooze = async (alert: Alert, hours: number) => {
    const snoozedUntil = new Date(Date.now() + hours * 60 * 60 * 1000);
    setAlerts(prev => prev.map(a => 
      a.id === alert.id ? { ...a, status: 'snoozed', snoozedUntil } : a
    ));
    addActivity(alert.id, `Snoozed for ${hours} hours`, 'Current User');
    
    await createAuditLog({
      action: 'SETTINGS_UPDATE',
      entityType: 'settings',
      entityId: alert.id,
      metadata: { setting_type: 'alert', action: 'alert_snoozed', hours },
    });
    
    toast.success(t(`Snoozed for ${hours}h`, `تم التأجيل لمدة ${hours} ساعة`));
    if (selectedAlert?.id === alert.id) {
      setSelectedAlert({ ...alert, status: 'snoozed', snoozedUntil });
    }
  };

  const handleResolve = async (alert: Alert, note: string) => {
    if (!note.trim()) {
      toast.error(t('Resolution note required', 'ملاحظة الحل مطلوبة'));
      return;
    }
    setAlerts(prev => prev.map(a => 
      a.id === alert.id ? { ...a, status: 'resolved' } : a
    ));
    addActivity(alert.id, 'Resolved', 'Current User', note);
    
    await createAuditLog({
      action: 'SETTINGS_UPDATE',
      entityType: 'settings',
      entityId: alert.id,
      metadata: { setting_type: 'alert', action: 'alert_resolved', note },
    });
    
    toast.success(t('Alert resolved', 'تم حل التنبيه'));
    setSelectedAlert(null);
    setResolutionNote('');
  };

  const handleAssign = async (alert: Alert, assignee: string) => {
    const member = TEAM_MEMBERS.find(m => m.initials === assignee);
    setAlerts(prev => prev.map(a => 
      a.id === alert.id ? { ...a, assignedTo: assignee } : a
    ));
    addActivity(alert.id, `Assigned to ${member?.name || assignee}`, 'Current User');
    
    await createAuditLog({
      action: 'SETTINGS_UPDATE',
      entityType: 'settings',
      entityId: alert.id,
      metadata: { setting_type: 'alert', action: 'alert_assigned', assignee },
    });
    
    toast.success(t('Alert assigned', 'تم تعيين التنبيه'));
    if (selectedAlert?.id === alert.id) {
      setSelectedAlert({ ...alert, assignedTo: assignee });
    }
  };

  const handleCreateIncident = (alert: Alert) => {
    addActivity(alert.id, 'Incident created', 'Current User');
    toast.success(t('Incident created (mock)', 'تم إنشاء حادث (تجريبي)'));
  };

  // Category tiles with counts
  const alertsByType = Object.entries(ALERT_TYPES).map(([type, config]) => {
    const typeAlerts = alerts.filter(a => a.type === type);
    return {
      type,
      ...config,
      openCount: typeAlerts.filter(a => a.status === 'open' || a.status === 'investigating').length,
      criticalCount: typeAlerts.filter(a => a.severity === 'critical' && a.status === 'open').length,
    };
  });

  const handleTileClick = (type: string) => {
    setTypeFilter(type === typeFilter ? 'all' : type);
  };

  const getRiskBadgeColor = (risk?: string) => {
    switch (risk) {
      case 'critical': return 'bg-destructive/10 text-destructive border-destructive/30';
      case 'high': return 'bg-warning/10 text-warning border-warning/30';
      case 'medium': return 'bg-primary/10 text-primary border-primary/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <PageLayout
      title={t('Alerts Center', 'مركز التنبيهات')}
      description={t('Triage operational issues with deep links to investigation tools', 'فرز المشاكل التشغيلية مع روابط عميقة لأدوات التحقيق')}
      icon={Bell}
      iconClassName="from-rose-500 to-red-500"
    >
      <MetricGrid columns={4}>
        {metrics.map((m) => (
          <MetricCard key={m.title} title={m.title} value={m.value} icon={m.icon} />
        ))}
      </MetricGrid>

      {/* Category Tiles - Quick Filters */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {alertsByType.map(({ type, label, icon: Icon, openCount, criticalCount }) => {
          const isActive = typeFilter === type;
          return (
            <Card 
              key={type} 
              onClick={() => handleTileClick(type)}
              className={cn(
                "cursor-pointer transition-all hover:border-primary/50",
                isActive && "ring-2 ring-primary border-primary",
                openCount > 0 && !isActive && 'border-warning/50'
              )}
            >
              <CardContent className="p-4 text-center">
                <Icon className={cn("w-6 h-6 mx-auto mb-2", openCount > 0 ? 'text-warning' : 'text-muted-foreground')} />
                <p className="text-sm font-medium">{label}</p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className={cn("text-2xl font-bold", openCount > 0 ? 'text-warning' : 'text-muted-foreground')}>
                    {openCount}
                  </span>
                  {criticalCount > 0 && (
                    <Badge variant="destructive" className="text-[10px] px-1.5">
                      {criticalCount} critical
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className={cn("flex flex-col gap-4")}>
                <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <Bell className="w-5 h-5" />
                  {t('Active Alerts', 'التنبيهات النشطة')}
                  {typeFilter !== 'all' && (
                    <Badge variant="secondary" className="ml-2">
                      {ALERT_TYPES[typeFilter as keyof typeof ALERT_TYPES]?.label}
                      <button onClick={() => setTypeFilter('all')} className="ml-1 hover:text-destructive">×</button>
                    </Badge>
                  )}
                </CardTitle>
                <div className={cn("flex items-center gap-2 flex-wrap", isRTL && "flex-row-reverse")}>
                  <Select value={orgFilter} onValueChange={setOrgFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder={t('Organization', 'المؤسسة')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('All Orgs', 'جميع المؤسسات')}</SelectItem>
                      {ORGS.slice(1).map(org => (
                        <SelectItem key={org} value={org}>{org}</SelectItem>
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
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        {t('Date Range', 'نطاق التاريخ')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={dateRange as any}
                        onSelect={(range) => setDateRange(range || {})}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[520px]">
                <div className="space-y-2 pr-4">
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
                            "p-3 rounded-lg border-l-4 cursor-pointer transition-all bg-card",
                            severityConfig.borderColor,
                            isSelected ? "ring-2 ring-primary" : "hover:bg-muted/50"
                          )}
                        >
                          <div className={cn("flex items-start justify-between gap-3", isRTL && "flex-row-reverse")}>
                            <div className={cn("flex items-start gap-3 flex-1 min-w-0", isRTL && "flex-row-reverse")}>
                              <div className={cn("p-2 rounded-lg shrink-0", severityConfig.color)}>
                                <typeConfig.icon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-medium truncate">{alert.title}</h4>
                                <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{alert.description}</p>
                                <div className={cn("flex items-center gap-2 mt-2 text-xs text-muted-foreground flex-wrap", isRTL && "flex-row-reverse")}>
                                  <Badge variant="outline" className="text-[10px]">{typeConfig.label}</Badge>
                                  <Badge variant="outline" className="text-[10px]">{alert.org}</Badge>
                                  <span>{formatDistanceToNow(alert.createdAt, { addSuffix: true })}</span>
                                  {alert.autoResolved && (
                                    <Badge variant="outline" className="text-[10px] bg-success/10 text-success">Auto-resolved</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className={cn("flex items-center gap-2 shrink-0", isRTL && "flex-row-reverse")}>
                              {/* Row Actions */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {alert.status === 'open' && (
                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleAcknowledge(alert); }}>
                                      <Check className="w-4 h-4 mr-2" /> Acknowledge
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleSnooze(alert, 1); }}>
                                    <Timer className="w-4 h-4 mr-2" /> Snooze 1h
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleSnooze(alert, 24); }}>
                                    <Pause className="w-4 h-4 mr-2" /> Snooze 24h
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                              {alert.assignedTo && (
                                <Avatar className="w-6 h-6">
                                  <AvatarFallback className="text-[10px]">{alert.assignedTo}</AvatarFallback>
                                </Avatar>
                              )}
                              <Badge variant="outline" className={cn("text-[10px]", statusConfig.color)}>
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
            <CardHeader className="pb-2">
              <CardTitle className={cn("flex items-center gap-2 text-base", isRTL && "flex-row-reverse")}>
                <Eye className="w-5 h-5" />
                {t('Alert Details', 'تفاصيل التنبيه')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedAlert ? (
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-4">
                    {/* Header Section */}
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <Badge className={SEVERITY_CONFIG[selectedAlert.severity as keyof typeof SEVERITY_CONFIG]?.color}>
                          {SEVERITY_CONFIG[selectedAlert.severity as keyof typeof SEVERITY_CONFIG]?.label}
                        </Badge>
                        <Badge variant="outline" className={STATUS_CONFIG[selectedAlert.status as keyof typeof STATUS_CONFIG]?.color}>
                          {STATUS_CONFIG[selectedAlert.status as keyof typeof STATUS_CONFIG]?.label}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-lg">{selectedAlert.title}</h4>
                      <p className="text-sm text-muted-foreground">{selectedAlert.description}</p>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="p-2 rounded-lg bg-muted/50">
                        <p className="text-muted-foreground text-xs">Type</p>
                        <p className="font-medium flex items-center gap-1.5">
                          {(() => { const Icon = ALERT_TYPES[selectedAlert.type as keyof typeof ALERT_TYPES]?.icon; return Icon ? <Icon className="w-3.5 h-3.5" /> : null; })()}
                          {ALERT_TYPES[selectedAlert.type as keyof typeof ALERT_TYPES]?.label}
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/50">
                        <p className="text-muted-foreground text-xs">Organization</p>
                        <p className="font-medium">{selectedAlert.org}</p>
                      </div>
                      {selectedAlert.connector && (
                        <div className="p-2 rounded-lg bg-muted/50">
                          <p className="text-muted-foreground text-xs">Connector</p>
                          <p className="font-medium">{selectedAlert.connector}</p>
                        </div>
                      )}
                      <div className="p-2 rounded-lg bg-muted/50">
                        <p className="text-muted-foreground text-xs">Detected</p>
                        <p className="font-medium">{format(selectedAlert.createdAt, 'MMM d, HH:mm')}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/50">
                        <p className="text-muted-foreground text-xs">Last Updated</p>
                        <p className="font-medium">{format(selectedAlert.updatedAt, 'MMM d, HH:mm')}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/50">
                        <p className="text-muted-foreground text-xs flex items-center gap-1">
                          <Hash className="w-3 h-3" /> Alert ID
                        </p>
                        <p className="font-medium font-mono text-xs">{selectedAlert.id}</p>
                      </div>
                    </div>

                    {/* Impact Section */}
                    <div className="p-3 rounded-lg border bg-muted/30">
                      <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Impact Assessment
                      </h5>
                      <div className="flex flex-wrap gap-3 text-sm">
                        {selectedAlert.impactRecords !== undefined && (
                          <div>
                            <span className="text-muted-foreground">Records:</span>{' '}
                            <span className="font-semibold">{selectedAlert.impactRecords.toLocaleString()}</span>
                          </div>
                        )}
                        {selectedAlert.impactUsers !== undefined && (
                          <div>
                            <span className="text-muted-foreground">Users:</span>{' '}
                            <span className="font-semibold">{selectedAlert.impactUsers}</span>
                          </div>
                        )}
                        {selectedAlert.impactVendors !== undefined && (
                          <div>
                            <span className="text-muted-foreground">Vendors:</span>{' '}
                            <span className="font-semibold">{selectedAlert.impactVendors}</span>
                          </div>
                        )}
                        {selectedAlert.riskLevel && (
                          <Badge variant="outline" className={getRiskBadgeColor(selectedAlert.riskLevel)}>
                            {selectedAlert.riskLevel.charAt(0).toUpperCase() + selectedAlert.riskLevel.slice(1)} Risk
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">Actions</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedAlert.status === 'open' && (
                          <Button size="sm" variant="outline" onClick={() => handleAcknowledge(selectedAlert)}>
                            <Check className="w-4 h-4 mr-1.5" /> Acknowledge
                          </Button>
                        )}
                        <Select onValueChange={(v) => handleAssign(selectedAlert, v)}>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Assign owner" />
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Timer className="w-4 h-4 mr-1.5" /> Snooze
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleSnooze(selectedAlert, 1)}>1 hour</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSnooze(selectedAlert, 24)}>24 hours</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSnooze(selectedAlert, 168)}>7 days</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button size="sm" variant="outline" onClick={() => handleCreateIncident(selectedAlert)}>
                          <ListTodo className="w-4 h-4 mr-1.5" /> Create Task
                        </Button>
                      </div>
                      
                      {/* Resolution */}
                      <div className="pt-2 space-y-2">
                        <Textarea
                          placeholder="Resolution note (required to resolve)..."
                          value={resolutionNote}
                          onChange={(e) => setResolutionNote(e.target.value)}
                          rows={2}
                          className="text-sm"
                        />
                        <Button 
                          className="w-full" 
                          size="sm"
                          onClick={() => handleResolve(selectedAlert, resolutionNote)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1.5" /> Mark Resolved
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {/* Recommended Actions */}
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-warning" /> Recommended Actions
                      </h5>
                      <div className="space-y-1.5">
                        {RECOMMENDED_ACTIONS[selectedAlert.type]?.map((rec, idx) => (
                          <Button 
                            key={idx} 
                            variant="ghost" 
                            size="sm" 
                            className="w-full justify-start h-8 text-sm"
                            onClick={() => toast.info(`Action: ${rec.action}`)}
                          >
                            <rec.icon className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                            {rec.action}
                            <ChevronRight className="w-3.5 h-3.5 ml-auto text-muted-foreground" />
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Linked Evidence */}
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium flex items-center gap-2">
                        <Link2 className="w-4 h-4" /> Linked Evidence
                      </h5>
                      <Link to={ALERT_TYPES[selectedAlert.type as keyof typeof ALERT_TYPES]?.link || '#'}>
                        <Button variant="outline" size="sm" className="w-full justify-between">
                          <span className="flex items-center gap-2">
                            <ExternalLink className="w-3.5 h-3.5" />
                            {ALERT_TYPES[selectedAlert.type as keyof typeof ALERT_TYPES]?.linkLabel}
                          </span>
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </Link>
                      {selectedAlert.sourceId && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-start text-xs text-muted-foreground"
                          onClick={() => {
                            navigator.clipboard.writeText(selectedAlert.sourceId || '');
                            toast.success('Copied source ID');
                          }}
                        >
                          <Copy className="w-3 h-3 mr-2" />
                          Source: {selectedAlert.sourceId}
                        </Button>
                      )}
                    </div>

                    <Separator />

                    {/* Activity Timeline */}
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Activity Timeline
                      </h5>
                      <div className="space-y-2">
                        {selectedAlert.activity.slice().reverse().map((act, idx) => (
                          <div key={act.id} className="flex items-start gap-2 text-sm">
                            <div className="w-2 h-2 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-xs">{act.action}</p>
                              <p className="text-xs text-muted-foreground">
                                {act.actor} • {format(act.timestamp, 'MMM d, HH:mm')}
                              </p>
                              {act.details && (
                                <p className="text-xs text-muted-foreground italic mt-0.5">"{act.details}"</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">{t('Select an alert', 'اختر تنبيهاً')}</p>
                  <p className="text-sm">{t('View details, take action, and track resolution', 'عرض التفاصيل واتخاذ الإجراءات وتتبع الحل')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
