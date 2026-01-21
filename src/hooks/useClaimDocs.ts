/**
 * Claim Documents Hook
 * 
 * Manages documents/attachments associated with claims.
 * Used by the ClaimReviewSheet to display and manage document checklist.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ClaimDoc {
  id: string;
  request_id: string;
  doc_type: string;
  doc_name: string;
  file_url: string | null;
  status: 'provided' | 'missing' | 'rejected' | 'pending';
  uploaded_at: string | null;
  uploaded_by: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  reviewer_notes: string | null;
  created_at: string;
}

/**
 * Fetch all documents for a claim
 */
export function useClaimDocs(requestId: string | null) {
  return useQuery({
    queryKey: ['claim_docs', requestId],
    queryFn: async (): Promise<ClaimDoc[]> => {
      if (!requestId) return [];
      
      const { data, error } = await supabase
        .from('claim_docs')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return (data || []) as ClaimDoc[];
    },
    enabled: !!requestId,
  });
}

/**
 * Get document counts for a claim
 */
export function useClaimDocCounts(requestId: string | null) {
  const { data: docs = [] } = useClaimDocs(requestId);
  
  return {
    total: docs.length,
    provided: docs.filter(d => d.status === 'provided').length,
    missing: docs.filter(d => d.status === 'missing').length,
    rejected: docs.filter(d => d.status === 'rejected').length,
    pending: docs.filter(d => d.status === 'pending').length,
  };
}

/**
 * Mark a document as received/provided
 */
export function useMarkDocReceived() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ docId, notes }: { docId: string; notes?: string }) => {
      const { data, error } = await supabase
        .from('claim_docs')
        .update({
          status: 'provided',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
          reviewer_notes: notes,
        })
        .eq('id', docId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['claim_docs', data.request_id] });
    },
  });
}

/**
 * Mark a document as missing
 */
export function useMarkDocMissing() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ docId, notes }: { docId: string; notes?: string }) => {
      const { data, error } = await supabase
        .from('claim_docs')
        .update({
          status: 'missing',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
          reviewer_notes: notes,
        })
        .eq('id', docId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['claim_docs', data.request_id] });
    },
  });
}

/**
 * Create required documents for a claim based on category
 */
export function useCreateRequiredDocs() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      requestId, 
      category 
    }: { 
      requestId: string; 
      category: string;
    }) => {
      const requiredDocs = getRequiredDocsForCategory(category);
      
      const docs = requiredDocs.map(doc => ({
        request_id: requestId,
        doc_type: doc.type,
        doc_name: doc.name,
        status: 'missing' as const,
      }));
      
      const { data, error } = await supabase
        .from('claim_docs')
        .upsert(docs, { onConflict: 'request_id,doc_type' })
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['claim_docs', variables.requestId] });
    },
  });
}

/**
 * Get required documents based on category
 */
export function getRequiredDocsForCategory(category: string): { type: string; name: string }[] {
  const docMap: Record<string, { type: string; name: string }[]> = {
    'Health Insurance': [
      { type: 'receipt', name: 'Medical Receipt/Invoice' },
      { type: 'prescription', name: 'Prescription (if applicable)' },
      { type: 'medical_report', name: 'Medical Report' },
      { type: 'insurance_card', name: 'Insurance Card Copy' },
    ],
    'Education Allowance': [
      { type: 'fee_receipt', name: 'School Fee Receipt' },
      { type: 'enrollment', name: 'Enrollment Confirmation' },
      { type: 'child_birth_cert', name: 'Child Birth Certificate' },
    ],
    'Housing': [
      { type: 'tenancy_contract', name: 'Tenancy Contract' },
      { type: 'payment_receipt', name: 'Rent Payment Receipt' },
      { type: 'ejari', name: 'Ejari Certificate' },
    ],
    'Transport': [
      { type: 'receipt', name: 'Transport Receipt' },
      { type: 'vehicle_reg', name: 'Vehicle Registration (if owned)' },
    ],
    'Learning & Development': [
      { type: 'course_receipt', name: 'Course/Training Receipt' },
      { type: 'completion_cert', name: 'Completion Certificate' },
      { type: 'manager_approval', name: 'Manager Pre-Approval' },
    ],
    'Wellbeing': [
      { type: 'receipt', name: 'Service Receipt' },
      { type: 'membership_card', name: 'Membership Card (if applicable)' },
    ],
    'Leave': [
      { type: 'leave_application', name: 'Leave Application Form' },
      { type: 'medical_cert', name: 'Medical Certificate (if sick leave)' },
    ],
    'Per Diem': [
      { type: 'travel_approval', name: 'Travel Pre-Approval' },
      { type: 'boarding_pass', name: 'Boarding Passes' },
      { type: 'hotel_invoice', name: 'Hotel Invoice' },
    ],
  };
  
  return docMap[category] || [
    { type: 'receipt', name: 'Payment Receipt' },
    { type: 'supporting_doc', name: 'Supporting Documentation' },
  ];
}
