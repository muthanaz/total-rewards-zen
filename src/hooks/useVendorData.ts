import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// ============= VENDOR CONTEXT =============

export function useVendor() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['vendor', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

// ============= VENDOR OFFERS =============

export type OfferStatus = 'pending' | 'active' | 'suspended' | 'rejected' | 'expired';

export interface VendorOffer {
  id: string;
  title: string;
  description: string | null;
  category: string;
  merchant: string;
  discount_percent: number | null;
  valid_from: string | null;
  valid_to: string | null;
  status: string;
  is_active: boolean | null;
  is_public: boolean | null;
  terms: string | null;
  image_url: string | null;
  tags: string[] | null;
  created_at: string | null;
  vendor_id: string | null;
  // Aggregated stats
  activations_count?: number;
  redemptions_count?: number;
  estimated_earnings?: number;
}

export function useVendorOffers() {
  const { data: vendor } = useVendor();
  
  return useQuery({
    queryKey: ['vendor-offers', vendor?.id],
    queryFn: async () => {
      if (!vendor) return [];
      const { data, error } = await supabase
        .from('marketplace_offers')
        .select('*')
        .eq('vendor_id', vendor.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as VendorOffer[];
    },
    enabled: !!vendor?.id,
  });
}

export function useVendorOfferStats(offerId?: string) {
  const { data: vendor } = useVendor();
  
  return useQuery({
    queryKey: ['vendor-offer-stats', vendor?.id, offerId],
    queryFn: async () => {
      if (!vendor) return { activations: 0, redemptions: 0 };
      
      // Get activations for this vendor's offers
      let query = supabase
        .from('perk_activations')
        .select('id, offer_id, marketplace_offers!inner(vendor_id)');
      
      if (offerId) {
        query = query.eq('offer_id', offerId);
      }
      
      const { data: activations, error } = await query;
      if (error) {
        console.error('Error fetching stats:', error);
        return { activations: 0, redemptions: 0 };
      }
      
      // Filter by vendor
      const vendorActivations = activations?.filter(
        (a: any) => a.marketplace_offers?.vendor_id === vendor.id
      ) || [];
      
      return {
        activations: vendorActivations.length,
        redemptions: Math.floor(vendorActivations.length * 0.7), // Estimated
      };
    },
    enabled: !!vendor?.id,
  });
}

// ============= OFFER MUTATIONS =============

export interface CreateOfferInput {
  title: string;
  description?: string;
  category: string;
  discount_percent?: number;
  valid_from?: string;
  valid_to?: string;
  is_public?: boolean;
  terms?: string;
  image_url?: string;
  tags?: string[];
  offer_type?: 'code' | 'deeplink' | 'payroll';
  usage_limit?: number;
  location?: string;
}

export function useCreateOffer() {
  const { data: vendor } = useVendor();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateOfferInput) => {
      if (!vendor) throw new Error('Vendor not found');
      
      const { data, error } = await supabase
        .from('marketplace_offers')
        .insert({
          vendor_id: vendor.id,
          merchant: vendor.company_name,
          title: input.title,
          description: input.description || null,
          category: input.category,
          discount_percent: input.discount_percent || null,
          valid_from: input.valid_from || null,
          valid_to: input.valid_to || null,
          is_public: input.is_public ?? true,
          is_active: false, // Starts inactive until approved
          status: 'pending', // Requires admin approval
          terms: input.terms || null,
          image_url: input.image_url || null,
          tags: input.tags || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Log audit event
      await supabase.from('audit_logs').insert({
        user_id: vendor.user_id,
        action: 'CREATE',
        resource_type: 'marketplace_offer',
        resource_id: data.id,
        details: { 
          title: input.title, 
          category: input.category,
          actor_role: 'vendor',
        },
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-offers'] });
      toast.success('Offer submitted for review');
    },
    onError: (error) => {
      console.error('Error creating offer:', error);
      toast.error('Failed to create offer');
    },
  });
}

export function useUpdateOffer() {
  const { data: vendor } = useVendor();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CreateOfferInput> & { id: string }) => {
      if (!vendor) throw new Error('Vendor not found');
      
      // Check current status - only allow edits for pending/rejected
      const { data: currentOffer } = await supabase
        .from('marketplace_offers')
        .select('status')
        .eq('id', id)
        .single();
      
      if (currentOffer?.status === 'active') {
        // For active offers, require re-approval
        const { data, error } = await supabase
          .from('marketplace_offers')
          .update({
            ...updates,
            status: 'pending', // Revert to pending for re-review
            is_active: false,
          })
          .eq('id', id)
          .eq('vendor_id', vendor.id) // Security: ensure vendor owns this
          .select()
          .single();
        
        if (error) throw error;
        return { ...data, requiresReapproval: true };
      }
      
      const { data, error } = await supabase
        .from('marketplace_offers')
        .update(updates)
        .eq('id', id)
        .eq('vendor_id', vendor.id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Log audit event
      await supabase.from('audit_logs').insert({
        user_id: vendor.user_id,
        action: 'UPDATE',
        resource_type: 'marketplace_offer',
        resource_id: id,
        details: { 
          fields_updated: Object.keys(updates),
          actor_role: 'vendor',
        },
      });
      
      return data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-offers'] });
      if (data?.requiresReapproval) {
        toast.info('Offer updated and resubmitted for approval');
      } else {
        toast.success('Offer updated');
      }
    },
    onError: (error) => {
      console.error('Error updating offer:', error);
      toast.error('Failed to update offer');
    },
  });
}

export function useDeleteOffer() {
  const { data: vendor } = useVendor();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (offerId: string) => {
      if (!vendor) throw new Error('Vendor not found');
      
      const { error } = await supabase
        .from('marketplace_offers')
        .delete()
        .eq('id', offerId)
        .eq('vendor_id', vendor.id); // Security: ensure vendor owns this
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-offers'] });
      toast.success('Offer deleted');
    },
    onError: (error) => {
      console.error('Error deleting offer:', error);
      toast.error('Failed to delete offer');
    },
  });
}

