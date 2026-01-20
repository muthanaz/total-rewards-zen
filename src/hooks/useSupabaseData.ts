import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useProfile() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useBenefits() {
  return useQuery({
    queryKey: ['benefits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('benefits')
        .select('*')
        .eq('is_active', true);
      if (error) throw error;
      return data;
    },
  });
}

export function useBenefitEntitlements() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['benefit_entitlements', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('benefit_entitlements')
        .select('*, benefits(*)')
        .eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useHousingAreas() {
  return useQuery({
    queryKey: ['housing_areas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('housing_areas')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });
}

export function useHousingListings() {
  return useQuery({
    queryKey: ['housing_listings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('housing_listings')
        .select('*')
        .order('annual_rent');
      if (error) throw error;
      return data;
    },
  });
}

export function useSchools() {
  return useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });
}

export function useHealthProviders() {
  return useQuery({
    queryKey: ['health_providers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('health_providers')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });
}

export function useMarketplaceOffers() {
  return useQuery({
    queryKey: ['marketplace_offers'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('marketplace_offers')
        .select('*')
        .eq('is_active', true)
        .eq('status', 'active') // P0: Only show admin-approved offers
        .or(`valid_to.is.null,valid_to.gte.${today}`) // Exclude expired offers
        .order('rating', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useLeaveBalances() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['leave_balances', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('leave_balances')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useRequests() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['requests', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useAllRequests() {
  return useQuery({
    queryKey: ['all_requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('requests')
        .select('*, profiles!requests_user_id_fkey(first_name, last_name, email)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useChildren() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['children', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('user_id', user.id)
        .order('date_of_birth');
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useUtilizationEvents() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['utilization_events', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('utilization_events')
        .select('*, benefits(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function usePerkActivations() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['perk_activations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('perk_activations')
        .select('*, marketplace_offers(*)')
        .eq('user_id', user.id)
        .order('activated_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

// Employer specific hooks
export function useAllProfiles() {
  return useQuery({
    queryKey: ['all_profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('first_name');
      if (error) throw error;
      return data;
    },
  });
}

export function useAllBenefitEntitlements() {
  return useQuery({
    queryKey: ['all_benefit_entitlements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('benefit_entitlements')
        .select('*, benefits(*), profiles!benefit_entitlements_user_id_fkey(first_name, last_name)');
      if (error) throw error;
      return data;
    },
  });
}

export function useAllUtilizationEvents() {
  return useQuery({
    queryKey: ['all_utilization_events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('utilization_events')
        .select('*, benefits(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useAllPerkActivations() {
  return useQuery({
    queryKey: ['all_perk_activations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('perk_activations')
        .select('*, marketplace_offers(*)')
        .order('activated_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}
