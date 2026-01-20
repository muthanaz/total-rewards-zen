import { supabase } from '@/integrations/supabase/client';

// Organization IDs (deterministic for cross-referencing)
const ORG_AD_ID = '11111111-1111-1111-1111-111111111111';
const ORG_DXB_ID = '22222222-2222-2222-2222-222222222222';
const ORG_SUSPENDED_ID = '33333333-3333-3333-3333-333333333333';

// Vendor IDs
const VENDOR_IDS = [
  '44444444-4444-4444-4444-444444444401',
  '44444444-4444-4444-4444-444444444402',
  '44444444-4444-4444-4444-444444444403',
  '44444444-4444-4444-4444-444444444404',
  '44444444-4444-4444-4444-444444444405',
  '44444444-4444-4444-4444-444444444406',
];

// We'll look up an actual admin user at runtime for audit logs and vendor user_id
async function getSystemActorId(): Promise<string> {
  const { data } = await supabase
    .from('profiles')
    .select('user_id')
    .ilike('email', '%admin%')
    .limit(1)
    .maybeSingle();
  
  // Fallback to any user if no admin found
  if (!data?.user_id) {
    const { data: anyUser } = await supabase
      .from('profiles')
      .select('user_id')
      .limit(1)
      .maybeSingle();
    return anyUser?.user_id || '00000000-0000-0000-0000-000000000000';
  }
  
  return data.user_id;
}

// Helper to generate dates
const daysFromNow = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

function getOrganizations() {
  return [
    {
      id: ORG_AD_ID,
      name: 'bnft.demo (AD)',
      status: 'active',
      domain: 'ad.bnft.demo',
      settings: {
        featureFlags: {
          marketplace: true,
          govconnect: true,
          analytics: true,
          recommendations: true,
        },
      },
      primary_color: '#0066FF',
      accent_color: '#00D4AA',
      welcome_message: 'Welcome to bnft.demo Abu Dhabi!',
    },
    {
      id: ORG_DXB_ID,
      name: 'bnft.demo (DXB)',
      status: 'active',
      domain: 'dxb.bnft.demo',
      settings: {
        featureFlags: {
          marketplace: true,
          govconnect: false,
          analytics: true,
          recommendations: true,
        },
      },
      primary_color: '#8B5CF6',
      accent_color: '#F59E0B',
      welcome_message: 'Welcome to bnft.demo Dubai!',
    },
    {
      id: ORG_SUSPENDED_ID,
      name: 'bnft.demo (Suspended)',
      status: 'suspended',
      domain: 'suspended.bnft.demo',
      settings: {
        featureFlags: {
          marketplace: true,
          govconnect: true,
          analytics: true,
          recommendations: true,
        },
      },
      primary_color: '#EF4444',
      accent_color: '#6B7280',
      welcome_message: 'This organization is currently suspended.',
    },
  ];
}

