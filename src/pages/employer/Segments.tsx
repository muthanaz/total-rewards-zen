import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Users, Baby, Briefcase, GraduationCap, Heart, Car, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const employeeSegments = [
  {
    name: 'Parents with School-age Children',
    count: 42,
    percentage: 32.3,
    icon: Baby,
    color: 'hsl(var(--chart-1))',
    topBenefits: ['Schooling Allowance', 'Health Insurance', 'Annual Leave'],
    utilizationRate: 89,
    avgSpend: 85000,
    insights: 'High utilization of family benefits. Consider adding childcare support.'
  },
  {
    name: 'Young Professionals (<30)',
    count: 35,
    percentage: 26.9,
    icon: GraduationCap,
    color: 'hsl(var(--chart-2))',
    topBenefits: ['Learning & Development', 'Wellbeing Program', 'Transport'],
    utilizationRate: 68,
    avgSpend: 42000,
    insights: 'Lower housing utilization. Prioritize L&D and gym memberships.'
  },
  {
    name: 'Senior Managers',
    count: 25,
    percentage: 19.2,
    icon: Briefcase,
    color: 'hsl(var(--chart-3))',
    topBenefits: ['Housing Allowance', 'Car Allowance', 'Executive Health'],
    utilizationRate: 92,
    avgSpend: 120000,
    insights: 'Highest utilization. Consider equity-based incentives.'
  },
  {
    name: 'Remote/Hybrid Workers',
    count: 18,
    percentage: 13.8,
    icon: Heart,
    color: 'hsl(var(--chart-4))',
    topBenefits: ['Wellbeing Program', 'Learning & Development', 'Internet Allowance'],
    utilizationRate: 72,
    avgSpend: 38000,
    insights: 'Low transport utilization. Consider home office equipment budget.'
  },
  {
    name: 'Long-tenure (5+ years)',
    count: 10,
    percentage: 7.7,
    icon: Car,
    color: 'hsl(var(--chart-5))',
    topBenefits: ['Equity Options', 'Extended Leave', 'Health Insurance'],
    utilizationRate: 85,
    avgSpend: 95000,
    insights: 'High loyalty. Focus on retention through equity vesting.'
  },
];

const segmentDistribution = employeeSegments.map(s => ({
  name: s.name.split(' ').slice(0, 2).join(' '),
  value: s.count,
  color: s.color,
}));

const utilizationBySegment = employeeSegments.map(s => ({
  name: s.name.split(' ').slice(0, 2).join(' '),
  utilization: s.utilizationRate,
  spend: s.avgSpend / 1000,
}));

const demographicBreakdown = [
  { label: 'Single', count: 45, percentage: 34.6 },
  { label: 'Married (No Kids)', count: 28, percentage: 21.5 },
  { label: 'Married (With Kids)', count: 48, percentage: 36.9 },
  { label: 'Other', count: 9, percentage: 6.9 },
];

const tenureBreakdown = [
  { label: '<1 year', count: 22, percentage: 16.9 },
  { label: '1-3 years', count: 45, percentage: 34.6 },
  { label: '3-5 years', count: 38, percentage: 29.2 },
  { label: '5+ years', count: 25, percentage: 19.2 },
];

export default function SegmentsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Employee Segments</h1>
        <p className="text-muted-foreground">Analyze benefit usage patterns across employee groups</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">130</p>
                <p className="text-sm text-muted-foreground">Total Employees</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">78.4%</p>
                <p className="text-sm text-muted-foreground">Avg Utilization</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Baby className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold">48</p>
                <p className="text-sm text-muted-foreground">With Dependents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-chart-2" />
              <div>
                <p className="text-2xl font-bold">35</p>
                <p className="text-sm text-muted-foreground">New Joiners (YTD)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Segment Distribution */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-lg">Segment Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={segmentDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {segmentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Utilization by Segment */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-lg">Utilization by Segment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={utilizationBySegment} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === 'utilization' ? `${value}%` : `AED ${value}K`,
                      name === 'utilization' ? 'Utilization' : 'Avg Spend'
                    ]}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Bar dataKey="utilization" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demographics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-lg">Family Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {demographicBreakdown.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm">{item.label}</span>
                  <div className="flex items-center gap-3">
                    <Progress value={item.percentage} className="w-32 h-2" />
                    <span className="text-sm font-medium w-16 text-right">{item.count} ({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-lg">Tenure Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tenureBreakdown.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm">{item.label}</span>
                  <div className="flex items-center gap-3">
                    <Progress value={item.percentage} className="w-32 h-2" />
                    <span className="text-sm font-medium w-16 text-right">{item.count} ({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Segment Details */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="text-lg">Segment Insights</CardTitle>
          <CardDescription>Detailed analysis and recommendations for each employee segment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {employeeSegments.map((segment, index) => (
              <div key={index} className="p-4 rounded-lg border border-border bg-card">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div 
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: `${segment.color}20` }}
                    >
                      <segment.icon className="h-6 w-6" style={{ color: segment.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{segment.name}</h3>
                        <Badge variant="outline">{segment.count} employees</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {segment.topBenefits.map((benefit, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {benefit}
                          </Badge>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-2">
                        <div>
                          <p className="text-muted-foreground">Utilization</p>
                          <p className="font-medium">{segment.utilizationRate}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Avg Annual Spend</p>
                          <p className="font-medium">AED {segment.avgSpend.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">% of Workforce</p>
                          <p className="font-medium">{segment.percentage}%</p>
                        </div>
                      </div>
                      <p className="text-sm text-accent">{segment.insights}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Segment
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
