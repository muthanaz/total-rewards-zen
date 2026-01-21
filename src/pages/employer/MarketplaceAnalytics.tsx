import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ShoppingBag, TrendingUp, TrendingDown, Users, Star, Coffee, Dumbbell, ShoppingCart, Plane, BookOpen, Baby, Download, AlertTriangle, HelpCircle, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, Area, AreaChart } from 'recharts';
import { formatCurrencyAED, formatPercent, formatInteger, cn } from '@/lib/utils';
import { MetricEvidenceTrigger, createMetricEvidenceData } from '@/components/shared';
import { 
  EmployerGlobalFiltersBar, 
  DataConfidenceBadge, 
  PageConfidenceGate, 
  useDataCoverageMetrics,
  MarketplaceOfferDrawer,
  MarketplaceCategoryDrawer,
  MarketplaceSegmentDrawer,
  MarketplaceOpportunityInsights,
  MarketplaceVendorPerformance,
} from '@/components/employer';
import { ConfidenceDetailsDrawer } from '@/components/employer/ConfidenceDetailsDrawer';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { MarketplaceDisabledState } from '@/components/employer/MarketplaceDisabledState';
import { MarketplaceOffer } from '@/components/employer/MarketplaceOfferDrawer';
import { CategoryData } from '@/components/employer/MarketplaceCategoryDrawer';
import { SegmentData } from '@/components/employer/MarketplaceSegmentDrawer';
import { toast } from 'sonner';

// Vibrant color palette
const COLORS = {
  emerald: 'hsl(160 84% 39%)',
  blue: 'hsl(217 91% 60%)',
  violet: 'hsl(271 81% 56%)',
  amber: 'hsl(38 92% 50%)',
  rose: 'hsl(330 81% 60%)',
  cyan: 'hsl(190 90% 50%)',
};

const categoryPerformance: CategoryData[] = [
  { category: 'Food & Coffee', activations: 245, employees: 89, avgSavings: 120, color: COLORS.amber, icon: Coffee },
  { category: 'Health & Fitness', activations: 156, employees: 65, avgSavings: 280, color: COLORS.emerald, icon: Dumbbell },
  { category: 'Lifestyle & Shopping', activations: 189, employees: 72, avgSavings: 450, color: COLORS.rose, icon: ShoppingCart },
  { category: 'Travel & Experiences', activations: 78, employees: 34, avgSavings: 850, color: COLORS.blue, icon: Plane },
  { category: 'Learning & Skills', activations: 92, employees: 45, avgSavings: 320, color: COLORS.violet, icon: BookOpen },
  { category: 'Family & Parenting', activations: 67, employees: 28, avgSavings: 380, color: COLORS.cyan, icon: Baby },
];

const topOffers: MarketplaceOffer[] = [
  { id: '1', merchant: 'Starbucks', offer: '20% off all beverages', category: 'Food & Coffee', activations: 89, rating: 4.8, color: COLORS.amber, status: 'active' },
  { id: '2', merchant: 'Fitness First', offer: '30% off annual membership', category: 'Health & Fitness', activations: 45, rating: 4.6, color: COLORS.emerald, status: 'active' },
  { id: '3', merchant: 'Carrefour', offer: '15% off groceries', category: 'Lifestyle & Shopping', activations: 72, rating: 4.2, color: COLORS.rose, status: 'active' },
  { id: '4', merchant: 'Emirates', offer: '10% off flights', category: 'Travel & Experiences', activations: 34, rating: 4.9, color: COLORS.blue, status: 'expiring' },
  { id: '5', merchant: 'Coursera', offer: '25% off courses', category: 'Learning & Skills', activations: 38, rating: 4.5, color: COLORS.violet, status: 'active' },
];

const monthlyTrend = [
  { month: 'Jul', activations: 120, savings: 15000 },
  { month: 'Aug', activations: 145, savings: 18500 },
  { month: 'Sep', activations: 168, savings: 21000 },
  { month: 'Oct', activations: 192, savings: 24500 },
  { month: 'Nov', activations: 215, savings: 28000 },
  { month: 'Dec', activations: 287, savings: 38500 },
];

const engagementBySegment: SegmentData[] = [
  { name: 'Young Professionals', value: 35, color: COLORS.blue },
  { name: 'Parents', value: 28, color: COLORS.emerald },
  { name: 'Senior Staff', value: 22, color: COLORS.violet },
  { name: 'Remote Workers', value: 15, color: COLORS.amber },
];