// ============= VENDOR ANALYTICS =============

export interface VendorAnalytics {
  totalActivations: number;
  totalRedemptions: number;
  estimatedEarnings: number;
  pendingPayout: number;
  conversionRate: number;
  activationsByDate: { date: string; count: number }[];
  activationsByCategory: { category: string; count: number }[];
  topOffers: { offerId: string; title: string; activations: number }[];
}

export function useVendorAnalytics(dateRange?: { start: Date; end: Date }) {
  const { data: vendor } = useVendor();
  
  return useQuery({
    queryKey: ['vendor-analytics', vendor?.id, dateRange?.start, dateRange?.end],
    queryFn: async (): Promise<VendorAnalytics> => {
      if (!vendor) {
        return {
          totalActivations: 0,
          totalRedemptions: 0,
          estimatedEarnings: 0,
          pendingPayout: 0,
          conversionRate: 0,
          activationsByDate: [],
          activationsByCategory: [],
          topOffers: [],
        };
      }
      
      // Get vendor's offers
      const { data: offers } = await supabase
        .from('marketplace_offers')
        .select('id, title, category')
        .eq('vendor_id', vendor.id);
      
      const offerIds = offers?.map(o => o.id) || [];
      
      if (offerIds.length === 0) {
        return {
          totalActivations: 0,
          totalRedemptions: 0,
          estimatedEarnings: 0,
          pendingPayout: 0,
          conversionRate: 0,
          activationsByDate: [],
          activationsByCategory: [],
          topOffers: [],
        };
      }
      
      // Get activations for these offers
      let activationsQuery = supabase
        .from('perk_activations')
        .select('*')
        .in('offer_id', offerIds);
      
      if (dateRange?.start) {
        activationsQuery = activationsQuery.gte('activated_at', dateRange.start.toISOString());
      }
      if (dateRange?.end) {
        activationsQuery = activationsQuery.lte('activated_at', dateRange.end.toISOString());
      }
      
      const { data: activations } = await activationsQuery;
      
      // Get transactions for earnings
      const { data: transactions } = await supabase
        .from('vendor_transactions')
        .select('*')
        .eq('vendor_id', vendor.id);
      
      const totalActivations = activations?.length || 0;
      const totalRedemptions = Math.floor(totalActivations * 0.7); // Estimated 70% redemption rate
      const commissionRate = vendor.commission_rate || 10;
      
      // Calculate earnings (demo: assume avg transaction = 500 AED)
      const avgTransactionValue = 500;
      const estimatedEarnings = totalRedemptions * avgTransactionValue * (commissionRate / 100);
      const settledAmount = transactions?.filter(t => t.status === 'settled')
        .reduce((sum, t) => sum + t.commission_amount, 0) || 0;
      const pendingPayout = estimatedEarnings - settledAmount;
      
      // Group by date
      const activationsByDate: Record<string, number> = {};
      activations?.forEach(a => {
        const date = a.activated_at?.split('T')[0] || 'unknown';
        activationsByDate[date] = (activationsByDate[date] || 0) + 1;
      });
      
      // Group by category
      const activationsByCategory: Record<string, number> = {};
      activations?.forEach(a => {
        const offer = offers?.find(o => o.id === a.offer_id);
        const category = offer?.category || 'Unknown';
        activationsByCategory[category] = (activationsByCategory[category] || 0) + 1;
      });
      
      // Top offers
      const offerCounts: Record<string, number> = {};
      activations?.forEach(a => {
        offerCounts[a.offer_id] = (offerCounts[a.offer_id] || 0) + 1;
      });
      
      const topOffers = Object.entries(offerCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([offerId, activations]) => ({
          offerId,
          title: offers?.find(o => o.id === offerId)?.title || 'Unknown',
          activations,
        }));
      
      return {
        totalActivations,
        totalRedemptions,
        estimatedEarnings,
        pendingPayout: Math.max(0, pendingPayout),
        conversionRate: totalActivations > 0 ? (totalRedemptions / totalActivations) * 100 : 0,
        activationsByDate: Object.entries(activationsByDate)
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => a.date.localeCompare(b.date)),
        activationsByCategory: Object.entries(activationsByCategory)
          .map(([category, count]) => ({ category, count })),
        topOffers,
      };
    },
    enabled: !!vendor?.id,
  });
}