function getVendors(systemActorId: string) {
  return [
    {
      id: VENDOR_IDS[0],
      company_name: 'FitLife Wellness',
      description: 'Premium gym memberships and wellness programs across UAE',
      contact_email: 'partners@fitlifewellness.ae',
      contact_phone: '+971 4 555 1001',
      status: 'active',
      commission_rate: 12,
      logo_url: 'https://ui-avatars.com/api/?name=FL&background=22c55e&color=fff',
      website_url: 'https://fitlifewellness.ae',
      user_id: systemActorId,
    },
    {
      id: VENDOR_IDS[1],
      company_name: 'TechLearn Academy',
      description: 'Online and in-person professional development courses',
      contact_email: 'corporate@techlearn.io',
      contact_phone: '+971 4 555 1002',
      status: 'active',
      commission_rate: 15,
      logo_url: 'https://ui-avatars.com/api/?name=TL&background=3b82f6&color=fff',
      website_url: 'https://techlearn.io',
      user_id: systemActorId,
    },
    {
      id: VENDOR_IDS[2],
      company_name: 'Family First Childcare',
      description: 'Daycare, after-school programs, and family activities',
      contact_email: 'hello@familyfirst.ae',
      contact_phone: '+971 4 555 1003',
      status: 'active',
      commission_rate: 10,
      logo_url: 'https://ui-avatars.com/api/?name=FF&background=ec4899&color=fff',
      website_url: 'https://familyfirst.ae',
      user_id: systemActorId,
    },
    {
      id: VENDOR_IDS[3],
      company_name: 'RideShare Corporate',
      description: 'Corporate transportation and commute solutions',
      contact_email: 'business@rideshare.ae',
      contact_phone: '+971 4 555 1004',
      status: 'active',
      commission_rate: 8,
      logo_url: 'https://ui-avatars.com/api/?name=RS&background=f59e0b&color=fff',
      website_url: 'https://rideshare.ae',
      user_id: systemActorId,
    },
    {
      id: VENDOR_IDS[4],
      company_name: 'Gourmet Bites',
      description: 'Healthy meal delivery for busy professionals',
      contact_email: 'corporate@gourmetbites.ae',
      contact_phone: '+971 4 555 1005',
      status: 'pending',
      commission_rate: 10,
      logo_url: 'https://ui-avatars.com/api/?name=GB&background=ef4444&color=fff',
      website_url: 'https://gourmetbites.ae',
      user_id: systemActorId,
    },
    {
      id: VENDOR_IDS[5],
      company_name: 'ZenMind Therapy',
      description: 'Mental health and counseling services',
      contact_email: 'partners@zenmind.ae',
      contact_phone: '+971 4 555 1006',
      status: 'suspended',
      commission_rate: 15,
      logo_url: 'https://ui-avatars.com/api/?name=ZM&background=8b5cf6&color=fff',
      website_url: 'https://zenmind.ae',
      user_id: systemActorId,
    },
  ];
}

