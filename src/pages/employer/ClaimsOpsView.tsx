import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  ClipboardCheck, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter, 
  Eye, 
  AlertTriangle,
  Timer,
  UserCheck,
  Lock,
  Download,
  UserPlus,
  FileText,
  ArrowUpDown,
  CalendarIcon,
  X,
  ChevronDown,
  DollarSign,
  AlertCircle,
  Inbox,
  Hourglass,
  Flame,
  FileQuestion,
  TrendingUp,
  Flag,
  CheckCircle2,
  XCircle as XCircleIcon,
  Mail,
  MoreHorizontal,
  Info
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { EmployerGlobalFiltersBar } from '@/components/employer';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { useEmployerPermissions } from '@/hooks/useEmployerPermissions';
import { ClaimReviewSheet } from '@/components/employer/ClaimReviewSheet';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Types
interface QueueRequest {
  id: string;
  employeeName: string;
  employeeId: string;
  userId: string;
  type: 'claim' | 'request' | 'question';
  category: string;
  subject: string;
  description: string;
  amount?: number;
  status: 'pending' | 'submitted' | 'in_review' | 'approved' | 'rejected' | 'paid' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: string;
  slaDeadline: string;
  lastStatusChangeAt: string;
  assignedTo?: string;
  assignedToName?: string;
  hasMissingDocs: boolean;
  riskLevel: 'low' | 'medium' | 'high';
}

// Queue Tab definitions
type QueueTab = 'all' | 'pending' | 'in_review' | 'sla_risk' | 'missing_docs' | 'high_value';

const QUEUE_TABS: { value: QueueTab; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'All', icon: <Inbox className="w-4 h-4" /> },
  { value: 'pending', label: 'Pending', icon: <Clock className="w-4 h-4" /> },
  { value: 'in_review', label: 'In Review', icon: <Hourglass className="w-4 h-4" /> },
  { value: 'sla_risk', label: 'SLA Risk', icon: <Flame className="w-4 h-4" /> },
  { value: 'missing_docs', label: 'Missing Docs', icon: <FileQuestion className="w-4 h-4" /> },
  { value: 'high_value', label: 'High Value', icon: <TrendingUp className="w-4 h-4" /> },
];

const HIGH_VALUE_THRESHOLD = 5000; // AED

// Categories for filtering
const CATEGORIES = [
  'All Categories',
  'Health Insurance',
  'Transport',
  'Housing',
  'Learning & Development',
  'Wellbeing',
  'Schooling',
  'Leave',
  'Per Diem',
  'Other',
];

const PRIORITIES = [
  { value: 'all', label: 'All Priorities' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'normal', label: 'Normal' },
  { value: 'low', label: 'Low' },
];

