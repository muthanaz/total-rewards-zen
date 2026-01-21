/**
 * Marketplace Category Drawer
 * 
 * Detailed insight drawer for a marketplace category showing:
 * - Top offers in category
 * - Savings per activation, repeat rate, unique users share
 * - Recommendations with expected uplift
 */

import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  ShoppingBag, Star, TrendingUp, Users, Target, Lightbulb, ArrowRight,
  Plus, RefreshCw, Megaphone, LucideIcon
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrencyAED, formatPercent, formatInteger, cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface CategoryData {
  category: string;
  activations: number;
  employees: number;
  avgSavings: number;
  color: string;
  icon: LucideIcon;
  topOffers?: { merchant: string; activations: number; rating: number; savings: number }[];
  repeatRate?: number;
  uniqueUserShare?: number;
  monthlyTrend?: { month: string; activations: number }[];
}

interface MarketplaceCategoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: CategoryData | null;
}

const COLORS = {
  emerald: 'hsl(160 84% 39%)',
  blue: 'hsl(217 91% 60%)',
  violet: 'hsl(271 81% 56%)',
  amber: 'hsl(38 92% 50%)',
};

// Mock recommendations for categories
const categoryRecommendations: Record<string, { title: string; description: string; impact: string; effort: string }[]> = {
  'Food & Coffee': [
    { title: 'Add more vendors', description: 'Partner with local cafes and restaurants to increase variety', impact: '+15% activations', effort: 'Medium' },
    { title: 'Improve discount depth', description: 'Negotiate 25%+ discounts for higher engagement', impact: '+20% savings', effort: 'High' },
    { title: 'Targeted lunch comms', description: 'Send lunch-time push notifications', impact: '+12% activations', effort: 'Low' },
  ],
  'Health & Fitness': [
    { title: 'Corporate gym partnerships', description: 'Secure bulk membership rates with major gyms', impact: '+25% activations', effort: 'High' },
    { title: 'Wellness challenges', description: 'Launch monthly fitness challenges with rewards', impact: '+18% engagement', effort: 'Medium' },
  ],
  'default': [
    { title: 'Expand vendor network', description: 'Add 3-5 new vendors in this category', impact: '+20% activations', effort: 'Medium' },
    { title: 'Awareness campaign', description: 'Highlight category benefits in employee comms', impact: '+15% activations', effort: 'Low' },
  ],
};

// Mock top offers generator
const generateTopOffers = (category: string, baseActivations: number) => [
  { merchant: `${category} Partner 1`, activations: Math.floor(baseActivations * 0.35), rating: 4.7, savings: Math.floor(baseActivations * 25) },
  { merchant: `${category} Partner 2`, activations: Math.floor(baseActivations * 0.25), rating: 4.5, savings: Math.floor(baseActivations * 18) },
  { merchant: `${category} Partner 3`, activations: Math.floor(baseActivations * 0.2), rating: 4.3, savings: Math.floor(baseActivations * 15) },
  { merchant: `${category} Partner 4`, activations: Math.floor(baseActivations * 0.12), rating: 4.1, savings: Math.floor(baseActivations * 9) },
  { merchant: `${category} Partner 5`, activations: Math.floor(baseActivations * 0.08), rating: 3.9, savings: Math.floor(baseActivations * 6) },
];

export function MarketplaceCategoryDrawer({ 
  open, 
  onOpenChange, 
  category,
}: MarketplaceCategoryDrawerProps) {
  const navigate = useNavigate();
  
  if (!category) return null;
  
  const Icon = category.icon;
  const topOffers = category.topOffers || generateTopOffers(category.category, category.activations);
  const repeatRate = category.repeatRate || Math.floor(Math.random() * 20) + 15;
  const uniqueUserShare = category.uniqueUserShare || Math.floor((category.employees / 150) * 100);
  const totalSavings = category.activations * category.avgSavings;
  const savingsPerActivation = category.avgSavings;
  
  const recommendations = categoryRecommendations[category.category] || categoryRecommendations['default'];
  
  const handleAddVendor = () => {
    navigate('/admin/vendors?action=create&category=' + encodeURIComponent(category.category));
    onOpenChange(false);
    toast.success('Opening vendor management');
  };
  
  const handleCreateRecommendation = (rec: { title: string }) => {
    navigate(`/employer/recommendations?create=true&source=marketplace_category&prefill_title=${encodeURIComponent(rec.title)}&prefill_category=${encodeURIComponent(category.category)}`);
    onOpenChange(false);
    toast.success('Creating action item', { description: rec.title });
  };
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <div 
              className="p-3 rounded-xl"
              style={{ backgroundColor: `${category.color}15` }}
            >
              <Icon className="h-6 w-6" style={{ color: category.color }} />
            </div>
            <div className="flex-1">
              <SheetTitle>{category.category}</SheetTitle>
              <SheetDescription>Category performance analysis and recommendations</SheetDescription>
            </div>
          </div>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* Summary Metrics */}
          <div className="grid grid-cols-4 gap-3">
            <Card className="bg-muted/30">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground">Activations</p>
                <p className="text-xl font-bold" style={{ color: category.color }}>
                  {formatInteger(category.activations)}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground">Savings/Activation</p>
                <p className="text-xl font-bold text-success">
                  {formatCurrencyAED(savingsPerActivation)}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground">Repeat Rate</p>
                <p className="text-xl font-bold">{formatPercent(repeatRate)}</p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground">Unique Users</p>
                <p className="text-xl font-bold">{formatPercent(uniqueUserShare)}</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Top Offers Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                Top Offers in Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topOffers} layout="vertical" margin={{ left: 80, right: 20 }}>
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                    <YAxis 
                      type="category" 
                      dataKey="merchant" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11 }}
                      width={75}
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatInteger(value), 'Activations']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="activations" radius={[0, 4, 4, 0]} maxBarSize={20}>
                      {topOffers.map((_, index) => (
                        <Cell key={index} fill={category.color} fillOpacity={1 - index * 0.15} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              {/* Top offers list with ratings */}
              <div className="mt-4 space-y-2">
                {topOffers.slice(0, 3).map((offer, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{offer.merchant}</span>
                      <Badge variant="outline" className="text-xs gap-1">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {offer.rating}
                      </Badge>
                    </div>
                    <span className="text-success font-medium">{formatCurrencyAED(offer.savings)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Separator />
          
          {/* Recommendations */}
          <div>
            <h4 className="font-medium flex items-center gap-2 mb-4">
              <Lightbulb className="h-4 w-4 text-accent" />
              Recommendations
            </h4>
            <div className="space-y-3">
              {recommendations.map((rec, idx) => (
                <Card key={idx} className="hover:border-accent/50 transition-colors">
                  <CardContent className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{rec.title}</p>
                        <p className="text-xs text-muted-foreground">{rec.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <Badge variant="secondary" className="text-xs text-success">
                            {rec.impact} (Est.)
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {rec.effort} effort
                          </Badge>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="shrink-0"
                        onClick={() => handleCreateRecommendation(rec)}
                      >
                        <Target className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
        
        <SheetFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleAddVendor} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Vendor
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