function getMarketplaceOffers() {
  return [
    // FitLife Wellness offers
    {
      vendor_id: VENDOR_IDS[0],
      title: '30% Off Annual Gym Membership',
      description: 'Get fit with our comprehensive gym package including classes',
      category: 'Wellness',
      discount_percent: 30,
      merchant: 'FitLife Wellness',
      status: 'active',
      is_active: true,
      is_public: true,
      sponsored: true,
      rating: 4.7,
      valid_from: daysFromNow(-30),
      valid_to: daysFromNow(180),
      tags: ['fitness', 'gym', 'health'],
    },
    {
      vendor_id: VENDOR_IDS[0],
      title: 'Free Personal Training Session',
      description: 'Complimentary PT session with any membership signup',
      category: 'Wellness',
      discount_percent: 100,
      merchant: 'FitLife Wellness',
      status: 'active',
      is_active: true,
      is_public: true,
      sponsored: false,
      rating: 4.5,
      valid_from: daysFromNow(-15),
      valid_to: daysFromNow(60),
      tags: ['fitness', 'personal-training'],
    },
    {
      vendor_id: VENDOR_IDS[0],
      title: '20% Off Yoga Retreats',
      description: 'Weekend yoga retreats in Hatta and Ras Al Khaimah',
      category: 'Wellness',
      discount_percent: 20,
      merchant: 'FitLife Wellness',
      status: 'active',
      is_active: true,
      is_public: false,
      sponsored: false,
      rating: 4.8,
      valid_from: daysFromNow(30),
      valid_to: daysFromNow(120),
      tags: ['yoga', 'retreat', 'wellness'],
    },
    // TechLearn Academy offers
    {
      vendor_id: VENDOR_IDS[1],
      title: '25% Off Leadership Courses',
      description: 'Develop leadership skills with our certified programs',
      category: 'Learning',
      discount_percent: 25,
      merchant: 'TechLearn Academy',
      status: 'active',
      is_active: true,
      is_public: true,
      sponsored: true,
      rating: 4.6,
      valid_from: daysFromNow(-60),
      valid_to: daysFromNow(90),
      tags: ['leadership', 'career', 'development'],
    },
    {
      vendor_id: VENDOR_IDS[1],
      title: 'Buy 2 Get 1 Free - Tech Certifications',
      description: 'AWS, Azure, and Google Cloud certifications bundle',
      category: 'Learning',
      discount_percent: 33,
      merchant: 'TechLearn Academy',
      status: 'active',
      is_active: true,
      is_public: true,
      sponsored: false,
      rating: 4.4,
      valid_from: daysFromNow(-10),
      valid_to: daysFromNow(45),
      tags: ['tech', 'certifications', 'cloud'],
    },
    {
      vendor_id: VENDOR_IDS[1],
      title: '15% Off Language Courses',
      description: 'Arabic, French, German, and Mandarin for professionals',
      category: 'Learning',
      discount_percent: 15,
      merchant: 'TechLearn Academy',
      status: 'pending',
      is_active: false,
      is_public: true,
      sponsored: false,
      rating: 4.3,
      valid_from: daysFromNow(15),
      valid_to: daysFromNow(180),
      tags: ['language', 'skills'],
    },
    // Family First Childcare offers
    {
      vendor_id: VENDOR_IDS[2],
      title: '10% Off Summer Camp Registration',
      description: 'Fun and educational summer programs for kids 4-12',
      category: 'Family',
      discount_percent: 10,
      merchant: 'Family First Childcare',
      status: 'active',
      is_active: true,
      is_public: true,
      sponsored: false,
      rating: 4.6,
      valid_from: daysFromNow(-20),
      valid_to: daysFromNow(90),
      tags: ['kids', 'summer', 'activities'],
    },
    {
      vendor_id: VENDOR_IDS[2],
      title: 'Free Trial Week - After School Program',
      description: 'Try our after-school care program with no commitment',
      category: 'Family',
      discount_percent: 100,
      merchant: 'Family First Childcare',
      status: 'active',
      is_active: true,
      is_public: true,
      sponsored: true,
      rating: 4.7,
      valid_from: daysFromNow(0),
      valid_to: daysFromNow(60),
      tags: ['childcare', 'after-school'],
    },
    {
      vendor_id: VENDOR_IDS[2],
      title: '20% Off Birthday Party Packages',
      description: 'Make birthdays special with our themed party venues',
      category: 'Family',
      discount_percent: 20,
      merchant: 'Family First Childcare',
      status: 'active',
      is_active: true,
      is_public: false,
      sponsored: false,
      rating: 4.5,
      valid_from: daysFromNow(-45),
      valid_to: daysFromNow(120),
      tags: ['party', 'kids', 'celebration'],
    },
    // RideShare Corporate offers
    {
      vendor_id: VENDOR_IDS[3],
      title: '35% Off Monthly Commute Pass',
      description: 'Unlimited rides to/from work within Dubai',
      category: 'Transport',
      discount_percent: 35,
      merchant: 'RideShare Corporate',
      status: 'active',
      is_active: true,
      is_public: true,
      sponsored: true,
      rating: 4.4,
      valid_from: daysFromNow(-7),
      valid_to: daysFromNow(365),
      tags: ['commute', 'transport', 'monthly'],
    },
    {
      vendor_id: VENDOR_IDS[3],
      title: '15% Off Airport Transfers',
      description: 'Reliable airport pickup and dropoff services',
      category: 'Transport',
      discount_percent: 15,
      merchant: 'RideShare Corporate',
      status: 'active',
      is_active: true,
      is_public: true,
      sponsored: false,
      rating: 4.6,
      valid_from: daysFromNow(-30),
      valid_to: daysFromNow(180),
      tags: ['airport', 'travel'],
    },
    {
      vendor_id: VENDOR_IDS[3],
      title: 'Free First Ride',
      description: 'New users get their first ride free (up to AED 50)',
      category: 'Transport',
      discount_percent: 100,
      merchant: 'RideShare Corporate',
      status: 'active',
      is_active: true,
      is_public: true,
      sponsored: false,
      rating: 4.3,
      valid_from: daysFromNow(-90),
      valid_to: daysFromNow(30),
      tags: ['new-user', 'promo'],
    },
    // Gourmet Bites offers (pending vendor)
    {
      vendor_id: VENDOR_IDS[4],
      title: '20% Off Weekly Meal Plans',
      description: 'Healthy, chef-prepared meals delivered to your office',
      category: 'Food',
      discount_percent: 20,
      merchant: 'Gourmet Bites',
      status: 'pending',
      is_active: false,
      is_public: true,
      sponsored: false,
      rating: 4.5,
      valid_from: daysFromNow(7),
      valid_to: daysFromNow(90),
      tags: ['food', 'healthy', 'delivery'],
    },
    {
      vendor_id: VENDOR_IDS[4],
      title: 'Free Snack Box with First Order',
      description: 'Complimentary healthy snack box worth AED 75',
      category: 'Food',
      discount_percent: 100,
      merchant: 'Gourmet Bites',
      status: 'pending',
      is_active: false,
      is_public: true,
      sponsored: true,
      rating: 4.4,
      valid_from: daysFromNow(14),
      valid_to: daysFromNow(60),
      tags: ['snacks', 'healthy', 'free'],
    },
    // ZenMind Therapy offers (suspended vendor)
    {
      vendor_id: VENDOR_IDS[5],
      title: '30% Off Counseling Sessions',
      description: 'Professional mental health support for employees',
      category: 'Wellness',
      discount_percent: 30,
      merchant: 'ZenMind Therapy',
      status: 'suspended',
      is_active: false,
      is_public: true,
      sponsored: false,
      rating: 4.8,
      valid_from: daysFromNow(-60),
      valid_to: daysFromNow(120),
      tags: ['mental-health', 'counseling'],
    },
    // Expired offers for testing
    {
      vendor_id: VENDOR_IDS[0],
      title: 'New Year Fitness Special',
      description: '50% off January memberships - EXPIRED',
      category: 'Wellness',
      discount_percent: 50,
      merchant: 'FitLife Wellness',
      status: 'active',
      is_active: true,
      is_public: true,
      sponsored: false,
      rating: 4.6,
      valid_from: daysFromNow(-90),
      valid_to: daysFromNow(-30),
      tags: ['expired', 'promo'],
    },
    {
      vendor_id: VENDOR_IDS[1],
      title: 'Holiday Learning Bundle',
      description: 'Special holiday pricing on all courses - EXPIRED',
      category: 'Learning',
      discount_percent: 40,
      merchant: 'TechLearn Academy',
      status: 'active',
      is_active: true,
      is_public: true,
      sponsored: true,
      rating: 4.5,
      valid_from: daysFromNow(-120),
      valid_to: daysFromNow(-60),
      tags: ['expired', 'bundle'],
    },
    // Future offers
    {
      vendor_id: VENDOR_IDS[2],
      title: 'Back to School Special 2026',
      description: 'Coming soon: Special rates for the new school year',
      category: 'Family',
      discount_percent: 25,
      merchant: 'Family First Childcare',
      status: 'active',
      is_active: true,
      is_public: true,
      sponsored: true,
      rating: null,
      valid_from: daysFromNow(60),
      valid_to: daysFromNow(150),
      tags: ['upcoming', 'school'],
    },
    {
      vendor_id: VENDOR_IDS[3],
      title: 'Ramadan Special Rides',
      description: 'Coming soon: Special rates during Ramadan',
      category: 'Transport',
      discount_percent: 20,
      merchant: 'RideShare Corporate',
      status: 'active',
      is_active: true,
      is_public: true,
      sponsored: false,
      rating: null,
      valid_from: daysFromNow(45),
      valid_to: daysFromNow(75),
      tags: ['upcoming', 'ramadan'],
    },
  ];
}

