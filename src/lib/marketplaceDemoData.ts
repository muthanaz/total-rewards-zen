/**
 * Marketplace Demo Data
 * 24 realistic offers: 6 employer-sponsored, 6 card-linked, various categories
 */

export interface DemoMarketplaceOffer {
  id: string;
  title: string;
  merchant: string;
  description: string;
  category: string;
  discount_percent?: number;
  discount_amount?: number;
  rating?: number;
  image_url?: string;
  is_public: boolean;
  sponsored: boolean;
  card_linked: boolean;
  card_bank?: string;
  eligible: boolean;
  tags: string[];
  terms: string;
  valid_from: string;
  valid_to: string;
  is_new?: boolean;
  is_limited?: boolean;
  recommendation_reason?: 'family' | 'health' | 'mobility' | 'location' | 'interest' | 'high_value' | 'popular';
  created_at: string;
}

// Demo marketplace offers - 24 total
export const DEMO_MARKETPLACE_OFFERS: DemoMarketplaceOffer[] = [
  // === EMPLOYER-SPONSORED (6) ===
  {
    id: 'demo-offer-001',
    title: '25% Off Annual Gym Membership',
    merchant: 'Fitness First',
    description: 'Get 25% off any annual membership at all Fitness First locations across the UAE. Includes access to group classes and personal training sessions.',
    category: 'Health & Fitness',
    discount_percent: 25,
    rating: 4.8,
    image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
    is_public: false,
    sponsored: true,
    card_linked: false,
    eligible: true,
    tags: ['Wellness', 'Employer-Sponsored', 'Popular'],
    terms: 'Valid for new memberships only. Must present employee ID at signup. Cannot be combined with other offers.',
    valid_from: '2024-01-01',
    valid_to: '2025-12-31',
    recommendation_reason: 'health',
    created_at: '2024-06-15',
  },
  {
    id: 'demo-offer-002',
    title: 'AED 500 Learning Credit',
    merchant: 'Coursera',
    description: 'Your employer provides AED 500 annual credit for professional development courses on Coursera. Upskill with world-class education.',
    category: 'Learning & Skills',
    discount_amount: 500,
    rating: 4.9,
    image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop',
    is_public: false,
    sponsored: true,
    card_linked: false,
    eligible: true,
    tags: ['Learning', 'Employer-Sponsored', 'Career Growth'],
    terms: 'Credit resets annually. Unused credits do not roll over. Valid for individual courses and specializations.',
    valid_from: '2024-01-01',
    valid_to: '2025-12-31',
    recommendation_reason: 'interest',
    created_at: '2024-03-01',
  },
  {
    id: 'demo-offer-003',
    title: '30% Off Dental Care',
    merchant: 'Mediclinic Dental',
    description: 'Comprehensive dental coverage with 30% off all treatments including cleanings, fillings, and cosmetic procedures.',
    category: 'Health & Fitness',
    discount_percent: 30,
    rating: 4.7,
    image_url: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400&h=300&fit=crop',
    is_public: false,
    sponsored: true,
    card_linked: false,
    eligible: true,
    tags: ['Health', 'Employer-Sponsored', 'Dental'],
    terms: 'Valid at all Mediclinic Dental locations in UAE. Some exclusions apply for specialized treatments.',
    valid_from: '2024-01-01',
    valid_to: '2025-12-31',
    recommendation_reason: 'health',
    created_at: '2024-02-10',
  },
  {
    id: 'demo-offer-004',
    title: 'Kids Summer Camp Discount',
    merchant: 'British Orchard Nursery',
    description: '20% off summer camp registration for employees with children. Includes sports, arts, and educational activities.',
    category: 'Family & Parenting',
    discount_percent: 20,
    rating: 4.6,
    image_url: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=300&fit=crop',
    is_public: false,
    sponsored: true,
    card_linked: false,
    eligible: true,
    tags: ['Family', 'Employer-Sponsored', 'Kids'],
    terms: 'Valid for employees with registered dependents. Book before May 31st for summer programs.',
    valid_from: '2024-04-01',
    valid_to: '2025-08-31',
    recommendation_reason: 'family',
    created_at: '2024-04-01',
  },
  {
    id: 'demo-offer-005',
    title: 'Mental Wellness Sessions',
    merchant: 'Calm (App)',
    description: 'Free 1-year premium subscription to Calm app for meditation, sleep, and mental wellness support.',
    category: 'Lifestyle & Shopping',
    discount_percent: 100,
    rating: 4.9,
    image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop',
    is_public: false,
    sponsored: true,
    card_linked: false,
    eligible: true,
    tags: ['Wellness', 'Employer-Sponsored', 'Mental Health'],
    terms: 'One subscription per employee. Activate within 30 days of receiving code.',
    valid_from: '2024-01-01',
    valid_to: '2025-12-31',
    is_new: true,
    recommendation_reason: 'health',
    created_at: '2024-09-01',
  },
  {
    id: 'demo-offer-006',
    title: 'Commute Allowance Top-up',
    merchant: 'Careem',
    description: 'Extra AED 200 monthly Careem credit for work commutes. Automatic top-up to your Careem wallet.',
    category: 'Mobility',
    discount_amount: 200,
    rating: 4.5,
    image_url: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=300&fit=crop',
    is_public: false,
    sponsored: true,
    card_linked: false,
    eligible: true,
    tags: ['Transport', 'Employer-Sponsored', 'Commute'],
    terms: 'Valid for work commute rides only. Credit expires at end of each month.',
    valid_from: '2024-01-01',
    valid_to: '2025-12-31',
    recommendation_reason: 'mobility',
    created_at: '2024-01-15',
  },

  // === CARD-LINKED OFFERS (6) ===
  {
    id: 'demo-offer-007',
    title: '15% Cashback on Groceries',
    merchant: 'Carrefour',
    description: 'Link your Emirates NBD card for automatic 15% cashback on all grocery purchases at Carrefour.',
    category: 'Everyday Essentials',
    discount_percent: 15,
    rating: 4.4,
    image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop',
    is_public: true,
    sponsored: false,
    card_linked: true,
    card_bank: 'Emirates NBD',
    eligible: true,
    tags: ['Groceries', 'Card-Linked', 'Cashback'],
    terms: 'Maximum cashback AED 100 per month. Valid only with linked Emirates NBD cards.',
    valid_from: '2024-01-01',
    valid_to: '2025-12-31',
    recommendation_reason: 'popular',
    created_at: '2024-05-20',
  },
  {
    id: 'demo-offer-008',
    title: '20% Off Fine Dining',
    merchant: 'Pierchic Restaurant',
    description: 'Exclusive 20% discount on the total bill when paying with your ADCB card at Pierchic.',
    category: 'Food & Coffee',
    discount_percent: 20,
    rating: 4.9,
    image_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
    is_public: true,
    sponsored: false,
    card_linked: true,
    card_bank: 'ADCB',
    eligible: true,
    tags: ['Dining', 'Card-Linked', 'Premium'],
    terms: 'Valid for dine-in only. Advance booking required. Excludes special occasions and holidays.',
    valid_from: '2024-01-01',
    valid_to: '2025-12-31',
    is_limited: true,
    recommendation_reason: 'high_value',
    created_at: '2024-07-01',
  },
  {
    id: 'demo-offer-009',
    title: 'Airport Lounge Access',
    merchant: 'Dubai International Airport',
    description: 'Complimentary lounge access at DXB when flying with your FAB Platinum card.',
    category: 'Travel & Experiences',
    discount_percent: 100,
    rating: 4.7,
    image_url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=300&fit=crop',
    is_public: true,
    sponsored: false,
    card_linked: true,
    card_bank: 'FAB',
    eligible: false,
    tags: ['Travel', 'Card-Linked', 'Premium'],
    terms: 'Valid for FAB Platinum cardholders only. Two guests allowed per visit.',
    valid_from: '2024-01-01',
    valid_to: '2025-12-31',
    recommendation_reason: 'high_value',
    created_at: '2024-04-15',
  },
  {
    id: 'demo-offer-010',
    title: 'Fuel Cashback 5%',
    merchant: 'ENOC',
    description: 'Get 5% automatic cashback on fuel purchases at any ENOC station with your linked card.',
    category: 'Mobility',
    discount_percent: 5,
    rating: 4.3,
    image_url: 'https://images.unsplash.com/photo-1615906655593-ad0386982a0f?w=400&h=300&fit=crop',
    is_public: true,
    sponsored: false,
    card_linked: true,
    card_bank: 'Emirates NBD',
    eligible: true,
    tags: ['Transport', 'Card-Linked', 'Fuel'],
    terms: 'Maximum cashback AED 50 per month. Valid at ENOC and EPPCO stations.',
    valid_from: '2024-01-01',
    valid_to: '2025-12-31',
    recommendation_reason: 'mobility',
    created_at: '2024-02-28',
  },
  {
    id: 'demo-offer-011',
    title: '10% Off Home Furniture',
    merchant: 'IKEA UAE',
    description: 'Link your card for 10% off on furniture and home accessories at IKEA stores and online.',
    category: 'Home & Living',
    discount_percent: 10,
    rating: 4.5,
    image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop',
    is_public: true,
    sponsored: false,
    card_linked: true,
    card_bank: 'Any Bank',
    eligible: true,
    tags: ['Home', 'Card-Linked', 'Furniture'],
    terms: 'Excludes sale items and kitchen services. Valid on purchases above AED 500.',
    valid_from: '2024-01-01',
    valid_to: '2025-12-31',
    recommendation_reason: 'location',
    created_at: '2024-06-10',
  },
  {
    id: 'demo-offer-012',
    title: 'Spa & Wellness 25% Off',
    merchant: 'The Ritz-Carlton Spa',
    description: 'Indulge in luxury spa treatments with 25% off when paying with your linked premium card.',
    category: 'Health & Fitness',
    discount_percent: 25,
    rating: 4.9,
    image_url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=300&fit=crop',
    is_public: true,
    sponsored: false,
    card_linked: true,
    card_bank: 'ADCB',
    eligible: true,
    tags: ['Wellness', 'Card-Linked', 'Luxury'],
    terms: 'Advance booking required. Valid on treatments above AED 300.',
    valid_from: '2024-01-01',
    valid_to: '2025-12-31',
    is_new: true,
    recommendation_reason: 'health',
    created_at: '2024-08-15',
  },

  // === PUBLIC PARTNER OFFERS (12) ===
  {
    id: 'demo-offer-013',
    title: '15% Off Coffee & Pastries',
    merchant: 'Starbucks',
    description: 'Start your day right with 15% off on all beverages and pastries at Starbucks locations.',
    category: 'Food & Coffee',
    discount_percent: 15,
    rating: 4.5,
    image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop',
    is_public: true,
    sponsored: false,
    card_linked: false,
    eligible: true,
    tags: ['Coffee', 'Food', 'Daily'],
    terms: 'Valid at participating Starbucks locations. Cannot be combined with rewards.',
    valid_from: '2024-01-01',
    valid_to: '2025-12-31',
    recommendation_reason: 'popular',
    created_at: '2024-03-15',
  },
  {
    id: 'demo-offer-014',
    title: 'GymNation Membership 30% Off',
    merchant: 'GymNation',
    description: 'Join the UAE\'s most affordable gym with an additional 30% off for corporate employees.',
    category: 'Health & Fitness',
    discount_percent: 30,
    rating: 4.2,
    image_url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&h=300&fit=crop',
    is_public: true,
    sponsored: false,
    card_linked: false,
    eligible: true,
    tags: ['Fitness', 'Gym', 'Value'],
    terms: 'Valid for 12-month memberships. Present employee ID at signup.',
    valid_from: '2024-01-01',
    valid_to: '2025-12-31',
    recommendation_reason: 'health',
    created_at: '2024-05-01',
  },
  {
    id: 'demo-offer-015',
    title: 'LinkedIn Learning Access',
    merchant: 'LinkedIn',
    description: 'Get 40% off LinkedIn Learning annual subscription for unlimited professional courses.',
    category: 'Learning & Skills',
    discount_percent: 40,
    rating: 4.6,
    image_url: 'https://images.unsplash.com/photo-1432888622747-4eb9a8f2c293?w=400&h=300&fit=crop',
    is_public: true,
    sponsored: false,
    card_linked: false,
    eligible: true,
    tags: ['Learning', 'Career', 'Online'],
    terms: 'New subscribers only. Annual billing required.',
    valid_from: '2024-01-01',
    valid_to: '2025-12-31',
    recommendation_reason: 'interest',
    created_at: '2024-04-20',
  },
  {
    id: 'demo-offer-016',
    title: 'Family Brunch 20% Off',
    merchant: 'Jumeirah Al Qasr',
    description: 'Enjoy a luxurious family brunch with 20% off every Friday at Jumeirah Al Qasr.',
    category: 'Food & Coffee',
    discount_percent: 20,
    rating: 4.8,
    image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
    is_public: true,
    sponsored: false,
    card_linked: false,
    eligible: true,
    tags: ['Dining', 'Family', 'Brunch'],
    terms: 'Advance booking required. Valid for parties of 4 or more.',
    valid_from: '2024-01-01',
    valid_to: '2025-12-31',
    recommendation_reason: 'family',
    created_at: '2024-02-01',
  },
  {
    id: 'demo-offer-017',
    title: 'Kids Play Zone Free Entry',
    merchant: 'Kidzania Dubai',
    description: 'One free child entry with every paying adult. Perfect for family weekends.',
    category: 'Family & Parenting',
    discount_percent: 50,
    rating: 4.7,
    image_url: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=300&fit=crop',
    is_public: true,
    sponsored: false,
    card_linked: false,
    eligible: true,
    tags: ['Family', 'Kids', 'Entertainment'],
    terms: 'Valid weekends only. Maximum 2 free children per family.',
    valid_from: '2024-01-01',
    valid_to: '2025-12-31',
    recommendation_reason: 'family',
    created_at: '2024-06-01',
  },
  {
    id: 'demo-offer-018',
    title: 'Desert Safari Adventure',
    merchant: 'Arabian Adventures',
    description: '25% off premium desert safari experiences including dinner and entertainment.',
    category: 'Travel & Experiences',
    discount_percent: 25,
    rating: 4.6,
    image_url: 'https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?w=400&h=300&fit=crop',
    is_public: true,
    sponsored: false,
    card_linked: false,
    eligible: true,
    tags: ['Experience', 'Tourism', 'Adventure'],
    terms: 'Advance booking required. Subject to availability.',
    valid_from: '2024-01-01',
    valid_to: '2025-12-31',
    recommendation_reason: 'location',
    created_at: '2024-03-10',
  },
  {
    id: 'demo-offer-019',
    title: 'Pet Care Discount',
    merchant: 'Modern Vet',
    description: '15% off all veterinary services and pet supplies at Modern Vet clinics.',
    category: 'Lifestyle & Shopping',
    discount_percent: 15,
    rating: 4.4,
    image_url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop',
    is_public: true,
    sponsored: false,
    card_linked: false,
    eligible: true,
    tags: ['Pets', 'Health', 'Lifestyle'],
    terms: 'Valid at all Modern Vet locations in UAE.',
    valid_from: '2024-01-01',
    valid_to: '2025-12-31',
    recommendation_reason: 'interest',
    created_at: '2024-07-15',
  },
  {
    id: 'demo-offer-020',
    title: 'Car Wash Subscription',
    merchant: 'WashMen',
    description: 'Get 40% off monthly car wash subscription with home service included.',
    category: 'Mobility',
    discount_percent: 40,
    rating: 4.3,
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    is_public: true,
    sponsored: false,
    card_linked: false,
    eligible: true,
    tags: ['Auto', 'Service', 'Convenience'],
    terms: 'Minimum 3-month subscription. Service available in Dubai and Abu Dhabi.',
    valid_from: '2024-01-01',
    valid_to: '2025-12-31',
    recommendation_reason: 'mobility',
    created_at: '2024-05-15',
  },
  {
    id: 'demo-offer-021',
    title: 'Home Cleaning Service',
    merchant: 'Justmop',
    description: 'First 3 home cleaning sessions at AED 99 each (usually AED 149).',
    category: 'Home & Living',
    discount_amount: 50,
    rating: 4.1,
    image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
    is_public: true,
    sponsored: false,
    card_linked: false,
    eligible: true,
    tags: ['Home', 'Cleaning', 'Service'],
    terms: 'New customers only. Valid for standard 3-hour cleaning sessions.',
    valid_from: '2024-01-01',
    valid_to: '2025-12-31',
    is_new: true,
    recommendation_reason: 'location',
    created_at: '2024-09-05',
  },
  {
    id: 'demo-offer-022',
    title: 'Yoga Unlimited Classes',
    merchant: 'YOGA1',
    description: '50% off your first month of unlimited yoga classes at any YOGA1 studio.',
    category: 'Health & Fitness',
    discount_percent: 50,
    rating: 4.7,
    image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop',
    is_public: true,
    sponsored: false,
    card_linked: false,
    eligible: true,
    tags: ['Fitness', 'Yoga', 'Wellness'],
    terms: 'New members only. Continues at regular rate after first month.',
    valid_from: '2024-01-01',
    valid_to: '2025-12-31',
    recommendation_reason: 'health',
    created_at: '2024-04-01',
  },
  {
    id: 'demo-offer-023',
    title: 'Electronics Discount',
    merchant: 'Sharaf DG',
    description: '10% off on electronics and appliances with exclusive employee pricing.',
    category: 'Everyday Essentials',
    discount_percent: 10,
    rating: 4.2,
    image_url: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400&h=300&fit=crop',
    is_public: true,
    sponsored: false,
    card_linked: false,
    eligible: true,
    tags: ['Electronics', 'Shopping', 'Tech'],
    terms: 'Cannot be combined with sale prices. Valid on items above AED 200.',
    valid_from: '2024-01-01',
    valid_to: '2025-12-31',
    recommendation_reason: 'popular',
    created_at: '2024-01-20',
  },
  {
    id: 'demo-offer-024',
    title: 'Eye Care Package',
    merchant: 'Moorfields Eye Hospital',
    description: 'Comprehensive eye exam + 20% off glasses or contacts for employees.',
    category: 'Health & Fitness',
    discount_percent: 20,
    rating: 4.8,
    image_url: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400&h=300&fit=crop',
    is_public: true,
    sponsored: false,
    card_linked: false,
    eligible: true,
    tags: ['Health', 'Vision', 'Medical'],
    terms: 'Valid at Dubai and Abu Dhabi locations. Appointment required.',
    valid_from: '2024-01-01',
    valid_to: '2025-12-31',
    recommendation_reason: 'health',
    created_at: '2024-02-15',
  },
];

