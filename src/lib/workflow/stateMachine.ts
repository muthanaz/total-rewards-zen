/**
 * Workflow State Machine
 * 
 * Defines valid state transitions for requests, claims, and questions.
 * Enforces workflow integrity across all portals.
 */

import { Database } from '@/integrations/supabase/types';

export type RequestStatus = Database['public']['Enums']['request_status'];
export type RequestType = Database['public']['Enums']['request_type'];

// ============================================================================
// VALID STATE TRANSITIONS
// ============================================================================

/**
 * Valid transitions per request type
 * Each status maps to an array of valid target statuses
 */
const CLAIM_TRANSITIONS: Record<string, RequestStatus[]> = {
  draft: ['submitted', 'cancelled'],
  submitted: ['pending', 'pending_employee', 'cancelled'],
  pending: ['in_review', 'info_requested', 'pending_employee', 'approved', 'rejected', 'escalated', 'cancelled'],
  pending_employee: ['pending', 'in_review', 'cancelled'],
  info_requested: ['pending', 'in_review', 'pending_employee', 'cancelled'],
  in_review: ['approved', 'rejected', 'escalated', 'info_requested', 'pending_employee'],
  escalated: ['approved', 'rejected', 'in_review'],
  approved: ['paid', 'closed'],
  rejected: ['closed', 'pending'], // Allow reopen for rejected claims
  paid: ['closed'],
  closed: [], // Terminal state
  cancelled: [], // Terminal state
};

const REQUEST_TRANSITIONS: Record<string, RequestStatus[]> = {
  draft: ['submitted', 'cancelled'],
  submitted: ['pending', 'pending_employee', 'cancelled'],
  pending: ['in_review', 'info_requested', 'pending_employee', 'approved', 'rejected', 'escalated', 'cancelled'],
  pending_employee: ['pending', 'in_review', 'cancelled'],
  info_requested: ['pending', 'in_review', 'pending_employee', 'cancelled'],
  in_review: ['approved', 'rejected', 'escalated', 'info_requested', 'pending_employee'],
  escalated: ['approved', 'rejected', 'in_review'],
  approved: ['closed'],
  rejected: ['closed', 'pending'],
  paid: ['closed'], // Requests don't typically have paid status but handle gracefully
  closed: [],
  cancelled: [],
};

const QUESTION_TRANSITIONS: Record<string, RequestStatus[]> = {
  draft: ['submitted', 'cancelled'],
  submitted: ['pending', 'cancelled'],
  pending: ['in_review', 'closed', 'cancelled'],
  pending_employee: ['pending', 'cancelled'],
  info_requested: ['pending', 'cancelled'],
  in_review: ['closed'],
  escalated: ['closed'],
  approved: ['closed'],
  rejected: ['closed'],
  paid: ['closed'],
  closed: [],
  cancelled: [],
};

/**
 * Get valid transitions for a given request type
 */
function getTransitionsForType(type: RequestType): Record<string, RequestStatus[]> {
  switch (type) {
    case 'claim':
      return CLAIM_TRANSITIONS;
    case 'request':
      return REQUEST_TRANSITIONS;
    case 'question':
      return QUESTION_TRANSITIONS;
    default:
      return CLAIM_TRANSITIONS; // Default to claim transitions
  }
}

// ============================================================================
// TRANSITION VALIDATION
// ============================================================================

export interface TransitionResult {
  valid: boolean;
  reason?: string;
  suggestedStatus?: RequestStatus;
}

/**
 * Check if a transition is valid
 */
export function canTransition(
  from: RequestStatus | string | null,
  to: RequestStatus,
  requestType: RequestType = 'claim'
): TransitionResult {
  // Handle null/undefined from status
  if (!from) {
    return { valid: true }; // New request, allow any initial status
  }

  const transitions = getTransitionsForType(requestType);
  const validTargets = transitions[from] || [];

  if (validTargets.includes(to)) {
    return { valid: true };
  }

  // Provide helpful error message
  if (validTargets.length === 0) {
    return {
      valid: false,
      reason: `Cannot transition from "${from}" - this is a terminal state`,
    };
  }

  return {
    valid: false,
    reason: `Invalid transition from "${from}" to "${to}". Valid targets: ${validTargets.join(', ')}`,
    suggestedStatus: validTargets[0],
  };
}

/**
 * Get all valid next statuses for a given state
 */
