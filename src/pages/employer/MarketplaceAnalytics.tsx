import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ShoppingBag, TrendingUp, Users, Star, Coffee, Dumbbell, ShoppingCart, Plane } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const categoryPerformance = [
  { category: 'Food & Coffee', activations: 245, employees: 89, avgSavings: 120 },
  { category: 'Health & Fitness', activations: 156, employees: 65, avgSavings: 280 },
  { category: 'Lifestyle & Shopping', activations: 189, employees: 72, avgSavings: 450 },
  { category: 'Travel & Experiences', activations: 78, employees: 34, avgSavings: 850 },
  { category: 'Learning & Skills', activations: 92, employees: 45, avgSavings: 320 },
  { category: 'Family & Parenting', activations: 67, employees: 28, avgSavings: 380 },
];

const topOffers = [
  { merchant: 'Starbucks', offer: '20% off all beverages', activations: 89, rating: 4.8 },
  { merchant: 'Fitness First', offer: '30% off annual membership', activations: 45, rating: 4.6 },
  { merchant: 'Carrefour', offer: '15% off groceries', activations: 72, rating: 4.2 },
  { merchant: 'Emirates', offer: '10% off flights', activations: 34, rating: 4.9 },
  { merchant: 'Coursera', offer: '25% off courses', activations: 38, rating: 4.5 },
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
  { name: 'Young Professionals', value: 35, color: 'hsl(var(--chart-1))' },
  { name: 'Parents', value: 28, color: 'hsl(var(--chart-2))' },
  { name: 'Senior Staff', value: 22, color: 'hsl(var(--chart-3))' },
  { name: 'Remote Workers', value: 15, color: 'hsl(var(--chart-4))' },
];

export default function MarketplaceAnalyticsPage() {
  const totalActivations = categoryPerformance.reduce((sum, c) => sum + c.activations, 0);
  const totalSavings = categoryPerformance.reduce((sum, c) => sum + (c.activations * c.avgSavings), 0);
  const engagementRate = 78; // percentage of employees who activated at least one offer

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Marketplace Analytics</h1>
        <p className="text-muted-foreground">Track perk activations and employee savings</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{totalActivations}</p>
                <p className="text-sm text-muted-foreground">Total Activations</p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
              <TrendingUp className="h-3 w-3" />
              <span>33% vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-accent" />
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
              <Star className="h-8 w-8 text-amber-500" />
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
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-600">AED {(totalSavings / 1000).toFixed(0)}K</p>
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
            <CardTitle className="text-lg">Activations by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="category" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: number) => [value, 'Activations']}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Bar dataKey="activations" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-lg">Monthly Activation Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === 'activations' ? value : `AED ${value.toLocaleString()}`,
                      name === 'activations' ? 'Activations' : 'Savings'
                    ]}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Line yAxisId="left" type="monotone" dataKey="activations" stroke="hsl(var(--primary))" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="savings" stroke="hsl(var(--accent))" strokeWidth={2} />
                </LineChart>
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
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{offer.merchant}</p>
                      <p className="text-sm text-muted-foreground">{offer.offer}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{offer.activations} activations</p>
                    <div className="flex items-center gap-1 text-sm text-amber-500">
                      <Star className="h-3 w-3 fill-current" />
                      <span>{offer.rating}</span>
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
            <CardTitle className="text-lg">Engagement by Segment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={engagementBySegment}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {engagementBySegment.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {engagementBySegment.map((segment, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.color }} />
                    <span>{segment.name}</span>
                  </div>
                  <span className="font-medium">{segment.value}%</span>
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
                {categoryPerformance.map((category, index) => (
                  <tr key={index} className="border-b border-border/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {category.category === 'Food & Coffee' && <Coffee className="h-4 w-4 text-muted-foreground" />}
                        {category.category === 'Health & Fitness' && <Dumbbell className="h-4 w-4 text-muted-foreground" />}
                        {category.category === 'Lifestyle & Shopping' && <ShoppingCart className="h-4 w-4 text-muted-foreground" />}
                        {category.category === 'Travel & Experiences' && <Plane className="h-4 w-4 text-muted-foreground" />}
                        <span className="font-medium">{category.category}</span>
                      </div>
                    </td>
                    <td className="text-right py-3 px-4">{category.activations}</td>
                    <td className="text-right py-3 px-4">{category.employees}</td>
                    <td className="text-right py-3 px-4">AED {category.avgSavings}</td>
                    <td className="text-right py-3 px-4 font-medium text-green-600">
                      AED {(category.activations * category.avgSavings).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
