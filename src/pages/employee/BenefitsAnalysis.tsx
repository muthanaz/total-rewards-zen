import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, TrendingDown, Target, PieChart, BarChart3, 
  ArrowUpRight, ArrowDownRight, Calendar, DollarSign
} from 'lucide-react';
import { ChartContainer, AnimatedBarChart, AnimatedRadarChart, AnimatedDonutChart, StackedAreaChart } from '@/components/charts';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { motion } from 'framer-motion';

// Demo data
const benefits = [
  { name: 'Housing Allowance', value: 120000, utilized: 120000, type: 'cash_allowances' },
  { name: 'Education Allowance', value: 60000, utilized: 42000, type: 'cash_allowances' },
  { name: 'Health Insurance', value: 45000, utilized: 12500, type: 'health_protection' },
  { name: 'Transport & Mobility', value: 39000, utilized: 33000, type: 'cash_allowances' },
  { name: 'Annual Bonus', value: 70000, utilized: 0, type: 'cash_allowances' },
  { name: 'Financial Planning', value: 36000, utilized: 18000, type: 'wealth_ownership' },
  { name: 'Wellbeing Program', value: 6000, utilized: 3200, type: 'wellbeing' },
  { name: 'Learning & Development', value: 12000, utilized: 4500, type: 'growth_career' },
];

// Chart data with translations
const utilizationByTypeEn = [
  { name: 'Cash', value: 195000, secondaryValue: 219000 },
  { name: 'Health', value: 12500, secondaryValue: 45000 },
  { name: 'Wealth', value: 18000, secondaryValue: 36000 },
  { name: 'Growth', value: 4500, secondaryValue: 12000 },
  { name: 'Wellbeing', value: 3200, secondaryValue: 6000 },
];

const utilizationByTypeAr = [
  { name: 'النقدية', value: 195000, secondaryValue: 219000 },
  { name: 'الصحة', value: 12500, secondaryValue: 45000 },
  { name: 'الثروة', value: 18000, secondaryValue: 36000 },
  { name: 'النمو', value: 4500, secondaryValue: 12000 },
  { name: 'الرفاهية', value: 3200, secondaryValue: 6000 },
];

const benefitRadarDataEn = [
  { subject: 'Housing', value: 100, secondaryValue: 85, fullMark: 100 },
  { subject: 'Education', value: 70, secondaryValue: 75, fullMark: 100 },
  { subject: 'Health', value: 28, secondaryValue: 65, fullMark: 100 },
  { subject: 'Transport', value: 75, secondaryValue: 70, fullMark: 100 },
  { subject: 'Wellbeing', value: 53, secondaryValue: 60, fullMark: 100 },
  { subject: 'Learning', value: 38, secondaryValue: 55, fullMark: 100 },
];

const benefitRadarDataAr = [
  { subject: 'السكن', value: 100, secondaryValue: 85, fullMark: 100 },
  { subject: 'التعليم', value: 70, secondaryValue: 75, fullMark: 100 },
  { subject: 'الصحة', value: 28, secondaryValue: 65, fullMark: 100 },
  { subject: 'النقل', value: 75, secondaryValue: 70, fullMark: 100 },
  { subject: 'الرفاهية', value: 53, secondaryValue: 60, fullMark: 100 },
  { subject: 'التعلم', value: 38, secondaryValue: 55, fullMark: 100 },
];

// Monthly utilization trend
const monthlyTrendEn = [
  { name: 'Jan', value: 15000, secondaryValue: 12000 },
  { name: 'Feb', value: 22000, secondaryValue: 18000 },
  { name: 'Mar', value: 35000, secondaryValue: 28000 },
  { name: 'Apr', value: 48000, secondaryValue: 42000 },
  { name: 'May', value: 62000, secondaryValue: 55000 },
  { name: 'Jun', value: 78000, secondaryValue: 68000 },
  { name: 'Jul', value: 95000, secondaryValue: 82000 },
  { name: 'Aug', value: 115000, secondaryValue: 98000 },
  { name: 'Sep', value: 138000, secondaryValue: 115000 },
  { name: 'Oct', value: 165000, secondaryValue: 138000 },
  { name: 'Nov', value: 198000, secondaryValue: 165000 },
  { name: 'Dec', value: 233200, secondaryValue: 195000 },
];

