import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Ghost, AlertTriangle, TrendingDown, Lightbulb, DollarSign, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const zombieCategories = [
  { 
    benefit: 'Learning & Development', 
    allocated: 300000, 
    utilized: 150000, 
    zombie: 150000,
    utilizationRate: 50,
    affectedEmployees: 45,
    reason: 'Low awareness of available courses',
    recommendation: 'Launch internal L&D campaign with featured courses'
  },
  { 
    benefit: 'Wellbeing Program', 
    allocated: 150000, 
    utilized: 80000, 
    zombie: 70000,
    utilizationRate: 53.3,
    affectedEmployees: 60,
    reason: 'Complex redemption process',
    recommendation: 'Simplify app-based wellness reward system'
  },
  { 
    benefit: 'Annual Flight Tickets', 
    allocated: 200000, 
    utilized: 140000, 
    zombie: 60000,
    utilizationRate: 70,
    affectedEmployees: 15,
    reason: 'Unused by single employees without dependents',
    recommendation: 'Allow conversion to travel vouchers'
  },
  { 
    benefit: 'Gym Membership', 
    allocated: 80000, 
    utilized: 48000, 
    zombie: 32000,
    utilizationRate: 60,
    affectedEmployees: 32,
    reason: 'Limited partner gym locations',
    recommendation: 'Expand gym network or offer home fitness alternatives'
  },
];

const chartData = zombieCategories.map(c => ({
  name: c.benefit.split(' ').slice(0, 2).join(' '),
  zombie: c.zombie,
  utilized: c.utilized,
}));

const riskIndicators = [
  { label: 'High Risk Benefits', value: 2, description: '<60% utilization', color: 'text-red-500' },
  { label: 'Medium Risk Benefits', value: 2, description: '60-75% utilization', color: 'text-amber-500' },
  { label: 'Healthy Benefits', value: 8, description: '>75% utilization', color: 'text-green-500' },
];

export default function ZombieSpendPage() {
  const totalZombie = zombieCategories.reduce((sum, c) => sum + c.zombie, 0);
  const totalAllocated = zombieCategories.reduce((sum, c) => sum + c.allocated, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <Ghost className="h-8 w-8 text-amber-500" />
          <h1 className="text-2xl font-display font-bold text-foreground">Zombie Spend</h1>
        </div>
        <p className="text-muted-foreground mt-1">Identify and recover underutilized benefit allocations</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-elevated border-amber-500/20 bg-amber-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Zombie Spend</p>
                <p className="text-3xl font-bold text-amber-600">AED {(totalZombie / 1000).toFixed(0)}K</p>
              </div>
              <DollarSign className="h-10 w-10 text-amber-500/30" />
            </div>
            <InfoTooltip formula="Sum of allocated but unused benefits across all categories with <75% utilization" dataSource="Seed data" />
            <p className="text-sm text-muted-foreground mt-2">
              {((totalZombie / totalAllocated) * 100).toFixed(1)}% of tracked allocations
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Affected Employees</p>
                <p className="text-3xl font-bold">152</p>
              </div>
              <Users className="h-10 w-10 text-primary/20" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Employees with underutilized benefits
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recovery Potential</p>
                <p className="text-3xl font-bold text-green-600">AED {((totalZombie * 0.6) / 1000).toFixed(0)}K</p>
              </div>
              <TrendingDown className="h-10 w-10 text-green-500/20" />
            </div>
            <InfoTooltip formula="Estimated recoverable amount through policy optimization (60% of zombie spend)" dataSource="Seed data" />
          </CardContent>
        </Card>
      </div>

      {/* Risk Indicators */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Benefit Health Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {riskIndicators.map((indicator) => (
              <div key={indicator.label} className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
                <div className={`text-4xl font-bold ${indicator.color}`}>{indicator.value}</div>
                <div>
                  <p className="font-medium">{indicator.label}</p>
                  <p className="text-sm text-muted-foreground">{indicator.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Zombie Spend Chart */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="text-lg">Zombie Spend by Benefit</CardTitle>
          <CardDescription>Allocated vs utilized amounts for underperforming benefits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip 
                  formatter={(value: number) => [`AED ${value.toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                />
                <Bar dataKey="utilized" stackId="a" fill="hsl(var(--primary))" name="Utilized" />
                <Bar dataKey="zombie" stackId="a" fill="hsl(var(--destructive))" name="Zombie" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-accent" />
            Detailed Analysis & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {zombieCategories.map((category, index) => (
              <div key={index} className="p-4 rounded-lg border border-border bg-card">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{category.benefit}</h3>
                      <Badge variant={category.utilizationRate < 60 ? 'destructive' : 'secondary'}>
                        {category.utilizationRate}% utilized
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-muted-foreground">Allocated</p>
                        <p className="font-medium">AED {category.allocated.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Utilized</p>
                        <p className="font-medium">AED {category.utilized.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Zombie Amount</p>
                        <p className="font-medium text-amber-600">AED {category.zombie.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Affected</p>
                        <p className="font-medium">{category.affectedEmployees} employees</p>
                      </div>
                    </div>
                    <Progress value={category.utilizationRate} className="h-2 mb-3" />
                    <div className="flex flex-col sm:flex-row gap-4 text-sm">
                      <div className="flex-1">
                        <span className="text-muted-foreground">Root Cause: </span>
                        <span>{category.reason}</span>
                      </div>
                      <div className="flex-1">
                        <span className="text-accent font-medium">Recommendation: </span>
                        <span>{category.recommendation}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
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
