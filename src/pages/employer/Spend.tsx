import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart as RePieChart, Pie, Cell, Legend } from 'recharts';
import { formatCurrencyAED, formatPercent, formatInteger } from '@/lib/utils';
import { EmployerGlobalFiltersBar, DataConfidenceBadge, PageConfidenceGate, useDataCoverageMetrics } from '@/components/employer';

// Vibrant color palette
const COLORS = {
  primary: 'hsl(160 84% 39%)',
  secondary: 'hsl(217 91% 60%)',
  tertiary: 'hsl(271 81% 56%)',
  quaternary: 'hsl(38 92% 50%)',
  quinary: 'hsl(330 81% 60%)',
  muted: 'hsl(220 14% 70%)',
};

const spendByBenefitType = [
  { name: 'Housing', spend: 2400000, budget: 2800000, utilization: 85.7 },
  { name: 'Schooling', spend: 1200000, budget: 1500000, utilization: 80 },
  { name: 'Health', spend: 800000, budget: 900000, utilization: 88.9 },
  { name: 'Transport', spend: 400000, budget: 500000, utilization: 80 },
  { name: 'Learning', spend: 150000, budget: 300000, utilization: 50 },
  { name: 'Wellbeing', spend: 80000, budget: 150000, utilization: 53.3 },
];

const monthlyTrend = [
  { month: 'Jan', spend: 450000, budget: 500000 },
  { month: 'Feb', spend: 480000, budget: 500000 },
  { month: 'Mar', spend: 520000, budget: 500000 },
  { month: 'Apr', spend: 490000, budget: 500000 },
  { month: 'May', spend: 510000, budget: 500000 },
  { month: 'Jun', spend: 530000, budget: 500000 },
  { month: 'Jul', spend: 545000, budget: 500000 },
  { month: 'Aug', spend: 520000, budget: 500000 },
  { month: 'Sep', spend: 495000, budget: 500000 },
  { month: 'Oct', spend: 510000, budget: 500000 },
  { month: 'Nov', spend: 525000, budget: 500000 },
  { month: 'Dec', spend: 455000, budget: 500000 },
];

const spendDistribution = [
  { name: 'Cash Allowances', value: 45, color: COLORS.primary },
  { name: 'Health & Protection', value: 20, color: COLORS.secondary },
  { name: 'Time Off', value: 15, color: COLORS.tertiary },
  { name: 'Growth & Career', value: 10, color: COLORS.quaternary },
  { name: 'Wellbeing', value: 10, color: COLORS.quinary },
];

const departmentSpend = [
  { department: 'Engineering', headcount: 45, totalSpend: 1800000, avgPerEmployee: 40000, utilization: 82 },
  { department: 'Sales', headcount: 30, totalSpend: 1200000, avgPerEmployee: 40000, utilization: 78 },
  { department: 'Marketing', headcount: 20, totalSpend: 750000, avgPerEmployee: 37500, utilization: 75 },
  { department: 'Operations', headcount: 25, totalSpend: 900000, avgPerEmployee: 36000, utilization: 72 },
  { department: 'HR', headcount: 10, totalSpend: 380000, avgPerEmployee: 38000, utilization: 76 },
];

