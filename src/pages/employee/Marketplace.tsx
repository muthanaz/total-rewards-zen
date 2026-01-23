import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Gift, Star, CheckCircle, Grid3X3, List, Sparkles, 
  ShoppingBag, Coffee, Activity, Users, BookOpen, Home, Car, Plane,
  CreditCard, Search, X, Clock, Ticket, Heart, AlertCircle,
  Calendar, Tag, Building2, ShieldCheck, Filter, Info, HelpCircle
} from 'lucide-react';
import { useMarketplaceOffers, usePerkActivations } from '@/hooks/useSupabaseData';
import { useActivateOffer } from '@/hooks/useActivateOffer';
import { useProfile } from '@/contexts/ProfileContext';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { MARKETPLACE_CATEGORIES } from '@/lib/constants';
import { CuratedPerks } from '@/components/dashboard/CuratedPerks';
import { BankCardBenefits } from '@/components/employee/BankCardBenefits';
import { PageHeader } from '@/components/shared/PageHeader';
import { NoSearchResults, EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';
import { format, isPast, addDays } from 'date-fns';
import { 
  getOfferSponsorship, 
  getOfferVerificationStatus,
  SPONSORSHIP_CONFIG,
  VERIFICATION_CONFIG,
  type OfferSponsorshipType,
} from '@/lib/crossPortalContract';
import { MarketplaceSavingsWidget, generateMockSavingsData } from '@/components/employee/MarketplaceSavingsWidget';
import { PersonalizedRecommendationsStrip } from '@/components/employee/PersonalizedRecommendationsStrip';
import { OfferDetailSheet } from '@/components/employee/OfferDetailSheet';
import { MarketplaceOfferMedia, MarketplaceOfferSkeleton } from '@/components/employee/MarketplaceOfferMedia';
import { MarketplaceEmptyState } from '@/components/employee/MarketplaceEmptyState';
import { MarketplaceHowItWorks } from '@/components/employee/MarketplaceHowItWorks';
import { 
  formatDiscountLabel, 
  getOfferMicrocopy, 
  getCategoryStyle,
  SEMANTIC_CATEGORY_STYLES,
  DEFAULT_CATEGORY_STYLE 
} from '@/lib/marketplaceHelpers';

// Icon mapping for categories
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'Everyday Essentials': ShoppingBag,
  'Food & Coffee': Coffee,
  'Health & Fitness': Activity,
  'Family & Parenting': Users,
  'Learning & Skills': BookOpen,
  'Home & Living': Home,
  'Mobility': Car,
  'Lifestyle & Shopping': Sparkles,
  'Travel & Experiences': Plane,
  'Wellness': Heart,
  'Food & Dining': Coffee,
  'Fitness': Activity,
  'Learning': BookOpen,
  'Family': Users,
  'Transport': Car,
  'Experiences': Plane,
};

// Simplified category tabs - "All Perks" as first option
const CATEGORY_TABS = [
  'All Perks',
  'Wellness',
  'Food & Dining',
  'Fitness',
  'Learning',
  'Family',
  'Transport',
  'Experiences',
];

// Voucher status helper
type VoucherStatus = 'active' | 'redeemed' | 'expired';

interface VoucherData {
  id: string;
  offer: {
    id: string;
    title: string;
    merchant: string;
    discount_percent: number | null;
    category: string;
    image_url: string | null;
  };
  activatedAt: string;
  expiresAt: string;
  status: VoucherStatus;
  code?: string;
}

