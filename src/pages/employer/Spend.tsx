import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart as RePieChart, Pie, Cell, Legend } from 'recharts';

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
  { name: 'Cash Allowances', value: 45, color: 'hsl(var(--chart-1))' },
  { name: 'Health & Protection', value: 20, color: 'hsl(var(--chart-2))' },
  { name: 'Time Off', value: 15, color: 'hsl(var(--chart-3))' },
  { name: 'Growth & Career', value: 10, color: 'hsl(var(--chart-4))' },
  { name: 'Wellbeing', value: 10, color: 'hsl(var(--chart-5))' },
];

const departmentSpend = [
  { department: 'Engineering', headcount: 45, totalSpend: 1800000, avgPerEmployee: 40000, utilization: 82 },
  { department: 'Sales', headcount: 30, totalSpend: 1200000, avgPerEmployee: 40000, utilization: 78 },
  { department: 'Marketing', headcount: 20, totalSpend: 750000, avgPerEmployee: 37500, utilization: 75 },
  { department: 'Operations', headcount: 25, totalSpend: 900000, avgPerEmployee: 36000, utilization: 72 },
  { department: 'HR', headcount: 10, totalSpend: 380000, avgPerEmployee: 38000, utilization: 76 },
];

export default function SpendPage() {
  const totalBudget = 6150000;
  const totalSpend = 5030000;
  const utilizationRate = (totalSpend / totalBudget) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Spend & Utilization</h1>
          <p className="text-muted-foreground">Track benefits spend across your organization</p>
        </div>
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
                <CardTitle className="text-lg">Spend by Benefit Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={spendByBenefitType} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                      <YAxis type="category" dataKey="name" width={80} />
                      <Tooltip 
                        formatter={(value: number) => [`AED ${value.toLocaleString()}`, 'Spend']}
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                      />
                      <Bar dataKey="spend" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="budget" fill="hsl(var(--muted))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-lg">Spend Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={spendDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, value }) => `${value}%`}
                      >
                        {spendDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip />
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
              <CardTitle className="text-lg">Monthly Spend Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                    <Tooltip 
                      formatter={(value: number) => [`AED ${value.toLocaleString()}`, '']}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                    />
                    <Line type="monotone" dataKey="spend" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                    <Line type="monotone" dataKey="budget" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="5 5" />
                    <Legend />
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
