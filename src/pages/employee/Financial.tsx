import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SummaryStatsCard } from '@/components/ui/summary-stats-card';
import { PolicyHighlightsCard } from '@/components/employee/PolicyHighlightsCard';
import { Slider } from '@/components/ui/slider';
import { PiggyBank, TrendingUp, Wallet, Target, Calculator, Gift } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn, formatCurrencyAED, formatPercent } from '@/lib/utils';
import { BenefitCrossLinks } from '@/components/employee/BenefitCrossLinks';

const MONTHLY_SALARY = 35000;
const EMPLOYER_MATCH_PERCENT = 5;

// Translations for this page
const pageTranslations = {
  en: {
    title: 'Financial Planning',
    subtitle: 'Savings plan with employer matching contribution',
    totalSaved: 'Total Saved (YTD)',
    freeMoneyMatch: 'Free Money (Match)',
    monthlyTotal: 'Monthly Total',
    annualSavings: 'Annual Savings',
    formulaTotalYTD: 'Total contributions YTD',
    formulaEmployerMatch: 'Employer matching up to 5%',
    formulaMonthlyTotal: 'Your + employer monthly total',
    formulaAnnualProjection: 'Monthly × 12',
    dataSourceSavings: 'Savings Plan',
    dataSourceHR: 'HR Policy',
    dataSourceSystem: 'System',
    dataSourceProjection: 'Projection',
    howItWorks: 'How Your Savings Plan Works',
    step1Title: 'You Contribute',
    step1Desc: 'Choose 1-20% of your salary to save each month via payroll deduction',
    step2Title: 'Employer Matches',
    step2Desc: 'Company matches',
    step2Highlight: '100% up to 5%',
    step2Suffix: "— that's free money!",
    step3Title: 'Grow Tax-Free',
    step3Desc: 'Your savings grow tax-efficiently with professional fund management',
    calculatorTitle: 'Savings Calculator (Demo)',
    yourContribution: 'Your Contribution',
    maxMatch: '5% (max match)',
    yourMonthly: 'Your Monthly',
    employerMatch: 'Employer Match',
    totalMonthlyLabel: 'Total Monthly',
    tipIncrease: 'Tip: Increase to 5% to get the full employer match!',
    tipLeaving: "You're leaving",
    tipFreeMoneyMonthly: 'of free money on the table each month.',
    contributionHistory: 'Contribution History',
    month: 'Month',
    yourContributionCol: 'Your Contribution',
    employerMatchCol: 'Employer Match',
    total: 'Total',
    policyHighlights: 'Policy Highlights',
    policy1: '5% employer match on your contributions',
    policy2: 'Multiple fund options (conservative to aggressive)',
    policy3: 'Quarterly rebalancing available',
    policy4: 'Vesting: 2 years for full employer match',
    policy5: 'Withdrawal allowed after 1 year (conditions apply)',
    policy6: 'Tax-efficient structure',
    viewFullPolicy: 'View Full Savings Plan Policy',
    months: {
      Jul: 'Jul',
      Aug: 'Aug',
      Sep: 'Sep',
      Oct: 'Oct',
      Nov: 'Nov',
      Dec: 'Dec',
    },
  },
  ar: {
    title: 'التخطيط المالي',
    subtitle: 'خطة ادخار مع مساهمة مطابقة من صاحب العمل',
    totalSaved: 'إجمالي المدخرات (منذ بداية العام)',
    freeMoneyMatch: 'أموال مجانية (المطابقة)',
    monthlyTotal: 'الإجمالي الشهري',
    annualSavings: 'المدخرات السنوية',
    formulaTotalYTD: 'إجمالي المساهمات منذ بداية العام',
    formulaEmployerMatch: 'مطابقة صاحب العمل حتى 5%',
    formulaMonthlyTotal: 'مساهمتك + مساهمة صاحب العمل الشهرية',
    formulaAnnualProjection: 'الشهري × 12',
    dataSourceSavings: 'خطة الادخار',
    dataSourceHR: 'سياسة الموارد البشرية',
    dataSourceSystem: 'النظام',
    dataSourceProjection: 'التوقعات',
    howItWorks: 'كيف تعمل خطة الادخار الخاصة بك',
    step1Title: 'أنت تساهم',
    step1Desc: 'اختر من 1-20% من راتبك للادخار شهرياً عبر خصم الراتب',
    step2Title: 'صاحب العمل يطابق',
    step2Desc: 'الشركة تطابق',
    step2Highlight: '100% حتى 5%',
    step2Suffix: '— هذه أموال مجانية!',
    step3Title: 'نمو معفي من الضرائب',
    step3Desc: 'مدخراتك تنمو بكفاءة ضريبية مع إدارة صناديق احترافية',
    calculatorTitle: 'حاسبة الادخار (تجريبي)',
    yourContribution: 'مساهمتك',
    maxMatch: '5% (الحد الأقصى للمطابقة)',
    yourMonthly: 'مساهمتك الشهرية',
    employerMatch: 'مطابقة صاحب العمل',
    totalMonthlyLabel: 'الإجمالي الشهري',
    tipIncrease: 'نصيحة: قم بزيادة النسبة إلى 5% للحصول على كامل مطابقة صاحب العمل!',
    tipLeaving: 'أنت تترك',
    tipFreeMoneyMonthly: 'من الأموال المجانية كل شهر.',
    contributionHistory: 'سجل المساهمات',
    month: 'الشهر',
    yourContributionCol: 'مساهمتك',
    employerMatchCol: 'مطابقة صاحب العمل',
    total: 'الإجمالي',
    policyHighlights: 'أبرز بنود السياسة',
    policy1: 'مطابقة 5% من صاحب العمل على مساهماتك',
    policy2: 'خيارات صناديق متعددة (من المحافظ إلى العدواني)',
    policy3: 'إعادة التوازن ربع السنوية متاحة',
    policy4: 'الاستحقاق: سنتان للحصول على كامل مطابقة صاحب العمل',
    policy5: 'السحب مسموح بعد سنة واحدة (تطبق الشروط)',
    policy6: 'هيكل ذو كفاءة ضريبية',
    viewFullPolicy: 'عرض سياسة خطة الادخار الكاملة',
    months: {
      Jul: 'يوليو',
      Aug: 'أغسطس',
      Sep: 'سبتمبر',
      Oct: 'أكتوبر',
      Nov: 'نوفمبر',
      Dec: 'ديسمبر',
    },
  },
};

