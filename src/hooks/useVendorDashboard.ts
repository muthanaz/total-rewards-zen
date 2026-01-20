import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useVendor } from './useVendorData';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { toast } from 'sonner';
import { subDays, format, startOfDay, eachDayOfInterval, parseISO } from 'date-fns';
import { MARKETPLACE_CATEGORIES } from '@/lib/constants';

// ============= TYPES =============

export interface VendorDashboardMetrics {
  activeOffers: number;
  pendingOffers: number;
  expiredOffers: number;
  activations30d: number;
  redemptions30d: number;
  redemptionRate: number;
  earnings30d: number;
  pendingPayout: number;
  lifetimeEarnings: number;
}

export interface TrendDataPoint {
  date: string;
  activations: number;
  redemptions: number;
}

export interface OfferSummary {
  id: string;
  title: string;
  merchant: string;
  category: string;
  status: 'pending' | 'active' | 'expired' | 'suspended' | 'rejected';
  discountDisplay: string;
  validFrom: string | null;
  validTo: string | null;
  imageUrl: string | null;
  activations30d: number;
  redemptions30d: number;
  createdAt: string;
}

export interface ActivityEvent {
  id: string;
  type: 'activation' | 'redemption' | 'approval' | 'rejection' | 'creation';
  title: string;
  offerId: string;
  offerTitle: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface VendorProfileCompleteness {
  hasLogo: boolean;
  hasDescription: boolean;
  hasCategory: boolean;
  hasBankDetails: boolean;
  hasContactEmail: boolean;
  hasContactPhone: boolean;
  completionPercent: number;
  missingFields: string[];
}

// ============= MAIN DASHBOARD HOOK =============

export function useVendorDashboard() {
  const { data: vendor, isLoading: vendorLoading } = useVendor();
  
  const queryResult = useQuery({
    queryKey: ['vendor-dashboard', vendor?.id],
    queryFn: async () => {
      if (!vendor) throw new Error('Vendor not found');
      
      const now = new Date();
      const thirtyDaysAgo = subDays(now, 30);
      const today = format(now, 'yyyy-MM-dd');
      
      // Fetch vendor's offers
      const { data: offers, error: offersError } = await supabase
        .from('marketplace_offers')
        .select('*')
        .eq('vendor_id', vendor.id)
        .order('created_at', { ascending: false });
      
      if (offersError) throw offersError;
      
      const offerIds = offers?.map(o => o.id) || [];
      
      // Categorize offers
      const activeOffers = offers?.filter(o => 
        o.status === 'active' && (!o.valid_to || o.valid_to >= today)
      ).length || 0;
      
      const pendingOffers = offers?.filter(o => o.status === 'pending').length || 0;
      
      const expiredOffers = offers?.filter(o => 
        o.valid_to && o.valid_to < today
      ).length || 0;
      
      // Fetch activations (last 30 days)
      let activations30d = 0;
      let activationsByDate: Record<string, number> = {};
      
      if (offerIds.length > 0) {
        const { data: activations } = await supabase
          .from('perk_activations')
          .select('id, offer_id, activated_at')
          .in('offer_id', offerIds)
          .gte('activated_at', thirtyDaysAgo.toISOString());
        
        activations30d = activations?.length || 0;
        
        activations?.forEach(a => {
          const date = a.activated_at?.split('T')[0] || 'unknown';
          activationsByDate[date] = (activationsByDate[date] || 0) + 1;
        });
      }
      
      // Fetch transactions/redemptions (last 30 days)
      const { data: transactions } = await supabase
        .from('vendor_transactions')
        .select('*')
        .eq('vendor_id', vendor.id)
        .gte('created_at', thirtyDaysAgo.toISOString());
      
      const redemptions30d = transactions?.filter(t => t.redeemed_at).length || 0;
      const earnings30d = transactions?.reduce((sum, t) => sum + (t.commission_amount || 0), 0) || 0;
      
      // Pending payout = unsettled commissions
      const { data: allTransactions } = await supabase
        .from('vendor_transactions')
        .select('commission_amount, status, settled_at')
        .eq('vendor_id', vendor.id);
      
      const pendingPayout = allTransactions?.filter(t => !t.settled_at)
        .reduce((sum, t) => sum + (t.commission_amount || 0), 0) || 0;
      
      const lifetimeEarnings = allTransactions?.reduce((sum, t) => sum + (t.commission_amount || 0), 0) || 0;
      
      // Build trend data
      const days = eachDayOfInterval({ start: thirtyDaysAgo, end: now });
      const redemptionsByDate: Record<string, number> = {};
      
      transactions?.forEach(t => {
        if (t.redeemed_at) {
          const date = t.redeemed_at.split('T')[0];
          redemptionsByDate[date] = (redemptionsByDate[date] || 0) + 1;
        }
      });
      
      const trendData: TrendDataPoint[] = days.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        return {
          date: format(day, 'MMM dd'),
          activations: activationsByDate[dateStr] || 0,
          redemptions: redemptionsByDate[dateStr] || 0,
        };
      });
      
      // Build offer summaries (sorted: pending first, then active, then rest)
      const statusPriority: Record<string, number> = {
        pending: 1,
        active: 2,
        expired: 3,
        suspended: 4,
        rejected: 5,
      };
      
      const offerSummaries: OfferSummary[] = (offers || [])
        .map(o => {
          const isExpired = o.valid_to && o.valid_to < today;
          const status = isExpired ? 'expired' : (o.status as OfferSummary['status']) || 'pending';
          
          return {
            id: o.id,
            title: o.title,
            merchant: o.merchant,
            category: o.category,
            status,
            discountDisplay: o.discount_percent 
              ? `${o.discount_percent}% off`
              : 'Special Offer',
            validFrom: o.valid_from,
            validTo: o.valid_to,
            imageUrl: o.image_url,
            activations30d: 0, // Will be calculated below
            redemptions30d: 0,
            createdAt: o.created_at || '',
          };
        })
        .sort((a, b) => {
          const priorityDiff = (statusPriority[a.status] || 99) - (statusPriority[b.status] || 99);
          if (priorityDiff !== 0) return priorityDiff;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      
      // Calculate redemption rate
      const redemptionRate = activations30d > 0 
        ? (redemptions30d / activations30d) * 100 
        : 0;
      
      const metrics: VendorDashboardMetrics = {
        activeOffers,
        pendingOffers,
        expiredOffers,
        activations30d,
        redemptions30d,
        redemptionRate,
        earnings30d,
        pendingPayout,
        lifetimeEarnings,
      };
      
      return {
        metrics,
        trendData,
        offers: offerSummaries,
        hasData: (offers?.length || 0) > 0,
      };
    },
    enabled: !!vendor?.id,
  });
  
  return {
    ...queryResult,
    isLoading: vendorLoading || queryResult.isLoading,
    vendor,
  };
}

// ============= ACTIVITY FEED =============

export function useVendorActivity() {
  const { data: vendor } = useVendor();
  
  return useQuery({
    queryKey: ['vendor-activity', vendor?.id],
    queryFn: async (): Promise<ActivityEvent[]> => {
      if (!vendor) return [];
      
      const events: ActivityEvent[] = [];
      const thirtyDaysAgo = subDays(new Date(), 30);
      
      // Get offers first
      const { data: offers } = await supabase
        .from('marketplace_offers')
        .select('id, title')
        .eq('vendor_id', vendor.id);
      
      const offerMap = new Map(offers?.map(o => [o.id, o.title]) || []);
      const offerIds = offers?.map(o => o.id) || [];
      
      if (offerIds.length > 0) {
        // Get recent activations
        const { data: activations } = await supabase
          .from('perk_activations')
          .select('id, offer_id, activated_at')
          .in('offer_id', offerIds)
          .gte('activated_at', thirtyDaysAgo.toISOString())
          .order('activated_at', { ascending: false })
          .limit(10);
        
        activations?.forEach(a => {
          events.push({
            id: `activation-${a.id}`,
            type: 'activation',
            title: 'New activation',
            offerId: a.offer_id,
            offerTitle: offerMap.get(a.offer_id) || 'Unknown Offer',
            timestamp: a.activated_at,
          });
        });
      }
      
      // Get recent transactions
      const { data: transactions } = await supabase
        .from('vendor_transactions')
        .select('id, offer_id, redeemed_at, commission_amount')
        .eq('vendor_id', vendor.id)
        .not('redeemed_at', 'is', null)
        .order('redeemed_at', { ascending: false })
        .limit(10);
      
      transactions?.forEach(t => {
        events.push({
          id: `redemption-${t.id}`,
          type: 'redemption',
          title: `Redemption (+AED ${t.commission_amount?.toFixed(0) || '0'})`,
          offerId: t.offer_id || '',
          offerTitle: offerMap.get(t.offer_id || '') || 'Unknown Offer',
          timestamp: t.redeemed_at || '',
        });
      });
      
      // Sort all events by timestamp and take top 8
      return events
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 8);
    },
    enabled: !!vendor?.id,
  });
}

