import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Gift, Search, Star, Tag, CheckCircle } from 'lucide-react';
import { useMarketplaceOffers } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';
import { MARKETPLACE_CATEGORIES } from '@/lib/constants';

export default function MarketplacePage() {
  const { data: offers = [] } = useMarketplaceOffers();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('discount');

  const filteredOffers = useMemo(() => {
    let filtered = [...offers];
    if (searchTerm) {
      filtered = filtered.filter(o => o.title.toLowerCase().includes(searchTerm.toLowerCase()) || o.merchant.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (category !== 'all') {
      filtered = filtered.filter(o => o.category === category);
    }
    switch (sortBy) {
      case 'discount': filtered.sort((a, b) => (b.discount_percent || 0) - (a.discount_percent || 0)); break;
      case 'rating': filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
    }
    return filtered;
  }, [offers, searchTerm, category, sortBy]);

  const handleActivate = (offer: any) => {
    toast({ title: "Offer Activated!", description: `${offer.title} has been activated.` });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-3"><Gift className="w-7 h-7 text-accent" />Perks & Partners</h1>
        <p className="text-muted-foreground mt-1">Exclusive discounts and offers for employees</p>
      </div>
      <Card><CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search offers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" /></div>
          <Select value={category} onValueChange={setCategory}><SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Category" /></SelectTrigger><SelectContent><SelectItem value="all">All Categories</SelectItem>{MARKETPLACE_CATEGORIES.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent></Select>
          <Select value={sortBy} onValueChange={setSortBy}><SelectTrigger className="w-full md:w-40"><SelectValue placeholder="Sort By" /></SelectTrigger><SelectContent><SelectItem value="discount">Highest Discount</SelectItem><SelectItem value="rating">Top Rated</SelectItem></SelectContent></Select>
        </div>
      </CardContent></Card>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredOffers.map((offer) => (
          <Card key={offer.id} className="benefit-card overflow-hidden">
            {offer.image_url && <div className="h-32 bg-muted overflow-hidden"><img src={offer.image_url} alt={offer.title} className="w-full h-full object-cover" /></div>}
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-sm line-clamp-2">{offer.title}</h3>
                {offer.discount_percent && <Badge className="bg-accent/10 text-accent border-0 shrink-0">{offer.discount_percent}% OFF</Badge>}
              </div>
              <p className="text-xs text-muted-foreground">{offer.merchant}</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{offer.category}</Badge>
                {offer.rating && <span className="flex items-center gap-1 text-xs text-warning"><Star className="w-3 h-3 fill-current" />{offer.rating}</span>}
              </div>
              {offer.description && <p className="text-xs text-muted-foreground line-clamp-2">{offer.description}</p>}
              <Button size="sm" className="w-full" onClick={() => handleActivate(offer)}><CheckCircle className="w-3.5 h-3.5 mr-1" />Activate Offer</Button>
            </div>
          </Card>
        ))}
      </div>
      {filteredOffers.length === 0 && <Card className="p-12 text-center"><Gift className="w-12 h-12 mx-auto text-muted-foreground/50" /><p className="mt-4 text-muted-foreground">No offers match your filters</p></Card>}
    </div>
  );
}
