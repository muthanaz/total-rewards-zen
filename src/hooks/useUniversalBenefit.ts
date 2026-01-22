/**
 * Universal Benefit Hook
 * 
 * Category-agnostic hook for fetching benefit policy and utilization data.
 * Works for ALL benefit categories consistently.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  UniversalPolicyLogic, 
  UniversalPolicyContent,
  validateUniversalPolicyLogic,
  DEFAULT_UNIVERSAL_POLICY_LOGIC,
  DEFAULT_UNIVERSAL_POLICY_CONTENT,
} from '@/lib/universalBenefitEngine';
import { BenefitCategoryKey } from '@/lib/benefitCategories';
import type { BenefitUtilization } from '@/components/templates/UniversalBenefitTemplate';

// ============================================================================
// TYPES
// ============================================================================

export interface UniversalBenefitData {
  // Policy info
  policyId: string | null;
  policyRef: string | null;
  policyTitle: string | null;
  policyVersionId: string | null;
  versionNumber: number | null;
  
  // Parsed policy data
  policyLogic: UniversalPolicyLogic;
  policyContent: UniversalPolicyContent;
  
  // Utilization
  utilization: BenefitUtilization;
  
  // Raw policy highlights (from benefits table as fallback)
  policyHighlights: string[];
  
  // Status
  hasPublishedPolicy: boolean;
}

// ============================================================================
// CATEGORY MAPPING
// ============================================================================

/**
 * Map category keys to policy search terms
 */
const CATEGORY_SEARCH_TERMS: Record<BenefitCategoryKey, string[]> = {
  housing: ['housing', 'accommodation', 'rent'],
  schooling: ['education', 'school', 'tuition', 'schooling'],
  health: ['health', 'medical', 'insurance'],
  transport: ['transport', 'travel', 'mobility', 'commute'],
  wellbeing: ['wellbeing', 'wellness', 'gym'],
  financial: ['financial', 'savings', 'pension', 'gratuity'],
  learning: ['learning', 'training', 'development', 'l&d'],
  rewards: ['bonus', 'reward', 'incentive'],
  equity: ['equity', 'stock', 'option', 'esop'],
  timeoff: ['leave', 'vacation', 'pto', 'time off'],
};


// ============================================================================
// HOOKS
// ============================================================================

/**
 * Fetch universal benefit data for a category
 */
export function useUniversalBenefit(categoryKey: BenefitCategoryKey | null) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['universal_benefit', categoryKey, user?.id],
    queryFn: async (): Promise<UniversalBenefitData> => {
      if (!categoryKey || !user?.id) {
        return getEmptyBenefitData();
      }
      
      // Get user's organization
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();
      
      if (!profile?.organization_id) {
        return getEmptyBenefitData();
      }
      
      // Try to find published policy for this category
      const searchTerms = CATEGORY_SEARCH_TERMS[categoryKey] || [categoryKey];
      let policy: any = null;
      
      // Try category match first
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
      
      let policyLogic = DEFAULT_UNIVERSAL_POLICY_LOGIC;
      let policyContent = DEFAULT_UNIVERSAL_POLICY_CONTENT;
      let policyVersionId: string | null = null;
      let versionNumber: number | null = null;
      
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
          policyVersionId = version.id;
          versionNumber = version.version_number;
          
          // Validate and normalize logic
          const validation = validateUniversalPolicyLogic(version.logic_json);
          policyLogic = validation.normalized;
          
          // Parse content
          if (version.content_json && typeof version.content_json === 'object') {
            policyContent = {
              ...DEFAULT_UNIVERSAL_POLICY_CONTENT,
              ...(version.content_json as Partial<UniversalPolicyContent>),
            };
          }
        }
      }
      
      // Fetch utilization data
      const utilization = await fetchUtilization(
        user.id, 
        policy?.id || null,
        policyLogic.limits_caps.annual_cap
      );
      
      // Fetch fallback policy highlights from benefits table
      const policyHighlights = await fetchBenefitHighlights(categoryKey);
      
      return {
        policyId: policy?.id || null,
        policyRef: policy?.policy_ref || null,
        policyTitle: policy?.title || null,
        policyVersionId,
        versionNumber,
        policyLogic,
        policyContent,
        utilization,
        policyHighlights,
        hasPublishedPolicy: !!policy,
      };
    },
    enabled: !!categoryKey && !!user?.id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch utilization data for a user and policy
 */
async function fetchUtilization(
  userId: string, 
  policyId: string | null,
  annualCap: number | null
): Promise<BenefitUtilization> {
  const startOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString();
  
  // Default values
  let utilized = 0;
  let annualValue = annualCap || 0;
  
  if (policyId) {
    // Fetch approved/paid claims for this policy
    const { data: claims } = await supabase
      .from('requests')
      .select('amount')
      .eq('user_id', userId)
      .eq('policy_id', policyId)
      .in('status', ['approved', 'paid'])
      .gte('created_at', startOfYear);
    
    utilized = (claims || []).reduce((sum, c) => sum + (c.amount || 0), 0);
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
  };
}

/**
 * Fetch policy highlights from benefits table as fallback
 */
async function fetchBenefitHighlights(categoryKey: BenefitCategoryKey): Promise<string[]> {
  // Map to valid life_area enum values
  const lifeAreaMap: Record<string, string> = {
    housing: 'home_living',
    schooling: 'family_parenting', 
    health: 'health',
    transport: 'mobility',
    wellbeing: 'health',
    financial: 'money',
    learning: 'career',
    rewards: 'money',
    equity: 'money',
    timeoff: 'lifestyle',
  };
  
  const lifeArea = lifeAreaMap[categoryKey];
  if (!lifeArea) return [];
  
  const { data: benefits } = await supabase
    .from('benefits')
    .select('policy_bullets')
    .eq('life_area', lifeArea as any)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();
  
  return benefits?.policy_bullets || [];
}

/**
 * Get empty benefit data for loading/error states
 */
function getEmptyBenefitData(): UniversalBenefitData {
  return {
    policyId: null,
    policyRef: null,
    policyTitle: null,
    policyVersionId: null,
    versionNumber: null,
    policyLogic: DEFAULT_UNIVERSAL_POLICY_LOGIC,
    policyContent: DEFAULT_UNIVERSAL_POLICY_CONTENT,
    utilization: {
      annualValue: 0,
      utilized: 0,
      remaining: 0,
      utilizationPercent: 0,
    },
    policyHighlights: [],
    hasPublishedPolicy: false,
  };
}

// ============================================================================
// ADDITIONAL HOOKS
// ============================================================================

/**
 * Fetch all available benefits for an employee
 */
export function useEmployeeBenefitsSummary() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['employee_benefits_summary', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();
      
      if (!profile?.organization_id) return [];
      
      // Fetch all published policies for the org
      const { data: policies } = await supabase
        .from('policies')
        .select('id, policy_ref, title, category, benefit_type')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)
        .eq('status', 'published')
        .order('title');
      
      return policies || [];
    },
    enabled: !!user?.id,
  });
}
