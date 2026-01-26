/**
 * Standardized Action Item Types
 * 
 * Central type definitions for the Action Plan operating system.
 * Actions can be created from insights/issues/policy hotspots
 * and track measurement plans with evidence links.
 */

// ============= CORE TYPES =============

export type ActionType = 'policy' | 'process' | 'data' | 'vendor' | 'communication';
export type ActionPriority = 'P0' | 'P1' | 'P2';
export type ActionStatus = 'backlog' | 'in_progress' | 'blocked' | 'completed' | 'cancelled';
export type ActionConfidence = 'high' | 'medium' | 'low';
export type ActionSourceType = 
  | 'zombie_spend' 
  | 'segments' 
  | 'claims' 
  | 'policies' 
  | 'survey' 
  | 'data_quality'
  | 'executive_top3'
  | 'manual';

// ============= IMPACT & MEASUREMENT =============

export interface ExpectedImpactRange {
  costAvoidance?: number;
  costAvoidanceLow?: number;
  costAvoidanceHigh?: number;
  utilizationChange?: number;
  slaReduction?: number;
  satisfactionChange?: number;
}

export interface MeasurementPlan {
  metricKey: string;           // From metric glossary
  metricName: string;          // Display name
  baselineValue: number | null;
  baselineDate: Date | null;
  targetValue: number | null;
  targetDate: Date | null;     // Tracking window end
  unit: 'currency' | 'percent' | 'days' | 'count' | 'score' | 'ratio';
  isMeasurable: boolean;
  notMeasurableReason?: string; // e.g., "Insufficient data - connect survey module"
}

// ============= EVIDENCE & LINKS =============

export interface EvidenceLink {
  id: string;
  type: 'insight_card' | 'issue' | 'policy_section' | 'claim_sample' | 'metric' | 'segment';
  label: string;
  path: string;
  refId?: string;
}

export interface LinkedEntity {
  type: 'benefit' | 'segment' | 'policy' | 'metric' | 'issue';
  id: string;
  name: string;
}

// ============= DEPENDENCIES & BLOCKERS =============

export interface ActionDependency {
  id: string;
  type: 'issue' | 'approval' | 'data' | 'action' | 'external';
  description: string;
  refId?: string;            // Reference to issue/action/etc
  isResolved: boolean;
  resolvedAt?: Date;
}

export interface ActionBlocker {
  id: string;
  description: string;
  addedAt: Date;
  addedBy: string;
  resolvedAt?: Date;
  resolvedBy?: string;
}

// ============= COLLABORATORS =============

export interface ActionCollaborator {
  userId: string;
  name: string;
  role: 'owner' | 'contributor' | 'reviewer';
  addedAt: Date;
}

// ============= APPROVAL WORKFLOW =============

export interface ActionApprovalRequirement {
  isRequired: boolean;
  approverRole?: 'executive' | 'hr_lead' | 'finance' | 'comp_ben';
  approverUserId?: string;
  approverName?: string;
  status?: 'pending' | 'approved' | 'rejected';
  requestedAt?: Date;
  decidedAt?: Date;
  reason?: string;
}

// ============= ACTIVITY LOG =============

export interface ActionActivityEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: 
    | 'created' 
    | 'status_changed' 
    | 'comment' 
    | 'updated' 
    | 'assigned' 
    | 'blocker_added' 
    | 'blocker_removed'
    | 'dependency_added'
    | 'dependency_resolved'
    | 'approval_requested'
    | 'approval_granted'
    | 'approval_rejected'
    | 'measurement_updated';
  details: string;
  previousValue?: string;
  newValue?: string;
  metadata?: Record<string, unknown>;
}

// ============= MAIN ACTION ITEM =============

export interface StandardizedActionItem {
  id: string;
  title: string;
  description: string;
  type: ActionType;
  priority: ActionPriority;
  status: ActionStatus;
  
  // Ownership
  ownerId: string | null;
  ownerName: string;
  collaborators: ActionCollaborator[];
  
  // Timeline
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  
  // Impact & Measurement
  expectedImpact: ExpectedImpactRange;
  measurementPlan: MeasurementPlan | null;
  confidence: ActionConfidence;
  confidenceNote?: string;
  dataCompletenessPct: number;
  
  // Evidence & Links
  evidenceLinks: EvidenceLink[];
  linkedEntities: LinkedEntity[];
  linkedMetrics: string[];
  linkedCategories: string[];
  
  // Dependencies & Blockers
  dependencies: ActionDependency[];
  blockers: ActionBlocker[];
  
  // Governance
  approvalRequirement: ActionApprovalRequirement | null;
  
  // Source & Audit
  sourceType: ActionSourceType;
  sourceRefId?: string;
  activityLog: ActionActivityEntry[];
}

// ============= PREFILL TYPES =============

export interface ActionPrefillBase {
  sourceType: ActionSourceType;
  sourceRefId?: string;
  evidenceLinks?: EvidenceLink[];
  linkedEntities?: LinkedEntity[];
  suggestedMetricKey?: string;
}

export interface PolicyInsightPrefill extends ActionPrefillBase {
  sourceType: 'policies';
  policyName: string;
  policyRef?: string;
  section?: string;
  topQuestions?: string[];
  clarityPercent?: number;
  dropOffPercent?: number;
  recommendedFix?: string;
}

