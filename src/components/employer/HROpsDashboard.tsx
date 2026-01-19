import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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

const operationalMetrics = {
  pendingClaims: 12,
  urgentClaims: 3,
  avgProcessingDays: 2.3,
  slaCompliance: 94,
  openQuestions: 8,
  avgResponseTime: 4.2,
  enrollmentsPending: 5,
  policyUpdates: 2,
};

const pendingActions = [
  {
    type: 'urgent',
    title: 'Claims Requiring Immediate Attention',
    count: 3,
    description: 'SLA breach in < 24 hours',
    path: '/employer/claims',
    icon: AlertCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
  },
  {
    type: 'pending',
    title: 'Standard Claims Queue',
    count: 9,
    description: 'Within SLA timeline',
    path: '/employer/claims',
    icon: FileCheck,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
  },
  {
    type: 'info',
    title: 'Employee Questions',
    count: 8,
    description: 'Awaiting response',
    path: '/employer/claims',
    icon: MessageSquare,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
  {
    type: 'task',
    title: 'Benefit Enrollments',
    count: 5,
    description: 'Pending activation',
    path: '/employer/segments',
    icon: Users,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
  },
];

const claimsByCategory = [
  { name: 'Health Insurance', value: 35, color: 'primary' as const },
  { name: 'Transport', value: 28, color: 'success' as const },
  { name: 'Learning & Development', value: 18, color: 'warning' as const },
  { name: 'Wellbeing', value: 12, color: 'accent' as const },
  { name: 'Other', value: 7, color: 'danger' as const },
];

const recentActivity = [
  { action: 'Claim Approved', employee: 'Ahmed Al-Rashid', category: 'Health', amount: 450, time: '2 hours ago' },
  { action: 'Question Answered', employee: 'Lisa Chen', category: 'Housing', amount: null, time: '3 hours ago' },
  { action: 'Claim Rejected', employee: 'Omar Khalil', category: 'Wellbeing', amount: 3600, time: '5 hours ago' },
  { action: 'Enrollment Completed', employee: 'New Hire Batch', category: 'All Benefits', amount: null, time: 'Yesterday' },
];

const upcomingTasks = [
  { task: 'Q1 Benefits Review Meeting', date: 'Tomorrow, 10:00 AM', type: 'meeting' },
  { task: 'Policy Update: L&D Eligible Courses', date: 'Jan 25', type: 'policy' },
  { task: 'Monthly Utilization Report', date: 'Jan 31', type: 'report' },
  { task: 'Vendor Contract Renewal', date: 'Feb 1', type: 'contract' },
];

export function HROpsDashboard() {
  return (
    <div className="space-y-6">
      {/* HR Ops Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold tracking-tight">
            HR Operations Dashboard
          </h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Daily operations overview • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            SLA Compliance: {operationalMetrics.slaCompliance}%
          </Badge>
        </div>
      </div>

      {/* Action Items - Priority Queue */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {pendingActions.map((action, index) => (
          <Link key={index} to={action.path}>
            <Card className={`hover:shadow-md transition-all cursor-pointer ${action.borderColor} bg-gradient-to-br from-card to-transparent`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${action.bgColor}`}>
                    <action.icon className={`w-4 h-4 ${action.color}`} />
                  </div>
                  {action.type === 'urgent' && (
                    <Badge variant="outline" className="bg-red-500/10 text-red-500 border-0 text-[10px] animate-pulse">
                      Urgent
                    </Badge>
                  )}
                </div>
                <p className={`text-2xl font-bold ${action.color}`}>{action.count}</p>
                <p className="text-sm font-medium mt-1">{action.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Performance Metrics Strip */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10">
                <Clock className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xl font-bold">{operationalMetrics.avgProcessingDays} days</p>
                <p className="text-xs text-muted-foreground">Avg Processing Time</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10">
                <MessageSquare className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xl font-bold">{operationalMetrics.avgResponseTime} hrs</p>
                <p className="text-xs text-muted-foreground">Avg Response Time</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-violet-500/10">
                <Target className="w-5 h-5 text-violet-500" />
              </div>
              <div>
                <p className="text-xl font-bold text-emerald-600">{operationalMetrics.slaCompliance}%</p>
                <p className="text-xs text-muted-foreground">SLA Compliance</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10">
                <Bell className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xl font-bold">{operationalMetrics.policyUpdates}</p>
                <p className="text-xs text-muted-foreground">Policy Updates Due</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Claims Distribution */}
        <ChartContainer title="Claims by Category" formula="Distribution of claims this month">
          <ProgressBarList 
            items={claimsByCategory} 
            size="md" 
          />
        </ChartContainer>

        {/* Recent Activity */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                <div className={`p-1.5 rounded-lg ${
                  activity.action.includes('Approved') ? 'bg-emerald-500/10' :
                  activity.action.includes('Rejected') ? 'bg-red-500/10' :
                  'bg-blue-500/10'
                }`}>
                  {activity.action.includes('Approved') ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  ) : activity.action.includes('Rejected') ? (
                    <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                  ) : (
                    <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.employee}</p>
                </div>
                <div className="text-right shrink-0">
                  {activity.amount && (
                    <p className="text-sm font-medium">AED {activity.amount}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
            <Link to="/employer/claims">
              <Button variant="ghost" size="sm" className="w-full mt-2">
                View All Activity
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Upcoming Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingTasks.map((task, index) => (
              <div key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                <div className={`p-1.5 rounded-lg ${
                  task.type === 'meeting' ? 'bg-blue-500/10' :
                  task.type === 'policy' ? 'bg-amber-500/10' :
                  task.type === 'report' ? 'bg-violet-500/10' :
                  'bg-emerald-500/10'
                }`}>
                  {task.type === 'meeting' ? (
                    <Users className="w-3.5 h-3.5 text-blue-500" />
                  ) : task.type === 'policy' ? (
                    <FileCheck className="w-3.5 h-3.5 text-amber-500" />
                  ) : task.type === 'report' ? (
                    <TrendingUp className="w-3.5 h-3.5 text-violet-500" />
                  ) : (
                    <Target className="w-3.5 h-3.5 text-emerald-500" />
                  )}
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

      {/* Quick Actions Footer */}
      <Card className="border-primary/20 bg-gradient-to-r from-card to-primary/5">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-primary" />
              <p className="font-medium">Quick Actions</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/employer/claims">
                <Button size="sm" variant="outline">
                  <FileCheck className="w-4 h-4 mr-2" />
                  Process Claims
                </Button>
              </Link>
              <Link to="/employer/segments">
                <Button size="sm" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  View Employees
                </Button>
              </Link>
              <Link to="/employer/policies">
                <Button size="sm" variant="outline">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Policy Updates
                </Button>
              </Link>
              <Link to="/employer/recommendations">
                <Button size="sm">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Insights
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
