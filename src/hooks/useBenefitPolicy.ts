/**
 * useBenefitPolicy Hook
 * 
 * Fetches policy_version data for any benefit category.
 * Returns standardized policy content (howItWorks, whatYouCanClaim, docs)
 * and logic (caps, frequency, transaction_model) for use with BenefitDetailTemplate.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { BenefitCategoryKey } from '@/lib/benefitCategories';
import { TransactionModel, PolicyRequiredDoc } from '@/lib/policyEngine';
import type { BenefitEntitlement, RecentClaim } from '@/components/templates/BenefitDetailTemplate';

// ============================================================================
// TYPES
// ============================================================================

export interface BenefitPolicyData {
  // Policy info
  policyId: string | null;
  policyRef: string | null;
  policyTitle: string | null;
  hasPolicyPublished: boolean;
  
  // Content from content_json
  howItWorks: string[];
  whatYouCanClaim: string[];
  faqs: { question: string; answer: string }[];
  
  // Logic from logic_json
  transactionModel: TransactionModel;
  annualCap: number | null;
  perTransactionCap: number | null;
  frequency: 'annual' | 'monthly';
  requiredDocs: PolicyRequiredDoc[];
  
  // Entitlement data
  entitlement: BenefitEntitlement | null;
  hasEntitlementData: boolean;
  
  // Recent claims
  recentClaims: RecentClaim[];
}

// ============================================================================
// CATEGORY MAPPING
// ============================================================================

const CATEGORY_SEARCH_TERMS: Record<BenefitCategoryKey, string[]> = {
  housing: ['housing', 'accommodation', 'rent'],
  schooling: ['education', 'school', 'tuition', 'schooling'],
  health: ['health', 'medical', 'insurance'],
  transport: ['transport', 'travel', 'mobility', 'commute', 'fuel', 'flight'],
  wellbeing: ['wellbeing', 'wellness', 'gym'],
  financial: ['financial', 'savings', 'pension', 'gratuity'],
  learning: ['learning', 'training', 'development', 'l&d'],
  rewards: ['bonus', 'reward', 'incentive'],
  equity: ['equity', 'stock', 'option', 'esop'],
  timeoff: ['leave', 'vacation', 'pto', 'time off'],
};

// ============================================================================
// HOOK
// ============================================================================

export function useBenefitPolicy(categoryKey: BenefitCategoryKey | null) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['benefit_policy', categoryKey, user?.id],
    queryFn: async (): Promise<BenefitPolicyData> => {
      if (!categoryKey || !user?.id) {
        return getEmptyPolicyData();
      }
      
      // Get user's organization
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!profile?.organization_id) {
        return getEmptyPolicyData();
      }
      
      // Try to find published policy for this category
      const searchTerms = CATEGORY_SEARCH_TERMS[categoryKey] || [categoryKey];
      let policy: any = null;
      
      for (const term of searchTerms) {
        const { data } = await supabase
          .from('policies')
          .select('id, policy_ref, title, category, status')
          .eq('organization_id', profile.organization_id)
          .eq('is_active', true)
          .eq('status', 'published')
          .or(`category.ilike.%${term}%,title.ilike.%${term}%`)
          .limit(1)
          .maybeSingle();
        
        if (data) {
          policy = data;
          break;
        }
      }
      
      // Default values
      let howItWorks: string[] = [];
      let whatYouCanClaim: string[] = [];
      let faqs: { question: string; answer: string }[] = [];
      let transactionModel: TransactionModel = 'claim_only';
      let annualCap: number | null = null;
      let perTransactionCap: number | null = null;
      let frequency: 'annual' | 'monthly' = 'annual';
      let requiredDocs: PolicyRequiredDoc[] = [];
      
      if (policy) {
        // Fetch published version
        const { data: version } = await supabase
          .from('policy_versions')
          .select('id, version_number, logic_json, content_json')
          .eq('policy_id', policy.id)
          .eq('status', 'published')
          .order('version_number', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (version) {
          // Parse content_json
          const content = version.content_json as any;
          if (content) {
            // Support both "summary" and "how_to_use" naming
            howItWorks = content.summary || content.how_to_use || [];
            whatYouCanClaim = content.eligible_items || content.what_you_can_claim || [];
            faqs = content.faqs || [];
          }
          
          // Parse logic_json
          const logic = version.logic_json as any;
          if (logic) {
            transactionModel = logic.transaction_model || 'claim_only';
            // Support nested limits_caps structure
            const limitsCaps = logic.limits_caps || logic;
            annualCap = limitsCaps.annual_cap ?? null;
            perTransactionCap = limitsCaps.per_transaction_cap ?? null;
            frequency = limitsCaps.frequency || 'annual';
            // Map required_docs with proper structure
            const rawDocs = logic.required_docs || [];
            requiredDocs = rawDocs.map((doc: any) => ({
              id: doc.id || doc.doc_type,
              doc_name: doc.doc_name || doc.docName || doc.name || 'Document',
              doc_type: doc.doc_type || doc.docType || 'other',
              is_required: doc.is_required ?? doc.isRequired ?? true,
              description: doc.description || '',
            }));
          }
        }
      }
      
      // Fetch entitlement data
      const entitlement = await fetchEntitlement(user.id, policy?.id, annualCap);
      
      // Fetch recent claims
      const recentClaims = await fetchRecentClaims(user.id, policy?.id);
      
      return {
        policyId: policy?.id || null,
        policyRef: policy?.policy_ref || null,
        policyTitle: policy?.title || null,
        hasPolicyPublished: !!policy,
        howItWorks,
        whatYouCanClaim,
        faqs,
        transactionModel,
        annualCap,
        perTransactionCap,
        frequency,
        requiredDocs,
        entitlement,
        hasEntitlementData: !!entitlement,
        recentClaims,
      };
    },
    enabled: !!categoryKey && !!user?.id,
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================================================
// HELPERS
// ============================================================================

async function fetchEntitlement(
  userId: string, 
  policyId: string | null,
  annualCap: number | null
): Promise<BenefitEntitlement | null> {
  const startOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString();
  
  // Default values
  let utilized = 0;
  let annualValue = annualCap || 0;
  let isEstimated = false;
  
  // First try benefit_entitlements table
  if (policyId) {
    // Fetch PAID claims only for this policy (reconciles with employer settlement totals)
    const { data: claims } = await supabase
      .from('requests')
      .select('amount')
      .eq('user_id', userId)
      .eq('policy_id', policyId)
      .in('status', ['paid'])
      .gte('created_at', startOfYear);
    
    utilized = (claims || []).reduce((sum, c) => sum + (c.amount || 0), 0);
  }
  
  // If no annual cap from policy, check benefit_entitlements
  if (!annualValue) {
    const { data: entitlements } = await supabase
      .from('benefit_entitlements')
      .select('annual_allowance, utilized_amount')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle();
    
    if (entitlements) {
      annualValue = entitlements.annual_allowance || 0;
      utilized = entitlements.utilized_amount || utilized;
    } else {
      isEstimated = true;
    }
  }
  
  if (annualValue === 0) {
    return null;
  }
  
  const remaining = Math.max(0, annualValue - utilized);
  const utilizationPercent = annualValue > 0 
    ? Math.round((utilized / annualValue) * 100) 
    : 0;
  
  return {
    annualValue,
    utilized,
    remaining,
    utilizationPercent,
    isEstimated,
  };
}

async function fetchRecentClaims(
  userId: string, 
  policyId: string | null
): Promise<RecentClaim[]> {
  const query = supabase
    .from('requests')
    .select('id, amount, status, request_type, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(3);
  
  if (policyId) {
    query.eq('policy_id', policyId);
  }
  
  const { data: claims } = await query;
  
  return (claims || []).map(c => ({
    id: c.id,
    date: c.created_at,
    amount: c.amount || 0,
    status: mapStatus(c.status),
    type: c.request_type === 'request' ? 'request' : 'claim',
  }));
}

function mapStatus(status: string): RecentClaim['status'] {
  const statusMap: Record<string, RecentClaim['status']> = {
    submitted: 'submitted',
    in_review: 'in_review',
    approved: 'approved',
    rejected: 'rejected',
    paid: 'paid',
    pending: 'submitted',
    info_requested: 'in_review',
    ready_for_payment: 'approved',
  };
  return statusMap[status] || 'submitted';
}

function getEmptyPolicyData(): BenefitPolicyData {
  return {
    policyId: null,
    policyRef: null,
    policyTitle: null,
    hasPolicyPublished: false,
    howItWorks: [],
    whatYouCanClaim: [],
    faqs: [],
    transactionModel: 'claim_only',
    annualCap: null,
    perTransactionCap: null,
    frequency: 'annual',
    requiredDocs: [],
    entitlement: null,
    hasEntitlementData: false,
    recentClaims: [],
  };
}

export default useBenefitPolicy;
