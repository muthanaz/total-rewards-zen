/**
 * Mock data for CFO-Defensible Optimization Page
 * 
 * All items now include:
 * - Verb-led titles
 * - Mechanism explanations
 * - Risk/downside statements
 * - AED ranges where applicable
 */

import { 
  CostEfficiencyItem, 
  ValueActivationItem, 
  PortfolioRebalanceItem,
  StrategicOptimizationData,
  AffectedEmployee,
} from './types';

// Generate mock affected employees
function generateAffectedEmployees(count: number, baseAmount: number): AffectedEmployee[] {
  const departments = ['Engineering', 'Sales', 'Operations', 'Marketing', 'Finance', 'HR'];
  const grades = ['G1', 'G2', 'G3', 'G4', 'G5'];
  const names = [
    'Ahmed Al-Rashid', 'Fatima Hassan', 'Mohammed Khan', 'Sara Al-Maktoum', 
    'Omar Abdullah', 'Layla Mahmoud', 'Yusuf Ibrahim', 'Noor Al-Farsi',
    'Hassan Ali', 'Mariam Khalid', 'Karim Nasser', 'Zainab Ahmed',
    'Tariq Hussein', 'Aisha Saleh', 'Rashid Hamdan', 'Huda Omar',
    'Sami Yousef', 'Dina Khalifa', 'Waleed Majid', 'Rania Jamal',
    'Faisal Al-Nahyan', 'Lina Saeed', 'Majid Hamza', 'Amira Farouk',
  ];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `emp-${i + 1}`,
    name: names[i % names.length],
    employeeId: `EMP-${String(1000 + i).padStart(4, '0')}`,
    department: departments[i % departments.length],
    grade: grades[i % grades.length],
    amount: Math.round(baseAmount / count * (0.7 + Math.random() * 0.6)),
  }));
}

export const COST_EFFICIENCY_ITEMS: CostEfficiencyItem[] = [
  {
    id: 'ce-1',
    category: 'Health Insurance',
    issue: 'Duplicate Family Coverage',
    title: 'Remove duplicate spouse coverage from 23 employees',
    description: '23 employees have overlapping spouse coverage from external policies',
    recoveryAmountMin: 165000,
    recoveryAmountMax: 195000,
    confidence: 'high',
    issueType: 'duplicate_coverage',
    mechanism: 'Cross-reference external policy declarations with current coverage to identify and remove duplicates.',
    riskDownside: 'Employees may perceive benefit reduction; requires clear communication about external coverage.',
    rootCause: 'Missing external coverage validation',
    affectedEmployees: generateAffectedEmployees(23, 184000),
    relatedPolicyId: 'pol-health-001',
  },
  {
    id: 'ce-2',
    category: 'Transport',
    issue: 'ENOC Rate Discrepancy',
    title: 'Renegotiate ENOC fuel card rates to market level',
    description: 'Fuel card vendor charging 8% above market rate',
    recoveryAmountMin: 55000,
    recoveryAmountMax: 75000,
    confidence: 'medium',
    issueType: 'vendor_overcharge',
    vendorName: 'ENOC',
    mechanism: 'Present market benchmark data to vendor and renegotiate contract terms for next quarter.',
    riskDownside: 'Vendor may push back; alternative vendors may have service quality trade-offs.',
    rootCause: 'Contract not reviewed in 18 months',
    affectedEmployees: generateAffectedEmployees(45, 67000),
  },
  {
    id: 'ce-3',
    category: 'Housing Allowance',
    issue: 'Unclaimed Cash-out Options',
    title: 'Notify 15 employees of housing cash-out eligibility',
    description: '15 employees eligible for housing cash-out but have not claimed',
    recoveryAmountMin: 200000,
    recoveryAmountMax: 250000,
    confidence: 'high',
    issueType: 'unclaimed_cashout',
    mechanism: 'Direct employee outreach with claim instructions and deadline reminders.',
    riskDownside: 'Low response rate possible; may need multiple follow-up communications.',
    rootCause: 'Awareness gap',
    affectedEmployees: generateAffectedEmployees(15, 225000),
    relatedPolicyId: 'pol-housing-001',
  },
  {
    id: 'ce-4',
    category: 'Life Insurance',
    issue: 'Over-coverage on Single Employees',
    title: 'Adjust life coverage tier for 42 single employees',
    description: '42 single employees have family-tier life coverage unnecessarily',
    recoveryAmountMin: 75000,
    recoveryAmountMax: 100000,
    confidence: 'medium',
    issueType: 'policy_noncompliance',
    mechanism: 'Update policy tier assignments based on current marital status declarations.',
    riskDownside: 'Data may be outdated; requires employee confirmation of status.',
    rootCause: 'Status not updated after hiring',
    affectedEmployees: generateAffectedEmployees(42, 89000),
    relatedPolicyId: 'pol-life-001',
  },
  {
    id: 'ce-5',
    category: 'Utilities',
    issue: 'Inactive Allowance Accounts',
    title: 'Close 8 utility accounts for terminated employees',
    description: '8 terminated employee accounts still accruing benefits',
    recoveryAmountMin: 28000,
    recoveryAmountMax: 36000,
    confidence: 'high',
    issueType: 'exceeded_caps',
    mechanism: 'Immediate account closure and clawback of unauthorized charges.',
    riskDownside: 'Minimal; clear policy violation with documentation.',
    rootCause: 'Offboarding process gap',
    affectedEmployees: generateAffectedEmployees(8, 32000),
  },
  {
    id: 'ce-6',
    category: 'Health Insurance',
    issue: 'AXA Premium Overcharge',
    title: 'Dispute AXA Insurance premium overcharge',
    description: 'Group policy renewed at 12% above negotiated rate',
    recoveryAmountMin: 140000,
    recoveryAmountMax: 170000,
    confidence: 'high',
    issueType: 'vendor_overcharge',
    vendorName: 'AXA Insurance',
    mechanism: 'Submit formal dispute with contract terms documentation and request credit or refund.',
    riskDownside: 'May affect renewal negotiations; document all communications.',
    rootCause: 'Invoice review gap',
    affectedEmployees: generateAffectedEmployees(312, 156000),
  },
];

