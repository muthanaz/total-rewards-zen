/**
 * Hook to fetch the currently published policy for a benefit
 * Uses the cross-portal contract for consistent policy version handling
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { isPolicyVersionActive, type PolicyVersion } from '@/lib/crossPortalContract';

export interface PublishedPolicy {
  id: string;
  benefitId: string;
  benefitName: string;
  version: number;
  policyText: string | null;
  attachmentUrl: string | null;
  effectiveFrom: string;
  effectiveUntil: string | null;
  updatedAt: string;
  isActive: boolean;
}

interface UsePublishedPolicyOptions {
  /** Benefit category name (e.g., "Health Insurance", "Housing Allowance") */
  benefitCategory: string;
  /** Whether to enable the query */
  enabled?: boolean;
}

/**
 * Fetch the currently published (active) policy version for a benefit category
 */
export function usePublishedPolicy({ benefitCategory, enabled = true }: UsePublishedPolicyOptions) {
  return useQuery({
    queryKey: ['published-policy', benefitCategory],
    queryFn: async (): Promise<PublishedPolicy | null> => {
      // First, find the benefit by name/category
      const { data: benefit, error: benefitError } = await supabase
        .from('benefits')
        .select('id, name')
        .ilike('name', `%${benefitCategory}%`)
        .eq('is_active', true)
        .maybeSingle();

      if (benefitError) {
        console.error('Error fetching benefit:', benefitError);
        return null;
      }

      if (!benefit) {
        // Try alternative matching
        const { data: altBenefit } = await supabase
          .from('benefits')
          .select('id, name')
          .eq('is_active', true)
          .limit(10);
        
        // Find closest match
        const match = altBenefit?.find(b => 
          b.name.toLowerCase().includes(benefitCategory.toLowerCase()) ||
          benefitCategory.toLowerCase().includes(b.name.toLowerCase())
        );
        
        if (!match) return null;
        
        return fetchPolicyForBenefit(match.id, match.name);
      }

      return fetchPolicyForBenefit(benefit.id, benefit.name);
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

async function fetchPolicyForBenefit(benefitId: string, benefitName: string): Promise<PublishedPolicy | null> {
  // Fetch the latest policy version for this benefit
  const { data: policies, error: policyError } = await supabase
    .from('benefit_policy_versions')
    .select('*')
    .eq('benefit_id', benefitId)
    .order('version', { ascending: false })
    .order('effective_from', { ascending: false });

  if (policyError) {
    console.error('Error fetching policy versions:', policyError);
    return null;
  }

  if (!policies || policies.length === 0) {
    return null;
  }

  // Find the currently active policy version using the cross-portal contract
  const activePolicy = policies.find(p => isPolicyVersionActive({
    id: p.id,
    benefit_id: p.benefit_id || '',
    organization_id: p.organization_id || '',
    version: p.version,
    policy_text: p.policy_text,
    attachment_url: p.attachment_url,
    effective_from: p.effective_from,
    effective_until: p.effective_until,
    created_at: p.created_at,
    created_by: p.created_by,
  }));

  // If no active policy, return the most recent one marked as inactive
  const policyToReturn = activePolicy || policies[0];

  return {
    id: policyToReturn.id,
    benefitId: policyToReturn.benefit_id || '',
    benefitName,
    version: policyToReturn.version,
    policyText: policyToReturn.policy_text,
    attachmentUrl: policyToReturn.attachment_url,
    effectiveFrom: policyToReturn.effective_from,
    effectiveUntil: policyToReturn.effective_until,
    updatedAt: policyToReturn.updated_at,
    isActive: !!activePolicy,
  };
}

/**
 * Format policy effective date for display
 */
export function formatPolicyDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get policy status badge info
 */
export function getPolicyStatusBadge(policy: PublishedPolicy | null): {
  label: string;
  variant: 'default' | 'secondary' | 'outline';
  className: string;
} {
  if (!policy) {
    return {
      label: 'No Policy',
      variant: 'outline',
      className: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
    };
  }

  if (policy.isActive) {
    return {
      label: `v${policy.version} · Active`,
      variant: 'secondary',
      className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    };
  }

  return {
    label: `v${policy.version} · Expired`,
    variant: 'outline',
    className: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  };
}
