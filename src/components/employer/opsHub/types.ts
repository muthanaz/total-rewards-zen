/**
 * Operations Hub Types
 * 
 * Core type definitions for the high-speed workbench.
 */

// Updated tabs: My Queue (default) and All Queue
export type QueueTab = 'my_queue' | 'all_queue';

export type SlaStatus = 'on_track' | 'at_risk' | 'breached';

export interface QueueFilters {
  search: string;
  type: 'all' | 'claim' | 'request';
  category: string;
  slaStatus: 'all' | SlaStatus;
  missingDocs: 'all' | 'has_missing' | 'complete';
  assignedTo: string;
  minAmount?: number;
  maxAmount?: number;
  statusFilter: 'action_required' | 'all'; // New: filter for action-required statuses
}

export interface SlaInfo {
  hoursRemaining: number;
  minutesRemaining: number;
  daysRemaining: number;
  isOverdue: boolean;
  isUrgent: boolean; // < 24h
  isOnTrack: boolean;
  isPaused: boolean;
  displayFormat: string; // Pre-formatted "12h 20m" or "2d 4h"
}

// Blocker types for claims
export type BlockerType = 'missing_docs' | 'policy_mismatch' | 'cap_exceeded' | 'data_missing' | 'unverified_docs';

export interface Blocker {
  type: BlockerType;
  label: string;
  description: string;
  severity: 'warning' | 'error';
  resolutionHint: string;
}

export interface QueueItemRow {
  id: string;
  requestRef: string; // Short display ID
  
  // Employee info
  employeeName: string;
  employeeGrade: string;
  employeeCode?: string;
  
  // Request details
  category: string;
  benefitType: string;
  requestType: 'claim' | 'request';
  subject: string;
  
  // Financial
  amount: number | null;
  capLimit: number | null;
  payableAmount: number | null;
  currency: string;
  
  // Status & SLA
  status: string;
  slaInfo: SlaInfo | null;
  slaDueAt: string | null;
  isPaused: boolean;
  
  // Documents
  hasMissingDocs: boolean;
  missingDocsCount: number;
  missingDocs: string[];
  
  // Blockers
  blockers: Blocker[];
  hasBlockers: boolean;
  
  // Assignment
  assignedTo: string | null;
  assignedToName: string | null;
  
  // Metadata
  submittedAt: string;
  daysInQueue: number;
  priority: 'low' | 'standard' | 'high' | 'urgent';
  
  // Policy link
  policyId: string | null;
  policyRef: string | null;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  activeTasks: number;
}

export interface QueueStats {
  total: number;
  pending: number;
  inReview: number;
  slaAtRisk: number;
  slaBreached: number;
  missingDocs: number;
  highValue: number;
  unassigned: number;
  myQueue: number;
  actionRequired: number;
}

// Inline action types
export type InlineAction = 
  | 'approve'
  | 'reject'
  | 'request_docs'
  | 'assign'
  | 'escalate'
  | 'view_timeline';

export interface ActionResult {
  success: boolean;
  message: string;
  error?: string;
}

// Tab configuration
export interface TabConfig {
  id: QueueTab;
  label: string;
  description: string;
  icon: string;
  filterFn: (item: QueueItemRow) => boolean;
}

// Action-required statuses
export const ACTION_REQUIRED_STATUSES = ['submitted', 'in_review', 'info_requested', 'pending_employee'] as const;

// Format SLA time consistently
export function formatSlaTime(hoursRemaining: number, isPaused: boolean): string {
  if (isPaused) return 'Paused';
  
  const absHours = Math.abs(hoursRemaining);
  const prefix = hoursRemaining < 0 ? '-' : '';
  
  if (absHours < 1) {
    const mins = Math.round(absHours * 60);
    return `${prefix}${mins}m`;
  } else if (absHours < 24) {
    const hours = Math.floor(absHours);
    const mins = Math.round((absHours - hours) * 60);
    return mins > 0 ? `${prefix}${hours}h ${mins}m` : `${prefix}${hours}h`;
  } else {
    const days = Math.floor(absHours / 24);
    const hours = Math.round(absHours % 24);
    return hours > 0 ? `${prefix}${days}d ${hours}h` : `${prefix}${days}d`;
  }
}

// Compute blockers for a claim
export function computeBlockers(
  hasMissingDocs: boolean,
  missingDocs: string[],
  amount: number | null,
  capLimit: number | null,
  payableAmount: number | null,
  policyRef: string | null
): Blocker[] {
  const blockers: Blocker[] = [];
  
  if (hasMissingDocs && missingDocs.length > 0) {
    blockers.push({
      type: 'missing_docs',
      label: 'Missing Documents',
      description: `${missingDocs.length} required document(s) not uploaded`,
      severity: 'warning',
      resolutionHint: 'Request documents from employee or verify uploaded files',
    });
  }
  
  if (amount && capLimit && amount > capLimit) {
    blockers.push({
      type: 'cap_exceeded',
      label: 'Cap Exceeded',
      description: `Claimed amount exceeds policy cap`,
      severity: 'error',
      resolutionHint: 'Adjust payable amount or approve with exception',
    });
  }
  
  if (!policyRef) {
    blockers.push({
      type: 'policy_mismatch',
      label: 'No Policy Linked',
      description: 'Claim is not linked to an active policy',
      severity: 'warning',
      resolutionHint: 'Verify policy applicability before approval',
    });
  }
  
  if (payableAmount === null || payableAmount === undefined) {
    blockers.push({
      type: 'data_missing',
      label: 'Payable Not Computed',
      description: 'Payable amount has not been calculated',
      severity: 'warning',
      resolutionHint: 'Compute payable amount before approval',
    });
  }
  
  return blockers;
}
