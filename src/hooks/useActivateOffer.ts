import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

/**
 * P0 FIX: Hook to activate an offer for an employee
 * Creates a perk_activation row and logs the action
 */
export function useActivateOffer() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch organization_id from profiles
  const { data: userProfile } = useQuery({
    queryKey: ['user-org-id', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  return useMutation({
    mutationFn: async (offer: { id: string; title: string; vendor_id?: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      // Check if already activated
      const { data: existing } = await supabase
        .from('perk_activations')
        .select('id')
        .eq('user_id', user.id)
        .eq('offer_id', offer.id)
        .maybeSingle();
      
      if (existing) {
        throw new Error('Offer already activated');
      }
      
      // Insert activation
      const { data, error } = await supabase
        .from('perk_activations')
        .insert({
          user_id: user.id,
          offer_id: offer.id,
          organization_id: userProfile?.organization_id || null,
          activated_at: new Date().toISOString(),
        })
        .select('id')
        .single();
      
      if (error) throw error;
      
      // Log audit event
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'CREATE',
        resource_type: 'perk_activation',
        resource_id: data.id,
        details: {
          offer_id: offer.id,
          offer_title: offer.title,
          actor_role: 'employee',
        },
      });
      
      return { activationId: data.id, offerId: offer.id };
    },
    onSuccess: (_, offer) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['perk_activations'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-activity'] });
      
      toast.success(`${offer.title} activated! Check "My Vouchers" for your code.`);
    },
    onError: (error: Error) => {
      if (error.message === 'Offer already activated') {
        toast.info('You have already activated this offer. Check "My Vouchers".');
      } else {
        toast.error('Failed to activate offer. Please try again.');
        console.error('Activation error:', error);
      }
    },
  });
}
