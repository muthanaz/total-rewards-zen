import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Users,
  DollarSign,
  Calculator,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  LineChart as LineChartIcon,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ReferenceLine
} from 'recharts';
import chartColors from '@/lib/chartColors';

const monthlyData = [
  { month: 'Jan', actual: 4.2, budget: 5.2, forecast: null, conservative: null, optimistic: null },
  { month: 'Feb', actual: 4.8, budget: 5.2, forecast: null, conservative: null, optimistic: null },
  { month: 'Mar', actual: 5.1, budget: 5.2, forecast: null, conservative: null, optimistic: null },
  { month: 'Apr', actual: 5.4, budget: 5.2, forecast: null, conservative: null, optimistic: null },
  { month: 'May', actual: 4.9, budget: 5.2, forecast: null, conservative: null, optimistic: null },
  { month: 'Jun', actual: 5.3, budget: 5.2, forecast: null, conservative: null, optimistic: null },
  { month: 'Jul', actual: 5.6, budget: 5.2, forecast: null, conservative: null, optimistic: null },
  { month: 'Aug', actual: 5.2, budget: 5.2, forecast: null, conservative: null, optimistic: null },
  { month: 'Sep', actual: null, budget: 5.2, forecast: 5.4, conservative: 5.1, optimistic: 5.7 },
  { month: 'Oct', actual: null, budget: 5.2, forecast: 5.5, conservative: 5.2, optimistic: 5.9 },
  { month: 'Nov', actual: null, budget: 5.2, forecast: 5.6, conservative: 5.3, optimistic: 6.1 },
  { month: 'Dec', actual: null, budget: 5.2, forecast: 5.7, conservative: 5.4, optimistic: 6.3 },
];

const departmentForecasts = [
  { department: 'Engineering', current: 12.5, projected: 14.2, variance: 1.7, trend: 'up' },
  { department: 'Sales', current: 8.3, projected: 8.9, variance: 0.6, trend: 'up' },
  { department: 'Marketing', current: 5.1, projected: 4.8, variance: -0.3, trend: 'down' },
  { department: 'HR', current: 3.2, projected: 3.4, variance: 0.2, trend: 'up' },
  { department: 'Finance', current: 2.8, projected: 2.9, variance: 0.1, trend: 'up' },
  { department: 'Operations', current: 6.4, projected: 6.2, variance: -0.2, trend: 'down' },
];

const scenarioModels = [
  { id: 'conservative', label: 'Conservative', color: chartColors.warning, description: 'Lower utilization, higher savings' },
  { id: 'expected', label: 'Expected', color: chartColors.primary, description: 'Based on current trajectory' },
  { id: 'optimistic', label: 'Optimistic', color: chartColors.success, description: 'Full utilization, max value' },
];

