/**
 * Operations Hub (High-Speed Workbench)
 * 
 * Primary operational interface for HR Ops teams:
 * - Default: "My Team Queue" with SLA risk sorting
 * - Comprehensive filters (Type, Category, Amount, SLA, Docs, Assigned)
 * - Each row: Request ID, Employee (Name (Grade)), Category, Amount, Status, SLA timer, Missing docs
 * - Inline actions: Approve / Reject / Request Docs / Assign / View Timeline
 * - Timeline drawer shows request_events audit trail
 */

import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  RefreshCw,
  Calendar,
  Download,
  Settings,
  ArrowUpDown,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useOrganizationRequests, RequestWithDetails, useUpdateRequestStatus } from '@/hooks/useSharedRequests';
import { useClaimMetrics } from '@/hooks/useEmployerDashboard';
import { useOrgSettings } from '@/hooks/useOrgSettings';
import { useAuditLog } from '@/hooks/useAuditLog';
import { REQUEST_STATUSES } from '@/lib/crossPortalContract';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { format } from 'date-fns';

// Local components
import { OpsQueueFilters } from './OpsQueueFilters';
import { OpsQueueTable } from './OpsQueueTable';
import { OpsQueueTabs } from './OpsQueueTabs';
import { OpsQueueStats } from './OpsQueueStats';
import { RequestTimelineDrawer } from './RequestTimelineDrawer';
import { ClaimDetailSheet } from './ClaimDetailSheet';
import { FloatingActionBar } from '@/components/employer/FloatingActionBar';
import type { QueueTab, QueueFilters, QueueItemRow, QueueStats, TeamMember, InlineAction } from './types';

// Constants
const HIGH_VALUE_THRESHOLD = 5000;
const PAGE_SIZE = 20;

const HR_TEAM_MEMBERS: TeamMember[] = [
  { id: 'hr-manager-1', name: 'Fatima Hassan', role: 'HR Manager', activeTasks: 0 },
  { id: 'hr-specialist-1', name: 'Sarah Al-Rashid', role: 'HR Specialist', activeTasks: 0 },
  { id: 'hr-specialist-2', name: 'Ahmed Khan', role: 'HR Specialist', activeTasks: 0 },
  { id: 'finance-lead-1', name: 'John Mitchell', role: 'Finance Lead', activeTasks: 0 },
];

// Policy-driven categories
const POLICY_CATEGORIES = [
  'Housing',
  'Schooling', 
  'Health',
  'Transport',
  'Wellbeing',
  'Learning',
  'Long-Term Financials',
];

const REJECTION_REASONS = [
  { value: 'incomplete_docs', label: 'Incomplete Documentation' },
  { value: 'exceeds_limit', label: 'Exceeds Entitlement' },
  { value: 'not_eligible', label: 'Not Eligible' },
  { value: 'duplicate', label: 'Duplicate Claim' },
  { value: 'policy_violation', label: 'Policy Violation' },
];

// Helper: Transform DB request to QueueItemRow
function transformRequest(request: RequestWithDetails): QueueItemRow {
  const now = new Date();
  const slaDueAt = request.sla_due_at ? new Date(request.sla_due_at) : null;
  
  let slaInfo = null;
  if (slaDueAt && !['approved', 'rejected', 'paid', 'closed'].includes(request.status || '')) {
    const hoursRemaining = (slaDueAt.getTime() - now.getTime()) / (1000 * 60 * 60);
    slaInfo = {
      hoursRemaining: Math.round(hoursRemaining),
      daysRemaining: Math.round(hoursRemaining / 24 * 10) / 10,
      isOverdue: hoursRemaining < 0,
      isUrgent: hoursRemaining > 0 && hoursRemaining < 24,
      isOnTrack: hoursRemaining >= 24,
      isPaused: request.status === 'info_requested' || request.status === 'pending_employee',
    };
  }

  const missingDocs = Array.isArray(request.missing_docs) ? request.missing_docs as string[] : [];
  const createdAt = request.created_at ? new Date(request.created_at) : now;
  const daysInQueue = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

  return {
    id: request.id,
    requestRef: `REQ-${request.id.slice(0, 6).toUpperCase()}`,
    employeeName: request.employeeName || 'Unknown',
    employeeGrade: request.employeeGrade || 'G3',
    employeeCode: request.employeeCode,
    category: request.category || 'General',
    benefitType: (request as any).benefit_type || 'allowance',
    requestType: (request.request_type as 'claim' | 'request') || 'claim',
    subject: request.subject || '',
    amount: request.amount,
    capLimit: request.cap_limit,
    currency: request.currency || 'AED',
    status: request.status || 'pending',
    slaInfo,
    slaDueAt: request.sla_due_at,
    isPaused: request.status === 'info_requested' || request.status === 'pending_employee',
    hasMissingDocs: missingDocs.length > 0,
    missingDocsCount: missingDocs.length,
    missingDocs,
    assignedTo: request.assigned_to,
    assignedToName: (request as any).assigned_owner_name || null,
    submittedAt: request.submitted_at || request.created_at || '',
    daysInQueue,
    priority: (request.priority as 'low' | 'standard' | 'high' | 'urgent') || 'standard',
    policyId: (request as any).policy_id || null,
    policyRef: request.policy_ref,
  };
}

