/**
 * useBenefitPolicy - Hook for fetching policy versions and entitlements for benefits
 * 
 * This hook provides the data layer for the BenefitDetailTemplate:
 * - Active published policy_version for a category
 * - Employee's benefit entitlements
 * - Recent claims/requests for the benefit
 * - Required documents from policy
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { calculateUtilization } from '@/lib/crossPortalContract';
import type { Database } from '@/integrations/supabase/types';

type PolicyRow = Database['public']['Tables']['policies']['Row'];
type PolicyVersionRow = Database['public']['Tables']['policy_versions']['Row'];
type BenefitEntitlementRow = Database['public']['Tables']['benefit_entitlements']['Row'];
type RequestRow = Database['public']['Tables']['requests']['Row'];

// Benefit category to life_area/policy category mapping
const CATEGORY_MAPPING: Record<string, string> = {
  housing: 'housing',
  health: 'health',
  schooling: 'schooling',
  transport: 'transport',
  wellbeing: 'wellbeing',
  learning: 'learning',
  'long-term-financials': 'financial',
  financial: 'financial',
};

export interface PolicyContent {
  summary: string[];
  details: string;
  faqs: Array<{ question: string; answer: string }>;
  examples: string[];
  pitfalls: string[];
}

export interface PolicyLogic {
  transaction_model: 'claim_only' | 'request_only' | 'both';
  eligibility_rules: {
    grades: string[];
    locations: string[];
    departments: string[];
    contract_types: string[];
    probation_passed: boolean;
    min_tenure_months: number;
  };
  limits_caps: {
    frequency: 'annual' | 'monthly' | 'per_event';
    annual_cap: number | null;
    annual_cap_currency: string;
    per_transaction_cap: number | null;
    pre_approval_threshold: number | null;
    reset_month: number;
  };
  workflow: {
    sla_days: number;
    approver_role: string;
    escalation_role: string | null;
  };
  required_documents?: Array<{
    name: string;
    required: boolean;
    description?: string;
  }>;
}

export interface BenefitPolicyData {
  // Policy info
  policy: PolicyRow | null;
  policyVersion: PolicyVersionRow | null;
  policyRef: string | null;
  policyStatus: 'published' | 'draft' | 'not_found';
  
  // Parsed policy content
  content: PolicyContent;
  logic: PolicyLogic;
  
  // Entitlement data
  entitlement: {
    annualAllowance: number;
    utilized: number;
    remaining: number;
    utilizationRate: number;
    utilizationStatus: 'unused' | 'low' | 'moderate' | 'high' | 'full' | 'over';
    hasEntitlement: boolean;
  };
  
  // Recent activity
  recentClaims: RequestRow[];
  
  // Required documents
  requiredDocuments: Array<{
    name: string;
    required: boolean;
    description?: string;
  }>;
  
  // Data confidence
  dataConfidence: 'high' | 'medium' | 'low';
  missingDataReasons: string[];
  
  // Loading states
  isLoading: boolean;
  error: Error | null;
}

const DEFAULT_CONTENT: PolicyContent = {
  summary: [],
  details: '',
  faqs: [],
  examples: [],
  pitfalls: [],
};

const DEFAULT_LOGIC: PolicyLogic = {
  transaction_model: 'claim_only',
  eligibility_rules: {
    grades: [],
    locations: [],
    departments: [],
    contract_types: [],
    probation_passed: false,
    min_tenure_months: 0,
  },
  limits_caps: {
    frequency: 'annual',
    annual_cap: null,
    annual_cap_currency: 'AED',
    per_transaction_cap: null,
    pre_approval_threshold: null,
    reset_month: 1,
  },
  workflow: {
    sla_days: 3,
    approver_role: 'manager',
    escalation_role: null,
  },
};

/**
 * Fetch the active published policy for a benefit category
 */
