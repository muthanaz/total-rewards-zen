import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, MapPin, Users, Heart, TrendingUp, Clock, 
  Star, ChevronRight, ChevronLeft, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProfile } from '@/contexts/ProfileContext';
import { 
  getOfferSponsorship, 
  getOfferVerificationStatus,
  getRecommendationExplanation,
  SPONSORSHIP_CONFIG,
  type RecommendationReason,
  type PersonalizedRecommendation,
  type MarketplaceOfferContract,
} from '@/lib/crossPortalContract';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface PersonalizedRecommendationsStripProps {
  offers: any[];
  onSelectOffer: (offer: any) => void;
  onActivate: (offer: any) => void;
  className?: string;
}

const REASON_ICONS: Record<RecommendationReason, React.ElementType> = {
  location: MapPin,
  family_status: Users,
  benefit_usage: Heart,
  interest: Star,
  popular: TrendingUp,
  high_value: Sparkles,
  new_partner: Clock,
  expiring_soon: Clock,
};

export function PersonalizedRecommendationsStrip({
  offers,
  onSelectOffer,
  onActivate,
  className,
}: PersonalizedRecommendationsStripProps) {
  const { language, direction } = useLanguage();
  const { profile, children } = useProfile();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => (language === 'ar' ? ar : en);
  
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  // Generate personalized recommendations with explanations
  const recommendations = useMemo<PersonalizedRecommendation[]>(() => {
    const profileContext = {
      location: profile?.city || 'Dubai',
      hasChildren: children.length > 0,
      interests: ['Fitness', 'Travel', 'Learning'], // Would come from profile
    };

    const scored: PersonalizedRecommendation[] = offers.map((offer) => {
      const reasons: RecommendationReason[] = [];
      let score = 50; // Base score

      // Location-based matching
      if (offer.category === 'Travel & Experiences' || offer.category === 'Mobility') {
        reasons.push('location');
        score += 15;
      }

      // Family status matching
      if (children.length > 0 && offer.category === 'Family & Parenting') {
        reasons.push('family_status');
        score += 25;
      }

      // Benefit usage correlation
      if (offer.category === 'Health & Fitness' || offer.category === 'Wellbeing') {
        reasons.push('benefit_usage');
        score += 20;
      }

      // High value offers
      if (offer.discount_percent && offer.discount_percent >= 20) {
        reasons.push('high_value');
        score += 15;
      }

      // Popular offers (high rating)
      if (offer.rating && offer.rating >= 4.7) {
        reasons.push('popular');
        score += 10;
      }

      // Interest matching (simplified)
      if (
        (offer.category === 'Learning & Skills') ||
        (offer.category === 'Health & Fitness')
      ) {
        reasons.push('interest');
        score += 10;
      }

      // Ensure at least one reason
      if (reasons.length === 0) {
        reasons.push('popular');
      }

      const explanation = getRecommendationExplanation(reasons, profileContext);

      return {
        offer: {
          ...offer,
          sponsorship: getOfferSponsorship(offer),
          verificationStatus: getOfferVerificationStatus(offer),
        } as MarketplaceOfferContract,
        reasons,
        explanation: explanation.en,
        explanationAr: explanation.ar,
        score,
      };
    });

    // Sort by score and take top 6
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [offers, profile, children]);

  if (recommendations.length === 0) return null;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
        <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-accent/20 to-primary/20">
            <Sparkles className="w-4 h-4 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-base">
              {t('Recommended for You', 'موصى به لك')}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t(
                'Personalized picks based on your profile',
                'اختيارات مخصصة بناءً على ملفك الشخصي'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {recommendations.map((rec, index) => {
          const PrimaryReasonIcon = REASON_ICONS[rec.reasons[0]] || Sparkles;
          const sponsorConfig = SPONSORSHIP_CONFIG[rec.offer.sponsorship || 'public'];

          return (
            <Card 
              key={rec.offer.id}
              className={cn(
                'group overflow-hidden cursor-pointer transition-all duration-300',
                'hover:shadow-lg hover:border-accent/30 hover:-translate-y-0.5',
                'border-border/60'
              )}
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => onSelectOffer(rec.offer)}
            >
              {/* Image */}
              <div className="relative h-20 bg-muted overflow-hidden">
                {rec.offer.image_url ? (
                  <img 
                    src={rec.offer.image_url} 
                    alt={rec.offer.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/10">
                    <Sparkles className="w-6 h-6 text-muted-foreground/50" />
                  </div>
                )}
                
                {/* Discount Badge */}
                {rec.offer.discount_percent && (
                  <Badge className="absolute top-1.5 left-1.5 bg-rose-500 hover:bg-rose-500 text-white border-0 text-[10px] font-bold px-1.5 py-0.5">
                    -{rec.offer.discount_percent}%
                  </Badge>
                )}

                {/* Sponsorship Badge */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge 
                      className={cn(
                        'absolute top-1.5 right-1.5 text-[9px] px-1.5 py-0.5 border',
                        sponsorConfig.className
                      )}
                    >
                      {t(sponsorConfig.label, sponsorConfig.labelAr)}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[200px]">
                    <p className="text-xs">
                      {t(sponsorConfig.tooltip, sponsorConfig.tooltipAr)}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <CardContent className="p-2.5 space-y-1.5">
                {/* Merchant & Title */}
                <div>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {rec.offer.merchant}
                  </p>
                  <p className="text-xs font-medium line-clamp-1">
                    {rec.offer.title}
                  </p>
                </div>

                {/* Recommendation Reason */}
                <div className={cn(
                  'flex items-center gap-1 text-[10px] text-accent',
                  isRTL && 'flex-row-reverse'
                )}>
                  <PrimaryReasonIcon className="w-3 h-3 shrink-0" />
                  <span className="truncate">
                    {language === 'ar' ? rec.explanationAr : rec.explanation}
                  </span>
                </div>

                {/* Quick Activate */}
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full h-7 text-[10px] gap-1 hover:bg-accent/10 hover:text-accent"
                  onClick={(e) => {
                    e.stopPropagation();
                    onActivate(rec.offer);
                  }}
                >
                  {t('Activate', 'تفعيل')}
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
