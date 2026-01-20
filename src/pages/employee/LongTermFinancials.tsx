import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { SummaryStatsCard } from '@/components/ui/summary-stats-card';
import { PolicyHighlightsCard } from '@/components/employee/PolicyHighlightsCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Gift, TrendingUp, Target, Award, Star, Calendar, 
  CheckCircle, Clock, Briefcase, DollarSign, Gem, Wallet,
  Calculator, PiggyBank
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn, formatCurrencyAED, formatPercent } from '@/lib/utils';
import { BenefitCrossLinks } from '@/components/employee/BenefitCrossLinks';
import { AnimatedBarChart } from '@/components/charts';

// Constants
const MONTHLY_SALARY = 35000;
const YEARS_OF_SERVICE = 3.5;
const TOTAL_SHARES = 5000;
const VESTED_SHARES = 2500;
const SHARE_PRICE = 12.50;

// Performance rating for bonus
const performanceRatings = [
  { rating: 5, label: 'Exceptional', multiplier: 2.0 },
  { rating: 4, label: 'Exceeds', multiplier: 1.5 },
  { rating: 3, label: 'Meets', multiplier: 1.0 },
  { rating: 2, label: 'Needs Improvement', multiplier: 0.5 },
  { rating: 1, label: 'Below', multiplier: 0 },
];

// Current evaluation
const currentRating = 4;
const currentRatingData = performanceRatings.find(r => r.rating === currentRating);

// Gratuity calculation (UAE Labor Law)
const calculateGratuity = (yearsOfService: number, basicSalary: number) => {
  if (yearsOfService < 1) return 0;
  
  let gratuity = 0;
  if (yearsOfService <= 5) {
    gratuity = (basicSalary / 30) * 21 * yearsOfService;
  } else {
    gratuity = (basicSalary / 30) * 21 * 5; // First 5 years
    gratuity += (basicSalary / 30) * 30 * (yearsOfService - 5); // Additional years
  }
  return Math.round(gratuity);
};

// Bonus history
const bonusHistory = [
  { year: 2025, rating: 4, amount: 96000, status: 'projected' },
  { year: 2024, rating: 3, amount: 60000, status: 'paid' },
  { year: 2023, rating: 4, amount: 84000, status: 'paid' },
];

// Vesting schedule
const vestingSchedule = [
  { date: 'Jan 2024', shares: 1250, status: 'vested' },
  { date: 'Jul 2024', shares: 1250, status: 'vested' },
  { date: 'Jan 2025', shares: 1250, status: 'upcoming' },
  { date: 'Jul 2025', shares: 1250, status: 'future' },
];

