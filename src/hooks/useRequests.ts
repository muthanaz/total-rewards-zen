import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type RequestStatus = Database['public']['Enums']['request_status'];
type RequestType = Database['public']['Enums']['request_type'];

export interface Request {
  id: string;
  user_id: string;
  request_type: RequestType;
  category: string;
  subject: string;
  description: string | null;
  amount: number | null;
  status: RequestStatus | null;
  priority: string | null;
  assigned_to: string | null;
  sla_due_at: string | null;
  created_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  reviewer_notes: string | null;
  last_status_change_at: string | null;
  organization_id: string | null;
  // Joined data
  profile?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    department: string | null;
  };
}

export interface RequestEvent {
  id: string;
  request_id: string;
  actor_user_id: string;
  from_status: string | null;
  to_status: string;
  notes_internal: string | null;
  notes_employee_visible: string | null;
  created_at: string;
  // Joined data
  actor_profile?: {
    first_name: string | null;
    last_name: string | null;
  };
}

export function useOrgRequests() {
  const { organizationId } = useAuth();

  return useQuery({
    queryKey: ['org-requests', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from('requests')
        .select(`
          *,
          profile:profiles!requests_user_id_fkey(
            first_name,
            last_name,
            email,
            department
          )
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as Request[];
    },
    enabled: !!organizationId,
  });
}

export function useRequestEvents(requestId: string | null) {
  return useQuery({
    queryKey: ['request-events', requestId],
    queryFn: async () => {
      if (!requestId) return [];

      const { data, error } = await supabase
        .from('request_events')
        .select(`
          *,
          actor_profile:profiles!request_events_actor_user_id_fkey(
            first_name,
            last_name
          )
        `)
        .eq('request_id', requestId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as RequestEvent[];
    },
    enabled: !!requestId,
  });
}

interface UpdateRequestParams {
  requestId: string;
  status: RequestStatus;
  reviewerNotes?: string;
  internalNotes?: string;
  assignedTo?: string | null;
  priority?: string | null;
}

export function useUpdateRequest() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      requestId, 
      status, 
      reviewerNotes, 
      internalNotes,
      assignedTo,
      priority,
    }: UpdateRequestParams) => {
      // Update the request
      const { error: updateError } = await supabase
        .from('requests')
        .update({
          status,
          reviewer_notes: reviewerNotes,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
          assigned_to: assignedTo,
          priority,
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Note: The request_events trigger will automatically log the status change
      // But we can add additional internal notes if provided
      if (internalNotes && user?.id) {
        const { error: eventError } = await supabase
          .from('request_events')
          .insert({
            request_id: requestId,
            actor_user_id: user.id,
            from_status: null, // Will be updated by trigger if needed
            to_status: status,
            notes_internal: internalNotes,
            notes_employee_visible: reviewerNotes,
          });

        if (eventError) console.warn('Failed to log additional event notes:', eventError);
      }

      return { requestId, status };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['org-requests'] });
      queryClient.invalidateQueries({ queryKey: ['request-events', data.requestId] });
      toast({
        title: 'Request Updated',
        description: `Request has been ${data.status}.`,
      });
    },
    onError: (error) => {
      console.error('Failed to update request:', error);
      toast({
        title: 'Update Failed',
        description: 'Could not update the request. Please try again.',
        variant: 'destructive',
      });
    },
  });
}

export function useRequestStats() {
  const { organizationId } = useAuth();

  return useQuery({
    queryKey: ['request-stats', organizationId],
    queryFn: async () => {
      if (!organizationId) {
        return {
          total: 0,
          pending: 0,
          submitted: 0,
          in_review: 0,
          approved: 0,
          rejected: 0,
          paid: 0,
          closed: 0,
        };
      }

      const { data, error } = await supabase
        .from('requests')
        .select('status')
        .eq('organization_id', organizationId);

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        pending: 0,
        submitted: 0,
        in_review: 0,
        approved: 0,
        rejected: 0,
        paid: 0,
        closed: 0,
        draft: 0,
      };

      data?.forEach((request) => {
        const status = request.status as keyof typeof stats;
        if (status && status in stats) {
          stats[status]++;
        }
      });

      return stats;
    },
    enabled: !!organizationId,
  });
}
