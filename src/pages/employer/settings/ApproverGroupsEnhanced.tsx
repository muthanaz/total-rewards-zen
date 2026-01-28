/**
 * Enhanced Approver Groups Page
 * 
 * Group membership, coverage gaps, and conflicts detection.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { 
  Users, 
  Plus, 
  Trash2, 
  UserPlus,
  AlertTriangle,
  Shield,
  Clock,
  Activity,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface ApproverMember {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  avgResponseTimeHours: number;
  pendingApprovals: number;
}

interface CoverageGap {
  id: string;
  type: 'no_backup' | 'single_point' | 'timezone' | 'vacation';
  severity: 'high' | 'medium' | 'low';
  description: string;
  recommendation: string;
}

interface ApproverConflict {
  id: string;
  type: 'dual_role' | 'reporting_line' | 'self_approval';
  memberId: string;
  memberName: string;
  description: string;
}

interface ApproverGroup {
  id: string;
  name: string;
  description?: string;
  members: ApproverMember[];
  coverageGaps: CoverageGap[];
  conflicts: ApproverConflict[];
  metrics: {
    activeMembers: number;
    avgResponseTime: number;
    currentLoad: number;
    slaCompliance: number;
  };
}

// Mock data
const MOCK_GROUPS: ApproverGroup[] = [
  {
    id: 'group-1',
    name: 'HR Team',
    description: 'Human Resources approval team for employee benefits claims',
    members: [
      {
        id: 'm-1',
        userId: 'u-1',
        firstName: 'Sarah',
        lastName: 'Ahmed',
        email: 'sarah.ahmed@company.com',
        isActive: true,
        avgResponseTimeHours: 4.2,
        pendingApprovals: 3,
      },
      {
        id: 'm-2',
        userId: 'u-2',
        firstName: 'Mohammed',
        lastName: 'Ali',
        email: 'mohammed.ali@company.com',
        isActive: true,
        avgResponseTimeHours: 6.8,
        pendingApprovals: 7,
      },
    ],
    coverageGaps: [
      {
        id: 'gap-1',
        type: 'no_backup',
        severity: 'high',
        description: 'No backup approver during UAE National Day holiday (Dec 2-3)',
        recommendation: 'Add a temporary approver or enable auto-escalation',
      },
    ],
    conflicts: [],
    metrics: {
      activeMembers: 2,
      avgResponseTime: 5.5,
      currentLoad: 10,
      slaCompliance: 94,
    },
  },
  {
    id: 'group-2',
    name: 'Finance Team',
    description: 'Finance approval for high-value claims and settlements',
    members: [
      {
        id: 'm-3',
        userId: 'u-3',
        firstName: 'Fatima',
        lastName: 'Hassan',
        email: 'fatima.hassan@company.com',
        isActive: true,
        avgResponseTimeHours: 8.1,
        pendingApprovals: 12,
      },
    ],
    coverageGaps: [
      {
        id: 'gap-2',
        type: 'single_point',
        severity: 'high',
        description: 'Only one active approver - single point of failure',
        recommendation: 'Add at least one more team member as backup approver',
      },
    ],
    conflicts: [
      {
        id: 'conf-1',
        type: 'dual_role',
        memberId: 'm-3',
        memberName: 'Fatima Hassan',
        description: 'Member can both submit and approve claims (conflict of interest)',
      },
    ],
    metrics: {
      activeMembers: 1,
      avgResponseTime: 8.1,
      currentLoad: 12,
      slaCompliance: 78,
    },
  },
  {
    id: 'group-3',
    name: 'Department Heads',
    description: 'Department heads for departmental policy exceptions',
    members: [
      {
        id: 'm-4',
        userId: 'u-4',
        firstName: 'Ahmad',
        lastName: 'Khalil',
        email: 'ahmad.khalil@company.com',
        isActive: true,
        avgResponseTimeHours: 12.3,
        pendingApprovals: 5,
      },
      {
        id: 'm-5',
        userId: 'u-5',
        firstName: 'Layla',
        lastName: 'Omar',
        email: 'layla.omar@company.com',
        isActive: false,
        avgResponseTimeHours: 0,
        pendingApprovals: 0,
      },
    ],
    coverageGaps: [],
    conflicts: [],
    metrics: {
      activeMembers: 1,
      avgResponseTime: 12.3,
      currentLoad: 5,
      slaCompliance: 85,
    },
  },
];

export default function ApproverGroupsPage() {
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';
  
  const [groups, setGroups] = useState<ApproverGroup[]>(MOCK_GROUPS);
  const [selectedGroup, setSelectedGroup] = useState<ApproverGroup | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');

  // Aggregate stats
  const totalGaps = groups.reduce((sum, g) => sum + g.coverageGaps.length, 0);
  const totalConflicts = groups.reduce((sum, g) => sum + g.conflicts.length, 0);
  const avgSlaCompliance = groups.reduce((sum, g) => sum + g.metrics.slaCompliance, 0) / groups.length;

  const handleOpenDetail = (group: ApproverGroup) => {
    setSelectedGroup(group);
    setDetailSheetOpen(true);
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    
    const newGroup: ApproverGroup = {
      id: `group-${Date.now()}`,
      name: newGroupName,
      description: newGroupDescription || undefined,
      members: [],
      coverageGaps: [],
      conflicts: [],
      metrics: {
        activeMembers: 0,
        avgResponseTime: 0,
        currentLoad: 0,
        slaCompliance: 100,
      },
    };
    
    setGroups([...groups, newGroup]);
    setNewGroupName('');
    setNewGroupDescription('');
    setCreateDialogOpen(false);
    toast.success('Approver group created');
  };

  const getSeverityColor = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'low':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {isRTL ? 'مجموعات الموافقين' : 'Approver Groups'}
            </h1>
            <p className="text-muted-foreground">
              {isRTL 
                ? 'إدارة المجموعات والتغطية والتعارضات'
                : 'Manage groups, coverage, and detect conflicts'
              }
            </p>
          </div>
        </div>
        
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Group
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{groups.length}</p>
                <p className="text-xs text-muted-foreground">Active Groups</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Activity className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgSlaCompliance.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Avg SLA Compliance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(totalGaps > 0 && 'border-amber-500/30')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-lg', totalGaps > 0 ? 'bg-amber-500/10' : 'bg-muted')}>
                <AlertTriangle className={cn('w-5 h-5', totalGaps > 0 ? 'text-amber-600' : 'text-muted-foreground')} />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalGaps}</p>
                <p className="text-xs text-muted-foreground">Coverage Gaps</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(totalConflicts > 0 && 'border-destructive/30')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-lg', totalConflicts > 0 ? 'bg-destructive/10' : 'bg-muted')}>
                <Shield className={cn('w-5 h-5', totalConflicts > 0 ? 'text-destructive' : 'text-muted-foreground')} />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalConflicts}</p>
                <p className="text-xs text-muted-foreground">Conflicts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group) => (
          <Card
            key={group.id}
            className={cn(
              'cursor-pointer hover:border-primary/30 transition-colors',
              (group.coverageGaps.length > 0 || group.conflicts.length > 0) && 'border-amber-500/30'
            )}
            onClick={() => handleOpenDetail(group)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{group.name}</CardTitle>
                  {group.description && (
                    <CardDescription className="mt-1 line-clamp-2">
                      {group.description}
                    </CardDescription>
                  )}
                </div>
                <Badge variant="secondary">{group.members.length} members</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Member Avatars */}
              <div className="flex -space-x-2">
                {group.members.slice(0, 4).map((member) => (
                  <div
                    key={member.id}
                    className={cn(
                      'w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-xs font-medium',
                      member.isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    )}
                    title={`${member.firstName} ${member.lastName}`}
                  >
                    {member.firstName[0]}
                  </div>
                ))}
                {group.members.length > 4 && (
                  <div className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs">
                    +{group.members.length - 4}
                  </div>
                )}
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{group.metrics.avgResponseTime.toFixed(1)}h avg response</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Activity className="w-3 h-3" />
                  <span>{group.metrics.currentLoad} pending</span>
                </div>
              </div>

              {/* SLA Compliance */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">SLA Compliance</span>
                  <span className={cn(
                    'font-medium',
                    group.metrics.slaCompliance >= 90 ? 'text-emerald-600' :
                    group.metrics.slaCompliance >= 75 ? 'text-amber-600' : 'text-destructive'
                  )}>
                    {group.metrics.slaCompliance}%
                  </span>
                </div>
                <Progress value={group.metrics.slaCompliance} className="h-1.5" />
              </div>

              {/* Alerts */}
              {(group.coverageGaps.length > 0 || group.conflicts.length > 0) && (
                <div className="flex gap-2 pt-2 border-t">
                  {group.coverageGaps.length > 0 && (
                    <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {group.coverageGaps.length} gap{group.coverageGaps.length > 1 ? 's' : ''}
                    </Badge>
                  )}
                  {group.conflicts.length > 0 && (
                    <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[10px]">
                      <Shield className="w-3 h-3 mr-1" />
                      {group.conflicts.length} conflict{group.conflicts.length > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detail Sheet */}
      <Sheet open={detailSheetOpen} onOpenChange={setDetailSheetOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              {selectedGroup?.name}
            </SheetTitle>
            <SheetDescription>
              {selectedGroup?.description || 'Manage group members and view coverage analysis'}
            </SheetDescription>
          </SheetHeader>

          {selectedGroup && (
            <Tabs defaultValue="members" className="mt-6">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="gaps" className="relative">
                  Gaps
                  {selectedGroup.coverageGaps.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-[10px] text-white flex items-center justify-center">
                      {selectedGroup.coverageGaps.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="conflicts" className="relative">
                  Conflicts
                  {selectedGroup.conflicts.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-[10px] text-white flex items-center justify-center">
                      {selectedGroup.conflicts.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="members" className="mt-4 space-y-3">
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <UserPlus className="w-4 h-4" />
                  Add Member
                </Button>
                
                {selectedGroup.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium',
                        member.isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                      )}>
                        {member.firstName[0]}{member.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={member.isActive ? 'default' : 'secondary'} className="text-[10px]">
                        {member.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {member.pendingApprovals} pending
                      </p>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="gaps" className="mt-4 space-y-3">
                {selectedGroup.coverageGaps.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
                    <p className="text-sm font-medium">No Coverage Gaps</p>
                    <p className="text-xs text-muted-foreground">Group coverage looks good</p>
                  </div>
                ) : (
                  selectedGroup.coverageGaps.map((gap) => (
                    <div
                      key={gap.id}
                      className={cn(
                        'p-3 rounded-lg border',
                        gap.severity === 'high' && 'bg-destructive/5 border-destructive/20',
                        gap.severity === 'medium' && 'bg-amber-500/5 border-amber-500/20',
                        gap.severity === 'low' && 'bg-blue-500/5 border-blue-500/20'
                      )}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <AlertTriangle className={cn(
                          'w-4 h-4 mt-0.5',
                          gap.severity === 'high' && 'text-destructive',
                          gap.severity === 'medium' && 'text-amber-600',
                          gap.severity === 'low' && 'text-blue-600'
                        )} />
                        <div>
                          <p className="text-sm font-medium">{gap.description}</p>
                          <Badge variant="outline" className={cn('text-[10px] mt-1', getSeverityColor(gap.severity))}>
                            {gap.type.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground ml-6">
                        <strong>Recommendation:</strong> {gap.recommendation}
                      </p>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="conflicts" className="mt-4 space-y-3">
                {selectedGroup.conflicts.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
                    <p className="text-sm font-medium">No Conflicts Detected</p>
                    <p className="text-xs text-muted-foreground">No role conflicts found</p>
                  </div>
                ) : (
                  selectedGroup.conflicts.map((conflict) => (
                    <div
                      key={conflict.id}
                      className="p-3 rounded-lg border bg-destructive/5 border-destructive/20"
                    >
                      <div className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-destructive mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">{conflict.memberName}</p>
                          <Badge variant="outline" className="text-[10px] mt-1 bg-destructive/10 text-destructive border-destructive/20">
                            {conflict.type.replace('_', ' ')}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-2">
                            {conflict.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          )}
        </SheetContent>
      </Sheet>

      {/* Create Group Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Approver Group</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Group Name *</Label>
              <Input
                placeholder="e.g., Finance Leads"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Optional description..."
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateGroup} disabled={!newGroupName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
