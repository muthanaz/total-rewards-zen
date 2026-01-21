/**
 * Policy Engine Hooks
 * 
 * Provides CRUD operations for the new policy engine with structured versioning.
 * This replaces/extends the older usePolicies hook with proper version management.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAuditLog } from '@/hooks/useAuditLog';
import {
  Policy,
  PolicyVersion,
  PolicyWithVersions,
  PolicyLogic,
  PolicyContent,
  PolicyRequiredDoc,
  BenefitPolicyType,
  TransactionModel,
  DEFAULT_POLICY_LOGIC,
  DEFAULT_POLICY_CONTENT,
  EmployeeContext,
  PolicyValidationResult,
  checkEligibility,
} from '@/lib/policyEngine';
import { toast } from 'sonner';

// ============== Query Hooks ==============

/**
 * Fetch all policies for an organization with their versions
 */
export function useOrganizationPoliciesV2(organizationId: string | null) {
  return useQuery({
    queryKey: ['policies_v2', organizationId],
    queryFn: async (): Promise<PolicyWithVersions[]> => {
      if (!organizationId) return [];

      // Fetch policies
      const { data: policies, error: policiesError } = await supabase
        .from('policies')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .order('title');

      if (policiesError) throw policiesError;

      // Fetch all versions for these policies
      const policyIds = (policies || []).map(p => p.id);
      if (policyIds.length === 0) return [];

      const { data: versions, error: versionsError } = await supabase
        .from('policy_versions')
        .select('*')
        .in('policy_id', policyIds)
        .order('version_number', { ascending: false });

      if (versionsError) throw versionsError;

      // Fetch required docs for published versions
      const publishedVersionIds = (versions || [])
        .filter(v => v.status === 'published')
        .map(v => v.id);

      let requiredDocs: PolicyRequiredDoc[] = [];
      if (publishedVersionIds.length > 0) {
        const { data: docs, error: docsError } = await supabase
          .from('policy_required_docs')
          .select('*')
          .in('policy_version_id', publishedVersionIds);

        if (docsError) throw docsError;
        requiredDocs = (docs || []) as PolicyRequiredDoc[];
      }

      // Group by policy
      return (policies || []).map(policy => {
        const policyVersions = (versions || []).filter(v => v.policy_id === policy.id);
        const currentVersion = policyVersions.find(v => v.status === 'published') || null;
        const versionDocs = currentVersion
          ? requiredDocs.filter(d => (d as any).policy_version_id === currentVersion.id)
          : [];

        return {
          ...policy,
          benefit_type: policy.benefit_type as BenefitPolicyType | null,
          transaction_model: policy.transaction_model as TransactionModel | null,
          currentVersion: currentVersion ? {
            ...currentVersion,
            content_json: (currentVersion.content_json || DEFAULT_POLICY_CONTENT) as PolicyContent,
            logic_json: (currentVersion.logic_json || DEFAULT_POLICY_LOGIC) as PolicyLogic,
            required_docs: versionDocs,
          } as PolicyVersion : null,
          allVersions: policyVersions.map(v => ({
            ...v,
            content_json: (v.content_json || DEFAULT_POLICY_CONTENT) as PolicyContent,
            logic_json: (v.logic_json || DEFAULT_POLICY_LOGIC) as PolicyLogic,
          })) as PolicyVersion[],
          requiredDocs: versionDocs,
        };
      });
    },
    enabled: !!organizationId,
  });
}

/**
 * Fetch a single policy by ID with all versions
 */
export function usePolicyById(policyId: string | null) {
  return useQuery({
    queryKey: ['policy_v2', policyId],
    queryFn: async (): Promise<PolicyWithVersions | null> => {
      if (!policyId) return null;

      const { data: policy, error: policyError } = await supabase
        .from('policies')
        .select('*')
        .eq('id', policyId)
        .single();

      if (policyError) throw policyError;

      const { data: versions, error: versionsError } = await supabase
        .from('policy_versions')
        .select('*')
        .eq('policy_id', policyId)
        .order('version_number', { ascending: false });

      if (versionsError) throw versionsError;

      const currentVersion = (versions || []).find(v => v.status === 'published') || null;

      let requiredDocs: PolicyRequiredDoc[] = [];
      if (currentVersion) {
        const { data: docs } = await supabase
          .from('policy_required_docs')
          .select('*')
          .eq('policy_version_id', currentVersion.id);
        requiredDocs = (docs || []) as PolicyRequiredDoc[];
      }

      return {
        ...policy,
        benefit_type: policy.benefit_type as BenefitPolicyType | null,
        transaction_model: policy.transaction_model as TransactionModel | null,
        currentVersion: currentVersion ? {
          ...currentVersion,
          content_json: (currentVersion.content_json || DEFAULT_POLICY_CONTENT) as PolicyContent,
          logic_json: (currentVersion.logic_json || DEFAULT_POLICY_LOGIC) as PolicyLogic,
          required_docs: requiredDocs,
        } as PolicyVersion : null,
        allVersions: (versions || []).map(v => ({
          ...v,
          content_json: (v.content_json || DEFAULT_POLICY_CONTENT) as PolicyContent,
          logic_json: (v.logic_json || DEFAULT_POLICY_LOGIC) as PolicyLogic,
        })) as PolicyVersion[],
        requiredDocs,
      };
    },
    enabled: !!policyId,
  });
}

