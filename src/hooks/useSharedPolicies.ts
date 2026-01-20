/**
 * Shared Policies Hook - Cross-Portal Consistency
 * 
 * This hook ensures that:
 * 1. Employees always see the currently PUBLISHED policy version
 * 2. Employers can manage versions but the "current" pointer is respected everywhere
 * 3. Required documents come from the same source
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { isPolicyVersionActive } from '@/lib/crossPortalContract';
import { Database } from '@/integrations/supabase/types';

type PolicyVersionRow = Database['public']['Tables']['benefit_policy_versions']['Row'];
type RequiredDocumentRow = Database['public']['Tables']['benefit_required_documents']['Row'];
type BenefitRow = Database['public']['Tables']['benefits']['Row'];

export interface PolicyWithDocuments extends PolicyVersionRow {
  benefit?: BenefitRow | null;
  requiredDocuments: RequiredDocumentRow[];
  isActive: boolean;
}

export interface BenefitPolicy {
  benefit: BenefitRow;
  currentVersion: PolicyVersionRow | null;
  allVersions: PolicyVersionRow[];
  requiredDocuments: RequiredDocumentRow[];
}

/**
 * Get the currently active policy version for a benefit
 * This is the PUBLISHED version that employees see
 * Requires explicit organizationId
 */
export function useCurrentPolicyVersion(benefitId: string | null, organizationId: string | null) {
  return useQuery({
    queryKey: ['current_policy_version', benefitId, organizationId],
    queryFn: async (): Promise<PolicyWithDocuments | null> => {
      if (!benefitId || !organizationId) return null;
      
      // Get all versions for this benefit + org, ordered by version desc
      const { data: versions, error: versionsError } = await supabase
        .from('benefit_policy_versions')
        .select('*, benefits(*)')
        .eq('benefit_id', benefitId)
        .eq('organization_id', organizationId)
        .order('version', { ascending: false });
      
      if (versionsError) throw versionsError;
      
      // Find the currently active version
      const activeVersion = (versions || []).find(v => isPolicyVersionActive(v));
      
      if (!activeVersion) return null;
      
      // Get required documents for this benefit
      const { data: docs, error: docsError } = await supabase
        .from('benefit_required_documents')
        .select('*')
        .eq('benefit_id', benefitId);
      
      if (docsError) throw docsError;
      
      return {
        ...activeVersion,
        benefit: activeVersion.benefits as BenefitRow | null,
        requiredDocuments: docs || [],
        isActive: true,
      };
    },
    enabled: !!benefitId && !!organizationId,
  });
}

/**
 * Get all policies for an organization (employer view)
 * Requires explicit organizationId
 */
export function useOrganizationPolicies(organizationId: string | null) {
  return useQuery({
    queryKey: ['organization_policies', organizationId],
    queryFn: async (): Promise<BenefitPolicy[]> => {
      if (!organizationId) return [];
      
      // Get all benefits
      const { data: benefits, error: benefitsError } = await supabase
        .from('benefits')
        .select('*')
        .eq('is_active', true);
      
      if (benefitsError) throw benefitsError;
      
      // Get all policy versions for this org
      const { data: versions, error: versionsError } = await supabase
        .from('benefit_policy_versions')
        .select('*')
        .eq('organization_id', organizationId)
        .order('version', { ascending: false });
      
      if (versionsError) throw versionsError;
      
      // Get all required documents
      const { data: docs, error: docsError } = await supabase
        .from('benefit_required_documents')
        .select('*');
      
      if (docsError) throw docsError;
      
      // Group by benefit
      return (benefits || []).map(benefit => {
        const benefitVersions = (versions || []).filter(v => v.benefit_id === benefit.id);
        const currentVersion = benefitVersions.find(v => isPolicyVersionActive(v)) || null;
        const benefitDocs = (docs || []).filter(d => d.benefit_id === benefit.id);
        
        return {
          benefit,
          currentVersion,
          allVersions: benefitVersions,
          requiredDocuments: benefitDocs,
        };
      });
    },
    enabled: !!organizationId,
  });
}

/**
 * Publish a new policy version
 * This makes the new version active and deactivates the previous one
 */
export function usePublishPolicyVersion() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({
      benefitId,
      organizationId,
      policyText,
      attachmentUrl,
      effectiveFrom,
    }: {
      benefitId: string;
      organizationId: string;
      policyText: string;
      attachmentUrl?: string;
      effectiveFrom?: string;
    }) => {
      if (!organizationId) throw new Error('No organization');
      
      // Get the latest version number
      const { data: latestVersion } = await supabase
        .from('benefit_policy_versions')
        .select('version')
        .eq('benefit_id', benefitId)
        .eq('organization_id', organizationId)
        .order('version', { ascending: false })
        .limit(1)
        .single();
      
      const newVersion = (latestVersion?.version || 0) + 1;
      const effectiveDate = effectiveFrom || new Date().toISOString().split('T')[0];
      
      // Set effective_until on the previous active version
      const { error: updateError } = await supabase
        .from('benefit_policy_versions')
        .update({ 
          effective_until: effectiveDate 
        })
        .eq('benefit_id', benefitId)
        .eq('organization_id', organizationId)
        .is('effective_until', null);
      
      if (updateError) throw updateError;
      
      // Insert the new version
      const { data, error } = await supabase
        .from('benefit_policy_versions')
        .insert({
          benefit_id: benefitId,
          organization_id: organizationId,
          version: newVersion,
          policy_text: policyText,
          attachment_url: attachmentUrl,
          effective_from: effectiveDate,
          created_by: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate all policy queries to ensure immediate consistency
      queryClient.invalidateQueries({ queryKey: ['current_policy_version'] });
      queryClient.invalidateQueries({ queryKey: ['organization_policies'] });
      queryClient.invalidateQueries({ queryKey: ['benefit_policies'] });
    },
  });
}

/**
 * Get required documents for a benefit
 * Used by both Employee (claim submission) and Employer (configuration)
 */
export function useRequiredDocuments(benefitId: string | null) {
  return useQuery({
    queryKey: ['required_documents', benefitId],
    queryFn: async (): Promise<RequiredDocumentRow[]> => {
      if (!benefitId) return [];
      
      const { data, error } = await supabase
        .from('benefit_required_documents')
        .select('*')
        .eq('benefit_id', benefitId)
        .order('is_required', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!benefitId,
  });
}

/**
 * Get the policy bullets/summary for a benefit
 * Used by Employee benefit cards
 */
export function useBenefitPolicyBullets(benefitId: string | null, organizationId: string | null) {
  const { data: policy } = useCurrentPolicyVersion(benefitId, organizationId);
  
  return useQuery({
    queryKey: ['policy_bullets', benefitId, organizationId, policy?.id],
    queryFn: async () => {
      if (!benefitId) return { bullets: [], policyText: null };
      
      // Get benefit with policy_bullets
      const { data: benefit, error } = await supabase
        .from('benefits')
        .select('policy_bullets')
        .eq('id', benefitId)
        .single();
      
      if (error) throw error;
      
      return {
        bullets: benefit?.policy_bullets || [],
        policyText: policy?.policy_text || null,
      };
    },
    enabled: !!benefitId,
  });
}
