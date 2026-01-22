import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Plus, Clock, CheckCircle, X, AlertCircle, FileText, ChevronRight, Plane } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/contexts/ProfileContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { PolicyHighlightsCard } from '@/components/employee/PolicyHighlightsCard';
import { cn, formatInteger } from '@/lib/utils';
import { LEAVE_TYPES } from '@/lib/constants';

const allLeaveBalances = [
  { type: 'Annual Leave', id: 'annual', total: 30, used: 8, color: 'bg-blue-500', genderSpecific: null, carryover: 10, expires: 'Mar 31, 2026' },
  { type: 'Sick Leave', id: 'sick', total: 15, used: 2, color: 'bg-rose-500', genderSpecific: null, carryover: 0, expires: null },
  { type: 'Personal Leave', id: 'personal', total: 5, used: 1, color: 'bg-purple-500', genderSpecific: null, carryover: 0, expires: null },
  { type: 'Maternity Leave', id: 'maternity', total: 90, used: 0, color: 'bg-pink-500', genderSpecific: 'female' as const, carryover: 0, expires: null },
  { type: 'Paternity Leave', id: 'paternity', total: 5, used: 0, color: 'bg-cyan-500', genderSpecific: 'male' as const, carryover: 0, expires: null },
  { type: 'Compassionate Leave', id: 'compassionate', total: 5, used: 0, color: 'bg-amber-500', genderSpecific: null, carryover: 0, expires: null },
  { type: 'Study Leave', id: 'study', total: 10, used: 0, color: 'bg-violet-500', genderSpecific: null, carryover: 0, expires: null },
];

const recentRequests = [
  { id: 1, type: 'Annual Leave', from: '2025-12-20', to: '2025-12-27', days: 6, status: 'approved', reason: 'Year-end vacation' },
  { id: 2, type: 'Sick Leave', from: '2025-11-15', to: '2025-11-16', days: 2, status: 'approved', reason: 'Flu recovery' },
  { id: 3, type: 'Annual Leave', from: '2026-02-10', to: '2026-02-12', days: 3, status: 'pending', reason: 'Family event' },
];

// Company holidays for 2026
const companyHolidays = [
  { name: 'New Year\'s Day', date: 'Jan 1, 2026', day: 'Thursday' },
  { name: 'Eid Al Fitr', date: 'Mar 31 - Apr 2, 2026', day: '3 days' },
  { name: 'Eid Al Adha', date: 'Jun 6 - Jun 9, 2026', day: '4 days' },
  { name: 'Islamic New Year', date: 'Jun 27, 2026', day: 'Saturday' },
  { name: 'UAE National Day', date: 'Dec 2-3, 2026', day: '2 days' },
];

const upcomingTimeOff = [
  { type: 'Annual Leave', from: 'Feb 10', to: 'Feb 12', days: 3, status: 'pending' },
];

const leavePolicies = [
  '30 days annual leave per calendar year',
  'Up to 10 days can carry forward (expires Mar 31)',
  'Sick leave: medical certificate required after 2 consecutive days',
  'Minimum 48 hours notice for planned leave',
  'Manager approval required for 5+ consecutive days',
  'Public holidays are in addition to annual leave',
];

