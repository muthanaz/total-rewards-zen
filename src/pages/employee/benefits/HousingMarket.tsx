/**
 * Housing Market Browser Page
 * Explore housing listings, area comparisons, and rental market data
 * Route: /employee/housing/market
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/PageHeader';
import { Home, Search, Star, Clock, ExternalLink, MapPin, Bath, Bed, ArrowLeft, Building } from 'lucide-react';
import { useHousingAreas, useHousingListings } from '@/hooks/useSupabaseData';
import { useBenefitPolicy } from '@/hooks/useBenefitPolicy';
import { formatCurrencyAED } from '@/lib/utils';
import { Link } from 'react-router-dom';

export default function HousingMarketPage() {
  const { data: areas = [] } = useHousingAreas();
  const { data: listings = [] } = useHousingListings();
  const { data: policyData } = useBenefitPolicy('housing');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [bedrooms, setBedrooms] = useState<string>('all');
  const [maxRent, setMaxRent] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('price');

  // Get annual allowance for affordability badge
  const annualAllowance = policyData?.entitlement?.annualValue || policyData?.annualCap || 120000;

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

    if (maxRent !== 'all') {
      filtered = filtered.filter(l => l.annual_rent <= parseInt(maxRent));
    }

    switch (sortBy) {
      case 'price':
        filtered.sort((a, b) => a.annual_rent - b.annual_rent);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.annual_rent - a.annual_rent);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'within_allowance':
        filtered.sort((a, b) => {
          const aWithin = a.annual_rent <= annualAllowance ? 0 : 1;
          const bWithin = b.annual_rent <= annualAllowance ? 0 : 1;
          return aWithin - bWithin;
        });
        break;
    }

    return filtered;
  }, [listings, searchTerm, selectedArea, bedrooms, maxRent, sortBy, annualAllowance]);

  const formatCurrency = (value: number) => formatCurrencyAED(value, { abbreviate: false });

  const getAffordabilityLabel = (rent: number) => {
    if (rent <= annualAllowance) {
      return <Badge className="bg-success/10 text-success border-0">Within Allowance</Badge>;
    }
    const topUp = rent - annualAllowance;
    return <Badge className="bg-warning/10 text-warning border-0">Top-up: {formatCurrency(topUp)}</Badge>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <PageHeader
        title="Housing Market"
        description="Explore listings and compare rental prices across Dubai"
        icon={Home}
        actions={
          <Button variant="outline" asChild>
            <Link to="/employee/housing" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Housing
            </Link>
          </Button>
        }
      />

      {/* Allowance Context Banner */}
      <Card className="bg-muted/30 border-primary/20">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Your housing allowance</p>
              <p className="text-xl font-bold">{formatCurrency(annualAllowance)}<span className="text-sm font-normal text-muted-foreground">/year</span></p>
            </div>
            <Badge variant="outline" className="text-xs">
              Listings within this amount are marked "Within Allowance"
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Area Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display">Average Rents by Area</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium">Area</th>
                  <th className="text-right py-3 px-2 font-medium">Studio</th>
                  <th className="text-right py-3 px-2 font-medium">1 BR</th>
                  <th className="text-right py-3 px-2 font-medium">2 BR</th>
                  <th className="text-right py-3 px-2 font-medium">3 BR</th>
                  <th className="text-right py-3 px-2 font-medium">Commute</th>
                </tr>
              </thead>
              <tbody>
                {areas.map((area) => (
                  <tr key={area.id} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="py-3 px-2 font-medium">{area.name}</td>
                    <td className="py-3 px-2 text-right tabular-nums">{area.avg_rent_studio ? formatCurrency(area.avg_rent_studio) : '—'}</td>
                    <td className="py-3 px-2 text-right tabular-nums">{area.avg_rent_1br ? formatCurrency(area.avg_rent_1br) : '—'}</td>
                    <td className="py-3 px-2 text-right tabular-nums">{area.avg_rent_2br ? formatCurrency(area.avg_rent_2br) : '—'}</td>
                    <td className="py-3 px-2 text-right tabular-nums">{area.avg_rent_3br ? formatCurrency(area.avg_rent_3br) : '—'}</td>
                    <td className="py-3 px-2 text-right text-muted-foreground">
                      <span className="flex items-center justify-end gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {area.commute_to_difc_mins} min
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search listings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={selectedArea} onValueChange={setSelectedArea}>
              <SelectTrigger className="w-full md:w-44">
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
              <SelectTrigger className="w-full md:w-36">
                <SelectValue placeholder="Bedrooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="0">Studio</SelectItem>
                <SelectItem value="1">1 BR</SelectItem>
                <SelectItem value="2">2 BR</SelectItem>
                <SelectItem value="3">3 BR</SelectItem>
                <SelectItem value="4">4+ BR</SelectItem>
              </SelectContent>
            </Select>

            <Select value={maxRent} onValueChange={setMaxRent}>
              <SelectTrigger className="w-full md:w-44">
                <SelectValue placeholder="Max Rent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Price</SelectItem>
                <SelectItem value="80000">Up to 80K</SelectItem>
                <SelectItem value="100000">Up to 100K</SelectItem>
                <SelectItem value="120000">Within Allowance</SelectItem>
                <SelectItem value="150000">Up to 150K</SelectItem>
                <SelectItem value="200000">Up to 200K</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-44">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="rating">Top Rated</SelectItem>
                <SelectItem value="within_allowance">Within Allowance First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Listings Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredListings.map((listing) => (
          <Card key={listing.id} className="overflow-hidden hover:shadow-md transition-shadow">
            {listing.image_url && (
              <div className="h-40 bg-muted overflow-hidden">
                <img 
                  src={listing.image_url} 
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-sm line-clamp-2">{listing.title}</h3>
                {listing.rating && (
                  <span className="flex items-center gap-1 text-sm text-warning shrink-0">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {listing.rating}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {listing.area}
                </span>
                <span className="flex items-center gap-1">
                  <Bed className="w-3.5 h-3.5" />
                  {listing.bedrooms} BR
                </span>
                <span className="flex items-center gap-1">
                  <Bath className="w-3.5 h-3.5" />
                  {listing.bathrooms}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-lg tabular-nums">{formatCurrency(listing.annual_rent)}</p>
                  <p className="text-xs text-muted-foreground">/year</p>
                </div>
                {getAffordabilityLabel(listing.annual_rent)}
              </div>

              {listing.amenities && listing.amenities.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {listing.amenities.slice(0, 3).map((amenity, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                  {listing.amenities.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{listing.amenities.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1" asChild>
                  <a href={listing.bayut_url || `https://www.bayut.com/for-rent/property/${listing.area.toLowerCase().replace(/\s/g, '-')}/`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3.5 h-3.5 mr-1" />
                    Bayut
                  </a>
                </Button>
                <Button size="sm" variant="outline" className="flex-1" asChild>
                  <a href={listing.property_finder_url || `https://www.propertyfinder.ae/en/search?l=${listing.area.toLowerCase().replace(/\s/g, '-')}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3.5 h-3.5 mr-1" />
                    PropertyFinder
                  </a>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredListings.length === 0 && (
        <Card className="p-12 text-center">
          <Home className="w-12 h-12 mx-auto text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">No listings match your filters</p>
        </Card>
      )}
    </div>
  );
}
