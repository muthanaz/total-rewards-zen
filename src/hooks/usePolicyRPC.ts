/**
 * Policy RPC Hooks
 * 
 * Provides atomic, RLS-safe operations for policies via SECURITY DEFINER functions.
 * These RPCs prevent duplicate creation and ensure consistent state.
 */

import { supabase } from '@/integrations/supabase/client';
import { PolicyContent, PolicyLogic } from '@/lib/policyEngine';
import { Json } from '@/integrations/supabase/types';

// =============================================================================
// CREATE POLICY
// =============================================================================

export interface CreatePolicyParams {
  orgId: string;
  createdBy: string;
  policyName: string;
  lifeArea: string;
  benefitType?: string;
  transactionModel?: string;
  effectiveFrom?: string;
  effectiveTo?: string | null;
  templateId?: string | null;
  contentJson?: PolicyContent | null;
  logicJson?: PolicyLogic | null;
  clientRequestId?: string; // For idempotency
}

export interface CreatePolicyResult {
  success: boolean;
  policy_id?: string;
  policy_version_id?: string;
  policy_ref?: string;
  already_exists?: boolean;
  error?: string;
}

/**
 * Create a policy with its initial draft version atomically
 * Uses idempotency key to prevent duplicates
 */
export async function createPolicyWithVersion(
  params: CreatePolicyParams
): Promise<CreatePolicyResult> {
  const { data, error } = await supabase.rpc('create_policy_with_version', {
    p_org_id: params.orgId,
    p_created_by: params.createdBy,
    p_policy_name: params.policyName,
    p_life_area: params.lifeArea,
    p_benefit_type: params.benefitType || 'allowance',
    p_transaction_model: params.transactionModel || 'claim_only',
    p_effective_from: params.effectiveFrom || null,
    p_effective_to: params.effectiveTo || null,
    p_template_id: params.templateId || null,
    p_content_json: params.contentJson ? (params.contentJson as unknown as Json) : null,
    p_logic_json: params.logicJson ? (params.logicJson as unknown as Json) : null,
    p_client_request_id: params.clientRequestId || null,
  });

  if (error) {
    console.error('RPC create_policy_with_version error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create policy',
    };
  }

  // The RPC returns a JSONB object - parse safely
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const result = data as Record<string, unknown>;
    return {
      success: Boolean(result.success),
      policy_id: result.policy_id as string | undefined,
      policy_version_id: result.policy_version_id as string | undefined,
      policy_ref: result.policy_ref as string | undefined,
      already_exists: Boolean(result.already_exists),
      error: result.error as string | undefined,
    };
  }

  return {
    success: false,
    error: 'Invalid response from create policy',
  };
}

// =============================================================================
// PUBLISH POLICY
// =============================================================================

export interface PublishPolicyParams {
  policyId: string;
  versionId: string;
  effectiveFrom?: string;
}

export interface PublishPolicyResult {
  success: boolean;
  policy_id?: string;
  version_id?: string;
  version_number?: number;
  status?: string;
  requires_approval?: boolean;
  error?: string;
}

/**
 * Publish a policy version atomically
 */
export async function publishPolicyVersion(
  params: PublishPolicyParams
): Promise<PublishPolicyResult> {
  const { data, error } = await supabase.rpc('publish_policy_version', {
    p_policy_id: params.policyId,
    p_version_id: params.versionId,
    p_effective_from: params.effectiveFrom || new Date().toISOString().split('T')[0],
  });

  if (error) {
    console.error('RPC publish_policy_version error:', error);
    return {
      success: false,
      error: error.message || 'Failed to publish policy',
    };
  }

  // The RPC returns a JSONB object - parse safely
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const result = data as Record<string, unknown>;
    return {
      success: Boolean(result.success),
      policy_id: result.policy_id as string | undefined,
      version_id: result.version_id as string | undefined,
      version_number: result.version_number as number | undefined,
      status: result.status as string | undefined,
      requires_approval: Boolean(result.requires_approval),
      error: result.error as string | undefined,
    };
  }

  return {
    success: false,
    error: 'Invalid response from publish policy',
  };
}

// =============================================================================
// APPROVAL WORKFLOW
// =============================================================================

export interface SubmitForApprovalParams {
  versionId: string;
  note?: string;
}

export interface SubmitForApprovalResult {
  success: boolean;
  approval_id?: string;
  version_id?: string;
  status?: string;
  can_publish_directly?: boolean;
  error?: string;
}

/**
 * Submit a policy version for approval
 */
export async function submitPolicyForApproval(
  params: SubmitForApprovalParams
): Promise<SubmitForApprovalResult> {
  const { data, error } = await supabase.rpc('submit_policy_for_approval', {
    p_policy_version_id: params.versionId,
    p_note: params.note || null,
  });

  if (error) {
    console.error('RPC submit_policy_for_approval error:', error);
    return {
      success: false,
      error: error.message || 'Failed to submit for approval',
    };
  }

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const result = data as Record<string, unknown>;
    return {
      success: Boolean(result.success),
      approval_id: result.approval_id as string | undefined,
      version_id: result.version_id as string | undefined,
      status: result.status as string | undefined,
      can_publish_directly: Boolean(result.can_publish_directly),
      error: result.error as string | undefined,
    };
  }

  return {
    success: false,
    error: 'Invalid response from submit for approval',
  };
}

export interface ApproveRejectParams {
  approvalId: string;
  comment?: string;
}

export interface ApproveRejectResult {
  success: boolean;
  approval_id?: string;
  version_id?: string;
  status?: string;
  error?: string;
}

/**
 * Approve a policy version
 */