export const VALUE_ACTIVATION_ITEMS: ValueActivationItem[] = [
  {
    id: 'va-1',
    benefitName: 'Gym & Fitness Reimbursement',
    category: 'Wellness',
    title: 'Launch fitness awareness campaign for 275 non-claimants',
    adoptionRate: 12,
    eligibleCount: 312,
    claimantCount: 37,
    unutilizedValueMin: 145000,
    unutilizedValueMax: 185000,
    awareness: 'low',
    mechanism: 'Multi-channel awareness campaign: email series, Slack announcements, and manager toolkit.',
    riskDownside: 'Campaign fatigue if poorly timed; coordinate with other HR communications.',
    segmentTargets: ['Engineering', 'Operations'],
    suggestedComms: 'Quarterly wellness newsletter with claim process walkthrough',
  },
  {
    id: 'va-2',
    benefitName: 'Mental Health Support',
    category: 'Wellness',
    title: 'Promote EAP utilization through manager training',
    adoptionRate: 8,
    eligibleCount: 312,
    claimantCount: 25,
    unutilizedValueMin: 125000,
    unutilizedValueMax: 160000,
    awareness: 'low',
    mechanism: 'Train managers on EAP referral process; create anonymous access pathways.',
    riskDownside: 'Stigma concerns may limit adoption; ensure confidentiality messaging.',
    segmentTargets: ['All departments'],
    suggestedComms: 'Confidential wellness check-in during 1:1s',
  },
  {
    id: 'va-3',
    benefitName: 'Professional Development',
    category: 'Learning & Development',
    title: 'Simplify L&D claim process for 230 non-users',
    adoptionRate: 18,
    eligibleCount: 280,
    claimantCount: 50,
    unutilizedValueMin: 400000,
    unutilizedValueMax: 520000,
    awareness: 'low',
    mechanism: 'Reduce documentation requirements and launch pre-approved course catalog.',
    riskDownside: 'May increase claim volume beyond budget; set clear caps.',
    segmentTargets: ['Sales', 'Marketing', 'Engineering'],
    suggestedComms: 'Career development week with featured courses',
  },
  {
    id: 'va-4',
    benefitName: 'Childcare Support',
    category: 'Family',
    title: 'Target parents of young children with childcare benefit info',
    adoptionRate: 15,
    eligibleCount: 89,
    claimantCount: 13,
    unutilizedValueMin: 100000,
    unutilizedValueMax: 130000,
    awareness: 'medium',
    mechanism: 'Partner with HR to identify parents; send personalized benefit summaries.',
    riskDownside: 'Privacy concerns with family data; use opt-in approach.',
    segmentTargets: ['Parents with children <6'],
    suggestedComms: 'Working parents resource guide',
  },
  {
    id: 'va-5',
    benefitName: 'Commuter Benefits',
    category: 'Transport',
    title: 'Run transport benefit enrollment drive for non-participants',
    adoptionRate: 19,
    eligibleCount: 245,
    claimantCount: 47,
    unutilizedValueMin: 100000,
    unutilizedValueMax: 135000,
    awareness: 'low',
    mechanism: 'Partner with facilities for transportation info sessions; simplify enrollment.',
    riskDownside: 'May reveal commute pattern concerns; address parking availability.',
    segmentTargets: ['Field offices', 'Warehouse'],
    suggestedComms: 'Commute optimization guide with benefit calculator',
  },
];

