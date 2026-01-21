/**
 * Marketplace Segment Drawer
 * 
 * Detailed insight drawer for a marketplace segment showing:
 * - Segment profile, top categories used, underused categories
 * - Savings per user
 * - Suggested campaigns with expected uplift (labeled as Estimated)
 */

import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Users, TrendingUp, TrendingDown, Target, Lightbulb, Megaphone,
  Coffee, Dumbbell, ShoppingCart, Plane, BookOpen, Baby, AlertTriangle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrencyAED, formatPercent, formatInteger, cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface SegmentData {
  name: string;
  value: number;
  color: string;
  headcount?: number;
  avgSavings?: number;
  topCategories?: { category: string; percentage: number; icon: React.ElementType }[];
  underusedCategories?: { category: string; usage: number; potential: number }[];
  campaigns?: { title: string; description: string; uplift: string; effort: string }[];
}

interface MarketplaceSegmentDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  segment: SegmentData | null;
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
const segmentProfiles: Record<string, {
  description: string;
  headcount: number;
  avgSavings: number;
  topCategories: { category: string; percentage: number; icon: React.ElementType }[];
  underusedCategories: { category: string; usage: number; potential: number }[];
  campaigns: { title: string; description: string; uplift: string; effort: string }[];
}> = {
  'Young Professionals': {
    description: 'Employees aged 22-30, typically single or early career',
    headcount: 52,
    avgSavings: 320,
    topCategories: [
      { category: 'Food & Coffee', percentage: 42, icon: Coffee },
      { category: 'Health & Fitness', percentage: 28, icon: Dumbbell },
      { category: 'Learning & Skills', percentage: 18, icon: BookOpen },
    ],
    underusedCategories: [
      { category: 'Travel & Experiences', usage: 8, potential: 25 },
      { category: 'Lifestyle & Shopping', usage: 12, potential: 30 },
    ],
    campaigns: [
      { title: 'Weekend Getaway Promo', description: 'Highlight travel deals for weekend trips', uplift: '+25% travel activations', effort: 'Low' },
      { title: 'Skill-Up Summer', description: 'Push learning platform discounts in Q3', uplift: '+18% L&D activations', effort: 'Medium' },
      { title: 'Fitness Friday Challenge', description: 'Weekly fitness challenges with rewards', uplift: '+15% gym activations', effort: 'Low' },
    ],
  },
  'Parents': {
    description: 'Employees with children, focused on family benefits',
    headcount: 42,
    avgSavings: 480,
    topCategories: [
      { category: 'Family & Parenting', percentage: 38, icon: Baby },
      { category: 'Lifestyle & Shopping', percentage: 32, icon: ShoppingCart },
      { category: 'Food & Coffee', percentage: 18, icon: Coffee },
    ],
    underusedCategories: [
      { category: 'Health & Fitness', usage: 6, potential: 20 },
      { category: 'Learning & Skills', usage: 4, potential: 15 },
    ],
    campaigns: [
      { title: 'Family Fun Fridays', description: 'Curate family activity discounts', uplift: '+22% family activations', effort: 'Medium' },
      { title: 'Back-to-School Bundle', description: 'Highlight education and childcare offers', uplift: '+30% education activations', effort: 'Low' },
    ],
  },
  'Senior Staff': {
    description: 'Employees in senior roles (Manager+), typically 35+',
    headcount: 33,
    avgSavings: 650,
    topCategories: [
      { category: 'Travel & Experiences', percentage: 35, icon: Plane },
      { category: 'Lifestyle & Shopping', percentage: 28, icon: ShoppingCart },
      { category: 'Health & Fitness', percentage: 22, icon: Dumbbell },
    ],
    underusedCategories: [
      { category: 'Food & Coffee', usage: 10, potential: 25 },
      { category: 'Learning & Skills', usage: 8, potential: 18 },
    ],
    campaigns: [
      { title: 'Executive Wellness', description: 'Premium health and wellness offers', uplift: '+20% wellness activations', effort: 'Medium' },
      { title: 'Leadership Learning', description: 'Executive education partnerships', uplift: '+25% L&D activations', effort: 'High' },
    ],
  },
  'Remote Workers': {
    description: 'Employees working primarily from home',
    headcount: 23,
    avgSavings: 280,
    topCategories: [
      { category: 'Food & Coffee', percentage: 45, icon: Coffee },
      { category: 'Health & Fitness', percentage: 25, icon: Dumbbell },
      { category: 'Learning & Skills', percentage: 20, icon: BookOpen },
    ],
    underusedCategories: [
      { category: 'Travel & Experiences', usage: 5, potential: 18 },
      { category: 'Lifestyle & Shopping', usage: 8, potential: 22 },
    ],
    campaigns: [
      { title: 'Home Office Upgrade', description: 'Partner with home office suppliers', uplift: '+28% shopping activations', effort: 'Medium' },
      { title: 'Virtual Team Events', description: 'Online experience vouchers', uplift: '+15% experience activations', effort: 'Low' },
    ],
  },
};

