/**
 * Claim Actions Hook
 * 
 * Provides mutations for all claim processing actions:
 * - Approve, Reject, Request Info, Assign, Escalate, Mark In Review, Mark Paid, Log View
 * 
 * All actions persist to Supabase and trigger audit trail entries.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { REQUEST_STATUSES, AUDIT_EVENT_TYPES } from '@/lib/crossPortalContract';
import { Database } from '@/integrations/supabase/types';

type Json = Database['public']['Tables']['request_events']['Row']['meta'];

interface ActionResult {
  success: boolean;
  requestId: string;
  newStatus: string;
}

/**
 * Helper to create audit trail event
 */
async function createAuditEvent(params: {
  requestId: string;
  actorUserId: string;
  actorName?: string;
  actorRole?: string;
  action: string;
  fromStatus?: string | null;
  toStatus: string;
  visibility?: string;
  notesInternal?: string;
  notesEmployeeVisible?: string;
  meta?: Record<string, unknown>;
  bulkActionId?: string;
}) {
  const { requestId, actorUserId, actorName, actorRole = 'hr_ops', action, fromStatus, toStatus, visibility = 'internal', notesInternal, notesEmployeeVisible, meta, bulkActionId } = params;
  
  return supabase.from('request_events').insert([{
    request_id: requestId,
    actor_user_id: actorUserId,
    actor_name: actorName || null,
    actor_role: actorRole,
    action,
    from_status: fromStatus || null,
    to_status: toStatus,
    visibility,
    notes_internal: notesInternal || null,
    notes_employee_visible: notesEmployeeVisible || null,
    meta: (meta || {}) as Json,
    bulk_action_id: bulkActionId || null,
  }]);
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
      bulkActionId,
    }: { 
      requestId: string; 
      reviewerNotes?: string;
      internalNotes?: string;
      bulkActionId?: string;
    }): Promise<ActionResult> => {
      // Get current status first
      const { data: current } = await supabase
        .from('requests')
        .select('status')
        .eq('id', requestId)
        .single();
      
      const fromStatus = current?.status;
      
      const { data, error } = await supabase
        .from('requests')
        .update({
          status: REQUEST_STATUSES.APPROVED,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
          reviewer_notes: reviewerNotes || 'Approved',
          decision_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Create audit trail event
      await createAuditEvent({
        requestId,
        actorUserId: user?.id || '',
        action: AUDIT_EVENT_TYPES.APPROVED,
        fromStatus,
        toStatus: REQUEST_STATUSES.APPROVED,
        visibility: 'employee_visible',
        notesEmployeeVisible: reviewerNotes || 'Your claim has been approved.',
        notesInternal: internalNotes,
        bulkActionId,
      });
      
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
      queryClient.invalidateQueries({ queryKey: ['request_timeline'] });
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
      bulkActionId,
    }: { 
      requestId: string; 
      escalationReason: string;
      priority?: 'high' | 'urgent';
      bulkActionId?: string;
    }): Promise<ActionResult> => {
      // Get current status first
      const { data: current } = await supabase
        .from('requests')
        .select('status')
        .eq('id', requestId)
        .single();
      
      const fromStatus = current?.status;
      
      const { data, error } = await supabase
        .from('requests')
        .update({
          status: REQUEST_STATUSES.ESCALATED,
          priority,
          escalated_at: new Date().toISOString(),
          escalation_reason: escalationReason,
        })
        .eq('id', requestId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Add audit event
      await createAuditEvent({
        requestId,
        actorUserId: user?.id || '',
        action: AUDIT_EVENT_TYPES.ESCALATED,
        fromStatus,
        toStatus: REQUEST_STATUSES.ESCALATED,
        visibility: 'internal',
        notesInternal: escalationReason,
        meta: { reason: escalationReason, priority },
        bulkActionId,
      });
      
      return { success: true, requestId, newStatus: REQUEST_STATUSES.ESCALATED };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared_requests'] });
      queryClient.invalidateQueries({ queryKey: ['shared_request'] });
      queryClient.invalidateQueries({ queryKey: ['request_timeline'] });
    },
  });
}

/**
 * Mark claim as In Review
 */
export function useMarkInReview() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ 
      requestId, 
      notes,
      bulkActionId,
    }: { 
      requestId: string; 
      notes?: string;
      bulkActionId?: string;
    }): Promise<ActionResult> => {
      // Get current status first
      const { data: current } = await supabase
        .from('requests')
        .select('status')
        .eq('id', requestId)
        .single();
      
      const fromStatus = current?.status;
      
      const { error } = await supabase
        .from('requests')
        .update({
          status: REQUEST_STATUSES.IN_REVIEW,
        })
        .eq('id', requestId);
      
      if (error) throw error;
      
      // Add audit event
      await createAuditEvent({
        requestId,
        actorUserId: user?.id || '',
        action: AUDIT_EVENT_TYPES.STATUS_CHANGED,
        fromStatus,
        toStatus: REQUEST_STATUSES.IN_REVIEW,
        visibility: 'internal',
        notesInternal: notes || 'Moved to In Review',
        bulkActionId,
      });
      
      return { success: true, requestId, newStatus: REQUEST_STATUSES.IN_REVIEW };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared_requests'] });
      queryClient.invalidateQueries({ queryKey: ['shared_request'] });
      queryClient.invalidateQueries({ queryKey: ['request_timeline'] });
    },
  });
}