const monthlyTrendAr = [
  { name: 'يناير', value: 15000, secondaryValue: 12000 },
  { name: 'فبراير', value: 22000, secondaryValue: 18000 },
  { name: 'مارس', value: 35000, secondaryValue: 28000 },
  { name: 'أبريل', value: 48000, secondaryValue: 42000 },
  { name: 'مايو', value: 62000, secondaryValue: 55000 },
  { name: 'يونيو', value: 78000, secondaryValue: 68000 },
  { name: 'يوليو', value: 95000, secondaryValue: 82000 },
  { name: 'أغسطس', value: 115000, secondaryValue: 98000 },
  { name: 'سبتمبر', value: 138000, secondaryValue: 115000 },
  { name: 'أكتوبر', value: 165000, secondaryValue: 138000 },
  { name: 'نوفمبر', value: 198000, secondaryValue: 165000 },
  { name: 'ديسمبر', value: 233200, secondaryValue: 195000 },
];

// Benefit distribution for donut chart
const benefitDistributionEn = [
  { name: 'Housing', value: 120000, color: 'hsl(var(--accent))' },
  { name: 'Education', value: 60000, color: 'hsl(210, 80%, 55%)' },
  { name: 'Health', value: 45000, color: 'hsl(340, 75%, 55%)' },
  { name: 'Transport', value: 39000, color: 'hsl(45, 85%, 50%)' },
  { name: 'Bonus', value: 70000, color: 'hsl(280, 70%, 55%)' },
  { name: 'Financial', value: 36000, color: 'hsl(160, 60%, 45%)' },
  { name: 'Wellbeing', value: 6000, color: 'hsl(25, 80%, 55%)' },
  { name: 'Learning', value: 12000, color: 'hsl(200, 70%, 50%)' },
];

const benefitDistributionAr = [
  { name: 'السكن', value: 120000, color: 'hsl(var(--accent))' },
  { name: 'التعليم', value: 60000, color: 'hsl(210, 80%, 55%)' },
  { name: 'الصحة', value: 45000, color: 'hsl(340, 75%, 55%)' },
  { name: 'النقل', value: 39000, color: 'hsl(45, 85%, 50%)' },
  { name: 'المكافأة', value: 70000, color: 'hsl(280, 70%, 55%)' },
  { name: 'المالية', value: 36000, color: 'hsl(160, 60%, 45%)' },
  { name: 'الرفاهية', value: 6000, color: 'hsl(25, 80%, 55%)' },
  { name: 'التعلم', value: 12000, color: 'hsl(200, 70%, 50%)' },
];

