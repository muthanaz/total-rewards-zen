import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { ShoppingBag, TrendingUp, Users, Star, Coffee, Dumbbell, ShoppingCart, Plane, BookOpen, Baby } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend, Area, AreaChart } from 'recharts';
import { formatCurrencyAED, formatPercent, formatInteger } from '@/lib/utils';
import { EmployerGlobalFiltersBar, DataConfidenceBadge, PageConfidenceGate, useDataCoverageMetrics } from '@/components/employer';

// Vibrant color palette
const COLORS = {
  emerald: 'hsl(160 84% 39%)',
  blue: 'hsl(217 91% 60%)',
  violet: 'hsl(271 81% 56%)',
  amber: 'hsl(38 92% 50%)',
  rose: 'hsl(330 81% 60%)',
  cyan: 'hsl(190 90% 50%)',
};

const categoryPerformance = [
  { category: 'Food & Coffee', activations: 245, employees: 89, avgSavings: 120, color: COLORS.amber, icon: Coffee },
  { category: 'Health & Fitness', activations: 156, employees: 65, avgSavings: 280, color: COLORS.emerald, icon: Dumbbell },
  { category: 'Lifestyle & Shopping', activations: 189, employees: 72, avgSavings: 450, color: COLORS.rose, icon: ShoppingCart },
  { category: 'Travel & Experiences', activations: 78, employees: 34, avgSavings: 850, color: COLORS.blue, icon: Plane },
  { category: 'Learning & Skills', activations: 92, employees: 45, avgSavings: 320, color: COLORS.violet, icon: BookOpen },
  { category: 'Family & Parenting', activations: 67, employees: 28, avgSavings: 380, color: COLORS.cyan, icon: Baby },
];

const topOffers = [
  { merchant: 'Starbucks', offer: '20% off all beverages', activations: 89, rating: 4.8, color: COLORS.amber },
  { merchant: 'Fitness First', offer: '30% off annual membership', activations: 45, rating: 4.6, color: COLORS.emerald },
  { merchant: 'Carrefour', offer: '15% off groceries', activations: 72, rating: 4.2, color: COLORS.rose },
  { merchant: 'Emirates', offer: '10% off flights', activations: 34, rating: 4.9, color: COLORS.blue },
  { merchant: 'Coursera', offer: '25% off courses', activations: 38, rating: 4.5, color: COLORS.violet },
];

const monthlyTrend = [
  { month: 'Jul', activations: 120, savings: 15000 },
  { month: 'Aug', activations: 145, savings: 18500 },
  { month: 'Sep', activations: 168, savings: 21000 },
  { month: 'Oct', activations: 192, savings: 24500 },
  { month: 'Nov', activations: 215, savings: 28000 },
  { month: 'Dec', activations: 287, savings: 38500 },
];

const engagementBySegment = [
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
        <div 
          className="w-3 h-3 rounded-full" 
          style={{ backgroundColor: entry.color }}
        />
        <span className="text-xs text-muted-foreground font-medium">{entry.value}</span>
      </div>
    ))}
  </div>
);

