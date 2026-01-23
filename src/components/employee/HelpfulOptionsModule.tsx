/**
 * Helpful Options Module
 * 
 * Light, non-intrusive component that shows curated external offers
 * relevant to a specific benefit category. Collapsed by default.
 * 
 * Rules:
 * - Only shown if marketplace_enabled=true AND relevant offers exist
 * - Max 2-3 items
 * - No sales language, no big images
 * - Clear "External" label and disclaimer
 */

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useOrgSettings } from '@/hooks/useOrgSettings';
import { useLanguage } from '@/contexts/LanguageContext';
import { CanonicalLifeArea, LIFE_AREA_METADATA } from '@/lib/taxonomy';

// ============================================================================
// TYPES
// ============================================================================

export interface HelpfulOffer {
  id: string;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  merchant: string;
  category: string;
  discount_percent?: number;
  actionUrl?: string;
}

interface HelpfulOptionsProps {
  /** Life area to filter offers for */
  lifeArea: CanonicalLifeArea;
  /** Custom class name */
  className?: string;
}

// ============================================================================
// RELEVANCE MAPPING
// ============================================================================

/**
 * Maps life areas to relevant offer categories
 */
const LIFE_AREA_OFFER_CATEGORIES: Record<CanonicalLifeArea, string[]> = {
  housing: ['Moving Services', 'Furniture', 'Home Internet', 'Property Services', 'Home Maintenance'],
  education: ['Tuition Partners', 'Uniforms', 'Books & Supplies', 'Assessments', 'School Services'],
  health: ['Clinics', 'Opticals', 'Pharmacy', 'Wellness', 'Dental', 'Medical Services'],
  transport: ['Fuel', 'Car Maintenance', 'Taxi Services', 'Parking', 'Car Rental'],
  wellbeing: ['Gyms', 'Fitness', 'Mindfulness', 'Mental Health', 'Wellness Apps', 'Spa'],
  learning: ['Courses', 'Certifications', 'Subscriptions', 'Books', 'Training'],
  financial: ['Banking', 'Insurance', 'Investment', 'Tax Services'],
  leave: [],
  bonus: [],
  equity: [],
  perks: ['Dining', 'Entertainment', 'Shopping', 'Travel'],
  documents: [],
  other: [],
};

// ============================================================================
// DEMO OFFERS (would come from database in production)
// ============================================================================

const DEMO_OFFERS: HelpfulOffer[] = [
  // Housing
  { id: 'h1', title: '15% Off Moving Services', description: 'Professional relocation assistance', merchant: 'MovePro UAE', category: 'Moving Services' },
  { id: 'h2', title: 'Furniture Rental Options', description: 'Flexible home furnishing solutions', merchant: 'FurnishNow', category: 'Furniture' },
  // Education
  { id: 'e1', title: 'School Uniform Partner', description: 'Discounted uniforms for partner schools', merchant: 'UniformPlus', category: 'Uniforms' },
  { id: 'e2', title: 'Tuition Payment Plans', description: 'Interest-free payment options', merchant: 'EduPay', category: 'Tuition Partners' },
  // Health
  { id: 'hl1', title: 'In-Network Dental Partner', description: 'Preventive care at preferred rates', merchant: 'SmileCare', category: 'Dental' },
  { id: 'hl2', title: 'Vision Care Discount', description: 'Glasses and contacts savings', merchant: 'VisionFirst', category: 'Opticals' },
  // Transport
  { id: 't1', title: 'Fuel Savings Card', description: 'Up to 5% cashback on fuel', merchant: 'ENOC', category: 'Fuel' },
  { id: 't2', title: 'Car Service Discount', description: 'Maintenance at preferred rates', merchant: 'AutoCare', category: 'Car Maintenance' },
  // Wellbeing
  { id: 'w1', title: 'Gym Membership Discount', description: 'Corporate rates at select gyms', merchant: 'FitLife', category: 'Gyms', discount_percent: 25 },
  { id: 'w2', title: 'Mindfulness App Access', description: 'Meditation and wellness tools', merchant: 'CalmMind', category: 'Mindfulness' },
  // Learning
  { id: 'l1', title: 'Online Course Discount', description: 'Professional development courses', merchant: 'SkillUp', category: 'Courses', discount_percent: 20 },
  { id: 'l2', title: 'Certification Prep', description: 'Exam preparation resources', merchant: 'CertReady', category: 'Certifications' },
];

