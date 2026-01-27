/**
 * Types for Strategic Decision Support Optimization Page
 */

export type StrategicTabType = 'cost_efficiency' | 'value_activation' | 'portfolio_rebalancing';

export interface CostEfficiencyItem {
  id: string;
  category: string;
  issue: string;
  description: string;
  recoveryAmount: number;
  confidence: 'high' | 'medium' | 'low';
  issueType: 'duplicate_coverage' | 'vendor_overcharge' | 'unclaimed_cashout';
  vendorName?: string; // For vendor_overcharge items
  affectedEmployees?: AffectedEmployee[]; // Employees affected for recovery batch
}

export interface AffectedEmployee {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  amount: number;
}

export interface ValueActivationItem {
  id: string;
  benefitName: string;
  category: string;
  adoptionRate: number; // Percentage of eligible employees who claimed
  eligibleCount: number;
  claimantCount: number;
  unutilizedValue: number;
  awareness: 'low' | 'medium' | 'high';
}

export interface PortfolioRebalanceItem {
  id: string;
  sourceCategory: string;
  sourceBudget: number;
  sourceUtilization: number;
  suggestedTarget: string;
  targetDemand: 'high' | 'medium';
  reallocationAmount: number;
  rationale: string;
}

export interface StrategicOptimizationData {
  costEfficiency: {
    items: CostEfficiencyItem[];
    totalRecoverable: number;
    valueProposition: string;
  };
  valueActivation: {
    items: ValueActivationItem[];
    totalUnutilized: number;
    benefitCount: number;
    valueProposition: string;
  };
  portfolioRebalancing: {
    items: PortfolioRebalanceItem[];
    totalReallocationPotential: number;
    valueProposition: string;
  };
}
