import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { SummaryStatsCard } from '@/components/ui/summary-stats-card';
import { BenefitGuide } from '@/components/employee/BenefitGuide';
import { PageHeader } from '@/components/ui/page-header';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Plus, Clock, CheckCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/contexts/ProfileContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LEAVE_TYPES } from '@/lib/constants';
import { cn } from '@/lib/utils';

// Base leave balances - will be filtered by gender
const allLeaveBalances = [
  { type: 'Annual Leave', id: 'annual', total: 30, used: 8, color: 'bg-blue-500', genderSpecific: null },
  { type: 'Sick Leave', id: 'sick', total: 15, used: 2, color: 'bg-rose-500', genderSpecific: null },
  { type: 'Personal Leave', id: 'personal', total: 5, used: 1, color: 'bg-purple-500', genderSpecific: null },
  { type: 'Maternity Leave', id: 'maternity', total: 90, used: 0, color: 'bg-pink-500', genderSpecific: 'female' as const },
  { type: 'Paternity Leave', id: 'paternity', total: 5, used: 0, color: 'bg-cyan-500', genderSpecific: 'male' as const },
  { type: 'Compassionate Leave', id: 'compassionate', total: 5, used: 0, color: 'bg-amber-500', genderSpecific: null },
];

const recentRequests = [
  { id: 1, type: 'Annual Leave', from: '2025-12-20', to: '2025-12-27', days: 6, status: 'approved', reason: 'Year-end vacation' },
  { id: 2, type: 'Sick Leave', from: '2025-11-15', to: '2025-11-16', days: 2, status: 'approved', reason: 'Flu recovery' },
  { id: 3, type: 'Annual Leave', from: '2026-02-10', to: '2026-02-12', days: 3, status: 'pending', reason: 'Family event' },
];

export default function LeavePage() {
  const { toast } = useToast();
  const { profile } = useProfile();
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const isArabic = language === 'ar';
  const [dialogOpen, setDialogOpen] = useState(false);

  // Filter leave balances based on user's gender
  const leaveBalances = useMemo(() => {
    return allLeaveBalances.filter(leave => {
      if (leave.genderSpecific === null) return true;
      return leave.genderSpecific === profile.gender;
    });
  }, [profile.gender]);

  // Filter leave types for the dropdown based on gender
  const filteredLeaveTypes = useMemo(() => {
    return LEAVE_TYPES.filter(type => {
      if (type.id === 'maternity') return profile.gender === 'female';
      if (type.id === 'paternity') return profile.gender === 'male';
      return true;
    });
  }, [profile.gender]);

  const totalBalance = leaveBalances.reduce((sum, l) => sum + (l.total - l.used), 0);
  const totalUsed = leaveBalances.reduce((sum, l) => sum + l.used, 0);

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

  const guideSteps = [
    {
      title: 'Submit Request',
      description: 'Select dates and leave type — give at least 48 hours notice for planned leave',
      highlight: '48 hours',
    },
    {
      title: 'Manager Approval',
      description: 'Your manager reviews and approves — usually within 24 hours',
      highlight: '24 hours',
    },
    {
      title: 'Balance Updated',
      description: 'Your leave balance is automatically updated once approved',
    },
  ];

  const policyPoints = [
    '30 days annual leave per calendar year',
    'Up to 10 days can carry forward to next year',
    'Sick leave: medical certificate required after 2 days',
    'Minimum 48 hours notice for planned leave',
    'Manager approval required for 5+ consecutive days',
    'Public holidays are in addition to annual leave',
  ];

  const leaveRequestButton = (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Request Leave
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Leave</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Leave Type</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {filteredLeaveTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>From Date</Label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <Label>To Date</Label>
              <Input type="date" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Reason</Label>
            <Textarea placeholder="Brief description of leave reason" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmitRequest}>Submit Request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className={cn("space-y-6 animate-fade-in", isRTL && "text-right")}>
      {/* Header */}
      <PageHeader
        title={isArabic ? 'إدارة الإجازات' : 'Leave Management'}
        titleAr="إدارة الإجازات"
        subtitle={isArabic ? 'عرض الأرصدة وطلب إجازة' : 'View balances and request time off'}
        subtitleAr="عرض الأرصدة وطلب إجازة"
        icon={Calendar}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryStatsCard
          icon={Calendar}
          value={`${totalBalance} days`}
          label="Total Balance"
          formula="Sum of all remaining leave days"
          dataSource="Leave System"
          variant="primary"
        />
        <SummaryStatsCard
          icon={CheckCircle}
          value={`${totalUsed} days`}
          label="Used This Year"
          formula="Days used this year"
          dataSource="Leave System"
          variant="utilized"
        />
        <SummaryStatsCard
          icon={Clock}
          value={`${recentRequests.filter(r => r.status === 'pending').length}`}
          label="Pending Requests"
          formula="Pending leave requests"
          dataSource="Leave System"
          variant="info"
        />
      </div>

      {/* Comprehensive Benefit Guide */}
      <BenefitGuide
        icon={Calendar}
        title="Leave Management Guide"
        steps={guideSteps}
        policyPoints={policyPoints}
        policyButtonText="View Leave Policy"
        customAction={leaveRequestButton}
      />

      {/* Leave Balances */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display">Leave Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaveBalances.map((leave) => {
              const remaining = leave.total - leave.used;
              const usedPercent = Math.round((leave.used / leave.total) * 100);

              return (
                <div key={leave.type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${leave.color}`} />
                      <span className="font-medium text-sm">{leave.type}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">{remaining}</span>
                      <span className="text-muted-foreground"> / {leave.total} days remaining</span>
                    </div>
                  </div>
                  <Progress value={usedPercent} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display">Recent Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/30">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{request.type}</h4>
                    {getStatusBadge(request.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {request.from} to {request.to} • {request.days} days
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{request.reason}</p>
                </div>
                {request.status === 'pending' && (
                  <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
