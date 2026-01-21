import { useState, useEffect, useCallback } from 'react';
import { addDays, subDays, isPast } from 'date-fns';

// ============= TYPE DEFINITIONS =============

export type ActionType = 'policy' | 'process' | 'comms' | 'vendor' | 'analytics';
export type Priority = 'P0' | 'P1' | 'P2';
export type Status = 'backlog' | 'in_progress' | 'blocked' | 'completed' | 'cancelled';
export type Confidence = 'high' | 'medium' | 'low';
export type SourceType = 'zombie_spend' | 'segments' | 'claims' | 'policies' | 'survey' | 'manual';

export interface ExpectedImpact {
  utilizationChange?: number;
  slaReduction?: number;
  costAvoidance?: number;
  costAvoidanceLow?: number; // For range when low confidence
  costAvoidanceHigh?: number;
  satisfactionChange?: number;
}

export interface LinkedEntity {
  type: 'benefit' | 'segment' | 'policy' | 'metric';
  id: string;
  name: string;
}

export interface Blocker {
  id: string;
  description: string;
  addedAt: Date;
  addedBy: string;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: 'created' | 'status_changed' | 'comment' | 'updated' | 'assigned' | 'blocker_added' | 'blocker_removed';
  details: string;
  previousValue?: string;
  newValue?: string;
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  type: ActionType;
  priority: Priority;
  owner: string;
  ownerId: string | null;
  dueDate: Date | null;
  status: Status;
  expectedImpact: ExpectedImpact;
  confidence: Confidence;
  confidenceNote?: string;
  dataCompletenessPct: number;
  linkedEntities: LinkedEntity[];
  linkedMetrics: string[];
  linkedCategories: string[];
  blockers: Blocker[];
  activityLog: ActivityLogEntry[];
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  sourceType: SourceType;
  sourceRefId?: string;
}

// ============= DEMO DATA =============

const DEMO_OWNERS = [
  { id: 'user-001', name: 'Sarah Ahmed' },
  { id: 'user-002', name: 'Fatima Hassan' },
  { id: 'user-003', name: 'Ahmed Khalil' },
  { id: 'user-004', name: 'Mohammed Ali' },
  { id: 'user-005', name: 'Noor Ibrahim' },
  { id: null, name: 'Unassigned' },
];

