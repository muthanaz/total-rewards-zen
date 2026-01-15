import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StatusStrip } from '@/components/ui/status-strip';
import { 
  Database, AlertTriangle, CheckCircle2, XCircle, 
  Users, DollarSign, BarChart3, Shield, 
  RefreshCw, Download, ChevronRight, FileWarning, 
  Link2Off, AlertCircle
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/ui/page-header';
import { Link } from 'react-router-dom';

// Additional integrity checks
const integrityChecks = [
  {
    id: 'orphaned_profiles',
    issue: 'Orphaned profiles (no organization)',
    issueAr: 'ملفات معزولة (بدون منظمة)',
    count: 45,
    severity: 'error',
    action: 'Assign organizations',
    actionAr: 'تعيين منظمات',
  },
  {
    id: 'missing_budgets',
    issue: 'Organizations without budgets',
    issueAr: 'منظمات بدون ميزانيات',
    count: 3,
    severity: 'warning',
    action: 'Configure budgets',
    actionAr: 'تكوين الميزانيات',
  },
  {
    id: 'missing_metrics',
    issue: 'Undefined metric definitions',
    issueAr: 'تعريفات مقاييس مفقودة',
    count: 6,
    severity: 'warning',
    action: 'Add definitions',
    actionAr: 'إضافة التعريفات',
  },
  {
    id: 'stale_data',
    issue: 'Stale sync data (>30 days)',
    issueAr: 'بيانات مزامنة قديمة (>30 يوم)',
    count: 2,
    severity: 'warning',
    action: 'Trigger sync',
    actionAr: 'تشغيل المزامنة',
  },
];

// Demo data quality checks
const dataQualityChecks = [
  {
    id: 'profiles_org',
    category: 'Employee Data',
    categoryAr: 'بيانات الموظفين',
    check: 'Profiles with organization_id',
    checkAr: 'الملفات مع معرف المنظمة',
    status: 'warning',
    current: 847,
    total: 892,
    percent: 95,
    action: 'Fix orphaned profiles',
    actionAr: 'إصلاح الملفات المعزولة',
    route: '/admin/organizations',
  },
  {
    id: 'benefits_budget',
    category: 'Benefits Configuration',
    categoryAr: 'تكوين المزايا',
    check: 'Benefits with org budgets set',
    checkAr: 'المزايا مع ميزانيات محددة',
    status: 'error',
    current: 3,
    total: 8,
    percent: 38,
    action: 'Configure budgets',
    actionAr: 'تكوين الميزانيات',
    route: '/admin/settings',
  },
  {
    id: 'entitlements',
    category: 'Entitlements',
    categoryAr: 'الاستحقاقات',
    check: 'Employees with entitlements',
    checkAr: 'الموظفون مع استحقاقات',
    status: 'pass',
    current: 892,
    total: 892,
    percent: 100,
    action: 'View all',
    actionAr: 'عرض الكل',
    route: '/admin/organizations',
  },
  {
    id: 'satisfaction',
    category: 'Satisfaction Data',
    categoryAr: 'بيانات الرضا',
    check: 'Response rate (min 30%)',
    checkAr: 'معدل الاستجابة (الحد الأدنى 30%)',
    status: 'warning',
    current: 267,
    total: 892,
    percent: 30,
    action: 'Launch survey',
    actionAr: 'إطلاق استبيان',
    route: '/admin/settings',
  },
  {
    id: 'rls_check',
    category: 'Security',
    categoryAr: 'الأمان',
    check: 'RLS policies verified',
    checkAr: 'سياسات RLS متحققة',
    status: 'pass',
    current: 26,
    total: 26,
    percent: 100,
    action: 'View policies',
    actionAr: 'عرض السياسات',
    route: '/admin/tenant-test',
  },
  {
    id: 'metrics_confidence',
    category: 'Metrics',
    categoryAr: 'المقاييس',
    check: 'High-confidence metrics',
    checkAr: 'مقاييس عالية الثقة',
    status: 'warning',
    current: 12,
    total: 18,
    percent: 67,
    action: 'View dictionary',
    actionAr: 'عرض القاموس',
    route: '/employer/metrics',
  },
];

const orgConfigChecks = [
  { org: 'Acme Corp', orgId: '1', configured: 8, total: 10, status: 'warning' },
  { org: 'TechStart LLC', orgId: '2', configured: 10, total: 10, status: 'pass' },
  { org: 'Global Finance', orgId: '3', configured: 4, total: 10, status: 'error' },
  { org: 'HealthFirst', orgId: '4', configured: 9, total: 10, status: 'warning' },
];

export default function AdminDataQualityPage() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const isArabic = language === 'ar';

  const passCount = dataQualityChecks.filter(c => c.status === 'pass').length;
  const warnCount = dataQualityChecks.filter(c => c.status === 'warning').length;
  const errorCount = dataQualityChecks.filter(c => c.status === 'error').length;
  const overallScore = Math.round((passCount / dataQualityChecks.length) * 100);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass': return <Badge className="bg-emerald-500/10 text-emerald-600 border-0">{isArabic ? 'ناجح' : 'Pass'}</Badge>;
      case 'warning': return <Badge className="bg-amber-500/10 text-amber-600 border-0">{isArabic ? 'تحذير' : 'Warning'}</Badge>;
      case 'error': return <Badge className="bg-red-500/10 text-red-600 border-0">{isArabic ? 'خطأ' : 'Error'}</Badge>;
      default: return null;
    }
  };

  const totalIntegrityIssues = integrityChecks.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={isArabic ? 'جودة البيانات والسلامة' : 'Data Quality & Integrity'}
        subtitle={isArabic ? 'مراقبة صحة البيانات وإصلاح المشكلات' : 'Monitor data health and fix issues across the platform'}
        icon={Database}
      />

      <StatusStrip
        confidence={overallScore >= 80 ? 'high' : overallScore >= 50 ? 'medium' : 'low'}
        lastUpdated={new Date(Date.now() - 5 * 60 * 1000)}
        dataSource={isArabic ? 'جميع المنظمات' : 'All organizations'}
      />

      {/* Overall Health */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-2 bg-gradient-to-br from-primary/5 to-background">
          <CardContent className="p-6">
            <div className={cn("flex items-center gap-6", isRTL && "flex-row-reverse")}>
              <div className="relative">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                  <circle 
                    cx="48" cy="48" r="40" fill="none" 
                    stroke={overallScore >= 80 ? "hsl(var(--accent))" : overallScore >= 50 ? "hsl(38 92% 50%)" : "hsl(0 84% 60%)"} 
                    strokeWidth="8"
                    strokeDasharray={`${overallScore * 2.51} 251`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{overallScore}%</span>
                </div>
              </div>
              <div className={cn("flex-1", isRTL && "text-right")}>
                <h3 className="text-lg font-semibold mb-2">
                  {isArabic ? 'صحة البيانات الإجمالية' : 'Overall Data Health'}
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>{passCount} {isArabic ? 'ناجح' : 'passing'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>{warnCount} {isArabic ? 'تحذيرات' : 'warnings'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span>{errorCount} {isArabic ? 'أخطاء' : 'errors'}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <Users className="w-8 h-8 text-blue-500" />
              <div className={cn(isRTL && "text-right")}>
                <p className="text-2xl font-bold">892</p>
                <p className="text-sm text-muted-foreground">{isArabic ? 'إجمالي الملفات' : 'Total Profiles'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <Shield className="w-8 h-8 text-emerald-500" />
              <div className={cn(isRTL && "text-right")}>
                <p className="text-2xl font-bold">8</p>
                <p className="text-sm text-muted-foreground">{isArabic ? 'المنظمات' : 'Organizations'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {errorCount > 0 && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
            <span>
              {isArabic 
                ? `${errorCount} مشكلة حرجة تتطلب اهتماماً فورياً`
                : `${errorCount} critical issue(s) require immediate attention`}
            </span>
            <Button size="sm" variant="outline" className="ml-4">
              {isArabic ? 'إصلاح الآن' : 'Fix Now'}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Data Quality Checks */}
      <Card>
        <CardHeader>
          <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
            <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <BarChart3 className="w-5 h-5" />
              {isArabic ? 'فحوصات جودة البيانات' : 'Data Quality Checks'}
            </CardTitle>
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              {isArabic ? 'تحديث' : 'Refresh'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dataQualityChecks.map((check) => (
              <div 
                key={check.id}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border transition-colors",
                  check.status === 'error' ? 'border-red-500/30 bg-red-500/5' :
                  check.status === 'warning' ? 'border-amber-500/30 bg-amber-500/5' :
                  'border-border bg-card',
                  isRTL && "flex-row-reverse"
                )}
              >
                {getStatusIcon(check.status)}
                <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {isArabic ? check.checkAr : check.check}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {isArabic ? check.categoryAr : check.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress 
                      value={check.percent} 
                      className={cn(
                        "flex-1 h-2",
                        check.status === 'error' ? '[&>div]:bg-red-500' :
                        check.status === 'warning' ? '[&>div]:bg-amber-500' :
                        '[&>div]:bg-emerald-500'
                      )}
                    />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {check.current}/{check.total} ({check.percent}%)
                    </span>
                  </div>
                </div>
                {getStatusBadge(check.status)}
                <Link to={check.route}>
                  <Button size="sm" variant="ghost">
                    {isArabic ? check.actionAr : check.action}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Integrity Issues */}
      <Card className="border-amber-500/30">
        <CardHeader>
          <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
            <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <FileWarning className="w-5 h-5 text-amber-500" />
              {isArabic ? 'مشاكل سلامة البيانات' : 'Data Integrity Issues'}
            </CardTitle>
            <Badge className="bg-amber-500/10 text-amber-600 border-0">
              {totalIntegrityIssues} {isArabic ? 'مشكلة' : 'issues'}
            </Badge>
          </div>
          <CardDescription>
            {isArabic ? 'السجلات المعزولة والتكوينات المفقودة' : 'Orphaned records and missing configurations'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {integrityChecks.map((check) => (
              <div 
                key={check.id}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border",
                  check.severity === 'error' ? 'border-red-500/30 bg-red-500/5' : 'border-amber-500/30 bg-amber-500/5',
                  isRTL && "flex-row-reverse"
                )}
              >
                {check.severity === 'error' ? (
                  <Link2Off className="w-5 h-5 text-red-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                )}
                <div className={cn("flex-1", isRTL && "text-right")}>
                  <p className="font-medium text-sm">
                    {isArabic ? check.issueAr : check.issue}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {check.count} {isArabic ? 'سجل متأثر' : 'records affected'}
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  {isArabic ? check.actionAr : check.action}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Organization Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Shield className="w-5 h-5" />
            {isArabic ? 'حالة تكوين المنظمات' : 'Organization Configuration Status'}
          </CardTitle>
          <CardDescription>
            {isArabic ? 'اكتمال التكوين لكل منظمة' : 'Configuration completeness per organization'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {orgConfigChecks.map((org) => (
              <div 
                key={org.orgId}
                className={cn(
                  "flex items-center gap-4 p-3 rounded-lg border",
                  isRTL && "flex-row-reverse"
                )}
              >
                {getStatusIcon(org.status)}
                <span className="font-medium flex-1">{org.org}</span>
                <Progress 
                  value={(org.configured / org.total) * 100} 
                  className="w-32 h-2"
                />
                <span className="text-sm text-muted-foreground">
                  {org.configured}/{org.total}
                </span>
                {getStatusBadge(org.status)}
                <Link to={`/admin/organizations/${org.orgId}/settings`}>
                  <Button size="sm" variant="ghost">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export */}
      <div className={cn("flex justify-end", isRTL && "justify-start")}>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          {isArabic ? 'تصدير التقرير' : 'Export Report'}
        </Button>
      </div>
    </div>
  );
}