// ============================================================================
// HOOK
// ============================================================================

function useHelpfulOffers(lifeArea: CanonicalLifeArea) {
  const { data: orgSettings } = useOrgSettings();
  
  const isMarketplaceEnabled = orgSettings?.settings?.marketplace_enabled !== false;
  
  const relevantOffers = useMemo(() => {
    if (!isMarketplaceEnabled) return [];
    
    const relevantCategories = LIFE_AREA_OFFER_CATEGORIES[lifeArea] || [];
    if (relevantCategories.length === 0) return [];
    
    // Filter and limit to 3 offers
    return DEMO_OFFERS
      .filter(offer => relevantCategories.includes(offer.category))
      .slice(0, 3);
  }, [lifeArea, isMarketplaceEnabled]);
  
  return {
    offers: relevantOffers,
    isEnabled: isMarketplaceEnabled && relevantOffers.length > 0,
  };
}

// ============================================================================
// COMPONENT
// ============================================================================

export function HelpfulOptionsModule({ lifeArea, className }: HelpfulOptionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';
  
  const { offers, isEnabled } = useHelpfulOffers(lifeArea);
  
  // Don't render anything if no relevant offers or marketplace disabled
  if (!isEnabled) return null;
  
  const lifeAreaMeta = LIFE_AREA_METADATA[lifeArea];
  
  return (
    <div className={cn('mt-8', className)}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card className="border-dashed border-muted-foreground/20">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors py-4">
              <div className={cn(
                "flex items-center justify-between gap-3",
                isRTL && "flex-row-reverse"
              )}>
                <div className={cn(
                  "flex items-center gap-2",
                  isRTL && "flex-row-reverse"
                )}>
                  <Sparkles className="w-4 h-4 text-muted-foreground" />
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {isRTL ? 'خيارات مفيدة (اختياري)' : 'Helpful options (optional)'}
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground border-muted-foreground/30">
                    {isRTL ? 'خارجي' : 'External'}
                  </Badge>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <p className={cn(
                "text-xs text-muted-foreground mt-1",
                isRTL && "text-right"
              )}>
                {isRTL 
                  ? 'عروض خارجية قد تساعدك في استخدام هذه الميزة'
                  : 'External offers that may help you use this benefit'
                }
              </p>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="pt-0 pb-4">
              <div className="space-y-3">
                {offers.map((offer, index) => (
                  <div key={offer.id}>
                    {index > 0 && <Separator className="my-3" />}
                    <div className={cn(
                      "flex items-start gap-3",
                      isRTL && "flex-row-reverse"
                    )}>
                      {/* Small icon placeholder */}
                      <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                        <lifeAreaMeta.icon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      
                      <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
                        <div className={cn(
                          "flex items-center gap-2 flex-wrap",
                          isRTL && "flex-row-reverse justify-end"
                        )}>
                          <p className="text-sm font-medium text-foreground">
                            {isRTL && offer.titleAr ? offer.titleAr : offer.title}
                          </p>
                          {offer.discount_percent && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              {offer.discount_percent}% off
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {isRTL && offer.descriptionAr ? offer.descriptionAr : offer.description}
                        </p>
                        <p className="text-[10px] text-muted-foreground/70 mt-1">
                          {offer.merchant}
                        </p>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0 text-xs text-muted-foreground hover:text-foreground gap-1"
                      >
                        {isRTL ? 'عرض' : 'View'}
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Disclaimer */}
              <div className={cn(
                "mt-4 p-2 rounded bg-muted/30 border border-dashed border-muted-foreground/20",
                isRTL && "text-right"
              )}>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  {isRTL 
                    ? 'ليس جزءاً من استحقاقك الوظيفي. العروض الخارجية تخضع لشروط مقدمي الخدمة.'
                    : 'Not part of your employer entitlement. External offers subject to provider terms.'
                  }
                </p>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}

export default HelpfulOptionsModule;