const DEMO_ACTIONS: ActionItem[] = [
  {
    id: 'act-001',
    title: 'Launch L&D Awareness Campaign',
    description: 'Learning & Development has only 50% utilization. Many employees are unaware of available courses and budget. Create targeted email + Slack campaign to increase visibility.',
    type: 'comms',
    priority: 'P1',
    owner: 'Sarah Ahmed',
    ownerId: 'user-001',
    dueDate: addDays(new Date(), 14),
    status: 'in_progress',
    expectedImpact: {
      utilizationChange: 25,
      costAvoidance: 75000,
    },
    confidence: 'high',
    confidenceNote: 'Based on Q3 2024 campaign that achieved 28% uplift',
    dataCompletenessPct: 92,
    linkedEntities: [
      { type: 'benefit', id: 'ben-ld', name: 'Learning & Development' },
      { type: 'metric', id: 'met-util', name: 'L&D Utilization Rate' },
    ],
    linkedMetrics: ['ld_utilization', 'ld_claims_count'],
    linkedCategories: ['Learning & Development'],
    blockers: [],
    activityLog: [
      { id: 'log-001', timestamp: subDays(new Date(), 5), userId: 'user-001', userName: 'Sarah Ahmed', action: 'created', details: 'Action created from Zombie Spend analysis' },
      { id: 'log-002', timestamp: subDays(new Date(), 3), userId: 'user-001', userName: 'Sarah Ahmed', action: 'status_changed', details: 'Status updated', previousValue: 'backlog', newValue: 'in_progress' },
      { id: 'log-003', timestamp: subDays(new Date(), 1), userId: 'user-004', userName: 'Mohammed Ali', action: 'comment', details: 'Email templates ready for review. Slack integration pending IT approval.' },
    ],
    createdAt: subDays(new Date(), 5),
    updatedAt: subDays(new Date(), 1),
    completedAt: null,
    sourceType: 'zombie_spend',
    sourceRefId: 'zcat-ld',
  },
  {
    id: 'act-002',
    title: 'Simplify Wellbeing Redemption Process',
    description: 'Current 5-step process has 55% drop-off. Reduce to 2-step flow with auto-approval for amounts under AED 500.',
    type: 'process',
    priority: 'P0',
    owner: 'Fatima Hassan',
    ownerId: 'user-002',
    dueDate: addDays(new Date(), 7),
    status: 'blocked',
    expectedImpact: {
      utilizationChange: 35,
      costAvoidance: 35000,
      satisfactionChange: 12,
    },
    confidence: 'medium',
    confidenceNote: 'Based on industry benchmarks for similar process improvements',
    dataCompletenessPct: 78,
    linkedEntities: [
      { type: 'benefit', id: 'ben-well', name: 'Wellbeing Program' },
      { type: 'policy', id: 'pol-well-v1', name: 'Wellbeing Policy v1.2' },
    ],
    linkedMetrics: ['wellbeing_utilization', 'wellbeing_drop_off_rate'],
    linkedCategories: ['Wellbeing'],
    blockers: [
      { id: 'blk-001', description: 'Waiting for IT to deploy new approval workflow', addedAt: subDays(new Date(), 2), addedBy: 'Fatima Hassan' },
    ],
    activityLog: [
      { id: 'log-004', timestamp: subDays(new Date(), 10), userId: 'user-002', userName: 'Fatima Hassan', action: 'created', details: 'Created from Policy Insights recommendation' },
      { id: 'log-005', timestamp: subDays(new Date(), 2), userId: 'user-002', userName: 'Fatima Hassan', action: 'status_changed', details: 'Blocked by IT dependency', previousValue: 'in_progress', newValue: 'blocked' },
      { id: 'log-006', timestamp: subDays(new Date(), 2), userId: 'user-002', userName: 'Fatima Hassan', action: 'blocker_added', details: 'Waiting for IT to deploy new approval workflow' },
    ],
    createdAt: subDays(new Date(), 10),
    updatedAt: subDays(new Date(), 2),
    completedAt: null,
    sourceType: 'policies',
    sourceRefId: 'pol-well-v1',
  },
  {
    id: 'act-003',
    title: 'Rewrite Health Insurance FAQ Section',
    description: 'Policy has 72% clarity score with 8 employee questions monthly. Add flowcharts and video explainers for common scenarios.',
    type: 'policy',
    priority: 'P2',
    owner: 'Ahmed Khalil',
    ownerId: 'user-003',
    dueDate: addDays(new Date(), 21),
    status: 'backlog',
    expectedImpact: {
      slaReduction: 1.5,
      satisfactionChange: 8,
    },
    confidence: 'medium',
    confidenceNote: 'Based on HR team estimates; no prior data available',
    dataCompletenessPct: 65,
    linkedEntities: [
      { type: 'policy', id: 'pol-health-v3', name: 'Health Insurance Policy v3' },
      { type: 'segment', id: 'seg-new-hires', name: 'New Hires (<6 months)' },
    ],
    linkedMetrics: ['policy_clarity_score', 'hr_ticket_volume'],
    linkedCategories: ['Health Insurance'],
    blockers: [],
    activityLog: [
      { id: 'log-007', timestamp: subDays(new Date(), 3), userId: 'user-003', userName: 'Ahmed Khalil', action: 'created', details: 'Added to backlog from Policy Insights' },
    ],
    createdAt: subDays(new Date(), 3),
    updatedAt: subDays(new Date(), 3),
    completedAt: null,
    sourceType: 'policies',
  },
  {
    id: 'act-004',
    title: 'Convert Unused Flight Tickets to Vouchers',
    description: '30% of annual flight ticket allowance unused by single employees. Allow conversion to travel vouchers at 80% value.',
    type: 'policy',
    priority: 'P1',
    owner: 'Sarah Ahmed',
    ownerId: 'user-001',
    dueDate: subDays(new Date(), 3), // Overdue
    status: 'in_progress',
    expectedImpact: {
      utilizationChange: 20,
      costAvoidance: 60000,
      costAvoidanceLow: 45000,
      costAvoidanceHigh: 75000,
    },
    confidence: 'low',
    confidenceNote: 'Pilot needed to validate employee interest',
    dataCompletenessPct: 52,
    linkedEntities: [
      { type: 'benefit', id: 'ben-flight', name: 'Annual Flight Tickets' },
    ],
    linkedMetrics: ['flight_utilization', 'flight_forfeit_rate'],
    linkedCategories: ['Travel', 'Flight Tickets'],
    blockers: [],
    activityLog: [
      { id: 'log-008', timestamp: subDays(new Date(), 14), userId: 'user-001', userName: 'Sarah Ahmed', action: 'created', details: 'Created from Executive review' },
      { id: 'log-009', timestamp: subDays(new Date(), 7), userId: 'user-004', userName: 'Mohammed Ali', action: 'comment', details: 'Awaiting legal review of voucher terms' },
    ],
    createdAt: subDays(new Date(), 14),
    updatedAt: subDays(new Date(), 7),
    completedAt: null,
    sourceType: 'zombie_spend',
    sourceRefId: 'zcat-flights',
  },
  {
    id: 'act-005',
    title: 'Expand Gym Network Partnership',
    description: 'Current gym partners have limited locations causing 40% non-utilization. Negotiate with 3 additional chains.',
    type: 'vendor',
    priority: 'P2',
    owner: 'Mohammed Ali',
    ownerId: 'user-004',
    dueDate: addDays(new Date(), 45),
    status: 'backlog',
    expectedImpact: {
      utilizationChange: 40,
      costAvoidance: 32000,
    },
    confidence: 'medium',
    confidenceNote: 'Based on employee survey indicating location as #1 barrier',
    dataCompletenessPct: 88,
    linkedEntities: [
      { type: 'benefit', id: 'ben-gym', name: 'Gym Membership' },
    ],
    linkedMetrics: ['gym_checkin_rate', 'gym_utilization'],
    linkedCategories: ['Gym', 'Wellbeing'],
    blockers: [],
    activityLog: [
      { id: 'log-010', timestamp: subDays(new Date(), 7), userId: 'user-004', userName: 'Mohammed Ali', action: 'created', details: 'Created from Zombie Spend recovery playbook' },
    ],
    createdAt: subDays(new Date(), 7),
    updatedAt: subDays(new Date(), 7),
    completedAt: null,
    sourceType: 'zombie_spend',
  },
  {
    id: 'act-006',
    title: 'Implement Auto-Approval for Small Claims',
    description: 'Claims under AED 500 to be auto-approved to reduce SLA by 2 days and improve employee satisfaction.',
    type: 'process',
    priority: 'P1',
    owner: 'Fatima Hassan',
    ownerId: 'user-002',
    dueDate: subDays(new Date(), 10),
    status: 'completed',
    expectedImpact: {
      slaReduction: 2,
      satisfactionChange: 15,
    },
    confidence: 'high',
    confidenceNote: 'Achieved 2.1 day reduction in pilot',
    dataCompletenessPct: 100,
    linkedEntities: [
      { type: 'metric', id: 'met-sla', name: 'Claims SLA' },
    ],
    linkedMetrics: ['claims_sla', 'claims_volume'],
    linkedCategories: ['Claims Processing'],
    blockers: [],
    activityLog: [
      { id: 'log-011', timestamp: subDays(new Date(), 30), userId: 'user-002', userName: 'Fatima Hassan', action: 'created', details: 'Created from Ops improvement initiative' },
      { id: 'log-012', timestamp: subDays(new Date(), 10), userId: 'user-002', userName: 'Fatima Hassan', action: 'status_changed', details: 'Completed and deployed', previousValue: 'in_progress', newValue: 'completed' },
    ],
    createdAt: subDays(new Date(), 30),
    updatedAt: subDays(new Date(), 10),
    completedAt: subDays(new Date(), 10),
    sourceType: 'claims',
  },
  {
    id: 'act-007',
    title: 'Targeted Comms for New Joiner Segment',
    description: 'New joiners (0-6m) have 35% lower utilization. Create onboarding email sequence highlighting top 5 benefits.',
    type: 'comms',
    priority: 'P1',
    owner: 'Unassigned',
    ownerId: null,
    dueDate: addDays(new Date(), 10),
    status: 'backlog',
    expectedImpact: {
      utilizationChange: 18,
      costAvoidance: 28000,
    },
    confidence: 'medium',
    confidenceNote: 'Based on segment analysis showing awareness gap',
    dataCompletenessPct: 75,
    linkedEntities: [
      { type: 'segment', id: 'seg-new-joiner', name: 'New Joiners (0-6m)' },
    ],
    linkedMetrics: ['new_joiner_utilization', 'benefit_awareness_score'],
    linkedCategories: ['Communications', 'Onboarding'],
    blockers: [],
    activityLog: [
      { id: 'log-013', timestamp: subDays(new Date(), 2), userId: 'system', userName: 'System', action: 'created', details: 'Auto-generated from Segments analysis' },
    ],
    createdAt: subDays(new Date(), 2),
    updatedAt: subDays(new Date(), 2),
    completedAt: null,
    sourceType: 'segments',
    sourceRefId: 'seg-new-joiner',
  },
  {
    id: 'act-008',
    title: 'Fix Claims Document Upload Errors',
    description: 'Claims with missing docs have 45% rejection rate. Add real-time validation and document checklist.',
    type: 'process',
    priority: 'P0',
    owner: 'Noor Ibrahim',
    ownerId: 'user-005',
    dueDate: subDays(new Date(), 5), // Overdue
    status: 'blocked',
    expectedImpact: {
      slaReduction: 3,
      costAvoidance: 15000,
      satisfactionChange: 10,
    },
    confidence: 'high',
    confidenceNote: 'Based on claims rejection analysis',
    dataCompletenessPct: 95,
    linkedEntities: [
      { type: 'metric', id: 'met-rejection', name: 'Claims Rejection Rate' },
    ],
    linkedMetrics: ['claims_rejection_rate', 'missing_docs_rate'],
    linkedCategories: ['Claims Processing'],
    blockers: [
      { id: 'blk-002', description: 'Vendor API integration delayed', addedAt: subDays(new Date(), 3), addedBy: 'Noor Ibrahim' },
      { id: 'blk-003', description: 'Legal review of document retention policy', addedAt: subDays(new Date(), 1), addedBy: 'Noor Ibrahim' },
    ],
    activityLog: [
      { id: 'log-014', timestamp: subDays(new Date(), 15), userId: 'user-005', userName: 'Noor Ibrahim', action: 'created', details: 'Created from Claims bottleneck analysis' },
      { id: 'log-015', timestamp: subDays(new Date(), 3), userId: 'user-005', userName: 'Noor Ibrahim', action: 'status_changed', details: 'Blocked by vendor and legal', previousValue: 'in_progress', newValue: 'blocked' },
    ],
    createdAt: subDays(new Date(), 15),
    updatedAt: subDays(new Date(), 3),
    completedAt: null,
    sourceType: 'claims',
    sourceRefId: 'claims-docs',
  },
  {
    id: 'act-009',
    title: 'Survey-Driven Transport Improvements',
    description: 'Employee survey shows 3.2/5 satisfaction with transport benefits. Address top 3 pain points: parking, shuttle timing, fuel reimbursement speed.',
    type: 'vendor',
    priority: 'P2',
    owner: 'Mohammed Ali',
    ownerId: 'user-004',
    dueDate: addDays(new Date(), 30),
    status: 'in_progress',
    expectedImpact: {
      satisfactionChange: 18,
      costAvoidance: 12000,
    },
    confidence: 'medium',
    confidenceNote: 'Based on Q4 2024 employee satisfaction survey',
    dataCompletenessPct: 82,
    linkedEntities: [
      { type: 'benefit', id: 'ben-transport', name: 'Transport Benefits' },
    ],
    linkedMetrics: ['transport_satisfaction', 'transport_utilization'],
    linkedCategories: ['Transport'],
    blockers: [],
    activityLog: [
      { id: 'log-016', timestamp: subDays(new Date(), 8), userId: 'user-004', userName: 'Mohammed Ali', action: 'created', details: 'Created from Employee Survey insights' },
      { id: 'log-017', timestamp: subDays(new Date(), 5), userId: 'user-004', userName: 'Mohammed Ali', action: 'status_changed', details: 'Started vendor negotiations', previousValue: 'backlog', newValue: 'in_progress' },
    ],
    createdAt: subDays(new Date(), 8),
    updatedAt: subDays(new Date(), 5),
    completedAt: null,
    sourceType: 'survey',
  },
  {
    id: 'act-010',
    title: 'Analytics Dashboard for Policy Owners',
    description: 'Create self-service analytics dashboard for policy owners to track utilization, claims, and satisfaction by policy.',
    type: 'analytics',
    priority: 'P2',
    owner: 'Ahmed Khalil',
    ownerId: 'user-003',
    dueDate: addDays(new Date(), 60),
    status: 'backlog',
    expectedImpact: {
      slaReduction: 1,
    },
    confidence: 'low',
    confidenceNote: 'Impact estimate based on assumption; no baseline data',
    dataCompletenessPct: 45,
    linkedEntities: [],
    linkedMetrics: ['dashboard_usage', 'policy_update_frequency'],
    linkedCategories: ['Analytics', 'Self-Service'],
    blockers: [],
    activityLog: [
      { id: 'log-018', timestamp: subDays(new Date(), 1), userId: 'user-003', userName: 'Ahmed Khalil', action: 'created', details: 'Created manually for roadmap planning' },
    ],
    createdAt: subDays(new Date(), 1),
    updatedAt: subDays(new Date(), 1),
    completedAt: null,
    sourceType: 'manual',
  },
  {
    id: 'act-011',
    title: 'Housing Allowance Process Automation',
    description: 'Automate housing allowance verification to reduce processing time from 5 days to 1 day.',
    type: 'process',
    priority: 'P1',
    owner: 'Fatima Hassan',
    ownerId: 'user-002',
    dueDate: addDays(new Date(), 28),
    status: 'in_progress',
    expectedImpact: {
      slaReduction: 4,
      satisfactionChange: 8,
      costAvoidance: 18000,
    },
    confidence: 'high',
    confidenceNote: 'Similar automation reduced Education claims SLA by 80%',
    dataCompletenessPct: 90,
    linkedEntities: [
      { type: 'benefit', id: 'ben-housing', name: 'Housing Allowance' },
    ],
    linkedMetrics: ['housing_sla', 'housing_satisfaction'],
    linkedCategories: ['Housing'],
    blockers: [],
    activityLog: [
      { id: 'log-019', timestamp: subDays(new Date(), 12), userId: 'user-002', userName: 'Fatima Hassan', action: 'created', details: 'Created from Claims SLA analysis' },
      { id: 'log-020', timestamp: subDays(new Date(), 8), userId: 'user-002', userName: 'Fatima Hassan', action: 'status_changed', details: 'Started development', previousValue: 'backlog', newValue: 'in_progress' },
    ],
    createdAt: subDays(new Date(), 12),
    updatedAt: subDays(new Date(), 8),
    completedAt: null,
    sourceType: 'claims',
  },
  {
    id: 'act-012',
    title: 'M4+ Grade Retention Package Review',
    description: 'M4+ grade segment shows highest attrition risk. Review and enhance retention-focused benefits.',
    type: 'policy',
    priority: 'P0',
    owner: 'Sarah Ahmed',
    ownerId: 'user-001',
    dueDate: addDays(new Date(), 21),
    status: 'in_progress',
    expectedImpact: {
      satisfactionChange: 15,
      costAvoidance: 120000,
      costAvoidanceLow: 80000,
      costAvoidanceHigh: 160000,
    },
    confidence: 'low',
    confidenceNote: 'Based on exit interview themes; limited sample size',
    dataCompletenessPct: 58,
    linkedEntities: [
      { type: 'segment', id: 'seg-m4plus', name: 'M4+ Grade Band' },
    ],
    linkedMetrics: ['retention_rate', 'satisfaction_m4'],
    linkedCategories: ['Retention', 'Executive Benefits'],
    blockers: [],
    activityLog: [
      { id: 'log-021', timestamp: subDays(new Date(), 6), userId: 'user-001', userName: 'Sarah Ahmed', action: 'created', details: 'Created from Segments retention analysis' },
      { id: 'log-022', timestamp: subDays(new Date(), 4), userId: 'user-001', userName: 'Sarah Ahmed', action: 'status_changed', details: 'Started stakeholder interviews', previousValue: 'backlog', newValue: 'in_progress' },
    ],
    createdAt: subDays(new Date(), 6),
    updatedAt: subDays(new Date(), 4),
    completedAt: null,
    sourceType: 'segments',
    sourceRefId: 'seg-m4plus',
  },
];

