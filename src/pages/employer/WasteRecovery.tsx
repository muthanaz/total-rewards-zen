import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SummaryStatsCard } from '@/components/ui/summary-stats-card';
import { AlertTriangle, TrendingDown, Lightbulb, Users, Target, Recycle, Megaphone, ClipboardList, UserPlus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useState } from 'react';
import { DrillDownModal } from '@/components/dashboard';
import { Link } from 'react-router-dom';
import { WASTE_BY_CATEGORY, WASTE_RISK_INDICATORS, formatCurrency } from '@/lib/employerMetrics';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/ui/page-header';

// Use centralized waste data
const unrealizedCategories = [...WASTE_BY_CATEGORY];

const chartData = unrealizedCategories.map(c => ({
  name: c.benefit,
  shortName: c.benefit.split(' ').slice(0, 2).join(' '),
  unrealized: c.zombie,
  utilized: c.utilized,
  total: c.allocated,
  utilizationRate: c.utilizationRate,
  affectedEmployees: c.affectedEmployees,
  reason: c.reason,
  recommendation: c.recommendation,
  type: c.utilizationRate < 50 ? 'structural' : 'recoverable', // Classify type
}));

const riskIndicators = [...WASTE_RISK_INDICATORS];

// Custom legend component
const CustomLegend = ({ isArabic }: { isArabic: boolean }) => (
  <div className="flex justify-center gap-6 mt-4">
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-sm bg-accent" />
      <span className="text-xs text-muted-foreground font-medium">
        {isArabic ? 'مستخدم' : 'Used'}
      </span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-sm bg-amber-500" />
      <span className="text-xs text-muted-foreground font-medium">
        {isArabic ? 'غير محقق' : 'Unrealized'}
      </span>
    </div>
  </div>
);

