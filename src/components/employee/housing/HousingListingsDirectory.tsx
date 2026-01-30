/**
 * HousingListingsDirectory
 * 
 * Displays housing listings with links to Bayut and PropertyFinder.
 * Shows within-budget and top-up amounts for informed decision making.
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Search, 
  Star, 
  ExternalLink, 
  MapPin, 
  Bed, 
  Bath,
  ArrowUpDown
} from 'lucide-react';
import { useHousingListings, useHousingAreas } from '@/hooks/useSupabaseData';
import { formatCurrencyAED } from '@/lib/utils';

interface HousingListingsDirectoryProps {
  annualAllowance?: number;
}

export function HousingListingsDirectory({ 
  annualAllowance = 120000 
}: HousingListingsDirectoryProps) {
  const { data: listings = [] } = useHousingListings();
  const { data: areas = [] } = useHousingAreas();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [bedrooms, setBedrooms] = useState<string>('all');
  const [budgetFilter, setBudgetFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('within_budget');

  const formatCurrency = (value: number) => formatCurrencyAED(value, { abbreviate: false });

  const filteredListings = useMemo(() => {
    let filtered = [...listings];

    if (searchTerm) {
      filtered = filtered.filter(l =>
        l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.area.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedArea !== 'all') {
      filtered = filtered.filter(l => l.area === selectedArea);
    }

    if (bedrooms !== 'all') {
      filtered = filtered.filter(l => l.bedrooms === parseInt(bedrooms));
    }

    if (budgetFilter === 'within') {
      filtered = filtered.filter(l => l.annual_rent <= annualAllowance);
    } else if (budgetFilter === 'above') {
      filtered = filtered.filter(l => l.annual_rent > annualAllowance);
    }

    switch (sortBy) {
      case 'within_budget':
        filtered.sort((a, b) => {
          const aWithin = a.annual_rent <= annualAllowance ? 0 : 1;
          const bWithin = b.annual_rent <= annualAllowance ? 0 : 1;
          if (aWithin !== bWithin) return aWithin - bWithin;
          return a.annual_rent - b.annual_rent;
        });
        break;
      case 'price_low':
        filtered.sort((a, b) => a.annual_rent - b.annual_rent);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.annual_rent - a.annual_rent);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
    }

    return filtered;
  }, [listings, searchTerm, selectedArea, bedrooms, budgetFilter, sortBy, annualAllowance]);

  const withinBudgetCount = listings.filter(l => l.annual_rent <= annualAllowance).length;
  const aboveBudgetCount = listings.filter(l => l.annual_rent > annualAllowance).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <Home className="w-5 h-5 text-muted-foreground" />
              Property listings
              <Badge variant="secondary" className="ml-2">
                {withinBudgetCount} within budget
              </Badge>
            </CardTitle>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search listings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
            
            <Select value={selectedArea} onValueChange={setSelectedArea}>
              <SelectTrigger className="h-8 w-32 text-xs">
                <SelectValue placeholder="Area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Areas</SelectItem>
                {areas.map((area) => (
                  <SelectItem key={area.id} value={area.name}>{area.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={bedrooms} onValueChange={setBedrooms}>
              <SelectTrigger className="h-8 w-24 text-xs">
                <SelectValue placeholder="Beds" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="0">Studio</SelectItem>
                <SelectItem value="1">1 BR</SelectItem>
                <SelectItem value="2">2 BR</SelectItem>
                <SelectItem value="3">3 BR</SelectItem>
              </SelectContent>
            </Select>

            <Select value={budgetFilter} onValueChange={setBudgetFilter}>
              <SelectTrigger className="h-8 w-32 text-xs">
                <SelectValue placeholder="Budget" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Listings</SelectItem>
                <SelectItem value="within">Within Budget</SelectItem>
                <SelectItem value="above">Above Budget</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-8 w-36 text-xs">
                <ArrowUpDown className="w-3 h-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="within_budget">Budget First</SelectItem>
                <SelectItem value="price_low">Price: Low-High</SelectItem>
                <SelectItem value="price_high">Price: High-Low</SelectItem>
                <SelectItem value="rating">Top Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredListings.slice(0, 9).map((listing) => {
            const withinBudget = listing.annual_rent <= annualAllowance;
            const topUp = withinBudget ? 0 : listing.annual_rent - annualAllowance;
            
            return (
              <Card key={listing.id} className="overflow-hidden hover:shadow-md transition-shadow">
                {listing.image_url && (
                  <div className="h-32 bg-muted overflow-hidden">
                    <img
                      src={listing.image_url}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-sm line-clamp-1">{listing.title}</h4>
                    {listing.rating && (
                      <span className="flex items-center gap-0.5 text-xs text-warning shrink-0">
                        <Star className="w-3 h-3 fill-current" />
                        {listing.rating}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {listing.area}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bed className="w-3 h-3" />
                      {listing.bedrooms}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="w-3 h-3" />
                      {listing.bathrooms}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <p className="font-bold text-sm tabular-nums">
                        {formatCurrency(listing.annual_rent)}
                        <span className="text-xs font-normal text-muted-foreground">/yr</span>
                      </p>
                    </div>
                    {withinBudget ? (
                      <Badge className="bg-success/10 text-success border-0 text-xs">
                        Within budget
                      </Badge>
                    ) : (
                      <Badge className="bg-warning/10 text-warning border-0 text-xs">
                        +{formatCurrency(topUp)} top-up
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-1.5 pt-1">
                    <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" asChild>
                      <a
                        href={listing.bayut_url || `https://www.bayut.com/for-rent/property/${listing.area.toLowerCase().replace(/\s/g, '-')}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Bayut
                      </a>
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" asChild>
                      <a
                        href={listing.property_finder_url || `https://www.propertyfinder.ae/en/search?l=${listing.area.toLowerCase().replace(/\s/g, '-')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        PF
                      </a>
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredListings.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <Home className="w-10 h-10 mx-auto mb-2 opacity-50" />
            No listings match your filters
          </div>
        )}

        {filteredListings.length > 9 && (
          <div className="text-center pt-4">
            <Button variant="outline" size="sm">
              View all {filteredListings.length} listings
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
