import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  CheckCircle,
  Users,
  DollarSign,
  Smile,
  Tag,
  ArrowRight,
  Database
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DataQualityPanelProps {
  metrics?: {
    employeesWithEntitlements: number;
    totalEmployees: number;
    hasBudgetConfigured: boolean;
    satisfactionSampleSize: number;
    requiredSampleSize: number;
    missingClassifications: number;
  };
  className?: string;
}

export function DataQualityPanel({ metrics, className }: DataQualityPanelProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const isArabic = language === 'ar';

  // Default values if metrics not provided
  const data = metrics || {
    employeesWithEntitlements: 0,
    totalEmployees: 0,
    hasBudgetConfigured: false,
    satisfactionSampleSize: 0,
    requiredSampleSize: 30,
    missingClassifications: 0,
  };

  const entitlementPercent = data.totalEmployees > 0 
    ? Math.round((data.employeesWithEntitlements / data.totalEmployees) * 100) 
    : 0;
  const satisfactionPercent = Math.round((data.satisfactionSampleSize / data.requiredSampleSize) * 100);

  const checks = [
    {
      id: 'entitlements',
      label: isArabic ? 'الموظفون بالاستحقاقات' : 'Employees with Entitlements',
      value: entitlementPercent,
      threshold: 80,
      icon: Users,
      status: entitlementPercent >= 80 ? 'pass' : entitlementPercent >= 50 ? 'warn' : 'fail',
      detail: `${data.employeesWithEntitlements}/${data.totalEmployees}`,
    },
    {
      id: 'budget',
      label: isArabic ? 'تكوين الميزانية' : 'Budget Configuration',
      value: data.hasBudgetConfigured ? 100 : 0,
      threshold: 100,
      icon: DollarSign,
      status: data.hasBudgetConfigured ? 'pass' : 'fail',
      detail: data.hasBudgetConfigured ? (isArabic ? 'مكون' : 'Configured') : (isArabic ? 'غير مكون' : 'Not Set'),
    },
    {
      id: 'satisfaction',
      label: isArabic ? 'عينة الرضا' : 'Satisfaction Sample',
      value: Math.min(satisfactionPercent, 100),
      threshold: 100,
      icon: Smile,
      status: data.satisfactionSampleSize >= data.requiredSampleSize ? 'pass' : 
              data.satisfactionSampleSize >= data.requiredSampleSize / 2 ? 'warn' : 'fail',
      detail: `${data.satisfactionSampleSize}/${data.requiredSampleSize}`,
    },
    {
      id: 'classifications',
      label: isArabic ? 'التصنيفات المفقودة' : 'Missing Classifications',
      value: data.missingClassifications === 0 ? 100 : Math.max(0, 100 - data.missingClassifications * 10),
      threshold: 100,
      icon: Tag,
      status: data.missingClassifications === 0 ? 'pass' : 
              data.missingClassifications <= 3 ? 'warn' : 'fail',
      detail: data.missingClassifications === 0 ? (isArabic ? 'لا شيء' : 'None') : `${data.missingClassifications}`,
    },
  ];

  const failedChecks = checks.filter(c => c.status === 'fail');
  const warnChecks = checks.filter(c => c.status === 'warn');
  const allPassed = failedChecks.length === 0 && warnChecks.length === 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'warn':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'fail':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-emerald-500';
      case 'warn':
        return 'bg-amber-500';
      case 'fail':
        return 'bg-red-500';
      default:
        return 'bg-primary';
    }
  };

  if (allPassed) {
    return null; // Don't show panel if all checks pass
  }

  return (
    <Card className={cn(
      "border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-transparent",
      className
    )}>
      <CardHeader className="pb-3">
        <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
          <CardTitle className={cn("text-base font-medium flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Database className="w-5 h-5 text-amber-500" />
            {isArabic ? 'جودة البيانات' : 'Data Quality'}
          </CardTitle>
          <Badge variant="outline" className={cn(
            failedChecks.length > 0 
              ? "bg-red-500/10 text-red-600 border-red-500/20"
              : "bg-amber-500/10 text-amber-600 border-amber-500/20"
          )}>
            {failedChecks.length > 0 
              ? `${failedChecks.length} ${isArabic ? 'مشاكل' : 'issues'}`
              : `${warnChecks.length} ${isArabic ? 'تحذيرات' : 'warnings'}`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {failedChecks.length > 0 && (
          <Alert variant="destructive" className="bg-red-500/5 border-red-500/20">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {isArabic 
                ? 'بعض المعايير والتوقعات قد تكون غير دقيقة بسبب بيانات غير مكتملة.'
                : 'Some benchmarks and projections may be inaccurate due to incomplete data.'}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {checks.map((check) => (
            <div
              key={check.id}
              className={cn(
                "p-3 rounded-lg border",
                check.status === 'pass' ? 'bg-emerald-500/5 border-emerald-500/20' :
                check.status === 'warn' ? 'bg-amber-500/5 border-amber-500/20' :
                'bg-red-500/5 border-red-500/20'
              )}
            >
              <div className={cn("flex items-center justify-between mb-2", isRTL && "flex-row-reverse")}>
                <check.icon className={cn(
                  "w-4 h-4",
                  check.status === 'pass' ? 'text-emerald-500' :
                  check.status === 'warn' ? 'text-amber-500' :
                  'text-red-500'
                )} />
                {getStatusIcon(check.status)}
              </div>
              <p className={cn("text-xs text-muted-foreground mb-1", isRTL && "text-right")}>{check.label}</p>
              <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <Progress 
                  value={check.value} 
                  className={cn("h-1.5 flex-1", `[&>div]:${getProgressColor(check.status)}`)} 
                />
                <span className="text-xs font-medium">{check.detail}</span>
              </div>
            </div>
          ))}
        </div>

        <div className={cn("flex justify-end", isRTL && "justify-start")}>
          <Link to="/admin/data-quality">
            <Button variant="outline" size="sm" className="text-xs">
              {isArabic ? 'عرض التفاصيل' : 'View Details'}
              <ArrowRight className={cn("w-3 h-3 ml-1", isRTL && "mr-1 ml-0 rotate-180")} />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}