export default function UnrealizedBenefitsPage() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const isArabic = language === 'ar';
  
  const [drillDownOpen, setDrillDownOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);
  
  const totalUnrealized = unrealizedCategories.reduce((sum, c) => sum + c.zombie, 0);
  const totalAllocated = unrealizedCategories.reduce((sum, c) => sum + c.allocated, 0);
  const totalAffected = unrealizedCategories.reduce((sum, c) => sum + c.affectedEmployees, 0);
  const recoveryPotential = totalUnrealized * 0.6;
  
  // Split by type
  const recoverableAmount = chartData
    .filter(c => c.type === 'recoverable')
    .reduce((sum, c) => sum + c.unrealized, 0);
  const structuralAmount = chartData
    .filter(c => c.type === 'structural')
    .reduce((sum, c) => sum + c.unrealized, 0);

  const handleBarClick = (data: any) => {
    if (data && data.activePayload) {
      const clickedData = data.activePayload[0]?.payload;
      if (clickedData) {
        setSelectedData({
          title: clickedData.name,
          category: isArabic ? 'تحليل القيمة غير المحققة' : 'Unrealized Value Analysis',
          totalValue: clickedData.total,
          utilized: clickedData.utilized,
          trend: clickedData.utilizationRate < 60 ? 'down' : 'neutral',
          trendValue: Math.round(100 - clickedData.utilizationRate),
          description: clickedData.reason,
          breakdown: [
            { name: isArabic ? 'مستخدم' : 'Used', value: clickedData.utilized },
            { name: isArabic ? 'غير محقق' : 'Unrealized', value: clickedData.unrealized },
          ],
        });
        setDrillDownOpen(true);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={isArabic ? 'قيمة المزايا غير المحققة' : 'Unrealized Benefits Value'}
        subtitle={isArabic ? 'تحديد واسترداد التخصيصات غير المستخدمة' : 'Identify and recover unutilized allocations'}
        icon={Recycle}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryStatsCard
          variant="info"
          label={isArabic ? 'إجمالي غير المحقق' : 'Total Unrealized'}
          value={formatCurrency(totalUnrealized)}
          icon={Recycle}
          formula={isArabic 
            ? 'مجموع المزايا المخصصة غير المستخدمة' 
            : 'Sum of allocated but unused benefits across all categories with <70% utilization'}
          dataSource={isArabic ? 'تحليلات المزايا' : 'Benefits Analytics'}
          index={0}
        />
        <SummaryStatsCard
          variant="utilized"
          label={isArabic ? 'الموظفون المتأثرون' : 'Affected Employees'}
          value={totalAffected.toString()}
          icon={Users}
          formula={isArabic ? 'عدد الموظفين بمزايا غير مستخدمة' : 'Count of employees with underutilized benefits'}
          dataSource={isArabic ? 'نظام الموارد البشرية' : 'HR System'}
          index={1}
        />
        <SummaryStatsCard
          variant="remaining"
          label={isArabic ? 'إمكانية الاسترداد' : 'Recovery Potential'}
          value={formatCurrency(recoveryPotential)}
          icon={TrendingDown}
          formula={isArabic 
            ? 'المبلغ القابل للاسترداد المقدر (60% من غير المستخدم)' 
            : 'Estimated recoverable amount (60% based on industry benchmarks)'}
          dataSource={isArabic ? 'نموذج التحليلات' : 'Analytics Model'}
          index={2}
        />
        <SummaryStatsCard
          variant="utilization"
          label={isArabic ? 'معدل غير المحقق' : 'Unrealized Rate'}
          value={`${((totalUnrealized / totalAllocated) * 100).toFixed(1)}%`}
          icon={Target}
          formula={isArabic 
            ? '(غير المحقق / إجمالي المخصص) × 100' 
            : '(Unrealized / Total Allocated) × 100'}
          dataSource={isArabic ? 'تحليلات المزايا' : 'Benefits Analytics'}
          progress={100 - (totalUnrealized / totalAllocated) * 100}
          index={3}
        />
      </div>

      {/* Split by Type: Recoverable vs Structural */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="p-4">
            <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
              <div className="p-3 rounded-xl bg-emerald-500/10">
                <Megaphone className="w-6 h-6 text-emerald-600" />
              </div>
              <div className={cn("flex-1", isRTL && "text-right")}>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? 'قابل للاسترداد (توعية/عملية)' : 'Recoverable (Awareness/Process)'}
                </p>
                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(recoverableAmount)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isArabic ? 'يمكن استرداده عبر حملات التواصل والتوعية' : 'Can be recovered through employee campaigns'}
                </p>
              </div>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                {isArabic ? 'إنشاء حملة' : 'Create Campaign'}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-4">
            <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
              <div className="p-3 rounded-xl bg-amber-500/10">
                <ClipboardList className="w-6 h-6 text-amber-600" />
              </div>
              <div className={cn("flex-1", isRTL && "text-right")}>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? 'هيكلي (تصميم السياسة)' : 'Structural (Policy Design)'}
                </p>
                <p className="text-2xl font-bold text-amber-600">{formatCurrency(structuralAmount)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isArabic ? 'يتطلب مراجعة السياسات وإعادة التصميم' : 'Requires policy review and redesign'}
                </p>
              </div>
              <Button size="sm" variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-500/10">
                {isArabic ? 'إنشاء مهمة' : 'Create Task'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Indicators */}
      <Card>
        <CardHeader className="pb-3">
          <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
            <CardTitle className={cn("text-base font-display flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {isArabic ? 'نظرة عامة على صحة المزايا' : 'Benefit Health Overview'}
            </CardTitle>
            <InfoTooltip 
              formula={isArabic 
                ? 'المزايا مصنفة حسب معدل الاستخدام' 
                : 'Benefits categorized by utilization rate: High Risk (<60%), Medium Risk (60-75%), Healthy (>75%).'} 
              dataSource={isArabic ? 'تحليلات المزايا' : 'Benefits Analytics'} 
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {riskIndicators.map((indicator) => (
              <div 
                key={indicator.label} 
                className={`flex items-center gap-4 p-4 rounded-xl ${indicator.bgColor} border border-transparent hover:border-border/50 transition-colors`}
              >
                <div className={`text-4xl font-bold ${indicator.color}`}>{indicator.value}</div>
                <div className={cn(isRTL && "text-right")}>
                  <p className={`font-semibold ${indicator.color}`}>{indicator.label}</p>
                  <p className="text-sm text-muted-foreground">{indicator.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Unrealized Value Chart */}
      <Card>
        <CardHeader className="pb-3">
          <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
            <div className={cn(isRTL && "text-right")}>
              <CardTitle className={cn("text-base font-display flex items-center gap-2", isRTL && "flex-row-reverse")}>
                {isArabic ? 'القيمة غير المحققة حسب المزايا' : 'Unrealized Value by Benefit'}
              </CardTitle>
              <CardDescription>
                {isArabic ? 'انقر على أي شريط لرؤية التفاصيل' : 'Click on any bar to see detailed breakdown'}
              </CardDescription>
            </div>
            <InfoTooltip 
              formula={isArabic 
                ? 'مقارنة المستخدم مقابل غير المحقق لكل فئة' 
                : 'Stacked comparison of used vs unrealized amounts per benefit category.'} 
              dataSource={isArabic ? 'تحليلات المزايا' : 'Benefits Analytics'} 
            />
          </div>
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
                  <linearGradient id="unrealizedGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="hsl(38 92% 50%)" stopOpacity={1} />
                    <stop offset="100%" stopColor="hsl(38 92% 50%)" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <XAxis 
                  type="number" 
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
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
                    `AED ${value.toLocaleString()}`,
                    name === 'utilized' ? (isArabic ? 'مستخدم' : 'Used') : (isArabic ? 'غير محقق' : 'Unrealized')
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
                  name="utilized"
                  radius={[0, 0, 0, 0]}
                  maxBarSize={32}
                />
                <Bar 
                  dataKey="unrealized" 
                  stackId="a" 
                  fill="url(#unrealizedGradient)" 
                  name="unrealized" 
                  radius={[0, 6, 6, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <CustomLegend isArabic={isArabic} />
        </CardContent>
      </Card>

      {/* Detailed Analysis with Actions */}
      <Card>
        <CardHeader className="pb-3">
          <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
            <CardTitle className={cn("text-base font-display flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Lightbulb className="h-5 w-5 text-accent" />
              {isArabic ? 'التحليل التفصيلي والتوصيات' : 'Detailed Analysis & Recommendations'}
            </CardTitle>
            <InfoTooltip 
              formula={isArabic 
                ? 'رؤى مبنية على أنماط الاستخدام' 
                : 'AI-generated insights based on utilization patterns, employee feedback, and industry benchmarks.'} 
              dataSource={isArabic ? 'تحليلات الذكاء الاصطناعي' : 'AI Analytics'} 
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {unrealizedCategories.map((category, index) => (
              <div key={index} className="p-4 rounded-xl border border-border bg-card hover:border-border/80 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className={cn("flex items-center gap-2 mb-3", isRTL && "flex-row-reverse")}>
                      <h3 className="font-semibold">{category.benefit}</h3>
                      <Badge className={
                        category.utilizationRate < 60 
                          ? 'bg-red-500/10 text-red-500 border-0'
                          : 'bg-amber-500/10 text-amber-500 border-0'
                      }>
                        {category.utilizationRate}% {isArabic ? 'مستخدم' : 'used'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {category.utilizationRate < 50 
                          ? (isArabic ? 'هيكلي' : 'Structural') 
                          : (isArabic ? 'قابل للاسترداد' : 'Recoverable')}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div className={cn("space-y-1", isRTL && "text-right")}>
                        <p className="text-muted-foreground text-xs">
                          {isArabic ? 'المخصص' : 'Allocated'}
                        </p>
                        <p className="font-semibold">AED {category.allocated.toLocaleString()}</p>
                      </div>
                      <div className={cn("space-y-1", isRTL && "text-right")}>
                        <p className="text-muted-foreground text-xs">
                          {isArabic ? 'مستخدم' : 'Used'}
                        </p>
                        <p className="font-semibold text-accent">AED {category.utilized.toLocaleString()}</p>
                      </div>
                      <div className={cn("space-y-1", isRTL && "text-right")}>
                        <p className="text-muted-foreground text-xs">
                          {isArabic ? 'غير محقق' : 'Unrealized'}
                        </p>
                        <p className="font-semibold text-amber-500">AED {category.zombie.toLocaleString()}</p>
                      </div>
                      <div className={cn("space-y-1", isRTL && "text-right")}>
                        <p className="text-muted-foreground text-xs">
                          {isArabic ? 'المتأثرون' : 'Affected'}
                        </p>
                        <p className="font-semibold">{category.affectedEmployees} {isArabic ? 'موظف' : 'employees'}</p>
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
                      <div className={cn("flex-1 p-2 rounded-lg bg-muted/30", isRTL && "text-right")}>
                        <span className="text-muted-foreground text-xs block mb-1">
                          {isArabic ? 'السبب الجذري' : 'Root Cause'}
                        </span>
                        <span className="text-foreground">{category.reason}</span>
                      </div>
                      <div className={cn("flex-1 p-2 rounded-lg bg-accent/5 border border-accent/20", isRTL && "text-right")}>
                        <span className="text-accent text-xs block mb-1">
                          {isArabic ? 'التوصية' : 'Recommendation'}
                        </span>
                        <span className="text-foreground">{category.recommendation}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button size="sm" className="shrink-0">
                      <Megaphone className="w-3.5 h-3.5 mr-1.5" />
                      {isArabic ? 'إرسال حملة' : 'Send Campaign'}
                    </Button>
                    <Button size="sm" variant="outline" className="shrink-0">
                      <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                      {isArabic ? 'تعيين مالك' : 'Assign Owner'}
                    </Button>
                  </div>
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
        formatValue={(v) => `AED ${v.toLocaleString()}`}
      />
    </div>
  );
}
