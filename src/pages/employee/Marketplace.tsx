import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Gift, Star, CheckCircle, Grid3X3, List, Sparkles, 
  ShoppingBag, Coffee, Activity, Users, BookOpen, Home, Car, Plane,
  CreditCard, Search, X, Clock, Ticket, Heart, AlertCircle,
  Calendar, Tag, Building2, Link as LinkIcon, QrCode, Wallet
} from 'lucide-react';
import { useMarketplaceOffers, usePerkActivations } from '@/hooks/useSupabaseData';
import { useProfile } from '@/contexts/ProfileContext';
import { useToast } from '@/hooks/use-toast';
import { MARKETPLACE_CATEGORIES } from '@/lib/constants';
import { CuratedPerks } from '@/components/dashboard/CuratedPerks';
import { BankCardBenefits } from '@/components/employee/BankCardBenefits';
import { PageHeader } from '@/components/shared/PageHeader';
import { NoSearchResults, EmptyState } from '@/components/ui/empty-state';
// Removed Phase2Gate - Marketplace is now fully functional
import { cn } from '@/lib/utils';
import { format, isPast, isWithinInterval, addDays } from 'date-fns';

// Category config with vibrant but balanced colors
const CATEGORY_CONFIG: Record<string, { icon: React.ElementType; color: string; bgLight: string; bgDark: string }> = {
  'Everyday Essentials': { icon: ShoppingBag, color: 'text-rose-500', bgLight: 'bg-rose-50 dark:bg-rose-950/30', bgDark: 'bg-rose-500' },
  'Food & Coffee': { icon: Coffee, color: 'text-amber-500', bgLight: 'bg-amber-50 dark:bg-amber-950/30', bgDark: 'bg-amber-500' },
  'Health & Fitness': { icon: Activity, color: 'text-emerald-500', bgLight: 'bg-emerald-50 dark:bg-emerald-950/30', bgDark: 'bg-emerald-500' },
  'Family & Parenting': { icon: Users, color: 'text-sky-500', bgLight: 'bg-sky-50 dark:bg-sky-950/30', bgDark: 'bg-sky-500' },
  'Learning & Skills': { icon: BookOpen, color: 'text-violet-500', bgLight: 'bg-violet-50 dark:bg-violet-950/30', bgDark: 'bg-violet-500' },
  'Home & Living': { icon: Home, color: 'text-orange-500', bgLight: 'bg-orange-50 dark:bg-orange-950/30', bgDark: 'bg-orange-500' },
  'Mobility': { icon: Car, color: 'text-cyan-500', bgLight: 'bg-cyan-50 dark:bg-cyan-950/30', bgDark: 'bg-cyan-500' },
  'Lifestyle & Shopping': { icon: Sparkles, color: 'text-pink-500', bgLight: 'bg-pink-50 dark:bg-pink-950/30', bgDark: 'bg-pink-500' },
  'Travel & Experiences': { icon: Plane, color: 'text-indigo-500', bgLight: 'bg-indigo-50 dark:bg-indigo-950/30', bgDark: 'bg-indigo-500' },
  // Wellness - for category tabs
  'Wellness': { icon: Heart, color: 'text-pink-500', bgLight: 'bg-pink-50 dark:bg-pink-950/30', bgDark: 'bg-pink-500' },
  'Food & Dining': { icon: Coffee, color: 'text-amber-500', bgLight: 'bg-amber-50 dark:bg-amber-950/30', bgDark: 'bg-amber-500' },
  'Fitness': { icon: Activity, color: 'text-emerald-500', bgLight: 'bg-emerald-50 dark:bg-emerald-950/30', bgDark: 'bg-emerald-500' },
  'Learning': { icon: BookOpen, color: 'text-violet-500', bgLight: 'bg-violet-50 dark:bg-violet-950/30', bgDark: 'bg-violet-500' },
  'Family': { icon: Users, color: 'text-sky-500', bgLight: 'bg-sky-50 dark:bg-sky-950/30', bgDark: 'bg-sky-500' },
  'Transport': { icon: Car, color: 'text-cyan-500', bgLight: 'bg-cyan-50 dark:bg-cyan-950/30', bgDark: 'bg-cyan-500' },
  'Experiences': { icon: Plane, color: 'text-indigo-500', bgLight: 'bg-indigo-50 dark:bg-indigo-950/30', bgDark: 'bg-indigo-500' },
};

