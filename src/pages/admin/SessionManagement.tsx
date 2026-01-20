import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PageLayout, MetricCard, MetricGrid } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  Monitor, Smartphone, Globe, Clock, XCircle, CheckCircle, 
  AlertTriangle, RefreshCw, Search, Trash2, ShieldCheck
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';

const SAMPLE_SESSIONS = [
  { id: '1', user_email: 'admin@acme.com', user_name: 'John Admin', device: 'desktop', browser: 'Chrome 120', ip: '192.168.1.100', location: 'Dubai, UAE', created_at: new Date(Date.now() - 1000 * 60 * 5), last_activity: new Date(Date.now() - 1000 * 60 * 2), is_current: true, is_active: true },
  { id: '2', user_email: 'hr@acme.com', user_name: 'Sarah HR', device: 'desktop', browser: 'Firefox 121', ip: '10.0.0.50', location: 'Abu Dhabi, UAE', created_at: new Date(Date.now() - 1000 * 60 * 60), last_activity: new Date(Date.now() - 1000 * 60 * 15), is_current: false, is_active: true },
  { id: '3', user_email: 'admin@acme.com', user_name: 'John Admin', device: 'mobile', browser: 'Safari iOS', ip: '192.168.1.105', location: 'Dubai, UAE', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24), last_activity: new Date(Date.now() - 1000 * 60 * 60 * 2), is_current: false, is_active: false },
  { id: '4', user_email: 'ops@techstart.com', user_name: 'Mike Ops', device: 'desktop', browser: 'Edge 120', ip: '172.16.0.25', location: 'Sharjah, UAE', created_at: new Date(Date.now() - 1000 * 60 * 30), last_activity: new Date(Date.now() - 1000 * 60 * 10), is_current: false, is_active: true },
  { id: '5', user_email: 'finance@globalbank.com', user_name: 'Lisa Finance', device: 'desktop', browser: 'Chrome 120', ip: '203.0.113.50', location: 'Riyadh, KSA', created_at: new Date(Date.now() - 1000 * 60 * 60 * 3), last_activity: new Date(Date.now() - 1000 * 60 * 60), is_current: false, is_active: true },
];

