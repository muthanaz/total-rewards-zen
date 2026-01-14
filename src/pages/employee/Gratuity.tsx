import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SummaryStatsCard } from '@/components/ui/summary-stats-card';
import { BenefitGuide } from '@/components/employee/BenefitGuide';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Landmark, TrendingUp, Calendar, Calculator, Briefcase, Clock, Award, Shield } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { format, differenceInDays, addYears } from 'date-fns';
import { BENEFIT_CATEGORIES } from '@/lib/benefitCategories';

// Demo employee data
const EMPLOYMENT_START_DATE = new Date('2019-07-15');
const MONTHLY_SALARY = 35000;

// UAE Labor Law Gratuity Calculation:
// - Less than 1 year: No gratuity
// - 1-5 years: 21 days salary per year
// - 5+ years: 30 days salary per year (for years after 5th)
// Maximum: 2 years salary

const pageTranslations = {
  en: {
    title: 'End of Service Gratuity',
    subtitle: 'Your guaranteed statutory benefit under UAE Labor Law',
    currentAccrued: 'Current Accrued',
    yearsOfService: 'Years of Service',
    monthlyBasis: 'Monthly Basis',
    projectedAtYear: 'Projected (5 Years)',
    formulaCurrentAccrued: 'Based on UAE Labor Law calculation',
    formulaYearsOfService: 'Time since employment start',
    formulaMonthlyBasis: 'Your basic salary for calculations',
    formulaProjected: 'Estimated gratuity at 5+ years',
    dataSourceHR: 'HR Records',
    dataSourceSystem: 'System Calculation',
    dataSourceSalary: 'Payroll',
    dataSourceProjection: 'Projection',
    calculatorTitle: 'Gratuity Calculator',
    yearsLabel: 'Years of Service',
    currentYears: 'Current:',
    years: 'years',
    calculationBreakdown: 'Calculation Breakdown',
    first5Years: 'First 5 Years',
    daysPerYear: '21 days × salary per year',
    after5Years: 'After 5 Years',
    daysPerYearAfter: '30 days × salary per year',
    totalGratuity: 'Total Gratuity',
    guideTitle: 'End of Service Gratuity Guide',
    step1Title: 'Automatic Accrual',
    step1Desc: 'Your gratuity accrues automatically from your first day of employment',
    step2Title: 'Legal Entitlement',
    step2Desc: 'Protected by UAE Labor Law — guaranteed payment upon end of service',
    step3Title: 'Paid on Exit',
    step3Desc: 'Full amount paid within 14 days of your last working day',
    policy1: 'Minimum 1 year service required for eligibility',
    policy2: '21 days basic salary per year (first 5 years)',
    policy3: '30 days basic salary per year (after 5 years)',
    policy4: 'Maximum cap: 2 years total salary',
    policy5: 'Paid on resignation, termination, or retirement',
    policy6: 'Pro-rata calculation for partial years',
    viewPolicy: 'View Gratuity Policy',
    timelineTitle: 'Your Gratuity Journey',
    startDate: 'Employment Start',
    year1: 'Year 1 Complete',
    year5: 'Year 5 Milestone',
    today: 'Today',
    milestoneEligible: 'Eligible for gratuity',
    milestone5Year: 'Higher rate applies (30 days/year)',
    importantNotes: 'Important Information',
    note1: 'Gratuity is calculated on your basic salary only (excludes allowances)',
    note2: 'If you resign before 5 years, you receive partial gratuity based on tenure',
    note3: 'Termination for gross misconduct may affect your entitlement',
    months: 'months',
    days: 'days',
  },
  ar: {
    title: 'مكافأة نهاية الخدمة',
    subtitle: 'استحقاقك القانوني المضمون بموجب قانون العمل الإماراتي',
    currentAccrued: 'المستحق الحالي',
    yearsOfService: 'سنوات الخدمة',
    monthlyBasis: 'الراتب الأساسي',
    projectedAtYear: 'المتوقع (٥ سنوات)',
    formulaCurrentAccrued: 'بناءً على حساب قانون العمل الإماراتي',
    formulaYearsOfService: 'الفترة منذ بدء العمل',
    formulaMonthlyBasis: 'راتبك الأساسي للحسابات',
    formulaProjected: 'مكافأة تقديرية عند ٥+ سنوات',
    dataSourceHR: 'سجلات الموارد البشرية',
    dataSourceSystem: 'حساب النظام',
    dataSourceSalary: 'الرواتب',
    dataSourceProjection: 'التوقعات',
    calculatorTitle: 'حاسبة المكافأة',
    yearsLabel: 'سنوات الخدمة',
    currentYears: 'الحالي:',
    years: 'سنوات',
    calculationBreakdown: 'تفاصيل الحساب',
    first5Years: 'أول ٥ سنوات',
    daysPerYear: '٢١ يوم × الراتب لكل سنة',
    after5Years: 'بعد ٥ سنوات',
    daysPerYearAfter: '٣٠ يوم × الراتب لكل سنة',
    totalGratuity: 'إجمالي المكافأة',
    guideTitle: 'دليل مكافأة نهاية الخدمة',
    step1Title: 'استحقاق تلقائي',
    step1Desc: 'تتراكم مكافأتك تلقائياً من أول يوم عمل',
    step2Title: 'حق قانوني',
    step2Desc: 'محمي بموجب قانون العمل الإماراتي — دفع مضمون عند انتهاء الخدمة',
    step3Title: 'تُدفع عند المغادرة',
    step3Desc: 'المبلغ الكامل يُدفع خلال ١٤ يوم من آخر يوم عمل',
    policy1: 'يتطلب سنة خدمة كحد أدنى للأهلية',
    policy2: '٢١ يوم راتب أساسي لكل سنة (أول ٥ سنوات)',
    policy3: '٣٠ يوم راتب أساسي لكل سنة (بعد ٥ سنوات)',
    policy4: 'الحد الأقصى: راتب سنتين إجمالي',
    policy5: 'تُدفع عند الاستقالة أو الإنهاء أو التقاعد',
    policy6: 'حساب نسبي للسنوات الجزئية',
    viewPolicy: 'عرض سياسة المكافأة',
    timelineTitle: 'رحلة مكافأتك',
    startDate: 'بداية العمل',
    year1: 'السنة الأولى مكتملة',
    year5: 'علامة السنة الخامسة',
    today: 'اليوم',
    milestoneEligible: 'مؤهل للمكافأة',
    milestone5Year: 'المعدل الأعلى يُطبق (٣٠ يوم/سنة)',
    importantNotes: 'معلومات مهمة',
    note1: 'تُحسب المكافأة على الراتب الأساسي فقط (بدون البدلات)',
    note2: 'إذا استقلت قبل ٥ سنوات، تحصل على مكافأة جزئية',
    note3: 'الإنهاء بسبب سوء السلوك الجسيم قد يؤثر على استحقاقك',
    months: 'أشهر',
    days: 'أيام',
  },
};

