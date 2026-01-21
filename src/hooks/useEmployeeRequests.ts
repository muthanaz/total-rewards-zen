/**
 * Employee Requests Hook
 * 
 * Provides CRUD operations for the employee Claims & Requests module.
 * Integrates with the shared requests infrastructure.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  RequestStatus,
  calculateSLA,
} from '@/lib/crossPortalContract';
import { getRequiredDocsForCategory } from '@/hooks/useClaimDocs';

export interface EmployeeRequest {
  id: string;
  user_id: string;
  organization_id: string | null;
  request_type: 'claim' | 'request' | 'question';
  category: string;
  subject: string;
  description: string | null;
  amount: number | null;
  currency: string | null;
  status: RequestStatus | null;
  priority: string | null;
  submitted_at: string | null;
  sla_due_at: string | null;
  sla_hours: number | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  reviewer_notes: string | null;
  missing_docs: unknown[] | null;
  required_docs: unknown[] | null;
  policy_ref: string | null;
  created_at: string | null;
  // Computed
  displayStatus: string;
  slaStatus: ReturnType<typeof calculateSLA>;
  hasMissingDocs: boolean;
  missingDocsCount: number;
  nextAction: string;
}

interface CreateRequestParams {
  type: 'claim' | 'request' | 'question';
  category: string;
  title: string;
  description: string;
  amount?: number;
  priority?: 'low' | 'standard' | 'high' | 'urgent';
}

/**
 * Get the employee-friendly next action message
 */
function getNextAction(status: RequestStatus | null, hasMissingDocs: boolean): string {
  if (hasMissingDocs) {
    return 'Action required: Upload missing documents';
  }
  
  switch (status) {
    case 'pending':
    case 'submitted':
      return 'Awaiting HR review';
    case 'in_review':
      return 'Under review by HR';
    case 'approved':
      return 'Approved - pending payment processing';
    case 'rejected':
      return 'Review rejection reason';
    case 'paid':
      return 'Completed';
    case 'draft':
      return 'Complete and submit';
    default:
      return 'Awaiting update';
  }
}

/**
 * Get employee-friendly status label
 */
export function getEmployeeStatusLabel(status: RequestStatus | null): string {
  switch (status) {
    case 'pending':
    case 'submitted':
      return 'Submitted';
    case 'in_review':
      return 'Under Review';
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    case 'paid':
      return 'Paid';
    case 'draft':
      return 'Draft';
    case 'closed':
      return 'Closed';
    default:
      return 'Unknown';
  }
}

/**
 * Fetch employee's own requests
 */
export function useEmployeeRequests() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['employee_requests', user?.id],
    queryFn: async (): Promise<EmployeeRequest[]> => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map((r): EmployeeRequest => {
        const missingDocs = Array.isArray(r.missing_docs) ? r.missing_docs : [];
        const hasMissingDocs = missingDocs.length > 0;
        
        return {
          id: r.id,
          user_id: r.user_id,
          organization_id: r.organization_id,
          request_type: r.request_type as 'claim' | 'request' | 'question',
          category: r.category,
          subject: r.subject,
          description: r.description,
          amount: r.amount,
          currency: r.currency,
          status: r.status,
          priority: r.priority,
          submitted_at: r.submitted_at,
          sla_due_at: r.sla_due_at,
          sla_hours: r.sla_hours,
          reviewed_at: r.reviewed_at,
          reviewed_by: r.reviewed_by,
          reviewer_notes: r.reviewer_notes,
          missing_docs: missingDocs,
          required_docs: Array.isArray(r.required_docs) ? r.required_docs : [],
          policy_ref: r.policy_ref,
          created_at: r.created_at,
          displayStatus: getEmployeeStatusLabel(r.status),
          slaStatus: calculateSLA(r.sla_due_at, r.status),
          hasMissingDocs,
          missingDocsCount: missingDocs.length,
          nextAction: getNextAction(r.status, hasMissingDocs),
        };
      });
    },
    enabled: !!user?.id,
  });
}

/**
 * Fetch single request with details
 */
export function useEmployeeRequest(requestId: string | null) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['employee_request', requestId],
    queryFn: async (): Promise<EmployeeRequest | null> => {
      if (!requestId || !user?.id) return null;
      
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('id', requestId)
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      
      const missingDocs = Array.isArray(data.missing_docs) ? data.missing_docs : [];
      const hasMissingDocs = missingDocs.length > 0;
      
      return {
        id: data.id,
        user_id: data.user_id,
        organization_id: data.organization_id,
        request_type: data.request_type as 'claim' | 'request' | 'question',
        category: data.category,
        subject: data.subject,
        description: data.description,
        amount: data.amount,
        currency: data.currency,
        status: data.status,
        priority: data.priority,
        submitted_at: data.submitted_at,
        sla_due_at: data.sla_due_at,
        sla_hours: data.sla_hours,
        reviewed_at: data.reviewed_at,
        reviewed_by: data.reviewed_by,
        reviewer_notes: data.reviewer_notes,
        missing_docs: missingDocs,
        required_docs: Array.isArray(data.required_docs) ? data.required_docs : [],
        policy_ref: data.policy_ref,
        created_at: data.created_at,
        displayStatus: getEmployeeStatusLabel(data.status),
        slaStatus: calculateSLA(data.sla_due_at, data.status),
        hasMissingDocs,
        missingDocsCount: missingDocs.length,
        nextAction: getNextAction(data.status, hasMissingDocs),
      };
    },
    enabled: !!requestId && !!user?.id,
  });
}

