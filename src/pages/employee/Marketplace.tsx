import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Gift, Star, CheckCircle, Grid3X3, List, Sparkles, 
  ShoppingBag, Coffee, Activity, Users, BookOpen, Home, Car, Plane,
  CreditCard, ChevronRight
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

  const handleCategoryClick = (cat: string) => {
    setCategory(category === cat ? 'all' : cat);
  };

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

      {/* Main Tabs */}
      <Tabs defaultValue="personalized" className="space-y-6">
        <TabsList className="h-auto gap-1 bg-muted/50 p-1">
          <TabsTrigger value="personalized" className="gap-2 data-[state=active]:bg-background">
            <Sparkles className="w-4 h-4" />
            Personalized For You
          </TabsTrigger>
          <TabsTrigger value="bank-benefits" className="gap-2 data-[state=active]:bg-background">
            <CreditCard className="w-4 h-4" />
            Bank Card Benefits
          </TabsTrigger>
        </TabsList>

        {/* Personalized Tab */}
        <TabsContent value="personalized" className="space-y-8">
          {/* AI Curated Section */}
          <CuratedPerks onActivate={handleActivate} />
          
          {/* Browse by Category */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-lg">Browse by Category</h3>
              {category !== 'all' && (
                <Button variant="ghost" size="sm" onClick={() => setCategory('all')} className="text-muted-foreground">
                  Clear filter
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
              {MARKETPLACE_CATEGORIES.map((cat) => {
                const Icon = CATEGORY_ICONS[cat] || ShoppingBag;
                const count = categoryCounts[cat] || 0;
                const isSelected = category === cat;
                
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategoryClick(cat)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200",
                      "hover:shadow-sm hover:border-border",
                      isSelected 
                        ? "bg-accent/10 border-accent/30 shadow-sm" 
                        : "bg-card border-border/40 hover:bg-muted/50"
                    )}
                  >
                    <div className={cn(
                      "p-2.5 rounded-xl transition-colors",
                      isSelected 
                        ? "bg-accent/20" 
                        : "bg-muted/60"
                    )}>
                      <Icon className={cn(
                        "w-5 h-5 transition-colors",
                        isSelected ? "text-accent" : "text-muted-foreground"
                      )} />
                    </div>
                    <div className="text-center">
                      <span className={cn(
                        "text-xs font-medium leading-tight block",
                        isSelected ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {cat.split(' & ')[0]}
                      </span>
                      <span className={cn(
                        "text-[10px] mt-0.5 block",
                        isSelected ? "text-accent" : "text-muted-foreground/70"
                      )}>
                        {count} offers
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* All Offers Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-lg flex items-center gap-2">
                {category === 'all' ? 'All Offers' : category}
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <Badge variant="secondary" className="font-normal">{filteredOffers.length}</Badge>
              </h3>
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

            {/* Offers Grid/List */}
            {filteredOffers.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {filteredOffers.map((offer, index) => (
                    <Card 
                      key={offer.id} 
                      className="overflow-hidden group hover:shadow-md transition-all duration-300 flex flex-col border-border/50"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {offer.image_url && (
                        <div className="h-32 bg-muted overflow-hidden shrink-0 relative">
                          <img 
                            src={offer.image_url} 
                            alt={offer.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                          {offer.discount_percent && (
                            <div className="absolute top-2 right-2">
                              <Badge className="bg-accent text-accent-foreground border-0 text-xs font-semibold shadow-md">
                                {offer.discount_percent}% OFF
                              </Badge>
                            </div>
                          )}
                        </div>
                      )}
                      <CardContent className="p-4 space-y-3 flex flex-col flex-1">
                        <div className="flex-1">
                          <h3 className="font-medium text-sm leading-snug line-clamp-2 group-hover:text-accent transition-colors">
                            {offer.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">{offer.merchant}</p>
                        </div>
                        <div className="flex items-center justify-between">
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
                        <Button size="sm" className="w-full" onClick={() => handleActivate(offer)}>
                          <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                          Activate
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredOffers.map((offer, index) => (
                    <Card 
                      key={offer.id} 
                      className="overflow-hidden group hover:shadow-sm transition-all border-border/50"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <div className="flex items-center gap-4 p-4">
                        {offer.image_url && (
                          <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden shrink-0">
                            <img 
                              src={offer.image_url} 
                              alt={offer.title} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="font-medium text-sm group-hover:text-accent transition-colors">
                                {offer.title}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-0.5">{offer.merchant}</p>
                            </div>
                            {offer.discount_percent && (
                              <Badge className="bg-accent text-accent-foreground border-0 shrink-0 text-xs font-semibold">
                                {offer.discount_percent}% OFF
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
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
                        </div>
                        <Button size="sm" className="shrink-0" onClick={() => handleActivate(offer)}>
                          <CheckCircle className="w-3.5 h-3.5 mr-1" />
                          Activate
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )
            ) : (
              <NoSearchResults 
                query={searchTerm || category !== 'all' ? (searchTerm || category) : undefined}
                onClear={() => { setSearchTerm(''); setCategory('all'); }}
              />
            )}
          </div>
        </TabsContent>

        {/* Bank Card Benefits Tab */}
        <TabsContent value="bank-benefits" className="space-y-6">
          <BankCardBenefits cards={bankCards} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