export async function approvePolicyVersion(
  params: ApproveRejectParams
): Promise<ApproveRejectResult> {
  const { data, error } = await supabase.rpc('approve_policy_version', {
    p_approval_id: params.approvalId,
    p_comment: params.comment || null,
  });

  if (error) {
    console.error('RPC approve_policy_version error:', error);
    return {
      success: false,
      error: error.message || 'Failed to approve policy',
    };
  }

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const result = data as Record<string, unknown>;
    return {
      success: Boolean(result.success),
      approval_id: result.approval_id as string | undefined,
      version_id: result.version_id as string | undefined,
      status: result.status as string | undefined,
      error: result.error as string | undefined,
    };
  }

  return {
    success: false,
    error: 'Invalid response from approve policy',
  };
}

/**
 * Reject a policy version
 */
export async function rejectPolicyVersion(
  approvalId: string,
  reason: string
): Promise<ApproveRejectResult> {
  const { data, error } = await supabase.rpc('reject_policy_version', {
    p_approval_id: approvalId,
    p_reason: reason,
  });

  if (error) {
    console.error('RPC reject_policy_version error:', error);
    return {
      success: false,
      error: error.message || 'Failed to reject policy',
    };
  }

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const result = data as Record<string, unknown>;
    return {
      success: Boolean(result.success),
      approval_id: result.approval_id as string | undefined,
      version_id: result.version_id as string | undefined,
      status: result.status as string | undefined,
      error: result.error as string | undefined,
    };
  }

  return {
    success: false,
    error: 'Invalid response from reject policy',
  };
}

/**
 * Revert a rejected policy version back to draft
 */
export async function revertPolicyToDraft(
  versionId: string
): Promise<{ success: boolean; version_id?: string; status?: string; error?: string }> {
  const { data, error } = await supabase.rpc('revert_policy_to_draft', {
    p_policy_version_id: versionId,
  });

  if (error) {
    console.error('RPC revert_policy_to_draft error:', error);
    return {
      success: false,
      error: error.message || 'Failed to revert to draft',
    };
  }

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const result = data as Record<string, unknown>;
    return {
      success: Boolean(result.success),
      version_id: result.version_id as string | undefined,
      status: result.status as string | undefined,
      error: result.error as string | undefined,
    };
  }

  return {
    success: false,
    error: 'Invalid response from revert to draft',
  };
}

// =============================================================================
// ARCHIVE / DELETE
// =============================================================================

export interface ArchiveDeleteParams {
  policyId: string;
  action: 'archive' | 'delete';
  reason?: string;
}

export interface ArchiveDeleteResult {
  success: boolean;
  action?: string;
  policy_id?: string;
  has_published_version?: boolean;
  has_linked_claims?: boolean;
  can_archive?: boolean;
  error?: string;
}

/**
 * Archive or delete a policy safely
 */
export async function archiveOrDeletePolicy(
  params: ArchiveDeleteParams
): Promise<ArchiveDeleteResult> {
  const { data, error } = await supabase.rpc('archive_or_delete_policy', {
    p_policy_id: params.policyId,
    p_action: params.action,
    p_reason: params.reason || null,
  });

  if (error) {
    console.error('RPC archive_or_delete_policy error:', error);
    return {
      success: false,
      error: error.message || 'Failed to archive/delete policy',
    };
  }

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const result = data as Record<string, unknown>;
    return {
      success: Boolean(result.success),
      action: result.action as string | undefined,
      policy_id: result.policy_id as string | undefined,
      has_published_version: Boolean(result.has_published_version),
      has_linked_claims: Boolean(result.has_linked_claims),
      can_archive: Boolean(result.can_archive),
      error: result.error as string | undefined,
    };
  }

  return {
    success: false,
    error: 'Invalid response from archive/delete policy',
  };
}

// =============================================================================
// ORG POLICY SETTINGS
// =============================================================================

export interface OrgPolicySettings {
  require_policy_approval: boolean;
  approver_role: 'executive' | 'hr_manager' | 'admin' | 'custom';
  approval_sla_days: number;
  allow_hr_ops_draft: boolean;
}

/**
 * Fetch org policy settings
 */
export async function getOrgPolicySettings(
  orgId: string
): Promise<OrgPolicySettings | null> {
  // Use type assertion since org_policy_settings is a new table
  const { data, error } = await (supabase
    .from('org_policy_settings' as any)
    .select('*')
    .eq('organization_id', orgId)
    .maybeSingle()) as any;

  if (error) {
    console.error('Failed to fetch org policy settings:', error);
    return null;
  }

  if (!data) {
    // Return defaults if no settings exist
    return {
      require_policy_approval: false, // Default: no approval required
      approver_role: 'hr_manager',
      approval_sla_days: 3,
      allow_hr_ops_draft: true,
    };
  }

  return {
    require_policy_approval: data.require_policy_approval ?? false,
    approver_role: (data.approver_role as OrgPolicySettings['approver_role']) || 'hr_manager',
    approval_sla_days: data.approval_sla_days ?? 3,
    allow_hr_ops_draft: data.allow_hr_ops_draft ?? true,
  };
}

// =============================================================================
// PENDING APPROVALS
// =============================================================================

export interface PolicyApproval {
  id: string;
  organization_id: string;
  policy_id: string;
  policy_version_id: string;
  requested_by: string;
  approver_user_id: string | null;
  approver_role: string | null;
  status: 'pending' | 'approved' | 'rejected';
  comment: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch pending policy approvals for an organization
 */
export async function getPendingApprovals(
  orgId: string
): Promise<PolicyApproval[]> {
  // Use type assertion since policy_approvals is a new table
  const { data, error } = await (supabase
    .from('policy_approvals' as any)
    .select('*')
    .eq('organization_id', orgId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })) as any;

  if (error) {
    console.error('Failed to fetch pending approvals:', error);
    return [];
  }

  return (data || []) as unknown as PolicyApproval[];
}
