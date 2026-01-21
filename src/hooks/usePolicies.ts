/**
 * Policies Hook
 * 
 * Provides CRUD operations for policies and policy articles.
 * Used by both employer (policy management) and employee (knowledge center) portals.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Policy {
  id: string;
  organization_id: string | null;
  policy_ref: string;
  title: string;
  category: string;
  version: string;
  status: 'draft' | 'active' | 'archived';
  effective_from: string;
  effective_to: string | null;
  summary: string | null;
  eligibility_rules: EligibilityRules | null;
  coverage_rules: CoverageRules | null;
  required_docs: RequiredDoc[] | null;
  sla_rules: SLARules | null;
  created_at: string;
  updated_at: string;
}

export interface EligibilityRules {
  grades?: string[];
  minTenure?: number;
  dependents?: boolean;
  maxDependents?: number;
  maxChildren?: number;
  childAgeLimit?: number;
  localOnly?: boolean;
  managerApproval?: boolean;
  approvalRequired?: boolean;
}

export interface CoverageRules {
  annualLimit?: number;
  annualLimitPerChild?: number;
  totalAnnualLimit?: number;
  monthlyAllowance?: Record<string, number>;
  annualBudget?: number | Record<string, number>;
  reimbursementPercent?: number;
  deductible?: number;
  excludes?: string[];
  eligibleProviders?: string[];
  eligiblePrograms?: string[];
  preApprovalRequired?: boolean;
  completionRequired?: boolean;
  // Leave-specific
  annualLeave?: Record<string, number>;
  sickLeave?: { fullPay: number; halfPay: number; unpaid: number };
  maternityLeave?: number;
  paternityLeave?: number;
  // Per diem specific
  domestic?: Record<string, number>;
  international?: Record<string, number>;
  hotelLimits?: Record<string, number>;
  mealAllowance?: { breakfast: number; lunch: number; dinner: number };
}

export interface RequiredDoc {
  name: string;
  type: string;
  required?: boolean;
  condition?: string;
}

export interface SLARules {
  claim?: Record<string, number>;
  request?: Record<string, number>;
}

export interface PolicyArticle {
  id: string;
  organization_id: string | null;
  policy_id: string | null;
  title: string;
  content: string;
  tags: string[];
  is_faq: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  policy?: Policy;
}

/**
 * Fetch all policies for the organization
 */
export function usePolicies(options?: { status?: 'draft' | 'active' | 'archived'; category?: string }) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['policies', options?.status, options?.category],
    queryFn: async (): Promise<Policy[]> => {
      if (!user?.id) return [];
      
      let query = supabase
        .from('policies')
        .select('*')
        .order('category')
        .order('version', { ascending: false });
      
      if (options?.status) {
        query = query.eq('status', options.status);
      }
      
      if (options?.category) {
        query = query.eq('category', options.category);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return (data || []).map(p => ({
        ...p,
        eligibility_rules: p.eligibility_rules as unknown as EligibilityRules | null,
        coverage_rules: p.coverage_rules as unknown as CoverageRules | null,
        required_docs: p.required_docs as unknown as RequiredDoc[] | null,
        sla_rules: p.sla_rules as unknown as SLARules | null,
        status: p.status as 'draft' | 'active' | 'archived',
      }));
    },
    enabled: !!user?.id,
  });
}

/**
 * Fetch a single policy by ID
 */
export function usePolicy(policyId: string | null) {
  return useQuery({
    queryKey: ['policy', policyId],
    queryFn: async (): Promise<Policy | null> => {
      if (!policyId) return null;
      
      const { data, error } = await supabase
        .from('policies')
        .select('*')
        .eq('id', policyId)
        .single();
      
      if (error) throw error;
      
      return {
        ...data,
        eligibility_rules: data.eligibility_rules as unknown as EligibilityRules | null,
        coverage_rules: data.coverage_rules as unknown as CoverageRules | null,
        required_docs: data.required_docs as unknown as RequiredDoc[] | null,
        sla_rules: data.sla_rules as unknown as SLARules | null,
        status: data.status as 'draft' | 'active' | 'archived',
      };
    },
    enabled: !!policyId,
  });
}

/**
 * Fetch a policy by policy_ref
 */
export function usePolicyByRef(policyRef: string | null) {
  return useQuery({
    queryKey: ['policy_ref', policyRef],
    queryFn: async (): Promise<Policy | null> => {
      if (!policyRef) return null;
      
      const { data, error } = await supabase
        .from('policies')
        .select('*')
        .eq('policy_ref', policyRef)
        .eq('status', 'active')
        .maybeSingle();
      
      if (error) throw error;
      if (!data) return null;
      
      return {
        ...data,
        eligibility_rules: data.eligibility_rules as unknown as EligibilityRules | null,
        coverage_rules: data.coverage_rules as unknown as CoverageRules | null,
        required_docs: data.required_docs as unknown as RequiredDoc[] | null,
        sla_rules: data.sla_rules as unknown as SLARules | null,
        status: data.status as 'draft' | 'active' | 'archived',
      };
    },
    enabled: !!policyRef,
  });
}