const gratuityCategory = BENEFIT_CATEGORIES.gratuity;

// Calculate gratuity based on UAE Labor Law
function calculateGratuity(yearsOfService: number, monthlySalary: number): number {
  if (yearsOfService < 1) return 0;
  
  const dailySalary = monthlySalary / 30;
  let gratuity = 0;
  
  if (yearsOfService <= 5) {
    gratuity = 21 * dailySalary * yearsOfService;
  } else {
    // First 5 years at 21 days per year
    gratuity = 21 * dailySalary * 5;
    // Remaining years at 30 days per year
    gratuity += 30 * dailySalary * (yearsOfService - 5);
  }
  
  // Maximum cap: 2 years salary
  const maxGratuity = monthlySalary * 24;
  return Math.min(gratuity, maxGratuity);
}

export default function GratuityPage() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = pageTranslations[language];
  
  const today = new Date();
  const daysEmployed = differenceInDays(today, EMPLOYMENT_START_DATE);
  const yearsEmployed = daysEmployed / 365;
  const fullYearsEmployed = Math.floor(yearsEmployed);
  const monthsEmployed = Math.floor((yearsEmployed - fullYearsEmployed) * 12);
  
  const [simulatedYears, setSimulatedYears] = useState([Math.round(yearsEmployed * 10) / 10]);
  
  const formatCurrency = (value: number) => `AED ${Math.round(value).toLocaleString()}`;
  
  // Calculate current gratuity
  const currentGratuity = useMemo(() => calculateGratuity(yearsEmployed, MONTHLY_SALARY), [yearsEmployed]);
  const simulatedGratuity = useMemo(() => calculateGratuity(simulatedYears[0], MONTHLY_SALARY), [simulatedYears]);
  const projected5YearGratuity = useMemo(() => calculateGratuity(5, MONTHLY_SALARY), []);
  
  // Calculation breakdown for simulator
  const calculationBreakdown = useMemo(() => {
    const years = simulatedYears[0];
    const dailySalary = MONTHLY_SALARY / 30;
    
    if (years < 1) {
      return { first5: 0, after5: 0, total: 0 };
    }
    
    const yearsFor21Days = Math.min(years, 5);
    const yearsFor30Days = Math.max(0, years - 5);
    
    const first5 = 21 * dailySalary * yearsFor21Days;
    const after5 = 30 * dailySalary * yearsFor30Days;
    const total = Math.min(first5 + after5, MONTHLY_SALARY * 24);
    
    return { first5, after5, total };
  }, [simulatedYears]);

  const guideSteps = [
    { title: t.step1Title, description: t.step1Desc },
    { title: t.step2Title, description: t.step2Desc, highlight: 'UAE Labor Law' },
    { title: t.step3Title, description: t.step3Desc, highlight: '14 days' },
  ];

  const policyPoints = [t.policy1, t.policy2, t.policy3, t.policy4, t.policy5, t.policy6];
  
  // Timeline milestones
  const milestones = [
    { date: EMPLOYMENT_START_DATE, label: t.startDate, icon: Briefcase, completed: true },
    { date: addYears(EMPLOYMENT_START_DATE, 1), label: t.year1, icon: Award, completed: yearsEmployed >= 1, note: t.milestoneEligible },
    { date: addYears(EMPLOYMENT_START_DATE, 5), label: t.year5, icon: TrendingUp, completed: yearsEmployed >= 5, note: t.milestone5Year },
  ];

  return (
    <div className={cn("space-y-6 animate-fade-in", isRTL && "text-right")}>
      {/* Header */}
      <div>
        <h1 className={cn(
          "text-2xl font-display font-bold text-foreground flex items-center gap-3",
          isRTL && "flex-row-reverse"
        )}>
          <Landmark className={cn("w-7 h-7", gratuityCategory.textClass)} />
          {t.title}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t.subtitle}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryStatsCard
          icon={Landmark}
          value={formatCurrency(currentGratuity)}
          label={t.currentAccrued}
          formula={t.formulaCurrentAccrued}
          dataSource={t.dataSourceSystem}
          variant="primary"
        />
        <SummaryStatsCard
          icon={Calendar}
          value={`${fullYearsEmployed} ${t.years} ${monthsEmployed} ${t.months}`}
          label={t.yearsOfService}
          formula={t.formulaYearsOfService}
          dataSource={t.dataSourceHR}
          variant="utilized"
        />
        <SummaryStatsCard
          icon={Briefcase}
          value={formatCurrency(MONTHLY_SALARY)}
          label={t.monthlyBasis}
          formula={t.formulaMonthlyBasis}
          dataSource={t.dataSourceSalary}
          variant="remaining"
        />
        <SummaryStatsCard
          icon={TrendingUp}
          value={formatCurrency(projected5YearGratuity)}
          label={t.projectedAtYear}
          formula={t.formulaProjected}
          dataSource={t.dataSourceProjection}
          variant="info"
        />
      </div>

      {/* Comprehensive Benefit Guide */}
      <BenefitGuide
        icon={Landmark}
        title={t.guideTitle}
        steps={guideSteps}
        policyPoints={policyPoints}
        policyButtonText={t.viewPolicy}
      />

      {/* Gratuity Calculator */}
      <Card className={cn("border-2", gratuityCategory.borderClass, gratuityCategory.bgLightClass)}>
        <CardHeader>
          <CardTitle className={cn(
            "text-base font-display flex items-center gap-2",
            isRTL && "flex-row-reverse"
          )}>
            <Calculator className={cn("w-5 h-5", gratuityCategory.textClass)} />
            {t.calculatorTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className={cn("flex justify-between items-center", isRTL && "flex-row-reverse")}>
              <span className="text-sm font-medium">{t.yearsLabel}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{t.currentYears} {yearsEmployed.toFixed(1)}</span>
                <span className="text-lg font-bold">{simulatedYears[0].toFixed(1)} {t.years}</span>
              </div>
            </div>
            <Slider
              value={simulatedYears}
              onValueChange={setSimulatedYears}
              min={0}
              max={30}
              step={0.5}
              className="py-4"
            />
            <div className={cn("flex justify-between text-xs text-muted-foreground", isRTL && "flex-row-reverse")}>
              <span>0</span>
              <span className="text-success">5 {t.years}</span>
              <span>30 {t.years}</span>
            </div>
          </div>

          {/* Calculation Breakdown */}
          <div className="pt-4 border-t border-border/50 space-y-3">
            <h4 className="font-medium text-sm">{t.calculationBreakdown}</h4>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-card border">
                <div className={cn("flex items-center gap-2 mb-2", isRTL && "flex-row-reverse")}>
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{t.first5Years}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{t.daysPerYear}</p>
                <p className="text-lg font-bold">{formatCurrency(calculationBreakdown.first5)}</p>
              </div>
              
              <div className="p-4 rounded-lg bg-card border">
                <div className={cn("flex items-center gap-2 mb-2", isRTL && "flex-row-reverse")}>
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span className="text-sm font-medium">{t.after5Years}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{t.daysPerYearAfter}</p>
                <p className="text-lg font-bold text-success">{formatCurrency(calculationBreakdown.after5)}</p>
              </div>
              
              <div className={cn("p-4 rounded-lg border-2", gratuityCategory.bgLightClass, gratuityCategory.borderClass)}>
                <div className={cn("flex items-center gap-2 mb-2", isRTL && "flex-row-reverse")}>
                  <Landmark className={cn("w-4 h-4", gratuityCategory.textClass)} />
                  <span className="text-sm font-medium">{t.totalGratuity}</span>
                </div>
                <p className={cn("text-2xl font-bold", gratuityCategory.textClass)}>{formatCurrency(calculationBreakdown.total)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display">{t.timelineTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline line */}
            <div className={cn(
              "absolute top-6 h-0.5 bg-border",
              isRTL ? "right-6 left-6" : "left-6 right-6"
            )} />
            
            {/* Progress line */}
            <div 
              className={cn(
                "absolute top-6 h-0.5",
                gratuityCategory.bgClass,
                isRTL ? "right-6" : "left-6"
              )}
              style={{ width: `${Math.min((yearsEmployed / 5) * 100, 100)}%` }}
            />
            
            {/* Milestones */}
            <div className="flex justify-between relative">
              {milestones.map((milestone, index) => {
                const Icon = milestone.icon;
                return (
                  <div key={index} className="flex flex-col items-center">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center z-10",
                      milestone.completed 
                        ? `${gratuityCategory.bgClass} text-white`
                        : "bg-muted border-2 border-border text-muted-foreground"
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="mt-3 text-center">
                      <p className="font-medium text-sm">{milestone.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(milestone.date, 'MMM yyyy')}
                      </p>
                      {milestone.note && milestone.completed && (
                        <p className={cn("text-xs mt-1", gratuityCategory.textClass)}>{milestone.note}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Card className="border-warning/30 bg-warning/5">
        <CardHeader className="pb-3">
          <CardTitle className={cn(
            "text-base font-display flex items-center gap-2",
            isRTL && "flex-row-reverse"
          )}>
            <Shield className="w-5 h-5 text-warning" />
            {t.importantNotes}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {[t.note1, t.note2, t.note3].map((note, index) => (
              <li key={index} className={cn(
                "text-sm text-muted-foreground flex items-start gap-2",
                isRTL && "flex-row-reverse text-right"
              )}>
                <span className="w-1.5 h-1.5 rounded-full bg-warning mt-2 shrink-0" />
                {note}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
