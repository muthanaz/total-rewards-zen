/**
 * Request Documents Hook (Unified Document Model)
 *
 * Backing table: public.request_documents
 * 
 * This is the SINGLE SOURCE OF TRUTH for all document checklists.
 * Supports all transaction models: request_only, claim_only, request_and_claim.
 * 
 * Status lifecycle:
 * - missing: Document not yet uploaded
 * - pending_review: Employee uploaded, awaiting employer review
 * - provided: Employer verified as acceptable (legacy compat)
 * - verified: Employer verified as acceptable
 * - rejected: Employer rejected with reason
 * - waived: Employer waived requirement
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// =============================================================================
// TYPES
// =============================================================================

export type RequestDocumentStatus = 
  | 'pending'
  | 'missing' 
  | 'pending_review' 
  | 'provided' 
  | 'verified'
  | 'rejected' 
  | 'waived';

export interface RequestDocument {
  id: string;
  request_id: string;
  policy_version_id: string | null;
  doc_type: string;
  doc_name: string;
  required_for: string | null;
  is_required: boolean;
  status: RequestDocumentStatus;
  file_url: string | null;
  uploaded_at: string | null;
  uploaded_by: string | null;
  reviewer_notes: string | null;
  created_at: string;
  updated_at: string;
  // Snapshot fields (from policy at submission time)
  source_doc_id: string | null;
  derivation_reason: string | null;
  // Verification fields
  verified_by: string | null;
  verified_at: string | null;
  rejection_reason: string | null;
  decision_reason: string | null;
}

export interface DocumentCounts {
  total: number;
  required: number;
  provided: number;
  verified: number;
  missing: number;
  rejected: number;
  pending_review: number;
  waived: number;
  allRequiredComplete: boolean;
}

// =============================================================================
// QUERY HOOKS
// =============================================================================

/**
 * Fetch all documents for a request
 */
export function useRequestDocuments(requestId: string | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ['request_documents', requestId],
    queryFn: async (): Promise<RequestDocument[]> => {
      if (!requestId) return [];
      const { data, error } = await supabase
        .from('request_documents')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []) as RequestDocument[];
    },
    enabled: !!requestId && enabled,
  });
}

/**
 * Get document counts for a request
 */
export function useRequestDocumentCounts(requestId: string | null, enabled: boolean = true): DocumentCounts {
  const { data: docs = [] } = useRequestDocuments(requestId, enabled);
  
  const required = docs.filter((d) => d.is_required);
  const provided = docs.filter((d) => d.status === 'provided' || d.status === 'verified');
  const missingRequired = required.filter((d) => d.status === 'missing');
  
  return {
    total: docs.length,
    required: required.length,
    provided: provided.length,
    verified: docs.filter((d) => d.status === 'verified').length,
    missing: docs.filter((d) => d.status === 'missing').length,
    rejected: docs.filter((d) => d.status === 'rejected').length,
    pending_review: docs.filter((d) => d.status === 'pending_review').length,
    waived: docs.filter((d) => d.status === 'waived').length,
    allRequiredComplete: missingRequired.length === 0,
  };
}

// =============================================================================
// EMPLOYEE MUTATIONS
// =============================================================================

/**
 * Employee uploads a document (updates existing checklist row with file URL)
 */
export function useUploadRequestDocument() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ docId, fileUrl }: { docId: string; fileUrl: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('request_documents')
        .update({
          status: 'pending_review',
          file_url: fileUrl,
          uploaded_at: new Date().toISOString(),
          uploaded_by: user.id,
        })
        .eq('id', docId)
        .select('id, request_id')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['request_documents', data.request_id] });
      queryClient.invalidateQueries({ queryKey: ['employee_requests'] });
    },
  });
}

// =============================================================================
// EMPLOYER MUTATIONS
// =============================================================================

/**
 * Employer verifies a document as received/acceptable
 */
export function useVerifyRequestDocument() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ docId, notes }: { docId: string; notes?: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('request_documents')
        .update({
          status: 'verified',
          verified_by: user.id,
          verified_at: new Date().toISOString(),
          rejection_reason: null,
          decision_reason: notes || null,
          reviewer_notes: notes || null,
        })
        .eq('id', docId)
        .select('id, request_id')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['request_documents', data.request_id] });
      queryClient.invalidateQueries({ queryKey: ['claims'] });
    },
  });
}

/**
 * Employer rejects a document with a reason
 */
export function useRejectRequestDocument() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ docId, reason }: { docId: string; reason: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('request_documents')
        .update({
          status: 'rejected',
          verified_by: user.id,
          verified_at: new Date().toISOString(),
          rejection_reason: reason,
          decision_reason: reason,
        })
        .eq('id', docId)
        .select('id, request_id')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['request_documents', data.request_id] });
      queryClient.invalidateQueries({ queryKey: ['claims'] });
    },
  });
}

/**
 * Employer waives a document requirement
 */
export function useWaiveRequestDocument() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ docId, reason }: { docId: string; reason: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('request_documents')
        .update({
          status: 'waived',
          verified_by: user.id,
          verified_at: new Date().toISOString(),
          decision_reason: reason,
        })
        .eq('id', docId)
        .select('id, request_id')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['request_documents', data.request_id] });
      queryClient.invalidateQueries({ queryKey: ['claims'] });
    },
  });
}

/**
 * Employer marks a document as missing (request employee to upload)
 */
export function useRequestDocumentUpload() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ docId, notes }: { docId: string; notes?: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('request_documents')
        .update({
          status: 'missing',
          file_url: null,
          uploaded_at: null,
          uploaded_by: null,
          reviewer_notes: notes || 'Please upload this document',
        })
        .eq('id', docId)
        .select('id, request_id')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['request_documents', data.request_id] });
      queryClient.invalidateQueries({ queryKey: ['claims'] });
    },
  });
}

// =============================================================================
// BULK OPERATIONS
// =============================================================================

/**
 * Verify all pending_review documents for a request
 */
export function useBulkVerifyDocuments() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ requestId }: { requestId: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('request_documents')
        .update({
          status: 'verified',
          verified_by: user.id,
          verified_at: new Date().toISOString(),
        })
        .eq('request_id', requestId)
        .eq('status', 'pending_review')
        .select('id');

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { requestId }) => {
      queryClient.invalidateQueries({ queryKey: ['request_documents', requestId] });
      queryClient.invalidateQueries({ queryKey: ['claims'] });
    },
  });
}

// =============================================================================
// DEPRECATED COMPATIBILITY LAYER
// =============================================================================

/**
 * @deprecated Use useRequestDocuments instead
 * Compatibility alias for legacy claim_docs hook
 */
export const useClaimDocs = useRequestDocuments;

/**
 * @deprecated Use useRequestDocumentCounts instead
 * Compatibility alias for legacy claim_docs counts
 */
export function useClaimDocCounts(requestId: string | null) {
  const counts = useRequestDocumentCounts(requestId);
  return {
    total: counts.total,
    provided: counts.provided + counts.verified,
    missing: counts.missing,
    rejected: counts.rejected,
    pending: counts.pending_review,
  };
}

/**
 * @deprecated Use useVerifyRequestDocument instead
 */
export const useMarkDocReceived = useVerifyRequestDocument;

/**
 * @deprecated Use useRequestDocumentUpload instead
 */
export const useMarkDocMissing = useRequestDocumentUpload;