// Mock data with enhanced fields
const mockRequests: QueueRequest[] = [
  {
    id: '1',
    employeeName: 'Ahmed Al-Rashid',
    employeeId: 'EMP001',
    userId: 'user-1',
    type: 'claim',
    category: 'Health Insurance',
    subject: 'Dental Claim Reimbursement',
    description: 'Dental cleaning and checkup at Dr. Smile Clinic on Jan 5, 2024. Receipt attached.',
    amount: 450,
    status: 'pending',
    priority: 'normal',
    createdAt: '2024-01-08T10:30:00',
    slaDeadline: '2024-01-11T10:30:00',
    lastStatusChangeAt: '2024-01-08T10:30:00',
    hasMissingDocs: false,
    riskLevel: 'low',
  },
  {
    id: '2',
    employeeName: 'Sarah Johnson',
    employeeId: 'EMP015',
    userId: 'user-2',
    type: 'request',
    category: 'Learning & Development',
    subject: 'Course Approval - AWS Certification',
    description: 'Requesting approval for AWS Solutions Architect certification course at AED 2,500.',
    amount: 2500,
    status: 'pending',
    priority: 'high',
    createdAt: '2024-01-07T14:15:00',
    slaDeadline: '2024-01-10T14:15:00',
    lastStatusChangeAt: '2024-01-07T14:15:00',
    assignedTo: 'user-manager-1',
    assignedToName: 'L&D Manager',
    hasMissingDocs: true,
    riskLevel: 'medium',
  },
  {
    id: '3',
    employeeName: 'Mohammed Hassan',
    employeeId: 'EMP023',
    userId: 'user-3',
    type: 'claim',
    category: 'Transport',
    subject: 'Fuel Reimbursement - December',
    description: 'Monthly fuel expenses for December 2023. Total: AED 800.',
    amount: 800,
    status: 'approved',
    priority: 'normal',
    createdAt: '2024-01-02T09:00:00',
    slaDeadline: '2024-01-05T09:00:00',
    lastStatusChangeAt: '2024-01-03T11:30:00',
    hasMissingDocs: false,
    riskLevel: 'low',
  },
  {
    id: '4',
    employeeName: 'Lisa Chen',
    employeeId: 'EMP042',
    userId: 'user-4',
    type: 'question',
    category: 'Housing',
    subject: 'Housing Allowance Top-up Query',
    description: 'Can I use savings from other benefits to top up housing allowance? My rent exceeds the allowance by AED 2,000/month.',
    status: 'in_review',
    priority: 'urgent',
    createdAt: '2024-01-06T16:45:00',
    slaDeadline: '2024-01-09T16:45:00',
    lastStatusChangeAt: '2024-01-07T09:00:00',
    assignedTo: 'user-hr-1',
    assignedToName: 'HR Manager',
    hasMissingDocs: false,
    riskLevel: 'high',
  },
  {
    id: '5',
    employeeName: 'Omar Khalil',
    employeeId: 'EMP008',
    userId: 'user-5',
    type: 'claim',
    category: 'Wellbeing',
    subject: 'Gym Membership Reimbursement',
    description: 'Annual gym membership at Fitness First - Dubai Marina. Receipt attached.',
    amount: 3600,
    status: 'rejected',
    priority: 'normal',
    createdAt: '2024-01-04T12:00:00',
    slaDeadline: '2024-01-07T12:00:00',
    lastStatusChangeAt: '2024-01-05T10:00:00',
    hasMissingDocs: false,
    riskLevel: 'medium',
  },
  {
    id: '6',
    employeeName: 'Fatima Al-Zahra',
    employeeId: 'EMP056',
    userId: 'user-6',
    type: 'claim',
    category: 'Schooling',
    subject: 'School Tuition Fee - Term 2',
    description: 'Tuition fee for GEMS Wellington Academy, Term 2 2024.',
    amount: 12000,
    status: 'pending',
    priority: 'high',
    createdAt: '2024-01-09T08:00:00',
    slaDeadline: '2024-01-12T08:00:00',
    lastStatusChangeAt: '2024-01-09T08:00:00',
    hasMissingDocs: true,
    riskLevel: 'medium',
  },
  {
    id: '7',
    employeeName: 'John Smith',
    employeeId: 'EMP033',
    userId: 'user-7',
    type: 'claim',
    category: 'Health Insurance',
    subject: 'Emergency Medical Treatment',
    description: 'Emergency treatment at American Hospital Dubai.',
    amount: 8500,
    status: 'pending',
    priority: 'urgent',
    createdAt: '2024-01-10T06:00:00',
    slaDeadline: '2024-01-11T06:00:00',
    lastStatusChangeAt: '2024-01-10T06:00:00',
    hasMissingDocs: false,
    riskLevel: 'high',
  },
];

// Mock employer users for assignment
const mockEmployerUsers = [
  { id: 'user-hr-1', name: 'HR Manager' },
  { id: 'user-hr-2', name: 'HR Specialist' },
  { id: 'user-manager-1', name: 'L&D Manager' },
  { id: 'user-finance-1', name: 'Finance Lead' },
];

