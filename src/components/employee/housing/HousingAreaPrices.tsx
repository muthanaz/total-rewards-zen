/**
 * HousingAreaPrices
 * 
 * Displays average rental prices by Dubai area with search and sort functionality.
 * Shows commute times and helps employees find affordable housing.
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin, Search, Clock, ArrowUpDown } from 'lucide-react';
import { useHousingAreas } from '@/hooks/useSupabaseData';
import { formatCurrencyAED } from '@/lib/utils';

interface HousingAreaPricesProps {
  annualAllowance?: number;
  employeeLocation?: string;
}

export function HousingAreaPrices({ 
  annualAllowance = 120000,
  employeeLocation = 'Dubai'
}: HousingAreaPricesProps) {
  const { data: areas = [] } = useHousingAreas();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('commute');

  const formatCurrency = (value: number) => formatCurrencyAED(value, { abbreviate: true });

  const filteredAreas = useMemo(() => {
    let filtered = [...areas];

    if (searchTerm) {
      filtered = filtered.filter(area =>
        area.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    switch (sortBy) {
      case 'commute':
        filtered.sort((a, b) => (a.commute_to_difc_mins || 99) - (b.commute_to_difc_mins || 99));
        break;
      case 'price_low':
        filtered.sort((a, b) => (a.avg_rent_1br || 0) - (b.avg_rent_1br || 0));
        break;
      case 'price_high':
        filtered.sort((a, b) => (b.avg_rent_1br || 0) - (a.avg_rent_1br || 0));
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return filtered;
  }, [areas, searchTerm, sortBy]);

  const getAffordabilityBadge = (rent: number | null) => {
    if (!rent) return null;
    if (rent <= annualAllowance) {
      return <Badge className="bg-success/10 text-success border-0 text-xs">Within budget</Badge>;
    }
    return <Badge className="bg-warning/10 text-warning border-0 text-xs">Above budget</Badge>;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <MapPin className="w-5 h-5 text-muted-foreground" />
            Average rents in {employeeLocation}
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search area..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 w-40 text-sm"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-8 w-36 text-xs">
                <ArrowUpDown className="w-3 h-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="commute">By Commute</SelectItem>
                <SelectItem value="price_low">Price: Low-High</SelectItem>
                <SelectItem value="price_high">Price: High-Low</SelectItem>
                <SelectItem value="name">By Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2.5 px-2 font-medium text-muted-foreground">Area</th>
                <th className="text-right py-2.5 px-2 font-medium text-muted-foreground">Studio</th>
                <th className="text-right py-2.5 px-2 font-medium text-muted-foreground">1 BR</th>
                <th className="text-right py-2.5 px-2 font-medium text-muted-foreground">2 BR</th>
                <th className="text-right py-2.5 px-2 font-medium text-muted-foreground">3 BR</th>
                <th className="text-right py-2.5 px-2 font-medium text-muted-foreground">Commute</th>
                <th className="text-right py-2.5 px-2 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAreas.map((area) => (
                <tr key={area.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 px-2 font-medium">{area.name}</td>
                  <td className="py-2.5 px-2 text-right tabular-nums text-muted-foreground">
                    {area.avg_rent_studio ? formatCurrency(area.avg_rent_studio) : '—'}
                  </td>
                  <td className="py-2.5 px-2 text-right tabular-nums">
                    {area.avg_rent_1br ? formatCurrency(area.avg_rent_1br) : '—'}
                  </td>
                  <td className="py-2.5 px-2 text-right tabular-nums">
                    {area.avg_rent_2br ? formatCurrency(area.avg_rent_2br) : '—'}
                  </td>
                  <td className="py-2.5 px-2 text-right tabular-nums">
                    {area.avg_rent_3br ? formatCurrency(area.avg_rent_3br) : '—'}
                  </td>
                  <td className="py-2.5 px-2 text-right text-muted-foreground">
                    {area.commute_to_difc_mins ? (
                      <span className="flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3" />
                        {area.commute_to_difc_mins} min
                      </span>
                    ) : '—'}
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    {getAffordabilityBadge(area.avg_rent_1br)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredAreas.length === 0 && (
          <div className="text-center py-6 text-muted-foreground text-sm">
            No areas match your search
          </div>
        )}
      </CardContent>
    </Card>
  );
}
