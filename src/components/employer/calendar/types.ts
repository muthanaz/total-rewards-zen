/**
 * Calendar Module Types
 * 
 * Operational calendar with event taxonomy and linked tasks.
 */

export type EventType = 
  | 'payroll_cutoff'
  | 'policy_renewal'
  | 'settlement_export'
  | 'open_enrollment'
  | 'vendor_contract';

export type EventStatus = 'upcoming' | 'due_today' | 'overdue' | 'completed';

export interface EventOwner {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface LinkedAction {
  id: string;
  title: string;
  route: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface ChecklistStep {
  id: string;
  title: string;
  responsible: EventOwner;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  dueDate?: Date;
  notes?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  type: EventType;
  date: Date;
  status: EventStatus;
  owner: EventOwner;
  linkedAction?: LinkedAction;
  checklist?: ChecklistStep[];
  recurrence?: 'once' | 'monthly' | 'quarterly' | 'annually';
  priority: 'critical' | 'high' | 'medium' | 'low';
  reminderSent?: boolean;
}

export interface CalendarFilters {
  types: EventType[];
  status: EventStatus[];
  owner?: string;
  dateRange: {
    start: Date;
    end: Date;
  };
}

export const EVENT_TYPE_CONFIG: Record<EventType, {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
}> = {
  payroll_cutoff: {
    label: 'Payroll Cutoff',
    icon: 'Wallet',
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
  },
  policy_renewal: {
    label: 'Policy Renewal',
    icon: 'FileText',
    color: 'text-purple-600',
    bgColor: 'bg-purple-500/10',
  },
  settlement_export: {
    label: 'Settlement Export',
    icon: 'Download',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500/10',
  },
  open_enrollment: {
    label: 'Open Enrollment',
    icon: 'Users',
    color: 'text-amber-600',
    bgColor: 'bg-amber-500/10',
  },
  vendor_contract: {
    label: 'Vendor Contract',
    icon: 'Building2',
    color: 'text-rose-600',
    bgColor: 'bg-rose-500/10',
  },
};
