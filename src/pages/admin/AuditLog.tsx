import { useState, useEffect } from 'react';
import { 
  FileText, 
  Search,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  User,
  Building2,
  Shield,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Plus,
  LogIn,
  LogOut,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn, formatRelativeTime, formatDate, formatDateTime } from '@/lib/utils';
import { PageHeader } from '@/components/shared/PageHeader';
import { MetricCard, MetricGrid } from '@/components/shared';

interface AuditLogEntry {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  user_email?: string;
}

const ACTION_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  CREATE: { label: 'Created', icon: Plus, color: 'bg-success/10 text-success border-success/30' },
  UPDATE: { label: 'Updated', icon: Edit, color: 'bg-primary/10 text-primary border-primary/30' },
  DELETE: { label: 'Deleted', icon: Trash2, color: 'bg-destructive/10 text-destructive border-destructive/30' },
  LOGIN: { label: 'Login', icon: LogIn, color: 'bg-accent/10 text-accent-foreground border-accent/30' },
  LOGOUT: { label: 'Logout', icon: LogOut, color: 'bg-muted text-muted-foreground border-border' },
  VIEW: { label: 'Viewed', icon: Eye, color: 'bg-muted text-muted-foreground border-border' },
  APPROVE: { label: 'Approved', icon: CheckCircle, color: 'bg-success/10 text-success border-success/30' },
  REJECT: { label: 'Rejected', icon: XCircle, color: 'bg-destructive/10 text-destructive border-destructive/30' },
};

const RESOURCE_LABELS: Record<string, string> = {
  profile: 'Profile',
  organization: 'Organization',
  marketplace_offer: 'Offer',
  vendor: 'Vendor',
  request: 'Request',
  policy: 'Policy',
  user_role: 'User Role',
  feature_flag: 'Feature Flag',
};

// Sample audit log data for demo
const sampleAuditLogs: AuditLogEntry[] = [
  {
    id: '1',
    user_id: 'admin-1',
    action: 'APPROVE',
    resource_type: 'vendor',
    resource_id: 'vendor-123',
    details: { vendor_name: 'Emirates Wellness' },
    ip_address: '192.168.1.1',
    user_agent: 'Chrome/120',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    user_email: 'admin@bnft.io',
  },
  {
    id: '2',
    user_id: 'admin-1',
    action: 'UPDATE',
    resource_type: 'organization',
    resource_id: 'org-456',
    details: { field: 'settings', org_name: 'Emirates NBD' },
    ip_address: '192.168.1.1',
    user_agent: 'Chrome/120',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    user_email: 'admin@bnft.io',
  },
  {
    id: '3',
    user_id: 'hr-ops-1',
    action: 'CREATE',
    resource_type: 'marketplace_offer',
    resource_id: 'offer-789',
    details: { title: '20% off gym membership' },
    ip_address: '10.0.0.5',
    user_agent: 'Safari/17',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    user_email: 'hr@company.com',
  },
  {
    id: '4',
    user_id: 'admin-2',
    action: 'REJECT',
    resource_type: 'vendor',
    resource_id: 'vendor-999',
    details: { reason: 'Incomplete documentation', vendor_name: 'Quick Services' },
    ip_address: '192.168.1.2',
    user_agent: 'Firefox/121',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    user_email: 'superadmin@bnft.io',
  },
  {
    id: '5',
    user_id: 'admin-1',
    action: 'UPDATE',
    resource_type: 'user_role',
    resource_id: 'user-abc',
    details: { from_role: 'employee', to_role: 'employer' },
    ip_address: '192.168.1.1',
    user_agent: 'Chrome/120',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    user_email: 'admin@bnft.io',
  },
  {
    id: '6',
    user_id: 'admin-1',
    action: 'CREATE',
    resource_type: 'organization',
    resource_id: 'org-new',
    details: { name: 'Acme Corp' },
    ip_address: '192.168.1.1',
    user_agent: 'Chrome/120',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    user_email: 'admin@bnft.io',
  },
];