/**
 * Fetch a policy version by ID
 */
export function usePolicyVersion(versionId: string | null) {
  return useQuery({
    queryKey: ['policy_version', versionId],
    queryFn: async (): Promise<PolicyVersion | null> => {
      if (!versionId) return null;

      const { data: version, error } = await supabase
        .from('policy_versions')
        .select('*')
        .eq('id', versionId)
        .single();

      if (error) throw error;

      const { data: docs } = await supabase
        .from('policy_required_docs')
        .select('*')
        .eq('policy_version_id', versionId);

      return {
        ...version,
        content_json: (version.content_json || DEFAULT_POLICY_CONTENT) as PolicyContent,
        logic_json: (version.logic_json || DEFAULT_POLICY_LOGIC) as PolicyLogic,
        required_docs: (docs || []) as PolicyRequiredDoc[],
      } as PolicyVersion;
    },
    enabled: !!versionId,
  });
}

// ============== Mutation Hooks ==============

/**
 * Create a new policy with initial draft version
 */
export function useCreatePolicy() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { logEvent } = useAuditLog();

  return useMutation({
    mutationFn: async ({
      organizationId,
      name,
      lifeArea,
      benefitType,
      transactionModel,
      effectiveFrom,
      ownerId,
    }: {
      organizationId: string;
      name: string;
      lifeArea: string;
      benefitType: BenefitPolicyType;
      transactionModel: TransactionModel;
      effectiveFrom?: string;
      ownerId?: string;
    }) => {
      // Generate policy_ref
      const policyRef = `POL-${name.substring(0, 3).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

      // Create policy
      const { data: policy, error: policyError } = await supabase
        .from('policies')
        .insert({
          organization_id: organizationId,
          policy_ref: policyRef,
          title: name,
          category: lifeArea,
          version: '1.0',
          status: 'draft',
          effective_from: effectiveFrom || new Date().toISOString().split('T')[0],
          benefit_type: benefitType,
          transaction_model: transactionModel,
          owner_user_id: ownerId || user?.id,
          is_active: true,
        })
        .select()
        .single();

      if (policyError) throw policyError;

      // Create initial draft version
      // Note: Using 'any' cast because policy_versions table types may not be generated yet
      const { data: version, error: versionError } = await (supabase
        .from('policy_versions' as any)
        .insert({
          policy_id: policy.id,
          version_number: 1,
          status: 'draft',
          effective_from: effectiveFrom || null,
          created_by: user?.id,
          content_json: DEFAULT_POLICY_CONTENT,
          logic_json: {
            ...DEFAULT_POLICY_LOGIC,
            transaction_model: transactionModel,
          },
        } as any)
        .select()
        .single()) as any;

      if (versionError) throw versionError;

      return { policy, version };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['policies_v2'] });
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      
      logEvent({
        action: 'POLICY_CREATE',
        resourceType: 'policy',
        resourceId: data.policy.id,
        details: { title: data.policy.title },
      });

      toast.success('Policy created', {
        description: `${data.policy.title} has been created as a draft.`,
      });
    },
  });
}

/**
 * Update a policy version (content and logic)
 */
export function useUpdatePolicyVersion() {
  const queryClient = useQueryClient();
  const { logEvent } = useAuditLog();

  return useMutation({
    mutationFn: async ({
      versionId,
      contentJson,
      logicJson,
      attachmentUrl,
    }: {
      versionId: string;
      contentJson?: Partial<PolicyContent>;
      logicJson?: Partial<PolicyLogic>;
      attachmentUrl?: string;
    }) => {
      const updates: Record<string, any> = {
        last_updated_at: new Date().toISOString(),
      };

      if (contentJson) {
        // Merge with existing content
        const { data: existing } = await (supabase
          .from('policy_versions' as any)
          .select('content_json')
          .eq('id', versionId)
          .single()) as any;

        const existingContent = (existing?.content_json && typeof existing.content_json === 'object') 
          ? existing.content_json 
          : DEFAULT_POLICY_CONTENT;
        updates.content_json = {
          ...existingContent,
          ...contentJson,
        };
      }

      if (logicJson) {
        const { data: existing } = await (supabase
          .from('policy_versions' as any)
          .select('logic_json')
          .eq('id', versionId)
          .single()) as any;

        const existingLogic = (existing?.logic_json && typeof existing.logic_json === 'object')
          ? existing.logic_json
          : DEFAULT_POLICY_LOGIC;
        updates.logic_json = {
          ...existingLogic,
          ...logicJson,
        };
      }

      if (attachmentUrl !== undefined) {
        updates.attachment_url = attachmentUrl;
      }

      const { data, error } = await supabase
        .from('policy_versions')
        .update(updates)
        .eq('id', versionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['policy_version', data.id] });
      queryClient.invalidateQueries({ queryKey: ['policy_v2', data.policy_id] });
      queryClient.invalidateQueries({ queryKey: ['policies_v2'] });
    },
  });
}

/**
 * Publish a policy version
 */
export function usePublishPolicyVersionV2() {
  const queryClient = useQueryClient();
  const { logEvent } = useAuditLog();

  return useMutation({
    mutationFn: async ({
      versionId,
      effectiveFrom,
    }: {
      versionId: string;
      effectiveFrom: string;
    }) => {
      // Get the version to find policy_id
      const { data: version, error: versionError } = await supabase
        .from('policy_versions')
        .select('policy_id, version_number')
        .eq('id', versionId)
        .single();

      if (versionError) throw versionError;

      // Archive any currently published version
      const { error: archiveError } = await supabase
        .from('policy_versions')
        .update({
          status: 'archived',
          effective_to: effectiveFrom,
        })
        .eq('policy_id', version.policy_id)
        .eq('status', 'published');

      if (archiveError) throw archiveError;

      // Publish the new version
      const { data, error } = await supabase
        .from('policy_versions')
        .update({
          status: 'published',
          effective_from: effectiveFrom,
          last_updated_at: new Date().toISOString(),
        })
        .eq('id', versionId)
        .select()
        .single();

      if (error) throw error;

      // Update the parent policy status
      await supabase
        .from('policies')
        .update({
          status: 'active',
          version: `${version.version_number}.0`,
          effective_from: effectiveFrom,
        })
        .eq('id', version.policy_id);

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['policies_v2'] });
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      queryClient.invalidateQueries({ queryKey: ['policy_v2'] });

      logEvent({
        action: 'POLICY_PUBLISH',
        resourceType: 'policy_version',
        resourceId: data.id,
        details: {
          version_number: data.version_number,
          effective_from: data.effective_from,
        },
      });

      toast.success('Policy published', {
        description: 'The policy is now visible to employees.',
      });
    },
  });
}

/**
 * Create a new version from existing (for edits to published policies)
 */
export function useCreatePolicyVersion() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      policyId,
      basedOnVersionId,
    }: {
      policyId: string;
      basedOnVersionId?: string;
    }) => {
      // Get the latest version number
      const { data: latest } = await supabase
        .from('policy_versions')
        .select('version_number, content_json, logic_json')
        .eq('policy_id', policyId)
        .order('version_number', { ascending: false })
        .limit(1)
        .single();

      const baseVersion = basedOnVersionId
        ? await supabase
            .from('policy_versions')
            .select('content_json, logic_json')
            .eq('id', basedOnVersionId)
            .single()
            .then(r => r.data)
        : latest;

      const newVersionNumber = (latest?.version_number || 0) + 1;

      const { data, error } = await (supabase
        .from('policy_versions' as any)
        .insert({
          policy_id: policyId,
          version_number: newVersionNumber,
          status: 'draft',
          created_by: user?.id,
          content_json: baseVersion?.content_json || DEFAULT_POLICY_CONTENT,
          logic_json: baseVersion?.logic_json || DEFAULT_POLICY_LOGIC,
        } as any)
        .select()
        .single()) as any;

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['policy_v2', data.policy_id] });
      queryClient.invalidateQueries({ queryKey: ['policies_v2'] });

      toast.success('New draft created', {
        description: `Version ${data.version_number} is ready for editing.`,
      });
    },
  });
}

/**
 * Archive a policy (soft delete)
 */
export function useArchivePolicy() {
  const queryClient = useQueryClient();
  const { logEvent } = useAuditLog();

  return useMutation({
    mutationFn: async (policyId: string) => {
      const { data, error } = await supabase
        .from('policies')
        .update({ is_active: false, status: 'archived' })
        .eq('id', policyId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['policies_v2'] });
      queryClient.invalidateQueries({ queryKey: ['policies'] });

      logEvent({
        action: 'POLICY_ARCHIVE',
        resourceType: 'policy',
        resourceId: data.id,
      });

      toast.success('Policy archived');
    },
  });
}

/**
 * Duplicate a policy
 */
export function useDuplicatePolicy() {
  const createPolicy = useCreatePolicy();

  return useMutation({
    mutationFn: async ({
      sourcePolicy,
      organizationId,
    }: {
      sourcePolicy: PolicyWithVersions;
      organizationId: string;
    }) => {
      return createPolicy.mutateAsync({
        organizationId,
        name: `${sourcePolicy.title} (Copy)`,
        lifeArea: sourcePolicy.category,
        benefitType: sourcePolicy.benefit_type || 'other',
        transactionModel: sourcePolicy.transaction_model || 'claim_only',
      });
    },
  });
}

/**
 * Update required documents for a policy version
 */
export function useUpdatePolicyRequiredDocs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      versionId,
      docs,
    }: {
      versionId: string;
      docs: PolicyRequiredDoc[];
    }) => {
      // Delete existing docs
      await supabase
        .from('policy_required_docs')
        .delete()
        .eq('policy_version_id', versionId);

      // Insert new docs
      if (docs.length > 0) {
        const { error } = await supabase
          .from('policy_required_docs')
          .insert(docs.map(d => ({
            policy_version_id: versionId,
            transaction_type: d.transaction_type,
            doc_type: d.doc_type,
            doc_name: d.doc_name,
            is_required: d.is_required,
            conditions_json: d.conditions_json || {},
            description: d.description,
          })));

        if (error) throw error;
      }

      return { versionId, docs };
    },
    onSuccess: ({ versionId }) => {
      queryClient.invalidateQueries({ queryKey: ['policy_version', versionId] });
      queryClient.invalidateQueries({ queryKey: ['policies_v2'] });
    },
  });
}

// ============== Cross-Portal Integration ==============

/**
 * Get the published policy for a benefit category + employee context
 * This is the main integration point for Claims module
 */
export function useGetPolicyForBenefit(
  category: string | null,
  organizationId: string | null,
  employeeContext?: EmployeeContext
) {
  return useQuery({
    queryKey: ['policy_for_benefit', category, organizationId, employeeContext?.user_id],
    queryFn: async (): Promise<PolicyValidationResult | null> => {
      if (!category || !organizationId) return null;

      // Find the published policy for this category
      const { data: policies, error } = await supabase
        .from('policies')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('category', category)
        .eq('is_active', true);

      if (error) throw error;
      if (!policies || policies.length === 0) {
        return {
          isEligible: false,
          transactionType: null,
          requiredDocs: [],
          annualCap: null,
          remainingAllowance: null,
          preApprovalRequired: false,
          errors: ['No entitlement/policy configured for this benefit category'],
          warnings: [],
        };
      }

      const policyId = policies[0].id;

      // Get the published version
      const { data: version } = await supabase
        .from('policy_versions')
        .select('*')
        .eq('policy_id', policyId)
        .eq('status', 'published')
        .single();

      if (!version) {
        return {
          isEligible: false,
          transactionType: null,
          requiredDocs: [],
          annualCap: null,
          remainingAllowance: null,
          preApprovalRequired: false,
          errors: ['No published policy version found'],
          warnings: [],
        };
      }

      const logic = (version.logic_json || DEFAULT_POLICY_LOGIC) as PolicyLogic;
      const errors: string[] = [];
      const warnings: string[] = [];

      // Check eligibility if employee context provided
      let isEligible = true;
      if (employeeContext) {
        const eligibility = checkEligibility(employeeContext, logic.eligibility_rules);
        isEligible = eligibility.eligible;
        errors.push(...eligibility.reasons);
      }

      // Get required docs
      const { data: docs } = await supabase
        .from('policy_required_docs')
        .select('*')
        .eq('policy_version_id', version.id);

      // Determine transaction type
      let transactionType: 'request' | 'claim' | 'both' | null = null;
      switch (logic.transaction_model) {
        case 'request_only':
          transactionType = 'request';
          break;
        case 'claim_only':
          transactionType = 'claim';
          break;
        case 'request_and_claim':
          transactionType = 'both';
          break;
      }

      return {
        isEligible,
        transactionType,
        requiredDocs: (docs || []) as PolicyRequiredDoc[],
        annualCap: logic.limits_caps.annual_cap,
        remainingAllowance: null, // Would need utilization data
        preApprovalRequired: logic.limits_caps.pre_approval_threshold !== null,
        errors,
        warnings,
      };
    },
    enabled: !!category && !!organizationId,
  });
}