// ============= HOOK =============

export interface UseEmployerActionsOptions {
  statusFilter?: Status | 'all';
  priorityFilter?: Priority | 'all';
  typeFilter?: ActionType | 'all';
  sourceFilter?: SourceType | 'all';
  confidenceFilter?: Confidence | 'all';
  ownerFilter?: string | 'all';
}

export interface UseEmployerActionsReturn {
  actions: ActionItem[];
  filteredActions: ActionItem[];
  isLoading: boolean;
  error: Error | null;
  owners: typeof DEMO_OWNERS;
  
  // Metrics
  metrics: {
    inProgress: number;
    overdue: number;
    blocked: number;
    completed: number;
    totalImpact: number;
    lowConfidenceImpact: number;
    highConfidenceImpact: number;
    noOwnerCount: number;
  };
  
  // Actions
  updateStatus: (actionId: string, newStatus: Status) => void;
  updateOwner: (actionId: string, ownerId: string | null, ownerName: string) => void;
  addComment: (actionId: string, comment: string) => void;
  addBlocker: (actionId: string, description: string) => void;
  removeBlocker: (actionId: string, blockerId: string) => void;
  createAction: (action: Partial<ActionItem>) => void;
  
  // Refresh
  refetch: () => void;
  lastRefreshed: Date;
}