// Simplified category tabs
const CATEGORY_TABS = [
  'All',
  'Wellness',
  'Food & Dining',
  'Fitness',
  'Learning',
  'Family',
  'Transport',
  'Experiences',
];

// Redemption method types
type RedemptionMethod = 'code' | 'deeplink' | 'voucher' | 'payroll';

const REDEMPTION_CONFIG: Record<RedemptionMethod, { label: string; description: string }> = {
  'code': { label: 'Promo Code', description: 'Copy code and use at checkout' },
  'deeplink': { label: 'Direct Link', description: 'Click to apply discount automatically' },
  'voucher': { label: 'E-Voucher', description: 'Download voucher to present in-store' },
  'payroll': { label: 'Payroll Deduction', description: 'Deducted from your salary' },
};

// Offer sponsorship type
type SponsorshipType = 'employer' | 'public';

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
  redemptionMethod?: RedemptionMethod;
}

// Helper to determine sponsorship type (demo logic)
function getOfferSponsorship(offer: any): SponsorshipType {
  // In real implementation, this would come from the offer data
  // For demo, we mark offers with high discounts as employer-sponsored
  return (offer.discount_percent && offer.discount_percent >= 15) ? 'employer' : 'public';
}

// Helper to determine redemption method (demo logic)
function getRedemptionMethod(offer: any): RedemptionMethod {
  // In real implementation, this would come from the offer data
  const category = offer.category?.toLowerCase() || '';
  if (category.includes('fitness') || category.includes('health')) return 'voucher';
  if (category.includes('learning')) return 'deeplink';
  if (category.includes('shopping')) return 'payroll';
  return 'code';
}

