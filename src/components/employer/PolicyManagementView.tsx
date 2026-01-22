import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  FileText, 
  Plus, 
  Edit, 
  Eye, 
  History, 
  CheckCircle, 
  AlertTriangle,
  Send,
  Clock,
  Search,
  FileCheck,
  Lock,
  Archive,
  ExternalLink,
  Copy,
  MoreHorizontal,
  Trash2,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { EmployerGlobalFiltersBar, DataConfidenceBadge } from '@/components/employer';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { PageLayout } from '@/components/shared/PageLayout';
import { useEmployerPermissions } from '@/hooks/useEmployerPermissions';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PolicyEditorSheetV2 } from './PolicyEditorSheetV2';
import { CreatePolicyModal } from './CreatePolicyModal';
import { PolicyEmptyState, PolicyInsightsStrip } from './PolicyEmptyState';
import { 
  PolicyModelChip, 
  PolicyCapabilityChips, 
} from './PolicyCapabilityDisplay';
import { format } from 'date-fns';
import { LifeAreaChip, getLifeAreaLabel } from '@/components/shared/EnumChip';
import { toast } from 'sonner';
import { showPolicySuccess, showPolicyError } from '@/lib/policyToasts';
import { PolicyLogic } from '@/lib/policyEngine';
import { useAuditLog } from '@/hooks/useAuditLog';
import { useOrgSettings } from '@/hooks/useOrgSettings';
import {
  archiveOrDeletePolicy,
  approvePolicyVersion,
  duplicatePolicyVersion,
  getOrgPolicySettings,
  publishPolicyVersion,
  rejectPolicyVersion,
  submitPolicyForApproval,
} from '@/hooks/usePolicyRPC';
import { PolicyArchiveDeleteDialog } from './PolicyArchiveDeleteDialog';
import { PolicyApprovalDialog } from './PolicyApprovalDialog';

interface PolicyRow {
  id: string;
  organization_id: string | null;
  policy_ref: string;
  title: string;
  category: string;
  version: string;
  status: string;
  effective_from: string;
  effective_to: string | null;
  benefit_type: string | null;
  transaction_model: string | null;
  benefit_key: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined version data
  currentVersion?: {
    id: string;
    version_number: number;
    status: string;
    effective_from: string | null;
    effective_to: string | null;
    updated_at: string;
    logic_json?: PolicyLogic | null;
  } | null;
  draftVersion?: {
    id: string;
    version_number: number;
    status?: string;
    logic_json?: PolicyLogic | null;
  } | null;
}