export interface ZombieSpendPrefill extends ActionPrefillBase {
  sourceType: 'zombie_spend';
  category: string;
  potentialRecovery?: number;
  potentialRecoveryLow?: number;
  potentialRecoveryHigh?: number;
  currentUtilization?: number;
}

export interface SegmentInsightPrefill extends ActionPrefillBase {
  sourceType: 'segments';
  dimension: string;
  segmentName: string;
  gapDescription?: string;
  impactedEmployees?: number;
  expectedImpact?: number;
}

export interface DataQualityIssuePrefill extends ActionPrefillBase {
  sourceType: 'data_quality';
  issueType: string;
  issueSeverity: 'critical' | 'high' | 'medium' | 'low';
  affectedMetrics: string[];
  suggestedFix?: string;
}

export interface ExecutiveTop3Prefill extends ActionPrefillBase {
  sourceType: 'executive_top3';
  decisionTitle: string;
  whyItMatters: string;
  impactRange: { min: number; max: number; unit: 'currency' | 'percent' | 'days' };
  category: 'spend' | 'policy' | 'engagement' | 'compliance';
  owner: string;
}

export type ActionPrefill = 
  | PolicyInsightPrefill 
  | ZombieSpendPrefill 
  | SegmentInsightPrefill
  | DataQualityIssuePrefill
  | ExecutiveTop3Prefill
  | { sourceType: 'manual' };

// ============= GOVERNANCE CONFIG =============

export interface ActionGovernanceConfig {
  requireApprovalForTypes: ActionType[];
  requireApprovalAboveImpact?: number; // AED threshold
  defaultApproverRole: 'executive' | 'hr_lead' | 'finance' | 'comp_ben';
  allowSelfApproval: boolean;
}

// Default governance config
export const DEFAULT_ACTION_GOVERNANCE: ActionGovernanceConfig = {
  requireApprovalForTypes: ['policy', 'vendor'],
  requireApprovalAboveImpact: 50000,
  defaultApproverRole: 'hr_lead',
  allowSelfApproval: false,
};

// ============= TYPE CONFIG UTILITIES =============

export const ACTION_TYPE_CONFIG: Record<ActionType, { 
  label: string; 
  labelAr: string;
  icon: string; 
  color: string;
  description: string;
}> = {
  policy: { 
    label: 'Policy Update', 
    labelAr: 'تحديث السياسة',
    icon: 'FileText', 
    color: 'text-purple-500',
    description: 'Changes to benefit policies, eligibility rules, or documentation'
  },
  process: { 
    label: 'Process Change', 
    labelAr: 'تغيير العملية',
    icon: 'Settings', 
    color: 'text-blue-500',
    description: 'Workflow improvements, automation, or operational changes'
  },
  data: { 
    label: 'Data Quality', 
    labelAr: 'جودة البيانات',
    icon: 'Database', 
    color: 'text-teal-500',
    description: 'Data integration, cleanup, or quality improvements'
  },
  vendor: { 
    label: 'Vendor/Partner', 
    labelAr: 'البائع/الشريك',
    icon: 'Store', 
    color: 'text-orange-500',
    description: 'Vendor negotiations, partner onboarding, or contract changes'
  },
  communication: { 
    label: 'Communications', 
    labelAr: 'الاتصالات',
    icon: 'Megaphone', 
    color: 'text-green-500',
    description: 'Employee awareness campaigns, training, or comms'
  },
};

export const ACTION_PRIORITY_CONFIG: Record<ActionPriority, {
  label: string;
  labelAr: string;
  color: string;
  bgColor: string;
  description: string;
}> = {
  P0: { 
    label: 'P0 - Critical', 
    labelAr: 'حرج',
    color: 'text-destructive', 
    bgColor: 'bg-destructive/10',
    description: 'Immediate action required'
  },
  P1: { 
    label: 'P1 - High', 
    labelAr: 'عالي',
    color: 'text-warning', 
    bgColor: 'bg-warning/10',
    description: 'Complete within 2 weeks'
  },
  P2: { 
    label: 'P2 - Medium', 
    labelAr: 'متوسط',
    color: 'text-primary', 
    bgColor: 'bg-primary/10',
    description: 'Plan for this quarter'
  },
};

export const ACTION_STATUS_CONFIG: Record<ActionStatus, {
  label: string;
  labelAr: string;
  icon: string;
  color: string;
}> = {
  backlog: { label: 'Backlog', labelAr: 'قائمة الانتظار', icon: 'CircleDot', color: 'text-muted-foreground' },
  in_progress: { label: 'In Progress', labelAr: 'قيد التنفيذ', icon: 'PlayCircle', color: 'text-primary' },
  blocked: { label: 'Blocked', labelAr: 'محظور', icon: 'PauseCircle', color: 'text-destructive' },
  completed: { label: 'Completed', labelAr: 'مكتمل', icon: 'CheckCircle2', color: 'text-success' },
  cancelled: { label: 'Cancelled', labelAr: 'ملغى', icon: 'XCircle', color: 'text-muted-foreground' },
};