export default function LeavePage() {
  const { toast } = useToast();
  const { profile } = useProfile();
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const [dialogOpen, setDialogOpen] = useState(false);

  const leaveBalances = useMemo(() => {
    return allLeaveBalances.filter(leave => {
      if (leave.genderSpecific === null) return true;
      return leave.genderSpecific === profile.gender;
    });
  }, [profile.gender]);

  const filteredLeaveTypes = useMemo(() => {
    return LEAVE_TYPES.filter(type => {
      if (type.id === 'maternity') return profile.gender === 'female';
      if (type.id === 'paternity') return profile.gender === 'male';
      return true;
    });
  }, [profile.gender]);

  // Primary leave is Annual
  const annualLeave = leaveBalances.find(l => l.id === 'annual');
  const otherLeaves = leaveBalances.filter(l => l.id !== 'annual');
  
  const totalUsed = leaveBalances.reduce((sum, l) => sum + l.used, 0);
  const pendingCount = recentRequests.filter(r => r.status === 'pending').length;

  const handleSubmitRequest = () => {
    toast({
      title: "Leave Request Submitted",
      description: "Your leave request has been submitted for approval.",
    });
    setDialogOpen(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-success/10 text-success border-0">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-warning/10 text-warning border-0">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive/10 text-destructive border-0">Rejected</Badge>;
      default:
        return null;
    }
  };

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <PageHeader
        title={t('Leave Management', 'إدارة الإجازات')}
        description={t('View balances, request time off, and track approvals', 'عرض الأرصدة وطلب إجازة ومتابعة الموافقات')}
        icon={Calendar}
        iconClassName="from-info to-info/80 shadow-info/25"
        badge={pendingCount > 0 ? {
          label: `${pendingCount} ${t('pending', 'معلقة')}`,
          icon: Clock,
          variant: 'warning',
        } : undefined}
      />

      {/* Primary Balance: Annual Leave */}
      {annualLeave && (
        <Card className="border-info/20 bg-gradient-to-br from-info/5 to-transparent">
          <CardContent className="p-6">
            <div className={cn('flex items-start justify-between gap-6', isRTL && 'flex-row-reverse')}>
              <div className="space-y-3 flex-1">
                <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
                  <div className="w-12 h-12 rounded-2xl bg-info flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-info-foreground" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">{t('Annual Leave', 'الإجازة السنوية')}</h2>
                    <p className="text-sm text-muted-foreground">{t('Your primary leave balance', 'رصيد إجازتك الرئيسي')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="text-center p-3 rounded-lg bg-background/50">
                    <p className="text-3xl font-bold text-info">{annualLeave.total - annualLeave.used}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t('Days Remaining', 'الأيام المتبقية')}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-background/50">
                    <p className="text-2xl font-semibold text-muted-foreground">{annualLeave.used}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t('Days Used', 'الأيام المستخدمة')}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-background/50">
                    <p className="text-2xl font-semibold text-muted-foreground">{annualLeave.total}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t('Total Entitlement', 'الاستحقاق الكلي')}</p>
                  </div>
                </div>

                <Progress 
                  value={(annualLeave.used / annualLeave.total) * 100} 
                  className="h-2 [&>div]:bg-info"
                />
              </div>

              <div className="space-y-2">
                <Button onClick={() => setDialogOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  {t('Request Leave', 'طلب إجازة')}
                </Button>
              </div>
            </div>

            {/* Carryover warning */}
            {annualLeave.carryover > 0 && (
              <div className={cn('flex items-center gap-2 mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20', isRTL && 'flex-row-reverse')}>
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Carryover policy:</span> Up to {annualLeave.carryover} days can be carried to next year. 
                  {annualLeave.expires && ` Carried days expire on ${annualLeave.expires}.`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tabs: Other Leave Types | Upcoming | Holidays */}
      <Tabs defaultValue="types" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="types">{t('Leave Types', 'أنواع الإجازات')}</TabsTrigger>
          <TabsTrigger value="upcoming">{t('Upcoming', 'القادمة')}</TabsTrigger>
          <TabsTrigger value="holidays">{t('Company Holidays', 'العطل الرسمية')}</TabsTrigger>
        </TabsList>

        {/* Other Leave Types */}
        <TabsContent value="types" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {otherLeaves.map((leave) => {
              const remaining = leave.total - leave.used;
              const usedPercent = Math.round((leave.used / leave.total) * 100);

              return (
                <Card key={leave.type} className="p-4">
                  <div className="space-y-3">
                    <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                      <div className={cn('w-3 h-3 rounded-full', leave.color)} />
                      <span className="font-medium text-sm truncate">{leave.type}</span>
                    </div>
                    <div className="space-y-1">
                      <div className={cn('flex justify-between text-xs', isRTL && 'flex-row-reverse')}>
                        <span className="text-muted-foreground">{leave.used} used</span>
                        <span className="font-medium">{remaining} left</span>
                      </div>
                      <Progress value={usedPercent} className={cn('h-1.5', `[&>div]:${leave.color}`)} />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Upcoming Time Off */}
        <TabsContent value="upcoming" className="space-y-4">
          {upcomingTimeOff.length > 0 || recentRequests.filter(r => r.status === 'pending').length > 0 ? (
            <div className="space-y-3">
              {recentRequests.map((request) => (
                <Card key={request.id} className="p-4">
                  <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
                    <div>
                      <div className={cn('flex items-center gap-2 mb-1', isRTL && 'flex-row-reverse')}>
                        <h4 className="font-medium text-sm">{request.type}</h4>
                        {getStatusBadge(request.status)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {request.from} → {request.to} • {request.days} days
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{request.reason}</p>
                    </div>
                    {request.status === 'pending' && (
                      <Button size="sm" variant="outline" className="text-destructive hover:text-destructive shrink-0">
                        <X className="w-3 h-3 mr-1" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center border-dashed">
              <Plane className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="font-medium">{t('No upcoming time off', 'لا توجد إجازات قادمة')}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {t('Request leave to plan your time off', 'قدم طلب إجازة للتخطيط لوقتك')}
              </p>
              <Button className="mt-4" onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {t('Request Leave', 'طلب إجازة')}
              </Button>
            </Card>
          )}
        </TabsContent>

        {/* Company Holidays */}
        <TabsContent value="holidays" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-accent" />
                {t('2026 Public Holidays', 'العطل الرسمية 2026')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {companyHolidays.map((holiday, idx) => (
                  <div 
                    key={idx} 
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg border border-border/50',
                      isRTL && 'flex-row-reverse'
                    )}
                  >
                    <div>
                      <p className="font-medium text-sm">{holiday.name}</p>
                      <p className="text-xs text-muted-foreground">{holiday.day}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">{holiday.date}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Policy Highlights */}
      <PolicyHighlightsCard
        title={t('Leave Policy Highlights', 'أبرز سياسات الإجازات')}
        policies={leavePolicies}
        category="Leave"
        actionLabel={t('Request Leave', 'طلب إجازة')}
        policyLabel={t('View Full Policy', 'عرض السياسة الكاملة')}
        showClaimButton={false}
      />

      {/* Request Leave Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('Request Leave', 'طلب إجازة')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('Leave Type', 'نوع الإجازة')}</Label>
              <Select defaultValue="annual">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {filteredLeaveTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('From', 'من')}</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>{t('To', 'إلى')}</Label>
                <Input type="date" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('Reason (optional)', 'السبب (اختياري)')}</Label>
              <Input placeholder={t('Brief reason for leave', 'سبب موجز للإجازة')} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t('Cancel', 'إلغاء')}
            </Button>
            <Button onClick={handleSubmitRequest}>
              {t('Submit Request', 'تقديم الطلب')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
