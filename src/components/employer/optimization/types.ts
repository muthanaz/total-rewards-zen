/**
 * Types for CFO-Defensible Optimization Page
 * 
 * Terminology:
 * - "Zombie Spend" → "Budget Leakage"
 * - All recommendations use verb-led titles
 * - Impact shown as AED ranges where applicable
 */

export type StrategicTabType = 'cost_efficiency' | 'value_activation' | 'portfolio_rebalancing';

// Common confidence type
export type ConfidenceLevel = 'high' | 'medium' | 'low';

// Issue types for Cost Efficiency
export type CostEfficiencyIssueType = 
  | 'duplicate_coverage' 
  | 'vendor_overcharge' 
  | 'unclaimed_cashout'
  | 'policy_noncompliance'
  | 'exceeded_caps';

export interface AffectedEmployee {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  grade?: string;
  amount: number;
}

export interface CostEfficiencyItem {
  id: string;
  category: string;
  issue: string;
  title: string; // Verb-led action title for recommendation card
  description: string;
  recoveryAmountMin: number;
  recoveryAmountMax?: number;
  confidence: ConfidenceLevel;
  issueType: CostEfficiencyIssueType;
  mechanism: string; // 1 sentence explaining how
  riskDownside: string; // 1 sentence on potential downsides
  vendorName?: string;
  affectedEmployees?: AffectedEmployee[];
  relatedPolicyId?: string;
  rootCause?: string;
}

export interface ValueActivationItem {
  id: string;
  benefitName: string;
  category: string;
  title: string; // Verb-led action title
  adoptionRate: number;
  eligibleCount: number;
  claimantCount: number;
  unutilizedValueMin: number;
  unutilizedValueMax?: number;
  awareness: 'low' | 'medium' | 'high';
  mechanism: string;
  riskDownside: string;
  segmentTargets?: string[];
  suggestedComms?: string;
}

export interface PortfolioRebalanceItem {
  id: string;
  title: string; // Verb-led action title
  sourceCategory: string;
  sourceBudget: number;
  sourceUtilization: number;
  suggestedTarget: string;
  targetDemand: 'high' | 'medium';
  reallocationAmountMin: number;
  reallocationAmountMax?: number;
  rationale: string;
  mechanism: string;
  riskDownside: string;
  employeeImpactEstimate?: number;
  policyChangesRequired?: string[];
}

export interface StrategicOptimizationData {
  costEfficiency: {
    items: CostEfficiencyItem[];
    totalRecoverableMin: number;
    totalRecoverableMax: number;
    valueProposition: string;
  };
  valueActivation: {
    items: ValueActivationItem[];
    totalUnutilizedMin: number;
    totalUnutilizedMax: number;
    benefitCount: number;
    valueProposition: string;
  };
  portfolioRebalancing: {
    items: PortfolioRebalanceItem[];
    totalReallocationMin: number;
    totalReallocationMax: number;
    valueProposition: string;
  };
}
