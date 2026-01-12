import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { SummaryStatsCard } from '@/components/ui/summary-stats-card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Plus, Clock, CheckCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LEAVE_TYPES } from '@/lib/constants';

const leaveBalances = [
  { type: 'Annual Leave', total: 30, used: 8, color: 'bg-blue-500' },
  { type: 'Sick Leave', total: 15, used: 2, color: 'bg-rose-500' },
  { type: 'Personal Leave', total: 5, used: 1, color: 'bg-purple-500' },
  { type: 'Maternity Leave', total: 90, used: 0, color: 'bg-pink-500' },
  { type: 'Compassionate Leave', total: 5, used: 0, color: 'bg-amber-500' },
];

const recentRequests = [
  { id: 1, type: 'Annual Leave', from: '2025-12-20', to: '2025-12-27', days: 6, status: 'approved', reason: 'Year-end vacation' },
  { id: 2, type: 'Sick Leave', from: '2025-11-15', to: '2025-11-16', days: 2, status: 'approved', reason: 'Flu recovery' },
  { id: 3, type: 'Annual Leave', from: '2026-02-10', to: '2026-02-12', days: 3, status: 'pending', reason: 'Family event' },
];

export default function LeavePage() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
            <Calendar className="w-7 h-7 text-accent" />
            Leave Management
          </h1>
          <p className="text-muted-foreground mt-1">
            View balances and request time off
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
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
                    {LEAVE_TYPES.map((type) => (
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
      </div>

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

      {/* How It Works */}
      <Card className="border-accent/30 bg-gradient-to-r from-accent/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Calendar className="w-5 h-5 text-accent" />
            How Leave Requests Work
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card border">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm shrink-0">1</div>
              <div>
                <p className="font-medium text-sm">Submit Request</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Select dates and leave type — give at least <span className="font-semibold text-accent">48 hours</span> notice for planned leave
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card border">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm shrink-0">2</div>
              <div>
                <p className="font-medium text-sm">Manager Approval</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your manager reviews and approves — usually within 24 hours
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card border">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm shrink-0">3</div>
              <div>
                <p className="font-medium text-sm">Balance Updated</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your leave balance is automatically updated once approved
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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

      {/* Policy Highlights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display">Leave Policy Highlights</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              30 days annual leave per calendar year
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              Up to 10 days can carry forward to next year
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              Sick leave: medical certificate required after 2 days
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              Minimum 48 hours notice for planned leave
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              Manager approval required for 5+ consecutive days
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              Public holidays are in addition to annual leave
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* View Full Policy */}
      <div className="text-center">
        <Button variant="outline">View Full Leave Policy</Button>
      </div>
    </div>
  );
}