// ============= VENDOR TRANSACTIONS =============

export function useVendorTransactions() {
  const { data: vendor } = useVendor();
  
  return useQuery({
    queryKey: ['vendor-transactions', vendor?.id],
    queryFn: async () => {
      if (!vendor) return [];
      const { data, error } = await supabase
        .from('vendor_transactions')
        .select('*, marketplace_offers(title)')
        .eq('vendor_id', vendor.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!vendor?.id,
  });
}

// ============= PAYOUT SUMMARY =============

export interface PayoutSummary {
  totalEarned: number;
  totalPaid: number;
  pendingPayout: number;
  nextPayoutDate: string | null;
  payoutHistory: {
    id: string;
    amount: number;
    status: string;
    date: string;
    method: string;
  }[];
}

export function usePayoutSummary() {
  const { data: vendor } = useVendor();
  const { data: analytics } = useVendorAnalytics();
  
  return useQuery({
    queryKey: ['vendor-payout-summary', vendor?.id],
    queryFn: async (): Promise<PayoutSummary> => {
      if (!vendor) {
        return {
          totalEarned: 0,
          totalPaid: 0,
          pendingPayout: 0,
          nextPayoutDate: null,
          payoutHistory: [],
        };
      }
      
      // Get all transactions
      const { data: transactions } = await supabase
        .from('vendor_transactions')
        .select('*')
        .eq('vendor_id', vendor.id);
      
      const settledTransactions = transactions?.filter(t => t.status === 'settled') || [];
      const totalPaid = settledTransactions.reduce((sum, t) => sum + t.commission_amount, 0);
      const totalEarned = analytics?.estimatedEarnings || (vendor.total_revenue || 0);
      
      // Demo payout history
      const payoutHistory = [
        { id: 'p1', amount: 12500, status: 'completed', date: '2024-12-15', method: 'Bank Transfer' },
        { id: 'p2', amount: 8750, status: 'completed', date: '2024-11-15', method: 'Bank Transfer' },
        { id: 'p3', amount: 15200, status: 'completed', date: '2024-10-15', method: 'Bank Transfer' },
      ];
      
      // Next payout is 15th of next month
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      nextMonth.setDate(15);
      
      return {
        totalEarned,
        totalPaid,
        pendingPayout: Math.max(0, totalEarned - totalPaid),
        nextPayoutDate: nextMonth.toISOString().split('T')[0],
        payoutHistory,
      };
    },
    enabled: !!vendor?.id,
  });
}