export function getValidNextStatuses(
  currentStatus: RequestStatus | string | null,
  requestType: RequestType = 'claim'
): RequestStatus[] {
  if (!currentStatus) return ['submitted', 'pending'];
  
  const transitions = getTransitionsForType(requestType);
  return transitions[currentStatus] || [];
}

/**
 * Check if a status is terminal (no further transitions possible)
 */
export function isTerminalStatus(status: RequestStatus | string | null): boolean {
  return status === 'closed' || status === 'cancelled';
}

/**
 * Check if a status allows employee actions
 */
export function isEmployeeActionableStatus(status: RequestStatus | string | null): boolean {
  return status === 'draft' || status === 'pending_employee' || status === 'info_requested';
}

/**
 * Check if a status allows employer/HR actions
 */
export function isEmployerActionableStatus(status: RequestStatus | string | null): boolean {
  return status === 'pending' || status === 'submitted' || status === 'in_review' || status === 'escalated';
}

/**
 * Statuses where SLA is paused (waiting on employee)
 */
export const SLA_PAUSED_STATUSES: RequestStatus[] = ['draft', 'pending_employee', 'info_requested'];

/**
 * Check if SLA clock should be paused for this status
 */
export function isSlaPausedStatus(status: RequestStatus | string | null): boolean {
  return SLA_PAUSED_STATUSES.includes(status as RequestStatus);
}

/**
 * Get who is currently responsible for action on this request
 */
export function getWaitingOnActor(status: RequestStatus | string | null): 'employee' | 'hr' | 'system' | 'none' {
  if (isEmployeeActionableStatus(status)) return 'employee';
  if (isEmployerActionableStatus(status)) return 'hr';
  if (status === 'approved') return 'system'; // Approved awaiting payment processing
  return 'none';
}

// ============================================================================
// TRANSITION ACTIONS
// ============================================================================

export interface TransitionAction {
  label: string;
  labelAr: string;
  targetStatus: RequestStatus;
  requiresNote: boolean;
  requiresReason: boolean;
  confirmationMessage?: string;
  icon?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
}

/**
 * Get available actions for a given status (employer perspective)
 */
export function getEmployerActions(
  currentStatus: RequestStatus | string | null,
  requestType: RequestType = 'claim'
): TransitionAction[] {
  const validTargets = getValidNextStatuses(currentStatus, requestType);
  const actions: TransitionAction[] = [];

  if (validTargets.includes('approved')) {
    actions.push({
      label: 'Approve',
      labelAr: 'موافقة',
      targetStatus: 'approved',
      requiresNote: false,
      requiresReason: false,
      icon: 'CheckCircle',
      variant: 'default',
    });
  }

  if (validTargets.includes('rejected')) {
    actions.push({
      label: 'Reject',
      labelAr: 'رفض',
      targetStatus: 'rejected',
      requiresNote: true,
      requiresReason: true,
      confirmationMessage: 'Are you sure you want to reject this request?',
      icon: 'XCircle',
      variant: 'destructive',
    });
  }

  if (validTargets.includes('in_review')) {
    actions.push({
      label: 'Mark In Review',
      labelAr: 'قيد المراجعة',
      targetStatus: 'in_review',
      requiresNote: false,
      requiresReason: false,
      icon: 'Eye',
      variant: 'secondary',
    });
  }

  if (validTargets.includes('info_requested') || validTargets.includes('pending_employee')) {
    actions.push({
      label: 'Request Information',
      labelAr: 'طلب معلومات',
      targetStatus: 'pending_employee',
      requiresNote: true,
      requiresReason: true,
      icon: 'FileQuestion',
      variant: 'outline',
    });
  }

  if (validTargets.includes('escalated')) {
    actions.push({
      label: 'Escalate',
      labelAr: 'تصعيد',
      targetStatus: 'escalated',
      requiresNote: true,
      requiresReason: true,
      icon: 'ArrowUp',
      variant: 'outline',
    });
  }

  if (validTargets.includes('paid')) {
    actions.push({
      label: 'Mark Paid',
      labelAr: 'تم الدفع',
      targetStatus: 'paid',
      requiresNote: false,
      requiresReason: false,
      icon: 'Banknote',
      variant: 'default',
    });
  }

  if (validTargets.includes('closed')) {
    actions.push({
      label: 'Close',
      labelAr: 'إغلاق',
      targetStatus: 'closed',
      requiresNote: false,
      requiresReason: false,
      icon: 'CheckSquare',
      variant: 'secondary',
    });
  }

  return actions;
}

