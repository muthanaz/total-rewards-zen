/**
 * Status Badge Styling System
 * 
 * Centralized status badge styles using semantic design tokens.
 * ALWAYS use these instead of hardcoded colors like bg-blue-500, text-green-600, etc.
 * 
 * All colors use CSS variables from index.css for proper theming.
 */

import { cn } from './utils';

// =============================================================================
// STATUS TYPES
// =============================================================================

export type RequestStatus = 
  | 'pending' 
  | 'in_review' 
  | 'approved' 
  | 'rejected' 
  | 'paid' 
  | 'cancelled'
  | 'info_requested'
  | 'pending_employee'
  | 'escalated'
  | 'overdue';

export type QueuePriority = 'low' | 'standard' | 'high' | 'urgent';
export type TransactionType = 'claim' | 'request' | 'question';
export type PolicyStatus = 'draft' | 'submitted' | 'approved' | 'published' | 'archived' | 'rejected';

// =============================================================================
// SEMANTIC STATUS STYLES
// =============================================================================

/**
 * Status badge styles using semantic tokens only.
 * Maps status values to CSS classes from our design system.
 */
export const STATUS_BADGE_STYLES: Record<RequestStatus, { 
  bg: string; 
  text: string; 
  border: string;
  label: string;
  labelAr: string;
}> = {
  pending: {
    bg: 'bg-warning/10',
    text: 'text-warning',
    border: 'border-warning/20',
    label: 'Pending',
    labelAr: 'قيد الانتظار',
  },
  in_review: {
    bg: 'bg-info/10',
    text: 'text-info',
    border: 'border-info/20',
    label: 'In Review',
    labelAr: 'قيد المراجعة',
  },
  approved: {
    bg: 'bg-success/10',
    text: 'text-success',
    border: 'border-success/20',
    label: 'Approved',
    labelAr: 'موافق عليه',
  },
  rejected: {
    bg: 'bg-destructive/10',
    text: 'text-destructive',
    border: 'border-destructive/20',
    label: 'Rejected',
    labelAr: 'مرفوض',
  },
  paid: {
    bg: 'bg-success/10',
    text: 'text-success',
    border: 'border-success/20',
    label: 'Paid',
    labelAr: 'مدفوع',
  },
  cancelled: {
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    border: 'border-border',
    label: 'Cancelled',
    labelAr: 'ملغى',
  },
  info_requested: {
    bg: 'bg-accent/10',
    text: 'text-accent',
    border: 'border-accent/20',
    label: 'Info Requested',
    labelAr: 'معلومات مطلوبة',
  },
  pending_employee: {
    bg: 'bg-warning/10',
    text: 'text-warning',
    border: 'border-warning/20',
    label: 'Awaiting Response',
    labelAr: 'في انتظار الرد',
  },
  escalated: {
    bg: 'bg-chart-3/10',
    text: 'text-chart-3',
    border: 'border-chart-3/20',
    label: 'Escalated',
    labelAr: 'تم التصعيد',
  },
  overdue: {
    bg: 'bg-destructive/10',
    text: 'text-destructive',
    border: 'border-destructive/20',
    label: 'Overdue',
    labelAr: 'متأخر',
  },
};

/**
 * Priority badge styles
 */
export const PRIORITY_BADGE_STYLES: Record<QueuePriority, {
  bg: string;
  text: string;
  border: string;
  label: string;
  labelAr: string;
}> = {
  low: {
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    border: 'border-border',
    label: 'Low',
    labelAr: 'منخفض',
  },
  standard: {
    bg: 'bg-secondary',
    text: 'text-secondary-foreground',
    border: 'border-border',
    label: 'Standard',
    labelAr: 'عادي',
  },
  high: {
    bg: 'bg-warning/10',
    text: 'text-warning',
    border: 'border-warning/20',
    label: 'High',
    labelAr: 'مرتفع',
  },
  urgent: {
    bg: 'bg-destructive/10',
    text: 'text-destructive',
    border: 'border-destructive/20',
    label: 'Urgent',
    labelAr: 'عاجل',
  },
};

/**
 * Transaction type badge styles
 */
export const TRANSACTION_TYPE_STYLES: Record<TransactionType, {
  bg: string;
  text: string;
  border: string;
  label: string;
  labelAr: string;
}> = {
  claim: {
    bg: 'bg-success/10',
    text: 'text-success',
    border: 'border-success/20',
    label: 'Claim',
    labelAr: 'مطالبة',
  },
  request: {
    bg: 'bg-primary/10',
    text: 'text-primary',
    border: 'border-primary/20',
    label: 'Request',
    labelAr: 'طلب',
  },
  question: {
    bg: 'bg-accent/10',
    text: 'text-accent',
    border: 'border-accent/20',
    label: 'Question',
    labelAr: 'سؤال',
  },
};

/**
 * Policy status badge styles
 */