function getAuditLogEntries(systemActorId: string) {
  return [
    {
      user_id: systemActorId,
      actor_role: 'admin',
      action: 'ORG_CREATE',
      resource_type: 'organization',
      resource_id: ORG_AD_ID,
      details: { org_name: 'bnft.demo (AD)', status: 'active' },
      outcome: 'success',
      created_at: daysFromNow(-60) + 'T09:00:00Z',
    },
    {
      user_id: systemActorId,
      actor_role: 'admin',
      action: 'ORG_CREATE',
      resource_type: 'organization',
      resource_id: ORG_DXB_ID,
      details: { org_name: 'bnft.demo (DXB)', status: 'active' },
      outcome: 'success',
      created_at: daysFromNow(-55) + 'T10:30:00Z',
    },
    {
      user_id: systemActorId,
      actor_role: 'admin',
      action: 'FLAG_TOGGLE',
      resource_type: 'feature_flag',
      resource_id: ORG_DXB_ID,
      details: { flag: 'govconnect', before: true, after: false, reason: 'Not available in Dubai region' },
      outcome: 'success',
      created_at: daysFromNow(-50) + 'T14:15:00Z',
    },
    {
      user_id: systemActorId,
      actor_role: 'admin',
      action: 'VENDOR_APPROVE',
      resource_type: 'vendor',
      resource_id: VENDOR_IDS[0],
      details: { vendor_name: 'FitLife Wellness', before_status: 'pending', after_status: 'active' },
      outcome: 'success',
      created_at: daysFromNow(-45) + 'T11:00:00Z',
    },
    {
      user_id: systemActorId,
      actor_role: 'admin',
      action: 'VENDOR_APPROVE',
      resource_type: 'vendor',
      resource_id: VENDOR_IDS[1],
      details: { vendor_name: 'TechLearn Academy', before_status: 'pending', after_status: 'active' },
      outcome: 'success',
      created_at: daysFromNow(-40) + 'T09:30:00Z',
    },
    {
      user_id: systemActorId,
      actor_role: 'admin',
      action: 'OFFER_APPROVE',
      resource_type: 'offer',
      resource_id: 'offer-001',
      details: { offer_title: '30% Off Annual Gym Membership', vendor: 'FitLife Wellness' },
      outcome: 'success',
      created_at: daysFromNow(-38) + 'T15:45:00Z',
    },
    {
      user_id: systemActorId,
      actor_role: 'admin',
      action: 'VENDOR_SUSPEND',
      resource_type: 'vendor',
      resource_id: VENDOR_IDS[5],
      details: { vendor_name: 'ZenMind Therapy', before_status: 'active', after_status: 'suspended', reason: 'License verification pending' },
      outcome: 'success',
      created_at: daysFromNow(-20) + 'T16:00:00Z',
    },
    {
      user_id: systemActorId,
      actor_role: 'admin',
      action: 'ORG_CREATE',
      resource_type: 'organization',
      resource_id: ORG_SUSPENDED_ID,
      details: { org_name: 'bnft.demo (Suspended)', status: 'active' },
      outcome: 'success',
      created_at: daysFromNow(-15) + 'T10:00:00Z',
    },
    {
      user_id: systemActorId,
      actor_role: 'admin',
      action: 'ORG_SUSPEND',
      resource_type: 'organization',
      resource_id: ORG_SUSPENDED_ID,
      details: { org_name: 'bnft.demo (Suspended)', before_status: 'active', after_status: 'suspended', reason: 'Payment overdue' },
      outcome: 'success',
      created_at: daysFromNow(-10) + 'T14:30:00Z',
    },
    {
      user_id: systemActorId,
      actor_role: 'admin',
      action: 'FLAG_TOGGLE',
      resource_type: 'feature_flag',
      resource_id: ORG_AD_ID,
      details: { flag: 'recommendations', before: false, after: true },
      outcome: 'success',
      created_at: daysFromNow(-5) + 'T11:15:00Z',
    },
    {
      user_id: systemActorId,
      actor_role: 'admin',
      action: 'OFFER_APPROVE',
      resource_type: 'offer',
      resource_id: 'offer-010',
      details: { offer_title: '35% Off Monthly Commute Pass', vendor: 'RideShare Corporate' },
      outcome: 'success',
      created_at: daysFromNow(-3) + 'T09:00:00Z',
    },
    {
      user_id: systemActorId,
      actor_role: 'admin',
      action: 'DATA_EXPORT',
      resource_type: 'report',
      resource_id: 'utilization-q4-2025',
      details: { report_type: 'utilization', format: 'csv', records: 1250 },
      outcome: 'success',
      created_at: daysFromNow(-1) + 'T16:45:00Z',
    },
  ];
}