/**
 * Create a new request
 */
export function useCreateRequest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (params: CreateRequestParams) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Get user's organization_id from profiles table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();
      
      // Calculate SLA hours based on type
      const slaHours = params.type === 'question' ? 48 : params.type === 'claim' ? 72 : 96;
      
      // Get required docs for the category
      const requiredDocs = getRequiredDocsForCategory(params.category);
      
      // Build the request
      const { data: request, error } = await supabase
        .from('requests')
        .insert({
          user_id: user.id,
          organization_id: profileData?.organization_id || null,
          request_type: params.type,
          category: params.category,
          subject: params.title,
          description: params.description,
          amount: params.amount || null,
          currency: params.amount ? 'AED' : null,
          status: 'pending',
          priority: params.priority || 'standard',
          submitted_at: new Date().toISOString(),
          sla_hours: slaHours,
          required_docs: requiredDocs.map(d => d.name),
          missing_docs: params.type !== 'question' ? requiredDocs.map(d => d.name) : [],
          policy_ref: getPolicyRefForCategory(params.category),
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Create claim_docs entries for required documents (except questions)
      if (params.type !== 'question' && requiredDocs.length > 0) {
        const docEntries = requiredDocs.map(doc => ({
          request_id: request.id,
          doc_type: doc.type,
          doc_name: doc.name,
          status: 'missing' as const,
        }));
        
        await supabase.from('claim_docs').insert(docEntries);
      }
      
      // Create initial event
      await supabase.from('request_events').insert({
        request_id: request.id,
        actor_user_id: user.id,
        from_status: null,
        to_status: 'pending',
        action: 'submitted',
        notes_employee_visible: 'Request submitted successfully',
      });
      
      return request;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee_requests'] });
    },
  });
}

/**
 * Add a note/message to a request
 */
export function useAddEmployeeNote() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ requestId, note }: { requestId: string; note: string }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Add to claim_notes
      const { data, error } = await supabase
        .from('claim_notes')
        .insert({
          request_id: requestId,
          note,
          is_internal: false, // Employee notes are always visible
          created_by: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Add event for audit trail
      await supabase.from('request_events').insert({
        request_id: requestId,
        actor_user_id: user.id,
        to_status: 'in_review', // Preserve current status
        action: 'employee_note',
        notes_employee_visible: note.slice(0, 200),
      });
      
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['claim_notes', variables.requestId] });
      queryClient.invalidateQueries({ queryKey: ['request_timeline', variables.requestId] });
    },
  });
}

/**
 * Upload a document for a request
 */
export function useUploadDocument() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ 
      docId, 
      fileUrl 
    }: { 
      docId: string; 
      fileUrl: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('claim_docs')
        .update({
          status: 'provided',
          file_url: fileUrl,
          uploaded_at: new Date().toISOString(),
          uploaded_by: user.id,
        })
        .eq('id', docId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update missing_docs on the request
      const { data: allDocs } = await supabase
        .from('claim_docs')
        .select('doc_name, status')
        .eq('request_id', data.request_id);
      
      const stillMissing = (allDocs || [])
        .filter(d => d.status === 'missing')
        .map(d => d.doc_name);
      
      await supabase
        .from('requests')
        .update({ missing_docs: stillMissing })
        .eq('id', data.request_id);
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['claim_docs', data.request_id] });
      queryClient.invalidateQueries({ queryKey: ['employee_requests'] });
      queryClient.invalidateQueries({ queryKey: ['employee_request', data.request_id] });
    },
  });
}

/**
 * Get request counts by status
 */
export function useEmployeeRequestCounts() {
  const { data: requests = [] } = useEmployeeRequests();
  
  return {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending' || r.status === 'submitted').length,
    inReview: requests.filter(r => r.status === 'in_review').length,
    needInfo: requests.filter(r => r.hasMissingDocs).length,
    approved: requests.filter(r => r.status === 'approved' || r.status === 'paid').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };
}

/**
 * Get policy reference for a category
 */
function getPolicyRefForCategory(category: string): string {
  const policyMap: Record<string, string> = {
    'Health Insurance': 'HEALTH-2024-v3',
    'Housing': 'HOUSING-2024-v2',
    'Education Allowance': 'EDU-2024-v2',
    'Schooling': 'EDU-2024-v2',
    'Transport': 'TRANSPORT-2024-v1',
    'Learning & Development': 'LND-2024-v1',
    'Wellbeing': 'WELLBEING-2024-v1',
    'Leave': 'LEAVE-2024-v2',
    'Per Diem': 'PERDIEM-2024-v1',
    'Financial': 'FIN-2024-v1',
  };
  
  return policyMap[category] || 'GENERAL-2024-v1';
}