// Helper to get offers by filter
export function getDemoOffersByCategory(category: string): DemoMarketplaceOffer[] {
  if (category === 'All Perks' || !category) return DEMO_MARKETPLACE_OFFERS;
  
  const categoryMapping: Record<string, string[]> = {
    'Wellness': ['Health & Fitness', 'Lifestyle & Shopping'],
    'Food & Dining': ['Food & Coffee', 'Everyday Essentials'],
    'Fitness': ['Health & Fitness'],
    'Learning': ['Learning & Skills'],
    'Family': ['Family & Parenting'],
    'Transport': ['Mobility'],
    'Experiences': ['Travel & Experiences'],
    'Home & Living': ['Home & Living'],
  };
  
  const matchingCategories = categoryMapping[category] || [category];
  return DEMO_MARKETPLACE_OFFERS.filter(o => matchingCategories.includes(o.category));
}

export function getDemoSponsoredOffers(): DemoMarketplaceOffer[] {
  return DEMO_MARKETPLACE_OFFERS.filter(o => o.sponsored);
}

export function getDemoCardLinkedOffers(): DemoMarketplaceOffer[] {
  return DEMO_MARKETPLACE_OFFERS.filter(o => o.card_linked);
}

export function getDemoNewOffers(): DemoMarketplaceOffer[] {
  return DEMO_MARKETPLACE_OFFERS.filter(o => o.is_new);
}

