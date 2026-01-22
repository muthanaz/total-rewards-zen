/**
 * Checklist Snapshot Generator
 *
 * Creates a frozen snapshot of required documents at submission time.
 * This ensures policy edits don't rewrite history.
 */

import type { PolicyRequiredDoc } from '@/hooks/usePolicyDrivenSubmission';
import type { EmployeeContext } from '@/lib/policyEngine';

export interface ChecklistSnapshotDoc {
  doc_type: string;
  doc_name: string;
  is_required: boolean;
  required_for: 'claim' | 'request' | 'both';
  derivation_reason: string;
  source_doc_id: string | null;
}

export interface ChecklistSnapshot {
  policy_id: string;
  policy_version_id: string;
  policy_ref: string;
  transaction_type: 'claim' | 'request';
  generated_at: string;
  employee_context: {
    grade: string | null;
    department: string | null;
    location: string | null;
    tenure_months: number;
  };
  documents: ChecklistSnapshotDoc[];
  total_required: number;
  total_optional: number;
}

/**
 * Generate checklist snapshot from policy required docs and employee context
 */
export function generateChecklistSnapshot(
  policy: {
    policyId: string;
    policyVersionId: string;
    policyRef: string;
    requiredDocs: PolicyRequiredDoc[];
  },
  transactionType: 'claim' | 'request',
  employeeContext: EmployeeContext | null
): ChecklistSnapshot {
  const now = new Date().toISOString();

  // Filter docs applicable to this transaction type
  const applicableDocs = policy.requiredDocs.filter(
    (d) => d.transaction_type === transactionType || d.transaction_type === 'both'
  );

  const documents: ChecklistSnapshotDoc[] = applicableDocs.map((doc) => ({
    doc_type: doc.doc_type,
    doc_name: doc.doc_name,
    is_required: doc.is_required,
    required_for: doc.transaction_type as 'claim' | 'request' | 'both',
    derivation_reason: doc.is_required
      ? `Required by policy ${policy.policyRef} for ${transactionType}`
      : `Optional per policy ${policy.policyRef}`,
    source_doc_id: doc.id,
  }));

  return {
    policy_id: policy.policyId,
    policy_version_id: policy.policyVersionId,
    policy_ref: policy.policyRef,
    transaction_type: transactionType,
    generated_at: now,
    employee_context: {
      grade: employeeContext?.grade || null,
      department: employeeContext?.department || null,
      location: employeeContext?.location || null,
      tenure_months: employeeContext?.tenure_months || 0,
    },
    documents,
    total_required: documents.filter((d) => d.is_required).length,
    total_optional: documents.filter((d) => !d.is_required).length,
  };
}

/**
 * Convert snapshot to request_documents insert rows
 */
export function snapshotToRequestDocuments(
  requestId: string,
  snapshot: ChecklistSnapshot
): Array<{
  request_id: string;
  policy_version_id: string;
  doc_type: string;
  doc_name: string;
  required_for: string;
  is_required: boolean;
  status: 'missing';
  source_doc_id: string | null;
  derivation_reason: string;
}> {
  return snapshot.documents.map((doc) => ({
    request_id: requestId,
    policy_version_id: snapshot.policy_version_id,
    doc_type: doc.doc_type,
    doc_name: doc.doc_name,
    required_for: doc.required_for,
    is_required: doc.is_required,
    status: 'missing' as const,
    source_doc_id: doc.source_doc_id,
    derivation_reason: doc.derivation_reason,
  }));
}
