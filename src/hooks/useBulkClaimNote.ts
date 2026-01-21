/**
 * Hook for adding bulk internal notes to claims
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useBulkClaimNote() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ 
      requestIds, 
      note,
      isInternal = true,
    }: { 
      requestIds: string[]; 
      note: string;
      isInternal?: boolean;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const noteEntries = requestIds.map(requestId => ({
        request_id: requestId,
        note,
        is_internal: isInternal,
        created_by: user.id,
      }));
      
      const { error } = await supabase
        .from('claim_notes')
        .insert(noteEntries);
      
      if (error) throw error;
      
      // Also log audit events
      const auditEntries = requestIds.map(requestId => ({
        request_id: requestId,
        actor_user_id: user.id,
        action: 'note_added',
        to_status: 'unchanged',
        meta: { note, is_internal: isInternal },
      }));
      
      await supabase.from('request_events').insert(auditEntries);
      
      return { success: true, count: requestIds.length };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claim_notes'] });
      queryClient.invalidateQueries({ queryKey: ['request_timeline'] });
    },
  });
}
