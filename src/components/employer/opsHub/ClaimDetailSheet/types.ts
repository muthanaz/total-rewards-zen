/**
 * ClaimDetailSheet Types
 * 
 * Single source of truth for claim review with 4 tabs:
 * Summary, Documents, Decision, Audit Trail
 */

export interface ClaimSummary {
  requestId: string;
  claimRef: string;
  
  // Employee info
  employeeId: string;
  employeeName: string;
  employeeGrade: string;
  employeeCode?: string;
  
  // Claim details
  category: string;
  claimType: string;
  subject: string;
  description?: string;
  
  // Policy reference
  policyId: string | null;
  policyRef: string | null;
  policyVersionId: string | null;
  
  // Amounts
  amountClaimed: number | null;
  currency: string;
  eligibleAmount: number | null;
  remainingEntitlement: number | null;
  employeeCopay: number | null;
  payableAmount: number | null;
  
  // Status
  status: string;
  isPaused: boolean;
  slaDueAt: string | null;
  
  // Metadata
  submittedAt: string;
  createdAt: string;
  assignedTo: string | null;
  assignedToName: string | null;
}

export interface ClaimDocument {
  id: string;
  docType: string;
  docName: string;
  isRequired: boolean;
  status: 'missing' | 'pending' | 'verified' | 'rejected';
  fileUrl: string | null;
  uploadedAt: string | null;
  uploadedBy: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  reviewerNotes: string | null;
}

export interface DecisionPayload {
  action: 'approve' | 'reject' | 'request_info';
  reasonCode: string;
  reasonText: string;
  missingItems?: string[];
  messageToEmployee?: string;
  overrideCode?: string;
}

export interface AuditEvent {
  id: string;
  action: string;
  actorName: string;
  actorRole: string;
  fromStatus: string | null;
  toStatus: string | null;
  timestamp: string;
  notes: string | null;
  isEmployeeVisible: boolean;
}

export type ClaimDetailTab = 'summary' | 'documents' | 'decision' | 'audit';

export interface SettlementReadiness {
  ready: boolean;
  checks: {
    check: string;
    pass: boolean;
    value?: any;
    required?: any;
  }[];
}
