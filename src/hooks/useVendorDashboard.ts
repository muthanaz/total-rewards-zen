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

const DEMO_OFFERS = [
  {
    title: 'Premium Gym Membership - 25% Off',
    category: 'Health & Fitness',
    tags: ['fitness', 'gym', 'wellness', 'corporate'],
    discount_percent: 25,
    image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop',
    locations: ['Dubai Marina', 'Downtown Dubai', 'JBR'],
    status: 'active' as const,
    is_expired: false,
  },
  {
    title: 'Gourmet Dining Experience',
    category: 'Food & Coffee',
    tags: ['dining', 'restaurant', 'fine-dining', 'date-night'],
    discount_percent: 20,
    image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
    locations: ['DIFC', 'Business Bay'],
    status: 'active' as const,
    is_expired: false,
  },
  {
    title: 'Weekend Spa & Wellness Retreat',
    category: 'Travel & Experiences',
    tags: ['spa', 'wellness', 'relaxation', 'staycation'],
    discount_percent: 30,
    image_url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=300&fit=crop',
    locations: ['Palm Jumeirah', 'JBR'],
    status: 'active' as const,
    is_expired: false,
  },
  {
    title: 'Online Learning Platform - Annual Pass',
    category: 'Learning & Skills',
    tags: ['education', 'courses', 'upskilling', 'career'],
    discount_percent: 40,
    image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop',
    locations: ['Online'],
    status: 'pending' as const,
    is_expired: false,
  },
  {
    title: 'Kids Summer Camp 2025',
    category: 'Family & Kids',
    tags: ['kids', 'summer', 'activities', 'family'],
    discount_percent: 15,
    image_url: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=400&h=300&fit=crop',
    locations: ['Dubai Sports City', 'Al Quoz'],
    status: 'pending' as const,
    is_expired: false,
  },
  {
    title: 'Holiday Season Shopping Spree',
    category: 'Lifestyle & Shopping',
    tags: ['shopping', 'retail', 'fashion', 'seasonal'],
    discount_percent: 35,
    image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
    locations: ['Dubai Mall', 'Mall of Emirates'],
    status: 'active' as const,
    is_expired: true, // This one is expired
  },
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
      const createdOffers: { id: string; status: string; is_expired: boolean }[] = [];
      
      // Create 6 offers with realistic data
      for (let i = 0; i < DEMO_OFFERS.length; i++) {
        const template = DEMO_OFFERS[i];
        
        // Calculate validity window
        const validFrom = template.is_expired 
          ? format(subDays(now, 90), 'yyyy-MM-dd')
          : format(subDays(now, 30 + i * 5), 'yyyy-MM-dd');
        
        const validTo = template.is_expired
          ? format(subDays(now, 15), 'yyyy-MM-dd') // Expired 15 days ago
          : format(subDays(now, -(60 + i * 10)), 'yyyy-MM-dd'); // Future expiry
        
        const { data: offer, error } = await supabase
          .from('marketplace_offers')
          .insert({
            vendor_id: vendor.id,
            merchant: vendor.company_name,
            title: template.title,
            description: `Exclusive offer from ${vendor.company_name}. Enjoy ${template.discount_percent}% off at participating locations. Terms and conditions apply.`,
            category: template.category,
            discount_percent: template.discount_percent,
            status: template.is_expired ? 'active' : template.status, // Expired was active
            is_active: template.status === 'active',
            is_public: true,
            valid_from: validFrom,
            valid_to: validTo,
            image_url: template.image_url,
            tags: template.tags,
            terms: `Valid at: ${template.locations.join(', ')}. Cannot be combined with other offers. Subject to availability.`,
          })
          .select('id')
          .single();
        
        if (error) throw error;
        if (offer) {
          createdOffers.push({ 
            id: offer.id, 
            status: template.status,
            is_expired: template.is_expired,
          });
        }
      }
      
      // Get only active, non-expired offers for activations
      const activeOfferIds = createdOffers
        .filter(o => o.status === 'active' && !o.is_expired)
        .map(o => o.id);
      
      // Create exactly 12 activations spread across active offers
      const activationDistribution = [5, 4, 3]; // Distribute: 5, 4, 3 per offer
      
      for (let offerIdx = 0; offerIdx < activeOfferIds.length; offerIdx++) {
        const offerId = activeOfferIds[offerIdx];
        const numActivations = activationDistribution[offerIdx] || 3;
        
        for (let i = 0; i < numActivations; i++) {
          const daysAgo = Math.floor(Math.random() * 25) + 1;
          const activatedAt = subDays(now, daysAgo);
          
          await supabase.from('perk_activations').insert({
            offer_id: offerId,
            user_id: '00000000-0000-0000-0000-000000000001', // Demo user
            activated_at: activatedAt.toISOString(),
          });
        }
      }
      
      // Create exactly 6 transactions (redemptions) spread across active offers
      const transactionDistribution = [3, 2, 1]; // Distribute: 3, 2, 1 per offer
      
      for (let offerIdx = 0; offerIdx < activeOfferIds.length; offerIdx++) {
        const offerId = activeOfferIds[offerIdx];
        const numTransactions = transactionDistribution[offerIdx] || 1;
        
        for (let i = 0; i < numTransactions; i++) {
          const daysAgo = Math.floor(Math.random() * 20) + 2;
          const redeemedAt = subDays(now, daysAgo);
          const originalAmount = 150 + Math.floor(Math.random() * 400);
          const discountPercent = DEMO_OFFERS[offerIdx].discount_percent;
          const discountAmount = originalAmount * (discountPercent / 100);
          const commissionAmount = discountAmount * ((vendor.commission_rate || 10) / 100);
          
          await supabase.from('vendor_transactions').insert({
            vendor_id: vendor.id,
            offer_id: offerId,
            user_id: '00000000-0000-0000-0000-000000000001', // Demo user
            transaction_type: 'redemption',
            original_amount: originalAmount,
            discount_amount: discountAmount,
            commission_amount: commissionAmount,
            status: i === 0 ? 'pending' : 'settled', // First transaction pending, rest settled
            redeemed_at: redeemedAt.toISOString(),
            settled_at: i === 0 ? null : subDays(redeemedAt, -3).toISOString(),
          });
        }
      }
      
      return { offersCreated: createdOffers.length, activations: 12, transactions: 6 };
    },
    onSuccess: () => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['vendor-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-offers'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-activity'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['marketplace_offers'] }); // Employee marketplace
      toast.success('Demo data seeded: 6 offers, 12 activations, 6 transactions');
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
