/**
 * Canonical Status Labels & Waiting-On Logic
 * 
 * Provides consistent status display across Employee and Employer portals.
 * Includes SLA pause logic when waiting on employee action.
 */

import { Database } from '@/integrations/supabase/types';

export type RequestStatus = Database['public']['Enums']['request_status'];
export type RequestType = Database['public']['Enums']['request_type'];

// =============================================================================
// CANONICAL UI LABELS
// =============================================================================

export interface StatusLabelConfig {
  label: string;
  labelAr: string;
  description: string;
  descriptionAr: string;
  /** Who is this status waiting on? */
  waitingOn: 'employee' | 'hr' | 'system' | 'none';
  /** Should SLA clock be paused in this status? */
  slaPaused: boolean;
  /** Color token for badge styling */
  colorToken: 'amber' | 'blue' | 'purple' | 'green' | 'red' | 'slate' | 'orange';
}

/**
 * Canonical status labels map - single source of truth for all UI labels
 */
export const STATUS_LABELS: Record<RequestStatus, StatusLabelConfig> = {
  draft: {
    label: 'Draft',
    labelAr: 'مسودة',
    description: 'Not yet submitted',
    descriptionAr: 'لم يتم الإرسال بعد',
    waitingOn: 'employee',
    slaPaused: true,
    colorToken: 'slate',
  },
  submitted: {
    label: 'Submitted',
    labelAr: 'تم الإرسال',
    description: 'Submitted and awaiting HR review',
    descriptionAr: 'تم الإرسال وفي انتظار مراجعة الموارد البشرية',
    waitingOn: 'hr',
    slaPaused: false,
    colorToken: 'amber',
  },
  pending: {
    label: 'Pending Review',
    labelAr: 'في انتظار المراجعة',
    description: 'In queue for HR review',
    descriptionAr: 'في قائمة انتظار مراجعة الموارد البشرية',
    waitingOn: 'hr',
    slaPaused: false,
    colorToken: 'amber',
  },
  pending_employee: {
    label: 'Awaiting Your Response',
    labelAr: 'في انتظار ردك',
    description: 'HR has requested additional information from you',
    descriptionAr: 'طلبت الموارد البشرية معلومات إضافية منك',
    waitingOn: 'employee',
    slaPaused: true,
    colorToken: 'purple',
  },
  info_requested: {
    label: 'Info Requested',
    labelAr: 'طلب معلومات',
    description: 'Additional documents or information needed from you',
    descriptionAr: 'مطلوب منك مستندات أو معلومات إضافية',
    waitingOn: 'employee',
    slaPaused: true,
    colorToken: 'purple',
  },
  in_review: {
    label: 'Under Review',
    labelAr: 'قيد المراجعة',
    description: 'HR is actively reviewing your request',
    descriptionAr: 'الموارد البشرية تراجع طلبك حاليا',
    waitingOn: 'hr',
    slaPaused: false,
    colorToken: 'blue',
  },
  escalated: {
    label: 'Escalated',
    labelAr: 'تم التصعيد',
    description: 'Escalated for additional approval',
    descriptionAr: 'تم التصعيد للموافقة الإضافية',
    waitingOn: 'hr',
    slaPaused: false,
    colorToken: 'orange',
  },
  approved: {
    label: 'Approved',
    labelAr: 'تمت الموافقة',
    description: 'Your request has been approved',
    descriptionAr: 'تمت الموافقة على طلبك',
    waitingOn: 'system',
    slaPaused: true,
    colorToken: 'green',
  },
  ready_for_payment: {
    label: 'Ready for Payment',
    labelAr: 'جاهز للدفع',
    description: 'Approved and queued for payment processing',
    descriptionAr: 'تمت الموافقة عليه وفي انتظار معالجة الدفع',
    waitingOn: 'system',
    slaPaused: true,
    colorToken: 'green',
  },
  rejected: {
    label: 'Rejected',
    labelAr: 'مرفوض',
    description: 'Your request was not approved',
    descriptionAr: 'لم تتم الموافقة على طلبك',
    waitingOn: 'none',
    slaPaused: true,
    colorToken: 'red',
  },
  paid: {
    label: 'Paid',
    labelAr: 'تم الدفع',
    description: 'Payment has been processed',
    descriptionAr: 'تمت معالجة الدفع',
    waitingOn: 'none',
    slaPaused: true,
    colorToken: 'green',
  },
  closed: {
    label: 'Closed',
    labelAr: 'مغلق',
    description: 'Request is complete and closed',
    descriptionAr: 'الطلب مكتمل ومغلق',
    waitingOn: 'none',
    slaPaused: true,
    colorToken: 'slate',
  },
  cancelled: {
    label: 'Cancelled',
    labelAr: 'ملغى',
    description: 'Request was cancelled',
    descriptionAr: 'تم إلغاء الطلب',
    waitingOn: 'none',
    slaPaused: true,
    colorToken: 'slate',
  },
};