export function useBenefitPolicy(category: string): BenefitPolicyData {
  const { user } = useAuth();
  const normalizedCategory = CATEGORY_MAPPING[category.toLowerCase()] || category.toLowerCase();

  // Fetch policy and version
  const { data: policyData, isLoading: policyLoading, error: policyError } = useQuery({
    queryKey: ['benefit_policy', normalizedCategory],
    queryFn: async () => {
      // Find policy by category
      const { data: policies } = await supabase
        .from('policies')
        .select('*')
        .ilike('category', `%${normalizedCategory}%`)
        .eq('is_active', true)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(1);

      const policy = policies?.[0] || null;

      if (!policy) {
        return { policy: null, policyVersion: null };
      }

      // Fetch published version
      const { data: versions } = await supabase
        .from('policy_versions')
        .select('*')
        .eq('policy_id', policy.id)
        .eq('status', 'published')
        .order('version_number', { ascending: false })
        .limit(1);

      const policyVersion = versions?.[0] || null;

      return { policy, policyVersion };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch entitlements
  const { data: entitlementData, isLoading: entitlementLoading } = useQuery({
    queryKey: ['benefit_entitlement', normalizedCategory, user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Find benefit by name/category
      const { data: benefits } = await supabase
        .from('benefits')
        .select('*')
        .ilike('name', `%${normalizedCategory}%`)
        .eq('is_active', true)
        .limit(1);

      const benefit = benefits?.[0];
      if (!benefit) return null;

      // Fetch entitlement
      const { data: entitlements } = await supabase
        .from('benefit_entitlements')
        .select('*')
        .eq('user_id', user.id)
        .eq('benefit_id', benefit.id)
        .limit(1);

      return {
        benefit,
        entitlement: entitlements?.[0] || null,
      };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch recent claims
  const { data: recentClaims = [] } = useQuery({
    queryKey: ['recent_claims', normalizedCategory, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data } = await supabase
        .from('requests')
        .select('*')
        .eq('user_id', user.id)
        .ilike('category', `%${normalizedCategory}%`)
        .order('created_at', { ascending: false })
        .limit(3);

      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000,
  });

  // Parse policy content
  const content: PolicyContent = policyData?.policyVersion?.content_json 
    ? (policyData.policyVersion.content_json as unknown as PolicyContent)
    : DEFAULT_CONTENT;

  // Parse policy logic
  const logic: PolicyLogic = policyData?.policyVersion?.logic_json
    ? (policyData.policyVersion.logic_json as unknown as PolicyLogic)
    : DEFAULT_LOGIC;

  // Calculate entitlement values
  const annualAllowance = entitlementData?.entitlement?.annual_allowance 
    || entitlementData?.benefit?.annual_value 
    || logic.limits_caps?.annual_cap 
    || 0;
  const utilized = entitlementData?.entitlement?.utilized_amount || 0;
  
  const utilization = calculateUtilization({
    allocated: annualAllowance,
    utilized,
  });

  // Determine data confidence
  const missingDataReasons: string[] = [];
  if (!policyData?.policyVersion) missingDataReasons.push('Policy not published');
  if (!entitlementData?.entitlement) missingDataReasons.push('Entitlement record missing');
  if (annualAllowance === 0) missingDataReasons.push('Annual allowance not set');

  let dataConfidence: 'high' | 'medium' | 'low' = 'high';
  if (missingDataReasons.length >= 2) dataConfidence = 'low';
  else if (missingDataReasons.length === 1) dataConfidence = 'medium';

  // Extract required documents from policy
  const requiredDocuments = logic.required_documents || [];

  return {
    policy: policyData?.policy || null,
    policyVersion: policyData?.policyVersion || null,
    policyRef: policyData?.policy?.policy_ref || null,
    policyStatus: policyData?.policyVersion?.status === 'published' 
      ? 'published' 
      : policyData?.policy 
        ? 'draft' 
        : 'not_found',

    content,
    logic,

    entitlement: {
      annualAllowance,
      utilized,
      remaining: utilization.remaining,
      utilizationRate: utilization.rate,
      utilizationStatus: utilization.status,
      hasEntitlement: !!entitlementData?.entitlement || annualAllowance > 0,
    },

    recentClaims: recentClaims as RequestRow[],
    requiredDocuments,

    dataConfidence,
    missingDataReasons,

    isLoading: policyLoading || entitlementLoading,
    error: policyError as Error | null,
  };
}

/**
 * Get the action type label based on transaction model
 */
export function getActionLabel(transactionModel: PolicyLogic['transaction_model']): {
  primary: string;
  verb: string;
} {
  switch (transactionModel) {
    case 'request_only':
      return { primary: 'Submit Request', verb: 'Request' };
    case 'both':
      return { primary: 'Submit Claim', verb: 'Claim' };
    case 'claim_only':
    default:
      return { primary: 'Submit Claim', verb: 'Claim' };
  }
}
