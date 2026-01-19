import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Gift, Star, CheckCircle, Grid3X3, List, Sparkles, 
  ShoppingBag, Coffee, Activity, Users, BookOpen, Home, Car, Plane,
  CreditCard, Search, X
} from 'lucide-react';
import { useMarketplaceOffers } from '@/hooks/useSupabaseData';
import { useProfile } from '@/contexts/ProfileContext';
import { useToast } from '@/hooks/use-toast';
import { MARKETPLACE_CATEGORIES } from '@/lib/constants';
import { CuratedPerks } from '@/components/dashboard/CuratedPerks';
import { BankCardBenefits } from '@/components/employee/BankCardBenefits';
import { PageHeader } from '@/components/shared/PageHeader';
import { NoSearchResults } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';

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

  const getCategoryConfig = (cat: string) => {
    return CATEGORY_CONFIG[cat] || { icon: ShoppingBag, color: 'text-gray-500', bgLight: 'bg-gray-50', bgDark: 'bg-gray-500' };
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
          
          {/* Browse by Category - Airbnb/Amazon Style */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-lg">Browse by Category</h3>
            
            {/* Horizontal scrollable category bar */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setCategory('all')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-full border whitespace-nowrap transition-all",
                  "hover:shadow-sm",
                  category === 'all' 
                    ? "bg-foreground text-background border-foreground shadow-sm" 
                    : "bg-background border-border hover:border-foreground/30"
                )}
              >
                <Grid3X3 className="w-4 h-4" />
                <span className="text-sm font-medium">All</span>
                <Badge variant="secondary" className={cn(
                  "text-[10px] px-1.5 h-5",
                  category === 'all' ? "bg-background/20 text-background" : ""
                )}>
                  {offers.length}
                </Badge>
              </button>
              
              {MARKETPLACE_CATEGORIES.map((cat) => {
                const config = getCategoryConfig(cat);
                const Icon = config.icon;
                const count = categoryCounts[cat] || 0;
                const isSelected = category === cat;
                
                return (
                  <button
                    key={cat}
                    onClick={() => setCategory(isSelected ? 'all' : cat)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-full border whitespace-nowrap transition-all",
                      "hover:shadow-sm",
                      isSelected 
                        ? `${config.bgDark} text-white border-transparent shadow-sm` 
                        : `bg-background border-border hover:${config.bgLight} hover:border-transparent`
                    )}
                  >
                    <Icon className={cn("w-4 h-4", isSelected ? "text-white" : config.color)} />
                    <span className="text-sm font-medium">{cat}</span>
                    <Badge variant="secondary" className={cn(
                      "text-[10px] px-1.5 h-5",
                      isSelected ? "bg-white/20 text-white" : ""
                    )}>
                      {count}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>

          {/* All Perks Section */}
          <div className="space-y-4">
            {/* Section Header with Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h3 className="font-display font-semibold text-lg">
                  {category === 'all' ? 'All Perks' : category}
                </h3>
                <Badge variant="outline" className="font-normal">
                  {filteredOffers.length} offers
                </Badge>
                {category !== 'all' && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setCategory('all')} 
                    className="h-7 px-2 text-muted-foreground"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
              
              {/* Controls */}
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
                        {/* Category color accent */}
                        <div className={cn("h-1", config.bgDark)} />
                        
                        {offer.image_url && (
                          <div className="relative h-36 bg-muted overflow-hidden">
                            <img 
                              src={offer.image_url} 
                              alt={offer.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            />
                            {/* Discount badge */}
                            {offer.discount_percent && (
                              <div className="absolute top-3 left-3">
                                <Badge className="bg-rose-500 hover:bg-rose-500 text-white border-0 text-xs font-bold shadow-lg px-2.5">
                                  -{offer.discount_percent}%
                                </Badge>
                              </div>
                            )}
                            {/* Rating badge */}
                            {offer.rating && (
                              <div className="absolute top-3 right-3">
                                <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm gap-1 text-xs">
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                  {offer.rating}
                                </Badge>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <CardContent className="p-4 space-y-3 flex flex-col flex-1">
                          {/* Category pill */}
                          <Badge 
                            variant="outline" 
                            className={cn("w-fit text-[10px] gap-1 border-0", config.bgLight, config.color)}
                          >
                            <config.icon className="w-3 h-3" />
                            {offer.category.split(' & ')[0]}
                          </Badge>
                          
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-accent transition-colors">
                              {offer.title}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1.5">{offer.merchant}</p>
                          </div>
                          
                          <Button 
                            size="sm" 
                            className="w-full gap-1.5"
                            onClick={() => handleActivate(offer)}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Activate
                          </Button>
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
                          {/* Color accent */}
                          <div className={cn("w-1 self-stretch rounded-full", config.bgDark)} />
                          
                          {offer.image_url && (
                            <div className="w-20 h-20 bg-muted rounded-xl overflow-hidden shrink-0">
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
                                <Badge 
                                  variant="outline" 
                                  className={cn("text-[10px] gap-1 border-0 mb-1.5", config.bgLight, config.color)}
                                >
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
                            <div className="flex items-center gap-2 mt-2">
                              {offer.rating && (
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                  {offer.rating}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <Button size="sm" className="shrink-0 gap-1.5" onClick={() => handleActivate(offer)}>
                            <CheckCircle className="w-3.5 h-3.5" />
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