// =============================================================================
// STATUS HELPERS
// =============================================================================

/**
 * Get status label configuration
 */
export function getStatusConfig(status: RequestStatus | string | null): StatusLabelConfig {
  if (!status || !(status in STATUS_LABELS)) {
    return STATUS_LABELS.draft;
  }
  return STATUS_LABELS[status as RequestStatus];
}

/**
 * Get the canonical display label for a status
 */
export function getCanonicalStatusLabel(status: RequestStatus | string | null, isArabic = false): string {
  const config = getStatusConfig(status);
  return isArabic ? config.labelAr : config.label;
}

/**
 * Get status description
 */
export function getStatusDescription(status: RequestStatus | string | null, isArabic = false): string {
  const config = getStatusConfig(status);
  return isArabic ? config.descriptionAr : config.description;
}

/**
 * Check if SLA should be paused for this status
 * SLA is paused when waiting on employee action
 */
export function isSlaPaused(status: RequestStatus | string | null): boolean {
  const config = getStatusConfig(status);
  return config.slaPaused;
}

/**
 * Get who the request is waiting on
 */
export function getWaitingOnActor(status: RequestStatus | string | null): 'employee' | 'hr' | 'system' | 'none' {
  const config = getStatusConfig(status);
  return config.waitingOn;
}

/**
 * Get user-friendly waiting-on message
 */
export function getWaitingOnMessage(status: RequestStatus | string | null, isArabic = false): string | null {
  const actor = getWaitingOnActor(status);
  
  const messages = {
    employee: {
      en: 'Waiting on: You',
      ar: 'في انتظار: أنت',
    },
    hr: {
      en: 'Waiting on: HR',
      ar: 'في انتظار: الموارد البشرية',
    },
    system: {
      en: 'Waiting on: System processing',
      ar: 'في انتظار: معالجة النظام',
    },
    none: null,
  };
  
  const msg = messages[actor];
  if (!msg) return null;
  return isArabic ? msg.ar : msg.en;
}

/**
 * Get the HR-facing waiting-on message (inverse of employee)
 */
export function getHRWaitingOnMessage(status: RequestStatus | string | null, isArabic = false): string | null {
  const actor = getWaitingOnActor(status);
  
  const messages = {
    employee: {
      en: 'Waiting on: Employee',
      ar: 'في انتظار: الموظف',
    },
    hr: {
      en: 'Waiting on: HR Team',
      ar: 'في انتظار: فريق الموارد البشرية',
    },
    system: {
      en: 'Processing',
      ar: 'قيد المعالجة',
    },
    none: null,
  };
  
  const msg = messages[actor];
  if (!msg) return null;
  return isArabic ? msg.ar : msg.en;
}

// =============================================================================
// STATUS GROUPS (for filtering)
// =============================================================================

export const EMPLOYEE_ACTION_STATUSES: RequestStatus[] = ['draft', 'pending_employee', 'info_requested'];
export const HR_ACTION_STATUSES: RequestStatus[] = ['submitted', 'pending', 'in_review', 'escalated'];
export const SLA_PAUSED_STATUSES: RequestStatus[] = ['draft', 'pending_employee', 'info_requested', 'approved', 'ready_for_payment', 'rejected', 'paid', 'closed', 'cancelled'];
export const TERMINAL_STATUSES: RequestStatus[] = ['closed', 'cancelled'];
export const COMPLETED_STATUSES: RequestStatus[] = ['approved', 'ready_for_payment', 'paid', 'closed'];
export const SETTLEMENT_STATUSES: RequestStatus[] = ['approved', 'ready_for_payment', 'paid'];

/**
 * Check if status is actionable by employee
 */
export function isEmployeeActionable(status: RequestStatus | string | null): boolean {
  return EMPLOYEE_ACTION_STATUSES.includes(status as RequestStatus);
}

/**
 * Check if status is actionable by HR
 */
export function isHRActionable(status: RequestStatus | string | null): boolean {
  return HR_ACTION_STATUSES.includes(status as RequestStatus);
}

/**
 * Check if status is terminal (no further actions)
 */
export function isTerminal(status: RequestStatus | string | null): boolean {
  return TERMINAL_STATUSES.includes(status as RequestStatus);
}
