import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Gift, Star, CheckCircle, Grid3X3, List, Sparkles, ArrowRight,
  ShoppingBag, Coffee, Activity, Users, BookOpen, Home, Car, Plane,
  CreditCard, TrendingUp, Heart
} from 'lucide-react';
import { useMarketplaceOffers } from '@/hooks/useSupabaseData';
import { useProfile } from '@/contexts/ProfileContext';
import { useToast } from '@/hooks/use-toast';
import { MARKETPLACE_CATEGORIES } from '@/lib/constants';
import { CuratedPerks } from '@/components/dashboard/CuratedPerks';
import { BankCardBenefits } from '@/components/employee/BankCardBenefits';
import { PageHeader } from '@/components/shared/PageHeader';
import { FilterBar } from '@/components/shared/FilterBar';
import { NoSearchResults } from '@/components/ui/empty-state';
import { getMarketplaceCategoryColor } from '@/lib/colorUtils';
import { cn } from '@/lib/utils';

// Category icons mapping
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
};

export default function MarketplacePage() {
  const { data: offers = [] } = useMarketplaceOffers();
  const { bankCards } = useProfile();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('discount');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredOffers = useMemo(() => {
    let filtered = [...offers];
    if (searchTerm) {
      filtered = filtered.filter(o => 
        o.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        o.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (category !== 'all') {
      filtered = filtered.filter(o => o.category === category);
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

  // Count offers per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    offers.forEach(o => {
      counts[o.category] = (counts[o.category] || 0) + 1;
    });
    return counts;
  }, [offers]);

  const handleActivate = (offer: any) => {
    toast({ 
      title: "Offer Activated! 🎉", 
      description: `${offer.title} has been activated. Check your email for details.` 
    });
  };

  // Get category badge styling
  const getCategoryBadge = (categoryName: string) => {
    const color = getMarketplaceCategoryColor(categoryName);
    return (
      <Badge 
        variant="outline" 
        className={cn("text-xs px-2 border", color.bgLight, color.text, color.border)}
      >
        {categoryName}
      </Badge>
    );
  };

  // Stats for the header
  const totalSavings = offers.reduce((acc, o) => acc + (o.discount_percent || 0), 0);
  const avgDiscount = offers.length > 0 ? Math.round(totalSavings / offers.length) : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <PageHeader
        title="Perks & Partners"
        description="Exclusive discounts and benefits for employees"
        icon={Gift}
        iconClassName="from-violet-500 to-fuchsia-500 shadow-violet-500/25"
        badge={{
          label: `${offers.length} Active Offers`,
          icon: Sparkles,
          variant: 'accent',
        }}
      />

      {/* Quick Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border-violet-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/20">
              <Gift className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{offers.length}</p>
              <p className="text-xs text-muted-foreground">Active Offers</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{avgDiscount}%</p>
              <p className="text-xs text-muted-foreground">Avg. Discount</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <CreditCard className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{bankCards.length}</p>
              <p className="text-xs text-muted-foreground">Linked Cards</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 border-pink-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-pink-500/20">
              <Heart className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{MARKETPLACE_CATEGORIES.length}</p>
              <p className="text-xs text-muted-foreground">Categories</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="curated" className="space-y-6">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="curated" className="gap-2">
            <Sparkles className="w-4 h-4" />
            Tailored For You
          </TabsTrigger>
          <TabsTrigger value="bank-benefits" className="gap-2">
            <CreditCard className="w-4 h-4" />
            Bank Card Benefits
          </TabsTrigger>
          <TabsTrigger value="browse" className="gap-2">
            <Grid3X3 className="w-4 h-4" />
            Browse All
          </TabsTrigger>
        </TabsList>

        {/* Tailored Perks Tab */}
        <TabsContent value="curated" className="space-y-6">
          <CuratedPerks onActivate={handleActivate} />
          
          {/* Browse by Category - Compact */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Quick Browse by Category</h3>
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
              {MARKETPLACE_CATEGORIES.map((cat) => {
                const color = getMarketplaceCategoryColor(cat);
                const Icon = CATEGORY_ICONS[cat] || ShoppingBag;
                const count = categoryCounts[cat] || 0;
                
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setCategory(cat);
                      document.querySelector('[data-value="browse"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                    }}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-200",
                      "bg-card border-border/50 hover:border-border hover:shadow-md hover:-translate-y-0.5"
                    )}
                  >
                    <div className={cn("p-2 rounded-lg", color.bgLight)}>
                      <Icon className={cn("w-4 h-4", color.text)} />
                    </div>
                    <span className="text-[10px] font-medium text-center leading-tight text-muted-foreground">
                      {cat.split(' & ')[0]}
                    </span>
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
                      {count}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* Bank Card Benefits Tab */}
        <TabsContent value="bank-benefits" className="space-y-6">
          <BankCardBenefits cards={bankCards} />
        </TabsContent>

        {/* Browse All Tab */}
        <TabsContent value="browse" className="space-y-6">
          {/* Category Chips */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={category === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategory('all')}
              className="rounded-full"
            >
              All Offers
              <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5">
                {offers.length}
              </Badge>
            </Button>
            {MARKETPLACE_CATEGORIES.map((cat) => {
              const color = getMarketplaceCategoryColor(cat);
              const isSelected = category === cat;
              const count = categoryCounts[cat] || 0;
              
              return (
                <Button
                  key={cat}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategory(isSelected ? 'all' : cat)}
                  className={cn(
                    "rounded-full",
                    isSelected && `${color.bg} hover:opacity-90`
                  )}
                >
                  {cat}
                  <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5">
                    {count}
                  </Badge>
                </Button>
              );
            })}
          </div>

          {/* Search & Filter Bar */}
          <FilterBar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search offers, merchants..."
          >
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-36 bg-background">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="discount">Highest Discount</SelectItem>
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
          </FilterBar>

          {/* Section Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-semibold flex items-center gap-2">
              {category === 'all' ? 'All Offers' : category}
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <Badge variant="secondary">{filteredOffers.length} results</Badge>
            </h2>
            {(category !== 'all' || searchTerm) && (
              <Button variant="ghost" size="sm" onClick={() => { setCategory('all'); setSearchTerm(''); }}>
                Clear Filters
              </Button>
            )}
          </div>

          {/* Offers Grid/List */}
          {filteredOffers.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredOffers.map((offer, index) => {
                  const categoryColor = getMarketplaceCategoryColor(offer.category);
                  return (
                    <Card 
                      key={offer.id} 
                      className={cn(
                        "benefit-card overflow-hidden group hover:shadow-lg transition-all duration-300 flex flex-col",
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Category color bar */}
                      <div className={cn("h-1", categoryColor.bg)} />
                      {offer.image_url && (
                        <div className="h-28 bg-muted overflow-hidden shrink-0 relative">
                          <img 
                            src={offer.image_url} 
                            alt={offer.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                          {offer.discount_percent && (
                            <div className="absolute top-2 right-2">
                              <Badge className="bg-emerald-500 text-white border-0 text-xs font-bold shadow-lg">
                                {offer.discount_percent}% OFF
                              </Badge>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="p-4 space-y-2.5 flex flex-col flex-1">
                        <h3 className="font-medium text-sm leading-snug line-clamp-2 group-hover:text-accent transition-colors">
                          {offer.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{offer.merchant}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {getCategoryBadge(offer.category)}
                          {offer.rating && (
                            <span className="flex items-center gap-1 text-sm text-amber-500">
                              <Star className="w-3.5 h-3.5 fill-current" />
                              {offer.rating}
                            </span>
                          )}
                        </div>
                        {offer.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">{offer.description}</p>
                        )}
                        <Button size="sm" className="w-full mt-auto" onClick={() => handleActivate(offer)}>
                          <CheckCircle className="w-4 h-4 mr-1.5" />
                          Activate
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOffers.map((offer, index) => {
                  const categoryColor = getMarketplaceCategoryColor(offer.category);
                  return (
                    <Card 
                      key={offer.id} 
                      className="overflow-hidden group hover:border-accent/30 transition-all"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      {/* Category color bar */}
                      <div className={cn("h-1", categoryColor.bg)} />
                      <div className="flex items-center gap-4 p-4">
                        {offer.image_url && (
                          <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden shrink-0 relative">
                            <img 
                              src={offer.image_url} 
                              alt={offer.title} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="font-medium text-sm group-hover:text-accent transition-colors">
                                {offer.title}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-0.5">{offer.merchant}</p>
                            </div>
                            {offer.discount_percent && (
                              <Badge className="bg-emerald-500 text-white border-0 shrink-0 font-bold">
                                {offer.discount_percent}% OFF
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            {getCategoryBadge(offer.category)}
                            {offer.rating && (
                              <span className="flex items-center gap-1 text-xs text-amber-500">
                                <Star className="w-3 h-3 fill-current" />
                                {offer.rating}
                              </span>
                            )}
                          </div>
                          {offer.description && (
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-1">{offer.description}</p>
                          )}
                        </div>
                        <Button size="sm" className="shrink-0" onClick={() => handleActivate(offer)}>
                          <CheckCircle className="w-3.5 h-3.5 mr-1" />
                          Activate
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )
          ) : (
            <NoSearchResults 
              query={searchTerm || category !== 'all' ? (searchTerm || category) : undefined}
              onClear={() => { setSearchTerm(''); setCategory('all'); }}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