export function useEmployerActions(options: UseEmployerActionsOptions = {}): UseEmployerActionsReturn {
  const [actions, setActions] = useState<ActionItem[]>(DEMO_ACTIONS);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  
  const {
    statusFilter = 'all',
    priorityFilter = 'all',
    typeFilter = 'all',
    sourceFilter = 'all',
    confidenceFilter = 'all',
    ownerFilter = 'all',
  } = options;
  
  // Filter actions
  const filteredActions = actions.filter(a => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && a.priority !== priorityFilter) return false;
    if (typeFilter !== 'all' && a.type !== typeFilter) return false;
    if (sourceFilter !== 'all' && a.sourceType !== sourceFilter) return false;
    if (confidenceFilter !== 'all' && a.confidence !== confidenceFilter) return false;
    if (ownerFilter !== 'all') {
      if (ownerFilter === 'unassigned' && a.ownerId !== null) return false;
      if (ownerFilter !== 'unassigned' && a.ownerId !== ownerFilter) return false;
    }
    return true;
  });
  
  // Calculate metrics
  const metrics = {
    inProgress: actions.filter(a => a.status === 'in_progress').length,
    overdue: actions.filter(a => a.dueDate && isPast(a.dueDate) && !['completed', 'cancelled'].includes(a.status)).length,
    blocked: actions.filter(a => a.status === 'blocked').length,
    completed: actions.filter(a => a.status === 'completed').length,
    totalImpact: actions
      .filter(a => a.status !== 'cancelled')
      .reduce((sum, a) => sum + (a.expectedImpact.costAvoidance || 0), 0),
    lowConfidenceImpact: actions
      .filter(a => a.confidence === 'low' && a.status !== 'cancelled')
      .reduce((sum, a) => sum + (a.expectedImpact.costAvoidance || 0), 0),
    highConfidenceImpact: actions
      .filter(a => a.confidence === 'high' && a.status !== 'cancelled')
      .reduce((sum, a) => sum + (a.expectedImpact.costAvoidance || 0), 0),
    noOwnerCount: actions.filter(a => a.ownerId === null && !['completed', 'cancelled'].includes(a.status)).length,
  };
  
  const updateStatus = useCallback((actionId: string, newStatus: Status) => {
    setActions(prev => prev.map(a => {
      if (a.id === actionId) {
        const newLog: ActivityLogEntry = {
          id: `log-${Date.now()}`,
          timestamp: new Date(),
          userId: 'current-user',
          userName: 'You',
          action: 'status_changed',
          details: `Status changed from ${a.status} to ${newStatus}`,
          previousValue: a.status,
          newValue: newStatus,
        };
        return {
          ...a,
          status: newStatus,
          activityLog: [...a.activityLog, newLog],
          updatedAt: new Date(),
          completedAt: newStatus === 'completed' ? new Date() : a.completedAt,
        };
      }
      return a;
    }));
  }, []);
  
  const updateOwner = useCallback((actionId: string, ownerId: string | null, ownerName: string) => {
    setActions(prev => prev.map(a => {
      if (a.id === actionId) {
        const newLog: ActivityLogEntry = {
          id: `log-${Date.now()}`,
          timestamp: new Date(),
          userId: 'current-user',
          userName: 'You',
          action: 'assigned',
          details: `Assigned to ${ownerName}`,
          previousValue: a.owner,
          newValue: ownerName,
        };
        return {
          ...a,
          owner: ownerName,
          ownerId,
          activityLog: [...a.activityLog, newLog],
          updatedAt: new Date(),
        };
      }
      return a;
    }));
  }, []);
  
  const addComment = useCallback((actionId: string, comment: string) => {
    setActions(prev => prev.map(a => {
      if (a.id === actionId) {
        const newLog: ActivityLogEntry = {
          id: `log-${Date.now()}`,
          timestamp: new Date(),
          userId: 'current-user',
          userName: 'You',
          action: 'comment',
          details: comment,
        };
        return {
          ...a,
          activityLog: [...a.activityLog, newLog],
          updatedAt: new Date(),
        };
      }
      return a;
    }));
  }, []);
  
  const addBlocker = useCallback((actionId: string, description: string) => {
    setActions(prev => prev.map(a => {
      if (a.id === actionId) {
        const newBlocker: Blocker = {
          id: `blk-${Date.now()}`,
          description,
          addedAt: new Date(),
          addedBy: 'You',
        };
        const newLog: ActivityLogEntry = {
          id: `log-${Date.now()}`,
          timestamp: new Date(),
          userId: 'current-user',
          userName: 'You',
          action: 'blocker_added',
          details: description,
        };
        return {
          ...a,
          blockers: [...a.blockers, newBlocker],
          activityLog: [...a.activityLog, newLog],
          updatedAt: new Date(),
        };
      }
      return a;
    }));
  }, []);
  
  const removeBlocker = useCallback((actionId: string, blockerId: string) => {
    setActions(prev => prev.map(a => {
      if (a.id === actionId) {
        const blocker = a.blockers.find(b => b.id === blockerId);
        const newLog: ActivityLogEntry = {
          id: `log-${Date.now()}`,
          timestamp: new Date(),
          userId: 'current-user',
          userName: 'You',
          action: 'blocker_removed',
          details: `Removed blocker: ${blocker?.description || 'Unknown'}`,
        };
        return {
          ...a,
          blockers: a.blockers.filter(b => b.id !== blockerId),
          activityLog: [...a.activityLog, newLog],
          updatedAt: new Date(),
        };
      }
      return a;
    }));
  }, []);
  
  const createAction = useCallback((partial: Partial<ActionItem>) => {
    const newAction: ActionItem = {
      id: `act-${Date.now()}`,
      title: partial.title || 'New Action',
      description: partial.description || '',
      type: partial.type || 'process',
      priority: partial.priority || 'P2',
      owner: partial.owner || 'Unassigned',
      ownerId: partial.ownerId || null,
      dueDate: partial.dueDate || null,
      status: 'backlog',
      expectedImpact: partial.expectedImpact || {},
      confidence: partial.confidence || 'medium',
      confidenceNote: partial.confidenceNote,
      dataCompletenessPct: partial.dataCompletenessPct || 100,
      linkedEntities: partial.linkedEntities || [],
      linkedMetrics: partial.linkedMetrics || [],
      linkedCategories: partial.linkedCategories || [],
      blockers: [],
      activityLog: [{
        id: `log-${Date.now()}`,
        timestamp: new Date(),
        userId: 'current-user',
        userName: 'You',
        action: 'created',
        details: 'Action created manually',
      }],
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: null,
      sourceType: partial.sourceType || 'manual',
      sourceRefId: partial.sourceRefId,
    };
    setActions(prev => [newAction, ...prev]);
  }, []);
  
  const refetch = useCallback(() => {
    setIsLoading(true);
    // Simulate refetch
    setTimeout(() => {
      setLastRefreshed(new Date());
      setIsLoading(false);
    }, 500);
  }, []);
  
  return {
    actions,
    filteredActions,
    isLoading,
    error: null,
    owners: DEMO_OWNERS,
    metrics,
    updateStatus,
    updateOwner,
    addComment,
    addBlocker,
    removeBlocker,
    createAction,
    refetch,
    lastRefreshed,
  };
}
