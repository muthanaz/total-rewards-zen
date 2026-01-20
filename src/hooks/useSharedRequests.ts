/**
 * Shared Requests Hook - Cross-Portal Consistency
 * 
 * This hook provides a unified interface for fetching and managing requests
 * that works identically across Employee, Employer, and Admin portals.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  RequestStatus, 
  REQUEST_STATUSES, 
  STATUS_GROUPS,
  calculateSLA,
  getStatusDisplayLabel 
} from '@/lib/crossPortalContract';
import { Database } from '@/integrations/supabase/types';

type RequestRow = Database['public']['Tables']['requests']['Row'];
type RequestEventRow = Database['public']['Tables']['request_events']['Row'];

export interface RequestWithDetails extends RequestRow {
  employeeName?: string;
  employeeEmail?: string;
  employeeDepartment?: string;
  events?: RequestEventRow[];
  slaStatus?: ReturnType<typeof calculateSLA>;
  displayStatus: string;
}

interface UseSharedRequestsOptions {
  userId?: string; // Filter by specific user (for employee portal)
  organizationId?: string; // Filter by organization (for employer portal)
  statuses?: RequestStatus[]; // Filter by status
  limit?: number;
  includeEvents?: boolean;
}

/**
 * Helper to get user's organization ID
 */
async function getUserOrganizationId(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('user_id', userId)
    .single();
  return data?.organization_id || null;
}

/**
 * Unified requests fetcher - same data source for all portals
 */
export function useSharedRequests(options: UseSharedRequestsOptions = {}) {
  const { user } = useAuth();
  
  const { userId, organizationId, statuses, limit, includeEvents = false } = options;
  
  return useQuery({
    queryKey: ['shared_requests', userId, organizationId, statuses, limit, includeEvents],
    queryFn: async (): Promise<RequestWithDetails[]> => {
      // Base query
      let query = supabase
        .from('requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Apply filters
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }
      
      if (statuses && statuses.length > 0) {
        query = query.in('status', statuses);
      }
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data: requests, error } = await query;
      
      if (error) throw error;
      
      // Get employee profiles for these requests
      const userIds = [...new Set((requests || []).map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, email, department')
        .in('user_id', userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      
      // Transform data with computed fields
      return (requests || []).map((request): RequestWithDetails => {
        const profile = profileMap.get(request.user_id);
        return {
          ...request,
          employeeName: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : undefined,
          employeeEmail: profile?.email || undefined,
          employeeDepartment: profile?.department || undefined,
          slaStatus: calculateSLA(request.sla_due_at, request.status),
          displayStatus: getStatusDisplayLabel(request.status),
        };
      });
    },
    enabled: !!user,
  });
}

/**
 * Fetch a single request by ID - consistent across portals
 */
export function useSharedRequest(requestId: string | null) {
  return useQuery({
    queryKey: ['shared_request', requestId],
    queryFn: async (): Promise<RequestWithDetails | null> => {
      if (!requestId) return null;
      
      const { data: request, error } = await supabase
        .from('requests')
        .select('*')
        .eq('id', requestId)
        .single();
      
      if (error) throw error;
      
      // Get profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, email, department')
        .eq('user_id', request.user_id)
        .single();
      
      // Get events
      const { data: events } = await supabase
        .from('request_events')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: true });
      
      return {
        ...request,
        employeeName: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : undefined,
        employeeEmail: profile?.email || undefined,
        employeeDepartment: profile?.department || undefined,
        events: events || [],
        slaStatus: calculateSLA(request.sla_due_at, request.status),
        displayStatus: getStatusDisplayLabel(request.status),
      };
    },
    enabled: !!requestId,
  });
}

/**
 * Update request status - triggers audit trail via database trigger
 * Works identically from both Employee and Employer portals
 */
export function useUpdateRequestStatus() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ 
      requestId, 
      newStatus, 
      reviewerNotes,
      internalNotes 
    }: { 
      requestId: string; 
      newStatus: RequestStatus;
      reviewerNotes?: string;
      internalNotes?: string;
    }) => {
      // Update the request
      const { data, error } = await supabase
        .from('requests')
        .update({
          status: newStatus,
          reviewed_at: newStatus === REQUEST_STATUSES.APPROVED || newStatus === REQUEST_STATUSES.REJECTED 
            ? new Date().toISOString() 
            : undefined,
          reviewed_by: user?.id,
          reviewer_notes: reviewerNotes,
        })
        .eq('id', requestId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Note: request_events is auto-inserted via database trigger (log_request_status_change)
      // The trigger handles the audit trail automatically
      
      return data;
    },
    onSuccess: () => {
      // Invalidate all request queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['shared_requests'] });
      queryClient.invalidateQueries({ queryKey: ['shared_request'] });
      queryClient.invalidateQueries({ queryKey: ['requests'] }); // Legacy hook
      queryClient.invalidateQueries({ queryKey: ['all_requests'] }); // Legacy hook
    },
  });
}

/**
 * Get request timeline (events) - consistent across portals
 * Employee sees only employee-visible notes
 * Employer sees all notes including internal ones
 */
export function useRequestTimeline(requestId: string | null, includeInternalNotes = false) {
  return useQuery({
    queryKey: ['request_timeline', requestId, includeInternalNotes],
    queryFn: async () => {
      if (!requestId) return [];
      
      const { data, error } = await supabase
        .from('request_events')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Filter out internal notes for employee view
      if (!includeInternalNotes) {
        return data?.map(event => ({
          ...event,
          notes_internal: null, // Hide internal notes from employees
        })) || [];
      }
      
      return data || [];
    },
    enabled: !!requestId,
  });
}

/**
 * Employee-specific: Get my requests
 */
export function useMyRequests(options: Omit<UseSharedRequestsOptions, 'userId' | 'organizationId'> = {}) {
  const { user } = useAuth();
  return useSharedRequests({ ...options, userId: user?.id });
}

/**
 * Employer-specific: Get organization requests
 * Requires organizationId to be passed explicitly
 */
export function useOrganizationRequests(organizationId: string | null, options: Omit<UseSharedRequestsOptions, 'userId' | 'organizationId'> = {}) {
  return useSharedRequests({ 
    ...options, 
    organizationId: organizationId || undefined 
  });
}

/**
 * Get pending requests count - for badges/notifications
 */
export function usePendingRequestsCount(scope: 'user' | 'organization', organizationId?: string | null) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['pending_requests_count', scope, user?.id, organizationId],
    queryFn: async () => {
      let query = supabase
        .from('requests')
        .select('id', { count: 'exact', head: true })
        .in('status', STATUS_GROUPS.ACTIVE);
      
      if (scope === 'user') {
        query = query.eq('user_id', user?.id);
      } else if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }
      
      const { count, error } = await query;
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user && (scope === 'user' || !!organizationId),
  });
}