// Translations
const pageTranslations = {
  en: {
    title: 'Long-Term Financials',
    subtitle: 'Your bonus, gratuity, savings, and equity compensation',
    projectedBonus: 'Projected Bonus',
    gratuityAccrued: 'Gratuity Accrued',
    equityValue: 'Equity Value',
    totalLongTerm: 'Total Long-Term',
    formulaBonus: 'Base × 2 months × multiplier',
    formulaGratuity: 'UAE Labor Law calculation',
    formulaEquity: 'Vested shares × price',
    formulaTotal: 'Sum of all components',
    tabBonus: 'Bonus',
    tabGratuity: 'Gratuity',
    tabSavings: 'Savings',
    tabEquity: 'Equity',
    currentRating: 'Current Rating',
    nextReview: 'Next Review',
    bonusHistory: 'Bonus History',
    yearsOfService: 'Years of Service',
    gratuityEstimate: 'Estimated Gratuity',
    vestedShares: 'Vested Shares',
    vestingSchedule: 'Vesting Schedule',
    savingsCalculator: 'Savings Calculator',
    policyBonus: [
      'Target bonus: 2 months base salary',
      'Performance multiplier: 0% - 200%',
      'Evaluation completed by March',
      'Payout in March after approval',
      'Pro-rated for mid-year joiners',
      'Minimum 6 months for eligibility',
    ],
    policyGratuity: [
      '21 days per year (first 5 years)',
      '30 days per year (after 5 years)',
      'Based on basic salary only',
      'Paid upon resignation or termination',
      'Pro-rated for partial years',
      'Tax-free under UAE law',
    ],
    policySavings: [
      '5% employer match on contributions',
      'Multiple fund options available',
      'Flexible contribution amounts',
      'Quarterly performance reports',
      'Early withdrawal penalties apply',
      'Tax-advantaged savings vehicle',
    ],
    policyEquity: [
      '4-year vesting with 1-year cliff',
      'Quarterly vesting after cliff',
      '90-day exercise window on exit',
      'Value realized at liquidity event',
      'Subject to board approval',
      'Consult tax advisor for implications',
    ],
  },
  ar: {
    title: 'الماليات طويلة الأجل',
    subtitle: 'المكافأة والمكافأة نهاية الخدمة والادخار وحقوق الملكية',
    projectedBonus: 'المكافأة المتوقعة',
    gratuityAccrued: 'مكافأة نهاية الخدمة المستحقة',
    equityValue: 'قيمة حقوق الملكية',
    totalLongTerm: 'إجمالي طويل الأجل',
    formulaBonus: 'الأساسي × شهرين × المضاعف',
    formulaGratuity: 'حسب قانون العمل الإماراتي',
    formulaEquity: 'الأسهم المكتسبة × السعر',
    formulaTotal: 'مجموع جميع المكونات',
    tabBonus: 'المكافأة',
    tabGratuity: 'نهاية الخدمة',
    tabSavings: 'الادخار',
    tabEquity: 'حقوق الملكية',
    currentRating: 'التقييم الحالي',
    nextReview: 'المراجعة القادمة',
    bonusHistory: 'سجل المكافآت',
    yearsOfService: 'سنوات الخدمة',
    gratuityEstimate: 'تقدير مكافأة نهاية الخدمة',
    vestedShares: 'الأسهم المكتسبة',
    vestingSchedule: 'جدول الاستحقاق',
    savingsCalculator: 'حاسبة الادخار',
    policyBonus: [
      'المكافأة المستهدفة: شهرين راتب أساسي',
      'مضاعف الأداء: ٠٪ - ٢٠٠٪',
      'يكتمل التقييم بحلول مارس',
      'الصرف في مارس بعد الموافقة',
      'تحسب نسبياً للمنضمين منتصف العام',
      'الحد الأدنى ٦ أشهر للأهلية',
    ],
    policyGratuity: [
      '٢١ يوماً لكل سنة (أول ٥ سنوات)',
      '٣٠ يوماً لكل سنة (بعد ٥ سنوات)',
      'بناءً على الراتب الأساسي فقط',
      'تُدفع عند الاستقالة أو الإنهاء',
      'تحسب نسبياً للسنوات الجزئية',
      'معفاة من الضرائب بموجب قانون الإمارات',
    ],
    policySavings: [
      'مساهمة صاحب العمل ٥٪',
      'خيارات صناديق متعددة',
      'مبالغ مساهمة مرنة',
      'تقارير أداء ربع سنوية',
      'غرامات السحب المبكر تنطبق',
      'وسيلة ادخار ذات مزايا ضريبية',
    ],
    policyEquity: [
      'استحقاق على ٤ سنوات مع فترة انتظار سنة',
      'استحقاق ربع سنوي بعد فترة الانتظار',
      'نافذة ممارسة ٩٠ يوماً عند المغادرة',
      'تتحقق القيمة عند حدث السيولة',
      'خاضع لموافقة مجلس الإدارة',
      'استشر مستشار ضريبي للآثار',
    ],
  },
};

