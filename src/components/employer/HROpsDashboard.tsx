import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  FileCheck, 
  Users, 
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Calendar,
  MessageSquare,
  TrendingUp,
  Target,
  Zap,
  Bell,
  Info
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ChartContainer, ProgressBarList } from '@/components/charts';
import { DataConfidenceBadge, useDataCoverageMetrics } from './DataConfidenceBadge';
import { PageConfidenceGate } from './PageConfidenceGate';
import { TrendIndicatorCompact } from './TrendComparison';
import { TodaysFocusPanel } from './TodaysFocusPanel';
import { WorkloadByOwnerTable } from './WorkloadByOwnerTable';
import { ActionableTasksList } from './ActionableTasksList';
import type { TaskType } from './ActionableTasksList';
import { TodaysPrioritiesStrip } from './TodaysPrioritiesStrip';
import { SuggestedActionsPanel } from './SuggestedActionsPanel';
import { TaskDetailDrawer } from './TaskDetailDrawer';
import { useClaimMetrics, useClaimsByCategory, useRecentActivity } from '@/hooks/useEmployerDashboard';
import { cn } from '@/lib/utils';
import { EmployerGlobalFiltersBar } from './EmployerGlobalFiltersBar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Mock focus items for Today's Focus panel
const mockFocusItems = [
  { id: '1', employeeName: 'Ahmed Hassan', requestType: 'Health Insurance', subject: 'Medical Claim - Hospital Stay', dueInHours: -2, owner: 'Sarah Al-R', amount: 4500 },
  { id: '2', employeeName: 'Fatima Salem', requestType: 'Education', subject: 'Schooling Tuition Claim', dueInHours: 3, owner: 'Sarah Al-R', amount: 12000 },
  { id: '3', employeeName: 'Omar Khan', requestType: 'Transport', subject: 'Fuel Allowance', dueInHours: 6, amount: 850 },
  { id: '4', employeeName: 'Sara Ali', requestType: 'Housing', subject: 'Rent Advance Request', dueInHours: 18, owner: 'Ahmed H', amount: 25000 },
  { id: '5', employeeName: 'Mohamed Khalil', requestType: 'Wellbeing', subject: 'Gym Membership Reimbursement', dueInHours: 22, amount: 1200 },
];

// Mock workload data
const mockWorkloads = [
  { id: '1', name: 'Sarah Al-Rashid', role: 'HR Manager', assigned: 8, slaRisk: 2, oldestDays: 4 },
  { id: '2', name: 'Ahmed Hassan', role: 'HR Specialist', assigned: 12, slaRisk: 1, oldestDays: 3 },
  { id: '3', name: 'Fatima Al-Maktoum', role: 'HR Specialist', assigned: 6, slaRisk: 0, oldestDays: 2 },
  { id: '4', name: 'Omar Khan', role: 'Finance Lead', assigned: 4, slaRisk: 0, oldestDays: 1 },
];

// Mock upcoming tasks
const mockTasks: { id: string; title: string; date: string; type: TaskType; link?: string; priority?: 'low' | 'normal' | 'high'; description?: string }[] = [
  { id: '1', title: 'Q1 Benefits Review Meeting', date: 'Tomorrow, 10:00 AM', type: 'meeting', link: '/employer/recommendations', priority: 'high', description: 'Review Q1 benefits spend and utilization trends with leadership team.' },
  { id: '2', title: 'Policy Update: L&D Eligible Courses', date: 'Jan 25', type: 'policy', link: '/employer/policies', description: 'Update eligible courses list and coverage limits for 2024.' },
  { id: '3', title: 'Monthly Utilization Report', date: 'Jan 31', type: 'report', link: '/employer/spend', description: 'Generate and distribute monthly benefits utilization report.' },
  { id: '4', title: 'Vendor Contract Renewal', date: 'Feb 1', type: 'contract', link: '/employer/integrations?tab=ops', description: 'Renew annual contract with insurance provider.' },
  { id: '5', title: 'Employee Satisfaction Survey Close', date: 'Feb 5', type: 'deadline', priority: 'high', description: 'Final reminder to employees for benefits satisfaction survey.' },
];

const mockOwners = [
  { id: '1', name: 'Sarah Al-Rashid' },
  { id: '2', name: 'Ahmed Hassan' },
  { id: '3', name: 'Fatima Al-Maktoum' },
];

// Priority counts (derived from mock/real data)
const mockPriorityCounts = {
  slaAtRisk: 3,
  missingDocs: 4,
  highValue: 2,
  policyUpdates: 2,
};

