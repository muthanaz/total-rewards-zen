import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, Star, CheckCircle, 
  Brain, Zap, Target, ChevronRight
} from 'lucide-react';
import { useProfile, useMarketplaceOffers } from '@/hooks/useSupabaseData';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface CuratedPerksProps {
  onActivate: (offer: any) => void;
}

// Curation factors
const CURATION_FACTORS = {
  lifeStageMatch: 4,
  interestMatch: 3,
  highDiscount: 2,
  socialProof: 1.5,
  seasonal: 1,
  newOffer: 0.5,
};

const LIFE_STAGE_PREFERENCES: Record<string, string[]> = {
  family: ['Family & Parenting', 'Learning & Skills', 'Home & Living', 'Health & Fitness'],
  single: ['Lifestyle & Shopping', 'Travel & Experiences', 'Health & Fitness', 'Food & Coffee'],
  newHire: ['Everyday Essentials', 'Mobility', 'Home & Living', 'Food & Coffee'],
  senior: ['Travel & Experiences', 'Health & Fitness', 'Lifestyle & Shopping'],
};

const SEASONAL_CATEGORIES: Record<string, string[]> = {
  summer: ['Travel & Experiences', 'Health & Fitness'],
  backToSchool: ['Learning & Skills', 'Family & Parenting'],
  ramadan: ['Food & Coffee', 'Everyday Essentials'],
  winter: ['Travel & Experiences', 'Lifestyle & Shopping'],
};