export function PolicyManagementView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyRow | null>(null);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [archiveDeleteOpen, setArchiveDeleteOpen] = useState(false);
  const [archiveDeleteAction, setArchiveDeleteAction] = useState<'archive' | 'delete'>('archive');
  const [archiveDeleteHint, setArchiveDeleteHint] = useState<string | null>(null);
  const [archiveDeleteFlags, setArchiveDeleteFlags] = useState<{
    hasPublishedVersion?: boolean;
    hasLinkedRequests?: boolean;
  } | null>(null);
  const [archiveDeleteSubmitting, setArchiveDeleteSubmitting] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [approvalDialogMode, setApprovalDialogMode] = useState<'submit' | 'reject'>('submit');
  const [approvalSubmitting, setApprovalSubmitting] = useState(false);
  const { hasPermission } = useEmployerPermissions();
  const { user, role } = useAuth();
  const queryClient = useQueryClient();

  // Fetch organization ID
  const { data: profile } = useQuery({
    queryKey: ['profile-org', user?.id],
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

  const organizationId = profile?.organization_id;

  const { data: policyGovernance } = useQuery({
    queryKey: ['org_policy_governance', organizationId],
    queryFn: async () => {
      if (!organizationId) return null;
      return getOrgPolicySettings(organizationId);
    },
    enabled: !!organizationId,
  });

  const approvalsEnabled = policyGovernance?.require_policy_approval ?? true;
  const canApprove = role === 'admin' || hasPermission('can_process_claims');

  // Fetch org settings for admin-managed mode
  const { data: orgSettingsData } = useOrgSettings(organizationId);
  const policyManagementMode = orgSettingsData?.settings?.policy_management_mode || 'admin_led';
  const isAdminManaged = policyManagementMode === 'admin_led';
  const { data: policies = [], isLoading } = useQuery({
    queryKey: ['policies_management', organizationId],
    queryFn: async (): Promise<PolicyRow[]> => {
      if (!organizationId) return [];

      // Fetch policies
      const { data: policiesData, error: policiesError } = await supabase
        .from('policies')
        .select('*')
        .eq('organization_id', organizationId)
        .order('title');

      if (policiesError) throw policiesError;

      // Fetch all versions
      const policyIds = (policiesData || []).map(p => p.id);
      if (policyIds.length === 0) return [];

      const { data: versions, error: versionsError } = await (supabase
        .from('policy_versions' as any)
        .select('*')
        .in('policy_id', policyIds)
        .order('version_number', { ascending: false })) as any;

      if (versionsError) throw versionsError;

      // Map policies with version info
      return (policiesData || []).map(policy => {
        const policyVersions = (versions || []).filter((v: any) => v.policy_id === policy.id);
        const published = policyVersions.find((v: any) => v.status === 'published');
        const working = policyVersions.find((v: any) => ['draft', 'submitted', 'approved', 'rejected'].includes(v.status));

        return {
          ...policy,
          currentVersion: published ? {
            id: published.id,
            version_number: published.version_number,
            status: published.status,
            effective_from: published.effective_from,
            effective_to: published.effective_to,
            updated_at: published.last_updated_at || published.created_at,
            logic_json: published.logic_json as PolicyLogic | null,
          } : null,
          draftVersion: working
            ? {
                id: working.id,
                version_number: working.version_number,
                status: working.status,
                logic_json: working.logic_json as PolicyLogic | null,
              }
            : null,
        };
      });
    },
    enabled: !!organizationId,
  });

  const getStatusBadge = (policy: PolicyRow) => {
    if (policy.currentVersion) {
      return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Published v{policy.currentVersion.version_number}</Badge>;
    }
    if (policy.draftVersion) {
      const s = policy.draftVersion.status || 'draft';
      if (s === 'submitted') {
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Pending approval</Badge>;
      }
      if (s === 'approved') {
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Approved</Badge>;
      }
      if (s === 'rejected') {
        return <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20">Rejected</Badge>;
      }
      return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Draft v{policy.draftVersion.version_number}</Badge>;
    }
    if (!policy.is_active) {
      return <Badge className="bg-gray-500/10 text-gray-600 border-gray-500/20">Archived</Badge>;
    }
    return <Badge className="bg-muted text-muted-foreground">No Version</Badge>;
  };

  const filteredPolicies = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return policies.filter(policy => {
      // Soft-delete should disappear immediately
      if ((policy as any).is_deleted) return false;
      if (!policy.is_active) return false;
      const nameMatch = policy.title.toLowerCase().includes(query);
      const lifeAreaLabel = getLifeAreaLabel(policy.category).toLowerCase();
      const lifeAreaMatch = policy.category?.toLowerCase().includes(query) || lifeAreaLabel.includes(query);
      return nameMatch || lifeAreaMatch;
    });
  }, [policies, searchQuery]);

  const publishedCount = policies.filter(p => p.currentVersion && p.is_active).length;
  const draftCount = policies.filter(p => !p.currentVersion && p.draftVersion && p.is_active).length;
  const archivedCount = policies.filter(p => !p.is_active).length;

  const handleEditPolicy = (policy: PolicyRow, versionId?: string) => {
    setSelectedPolicy(policy);
    setSelectedVersionId(versionId || policy.draftVersion?.id || policy.currentVersion?.id || null);
    setEditorOpen(true);
  };

  const handlePolicyCreated = async (policyId: string, versionId: string) => {
    // Invalidate and wait for refetch
    await queryClient.invalidateQueries({ queryKey: ['policies_management'] });
    
    // Fetch the newly created policy directly and open editor
    const { data: newPolicy } = await supabase
      .from('policies')
      .select('*')
      .eq('id', policyId)
      .single();
    
    if (newPolicy) {
      setSelectedPolicy({
        ...newPolicy,
        currentVersion: null,
        draftVersion: { id: versionId, version_number: 1 },
      });
      setSelectedVersionId(versionId);
      setEditorOpen(true);
    }
  };

  // Listen for policy-created events from CreatePolicyModal
  useEffect(() => {
    const handlePolicyCreatedEvent = (event: CustomEvent<{ policyId: string; versionId: string }>) => {
      const { policyId, versionId } = event.detail;
      handlePolicyCreated(policyId, versionId);
    };

    window.addEventListener('policy-created', handlePolicyCreatedEvent as EventListener);
    return () => {
      window.removeEventListener('policy-created', handlePolicyCreatedEvent as EventListener);
    };
  }, [queryClient]);

  // Stable idempotency key for duplicate operation
  const duplicateRequestIdRef = React.useRef<string | null>(null);

  const handleDuplicate = async (policy: PolicyRow) => {
    // Generate stable idempotency key for this duplicate attempt
    if (!duplicateRequestIdRef.current) {
      duplicateRequestIdRef.current = crypto.randomUUID();
    }

    try {
      const result = await duplicatePolicyVersion({
        sourcePolicyId: policy.id,
        sourceVersionId: policy.currentVersion?.id || policy.draftVersion?.id,
        newTitle: `${policy.title} (Copy)`,
        clientRequestId: duplicateRequestIdRef.current,
      });

      if (!result.success) {
        showPolicyError('duplicate', {
          policyTitle: policy.title,
          error: result.error,
        });
        return;
      }

      // Reset idempotency key on success
      duplicateRequestIdRef.current = null;

      showPolicySuccess('duplicate', {
        policyTitle: result.title,
        alreadyExists: result.already_exists,
      });

      await queryClient.invalidateQueries({ queryKey: ['policies_management'] });

      // Open the duplicated policy in editor
      if (result.policy_id && result.policy_version_id) {
        const { data: newPolicy } = await supabase
          .from('policies')
          .select('*')
          .eq('id', result.policy_id)
          .single();

        if (newPolicy) {
          setSelectedPolicy({
            ...newPolicy,
            currentVersion: null,
            draftVersion: { id: result.policy_version_id, version_number: 1 },
          });
          setSelectedVersionId(result.policy_version_id);
          setEditorOpen(true);
        }
      }
    } catch (error: any) {
      showPolicyError('duplicate', {
        policyTitle: policy.title,
        error: error?.message,
      });
    }
  };

  const { logEvent } = useAuditLog();

  const openArchiveDelete = (policy: PolicyRow, action: 'archive' | 'delete') => {
    setSelectedPolicy(policy);
    setArchiveDeleteAction(action);
    setArchiveDeleteHint(null);
    setArchiveDeleteFlags(null);
    setArchiveDeleteOpen(true);
  };

  const handleArchiveDeleteConfirm = async ({ action, reason }: { action: 'archive' | 'delete'; reason: string }) => {
    if (!selectedPolicy) return;
    setArchiveDeleteSubmitting(true);
    setArchiveDeleteHint(null);
    try {
      const res = await archiveOrDeletePolicy({
        policyId: selectedPolicy.id,
        action,
        reason,
      });

      if (!res.success) {
        setArchiveDeleteHint(res.error || 'Action not allowed');
        setArchiveDeleteFlags({
          hasPublishedVersion: Boolean(res.has_published_version),
          hasLinkedRequests: Boolean(res.has_linked_claims),
        });
        showPolicyError(action, {
          policyTitle: selectedPolicy.title,
          error: res.error,
          hasPublishedVersion: res.has_published_version,
          hasLinkedClaims: res.has_linked_claims,
          canArchive: res.can_archive,
        });
        await logEvent({
          action: 'ARCHIVE_POLICY',
          resourceType: 'policy',
          resourceId: selectedPolicy.id,
          details: {
            outcome: 'failure',
            policy_id: selectedPolicy.id,
            organization_id: selectedPolicy.organization_id,
            action,
            reason,
            error: res.error,
          },
        });
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ['policies_management'] });
      showPolicySuccess(action, { policyTitle: selectedPolicy.title });

      await logEvent({
        action: 'ARCHIVE_POLICY',
        resourceType: 'policy',
        resourceId: selectedPolicy.id,
        details: {
          outcome: 'success',
          policy_id: selectedPolicy.id,
          organization_id: selectedPolicy.organization_id,
          previous_status: selectedPolicy.currentVersion ? 'published' : (selectedPolicy.draftVersion?.status || 'draft'),
          new_status: 'archived',
          action,
          reason,
        },
      });

      setArchiveDeleteOpen(false);
    } catch (err: any) {
      showPolicyError(action, { policyTitle: selectedPolicy.title, error: err?.message });
      await logEvent({
        action: 'ARCHIVE_POLICY',
        resourceType: 'policy',
        resourceId: selectedPolicy.id,
        details: {
          outcome: 'failure',
          policy_id: selectedPolicy.id,
          organization_id: selectedPolicy.organization_id,
          action,
          reason,
          error: err?.message || String(err),
        },
      });
    } finally {
      setArchiveDeleteSubmitting(false);
    }
  };

  const handlePublishDraftDirect = async (policy: PolicyRow) => {
    if (!policy.draftVersion?.id) return;
    try {
      const res = await publishPolicyVersion({ versionId: policy.draftVersion.id });
      if (!res.success) {
        if (res.requires_approval) {
          showPolicyError('publish', {
            policyTitle: policy.title,
            requiresApproval: true,
          });
          return;
        }
        showPolicyError('publish', {
          policyTitle: policy.title,
          error: res.error,
        });
        return;
      }

      showPolicySuccess('publish', {
        policyTitle: policy.title,
        versionNumber: res.version_number ?? policy.draftVersion.version_number,
      });
      await queryClient.invalidateQueries({ queryKey: ['policies_management'] });
      await logEvent({
        action: 'PUBLISH_POLICY',
        resourceType: 'policy',
        resourceId: policy.id,
        details: {
          outcome: 'success',
          policy_id: policy.id,
          organization_id: policy.organization_id,
          previous_status: 'draft',
          new_status: 'published',
          version_id: policy.draftVersion.id,
          version_number: res.version_number,
        },
      });
    } catch (e: any) {
      showPolicyError('publish', { policyTitle: policy.title, error: e?.message });
    }
  };

  const openApprovalDialog = (policy: PolicyRow, mode: 'submit' | 'reject') => {
    setSelectedPolicy(policy);
    setApprovalDialogMode(mode);
    setApprovalDialogOpen(true);
  };

  const handleSubmitForApproval = async (noteOrReason: string) => {
    if (!selectedPolicy?.draftVersion?.id) return;
    setApprovalSubmitting(true);
    try {
      const res = await submitPolicyForApproval({
        versionId: selectedPolicy.draftVersion.id,
        note: noteOrReason || undefined,
      });

      if (!res.success) {
        showPolicyError('submit', {
          policyTitle: selectedPolicy.title,
          error: res.error,
        });
        await logEvent({
          action: 'SUBMIT_POLICY_APPROVAL',
          resourceType: 'policy',
          resourceId: selectedPolicy.id,
          details: {
            outcome: 'failure',
            policy_id: selectedPolicy.id,
            organization_id: selectedPolicy.organization_id,
            previous_status: 'draft',
            new_status: 'pending_approval',
            note: noteOrReason || null,
            error: res.error,
          },
        });
        return;
      }

      showPolicySuccess('submit', {
        policyTitle: selectedPolicy.title,
        versionNumber: selectedPolicy.draftVersion.version_number,
      });
      await queryClient.invalidateQueries({ queryKey: ['policies_management'] });
      await logEvent({
        action: 'SUBMIT_POLICY_APPROVAL',
        resourceType: 'policy',
        resourceId: selectedPolicy.id,
        details: {
          outcome: 'success',
          policy_id: selectedPolicy.id,
          organization_id: selectedPolicy.organization_id,
          previous_status: 'draft',
          new_status: 'pending_approval',
          version_id: selectedPolicy.draftVersion.id,
          note: noteOrReason || null,
        },
      });
      setApprovalDialogOpen(false);
    } finally {
      setApprovalSubmitting(false);
    }
  };

  const handleReject = async (reason: string) => {
    if (!selectedPolicy?.draftVersion?.id) return;
    setApprovalSubmitting(true);
    try {
      const { data: approval } = await (supabase
        .from('policy_approvals' as any)
        .select('id')
        .eq('policy_version_id', selectedPolicy.draftVersion.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()) as any;

      if (!approval?.id) {
        showPolicyError('reject', { error: 'No pending approval record found.' });
        return;
      }

      const res = await rejectPolicyVersion(approval.id, reason);
      if (!res.success) {
        showPolicyError('reject', { policyTitle: selectedPolicy.title, error: res.error });
        await logEvent({
          action: 'REJECT_POLICY',
          resourceType: 'policy',
          resourceId: selectedPolicy.id,
          details: {
            outcome: 'failure',
            policy_id: selectedPolicy.id,
            organization_id: selectedPolicy.organization_id,
            previous_status: 'pending_approval',
            new_status: 'draft',
            reason,
            error: res.error,
          },
        });
        return;
      }

      showPolicySuccess('reject', { policyTitle: selectedPolicy.title });
      await queryClient.invalidateQueries({ queryKey: ['policies_management'] });
      await logEvent({
        action: 'REJECT_POLICY',
        resourceType: 'policy',
        resourceId: selectedPolicy.id,
        details: {
          outcome: 'success',
          policy_id: selectedPolicy.id,
          organization_id: selectedPolicy.organization_id,
          previous_status: 'pending_approval',
          new_status: 'draft',
          reason,
        },
      });
      setApprovalDialogOpen(false);
    } finally {
      setApprovalSubmitting(false);
    }
  };

  const handleApproveAndPublish = async (policy: PolicyRow) => {
    if (!policy.draftVersion?.id) return;
    if (!canApprove) {
      toast.error('Not allowed', { description: 'You do not have permission to approve policies.' });
      return;
    }

    setApprovalSubmitting(true);
    try {
      const { data: approval } = await (supabase
        .from('policy_approvals' as any)
        .select('id')
        .eq('policy_version_id', policy.draftVersion.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()) as any;

      if (!approval?.id) {
        showPolicyError('approve', { error: 'No pending approval record found.' });
        return;
      }

      const approveRes = await approvePolicyVersion({ approvalId: approval.id });
      if (!approveRes.success) {
        showPolicyError('approve', { policyTitle: policy.title, error: approveRes.error });
        await logEvent({
          action: 'APPROVE_POLICY',
          resourceType: 'policy',
          resourceId: policy.id,
          details: {
            outcome: 'failure',
            policy_id: policy.id,
            organization_id: policy.organization_id,
            previous_status: 'pending_approval',
            new_status: 'approved',
            error: approveRes.error,
          },
        });
        return;
      }

      await logEvent({
        action: 'APPROVE_POLICY',
        resourceType: 'policy',
        resourceId: policy.id,
        details: {
          outcome: 'success',
          policy_id: policy.id,
          organization_id: policy.organization_id,
          previous_status: 'pending_approval',
          new_status: 'approved',
          version_id: policy.draftVersion.id,
        },
      });

      const publishRes = await publishPolicyVersion({ versionId: policy.draftVersion.id });
      if (!publishRes.success) {
        showPolicyError('publish', { policyTitle: policy.title, error: publishRes.error });
        await logEvent({
          action: 'PUBLISH_POLICY',
          resourceType: 'policy',
          resourceId: policy.id,
          details: {
            outcome: 'failure',
            policy_id: policy.id,
            organization_id: policy.organization_id,
            previous_status: 'approved',
            new_status: 'published',
            version_id: policy.draftVersion.id,
            error: publishRes.error,
          },
        });
        return;
      }

      showPolicySuccess('publish', {
        policyTitle: policy.title,
        versionNumber: publishRes.version_number ?? policy.draftVersion.version_number,
      });
      await queryClient.invalidateQueries({ queryKey: ['policies_management'] });
      await logEvent({
        action: 'PUBLISH_POLICY',
        resourceType: 'policy',
        resourceId: policy.id,
        details: {
          outcome: 'success',
          policy_id: policy.id,
          organization_id: policy.organization_id,
          previous_status: 'approved',
          new_status: 'published',
          version_id: policy.draftVersion.id,
          version_number: publishRes.version_number,
        },
      });
    } finally {
      setApprovalSubmitting(false);
    }
  };

  // Generate insights
  const insights = useMemo(() => {
    const result: Array<{ type: 'info' | 'warning' | 'success'; message: string }> = [];
    
    if (draftCount > 0) {
      result.push({
        type: 'warning',
        message: `${draftCount} draft${draftCount > 1 ? 's' : ''} pending review and publication`,
      });
    }
    
    const policiesWithoutSLA = filteredPolicies.filter(p => {
      const logic = p.currentVersion?.logic_json || p.draftVersion?.logic_json;
      return !logic?.workflow?.sla_days || logic.workflow.sla_days === 0;
    });
    if (policiesWithoutSLA.length > 0 && publishedCount > 0) {
      result.push({
        type: 'info',
        message: `${policiesWithoutSLA.length} polic${policiesWithoutSLA.length > 1 ? 'ies have' : 'y has'} no SLA configured (optional)`,
      });
    }
    
    if (publishedCount > 0) {
      result.push({
        type: 'success',
        message: `${publishedCount} polic${publishedCount > 1 ? 'ies are' : 'y is'} live and visible to employees`,
      });
    }
    
    return result;
  }, [filteredPolicies, draftCount, publishedCount]);

  return (
    <TooltipProvider>
      <PageLayout
        title="Policy Management"
        description="Create, edit, and manage organization benefit policies"
        icon={BookOpen}
        confidenceBadge={
          <DataConfidenceBadge 
            metrics={{
              employeeCoverage: 100,
              entitlementCoverage: 100,
              policyCoverage: publishedCount > 0 ? 100 : 30,
              claimsCoverage: 100,
            }} 
          />
        }
        actions={
          <div className="flex items-center gap-3">
            {/* Admin-managed indicator */}
            {isAdminManaged && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="gap-1 text-muted-foreground">
                    <ShieldCheck className="w-3 h-3" />
                    Admin Managed
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="text-xs">
                    Policies are configured by your platform administrator. 
                    You can view policies and request changes.
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
            
            <PermissionGate 
              permission="can_manage_policies"
              fallback={
                <Badge variant="outline" className="gap-1 text-muted-foreground">
                  <Lock className="w-3 h-3" /> View Only
                </Badge>
              }
            >
              <Button className="gap-2" onClick={() => setCreateModalOpen(true)}>
                <Plus className="w-4 h-4" />
                Create New Policy
              </Button>
            </PermissionGate>
          </div>
        }
        filters={<EmployerGlobalFiltersBar compact />}
      >
        {/* Key Insights */}
        {insights.length > 0 && <PolicyInsightsStrip insights={insights} />}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Policies</p>
                <p className="text-2xl font-bold">{policies.filter(p => p.is_active).length}</p>
              </div>
              <FileText className="w-8 h-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Published</p>
                <p className="text-2xl font-bold text-emerald-600">{publishedCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-500/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Drafts</p>
                <p className="text-2xl font-bold text-amber-600">{draftCount}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-500/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Archived</p>
                <p className="text-2xl font-bold text-muted-foreground">{archivedCount}</p>
              </div>
              <Archive className="w-8 h-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <TabsList>
            <TabsTrigger value="all">All Policies ({filteredPolicies.length})</TabsTrigger>
            <TabsTrigger value="published">Published ({publishedCount})</TabsTrigger>
            <TabsTrigger value="drafts">Drafts ({draftCount})</TabsTrigger>
            <TabsTrigger value="documents">Required Documents</TabsTrigger>
          </TabsList>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search policies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <Card className="card-elevated">
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">Loading policies...</div>
              </CardContent>
            </Card>
          ) : filteredPolicies.length === 0 ? (
            <PolicyEmptyState 
              onCreateClick={() => setCreateModalOpen(true)}
              canCreate={hasPermission('can_manage_policies')}
            />
          ) : (
            <Card className="card-elevated">
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Policy Name</TableHead>
                      <TableHead>Life Area</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Capabilities</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPolicies.map((policy) => (
                      <TableRow key={policy.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{policy.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <LifeAreaChip value={policy.category || ''} showTooltip={true} />
                        </TableCell>
                        <TableCell>
                          <PolicyModelChip model={policy.transaction_model || 'claim_only'} />
                        </TableCell>
                        <TableCell>
                          <PolicyCapabilityChips 
                            logicJson={policy.currentVersion?.logic_json || policy.draftVersion?.logic_json} 
                            transactionModel={policy.transaction_model}
                            compact
                          />
                        </TableCell>
                        <TableCell>
                          {policy.currentVersion 
                            ? `v${policy.currentVersion.version_number}`
                            : policy.draftVersion 
                              ? `v${policy.draftVersion.version_number} (draft)`
                              : '—'
                          }
                        </TableCell>
                        <TableCell>{getStatusBadge(policy)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {policy.currentVersion?.updated_at
                            ? format(new Date(policy.currentVersion.updated_at), 'MMM d, yyyy')
                            : format(new Date(policy.updated_at), 'MMM d, yyyy')
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleEditPolicy(policy)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <PermissionGate permission="can_manage_policies">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditPolicy(policy)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDuplicate(policy)}>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <History className="w-4 h-4 mr-2" />
                                    Version History
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {approvalsEnabled && policy.draftVersion?.status === 'draft' && (
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedPolicy(policy);
                                        setSelectedVersionId(policy.draftVersion?.id || null);
                                        openApprovalDialog(policy, 'submit');
                                      }}
                                    >
                                      <Send className="w-4 h-4 mr-2" />
                                      Submit for approval
                                    </DropdownMenuItem>
                                  )}

                                  {approvalsEnabled && policy.draftVersion?.status === 'submitted' && (
                                    <>
                                      <DropdownMenuItem
                                        onClick={() => handleApproveAndPublish(policy)}
                                        disabled={!canApprove || approvalSubmitting}
                                      >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Approve & publish
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={() => {
                                          setSelectedPolicy(policy);
                                          setSelectedVersionId(policy.draftVersion?.id || null);
                                          openApprovalDialog(policy, 'reject');
                                        }}
                                        disabled={approvalSubmitting}
                                      >
                                        <AlertTriangle className="w-4 h-4 mr-2" />
                                        Reject
                                      </DropdownMenuItem>
                                    </>
                                  )}

                                   {!approvalsEnabled && policy.draftVersion?.status === 'draft' && (
                                     <DropdownMenuItem
                                       onClick={() => void handlePublishDraftDirect(policy)}
                                       disabled={approvalSubmitting}
                                     >
                                       <CheckCircle className="w-4 h-4 mr-2" />
                                       Publish
                                     </DropdownMenuItem>
                                   )}

                                   <DropdownMenuItem onClick={() => openArchiveDelete(policy, 'archive')}>
                                     <Archive className="w-4 h-4 mr-2" />
                                     Archive
                                   </DropdownMenuItem>

                                   <DropdownMenuItem
                                     className="text-destructive"
                                     onClick={() => openArchiveDelete(policy, 'delete')}
                                   >
                                     <Trash2 className="w-4 h-4 mr-2" />
                                     Delete
                                   </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </PermissionGate>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="published" className="space-y-4">
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {filteredPolicies.filter(p => p.currentVersion).map((policy) => (
                  <div key={policy.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                      <div>
                        <p className="font-medium">{policy.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Version {policy.currentVersion?.version_number} • Effective from {
                            policy.currentVersion?.effective_from
                              ? format(new Date(policy.currentVersion.effective_from), 'MMM d, yyyy')
                              : '—'
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditPolicy(policy)}>
                        View
                      </Button>
                      <PermissionGate permission="can_manage_policies">
                        <Button variant="outline" size="sm" onClick={() => handleEditPolicy(policy)}>
                          New Version
                        </Button>
                      </PermissionGate>
                    </div>
                  </div>
                ))}
                {filteredPolicies.filter(p => p.currentVersion).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">No published policies</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cross-portal info */}
          <Card className="border-blue-500/30 bg-blue-500/5">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-700 dark:text-blue-400">
                    Cross-Portal Consistency
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Published policies are immediately visible to employees. Only the current published version 
                    is shown on employee benefit pages. Previous versions are archived but accessible for reference.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drafts" className="space-y-4">
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {filteredPolicies.filter(p => !p.currentVersion && p.draftVersion).map((policy) => (
                  <div key={policy.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-amber-500" />
                      <div>
                        <p className="font-medium">{policy.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Draft v{policy.draftVersion?.version_number} • Created {
                            format(new Date(policy.created_at), 'MMM d, yyyy')
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">Draft</Badge>
                      <PermissionGate permission="can_manage_policies">
                        <Button size="sm" onClick={() => handleEditPolicy(policy, policy.draftVersion?.id)}>
                          Continue Editing
                        </Button>
                      </PermissionGate>
                    </div>
                  </div>
                ))}
                {filteredPolicies.filter(p => !p.currentVersion && p.draftVersion).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">No drafts pending</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-lg">Required Documents by Policy</CardTitle>
              <CardDescription>Configure what documents employees must submit for each benefit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredPolicies.map((policy) => (
                  <div key={policy.id} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-primary" />
                        <span className="font-medium">{policy.title}</span>
                        {getStatusBadge(policy)}
                      </div>
                      <PermissionGate permission="can_manage_policies">
                        <Button variant="outline" size="sm" onClick={() => handleEditPolicy(policy)}>
                          <Edit className="w-3 h-3 mr-1" />
                          Configure Docs
                        </Button>
                      </PermissionGate>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Document requirements are configured in the Policy Logic tab
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Policy Modal */}
      <CreatePolicyModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        organizationId={organizationId || ''}
        onCreated={handlePolicyCreated}
      />

      {/* Policy Editor Sheet */}
      {selectedPolicy && (
        <PolicyEditorSheetV2
          policyId={selectedPolicy.id}
          versionId={selectedVersionId}
          organizationId={organizationId || ''}
          open={editorOpen}
          onOpenChange={setEditorOpen}
        />
      )}

      {/* Archive/Delete */}
      <PolicyArchiveDeleteDialog
        open={archiveDeleteOpen}
        onOpenChange={setArchiveDeleteOpen}
        policy={
          selectedPolicy
            ? {
                id: selectedPolicy.id,
                title: selectedPolicy.title,
                hasPublishedVersion: Boolean(selectedPolicy.currentVersion),
              }
            : null
        }
        action={archiveDeleteAction}
        isSubmitting={archiveDeleteSubmitting}
        serverHint={archiveDeleteHint}
        serverFlags={archiveDeleteFlags}
        onConfirm={handleArchiveDeleteConfirm}
      />

      {/* Submit / Reject */}
      <PolicyApprovalDialog
        open={approvalDialogOpen}
        onOpenChange={setApprovalDialogOpen}
        mode={approvalDialogMode}
        policy={selectedPolicy ? { id: selectedPolicy.id, title: selectedPolicy.title } : null}
        isSubmitting={approvalSubmitting}
        onConfirm={({ noteOrReason }) => {
          if (!selectedPolicy) return;
          if (approvalDialogMode === 'submit') void handleSubmitForApproval(noteOrReason);
          else void handleReject(noteOrReason);
        }}
      />
      </PageLayout>
    </TooltipProvider>
  );
}
