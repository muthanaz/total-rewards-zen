import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { 
  BarChart3, Users, Building2, TrendingUp, AlertTriangle, 
  CheckCircle2, FileText, Shield
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/ui/page-header';

const benchmarkRules = [
  {
    id: 'min_orgs',
    rule: 'Minimum 5 organizations required',
    ruleAr: 'الحد الأدنى 5 منظمات',
    current: 8,
    threshold: 5,
    status: 'pass',
  },
  {
    id: 'min_employees',
    rule: 'Minimum 100 employees per cohort',
    ruleAr: 'الحد الأدنى 100 موظف لكل مجموعة',
    current: 892,
    threshold: 100,
    status: 'pass',
  },
  {
    id: 'anonymization',
    rule: 'No individual identification possible',
    ruleAr: 'لا يمكن تحديد هوية الأفراد',
    current: 'Verified',
    threshold: '-',
    status: 'pass',
  },
  {
    id: 'data_freshness',
    rule: 'Data updated within 30 days',
    ruleAr: 'تحديث البيانات خلال 30 يوماً',
    current: '7 days ago',
    threshold: '30 days',
    status: 'pass',
  },
  {
    id: 'sample_size',
    rule: 'Statistical significance (p < 0.05)',
    ruleAr: 'الأهمية الإحصائية',
    current: 'p = 0.02',
    threshold: 'p < 0.05',
    status: 'pass',
  },
];

const confidenceBands = [
  { level: 'High', levelAr: 'عالية', criteria: '≥100 data points, <30 days old', criteriaAr: '≥100 نقطة بيانات، <30 يوماً', color: 'emerald' },
  { level: 'Medium', levelAr: 'متوسطة', criteria: '50-99 data points, <60 days old', criteriaAr: '50-99 نقطة، <60 يوماً', color: 'amber' },
  { level: 'Low', levelAr: 'منخفضة', criteria: '<50 data points or >60 days old', criteriaAr: '<50 نقطة أو >60 يوماً', color: 'red' },
];

const benchmarkCategories = [
  { name: 'Utilization Rate', nameAr: 'معدل الاستخدام', orgs: 8, employees: 892, confidence: 'High' },
  { name: 'Cost per Employee', nameAr: 'التكلفة لكل موظف', orgs: 7, employees: 756, confidence: 'High' },
  { name: 'Satisfaction Score', nameAr: 'درجة الرضا', orgs: 5, employees: 234, confidence: 'Medium' },
  { name: 'Claims Processing Time', nameAr: 'وقت معالجة المطالبات', orgs: 6, employees: 445, confidence: 'High' },
  { name: 'Benefits Adoption Rate', nameAr: 'معدل تبني المزايا', orgs: 4, employees: 312, confidence: 'Medium' },
];

export default function AdminBenchmarkMethodologyPage() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const isArabic = language === 'ar';

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={isArabic ? 'منهجية المقارنة المعيارية' : 'Benchmark Methodology'}
        subtitle={isArabic ? 'قواعد حجم العينة وإخفاء الهوية والثقة' : 'Sample size rules, anonymization, and confidence bands'}
        icon={BarChart3}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <Building2 className="w-8 h-8 text-blue-500" />
              <div className={cn(isRTL && "text-right")}>
                <p className="text-2xl font-bold">8</p>
                <p className="text-sm text-muted-foreground">{isArabic ? 'المنظمات المشاركة' : 'Organizations'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <Users className="w-8 h-8 text-emerald-500" />
              <div className={cn(isRTL && "text-right")}>
                <p className="text-2xl font-bold">892</p>
                <p className="text-sm text-muted-foreground">{isArabic ? 'الموظفون' : 'Employees'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <TrendingUp className="w-8 h-8 text-violet-500" />
              <div className={cn(isRTL && "text-right")}>
                <p className="text-2xl font-bold">5</p>
                <p className="text-sm text-muted-foreground">{isArabic ? 'فئات المقارنة' : 'Benchmark Categories'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <Shield className="w-8 h-8 text-amber-500" />
              <div className={cn(isRTL && "text-right")}>
                <p className="text-2xl font-bold">100%</p>
                <p className="text-sm text-muted-foreground">{isArabic ? 'مطابقة القواعد' : 'Rules Compliant'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Validation Rules */}
      <Card>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            {isArabic ? 'قواعد التحقق' : 'Validation Rules'}
          </CardTitle>
          <CardDescription>
            {isArabic 
              ? 'يجب استيفاء هذه القواعد قبل عرض المقارنات'
              : 'These rules must be met before benchmarks are displayed'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {benchmarkRules.map((rule) => (
              <div 
                key={rule.id}
                className={cn(
                  "flex items-center gap-4 p-3 rounded-lg border",
                  isRTL && "flex-row-reverse"
                )}
              >
                {rule.status === 'pass' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                )}
                <div className={cn("flex-1", isRTL && "text-right")}>
                  <p className="font-medium text-sm">
                    {isArabic ? rule.ruleAr : rule.rule}
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {isArabic ? 'الحالي:' : 'Current:'} <span className="font-medium text-foreground">{rule.current}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {isArabic ? 'الحد الأدنى:' : 'Threshold:'} <span className="font-medium">{rule.threshold}</span>
                </div>
                <Badge className={rule.status === 'pass' ? 'bg-emerald-500/10 text-emerald-600 border-0' : 'bg-amber-500/10 text-amber-600 border-0'}>
                  {rule.status === 'pass' ? (isArabic ? 'ناجح' : 'Pass') : (isArabic ? 'تحذير' : 'Warning')}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Confidence Bands */}
      <Card>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <BarChart3 className="w-5 h-5" />
            {isArabic ? 'نطاقات الثقة' : 'Confidence Bands'}
          </CardTitle>
          <CardDescription>
            {isArabic 
              ? 'كيف نحدد مستوى الثقة لكل مقياس'
              : 'How we determine confidence level for each metric'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {confidenceBands.map((band) => (
              <div 
                key={band.level}
                className={cn(
                  "p-4 rounded-xl border",
                  band.color === 'emerald' ? 'border-emerald-500/30 bg-emerald-500/5' :
                  band.color === 'amber' ? 'border-amber-500/30 bg-amber-500/5' :
                  'border-red-500/30 bg-red-500/5'
                )}
              >
                <div className={cn("flex items-center gap-2 mb-2", isRTL && "flex-row-reverse")}>
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    band.color === 'emerald' ? 'bg-emerald-500' :
                    band.color === 'amber' ? 'bg-amber-500' :
                    'bg-red-500'
                  )} />
                  <span className="font-semibold">
                    {isArabic ? band.levelAr : band.level}
                  </span>
                </div>
                <p className={cn("text-sm text-muted-foreground", isRTL && "text-right")}>
                  {isArabic ? band.criteriaAr : band.criteria}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Benchmark Categories Status */}
      <Card>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <FileText className="w-5 h-5" />
            {isArabic ? 'حالة فئات المقارنة' : 'Benchmark Categories Status'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className={cn("text-left py-3 text-sm font-medium text-muted-foreground", isRTL && "text-right")}>
                    {isArabic ? 'الفئة' : 'Category'}
                  </th>
                  <th className="text-center py-3 text-sm font-medium text-muted-foreground">
                    {isArabic ? 'المنظمات' : 'Orgs'}
                  </th>
                  <th className="text-center py-3 text-sm font-medium text-muted-foreground">
                    {isArabic ? 'الموظفون' : 'Employees'}
                  </th>
                  <th className="text-center py-3 text-sm font-medium text-muted-foreground">
                    {isArabic ? 'الثقة' : 'Confidence'}
                  </th>
                  <th className="text-center py-3 text-sm font-medium text-muted-foreground">
                    {isArabic ? 'قابل للعرض' : 'Displayable'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {benchmarkCategories.map((cat) => (
                  <tr key={cat.name} className="border-b last:border-0">
                    <td className={cn("py-3 font-medium", isRTL && "text-right")}>
                      {isArabic ? cat.nameAr : cat.name}
                    </td>
                    <td className="py-3 text-center">{cat.orgs}</td>
                    <td className="py-3 text-center">{cat.employees}</td>
                    <td className="py-3 text-center">
                      <Badge className={
                        cat.confidence === 'High' ? 'bg-emerald-500/10 text-emerald-600 border-0' :
                        cat.confidence === 'Medium' ? 'bg-amber-500/10 text-amber-600 border-0' :
                        'bg-red-500/10 text-red-600 border-0'
                      }>
                        {cat.confidence}
                      </Badge>
                    </td>
                    <td className="py-3 text-center">
                      {cat.orgs >= 5 && cat.employees >= 100 ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-500 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Important Note */}
      <Card className="border-blue-500/30 bg-blue-500/5">
        <CardContent className="p-4">
          <div className={cn("flex items-start gap-3", isRTL && "flex-row-reverse")}>
            <InfoTooltip 
              formula={isArabic ? 'المقارنات المعيارية مجهولة الهوية تماماً' : 'Benchmarks are fully anonymized'}
              dataSource="System"
            />
            <div className={cn(isRTL && "text-right")}>
              <p className="font-medium text-blue-600 mb-1">
                {isArabic ? 'ملاحظة مهمة' : 'Important Note'}
              </p>
              <p className="text-sm text-muted-foreground">
                {isArabic 
                  ? 'لن يتم عرض المقارنات المعيارية إذا لم يتم استيفاء الحد الأدنى لحجم العينة. هذا يضمن خصوصية البيانات والأهمية الإحصائية.'
                  : 'Benchmarks will not be displayed if minimum sample size is not met. This ensures data privacy and statistical significance.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