export function MarketplaceSegmentDrawer({ 
  open, 
  onOpenChange, 
  segment,
}: MarketplaceSegmentDrawerProps) {
  const navigate = useNavigate();
  
  if (!segment) return null;
  
  const profile = segmentProfiles[segment.name] || {
    description: 'Employee segment analysis',
    headcount: Math.floor(segment.value * 1.5),
    avgSavings: 350,
    topCategories: [
      { category: 'Food & Coffee', percentage: 35, icon: Coffee },
      { category: 'Health & Fitness', percentage: 25, icon: Dumbbell },
    ],
    underusedCategories: [
      { category: 'Travel & Experiences', usage: 8, potential: 20 },
    ],
    campaigns: [
      { title: 'Awareness Campaign', description: 'Highlight marketplace benefits', uplift: '+15% activations', effort: 'Low' },
    ],
  };
  
  const handleLaunchCampaign = (campaign: { title: string }) => {
    navigate(`/employer/recommendations?create=true&source=marketplace_segment&prefill_title=${encodeURIComponent(campaign.title)}&prefill_segment=${encodeURIComponent(segment.name)}&prefill_type=awareness`);
    onOpenChange(false);
    toast.success('Creating campaign action', { description: campaign.title });
  };
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <div 
              className="p-3 rounded-xl"
              style={{ backgroundColor: `${segment.color}15` }}
            >
              <Users className="h-6 w-6" style={{ color: segment.color }} />
            </div>
            <div className="flex-1">
              <SheetTitle>{segment.name}</SheetTitle>
              <SheetDescription>{profile.description}</SheetDescription>
            </div>
          </div>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* Summary Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="bg-muted/30">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground">Engagement Share</p>
                <p className="text-xl font-bold" style={{ color: segment.color }}>
                  {segment.value}%
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground">Headcount</p>
                <p className="text-xl font-bold">{formatInteger(profile.headcount)}</p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground">Avg Savings/User</p>
                <p className="text-xl font-bold text-success">
                  {formatCurrencyAED(profile.avgSavings)}
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Top Categories */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-success" />
                Top Categories Used
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {profile.topCategories.map((cat, idx) => {
                  const CatIcon = cat.icon;
                  return (
                    <div key={idx}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <div className="flex items-center gap-2">
                          <CatIcon className="h-4 w-4 text-muted-foreground" />
                          <span>{cat.category}</span>
                        </div>
                        <span className="font-medium">{cat.percentage}%</span>
                      </div>
                      <Progress value={cat.percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          
          {/* Underused Categories */}
          <Card className="border-warning/30 bg-warning/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-warning">
                <AlertTriangle className="h-4 w-4" />
                Underused Categories (Opportunity)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {profile.underusedCategories.map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{cat.category}</p>
                      <p className="text-xs text-muted-foreground">
                        Current: {cat.usage}% → Potential: {cat.potential}%
                      </p>
                    </div>
                    <Badge variant="outline" className="text-warning border-warning/30">
                      +{cat.potential - cat.usage}% gap
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Separator />
          
          {/* Suggested Campaigns */}
          <div>
            <h4 className="font-medium flex items-center gap-2 mb-4">
              <Megaphone className="h-4 w-4 text-accent" />
              Suggested Campaigns
            </h4>
            <div className="space-y-3">
              {profile.campaigns.map((campaign, idx) => (
                <Card key={idx} className="hover:border-accent/50 transition-colors">
                  <CardContent className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{campaign.title}</p>
                        <p className="text-xs text-muted-foreground">{campaign.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <Badge variant="secondary" className="text-xs text-success">
                            {campaign.uplift}
                          </Badge>
                          <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/30">
                            Estimated
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {campaign.effort} effort
                          </Badge>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="shrink-0 gap-1"
                        onClick={() => handleLaunchCampaign(campaign)}
                      >
                        <Target className="h-3 w-3" />
                        Launch
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
          <Button 
            onClick={() => {
              navigate(`/employer/segments?filter=${encodeURIComponent(segment.name)}`);
              onOpenChange(false);
            }} 
            className="gap-2"
          >
            <Users className="h-4 w-4" />
            View Full Segment Analysis
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
