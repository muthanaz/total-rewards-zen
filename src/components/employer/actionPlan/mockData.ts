/**
 * Action Plan Mock Data
 * 
 * Governance-grade sample actions with all mandatory fields.
 * PROMPT 07: Added lever type, mechanism, and impact ranges.
 */

import { addDays, subDays } from 'date-fns';
import { GovernanceAction, PortfolioMetrics, KanbanColumn } from './types';

export const MOCK_ACTIONS: GovernanceAction[] = [
  {
    id: 'ga-001',
    title: 'Launch L&D awareness campaign for senior grades',
    owner: { id: 'user-001', name: 'Sarah Ahmed', role: 'HR Ops Lead' },
    dueDate: addDays(new Date(), 7),
    expectedImpactAEDMin: 95000,
    expectedImpactAEDMax: 145000,
    expectedImpactPercent: 18,
    leverType: 'comms',
    mechanism: 'Email + Slack campaign targeting G4+ employees with personalized L&D recommendations based on role.',
    linkedKPI: {
      key: 'ld_utilization',
      name: 'L&D Utilization Rate',
      baseline: 42,
      target: 65,
      current: 48,
      unit: 'percent',
    },
    sourceInsight: {
      type: 'optimization',
      pageRoute: '/employer/optimization',
      insightId: 'value-activation-ld',
      label: 'Value Activation: L&D Gap',
    },
    status: 'in_progress',
    nextStep: 'Finalize email templates with Comms team',
    description: 'Targeted campaign to increase awareness of L&D benefits among G4+ employees who show 30% lower utilization than peers.',
    priority: 'P1',
    confidence: 'high',
    blockers: [],
    createdAt: subDays(new Date(), 12),
    updatedAt: subDays(new Date(), 1),
    category: 'Learning & Development',
    riskDownside: 'Low risk; campaign may underperform if messaging is generic.',
  },
  {
    id: 'ga-002',
    title: 'Reduce housing allowance cap breach exceptions',
    owner: { id: 'user-002', name: 'Fatima Hassan', role: 'Comp & Ben Manager' },
    dueDate: addDays(new Date(), 14),
    expectedImpactAEDMin: 65000,
    expectedImpactAEDMax: 120000,
    leverType: 'policy',
    mechanism: 'Adjust housing cap tiers by grade to reflect current Dubai rental market (Q4 data).',
    linkedKPI: {
      key: 'policy_exceptions',
      name: 'Housing Cap Exceptions',
      baseline: 23,
      target: 5,
      current: 18,
      unit: 'count',
    },
    sourceInsight: {
      type: 'policy',
      pageRoute: '/employer/policies',
      insightId: 'housing-cap-breach',
      label: 'Policy Exception: Housing Cap',
    },
    status: 'waiting',
    nextStep: 'Pending Finance approval for updated cap structure',
    description: 'Restructure housing policy caps to reduce exception requests while maintaining competitiveness.',
    priority: 'P0',
    confidence: 'medium',
    blockers: ['Waiting for Finance VP sign-off'],
    createdAt: subDays(new Date(), 20),
    updatedAt: subDays(new Date(), 3),
    category: 'Housing',
    riskDownside: 'May increase costs if caps are set too high; requires Finance alignment.',
  },
  {
    id: 'ga-003',
    title: 'Implement auto-approval for wellbeing claims under AED 500',
    owner: { id: 'user-003', name: 'Ahmed Khalil', role: 'Process Lead' },
    dueDate: subDays(new Date(), 2), // Overdue
    expectedImpactAEDMin: 30000,
    expectedImpactAEDMax: 42000,
    expectedImpactPercent: 25,
    leverType: 'process',
    mechanism: 'Configure workflow engine to auto-approve wellbeing claims ≤AED 500 with valid receipt.',
    linkedKPI: {
      key: 'wellbeing_utilization',
      name: 'Wellbeing Utilization',
      baseline: 38,
      target: 60,
      current: 41,
      unit: 'percent',
    },
    sourceInsight: {
      type: 'optimization',
      pageRoute: '/employer/optimization',
      insightId: 'process-friction-wellbeing',
      label: 'Cost Efficiency: Process Friction',
    },
    status: 'waiting',
    nextStep: 'IT deployment scheduled for next sprint',
    description: 'Reduce claims processing friction by implementing auto-approval threshold.',
    priority: 'P0',
    confidence: 'high',
    blockers: ['IT backlog', 'Testing environment unavailable'],
    createdAt: subDays(new Date(), 30),
    updatedAt: subDays(new Date(), 2),
    category: 'Wellbeing',
    riskDownside: 'Minimal fraud risk at AED 500 threshold; audit sampling recommended.',
  },
  {
    id: 'ga-004',
    title: 'Negotiate volume discount with healthcare provider',
    owner: null, // Unassigned
    dueDate: addDays(new Date(), 21),
    expectedImpactAEDMin: 140000,
    expectedImpactAEDMax: 220000,
    leverType: 'vendor',
    mechanism: 'RFP to incumbent + 2 competitors; leverage 15% headcount growth for better rates.',
    linkedKPI: {
      key: 'healthcare_cost_per_head',
      name: 'Healthcare Cost per Employee',
      baseline: 12500,
      target: 11000,
      current: 12500,
      unit: 'currency',
    },
    sourceInsight: {
      type: 'spend',
      pageRoute: '/employer/spend',
      insightId: 'healthcare-variance',
      label: 'Spend Variance: Healthcare',
    },
    status: 'backlog',
    nextStep: 'Assign owner and schedule vendor meeting',
    description: 'Leverage increased headcount for better premium rates.',
    priority: 'P1',
    confidence: 'medium',
    blockers: [],
    createdAt: subDays(new Date(), 5),
    updatedAt: subDays(new Date(), 5),
    category: 'Healthcare',
    riskDownside: 'May require 2-year commitment; evaluate contract flexibility.',
  },
  {
    id: 'ga-005',
    title: 'Align education allowance with market P50',
    owner: { id: 'user-002', name: 'Fatima Hassan', role: 'Comp & Ben Manager' },
    dueDate: addDays(new Date(), 45),
    expectedImpactAEDMin: 55000,
    expectedImpactAEDMax: 95000,
    expectedImpactPercent: 12,
    leverType: 'policy',
    mechanism: 'Update education policy tiers based on benchmark data; communicate changes in Q2.',
    linkedKPI: {
      key: 'education_utilization',
      name: 'Education Allowance Usage',
      baseline: 38,
      target: 55,
      current: 42,
      unit: 'percent',
    },
    sourceInsight: {
      type: 'benchmarks',
      pageRoute: '/employer/benchmarks',
      insightId: 'education-utilization-gap',
      label: 'Benchmark Gap: Education',
    },
    status: 'backlog',
    nextStep: 'Complete market analysis',
    description: 'Current education allowance is P22 vs industry. Adjust to improve competitiveness.',
    priority: 'P2',
    confidence: 'medium',
    blockers: [],
    createdAt: subDays(new Date(), 3),
    updatedAt: subDays(new Date(), 3),
    category: 'Education',
    riskDownside: 'Budget increase required; needs CFO approval.',
  },
  {
    id: 'ga-006',
    title: 'Deploy quarterly benefits utilization report',
    owner: { id: 'user-004', name: 'Mohammed Ali', role: 'Analytics Lead' },
    dueDate: subDays(new Date(), 5),
    expectedImpactAEDMin: 0,
    expectedImpactAEDMax: 0,
    leverType: 'process',
    mechanism: 'Automated BI dashboard with scheduled email distribution to HR leadership.',
    linkedKPI: {
      key: 'data_coverage',
      name: 'Data Coverage Score',
      baseline: 65,
      target: 90,
      current: 78,
      unit: 'percent',
    },
    sourceInsight: {
      type: 'segments',
      pageRoute: '/employer/segments',
      insightId: 'data-visibility',
      label: 'Data Quality: Coverage Gap',
    },
    status: 'done',
    nextStep: 'Completed - monitor adoption',
    description: 'Automated reporting to improve decision-making data.',
    priority: 'P2',
    confidence: 'high',
    blockers: [],
    createdAt: subDays(new Date(), 25),
    updatedAt: subDays(new Date(), 5),
    completedAt: subDays(new Date(), 5),
    category: 'Analytics',
    riskDownside: 'None; experience/clarity improvement only.',
  },
  {
    id: 'ga-007',
    title: 'Simplify transport claim documentation requirements',
    owner: { id: 'user-001', name: 'Sarah Ahmed', role: 'HR Ops Lead' },
    dueDate: subDays(new Date(), 10),
    expectedImpactAEDMin: 24000,
    expectedImpactAEDMax: 32000,
    expectedImpactPercent: 15,
    leverType: 'process',
    mechanism: 'Reduce required documents from 4 to 2 (receipt + odometer photo); update claim form.',
    linkedKPI: {
      key: 'transport_utilization',
      name: 'Transport Benefit Usage',
      baseline: 52,
      target: 70,
      current: 68,
      unit: 'percent',
    },
    sourceInsight: {
      type: 'optimization',
      pageRoute: '/employer/optimization',
      insightId: 'doc-friction',
      label: 'Cost Efficiency: Doc Friction',
    },
    status: 'done',
    nextStep: 'Monitor 30-day adoption metrics',
    description: 'Reduced required documents from 4 to 2 for standard claims.',
    priority: 'P1',
    confidence: 'high',
    blockers: [],
    createdAt: subDays(new Date(), 45),
    updatedAt: subDays(new Date(), 10),
    completedAt: subDays(new Date(), 10),
    category: 'Transport',
    riskDownside: 'Minimal; fraud risk addressed via random audit sampling.',
  },
];