// ============= PROFILE COMPLETENESS =============

export function useVendorProfileCompleteness() {
  const { data: vendor } = useVendor();
  
  return useQuery({
    queryKey: ['vendor-profile-completeness', vendor?.id],
    queryFn: async (): Promise<VendorProfileCompleteness> => {
      if (!vendor) {
        return {
          hasLogo: false,
          hasDescription: false,
          hasCategory: false,
          hasBankDetails: false,
          hasContactEmail: false,
          hasContactPhone: false,
          completionPercent: 0,
          missingFields: ['profile'],
        };
      }
      
      // vendors table has: company_name, contact_email, contact_phone, logo_url, description, website_url
      const checks = {
        hasLogo: !!vendor.logo_url,
        hasDescription: !!vendor.description && vendor.description.length > 10,
        hasCategory: true, // Category is on offers, not vendor
        hasBankDetails: true, // Not in current schema, assume complete
        hasContactEmail: !!vendor.contact_email,
        hasContactPhone: !!vendor.contact_phone,
      };
      
      const fields = Object.entries(checks);
      const completed = fields.filter(([, v]) => v).length;
      const completionPercent = Math.round((completed / fields.length) * 100);
      
      const missingFields: string[] = [];
      if (!checks.hasLogo) missingFields.push('Logo');
      if (!checks.hasDescription) missingFields.push('Description');
      if (!checks.hasContactEmail) missingFields.push('Contact Email');
      if (!checks.hasContactPhone) missingFields.push('Contact Phone');
      
      return {
        ...checks,
        completionPercent,
        missingFields,
      };
    },
    enabled: !!vendor?.id,
  });
}