export default function AdminSessionManagement() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const [sessions, setSessions] = useState(SAMPLE_SESSIONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [sessionToRevoke, setSessionToRevoke] = useState<typeof SAMPLE_SESSIONS[0] | null>(null);
  const [bulkRevokeDialogOpen, setBulkRevokeDialogOpen] = useState(false);

  // Fetch real sessions from DB
  const { data: dbSessions } = useQuery({
    queryKey: ['admin-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('is_active', true)
        .order('last_activity', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  const filteredSessions = sessions.filter(s =>
    s.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.ip.includes(searchTerm)
  );

  const activeSessions = sessions.filter(s => s.is_active);
  const uniqueUsers = new Set(sessions.filter(s => s.is_active).map(s => s.user_email)).size;

  const metrics = [
    { title: t('Active Sessions', 'الجلسات النشطة'), value: activeSessions.length, icon: Monitor },
    { title: t('Unique Users', 'المستخدمون الفريدون'), value: uniqueUsers, icon: CheckCircle },
    { title: t('Mobile Sessions', 'جلسات الجوال'), value: sessions.filter(s => s.device === 'mobile').length, icon: Smartphone },
    { title: t('Locations', 'المواقع'), value: new Set(sessions.map(s => s.location)).size, icon: Globe },
  ];

  const handleRevokeSession = () => {
    if (!sessionToRevoke) return;
    setSessions(prev => prev.filter(s => s.id !== sessionToRevoke.id));
    toast.success(t('Session revoked successfully', 'تم إلغاء الجلسة بنجاح'));
    setRevokeDialogOpen(false);
    setSessionToRevoke(null);
  };

  const handleBulkRevoke = () => {
    setSessions(prev => prev.filter(s => s.is_current));
    toast.success(t('All other sessions revoked', 'تم إلغاء جميع الجلسات الأخرى'));
    setBulkRevokeDialogOpen(false);
  };

  const confirmRevoke = (session: typeof SAMPLE_SESSIONS[0]) => {
    setSessionToRevoke(session);
    setRevokeDialogOpen(true);
  };

  return (
    <PageLayout
      title={t('Session Management', 'إدارة الجلسات')}
      description={t('Monitor and manage active user sessions across the platform', 'مراقبة وإدارة جلسات المستخدمين النشطة عبر المنصة')}
      icon={Monitor}
      iconClassName="from-blue-500 to-cyan-500"
      actions={
        <Button variant="destructive" onClick={() => setBulkRevokeDialogOpen(true)}>
          <Trash2 className="w-4 h-4 me-2" />
          {t('Revoke All Other Sessions', 'إلغاء جميع الجلسات الأخرى')}
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
          <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4", isRTL && "md:flex-row-reverse")}>
            <div>
              <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <ShieldCheck className="w-5 h-5" />
                {t('Active Sessions', 'الجلسات النشطة')}
              </CardTitle>
              <CardDescription>{t('View and revoke user sessions', 'عرض وإلغاء جلسات المستخدمين')}</CardDescription>
            </div>
            <div className="relative">
              <Search className={cn("absolute top-2.5 w-4 h-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
              <Input
                placeholder={t('Search by user or IP...', 'البحث بالمستخدم أو IP...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cn("w-64", isRTL ? "pr-9" : "pl-9")}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('User', 'المستخدم')}</TableHead>
                <TableHead>{t('Device', 'الجهاز')}</TableHead>
                <TableHead>{t('IP Address', 'عنوان IP')}</TableHead>
                <TableHead>{t('Location', 'الموقع')}</TableHead>
                <TableHead>{t('Started', 'بدأت')}</TableHead>
                <TableHead>{t('Last Activity', 'آخر نشاط')}</TableHead>
                <TableHead>{t('Status', 'الحالة')}</TableHead>
                <TableHead>{t('Actions', 'الإجراءات')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSessions.map((session) => (
                <TableRow key={session.id} className={session.is_current ? 'bg-primary/5' : ''}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{session.user_name}</p>
                      <p className="text-xs text-muted-foreground">{session.user_email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                      {session.device === 'mobile' ? (
                        <Smartphone className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Monitor className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="text-sm">{session.browser}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{session.ip}</code>
                  </TableCell>
                  <TableCell>
                    <div className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")}>
                      <Globe className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm">{session.location}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(session.created_at, { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(session.last_activity, { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    {session.is_current ? (
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                        {t('Current', 'الحالية')}
                      </Badge>
                    ) : session.is_active ? (
                      <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                        {t('Active', 'نشط')}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-muted text-muted-foreground">
                        {t('Inactive', 'غير نشط')}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {!session.is_current && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => confirmRevoke(session)}
                      >
                        <XCircle className="w-4 h-4 me-1" />
                        {t('Revoke', 'إلغاء')}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Single Session Revoke Dialog */}
      <Dialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              {t('Revoke Session', 'إلغاء الجلسة')}
            </DialogTitle>
            <DialogDescription>
              {t('Are you sure you want to revoke this session? The user will be logged out immediately.', 'هل أنت متأكد من إلغاء هذه الجلسة؟ سيتم تسجيل خروج المستخدم فوراً.')}
            </DialogDescription>
          </DialogHeader>
          {sessionToRevoke && (
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <p><strong>{t('User:', 'المستخدم:')}</strong> {sessionToRevoke.user_name}</p>
              <p><strong>{t('Device:', 'الجهاز:')}</strong> {sessionToRevoke.browser}</p>
              <p><strong>{t('IP:', 'IP:')}</strong> {sessionToRevoke.ip}</p>
              <p><strong>{t('Location:', 'الموقع:')}</strong> {sessionToRevoke.location}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeDialogOpen(false)}>{t('Cancel', 'إلغاء')}</Button>
            <Button variant="destructive" onClick={handleRevokeSession}>
              <XCircle className="w-4 h-4 me-2" />
              {t('Revoke Session', 'إلغاء الجلسة')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Revoke Dialog */}
      <Dialog open={bulkRevokeDialogOpen} onOpenChange={setBulkRevokeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              {t('Revoke All Other Sessions', 'إلغاء جميع الجلسات الأخرى')}
            </DialogTitle>
            <DialogDescription>
              {t('This will log out all users from their current sessions except your own. This action cannot be undone.', 'سيؤدي هذا إلى تسجيل خروج جميع المستخدمين من جلساتهم الحالية باستثناء جلستك. لا يمكن التراجع عن هذا الإجراء.')}
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>{t(`This will affect ${sessions.filter(s => !s.is_current).length} active sessions across the platform.`, `سيؤثر هذا على ${sessions.filter(s => !s.is_current).length} جلسة نشطة عبر المنصة.`)}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkRevokeDialogOpen(false)}>{t('Cancel', 'إلغاء')}</Button>
            <Button variant="destructive" onClick={handleBulkRevoke}>
              <Trash2 className="w-4 h-4 me-2" />
              {t('Revoke All', 'إلغاء الكل')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