export const PORTFOLIO_REBALANCE_ITEMS: PortfolioRebalanceItem[] = [
  {
    id: 'pr-1',
    title: 'Shift L&D budget to wellness programs based on demand',
    sourceCategory: 'Professional Development',
    sourceBudget: 560000,
    sourceUtilization: 18,
    suggestedTarget: 'Wellness Programs',
    targetDemand: 'high',
    reallocationAmountMin: 250000,
    reallocationAmountMax: 310000,
    rationale: 'Wellness requests exceeded budget by 45% while L&D shows consistent underuse',
    mechanism: 'Reduce L&D cap by 50% for G1-G3; increase wellness cap proportionally.',
    riskDownside: 'May affect career development perception; communicate alternative learning paths.',
    employeeImpactEstimate: 185,
    policyChangesRequired: ['L&D Policy Section 3.2', 'Wellness Policy Section 4.1'],
  },
  {
    id: 'pr-2',
    title: 'Reallocate commuter budget to remote work allowance',
    sourceCategory: 'Commuter Benefits',
    sourceBudget: 147000,
    sourceUtilization: 32,
    suggestedTarget: 'Remote Work Allowance',
    targetDemand: 'high',
    reallocationAmountMin: 85000,
    reallocationAmountMax: 115000,
    rationale: 'Post-pandemic shift: 68% now hybrid workers requesting home office support',
    mechanism: 'Create new remote work allowance category; reduce commuter caps for hybrid roles.',
    riskDownside: 'Office-based employees may feel excluded; tier by work arrangement.',
    employeeImpactEstimate: 210,
    policyChangesRequired: ['Transport Policy Section 2.1', 'New: Remote Work Policy'],
  },
  {
    id: 'pr-3',
    title: 'Convert club memberships to flexible benefits pool',
    sourceCategory: 'Club Memberships',
    sourceBudget: 89000,
    sourceUtilization: 11,
    suggestedTarget: 'Flexible Benefits Pool',
    targetDemand: 'high',
    reallocationAmountMin: 70000,
    reallocationAmountMax: 85000,
    rationale: 'Club memberships consistently unused; employees prefer choice-based benefits',
    mechanism: 'Deprecate fixed club benefit; add equivalent amount to flex pool.',
    riskDownside: 'Current club users may object; grandfather existing enrollments.',
    employeeImpactEstimate: 312,
    policyChangesRequired: ['Wellness Policy Section 5.3', 'Flex Benefits Policy'],
  },
  {
    id: 'pr-4',
    title: 'Add EV charging subsidy from parking allowance surplus',
    sourceCategory: 'Parking Allowance',
    sourceBudget: 234000,
    sourceUtilization: 45,
    suggestedTarget: 'EV Charging Subsidy',
    targetDemand: 'medium',
    reallocationAmountMin: 55000,
    reallocationAmountMax: 75000,
    rationale: '12% of workforce now EV owners, requesting charging support',
    mechanism: 'Create EV subsidy tier within transport category; adjust parking caps.',
    riskDownside: 'Non-EV drivers may perceive inequity; position as sustainability initiative.',
    employeeImpactEstimate: 45,
    policyChangesRequired: ['Transport Policy Section 2.4'],
  },
];

export function getStrategicOptimizationData(): StrategicOptimizationData {
  const costMin = COST_EFFICIENCY_ITEMS.reduce((sum, i) => sum + i.recoveryAmountMin, 0);
  const costMax = COST_EFFICIENCY_ITEMS.reduce((sum, i) => sum + (i.recoveryAmountMax || i.recoveryAmountMin), 0);
  
  const valueMin = VALUE_ACTIVATION_ITEMS.reduce((sum, i) => sum + i.unutilizedValueMin, 0);
  const valueMax = VALUE_ACTIVATION_ITEMS.reduce((sum, i) => sum + (i.unutilizedValueMax || i.unutilizedValueMin), 0);
  
  const portfolioMin = PORTFOLIO_REBALANCE_ITEMS.reduce((sum, i) => sum + i.reallocationAmountMin, 0);
  const portfolioMax = PORTFOLIO_REBALANCE_ITEMS.reduce((sum, i) => sum + (i.reallocationAmountMax || i.reallocationAmountMin), 0);
  
  return {
    costEfficiency: {
      items: COST_EFFICIENCY_ITEMS,
      totalRecoverableMin: costMin,
      totalRecoverableMax: costMax,
      valueProposition: 'Immediate Cash Recovery',
    },
    valueActivation: {
      items: VALUE_ACTIVATION_ITEMS.filter(i => i.adoptionRate < 20),
      totalUnutilizedMin: valueMin,
      totalUnutilizedMax: valueMax,
      benefitCount: VALUE_ACTIVATION_ITEMS.filter(i => i.adoptionRate < 20).length,
      valueProposition: 'Maximize Benefit Awareness',
    },
    portfolioRebalancing: {
      items: PORTFOLIO_REBALANCE_ITEMS,
      totalReallocationMin: portfolioMin,
      totalReallocationMax: portfolioMax,
      valueProposition: 'Align Spend with Employee Needs',
    },
  };
}
