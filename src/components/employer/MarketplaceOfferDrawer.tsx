/**
 * Marketplace Offer Drawer
 * 
 * Detailed insight drawer for a marketplace offer showing:
 * - Offer details, vendor, category, locations, eligibility
 * - Activations trend, savings trend, avg rating distribution
 * - Segment split
 * - Actions: Pause, Boost visibility, Request vendor refresh, Flag as low-value
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ShoppingBag, Star, TrendingUp, TrendingDown, Users, MapPin, Briefcase,
  Pause, Megaphone, RefreshCw, Flag, Building2, Target, Calendar, ExternalLink
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, BarChart, Bar, Cell } from 'recharts';
import { formatCurrencyAED, formatPercent, formatInteger, cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface MarketplaceOffer {
  id: string;
  merchant: string;
  offer: string;
  category: string;
  activations: number;
  rating: number;
  color: string;
  vendor_id?: string;
  discount_text?: string;
  status?: 'active' | 'paused' | 'expiring';
  locations?: string[];
  eligibility?: string[];
  totalSavings?: number;
  uniqueUsers?: number;
  repeatRate?: number;
  activationTrend?: { month: string; activations: number; savings: number }[];
  segmentBreakdown?: { segment: string; percentage: number; color: string }[];
  ratingDistribution?: { stars: number; count: number }[];
}

interface MarketplaceOfferDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offer: MarketplaceOffer | null;
}

const COLORS = {
  emerald: 'hsl(160 84% 39%)',
  blue: 'hsl(217 91% 60%)',
  violet: 'hsl(271 81% 56%)',
  amber: 'hsl(38 92% 50%)',
  rose: 'hsl(330 81% 60%)',
  cyan: 'hsl(190 90% 50%)',
};

// Mock data generators
const generateTrendData = (baseActivations: number) => [
  { month: 'Jul', activations: Math.floor(baseActivations * 0.6), savings: Math.floor(baseActivations * 45) },
  { month: 'Aug', activations: Math.floor(baseActivations * 0.7), savings: Math.floor(baseActivations * 52) },
  { month: 'Sep', activations: Math.floor(baseActivations * 0.75), savings: Math.floor(baseActivations * 56) },
  { month: 'Oct', activations: Math.floor(baseActivations * 0.85), savings: Math.floor(baseActivations * 64) },
  { month: 'Nov', activations: Math.floor(baseActivations * 0.9), savings: Math.floor(baseActivations * 68) },
  { month: 'Dec', activations: baseActivations, savings: Math.floor(baseActivations * 75) },
];

const generateSegmentData = () => [
  { segment: 'Young Professionals', percentage: 35, color: COLORS.blue },
  { segment: 'Parents', percentage: 28, color: COLORS.emerald },
  { segment: 'Senior Staff', percentage: 22, color: COLORS.violet },
  { segment: 'Remote Workers', percentage: 15, color: COLORS.amber },
];

const generateRatingDistribution = (avgRating: number) => {
  const total = 100;
  const fiveStars = Math.floor(avgRating >= 4.5 ? total * 0.5 : total * 0.3);
  const fourStars = Math.floor(avgRating >= 4 ? total * 0.3 : total * 0.25);
  const threeStars = Math.floor(total * 0.12);
  const twoStars = Math.floor(total * 0.05);
  const oneStar = total - fiveStars - fourStars - threeStars - twoStars;
  
  return [
    { stars: 5, count: fiveStars },
    { stars: 4, count: fourStars },
    { stars: 3, count: threeStars },
    { stars: 2, count: twoStars },
    { stars: 1, count: Math.max(0, oneStar) },
  ];
};

export function MarketplaceOfferDrawer({ 
  open, 
  onOpenChange, 
  offer,
}: MarketplaceOfferDrawerProps) {
  const navigate = useNavigate();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  if (!offer) return null;
  
  // Generate mock data for the offer
  const trendData = offer.activationTrend || generateTrendData(offer.activations);
  const segmentData = offer.segmentBreakdown || generateSegmentData();
  const ratingData = offer.ratingDistribution || generateRatingDistribution(offer.rating);
  const totalSavings = offer.totalSavings || offer.activations * 75;
  const uniqueUsers = offer.uniqueUsers || Math.floor(offer.activations * 0.8);
  const repeatRate = offer.repeatRate || 22;
  
  const handleAction = (action: string) => {
    setActionLoading(action);
    setTimeout(() => {
      setActionLoading(null);
      const messages: Record<string, string> = {
        pause: 'Offer paused successfully',
        boost: 'Visibility boost campaign created',
        refresh: 'Vendor refresh request sent',
        flag: 'Offer flagged for review',
      };
      toast.success(messages[action] || 'Action completed');
    }, 1000);
  };
  
  const handleCreateAction = () => {
    navigate(`/employer/recommendations?create=true&source=marketplace&prefill_offer=${offer.id}&prefill_merchant=${offer.merchant}`);
    onOpenChange(false);
    toast.success('Creating action item', { description: `For ${offer.merchant}` });
  };
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold"
              style={{ backgroundColor: `${offer.color}15`, color: offer.color }}
            >
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <SheetTitle className="flex items-center gap-2">
                {offer.merchant}
                <Badge 
                  variant="outline" 
                  className={cn(
                    'text-xs',
                    offer.status === 'active' && 'bg-success/10 text-success border-success/30',
                    offer.status === 'paused' && 'bg-muted text-muted-foreground',
                    offer.status === 'expiring' && 'bg-warning/10 text-warning border-warning/30'
                  )}
                >
                  {offer.status || 'active'}
                </Badge>
              </SheetTitle>
              <SheetDescription>{offer.offer}</SheetDescription>
            </div>
          </div>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* Summary Metrics */}
          <div className="grid grid-cols-4 gap-3">
            <Card className="bg-muted/30">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground">Activations</p>
                <p className="text-xl font-bold" style={{ color: offer.color }}>
                  {formatInteger(offer.activations)}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground">Total Savings</p>
                <p className="text-xl font-bold text-success">
                  {formatCurrencyAED(totalSavings, { abbreviate: true })}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground">Unique Users</p>
                <p className="text-xl font-bold">{formatInteger(uniqueUsers)}</p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground">Avg Rating</p>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <p className="text-xl font-bold">{offer.rating}</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Details Section */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Offer Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium">{offer.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Repeat Rate:</span>
                  <span className="font-medium">{formatPercent(repeatRate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Locations:</span>
                  <span className="font-medium">{offer.locations?.join(', ') || 'All UAE'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Eligibility:</span>
                  <span className="font-medium">{offer.eligibility?.join(', ') || 'All employees'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Trends Tab Section */}
          <Tabs defaultValue="trends" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="segments">Segments</TabsTrigger>
              <TabsTrigger value="ratings">Ratings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="trends" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    Activations & Savings Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="offerActivationsGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={offer.color} stopOpacity={0.3} />
                            <stop offset="100%" stopColor={offer.color} stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="offerSavingsGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={COLORS.emerald} stopOpacity={0.3} />
                            <stop offset="100%" stopColor={COLORS.emerald} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                        <Tooltip 
                          formatter={(value: number, name: string) => [
                            name === 'activations' ? formatInteger(value) : formatCurrencyAED(value),
                            name === 'activations' ? 'Activations' : 'Savings'
                          ]}
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            borderColor: 'hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="activations" 
                          stroke={offer.color} 
                          fill="url(#offerActivationsGrad)" 
                          strokeWidth={2}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="savings" 
                          stroke={COLORS.emerald} 
                          fill="url(#offerSavingsGrad)" 
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="segments" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Segment Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {segmentData.map((seg, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>{seg.segment}</span>
                          <span className="font-medium">{seg.percentage}%</span>
                        </div>
                        <Progress 
                          value={seg.percentage} 
                          className="h-2"
                          style={{ '--progress-foreground': seg.color } as React.CSSProperties}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="ratings" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Star className="h-4 w-4 text-muted-foreground" />
                    Rating Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {ratingData.map((rating, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="flex items-center gap-1 w-16">
                          {Array.from({ length: rating.stars }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <div className="flex-1">
                          <Progress value={rating.count} className="h-2" />
                        </div>
                        <span className="text-xs text-muted-foreground w-8">{rating.count}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <Separator />
          
          {/* Actions */}
          <div>
            <h4 className="font-medium mb-3">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="justify-start gap-2"
                onClick={() => handleAction('pause')}
                disabled={actionLoading === 'pause'}
              >
                <Pause className="h-4 w-4" />
                {actionLoading === 'pause' ? 'Pausing...' : 'Pause Offer'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="justify-start gap-2"
                onClick={() => handleAction('boost')}
                disabled={actionLoading === 'boost'}
              >
                <Megaphone className="h-4 w-4" />
                {actionLoading === 'boost' ? 'Creating...' : 'Boost Visibility'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="justify-start gap-2"
                onClick={() => handleAction('refresh')}
                disabled={actionLoading === 'refresh'}
              >
                <RefreshCw className="h-4 w-4" />
                {actionLoading === 'refresh' ? 'Sending...' : 'Request Vendor Refresh'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="justify-start gap-2 text-destructive hover:text-destructive"
                onClick={() => handleAction('flag')}
                disabled={actionLoading === 'flag'}
              >
                <Flag className="h-4 w-4" />
                {actionLoading === 'flag' ? 'Flagging...' : 'Flag as Low-Value'}
              </Button>
            </div>
          </div>
        </div>
        
        <SheetFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleCreateAction} className="gap-2">
            <Target className="h-4 w-4" />
            Add to Action Plan
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