/**
 * Find active policy for a category
 */
export function usePolicyByCategory(category: string | null) {
  return useQuery({
    queryKey: ['policy_category', category],
    queryFn: async (): Promise<Policy | null> => {
      if (!category) return null;
      
      // Normalize category for matching
      const normalizedCategory = category
        .replace('Education Allowance', 'Education Allowance')
        .replace('Schooling', 'Education Allowance')
        .replace('Health Insurance', 'Health Insurance')
        .replace('Learning & Development', 'Learning & Development')
        .replace('L&D', 'Learning & Development');
      
      const { data, error } = await supabase
        .from('policies')
        .select('*')
        .eq('status', 'active')
        .or(`category.eq.${normalizedCategory},category.ilike.%${category}%`)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) return null;
      
      return {
        ...data,
        eligibility_rules: data.eligibility_rules as unknown as EligibilityRules | null,
        coverage_rules: data.coverage_rules as unknown as CoverageRules | null,
        required_docs: data.required_docs as unknown as RequiredDoc[] | null,
        sla_rules: data.sla_rules as unknown as SLARules | null,
        status: data.status as 'draft' | 'active' | 'archived',
      };
    },
    enabled: !!category,
  });
}

/**
 * Fetch policy articles (for Knowledge Center)
 */
export function usePolicyArticles(options?: { policyId?: string; isFaq?: boolean; tags?: string[] }) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['policy_articles', options?.policyId, options?.isFaq, options?.tags],
    queryFn: async (): Promise<PolicyArticle[]> => {
      if (!user?.id) return [];
      
      let query = supabase
        .from('policy_articles')
        .select('*, policies(*)')
        .order('sort_order')
        .order('created_at', { ascending: false });
      
      if (options?.policyId) {
        query = query.eq('policy_id', options.policyId);
      }
      
      if (options?.isFaq !== undefined) {
        query = query.eq('is_faq', options.isFaq);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return (data || []).map(a => ({
        ...a,
        policy: a.policies as unknown as Policy | undefined,
        tags: a.tags || [],
      }));
    },
    enabled: !!user?.id,
  });
}

/**
 * Search policies and articles
 */
export function useSearchPolicies(searchTerm: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['search_policies', searchTerm],
    queryFn: async () => {
      if (!user?.id || !searchTerm || searchTerm.length < 2) {
        return { policies: [], articles: [] };
      }
      
      const searchPattern = `%${searchTerm}%`;
      
      // Search policies
      const { data: policies, error: policiesError } = await supabase
        .from('policies')
        .select('*')
        .eq('status', 'active')
        .or(`title.ilike.${searchPattern},summary.ilike.${searchPattern},category.ilike.${searchPattern},policy_ref.ilike.${searchPattern}`);
      
      if (policiesError) throw policiesError;
      
      // Search articles
      const { data: articles, error: articlesError } = await supabase
        .from('policy_articles')
        .select('*, policies(*)')
        .or(`title.ilike.${searchPattern},content.ilike.${searchPattern}`);
      
      if (articlesError) throw articlesError;
      
      return {
        policies: (policies || []).map(p => ({
          ...p,
          eligibility_rules: p.eligibility_rules as unknown as EligibilityRules | null,
          coverage_rules: p.coverage_rules as unknown as CoverageRules | null,
          required_docs: p.required_docs as unknown as RequiredDoc[] | null,
          sla_rules: p.sla_rules as unknown as SLARules | null,
          status: p.status as 'draft' | 'active' | 'archived',
        })) as Policy[],
        articles: (articles || []).map(a => ({
          ...a,
          policy: a.policies as unknown as Policy | undefined,
          tags: a.tags || [],
        })) as PolicyArticle[],
      };
    },
    enabled: !!user?.id && searchTerm.length >= 2,
  });
}

/**
 * Get policy stats
 */
export function usePolicyStats() {
  const { data: policies = [] } = usePolicies();
  
  return {
    total: policies.length,
    active: policies.filter(p => p.status === 'active').length,
    draft: policies.filter(p => p.status === 'draft').length,
    archived: policies.filter(p => p.status === 'archived').length,
    categories: [...new Set(policies.map(p => p.category))],
  };
}

/**
 * Link a request to a policy
 */
export function useLinkRequestToPolicy() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ requestId, policyId }: { requestId: string; policyId: string }) => {
      const { error } = await supabase
        .from('requests')
        .update({ policy_id: policyId })
        .eq('id', requestId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee_requests'] });
      queryClient.invalidateQueries({ queryKey: ['shared_requests'] });
    },
  });
}

/**
 * Get categories with policies
 */
export function usePolicyCategories() {
  const { data: policies = [] } = usePolicies({ status: 'active' });
  
  const categories = [...new Set(policies.map(p => p.category))].map(category => {
    const policy = policies.find(p => p.category === category);
    return {
      category,
      policyRef: policy?.policy_ref,
      policyId: policy?.id,
      title: policy?.title,
    };
  });
  
  return categories;
}