export function calculatePortfolioMetrics(actions: GovernanceAction[]): PortfolioMetrics {
  const now = new Date();
  
  const actionsByStatus: Record<KanbanColumn, number> = {
    backlog: 0,
    in_progress: 0,
    waiting: 0,
    done: 0,
  };
  
  let totalImpactMin = 0;
  let totalImpactMax = 0;
  let overdueCount = 0;
  const blockerReasons: Record<string, { count: number; impact: number }> = {};
  let completedDays: number[] = [];
  
  actions.forEach(action => {
    actionsByStatus[action.status]++;
    
    if (action.status !== 'done') {
      totalImpactMin += action.expectedImpactAEDMin;
      totalImpactMax += action.expectedImpactAEDMax;
    }
    
    // Check overdue
    if (action.dueDate && action.dueDate < now && action.status !== 'done') {
      overdueCount++;
    }
    
    // Aggregate blockers (use max impact for "at risk" calculation)
    action.blockers.forEach(blocker => {
      if (!blockerReasons[blocker]) {
        blockerReasons[blocker] = { count: 0, impact: 0 };
      }
      blockerReasons[blocker].count++;
      blockerReasons[blocker].impact += action.expectedImpactAEDMax;
    });
    
    // Calculate completion time
    if (action.completedAt && action.createdAt) {
      const days = Math.ceil((action.completedAt.getTime() - action.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      completedDays.push(days);
    }
  });
  
  const topBlockedReasons = Object.entries(blockerReasons)
    .map(([reason, data]) => ({ reason, ...data }))
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 3)
    .map(r => ({ reason: r.reason, count: r.count, impactAED: r.impact }));
  
  const completionRate = actions.length > 0 
    ? Math.round((actionsByStatus.done / actions.length) * 100)
    : 0;
  
  const avgDaysToComplete = completedDays.length > 0
    ? Math.round(completedDays.reduce((a, b) => a + b, 0) / completedDays.length)
    : 0;
  
  return {
    totalExpectedImpactAEDMin: totalImpactMin,
    totalExpectedImpactAEDMax: totalImpactMax,
    actionsOverdue: overdueCount,
    actionsTotal: actions.length,
    actionsByStatus,
    topBlockedReasons,
    completionRate,
    avgDaysToComplete,
  };
}
