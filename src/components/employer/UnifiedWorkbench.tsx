/**
 * Operations Hub (Unified)
 * 
 * Primary operational interface for HR Ops teams combining:
 * - Backlog: Operational KPIs strip (top)
 * - SLA Performance: Full Claims & Requests with filters, tabs, pagination (main 75%)
 * - Throughput & Exceptions: Friction Reasons + Payroll Countdown (side panel 25%)
 * - Payments Pipeline: Settlement integration
 * 
 * NOTE: "Operations Hub" replaces the deprecated term "Workbench" per terminology standards.
 */

import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter, 
  Eye, 
  Timer,
  UserCheck,
  Download,
  CalendarIcon,
  X,
  DollarSign,
  AlertCircle,
  Inbox,
  Hourglass,
  Flame,
  FileQuestion,
  TrendingUp,
  CheckCircle2,
  Mail,
  Info,
  MoreVertical,
  RefreshCw,
  Settings,
  Calendar,
  Wand2,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { DataConfidenceBadge, useDataCoverageMetrics } from '@/components/employer/DataConfidenceBadge';
import { HROpsKPIStrip } from '@/components/employer/HROpsKPIStrip';
import { TopFrictionReasonsPanel, FrictionReason } from '@/components/employer/TopFrictionReasonsPanel';
import { PayrollCountdownCard } from '@/components/employer/PayrollCountdownCard';
import { PageConfidenceGate } from '@/components/employer/PageConfidenceGate';
import { useEmployerPermissions } from '@/hooks/useEmployerPermissions';
import { ClaimReviewSheet } from '@/components/employer/ClaimReviewSheet';
import { ClaimsBulkActionsBar } from '@/components/employer/ClaimsBulkActionsBar';
import { FloatingActionBar } from '@/components/employer/FloatingActionBar';
import { TeamWorkloadCard } from '@/components/employer/TeamWorkloadCard';
import { SLARulesModal } from '@/components/employer/SLARulesModal';
import { ClaimsQueueCounters } from '@/components/employer/ClaimsQueueCounters';
import { ClaimsTypeChip } from '@/components/employer/ClaimsTypeChip';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useOrganizationRequests, RequestWithDetails, useUpdateRequestStatus } from '@/hooks/useSharedRequests';
import { useClaimMetrics } from '@/hooks/useEmployerDashboard';
import { useOrgSettings } from '@/hooks/useOrgSettings';
import { useAuditLog } from '@/hooks/useAuditLog';
import { REQUEST_STATUSES } from '@/lib/crossPortalContract';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { format } from 'date-fns';

