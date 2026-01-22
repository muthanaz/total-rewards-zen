/**
 * Policy RPC Hooks
 * 
 * Provides atomic, RLS-safe operations for policies via SECURITY DEFINER functions.
 * These RPCs prevent duplicate creation and ensure consistent state.
 */

import { supabase } from '@/integrations/supabase/client';
import { PolicyContent, PolicyLogic } from '@/lib/policyEngine';
import { Json } from '@/integrations/supabase/types';

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
}

export interface CreatePolicyResult {
  success: boolean;
  policy_id?: string;
  policy_version_id?: string;
  policy_ref?: string;
  error?: string;
}

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
  error?: string;
}

/**
 * Create a policy with its initial draft version atomically
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
      error: result.error as string | undefined,
    };
  }

  return {
    success: false,
    error: 'Invalid response from create policy',
  };
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
      error: result.error as string | undefined,
    };
  }

  return {
    success: false,
    error: 'Invalid response from publish policy',
  };
}