function MarketplaceContent() {
  const { data: offers = [] } = useMarketplaceOffers();
  const { data: activations = [] } = usePerkActivations();
  const { bankCards, profile, children } = useProfile();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('discount');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [savedOffers, setSavedOffers] = useState<Set<string>>(new Set());
  const [voucherFilter, setVoucherFilter] = useState<VoucherStatus | 'all'>('all');

  // Map activations to vouchers
  const vouchers: VoucherData[] = useMemo(() => {
    return activations.map((activation: any) => {
      const expiresAt = addDays(new Date(activation.activated_at), 30); // 30-day validity
      const isExpired = isPast(expiresAt);
      const isRedeemed = false; // Would come from actual redemption data
      
      return {
        id: activation.id,
        offer: activation.marketplace_offers,
        activatedAt: activation.activated_at,
        expiresAt: expiresAt.toISOString(),
        status: isExpired ? 'expired' : isRedeemed ? 'redeemed' : 'active' as VoucherStatus,
        code: `BNFT${activation.id.slice(0, 6).toUpperCase()}`,
      };
    }).filter((v: VoucherData) => v.offer); // Filter out any without offer data
  }, [activations]);

  const filteredVouchers = useMemo(() => {
    if (voucherFilter === 'all') return vouchers;
    return vouchers.filter(v => v.status === voucherFilter);
  }, [vouchers, voucherFilter]);

  // Match categories for filtering (simplified mapping)
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
    if (searchTerm) {
      filtered = filtered.filter(o => 
        o.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        o.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (category !== 'All') {
      const matchingCategories = categoryMapping[category] || [category];
      filtered = filtered.filter(o => matchingCategories.includes(o.category));
    }
    switch (sortBy) {
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
  }, [offers, searchTerm, category, sortBy]);

  // Personalized recommendations based on profile
  const recommendedOffers = useMemo(() => {
    // Simple recommendation logic based on profile
    const hasChildren = children.length > 0;
    const interests = ['Travel', 'Fitness', 'Technology']; // Would come from profile
    
    return offers.filter(o => {
      if (hasChildren && o.category === 'Family & Parenting') return true;
      if (o.category === 'Health & Fitness') return true;
      if (o.rating && o.rating >= 4.5) return true;
      return false;
    }).slice(0, 6);
  }, [offers, children]);

  // Count offers per category tab
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { 'All': offers.length };
    CATEGORY_TABS.slice(1).forEach(cat => {
      const matchingCategories = categoryMapping[cat] || [cat];
      counts[cat] = offers.filter(o => matchingCategories.includes(o.category)).length;
    });
    return counts;
  }, [offers]);

  const handleActivate = (offer: any) => {
    toast({ 
      title: "Offer Activated! 🎉", 
      description: `${offer.title} has been activated. Check "My Vouchers" for your code.` 
    });
  };

  const handleSave = (offerId: string) => {
    setSavedOffers(prev => {
      const next = new Set(prev);
      if (next.has(offerId)) {
        next.delete(offerId);
        toast({ title: "Removed from saved" });
      } else {
        next.add(offerId);
        toast({ title: "Saved for later ❤️" });
      }
      return next;
    });
  };

  const getCategoryConfig = (cat: string) => {
    return CATEGORY_CONFIG[cat] || { icon: ShoppingBag, color: 'text-gray-500', bgLight: 'bg-gray-50', bgDark: 'bg-gray-500' };
  };

  const getVoucherStatusBadge = (status: VoucherStatus) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Active</Badge>;
      case 'redeemed':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Redeemed</Badge>;
      case 'expired':
        return <Badge className="bg-slate-500/10 text-slate-600 border-slate-500/20">Expired</Badge>;
    }
  };

  // Count sponsored vs public offers
  const sponsoredCount = offers.filter(o => getOfferSponsorship(o) === 'employer').length;

  // Empty state when no offers available
  if (offers.length === 0) {
    return (
      <div className="space-y-8 animate-fade-in">
        <PageHeader
          title="Perks & Partners"
          description="Exclusive discounts and benefits for employees"
          icon={Gift}
          iconClassName="from-accent to-accent/80 shadow-accent/25"
        />
        
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No Offers Available Yet</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
              Marketplace offers are enabled by your employer based on eligibility and benefit entitlements. 
              Ask HR to enable the marketplace for your organization.
            </p>
            <div className="p-4 rounded-xl bg-muted/50 max-w-sm mx-auto text-sm text-left space-y-2">
              <p className="font-medium">How it works:</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• <span className="text-accent font-medium">Employer-Sponsored</span> — Exclusive discounts subsidized by your company</li>
                <li>• <span className="text-muted-foreground font-medium">Public Offers</span> — Partner discounts available to all employees</li>
                <li>• Offers are curated based on your profile</li>
                <li>• Eligibility depends on your benefit tier</li>
              </ul>
            </div>
            <Button variant="outline" className="mt-6" asChild>
              <a href="/employee/requests?type=question">Ask HR about Marketplace</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <PageHeader
        title="Perks & Partners"
        description="Exclusive discounts and benefits for employees"
        icon={Gift}
        iconClassName="from-accent to-accent/80 shadow-accent/25"
        badge={{
          label: `${offers.length} Active Offers`,
          icon: Sparkles,
          variant: 'accent',
        }}
      />

      {/* Sponsorship Legend */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Badge className="bg-accent/10 text-accent border-0 gap-1">
            <Building2 className="w-3 h-3" />
            Employer-Sponsored
          </Badge>
          <span className="text-muted-foreground">({sponsoredCount} offers) — Exclusive discounts subsidized by your company</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            Public Offer
          </Badge>
          <span className="text-muted-foreground">— Partner discounts available to all employees</span>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="personalized" className="space-y-6">
        <TabsList className="h-auto gap-1 bg-muted/50 p-1">
          <TabsTrigger value="personalized" className="gap-2 data-[state=active]:bg-background">
            <Sparkles className="w-4 h-4" />
            Recommended
          </TabsTrigger>
          <TabsTrigger value="browse" className="gap-2 data-[state=active]:bg-background">
            <Grid3X3 className="w-4 h-4" />
            Browse All
          </TabsTrigger>
          <TabsTrigger value="vouchers" className="gap-2 data-[state=active]:bg-background">
            <Ticket className="w-4 h-4" />
            My Vouchers
            {vouchers.filter(v => v.status === 'active').length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                {vouchers.filter(v => v.status === 'active').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="bank-benefits" className="gap-2 data-[state=active]:bg-background">
            <CreditCard className="w-4 h-4" />
            Bank Card Benefits
          </TabsTrigger>
        </TabsList>

        {/* Personalized/Recommended Tab */}
        <TabsContent value="personalized" className="space-y-8">
          {/* AI Curated Section */}
          <CuratedPerks onActivate={handleActivate} />
          
          {/* Recommended For You based on profile */}
          {recommendedOffers.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                <h3 className="font-display font-semibold text-lg">Recommended For You</h3>
              </div>
              <p className="text-sm text-muted-foreground -mt-2">
                Based on your profile, location, and {children.length > 0 ? 'family status' : 'interests'}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {recommendedOffers.map((offer, index) => {
                  const config = getCategoryConfig(offer.category);
                  return (
                    <Card 
                      key={offer.id} 
                      className="overflow-hidden group hover:shadow-lg transition-all duration-300 flex flex-col border-border/60 hover:border-border"
                      style={{ animationDelay: `${index * 40}ms` }}
                    >
                      <div className={cn("h-1", config.bgDark)} />
                      
                      {offer.image_url && (
                        <div className="relative h-32 bg-muted overflow-hidden">
                          <img 
                            src={offer.image_url} 
                            alt={offer.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                          {offer.discount_percent && (
                            <Badge className="absolute top-2 left-2 bg-rose-500 hover:bg-rose-500 text-white border-0 text-xs font-bold">
                              -{offer.discount_percent}%
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
                            onClick={(e) => { e.preventDefault(); handleSave(offer.id); }}
                          >
                            <Heart className={cn("w-4 h-4", savedOffers.has(offer.id) && "fill-rose-500 text-rose-500")} />
                          </Button>
                        </div>
                      )}
                      
                      <CardContent className="p-3 space-y-2 flex flex-col flex-1">
                        <Badge variant="outline" className={cn("w-fit text-[10px] gap-1 border-0", config.bgLight, config.color)}>
                          <config.icon className="w-3 h-3" />
                          {offer.category.split(' & ')[0]}
                        </Badge>
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm leading-snug line-clamp-2">{offer.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1">{offer.merchant}</p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1" onClick={() => handleSave(offer.id)}>
                            <Heart className={cn("w-3.5 h-3.5 mr-1", savedOffers.has(offer.id) && "fill-current")} />
                            Save
                          </Button>
                          <Button size="sm" className="flex-1" onClick={() => handleActivate(offer)}>
                            Redeem
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Browse All Tab */}
        <TabsContent value="browse" className="space-y-6">
          {/* Category Tabs - Horizontal scrollable */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORY_TABS.map((cat) => {
              const config = getCategoryConfig(cat);
              const Icon = cat === 'All' ? Grid3X3 : config.icon;
              const count = categoryCounts[cat] || 0;
              const isSelected = category === cat;
              
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-full border whitespace-nowrap transition-all",
                    "hover:shadow-sm",
                    isSelected 
                      ? cat === 'All' 
                        ? "bg-foreground text-background border-foreground shadow-sm"
                        : `${config.bgDark} text-white border-transparent shadow-sm`
                      : "bg-background border-border hover:border-foreground/30"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isSelected ? "text-inherit" : config.color)} />
                  <span className="text-sm font-medium">{cat}</span>
                  <Badge variant="secondary" className={cn(
                    "text-[10px] px-1.5 h-5",
                    isSelected ? "bg-white/20 text-inherit" : ""
                  )}>
                    {count}
                  </Badge>
                </button>
              );
            })}
          </div>

          {/* Search and Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h3 className="font-display font-semibold text-lg">
                {category === 'All' ? 'All Offers' : category}
              </h3>
              <Badge variant="outline" className="font-normal">
                {filteredOffers.length} offers
              </Badge>
              {category !== 'All' && (
                <Button variant="ghost" size="sm" onClick={() => setCategory('All')} className="h-7 px-2 text-muted-foreground">
                  <X className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search offers..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="pl-9 h-9 bg-background" 
                />
              </div>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px] h-9 bg-background">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="discount">Best Discount</SelectItem>
                  <SelectItem value="rating">Top Rated</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex border rounded-lg overflow-hidden bg-background">
                <Button 
                  variant={viewMode === 'grid' ? 'default' : 'ghost'} 
                  size="sm" 
                  className="rounded-none h-9 px-3"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button 
                  variant={viewMode === 'list' ? 'default' : 'ghost'} 
                  size="sm" 
                  className="rounded-none h-9 px-3"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Offers Grid/List */}
          {filteredOffers.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredOffers.map((offer, index) => {
                  const config = getCategoryConfig(offer.category);
                  return (
                    <Card 
                      key={offer.id} 
                      className="overflow-hidden group hover:shadow-lg transition-all duration-300 flex flex-col border-border/60 hover:border-border"
                      style={{ animationDelay: `${index * 40}ms` }}
                    >
                      <div className={cn("h-1", config.bgDark)} />
                      
                      {offer.image_url && (
                        <div className="relative h-36 bg-muted overflow-hidden">
                          <img 
                            src={offer.image_url} 
                            alt={offer.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                          {offer.discount_percent && (
                            <div className="absolute top-3 left-3">
                              <Badge className="bg-rose-500 hover:bg-rose-500 text-white border-0 text-xs font-bold shadow-lg px-2.5">
                                -{offer.discount_percent}%
                              </Badge>
                            </div>
                          )}
                          {offer.rating && (
                            <div className="absolute top-3 right-3">
                              <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm gap-1 text-xs">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                {offer.rating}
                              </Badge>
                            </div>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute bottom-2 right-2 h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => { e.preventDefault(); handleSave(offer.id); }}
                          >
                            <Heart className={cn("w-4 h-4", savedOffers.has(offer.id) && "fill-rose-500 text-rose-500")} />
                          </Button>
                        </div>
                      )}
                      
                      <CardContent className="p-4 space-y-3 flex flex-col flex-1">
                        <Badge variant="outline" className={cn("w-fit text-[10px] gap-1 border-0", config.bgLight, config.color)}>
                          <config.icon className="w-3 h-3" />
                          {offer.category.split(' & ')[0]}
                        </Badge>
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-accent transition-colors">
                            {offer.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1.5">{offer.merchant}</p>
                        </div>

                        {/* Eligibility indicator */}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <CheckCircle className="w-3 h-3 text-emerald-500" />
                          <span>Eligible</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => handleSave(offer.id)}>
                            <Heart className={cn("w-3.5 h-3.5", savedOffers.has(offer.id) && "fill-current")} />
                            Save
                          </Button>
                          <Button size="sm" className="flex-1 gap-1" onClick={() => handleActivate(offer)}>
                            Redeem
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredOffers.map((offer, index) => {
                  const config = getCategoryConfig(offer.category);
                  return (
                    <Card 
                      key={offer.id} 
                      className="overflow-hidden group hover:shadow-sm transition-all border-border/60 hover:border-border"
                      style={{ animationDelay: `${index * 25}ms` }}
                    >
                      <div className="flex items-center gap-4 p-4">
                        <div className={cn("w-1 self-stretch rounded-full", config.bgDark)} />
                        
                        {offer.image_url && (
                          <div className="w-20 h-20 bg-muted rounded-xl overflow-hidden shrink-0">
                            <img src={offer.image_url} alt={offer.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <Badge variant="outline" className={cn("text-[10px] gap-1 border-0 mb-1.5", config.bgLight, config.color)}>
                                <config.icon className="w-3 h-3" />
                                {offer.category.split(' & ')[0]}
                              </Badge>
                              <h3 className="font-semibold text-sm group-hover:text-accent transition-colors">
                                {offer.title}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-0.5">{offer.merchant}</p>
                            </div>
                            {offer.discount_percent && (
                              <Badge className="bg-rose-500 hover:bg-rose-500 text-white border-0 shrink-0 text-xs font-bold">
                                -{offer.discount_percent}%
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            {offer.rating && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                {offer.rating}
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-xs text-emerald-600">
                              <CheckCircle className="w-3 h-3" />
                              Eligible
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleSave(offer.id)}>
                            <Heart className={cn("w-3.5 h-3.5", savedOffers.has(offer.id) && "fill-current")} />
                          </Button>
                          <Button size="sm" className="gap-1.5" onClick={() => handleActivate(offer)}>
                            <CheckCircle className="w-3.5 h-3.5" />
                            Redeem
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )
          ) : (
            <NoSearchResults 
              query={searchTerm || category !== 'All' ? (searchTerm || category) : undefined}
              onClear={() => { setSearchTerm(''); setCategory('All'); }}
            />
          )}
        </TabsContent>

        {/* My Vouchers Tab */}
        <TabsContent value="vouchers" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold text-lg">My Vouchers</h3>
              <p className="text-sm text-muted-foreground">
                Vouchers you've activated from offers
              </p>
            </div>
            
            <Select value={voucherFilter} onValueChange={(v) => setVoucherFilter(v as VoucherStatus | 'all')}>
              <SelectTrigger className="w-[140px] h-9 bg-background">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vouchers</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="redeemed">Redeemed</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredVouchers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVouchers.map((voucher) => {
                const config = getCategoryConfig(voucher.offer.category);
                return (
                  <Card key={voucher.id} className={cn(
                    "overflow-hidden",
                    voucher.status === 'expired' && "opacity-60"
                  )}>
                    <div className={cn("h-1", config.bgDark)} />
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Badge variant="outline" className={cn("text-[10px] gap-1 border-0 mb-2", config.bgLight, config.color)}>
                            <config.icon className="w-3 h-3" />
                            {voucher.offer.category.split(' & ')[0]}
                          </Badge>
                          <h4 className="font-semibold text-sm">{voucher.offer.title}</h4>
                          <p className="text-xs text-muted-foreground">{voucher.offer.merchant}</p>
                        </div>
                        {getVoucherStatusBadge(voucher.status)}
                      </div>

                      {voucher.status === 'active' && voucher.code && (
                        <div className="p-3 rounded-lg bg-muted/50 border border-dashed border-border">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Voucher Code</p>
                              <p className="font-mono font-bold text-lg">{voucher.code}</p>
                            </div>
                            {voucher.offer.discount_percent && (
                              <Badge className="bg-rose-500 text-white border-0 text-sm px-3">
                                -{voucher.offer.discount_percent}%
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          <span>Activated {format(new Date(voucher.activatedAt), 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Expires {format(new Date(voucher.expiresAt), 'MMM d')}</span>
                        </div>
                      </div>

                      {voucher.status === 'active' && (
                        <Button className="w-full" size="sm">
                          Use Voucher
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <div className="mx-auto w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                  <Ticket className="w-6 h-6 text-muted-foreground" />
                </div>
                <h4 className="font-semibold mb-1">No Vouchers Yet</h4>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Activate offers to receive voucher codes you can use at partner merchants.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Bank Card Benefits Tab */}
        <TabsContent value="bank-benefits" className="space-y-6">
          <BankCardBenefits cards={bankCards} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Default export - renders the full Marketplace experience directly
export default function MarketplacePage() {
  return <MarketplaceContent />;
}