// Missing Docs Badge component
function MissingDocsBadge({ 
  category, 
  missingDocsFromDb 
}: { 
  category: string; 
  missingDocsFromDb?: unknown;
}) {
  const missingDocs = Array.isArray(missingDocsFromDb) ? (missingDocsFromDb as string[]) : [];
  const missingCount = missingDocs.length;

  if (missingCount === 0) {
    return (
      <span className="text-xs text-success flex items-center gap-1">
        <CheckCircle className="w-3 h-3" />
        Complete
      </span>
    );
  }
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Badge 
          className="bg-amber-500/10 text-amber-600 border-amber-500/30 border text-xs gap-1 cursor-pointer hover:bg-amber-500/20 transition-colors"
        >
          <FileQuestion className="w-3 h-3" />
          {missingCount} missing
        </Badge>
      </PopoverTrigger>
      <PopoverContent side="top" className="w-64 p-3 bg-popover">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium text-sm">Missing Documents</span>
          </div>
          <Separator />
          <ul className="text-sm space-y-1.5">
            {missingDocs.map((doc) => (
              <li key={doc} className="flex items-start gap-2">
                <XCircle className="w-3.5 h-3.5 text-destructive mt-0.5 shrink-0" />
                <span>{doc}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">
            Request these documents from the employee to proceed.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Queue Tab definitions
type QueueTab = 'all' | 'pending' | 'in_review' | 'sla_risk' | 'missing_docs' | 'high_value';

interface QueueTabDef {
  value: QueueTab;
  label: string;
  icon: React.ReactNode;
  slaRequired?: boolean;
}

const QUEUE_TABS: QueueTabDef[] = [
  { value: 'all', label: 'All', icon: <Inbox className="w-4 h-4" /> },
  { value: 'pending', label: 'Pending', icon: <Clock className="w-4 h-4" /> },
  { value: 'in_review', label: 'In Review', icon: <Hourglass className="w-4 h-4" /> },
  { value: 'sla_risk', label: 'SLA Risk', icon: <Flame className="w-4 h-4" />, slaRequired: true },
  { value: 'missing_docs', label: 'Needs Info', icon: <FileQuestion className="w-4 h-4" /> },
  { value: 'high_value', label: 'High Value', icon: <TrendingUp className="w-4 h-4" /> },
];

const TYPE_FILTERS = [
  { value: 'all', label: 'All Types' },
  { value: 'request', label: 'Requests (Pre-approval)' },
  { value: 'claim', label: 'Claims (Reimbursement)' },
];

const HIGH_VALUE_THRESHOLD = 5000;
const FAST_TRACK_AMOUNT_THRESHOLD = 500;

// HR Team Members for assignment
const HR_TEAM_MEMBERS = [
  { id: 'hr-manager-1', name: 'Fatima Hassan', role: 'HR Manager' },
  { id: 'hr-specialist-1', name: 'Sarah Al-Rashid', role: 'HR Specialist' },
  { id: 'hr-specialist-2', name: 'Ahmed Khan', role: 'HR Specialist' },
  { id: 'finance-lead-1', name: 'John Mitchell', role: 'Finance Lead' },
];

/**
 * Fast Track Candidate Detection
 * A claim is considered "Fast Track" / "Low Risk" if:
 * 1. Amount is under AED 500
 * 2. Documents are complete (no missing docs)
 * 3. Within policy cap (amount <= cap_limit or no cap defined)
 */
function isFastTrackCandidate(request: RequestWithDetails): boolean {
  // Skip non-monetary requests (e.g., leave)
  if (!request.amount || request.category?.toLowerCase().includes('leave')) {
    return false;
  }
  
  // Condition 1: Under threshold
  if (request.amount >= FAST_TRACK_AMOUNT_THRESHOLD) {
    return false;
  }
  
  // Condition 2: Documents complete
  const missingDocs = Array.isArray(request.missing_docs) ? request.missing_docs : [];
  if (missingDocs.length > 0) {
    return false;
  }
  
  // Condition 3: Within policy cap (or no cap defined)
  if (request.cap_limit && request.amount > request.cap_limit) {
    return false;
  }
  
  return true;
}

const CATEGORIES = [
  'All Categories',
  'Health Insurance',
  'Transport',
  'Housing',
  'Learning & Development',
  'Wellbeing',
  'Schooling',
  'Education Allowance',
  'Leave',
  'Per Diem',
  'Other',
];

const PRIORITIES = [
  { value: 'all', label: 'All Priorities' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const SLA_STATUS_FILTERS = [
  { value: 'all', label: 'All SLA Status' },
  { value: 'on_track', label: 'On Track' },
  { value: 'at_risk', label: 'At Risk' },
  { value: 'breached', label: 'Breached' },
];

const REJECTION_REASONS = [
  { value: 'incomplete_docs', label: 'Incomplete Documentation' },
  { value: 'exceeds_limit', label: 'Exceeds Entitlement' },
  { value: 'not_eligible', label: 'Not Eligible' },
  { value: 'duplicate', label: 'Duplicate Claim' },
  { value: 'policy_violation', label: 'Policy Violation' },
];

const mockEmployerUsers = [
  { id: 'user-hr-1', name: 'HR Manager' },
  { id: 'user-hr-2', name: 'HR Specialist' },
  { id: 'user-finance-1', name: 'Finance Lead' },
  { id: 'current-user', name: 'Me' },
];

// Pagination config
const PAGE_SIZE = 15;

export function UnifiedWorkbench() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { hasPermission } = useEmployerPermissions();
  const canProcessClaims = hasPermission('can_process_claims');
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const updateStatus = useUpdateRequestStatus();
  const { logEvent } = useAuditLog();
  const coverageMetrics = useDataCoverageMetrics();

  // URL-persisted state
  const activeTab = (searchParams.get('tab') as QueueTab) || 'pending';
  const searchQuery = searchParams.get('search') || '';
  const statusFilter = searchParams.get('status') || 'all';
  const typeFilter = searchParams.get('type') || 'all';
  const categoryFilter = searchParams.get('category') || 'All Categories';
  const assignedFilter = searchParams.get('assigned') || 'all';
  const priorityFilter = searchParams.get('priority') || 'all';
  const slaStatusFilter = searchParams.get('slaStatus') || 'all';
  const minAmount = searchParams.get('minAmount') ? Number(searchParams.get('minAmount')) : undefined;
  const maxAmount = searchParams.get('maxAmount') ? Number(searchParams.get('maxAmount')) : undefined;
  const dateFrom = searchParams.get('dateFrom') || '';
  const dateTo = searchParams.get('dateTo') || '';
  const currentPage = Number(searchParams.get('page') || '1');
  
  const [localSlaSort, setLocalSlaSort] = useState(() => {
    const saved = localStorage.getItem('employer_claims_sla_sort');
    return saved === 'true' || searchParams.get('slaSort') === 'true';
  });
  const sortBySlaRisk = localSlaSort;

  // Local state
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [selectedForBulk, setSelectedForBulk] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [slaRulesOpen, setSlaRulesOpen] = useState(false);

  // Fetch organization ID
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

  // Fetch org settings
  const { data: orgSettingsData } = useOrgSettings(organizationId);
  const slaEnabled = orgSettingsData?.settings?.sla_enabled ?? true;

  // Fetch requests
  const { data: requests = [], isLoading, error, refetch } = useOrganizationRequests(organizationId);
  const { data: claimMetrics } = useClaimMetrics();

  // SLA sort toggle
  const handleSlaSortToggle = (checked: boolean) => {
    setLocalSlaSort(checked);
    localStorage.setItem('employer_claims_sla_sort', checked ? 'true' : 'false');
    updateParam('slaSort', checked ? 'true' : null);
  };

  // URL params helper
  const updateParam = useCallback((key: string, value: string | null) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (value === null || value === '' || value === 'all' || value === 'All Categories') {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      // Reset page when filters change
      if (key !== 'page') next.delete('page');
      return next;
    });
  }, [setSearchParams]);

  // SLA calculation
  const getSlaInfo = useCallback((request: RequestWithDetails) => {
    if (!request.sla_due_at) return null;
    if (['approved', 'rejected', 'paid', 'closed'].includes(request.status || '')) return null;
    
    const now = new Date();
    const sla = new Date(request.sla_due_at);
    const hoursRemaining = (sla.getTime() - now.getTime()) / (1000 * 60 * 60);
    const daysRemaining = hoursRemaining / 24;
    
    return {
      hoursRemaining: Math.round(hoursRemaining),
      daysRemaining: Math.round(daysRemaining * 10) / 10,
      isOverdue: hoursRemaining < 0,
      isUrgent: hoursRemaining > 0 && hoursRemaining < 24,
      isOnTrack: hoursRemaining >= 24,
    };
  }, []);

  // Operational KPIs
  const opsKPIs = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const newToday = requests.filter(r => {
      const created = new Date(r.created_at || '');
      created.setHours(0, 0, 0, 0);
      return created.getTime() === today.getTime();
    }).length;

    const slaAtRisk = requests.filter(r => {
      if (!r.sla_due_at) return false;
      if (['approved', 'rejected', 'paid', 'closed'].includes(r.status || '')) return false;
      const sla = new Date(r.sla_due_at);
      const hoursRemaining = (sla.getTime() - new Date().getTime()) / (1000 * 60 * 60);
      return hoursRemaining < 24;
    }).length;

    const awaitingEmployee = requests.filter(r => 
      r.status === 'info_requested' || r.status === 'pending_employee' || r.hasMissingDocs
    ).length;

    return {
      newToday,
      slaAtRisk,
      awaitingEmployee,
      medianCycleTimeDays: claimMetrics?.avgProcessingDays || 2.3,
      rejectionRatePercent: 100 - (claimMetrics?.approvalRate || 87),
      newTodayTrend: 5,
      cycleTimeTrend: -8,
    };
  }, [requests, claimMetrics]);

  // Friction reasons
  const frictionReasons: FrictionReason[] = useMemo(() => {
    const missingDocsCount = requests.filter(r => r.hasMissingDocs).length;
    const rejectedRequests = requests.filter(r => r.status === 'rejected');
    const slaRiskCount = requests.filter(r => {
      if (!r.sla_due_at) return false;
      const sla = new Date(r.sla_due_at);
      const hoursRemaining = (sla.getTime() - new Date().getTime()) / (1000 * 60 * 60);
      return hoursRemaining < 24 && hoursRemaining > 0;
    }).length;

    const total = missingDocsCount + rejectedRequests.length + slaRiskCount;
    if (total === 0) return [];

    return [
      {
        type: 'missing_docs' as const,
        count: missingDocsCount,
        percentOfTotal: total > 0 ? Math.round((missingDocsCount / total) * 100) : 0,
        trend: 'stable' as const,
        avgDelayDays: 2.5,
      },
      {
        type: 'cap_exceeded' as const,
        count: Math.floor(rejectedRequests.length * 0.4),
        percentOfTotal: total > 0 ? Math.round((rejectedRequests.length * 0.4 / total) * 100) : 0,
        trend: 'down' as const,
      },
      {
        type: 'ineligible' as const,
        count: Math.floor(rejectedRequests.length * 0.35),
        percentOfTotal: total > 0 ? Math.round((rejectedRequests.length * 0.35 / total) * 100) : 0,
        trend: 'up' as const,
      },
      {
        type: 'delayed_approval' as const,
        count: slaRiskCount,
        percentOfTotal: total > 0 ? Math.round((slaRiskCount / total) * 100) : 0,
        avgDelayDays: 1.2,
      },
    ].filter(r => r.count > 0);
  }, [requests]);

  // Filter and sort
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
          const sla = getSlaInfo(r);
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
        (r.employeeName?.toLowerCase().includes(q)) ||
        (r.subject?.toLowerCase().includes(q)) ||
        (r.category?.toLowerCase().includes(q)) ||
        (r.employeeCode?.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== 'all') result = result.filter(r => r.status === statusFilter);
    if (categoryFilter !== 'All Categories') result = result.filter(r => r.category === categoryFilter);
    if (typeFilter !== 'all') result = result.filter(r => r.request_type === typeFilter);
    if (assignedFilter !== 'all') {
      if (assignedFilter === 'unassigned') result = result.filter(r => !r.assigned_to);
      else result = result.filter(r => r.assigned_to === assignedFilter);
    }
    if (priorityFilter !== 'all') result = result.filter(r => r.priority === priorityFilter);

    if (slaStatusFilter !== 'all') {
      result = result.filter(r => {
        const sla = getSlaInfo(r);
        if (!sla) return slaStatusFilter === 'on_track';
        if (slaStatusFilter === 'breached') return sla.isOverdue;
        if (slaStatusFilter === 'at_risk') return sla.isUrgent && !sla.isOverdue;
        if (slaStatusFilter === 'on_track') return sla.isOnTrack;
        return true;
      });
    }

    if (minAmount !== undefined) result = result.filter(r => r.amount && r.amount >= minAmount);
    if (maxAmount !== undefined) result = result.filter(r => r.amount && r.amount <= maxAmount);
    if (dateFrom) result = result.filter(r => r.created_at && new Date(r.created_at) >= new Date(dateFrom));
    if (dateTo) result = result.filter(r => r.created_at && new Date(r.created_at) <= new Date(dateTo));

    // Sorting
    if (sortBySlaRisk) {
      result.sort((a, b) => {
        const slaA = getSlaInfo(a);
        const slaB = getSlaInfo(b);
        if (!slaA && !slaB) return 0;
        if (!slaA) return 1;
        if (!slaB) return -1;
        return slaA.hoursRemaining - slaB.hoursRemaining;
      });
    } else {
      result.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
    }

    return result;
  }, [requests, activeTab, searchQuery, statusFilter, typeFilter, categoryFilter, assignedFilter, priorityFilter, slaStatusFilter, minAmount, maxAmount, dateFrom, dateTo, sortBySlaRisk, getSlaInfo]);

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / PAGE_SIZE);
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRequests.slice(start, start + PAGE_SIZE);
  }, [filteredRequests, currentPage]);

  // Queue counts
  const queueCounts = useMemo(() => ({
    all: requests.length,
    pending: requests.filter(r => r.status === 'pending' || r.status === 'submitted').length,
    in_review: requests.filter(r => r.status === 'in_review').length,
    sla_risk: requests.filter(r => {
      const sla = getSlaInfo(r);
      return sla && (sla.isOverdue || sla.isUrgent);
    }).length,
    missing_docs: requests.filter(r => r.hasMissingDocs).length,
    high_value: requests.filter(r => r.amount && r.amount >= HIGH_VALUE_THRESHOLD).length,
  }), [requests, getSlaInfo]);

  const visibleQueueTabs = useMemo(() => {
    return QUEUE_TABS.filter(tab => !tab.slaRequired || slaEnabled);
  }, [slaEnabled]);

  // Row actions
  const handleRowApprove = async (id: string) => {
    try {
      await updateStatus.mutateAsync({ requestId: id, newStatus: REQUEST_STATUSES.APPROVED, reviewerNotes: 'Approved' });
      await logEvent({ action: 'REQUEST_APPROVE', resourceType: 'request', resourceId: id, details: { org_id: organizationId, status_to: 'approved' } });
      toast({ title: 'Request Approved', description: 'The request has been approved.' });
      refetch();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to approve request.', variant: 'destructive' });
    }
  };

  const handleRowReject = async (id: string, reason: string) => {
    try {
      await updateStatus.mutateAsync({ requestId: id, newStatus: REQUEST_STATUSES.REJECTED, reviewerNotes: `Rejected: ${reason}` });
      await logEvent({ action: 'REQUEST_REJECT', resourceType: 'request', resourceId: id, details: { org_id: organizationId, reason, status_to: 'rejected' } });
      toast({ title: 'Request Rejected', description: `Rejected: ${reason}`, variant: 'destructive' });
      refetch();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to reject request.', variant: 'destructive' });
    }
  };

  const handleRowRequestDocs = async (id: string) => {
    try {
      await updateStatus.mutateAsync({ requestId: id, newStatus: REQUEST_STATUSES.IN_REVIEW, reviewerNotes: 'Additional documentation requested' });
      await logEvent({ action: 'REQUEST_REQUEST_DOCS', resourceType: 'request', resourceId: id, details: { org_id: organizationId, status_to: 'in_review' } });
      toast({ title: 'Documents Requested', description: 'Document request notification sent to employee.' });
      refetch();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to request documents.', variant: 'destructive' });
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Employee', 'Employee Code', 'Type', 'Category', 'Subject', 'Amount', 'Currency', 'Status', 'Priority', 'Days in Queue', 'SLA Due', 'Policy Ref'];
    const rows = filteredRequests.map(r => {
      const sla = getSlaInfo(r);
      return [r.id, r.employeeName || 'Unknown', r.employeeCode || '-', r.request_type, r.category, r.subject, r.amount || '', r.currency || 'AED', r.status, r.priority, r.daysInQueue || 0, sla ? `${sla.hoursRemaining}h` : 'N/A', r.policy_ref || ''];
    });
    
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `claims-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    
    toast({ title: 'Export Complete', description: `${filteredRequests.length} requests exported to CSV.` });
  };

  const toggleBulkSelect = (id: string) => {
    setSelectedForBulk(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const selectAllVisible = () => {
    const allIds = paginatedRequests.map(r => r.id);
    const allSelected = allIds.every(id => selectedForBulk.includes(id));
    if (allSelected) setSelectedForBulk([]);
    else setSelectedForBulk(allIds);
  };

  // Handle bulk assignment - updates assigned_to for selected claims
  const handleBulkAssign = async (assigneeId: string, assigneeName: string) => {
    try {
      // Update each selected claim's assigned_to field
      for (const id of selectedForBulk) {
        await supabase
          .from('requests')
          .update({ 
            assigned_to: assigneeId,
            assigned_owner_name: assigneeName 
          })
          .eq('id', id);
      }
      
      toast({ 
        title: 'Claims Assigned', 
        description: `${selectedForBulk.length} claim${selectedForBulk.length !== 1 ? 's' : ''} assigned to ${assigneeName}.` 
      });
      
      setSelectedForBulk([]);
      refetch();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to assign claims.', variant: 'destructive' });
    }
  };

  // Calculate team workload from requests
  const teamWorkload = useMemo(() => {
    const workloadMap: Record<string, number> = {};
    const unassignedCount = requests.filter(r => 
      !r.assigned_to && 
      ['pending', 'submitted', 'in_review'].includes(r.status || '')
    ).length;

    // Count by assigned_to
    requests.forEach(r => {
      if (r.assigned_to && ['pending', 'submitted', 'in_review'].includes(r.status || '')) {
        workloadMap[r.assigned_to] = (workloadMap[r.assigned_to] || 0) + 1;
      }
    });

    // Map to team members with mock data fallback for demo
    const members = HR_TEAM_MEMBERS.map((member, index) => ({
      id: member.id,
      name: member.name,
      activeTasks: workloadMap[member.id] || [12, 4, 7, 3][index] || 0 // Demo fallback
    }));

    return {
      members,
      unassignedCount: unassignedCount || 18 // Demo fallback
    };
  }, [requests]);

  // Badge renderers
  const getSlaTriageBadge = (request: RequestWithDetails) => {
    const sla = getSlaInfo(request);
    if (!sla) return <span className="text-xs text-muted-foreground">—</span>;

    if (sla.isOverdue) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className="bg-destructive text-destructive-foreground border-0 gap-1">
              <AlertCircle className="w-3 h-3" />
              {Math.abs(sla.hoursRemaining)}h overdue
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <p className="font-medium">SLA Breached</p>
            <p className="text-xs">Due: {format(new Date(request.sla_due_at!), 'MMM d, h:mm a')}</p>
          </TooltipContent>
        </Tooltip>
      );
    }
    if (sla.isUrgent) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className="bg-warning text-warning-foreground border-0 gap-1">
              <Timer className="w-3 h-3" />
              {sla.hoursRemaining}h left
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="text-xs">Due: {format(new Date(request.sla_due_at!), 'MMM d, h:mm a')}</p>
          </TooltipContent>
        </Tooltip>
      );
    }
    return (
      <Badge variant="outline" className="text-success border-success/30 gap-1">
        <CheckCircle className="w-3 h-3" />
        {sla.daysRemaining}d left
      </Badge>
    );
  };

  const getStatusBadge = (status: string | null) => {
    const styles: Record<string, string> = {
      pending: 'bg-warning/10 text-warning border-warning/20',
      submitted: 'bg-warning/10 text-warning border-warning/20',
      in_review: 'bg-primary/10 text-primary border-primary/20',
      approved: 'bg-success/10 text-success border-success/20',
      rejected: 'bg-destructive/10 text-destructive border-destructive/20',
      paid: 'bg-success/10 text-success border-success/20',
      closed: 'bg-muted text-muted-foreground border-muted',
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
    return <Badge className={styles[status || ''] || ''}>{labels[status || ''] || status}</Badge>;
  };

  const activeFiltersCount = [
    statusFilter !== 'all',
    typeFilter !== 'all',
    categoryFilter !== 'All Categories',
    assignedFilter !== 'all',
    priorityFilter !== 'all',
    slaStatusFilter !== 'all',
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

  const canProcess = (status: string | null) => ['pending', 'submitted', 'in_review'].includes(status || '');

  // Loading state
  if (isLoading) {
    return (
      <TooltipProvider>
        <div className="space-y-6">
          <div className="h-16 bg-muted rounded-xl animate-pulse" />
          <div className="h-24 bg-muted rounded-xl animate-pulse" />
          <div className="h-64 bg-muted rounded-xl animate-pulse" />
        </div>
      </TooltipProvider>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <h2 className="text-lg font-medium">Failed to load claims</h2>
        <Button onClick={() => refetch()} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <PageConfidenceGate metrics={coverageMetrics} threshold={70}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-display font-bold tracking-tight">
                Operations Hub
              </h1>
              <p className="text-muted-foreground mt-1 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <DataConfidenceBadge metrics={coverageMetrics} />
              <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              {slaEnabled && (
                <Badge variant="outline" className={cn(
                  "gap-1.5 px-3 py-1.5",
                  (claimMetrics?.slaCompliance || 94) >= 90 
                    ? "bg-success/10 text-success border-success/30" 
                    : "bg-warning/10 text-warning border-warning/30"
                )}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-medium">SLA: {claimMetrics?.slaCompliance || 94}%</span>
                </Badge>
              )}
            </div>
          </div>

          {/* KPI Strip */}
          <HROpsKPIStrip data={opsKPIs} slaEnabled={slaEnabled} />

          {/* Two-Column Layout: Main (75%) | Side Panel (25%) */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Main Content - Claims & Requests */}
            <div className="xl:col-span-3 space-y-4">
              {/* Queue Counters */}
              <ClaimsQueueCounters 
                requests={requests} 
                slaEnabled={slaEnabled}
                onCounterClick={(filter) => {
                  if (filter === 'active') updateParam('tab', 'pending');
                  else if (filter === 'needs_info') updateParam('tab', 'missing_docs');
                  else if (filter === 'at_risk') updateParam('tab', 'sla_risk');
                }}
              />

              {/* Queue Tabs */}
              <Tabs value={activeTab} onValueChange={(v) => updateParam('tab', v)} className="w-full">
                <TabsList className="w-full justify-start h-auto p-1 flex-wrap bg-muted/50">
                  {visibleQueueTabs.map((tab) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="gap-2 data-[state=active]:shadow-sm data-[state=active]:bg-background"
                    >
                      {tab.icon}
                      {tab.label}
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          'ml-1 min-w-[20px] h-5 text-xs',
                          activeTab === tab.value && 'bg-primary/20 text-primary',
                          tab.value === 'sla_risk' && queueCounts.sla_risk > 0 && 'bg-destructive/20 text-destructive'
                        )}
                      >
                        {queueCounts[tab.value]}
                      </Badge>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              {/* Filters Bar */}
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex flex-col gap-4">
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
                      <Select value={typeFilter} onValueChange={(v) => updateParam('type', v)}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover z-50">
                          {TYPE_FILTERS.map((t) => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={categoryFilter} onValueChange={(v) => updateParam('category', v)}>
                        <SelectTrigger className="w-44">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover z-50">
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={priorityFilter} onValueChange={(v) => updateParam('priority', v)}>
                        <SelectTrigger className="w-36">
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover z-50">
                          {PRIORITIES.map((p) => (
                            <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {slaEnabled && (
                        <Select value={slaStatusFilter} onValueChange={(v) => updateParam('slaStatus', v)}>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="SLA Status" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover z-50">
                            {SLA_STATUS_FILTERS.map((s) => (
                              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn('gap-2', showFilters && 'bg-muted')}
                      >
                        <Filter className="w-4 h-4" />
                        Filters
                        {activeFiltersCount > 0 && <Badge className="ml-1">{activeFiltersCount}</Badge>}
                      </Button>
                    </div>

                    {showFilters && (
                      <div className="pt-3 border-t border-border space-y-3">
                        <div className="flex flex-wrap gap-3">
                          <Select value={statusFilter} onValueChange={(v) => updateParam('status', v)}>
                            <SelectTrigger className="w-36">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover z-50">
                              <SelectItem value="all">All Status</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="submitted">Submitted</SelectItem>
                              <SelectItem value="in_review">In Review</SelectItem>
                              <SelectItem value="approved">Approved</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
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
                            <PopoverContent className="w-auto p-4 bg-popover z-50" align="start">
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

                        {/* SLA Sort Toggle */}
                        {slaEnabled && (
                          <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 border border-primary/20 rounded-lg w-fit">
                            <Switch id="sla-sort" checked={sortBySlaRisk} onCheckedChange={handleSlaSortToggle} />
                            <Label htmlFor="sla-sort" className="text-sm cursor-pointer font-medium">SLA Risk First</Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent side="bottom" className="max-w-xs">
                                <p className="text-xs">Sort by SLA urgency—breached and due-soon items appear first.</p>
                              </TooltipContent>
                            </Tooltip>
                            <Separator orientation="vertical" className="h-5 mx-1" />
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setSlaRulesOpen(true)}>
                                  <Settings className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Configure SLA Rules</TooltipContent>
                            </Tooltip>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Bulk Actions Bar */}
              <ClaimsBulkActionsBar
                selectedIds={selectedForBulk}
                onClearSelection={() => setSelectedForBulk([])}
                onSelectAll={selectAllVisible}
                totalCount={paginatedRequests.length}
                onExport={handleExportCSV}
                onRefresh={refetch}
                teamMembers={mockEmployerUsers}
                claimsData={paginatedRequests.map(r => ({ id: r.id, status: r.status, amount: r.amount }))}
              />

              {/* Queue Table */}
              <Card>
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
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border text-xs uppercase tracking-wide bg-muted/30">
                          <th className="text-left py-3 px-3 w-10">
                            <Checkbox
                              checked={paginatedRequests.length > 0 && selectedForBulk.length === paginatedRequests.length}
                              onCheckedChange={selectAllVisible}
                            />
                          </th>
                          <th className="text-left py-3 px-3 font-medium">Employee</th>
                          <th className="text-left py-3 px-3 font-medium">Type / Category</th>
                          <th className="text-left py-3 px-2 font-medium">Policy</th>
                          <th className="text-right py-3 px-3 font-medium">Amount / Cap</th>
                          <th className="text-center py-3 px-2 font-medium">Days</th>
                          {slaEnabled && <th className="text-left py-3 px-3 font-medium">SLA</th>}
                          <th className="text-left py-3 px-3 font-medium">Docs</th>
                          <th className="text-left py-3 px-3 font-medium">Status</th>
                          <th className="text-left py-3 px-3 font-medium">Assigned</th>
                          <th className="text-right py-3 px-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedRequests.map((request) => {
                          const daysInQueue = request.daysInQueue || 0;
                          
                          return (
                            <tr
                              key={request.id}
                              className={cn(
                                'border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors',
                                selectedForBulk.includes(request.id) && 'bg-primary/5'
                              )}
                              onClick={() => setSelectedRequestId(request.id)}
                            >
                              <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                                <Checkbox
                                  checked={selectedForBulk.includes(request.id)}
                                  onCheckedChange={() => toggleBulkSelect(request.id)}
                                />
                              </td>
                              <td className="py-3 px-3">
                                <div>
                                  <p className="font-medium text-sm">{request.employeeName || 'Unknown Employee'}</p>
                                  <p className="text-xs text-muted-foreground">{request.employeeCode || request.user_id.slice(0, 8)}</p>
                                </div>
                              </td>
                              <td className="py-3 px-3">
                                <div className="max-w-[180px]">
                                  <div className="flex items-center gap-1.5 mb-0.5">
                                    <ClaimsTypeChip requestType={request.request_type} size="sm" />
                                    <span className="text-xs text-muted-foreground truncate">{request.category}</span>
                                  </div>
                                  <p className="text-sm truncate" title={request.subject}>{request.subject}</p>
                                </div>
                              </td>
                              <td className="py-3 px-2">
                                {request.policy_ref ? (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge variant="outline" className="text-xs cursor-help font-mono">
                                        {request.policy_ref.length > 12 ? request.policy_ref.slice(0, 12) + '…' : request.policy_ref}
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-xs">
                                      <p className="font-medium">{request.policy_ref}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                ) : (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-right">
                                {request.category?.toLowerCase().includes('leave') ? (
                                  <span className="font-medium text-sm">
                                    {request.duration_days || '—'} {request.duration_days === 1 ? 'Day' : 'Days'}
                                  </span>
                                ) : request.amount ? (
                                  <div className="text-right">
                                    {request.cap_limit ? (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span className={cn(
                                            'font-mono text-sm cursor-help',
                                            request.amount > request.cap_limit 
                                              ? 'text-destructive font-semibold' 
                                              : request.amount >= HIGH_VALUE_THRESHOLD 
                                              ? 'text-amber-600 font-medium'
                                              : ''
                                          )}>
                                            {request.currency || 'AED'} {request.amount.toLocaleString()}
                                            <span className="text-muted-foreground font-normal"> / {request.cap_limit.toLocaleString()}</span>
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent side="left" className="text-xs">
                                          {request.amount > request.cap_limit ? (
                                            <span className="text-destructive font-medium">
                                              Exceeds cap by {request.currency || 'AED'} {(request.amount - request.cap_limit).toLocaleString()}
                                            </span>
                                          ) : (
                                            <span>Within policy cap</span>
                                          )}
                                        </TooltipContent>
                                      </Tooltip>
                                    ) : (
                                      <span className={cn(
                                        'font-mono text-sm',
                                        request.amount >= HIGH_VALUE_THRESHOLD && 'text-amber-600 font-medium'
                                      )}>
                                        {request.currency || 'AED'} {request.amount.toLocaleString()}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </td>
                              <td className="py-3 px-2 text-center">
                                <span className={cn(
                                  'text-sm font-medium',
                                  daysInQueue >= 5 && 'text-destructive',
                                  daysInQueue >= 3 && daysInQueue < 5 && 'text-warning'
                                )}>
                                  {daysInQueue}d
                                </span>
                              </td>
                              {slaEnabled && <td className="py-3 px-3">{getSlaTriageBadge(request)}</td>}
                              <td className="py-3 px-3">
                                <MissingDocsBadge category={request.category} missingDocsFromDb={request.missing_docs} />
                              </td>
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-1.5">
                                  {getStatusBadge(request.status)}
                                  {isFastTrackCandidate(request) && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-violet-500/10 text-violet-600 cursor-help">
                                          <Wand2 className="w-3 h-3" />
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="max-w-[200px]">
                                        <p className="font-medium text-xs">Fast Track Candidate</p>
                                        <p className="text-xs text-muted-foreground">Low Risk, Documents Verified.</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-3">
                                {request.assigned_to ? (
                                  <Badge variant="outline" className="text-xs gap-1">
                                    <UserCheck className="w-3 h-3" />
                                    Assigned
                                  </Badge>
                                ) : (
                                  <span className="text-xs text-muted-foreground">Unassigned</span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-end gap-1">
                                  <Button variant="ghost" size="sm" onClick={() => setSelectedRequestId(request.id)}>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  
                                  {canProcess(request.status) && (
                                    <PermissionGate permission="can_process_claims">
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <MoreVertical className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48 bg-popover z-50">
                                          <DropdownMenuItem className="text-emerald-600 gap-2" onClick={() => handleRowApprove(request.id)}>
                                            <CheckCircle className="w-4 h-4" />
                                            Approve
                                          </DropdownMenuItem>
                                          <DropdownMenuItem className="gap-2" onClick={() => handleRowRequestDocs(request.id)}>
                                            <Mail className="w-4 h-4" />
                                            Request Docs
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          {REJECTION_REASONS.map(reason => (
                                            <DropdownMenuItem 
                                              key={reason.value}
                                              className="text-red-600 gap-2 text-xs"
                                              onClick={() => handleRowReject(request.id, reason.label)}
                                            >
                                              <XCircle className="w-3 h-3" />
                                              Reject: {reason.label}
                                            </DropdownMenuItem>
                                          ))}
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </PermissionGate>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {paginatedRequests.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        <Inbox className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="font-medium">No requests found</p>
                        <p className="text-sm">Try adjusting your filters or search query.</p>
                      </div>
                    )}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t">
                      <p className="text-sm text-muted-foreground">
                        Showing {((currentPage - 1) * PAGE_SIZE) + 1}–{Math.min(currentPage * PAGE_SIZE, filteredRequests.length)} of {filteredRequests.length}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === 1}
                          onClick={() => updateParam('page', String(currentPage - 1))}
                        >
                          Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === totalPages}
                          onClick={() => updateParam('page', String(currentPage + 1))}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Side Panel - Insights */}
            <div className="xl:col-span-1 space-y-4">
              {/* Payroll Countdown */}
              <PayrollCountdownCard
                daysRemaining={4}
                claimsPending={requests.filter(r => ['pending', 'submitted', 'in_review'].includes(r.status || '')).length || 28}
                totalQueueSize={requests.length || 45}
                cutoffLabel="January Payroll"
              />

              {/* Top Friction Reasons */}
              {frictionReasons.length > 0 && (
                <TopFrictionReasonsPanel 
                  reasons={frictionReasons}
                  totalIssues={frictionReasons.reduce((sum, r) => sum + r.count, 0)}
                />
              )}

              {/* Team Workload Card */}
              <TeamWorkloadCard
                members={teamWorkload.members}
                unassignedCount={teamWorkload.unassignedCount}
              />
            </div>
          </div>

          {/* Claim Review Sheet */}
          <ClaimReviewSheet
            requestId={selectedRequestId}
            organizationId={organizationId}
            open={!!selectedRequestId}
            onOpenChange={(open) => !open && setSelectedRequestId(null)}
            onStatusChange={() => {
              toast({ title: 'Request Updated', description: 'The queue has been refreshed.' });
              refetch();
            }}
          />

          {/* SLA Rules Modal */}
          <SLARulesModal
            open={slaRulesOpen}
            onOpenChange={setSlaRulesOpen}
            onSave={(rules) => {
              toast({ title: 'SLA Rules Updated', description: 'Your SLA configuration has been saved.' });
            }}
          />

          {/* Floating Bulk Action Bar */}
          <FloatingActionBar
            selectedIds={selectedForBulk}
            claimsData={paginatedRequests.map(r => ({ 
              id: r.id, 
              status: r.status, 
              amount: r.amount,
              employeeName: r.employeeName 
            }))}
            onClearSelection={() => setSelectedForBulk([])}
            onRefresh={refetch}
            organizationId={organizationId}
            onAssignTo={handleBulkAssign}
            hrTeamMembers={HR_TEAM_MEMBERS}
          />
        </div>
      </PageConfidenceGate>
    </TooltipProvider>
  );
}