export default function BenefitsAnalysis() {
  const { t, language, direction } = useLanguage();
  const isRTL = direction === 'rtl';

  const calculatedMetrics = useMemo(() => {
    const totalBenefitValue = benefits.reduce((sum, b) => sum + b.value, 0);
    const totalUtilized = benefits.reduce((sum, b) => sum + b.utilized, 0);
    const utilizationPercent = Math.round((totalUtilized / totalBenefitValue) * 100);
    const fullyUtilizedCount = benefits.filter(b => (b.utilized / b.value) >= 1).length;
    const underutilizedCount = benefits.filter(b => (b.utilized / b.value) < 0.5).length;
    
    return {
      totalBenefitValue,
      totalUtilized,
      utilizationPercent,
      fullyUtilizedCount,
      underutilizedCount,
    };
  }, []);

  const formatCurrency = (value: number) => `${isRTL ? '' : 'AED '}${value.toLocaleString(isRTL ? 'ar-AE' : 'en-AE')}${isRTL ? ' درهم' : ''}`;
  const formatCurrencyShort = (value: number) => `${(value / 1000).toFixed(0)}${isRTL ? 'ألف' : 'K'}`;

  const utilizationByType = isRTL ? utilizationByTypeAr : utilizationByTypeEn;
  const benefitRadarData = isRTL ? benefitRadarDataAr : benefitRadarDataEn;
  const monthlyTrend = isRTL ? monthlyTrendAr : monthlyTrendEn;
  const benefitDistribution = isRTL ? benefitDistributionAr : benefitDistributionEn;

  // Top underutilized benefits
  const underutilizedBenefits = benefits
    .map(b => ({ ...b, utilizationPercent: Math.round((b.utilized / b.value) * 100) }))
    .filter(b => b.utilizationPercent < 80)
    .sort((a, b) => a.utilizationPercent - b.utilizationPercent)
    .slice(0, 4);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className={cn("space-y-1", isRTL && "text-right")}>
        <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
          {isRTL ? 'تحليل المزايا' : 'Benefits Analysis'}
        </h1>
        <p className="text-muted-foreground">
          {isRTL ? 'رؤى تفصيلية حول استخدام وتوزيع مزاياك' : 'Detailed insights into your benefits utilization and distribution'}
        </p>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Card className="p-3 border-accent/20 bg-accent/5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-accent/15">
                <Target className="w-4 h-4 text-accent" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{calculatedMetrics.utilizationPercent}%</p>
                <p className="text-[10px] text-muted-foreground uppercase">{isRTL ? 'نسبة الاستخدام الإجمالية' : 'Overall Utilization'}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="p-3 border-emerald-500/20 bg-emerald-500/5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/15">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{calculatedMetrics.fullyUtilizedCount}</p>
                <p className="text-[10px] text-muted-foreground uppercase">{isRTL ? 'مزايا مستخدمة بالكامل' : 'Fully Utilized'}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-3 border-amber-500/20 bg-amber-500/5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/15">
                <TrendingDown className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{calculatedMetrics.underutilizedCount}</p>
                <p className="text-[10px] text-muted-foreground uppercase">{isRTL ? 'مزايا غير مستغلة' : 'Under 50% Used'}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="p-3 border-blue-500/20 bg-blue-500/5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-500/15">
                <Calendar className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">+12%</p>
                <p className="text-[10px] text-muted-foreground uppercase">{isRTL ? 'مقارنة بالشهر الماضي' : 'vs Last Month'}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Utilization by Benefit Type */}
        <ChartContainer 
          title={isRTL ? 'الاستخدام حسب النوع' : 'Utilization by Category'}
          formula={isRTL ? 'المبلغ المستخدم مقابل الإجمالي المخصص لكل فئة' : 'Utilized amount vs total allocation per category'}
          dataSource={isRTL ? 'نظام المزايا' : 'Benefits System'}
        >
          <AnimatedBarChart
            data={utilizationByType}
            layout="horizontal"
            showSecondary={true}
            primaryLabel={isRTL ? 'المستخدم' : 'Utilized'}
            secondaryLabel={isRTL ? 'المخصص' : 'Allocated'}
            formatValue={formatCurrencyShort}
            height={240}
            gradientId="analysisBar"
            showLegend={true}
          />
        </ChartContainer>

        {/* Benefit Comparison Radar */}
        <ChartContainer 
          title={isRTL ? 'مقارنة المزايا' : 'Benefit Comparison'}
          formula={isRTL ? 'استخدامك مقابل متوسط الشركة' : 'Your utilization vs company average'}
          dataSource={isRTL ? 'نظام المزايا' : 'Benefits System'}
        >
          <AnimatedRadarChart
            data={benefitRadarData}
            height={240}
            showSecondary={true}
            primaryLabel={isRTL ? 'استخدامك' : 'Your Usage'}
            secondaryLabel={isRTL ? 'متوسط الشركة' : 'Company Avg'}
            showLegend={true}
          />
        </ChartContainer>
      </div>

      {/* Second Row - Distribution & Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Benefit Distribution Donut */}
        <ChartContainer 
          title={isRTL ? 'توزيع المزايا' : 'Benefits Distribution'}
          formula={isRTL ? 'قيمة كل مزايا كنسبة من الإجمالي' : 'Value of each benefit as % of total'}
          dataSource={isRTL ? 'نظام المزايا' : 'Benefits System'}
        >
          <AnimatedDonutChart
            data={benefitDistribution}
            height={200}
            innerRadius={50}
            showLegend={true}
            formatValue={formatCurrencyShort}
          />
        </ChartContainer>

        {/* Monthly Utilization Trend - spans 2 columns */}
        <div className="lg:col-span-2">
          <ChartContainer 
            title={isRTL ? 'اتجاه الاستخدام الشهري' : 'Monthly Utilization Trend'}
            formula={isRTL ? 'الاستخدام التراكمي خلال العام' : 'Cumulative utilization throughout the year'}
            dataSource={isRTL ? 'نظام المطالبات' : 'Claims System'}
          >
            <StackedAreaChart
              data={monthlyTrend}
              height={200}
              stacks={[
                { key: 'value', label: isRTL ? 'هذا العام' : 'This Year', color: 'hsl(var(--accent))' },
                { key: 'secondaryValue', label: isRTL ? 'العام الماضي' : 'Last Year', color: 'hsl(210, 70%, 60%)' },
              ]}
              formatValue={formatCurrencyShort}
            />
          </ChartContainer>
        </div>
      </div>

      {/* Underutilized Benefits Alert */}
      <Card className="border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-transparent">
        <CardHeader className="pb-2">
          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <div className="p-1.5 rounded-lg bg-amber-500/15">
              <TrendingDown className="w-4 h-4 text-amber-500" />
            </div>
            <CardTitle className="text-sm font-semibold">
              {isRTL ? 'فرص الاستخدام' : 'Utilization Opportunities'}
            </CardTitle>
            <InfoTooltip 
              formula={isRTL ? 'المزايا التي لم يتم استخدامها بالكامل' : 'Benefits that haven\'t been fully utilized yet'}
              dataSource={isRTL ? 'نظام المزايا' : 'Benefits System'}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {underutilizedBenefits.map((benefit, index) => (
              <motion.div
                key={benefit.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-2 rounded-lg bg-card border border-border/50"
              >
                <div className={cn("flex items-center justify-between mb-1", isRTL && "flex-row-reverse")}>
                  <span className="text-xs font-medium truncate">{benefit.name}</span>
                  <span className="text-xs font-bold text-amber-600">{benefit.utilizationPercent}%</span>
                </div>
                <Progress 
                  value={benefit.utilizationPercent} 
                  className="h-1.5 [&>div]:bg-amber-500" 
                />
                <p className={cn("text-[10px] text-muted-foreground mt-1", isRTL && "text-right")}>
                  {formatCurrency(benefit.value - benefit.utilized)} {isRTL ? 'متاح' : 'available'}
                </p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className={cn("flex items-center gap-2 mb-3", isRTL && "flex-row-reverse")}>
            <div className="p-1.5 rounded-lg bg-emerald-500/15">
              <ArrowUpRight className="w-4 h-4 text-emerald-500" />
            </div>
            <h3 className="font-semibold text-sm">{isRTL ? 'أعلى أداء' : 'Top Performers'}</h3>
          </div>
          <ul className="space-y-2">
            <li className={cn("flex items-center justify-between text-sm", isRTL && "flex-row-reverse")}>
              <span>{isRTL ? 'بدل السكن' : 'Housing Allowance'}</span>
              <span className="text-emerald-600 font-semibold">100%</span>
            </li>
            <li className={cn("flex items-center justify-between text-sm", isRTL && "flex-row-reverse")}>
              <span>{isRTL ? 'النقل والتنقل' : 'Transport & Mobility'}</span>
              <span className="text-emerald-600 font-semibold">85%</span>
            </li>
            <li className={cn("flex items-center justify-between text-sm", isRTL && "flex-row-reverse")}>
              <span>{isRTL ? 'بدل التعليم' : 'Education Allowance'}</span>
              <span className="text-emerald-600 font-semibold">70%</span>
            </li>
          </ul>
        </Card>

        <Card className="p-4">
          <div className={cn("flex items-center gap-2 mb-3", isRTL && "flex-row-reverse")}>
            <div className="p-1.5 rounded-lg bg-blue-500/15">
              <DollarSign className="w-4 h-4 text-blue-500" />
            </div>
            <h3 className="font-semibold text-sm">{isRTL ? 'القيمة غير المستخدمة' : 'Unclaimed Value'}</h3>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-foreground">
              {formatCurrency(calculatedMetrics.totalBenefitValue - calculatedMetrics.totalUtilized)}
            </p>
            <p className="text-xs text-muted-foreground">
              {isRTL 
                ? `من أصل ${formatCurrency(calculatedMetrics.totalBenefitValue)} متاح لهذا العام` 
                : `Out of ${formatCurrency(calculatedMetrics.totalBenefitValue)} available this year`}
            </p>
            <Progress 
              value={calculatedMetrics.utilizationPercent} 
              className="h-2 [&>div]:bg-blue-500 mt-2" 
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