export function CuratedPerks({ onActivate }: CuratedPerksProps) {
  const { data: profile } = useProfile();
  const { data: offers = [] } = useMarketplaceOffers();

  const userContext = useMemo(() => {
    if (!profile) {
      return { 
        lifeStage: 'general', 
        interests: [], 
        commuter: false, 
        tenure: 'new',
        homeLocation: null,
        workLocation: null,
      };
    }

    const hasSpouse = !!profile.spouse_name;
    const interests = profile.interests || [];
    const isCommuter = !!profile.home_location && !!profile.work_location && 
                       profile.home_location !== profile.work_location;
    
    const employmentDate = profile.employment_date ? new Date(profile.employment_date) : null;
    const monthsEmployed = employmentDate 
      ? Math.floor((Date.now() - employmentDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
      : 12;
    
    let lifeStage = 'single';
    if (hasSpouse) lifeStage = 'family';
    if (monthsEmployed < 6) lifeStage = 'newHire';
    
    return { 
      lifeStage, 
      interests, 
      commuter: isCommuter,
      tenure: monthsEmployed < 6 ? 'new' : monthsEmployed > 36 ? 'senior' : 'mid',
      homeLocation: profile.home_location,
      workLocation: profile.work_location,
    };
  }, [profile]);

  const curatedOffers = useMemo(() => {
    if (offers.length === 0) return [];

    const currentMonth = new Date().getMonth();
    const isSummer = currentMonth >= 5 && currentMonth <= 8;
    const isBackToSchool = currentMonth >= 7 && currentMonth <= 9;
    const currentSeason = isSummer ? 'summer' : isBackToSchool ? 'backToSchool' : 'winter';

    const scored = offers.map(offer => {
      let score = offer.rating || 3;
      const reasons: string[] = [];

      const preferredCategories = LIFE_STAGE_PREFERENCES[userContext.lifeStage] || [];
      if (preferredCategories.includes(offer.category)) {
        score += CURATION_FACTORS.lifeStageMatch;
        if (userContext.lifeStage === 'family' && offer.category === 'Family & Parenting') {
          reasons.push('Perfect for your family');
        } else if (userContext.lifeStage === 'newHire' && offer.category === 'Everyday Essentials') {
          reasons.push('Essential for new employees');
        } else {
          reasons.push('Matches your lifestyle');
        }
      }

      const offerTags = (offer.tags || []).map((t: string) => t.toLowerCase());
      const matchingInterests = userContext.interests.filter((interest: string) => 
        offerTags.some((tag: string) => tag.includes(interest.toLowerCase()) || 
                       interest.toLowerCase().includes(tag))
      );
      if (matchingInterests.length > 0) {
        score += CURATION_FACTORS.interestMatch * matchingInterests.length;
        reasons.push(`Based on your interest in ${matchingInterests[0]}`);
      }

      if (userContext.commuter && offer.category === 'Mobility') {
        score += CURATION_FACTORS.lifeStageMatch;
        reasons.push('Great for your commute');
      }

      if (offer.discount_percent && offer.discount_percent >= 40) {
        score += CURATION_FACTORS.highDiscount * 2;
        reasons.push('Exceptional value');
      } else if (offer.discount_percent && offer.discount_percent >= 25) {
        score += CURATION_FACTORS.highDiscount;
        reasons.push('Great savings');
      }

      const seasonalCategories = SEASONAL_CATEGORIES[currentSeason] || [];
      if (seasonalCategories.includes(offer.category)) {
        score += CURATION_FACTORS.seasonal;
        if (!reasons.length) reasons.push('Trending this season');
      }

      if (offer.rating && offer.rating >= 4.5) {
        score += CURATION_FACTORS.socialProof;
        if (!reasons.length) reasons.push('Highly rated by employees');
      }

      if (offer.created_at) {
        const daysOld = (Date.now() - new Date(offer.created_at).getTime()) / (1000 * 60 * 60 * 24);
        if (daysOld < 30) {
          score += CURATION_FACTORS.newOffer;
          if (!reasons.length) reasons.push('New partner offer');
        }
      }

      return { 
        ...offer, 
        personalScore: score, 
        curationReason: reasons[0] || 'Recommended for you',
        matchStrength: reasons.length > 1 ? 'strong' : reasons.length === 1 ? 'good' : 'general',
      };
    });

    return scored
      .sort((a, b) => b.personalScore - a.personalScore)
      .slice(0, 4);
  }, [offers, userContext]);

  if (curatedOffers.length === 0) return null;

  const getMatchIcon = (strength: string) => {
    switch (strength) {
      case 'strong': return <Target className="w-3 h-3" />;
      case 'good': return <Zap className="w-3 h-3" />;
      default: return <Sparkles className="w-3 h-3" />;
    }
  };

  const getMatchLabel = (strength: string) => {
    switch (strength) {
      case 'strong': return 'Top Match';
      case 'good': return 'Great Fit';
      default: return 'For You';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-accent/10 border border-accent/20">
            <Sparkles className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-lg flex items-center gap-2">
              Top Picks For You
              <Badge variant="secondary" className="text-[10px] font-normal">
                Personalized
              </Badge>
            </h2>
            <p className="text-sm text-muted-foreground">
              Based on your profile and preferences
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-muted-foreground gap-1 hidden md:flex">
          View All
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Curated Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {curatedOffers.map((offer, index) => (
          <Card 
            key={offer.id}
            className={cn(
              "group relative overflow-hidden transition-all duration-300",
              "hover:shadow-md hover:-translate-y-0.5",
              "bg-card border-border/50"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Image */}
            {offer.image_url && (
              <div className="relative h-32 overflow-hidden bg-muted">
                <img 
                  src={offer.image_url} 
                  alt={offer.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                
                {offer.discount_percent && (
                  <div className="absolute top-2 right-2 z-10">
                    <Badge className="bg-accent text-accent-foreground border-0 text-xs font-semibold shadow-md">
                      {offer.discount_percent}% OFF
                    </Badge>
                  </div>
                )}
              </div>
            )}

            <CardContent className="p-4 space-y-3">
              {/* Match Quality Badge */}
              <Badge 
                variant="outline" 
                className="gap-1 text-[10px] w-fit bg-muted/50 text-muted-foreground border-border"
              >
                {getMatchIcon(offer.matchStrength)}
                {getMatchLabel(offer.matchStrength)}
              </Badge>

              {/* Title & Merchant */}
              <div>
                <h3 className="font-medium text-sm leading-snug line-clamp-2 transition-colors min-h-[40px] group-hover:text-accent">
                  {offer.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">{offer.merchant}</p>
              </div>

              {/* Category & Rating */}
              <div className="flex items-center justify-between gap-2">
                <Badge variant="secondary" className="text-[10px] font-normal">
                  {offer.category.split(' & ')[0]}
                </Badge>
                {offer.rating && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {offer.rating}
                  </span>
                )}
              </div>

              {/* Personalization Reason */}
              <div className="pt-2 border-t border-border/50">
                <p className="text-[11px] flex items-center gap-1.5 text-muted-foreground">
                  <Sparkles className="w-3 h-3 text-accent" />
                  {offer.curationReason}
                </p>
              </div>

              {/* Action Button */}
              <Button 
                size="sm" 
                className="w-full gap-2"
                onClick={() => onActivate(offer)}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Activate Offer
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Why These Perks Section */}
      <Card className="border-dashed border-border bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-background border border-border">
              <Brain className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium">Why these offers?</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Our AI analyzes your profile, interests, and preferences to surface the most relevant offers. 
                {userContext.lifeStage === 'family' && ' As a family person, we prioritize family-friendly offers.'}
                {userContext.lifeStage === 'newHire' && ' As a new employee, we highlight essentials to help you settle in.'}
                {userContext.commuter && ' We also consider your commute patterns.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