export function ClaimsOpsView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { hasPermission } = useEmployerPermissions();
  const canProcessClaims = hasPermission('can_process_claims');
  const { user } = useAuth();

  // URL-persisted state
  const activeTab = (searchParams.get('tab') as QueueTab) || 'pending';
  const searchQuery = searchParams.get('search') || '';
  const statusFilter = searchParams.get('status') || 'all';
  const categoryFilter = searchParams.get('category') || 'All Categories';
  const assignedFilter = searchParams.get('assigned') || 'all';
  const priorityFilter = searchParams.get('priority') || 'all';
  const minAmount = searchParams.get('minAmount') ? Number(searchParams.get('minAmount')) : undefined;
  const maxAmount = searchParams.get('maxAmount') ? Number(searchParams.get('maxAmount')) : undefined;
  const dateFrom = searchParams.get('dateFrom') || '';
  const dateTo = searchParams.get('dateTo') || '';
  // Persist SLA sort preference in localStorage
  const [localSlaSort, setLocalSlaSort] = useState(() => {
    const saved = localStorage.getItem('employer_claims_sla_sort');
    return saved === 'true' || searchParams.get('slaSort') === 'true';
  });
  const sortBySlaRisk = localSlaSort;

  // Local state
  const [requests, setRequests] = useState<QueueRequest[]>(mockRequests);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [selectedForBulk, setSelectedForBulk] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [bulkAssignOpen, setBulkAssignOpen] = useState(false);
  const [bulkPriorityOpen, setBulkPriorityOpen] = useState(false);

  // Handle SLA sort toggle with persistence
  const handleSlaSortToggle = (checked: boolean) => {
    setLocalSlaSort(checked);
    localStorage.setItem('employer_claims_sla_sort', checked ? 'true' : 'false');
    updateParam('slaSort', checked ? 'true' : null);
  };

  // Fetch organization ID from profile
  const { data: profileData } = useQuery({
    queryKey: ['profile_org', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });
  const organizationId = profileData?.organization_id || null;

  // Update URL params helper
  const updateParam = useCallback((key: string, value: string | null) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (value === null || value === '' || value === 'all' || value === 'All Categories') {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      return next;
    });
  }, [setSearchParams]);

  // SLA calculation helper
  const getSlaInfo = useCallback((deadline: string, status: string) => {
    if (['approved', 'rejected', 'paid', 'closed'].includes(status)) return null;
    const now = new Date();
    const sla = new Date(deadline);
    const hoursRemaining = (sla.getTime() - now.getTime()) / (1000 * 60 * 60);
    return {
      hoursRemaining,
      isOverdue: hoursRemaining < 0,
      isUrgent: hoursRemaining > 0 && hoursRemaining < 24,
      isOnTrack: hoursRemaining >= 24,
    };
  }, []);

  // Filter and sort requests
  const filteredRequests = useMemo(() => {
    let result = [...requests];

    // Tab-based filtering
    switch (activeTab) {
      case 'pending':
        result = result.filter(r => r.status === 'pending' || r.status === 'submitted');
        break;
      case 'in_review':
        result = result.filter(r => r.status === 'in_review');
        break;
      case 'sla_risk':
        result = result.filter(r => {
          const sla = getSlaInfo(r.slaDeadline, r.status);
          return sla && (sla.isOverdue || sla.isUrgent);
        });
        break;
      case 'missing_docs':
        result = result.filter(r => r.hasMissingDocs);
        break;
      case 'high_value':
        result = result.filter(r => r.amount && r.amount >= HIGH_VALUE_THRESHOLD);
        break;
    }

    // Additional filters
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r =>
        r.employeeName.toLowerCase().includes(q) ||
        r.subject.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.employeeId.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(r => r.status === statusFilter);
    }

    if (categoryFilter !== 'All Categories') {
      result = result.filter(r => r.category === categoryFilter);
    }

    if (assignedFilter !== 'all') {
      if (assignedFilter === 'unassigned') {
        result = result.filter(r => !r.assignedTo);
      } else {
        result = result.filter(r => r.assignedTo === assignedFilter);
      }
    }

    if (priorityFilter !== 'all') {
      result = result.filter(r => r.priority === priorityFilter);
    }

    if (minAmount !== undefined) {
      result = result.filter(r => r.amount && r.amount >= minAmount);
    }

    if (maxAmount !== undefined) {
      result = result.filter(r => r.amount && r.amount <= maxAmount);
    }

    if (dateFrom) {
      result = result.filter(r => new Date(r.createdAt) >= new Date(dateFrom));
    }

    if (dateTo) {
      result = result.filter(r => new Date(r.createdAt) <= new Date(dateTo));
    }

    // Sorting
    if (sortBySlaRisk) {
      result.sort((a, b) => {
        const slaA = getSlaInfo(a.slaDeadline, a.status);
        const slaB = getSlaInfo(b.slaDeadline, b.status);
        if (!slaA && !slaB) return 0;
        if (!slaA) return 1;
        if (!slaB) return -1;
        return slaA.hoursRemaining - slaB.hoursRemaining;
      });
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [requests, activeTab, searchQuery, statusFilter, categoryFilter, assignedFilter, priorityFilter, minAmount, maxAmount, dateFrom, dateTo, sortBySlaRisk, getSlaInfo]);

  // Queue counts
  const queueCounts = useMemo(() => ({
    all: requests.length,
    pending: requests.filter(r => r.status === 'pending' || r.status === 'submitted').length,
    in_review: requests.filter(r => r.status === 'in_review').length,
    sla_risk: requests.filter(r => {
      const sla = getSlaInfo(r.slaDeadline, r.status);
      return sla && (sla.isOverdue || sla.isUrgent);
    }).length,
    missing_docs: requests.filter(r => r.hasMissingDocs).length,
    high_value: requests.filter(r => r.amount && r.amount >= HIGH_VALUE_THRESHOLD).length,
  }), [requests, getSlaInfo]);

  // Bulk action handlers
  const handleBulkAssign = (assigneeId: string) => {
    const assignee = mockEmployerUsers.find(u => u.id === assigneeId);
    setRequests(prev => prev.map(req =>
      selectedForBulk.includes(req.id)
        ? { ...req, assignedTo: assigneeId, assignedToName: assignee?.name }
        : req
    ));
    toast({
      title: 'Requests Assigned',
      description: `${selectedForBulk.length} requests assigned to ${assignee?.name}.`,
    });
    setSelectedForBulk([]);
    setBulkAssignOpen(false);
  };

  const handleBulkStatusChange = (newStatus: QueueRequest['status']) => {
    setRequests(prev => prev.map(req =>
      selectedForBulk.includes(req.id)
        ? { ...req, status: newStatus, lastStatusChangeAt: new Date().toISOString() }
        : req
    ));
    toast({
      title: 'Status Updated',
      description: `${selectedForBulk.length} requests updated to ${newStatus}.`,
    });
    setSelectedForBulk([]);
  };

  const handleBulkRequestDocs = () => {
    // Mark selected requests as needing docs follow-up
    setRequests(prev => prev.map(req =>
      selectedForBulk.includes(req.id)
        ? { ...req, hasMissingDocs: true }
        : req
    ));
    toast({
      title: 'Document Requests Sent',
      description: `Document request notifications sent for ${selectedForBulk.length} claims.`,
    });
    setSelectedForBulk([]);
  };

  const handleBulkPriorityChange = (newPriority: QueueRequest['priority']) => {
    setRequests(prev => prev.map(req =>
      selectedForBulk.includes(req.id)
        ? { ...req, priority: newPriority }
        : req
    ));
    toast({
      title: 'Priority Updated',
      description: `${selectedForBulk.length} requests set to ${newPriority} priority.`,
    });
    setSelectedForBulk([]);
    setBulkPriorityOpen(false);
  };

  const handleBulkApprove = () => {
    setRequests(prev => prev.map(req =>
      selectedForBulk.includes(req.id) && ['pending', 'submitted', 'in_review'].includes(req.status)
        ? { ...req, status: 'approved' as const, lastStatusChangeAt: new Date().toISOString() }
        : req
    ));
    toast({
      title: 'Claims Approved',
      description: `${selectedForBulk.length} claims have been approved.`,
    });
    setSelectedForBulk([]);
  };

  const handleBulkReject = () => {
    setRequests(prev => prev.map(req =>
      selectedForBulk.includes(req.id) && ['pending', 'submitted', 'in_review'].includes(req.status)
        ? { ...req, status: 'rejected' as const, lastStatusChangeAt: new Date().toISOString() }
        : req
    ));
    toast({
      title: 'Claims Rejected',
      description: `${selectedForBulk.length} claims have been rejected.`,
      variant: 'destructive',
    });
    setSelectedForBulk([]);
  };

  const handleExportCSV = () => {
    // Generate CSV
    const headers = ['ID', 'Employee', 'Type', 'Category', 'Subject', 'Amount', 'Status', 'Priority', 'Created', 'SLA Deadline', 'Assigned To'];
    const rows = filteredRequests.map(r => [
      r.id,
      r.employeeName,
      r.type,
      r.category,
      r.subject,
      r.amount || '',
      r.status,
      r.priority,
      new Date(r.createdAt).toLocaleDateString(),
      new Date(r.slaDeadline).toLocaleDateString(),
      r.assignedToName || 'Unassigned',
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `claims-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    
    toast({
      title: 'Export Complete',
      description: `${filteredRequests.length} requests exported to CSV.`,
    });
  };

  const toggleBulkSelect = (id: string) => {
    setSelectedForBulk(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAllVisible = () => {
    const allIds = filteredRequests.map(r => r.id);
    const allSelected = allIds.every(id => selectedForBulk.includes(id));
    if (allSelected) {
      setSelectedForBulk([]);
    } else {
      setSelectedForBulk(allIds);
    }
  };

  // Badge renderers
  const getSlaTriageBadge = (request: QueueRequest) => {
    const sla = getSlaInfo(request.slaDeadline, request.status);
    if (!sla) return null;

    if (sla.isOverdue) {
      return (
        <Badge className="bg-red-500 text-white border-0 gap-1">
          <AlertCircle className="w-3 h-3" />
          Breached
        </Badge>
      );
    }
    if (sla.isUrgent) {
      return (
        <Badge className="bg-amber-500 text-white border-0 gap-1">
          <Timer className="w-3 h-3" />
          Due &lt;24h
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 gap-1">
        <CheckCircle className="w-3 h-3" />
        On track
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      submitted: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      in_review: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      approved: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      rejected: 'bg-red-500/10 text-red-600 border-red-500/20',
      paid: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      closed: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
    };
    const labels: Record<string, string> = {
      pending: 'Pending',
      submitted: 'Submitted',
      in_review: 'In Review',
      approved: 'Approved',
      rejected: 'Rejected',
      paid: 'Paid',
      closed: 'Closed',
    };
    return <Badge className={styles[status] || ''}>{labels[status] || status}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      urgent: 'bg-red-500/10 text-red-600 border-red-500/20',
      high: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      normal: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
      low: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
    };
    return <Badge className={cn('text-xs', styles[priority])}>{priority}</Badge>;
  };

  const activeFiltersCount = [
    statusFilter !== 'all',
    categoryFilter !== 'All Categories',
    assignedFilter !== 'all',
    priorityFilter !== 'all',
    minAmount !== undefined,
    maxAmount !== undefined,
    dateFrom !== '',
    dateTo !== '',
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setSearchParams(prev => {
      const next = new URLSearchParams();
      const tab = prev.get('tab');
      if (tab) next.set('tab', tab);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Claims & Approvals Queue</h1>
          <p className="text-muted-foreground">Process employee requests efficiently with SLA tracking</p>
        </div>
        <TooltipProvider>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg">
            <Switch
              id="sla-sort"
              checked={sortBySlaRisk}
              onCheckedChange={handleSlaSortToggle}
            />
            <Label htmlFor="sla-sort" className="text-sm cursor-pointer">
              SLA Risk First
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p className="text-xs">
                  When enabled, requests are sorted by SLA urgency—breached and due-soon items appear first. 
                  Your preference is saved for future visits.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>

      {/* Global Filters */}
      <EmployerGlobalFiltersBar compact />

      {/* Queue Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => updateParam('tab', v)} className="w-full">
        <TabsList className="w-full justify-start h-auto p-1 flex-wrap">
          {QUEUE_TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="gap-2 data-[state=active]:shadow-sm"
            >
              {tab.icon}
              {tab.label}
              <Badge 
                variant="secondary" 
                className={cn(
                  'ml-1 min-w-[20px] h-5 text-xs',
                  activeTab === tab.value && 'bg-primary/20 text-primary',
                  tab.value === 'sla_risk' && queueCounts.sla_risk > 0 && 'bg-red-500/20 text-red-600'
                )}
              >
                {queueCounts[tab.value]}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Search and Filters Bar */}
      <Card className="card-elevated">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col gap-4">
            {/* Primary Row: Search + Quick Filters + Filter Toggle */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by employee, subject, ID..."
                  value={searchQuery}
                  onChange={(e) => updateParam('search', e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={(v) => updateParam('category', v)}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={(v) => updateParam('priority', v)}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={cn('gap-2', showFilters && 'bg-muted')}
              >
                <Filter className="w-4 h-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge className="ml-1">{activeFiltersCount}</Badge>
                )}
              </Button>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="pt-3 border-t border-border space-y-3">
                <div className="flex flex-wrap gap-3">
                  <Select value={statusFilter} onValueChange={(v) => updateParam('status', v)}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="in_review">In Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={assignedFilter} onValueChange={(v) => updateParam('assigned', v)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Assigned To" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Assignees</SelectItem>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {mockEmployerUsers.map((u) => (
                        <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="Min"
                      value={minAmount || ''}
                      onChange={(e) => updateParam('minAmount', e.target.value || null)}
                      className="w-24"
                    />
                    <span className="text-muted-foreground">-</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={maxAmount || ''}
                      onChange={(e) => updateParam('maxAmount', e.target.value || null)}
                      className="w-24"
                    />
                  </div>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        {dateFrom || dateTo ? `${dateFrom || '...'} - ${dateTo || '...'}` : 'Date Range'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-4" align="start">
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs">From</Label>
                          <Input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => updateParam('dateFrom', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">To</Label>
                          <Input
                            type="date"
                            value={dateTo}
                            onChange={(e) => updateParam('dateTo', e.target.value)}
                          />
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  {activeFiltersCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-muted-foreground">
                      <X className="w-4 h-4 mr-1" />
                      Clear all
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Bar */}
      {selectedForBulk.length > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedForBulk.length === filteredRequests.length}
                  onCheckedChange={selectAllVisible}
                />
                <span className="font-medium">{selectedForBulk.length} selected</span>
                <Button variant="ghost" size="sm" onClick={() => setSelectedForBulk([])}>
                  Clear
                </Button>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <PermissionGate permission="can_process_claims">
                  {/* Assign Owner */}
                  <Popover open={bulkAssignOpen} onOpenChange={setBulkAssignOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <UserPlus className="w-4 h-4" />
                        Assign
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2">
                      <p className="text-xs font-medium text-muted-foreground mb-2 px-2">Assign to:</p>
                      {mockEmployerUsers.map((u) => (
                        <Button
                          key={u.id}
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => handleBulkAssign(u.id)}
                        >
                          {u.name}
                        </Button>
                      ))}
                    </PopoverContent>
                  </Popover>

                  {/* Set Priority */}
                  <Popover open={bulkPriorityOpen} onOpenChange={setBulkPriorityOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Flag className="w-4 h-4" />
                        Priority
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-36 p-2">
                      <p className="text-xs font-medium text-muted-foreground mb-2 px-2">Set priority:</p>
                      <Button variant="ghost" className="w-full justify-start text-red-600" onClick={() => handleBulkPriorityChange('urgent')}>
                        Urgent
                      </Button>
                      <Button variant="ghost" className="w-full justify-start text-amber-600" onClick={() => handleBulkPriorityChange('high')}>
                        High
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" onClick={() => handleBulkPriorityChange('normal')}>
                        Normal
                      </Button>
                      <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={() => handleBulkPriorityChange('low')}>
                        Low
                      </Button>
                    </PopoverContent>
                  </Popover>

                  {/* Move to Status */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <ArrowUpDown className="w-4 h-4" />
                        Status
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-44 p-2">
                      <p className="text-xs font-medium text-muted-foreground mb-2 px-2">Move to:</p>
                      <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => handleBulkStatusChange('in_review')}>
                        <Hourglass className="w-3.5 h-3.5" />
                        In Review
                      </Button>
                      <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => handleBulkStatusChange('pending')}>
                        <Clock className="w-3.5 h-3.5" />
                        Pending
                      </Button>
                    </PopoverContent>
                  </Popover>

                  {/* Request Docs */}
                  <Button variant="outline" size="sm" className="gap-2" onClick={handleBulkRequestDocs}>
                    <Mail className="w-4 h-4" />
                    Request Docs
                  </Button>

                  <Separator orientation="vertical" className="h-6 mx-1" />

                  {/* Quick Actions: Approve / Reject */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10" 
                    onClick={handleBulkApprove}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve
                  </Button>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 text-red-600 border-red-500/30 hover:bg-red-500/10" 
                    onClick={handleBulkReject}
                  >
                    <XCircleIcon className="w-4 h-4" />
                    Reject
                  </Button>
                </PermissionGate>

                <Separator orientation="vertical" className="h-6 mx-1" />

                <Button variant="outline" size="sm" className="gap-2" onClick={handleExportCSV}>
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Queue Table */}
      <Card className="card-elevated">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              {QUEUE_TABS.find(t => t.value === activeTab)?.icon}
              {QUEUE_TABS.find(t => t.value === activeTab)?.label} Queue
              <Badge variant="secondary">{filteredRequests.length}</Badge>
            </CardTitle>
            {selectedForBulk.length === 0 && (
              <Button variant="ghost" size="sm" className="gap-2" onClick={handleExportCSV}>
                <Download className="w-4 h-4" />
                Export
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide">
                  <th className="text-left py-3 px-2 w-10">
                    <Checkbox
                      checked={filteredRequests.length > 0 && selectedForBulk.length === filteredRequests.length}
                      onCheckedChange={selectAllVisible}
                    />
                  </th>
                  <th className="text-left py-3 px-4 font-medium">Employee</th>
                  <th className="text-left py-3 px-4 font-medium">Request</th>
                  <th className="text-right py-3 px-4 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 font-medium">Priority</th>
                  <th className="text-left py-3 px-4 font-medium">SLA</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Assigned</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr
                    key={request.id}
                    className={cn(
                      'border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors',
                      selectedForBulk.includes(request.id) && 'bg-primary/5'
                    )}
                    onClick={() => setSelectedRequestId(request.id)}
                  >
                    <td className="py-3 px-2" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedForBulk.includes(request.id)}
                        onCheckedChange={() => toggleBulkSelect(request.id)}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-sm">{request.employeeName}</p>
                        <p className="text-xs text-muted-foreground">{request.employeeId}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="max-w-xs">
                        <p className="text-sm font-medium truncate">{request.subject}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Badge variant="outline" className="text-xs">{request.type}</Badge>
                          <span className="text-xs text-muted-foreground">{request.category}</span>
                          {request.hasMissingDocs && (
                            <Badge className="bg-amber-500/10 text-amber-600 border-0 text-xs gap-1">
                              <FileQuestion className="w-3 h-3" />
                              Docs
                            </Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {request.amount ? (
                        <span className={cn(
                          'font-mono text-sm',
                          request.amount >= HIGH_VALUE_THRESHOLD && 'text-amber-600 font-medium'
                        )}>
                          AED {request.amount.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">{getPriorityBadge(request.priority)}</td>
                    <td className="py-3 px-4">{getSlaTriageBadge(request)}</td>
                    <td className="py-3 px-4">{getStatusBadge(request.status)}</td>
                    <td className="py-3 px-4">
                      {request.assignedToName ? (
                        <span className="text-sm">{request.assignedToName}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedRequestId(request.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredRequests.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Inbox className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No requests found</p>
                <p className="text-sm">Try adjusting your filters or search query.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Claim Review Sheet */}
      <ClaimReviewSheet
        requestId={selectedRequestId}
        organizationId={organizationId}
        open={!!selectedRequestId}
        onOpenChange={(open) => !open && setSelectedRequestId(null)}
        onStatusChange={() => {
          toast({
            title: 'Request Updated',
            description: 'The queue has been refreshed.',
          });
        }}
      />
    </div>
  );
}