export default function MarketplaceAnalyticsPage() {
  const totalActivations = categoryPerformance.reduce((sum, c) => sum + c.activations, 0);
  const totalSavings = categoryPerformance.reduce((sum, c) => sum + (c.activations * c.avgSavings), 0);
  const engagementRate = 78; // percentage of employees who activated at least one offer
  const coverageMetrics = useDataCoverageMetrics();

  return (
    <PageConfidenceGate metrics={coverageMetrics} threshold={70}>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Marketplace Analytics</h1>
          <p className="text-muted-foreground">Track perk activations and employee savings</p>
        </div>
        <DataConfidenceBadge metrics={coverageMetrics} />
      </div>

      {/* Global Filters */}
      <EmployerGlobalFiltersBar />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${COLORS.violet}15` }}>
                <ShoppingBag className="h-6 w-6" style={{ color: COLORS.violet }} />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalActivations}</p>
                <p className="text-sm text-muted-foreground">Total Activations</p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: COLORS.emerald }}>
              <TrendingUp className="h-3 w-3" />
              <span>33% vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${COLORS.blue}15` }}>
                <Users className="h-6 w-6" style={{ color: COLORS.blue }} />
              </div>
              <div>
                <p className="text-2xl font-bold">{engagementRate}%</p>
                <p className="text-sm text-muted-foreground">Engagement Rate</p>
              </div>
            </div>
            <Progress value={engagementRate} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${COLORS.amber}15` }}>
                <Star className="h-6 w-6" style={{ color: COLORS.amber }} />
              </div>
              <div>
                <p className="text-2xl font-bold">4.6</p>
                <p className="text-sm text-muted-foreground">Avg Offer Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${COLORS.emerald}15` }}>
                <TrendingUp className="h-6 w-6" style={{ color: COLORS.emerald }} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: COLORS.emerald }}>{formatCurrencyAED(totalSavings)}</p>
                <p className="text-sm text-muted-foreground">Total Savings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
                  <XAxis 
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="category" 
                    width={130}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--foreground))', fontSize: 11, fontWeight: 500 }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [value, 'Activations']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '10px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                      padding: '12px 16px'
                    }}
                    labelStyle={{ fontWeight: 600, marginBottom: 6, color: 'hsl(var(--foreground))' }}
                    cursor={{ fill: 'hsl(var(--accent)/0.05)' }}
                  />
                  <Bar 
                    dataKey="activations" 
                    radius={[0, 6, 6, 0]}
                    maxBarSize={28}
                  >
                    {categoryPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#catGradient-${index})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Custom Legend */}
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {categoryPerformance.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground font-medium">{item.category.split(' ')[0]}</span>
                </div>
              ))}
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
                  <XAxis 
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  />
                  <YAxis 
                    yAxisId="left"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    tickFormatter={(v) => formatCurrencyAED(v, { showCurrency: false })}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === 'activations' ? formatInteger(value) : formatCurrencyAED(value, { abbreviate: false }),
                      name === 'activations' ? 'Activations' : 'Savings'
                    ]}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '10px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                      padding: '12px 16px'
                    }}
                    labelStyle={{ fontWeight: 600, marginBottom: 6, color: 'hsl(var(--foreground))' }}
                  />
                  <Legend content={<CustomLegend />} />
                  <Area 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="activations" 
                    stroke={COLORS.violet} 
                    strokeWidth={3}
                    fill="url(#activationsGradient)"
                    name="Activations"
                    dot={{ fill: COLORS.violet, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                  />
                  <Area 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="savings" 
                    stroke={COLORS.emerald} 
                    strokeWidth={3}
                    fill="url(#savingsGradient)"
                    name="Savings"
                    dot={{ fill: COLORS.emerald, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Offers */}
        <Card className="card-elevated lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Top Performing Offers</CardTitle>
            <CardDescription>Most activated offers by employees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topOffers.map((offer, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-4 rounded-xl border border-border bg-gradient-to-r from-muted/30 to-transparent hover:border-border/80 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
                      style={{ backgroundColor: `${offer.color}15`, color: offer.color }}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{offer.merchant}</p>
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

        {/* Engagement by Segment */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Engagement by Segment
              <InfoTooltip formula="% of marketplace engagement per employee segment" dataSource="Analytics" />
            </CardTitle>
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
                  <Pie
                    data={engagementBySegment}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {engagementBySegment.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`url(#engageGradient-${index})`}
                        stroke="hsl(var(--background))"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value}%`, 'Share']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '10px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                      padding: '12px 16px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {engagementBySegment.map((segment, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
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

      {/* Category Details */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="text-lg">Category Performance Details</CardTitle>
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
                    <tr key={index} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: `${category.color}15` }}
                          >
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
    </PageConfidenceGate>
  );
}