// Custom Legend Component
const CustomLegend = ({ payload }: any) => (
  <div className="flex flex-wrap justify-center gap-3 mt-4">
    {payload?.map((entry: any, index: number) => (
      <div key={index} className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
        <span className="text-xs text-muted-foreground font-medium">{entry.value}</span>
      </div>
    ))}
  </div>
);

// Metric Definitions Tooltip
function MetricDefinitionsTooltip() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-1 text-muted-foreground">
          <HelpCircle className="h-4 w-4" />
          <span className="text-xs">Definitions</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-sm p-4 space-y-2">
        <p className="font-semibold text-sm">Metric Definitions</p>
        <div className="space-y-2 text-xs">
          <div><span className="font-medium">Activations:</span> Total redemptions/uses of an offer</div>
          <div><span className="font-medium">Engagement Rate:</span> % of eligible employees who activated at least 1 offer</div>
          <div><span className="font-medium">Avg Offer Rating:</span> Average of employee ratings on redeemed offers (excludes nulls)</div>
          <div><span className="font-medium">Total Savings:</span> Sum of estimated savings per redemption</div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

export default function MarketplaceAnalyticsPage() {
  const { flags, loading } = useFeatureFlags();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Filter states from URL
  const confidenceFilter = searchParams.get('confidence') || 'all';
  const vendorFilter = searchParams.get('vendor') || 'all';
  const statusFilter = searchParams.get('status') || 'all';
  const compareToPrevious = searchParams.get('compare') === 'true';
  
  // Drawer states
  const [selectedOffer, setSelectedOffer] = useState<MarketplaceOffer | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<SegmentData | null>(null);
  const [confidenceDrawerOpen, setConfidenceDrawerOpen] = useState(false);
  
  // Computed metrics
  const totalActivations = categoryPerformance.reduce((sum, c) => sum + c.activations, 0);
  const totalSavings = categoryPerformance.reduce((sum, c) => sum + (c.activations * c.avgSavings), 0);
  const engagementRate = 78;
  const avgRating = 4.6;
  const coverageMetrics = useDataCoverageMetrics();
  
  // Executive KPIs (2nd row)
  const savingsPerEngaged = Math.floor(totalSavings / (150 * engagementRate / 100));
  const activationToUniqueRatio = 1.42; // repeat usage
  const lowValueOffers = 3;
  const coverageGap = 22; // % without activity
  
  // Previous period deltas (mock)
  const deltas = {
    activations: 33,
    engagement: 5,
    rating: 0.2,
    savings: 28,
  };
  
  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'all' || value === 'false') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };
  
  const handleExport = () => {
    toast.success('Exporting report...', { description: 'CSV download will start shortly' });
  };

  // Show disabled state if marketplace is not enabled
  if (!loading && !flags.marketplaceEnabled) {
    return <MarketplaceDisabledState />;
  }

  return (
    <PageConfidenceGate metrics={coverageMetrics} threshold={70}>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Marketplace Analytics</h1>
          <p className="text-muted-foreground">Track perk activations, vendor performance, and employee savings</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            className="gap-1"
            onClick={() => setConfidenceDrawerOpen(true)}
          >
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 gap-1">
              <AlertTriangle className="h-3 w-3" />
              79% Estimated
            </Badge>
          </Button>
          <MetricDefinitionsTooltip />
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-1">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Low Confidence Warning */}
      {((coverageMetrics.employeeCoverage + coverageMetrics.entitlementCoverage + coverageMetrics.policyCoverage + coverageMetrics.claimsCoverage) / 4) < 70 && (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="py-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Insights may be incomplete</p>
                <p className="text-xs text-muted-foreground">Missing ratings or redemption tracking data affects accuracy</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setConfidenceDrawerOpen(true)}>
                View details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        <EmployerGlobalFiltersBar />
        <div className="flex items-center gap-2 ml-auto">
          <Select value={confidenceFilter} onValueChange={(v) => updateFilter('confidence', v)}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Confidence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Confidence</SelectItem>
              <SelectItem value="high">High Only</SelectItem>
              <SelectItem value="medium">Medium+</SelectItem>
            </SelectContent>
          </Select>
          <Select value={vendorFilter} onValueChange={(v) => updateFilter('vendor', v)}>
            <SelectTrigger className="w-[130px] h-9">
              <SelectValue placeholder="Vendor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Vendors</SelectItem>
              <SelectItem value="starbucks">Starbucks</SelectItem>
              <SelectItem value="fitness-first">Fitness First</SelectItem>
              <SelectItem value="carrefour">Carrefour</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => updateFilter('status', v)}>
            <SelectTrigger className="w-[130px] h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expiring">Expiring Soon</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 pl-2 border-l">
            <Switch 
              id="compare" 
              checked={compareToPrevious}
              onCheckedChange={(v) => updateFilter('compare', v.toString())}
            />
            <Label htmlFor="compare" className="text-xs">vs Last Period</Label>
          </div>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <MetricEvidenceTrigger
              data={createMetricEvidenceData('total_activations', 'Total Activations', {
                definition: 'Total number of marketplace offer redemptions/uses across all employees.',
                currentValue: totalActivations,
                formattedValue: formatInteger(totalActivations),
                unit: 'number',
                confidence: 'measured',
                keyDrivers: categoryPerformance.slice(0, 3).map(c => ({
                  name: c.category,
                  impact: Math.round((c.activations / totalActivations) * 100),
                  description: `${c.activations} activations`,
                })),
              })}
            >
              <div className="flex items-center gap-3 cursor-pointer">
                <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${COLORS.violet}15` }}>
                  <ShoppingBag className="h-6 w-6" style={{ color: COLORS.violet }} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatInteger(totalActivations)}</p>
                  <p className="text-sm text-muted-foreground">Total Activations</p>
                </div>
              </div>
            </MetricEvidenceTrigger>
            {compareToPrevious && (
              <div className="flex items-center gap-1 mt-2 text-xs text-success">
                <TrendingUp className="h-3 w-3" />
                <span>+{deltas.activations}% vs last period</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <MetricEvidenceTrigger
              data={createMetricEvidenceData('engagement_rate', 'Engagement Rate', {
                definition: 'Percentage of eligible employees who activated at least one marketplace offer.',
                currentValue: engagementRate,
                formattedValue: `${engagementRate}%`,
                target: 85,
                formattedTarget: '85%',
                deltaToTarget: engagementRate - 85,
                unit: 'percent',
                confidence: 'estimated',
                isEstimated: true,
                estimationReason: 'Based on 79% employee data coverage.',
              })}
            >
              <div className="flex items-center gap-3 cursor-pointer">
                <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${COLORS.blue}15` }}>
                  <Users className="h-6 w-6" style={{ color: COLORS.blue }} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{engagementRate}%</p>
                  <p className="text-sm text-muted-foreground">Engagement Rate</p>
                </div>
              </div>
            </MetricEvidenceTrigger>
            <Progress value={engagementRate} className="h-2 mt-2" />
            {compareToPrevious && (
              <div className="flex items-center gap-1 mt-2 text-xs text-success">
                <TrendingUp className="h-3 w-3" />
                <span>+{deltas.engagement}% vs last period</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <MetricEvidenceTrigger
              data={createMetricEvidenceData('avg_rating', 'Avg Offer Rating', {
                definition: 'Average employee rating on redeemed offers (excludes unrated redemptions).',
                currentValue: avgRating,
                formattedValue: `${avgRating}/5`,
                target: 4.5,
                formattedTarget: '4.5/5',
                deltaToTarget: avgRating - 4.5,
                unit: 'score',
                confidence: 'measured',
              })}
            >
              <div className="flex items-center gap-3 cursor-pointer">
                <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${COLORS.amber}15` }}>
                  <Star className="h-6 w-6" style={{ color: COLORS.amber }} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{avgRating}</p>
                  <p className="text-sm text-muted-foreground">Avg Offer Rating</p>
                </div>
              </div>
            </MetricEvidenceTrigger>
            {compareToPrevious && (
              <div className="flex items-center gap-1 mt-2 text-xs text-success">
                <TrendingUp className="h-3 w-3" />
                <span>+{deltas.rating} vs last period</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <MetricEvidenceTrigger
              data={createMetricEvidenceData('total_savings', 'Total Savings', {
                definition: 'Sum of estimated savings per redemption based on offer discount values.',
                currentValue: totalSavings,
                formattedValue: formatCurrencyAED(totalSavings),
                unit: 'currency',
                confidence: 'estimated',
                isEstimated: true,
                estimationReason: 'Savings estimated from discount percentages × average transaction values.',
                keyDrivers: categoryPerformance.slice(0, 3).map(c => ({
                  name: c.category,
                  impact: Math.round((c.activations * c.avgSavings / totalSavings) * 100),
                  description: formatCurrencyAED(c.activations * c.avgSavings, { abbreviate: true }),
                })),
              })}
            >
              <div className="flex items-center gap-3 cursor-pointer">
                <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${COLORS.emerald}15` }}>
                  <TrendingUp className="h-6 w-6" style={{ color: COLORS.emerald }} />
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: COLORS.emerald }}>{formatCurrencyAED(totalSavings)}</p>
                  <p className="text-sm text-muted-foreground">Total Savings</p>
                </div>
              </div>
            </MetricEvidenceTrigger>
            {compareToPrevious && (
              <div className="flex items-center gap-1 mt-2 text-xs text-success">
                <TrendingUp className="h-3 w-3" />
                <span>+{deltas.savings}% vs last period</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Executive KPIs (2nd row) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground">Savings per Engaged Employee</p>
            <p className="text-xl font-bold text-success">{formatCurrencyAED(savingsPerEngaged)}</p>
          </CardContent>
        </Card>
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground">Activation-to-Unique Ratio</p>
            <p className="text-xl font-bold">{activationToUniqueRatio}x</p>
            <p className="text-xs text-muted-foreground">repeat usage indicator</p>
          </CardContent>
        </Card>
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground">Low-Value Offers</p>
            <p className="text-xl font-bold text-warning">{lowValueOffers}</p>
            <p className="text-xs text-muted-foreground">low activations + rating</p>
          </CardContent>
        </Card>
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground">Coverage Gap</p>
            <p className="text-xl font-bold text-destructive">{coverageGap}%</p>
            <p className="text-xs text-muted-foreground">no activity in 90 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Vendor Performance Section */}
      <MarketplaceVendorPerformance />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activations by Category */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Activations by Category
              <InfoTooltip formula="Number of perk activations per category" dataSource="Marketplace System" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryPerformance} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <defs>
                    {categoryPerformance.map((entry, index) => (
                      <linearGradient key={index} id={`catGradient-${index}`} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                        <stop offset="100%" stopColor={entry.color} stopOpacity={0.6} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.5} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <YAxis type="category" dataKey="category" width={130} axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--foreground))', fontSize: 11, fontWeight: 500 }} />
                  <RechartsTooltip 
                    formatter={(value: number) => [value, 'Activations']}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', padding: '12px 16px' }}
                    labelStyle={{ fontWeight: 600, marginBottom: 6, color: 'hsl(var(--foreground))' }}
                    cursor={{ fill: 'hsl(var(--accent)/0.05)' }}
                  />
                  <Bar dataKey="activations" radius={[0, 6, 6, 0]} maxBarSize={28} onClick={(data) => setSelectedCategory(data as CategoryData)} className="cursor-pointer">
                    {categoryPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#catGradient-${index})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Monthly Activation Trend
              <InfoTooltip formula="Activations and savings over time" dataSource="Marketplace System" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrend} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                  <defs>
                    <linearGradient id="activationsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.violet} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={COLORS.violet} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.emerald} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={COLORS.emerald} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => formatCurrencyAED(v, { showCurrency: false })} axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <RechartsTooltip 
                    formatter={(value: number, name: string) => [name === 'activations' ? formatInteger(value) : formatCurrencyAED(value, { abbreviate: false }), name === 'activations' ? 'Activations' : 'Savings']}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', padding: '12px 16px' }}
                    labelStyle={{ fontWeight: 600, marginBottom: 6, color: 'hsl(var(--foreground))' }}
                  />
                  <Legend content={<CustomLegend />} />
                  <Area yAxisId="left" type="monotone" dataKey="activations" stroke={COLORS.violet} strokeWidth={3} fill="url(#activationsGradient)" name="Activations" dot={{ fill: COLORS.violet, strokeWidth: 2, r: 4 }} activeDot={{ r: 6, strokeWidth: 2 }} />
                  <Area yAxisId="right" type="monotone" dataKey="savings" stroke={COLORS.emerald} strokeWidth={3} fill="url(#savingsGradient)" name="Savings" dot={{ fill: COLORS.emerald, strokeWidth: 2, r: 4 }} activeDot={{ r: 6, strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Offers - Clickable */}
        <Card className="card-elevated lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Top Performing Offers</CardTitle>
            <CardDescription>Click an offer for detailed analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topOffers.map((offer, index) => (
                <div 
                  key={offer.id} 
                  className="flex items-center justify-between p-4 rounded-xl border border-border bg-gradient-to-r from-muted/30 to-transparent hover:border-accent/50 hover:shadow-sm transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedOffer(offer)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold" style={{ backgroundColor: `${offer.color}15`, color: offer.color }}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{offer.merchant}</p>
                        {offer.status === 'expiring' && (
                          <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/30">Expiring</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{offer.offer}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold" style={{ color: offer.color }}>{offer.activations} activations</p>
                    <div className="flex items-center justify-end gap-1 text-sm text-amber-500">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span className="font-medium">{offer.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Engagement by Segment - Clickable */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Engagement by Segment
              <InfoTooltip formula="% of marketplace engagement per employee segment" dataSource="Analytics" />
            </CardTitle>
            <CardDescription>Click a segment for insights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    {engagementBySegment.map((entry, index) => (
                      <linearGradient key={index} id={`engageGradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                        <stop offset="100%" stopColor={entry.color} stopOpacity={0.7} />
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie data={engagementBySegment} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value" onClick={(data) => setSelectedSegment(data as SegmentData)} className="cursor-pointer">
                    {engagementBySegment.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#engageGradient-${index})`} stroke="hsl(var(--background))" strokeWidth={2} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value: number) => [`${value}%`, 'Share']}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', padding: '12px 16px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {engagementBySegment.map((segment, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedSegment(segment)}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.color }} />
                    <span className="font-medium">{segment.name}</span>
                  </div>
                  <span className="font-bold" style={{ color: segment.color }}>{segment.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Opportunity Insights */}
      <MarketplaceOpportunityInsights />

      {/* Category Details Table - Clickable */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="text-lg">Category Performance Details</CardTitle>
          <CardDescription>Click a row for category insights and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium">Category</th>
                  <th className="text-right py-3 px-4 font-medium">Activations</th>
                  <th className="text-right py-3 px-4 font-medium">Unique Employees</th>
                  <th className="text-right py-3 px-4 font-medium">Avg Savings</th>
                  <th className="text-right py-3 px-4 font-medium">Total Savings</th>
                </tr>
              </thead>
              <tbody>
                {categoryPerformance.map((category, index) => {
                  const Icon = category.icon;
                  return (
                    <tr 
                      key={index} 
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => setSelectedCategory(category)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg" style={{ backgroundColor: `${category.color}15` }}>
                            <Icon className="h-4 w-4" style={{ color: category.color }} />
                          </div>
                          <span className="font-medium">{category.category}</span>
                        </div>
                      </td>
                      <td className="text-right py-3 px-4 font-semibold">{category.activations}</td>
                      <td className="text-right py-3 px-4">{category.employees}</td>
                      <td className="text-right py-3 px-4">AED {category.avgSavings}</td>
                      <td className="text-right py-3 px-4 font-bold" style={{ color: COLORS.emerald }}>
                        AED {(category.activations * category.avgSavings).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
    
    {/* Drawers */}
    <MarketplaceOfferDrawer 
      open={!!selectedOffer} 
      onOpenChange={(open) => !open && setSelectedOffer(null)} 
      offer={selectedOffer} 
    />
    <MarketplaceCategoryDrawer 
      open={!!selectedCategory} 
      onOpenChange={(open) => !open && setSelectedCategory(null)} 
      category={selectedCategory} 
    />
    <MarketplaceSegmentDrawer 
      open={!!selectedSegment} 
      onOpenChange={(open) => !open && setSelectedSegment(null)} 
      segment={selectedSegment} 
    />
    <ConfidenceDetailsDrawer 
      open={confidenceDrawerOpen} 
      onOpenChange={setConfidenceDrawerOpen}
      metrics={coverageMetrics}
    />
    </PageConfidenceGate>
  );
}
