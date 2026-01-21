/**
 * Claim Actions Hook
 * 
 * Provides mutations for all claim processing actions:
 * - Approve, Reject, Request Info, Assign, Escalate
 * 
 * All actions persist to Supabase and trigger audit trail entries.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { REQUEST_STATUSES } from '@/lib/crossPortalContract';

interface ActionResult {
  success: boolean;
  requestId: string;
  newStatus: string;
}

/**
 * Approve a claim
 */
export function useApproveClaim() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ 
      requestId, 
      reviewerNotes,
      internalNotes,
    }: { 
      requestId: string; 
      reviewerNotes?: string;
      internalNotes?: string;
    }): Promise<ActionResult> => {
      const { data, error } = await supabase
        .from('requests')
        .update({
          status: REQUEST_STATUSES.APPROVED,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
          reviewer_notes: reviewerNotes || 'Approved',
        })
        .eq('id', requestId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Add internal note if provided
      if (internalNotes && user?.id) {
        await supabase.from('claim_notes').insert({
          request_id: requestId,
          note: internalNotes,
          is_internal: true,
          created_by: user.id,
        });
      }
      
      return { success: true, requestId, newStatus: REQUEST_STATUSES.APPROVED };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared_requests'] });
      queryClient.invalidateQueries({ queryKey: ['shared_request'] });
      queryClient.invalidateQueries({ queryKey: ['claim_notes'] });
    },
  });
}

/**
 * Reject a claim
 */
export function useRejectClaim() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ 
      requestId, 
      reason,
      reviewerNotes,
      internalNotes,
    }: { 
      requestId: string; 
      reason: string;
      reviewerNotes?: string;
      internalNotes?: string;
    }): Promise<ActionResult> => {
      const fullNotes = `Rejected: ${reason}${reviewerNotes ? `. ${reviewerNotes}` : ''}`;
      
      const { data, error } = await supabase
        .from('requests')
        .update({
          status: REQUEST_STATUSES.REJECTED,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
          reviewer_notes: fullNotes,
        })
        .eq('id', requestId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Add internal note if provided
      if (internalNotes && user?.id) {
        await supabase.from('claim_notes').insert({
          request_id: requestId,
          note: internalNotes,
          is_internal: true,
          created_by: user.id,
        });
      }
      
      return { success: true, requestId, newStatus: REQUEST_STATUSES.REJECTED };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared_requests'] });
      queryClient.invalidateQueries({ queryKey: ['shared_request'] });
      queryClient.invalidateQueries({ queryKey: ['claim_notes'] });
    },
  });
}

/**
 * Request additional information/documents
 */
export function useRequestInfo() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ 
      requestId, 
      requestedInfo,
      missingDocs,
      internalNotes,
    }: { 
      requestId: string; 
      requestedInfo: string;
      missingDocs?: string[];
      internalNotes?: string;
    }): Promise<ActionResult> => {
      // Update request status and missing docs
      const updateData: Record<string, unknown> = {
        status: REQUEST_STATUSES.IN_REVIEW,
        reviewer_notes: `Information requested: ${requestedInfo}`,
      };
      
      if (missingDocs && missingDocs.length > 0) {
        updateData.missing_docs = missingDocs;
      }
      
      const { data, error } = await supabase
        .from('requests')
        .update(updateData)
        .eq('id', requestId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Add event with employee-visible notes
      await supabase.from('request_events').insert({
        request_id: requestId,
        actor_user_id: user?.id || '',
        to_status: REQUEST_STATUSES.IN_REVIEW,
        action: 'info_requested',
        notes_employee_visible: requestedInfo,
        notes_internal: internalNotes || null,
        meta: { missing_docs: missingDocs },
      });
      
      // Create missing doc entries if specified
      if (missingDocs && missingDocs.length > 0) {
        const docEntries = missingDocs.map(docName => ({
          request_id: requestId,
          doc_type: docName.toLowerCase().replace(/\s+/g, '_'),
          doc_name: docName,
          status: 'missing' as const,
        }));
        
        await supabase.from('claim_docs').upsert(docEntries, { 
          onConflict: 'request_id,doc_type',
          ignoreDuplicates: true 
        });
      }
      
      return { success: true, requestId, newStatus: REQUEST_STATUSES.IN_REVIEW };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared_requests'] });
      queryClient.invalidateQueries({ queryKey: ['shared_request'] });
      queryClient.invalidateQueries({ queryKey: ['claim_docs'] });
      queryClient.invalidateQueries({ queryKey: ['request_timeline'] });
    },
  });
}

/**
 * Assign a claim to a team member
 */
export function useAssignClaim() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ 
      requestId, 
      assigneeId,
      assigneeName,
      notes,
    }: { 
      requestId: string; 
      assigneeId: string;
      assigneeName?: string;
      notes?: string;
    }): Promise<ActionResult> => {
      const { data, error } = await supabase
        .from('requests')
        .update({
          assigned_to: assigneeId,
          assigned_to_user_id: assigneeId,
        })
        .eq('id', requestId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Add audit event
      await supabase.from('request_events').insert({
        request_id: requestId,
        actor_user_id: user?.id || '',
        to_status: data.status || 'in_review',
        action: 'assigned',
        meta: { 
          assignee_id: assigneeId, 
          assignee_name: assigneeName,
          notes 
        },
      });
      
      return { success: true, requestId, newStatus: data.status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared_requests'] });
      queryClient.invalidateQueries({ queryKey: ['shared_request'] });
      queryClient.invalidateQueries({ queryKey: ['request_timeline'] });
    },
  });
}

/**
 * Escalate a claim
 */
export function useEscalateClaim() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ 
      requestId, 
      escalationReason,
      priority = 'high',
    }: { 
      requestId: string; 
      escalationReason: string;
      priority?: 'high' | 'urgent';
    }): Promise<ActionResult> => {
      const { data, error } = await supabase
        .from('requests')
        .update({
          priority,
          escalated_at: new Date().toISOString(),
          escalation_reason: escalationReason,
        })
        .eq('id', requestId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Add audit event
      await supabase.from('request_events').insert({
        request_id: requestId,
        actor_user_id: user?.id || '',
        to_status: data.status || 'in_review',
        action: 'escalated',
        meta: { 
          reason: escalationReason, 
          priority,
        },
      });
      
      return { success: true, requestId, newStatus: data.status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared_requests'] });
      queryClient.invalidateQueries({ queryKey: ['shared_request'] });
      queryClient.invalidateQueries({ queryKey: ['request_timeline'] });
    },
  });
}

/**
 * Combined hook with all actions
 */
export function useClaimActions() {
  const approve = useApproveClaim();
  const reject = useRejectClaim();
  const requestInfo = useRequestInfo();
  const assign = useAssignClaim();
  const escalate = useEscalateClaim();
  
  return {
    approve,
    reject,
    requestInfo,
    assign,
    escalate,
    isLoading: approve.isPending || reject.isPending || requestInfo.isPending || assign.isPending || escalate.isPending,
  };
}
