/**
 * Marketplace Vendor Performance
 * 
 * Section showing top vendors ranked by Total Savings + Activation Volume
 * Includes vendor SLA/Quality flags and Vendor Scorecards modal
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, TrendingUp, Star, AlertTriangle, Clock, RefreshCw,
  ExternalLink, ArrowUpRight, Target
} from 'lucide-react';
import { formatCurrencyAED, formatPercent, formatInteger, cn } from '@/lib/utils';
import { toast } from 'sonner';
import { DemoDataGate, DemoModeBadge } from '@/components/shared/DemoDataGate';
import { useDemoMode } from '@/contexts/DemoModeContext';

interface VendorMetric {
  id: string;
  name: string;
  tier: 'gold' | 'silver' | 'bronze';
  totalSavings: number;
  activations: number;
  avgRating: number;
  offerCount: number;
  flags: ('low_rating' | 'low_redemption' | 'stale_content')[];
  lastUpdated: Date;
  trend: number; // % change vs last period
}

interface MarketplaceVendorPerformanceProps {
  vendors?: VendorMetric[];
  /** Pass true if real vendor data is available */
  hasRealData?: boolean;
}

// Demo vendors (only shown in demo mode)
const DEMO_VENDORS: VendorMetric[] = [
  {
    id: 'v1',
    name: 'Starbucks',
    tier: 'gold',
    totalSavings: 28500,
    activations: 189,
    avgRating: 4.8,
    offerCount: 3,
    flags: [],
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    trend: 15,
  },
  {
    id: 'v2',
    name: 'Fitness First',
    tier: 'gold',
    totalSavings: 42000,
    activations: 145,
    avgRating: 4.6,
    offerCount: 2,
    flags: [],
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    trend: 22,
  },
  {
    id: 'v3',
    name: 'Carrefour',
    tier: 'silver',
    totalSavings: 18200,
    activations: 156,
    avgRating: 4.2,
    offerCount: 4,
    flags: [],
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    trend: 8,
  },
  {
    id: 'v4',
    name: 'Costa Coffee',
    tier: 'silver',
    totalSavings: 12400,
    activations: 98,
    avgRating: 3.8,
    offerCount: 2,
    flags: ['low_rating'],
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
    trend: -5,
  },
  {
    id: 'v5',
    name: 'Gold\'s Gym',
    tier: 'bronze',
    totalSavings: 8500,
    activations: 34,
    avgRating: 4.4,
    offerCount: 1,
    flags: ['low_redemption'],
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45),
    trend: -12,
  },
  {
    id: 'v6',
    name: 'Books Kinokuniya',
    tier: 'bronze',
    totalSavings: 5200,
    activations: 28,
    avgRating: 4.1,
    offerCount: 1,
    flags: ['stale_content'],
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60),
    trend: 0,
  },
];

const tierStyles = {
  gold: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700',
  silver: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600',
  bronze: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700',
};

const flagLabels: Record<string, { label: string; color: string }> = {
  low_rating: { label: 'Low rating', color: 'text-destructive' },
  low_redemption: { label: 'Low redemption', color: 'text-warning' },
  stale_content: { label: 'Stale content', color: 'text-muted-foreground' },
};

