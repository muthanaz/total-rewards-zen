import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { SummaryStatsCard } from '@/components/ui/summary-stats-card';
import { BenefitGuide } from '@/components/employee/BenefitGuide';
import { PageHeader } from '@/components/ui/page-header';
import { StatusStrip } from '@/components/ui/status-strip';
import { PrimaryInsight } from '@/components/ui/primary-insight';
import { AssumptionsPanel } from '@/components/ui/assumptions-panel';
import { 
  Gift, TrendingUp, Target, Award, Star, Calendar, 
  Calculator, CheckCircle, Clock, Users, ChevronRight,
  BarChart3, Trophy, Sparkles, Lightbulb
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { AnimatedBarChart, AnimatedDonutChart, ChartContainer } from '@/components/charts';
import { chartColors, getChartColor } from '@/lib/chartColors';

const MONTHLY_SALARY = 35000;
const TARGET_MONTHS = 2; // Target bonus is 2 months salary

// Bonus assumptions for transparency
const bonusAssumptions = [
  { id: 'salary_basis', label: 'Salary Basis', value: 'Basic Salary Only', source: 'policy' as const },
  { id: 'target_months', label: 'Target Bonus', value: '2 months', source: 'policy' as const },
  { id: 'performance_period', label: 'Performance Period', value: 'Jan - Dec 2025', source: 'system' as const },
  { id: 'payout_timing', label: 'Payout Timing', value: 'March 2026', source: 'policy' as const },
];

// Performance rating scale
const performanceRatings = [
  { rating: 5, label: 'Exceptional', multiplier: 2.0, color: 'hsl(160, 84%, 39%)', description: 'Consistently exceeds all expectations' },
  { rating: 4, label: 'Exceeds Expectations', multiplier: 1.5, color: 'hsl(174, 60%, 45%)', description: 'Regularly surpasses goals' },
  { rating: 3, label: 'Meets Expectations', multiplier: 1.0, color: 'hsl(199, 89%, 48%)', description: 'Achieves all set objectives' },
  { rating: 2, label: 'Needs Improvement', multiplier: 0.5, color: 'hsl(38, 92%, 50%)', description: 'Partially meets expectations' },
  { rating: 1, label: 'Below Expectations', multiplier: 0, color: 'hsl(0, 84%, 60%)', description: 'Does not meet requirements' },
];

// Current employee evaluation data
const currentEvaluation = {
  overallRating: 4,
  categories: [
    { name: 'Goal Achievement', rating: 4.2, weight: 30 },
    { name: 'Quality of Work', rating: 4.5, weight: 25 },
    { name: 'Teamwork', rating: 4.0, weight: 20 },
    { name: 'Innovation', rating: 3.8, weight: 15 },
    { name: 'Leadership', rating: 4.3, weight: 10 },
  ],
  lastReviewDate: '2025-12-15',
  nextReviewDate: '2026-03-15',
  reviewer: 'Sarah Johnson',
};

// Historical bonus data
const bonusHistory = [
  { year: 2025, rating: 4, multiplier: 1.5, baseSalary: 32000, bonus: 96000, paidDate: '2025-03-25' },
  { year: 2024, rating: 3, multiplier: 1.0, baseSalary: 30000, bonus: 60000, paidDate: '2024-03-22' },
  { year: 2023, rating: 4, multiplier: 1.5, baseSalary: 28000, bonus: 84000, paidDate: '2023-03-24' },
  { year: 2022, rating: 3, multiplier: 1.0, baseSalary: 25000, bonus: 50000, paidDate: '2022-03-23' },
];

// Translations
const pageTranslations = {
  en: {
    title: 'Annual Bonus',
    subtitle: 'Performance-based bonus scheme linked to annual evaluation',
    projectedBonus: 'Projected Bonus',
    currentRating: 'Current Rating',
    targetBonus: 'Target Bonus',
    bonusMultiplier: 'Bonus Multiplier',
    formulaProjected: 'Base Salary × Target Months × Multiplier',
    formulaRating: 'Weighted average of evaluation categories',
    formulaTarget: 'Monthly Salary × 2 months',
    formulaMultiplier: 'Based on performance rating (0-200%)',
    dataSourceHR: 'HR Performance System',
    dataSourcePolicy: 'Bonus Policy',
    performanceEvaluation: 'Current Performance Evaluation',
    evaluationCategories: 'Evaluation Categories',
    lastReview: 'Last Review',
    nextReview: 'Next Review',
    reviewer: 'Reviewer',
    bonusHistory: 'Bonus History',
    year: 'Year',
    rating: 'Rating',
    multiplier: 'Multiplier',
    amount: 'Amount',
    paidDate: 'Paid Date',
    bonusCalculator: 'Bonus Calculator',
    selectRating: 'Select Performance Rating',
    yourProjectedBonus: 'Your Projected Bonus',
    bonusBreakdown: 'Bonus Breakdown',
    baseSalary: 'Base Salary',
    targetMonths: 'Target Months',
    performanceMultiplier: 'Performance Multiplier',
    totalBonus: 'Total Bonus',
    policyHighlights: 'Bonus Policy Highlights',
    policy1: 'Performance-based bonus ranging from 0% to 200% of target',
    policy2: 'Target bonus is equivalent to 2 months base salary',
    policy3: 'Annual evaluation completed by March each year',
    policy4: 'Bonus paid in March following evaluation approval',
    policy5: 'Pro-rated for employees joining mid-year',
    policy6: 'Minimum 6 months employment required for eligibility',
    viewFullPolicy: 'View Full Bonus Policy',
    howItWorks: 'How the Bonus Scheme Works',
    step1Title: 'Annual Evaluation',
    step1Desc: 'Your manager evaluates your performance across key categories',
    step2Title: 'Rating Calculated',
    step2Desc: 'Weighted average determines your overall rating (1-5)',
    step3Title: 'Bonus Calculated',
    step3Desc: 'Rating converts to multiplier (0-200%) applied to target bonus',
    step4Title: 'Payout',
    step4Desc: 'Bonus paid in March after HR and Finance approval',
    bonusTrend: 'Bonus Trend Over Years',
    ratingDistribution: 'Your Rating vs Company Average',
    yourRating: 'Your Rating',
    companyAvg: 'Company Avg',
    exceptional: 'Exceptional',
    exceeds: 'Exceeds',
    meets: 'Meets',
    needs: 'Needs Improvement',
    below: 'Below',
  },
  ar: {
    title: 'المكافأة السنوية',
    subtitle: 'نظام مكافآت قائم على الأداء مرتبط بالتقييم السنوي',
    projectedBonus: 'المكافأة المتوقعة',
    currentRating: 'التقييم الحالي',
    targetBonus: 'المكافأة المستهدفة',
    bonusMultiplier: 'مضاعف المكافأة',
    formulaProjected: 'الراتب الأساسي × الأشهر المستهدفة × المضاعف',
    formulaRating: 'المتوسط المرجح لفئات التقييم',
    formulaTarget: 'الراتب الشهري × شهرين',
    formulaMultiplier: 'بناءً على تقييم الأداء (٠-٢٠٠٪)',
    dataSourceHR: 'نظام الأداء في الموارد البشرية',
    dataSourcePolicy: 'سياسة المكافآت',
    performanceEvaluation: 'تقييم الأداء الحالي',
    evaluationCategories: 'فئات التقييم',
    lastReview: 'آخر مراجعة',
    nextReview: 'المراجعة القادمة',
    reviewer: 'المراجع',
    bonusHistory: 'سجل المكافآت',
    year: 'السنة',
    rating: 'التقييم',
    multiplier: 'المضاعف',
    amount: 'المبلغ',
    paidDate: 'تاريخ الدفع',
    bonusCalculator: 'حاسبة المكافآت',
    selectRating: 'اختر تقييم الأداء',
    yourProjectedBonus: 'مكافأتك المتوقعة',
    bonusBreakdown: 'تفصيل المكافأة',
    baseSalary: 'الراتب الأساسي',
    targetMonths: 'الأشهر المستهدفة',
    performanceMultiplier: 'مضاعف الأداء',
    totalBonus: 'إجمالي المكافأة',
    policyHighlights: 'أبرز بنود سياسة المكافآت',
    policy1: 'مكافأة قائمة على الأداء تتراوح من ٠٪ إلى ٢٠٠٪ من الهدف',
    policy2: 'المكافأة المستهدفة تعادل راتب شهرين أساسي',
    policy3: 'التقييم السنوي يكتمل بحلول مارس من كل عام',
    policy4: 'تُدفع المكافأة في مارس بعد موافقة التقييم',
    policy5: 'تُحسب بالتناسب للموظفين الذين انضموا منتصف العام',
    policy6: 'يشترط الحد الأدنى ٦ أشهر توظيف للأهلية',
    viewFullPolicy: 'عرض سياسة المكافآت الكاملة',
    howItWorks: 'كيف يعمل نظام المكافآت',
    step1Title: 'التقييم السنوي',
    step1Desc: 'يقيّم مديرك أداءك عبر الفئات الرئيسية',
    step2Title: 'حساب التقييم',
    step2Desc: 'المتوسط المرجح يحدد تقييمك الإجمالي (١-٥)',
    step3Title: 'حساب المكافأة',
    step3Desc: 'التقييم يتحول إلى مضاعف (٠-٢٠٠٪) يُطبق على المكافأة المستهدفة',
    step4Title: 'الدفع',
    step4Desc: 'تُدفع المكافأة في مارس بعد موافقة الموارد البشرية والمالية',
    bonusTrend: 'اتجاه المكافآت عبر السنوات',
    ratingDistribution: 'تقييمك مقابل متوسط الشركة',
    yourRating: 'تقييمك',
    companyAvg: 'متوسط الشركة',
    exceptional: 'استثنائي',
    exceeds: 'يتجاوز',
    meets: 'يحقق',
    needs: 'يحتاج تحسين',
    below: 'أقل من',
  },
};

export default function BonusPage() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = pageTranslations[language];
  
  const [selectedRating, setSelectedRating] = useState([currentEvaluation.overallRating]);
  
  const formatCurrency = (value: number) => `AED ${value.toLocaleString()}`;
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString(isRTL ? 'ar-AE' : 'en-AE', { year: 'numeric', month: 'short', day: 'numeric' });

  // Calculate projected bonus based on current rating
  const currentRatingData = performanceRatings.find(r => r.rating === currentEvaluation.overallRating);
  const projectedBonus = Math.round(MONTHLY_SALARY * TARGET_MONTHS * (currentRatingData?.multiplier || 1));
  const targetBonus = MONTHLY_SALARY * TARGET_MONTHS;

  // Calculator bonus
  const calculatorRating = performanceRatings.find(r => r.rating === selectedRating[0]);
  const calculatedBonus = Math.round(MONTHLY_SALARY * TARGET_MONTHS * (calculatorRating?.multiplier || 1));

  // Chart data for bonus history
  const bonusHistoryChartData = bonusHistory.map(b => ({
    name: b.year.toString(),
    value: b.bonus,
    secondaryValue: b.baseSalary * 2, // Target bonus for comparison
  }));

  // Rating comparison chart data
  const ratingComparisonData = currentEvaluation.categories.map(cat => ({
    name: cat.name,
    value: cat.rating * 20, // Convert to percentage (0-100)
    secondaryValue: 70, // Company average (3.5 out of 5 = 70%)
  }));

  // Donut chart for current rating
  const ratingDonutData = [
    { name: t.yourRating, value: currentEvaluation.overallRating * 20, color: chartColors.primary },
    { name: t.companyAvg, value: (5 - currentEvaluation.overallRating) * 20, color: 'hsl(220 14% 85%)' },
  ];

  return (
    <div className={cn("space-y-6 animate-fade-in", isRTL && "text-right")}>
      {/* Page Header */}
      <PageHeader
        title={t.title}
        titleAr={pageTranslations.ar.title}
        subtitle={t.subtitle}
        subtitleAr={pageTranslations.ar.subtitle}
        icon={Gift}
      />

      {/* Status Strip */}
      <StatusStrip
        confidence={currentEvaluation.overallRating >= 3 ? 'high' : 'medium'}
        lastUpdated={new Date(currentEvaluation.lastReviewDate)}
        dataSource="Performance System"
        dataSourceAr="نظام الأداء"
      />

      {/* Primary Insight */}
      <PrimaryInsight
        icon={Lightbulb}
        title={isRTL ? 'مكافأتك المتوقعة' : 'Your Projected Bonus'}
        titleAr="مكافأتك المتوقعة"
        value={formatCurrency(projectedBonus)}
        subtitle={isRTL 
          ? `بناءً على تقييمك الحالي (${currentEvaluation.overallRating}/5) ومضاعف ${(currentRatingData?.multiplier || 1) * 100}%`
          : `Based on your current rating (${currentEvaluation.overallRating}/5) and ${(currentRatingData?.multiplier || 1) * 100}% multiplier`}
        subtitleAr={`بناءً على تقييمك الحالي (${currentEvaluation.overallRating}/5) ومضاعف ${(currentRatingData?.multiplier || 1) * 100}%`}
        trend={{
          value: currentEvaluation.overallRating >= 4 ? 50 : currentEvaluation.overallRating >= 3 ? 0 : -50,
          label: 'vs target',
          labelAr: 'مقابل الهدف',
          direction: currentEvaluation.overallRating >= 4 ? 'up' : currentEvaluation.overallRating >= 3 ? 'neutral' : 'down'
        }}
        formula={t.formulaProjected}
        formulaAr={pageTranslations.ar.formulaProjected}
        variant={currentEvaluation.overallRating >= 4 ? 'success' : 'default'}
      />

      {/* Assumptions Panel */}
      <AssumptionsPanel
        title={isRTL ? 'افتراضات حساب المكافأة' : 'Bonus Calculation Assumptions'}
        titleAr="افتراضات حساب المكافأة"
        assumptions={bonusAssumptions}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryStatsCard
          icon={Gift}
          value={formatCurrency(projectedBonus)}
          label={t.projectedBonus}
          formula={t.formulaProjected}
          dataSource={t.dataSourcePolicy}
          variant="primary"
        />
        <SummaryStatsCard
          icon={Star}
          value={`${currentEvaluation.overallRating}/5`}
          label={t.currentRating}
          formula={t.formulaRating}
          dataSource={t.dataSourceHR}
          variant="utilized"
        />
        <SummaryStatsCard
          icon={Target}
          value={formatCurrency(targetBonus)}
          label={t.targetBonus}
          formula={t.formulaTarget}
          dataSource={t.dataSourcePolicy}
          variant="remaining"
        />
        <SummaryStatsCard
          icon={TrendingUp}
          value={`${(currentRatingData?.multiplier || 1) * 100}%`}
          label={t.bonusMultiplier}
          formula={t.formulaMultiplier}
          dataSource={t.dataSourceHR}
          variant="info"
        />
      </div>

      {/* Comprehensive Benefit Guide */}
      <BenefitGuide
        icon={Gift}
        title={t.howItWorks}
        steps={[
          { title: t.step1Title, description: t.step1Desc },
          { title: t.step2Title, description: t.step2Desc, highlight: '1-5' },
          { title: t.step3Title, description: t.step3Desc, highlight: '0-200%' },
        ]}
        policyPoints={[
          t.policy1,
          t.policy2,
          t.policy3,
          t.policy4,
          t.policy5,
          t.policy6,
        ]}
        policyButtonText={t.viewFullPolicy}
      />

      {/* Performance Evaluation & Rating */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Current Evaluation */}
        <Card>
          <CardHeader className="pb-3">
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <CardTitle className={cn(
                "text-base font-display flex items-center gap-2",
                isRTL && "flex-row-reverse"
              )}>
                <Award className="w-5 h-5 text-accent" />
                {t.performanceEvaluation}
              </CardTitle>
              <Badge 
                variant="outline" 
                className="text-sm px-3 py-1"
                style={{ borderColor: currentRatingData?.color, color: currentRatingData?.color }}
              >
                {currentRatingData?.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Overall Rating Display */}
            <div className={cn(
              "flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-accent/10 to-transparent border border-accent/20",
              isRTL && "flex-row-reverse"
            )}>
              <div>
                <p className="text-sm text-muted-foreground">{t.currentRating}</p>
                <div className={cn("flex items-center gap-2 mt-1", isRTL && "flex-row-reverse")}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "w-5 h-5",
                        star <= currentEvaluation.overallRating
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/30"
                      )}
                    />
                  ))}
                </div>
              </div>
              <div className="text-3xl font-bold text-accent">{currentEvaluation.overallRating}/5</div>
            </div>

            {/* Category Breakdown */}
            <div className="space-y-3">
              <p className="text-sm font-medium">{t.evaluationCategories}</p>
              {currentEvaluation.categories.map((cat) => (
                <div key={cat.name} className="space-y-1">
                  <div className={cn("flex justify-between text-sm", isRTL && "flex-row-reverse")}>
                    <span>{cat.name}</span>
                    <span className="font-medium">{cat.rating.toFixed(1)}/5 ({cat.weight}%)</span>
                  </div>
                  <Progress 
                    value={cat.rating * 20} 
                    className="h-2 [&>div]:bg-accent"
                  />
                </div>
              ))}
            </div>

            {/* Review Info */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border/50">
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">{t.lastReview}</p>
                <p className="text-sm font-medium mt-1">{formatDate(currentEvaluation.lastReviewDate)}</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">{t.nextReview}</p>
                <p className="text-sm font-medium mt-1">{formatDate(currentEvaluation.nextReviewDate)}</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">{t.reviewer}</p>
                <p className="text-sm font-medium mt-1">{currentEvaluation.reviewer}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bonus Calculator */}
        <Card className="bg-accent/5 border-accent/20">
          <CardHeader>
            <CardTitle className={cn(
              "text-base font-display flex items-center gap-2",
              isRTL && "flex-row-reverse"
            )}>
              <Calculator className="w-5 h-5 text-accent" />
              {t.bonusCalculator}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Rating Selector */}
            <div className="space-y-4">
              <div className={cn("flex justify-between items-center", isRTL && "flex-row-reverse")}>
                <span className="text-sm font-medium">{t.selectRating}</span>
                <Badge 
                  variant="outline" 
                  style={{ borderColor: calculatorRating?.color, color: calculatorRating?.color }}
                >
                  {calculatorRating?.label}
                </Badge>
              </div>
              <Slider
                value={selectedRating}
                onValueChange={setSelectedRating}
                min={1}
                max={5}
                step={1}
                className="py-4"
              />
              <div className={cn("flex justify-between text-xs text-muted-foreground", isRTL && "flex-row-reverse")}>
                <span>{t.below}</span>
                <span>{t.needs}</span>
                <span>{t.meets}</span>
                <span>{t.exceeds}</span>
                <span>{t.exceptional}</span>
              </div>
            </div>

            {/* Calculated Bonus */}
            <div className="p-4 rounded-lg bg-card border border-accent/30 text-center">
              <p className="text-sm text-muted-foreground mb-2">{t.yourProjectedBonus}</p>
              <p className="text-3xl font-bold text-accent">{formatCurrency(calculatedBonus)}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {(calculatorRating?.multiplier || 0) * 100}% {t.performanceMultiplier.toLowerCase()}
              </p>
            </div>

            {/* Breakdown */}
            <div className="space-y-2 pt-4 border-t border-border/50">
              <p className="text-sm font-medium mb-3">{t.bonusBreakdown}</p>
              <div className={cn("flex justify-between text-sm", isRTL && "flex-row-reverse")}>
                <span className="text-muted-foreground">{t.baseSalary}</span>
                <span>{formatCurrency(MONTHLY_SALARY)}</span>
              </div>
              <div className={cn("flex justify-between text-sm", isRTL && "flex-row-reverse")}>
                <span className="text-muted-foreground">{t.targetMonths}</span>
                <span>× {TARGET_MONTHS}</span>
              </div>
              <div className={cn("flex justify-between text-sm", isRTL && "flex-row-reverse")}>
                <span className="text-muted-foreground">{t.performanceMultiplier}</span>
                <span>× {(calculatorRating?.multiplier || 0) * 100}%</span>
              </div>
              <div className={cn("flex justify-between text-sm font-bold pt-2 border-t border-border/50", isRTL && "flex-row-reverse")}>
                <span>{t.totalBonus}</span>
                <span className="text-accent">{formatCurrency(calculatedBonus)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bonus History Chart */}
        <ChartContainer title={t.bonusTrend}>
          <AnimatedBarChart
            data={bonusHistoryChartData}
            showSecondary={true}
            primaryLabel={t.amount}
            secondaryLabel={t.targetBonus}
            formatValue={(v) => `AED ${(v / 1000).toFixed(0)}K`}
            height={250}
          />
        </ChartContainer>

        {/* Rating Comparison Chart */}
        <ChartContainer title={t.ratingDistribution}>
          <AnimatedBarChart
            data={ratingComparisonData}
            showSecondary={true}
            primaryLabel={t.yourRating}
            secondaryLabel={t.companyAvg}
            formatValue={(v) => `${v}%`}
            height={250}
          />
        </ChartContainer>
      </div>

      {/* Bonus History Table */}
      <Card>
        <CardHeader>
          <CardTitle className={cn(
            "text-base font-display flex items-center gap-2",
            isRTL && "flex-row-reverse"
          )}>
            <Trophy className="w-5 h-5 text-accent" />
            {t.bonusHistory}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className={cn("py-3 px-2 font-medium", isRTL ? "text-right" : "text-left")}>{t.year}</th>
                  <th className={cn("py-3 px-2 font-medium", isRTL ? "text-left" : "text-right")}>{t.rating}</th>
                  <th className={cn("py-3 px-2 font-medium", isRTL ? "text-left" : "text-right")}>{t.multiplier}</th>
                  <th className={cn("py-3 px-2 font-medium", isRTL ? "text-left" : "text-right")}>{t.amount}</th>
                  <th className={cn("py-3 px-2 font-medium", isRTL ? "text-left" : "text-right")}>{t.paidDate}</th>
                </tr>
              </thead>
              <tbody>
                {bonusHistory.map((bonus) => {
                  const ratingInfo = performanceRatings.find(r => r.rating === bonus.rating);
                  return (
                    <tr key={bonus.year} className="border-b border-border/50 hover:bg-muted/30">
                      <td className={cn("py-3 px-2 font-medium", isRTL ? "text-right" : "text-left")}>{bonus.year}</td>
                      <td className={cn("py-3 px-2", isRTL ? "text-left" : "text-right")}>
                        <Badge 
                          variant="outline" 
                          className="text-xs"
                          style={{ borderColor: ratingInfo?.color, color: ratingInfo?.color }}
                        >
                          {bonus.rating}/5
                        </Badge>
                      </td>
                      <td className={cn("py-3 px-2", isRTL ? "text-left" : "text-right")}>{bonus.multiplier * 100}%</td>
                      <td className={cn("py-3 px-2 font-semibold text-accent", isRTL ? "text-left" : "text-right")}>{formatCurrency(bonus.bonus)}</td>
                      <td className={cn("py-3 px-2 text-muted-foreground", isRTL ? "text-left" : "text-right")}>{formatDate(bonus.paidDate)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Performance Rating Scale */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display">{t.selectRating}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-5 gap-3">
            {performanceRatings.map((rating) => (
              <div 
                key={rating.rating}
                className={cn(
                  "p-3 rounded-lg border transition-all",
                  currentEvaluation.overallRating === rating.rating 
                    ? "border-accent bg-accent/10" 
                    : "border-border/50 hover:border-border"
                )}
              >
                <div className={cn("flex items-center gap-2 mb-2", isRTL && "flex-row-reverse")}>
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: rating.color }}
                  >
                    {rating.rating}
                  </div>
                  <span className="font-medium text-sm">{rating.label}</span>
                </div>
                <p className="text-xs text-muted-foreground">{rating.description}</p>
                <p className="text-xs font-medium mt-2" style={{ color: rating.color }}>
                  {rating.multiplier * 100}% {t.bonusMultiplier.toLowerCase()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Policy Highlights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display">{t.policyHighlights}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
            {[t.policy1, t.policy2, t.policy3, t.policy4, t.policy5, t.policy6].map((policy, index) => (
              <li key={index} className={cn(
                "flex items-start gap-2",
                isRTL && "flex-row-reverse text-right"
              )}>
                <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
                {policy}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

    </div>
  );
}