function MarketplaceContent() {
  const { data: offers = [], isLoading } = useMarketplaceOffers();
  const { data: activations = [], refetch: refetchActivations } = usePerkActivations();
  const { mutate: activateOffer, isPending: isActivating } = useActivateOffer();
  const { bankCards, profile, children } = useProfile();
  const { language, direction } = useLanguage();
  const { toast } = useToast();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => (language === 'ar' ? ar : en);

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState<string>('All Perks');
  const [sortBy, setSortBy] = useState<string>('recommended');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [savedOffers, setSavedOffers] = useState<Set<string>>(new Set());
  const [voucherFilter, setVoucherFilter] = useState<VoucherStatus | 'all'>('all');
  const [sponsorshipFilter, setSponsorshipFilter] = useState<'all' | 'sponsored' | 'public'>('all');
  const [selectedOffer, setSelectedOffer] = useState<any | null>(null);

  // Mock savings data based on activations
  const savingsData = useMemo(() => generateMockSavingsData(activations), [activations]);

  // Map activations to vouchers
  const vouchers: VoucherData[] = useMemo(() => {
    return activations.map((activation: any) => {
      const expiresAt = addDays(new Date(activation.activated_at), 30);
      const isExpired = isPast(expiresAt);
      const isRedeemed = false;
      
      return {
        id: activation.id,
        offer: activation.marketplace_offers,
        activatedAt: activation.activated_at,
        expiresAt: expiresAt.toISOString(),
        status: isExpired ? 'expired' : isRedeemed ? 'redeemed' : 'active' as VoucherStatus,
        code: `BNFT${activation.id.slice(0, 6).toUpperCase()}`,
      };
    }).filter((v: VoucherData) => v.offer);
  }, [activations]);

  const filteredVouchers = useMemo(() => {
    if (voucherFilter === 'all') return vouchers;
    return vouchers.filter(v => v.status === voucherFilter);
  }, [vouchers, voucherFilter]);

  // Category mapping for filtering
  const categoryMapping: Record<string, string[]> = {
    'Wellness': ['Health & Fitness', 'Lifestyle & Shopping'],
    'Food & Dining': ['Food & Coffee', 'Everyday Essentials'],
    'Fitness': ['Health & Fitness'],
    'Learning': ['Learning & Skills'],
    'Family': ['Family & Parenting'],
    'Transport': ['Mobility'],
    'Experiences': ['Travel & Experiences'],
  };

  const filteredOffers = useMemo(() => {
    let filtered = [...offers];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(o => 
        o.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        o.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Category filter
    if (category !== 'All Perks') {
      const matchingCategories = categoryMapping[category] || [category];
      filtered = filtered.filter(o => matchingCategories.includes(o.category));
    }
    
    // Sponsorship filter
    if (sponsorshipFilter !== 'all') {
      filtered = filtered.filter(o => {
        const sponsorship = getOfferSponsorship(o);
        return sponsorshipFilter === 'sponsored' ? sponsorship === 'employer' : sponsorship === 'public';
      });
    }
    
    // Sort
    switch (sortBy) {
      case 'recommended':
        // Score-based sorting (higher discounts + ratings = more recommended)
        filtered.sort((a, b) => {
          const scoreA = (a.discount_percent || 0) + ((a.rating || 0) * 5);
          const scoreB = (b.discount_percent || 0) + ((b.rating || 0) * 5);
          return scoreB - scoreA;
        });
        break;
      case 'discount': 
        filtered.sort((a, b) => (b.discount_percent || 0) - (a.discount_percent || 0)); 
        break;
      case 'rating': 
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0)); 
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        break;
    }
    return filtered;
  }, [offers, searchTerm, category, sortBy, sponsorshipFilter]);

  // Count offers per category tab
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { 'All Perks': offers.length };
    CATEGORY_TABS.slice(1).forEach(cat => {
      const matchingCategories = categoryMapping[cat] || [cat];
      counts[cat] = offers.filter(o => matchingCategories.includes(o.category)).length;
    });
    return counts;
  }, [offers]);

  // Count sponsored vs public
  const sponsoredCount = offers.filter(o => getOfferSponsorship(o) === 'employer').length;
  const publicCount = offers.length - sponsoredCount;

  // P0 FIX: Actually insert perk_activation into DB
  const handleActivate = (offer: any) => {
    activateOffer(
      { id: offer.id, title: offer.title, vendor_id: offer.vendor_id },
      {
        onSuccess: () => {
          refetchActivations();
          setSelectedOffer(null);
        },
      }
    );
  };

  const handleSave = (offerId: string) => {
    setSavedOffers(prev => {
      const next = new Set(prev);
      if (next.has(offerId)) {
        next.delete(offerId);
        toast({ title: t("Removed from saved", "تمت الإزالة من المحفوظات") });
      } else {
        next.add(offerId);
        toast({ title: t("Saved for later ❤️", "تم الحفظ لوقت لاحق ❤️") });
      }
      return next;
    });
  };

  const getCategoryConfig = (cat: string) => {
    const style = getCategoryStyle(cat);
    const Icon = CATEGORY_ICONS[cat] || ShoppingBag;
    return { ...style, icon: Icon };
  };

  const getVoucherStatusBadge = (status: VoucherStatus) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success/10 text-success border-success/20">{t('Active', 'نشط')}</Badge>;
      case 'redeemed':
        return <Badge className="bg-info/10 text-info border-info/20">{t('Redeemed', 'مستخدم')}</Badge>;
      case 'expired':
        return <Badge className="bg-muted text-muted-foreground border-border">{t('Expired', 'منتهي')}</Badge>;
    }
  };

  // Empty state when no offers available
  if (offers.length === 0 && !isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader
          title={t("Perks & Partners", "الامتيازات والشراكات")}
          description={t("Exclusive discounts and benefits for employees", "خصومات ومزايا حصرية للموظفين")}
          icon={Gift}
          iconClassName="from-accent to-accent/80 shadow-accent/25"
        />
        
        <MarketplaceEmptyState />
      </div>
    );
  }

  // Loading state with premium skeletons
  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader
          title={t("Perks & Partners", "الامتيازات والشراكات")}
          description={t("Exclusive discounts and benefits curated for you", "خصومات ومزايا حصرية مختارة لك")}
          icon={Gift}
          iconClassName="from-accent to-accent/80 shadow-accent/25"
        />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <MarketplaceOfferSkeleton key={i} viewMode="grid" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header - tighter spacing */}
      <PageHeader
        title={t("Perks & Partners", "الامتيازات والشراكات")}
        description={t("Exclusive discounts and benefits curated for you", "خصومات ومزايا حصرية مختارة لك")}
        icon={Gift}
        iconClassName="from-accent to-accent/80 shadow-accent/25"
        badge={{
          label: `${offers.length} ${t('Active Offers', 'عرض نشط')}`,
          icon: Sparkles,
          variant: 'accent',
        }}
        compact
      />

      {/* How It Works + Offer Types */}
      <MarketplaceHowItWorks 
        sponsoredCount={sponsoredCount}
        publicCount={publicCount}
      />

      {/* Main Tabs */}
      <Tabs defaultValue="offers" className="space-y-5">
        <TabsList className="h-auto gap-1 bg-muted/50 p-1">
          <TabsTrigger value="offers" className="gap-2 data-[state=active]:bg-background">
            <ShoppingBag className="w-4 h-4" />
            {t('Offers', 'العروض')}
          </TabsTrigger>
          <TabsTrigger value="vouchers" className="gap-2 data-[state=active]:bg-background">
            <Ticket className="w-4 h-4" />
            {t('My Vouchers', 'قسائمي')}
            {vouchers.filter(v => v.status === 'active').length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                {vouchers.filter(v => v.status === 'active').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="bank-benefits" className="gap-2 data-[state=active]:bg-background">
            <CreditCard className="w-4 h-4" />
            {t('Bank Card Benefits', 'مزايا البطاقة المصرفية')}
          </TabsTrigger>
        </TabsList>

        {/* Offers Tab */}
        <TabsContent value="offers" className="space-y-5">
          {/* Smart Personalization Strip */}
          <PersonalizedRecommendationsStrip
            offers={offers}
            onSelectOffer={setSelectedOffer}
            onActivate={handleActivate}
          />

          {/* Filters Section */}
          <Card>
            <CardContent className="p-4">
              <div className={cn('flex flex-col md:flex-row md:items-center gap-4', isRTL && 'md:flex-row-reverse')}>
                {/* Category Pills */}
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide flex-1">
                  {CATEGORY_TABS.map((cat) => {
                    const config = getCategoryConfig(cat);
                    const Icon = cat === 'All Perks' ? Grid3X3 : config.icon;
                    const count = categoryCounts[cat] || 0;
                    const isSelected = category === cat;
                    
                    return (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs whitespace-nowrap transition-all",
                          "hover:shadow-sm",
                          isSelected 
                            ? cat === 'All Perks' 
                              ? "bg-foreground text-background border-foreground"
                              : cn(config.solidBgClass, "text-white border-transparent")
                            : "bg-background border-border hover:border-foreground/30"
                        )}
                      >
                        <Icon className={cn("w-3.5 h-3.5", isSelected ? "text-inherit" : config.textClass)} />
                        <span className="font-medium">{cat}</span>
                        <Badge variant="secondary" className={cn(
                          "text-[9px] px-1 h-4",
                          isSelected ? "bg-white/20 text-inherit" : ""
                        )}>
                          {count}
                        </Badge>
                      </button>
                    );
                  })}
                </div>

                {/* Additional Filters */}
                <div className={cn('flex items-center gap-2 shrink-0', isRTL && 'flex-row-reverse')}>
                  <Select value={sponsorshipFilter} onValueChange={(v) => setSponsorshipFilter(v as any)}>
                    <SelectTrigger className="w-[130px] h-8 text-xs">
                      <Filter className="w-3 h-3 mr-1" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('All Offers', 'جميع العروض')}</SelectItem>
                      <SelectItem value="sponsored">{t('Sponsored', 'برعاية صاحب العمل')}</SelectItem>
                      <SelectItem value="public">{t('Public', 'عام')}</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[130px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recommended">{t('Recommended', 'موصى به')}</SelectItem>
                      <SelectItem value="discount">{t('Highest Value', 'أعلى قيمة')}</SelectItem>
                      <SelectItem value="rating">{t('Top Rated', 'الأعلى تقييماً')}</SelectItem>
                      <SelectItem value="newest">{t('Newest', 'الأحدث')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Search */}
              <div className="mt-3">
                <div className="relative">
                  <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground", isRTL ? 'right-3' : 'left-3')} />
                  <Input 
                    placeholder={t("Search offers, merchants...", "ابحث عن العروض، التجار...")}
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className={cn("h-9 bg-muted/50", isRTL ? 'pr-9' : 'pl-9')}
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn("absolute top-1/2 -translate-y-1/2 h-6 w-6", isRTL ? 'left-2' : 'right-2')}
                      onClick={() => setSearchTerm('')}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Header */}
          <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
            <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
              <h3 className="font-semibold">
                {category === 'All Perks' ? t('All Perks', 'جميع الامتيازات') : category}
              </h3>
              <Badge variant="outline" className="font-normal text-xs">
                {filteredOffers.length} {t('offers', 'عرض')}
              </Badge>
              {(category !== 'All Perks' || sponsorshipFilter !== 'all' || searchTerm) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => { setCategory('All Perks'); setSponsorshipFilter('all'); setSearchTerm(''); }}
                  className="h-7 px-2 text-muted-foreground text-xs"
                >
                  <X className="w-3 h-3 mr-1" />
                  {t('Clear filters', 'مسح الفلاتر')}
                </Button>
              )}
            </div>
            
            <div className="flex border rounded-lg overflow-hidden bg-background">
              <Button 
                variant={viewMode === 'grid' ? 'default' : 'ghost'} 
                size="sm" 
                className="rounded-none h-8 px-2.5"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-3.5 h-3.5" />
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'default' : 'ghost'} 
                size="sm" 
                className="rounded-none h-8 px-2.5"
                onClick={() => setViewMode('list')}
              >
                <List className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Offers Grid */}
          {filteredOffers.length > 0 ? (
            <div className={cn(
              viewMode === 'grid' 
                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                : "space-y-2"
            )}>
              {filteredOffers.map((offer, index) => {
                const config = getCategoryConfig(offer.category);
                const sponsorship = getOfferSponsorship(offer) as OfferSponsorshipType;
                const verification = getOfferVerificationStatus(offer);
                const sponsorConfig = SPONSORSHIP_CONFIG[sponsorship];
                const discountLabel = formatDiscountLabel({ discountPercent: offer.discount_percent }, language as 'en' | 'ar');
                const microcopy = getOfferMicrocopy(offer, language as 'en' | 'ar');

                if (viewMode === 'list') {
                  return (
                    <Card 
                      key={offer.id}
                      className="overflow-hidden hover:shadow-md transition-all cursor-pointer group"
                      onClick={() => setSelectedOffer(offer)}
                    >
                      <CardContent className="p-3">
                        <div className={cn('flex items-center gap-4', isRTL && 'flex-row-reverse')}>
                          <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-border/50">
                            <MarketplaceOfferMedia
                              imageUrl={offer.image_url}
                              vendorName={offer.merchant}
                              title={offer.title}
                              size="sm"
                              className="w-full h-full"
                            />
                          </div>
                          <div className={cn('flex-1 min-w-0', isRTL && 'text-right')}>
                            <div className={cn('flex items-center gap-2 mb-1', isRTL && 'flex-row-reverse')}>
                              <span className="text-xs text-muted-foreground">{offer.merchant}</span>
                              {verification === 'verified' && (
                                <ShieldCheck className="w-3 h-3 text-success" />
                              )}
                              <Badge className={cn('text-[9px] px-1.5', sponsorConfig.className)}>
                                {t(sponsorConfig.label, sponsorConfig.labelAr)}
                              </Badge>
                            </div>
                            <p className="font-medium text-sm truncate">{offer.title}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{microcopy}</p>
                            <div className={cn('flex items-center gap-3 mt-1', isRTL && 'flex-row-reverse')}>
                              <Badge variant="outline" className={cn("text-[10px] gap-1 border-0", config.bgClass, config.textClass)}>
                                <config.icon className="w-3 h-3" />
                                {offer.category.split(' & ')[0]}
                              </Badge>
                              {offer.rating && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-warning text-warning" />
                                  {offer.rating}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className={cn('text-right shrink-0', isRTL && 'text-left')}>
                            {discountLabel && (
                              <Badge className="bg-success hover:bg-success text-success-foreground border-0 font-semibold mb-2">
                                {discountLabel}
                              </Badge>
                            )}
                            <Button size="sm" className="w-full" onClick={(e) => { e.stopPropagation(); handleActivate(offer); }}>
                              {t('Activate', 'تفعيل')}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                }

                return (
                  <Card 
                    key={offer.id} 
                    className="overflow-hidden group hover:shadow-lg transition-all duration-300 flex flex-col border-border/60 hover:border-accent/30 cursor-pointer"
                    style={{ animationDelay: `${index * 30}ms` }}
                    onClick={() => setSelectedOffer(offer)}
                  >
                    <div className={cn("h-1", config.solidBgClass)} />
                    
                    <div className="relative">
                      <MarketplaceOfferMedia
                        imageUrl={offer.image_url}
                        vendorName={offer.merchant}
                        title={offer.title}
                        size="md"
                        className="border-b border-border/30"
                      />
                      
                      {/* Badges overlay */}
                      <div className={cn('absolute top-2 left-2 right-2 flex justify-between items-start', isRTL && 'flex-row-reverse')}>
                        {discountLabel && (
                          <Badge className="bg-success hover:bg-success text-success-foreground border-0 text-[10px] font-semibold shadow-sm">
                            {discountLabel}
                          </Badge>
                        )}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge className={cn('text-[9px] border cursor-help shadow-sm', sponsorConfig.className)}>
                              {sponsorship === 'employer' && <Building2 className="w-2.5 h-2.5 mr-0.5" />}
                              {t(sponsorConfig.label, sponsorConfig.labelAr)}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p className="text-xs">{t(sponsorConfig.tooltip, sponsorConfig.tooltipAr)}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      
                      {/* Verified & Save */}
                      <div className={cn('absolute bottom-2 left-2 right-2 flex justify-between items-end', isRTL && 'flex-row-reverse')}>
                        {verification === 'verified' && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge className={cn('text-[9px] gap-1 shadow-sm', VERIFICATION_CONFIG.verified.className)}>
                                <ShieldCheck className="w-2.5 h-2.5" />
                                {t('Verified', 'موثق')}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">{VERIFICATION_CONFIG.verified.tooltip}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 bg-background/80 backdrop-blur-sm hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                          onClick={(e) => { e.stopPropagation(); handleSave(offer.id); }}
                        >
                          <Heart className={cn("w-3.5 h-3.5", savedOffers.has(offer.id) && "fill-destructive text-destructive")} />
                        </Button>
                      </div>
                    </div>
                    
                    <CardContent className="p-3 space-y-2 flex flex-col flex-1">
                      <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                        <Badge variant="outline" className={cn("text-[9px] gap-1 border-0", config.bgClass, config.textClass)}>
                          <config.icon className="w-2.5 h-2.5" />
                          {offer.category.split(' & ')[0]}
                        </Badge>
                        {offer.rating && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 ml-auto">
                            <Star className="w-2.5 h-2.5 fill-warning text-warning" />
                            {offer.rating}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className={cn("font-medium text-sm leading-tight line-clamp-1 group-hover:text-accent transition-colors", isRTL && 'text-right')}>
                          {offer.title}
                        </h3>
                        <p className={cn("text-xs text-muted-foreground truncate", isRTL && 'text-right')}>
                          {offer.merchant}
                        </p>
                        {/* Microcopy line */}
                        <p className={cn("text-[11px] text-muted-foreground/80 mt-0.5 truncate", isRTL && 'text-right')}>
                          {microcopy}
                        </p>
                      </div>

                      <div className={cn('flex items-center gap-1 text-[10px] text-muted-foreground', isRTL && 'flex-row-reverse')}>
                        <CheckCircle className="w-3 h-3 text-success" />
                        <span>{t('Eligible', 'مؤهل')}</span>
                      </div>
                      
                      <Button 
                        size="sm" 
                        className="w-full gap-1 h-8 text-xs" 
                        onClick={(e) => { e.stopPropagation(); handleActivate(offer); }}
                      >
                        {t('Activate', 'تفعيل')}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <NoSearchResults 
              query={searchTerm || category} 
              onClear={() => { setSearchTerm(''); setCategory('All Perks'); setSponsorshipFilter('all'); }} 
            />
          )}
        </TabsContent>

        {/* Vouchers Tab */}
        <TabsContent value="vouchers" className="space-y-5">
          {/* Voucher Filters */}
          <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
            {(['all', 'active', 'redeemed', 'expired'] as const).map((status) => (
              <Button
                key={status}
                variant={voucherFilter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setVoucherFilter(status)}
                className="text-xs"
              >
                {status === 'all' ? t('All', 'الكل') : 
                 status === 'active' ? t('Active', 'نشط') :
                 status === 'redeemed' ? t('Redeemed', 'مستخدم') :
                 t('Expired', 'منتهي')}
                {status === 'active' && vouchers.filter(v => v.status === 'active').length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 px-1 text-[9px]">
                    {vouchers.filter(v => v.status === 'active').length}
                  </Badge>
                )}
              </Button>
            ))}
          </div>

          {/* Vouchers List */}
          {filteredVouchers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredVouchers.map((voucher) => {
                const config = getCategoryConfig(voucher.offer.category);
                const discountLabel = formatDiscountLabel({ discountPercent: voucher.offer.discount_percent }, language as 'en' | 'ar');
                
                return (
                  <Card key={voucher.id} className="overflow-hidden">
                    <div className={cn("h-1", config.solidBgClass)} />
                    <CardContent className="p-4">
                      <div className={cn('flex gap-4', isRTL && 'flex-row-reverse')}>
                        <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-border/50">
                          <MarketplaceOfferMedia
                            imageUrl={voucher.offer.image_url}
                            vendorName={voucher.offer.merchant}
                            title={voucher.offer.title}
                            size="sm"
                            className="w-full h-full"
                          />
                        </div>
                        <div className={cn('flex-1 min-w-0', isRTL && 'text-right')}>
                          <div className={cn('flex items-center gap-2 mb-1', isRTL && 'flex-row-reverse')}>
                            {getVoucherStatusBadge(voucher.status)}
                            {discountLabel && (
                              <Badge variant="outline" className="text-[10px]">
                                {discountLabel}
                              </Badge>
                            )}
                          </div>
                          <h4 className="font-medium text-sm truncate">{voucher.offer.title}</h4>
                          <p className="text-xs text-muted-foreground">{voucher.offer.merchant}</p>
                          
                          <div className={cn('flex items-center gap-4 mt-3 text-xs text-muted-foreground', isRTL && 'flex-row-reverse')}>
                            <div className={cn('flex items-center gap-1', isRTL && 'flex-row-reverse')}>
                              <Calendar className="w-3 h-3" />
                              <span>{t('Expires', 'ينتهي')}: {format(new Date(voucher.expiresAt), 'MMM d, yyyy')}</span>
                            </div>
                          </div>

                          {voucher.status === 'active' && voucher.code && (
                            <div className="mt-3">
                              <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                                <code className="flex-1 px-3 py-1.5 bg-muted rounded text-sm font-mono text-center">
                                  {voucher.code}
                                </code>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    navigator.clipboard.writeText(voucher.code || '');
                                    toast({ title: t('Code copied!', 'تم نسخ الرمز!') });
                                  }}
                                >
                                  {t('Copy', 'نسخ')}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Ticket className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
                <h3 className="font-medium mb-1">{t('No vouchers yet', 'لا توجد قسائم بعد')}</h3>
                <p className="text-sm text-muted-foreground">{t('Activate offers to get vouchers', 'قم بتفعيل العروض للحصول على قسائم')}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Bank Card Benefits Tab */}
        <TabsContent value="bank-benefits" className="space-y-5">
          <BankCardBenefits cards={bankCards} />
        </TabsContent>
      </Tabs>

      {/* Offer Detail Sheet */}
      <OfferDetailSheet
        offer={selectedOffer}
        isOpen={!!selectedOffer}
        onClose={() => setSelectedOffer(null)}
        onActivate={handleActivate}
        isSaved={selectedOffer ? savedOffers.has(selectedOffer.id) : false}
        onToggleSave={handleSave}
        isActivating={isActivating}
      />
    </div>
  );
}

// Default export - renders the full Marketplace experience directly
export default function MarketplacePage() {
  return <MarketplaceContent />;
}
