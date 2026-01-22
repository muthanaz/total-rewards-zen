/**
 * Request Documents Hook (policy-driven checklist snapshot)
 *
 * Backing table: public.request_documents
 *
 * For the Health vertical slice, this is the source of truth for the employee
 * and employer document checklist (required docs + uploads/status).
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type RequestDocumentStatus = 'provided' | 'missing' | 'rejected' | 'pending_review';

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
  // Snapshot fields
  source_doc_id: string | null;
  derivation_reason: string | null;
  // Verification fields
  verified_by: string | null;
  verified_at: string | null;
  rejection_reason: string | null;
}

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

export function useRequestDocumentCounts(requestId: string | null, enabled: boolean = true) {
  const { data: docs = [] } = useRequestDocuments(requestId, enabled);
  return {
    total: docs.length,
    provided: docs.filter((d) => d.status === 'provided').length,
    missing: docs.filter((d) => d.status === 'missing').length,
    rejected: docs.filter((d) => d.status === 'rejected').length,
    pending: docs.filter((d) => d.status === 'pending_review').length,
  };
}

/**
 * Employee-side upload is modeled as updating the existing checklist row.
 * (This hook does not do binary uploads; it stores the resulting URL.)
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
    },
  });
}

/**
 * Employer verifies a document as received/acceptable
 */
export function useVerifyRequestDocument() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ docId }: { docId: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('request_documents')
        .update({
          status: 'provided',
          verified_by: user.id,
          verified_at: new Date().toISOString(),
          rejection_reason: null,
        })
        .eq('id', docId)
        .select('id, request_id')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['request_documents', data.request_id] });
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
        })
        .eq('id', docId)
        .select('id, request_id')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['request_documents', data.request_id] });
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
    },
  });
}
