import { useState } from 'react';
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
  Bell
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ChartContainer, ProgressBarList } from '@/components/charts';
import { DataQualityBadge } from './DataQualityBadge';
import { TrendIndicatorCompact } from './TrendComparison';
import { useClaimMetrics, useClaimsByCategory, useRecentActivity } from '@/hooks/useEmployerDashboard';
import { cn } from '@/lib/utils';

const upcomingTasks = [
  { task: 'Q1 Benefits Review Meeting', date: 'Tomorrow, 10:00 AM', type: 'meeting' },
  { task: 'Policy Update: L&D Eligible Courses', date: 'Jan 25', type: 'policy' },
  { task: 'Monthly Utilization Report', date: 'Jan 31', type: 'report' },
  { task: 'Vendor Contract Renewal', date: 'Feb 1', type: 'contract' },
];

export function HROpsDashboard() {
  const { data: claimMetrics, isLoading } = useClaimMetrics();
  const { data: claimsByCategory } = useClaimsByCategory();
  const { data: recentActivity } = useRecentActivity();

  const pendingActions = [
    {
      type: 'urgent',
      title: 'Urgent Claims',
      count: claimMetrics?.urgent || 3,
      description: 'SLA breach in < 24 hours',
      path: '/employer/claims',
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
      path: '/employer/claims',
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
      path: '/employer/claims',
      icon: MessageSquare,
      color: 'text-info',
      bgColor: 'bg-info/10',
      borderColor: 'border-info/20',
    },
    {
      type: 'task',
      title: 'Enrollments',
      count: claimMetrics?.enrollmentsPending || 5,
      description: 'Pending activation',
      path: '/employer/segments',
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

  if (isLoading) {
    return <div className="space-y-6 animate-pulse"><div className="h-16 bg-muted rounded-xl" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* HR Ops Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold tracking-tight">
            HR Operations Dashboard
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <DataQualityBadge confidence="high" lastUpdated={new Date().toISOString()} showDetails={false} />
          </div>
        </div>
        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
          SLA Compliance: {claimMetrics?.slaCompliance || 94}%
        </Badge>
      </div>

      {/* Action Items */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {pendingActions.map((action, index) => (
          <Link key={index} to={action.path}>
            <Card className={cn("hover:shadow-md transition-all cursor-pointer", action.borderColor)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={cn("p-2 rounded-lg", action.bgColor)}>
                    <action.icon className={cn("w-4 h-4", action.color)} />
                  </div>
                  {action.type === 'urgent' && (
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-0 text-[10px] animate-pulse">
                      Urgent
                    </Badge>
                  )}
                </div>
                <p className={cn("text-2xl font-bold", action.color)}>{action.count}</p>
                <p className="text-sm font-medium mt-1">{action.title}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

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

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Upcoming Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingTasks.map((task, index) => (
              <div key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30">
                <div className={cn("p-1.5 rounded-lg",
                  task.type === 'meeting' ? 'bg-info/10' :
                  task.type === 'policy' ? 'bg-warning/10' : 'bg-chart-3/10'
                )}>
                  {task.type === 'meeting' ? <Users className="w-3.5 h-3.5 text-info" /> :
                   task.type === 'policy' ? <FileCheck className="w-3.5 h-3.5 text-warning" /> :
                   <TrendingUp className="w-3.5 h-3.5 text-chart-3" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{task.task}</p>
                  <p className="text-xs text-muted-foreground">{task.date}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

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
    </div>
  );
}
