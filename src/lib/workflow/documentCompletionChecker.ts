/**
 * Document Completion Checker
 * 
 * Utilities for checking document completeness and triggering
 * automatic status transitions when all required documents are verified.
 */

import { RequestDocumentStatus } from '@/hooks/useRequestDocuments';

// ============================================================================
// TYPES
// ============================================================================

export interface DocumentChecklistItem {
  id: string;
  doc_type: string;
  doc_name: string;
  is_required: boolean;
  status: RequestDocumentStatus;
  file_url: string | null;
}

export interface DocumentCompletionResult {
  isComplete: boolean;
  totalRequired: number;
  totalVerified: number;
  totalPendingReview: number;
  totalMissing: number;
  totalRejected: number;
  missingDocNames: string[];
  pendingDocNames: string[];
  rejectedDocNames: string[];
  completionPercent: number;
  canAutoTransition: boolean;
  suggestedStatus: 'pending' | 'pending_employee' | null;
}

// ============================================================================
// COMPLETION CHECKING
// ============================================================================

/**
 * Check if all required documents are complete (verified or waived)
 */
export function areAllRequiredDocsComplete(documents: DocumentChecklistItem[]): boolean {
  const required = documents.filter(d => d.is_required);
  
  if (required.length === 0) return true;
  
  return required.every(doc => 
    doc.status === 'verified' || 
    doc.status === 'provided' || 
    doc.status === 'waived'
  );
}

/**
 * Check if all required documents are at least uploaded (pending review or verified)
 */
export function areAllRequiredDocsUploaded(documents: DocumentChecklistItem[]): boolean {
  const required = documents.filter(d => d.is_required);
  
  if (required.length === 0) return true;
  
  return required.every(doc => 
    doc.status === 'verified' || 
    doc.status === 'provided' || 
    doc.status === 'pending_review' ||
    doc.status === 'waived'
  );
}

/**
 * Check if any required documents are still missing
 */
export function hasAnyMissingDocs(documents: DocumentChecklistItem[]): boolean {
  return documents.some(d => d.is_required && d.status === 'missing');
}

/**
 * Check if any documents were rejected and need re-upload
 */
export function hasAnyRejectedDocs(documents: DocumentChecklistItem[]): boolean {
  return documents.some(d => d.status === 'rejected');
}

/**
 * Get comprehensive document completion status
 */
export function getDocumentCompletionStatus(
  documents: DocumentChecklistItem[],
  currentRequestStatus: string | null
): DocumentCompletionResult {
  const required = documents.filter(d => d.is_required);
  const verified = required.filter(d => d.status === 'verified' || d.status === 'provided' || d.status === 'waived');
  const pendingReview = required.filter(d => d.status === 'pending_review');
  const missing = required.filter(d => d.status === 'missing');
  const rejected = required.filter(d => d.status === 'rejected');

  const totalRequired = required.length;
  const totalVerified = verified.length;
  const totalPendingReview = pendingReview.length;
  const totalMissing = missing.length;
  const totalRejected = rejected.length;

  const isComplete = totalRequired === 0 || (totalMissing === 0 && totalRejected === 0 && totalPendingReview === 0);
  const completionPercent = totalRequired > 0 
    ? Math.round((totalVerified / totalRequired) * 100)
    : 100;

  // Determine if we can auto-transition
  let canAutoTransition = false;
  let suggestedStatus: 'pending' | 'pending_employee' | null = null;

  // If request is pending_employee and all docs are now verified, suggest moving to pending
  if (
    (currentRequestStatus === 'pending_employee' || currentRequestStatus === 'info_requested') &&
    isComplete
  ) {
    canAutoTransition = true;
    suggestedStatus = 'pending';
  }

  // If there are missing or rejected docs, suggest pending_employee
  if (totalMissing > 0 || totalRejected > 0) {
    suggestedStatus = 'pending_employee';
  }

  return {
    isComplete,
    totalRequired,
    totalVerified,
    totalPendingReview,
    totalMissing,
    totalRejected,
    missingDocNames: missing.map(d => d.doc_name),
    pendingDocNames: pendingReview.map(d => d.doc_name),
    rejectedDocNames: rejected.map(d => d.doc_name),
    completionPercent,
    canAutoTransition,
    suggestedStatus,
  };
}

// ============================================================================
// STATUS DESCRIPTIONS
// ============================================================================

/**
 * Get human-readable description of document status
 */
export function getDocumentStatusDescription(
  result: DocumentCompletionResult,
  isArabic: boolean = false
): string {
  if (result.isComplete) {
    return isArabic ? 'جميع المستندات المطلوبة مكتملة' : 'All required documents complete';
  }

  if (result.totalMissing > 0) {
    return isArabic 
      ? `${result.totalMissing} مستند(ات) مفقودة`
      : `${result.totalMissing} document(s) missing`;
  }

  if (result.totalRejected > 0) {
    return isArabic
      ? `${result.totalRejected} مستند(ات) مرفوضة - يرجى إعادة الرفع`
      : `${result.totalRejected} document(s) rejected - please re-upload`;
  }

  if (result.totalPendingReview > 0) {
    return isArabic
      ? `${result.totalPendingReview} مستند(ات) قيد المراجعة`
      : `${result.totalPendingReview} document(s) pending review`;
  }

  return isArabic ? 'قيد التحقق' : 'Verification in progress';
}

/**
 * Get action needed from employee perspective
 */
export function getEmployeeDocumentAction(
  result: DocumentCompletionResult,
  isArabic: boolean = false
): string | null {
  if (result.isComplete) return null;

  if (result.totalMissing > 0) {
    return isArabic
      ? `يرجى رفع: ${result.missingDocNames.join(', ')}`
      : `Please upload: ${result.missingDocNames.join(', ')}`;
  }

  if (result.totalRejected > 0) {
    return isArabic
      ? `يرجى إعادة رفع: ${result.rejectedDocNames.join(', ')}`
      : `Please re-upload: ${result.rejectedDocNames.join(', ')}`;
  }

  return null;
}

/**
 * Get action needed from employer perspective
 */
export function getEmployerDocumentAction(
  result: DocumentCompletionResult,
  isArabic: boolean = false
): string | null {
  if (result.totalPendingReview > 0) {
    return isArabic
      ? `${result.totalPendingReview} مستند(ات) تنتظر المراجعة`
      : `${result.totalPendingReview} document(s) awaiting review`;
  }

  if (result.canAutoTransition) {
    return isArabic
      ? 'جميع المستندات تم التحقق منها - جاهز للمعالجة'
      : 'All documents verified - ready to process';
  }

  return null;
}

// ============================================================================
// DOCUMENT PRIORITY
// ============================================================================

/**
 * Get documents sorted by priority (missing first, then rejected, then pending)
 */
export function getDocumentsByPriority(documents: DocumentChecklistItem[]): DocumentChecklistItem[] {
  const priorityOrder: Record<RequestDocumentStatus, number> = {
    missing: 1,
    rejected: 2,
    pending_review: 3,
    pending: 4,
    provided: 5,
    verified: 6,
    waived: 7,
  };

  return [...documents].sort((a, b) => {
    // Required docs first
    if (a.is_required !== b.is_required) {
      return a.is_required ? -1 : 1;
    }
    // Then by status priority
    return priorityOrder[a.status] - priorityOrder[b.status];
  });
}
