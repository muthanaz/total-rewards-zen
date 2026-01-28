/**
 * Operations Hub Types
 * 
 * Core type definitions for the high-speed workbench.
 */

export type QueueTab = 'my_team' | 'pending' | 'in_review' | 'sla_risk' | 'missing_docs' | 'high_value' | 'all';

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
}

export interface SlaInfo {
  hoursRemaining: number;
  daysRemaining: number;
  isOverdue: boolean;
  isUrgent: boolean; // < 24h
  isOnTrack: boolean;
  isPaused: boolean;
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