/**
 * Get available actions for a given status (employee perspective)
 */
export function getEmployeeActions(
  currentStatus: RequestStatus | string | null,
  requestType: RequestType = 'claim'
): TransitionAction[] {
  const validTargets = getValidNextStatuses(currentStatus, requestType);
  const actions: TransitionAction[] = [];

  if (validTargets.includes('submitted')) {
    actions.push({
      label: 'Submit',
      labelAr: 'إرسال',
      targetStatus: 'submitted',
      requiresNote: false,
      requiresReason: false,
      icon: 'Send',
      variant: 'default',
    });
  }

  if (validTargets.includes('cancelled')) {
    actions.push({
      label: 'Cancel',
      labelAr: 'إلغاء',
      targetStatus: 'cancelled',
      requiresNote: false,
      requiresReason: true,
      confirmationMessage: 'Are you sure you want to cancel this request? This action cannot be undone.',
      icon: 'X',
      variant: 'destructive',
    });
  }

  // For pending_employee status, employee can submit back to pending
  if (currentStatus === 'pending_employee' && validTargets.includes('pending')) {
    actions.push({
      label: 'Resubmit',
      labelAr: 'إعادة الإرسال',
      targetStatus: 'pending',
      requiresNote: false,
      requiresReason: false,
      icon: 'Send',
      variant: 'default',
    });
  }

  return actions;
}

// ============================================================================
// WORKFLOW STAGE HELPERS
// ============================================================================

export interface WorkflowStage {
  key: string;
  label: string;
  labelAr: string;
  statuses: RequestStatus[];
  order: number;
  isComplete: (currentStatus: RequestStatus | null) => boolean;
  isCurrent: (currentStatus: RequestStatus | null) => boolean;
}

export const WORKFLOW_STAGES: WorkflowStage[] = [
  {
    key: 'submitted',
    label: 'Submitted',
    labelAr: 'تم الإرسال',
    statuses: ['submitted', 'pending'],
    order: 1,
    isComplete: (s) => s !== 'draft' && s !== 'submitted' && s !== 'pending',
    isCurrent: (s) => s === 'submitted' || s === 'pending',
  },
  {
    key: 'pending_action',
    label: 'Pending Action',
    labelAr: 'في انتظار إجراء',
    statuses: ['pending_employee', 'info_requested'],
    order: 2,
    isComplete: (s) => s === 'in_review' || s === 'escalated' || s === 'approved' || s === 'rejected' || s === 'paid' || s === 'closed',
    isCurrent: (s) => s === 'pending_employee' || s === 'info_requested',
  },
  {
    key: 'review',
    label: 'Under Review',
    labelAr: 'قيد المراجعة',
    statuses: ['in_review', 'escalated'],
    order: 3,
    isComplete: (s) => s === 'approved' || s === 'rejected' || s === 'paid' || s === 'closed',
    isCurrent: (s) => s === 'in_review' || s === 'escalated',
  },
  {
    key: 'decision',
    label: 'Decision',
    labelAr: 'القرار',
    statuses: ['approved', 'rejected'],
    order: 4,
    isComplete: (s) => s === 'paid' || s === 'closed',
    isCurrent: (s) => s === 'approved' || s === 'rejected',
  },
  {
    key: 'complete',
    label: 'Complete',
    labelAr: 'مكتمل',
    statuses: ['paid', 'closed'],
    order: 5,
    isComplete: (s) => s === 'paid' || s === 'closed',
    isCurrent: (s) => s === 'paid' || s === 'closed',
  },
];

/**
 * Get the current workflow stage for a status
 */
export function getCurrentWorkflowStage(status: RequestStatus | string | null): WorkflowStage | null {
  if (!status || status === 'draft' || status === 'cancelled') return null;
  return WORKFLOW_STAGES.find(stage => stage.isCurrent(status as RequestStatus)) || null;
}

/**
 * Get workflow progress (0-100)
 */
export function getWorkflowProgress(status: RequestStatus | string | null): number {
  if (!status || status === 'draft') return 0;
  if (status === 'cancelled') return 0;
  
  const stage = getCurrentWorkflowStage(status);
  if (!stage) return 0;
  
  return Math.round((stage.order / WORKFLOW_STAGES.length) * 100);
}