export const POLICY_STATUS_STYLES: Record<PolicyStatus, {
  bg: string;
  text: string;
  border: string;
  label: string;
  labelAr: string;
}> = {
  draft: {
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    border: 'border-border',
    label: 'Draft',
    labelAr: 'مسودة',
  },
  submitted: {
    bg: 'bg-info/10',
    text: 'text-info',
    border: 'border-info/20',
    label: 'Pending Approval',
    labelAr: 'قيد الموافقة',
  },
  approved: {
    bg: 'bg-success/10',
    text: 'text-success',
    border: 'border-success/20',
    label: 'Approved',
    labelAr: 'موافق عليه',
  },
  published: {
    bg: 'bg-success/10',
    text: 'text-success',
    border: 'border-success/20',
    label: 'Published',
    labelAr: 'منشور',
  },
  archived: {
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    border: 'border-border',
    label: 'Archived',
    labelAr: 'مؤرشف',
  },
  rejected: {
    bg: 'bg-destructive/10',
    text: 'text-destructive',
    border: 'border-destructive/20',
    label: 'Rejected',
    labelAr: 'مرفوض',
  },
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get combined badge class names for a request status
 */
export function getStatusBadgeClasses(status: RequestStatus | string): string {
  const style = STATUS_BADGE_STYLES[status as RequestStatus];
  if (!style) {
    return cn('bg-muted text-muted-foreground border-border');
  }
  return cn(style.bg, style.text, style.border);
}

/**
 * Get status label with language support
 */
export function getStatusLabel(status: RequestStatus | string, isRTL: boolean = false): string {
  const style = STATUS_BADGE_STYLES[status as RequestStatus];
  if (!style) return status;
  return isRTL ? style.labelAr : style.label;
}

/**
 * Get combined badge class names for priority
 */
export function getPriorityBadgeClasses(priority: QueuePriority | string): string {
  const style = PRIORITY_BADGE_STYLES[priority as QueuePriority];
  if (!style) {
    return cn('bg-muted text-muted-foreground border-border');
  }
  return cn(style.bg, style.text, style.border);
}

/**
 * Get priority label with language support
 */
export function getPriorityLabel(priority: QueuePriority | string, isRTL: boolean = false): string {
  const style = PRIORITY_BADGE_STYLES[priority as QueuePriority];
  if (!style) return priority;
  return isRTL ? style.labelAr : style.label;
}

/**
 * Get combined badge class names for transaction type
 */
export function getTransactionTypeBadgeClasses(type: TransactionType | string): string {
  const style = TRANSACTION_TYPE_STYLES[type as TransactionType];
  if (!style) {
    return cn('bg-muted text-muted-foreground border-border');
  }
  return cn(style.bg, style.text, style.border);
}

/**
 * Get transaction type label with language support
 */
export function getTransactionTypeLabel(type: TransactionType | string, isRTL: boolean = false): string {
  const style = TRANSACTION_TYPE_STYLES[type as TransactionType];
  if (!style) return type;
  return isRTL ? style.labelAr : style.label;
}

/**
 * Get combined badge class names for policy status
 */
export function getPolicyStatusBadgeClasses(status: PolicyStatus | string): string {
  const style = POLICY_STATUS_STYLES[status as PolicyStatus];
  if (!style) {
    return cn('bg-muted text-muted-foreground border-border');
  }
  return cn(style.bg, style.text, style.border);
}

/**
 * Get policy status label with language support
 */
export function getPolicyStatusLabel(status: PolicyStatus | string, isRTL: boolean = false): string {
  const style = POLICY_STATUS_STYLES[status as PolicyStatus];
  if (!style) return status;
  return isRTL ? style.labelAr : style.label;
}

// =============================================================================
// CATEGORY ICON GRADIENTS (Using semantic tokens)
// =============================================================================

/**
 * Standard icon gradient classes by category.
 * Uses semantic chart tokens instead of hardcoded colors.
 */
export const CATEGORY_ICON_GRADIENTS: Record<string, string> = {
  housing: 'from-accent to-accent/80 shadow-accent/25',
  health: 'from-chart-5 to-chart-5/80 shadow-chart-5/25',
  schooling: 'from-chart-4 to-chart-4/80 shadow-chart-4/25',
  transport: 'from-chart-2 to-chart-2/80 shadow-chart-2/25',
  leave: 'from-info to-info/80 shadow-info/25',
  learning: 'from-chart-3 to-chart-3/80 shadow-chart-3/25',
  wellbeing: 'from-chart-6 to-chart-6/80 shadow-chart-6/25',
  financial: 'from-accent to-accent/80 shadow-accent/25',
  equity: 'from-chart-3 to-chart-3/80 shadow-chart-3/25',
  bonus: 'from-chart-4 to-chart-4/80 shadow-chart-4/25',
  gratuity: 'from-success to-success/80 shadow-success/25',
};

/**
 * Get category gradient or fallback
 */
export function getCategoryGradient(category: string): string {
  return CATEGORY_ICON_GRADIENTS[category.toLowerCase()] || 'from-primary to-primary/80 shadow-primary/25';
}

// =============================================================================
// QUEUE COUNTER STYLES
// =============================================================================

export const QUEUE_COUNTER_STYLES = {
  pending: {
    bg: 'bg-info/10',
    border: 'border-info/20',
    text: 'text-info',
  },
  in_review: {
    bg: 'bg-warning/10',
    border: 'border-warning/20',
    text: 'text-warning',
  },
  action_required: {
    bg: 'bg-chart-3/10',
    border: 'border-chart-3/20',
    text: 'text-chart-3',
  },
  overdue: {
    bg: 'bg-destructive/10',
    border: 'border-destructive/20',
    text: 'text-destructive',
  },
} as const;
