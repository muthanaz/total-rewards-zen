import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { 
  Lightbulb, TrendingUp, Users, DollarSign, Target, ArrowRight, CheckCircle, Clock,
  AlertTriangle, FileText, Megaphone, Settings, Store, BarChart3, Calendar, UserCheck,
  MessageSquare, Plus, Filter, LayoutGrid, List, AlertCircle, Zap, Activity,
  ChevronRight, Send, CircleDot, PlayCircle, PauseCircle, CheckCircle2, XCircle
} from 'lucide-react';
import { formatCurrencyAED, formatInteger } from '@/lib/utils';
import { EmployerGlobalFiltersBar, DataConfidenceBadge, PageConfidenceGate, useDataCoverageMetrics } from '@/components/employer';
import { toast } from 'sonner';
import { format, formatDistanceToNow, isPast, addDays } from 'date-fns';
import { DemoTip, DEMO_TIPS } from '@/components/demo';

// ============= TYPE DEFINITIONS =============

type ActionType = 'policy' | 'process' | 'comms' | 'vendor' | 'analytics';
type Priority = 'P0' | 'P1' | 'P2';
type Status = 'backlog' | 'in_progress' | 'blocked' | 'completed' | 'cancelled';
type Confidence = 'high' | 'medium' | 'low';
type ConfidenceBasis = 'measured' | 'proxy' | 'assumption';

interface ExpectedImpact {
  utilizationChange?: number; // percentage points
  slaReduction?: number; // days
  costAvoidance?: number; // AED
  satisfactionChange?: number; // points
}

interface LinkedEntity {
  type: 'benefit' | 'segment' | 'policy' | 'metric';
  id: string;
  name: string;
}

interface ActivityLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: 'created' | 'status_changed' | 'comment' | 'updated' | 'assigned';
  details: string;
  previousValue?: string;
  newValue?: string;
}

interface ActionItem {
  id: string;
  title: string;
  description: string;
  type: ActionType;
  priority: Priority;
  owner: string;
  ownerId: string;
  dueDate: Date;
  status: Status;
  expectedImpact: ExpectedImpact;
  confidence: Confidence;
  confidenceBasis: ConfidenceBasis;
  confidenceNote?: string;
  linkedEntities: LinkedEntity[];
  linkedMetrics: string[];
  activityLog: ActivityLogEntry[];
  createdAt: Date;
  updatedAt: Date;
  source?: string; // e.g., "Zombie Spend Analysis", "Policy Insights"
}

// ============= CONSTANTS =============

const typeConfig: Record<ActionType, { label: string; icon: React.ElementType; color: string }> = {
  policy: { label: 'Policy', icon: FileText, color: 'text-purple-500' },
  process: { label: 'Process', icon: Settings, color: 'text-blue-500' },
  comms: { label: 'Comms', icon: Megaphone, color: 'text-green-500' },
  vendor: { label: 'Vendor', icon: Store, color: 'text-orange-500' },
  analytics: { label: 'Analytics', icon: BarChart3, color: 'text-teal-500' },
};

const priorityConfig: Record<Priority, { label: string; color: string; bgColor: string }> = {
  P0: { label: 'P0 - Critical', color: 'text-red-600', bgColor: 'bg-red-500/10' },
  P1: { label: 'P1 - High', color: 'text-amber-600', bgColor: 'bg-amber-500/10' },
  P2: { label: 'P2 - Medium', color: 'text-blue-600', bgColor: 'bg-blue-500/10' },
};