export default function FinancialPage() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = pageTranslations[language];
  
  const [savingsPercent, setSavingsPercent] = useState([10]);
  
  const formatCurrency = (value: number) => formatCurrencyAED(value, { abbreviate: false });

  const monthlySavings = Math.round(MONTHLY_SALARY * (savingsPercent[0] / 100));
  const employerMatch = Math.round(MONTHLY_SALARY * (Math.min(savingsPercent[0], EMPLOYER_MATCH_PERCENT) / 100));
  const totalMonthly = monthlySavings + employerMatch;
  const annualSavings = totalMonthly * 12;

  // Demo savings history
  const savingsHistory = [
    { month: 'Jul', employee: 3500, employer: 1750 },
    { month: 'Aug', employee: 3500, employer: 1750 },
    { month: 'Sep', employee: 3500, employer: 1750 },
    { month: 'Oct', employee: 3500, employer: 1750 },
    { month: 'Nov', employee: 3500, employer: 1750 },
    { month: 'Dec', employee: 3500, employer: 1750 },
  ];

  const totalContributed = savingsHistory.reduce((sum, m) => sum + m.employee + m.employer, 0);
  const totalEmployerMatch = savingsHistory.reduce((sum, m) => sum + m.employer, 0);

  return (
    <div className={cn("space-y-6 animate-fade-in", isRTL && "text-right")}>
      {/* Header */}
      <div>
        <h1 className={cn(
          "text-2xl font-display font-bold text-foreground flex items-center gap-3",
          isRTL && "flex-row-reverse"
        )}>
          <PiggyBank className="w-7 h-7 text-accent" />
          {t.title}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t.subtitle}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryStatsCard
          icon={Wallet}
          value={formatCurrency(totalContributed)}
          label={t.totalSaved}
          formula={t.formulaTotalYTD}
          dataSource={t.dataSourceSavings}
          variant="primary"
        />
        <SummaryStatsCard
          icon={Gift}
          value={formatCurrency(totalEmployerMatch)}
          label={t.freeMoneyMatch}
          formula={t.formulaEmployerMatch}
          dataSource={t.dataSourceHR}
          variant="remaining"
        />
        <SummaryStatsCard
          icon={Target}
          value={formatCurrency(totalMonthly)}
          label={t.monthlyTotal}
          formula={t.formulaMonthlyTotal}
          dataSource={t.dataSourceSystem}
          variant="utilized"
        />
        <SummaryStatsCard
          icon={PiggyBank}
          value={formatCurrency(annualSavings)}
          label={t.annualSavings}
          formula={t.formulaAnnualProjection}
          dataSource={t.dataSourceProjection}
          variant="info"
      />

      {/* Cross-links */}
      <BenefitCrossLinks benefitCategory="Financial Planning" showClaimLink={false} />
    </div>

      {/* How It Works */}
      <Card className="border-accent/30 bg-gradient-to-r from-accent/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className={cn(
            "text-base font-display flex items-center gap-2",
            isRTL && "flex-row-reverse"
          )}>
            <PiggyBank className="w-5 h-5 text-accent" />
            {t.howItWorks}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className={cn(
              "flex items-start gap-3 p-3 rounded-lg bg-card border",
              isRTL && "flex-row-reverse text-right"
            )}>
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm shrink-0">1</div>
              <div>
                <p className="font-medium text-sm">{t.step1Title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t.step1Desc}
                </p>
              </div>
            </div>
            <div className={cn(
              "flex items-start gap-3 p-3 rounded-lg bg-card border",
              isRTL && "flex-row-reverse text-right"
            )}>
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm shrink-0">2</div>
              <div>
                <p className="font-medium text-sm">{t.step2Title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t.step2Desc} <span className="font-semibold text-success">{t.step2Highlight}</span> {t.step2Suffix}
                </p>
              </div>
            </div>
            <div className={cn(
              "flex items-start gap-3 p-3 rounded-lg bg-card border",
              isRTL && "flex-row-reverse text-right"
            )}>
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm shrink-0">3</div>
              <div>
                <p className="font-medium text-sm">{t.step3Title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t.step3Desc}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Savings Calculator */}
      <Card className="bg-accent/5 border-accent/20">
        <CardHeader>
          <CardTitle className={cn(
            "text-base font-display flex items-center gap-2",
            isRTL && "flex-row-reverse"
          )}>
            <Calculator className="w-5 h-5 text-accent" />
            {t.calculatorTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className={cn("flex justify-between items-center", isRTL && "flex-row-reverse")}>
              <span className="text-sm font-medium">{t.yourContribution}</span>
              <span className="text-lg font-bold">{savingsPercent[0]}%</span>
            </div>
            <Slider
              value={savingsPercent}
              onValueChange={setSavingsPercent}
              min={0}
              max={20}
              step={1}
              className="py-4"
            />
            <div className={cn("flex justify-between text-xs text-muted-foreground", isRTL && "flex-row-reverse")}>
              <span>0%</span>
              <span className="text-success">{t.maxMatch}</span>
              <span>20%</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-border/50">
            <div className="text-center p-4 rounded-lg bg-card">
              <p className="text-sm text-muted-foreground mb-1">{t.yourMonthly}</p>
              <p className="text-xl font-bold">{formatCurrency(monthlySavings)}</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-card">
              <p className="text-sm text-muted-foreground mb-1">{t.employerMatch}</p>
              <p className="text-xl font-bold text-success">+{formatCurrency(employerMatch)}</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-card">
              <p className="text-sm text-muted-foreground mb-1">{t.totalMonthlyLabel}</p>
              <p className="text-xl font-bold text-accent">{formatCurrency(totalMonthly)}</p>
            </div>
          </div>

          {savingsPercent[0] < 5 && (
            <div className={cn(
              "p-3 rounded-lg bg-warning/10 border border-warning/20 text-sm",
              isRTL && "text-right"
            )}>
              <p className="text-warning font-medium">💡 {t.tipIncrease}</p>
              <p className="text-muted-foreground mt-1">
                {t.tipLeaving} {formatCurrency((5 - savingsPercent[0]) / 100 * MONTHLY_SALARY)} {t.tipFreeMoneyMonthly}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contribution History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display">{t.contributionHistory}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className={cn("py-3 px-2 font-medium", isRTL ? "text-right" : "text-left")}>{t.month}</th>
                  <th className={cn("py-3 px-2 font-medium", isRTL ? "text-left" : "text-right")}>{t.yourContributionCol}</th>
                  <th className={cn("py-3 px-2 font-medium", isRTL ? "text-left" : "text-right")}>{t.employerMatchCol}</th>
                  <th className={cn("py-3 px-2 font-medium", isRTL ? "text-left" : "text-right")}>{t.total}</th>
                </tr>
              </thead>
              <tbody>
                {savingsHistory.map((month) => (
                  <tr key={month.month} className="border-b border-border/50">
                    <td className={cn("py-3 px-2", isRTL ? "text-right" : "text-left")}>
                      {t.months[month.month as keyof typeof t.months]} 2025
                    </td>
                    <td className={cn("py-3 px-2", isRTL ? "text-left" : "text-right")}>{formatCurrency(month.employee)}</td>
                    <td className={cn("py-3 px-2 text-success", isRTL ? "text-left" : "text-right")}>+{formatCurrency(month.employer)}</td>
                    <td className={cn("py-3 px-2 font-medium", isRTL ? "text-left" : "text-right")}>{formatCurrency(month.employee + month.employer)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted/50">
                  <td className={cn("py-3 px-2 font-medium", isRTL ? "text-right" : "text-left")}>{t.total}</td>
                  <td className={cn("py-3 px-2 font-medium", isRTL ? "text-left" : "text-right")}>{formatCurrency(savingsHistory.reduce((s, m) => s + m.employee, 0))}</td>
                  <td className={cn("py-3 px-2 font-medium text-success", isRTL ? "text-left" : "text-right")}>+{formatCurrency(totalEmployerMatch)}</td>
                  <td className={cn("py-3 px-2 font-bold", isRTL ? "text-left" : "text-right")}>{formatCurrency(totalContributed)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Policy Highlights */}
      <PolicyHighlightsCard
        title={t.policyHighlights}
        policies={[t.policy1, t.policy2, t.policy3, t.policy4, t.policy5, t.policy6]}
        category="savings"
        actionLabel={language === 'ar' ? 'تعديل المساهمة' : 'Adjust Contribution'}
        policyLabel={t.viewFullPolicy}
        showClaimButton={false}
        isRTL={isRTL}
      />
    </div>
  );
}
