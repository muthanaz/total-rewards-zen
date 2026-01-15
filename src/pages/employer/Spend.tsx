import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { PageHeader } from '@/components/ui/page-header';
import { StatusStrip } from '@/components/ui/status-strip';
import { PrimaryInsight } from '@/components/ui/primary-insight';
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Lightbulb } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart as RePieChart, Pie, Cell, Legend } from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

import {
  ANNUAL_BUDGET,
  YTD_SPEND,
  SPEND_BY_BENEFIT_TYPE,
  MONTHLY_SPEND_TREND,
  SPEND_DISTRIBUTION,
  DEPARTMENTS,
  formatCurrency as formatCurrencyUtil,
} from '@/lib/employerMetrics';

// Vibrant color palette for charts
const COLORS = {
  primary: 'hsl(160 84% 39%)',
  secondary: 'hsl(217 91% 60%)',
  tertiary: 'hsl(271 81% 56%)',
  quaternary: 'hsl(38 92% 50%)',
  quinary: 'hsl(330 81% 60%)',
  muted: 'hsl(220 14% 70%)',
};

// Use centralized data
const spendByBenefitType = [...SPEND_BY_BENEFIT_TYPE];

// Extended monthly trend (including projected months)
const monthlyTrend = [
  ...MONTHLY_SPEND_TREND.map(m => ({ month: m.month, spend: m.spend, budget: 5_166_667 })),
  { month: 'Sep', spend: 4_960_000, budget: 5_166_667 },
  { month: 'Oct', spend: 4_960_000, budget: 5_166_667 },
  { month: 'Nov', spend: 4_960_000, budget: 5_166_667 },
  { month: 'Dec', spend: 4_960_000, budget: 5_166_667 },
];

const spendDistribution = [...SPEND_DISTRIBUTION];

const departmentSpend = DEPARTMENTS.map(d => ({
  department: d.name,
  headcount: d.headcount,
  totalSpend: d.totalSpend,
  avgPerEmployee: Math.round(d.totalSpend / d.headcount),
  utilization: d.utilization,
}));

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
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const isArabic = language === 'ar';
  
  const totalBudget = ANNUAL_BUDGET;
  const totalSpend = YTD_SPEND;
  const spendUtilizationRate = (totalSpend / totalBudget) * 100;
  const utilizationRate = (totalSpend / totalBudget) * 100;

  return (
    <div className={cn("space-y-6", isRTL && "text-right")}>
      {/* Header */}
      <PageHeader
        title={isArabic ? 'الإنفاق والاستخدام' : 'Spend & Utilization'}
        titleAr="الإنفاق والاستخدام"
        subtitle={isArabic ? 'تتبع إنفاق المزايا عبر منظمتك' : 'Track benefits spend across your organization'}
        subtitleAr="تتبع إنفاق المزايا عبر منظمتك"
        icon={DollarSign}
      />

      {/* Status Strip */}
      <StatusStrip
        confidence="high"
        lastUpdated={new Date()}
        dataSource="Finance System"
      />

      {/* Primary Insight */}
      {utilizationRate < 80 && (
        <PrimaryInsight
          icon={Lightbulb}
          title={isArabic ? 'فرصة تحسين الاستخدام' : 'Utilization Opportunity'}
          value={`${utilizationRate.toFixed(1)}%`}
          subtitle={isArabic 
            ? 'معدل الاستخدام الحالي - هناك فرصة لتحسين استخدام الميزانية'
            : 'Current utilization rate - opportunity to improve budget usage'}
          variant="warning"
        />
      )}

      {/* Summary Cards */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="hidden" />
        <Select defaultValue="2024">
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2024">2024</SelectItem>
            <SelectItem value="2023">2023</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">AED {(totalBudget / 1000000).toFixed(2)}M</p>
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
                <p className="text-2xl font-bold">AED {(totalSpend / 1000000).toFixed(2)}M</p>
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
                <p className="text-2xl font-bold">{utilizationRate.toFixed(1)}%</p>
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
                <p className="text-2xl font-bold text-amber-600">AED {((totalBudget - totalSpend) / 1000000).toFixed(2)}M</p>
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
                        <td className="text-right py-3 px-4">AED {item.budget.toLocaleString()}</td>
                        <td className="text-right py-3 px-4">AED {item.spend.toLocaleString()}</td>
                        <td className="text-right py-3 px-4 text-muted-foreground">
                          AED {(item.budget - item.spend).toLocaleString()}
                        </td>
                        <td className="text-right py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Progress value={item.utilization} className="w-20 h-2" />
                            <span className={item.utilization >= 80 ? 'text-green-600' : item.utilization >= 60 ? 'text-amber-600' : 'text-red-500'}>
                              {item.utilization.toFixed(1)}%
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
                        <td className="text-right py-3 px-4">{dept.headcount}</td>
                        <td className="text-right py-3 px-4">AED {dept.totalSpend.toLocaleString()}</td>
                        <td className="text-right py-3 px-4">AED {dept.avgPerEmployee.toLocaleString()}</td>
                        <td className="text-right py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Progress value={dept.utilization} className="w-20 h-2" />
                            <span>{dept.utilization}%</span>
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