export function OperationsHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const updateStatus = useUpdateRequestStatus();
  const { logEvent } = useAuditLog();

  // URL-persisted state
  const activeTab = (searchParams.get('tab') as QueueTab) || 'my_team';
  const currentPage = Number(searchParams.get('page') || '1');
  
  // Local state
  const [filters, setFilters] = useState<QueueFilters>({
    search: searchParams.get('search') || '',
    type: (searchParams.get('type') as QueueFilters['type']) || 'all',
    category: searchParams.get('category') || 'all',
    slaStatus: (searchParams.get('slaStatus') as QueueFilters['slaStatus']) || 'all',
    missingDocs: (searchParams.get('missingDocs') as QueueFilters['missingDocs']) || 'all',
    assignedTo: searchParams.get('assignedTo') || 'all',
    minAmount: searchParams.get('minAmount') ? Number(searchParams.get('minAmount')) : undefined,
    maxAmount: searchParams.get('maxAmount') ? Number(searchParams.get('maxAmount')) : undefined,
  });
  
  const [sortBySla, setSortBySla] = useState(() => {
    const saved = localStorage.getItem('ops_hub_sla_sort');
    return saved !== 'false'; // Default true
  });
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [timelineRequestId, setTimelineRequestId] = useState<string | null>(null);
  const [timelineRequestRef, setTimelineRequestRef] = useState<string>('');
  
  // Action modals
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectNotes, setRejectNotes] = useState('');
  const [pendingRejectId, setPendingRejectId] = useState<string | null>(null);
  
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [pendingAssignId, setPendingAssignId] = useState<string | null>(null);

  // Fetch organization
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

  // Fetch settings
  const { data: orgSettings } = useOrgSettings(organizationId);
  const slaEnabled = orgSettings?.settings?.sla_enabled ?? true;

  // Fetch requests
  const { data: rawRequests = [], isLoading, refetch } = useOrganizationRequests(organizationId);
  const { data: claimMetrics } = useClaimMetrics();

  // Transform to QueueItemRow
  const allItems = useMemo(() => rawRequests.map(transformRequest), [rawRequests]);

  // Calculate stats
  const stats = useMemo<QueueStats>(() => ({
    total: allItems.length,
    pending: allItems.filter(i => i.status === 'pending' || i.status === 'submitted').length,
    inReview: allItems.filter(i => i.status === 'in_review').length,
    slaAtRisk: allItems.filter(i => i.slaInfo && (i.slaInfo.isOverdue || i.slaInfo.isUrgent)).length,
    slaBreached: allItems.filter(i => i.slaInfo?.isOverdue).length,
    missingDocs: allItems.filter(i => i.hasMissingDocs).length,
    highValue: allItems.filter(i => i.amount && i.amount >= HIGH_VALUE_THRESHOLD).length,
    unassigned: allItems.filter(i => !i.assignedTo && ['pending', 'submitted', 'in_review'].includes(i.status)).length,
  }), [allItems]);

  // Operational KPIs
  const opsKpis = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const newToday = allItems.filter(i => {
      const submitted = new Date(i.submittedAt);
      submitted.setHours(0, 0, 0, 0);
      return submitted.getTime() === today.getTime();
    }).length;

    const awaitingEmployee = allItems.filter(i => 
      i.status === 'info_requested' || i.status === 'pending_employee'
    ).length;

    return {
      newToday,
      slaAtRisk: stats.slaAtRisk,
      awaitingEmployee,
      medianCycleTime: claimMetrics?.avgProcessingDays || 2.3,
    };
  }, [allItems, stats.slaAtRisk, claimMetrics]);

  // Filter and sort
  const filteredItems = useMemo(() => {
    let result = [...allItems];

    // Tab-based filtering
    switch (activeTab) {
      case 'my_team':
        // Default: all actionable items (pending + in_review)
        result = result.filter(i => ['pending', 'submitted', 'in_review'].includes(i.status));
        break;
      case 'pending':
        result = result.filter(i => i.status === 'pending' || i.status === 'submitted');
        break;
      case 'in_review':
        result = result.filter(i => i.status === 'in_review');
        break;
      case 'sla_risk':
        result = result.filter(i => i.slaInfo && (i.slaInfo.isOverdue || i.slaInfo.isUrgent));
        break;
      case 'missing_docs':
        result = result.filter(i => i.hasMissingDocs);
        break;
      case 'high_value':
        result = result.filter(i => i.amount && i.amount >= HIGH_VALUE_THRESHOLD);
        break;
    }

    // Additional filters
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(i =>
        i.employeeName.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        i.requestRef.toLowerCase().includes(q) ||
        i.employeeCode?.toLowerCase().includes(q)
      );
    }

    if (filters.type !== 'all') {
      result = result.filter(i => i.requestType === filters.type);
    }

    if (filters.category !== 'all') {
      result = result.filter(i => i.category === filters.category);
    }

    if (filters.slaStatus !== 'all') {
      result = result.filter(i => {
        if (!i.slaInfo) return filters.slaStatus === 'on_track';
        if (filters.slaStatus === 'breached') return i.slaInfo.isOverdue;
        if (filters.slaStatus === 'at_risk') return i.slaInfo.isUrgent && !i.slaInfo.isOverdue;
        if (filters.slaStatus === 'on_track') return i.slaInfo.isOnTrack;
        return true;
      });
    }

    if (filters.missingDocs !== 'all') {
      result = result.filter(i => 
        filters.missingDocs === 'has_missing' ? i.hasMissingDocs : !i.hasMissingDocs
      );
    }

    if (filters.assignedTo !== 'all') {
      if (filters.assignedTo === 'unassigned') {
        result = result.filter(i => !i.assignedTo);
      } else if (filters.assignedTo === 'me') {
        result = result.filter(i => i.assignedTo === user?.id);
      } else {
        result = result.filter(i => i.assignedTo === filters.assignedTo);
      }
    }

    if (filters.minAmount !== undefined) {
      result = result.filter(i => i.amount && i.amount >= filters.minAmount!);
    }
    if (filters.maxAmount !== undefined) {
      result = result.filter(i => i.amount && i.amount <= filters.maxAmount!);
    }

    // Sort by SLA risk (default)
    if (sortBySla) {
      result.sort((a, b) => {
        // Overdue first, then urgent, then by hours remaining
        if (a.slaInfo?.isOverdue && !b.slaInfo?.isOverdue) return -1;
        if (!a.slaInfo?.isOverdue && b.slaInfo?.isOverdue) return 1;
        if (a.slaInfo?.isUrgent && !b.slaInfo?.isUrgent) return -1;
        if (!a.slaInfo?.isUrgent && b.slaInfo?.isUrgent) return 1;
        const aHours = a.slaInfo?.hoursRemaining ?? Infinity;
        const bHours = b.slaInfo?.hoursRemaining ?? Infinity;
        return aHours - bHours;
      });
    } else {
      // Sort by submission date (newest first)
      result.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    }

    return result;
  }, [allItems, activeTab, filters, sortBySla, user?.id]);

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / PAGE_SIZE);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, currentPage]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    return [
      filters.type !== 'all',
      filters.category !== 'all',
      filters.slaStatus !== 'all',
      filters.missingDocs !== 'all',
      filters.assignedTo !== 'all',
      filters.minAmount !== undefined,
      filters.maxAmount !== undefined,
    ].filter(Boolean).length;
  }, [filters]);

  // Handlers
  const handleTabChange = (tab: QueueTab) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      next.delete('page');
      return next;
    });
    setSelectedIds([]);
  };

  const handleFiltersChange = (newFilters: QueueFilters) => {
    setFilters(newFilters);
    setSelectedIds([]);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      category: 'all',
      slaStatus: 'all',
      missingDocs: 'all',
      assignedTo: 'all',
      minAmount: undefined,
      maxAmount: undefined,
    });
  };

  const handleSlaSortToggle = (enabled: boolean) => {
    setSortBySla(enabled);
    localStorage.setItem('ops_hub_sla_sort', enabled ? 'true' : 'false');
  };

  // Inline actions
  const handleInlineAction = async (action: InlineAction, itemId: string) => {
    const item = allItems.find(i => i.id === itemId);
    if (!item) return;

    switch (action) {
      case 'approve':
        try {
          await updateStatus.mutateAsync({
            requestId: itemId,
            newStatus: REQUEST_STATUSES.APPROVED,
            reviewerNotes: 'Approved',
          });
          await logEvent({
            action: 'REQUEST_APPROVE',
            resourceType: 'request',
            resourceId: itemId,
            details: { org_id: organizationId },
          });
          toast({ 
            title: 'Request Approved',
            description: <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success" /> {item.requestRef} has been approved.</span>
          });
          refetch();
        } catch {
          toast({ title: 'Error', description: 'Failed to approve request.', variant: 'destructive' });
        }
        break;

      case 'reject':
        setPendingRejectId(itemId);
        setRejectDialogOpen(true);
        break;

      case 'request_docs':
        try {
          await updateStatus.mutateAsync({
            requestId: itemId,
            newStatus: REQUEST_STATUSES.INFO_REQUESTED,
            reviewerNotes: 'Additional documentation requested',
          });
          toast({ title: 'Documents Requested', description: 'Employee has been notified.' });
          refetch();
        } catch {
          toast({ title: 'Error', description: 'Failed to request documents.', variant: 'destructive' });
        }
        break;

      case 'assign':
        setPendingAssignId(itemId);
        setAssignDialogOpen(true);
        break;

      case 'escalate':
        try {
          await supabase
            .from('requests')
            .update({ priority: 'urgent', status: 'escalated' })
            .eq('id', itemId);
          toast({ title: 'Request Escalated', description: 'Marked as urgent priority.' });
          refetch();
        } catch {
          toast({ title: 'Error', description: 'Failed to escalate.', variant: 'destructive' });
        }
        break;

      case 'view_timeline':
        setTimelineRequestId(itemId);
        setTimelineRequestRef(item.requestRef);
        break;
    }
  };

  const handleRejectConfirm = async () => {
    if (!pendingRejectId || !rejectReason) return;
    try {
      const reasonLabel = REJECTION_REASONS.find(r => r.value === rejectReason)?.label || rejectReason;
      await updateStatus.mutateAsync({
        requestId: pendingRejectId,
        newStatus: REQUEST_STATUSES.REJECTED,
        reviewerNotes: `Rejected: ${reasonLabel}. ${rejectNotes}`,
      });
      toast({ 
        title: 'Request Rejected',
        description: <span className="flex items-center gap-2"><XCircle className="w-4 h-4 text-destructive" /> Request has been rejected.</span>,
      });
      setRejectDialogOpen(false);
      setPendingRejectId(null);
      setRejectReason('');
      setRejectNotes('');
      refetch();
    } catch {
      toast({ title: 'Error', description: 'Failed to reject request.', variant: 'destructive' });
    }
  };

  const handleAssignConfirm = async () => {
    if (!pendingAssignId || !selectedAssignee) return;
    try {
      const member = HR_TEAM_MEMBERS.find(m => m.id === selectedAssignee);
      await supabase
        .from('requests')
        .update({
          assigned_to: selectedAssignee,
          assigned_owner_name: member?.name,
        })
        .eq('id', pendingAssignId);
      toast({ title: 'Request Assigned', description: `Assigned to ${member?.name}.` });
      setAssignDialogOpen(false);
      setPendingAssignId(null);
      setSelectedAssignee('');
      refetch();
    } catch {
      toast({ title: 'Error', description: 'Failed to assign request.', variant: 'destructive' });
    }
  };

  const handleExportCSV = () => {
    const headers = ['Request ID', 'Employee', 'Grade', 'Type', 'Category', 'Amount', 'Status', 'SLA Status', 'Days in Queue'];
    const rows = filteredItems.map(i => [
      i.requestRef,
      i.employeeName,
      i.employeeGrade,
      i.requestType,
      i.category,
      i.amount ? formatCurrencyAED(i.amount) : '',
      i.status,
      i.slaInfo?.isOverdue ? 'Breached' : i.slaInfo?.isUrgent ? 'At Risk' : 'On Track',
      i.daysInQueue,
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `operations-queue-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    
    toast({ title: 'Export Complete', description: `${filteredItems.length} items exported.` });
  };

  // Bulk actions
  const handleBulkApprove = async () => {
    try {
      for (const id of selectedIds) {
        await updateStatus.mutateAsync({
          requestId: id,
          newStatus: REQUEST_STATUSES.APPROVED,
          reviewerNotes: 'Bulk approved',
        });
      }
      toast({ title: 'Bulk Approved', description: `${selectedIds.length} requests approved.` });
      setSelectedIds([]);
      refetch();
    } catch {
      toast({ title: 'Error', description: 'Failed to approve some requests.', variant: 'destructive' });
    }
  };

  return (
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
          {/* SLA Sort Toggle */}
          <div className="flex items-center gap-2">
            <Switch
              id="sla-sort"
              checked={sortBySla}
              onCheckedChange={handleSlaSortToggle}
            />
            <Label htmlFor="sla-sort" className="text-sm cursor-pointer flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3" />
              SLA Priority Sort
            </Label>
          </div>
          
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Strip */}
      <OpsQueueStats
        newToday={opsKpis.newToday}
        slaAtRisk={opsKpis.slaAtRisk}
        awaitingEmployee={opsKpis.awaitingEmployee}
        medianCycleTime={opsKpis.medianCycleTime}
      />

      {/* Main Queue Card */}
      <Card>
        <CardHeader className="pb-3">
          <OpsQueueTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            stats={stats}
            slaEnabled={slaEnabled}
          />
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Filters */}
          <OpsQueueFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            teamMembers={HR_TEAM_MEMBERS}
            categories={POLICY_CATEGORIES}
            activeFiltersCount={activeFiltersCount}
            onClearAll={handleClearFilters}
          />

          {/* Queue Table */}
          <OpsQueueTable
            items={paginatedItems}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onAction={handleInlineAction}
            onViewDetails={(id) => setSelectedRequestId(id)}
            teamMembers={HR_TEAM_MEMBERS}
            isLoading={isLoading}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * PAGE_SIZE + 1} – {Math.min(currentPage * PAGE_SIZE, filteredItems.length)} of {filteredItems.length}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setSearchParams(prev => {
                    const next = new URLSearchParams(prev);
                    next.set('page', String(currentPage - 1));
                    return next;
                  })}
                >
                  Previous
                </Button>
                <Badge variant="secondary">{currentPage} / {totalPages}</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setSearchParams(prev => {
                    const next = new URLSearchParams(prev);
                    next.set('page', String(currentPage + 1));
                    return next;
                  })}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Floating Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <FloatingActionBar
          selectedIds={selectedIds}
          claimsData={paginatedItems.map(i => ({ id: i.id, status: i.status, amount: i.amount, employeeName: i.employeeName }))}
          onClearSelection={() => setSelectedIds([])}
          onRefresh={() => refetch()}
          organizationId={organizationId}
          onAssignTo={(assigneeId, assigneeName) => {
            setPendingAssignId('bulk');
            setSelectedAssignee(assigneeId);
            handleAssignConfirm();
          }}
        />
      )}

      {/* Detail Sheet - New 4-tab version */}
      <ClaimDetailSheet
        requestId={selectedRequestId}
        organizationId={organizationId}
        open={!!selectedRequestId}
        onOpenChange={(open) => !open && setSelectedRequestId(null)}
        onStatusChange={() => refetch()}
      />

      {/* Timeline Drawer */}
      <RequestTimelineDrawer
        requestId={timelineRequestId}
        requestRef={timelineRequestRef}
        isOpen={!!timelineRequestId}
        onClose={() => setTimelineRequestId(null)}
      />

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
            <DialogDescription>
              Select a reason and optionally add notes for the employee.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reason</Label>
              <Select value={rejectReason} onValueChange={setRejectReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  {REJECTION_REASONS.map(r => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Additional Notes (Optional)</Label>
              <Textarea
                placeholder="Add notes for the employee..."
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRejectConfirm} disabled={!rejectReason}>
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Request</DialogTitle>
            <DialogDescription>
              Select a team member to handle this request.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
              <SelectTrigger>
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent>
                {HR_TEAM_MEMBERS.map(m => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAssignConfirm} disabled={!selectedAssignee}>
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default OperationsHub;