export default function LongTermFinancialsPage() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = pageTranslations[language];
  
  const [activeTab, setActiveTab] = useState('bonus');
  
  // Savings calculator state
  const [monthlyContribution, setMonthlyContribution] = useState(3000);
  const [yearsToSave, setYearsToSave] = useState([10]);
  const [expectedReturn, setExpectedReturn] = useState([6]);

  const formatCurrency = (value: number) => formatCurrencyAED(value, { abbreviate: false });

  // Calculations
  const projectedBonus = Math.round(MONTHLY_SALARY * 2 * (currentRatingData?.multiplier || 1));
  const gratuityAccrued = calculateGratuity(YEARS_OF_SERVICE, MONTHLY_SALARY);
  const vestedValue = VESTED_SHARES * SHARE_PRICE;
  const totalLongTerm = projectedBonus + gratuityAccrued + vestedValue;
  const vestedPercent = Math.round((VESTED_SHARES / TOTAL_SHARES) * 100);

  // Savings calculation
  const calculateSavings = () => {
    const r = expectedReturn[0] / 100 / 12; // Monthly rate
    const n = yearsToSave[0] * 12; // Total months
    const P = monthlyContribution;
    const employerMatch = P * 0.05; // 5% employer match
    const totalContribution = P + employerMatch;
    
    // Future value of annuity formula
    const futureValue = totalContribution * ((Math.pow(1 + r, n) - 1) / r);
    const totalContributed = totalContribution * n;
    const interestEarned = futureValue - totalContributed;
    
    return {
      futureValue: Math.round(futureValue),
      totalContributed: Math.round(totalContributed),
      interestEarned: Math.round(interestEarned),
      monthlyWithMatch: Math.round(totalContribution),
    };
  };

  const savingsResult = calculateSavings();

  const bonusChartData = bonusHistory.map(b => ({
    name: b.year.toString(),
    value: b.amount,
  }));

  return (
    <div className={cn("space-y-6 animate-fade-in", isRTL && "text-right")}>
      {/* Header */}
      <div>
        <h1 className={cn(
          "text-2xl font-display font-bold text-foreground flex items-center gap-3",
          isRTL && "flex-row-reverse"
        )}>
          <Wallet className="w-7 h-7 text-accent" />
          {t.title}
        </h1>
        <p className="text-muted-foreground mt-1">{t.subtitle}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryStatsCard
          icon={Gift}
          value={formatCurrency(projectedBonus)}
          label={t.projectedBonus}
          formula={t.formulaBonus}
          dataSource="HR Policy"
          variant="primary"
        />
        <SummaryStatsCard
          icon={Briefcase}
          value={formatCurrency(gratuityAccrued)}
          label={t.gratuityAccrued}
          formula={t.formulaGratuity}
          dataSource="Labor Law"
          variant="utilized"
        />
        <SummaryStatsCard
          icon={Gem}
          value={formatCurrency(vestedValue)}
          label={t.equityValue}
          formula={t.formulaEquity}
          dataSource="Equity System"
          variant="remaining"
        />
        <SummaryStatsCard
          icon={TrendingUp}
          value={formatCurrency(totalLongTerm)}
          label={t.totalLongTerm}
          formula={t.formulaTotal}
          dataSource="Combined"
          variant="info"
        />
      </div>

      {/* Tabs for different components */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="bonus" className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Gift className="w-4 h-4" />
            <span className="hidden sm:inline">{t.tabBonus}</span>
          </TabsTrigger>
          <TabsTrigger value="gratuity" className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Briefcase className="w-4 h-4" />
            <span className="hidden sm:inline">{t.tabGratuity}</span>
          </TabsTrigger>
          <TabsTrigger value="savings" className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <PiggyBank className="w-4 h-4" />
            <span className="hidden sm:inline">{t.tabSavings}</span>
          </TabsTrigger>
          <TabsTrigger value="equity" className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Gem className="w-4 h-4" />
            <span className="hidden sm:inline">{t.tabEquity}</span>
          </TabsTrigger>
        </TabsList>

        {/* Bonus Tab */}
        <TabsContent value="bonus" className="space-y-4 mt-4">
          {/* Summary Cards for Bonus */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SummaryStatsCard
              icon={Gift}
              value={formatCurrency(projectedBonus)}
              label="Projected Bonus"
              formula="Base × 2 × multiplier"
              dataSource="HR Policy"
              variant="primary"
            />
            <SummaryStatsCard
              icon={Star}
              value={`${currentRating}/5`}
              label="Performance Rating"
              formula="Weighted evaluation"
              dataSource="HR System"
              variant="utilized"
            />
            <SummaryStatsCard
              icon={Target}
              value={formatCurrency(MONTHLY_SALARY * 2)}
              label="Target Bonus"
              formula="2 months salary"
              dataSource="Policy"
              variant="remaining"
            />
            <SummaryStatsCard
              icon={TrendingUp}
              value={`${(currentRatingData?.multiplier || 1) * 100}%`}
              label="Multiplier"
              formula="Based on rating"
              dataSource="HR System"
              variant="info"
            />
          </div>

          <PolicyHighlightsCard
            title={language === 'ar' ? 'سياسة المكافآت' : 'Bonus Policy Highlights'}
            policies={t.policyBonus}
            category="bonus"
            showClaimButton={false}
            policyLabel={language === 'ar' ? 'السياسة الكاملة' : 'View Full Policy'}
            isRTL={isRTL}
          />

          <div className="grid lg:grid-cols-2 gap-4">
            {/* Current Rating */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className={cn("text-base font-display flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <Award className="w-5 h-5 text-accent" />
                  {t.currentRating}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={cn(
                  "flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-accent/10 to-transparent border border-accent/20",
                  isRTL && "flex-row-reverse"
                )}>
                  <div>
                    <div className={cn("flex items-center gap-2 mt-1", isRTL && "flex-row-reverse")}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            "w-5 h-5",
                            star <= currentRating
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/30"
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {currentRatingData?.label} • {(currentRatingData?.multiplier || 1) * 100}% multiplier
                    </p>
                  </div>
                  <div className="text-3xl font-bold text-accent">{currentRating}/5</div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-xs text-muted-foreground">{t.nextReview}</p>
                    <p className="text-sm font-medium mt-1">Mar 2026</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-xs text-muted-foreground">{t.projectedBonus}</p>
                    <p className="text-sm font-bold text-accent mt-1">{formatCurrency(projectedBonus)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bonus History Chart */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-display">{t.bonusHistory}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[180px]">
                  <AnimatedBarChart 
                    data={bonusChartData} 
                    height={180}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Gratuity Tab */}
        <TabsContent value="gratuity" className="space-y-4 mt-4">
          {/* Summary Cards for Gratuity */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SummaryStatsCard
              icon={Briefcase}
              value={formatCurrency(gratuityAccrued)}
              label="Accrued Gratuity"
              formula="UAE Labor Law"
              dataSource="System"
              variant="primary"
            />
            <SummaryStatsCard
              icon={Clock}
              value={`${YEARS_OF_SERVICE} yrs`}
              label="Years of Service"
              formula="Employment date to now"
              dataSource="HR System"
              variant="utilized"
            />
            <SummaryStatsCard
              icon={DollarSign}
              value={formatCurrency(MONTHLY_SALARY)}
              label="Basic Salary"
              formula="Monthly base"
              dataSource="Payroll"
              variant="remaining"
            />
            <SummaryStatsCard
              icon={Calendar}
              value="21 days/yr"
              label="Accrual Rate"
              formula="First 5 years"
              dataSource="Labor Law"
              variant="info"
            />
          </div>

          <PolicyHighlightsCard
            title={language === 'ar' ? 'سياسة نهاية الخدمة' : 'End of Service Policy Highlights'}
            policies={t.policyGratuity}
            category="gratuity"
            showClaimButton={false}
            policyLabel={language === 'ar' ? 'قانون العمل' : 'View Labor Law'}
            isRTL={isRTL}
          />

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className={cn("text-base font-display flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <Calculator className="w-5 h-5 text-accent" />
                {t.gratuityEstimate}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <Clock className="w-6 h-6 text-accent mx-auto mb-2" />
                  <p className="text-2xl font-bold">{YEARS_OF_SERVICE}</p>
                  <p className="text-xs text-muted-foreground">{t.yearsOfService}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <DollarSign className="w-6 h-6 text-accent mx-auto mb-2" />
                  <p className="text-2xl font-bold">{formatCurrency(MONTHLY_SALARY)}</p>
                  <p className="text-xs text-muted-foreground">Basic Salary</p>
                </div>
                <div className="p-4 rounded-lg bg-accent/10 text-center border border-accent/20">
                  <Briefcase className="w-6 h-6 text-accent mx-auto mb-2" />
                  <p className="text-2xl font-bold text-accent">{formatCurrency(gratuityAccrued)}</p>
                  <p className="text-xs text-muted-foreground">{t.gratuityEstimate}</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                <p className="text-sm text-muted-foreground">
                  <strong>Calculation:</strong> {YEARS_OF_SERVICE} years × 21 days × (AED {MONTHLY_SALARY.toLocaleString()} / 30) = <strong className="text-foreground">{formatCurrency(gratuityAccrued)}</strong>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Savings Tab */}
        <TabsContent value="savings" className="space-y-4 mt-4">
          {/* Summary Cards for Savings */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SummaryStatsCard
              icon={PiggyBank}
              value={formatCurrency(savingsResult.futureValue)}
              label="Projected Savings"
              formula="Based on inputs"
              dataSource="Calculator"
              variant="primary"
            />
            <SummaryStatsCard
              icon={DollarSign}
              value={formatCurrency(savingsResult.monthlyWithMatch)}
              label="Monthly (with match)"
              formula="Your + 5% employer"
              dataSource="Policy"
              variant="utilized"
            />
            <SummaryStatsCard
              icon={TrendingUp}
              value={formatCurrency(savingsResult.interestEarned)}
              label="Interest Earned"
              formula="Compound growth"
              dataSource="Calculator"
              variant="remaining"
            />
            <SummaryStatsCard
              icon={Target}
              value={`${yearsToSave[0]} yrs`}
              label="Investment Period"
              formula="Selected duration"
              dataSource="Your Input"
              variant="info"
            />
          </div>

          <PolicyHighlightsCard
            title={language === 'ar' ? 'سياسة الادخار' : 'Savings Policy Highlights'}
            policies={t.policySavings}
            category="savings"
            showClaimButton={false}
            policyLabel={language === 'ar' ? 'السياسة الكاملة' : 'View Full Policy'}
            isRTL={isRTL}
          />

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className={cn("text-base font-display flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <Calculator className="w-5 h-5 text-accent" />
                {t.savingsCalculator}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Input Controls */}
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="contribution">Monthly Contribution (AED)</Label>
                    <Input
                      id="contribution"
                      type="number"
                      value={monthlyContribution}
                      onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                      min={500}
                      max={50000}
                      step={500}
                    />
                    <p className="text-xs text-muted-foreground">
                      Employer will match 5%: +{formatCurrency(monthlyContribution * 0.05)}/month
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>Investment Period</Label>
                      <span className="text-sm font-medium">{yearsToSave[0]} years</span>
                    </div>
                    <Slider
                      value={yearsToSave}
                      onValueChange={setYearsToSave}
                      min={1}
                      max={30}
                      step={1}
                      className="py-4"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>Expected Annual Return</Label>
                      <span className="text-sm font-medium">{expectedReturn[0]}%</span>
                    </div>
                    <Slider
                      value={expectedReturn}
                      onValueChange={setExpectedReturn}
                      min={1}
                      max={12}
                      step={0.5}
                      className="py-4"
                    />
                  </div>
                </div>

                {/* Results */}
                <div className="space-y-4">
                  <div className="p-6 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
                    <p className="text-sm text-muted-foreground mb-2">Projected Value</p>
                    <p className="text-4xl font-bold text-accent">{formatCurrency(savingsResult.futureValue)}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                      <p className="text-xs text-muted-foreground">Total Contributed</p>
                      <p className="text-lg font-bold mt-1">{formatCurrency(savingsResult.totalContributed)}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-green-500/10 text-center border border-green-500/20">
                      <p className="text-xs text-muted-foreground">Interest Earned</p>
                      <p className="text-lg font-bold text-green-600 mt-1">{formatCurrency(savingsResult.interestEarned)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Equity Tab */}
        <TabsContent value="equity" className="space-y-4 mt-4">
          {/* Summary Cards for Equity */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SummaryStatsCard
              icon={Gem}
              value={formatCurrency(vestedValue)}
              label="Vested Value"
              formula="Vested × price"
              dataSource="Equity System"
              variant="primary"
            />
            <SummaryStatsCard
              icon={Target}
              value={`${VESTED_SHARES.toLocaleString()}`}
              label="Vested Shares"
              formula={`${vestedPercent}% of total`}
              dataSource="Equity System"
              variant="utilized"
            />
            <SummaryStatsCard
              icon={TrendingUp}
              value={formatCurrency(TOTAL_SHARES * SHARE_PRICE)}
              label="Total Value (if 100%)"
              formula="All shares × price"
              dataSource="Equity System"
              variant="remaining"
            />
            <SummaryStatsCard
              icon={DollarSign}
              value={`$${SHARE_PRICE}`}
              label="Share Price"
              formula="Current valuation"
              dataSource="Board"
              variant="info"
            />
          </div>

          <PolicyHighlightsCard
            title={language === 'ar' ? 'سياسة حقوق الملكية' : 'Equity Policy Highlights'}
            policies={t.policyEquity}
            category="equity"
            showClaimButton={false}
            policyLabel={language === 'ar' ? 'الخطة الكاملة' : 'View Full Plan'}
            isRTL={isRTL}
          />

          <div className="grid lg:grid-cols-2 gap-4">
            {/* Vesting Progress */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className={cn("text-base font-display flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <Gem className="w-5 h-5 text-accent" />
                  {t.vestedShares}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{vestedPercent}% vested</span>
                  <span className="font-medium">{VESTED_SHARES.toLocaleString()} / {TOTAL_SHARES.toLocaleString()}</span>
                </div>
                <Progress value={vestedPercent} className="h-3" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-xs text-muted-foreground">Vested Value</p>
                    <p className="text-lg font-bold text-accent">{formatCurrency(vestedValue)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-xs text-muted-foreground">Total Value</p>
                    <p className="text-lg font-bold">{formatCurrency(TOTAL_SHARES * SHARE_PRICE)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vesting Schedule */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-display">{t.vestingSchedule}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {vestingSchedule.map((event, index) => (
                    <div 
                      key={index}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border",
                        event.status === 'vested' && "bg-green-500/5 border-green-500/20",
                        event.status === 'upcoming' && "bg-accent/5 border-accent/20",
                        event.status === 'future' && "bg-muted/30 border-border"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {event.status === 'vested' ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : event.status === 'upcoming' ? (
                          <Clock className="w-5 h-5 text-accent" />
                        ) : (
                          <Calendar className="w-5 h-5 text-muted-foreground" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{event.date}</p>
                          <p className="text-xs text-muted-foreground">{event.shares.toLocaleString()} shares</p>
                        </div>
                      </div>
                      <Badge 
                        variant={event.status === 'vested' ? 'default' : 'secondary'}
                        className={cn(
                          event.status === 'vested' && "bg-green-500",
                          event.status === 'upcoming' && "bg-accent"
                        )}
                      >
                        {event.status === 'vested' ? 'Vested' : event.status === 'upcoming' ? 'Next' : 'Future'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Cross-links */}
      <BenefitCrossLinks benefitCategory="Long-Term Financials" showClaimLink={false} showMarketplaceLink={false} />
    </div>
  );
}
