/**
 * Mock data for Strategic Decision Support Optimization Page
 */

import { 
  CostEfficiencyItem, 
  ValueActivationItem, 
  PortfolioRebalanceItem,
  StrategicOptimizationData 
} from './types';

export const COST_EFFICIENCY_ITEMS: CostEfficiencyItem[] = [
  {
    id: 'ce-1',
    category: 'Health Insurance',
    issue: 'Duplicate Family Coverage',
    description: '23 employees have overlapping spouse coverage from external policies',
    recoveryAmount: 184000,
    confidence: 'high',
    issueType: 'duplicate_coverage',
  },
  {
    id: 'ce-2',
    category: 'Transport',
    issue: 'Vendor Rate Discrepancy',
    description: 'Fuel card vendor charging 8% above market rate',
    recoveryAmount: 67000,
    confidence: 'medium',
    issueType: 'vendor_overcharge',
  },
  {
    id: 'ce-3',
    category: 'Housing Allowance',
    issue: 'Unclaimed Cash-out Options',
    description: '15 employees eligible for housing cash-out but not claimed',
    recoveryAmount: 225000,
    confidence: 'high',
    issueType: 'unclaimed_cashout',
  },
  {
    id: 'ce-4',
    category: 'Life Insurance',
    issue: 'Over-coverage on Single Employees',
    description: '42 single employees have family-tier life coverage',
    recoveryAmount: 89000,
    confidence: 'medium',
    issueType: 'duplicate_coverage',
  },
  {
    id: 'ce-5',
    category: 'Utilities',
    issue: 'Inactive Allowance Accounts',
    description: '8 terminated employee accounts still accruing benefits',
    recoveryAmount: 32000,
    confidence: 'high',
    issueType: 'unclaimed_cashout',
  },
];

export const VALUE_ACTIVATION_ITEMS: ValueActivationItem[] = [
  {
    id: 'va-1',
    benefitName: 'Gym & Fitness Reimbursement',
    category: 'Wellness',
    adoptionRate: 12,
    eligibleCount: 312,
    claimantCount: 37,
    unutilizedValue: 165000,
    awareness: 'low',
  },
  {
    id: 'va-2',
    benefitName: 'Mental Health Support',
    category: 'Wellness',
    adoptionRate: 8,
    eligibleCount: 312,
    claimantCount: 25,
    unutilizedValue: 143500,
    awareness: 'low',
  },
  {
    id: 'va-3',
    benefitName: 'Professional Development',
    category: 'Learning & Development',
    adoptionRate: 18,
    eligibleCount: 280,
    claimantCount: 50,
    unutilizedValue: 460000,
    awareness: 'low',
  },
  {
    id: 'va-4',
    benefitName: 'Childcare Support',
    category: 'Family',
    adoptionRate: 15,
    eligibleCount: 89,
    claimantCount: 13,
    unutilizedValue: 114000,
    awareness: 'medium',
  },
  {
    id: 'va-5',
    benefitName: 'Commuter Benefits',
    category: 'Transport',
    adoptionRate: 19,
    eligibleCount: 245,
    claimantCount: 47,
    unutilizedValue: 118800,
    awareness: 'low',
  },
];

export const PORTFOLIO_REBALANCE_ITEMS: PortfolioRebalanceItem[] = [
  {
    id: 'pr-1',
    sourceCategory: 'Professional Development',
    sourceBudget: 560000,
    sourceUtilization: 18,
    suggestedTarget: 'Wellness Programs',
    targetDemand: 'high',
    reallocationAmount: 280000,
    rationale: 'Wellness requests exceeded budget by 45% while L&D shows consistent underuse',
  },
  {
    id: 'pr-2',
    sourceCategory: 'Commuter Benefits',
    sourceBudget: 147000,
    sourceUtilization: 32,
    suggestedTarget: 'Remote Work Allowance',
    targetDemand: 'high',
    reallocationAmount: 100000,
    rationale: 'Post-pandemic shift: 68% now hybrid workers requesting home office support',
  },
  {
    id: 'pr-3',
    sourceCategory: 'Club Memberships',
    sourceBudget: 89000,
    sourceUtilization: 11,
    suggestedTarget: 'Flexible Benefits Pool',
    targetDemand: 'high',
    reallocationAmount: 79000,
    rationale: 'Club memberships consistently unused; employees prefer choice-based benefits',
  },
  {
    id: 'pr-4',
    sourceCategory: 'Parking Allowance',
    sourceBudget: 234000,
    sourceUtilization: 45,
    suggestedTarget: 'EV Charging Subsidy',
    targetDemand: 'medium',
    reallocationAmount: 65000,
    rationale: '12% of workforce now EV owners, requesting charging support',
  },
];

export function getStrategicOptimizationData(): StrategicOptimizationData {
  const costEfficiencyTotal = COST_EFFICIENCY_ITEMS.reduce((sum, i) => sum + i.recoveryAmount, 0);
  const valueActivationTotal = VALUE_ACTIVATION_ITEMS.reduce((sum, i) => sum + i.unutilizedValue, 0);
  const portfolioTotal = PORTFOLIO_REBALANCE_ITEMS.reduce((sum, i) => sum + i.reallocationAmount, 0);
  
  return {
    costEfficiency: {
      items: COST_EFFICIENCY_ITEMS,
      totalRecoverable: costEfficiencyTotal,
      valueProposition: 'Immediate Cash Impact',
    },
    valueActivation: {
      items: VALUE_ACTIVATION_ITEMS.filter(i => i.adoptionRate < 20), // <20% adoption
      totalUnutilized: valueActivationTotal,
      benefitCount: VALUE_ACTIVATION_ITEMS.filter(i => i.adoptionRate < 20).length,
      valueProposition: 'Improve Benefit Awareness',
    },
    portfolioRebalancing: {
      items: PORTFOLIO_REBALANCE_ITEMS,
      totalReallocationPotential: portfolioTotal,
      valueProposition: 'Maximize Total Rewards Relevance',
    },
  };
}
