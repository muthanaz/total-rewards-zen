import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Users, Baby, Briefcase, GraduationCap, Heart, Car, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { EmployerGlobalFiltersBar } from '@/components/employer';

// Vibrant color palette
const COLORS = {
  emerald: 'hsl(160 84% 39%)',
  blue: 'hsl(217 91% 60%)',
  violet: 'hsl(271 81% 56%)',
  amber: 'hsl(38 92% 50%)',
  rose: 'hsl(330 81% 60%)',
};

const employeeSegments = [
  {
    name: 'Parents with School-age Children',
    count: 42,
    percentage: 32.3,
    icon: Baby,
    color: COLORS.emerald,
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
    color: COLORS.blue,
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
    color: COLORS.violet,
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
    color: COLORS.amber,
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
    color: COLORS.rose,
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
  color: s.color,
}));

const demographicBreakdown = [
  { label: 'Single', count: 45, percentage: 34.6, color: COLORS.emerald },
  { label: 'Married (No Kids)', count: 28, percentage: 21.5, color: COLORS.blue },
  { label: 'Married (With Kids)', count: 48, percentage: 36.9, color: COLORS.violet },
  { label: 'Other', count: 9, percentage: 6.9, color: COLORS.amber },
];

const tenureBreakdown = [
  { label: '<1 year', count: 22, percentage: 16.9, color: COLORS.emerald },
  { label: '1-3 years', count: 45, percentage: 34.6, color: COLORS.blue },
  { label: '3-5 years', count: 38, percentage: 29.2, color: COLORS.violet },
  { label: '5+ years', count: 25, percentage: 19.2, color: COLORS.rose },
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

export default function SegmentsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Employee Segments</h1>
        <p className="text-muted-foreground">Analyze benefit usage patterns across employee groups</p>
      </div>

      {/* Global Filters */}
      <EmployerGlobalFiltersBar showEmploymentType />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
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
              <div className="p-2.5 rounded-xl bg-emerald-500/10">
                <TrendingUp className="h-6 w-6 text-emerald-500" />
              </div>
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
              <div className="p-2.5 rounded-xl bg-accent/10">
                <Baby className="h-6 w-6 text-accent" />
              </div>
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
              <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${COLORS.blue}20` }}>
                <GraduationCap className="h-6 w-6" style={{ color: COLORS.blue }} />
              </div>
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
            <CardTitle className="text-lg flex items-center gap-2">
              Segment Distribution
              <InfoTooltip formula="Employee count by segment category" dataSource="HR System" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    {segmentDistribution.map((entry, index) => (
                      <linearGradient key={index} id={`segmentGradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                        <stop offset="100%" stopColor={entry.color} stopOpacity={0.7} />
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={segmentDistribution}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ value }) => value}
                    labelLine={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
                  >
                    {segmentDistribution.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`url(#segmentGradient-${index})`}
                        stroke="hsl(var(--background))"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [value, 'Employees']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '10px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                      padding: '12px 16px'
                    }}
                  />
                  <Legend 
                    content={<CustomLegend />}
                    payload={segmentDistribution.map((item) => ({
                      value: item.name,
                      color: item.color,
                      type: 'circle'
                    }))}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Utilization by Segment */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Utilization by Segment
              <InfoTooltip formula="Average benefit utilization rate per segment" dataSource="Benefits Analytics" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={utilizationBySegment} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <defs>
                    {utilizationBySegment.map((entry, index) => (
                      <linearGradient key={index} id={`barGradient-${index}`} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                        <stop offset="100%" stopColor={entry.color} stopOpacity={0.6} />
                      </linearGradient>
                    ))}
                  </defs>
                  <XAxis 
                    type="number" 
                    domain={[0, 100]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={100} 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--foreground))', fontSize: 11, fontWeight: 500 }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value}%`, 'Utilization']}
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
                    dataKey="utilization" 
                    radius={[0, 6, 6, 0]}
                    maxBarSize={28}
                  >
                    {utilizationBySegment.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#barGradient-${index})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Custom Legend */}
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {utilizationBySegment.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground font-medium">{item.name}</span>
                </div>
              ))}
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
            <div className="space-y-4">
              {demographicBreakdown.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress 
                      value={item.percentage} 
                      className="w-32 h-2.5"
                      style={{ '--progress-color': item.color } as any}
                    />
                    <span className="text-sm font-semibold w-20 text-right">{item.count} ({item.percentage}%)</span>
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
            <div className="space-y-4">
              {tenureBreakdown.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress 
                      value={item.percentage} 
                      className="w-32 h-2.5"
                      style={{ '--progress-color': item.color } as any}
                    />
                    <span className="text-sm font-semibold w-20 text-right">{item.count} ({item.percentage}%)</span>
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
              <div 
                key={index} 
                className="p-4 rounded-xl border border-border bg-gradient-to-r from-card to-transparent hover:border-border/80 transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div 
                      className="p-3 rounded-xl"
                      style={{ backgroundColor: `${segment.color}15` }}
                    >
                      <segment.icon className="h-6 w-6" style={{ color: segment.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{segment.name}</h3>
                        <Badge 
                          variant="outline" 
                          className="border-0"
                          style={{ backgroundColor: `${segment.color}15`, color: segment.color }}
                        >
                          {segment.count} employees
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {segment.topBenefits.map((benefit, i) => (
                          <Badge key={i} variant="secondary" className="text-xs bg-muted/50">
                            {benefit}
                          </Badge>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-3">
                        <div className="p-2 rounded-lg bg-muted/30">
                          <p className="text-muted-foreground text-xs">Utilization</p>
                          <p className="font-bold" style={{ color: segment.color }}>{segment.utilizationRate}%</p>
                        </div>
                        <div className="p-2 rounded-lg bg-muted/30">
                          <p className="text-muted-foreground text-xs">Avg Annual Spend</p>
                          <p className="font-bold">AED {segment.avgSpend.toLocaleString()}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-muted/30">
                          <p className="text-muted-foreground text-xs">% of Workforce</p>
                          <p className="font-bold">{segment.percentage}%</p>
                        </div>
                      </div>
                      <p className="text-sm" style={{ color: segment.color }}>{segment.insights}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="shrink-0">
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
