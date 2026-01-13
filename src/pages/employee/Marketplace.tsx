import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Gift, Search, Star, CheckCircle, Filter, Grid3X3, List } from 'lucide-react';
import { useMarketplaceOffers } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';
import { MARKETPLACE_CATEGORIES } from '@/lib/constants';
import { CuratedPerks } from '@/components/dashboard/CuratedPerks';

export default function MarketplacePage() {
  const { data: offers = [] } = useMarketplaceOffers();
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

  const handleActivate = (offer: any) => {
    toast({ 
      title: "Offer Activated! 🎉", 
      description: `${offer.title} has been activated. Check your email for details.` 
    });
  };

  // Group offers by category for category view
  const offersByCategory = useMemo(() => {
    const grouped: Record<string, typeof offers> = {};
    offers.forEach(offer => {
      if (!grouped[offer.category]) {
        grouped[offer.category] = [];
      }
      grouped[offer.category].push(offer);
    });
    return grouped;
  }, [offers]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-3">
            <Gift className="w-7 h-7 text-accent" />
            Perks & Partners
          </h1>
          <p className="text-muted-foreground mt-1">Exclusive discounts and offers for employees</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">
            {offers.length} Active Offers
          </Badge>
        </div>
      </div>

      {/* Curated Perks Section */}
      <CuratedPerks onActivate={handleActivate} />
      <Card className="border-border/50">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search offers, merchants, or keywords..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="pl-9" 
              />
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {MARKETPLACE_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="discount">Highest Discount</SelectItem>
                  <SelectItem value="rating">Top Rated</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>

              {/* View Toggle */}
              <div className="flex border rounded-md overflow-hidden">
                <Button 
                  variant={viewMode === 'grid' ? 'default' : 'ghost'} 
                  size="sm" 
                  className="rounded-none"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button 
                  variant={viewMode === 'list' ? 'default' : 'ghost'} 
                  size="sm" 
                  className="rounded-none"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* All Offers Section */}
      <div>
        <h2 className="text-lg font-display font-semibold mb-4">All Offers</h2>
        
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredOffers.map((offer, index) => (
              <Card 
                key={offer.id} 
                className="benefit-card overflow-hidden group hover:shadow-md transition-all duration-300 flex flex-col"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {offer.image_url && (
                  <div className="h-32 bg-muted overflow-hidden shrink-0">
                    <img 
                      src={offer.image_url} 
                      alt={offer.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                )}
                <div className="p-4 space-y-2.5 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-sm leading-snug line-clamp-2 group-hover:text-accent transition-colors">
                      {offer.title}
                    </h3>
                    {offer.discount_percent && (
                      <Badge className="bg-accent/10 text-accent border-0 shrink-0 text-xs px-2">
                        {offer.discount_percent}%
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{offer.merchant}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs px-2">{offer.category}</Badge>
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
                  {offer.tags && offer.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {offer.tags.slice(0, 2).map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs py-0.5 px-2">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <Button size="sm" className="w-full mt-auto" onClick={() => handleActivate(offer)}>
                    <CheckCircle className="w-4 h-4 mr-1.5" />
                    Activate
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOffers.map((offer, index) => (
              <Card 
                key={offer.id} 
                className="overflow-hidden group hover:border-accent/30 transition-all"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex items-center gap-4 p-4">
                  {offer.image_url && (
                    <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden shrink-0">
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
                        <Badge className="bg-accent/10 text-accent border-0 shrink-0">
                          {offer.discount_percent}% OFF
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">{offer.category}</Badge>
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
            ))}
          </div>
        )}
      </div>

      {/* Empty State */}
      {filteredOffers.length === 0 && (
        <Card className="p-12 text-center">
          <Gift className="w-12 h-12 mx-auto text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">No offers match your filters</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => { setSearchTerm(''); setCategory('all'); }}
          >
            Clear Filters
          </Button>
        </Card>
      )}
    </div>
  );
}