export default function AuditLogPage() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  
  const [logs, setLogs] = useState<AuditLogEntry[]>(sampleAuditLogs);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [resourceFilter, setResourceFilter] = useState('all');

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      if (data && data.length > 0) {
        setLogs(data as AuditLogEntry[]);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      // Keep sample data on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleExport = () => {
    const csvContent = [
      ['Timestamp', 'User', 'Action', 'Resource Type', 'Resource ID', 'IP Address'].join(','),
      ...logs.map(log => [
        log.created_at,
        log.user_email || log.user_id,
        log.action,
        log.resource_type,
        log.resource_id || '',
        log.ip_address || '',
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success(t('Audit log exported', 'تم تصدير سجل التدقيق'));
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      JSON.stringify(log.details || {}).toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesResource = resourceFilter === 'all' || log.resource_type === resourceFilter;
    
    return matchesSearch && matchesAction && matchesResource;
  });

  const actionStats = {
    total: logs.length,
    creates: logs.filter(l => l.action === 'CREATE').length,
    updates: logs.filter(l => l.action === 'UPDATE').length,
    approvals: logs.filter(l => l.action === 'APPROVE').length,
  };

  // Use centralized formatting utilities for consistent Western digits
  const getTimeDisplay = (date: string) => {
    return formatRelativeTime(date, { language: language as 'en' | 'ar' });
  };

  const getAbsoluteTime = (date: string) => {
    return formatDateTime(date);
  };

  return (
    <div className={cn("space-y-6", isRTL && "text-right")}>
      <PageHeader
        title={t('Audit Log', 'سجل التدقيق')}
        description={t('Complete audit trail of all administrative actions and system changes', 'سجل تدقيق كامل لجميع الإجراءات الإدارية وتغييرات النظام')}
        icon={FileText}
        iconClassName="from-primary to-primary/80"
        badge={{
          label: t('Live Tracking', 'تتبع مباشر'),
          variant: 'success',
          icon: Activity,
        }}
        actions={
          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
              <RefreshCw className={cn("w-4 h-4 me-2", loading && "animate-spin")} />
              {t('Refresh', 'تحديث')}
            </Button>
            <Button size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 me-2" />
              {t('Export CSV', 'تصدير CSV')}
            </Button>
          </div>
        }
      />

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-primary/30 bg-gradient-to-br from-card to-primary/5">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <FileText className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-3xl font-bold tracking-tight">{actionStats.total}</p>
            <p className="text-sm text-muted-foreground mt-1">{t('Total Events', 'إجمالي الأحداث')}</p>
          </CardContent>
        </Card>

        <Card className="border-success/30 bg-gradient-to-br from-card to-success/5">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-success/10">
                <Plus className="w-5 h-5 text-success" />
              </div>
            </div>
            <p className="text-3xl font-bold tracking-tight text-success">{actionStats.creates}</p>
            <p className="text-sm text-muted-foreground mt-1">{t('Creates', 'الإنشاءات')}</p>
          </CardContent>
        </Card>

        <Card className="border-info/30 bg-gradient-to-br from-card to-info/5">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-info/10">
                <Edit className="w-5 h-5 text-info" />
              </div>
            </div>
            <p className="text-3xl font-bold tracking-tight text-info">{actionStats.updates}</p>
            <p className="text-sm text-muted-foreground mt-1">{t('Updates', 'التحديثات')}</p>
          </CardContent>
        </Card>

        <Card className="border-accent/30 bg-gradient-to-br from-card to-accent/5">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-accent/10">
                <CheckCircle className="w-5 h-5 text-accent" />
              </div>
            </div>
            <p className="text-3xl font-bold tracking-tight text-accent">{actionStats.approvals}</p>
            <p className="text-sm text-muted-foreground mt-1">{t('Approvals', 'الموافقات')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Log Table */}
      <Card>
        <CardHeader>
          <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4", isRTL && "sm:flex-row-reverse")}>
            <div>
              <CardTitle>{t('Activity Log', 'سجل النشاط')}</CardTitle>
              <CardDescription>{t('Recent administrative actions', 'الإجراءات الإدارية الأخيرة')}</CardDescription>
            </div>
            <div className={cn("flex items-center gap-2 flex-wrap", isRTL && "flex-row-reverse")}>
              <div className="relative">
                <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
                <Input
                  placeholder={t('Search logs...', 'البحث في السجلات...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn("w-48", isRTL ? "pr-10" : "pl-10")}
                />
              </div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder={t('Action', 'الإجراء')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('All Actions', 'جميع الإجراءات')}</SelectItem>
                  <SelectItem value="CREATE">{t('Create', 'إنشاء')}</SelectItem>
                  <SelectItem value="UPDATE">{t('Update', 'تحديث')}</SelectItem>
                  <SelectItem value="DELETE">{t('Delete', 'حذف')}</SelectItem>
                  <SelectItem value="APPROVE">{t('Approve', 'موافقة')}</SelectItem>
                  <SelectItem value="REJECT">{t('Reject', 'رفض')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={resourceFilter} onValueChange={setResourceFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder={t('Resource', 'المورد')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('All Resources', 'جميع الموارد')}</SelectItem>
                  <SelectItem value="organization">{t('Organization', 'المنظمة')}</SelectItem>
                  <SelectItem value="vendor">{t('Vendor', 'البائع')}</SelectItem>
                  <SelectItem value="marketplace_offer">{t('Offer', 'العرض')}</SelectItem>
                  <SelectItem value="user_role">{t('User Role', 'دور المستخدم')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">{t('No audit logs found', 'لم يتم العثور على سجلات تدقيق')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('Timestamp', 'الوقت')}</TableHead>
                  <TableHead>{t('User', 'المستخدم')}</TableHead>
                  <TableHead>{t('Action', 'الإجراء')}</TableHead>
                  <TableHead>{t('Resource', 'المورد')}</TableHead>
                  <TableHead>{t('Details', 'التفاصيل')}</TableHead>
                  <TableHead>{t('IP Address', 'عنوان IP')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => {
                  const actionConfig = ACTION_CONFIG[log.action] || { label: log.action, icon: Eye, color: 'bg-muted text-muted-foreground border-border' };
                  const ActionIcon = actionConfig.icon;
                  
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                        <div className="flex items-center gap-2" title={getAbsoluteTime(log.created_at)}>
                          <Calendar className="w-3.5 h-3.5" />
                          {getTimeDisplay(log.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                            <User className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>
                          <span className="text-sm font-medium">{log.user_email || log.user_id.slice(0, 8)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("gap-1", actionConfig.color)}>
                          <ActionIcon className="w-3 h-3" />
                          {actionConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{RESOURCE_LABELS[log.resource_type] || log.resource_type}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground max-w-48 truncate block">
                          {log.details ? JSON.stringify(log.details).slice(0, 50) : '—'}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm font-mono">
                        {log.ip_address || '—'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