// Custom Legend Component
const CustomLegend = ({ payload }: any) => (
  <div className="flex flex-wrap justify-center gap-4 mt-4">
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

export default function SpendPage() {
  const totalBudget = 6150000;
  const totalSpend = 5030000;
  const utilizationRate = (totalSpend / totalBudget) * 100;
  const coverageMetrics = useDataCoverageMetrics();

  return (
    <PageConfidenceGate metrics={coverageMetrics} threshold={70}>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Spend & Utilization</h1>
          <p className="text-muted-foreground">Track benefits spend across your organization</p>
        </div>
        <DataConfidenceBadge metrics={coverageMetrics} />
      </div>

      {/* Global Filters */}
      <EmployerGlobalFiltersBar />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">{formatCurrencyAED(totalBudget)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary/20" />
            </div>
            <InfoTooltip formula="Sum of all benefit allocations for the year" dataSource="Seed data" />
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spend</p>
                <p className="text-2xl font-bold">{formatCurrencyAED(totalSpend)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-accent/20" />
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
              <TrendingUp className="h-3 w-3" />
              <span>8.2% vs last year</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Utilization Rate</p>
                <p className="text-2xl font-bold">{formatPercent(utilizationRate)}</p>
              </div>
              <PieChart className="h-8 w-8 text-chart-2/20" />
            </div>
            <Progress value={utilizationRate} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unused Budget</p>
                <p className="text-2xl font-bold text-amber-600">{formatCurrencyAED(totalBudget - totalSpend)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-amber-500/20" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Potential zombie spend</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="benefit-type" className="space-y-4">
        <TabsList>
          <TabsTrigger value="benefit-type">By Benefit Type</TabsTrigger>
          <TabsTrigger value="department">By Department</TabsTrigger>
          <TabsTrigger value="trend">Monthly Trend</TabsTrigger>
        </TabsList>

        <TabsContent value="benefit-type" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  Spend by Benefit Type
                  <InfoTooltip formula="Actual spend vs allocated budget per benefit category" dataSource="Finance System" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={spendByBenefitType} layout="vertical" margin={{ left: 10, right: 20 }}>
                      <defs>
                        <linearGradient id="spendGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor={COLORS.primary} stopOpacity={1} />
                          <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0.7} />
                        </linearGradient>
                        <linearGradient id="budgetGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor={COLORS.muted} stopOpacity={0.6} />
                          <stop offset="100%" stopColor={COLORS.muted} stopOpacity={0.3} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.5} />
                      <XAxis 
                        type="number" 
                        tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                      />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        width={80}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 500 }}
                      />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          `AED ${value.toLocaleString()}`, 
                          name === 'spend' ? 'Actual Spend' : 'Budget'
                        ]}
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
                      <Legend content={<CustomLegend />} />
                      <Bar dataKey="spend" fill="url(#spendGradient)" radius={[0, 4, 4, 0]} name="Actual Spend" />
                      <Bar dataKey="budget" fill="url(#budgetGradient)" radius={[0, 4, 4, 0]} name="Budget" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  Spend Distribution
                  <InfoTooltip formula="Percentage breakdown of total spend by category" dataSource="Finance System" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <defs>
                        {spendDistribution.map((entry, index) => (
                          <linearGradient key={index} id={`pieGradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                            <stop offset="100%" stopColor={entry.color} stopOpacity={0.7} />
                          </linearGradient>
                        ))}
                      </defs>
                      <Pie
                        data={spendDistribution}
                        cx="50%"
                        cy="45%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ value }) => `${value}%`}
                        labelLine={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
                      >
                        {spendDistribution.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={`url(#pieGradient-${index})`}
                            stroke="hsl(var(--background))"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Legend 
                        content={<CustomLegend />}
                        payload={spendDistribution.map((item) => ({
                          value: item.name,
                          color: item.color,
                          type: 'circle'
                        }))}
                      />
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
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Benefit Type Table */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-lg">Detailed Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium">Benefit Type</th>
                      <th className="text-right py-3 px-4 font-medium">Budget</th>
                      <th className="text-right py-3 px-4 font-medium">Spend</th>
                      <th className="text-right py-3 px-4 font-medium">Remaining</th>
                      <th className="text-right py-3 px-4 font-medium">Utilization</th>
                    </tr>
                  </thead>
                  <tbody>
                    {spendByBenefitType.map((item) => (
                      <tr key={item.name} className="border-b border-border/50">
                        <td className="py-3 px-4 font-medium">{item.name}</td>
                        <td className="text-right py-3 px-4">{formatCurrencyAED(item.budget, { abbreviate: false })}</td>
                        <td className="text-right py-3 px-4">{formatCurrencyAED(item.spend, { abbreviate: false })}</td>
                        <td className="text-right py-3 px-4 text-muted-foreground">
                          {formatCurrencyAED(item.budget - item.spend, { abbreviate: false })}
                        </td>
                        <td className="text-right py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Progress value={item.utilization} className="w-20 h-2" />
                            <span className={item.utilization >= 80 ? 'text-green-600' : item.utilization >= 60 ? 'text-amber-600' : 'text-red-500'}>
                              {formatPercent(item.utilization)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="department" className="space-y-4">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-lg">Department Spend Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium">Department</th>
                      <th className="text-right py-3 px-4 font-medium">Headcount</th>
                      <th className="text-right py-3 px-4 font-medium">Total Spend</th>
                      <th className="text-right py-3 px-4 font-medium">Avg/Employee</th>
                      <th className="text-right py-3 px-4 font-medium">Utilization</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departmentSpend.map((dept) => (
                      <tr key={dept.department} className="border-b border-border/50">
                        <td className="py-3 px-4 font-medium">{dept.department}</td>
                        <td className="text-right py-3 px-4">{formatInteger(dept.headcount)}</td>
                        <td className="text-right py-3 px-4">{formatCurrencyAED(dept.totalSpend, { abbreviate: false })}</td>
                        <td className="text-right py-3 px-4">{formatCurrencyAED(dept.avgPerEmployee, { abbreviate: false })}</td>
                        <td className="text-right py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Progress value={dept.utilization} className="w-20 h-2" />
                            <span>{formatPercent(dept.utilization)}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trend" className="space-y-4">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                Monthly Spend Trend
                <InfoTooltip formula="Monthly actual spend vs budget allocation" dataSource="Finance System" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrend} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                    <defs>
                      <linearGradient id="spendLineGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0} />
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
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        `AED ${value.toLocaleString()}`, 
                        name === 'spend' ? 'Actual Spend' : 'Budget'
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
                    <Line 
                      type="monotone" 
                      dataKey="spend" 
                      stroke={COLORS.primary} 
                      strokeWidth={3} 
                      dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, strokeWidth: 2 }}
                      name="Actual Spend"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="budget" 
                      stroke={COLORS.muted} 
                      strokeWidth={2} 
                      strokeDasharray="6 4"
                      dot={false}
                      name="Budget"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