export async function checkIfSeeded(): Promise<boolean> {
  const { data } = await supabase
    .from('organizations')
    .select('id')
    .in('id', [ORG_AD_ID, ORG_DXB_ID, ORG_SUSPENDED_ID]);
  
  return (data?.length ?? 0) >= 2;
}

export async function seedAdminData(): Promise<{ success: boolean; message: string; counts: Record<string, number> }> {
  const counts: Record<string, number> = {};
  
  try {
    // Get a valid user ID for foreign key constraints
    const systemActorId = await getSystemActorId();
    
    if (systemActorId === '00000000-0000-0000-0000-000000000000') {
      return {
        success: false,
        message: 'No user found in database. Please create at least one user first.',
        counts,
      };
    }

    // 1. Insert vendors first (they don't have org triggers)
    const vendors = getVendors(systemActorId);
    const { error: vendorError } = await supabase
      .from('vendors')
      .upsert(vendors, { onConflict: 'id' });
    
    if (vendorError) throw new Error(`Vendors: ${vendorError.message}`);
    counts.vendors = vendors.length;

    // 2. Insert marketplace offers
    const offers = getMarketplaceOffers();
    const { error: offerError } = await supabase
      .from('marketplace_offers')
      .upsert(offers);
    
    if (offerError) throw new Error(`Offers: ${offerError.message}`);
    counts.offers = offers.length;

    // 3. Insert audit logs
    const auditLogs = getAuditLogEntries(systemActorId);
    const { error: auditError } = await supabase
      .from('audit_logs')
      .insert(auditLogs);
    
    if (auditError) throw new Error(`Audit logs: ${auditError.message}`);
    counts.auditLogs = auditLogs.length;

    // 4. Update existing organization with demo settings (instead of inserting new ones to avoid trigger issues)
    // We'll update the Default Organization and use it as our demo org
    const { data: existingOrg } = await supabase
      .from('organizations')
      .select('id')
      .eq('name', 'Default Organization')
      .maybeSingle();
    
    if (existingOrg) {
      await supabase
        .from('organizations')
        .update({
          settings: {
            featureFlags: {
              marketplace: true,
              govconnect: true,
              analytics: true,
              recommendations: true,
            },
          },
          welcome_message: 'Welcome to bnft.demo!',
        })
        .eq('id', existingOrg.id);
    }
    counts.organizations = 1;

    return {
      success: true,
      message: `Seeded ${counts.vendors} vendors, ${counts.offers} offers, ${counts.auditLogs} audit logs`,
      counts,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      counts,
    };
  }
}

export async function clearSeedData(): Promise<{ success: boolean; message: string }> {
  try {
    // Delete in reverse order of dependencies
    await supabase.from('marketplace_offers').delete().in('vendor_id', VENDOR_IDS);
    await supabase.from('vendors').delete().in('id', VENDOR_IDS);
    // Don't delete audit logs - they're historical records
    
    return { success: true, message: 'Seed data cleared' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export const DEMO_ORG_IDS = {
  AD: ORG_AD_ID,
  DXB: ORG_DXB_ID,
  SUSPENDED: ORG_SUSPENDED_ID,
};
