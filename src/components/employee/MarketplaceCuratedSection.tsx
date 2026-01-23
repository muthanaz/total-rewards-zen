import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Star, Building2, CreditCard, Heart, MapPin, Users, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { DemoMarketplaceOffer } from '@/lib/marketplaceDemoData';
import { MarketplaceOfferMedia } from './MarketplaceOfferMedia';

const REASON_ICONS: Record<string, React.ElementType> = {
  family: Users,
  health: Heart,
  mobility: MapPin,
  location: MapPin,
  interest: Sparkles,
  high_value: TrendingUp,
  popular: Star,
};

const REASON_LABELS: Record<string, { en: string; ar: string }> = {
  family: { en: 'Based on: Family', ar: 'بناءً على: العائلة' },
  health: { en: 'Based on: Health', ar: 'بناءً على: الصحة' },
  mobility: { en: 'Based on: Mobility', ar: 'بناءً على: التنقل' },
  location: { en: 'Based on: Location', ar: 'بناءً على: الموقع' },
  interest: { en: 'Based on: Interests', ar: 'بناءً على: الاهتمامات' },
  high_value: { en: 'High Value', ar: 'قيمة عالية' },
  popular: { en: 'Popular Choice', ar: 'اختيار شائع' },
};

interface MarketplaceCuratedSectionProps {
  offers: DemoMarketplaceOffer[];
  onSelectOffer: (offer: DemoMarketplaceOffer) => void;
  onActivate: (offer: DemoMarketplaceOffer) => void;
  className?: string;
}

export function MarketplaceCuratedSection({ offers, onSelectOffer, onActivate, className }: MarketplaceCuratedSectionProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => (language === 'ar' ? ar : en);

  if (offers.length === 0) return null;

  return (
    <div className={cn('space-y-3', className)}>
      <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
        <div className="p-1.5 rounded-lg bg-gradient-to-br from-accent/20 to-primary/20">
          <Sparkles className="w-4 h-4 text-accent" />
        </div>
        <div>
          <h3 className="font-semibold text-base">{t('Curated for You', 'مختار لك')}</h3>
          <p className="text-xs text-muted-foreground">{t('Personalized picks based on your profile', 'اختيارات مخصصة بناءً على ملفك')}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {offers.slice(0, 8).map((offer) => {
          const ReasonIcon = REASON_ICONS[offer.recommendation_reason || 'popular'] || Sparkles;
          const reasonLabel = REASON_LABELS[offer.recommendation_reason || 'popular'];

          return (
            <Card
              key={offer.id}
              className="group overflow-hidden cursor-pointer hover:shadow-lg hover:border-accent/30 transition-all duration-200 hover:-translate-y-0.5"
              onClick={() => onSelectOffer(offer)}
            >
              <div className="relative">
                <MarketplaceOfferMedia
                  imageUrl={offer.image_url}
                  vendorName={offer.merchant}
                  title={offer.title}
                  size="sm"
                />
                {offer.discount_percent && (
                  <Badge className="absolute top-2 left-2 bg-success hover:bg-success text-white border-0 text-[10px]">
                    Save {offer.discount_percent}%
                  </Badge>
                )}
                {offer.sponsored && (
                  <Badge className="absolute top-2 right-2 bg-accent/90 hover:bg-accent text-white border-0 text-[9px] gap-0.5">
                    <Building2 className="w-2.5 h-2.5" />
                    Sponsored
                  </Badge>
                )}
                {offer.card_linked && (
                  <Badge className="absolute top-2 right-2 bg-primary/90 hover:bg-primary text-white border-0 text-[9px] gap-0.5">
                    <CreditCard className="w-2.5 h-2.5" />
                    Card
                  </Badge>
                )}
              </div>
              <CardContent className="p-2.5 space-y-1.5">
                <p className="text-[10px] text-muted-foreground truncate">{offer.merchant}</p>
                <p className="text-xs font-medium line-clamp-1">{offer.title}</p>
                <div className={cn('flex items-center gap-1 text-[10px] text-accent', isRTL && 'flex-row-reverse')}>
                  <ReasonIcon className="w-3 h-3" />
                  <span className="truncate">{language === 'ar' ? reasonLabel.ar : reasonLabel.en}</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full h-7 text-[10px] hover:bg-accent/10 hover:text-accent"
                  onClick={(e) => { e.stopPropagation(); onActivate(offer); }}
                >
                  {t('Activate', 'تفعيل')}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
