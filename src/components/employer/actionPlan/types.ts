/**
 * Action Plan Types
 * 
 * Governance-grade schema for execution tracking.
 */

export type KanbanColumn = 'backlog' | 'in_progress' | 'waiting' | 'done';

export interface LinkedKPI {
  key: string;
  name: string;
  baseline: number;
  target: number;
  current?: number;
  unit: 'percent' | 'currency' | 'days' | 'count';
}

export interface SourceInsight {
  type: 'spend' | 'optimization' | 'segments' | 'benchmarks' | 'policy';
  pageRoute: string;
  insightId?: string;
  label: string;
}

export interface ActionOwner {
  id: string;
  name: string;
  email?: string;
  role?: string;
}

export interface GovernanceAction {
  id: string;
  // Mandatory fields
  title: string; // Verb-led (e.g., "Launch...", "Reduce...", "Implement...")
  owner: ActionOwner | null;
  dueDate: Date | null;
  expectedImpactAED: number;
  expectedImpactPercent?: number;
  linkedKPI: LinkedKPI | null;
  sourceInsight: SourceInsight;
  status: KanbanColumn;
  nextStep: string;
  
  // Additional metadata
  description?: string;
  priority: 'P0' | 'P1' | 'P2';
  confidence: 'high' | 'medium' | 'low';
  blockers: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  category?: string;
}

export interface PortfolioMetrics {
  totalExpectedImpactAED: number;
  actionsOverdue: number;
  actionsTotal: number;
  actionsByStatus: Record<KanbanColumn, number>;
  topBlockedReasons: Array<{
    reason: string;
    count: number;
    impactAED: number;
  }>;
  completionRate: number;
  avgDaysToComplete: number;
}
