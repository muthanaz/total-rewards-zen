import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Star, CheckCircle, Heart, Home, Users, Car, Dumbbell } from 'lucide-react';
import { useProfile, useMarketplaceOffers } from '@/hooks/useSupabaseData';
import { useMemo } from 'react';

interface CuratedPerksProps {
  onActivate: (offer: any) => void;
}

const lifeStageIcons: Record<string, any> = {
  'family': Users,
  'single': Heart,
  'homeowner': Home,
  'commuter': Car,
  'wellness': Dumbbell,
};

export function CuratedPerks({ onActivate }: CuratedPerksProps) {
  const { data: profile } = useProfile();
  const { data: offers = [] } = useMarketplaceOffers();

  // Determine user's life stage and interests for personalization
  const userContext = useMemo(() => {
    if (!profile) return { lifeStage: 'general', interests: [], commuter: false };

    const hasChildren = profile.marital_status === 'married'; // Simplified check
    const isCommuter = !!profile.home_location && !!profile.work_location && profile.home_location !== profile.work_location;
    const interests = profile.interests || [];
    
    let lifeStage = 'single';
    if (hasChildren) lifeStage = 'family';
    
    return { lifeStage, interests, commuter: isCommuter };
  }, [profile]);

  // Curate perks based on profile
  const curatedOffers = useMemo(() => {
    const scored = offers.map(offer => {
      let score = offer.rating || 3;
      
      // Boost based on life stage
      if (userContext.lifeStage === 'family') {
        if (offer.category === 'Family & Parenting') score += 3;
        if (offer.category === 'Learning & Skills') score += 2;
      } else if (userContext.lifeStage === 'single') {
        if (offer.category === 'Lifestyle & Shopping') score += 2;
        if (offer.category === 'Travel & Experiences') score += 2;
        if (offer.category === 'Health & Fitness') score += 1;
      }

      // Boost for commuters
      if (userContext.commuter && offer.category === 'Mobility') score += 2;

      // Boost based on interests
      const offerTags = offer.tags || [];
      const matchingInterests = userContext.interests.filter((i: string) => 
        offerTags.some((t: string) => t.toLowerCase().includes(i.toLowerCase()))
      );
      score += matchingInterests.length * 1.5;

      // Boost high discount offers
      if (offer.discount_percent && offer.discount_percent >= 30) score += 1;

      return { ...offer, personalScore: score };
    });

    // Sort by personalized score and take top 4
    return scored.sort((a, b) => b.personalScore - a.personalScore).slice(0, 4);
  }, [offers, userContext]);

  const getCurationReason = (offer: any) => {
    if (userContext.lifeStage === 'family' && offer.category === 'Family & Parenting') {
      return 'Based on your family profile';
    }
    if (userContext.commuter && offer.category === 'Mobility') {
      return 'Great for your commute';
    }
    if (offer.category === 'Health & Fitness') {
      return 'Popular with employees like you';
    }
    if (offer.discount_percent && offer.discount_percent >= 30) {
      return 'Exceptional value';
    }
    return 'Recommended for you';
  };

  if (curatedOffers.length === 0) return null;

  return (
    <Card className="overflow-hidden bg-gradient-to-r from-accent/5 via-card to-card dark:from-accent/15 dark:via-card dark:to-card border-accent/20 dark:border-accent/30">
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-accent/10 dark:bg-accent/20">
            <Sparkles className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-base">Curated For You</h3>
            <p className="text-xs text-muted-foreground">
              Personalized picks based on your profile
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {curatedOffers.map((offer, index) => (
            <div 
              key={offer.id}
              className="group relative bg-card dark:bg-card/80 border border-border/50 dark:border-border/30 rounded-xl overflow-hidden hover:border-accent/30 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/20 transition-all duration-300 flex flex-col"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image with overlay badge */}
              {offer.image_url && (
                <div className="relative h-28 bg-muted overflow-hidden shrink-0">
                  <img 
                    src={offer.image_url} 
                    alt={offer.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  {/* Gradient overlay for badge visibility */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
                  {/* Personalization badge - positioned on image */}
                  <div className="absolute top-2 left-2 z-10">
                    <Badge 
                      variant="secondary" 
                      className="bg-accent text-accent-foreground text-[10px] gap-1 shadow-lg px-1.5 py-0.5 backdrop-blur-sm"
                    >
                      <Sparkles className="w-2.5 h-2.5" />
                      For You
                    </Badge>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="p-3 space-y-2 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-medium text-sm line-clamp-2 group-hover:text-accent transition-colors leading-tight">
                    {offer.title}
                  </h4>
                  {offer.discount_percent && (
                    <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0 shrink-0 text-[10px] px-1.5 py-0.5">
                      {offer.discount_percent}%
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-muted-foreground line-clamp-1">{offer.merchant}</p>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                    {offer.category}
                  </Badge>
                  {offer.rating && (
                    <span className="flex items-center gap-0.5 text-[10px] text-amber-500">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      {offer.rating}
                    </span>
                  )}
                </div>

                {/* Curation reason */}
                <p className="text-[10px] text-accent/80 italic line-clamp-1 mt-auto pt-1">
                  ✨ {getCurationReason(offer)}
                </p>

                <Button 
                  size="sm" 
                  className="w-full h-7 text-xs"
                  onClick={() => onActivate(offer)}
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Activate
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