export function MarketplaceVendorPerformance({ vendors, hasRealData = false }: MarketplaceVendorPerformanceProps) {
  const { isDemoMode } = useDemoMode();
  
  // Use demo vendors if in demo mode and no real data provided
  const effectiveVendors = hasRealData && vendors ? vendors : (isDemoMode ? DEMO_VENDORS : []);
  const navigate = useNavigate();
  const [sortBySavings, setSortBySavings] = useState(true);
  const [scorecardOpen, setScorecardsOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<VendorMetric | null>(null);
  
  const sortedVendors = useMemo(() => {
    return [...effectiveVendors].sort((a, b) => 
      sortBySavings 
        ? b.totalSavings - a.totalSavings 
        : b.activations - a.activations
    ).slice(0, 5);
  }, [effectiveVendors, sortBySavings]);
  
  // Show zero state if no vendors
  if (effectiveVendors.length === 0) {
    return (
      <DemoDataGate 
        dataType="vendors"
        action={{
          label: 'Configure Marketplace',
          onClick: () => navigate('/employer/marketplace'),
        }}
      >
        <div />
      </DemoDataGate>
    );
  }
  
  const handleOpenScorecard = (vendor: VendorMetric) => {
    setSelectedVendor(vendor);
    setScorecardsOpen(true);
  };
  
  const handleCreateAction = (vendor: VendorMetric) => {
    navigate(`/employer/recommendations?create=true&source=vendor&prefill_vendor=${encodeURIComponent(vendor.name)}`);
    toast.success('Creating action item', { description: `For ${vendor.name}` });
  };
  
  return (
    <>
      <Card className="card-elevated">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                Top Vendors
                <DemoModeBadge />
              </CardTitle>
              <CardDescription>Ranked by performance and value delivered</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="sort-toggle" className="text-xs text-muted-foreground">
                  {sortBySavings ? 'By Savings' : 'By Activations'}
                </Label>
                <Switch 
                  id="sort-toggle"
                  checked={sortBySavings}
                  onCheckedChange={setSortBySavings}
                />
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSelectedVendor(null);
                  setScorecardsOpen(true);
                }}
              >
                View All Scorecards
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sortedVendors.map((vendor, idx) => (
              <div 
                key={vendor.id}
                className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => handleOpenScorecard(vendor)}
              >
                <span className="text-sm text-muted-foreground font-medium w-5">
                  #{idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{vendor.name}</p>
                    <Badge variant="outline" className={cn('text-xs capitalize', tierStyles[vendor.tier])}>
                      {vendor.tier}
                    </Badge>
                    {vendor.flags.map((flag) => (
                      <Badge 
                        key={flag} 
                        variant="outline" 
                        className={cn('text-xs gap-1', flagLabels[flag].color)}
                      >
                        <AlertTriangle className="h-3 w-3" />
                        {flagLabels[flag].label}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                    <span>{vendor.offerCount} offers</span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {vendor.avgRating}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-success">
                    {formatCurrencyAED(vendor.totalSavings, { abbreviate: true })}
                  </p>
                  <div className={cn(
                    'flex items-center justify-end gap-1 text-xs',
                    vendor.trend > 0 ? 'text-success' : vendor.trend < 0 ? 'text-destructive' : 'text-muted-foreground'
                  )}>
                    {vendor.trend > 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : vendor.trend < 0 ? (
                      <TrendingUp className="h-3 w-3 rotate-180" />
                    ) : null}
                    {vendor.trend > 0 ? '+' : ''}{vendor.trend}%
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="shrink-0">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Vendor Scorecard Modal */}
      <Dialog open={scorecardOpen} onOpenChange={setScorecardsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {selectedVendor ? `${selectedVendor.name} Scorecard` : 'Vendor Scorecards'}
            </DialogTitle>
            <DialogDescription>
              {selectedVendor 
                ? 'Detailed performance metrics and quality indicators'
                : 'Overview of all vendor performance'
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedVendor ? (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-4 gap-3">
                <Card className="bg-muted/30">
                  <CardContent className="pt-4 pb-4">
                    <p className="text-xs text-muted-foreground">Total Savings</p>
                    <p className="text-xl font-bold text-success">
                      {formatCurrencyAED(selectedVendor.totalSavings, { abbreviate: true })}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30">
                  <CardContent className="pt-4 pb-4">
                    <p className="text-xs text-muted-foreground">Activations</p>
                    <p className="text-xl font-bold">{formatInteger(selectedVendor.activations)}</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30">
                  <CardContent className="pt-4 pb-4">
                    <p className="text-xs text-muted-foreground">Avg Rating</p>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <p className="text-xl font-bold">{selectedVendor.avgRating}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30">
                  <CardContent className="pt-4 pb-4">
                    <p className="text-xs text-muted-foreground">Trend</p>
                    <p className={cn(
                      'text-xl font-bold',
                      selectedVendor.trend > 0 ? 'text-success' : selectedVendor.trend < 0 ? 'text-destructive' : ''
                    )}>
                      {selectedVendor.trend > 0 ? '+' : ''}{selectedVendor.trend}%
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Quality Indicators */}
              <div>
                <h4 className="font-medium mb-3">Quality Indicators</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Content Freshness</span>
                    <div className="flex items-center gap-2">
                      <Progress value={selectedVendor.flags.includes('stale_content') ? 30 : 85} className="w-24 h-2" />
                      <Badge variant="outline" className={cn(
                        'text-xs',
                        selectedVendor.flags.includes('stale_content') ? 'text-warning' : 'text-success'
                      )}>
                        {selectedVendor.flags.includes('stale_content') ? 'Stale' : 'Fresh'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">User Satisfaction</span>
                    <div className="flex items-center gap-2">
                      <Progress value={selectedVendor.avgRating * 20} className="w-24 h-2" />
                      <Badge variant="outline" className={cn(
                        'text-xs',
                        selectedVendor.avgRating >= 4.5 ? 'text-success' : 
                        selectedVendor.avgRating >= 4.0 ? 'text-foreground' : 'text-warning'
                      )}>
                        {selectedVendor.avgRating >= 4.5 ? 'Excellent' : 
                         selectedVendor.avgRating >= 4.0 ? 'Good' : 'Needs attention'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Redemption Rate</span>
                    <div className="flex items-center gap-2">
                      <Progress value={selectedVendor.flags.includes('low_redemption') ? 25 : 72} className="w-24 h-2" />
                      <Badge variant="outline" className={cn(
                        'text-xs',
                        selectedVendor.flags.includes('low_redemption') ? 'text-warning' : 'text-success'
                      )}>
                        {selectedVendor.flags.includes('low_redemption') ? 'Low' : 'Healthy'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedVendor.flags.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2 text-warning">
                      <AlertTriangle className="h-4 w-4" />
                      Issues Requiring Attention
                    </h4>
                    <div className="space-y-2">
                      {selectedVendor.flags.map((flag) => (
                        <div key={flag} className="p-3 rounded-lg border border-warning/30 bg-warning/5">
                          <p className="font-medium text-sm">{flagLabels[flag].label}</p>
                          <p className="text-xs text-muted-foreground">
                            {flag === 'low_rating' && 'Average rating below 4.0 — consider discussing quality improvements'}
                            {flag === 'low_redemption' && 'Below-average redemption rate — offer may need promotion or improvement'}
                            {flag === 'stale_content' && 'Offer content not updated in 30+ days — request refresh from vendor'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {effectiveVendors.map((vendor) => (
                <div 
                  key={vendor.id}
                  className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedVendor(vendor)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{vendor.name}</p>
                      <Badge variant="outline" className={cn('text-xs capitalize', tierStyles[vendor.tier])}>
                        {vendor.tier}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-success">
                      {formatCurrencyAED(vendor.totalSavings, { abbreviate: true })}
                    </p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          )}
          
          <DialogFooter>
            {selectedVendor && (
              <Button variant="outline" onClick={() => setSelectedVendor(null)}>
                Back to All
              </Button>
            )}
            <Button onClick={() => setScorecardsOpen(false)}>
              Close
            </Button>
            {selectedVendor && (
              <Button onClick={() => handleCreateAction(selectedVendor)} className="gap-2">
                <Target className="h-4 w-4" />
                Create Action
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