export function getDemoCuratedOffers(hasChildren: boolean, hasCards: boolean): DemoMarketplaceOffer[] {
  // Personalized curation logic
  let scored = DEMO_MARKETPLACE_OFFERS.map(offer => {
    let score = 50;
    
    // Boost sponsored offers
    if (offer.sponsored) score += 20;
    
    // Boost family offers if user has children
    if (hasChildren && offer.recommendation_reason === 'family') score += 30;
    
    // Boost card-linked if user has cards
    if (hasCards && offer.card_linked) score += 15;
    
    // Boost high-value discounts
    if (offer.discount_percent && offer.discount_percent >= 25) score += 15;
    
    // Boost highly rated
    if (offer.rating && offer.rating >= 4.7) score += 10;
    
    // Boost new offers
    if (offer.is_new) score += 10;
    
    return { offer, score };
  });
  
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(s => s.offer);
}

// Category tiles configuration
export const MARKETPLACE_CATEGORY_TILES = [
  { id: 'wellness', name: 'Wellness', nameAr: 'العافية', icon: 'Heart', count: 6 },
  { id: 'food', name: 'Food & Dining', nameAr: 'الطعام', icon: 'Coffee', count: 4 },
  { id: 'fitness', name: 'Fitness', nameAr: 'اللياقة', icon: 'Activity', count: 5 },
  { id: 'learning', name: 'Learning', nameAr: 'التعلم', icon: 'BookOpen', count: 3 },
  { id: 'family', name: 'Family', nameAr: 'العائلة', icon: 'Users', count: 4 },
  { id: 'transport', name: 'Transport', nameAr: 'النقل', icon: 'Car', count: 3 },
  { id: 'home', name: 'Home & Living', nameAr: 'المنزل', icon: 'Home', count: 2 },
  { id: 'experiences', name: 'Experiences', nameAr: 'التجارب', icon: 'Plane', count: 2 },
];