const statusConfig: Record<Status, { label: string; icon: React.ElementType; color: string }> = {
  backlog: { label: 'Backlog', icon: CircleDot, color: 'text-muted-foreground' },
  in_progress: { label: 'In Progress', icon: PlayCircle, color: 'text-blue-500' },
  blocked: { label: 'Blocked', icon: PauseCircle, color: 'text-red-500' },
  completed: { label: 'Completed', icon: CheckCircle2, color: 'text-green-500' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-muted-foreground' },
};

const confidenceConfig: Record<Confidence, { label: string; color: string }> = {
  high: { label: 'High', color: 'text-green-600' },
  medium: { label: 'Medium', color: 'text-amber-600' },
  low: { label: 'Low', color: 'text-red-500' },
};

// ============= SAMPLE DATA =============

const sampleActions: ActionItem[] = [
  {
    id: 'act-001',
    title: 'Launch L&D Awareness Campaign',
    description: 'Learning & Development has only 50% utilization. Many employees are unaware of available courses and budget. Create targeted campaign to increase visibility.',
    type: 'comms',
    priority: 'P1',
    owner: 'Sarah Ahmed',
    ownerId: 'user-001',
    dueDate: addDays(new Date(), 14),
    status: 'in_progress',
    expectedImpact: {
      utilizationChange: 25,
      costAvoidance: 75000,
    },
    confidence: 'high',
    confidenceBasis: 'measured',
    confidenceNote: 'Based on Q3 2024 campaign that achieved 28% uplift',
    linkedEntities: [
      { type: 'benefit', id: 'ben-ld', name: 'Learning & Development' },
      { type: 'metric', id: 'met-util', name: 'L&D Utilization Rate' },
    ],
    linkedMetrics: ['ld_utilization', 'ld_claims_count'],
    activityLog: [
      { id: 'log-001', timestamp: addDays(new Date(), -5), userId: 'user-001', userName: 'Sarah Ahmed', action: 'created', details: 'Action created from Zombie Spend analysis' },
      { id: 'log-002', timestamp: addDays(new Date(), -3), userId: 'user-001', userName: 'Sarah Ahmed', action: 'status_changed', details: 'Status updated', previousValue: 'backlog', newValue: 'in_progress' },
      { id: 'log-003', timestamp: addDays(new Date(), -1), userId: 'user-002', userName: 'Mohammed Ali', action: 'comment', details: 'Email templates ready for review. Slack integration pending IT approval.' },
    ],
    createdAt: addDays(new Date(), -5),
    updatedAt: addDays(new Date(), -1),
    source: 'Zombie Spend Analysis',
  },
  {
    id: 'act-002',
    title: 'Simplify Wellbeing Redemption Process',
    description: 'Current 5-step process has 55% drop-off. Reduce to 2-step flow with auto-approval for amounts under AED 500.',
    type: 'process',
    priority: 'P0',
    owner: 'Fatima Hassan',
    ownerId: 'user-002',
    dueDate: addDays(new Date(), 7),
    status: 'blocked',
    expectedImpact: {
      utilizationChange: 35,
      costAvoidance: 35000,
      satisfactionChange: 12,
    },
    confidence: 'medium',
    confidenceBasis: 'proxy',
    confidenceNote: 'Based on industry benchmarks for similar process improvements',
    linkedEntities: [
      { type: 'benefit', id: 'ben-well', name: 'Wellbeing Program' },
      { type: 'policy', id: 'pol-well-v1', name: 'Wellbeing Policy v1.2' },
    ],
    linkedMetrics: ['wellbeing_utilization', 'wellbeing_drop_off_rate'],
    activityLog: [
      { id: 'log-004', timestamp: addDays(new Date(), -10), userId: 'user-002', userName: 'Fatima Hassan', action: 'created', details: 'Created from Policy Insights recommendation' },
      { id: 'log-005', timestamp: addDays(new Date(), -2), userId: 'user-002', userName: 'Fatima Hassan', action: 'status_changed', details: 'Blocked by IT dependency', previousValue: 'in_progress', newValue: 'blocked' },
    ],
    createdAt: addDays(new Date(), -10),
    updatedAt: addDays(new Date(), -2),
    source: 'Policy Insights',
  },
  {
    id: 'act-003',
    title: 'Rewrite Health Insurance FAQ Section',
    description: 'Policy has 72% clarity score with 8 employee questions monthly. Add flowcharts and video explainers.',
    type: 'policy',
    priority: 'P2',
    owner: 'Ahmed Khalil',
    ownerId: 'user-003',
    dueDate: addDays(new Date(), 21),
    status: 'backlog',
    expectedImpact: {
      slaReduction: 1.5,
      satisfactionChange: 8,
    },
    confidence: 'medium',
    confidenceBasis: 'assumption',
    confidenceNote: 'Based on HR team estimates; no prior data available',
    linkedEntities: [
      { type: 'policy', id: 'pol-health-v3', name: 'Health Insurance Policy v3' },
      { type: 'segment', id: 'seg-new-hires', name: 'New Hires (<6 months)' },
    ],
    linkedMetrics: ['policy_clarity_score', 'hr_ticket_volume'],
    activityLog: [
      { id: 'log-006', timestamp: addDays(new Date(), -3), userId: 'user-003', userName: 'Ahmed Khalil', action: 'created', details: 'Added to backlog from Policy Insights' },
    ],
    createdAt: addDays(new Date(), -3),
    updatedAt: addDays(new Date(), -3),
    source: 'Policy Insights',
  },
  {
    id: 'act-004',
    title: 'Convert Unused Flight Tickets to Vouchers',
    description: '30% of annual flight ticket allowance unused by single employees. Allow conversion to travel vouchers at 80% value.',
    type: 'policy',
    priority: 'P1',
    owner: 'Sarah Ahmed',
    ownerId: 'user-001',
    dueDate: addDays(new Date(), -3), // Overdue
    status: 'in_progress',
    expectedImpact: {
      utilizationChange: 20,
      costAvoidance: 60000,
    },
    confidence: 'low',
    confidenceBasis: 'assumption',
    confidenceNote: 'Pilot needed to validate employee interest',
    linkedEntities: [
      { type: 'benefit', id: 'ben-flight', name: 'Annual Flight Tickets' },
    ],
    linkedMetrics: ['flight_utilization', 'flight_forfeit_rate'],
    activityLog: [
      { id: 'log-007', timestamp: addDays(new Date(), -14), userId: 'user-001', userName: 'Sarah Ahmed', action: 'created', details: 'Created from Executive review' },
      { id: 'log-008', timestamp: addDays(new Date(), -7), userId: 'user-004', userName: 'HR Lead', action: 'comment', details: 'Awaiting legal review of voucher terms' },
    ],
    createdAt: addDays(new Date(), -14),
    updatedAt: addDays(new Date(), -7),
    source: 'Zombie Spend Analysis',
  },
  {
    id: 'act-005',
    title: 'Expand Gym Network Partnership',
    description: 'Current gym partners have limited locations causing 40% non-utilization. Negotiate with 3 additional chains.',
    type: 'vendor',
    priority: 'P2',
    owner: 'Mohammed Ali',
    ownerId: 'user-005',
    dueDate: addDays(new Date(), 45),
    status: 'backlog',
    expectedImpact: {
      utilizationChange: 40,
      costAvoidance: 32000,
    },
    confidence: 'medium',
    confidenceBasis: 'proxy',
    confidenceNote: 'Based on employee survey indicating location as #1 barrier',
    linkedEntities: [
      { type: 'benefit', id: 'ben-gym', name: 'Gym Membership' },
    ],
    linkedMetrics: ['gym_checkin_rate', 'gym_utilization'],
    activityLog: [
      { id: 'log-009', timestamp: addDays(new Date(), -7), userId: 'user-005', userName: 'Mohammed Ali', action: 'created', details: 'Created from Zombie Spend recovery playbook' },
    ],
    createdAt: addDays(new Date(), -7),
    updatedAt: addDays(new Date(), -7),
    source: 'Zombie Spend Analysis',
  },
  {
    id: 'act-006',
    title: 'Implement Auto-Approval for Small Claims',
    description: 'Claims under AED 500 to be auto-approved to reduce SLA by 2 days.',
    type: 'process',
    priority: 'P1',
    owner: 'Fatima Hassan',
    ownerId: 'user-002',
    dueDate: addDays(new Date(), -10),
    status: 'completed',
    expectedImpact: {
      slaReduction: 2,
      satisfactionChange: 15,
    },
    confidence: 'high',
    confidenceBasis: 'measured',
    confidenceNote: 'Achieved 2.1 day reduction in pilot',
    linkedEntities: [
      { type: 'metric', id: 'met-sla', name: 'Claims SLA' },
    ],
    linkedMetrics: ['claims_sla', 'claims_volume'],
    activityLog: [
      { id: 'log-010', timestamp: addDays(new Date(), -30), userId: 'user-002', userName: 'Fatima Hassan', action: 'created', details: 'Created from Ops improvement initiative' },
      { id: 'log-011', timestamp: addDays(new Date(), -10), userId: 'user-002', userName: 'Fatima Hassan', action: 'status_changed', details: 'Completed and deployed', previousValue: 'in_progress', newValue: 'completed' },
    ],
    createdAt: addDays(new Date(), -30),
    updatedAt: addDays(new Date(), -10),
    source: 'HR Ops Initiative',
  },
];

// ============= HELPER COMPONENTS =============

const ImpactBadges = ({ impact }: { impact: ExpectedImpact }) => (
  <div className="flex flex-wrap gap-1">
    {impact.utilizationChange && (
      <Badge variant="outline" className="text-xs border-green-500/30 text-green-600">
        +{impact.utilizationChange}% util
      </Badge>
    )}
    {impact.slaReduction && (
      <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-600">
        -{impact.slaReduction}d SLA
      </Badge>
    )}
    {impact.costAvoidance && (
      <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-600">
        {formatCurrencyAED(impact.costAvoidance, { abbreviate: true })} saved
      </Badge>
    )}
    {impact.satisfactionChange && (
      <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-600">
        +{impact.satisfactionChange}pts ESAT
      </Badge>
    )}
  </div>
);

const ConfidenceBadge = ({ confidence, basis }: { confidence: Confidence; basis: ConfidenceBasis }) => {
  const config = confidenceConfig[confidence];
  return (
    <Badge variant="outline" className={`text-xs ${config.color}`}>
      {config.label} ({basis})
    </Badge>
  );
};

// ============= ACTION CARD COMPONENT =============

interface ActionCardProps {
  action: ActionItem;
  onClick: () => void;
  compact?: boolean;
}

function ActionCard({ action, onClick, compact = false }: ActionCardProps) {
  const TypeIcon = typeConfig[action.type].icon;
  const StatusIcon = statusConfig[action.status].icon;
  const isOverdue = isPast(action.dueDate) && action.status !== 'completed' && action.status !== 'cancelled';

  if (compact) {
    return (
      <div
        onClick={onClick}
        className="p-3 rounded-lg border border-border bg-card hover:border-accent/50 cursor-pointer transition-all group"
      >
        <div className="flex items-start gap-2 mb-2">
          <Badge className={`${priorityConfig[action.priority].bgColor} ${priorityConfig[action.priority].color} border-0 text-[10px]`}>
            {action.priority}
          </Badge>
          {isOverdue && (
            <Badge variant="destructive" className="text-[10px]">Overdue</Badge>
          )}
        </div>
        <h4 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-accent transition-colors">
          {action.title}
        </h4>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Avatar className="h-4 w-4">
              <AvatarFallback className="text-[8px]">{action.owner.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <span className="truncate max-w-[80px]">{action.owner.split(' ')[0]}</span>
          </div>
          <span>{format(action.dueDate, 'MMM d')}</span>
        </div>
      </div>
    );
  }

  return (
    <Card 
      onClick={onClick}
      className="cursor-pointer hover:border-accent/50 transition-all group"
    >
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded ${typeConfig[action.type].color} bg-muted/50`}>
              <TypeIcon className="h-4 w-4" />
            </div>
            <Badge className={`${priorityConfig[action.priority].bgColor} ${priorityConfig[action.priority].color} border-0`}>
              {action.priority}
            </Badge>
            <Badge variant="outline" className={statusConfig[action.status].color}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusConfig[action.status].label}
            </Badge>
          </div>
          {isOverdue && (
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Overdue
            </Badge>
          )}
        </div>

        <h3 className="font-semibold mb-2 group-hover:text-accent transition-colors">{action.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{action.description}</p>

        <div className="flex flex-wrap gap-2 mb-3">
          <ImpactBadges impact={action.expectedImpact} />
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-[10px]">{action.owner.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <span>{action.owner}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{format(action.dueDate, 'MMM d, yyyy')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============= DETAIL SHEET COMPONENT =============

interface ActionDetailSheetProps {
  action: ActionItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (actionId: string, newStatus: Status) => void;
  onAddComment: (actionId: string, comment: string) => void;
}

function ActionDetailSheet({ action, open, onOpenChange, onStatusChange, onAddComment }: ActionDetailSheetProps) {
  const [comment, setComment] = useState('');

  if (!action) return null;

  const TypeIcon = typeConfig[action.type].icon;
  const StatusIcon = statusConfig[action.status].icon;
  const isOverdue = isPast(action.dueDate) && action.status !== 'completed' && action.status !== 'cancelled';

  const handleAddComment = () => {
    if (comment.trim()) {
      onAddComment(action.id, comment);
      setComment('');
    }
  };

  // Calculate total expected impact
  const totalImpact = (action.expectedImpact.costAvoidance || 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl overflow-hidden flex flex-col">
        <SheetHeader className="shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-2 rounded-lg ${typeConfig[action.type].color} bg-muted/50`}>
              <TypeIcon className="h-5 w-5" />
            </div>
            <Badge className={`${priorityConfig[action.priority].bgColor} ${priorityConfig[action.priority].color} border-0`}>
              {priorityConfig[action.priority].label}
            </Badge>
            {isOverdue && <Badge variant="destructive">Overdue</Badge>}
          </div>
          <SheetTitle>{action.title}</SheetTitle>
          <SheetDescription>{action.description}</SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 py-4">
            {/* Status & Assignment */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Status</Label>
                <Select 
                  value={action.status} 
                  onValueChange={(v) => onStatusChange(action.id, v as Status)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <config.icon className={`h-4 w-4 ${config.color}`} />
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Owner</Label>
                <div className="flex items-center gap-2 p-2 border rounded-md">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">{action.owner.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{action.owner}</span>
                </div>
              </div>
            </div>

            {/* Due Date & Source */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Due Date</Label>
                <div className={`flex items-center gap-2 p-2 border rounded-md ${isOverdue ? 'border-red-500/50 bg-red-500/5' : ''}`}>
                  <Calendar className={`h-4 w-4 ${isOverdue ? 'text-red-500' : 'text-muted-foreground'}`} />
                  <span className={`text-sm ${isOverdue ? 'text-red-500' : ''}`}>
                    {format(action.dueDate, 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Source</Label>
                <div className="flex items-center gap-2 p-2 border rounded-md">
                  <Lightbulb className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{action.source || 'Manual'}</span>
                </div>
              </div>
            </div>

            {/* Expected Impact */}
            <Card className="bg-accent/5 border-accent/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="h-4 w-4 text-accent" />
                  Expected Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                  {action.expectedImpact.utilizationChange && (
                    <div>
                      <p className="text-muted-foreground text-xs">Utilization</p>
                      <p className="font-semibold text-green-600">+{action.expectedImpact.utilizationChange}%</p>
                    </div>
                  )}
                  {action.expectedImpact.slaReduction && (
                    <div>
                      <p className="text-muted-foreground text-xs">SLA Reduction</p>
                      <p className="font-semibold text-blue-600">-{action.expectedImpact.slaReduction} days</p>
                    </div>
                  )}
                  {action.expectedImpact.costAvoidance && (
                    <div>
                      <p className="text-muted-foreground text-xs">Cost Avoidance</p>
                      <p className="font-semibold text-amber-600">{formatCurrencyAED(action.expectedImpact.costAvoidance)}</p>
                    </div>
                  )}
                  {action.expectedImpact.satisfactionChange && (
                    <div>
                      <p className="text-muted-foreground text-xs">Satisfaction</p>
                      <p className="font-semibold text-purple-600">+{action.expectedImpact.satisfactionChange} pts</p>
                    </div>
                  )}
                </div>
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Confidence</span>
                    <ConfidenceBadge confidence={action.confidence} basis={action.confidenceBasis} />
                  </div>
                  {action.confidenceNote && (
                    <p className="text-xs text-muted-foreground mt-1 italic">"{action.confidenceNote}"</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Linked Entities */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Linked To</Label>
              <div className="flex flex-wrap gap-2">
                {action.linkedEntities.map((entity, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {entity.type === 'benefit' && <TrendingUp className="h-3 w-3 mr-1" />}
                    {entity.type === 'policy' && <FileText className="h-3 w-3 mr-1" />}
                    {entity.type === 'segment' && <Users className="h-3 w-3 mr-1" />}
                    {entity.type === 'metric' && <BarChart3 className="h-3 w-3 mr-1" />}
                    {entity.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Activity Log */}
            <div className="space-y-3">
              <Label className="text-xs text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Activity Log
              </Label>
              <div className="space-y-3 max-h-[200px] overflow-y-auto">
                {action.activityLog.map((entry) => (
                  <div key={entry.id} className="flex gap-3 text-sm">
                    <Avatar className="h-6 w-6 shrink-0">
                      <AvatarFallback className="text-[10px]">{entry.userName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="font-medium text-xs">{entry.userName}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(entry.timestamp, { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{entry.details}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Comment */}
              <div className="flex gap-2 pt-2">
                <Input
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                  className="text-sm"
                />
                <Button size="sm" onClick={handleAddComment} disabled={!comment.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>

        <SheetFooter className="shrink-0 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          {action.status === 'in_progress' && (
            <Button onClick={() => onStatusChange(action.id, 'completed')}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark Complete
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// ============= MAIN COMPONENT =============

export default function RecommendationsPage() {
  const [actions, setActions] = useState<ActionItem[]>(sampleActions);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [selectedAction, setSelectedAction] = useState<ActionItem | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<ActionType | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');

  const coverageMetrics = useDataCoverageMetrics();

  // Filter actions
  const filteredActions = actions.filter(a => {
    if (typeFilter !== 'all' && a.type !== typeFilter) return false;
    if (priorityFilter !== 'all' && a.priority !== priorityFilter) return false;
    return true;
  });

  // Group by status for Kanban
  const kanbanColumns: { status: Status; title: string; actions: ActionItem[] }[] = [
    { status: 'backlog', title: 'Backlog', actions: filteredActions.filter(a => a.status === 'backlog') },
    { status: 'in_progress', title: 'In Progress', actions: filteredActions.filter(a => a.status === 'in_progress') },
    { status: 'blocked', title: 'Blocked', actions: filteredActions.filter(a => a.status === 'blocked') },
    { status: 'completed', title: 'Completed', actions: filteredActions.filter(a => a.status === 'completed') },
  ];

  // Executive summary metrics
  const inProgressCount = actions.filter(a => a.status === 'in_progress').length;
  const overdueCount = actions.filter(a => isPast(a.dueDate) && !['completed', 'cancelled'].includes(a.status)).length;
  const blockedCount = actions.filter(a => a.status === 'blocked').length;
  const expectedImpactThisQuarter = actions
    .filter(a => a.status !== 'cancelled')
    .reduce((sum, a) => sum + (a.expectedImpact.costAvoidance || 0), 0);

  const handleOpenDetail = (action: ActionItem) => {
    setSelectedAction(action);
    setDetailSheetOpen(true);
  };

  const handleStatusChange = (actionId: string, newStatus: Status) => {
    setActions(prev => prev.map(a => {
      if (a.id === actionId) {
        const newLog: ActivityLogEntry = {
          id: `log-${Date.now()}`,
          timestamp: new Date(),
          userId: 'current-user',
          userName: 'You',
          action: 'status_changed',
          details: 'Status updated',
          previousValue: a.status,
          newValue: newStatus,
        };
        return { ...a, status: newStatus, activityLog: [...a.activityLog, newLog], updatedAt: new Date() };
      }
      return a;
    }));
    toast.success(`Status updated to ${statusConfig[newStatus].label}`);
  };

  const handleAddComment = (actionId: string, comment: string) => {
    setActions(prev => prev.map(a => {
      if (a.id === actionId) {
        const newLog: ActivityLogEntry = {
          id: `log-${Date.now()}`,
          timestamp: new Date(),
          userId: 'current-user',
          userName: 'You',
          action: 'comment',
          details: comment,
        };
        return { ...a, activityLog: [...a.activityLog, newLog], updatedAt: new Date() };
      }
      return a;
    }));
    // Update selectedAction if it's the one being modified
    if (selectedAction?.id === actionId) {
      setSelectedAction(prev => prev ? {
        ...prev,
        activityLog: [...prev.activityLog, {
          id: `log-${Date.now()}`,
          timestamp: new Date(),
          userId: 'current-user',
          userName: 'You',
          action: 'comment',
          details: comment,
        }],
      } : null);
    }
    toast.success('Comment added');
  };

  return (
    <PageConfidenceGate metrics={coverageMetrics} threshold={70}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Target className="h-8 w-8 text-accent" />
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Benefits Action Plan</h1>
              <p className="text-muted-foreground">Track and measure recommendations with full confidence transparency</p>
            </div>
          </div>
          <DataConfidenceBadge metrics={coverageMetrics} />
        </div>

        <EmployerGlobalFiltersBar />

        {/* Executive Summary Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-blue-500/5 border-blue-500/20">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <PlayCircle className="h-6 w-6 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{inProgressCount}</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={`${overdueCount > 0 ? 'bg-red-500/5 border-red-500/20' : ''}`}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className={`h-6 w-6 ${overdueCount > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
                <div>
                  <p className={`text-2xl font-bold ${overdueCount > 0 ? 'text-red-500' : ''}`}>{overdueCount}</p>
                  <p className="text-xs text-muted-foreground">Overdue</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={`${blockedCount > 0 ? 'bg-amber-500/5 border-amber-500/20' : ''}`}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <PauseCircle className={`h-6 w-6 ${blockedCount > 0 ? 'text-amber-500' : 'text-muted-foreground'}`} />
                <div>
                  <p className={`text-2xl font-bold ${blockedCount > 0 ? 'text-amber-500' : ''}`}>{blockedCount}</p>
                  <p className="text-xs text-muted-foreground">Blocked</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-green-500/5 border-green-500/20">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-6 w-6 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-green-600">{formatCurrencyAED(expectedImpactThisQuarter, { abbreviate: true })}</p>
                  <p className="text-xs text-muted-foreground">Expected Impact</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & View Toggle */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as ActionType | 'all')}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(typeConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <config.icon className={`h-4 w-4 ${config.color}`} />
                      {config.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as Priority | 'all')}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {Object.entries(priorityConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <span className={config.color}>{config.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('kanban')}
            >
              <LayoutGrid className="h-4 w-4 mr-1" />
              Kanban
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <List className="h-4 w-4 mr-1" />
              Table
            </Button>
          </div>
        </div>

        {/* Kanban View */}
        {viewMode === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kanbanColumns.map((column) => {
              const StatusIcon = statusConfig[column.status].icon;
              return (
                <div key={column.status} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`h-4 w-4 ${statusConfig[column.status].color}`} />
                      <h3 className="font-medium text-sm">{column.title}</h3>
                    </div>
                    <Badge variant="secondary" className="text-xs">{column.actions.length}</Badge>
                  </div>
                  <div className="space-y-2 min-h-[200px] p-2 rounded-lg bg-muted/30">
                    {column.actions.map((action) => (
                      <ActionCard
                        key={action.id}
                        action={action}
                        onClick={() => handleOpenDetail(action)}
                        compact
                      />
                    ))}
                    {column.actions.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No items
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">P</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead className="w-[100px]">Type</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="w-[120px]">Owner</TableHead>
                    <TableHead className="w-[100px]">Due</TableHead>
                    <TableHead className="w-[140px]">Impact</TableHead>
                    <TableHead className="w-[100px]">Confidence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActions.map((action) => {
                    const TypeIcon = typeConfig[action.type].icon;
                    const StatusIcon = statusConfig[action.status].icon;
                    const isOverdue = isPast(action.dueDate) && !['completed', 'cancelled'].includes(action.status);

                    return (
                      <TableRow 
                        key={action.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleOpenDetail(action)}
                      >
                        <TableCell>
                          <Badge className={`${priorityConfig[action.priority].bgColor} ${priorityConfig[action.priority].color} border-0 text-xs`}>
                            {action.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm line-clamp-1">{action.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">{action.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <TypeIcon className={`h-4 w-4 ${typeConfig[action.type].color}`} />
                            <span className="text-xs">{typeConfig[action.type].label}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${statusConfig[action.status].color} text-xs`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig[action.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-[10px]">{action.owner.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs truncate max-w-[80px]">{action.owner.split(' ')[0]}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`text-xs ${isOverdue ? 'text-red-500 font-medium' : ''}`}>
                            {format(action.dueDate, 'MMM d')}
                            {isOverdue && ' ⚠'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {action.expectedImpact.costAvoidance ? (
                            <span className="text-xs text-green-600 font-medium">
                              {formatCurrencyAED(action.expectedImpact.costAvoidance, { abbreviate: true })}
                            </span>
                          ) : action.expectedImpact.utilizationChange ? (
                            <span className="text-xs text-green-600 font-medium">
                              +{action.expectedImpact.utilizationChange}% util
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <ConfidenceBadge confidence={action.confidence} basis={action.confidenceBasis} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Detail Sheet */}
        <ActionDetailSheet
          action={selectedAction}
          open={detailSheetOpen}
          onOpenChange={setDetailSheetOpen}
          onStatusChange={handleStatusChange}
          onAddComment={handleAddComment}
        />
      </div>
    </PageConfidenceGate>
  );
}
