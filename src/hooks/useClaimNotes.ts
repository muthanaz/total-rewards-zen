/**
 * Claim Notes Hook
 * 
 * Manages internal notes associated with claims.
 * Used by the ClaimReviewSheet for HR team collaboration.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ClaimNote {
  id: string;
  request_id: string;
  note: string;
  is_internal: boolean;
  created_by: string;
  created_at: string;
  // Joined data
  author_name?: string;
  author_email?: string;
}

/**
 * Fetch all notes for a claim
 */
export function useClaimNotes(requestId: string | null, includeInternal = true) {
  return useQuery({
    queryKey: ['claim_notes', requestId, includeInternal],
    queryFn: async (): Promise<ClaimNote[]> => {
      if (!requestId) return [];
      
      let query = supabase
        .from('claim_notes')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: false });
      
      if (!includeInternal) {
        query = query.eq('is_internal', false);
      }
      
      const { data: notes, error } = await query;
      
      if (error) throw error;
      
      // Get author profiles
      const authorIds = [...new Set((notes || []).map(n => n.created_by))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, email')
        .in('user_id', authorIds);
      
      const profileMap = new Map(profiles?.map((p: any) => [
        p.user_id, 
        { name: `${p.first_name || ''} ${p.last_name || ''}`.trim(), email: p.email }
      ]) || []);
      
      return (notes || []).map(note => ({
        ...note,
        author_name: profileMap.get(note.created_by)?.name || 'Unknown',
        author_email: profileMap.get(note.created_by)?.email || undefined,
      }));
    },
    enabled: !!requestId,
  });
}

/**
 * Add a new note to a claim
 */
export function useAddClaimNote() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ 
      requestId, 
      note, 
      isInternal = true 
    }: { 
      requestId: string; 
      note: string; 
      isInternal?: boolean;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('claim_notes')
        .insert({
          request_id: requestId,
          note,
          is_internal: isInternal,
          created_by: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Also add to request_events for audit trail
      await supabase.from('request_events').insert({
        request_id: requestId,
        actor_user_id: user.id,
        to_status: 'in_review',
        action: 'note_added',
        meta: { is_internal: isInternal, note_preview: note.slice(0, 100) },
      });
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['claim_notes', data.request_id] });
      queryClient.invalidateQueries({ queryKey: ['request_timeline', data.request_id] });
    },
  });
}

/**
 * Get notes count for a claim
 */
export function useClaimNotesCount(requestId: string | null) {
  const { data: notes = [] } = useClaimNotes(requestId);
  
  return {
    total: notes.length,
    internal: notes.filter(n => n.is_internal).length,
    visible: notes.filter(n => !n.is_internal).length,
  };
}