/**
 * Mark claim as Paid
 */
export function useMarkPaid() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ 
      requestId, 
      paymentNotes,
      paymentReference,
      bulkActionId,
    }: { 
      requestId: string; 
      paymentNotes?: string;
      paymentReference?: string;
      bulkActionId?: string;
    }): Promise<ActionResult> => {
      // Get current status first
      const { data: current } = await supabase
        .from('requests')
        .select('status')
        .eq('id', requestId)
        .single();
      
      const fromStatus = current?.status;
      
      // Only allow marking as paid if currently approved
      if (fromStatus !== 'approved') {
        throw new Error('Only approved claims can be marked as paid');
      }
      
      const { error } = await supabase
        .from('requests')
        .update({
          status: REQUEST_STATUSES.PAID,
        })
        .eq('id', requestId);
      
      if (error) throw error;
      
      // Add audit event
      await createAuditEvent({
        requestId,
        actorUserId: user?.id || '',
        action: AUDIT_EVENT_TYPES.PAID,
        fromStatus,
        toStatus: REQUEST_STATUSES.PAID,
        visibility: 'employee_visible',
        notesEmployeeVisible: paymentNotes || 'Your claim has been paid.',
        meta: paymentReference ? { payment_reference: paymentReference } : undefined,
        bulkActionId,
      });
      
      return { success: true, requestId, newStatus: REQUEST_STATUSES.PAID };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared_requests'] });
      queryClient.invalidateQueries({ queryKey: ['shared_request'] });
      queryClient.invalidateQueries({ queryKey: ['request_timeline'] });
    },
  });
}

/**
 * Log that a claim was viewed (for audit trail)
 */
export function useLogClaimView() {
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ 
      requestId, 
      currentStatus,
    }: { 
      requestId: string; 
      currentStatus: string;
    }): Promise<void> => {
      await createAuditEvent({
        requestId,
        actorUserId: user?.id || '',
        action: AUDIT_EVENT_TYPES.VIEWED,
        toStatus: currentStatus,
        visibility: 'internal',
      });
    },
    // Don't invalidate queries for view - it's a silent log
  });
}

/**
 * Move claim to Pending Employee (waiting for docs)
 */
export function usePendingEmployee() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ 
      requestId, 
      requestedInfo,
      missingDocs,
      bulkActionId,
    }: { 
      requestId: string; 
      requestedInfo: string;
      missingDocs?: string[];
      bulkActionId?: string;
    }): Promise<ActionResult> => {
      // Get current status first
      const { data: current } = await supabase
        .from('requests')
        .select('status')
        .eq('id', requestId)
        .single();
      
      const fromStatus = current?.status;
      
      const updateData: Record<string, unknown> = {
        status: REQUEST_STATUSES.PENDING_EMPLOYEE,
        reviewer_notes: `Information requested: ${requestedInfo}`,
      };
      
      if (missingDocs && missingDocs.length > 0) {
        updateData.missing_docs = missingDocs;
      }
      
      const { error } = await supabase
        .from('requests')
        .update(updateData)
        .eq('id', requestId);
      
      if (error) throw error;
      
      // Add audit event
      await createAuditEvent({
        requestId,
        actorUserId: user?.id || '',
        action: AUDIT_EVENT_TYPES.DOCS_REQUESTED,
        fromStatus,
        toStatus: REQUEST_STATUSES.PENDING_EMPLOYEE,
        visibility: 'employee_visible',
        notesEmployeeVisible: requestedInfo,
        meta: missingDocs ? { missing_docs: missingDocs } : undefined,
        bulkActionId,
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
      
      return { success: true, requestId, newStatus: REQUEST_STATUSES.PENDING_EMPLOYEE };
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
 * Combined hook with all actions
 */
export function useClaimActions() {
  const approve = useApproveClaim();
  const reject = useRejectClaim();
  const requestInfo = useRequestInfo();
  const assign = useAssignClaim();
  const escalate = useEscalateClaim();
  const markInReview = useMarkInReview();
  const markPaid = useMarkPaid();
  const logView = useLogClaimView();
  const pendingEmployee = usePendingEmployee();
  
  return {
    approve,
    reject,
    requestInfo,
    assign,
    escalate,
    markInReview,
    markPaid,
    logView,
    pendingEmployee,
    isLoading: approve.isPending || reject.isPending || requestInfo.isPending || assign.isPending || escalate.isPending || markInReview.isPending || markPaid.isPending || pendingEmployee.isPending,
  };
}
