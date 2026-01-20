import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SummaryStatsCard } from '@/components/ui/summary-stats-card';
import { Ghost, AlertTriangle, TrendingDown, Lightbulb, DollarSign, Users, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { useState } from 'react';
import { DrillDownModal } from '@/components/dashboard';
import { formatCurrencyAED, formatPercent, formatInteger } from '@/lib/utils';
import { EmployerGlobalFiltersBar, DataConfidenceBadge, PageConfidenceGate, useDataCoverageMetrics } from '@/components/employer';

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
  name: c.benefit,
  shortName: c.benefit.split(' ').slice(0, 2).join(' '),
  zombie: c.zombie,
  utilized: c.utilized,
  total: c.allocated,
  utilizationRate: c.utilizationRate,
  affectedEmployees: c.affectedEmployees,
  reason: c.reason,
  recommendation: c.recommendation,
}));

const riskIndicators = [
  { label: 'High Risk', value: 2, description: '<60% utilization', color: 'text-red-500', bgColor: 'bg-red-500/10' },
  { label: 'Medium Risk', value: 2, description: '60-75% utilization', color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
  { label: 'Healthy', value: 8, description: '>75% utilization', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
];

// Custom legend component
const CustomLegend = () => (
  <div className="flex justify-center gap-6 mt-4">
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-sm bg-accent" />
      <span className="text-xs text-muted-foreground font-medium">Utilized</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-sm bg-amber-500" />
      <span className="text-xs text-muted-foreground font-medium">Zombie Spend</span>
    </div>
  </div>
);

export default function ZombieSpendPage() {
  const [drillDownOpen, setDrillDownOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);
  const coverageMetrics = useDataCoverageMetrics();
  
  const totalZombie = zombieCategories.reduce((sum, c) => sum + c.zombie, 0);
  const totalAllocated = zombieCategories.reduce((sum, c) => sum + c.allocated, 0);
  const totalAffected = zombieCategories.reduce((sum, c) => sum + c.affectedEmployees, 0);
  const recoveryPotential = totalZombie * 0.6;

  const handleBarClick = (data: any) => {
    if (data && data.activePayload) {
      const clickedData = data.activePayload[0]?.payload;
      if (clickedData) {
        setSelectedData({
          title: clickedData.name,
          category: 'Zombie Spend Analysis',
          totalValue: clickedData.total,
          utilized: clickedData.utilized,
          trend: clickedData.utilizationRate < 60 ? 'down' : 'neutral',
          trendValue: Math.round(100 - clickedData.utilizationRate),
          description: clickedData.reason,
          breakdown: [
            { name: 'Utilized', value: clickedData.utilized },
            { name: 'Zombie Spend', value: clickedData.zombie },
          ],
        });
        setDrillDownOpen(true);
      }
    }
  };

  return (
    <PageConfidenceGate metrics={coverageMetrics} threshold={70}>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Ghost className="h-8 w-8 text-amber-500" />
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Zombie Spend Analysis</h1>
            <p className="text-muted-foreground">Identify and recover underutilized benefit allocations</p>
          </div>
        </div>
        <DataConfidenceBadge metrics={coverageMetrics} />
      </div>

      {/* Global Filters */}
      <EmployerGlobalFiltersBar />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryStatsCard
          variant="info"
          label="Total Zombie Spend"
          value={formatCurrencyAED(totalZombie)}
          icon={Ghost}
          formula="Sum of allocated but unused benefits across all categories with <75% utilization"
          dataSource="Benefits Analytics"
          index={0}
        />
        <SummaryStatsCard
          variant="utilized"
          label="Affected Employees"
          value={formatInteger(totalAffected)}
          icon={Users}
          formula="Count of employees with underutilized benefits"
          dataSource="HR System"
          index={1}
        />
        <SummaryStatsCard
          variant="remaining"
          label="Recovery Potential"
          value={formatCurrencyAED(recoveryPotential)}
          icon={TrendingDown}
          formula="Estimated recoverable amount (60% of zombie spend)"
          dataSource="Analytics Model"
          index={2}
        />
        <SummaryStatsCard
          variant="utilization"
          label="Zombie Rate"
          value={formatPercent((totalZombie / totalAllocated) * 100)}
          icon={Target}
          formula="(Zombie Spend / Total Allocated) × 100"
          dataSource="Benefits Analytics"
          progress={100 - (totalZombie / totalAllocated) * 100}
          index={3}
        />
      </div>

      {/* Risk Indicators */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Benefit Health Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {riskIndicators.map((indicator) => (
              <div 
                key={indicator.label} 
                className={`flex items-center gap-4 p-4 rounded-xl ${indicator.bgColor} border border-transparent hover:border-border/50 transition-colors`}
              >
                <div className={`text-4xl font-bold ${indicator.color}`}>{indicator.value}</div>
                <div>
                  <p className={`font-semibold ${indicator.color}`}>{indicator.label}</p>
                  <p className="text-sm text-muted-foreground">{indicator.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Zombie Spend Chart - Enhanced */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display flex items-center gap-2">
            Zombie Spend by Benefit
            <InfoTooltip formula="Stacked comparison of utilized vs zombie amounts" dataSource="Benefits Analytics" />
          </CardTitle>
          <CardDescription>Click on any bar to see detailed breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData} 
                layout="vertical"
                margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                onClick={handleBarClick}
                style={{ cursor: 'pointer' }}
              >
                <defs>
                  <linearGradient id="utilizedGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={1} />
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0.7} />
                  </linearGradient>
                  <linearGradient id="zombieGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="hsl(38 92% 50%)" stopOpacity={1} />
                    <stop offset="100%" stopColor="hsl(38 92% 50%)" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <XAxis 
                  type="number" 
                  tickFormatter={(v) => formatCurrencyAED(v, { showCurrency: false })}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  tickCount={5}
                />
                <YAxis 
                  type="category" 
                  dataKey="shortName" 
                  width={110}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 500 }}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    formatCurrencyAED(value, { abbreviate: false }),
                    name === 'utilized' ? 'Utilized' : 'Zombie Spend'
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
                <Bar 
                  dataKey="utilized" 
                  stackId="a" 
                  fill="url(#utilizedGradient)" 
                  name="Utilized"
                  radius={[0, 0, 0, 0]}
                  maxBarSize={32}
                />
                <Bar 
                  dataKey="zombie" 
                  stackId="a" 
                  fill="url(#zombieGradient)" 
                  name="Zombie Spend" 
                  radius={[0, 6, 6, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <CustomLegend />
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-accent" />
            Detailed Analysis & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {zombieCategories.map((category, index) => (
              <div key={index} className="p-4 rounded-xl border border-border bg-card hover:border-border/80 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="font-semibold">{category.benefit}</h3>
                      <Badge className={
                        category.utilizationRate < 60 
                          ? 'bg-red-500/10 text-red-500 border-0'
                          : 'bg-amber-500/10 text-amber-500 border-0'
                      }>
                        {category.utilizationRate}% utilized
                      </Badge>
                    </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div className="space-y-1">
                          <p className="text-muted-foreground text-xs">Allocated</p>
                          <p className="font-semibold">{formatCurrencyAED(category.allocated, { abbreviate: false })}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-muted-foreground text-xs">Utilized</p>
                          <p className="font-semibold text-accent">{formatCurrencyAED(category.utilized, { abbreviate: false })}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-muted-foreground text-xs">Zombie Amount</p>
                          <p className="font-semibold text-amber-500">{formatCurrencyAED(category.zombie, { abbreviate: false })}</p>
                        </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-xs">Affected</p>
                        <p className="font-semibold">{category.affectedEmployees} employees</p>
                      </div>
                    </div>
                    <Progress 
                      value={category.utilizationRate} 
                      className={`h-2 mb-3 ${
                        category.utilizationRate < 60 
                          ? '[&>div]:bg-red-500' 
                          : '[&>div]:bg-amber-500'
                      }`} 
                    />
                    <div className="flex flex-col sm:flex-row gap-4 text-sm">
                      <div className="flex-1 p-2 rounded-lg bg-muted/30">
                        <span className="text-muted-foreground text-xs block mb-1">Root Cause</span>
                        <span className="text-foreground">{category.reason}</span>
                      </div>
                      <div className="flex-1 p-2 rounded-lg bg-accent/5 border border-accent/20">
                        <span className="text-accent text-xs block mb-1">Recommendation</span>
                        <span className="text-foreground">{category.recommendation}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="shrink-0">
                    Take Action
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Drill-down Modal */}
      <DrillDownModal
        open={drillDownOpen}
        onOpenChange={setDrillDownOpen}
        data={selectedData}
        formatValue={(v) => formatCurrencyAED(v, { abbreviate: false })}
      />
    </div>
    </PageConfidenceGate>
  );
}