// ============= DEMO DATA SEEDING =============

const DEMO_OFFER_IMAGES = [
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
];

const DEMO_OFFER_TITLES = [
  { title: '20% Off All Purchases', category: 'Lifestyle & Shopping' },
  { title: 'Premium Gym Membership', category: 'Health & Fitness' },
  { title: 'Family Dining Discount', category: 'Food & Coffee' },
  { title: 'Annual Learning Subscription', category: 'Learning & Skills' },
  { title: 'Weekend Staycation Deal', category: 'Travel & Experiences' },
];

export function useSeedVendorDemoData() {
  const { data: vendor } = useVendor();
  const { isDemoMode } = useDemoMode();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      if (!vendor) throw new Error('Vendor not found');
      if (!isDemoMode) throw new Error('Demo mode not active');
      
      // Check if vendor already has data
      const { data: existingOffers } = await supabase
        .from('marketplace_offers')
        .select('id')
        .eq('vendor_id', vendor.id)
        .limit(1);
      
      if (existingOffers && existingOffers.length > 0) {
        throw new Error('Vendor already has offers');
      }
      
      const now = new Date();
      const offerStatuses = ['active', 'active', 'pending', 'pending', 'active'];
      const createdOffers: string[] = [];
      
      // Create offers
      for (let i = 0; i < 5; i++) {
        const template = DEMO_OFFER_TITLES[i];
        const status = offerStatuses[i];
        const daysOffset = Math.floor(Math.random() * 20) + 5;
        
        // Last offer is expired
        const isExpired = i === 4;
        const validFrom = isExpired 
          ? format(subDays(now, 60), 'yyyy-MM-dd')
          : format(subDays(now, 15), 'yyyy-MM-dd');
        const validTo = isExpired
          ? format(subDays(now, 10), 'yyyy-MM-dd')
          : format(subDays(now, -60 - daysOffset), 'yyyy-MM-dd');
        
        const { data: offer, error } = await supabase
          .from('marketplace_offers')
          .insert({
            vendor_id: vendor.id,
            merchant: vendor.company_name,
            title: template.title,
            description: `Exclusive offer from ${vendor.company_name}. Terms and conditions apply.`,
            category: template.category,
            discount_percent: 10 + Math.floor(Math.random() * 25),
            status: isExpired ? 'active' : status, // Expired but was active
            is_active: status === 'active' && !isExpired,
            is_public: Math.random() > 0.3,
            valid_from: validFrom,
            valid_to: validTo,
            image_url: DEMO_OFFER_IMAGES[i],
            terms: 'Valid on selected items. Cannot be combined with other offers.',
          })
          .select('id')
          .single();
        
        if (error) throw error;
        if (offer) createdOffers.push(offer.id);
      }
      
      // Create activations (only for active offers)
      const activeOfferIds = createdOffers.slice(0, 2);
      
      for (const offerId of activeOfferIds) {
        const numActivations = 15 + Math.floor(Math.random() * 25);
        
        for (let i = 0; i < numActivations; i++) {
          const daysAgo = Math.floor(Math.random() * 28);
          const activatedAt = subDays(now, daysAgo);
          
          // user_id is required - use a placeholder UUID for demo
          await supabase.from('perk_activations').insert({
            offer_id: offerId,
            user_id: '00000000-0000-0000-0000-000000000001', // Demo user
            activated_at: activatedAt.toISOString(),
          });
        }
      }
      
      // Create transactions (redemptions)
      const redemptionCount = 10 + Math.floor(Math.random() * 20);
      
      for (let i = 0; i < redemptionCount; i++) {
        const offerId = activeOfferIds[Math.floor(Math.random() * activeOfferIds.length)];
        const daysAgo = Math.floor(Math.random() * 25);
        const redeemedAt = subDays(now, daysAgo);
        const originalAmount = 100 + Math.floor(Math.random() * 500);
        const discountAmount = originalAmount * 0.2;
        const commissionAmount = discountAmount * ((vendor.commission_rate || 10) / 100);
        
        await supabase.from('vendor_transactions').insert({
          vendor_id: vendor.id,
          offer_id: offerId,
          user_id: '00000000-0000-0000-0000-000000000001', // Demo user
          transaction_type: 'redemption',
          original_amount: originalAmount,
          discount_amount: discountAmount,
          commission_amount: commissionAmount,
          status: Math.random() > 0.3 ? 'settled' : 'pending',
          redeemed_at: redeemedAt.toISOString(),
          settled_at: Math.random() > 0.5 ? subDays(redeemedAt, -5).toISOString() : null,
        });
      }
      
      return { offersCreated: createdOffers.length };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-offers'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-activity'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-transactions'] });
      toast.success('Demo data added successfully');
    },
    onError: (error: Error) => {
      if (error.message === 'Vendor already has offers') {
        toast.info('Vendor already has data');
      } else {
        toast.error('Failed to seed demo data');
        console.error(error);
      }
    },
  });
}