export function HROpsDashboard() {
  const navigate = useNavigate();
  const { data: claimMetrics, isLoading } = useClaimMetrics();
  const { data: claimsByCategory } = useClaimsByCategory();
  const { data: recentActivity } = useRecentActivity();
  const coverageMetrics = useDataCoverageMetrics();
  
  // Task detail drawer state
  const [selectedTask, setSelectedTask] = useState<{
    id: string;
    title: string;
    date: string;
    type: TaskType;
    link?: string;
    priority?: 'low' | 'normal' | 'high';
    description?: string;
  } | null>(null);
  const [taskDrawerOpen, setTaskDrawerOpen] = useState(false);

  // Calculate focus items from real data (using mock for now)
  const focusItems = useMemo(() => mockFocusItems, []);
  
  // Priority counts for strip
  const priorityCounts = useMemo(() => ({
    slaAtRisk: claimMetrics?.urgent || mockPriorityCounts.slaAtRisk,
    missingDocs: mockPriorityCounts.missingDocs,
    highValue: mockPriorityCounts.highValue,
    policyUpdates: claimMetrics?.policyUpdatesDue || mockPriorityCounts.policyUpdates,
  }), [claimMetrics]);

  const handleTaskClick = (task: typeof mockTasks[0]) => {
    setSelectedTask({
      ...task,
      description: task.description,
    });
    setTaskDrawerOpen(true);
  };

  const pendingActions = [
    {
      type: 'urgent',
      title: 'Urgent Claims',
      count: claimMetrics?.urgent || 3,
      description: 'SLA breach in < 24 hours',
      path: '/employer/claims?tab=sla_risk&due=24h',
      icon: AlertCircle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      borderColor: 'border-destructive/20',
    },
    {
      type: 'pending',
      title: 'Standard Queue',
      count: (claimMetrics?.pending || 12) - (claimMetrics?.urgent || 3),
      description: 'Within SLA timeline',
      path: '/employer/claims?tab=pending',
      icon: FileCheck,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/20',
    },
    {
      type: 'info',
      title: 'Open Questions',
      count: claimMetrics?.openQuestions || 8,
      description: 'Awaiting response',
      path: '/employer/knowledge?tab=questions',
      icon: MessageSquare,
      color: 'text-info',
      bgColor: 'bg-info/10',
      borderColor: 'border-info/20',
    },
    {
      type: 'task',
      title: 'Enrollments',
      count: claimMetrics?.enrollmentsPending || 5,
      description: 'Pending activations',
      tooltip: 'Benefit enrollments waiting for eligibility verification or provider enrollment',
      path: '/employer/marketplace?tab=pending',
      icon: Users,
      color: 'text-success',
      bgColor: 'bg-success/10',
      borderColor: 'border-success/20',
    },
  ];

  const categoryData = claimsByCategory?.map(c => ({
    name: c.name,
    value: c.value,
    color: 'primary' as const,
  })) || [];

  const handleFocusItemClick = (id: string) => {
    navigate(`/employer/claims?open=${id}`);
  };

  if (isLoading) {
    return <div className="space-y-6 animate-pulse"><div className="h-16 bg-muted rounded-xl" /></div>;
  }

  return (
    <PageConfidenceGate metrics={coverageMetrics} threshold={70}>
    <div className="space-y-6">
      {/* Hero Header with SLA Badge */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold tracking-tight">
            HR Operations Dashboard
          </h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <DataConfidenceBadge metrics={coverageMetrics} />
          <Badge variant="outline" className={cn(
            "gap-1.5 px-3 py-1.5",
            (claimMetrics?.slaCompliance || 94) >= 90 
              ? "bg-success/10 text-success border-success/30" 
              : "bg-warning/10 text-warning border-warning/30"
          )}>
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-medium">SLA: {claimMetrics?.slaCompliance || 94}%</span>
          </Badge>
        </div>
      </div>

      {/* Global Filters */}
      <EmployerGlobalFiltersBar compact />

      {/* Today's Priorities Strip */}
      <TodaysPrioritiesStrip 
        slaAtRisk={priorityCounts.slaAtRisk}
        missingDocs={priorityCounts.missingDocs}
        highValue={priorityCounts.highValue}
        policyUpdates={priorityCounts.policyUpdates}
      />

      {/* Action Items */}
      <TooltipProvider>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {pendingActions.map((action, index) => (
            <Link key={index} to={action.path}>
              <Card className={cn("hover:shadow-md transition-all cursor-pointer h-full", action.borderColor)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={cn("p-2 rounded-lg", action.bgColor)}>
                      <action.icon className={cn("w-4 h-4", action.color)} />
                    </div>
                    <div className="flex items-center gap-1">
                      {action.tooltip && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button 
                              className="p-1 rounded-full hover:bg-muted/50 transition-colors"
                              onClick={(e) => e.preventDefault()}
                            >
                              <Info className="w-3.5 h-3.5 text-muted-foreground" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[200px]">
                            <p className="text-xs">{action.tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {action.type === 'urgent' && (
                        <Badge variant="outline" className="bg-destructive/10 text-destructive border-0 text-[10px] animate-pulse">
                          Urgent
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className={cn("text-2xl font-bold", action.color)}>{action.count}</p>
                  <p className="text-sm font-medium mt-1">{action.title}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </TooltipProvider>

      {/* Performance Metrics */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-success/10">
                <Clock className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-xl font-bold">{claimMetrics?.avgProcessingDays || 2.3} days</p>
                <p className="text-xs text-muted-foreground">Avg Processing</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-info/10">
                <TrendingUp className="w-5 h-5 text-info" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold">{claimMetrics?.claimsThisMonth || 45}</p>
                  <TrendIndicatorCompact 
                    change={((claimMetrics?.claimsThisMonth || 45) / (claimMetrics?.claimsLastMonth || 42) - 1) * 100} 
                  />
                </div>
                <p className="text-xs text-muted-foreground">Claims This Month</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-chart-3/10">
                <Target className="w-5 h-5 text-chart-3" />
              </div>
              <div>
                <p className="text-xl font-bold text-success">{claimMetrics?.approvalRate || 87}%</p>
                <p className="text-xs text-muted-foreground">Approval Rate</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-warning/10">
                <Bell className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-xl font-bold">{claimMetrics?.policyUpdatesDue || 2}</p>
                <p className="text-xs text-muted-foreground">Policy Updates Due</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartContainer title="Claims by Category" formula="Distribution this month">
          <ProgressBarList items={categoryData} size="md" />
        </ChartContainer>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(recentActivity || []).slice(0, 4).map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30">
                <div className={cn("p-1.5 rounded-lg", 
                  activity.action.includes('Approved') ? 'bg-success/10' :
                  activity.action.includes('Rejected') ? 'bg-destructive/10' : 'bg-info/10'
                )}>
                  {activity.action.includes('Approved') ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                  ) : activity.action.includes('Rejected') ? (
                    <AlertCircle className="w-3.5 h-3.5 text-destructive" />
                  ) : (
                    <MessageSquare className="w-3.5 h-3.5 text-info" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.category}</p>
                </div>
                <div className="text-right shrink-0">
                  {activity.amount && <p className="text-sm font-medium">AED {activity.amount}</p>}
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
            <Link to="/employer/claims">
              <Button variant="ghost" size="sm" className="w-full mt-2">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <ActionableTasksList 
          tasks={mockTasks}
          owners={mockOwners}
          onAssign={(taskId, ownerId) => console.log('Assigned', taskId, ownerId)}
          onSetDueDate={(taskId, date) => console.log('Due date set', taskId, date)}
          onComplete={(taskId) => console.log('Completed', taskId)}
          onTaskClick={handleTaskClick}
        />
      </div>

      {/* Suggested Actions Panel */}
      <SuggestedActionsPanel />

      {/* Quick Actions */}
      <Card className="border-primary/20 bg-gradient-to-r from-card to-primary/5">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-primary" />
              <p className="font-medium">Quick Actions</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/employer/claims"><Button size="sm" variant="outline"><FileCheck className="w-4 h-4 mr-2" />Process Claims</Button></Link>
              <Link to="/employer/segments"><Button size="sm" variant="outline"><Users className="w-4 h-4 mr-2" />View Employees</Button></Link>
              <Link to="/employer/recommendations"><Button size="sm"><TrendingUp className="w-4 h-4 mr-2" />View Insights</Button></Link>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Task Detail Drawer */}
      <TaskDetailDrawer
        task={selectedTask}
        open={taskDrawerOpen}
        onOpenChange={setTaskDrawerOpen}
        owners={mockOwners}
        onAssign={(taskId, ownerId) => console.log('Assigned', taskId, ownerId)}
        onSetDueDate={(taskId, date) => console.log('Due date set', taskId, date)}
        onComplete={(taskId) => {
          console.log('Completed', taskId);
          setTaskDrawerOpen(false);
        }}
        onAddNote={(taskId, note) => console.log('Note added', taskId, note)}
      />
    </div>
    </PageConfidenceGate>
  );
}
