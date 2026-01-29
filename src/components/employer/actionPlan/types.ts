/**
 * Action Plan Types
 * 
 * Governance-grade schema for execution tracking.
 * 
 * PROMPT 07: Every action card MUST include:
 * - Lever type: Policy / Vendor / Comms / Process
 * - Expected impact range: Low–High (AED)
 * - Confidence band (High/Med/Low)
 * - Owner role + due date
 * - "Mechanism" one-liner
 */

export type KanbanColumn = 'backlog' | 'in_progress' | 'waiting' | 'done';

/** Lever type for action categorization */
export type LeverType = 'policy' | 'vendor' | 'comms' | 'process';

export const LEVER_CONFIG: Record<LeverType, { 
  label: string; 
  color: string; 
  bgColor: string;
  icon: string;
}> = {
  policy: { label: 'Policy', color: 'text-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-950/30', icon: '📋' },
  vendor: { label: 'Vendor', color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-950/30', icon: '🤝' },
  comms: { label: 'Comms', color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-950/30', icon: '📣' },
  process: { label: 'Process', color: 'text-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-950/30', icon: '⚙️' },
};

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export const CONFIDENCE_CONFIG: Record<ConfidenceLevel, { 
  label: string; 
  color: string; 
  bgColor: string;
}> = {
  high: { label: 'High', color: 'text-success', bgColor: 'bg-success/10' },
  medium: { label: 'Med', color: 'text-warning', bgColor: 'bg-warning/10' },
  low: { label: 'Low', color: 'text-muted-foreground', bgColor: 'bg-muted' },
};

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
  
  /** Expected impact range - use range for non-high confidence */
  expectedImpactAEDMin: number;
  expectedImpactAEDMax: number;
  /** @deprecated Use expectedImpactAEDMin/Max instead */
  expectedImpactAED?: number;
  expectedImpactPercent?: number;
  
  /** Lever type categorization */
  leverType: LeverType;
  
  /** Mechanism one-liner: what changes operationally if action is executed */
  mechanism: string;
  
  linkedKPI: LinkedKPI | null;
  sourceInsight: SourceInsight;
  status: KanbanColumn;
  nextStep: string;
  
  // Additional metadata
  description?: string;
  priority: 'P0' | 'P1' | 'P2';
  confidence: ConfidenceLevel;
  blockers: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  category?: string;
  
  /** Risk or downside if action fails */
  riskDownside?: string;
}

export interface PortfolioMetrics {
  totalExpectedImpactAEDMin: number;
  totalExpectedImpactAEDMax: number;
  /** @deprecated Use min/max range */
  totalExpectedImpactAED?: number;
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