export default function ForecastingPage() {
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';
  
  const [selectedScenario, setSelectedScenario] = useState('expected');
  const [headcountChange, setHeadcountChange] = useState([0]);
  const [utilizationTarget, setUtilizationTarget] = useState([64]);

  const formatCurrency = (value: number) => `AED ${value.toFixed(1)}M`;

  // Calculate projections based on inputs
  const baseProjection = 62.4;
  const headcountImpact = headcountChange[0] * 0.12; // AED 120K per employee
  const utilizationImpact = (utilizationTarget[0] - 64) * 0.15; // Impact per % change
  const adjustedProjection = baseProjection + headcountImpact + utilizationImpact;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
        isRTL && "sm:flex-row-reverse"
      )}>
        <div className={isRTL ? "text-right" : ""}>
          <h1 className="text-2xl font-display font-bold tracking-tight">
            {isRTL ? "التوقعات المالية" : "Financial Forecasting"}
          </h1>
          <p className="text-muted-foreground">
            {isRTL 
              ? "توقعات نهاية العام ونمذجة السيناريوهات"
              : "Year-end projections and scenario modeling"
            }
          </p>
        </div>
        <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
          <Button variant="outline">
            <Download className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
            {isRTL ? "تصدير التقرير" : "Export Report"}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { 
            label: isRTL ? 'الإنفاق حتى تاريخه' : 'Spend YTD', 
            value: 'AED 39.7M',
            change: '+2.3%',
            trend: 'up',
            icon: DollarSign,
            color: 'text-primary'
          },
          { 
            label: isRTL ? 'المتوقع لنهاية العام' : 'Year-End Forecast', 
            value: formatCurrency(adjustedProjection),
            change: adjustedProjection > 62 ? `+${((adjustedProjection - 62) / 62 * 100).toFixed(1)}%` : `${((adjustedProjection - 62) / 62 * 100).toFixed(1)}%`,
            trend: adjustedProjection > 62 ? 'up' : 'down',
            icon: Target,
            color: 'text-accent'
          },
          { 
            label: isRTL ? 'التباين عن الميزانية' : 'Budget Variance', 
            value: formatCurrency(adjustedProjection - 62),
            change: adjustedProjection > 62 ? 'Over budget' : 'Under budget',
            trend: adjustedProjection > 62 ? 'up' : 'down',
            icon: BarChart3,
            color: adjustedProjection > 62 ? 'text-amber-600' : 'text-emerald-600'
          },
          { 
            label: isRTL ? 'دقة التوقعات' : 'Forecast Accuracy', 
            value: '94.2%',
            change: '+1.8% vs last quarter',
            trend: 'up',
            icon: Sparkles,
            color: 'text-emerald-600'
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className={cn("flex items-start justify-between", isRTL && "flex-row-reverse")}>
                  <div className={isRTL ? "text-right" : ""}>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className={cn("text-2xl font-bold mt-1", stat.color)}>{stat.value}</p>
                    <div className={cn(
                      "flex items-center gap-1 mt-1",
                      isRTL && "flex-row-reverse"
                    )}>
                      {stat.trend === 'up' ? (
                        <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 text-amber-600" />
                      )}
                      <span className="text-xs text-muted-foreground">{stat.change}</span>
                    </div>
                  </div>
                  <div className={cn("p-2 rounded-lg bg-muted/50")}>
                    <stat.icon className={cn("w-5 h-5", stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Forecast Chart */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader className="pb-2">
            <div className={cn(
              "flex items-center justify-between",
              isRTL && "flex-row-reverse"
            )}>
              <CardTitle className={cn(
                "flex items-center gap-2",
                isRTL && "flex-row-reverse"
              )}>
                <LineChartIcon className="w-5 h-5 text-primary" />
                {isRTL ? "توقعات الإنفاق الشهري" : "Monthly Spend Forecast"}
              </CardTitle>
              <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                {scenarioModels.map((scenario) => (
                  <Button
                    key={scenario.id}
                    variant={selectedScenario === scenario.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedScenario(scenario.id)}
                    className="h-7 text-xs"
                  >
                    {scenario.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors.info} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={chartColors.info} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickFormatter={(value) => `${value}M`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`AED ${value}M`, '']}
                />
                <Legend />
                <ReferenceLine y={5.2} stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" label="Budget" />
                <Area 
                  type="monotone" 
                  dataKey="actual" 
                  stroke={chartColors.primary}
                  strokeWidth={2}
                  fill="url(#actualGradient)"
                  name="Actual"
                />
                <Area 
                  type="monotone" 
                  dataKey="forecast" 
                  stroke={chartColors.info}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="url(#forecastGradient)"
                  name="Forecast"
                />
                {selectedScenario === 'conservative' && (
                  <Area 
                    type="monotone" 
                    dataKey="conservative" 
                    stroke={chartColors.warning}
                    strokeWidth={1}
                    fill="none"
                    name="Conservative"
                  />
                )}
                {selectedScenario === 'optimistic' && (
                  <Area 
                    type="monotone" 
                    dataKey="optimistic" 
                    stroke={chartColors.success}
                    strokeWidth={1}
                    fill="none"
                    name="Optimistic"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* What-If Analysis */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className={cn(
              "flex items-center gap-2 text-lg",
              isRTL && "flex-row-reverse"
            )}>
              <Calculator className="w-5 h-5 text-violet-500" />
              {isRTL ? "تحليل ماذا لو" : "What-If Analysis"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Headcount Change */}
            <div className="space-y-3">
              <div className={cn(
                "flex items-center justify-between",
                isRTL && "flex-row-reverse"
              )}>
                <label className="text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  {isRTL ? "تغيير عدد الموظفين" : "Headcount Change"}
                </label>
                <Badge variant="outline" className="tabular-nums">
                  {headcountChange[0] >= 0 ? '+' : ''}{headcountChange[0]}
                </Badge>
              </div>
              <Slider
                value={headcountChange}
                onValueChange={setHeadcountChange}
                min={-50}
                max={50}
                step={5}
              />
              <div className={cn(
                "flex justify-between text-xs text-muted-foreground",
                isRTL && "flex-row-reverse"
              )}>
                <span>-50</span>
                <span>0</span>
                <span>+50</span>
              </div>
            </div>

            {/* Utilization Target */}
            <div className="space-y-3">
              <div className={cn(
                "flex items-center justify-between",
                isRTL && "flex-row-reverse"
              )}>
                <label className="text-sm font-medium flex items-center gap-2">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  {isRTL ? "هدف الاستخدام" : "Utilization Target"}
                </label>
                <Badge variant="outline" className="tabular-nums">
                  {utilizationTarget[0]}%
                </Badge>
              </div>
              <Slider
                value={utilizationTarget}
                onValueChange={setUtilizationTarget}
                min={50}
                max={95}
                step={5}
              />
              <div className={cn(
                "flex justify-between text-xs text-muted-foreground",
                isRTL && "flex-row-reverse"
              )}>
                <span>50%</span>
                <span>{isRTL ? "الحالي" : "Current"}: 64%</span>
                <span>95%</span>
              </div>
            </div>

            {/* Projected Impact */}
            <div className="pt-4 border-t border-border/50 space-y-3">
              <h4 className="text-sm font-medium">
                {isRTL ? "التأثير المتوقع" : "Projected Impact"}
              </h4>
              <div className="p-4 rounded-lg bg-muted/30 space-y-2">
                <div className={cn(
                  "flex items-center justify-between",
                  isRTL && "flex-row-reverse"
                )}>
                  <span className="text-sm text-muted-foreground">
                    {isRTL ? "الإنفاق المتوقع" : "Adjusted Forecast"}
                  </span>
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(adjustedProjection)}
                  </span>
                </div>
                <div className={cn(
                  "flex items-center justify-between",
                  isRTL && "flex-row-reverse"
                )}>
                  <span className="text-sm text-muted-foreground">
                    {isRTL ? "الفرق" : "Difference"}
                  </span>
                  <span className={cn(
                    "text-sm font-medium",
                    adjustedProjection > baseProjection ? "text-amber-600" : "text-emerald-600"
                  )}>
                    {adjustedProjection > baseProjection ? '+' : ''}{formatCurrency(adjustedProjection - baseProjection)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Forecasts */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className={cn(
            "flex items-center gap-2",
            isRTL && "flex-row-reverse"
          )}>
            <BarChart3 className="w-5 h-5 text-primary" />
            {isRTL ? "توقعات الأقسام" : "Department Forecasts"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className={cn("text-left py-3 px-4 text-sm font-medium text-muted-foreground", isRTL && "text-right")}>
                    {isRTL ? "القسم" : "Department"}
                  </th>
                  <th className={cn("text-right py-3 px-4 text-sm font-medium text-muted-foreground", isRTL && "text-left")}>
                    {isRTL ? "الإنفاق حتى تاريخه" : "Current YTD"}
                  </th>
                  <th className={cn("text-right py-3 px-4 text-sm font-medium text-muted-foreground", isRTL && "text-left")}>
                    {isRTL ? "المتوقع" : "Projected"}
                  </th>
                  <th className={cn("text-right py-3 px-4 text-sm font-medium text-muted-foreground", isRTL && "text-left")}>
                    {isRTL ? "التباين" : "Variance"}
                  </th>
                  <th className={cn("text-center py-3 px-4 text-sm font-medium text-muted-foreground")}>
                    {isRTL ? "الاتجاه" : "Trend"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {departmentForecasts.map((dept, index) => (
                  <motion.tr
                    key={dept.department}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                  >
                    <td className={cn("py-3 px-4 font-medium", isRTL && "text-right")}>
                      {dept.department}
                    </td>
                    <td className={cn("py-3 px-4 text-right tabular-nums", isRTL && "text-left")}>
                      AED {dept.current}M
                    </td>
                    <td className={cn("py-3 px-4 text-right tabular-nums font-medium", isRTL && "text-left")}>
                      AED {dept.projected}M
                    </td>
                    <td className={cn(
                      "py-3 px-4 text-right tabular-nums font-medium",
                      isRTL && "text-left",
                      dept.variance > 0 ? "text-amber-600" : "text-emerald-600"
                    )}>
                      {dept.variance > 0 ? '+' : ''}{dept.variance}M
                    </td>
                    <td className="py-3 px-4 text-center">
                      {dept.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4 text-amber-600 mx-auto" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-emerald-600 mx-auto" />
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
